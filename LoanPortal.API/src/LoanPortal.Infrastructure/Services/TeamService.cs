using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Infrastructure.Services
{
    public class TeamService : ITeamService
    {
        private readonly ITeamRepository _teamRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly ILoginUserDetails _loginUserDetails;

        public TeamService(
            ITeamRepository teamRepository,
            IUserRepository userRepository,
            ICompanyRepository companyRepository,
            ILoginUserDetails loginUserDetails)
        {
            _teamRepository = teamRepository;
            _userRepository = userRepository;
            _companyRepository = companyRepository;
            _loginUserDetails = loginUserDetails;
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        /// <summary>
        /// Returns the CompanyId the caller is authorised to operate on.
        /// CompanyAdmin → always their own company.
        /// SuperAdmin → not permitted to manage teams (enforce at policy level in controller).
        /// </summary>
        private Guid GetCallerCompanyId()
        {
            if (_loginUserDetails.CompanyId == null)
                throw new UnauthorizedAccessException("You are not associated with any company.");
            return _loginUserDetails.CompanyId.Value;
        }

        private void EnsureTeamBelongsToCaller(TeamEntity team)
        {
            var companyId = GetCallerCompanyId();
            if (team.CompanyId != companyId)
                throw new UnauthorizedAccessException("You do not have access to this team.");
        }

        private static TeamDTO MapToDTO(TeamEntity team, string? companyName = null, int memberCount = 0)
        {
            return new TeamDTO
            {
                Id = team.Id,
                Name = team.Name,
                Description = team.Description,
                CompanyId = team.CompanyId,
                CompanyName = companyName,
                IsActive = team.IsActive,
                CreatedAt = team.CreatedAt,
                UpdatedAt = team.UpdatedAt,
                CreatedBy = team.CreatedBy,
                MemberCount = memberCount
            };
        }

        // ── CRUD ─────────────────────────────────────────────────────────────

        public async Task<TeamDTO> CreateTeam(CreateTeamRequest request)
        {
            var companyId = GetCallerCompanyId();

            // Validate company exists
            var company = await _companyRepository.GetCompanyByIdAsync(companyId)
                ?? throw new KeyNotFoundException("Company not found.");

            var entity = new TeamEntity
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                CompanyId = companyId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _loginUserDetails.UserID
            };

            await _teamRepository.CreateTeamAsync(entity);

            return MapToDTO(entity, company.Name);
        }

        public async Task<TeamDTO> UpdateTeam(UpdateTeamRequest request)
        {
            var team = await _teamRepository.GetTeamByIdAsync(request.Id)
                ?? throw new KeyNotFoundException($"Team '{request.Id}' not found.");

            EnsureTeamBelongsToCaller(team);

            if (!string.IsNullOrWhiteSpace(request.Name))
                team.Name = request.Name.Trim();

            if (request.Description != null)
                team.Description = request.Description.Trim();

            if (request.IsActive.HasValue)
                team.IsActive = request.IsActive.Value;

            team.UpdatedAt = DateTime.UtcNow;

            await _teamRepository.UpdateTeamAsync(team.Id, team);

            var company = await _companyRepository.GetCompanyByIdAsync(team.CompanyId);
            return MapToDTO(team, company?.Name);
        }

        public async Task<bool> DeleteTeam(Guid teamId)
        {
            var team = await _teamRepository.GetTeamByIdAsync(teamId)
                ?? throw new KeyNotFoundException($"Team '{teamId}' not found.");

            EnsureTeamBelongsToCaller(team);

            // Guard: block deletion if team still has active members
            var activeMemberCount = await _userRepository.GetActiveUserCountByTeamIdAsync(teamId);
            if (activeMemberCount > 0)
                throw new InvalidOperationException(
                    $"Cannot delete team '{team.Name}' — it still has {activeMemberCount} active member(s). " +
                    "Please re-assign or deactivate all members first.");

            await _teamRepository.DeleteTeamAsync(teamId);
            return true;
        }

        public async Task<TeamDTO> GetTeamById(Guid teamId)
        {
            var team = await _teamRepository.GetTeamByIdAsync(teamId)
                ?? throw new KeyNotFoundException($"Team '{teamId}' not found.");

            EnsureTeamBelongsToCaller(team);

            var company = await _companyRepository.GetCompanyByIdAsync(team.CompanyId);
            var memberCount = await _userRepository.GetActiveUserCountByTeamIdAsync(teamId);
            return MapToDTO(team, company?.Name, memberCount);
        }

        public async Task<PagedTeamsDTO> GetTeamsByCompany(DefaultRequest request)
        {
            var companyId = GetCallerCompanyId();
            var (teams, totalCount) = await _teamRepository.GetTeamsWithFiltersAsync(request, companyId);

            var company = await _companyRepository.GetCompanyByIdAsync(companyId);

            var dtoList = new List<TeamDTO>();
            foreach (var team in teams)
            {
                var memberCount = await _userRepository.GetActiveUserCountByTeamIdAsync(team.Id);
                dtoList.Add(MapToDTO(team, company?.Name, memberCount));
            }

            return new PagedTeamsDTO
            {
                Teams = dtoList,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize <= 0 ? 10 : request.PageSize
            };
        }

        public async Task<TeamMembersDTO> GetTeamMembers(Guid teamId, DefaultRequest request)
        {
            var team = await _teamRepository.GetTeamByIdAsync(teamId)
                ?? throw new KeyNotFoundException($"Team '{teamId}' not found.");

            EnsureTeamBelongsToCaller(team);

            var company = await _companyRepository.GetCompanyByIdAsync(team.CompanyId);
            var (users, totalCount) = await _userRepository.GetUsersByTeamIdAsync(teamId, request);

            var memberDtos = users.Select(u => new AgentDTO
            {
                AgentId = u.Id,
                AgentName = $"{u.FirstName} {u.LastName}",
                Email = u.Email,
                CompanyId = u.CompanyId,
                Company = company?.Name ?? string.Empty,
                LastLogin = u.LastLoginDate,
                QuotesThisWeek = 0, // enrichment not needed for team member listing
                Status = u.IsActive ? "Active" : "Inactive",
                CreatedAt = u.CreatedAt,
                TeamId = teamId,
                TeamName = team.Name
            }).ToList();

            var memberCount = await _userRepository.GetActiveUserCountByTeamIdAsync(teamId);
            var teamDto = MapToDTO(team, company?.Name, memberCount);

            return new TeamMembersDTO
            {
                Team = teamDto,
                Members = memberDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize <= 0 ? 10 : request.PageSize
            };
        }

        // ── Assignment ────────────────────────────────────────────────────────

        public async Task<bool> AssignUserToTeam(AssignUserToTeamRequest request)
        {
            var callerCompanyId = GetCallerCompanyId();

            var team = await _teamRepository.GetTeamByIdAsync(request.TeamId)
                ?? throw new KeyNotFoundException($"Team '{request.TeamId}' not found.");

            if (team.CompanyId != callerCompanyId)
                throw new UnauthorizedAccessException("You do not have access to this team.");

            var user = await _userRepository.GetUserById(request.UserId)
                ?? throw new KeyNotFoundException($"User '{request.UserId}' not found.");

            // Enforce company boundary — user must belong to the same company as the team
            if (user.CompanyId != team.CompanyId)
                throw new InvalidOperationException(
                    "Cannot assign a user to a team that belongs to a different company.");

            await _userRepository.UpdateUserTeamAsync(user.Id, team.Id);
            return true;
        }

        public async Task<bool> RemoveUserFromTeam(Guid userId)
        {
            var callerCompanyId = GetCallerCompanyId();

            var user = await _userRepository.GetUserById(userId)
                ?? throw new KeyNotFoundException($"User '{userId}' not found.");

            // Enforce company boundary — admin can only manage users in their own company
            if (user.CompanyId != callerCompanyId)
                throw new UnauthorizedAccessException("You do not have access to this user.");

            await _userRepository.UpdateUserTeamAsync(userId, null);
            return true;
        }
    }
}
