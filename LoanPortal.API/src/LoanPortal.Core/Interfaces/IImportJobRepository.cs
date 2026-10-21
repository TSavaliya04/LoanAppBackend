using LoanPortal.Core.Entities;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Interfaces;

public interface IImportJobRepository
{
    Task InsertAsync(ImportJobDocument job);
    Task<ImportJobDocument?> GetByIdAsync(Guid jobId);
    Task<List<ImportJobDocument>> GetByUserIdAsync(Guid userId, int page, int pageSize);
    Task UpdateFileStatusAsync(Guid jobId, Guid fileId, FileImportStatus status,
        Guid? preApprovalId = null, string? errorReason = null, DateTime? processedAt = null);
    Task UpdateJobStatusAsync(Guid jobId, ImportJobStatus status);
    Task<bool> TryCompleteJobAsync(Guid jobId, ImportJobStatus status);
    Task<List<ImportJobDocument>> GetIncompleteJobsAsync();
    Task MarkStaleJobsAsync(DateTime olderThan);
}
