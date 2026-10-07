using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services.Notifications.Handlers
{
    public class BorrowerCreatedViaLinkHandler : INotificationEventHandler
    {
        public NotificationType HandledType => NotificationType.BorrowerCreatedViaLink;

        public Task<IEnumerable<NotificationDocument>> BuildNotificationsAsync(NotificationContext context)
        {
            if (context.CreatedBorrower == null || context.Actor == null)
            {
                return Task.FromResult<IEnumerable<NotificationDocument>>(Array.Empty<NotificationDocument>());
            }

            var borrower = context.CreatedBorrower;
            var lo = context.Actor;
            
            var borrowerName = $"{borrower.FirstName} {borrower.LastName}".Trim();
            var loName = $"{lo.FirstName} {lo.LastName}".Trim();
            
            var metadata = new Dictionary<string, string>
            {
                ["borrowerName"] = string.IsNullOrEmpty(borrowerName) ? "A new borrower" : borrowerName,
                ["loanOfficerName"] = string.IsNullOrEmpty(loName) ? "Unknown LO" : loName
            };

            var notification = new NotificationDocument
            {
                Id              = Guid.NewGuid(),
                UserId          = lo.Id,
                Type            = NotificationType.BorrowerCreatedViaLink,
                Title           = "New Borrower Signed Up",
                Message         = $"{metadata["borrowerName"]} has just signed up using your portal link.",
                IsRead          = false,
                CreatedAt       = DateTime.UtcNow,
                RelatedEntityId = borrower.Id,
                Metadata        = metadata
            };

            return Task.FromResult<IEnumerable<NotificationDocument>>(new[] { notification });
        }
    }
}
