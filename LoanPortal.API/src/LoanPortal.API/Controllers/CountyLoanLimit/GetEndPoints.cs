using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.CountyLoanLimit
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class GetEndPoints : EndpointBase
    {
        private readonly ICountyLoanLimitService _countyService;

        public GetEndPoints(ICountyLoanLimitService countyService)
        {
            _countyService = countyService;
        }

        [HttpGet("countyloanlimit/SearchCounties")]
        public async Task<IActionResult> SearchCounties([FromQuery] string searchTerm)
        {
            try
            {
                var result = await _countyService.SearchCountiesAsync(searchTerm);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<List<LoanPortal.Core.Entities.CountySearchDTO>>(500, ex.Message));
            }
        }

        [HttpGet("countyloanlimit/GetLoanLimit")]
        public async Task<IActionResult> GetLoanLimit([FromQuery] Guid countyId, [FromQuery] LoanPortal.Shared.Enum.PropertyType propertyType)
        {
            try
            {
                var result = await _countyService.GetLoanLimitAsync(countyId, propertyType);
                if (result == null)
                {
                    return NotFound(ErrorResponse<decimal?>(404, "County or matching limit not found"));
                }
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<decimal?>(500, ex.Message));
            }
        }
    }
}
