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
    /// Endpoints called by the borrower to fill and submit their employment information.
    ///
    /// Auth strategy:
    ///   - resolve   → [AllowAnonymous]  — borrower can preview LO info before signing in
    ///   - savedraft → [Authorize]        — borrower must be logged in via Firebase
    ///   - submit    → [Authorize]        — borrower must be logged in via Firebase
    ///
    /// The borrower's Firebase UID (decodedToken.Uid) is extracted directly from the
    /// verified Firebase token — no custom UserId claim is required.
    /// </summary>
    public class BorrowerPortalEndPoints : EndpointBase
    {
        private readonly IBorrowerLinkService _borrowerLinkService;

        public BorrowerPortalEndPoints(IBorrowerLinkService borrowerLinkService)
        {
            _borrowerLinkService = borrowerLinkService;
        }

        // ── Resolve Link ─────────────────────────────────────────────────────

        /// <summary>
        /// Public endpoint — no authentication required.
        /// Resolves a raw URL token into LO branding info and the borrower's saved draft (if any).
        /// Called by the frontend when the borrower opens the shared link, before they log in.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("borrowerportal/resolve")]
        public async Task<IActionResult> ResolveLink([FromQuery] string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return BadRequest(ErrorResponse<ResolveBorrowerLinkResponse>(400, "Token is required."));

                var result = await _borrowerLinkService.ResolveLinkAsync(token);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(ErrorResponse<ResolveBorrowerLinkResponse>(404, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                // Covers: Revoked, Expired, Already Submitted
                return StatusCode(410, ErrorResponse<ResolveBorrowerLinkResponse>(410, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<ResolveBorrowerLinkResponse>(500, ex.Message));
            }
        }

        // ── Save Draft ───────────────────────────────────────────────────────

        /// <summary>
        /// Authenticated endpoint — requires borrower Firebase JWT.
        /// Auto-saves progress after each form step. Safe to call multiple times;
        /// later calls merge into the existing draft without overwriting earlier steps.
        /// </summary>
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("borrowerportal/savedraft")]
        public async Task<IActionResult> SaveDraft([FromBody] SaveBorrowerDraftRequest request)
        {
            try
            {
                var borrowerFirebaseUid = await GetBorrowerFirebaseUidAsync();
                if (borrowerFirebaseUid == null)
                    return Unauthorized(ErrorResponse<object>(401, "Valid Firebase token required."));

                await _borrowerLinkService.SaveDraftAsync(request, borrowerFirebaseUid);
                return Ok(SuccessResponse("Draft saved successfully."));
            }
            catch (NotFoundException ex)
            {
                return NotFound(ErrorResponse<object>(404, ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ErrorResponse<object>(401, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(410, ErrorResponse<object>(410, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }

        // ── Submit ───────────────────────────────────────────────────────────

        /// <summary>
        /// Authenticated endpoint — requires borrower Firebase JWT.
        /// Final submission. Creates a new PreApprovalDocument under the LO's account
        /// and sends the LO an email notification.
        /// </summary>
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("borrowerportal/submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitBorrowerEmploymentRequest request)
        {
            try
            {
                var borrowerFirebaseUid = await GetBorrowerFirebaseUidAsync();
                if (borrowerFirebaseUid == null)
                    return Unauthorized(ErrorResponse<SubmitBorrowerEmploymentResponse>(401, "Valid Firebase token required."));

                var result = await _borrowerLinkService.SubmitAsync(request, borrowerFirebaseUid);
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
                // Handles double-submit, expired, revoked
                return StatusCode(409, ErrorResponse<SubmitBorrowerEmploymentResponse>(409, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<SubmitBorrowerEmploymentResponse>(500, ex.Message));
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // Private Helper
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Extracts the borrower's Firebase UID from the Authorization header token.
        /// Returns null if the token is missing or invalid.
        /// </summary>
        private async Task<string?> GetBorrowerFirebaseUidAsync()
        {
            try
            {
                var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (string.IsNullOrEmpty(token))
                    return null;

                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                return decodedToken.Uid;
            }
            catch
            {
                return null;
            }
        }
    }
}

