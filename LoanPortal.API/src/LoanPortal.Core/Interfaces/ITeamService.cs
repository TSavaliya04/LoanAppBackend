using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface ITeamService
    {
        /// <summary>
        /// Creates a new team. SuperAdmins must provide <see cref="CreateTeamRequest.CompanyId"/>;
        /// other admins use the company in their token.
        /// </summary>
        Task<TeamDTO> CreateTeam(CreateTeamRequest request);

        /// <summary>Updates team name, description, or active status.</summary>
        Task<TeamDTO> UpdateTeam(UpdateTeamRequest request);

        /// <summary>
        /// Soft-deletes a team. Blocked if the team has active members — the admin must
        /// re-assign or deactivate members first.
        /// </summary>
        Task<bool> DeleteTeam(Guid teamId);

        /// <summary>Returns a single team by Id.</summary>
        Task<TeamDTO> GetTeamById(Guid teamId);

        /// <summary>
        /// Returns a paginated list of teams. SuperAdmins select a company with
        /// <see cref="DefaultRequest.CompanyId"/>; other admins are restricted to their token company.
        /// </summary>
        Task<PagedTeamsDTO> GetTeamsByCompany(DefaultRequest request);

        /// <summary>Returns team details plus its paginated member list.</summary>
        Task<TeamMembersDTO> GetTeamMembers(Guid teamId, DefaultRequest request);

        /// <summary>
        /// Assigns a user to a team. Validates that the user and the team belong to the same company.
        /// A user can only belong to one team; any previous assignment is overwritten.
        /// </summary>
        Task<bool> AssignUserToTeam(AssignUserToTeamRequest request);

        /// <summary>Removes a user from their current team (sets teamId to null).</summary>
        Task<bool> RemoveUserFromTeam(Guid userId);
    }
}
