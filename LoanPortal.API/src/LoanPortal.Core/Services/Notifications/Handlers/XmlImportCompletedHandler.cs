using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Constants;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services.Notifications.Handlers;

/// <summary>Creates one user-facing notification per completed XML import job.</summary>
public class XmlImportCompletedHandler : INotificationEventHandler
{
    public NotificationType HandledType => NotificationType.XmlImportCompleted;

    public Task<IEnumerable<NotificationDocument>> BuildNotificationsAsync(NotificationContext context)
    {
        if (context.ImportJob is null || context.Actor is null)
            return Task.FromResult<IEnumerable<NotificationDocument>>(Array.Empty<NotificationDocument>());

        var job = context.ImportJob;
        var successful = job.Files.Count(file => file.Status == FileImportStatus.Success);
        var notification = new NotificationDocument
        {
            Id = Guid.NewGuid(),
            UserId = context.Actor.Id,
            Type = NotificationType.XmlImportCompleted,
            Title = ImportConstants.FcmImportCompleteTitle,
            Message = string.Format(ImportConstants.FcmImportCompleteBodyTemplate, successful, job.Files.Count),
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            Metadata = new Dictionary<string, string>
            {
                ["jobId"] = job.Id.ToString(),
                ["navigate"] = $"/import/jobs/{job.Id}",
                ["successful"] = successful.ToString(),
                ["total"] = job.Files.Count.ToString()
            }
        };

        return Task.FromResult<IEnumerable<NotificationDocument>>(new[] { notification });
    }
}
