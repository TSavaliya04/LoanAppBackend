using Microsoft.AspNetCore.Http;

namespace LoanPortal.Core.Interfaces;

public interface IXmlImportService
{
    Task<Guid> StartJobAsync(List<IFormFile> files, Guid userId, CancellationToken cancellationToken = default);
}
