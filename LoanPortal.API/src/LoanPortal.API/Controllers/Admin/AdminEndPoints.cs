using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Admin
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminOnly")]
    public class AdminEndPoints : EndpointBase
    {
        private readonly IAdminService _adminService;
        private readonly ILoginUserDetails _loginUserDetails;
        private readonly IUserService _userService;

        public AdminEndPoints(IAdminService adminService, ILoginUserDetails loginUserDetails, IUserService userService)
        {
            _adminService = adminService;
            _loginUserDetails = loginUserDetails;
            _userService = userService;
        }

        [HttpPost("admin/GetUsers")]
        public async Task<IActionResult> GetUsers([FromBody] DefaultRequestWrapper request)
        {
            try
            {
                var result = await _adminService.GetUsers(request.Params);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<PagedAgentsDTO>(500, ex.Message));
            }
        }

        [HttpPost("admin/user/RecentQuotes")]
        public async Task<IActionResult> GetRecentQuotes(RecentQuoteRequest request)
        {
            try
            {
                var result = await _adminService.GetRecentQuotes(request);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<PagedRecentQuotesDTO>(500, ex.Message));
            }
        }

        [HttpGet("admin/GetAdminDashboard")]
        public async Task<IActionResult> GetAdminDashboard(DateTime startDate, DateTime endDate)
        {
            try
            {
                var result = await _adminService.GetAdminDashboard(startDate, endDate);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<AdminDashboardDTO>(500, ex.Message));
            }
        }

        [HttpGet("admin/user/QuotesOverview")]
        public async Task<IActionResult> GetQuotesOverview([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] Guid userId)
        {
            try
            {
                if (endDate < startDate)
                {
                    return BadRequest(ErrorResponse<QuotesOverviewDTO>(400, "End date must be after start date"));
                }

                var result = await _adminService.GetQuotesOverview(startDate, endDate, userId);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<QuotesOverviewDTO>(500, ex.Message));
            }
        }

        [HttpPut("admin/user/UpdateUser")]
        public async Task<IActionResult> UpdateUser([FromForm] UpdateProfileRequest request)
        {
            try
            {
                var result = await _userService.UpdateProfile(request);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [HttpGet("admin/user/GetUserDetails")]
        public async Task<IActionResult> GetUserDetails(Guid userId)
        {
            try
            {
                var result = await _userService.GetUserProfile(userId);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }
    }
}
