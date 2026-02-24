using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.PreApproval
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class GetEndPoints : EndpointBase
    {
        private readonly IPreApprovalService _preApprovalService;
        public GetEndPoints(IPreApprovalService preApprovalService)
        {
            _preApprovalService = preApprovalService;
        }

        [HttpGet("preapproval/GetPreApproval")]
        public async Task<IActionResult> GetPreApproval([FromQuery] Guid id)
        {
            try
            {
                var result = await _preApprovalService.GetPreApproval(id);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(ErrorResponse<BorrowerInfoDTO>(404, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<BorrowerInfoDTO>(500, ex.Message));
            }
        }

        [HttpGet("preapproval/GetQuoteList")]
        public async Task<IActionResult> GetQuoteList(int status)
        {
            try
            {
                var result = await _preApprovalService.GetQuoteList(status);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<TopOpportunityDTO>(500, ex.Message));
            }
        }

        [HttpGet("preapproval/PreApprovalReport")]
        public async Task<IActionResult> PreApprovalReport([FromQuery] Guid preApprovalId, Guid scenarioId)
        {
            try
            {
                var result = await _preApprovalService.GetPreApprovalReport(preApprovalId, scenarioId);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<PreApprovalReport>(500, ex.Message));
            }
        }

        [HttpGet("preapproval/FHAReport")]
        public async Task<IActionResult> GetFHAReport([FromQuery] Guid preApprovalId, Guid scenarioId)
        {
            try
            {
                var result = await _preApprovalService.GetFHAReport(preApprovalId, scenarioId);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<FHAReport>(500, ex.Message));
            }
        }

        [HttpGet("preapproval/QuickQuote")]
        public async Task<IActionResult> QuickQuote([FromQuery] Guid preApprovalId, Guid scenarioId)
        {
            try
            {
                var result = await _preApprovalService.GetQuickQuote(preApprovalId, scenarioId);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<QuickQuote>(500, ex.Message));
            }
        }

        [HttpGet("preapproval/GetDashboardData")]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                var result = await _preApprovalService.GetDashboardData();
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<DashboardDTO>(500, ex.Message));
            }
        }
    }
}
