using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services.Notifications.Handlers
{
    /// <summary>
    /// Handles QuoteCreated events.
    /// Produces one notification for the creator only.
    /// </summary>
    public class QuoteCreatedHandler : INotificationEventHandler
    {
        public NotificationType HandledType => NotificationType.QuoteCreated;

        public Task<IEnumerable<NotificationDocument>> BuildNotificationsAsync(NotificationContext context)
        {
            var metadata     = NotificationMetadataHelper.BuildMetadata(context.Quote);
            var borrowerName = NotificationMetadataHelper.GetBorrowerName(context.Quote);

            var notification = new NotificationDocument
            {
                Id              = Guid.NewGuid(),
                UserId          = context.Actor.Id,
                Type            = NotificationType.QuoteCreated,
                Title           = "New Quote Created",
                Message         = $"You created a new quote for {borrowerName}.",
                IsRead          = false,
                CreatedAt       = DateTime.UtcNow,
                RelatedEntityId = context.Quote.Id,
                Metadata        = metadata
            };

            return Task.FromResult<IEnumerable<NotificationDocument>>(new[] { notification });
        }
    }
}

