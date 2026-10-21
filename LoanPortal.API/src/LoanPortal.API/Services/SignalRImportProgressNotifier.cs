using LoanPortal.API.Hubs;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;
using Microsoft.AspNetCore.SignalR;

namespace LoanPortal.API.Services;

public class SignalRImportProgressNotifier : IImportProgressNotifier
{
    private readonly IHubContext<ImportProgressHub> _hub;
    public SignalRImportProgressNotifier(IHubContext<ImportProgressHub> hub) => _hub = hub;

    public Task BroadcastProgressAsync(ImportJobDocument job, CancellationToken cancellationToken = default)
    {
        var terminalStatuses = new[] { FileImportStatus.Success, FileImportStatus.Failed };
        var payload = new
        {
            jobId = job.Id,
            total = job.Files.Count,
            processed = job.Files.Count(file => terminalStatuses.Contains(file.Status)),
            pending = job.Files.Count(file => !terminalStatuses.Contains(file.Status)),
            successful = job.Files.Count(file => file.Status == FileImportStatus.Success),
            failed = job.Files.Count(file => file.Status == FileImportStatus.Failed),
            jobStatus = job.Status.ToString(),
            files = job.Files.Select(file => new { fileId = file.FileId, fileName = file.FileName, status = file.Status.ToString(), preApprovalId = file.PreApprovalId, errorReason = file.ErrorReason, processedAt = file.ProcessedAt })
        };
        return _hub.Clients.Group(ImportProgressHub.GroupName(job.Id)).SendAsync("progressUpdate", payload, cancellationToken);
    }
}
