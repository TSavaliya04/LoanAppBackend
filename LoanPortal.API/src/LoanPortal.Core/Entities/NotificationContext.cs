using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Entities
{
    /// <summary>
    /// Data carrier assembled once by NotificationService and passed into each INotificationEventHandler.
    /// Handlers are pure logic — they never touch the DB or other services directly.
    /// </summary>
    public class NotificationContext
    {
        public NotificationType Type { get; init; }

        /// <summary>The quote that triggered the event.</summary>
        public PreApprovalDocument Quote { get; init; } = null!;

        /// <summary>The user who performed the action.</summary>
        public UserEntity Actor { get; init; } = null!;

        /// <summary>
        /// Pre-filtered list of users who share the actor's company.
        /// Rules applied by NotificationService before building this list:
        ///   - CompanyId must not be null
        ///   - Company name must not be null or "N/A"
        ///   - The actor themselves is excluded
        /// </summary>
        public List<UserEntity> CompanyMates { get; init; } = new();

        /// <summary>For QuoteStatusChanged: the previous ApplicationStatus int value.</summary>
        public int? OldStatus { get; init; }

        /// <summary>For QuoteStatusChanged: the new ApplicationStatus int value.</summary>
        public int? NewStatus { get; init; }
    }
}

