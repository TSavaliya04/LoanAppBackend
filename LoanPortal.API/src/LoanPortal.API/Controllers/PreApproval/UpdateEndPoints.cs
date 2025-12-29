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
    public class UpdateEndPoints : EndpointBase
    {
        private readonly IPreApprovalService _preApprovalService;
        public UpdateEndPoints(IPreApprovalService preApprovalService)
        {
            _preApprovalService = preApprovalService;
        }

        [HttpPut("preapproval/UpdateApplicationStatus")]
        public async Task<IActionResult> UpdateApplicationStatus([FromQuery] Guid id, int status)
        {
            try
            {
                var result = await _preApprovalService.UpdateApplicationStatus(id, status);
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

        [HttpDelete("preapproval/DeletePreApproval")]
        public async Task<IActionResult> DeletePreApproval([FromBody] List<Guid> preApprovalIds)
        {
            try
            {
                await _preApprovalService.DeletePreApproval(preApprovalIds);
                var result = true;
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<LoanProgramDTO>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<LoanProgramDTO>(500, ex.Message));
            }
        }
    }
}
