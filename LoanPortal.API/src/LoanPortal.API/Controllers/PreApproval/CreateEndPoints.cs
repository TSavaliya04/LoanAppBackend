using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Services;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.PreApproval
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class CreateEndPoints : EndpointBase
    {
        private readonly IPreApprovalService _preApprovalService;
        private readonly ILoginUserDetails _loginUserDetails;

        public CreateEndPoints(
            IPreApprovalService preApprovalService,
            ILoginUserDetails loginUserDetails
        )
        {
            _preApprovalService = preApprovalService;
            _loginUserDetails = loginUserDetails;
        }

        [HttpPost("preapproval/SavePreApproval")]
        public async Task<IActionResult> SavePreApproval([FromBody] PreApprovalDTO preApproval)
        {
            try
            {
                var result = await _preApprovalService.SavePreApproval(preApproval);
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
