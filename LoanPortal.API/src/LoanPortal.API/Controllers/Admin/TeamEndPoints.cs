using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Admin
{
    /// <summary>
    /// All team management endpoints.
    /// Access: CompanyAdmin and above (policy: CompanyAdminOrAbove).
    /// CompanyId is always resolved from the logged-in user's token — never from the request body.
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "CompanyAdminOrAbove")]
    public class TeamEndPoints : EndpointBase
    {
        private readonly ITeamService _teamService;

        public TeamEndPoints(ITeamService teamService)
        {
            _teamService = teamService;
        }

        /// <summary>Creates a new team for the logged-in company admin's company.</summary>
        [HttpPost("admin/team/Create")]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request)
        {
            try
            {
                var result = await _teamService.CreateTeam(request);
                return Ok(SuccessResponse(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<TeamDTO>(403, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse<TeamDTO>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<TeamDTO>(500, ex.Message));
            }
        }

        /// <summary>Updates a team's name, description, or active status.</summary>
        [HttpPut("admin/team/Update")]
        public async Task<IActionResult> UpdateTeam([FromBody] UpdateTeamRequest request)
        {
            try
            {
                var result = await _teamService.UpdateTeam(request);
                return Ok(SuccessResponse(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<TeamDTO>(403, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse<TeamDTO>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<TeamDTO>(500, ex.Message));
            }
        }

        /// <summary>
        /// Deletes a team. Returns 409 Conflict if the team still has active members —
        /// the admin must re-assign or deactivate all members first.
        /// </summary>
        [HttpDelete("admin/team/Delete/{teamId}")]
        public async Task<IActionResult> DeleteTeam(Guid teamId)
        {
            try
            {
                await _teamService.DeleteTeam(teamId);
                return Ok(SuccessResponse<object>(null));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<object>(403, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse<object>(404, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                // Blocked — team has active members
                return Conflict(ErrorResponse<object>(409, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }

        /// <summary>Returns a single team by Id.</summary>
        [HttpGet("admin/team/GetById/{teamId}")]
        public async Task<IActionResult> GetTeamById(Guid teamId)
        {
            try
            {
                var result = await _teamService.GetTeamById(teamId);
                return Ok(SuccessResponse(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<TeamDTO>(403, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse<TeamDTO>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<TeamDTO>(500, ex.Message));
            }
        }

        /// <summary>Returns a paginated list of teams belonging to the logged-in admin's company.</summary>
        [HttpPost("admin/team/GetByCompany")]
        public async Task<IActionResult> GetTeamsByCompany([FromBody] DefaultRequestWrapper request)
        {
            try
            {
                var result = await _teamService.GetTeamsByCompany(request.Params);
                return Ok(SuccessResponse(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<PagedTeamsDTO>(403, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<PagedTeamsDTO>(500, ex.Message));
            }
        }

        /// <summary>Returns team details together with a paginated list of its members.</summary>
        [HttpPost("admin/team/GetMembers/{teamId}")]
        public async Task<IActionResult> GetTeamMembers(Guid teamId, [FromBody] DefaultRequestWrapper request)
        {
            try
            {
                var result = await _teamService.GetTeamMembers(teamId, request.Params);
                return Ok(SuccessResponse(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<TeamMembersDTO>(403, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse<TeamMembersDTO>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<TeamMembersDTO>(500, ex.Message));
            }
        }

        /// <summary>
        /// Assigns a user to a team.
        /// Both the user and the team must belong to the same company as the logged-in admin.
        /// Any previous team assignment for the user is overwritten (one team per user).
        /// </summary>
        [HttpPut("admin/team/AssignUser")]
        public async Task<IActionResult> AssignUserToTeam([FromBody] AssignUserToTeamRequest request)
        {
            try
            {
                await _teamService.AssignUserToTeam(request);
                return Ok(SuccessResponse<object>(null));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<object>(403, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse<object>(404, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                // Cross-company assignment attempt
                return BadRequest(ErrorResponse<object>(400, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }

        /// <summary>Removes a user from their current team (sets teamId to null).</summary>
        [HttpPut("admin/team/RemoveUser/{userId}")]
        public async Task<IActionResult> RemoveUserFromTeam(Guid userId)
        {
            try
            {
                await _teamService.RemoveUserFromTeam(userId);
                return Ok(SuccessResponse<object>(null));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<object>(403, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse<object>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }
    }
}
