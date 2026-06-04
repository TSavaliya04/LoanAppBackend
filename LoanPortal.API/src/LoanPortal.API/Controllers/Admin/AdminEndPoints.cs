using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Admin
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "CompanyAdminOrAbove")]
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
        public async Task<IActionResult> GetAdminDashboard([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] Guid? companyId = null)
        {
            try
            {
                var result = await _adminService.GetAdminDashboard(startDate, endDate, companyId);
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

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpPost("admin/CreateAdmin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            try
            {
                var result = await _adminService.CreateAdmin(request);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpPost("admin/GetCompanyAdmins")]
        public async Task<IActionResult> GetCompanyAdmins([FromBody] DefaultRequestWrapper request)
        {
            try
            {
                var result = await _adminService.GetCompanyAdmins(request.Params);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<PagedUserDTO>(500, ex.Message));
            }
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpGet("admin/GetCompanyAdminById/{id}")]
        public async Task<IActionResult> GetCompanyAdminById(Guid id)
        {
            try
            {
                var result = await _userService.GetUserProfile(id);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpPut("admin/UpdateCompanyAdmin")]
        public async Task<IActionResult> UpdateCompanyAdmin([FromForm] UpdateProfileRequest request)
        {
            try
            {
                var result = await _userService.UpdateProfile(request);
                return Ok(SuccessResponse(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<UserDTO>(403, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [Authorize(Policy = "AnyUser")]
        [HttpPost("admin/GetCompanies")]
        public async Task<IActionResult> GetCompanies([FromBody] DefaultRequestWrapper request, [FromQuery] string companyName = null)
        {
            try
            {
                var result = await _adminService.GetCompanies(request.Params, companyName);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<PagedCompaniesDTO>(500, ex.Message));
            }
        }

        [Authorize(Policy = "AnyUser")]
        [HttpGet("admin/GetCompanyById/{id}")]
        public async Task<IActionResult> GetCompanyById(Guid id)
        {
            try
            {
                var result = await _adminService.GetCompanyById(id);
                if (result == null)
                    return NotFound(ErrorResponse<CompanyDTO>(404, "Company not found."));
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<CompanyDTO>(500, ex.Message));
            }
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpPost("admin/CreateCompany")]
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyRequest request)
        {
            try
            {
                var result = await _adminService.CreateCompany(request);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<CompanyDTO>(500, ex.Message));
            }
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpPut("admin/UpdateCompany")]
        public async Task<IActionResult> UpdateCompany([FromBody] UpdateCompanyRequest request)
        {
            try
            {
                var result = await _adminService.UpdateCompany(request);
                if (result == null)
                    return NotFound(ErrorResponse<CompanyDTO>(404, "Company not found."));
                return Ok(SuccessResponse(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<CompanyDTO>(403, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<CompanyDTO>(500, ex.Message));
            }
        }
    }
}
