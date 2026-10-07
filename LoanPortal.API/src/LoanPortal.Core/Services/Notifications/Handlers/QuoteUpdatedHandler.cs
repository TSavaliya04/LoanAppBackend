using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services.Notifications.Handlers
{
    /// <summary>
    /// Handles QuoteUpdated events.
    /// Produces one notification per company-mate (actor excluded by NotificationService).
    /// </summary>
    public class QuoteUpdatedHandler : INotificationEventHandler
    {
        public NotificationType HandledType => NotificationType.QuoteUpdated;

        public Task<IEnumerable<NotificationDocument>> BuildNotificationsAsync(NotificationContext context)
        {
            var actorName    = $"{context.Actor.FirstName} {context.Actor.LastName}".Trim();
            var metadata     = NotificationMetadataHelper.BuildMetadata(context.Quote, actorName);
            var borrowerName = NotificationMetadataHelper.GetBorrowerName(context.Quote);

            var notifications = context.CompanyMates.Select(recipient => new NotificationDocument
            {
                Id              = Guid.NewGuid(),
                UserId          = recipient.Id,
                Type            = NotificationType.QuoteUpdated,
                Title           = "Quote Updated",
                Message         = $"{actorName} updated a quote for {borrowerName}.",
                IsRead          = false,
                CreatedAt       = DateTime.UtcNow,
                RelatedEntityId = context.Quote.Id,
                Metadata        = metadata
            });

            return Task.FromResult<IEnumerable<NotificationDocument>>(notifications.ToList());
        }
    }
}

