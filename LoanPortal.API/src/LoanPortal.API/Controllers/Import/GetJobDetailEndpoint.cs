using Ardalis.ApiEndpoints;
using LoanPortal.Core.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Import;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class GetJobDetailEndpoint : EndpointBase
{
    private readonly IImportJobRepository _jobRepository;
    private readonly ILoginUserDetails _loginUserDetails;
    public GetJobDetailEndpoint(IImportJobRepository jobRepository, ILoginUserDetails loginUserDetails) => (_jobRepository, _loginUserDetails) = (jobRepository, loginUserDetails);

    [HttpGet("import/jobs/{jobId:guid}")]
    public async Task<IActionResult> Handle(Guid jobId)
    {
        var job = await _jobRepository.GetByIdAsync(jobId);
        return job is null || job.UserId != _loginUserDetails.UserID
            ? NotFound(ErrorResponse<object>(404, "Import job not found."))
            : Ok(SuccessResponse(job));
    }
}
