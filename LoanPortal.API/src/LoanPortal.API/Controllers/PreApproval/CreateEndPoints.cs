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

        /*[HttpPost("preapproval/BorrowerInfo")]
        public async Task<IActionResult> BorrowerInfo([FromBody] BorrowerInfoDTO info)
        {
            try
            {
                //var errors = PreApprovalHelper.ValidateBorrowerInfo(info);
                //if (errors.Count > 0)
                //{
                //    return BadRequest(new { message = "Validation failed", errors });
                //}

                var result = await _preApprovalService.CreateBorrowerInfo(info);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<BorrowerInfoDTO>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<BorrowerInfoDTO>(500, ex.Message));
            }
        }

        [HttpPost("preapproval/PurchaseInfo")]
        public async Task<IActionResult> PurchaseInfo([FromBody] PurchaseInfoDTO info)
        {
            try
            {
                var result = await _preApprovalService.CreatePurchaseInfo(info);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<BorrowerInfoDTO>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<BorrowerInfoDTO>(500, ex.Message));
            }
        }

        [HttpPost("preapproval/LenderFees")]
        public async Task<IActionResult> LenderFees([FromBody] LenderFeesDTO feesDTO)
        {
            try
            {
                var result = await _preApprovalService.CreateLenderFees(feesDTO);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<LenderFeesDTO>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<LenderFeesDTO>(500, ex.Message));
            }
        }

        [HttpPost("preapproval/PrepaidItems")]
        public async Task<IActionResult> PrepaidItems([FromBody] PrepaidItemsDTO prepaidItemsDTO)
        {
            try
            {
                var result = await _preApprovalService.CreatePrepaidItems(prepaidItemsDTO);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<PrepaidItemsDTO>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<PrepaidItemsDTO>(500, ex.Message));
            }
        }

        [HttpPost("preapproval/MiscFees")]
        public async Task<IActionResult> MiscFees([FromBody] MiscFeesDTO miscFeesDTO)
        {
            try
            {
                var result = await _preApprovalService.CreateMiscFees(miscFeesDTO);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<MiscFeesDTO>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<MiscFeesDTO>(500, ex.Message));
            }
        }

        [HttpPost("preapproval/BorrowerIncomeData")]
        public async Task<IActionResult> BorrowerIncome([FromBody] List<BorrowerIncomeDTO> borrowerIncomeDTOs)
        {
            try
            {
                var result = await _preApprovalService.CreateBorrowerIncome(borrowerIncomeDTOs);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<List<BorrowerIncomeDTO>>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<List<BorrowerIncomeDTO>>(500, ex.Message));
            }
        }*/

        /*[HttpPost("preapproval/DebtBreakdown")]
        public async Task<IActionResult> DebtBreakdown([FromBody] List<DebtBreakdownDTO> debtDtos)
        {
            try
            {
                var result = await _preApprovalService.CreateDebtBreakdown(debtDtos);
                return Ok(SuccessResponse(result));
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    ErrorResponse<List<DebtBreakdownDTO>>(404, ex.Message)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<List<DebtBreakdownDTO>>(500, ex.Message));
            }
        }*/

        /*[HttpPost("preapproval/LoanProgram")]
        public async Task<IActionResult> LoanProgram([FromBody] LoanProgramDTO loanProgramDto)
        {
            try
            {
                var result = await _preApprovalService.CreateLoanProgram(loanProgramDto);
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

        [HttpPost("preapproval/ClonePreApproval")]
        public async Task<IActionResult> ClonePreApproval([FromQuery] Guid PreApprovalId)
        {
            try
            {
                await _preApprovalService.ClonePreApproval(PreApprovalId);
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
        }*/

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
