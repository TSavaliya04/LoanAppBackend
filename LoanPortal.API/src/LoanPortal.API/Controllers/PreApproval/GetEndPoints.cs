using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;

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
                return Ok(new ApiResponse<PreApprovalDocument>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new ApiResponse<BorrowerInfoDTO>
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<BorrowerInfoDTO>
                {
                    IsSuccess = false,
                    Message = "Internal server error."
                });
            }
        }

        [HttpGet("preapproval/TopOpportunities")]
        public async Task<IActionResult> GetTopOpportunities()
        {
            try
            {
                var result = await _preApprovalService.GetTopOpportunities();
                return Ok(new ApiResponse<List<TopOpportunityDTO>>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<TopOpportunityDTO>>
                {
                    IsSuccess = false,
                    Message = "Internal server error."
                });
            }
        }

        [HttpGet("preapproval/PreApprovalReport")]
        public async Task<IActionResult> PreApprovalReport([FromQuery] Guid preApprovalId)
        {
            try
            {
                var result = await _preApprovalService.GetPreApprovalReport(preApprovalId);
                return Ok(new ApiResponse<PreApprovalReport>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<TopOpportunityDTO>>
                {
                    IsSuccess = false,
                    Message = "Internal server error."
                });
            }
        }

        [HttpGet("preapproval/FHAReport")]
        public async Task<IActionResult> GetFHAReport([FromQuery] Guid preApprovalId)
        {
            try
            {
                var result = await _preApprovalService.GetFHAReport(preApprovalId);
                return Ok(new ApiResponse<FHAReport>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<TopOpportunityDTO>>
                {
                    IsSuccess = false,
                    Message = "Internal server error."
                });
            }
        }
    }
}
