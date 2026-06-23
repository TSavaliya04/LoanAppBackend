using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;
using System.Threading.Tasks;
using System;

namespace LoanPortal.API.Controllers.AiStrategy
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class GenerateSummaryEndpoint : EndpointBase
    {
        private readonly IAiStrategyService _aiStrategyService;

        public GenerateSummaryEndpoint(IAiStrategyService aiStrategyService)
        {
            _aiStrategyService = aiStrategyService;
        }

        [HttpPost("aistrategy/GenerateSummary")]
        public async Task<IActionResult> GenerateSummary([FromBody] ScenarioComparisonRequest request)
        {
            try
            {
                var result = await _aiStrategyService.GenerateSummaryAsync(request);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<AiStrategySummary>(500, ex.Message));
            }
        }
    }
}
