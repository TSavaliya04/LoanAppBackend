using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.IncomeCalculation
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class IncomeCalculationController : EndpointBase
    {
        private readonly IIncomeCalculationService _incomeCalculationService;

        public IncomeCalculationController(IIncomeCalculationService incomeCalculationService)
        {
            _incomeCalculationService = incomeCalculationService;
        }

        [HttpGet("income-calculation/GetByScenarioId")]
        public async Task<IActionResult> GetByScenarioId([FromQuery] Guid scenarioId)
        {
            try
            {
                var result = await _incomeCalculationService.GetByScenarioId(scenarioId);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<List<IncomeCalculationDocument>>(500, ex.Message));
            }
        }

        [HttpGet("income-calculation/GetById")]
        public async Task<IActionResult> GetById([FromQuery] Guid id)
        {
            try
            {
                var result = await _incomeCalculationService.GetById(id);
                if (result == null)
                    return NotFound(ErrorResponse<IncomeCalculationDocument>(404, $"Income calculation with ID {id} was not found."));
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<IncomeCalculationDocument>(500, ex.Message));
            }
        }

        [HttpPost("income-calculation/Save")]
        public async Task<IActionResult> Save([FromBody] IncomeCalculationDocument doc)
        {
            try
            {
                var result = await _incomeCalculationService.Save(doc);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<IncomeCalculationDocument>(500, ex.Message));
            }
        }

        [HttpPut("income-calculation/Update")]
        public async Task<IActionResult> Update([FromQuery] Guid id, [FromBody] IncomeCalculationDocument doc)
        {
            try
            {
                var result = await _incomeCalculationService.Update(id, doc);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<IncomeCalculationDocument>(500, ex.Message));
            }
        }

        [HttpDelete("income-calculation/DeleteById")]
        public async Task<IActionResult> DeleteById([FromQuery] Guid id)
        {
            try
            {
                await _incomeCalculationService.DeleteById(id);
                return Ok(SuccessResponse(true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<bool>(500, ex.Message));
            }
        }

        [HttpDelete("income-calculation/DeleteByScenarioId")]
        public async Task<IActionResult> DeleteByScenarioId([FromQuery] Guid scenarioId)
        {
            try
            {
                await _incomeCalculationService.DeleteByScenarioId(scenarioId);
                return Ok(SuccessResponse(true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<bool>(500, ex.Message));
            }
        }
    }
}
