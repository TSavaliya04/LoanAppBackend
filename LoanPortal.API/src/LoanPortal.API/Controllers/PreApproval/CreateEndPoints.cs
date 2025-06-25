using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Services;

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

        [HttpPost("preapproval/BorrowerInfo")]
        public async Task<IActionResult> BorrowerInfo([FromBody] BorrowerInfoDTO info)
        {
            try
            {
                /*var errors = PreApprovalHelper.ValidateBorrowerInfo(info);
                if (errors.Count > 0)
                {
                    return BadRequest(new { message = "Validation failed", errors });
                }*/

                var result = await _preApprovalService.CreateBorrowerInfo(info);
                return Ok(new ApiResponse<BorrowerInfoDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<BorrowerInfoDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<BorrowerInfoDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }

        [HttpPost("preapproval/PurchaseInfo")]
        public async Task<IActionResult> PurchaseInfo([FromBody] PurchaseInfoDTO info)
        {
            try
            {
                var result = await _preApprovalService.CreatePurchaseInfo(info);
                return Ok(new ApiResponse<PurchaseInfoDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<PurchaseInfoDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<PurchaseInfoDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }

        [HttpPost("preapproval/LenderFees")]
        public async Task<IActionResult> LenderFees([FromBody] LenderFeesDTO feesDTO)
        {
            try
            {
                var result = await _preApprovalService.CreateLenderFees(feesDTO);
                return Ok(new ApiResponse<LenderFeesDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<LenderFeesDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<LenderFeesDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }

        [HttpPost("preapproval/PrepaidItems")]
        public async Task<IActionResult> PrepaidItems([FromBody] PrepaidItemsDTO prepaidItemsDTO)
        {
            try
            {
                var result = await _preApprovalService.CreatePrepaidItems(prepaidItemsDTO);
                return Ok(new ApiResponse<PrepaidItemsDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<PrepaidItemsDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<PrepaidItemsDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }

        [HttpPost("preapproval/MiscFees")]
        public async Task<IActionResult> MiscFees([FromBody] MiscFeesDTO miscFeesDTO)
        {
            try
            {
                var result = await _preApprovalService.CreateMiscFees(miscFeesDTO);
                return Ok(new ApiResponse<MiscFeesDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<MiscFeesDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<MiscFeesDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }

        [HttpPost("preapproval/BorrowerIncomeData")]
        public async Task<IActionResult> BorrowerIncome([FromBody] BorrowerIncomeDTO borrowerIncomeDTO)
        {
            try
            {
                var result = await _preApprovalService.CreateBorrowerIncome(borrowerIncomeDTO);
                return Ok(new ApiResponse<BorrowerIncomeDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<BorrowerIncomeDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<BorrowerIncomeDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }

        [HttpPost("preapproval/DebtBreakdown")]
        public async Task<IActionResult> DebtBreakdown([FromBody] DebtBreakdownDTO debtDto)
        {
            try
            {
                var result = await _preApprovalService.CreateDebtBreakdown(debtDto);
                return Ok(new ApiResponse<DebtBreakdownDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<DebtBreakdownDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<DebtBreakdownDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }

        [HttpPost("preapproval/LoanProgram")]
        public async Task<IActionResult> LoanProgram([FromBody] LoanProgramDTO loanProgramDto)
        {
            try
            {
                var result = await _preApprovalService.CreateLoanProgram(loanProgramDto);
                return Ok(new ApiResponse<LoanProgramDTO> { Data = result, IsSuccess = true });
            }
            catch (NotFoundException ex)
            {
                return NotFound(
                    new ApiResponse<LoanProgramDTO> { IsSuccess = false, Message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new ApiResponse<LoanProgramDTO>
                    {
                        IsSuccess = false,
                        Message = "Internal server error.",
                    }
                );
            }
        }
    }
}
