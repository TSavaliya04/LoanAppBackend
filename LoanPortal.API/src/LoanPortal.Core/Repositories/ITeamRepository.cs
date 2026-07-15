using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Repositories
{
    public interface ITeamRepository
    {
        Task CreateTeamAsync(TeamEntity team);
        Task<TeamEntity> GetTeamByIdAsync(Guid id);
        Task<List<TeamEntity>> GetTeamsByCompanyIdAsync(Guid companyId);
        Task UpdateTeamAsync(Guid id, TeamEntity team);

        /// <summary>Hard-deletes the team document. Only called after the service confirms no active members.</summary>
        Task DeleteTeamAsync(Guid id);

        Task<(List<TeamEntity> Teams, int TotalCount)> GetTeamsWithFiltersAsync(DefaultRequest request, Guid companyId);

        /// <summary>Returns the count of active users currently assigned to this team.</summary>
        Task<int> GetActiveMemberCountAsync(Guid teamId);
    }
}
