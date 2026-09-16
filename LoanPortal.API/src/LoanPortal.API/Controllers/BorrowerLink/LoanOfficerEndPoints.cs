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
        /// Generates (or regenerates) a secure borrower invite link.
        /// If an Active link already exists for this Loan Officer, it is revoked first.
        /// </summary>
        [HttpPost("borrowerlink/generate")]
        public async Task<IActionResult> GenerateLink([FromBody] GenerateBorrowerLinkRequest request)
        {
            try
            {
                var result = await _borrowerLinkService.GenerateLinkAsync(request);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<GenerateBorrowerLinkResponse>(500, ex.Message));
            }
        }
    }
}

