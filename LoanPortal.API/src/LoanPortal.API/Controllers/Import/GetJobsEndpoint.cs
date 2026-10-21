using Ardalis.ApiEndpoints;
using LoanPortal.Core.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Import;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class GetJobsEndpoint : EndpointBase
{
    private const int MaxPageSize = 100;
    private readonly IImportJobRepository _jobRepository;
    private readonly ILoginUserDetails _loginUserDetails;
    public GetJobsEndpoint(IImportJobRepository jobRepository, ILoginUserDetails loginUserDetails) => (_jobRepository, _loginUserDetails) = (jobRepository, loginUserDetails);

    [HttpGet("import/jobs")]
    public async Task<IActionResult> Handle([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var jobs = await _jobRepository.GetByUserIdAsync(_loginUserDetails.UserID, Math.Max(1, page), Math.Clamp(pageSize, 1, MaxPageSize));
        return Ok(SuccessResponse(jobs));
    }
}
