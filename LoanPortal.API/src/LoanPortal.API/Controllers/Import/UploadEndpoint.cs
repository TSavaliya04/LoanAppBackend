using Ardalis.ApiEndpoints;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Import;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class UploadEndpoint : EndpointBase
{
    private readonly IXmlImportService _importService;
    private readonly ILoginUserDetails _loginUserDetails;
    public UploadEndpoint(IXmlImportService importService, ILoginUserDetails loginUserDetails) => (_importService, _loginUserDetails) = (importService, loginUserDetails);

    [HttpPost("import/upload")]
    // [RequestSizeLimit(55_000_000)]
    // [RequestFormLimits(MultipartBodyLengthLimit = 55_000_000)]
    // [Consumes("multipart/form-data")]
    public async Task<IActionResult> Handle([FromForm] List<IFormFile> files, CancellationToken cancellationToken)
    {
        var validationError = FileValidator.Validate(files);
        if (validationError is not null)
            return BadRequest(ErrorResponse<object>(400, validationError));
        if (_loginUserDetails.UserID == Guid.Empty)
            return Unauthorized(ErrorResponse<object>(401, "Authenticated user details are unavailable."));

        var jobId = await _importService.StartJobAsync(files, _loginUserDetails.UserID, cancellationToken);
        return Accepted(SuccessResponse(new { jobId }, 202, "Import job started."));
    }
}
