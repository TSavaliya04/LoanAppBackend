using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services.Notifications.Handlers
{
    /// <summary>
    /// Handles QuoteStatusChanged events.
    /// Produces one notification per company-mate with human-readable old/new status labels.
    /// </summary>
    public class QuoteStatusChangedHandler : INotificationEventHandler
    {
        public NotificationType HandledType => NotificationType.QuoteStatusChanged;

        public Task<IEnumerable<NotificationDocument>> BuildNotificationsAsync(NotificationContext context)
        {
            var actorName    = $"{context.Actor.FirstName} {context.Actor.LastName}".Trim();
            var borrowerName = GetBorrowerName(context.Quote);
            var oldLabel     = StatusLabel(context.OldStatus);
            var newLabel     = StatusLabel(context.NewStatus);
            var quoteId      = context.Quote.Id.ToString();

            var notifications = context.CompanyMates.Select(recipient => new NotificationDocument
            {
                Id              = Guid.NewGuid(),
                UserId          = recipient.Id,
                Type            = NotificationType.QuoteStatusChanged,
                Title           = "Quote Status Changed",
                Message         = $"{actorName} changed a quote status from {oldLabel} to {newLabel} for {borrowerName}.",
                IsRead          = false,
                CreatedAt       = DateTime.UtcNow,
                RelatedEntityId = context.Quote.Id,
                Metadata        = new Dictionary<string, string>
                {
                    ["borrowerName"] = borrowerName,
                    ["actorName"]    = actorName,
                    ["oldStatus"]    = oldLabel,
                    ["newStatus"]    = newLabel,
                    ["quoteId"]      = quoteId
                }
            });

            return Task.FromResult<IEnumerable<NotificationDocument>>(notifications.ToList());
        }

        /// <summary>Maps ApplicationStatus int value to a human-readable display label.</summary>
        private static string StatusLabel(int? statusInt)
        {
            if (!statusInt.HasValue || !System.Enum.IsDefined(typeof(ApplicationStatus), statusInt.Value))
                return "Unknown";

            return (ApplicationStatus)statusInt.Value switch
            {
                ApplicationStatus.PreApproved  => "Pre-Approved",
                ApplicationStatus.InEscrow     => "In Escrow",
                ApplicationStatus.TBD          => "TBD",
                ApplicationStatus.ClosedEscrow => "Closed Escrow",
                _                              => "Unknown"
            };
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

