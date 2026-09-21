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
            var borrowerName = GetBorrowerName(context.Quote);
            var quoteId      = context.Quote.Id.ToString();

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
                Metadata        = new Dictionary<string, string>
                {
                    ["borrowerName"] = borrowerName,
                    ["actorName"]    = actorName,
                    ["quoteId"]      = quoteId
                }
            });

            return Task.FromResult<IEnumerable<NotificationDocument>>(notifications.ToList());
        }

        private static string GetBorrowerName(PreApprovalDocument quote)
        {
            var first = quote.Scenarios?.FirstOrDefault();
            return first?.Purchase?.BorrowerInfo?.BorrowerName
                ?? first?.Refinance?.BorrowerInfo?.BorrowerName
                ?? "Unknown Borrower";
        }
    }
}

