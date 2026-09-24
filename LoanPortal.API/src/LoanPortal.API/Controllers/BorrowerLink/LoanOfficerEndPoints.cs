using Ardalis.ApiEndpoints;
using FirebaseAdmin.Auth;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.BorrowerLink
{
    /// <summary>
    /// Endpoints called by the Loan Officer to manage borrower invite links.
    /// Requires a valid LO / admin Firebase JWT.
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AnyUser")]
    public class LoanOfficerEndPoints : EndpointBase
    {
        private readonly IBorrowerLinkService _borrowerLinkService;

        public LoanOfficerEndPoints(IBorrowerLinkService borrowerLinkService)
        {
            _borrowerLinkService = borrowerLinkService;
        }

        /// <summary>
        /// Retrieves the Loan Officer's permanent portal URL. Creates it if it doesn't exist.
        /// </summary>
        [HttpGet("EmploymentLink/Me")]
        public async Task<IActionResult> GetMyPortalLink()
        {
            try
            {
                var result = await _borrowerLinkService.GetMyPortalLinkAsync();
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<GetLOEmploymentLinkResponse>(500, ex.Message));
            }
        }

        /// <summary>
        /// Updates the status (Active/Disabled) of the Loan Officer's portal.
        /// </summary>
        [HttpPatch("EmploymentLink/Me/status")]
        public async Task<IActionResult> UpdatePortalStatus([FromBody] UpdateLOEmploymentLinkStatusRequest request)
        {
            try
            {
                await _borrowerLinkService.UpdatePortalStatusAsync(request);
                return Ok(SuccessResponse<string>("", 200, "Portal status updated successfully."));
            }
            catch (NotFoundException ex)
            {
                return NotFound(ErrorResponse<string>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<string>(500, ex.Message));
            }
        }
    }
}

