using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface INotificationService
    {
        // ── Event triggers (called by PreApprovalService) ──────────────────

        /// <summary>Notifies the creator when they create a new quote.</summary>
        Task NotifyQuoteCreatedAsync(PreApprovalDocument quote, UserEntity creator, bool sendPush = true);

        /// <summary>Notifies all valid company-mates (excluding actor) when a quote is updated.</summary>
        Task NotifyQuoteUpdatedAsync(PreApprovalDocument quote, UserEntity actor, bool sendPush = true);

        /// <summary>Notifies all valid company-mates (excluding actor) when a quote's status changes.</summary>
        Task NotifyQuoteStatusChangedAsync(PreApprovalDocument quote, UserEntity actor, int oldStatus, int newStatus, bool sendPush = true);

        /// <summary>Notifies the LO when a borrower submits their employment history.</summary>
        Task NotifyEmploymentSubmittedAsync(Guid quoteId, BorrowerEmploymentDetails draft, UserEntity loanOfficer, bool sendPush = true);

        /// <summary>Notifies the LO when a borrower is created using their link.</summary>
        Task NotifyBorrowerCreatedViaLinkAsync(UserEntity borrower, UserEntity loanOfficer, bool sendPush = true);

        // ── Read / management (called by NotificationsController) ──────────

        Task<List<NotificationDocument>> GetNotificationsAsync(Guid userId, int pageSize, int pageNumber, bool? isRead = null);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task MarkAsReadAsync(Guid notificationId, Guid userId);
        Task MarkAllAsReadAsync(Guid userId);
    }
}

