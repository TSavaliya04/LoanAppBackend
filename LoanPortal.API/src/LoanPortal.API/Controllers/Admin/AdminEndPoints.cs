using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Admin
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AdminEndPoints : EndpointBase
    {
        private readonly IAdminService _adminService;
        private readonly ILoginUserDetails _loginUserDetails;

        public AdminEndPoints(IAdminService adminService, ILoginUserDetails loginUserDetails)
        {
            _adminService = adminService;
            _loginUserDetails = loginUserDetails;
        }

        [HttpGet("admin/DailyActiveUsers")]
        public async Task<IActionResult> GetDailyActiveUsers([FromQuery] DateTime? date)
        {
            try
            {
                // Check if user is admin
                if (!IsAdmin())
                {
                    return StatusCode(403, ErrorResponse<DailyActiveUsersDTO>(403, "Access denied. Admin privileges required."));
                }

                var targetDate = date ?? DateTime.UtcNow;
                var result = await _adminService.GetDailyActiveUsers(targetDate);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<DailyActiveUsersDTO>(500, ex.Message));
            }
        }

        [HttpGet("admin/DailyActiveUsersRange")]
        public async Task<IActionResult> GetDailyActiveUsersRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                // Check if user is admin
                if (!IsAdmin())
                {
                    return StatusCode(403, ErrorResponse<DailyActiveUsersRangeDTO>(403, "Access denied. Admin privileges required."));
                }

                if (endDate < startDate)
                {
                    return BadRequest(ErrorResponse<DailyActiveUsersRangeDTO>(400, "End date must be after start date"));
                }

                var result = await _adminService.GetDailyActiveUsersRange(startDate, endDate);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<DailyActiveUsersRangeDTO>(500, ex.Message));
            }
        }

        [HttpGet("admin/CurrentActiveUsers")]
        public async Task<IActionResult> GetCurrentActiveUsers()
        {
            try
            {
                // Check if user is admin
                if (!IsAdmin())
                {
                    return StatusCode(403, ErrorResponse<CurrentActiveUsersDTO>(403, "Access denied. Admin privileges required."));
                }

                var result = await _adminService.GetCurrentActiveUsers();
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<CurrentActiveUsersDTO>(500, ex.Message));
            }
        }

        [HttpPost("admin/GetUsers")]
        public async Task<IActionResult> GetUsers([FromBody] List<Guid> userIds)
        {
            try
            {
                // Check if user is admin
                if (!IsAdmin())
                {
                    return StatusCode(403, ErrorResponse<List<UserDTO>>(403, "Access denied. Admin privileges required."));
                }

                if (userIds == null || userIds.Count == 0)
                {
                    return BadRequest(ErrorResponse<List<UserDTO>>(400, "User IDs list cannot be empty."));
                }

                var result = await _adminService.GetUsers(userIds);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<List<UserDTO>>(500, ex.Message));
            }
        }

        private bool IsAdmin()
        {
            return _loginUserDetails.UserID == LoanPortal.Shared.Constants.IConstants.AdminId;
        }
    }
}
