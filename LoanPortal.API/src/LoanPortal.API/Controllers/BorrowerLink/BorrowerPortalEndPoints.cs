using Ardalis.ApiEndpoints;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.BorrowerLink
{
    public class BorrowerPortalEndPoints : EndpointBase
    {
        private readonly IBorrowerLinkService _borrowerLinkService;

        public BorrowerPortalEndPoints(IBorrowerLinkService borrowerLinkService)
        {
            _borrowerLinkService = borrowerLinkService;
        }

        // ── Resolve Link ─────────────────────────────────────────────────────

        [AllowAnonymous]
        [HttpGet("borrowerportal/resolve/{loanOfficerId}")]
        public async Task<IActionResult> ResolveLink(Guid loanOfficerId)
        {
            try
            {
                var result = await _borrowerLinkService.ResolveLinkAsync(loanOfficerId);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(ErrorResponse<ResolveBorrowerLinkResponse>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<ResolveBorrowerLinkResponse>(500, ex.Message));
            }
        }

        // ── Get My Drafts ────────────────────────────────────────────────────

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("borrowerportal/mydrafts")]
        public async Task<IActionResult> GetMyDrafts()
        {
            try
            {
                var result = await _borrowerLinkService.GetMyDraftsAsync();
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<List<GetMyDraftsResponseItem>>(500, ex.Message));
            }
        }

        // ── Save Draft ───────────────────────────────────────────────────────

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("borrowerportal/savedraft")]
        public async Task<IActionResult> SaveDraft([FromBody] SaveBorrowerDraftRequest request)
        {
            try
            {
                var result = await _borrowerLinkService.SaveDraftAsync(request);
                return Ok(SuccessResponse(result, 200, "Draft saved successfully."));
            }
            catch (NotFoundException ex)
            {
                return NotFound(ErrorResponse<SaveBorrowerDraftResponse>(404, ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ErrorResponse<SaveBorrowerDraftResponse>(401, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(410, ErrorResponse<SaveBorrowerDraftResponse>(410, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<SaveBorrowerDraftResponse>(500, ex.Message));
            }
        }

        // ── Submit ───────────────────────────────────────────────────────────

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("borrowerportal/submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitBorrowerEmploymentRequest request)
        {
            try
            {
                var result = await _borrowerLinkService.SubmitAsync(request);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(ErrorResponse<SubmitBorrowerEmploymentResponse>(404, ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ErrorResponse<SubmitBorrowerEmploymentResponse>(401, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(409, ErrorResponse<SubmitBorrowerEmploymentResponse>(409, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<SubmitBorrowerEmploymentResponse>(500, ex.Message));
            }
        }
    }
}
