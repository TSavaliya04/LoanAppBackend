using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface INotificationService
    {
        // ── Event triggers (called by PreApprovalService) ──────────────────

        /// <summary>Notifies the creator when they create a new quote.</summary>
        Task NotifyQuoteCreatedAsync(PreApprovalDocument quote, UserEntity creator);

        /// <summary>Notifies all valid company-mates (excluding actor) when a quote is updated.</summary>
        Task NotifyQuoteUpdatedAsync(PreApprovalDocument quote, UserEntity actor);

        /// <summary>Notifies all valid company-mates (excluding actor) when a quote's status changes.</summary>
        Task NotifyQuoteStatusChangedAsync(PreApprovalDocument quote, UserEntity actor, int oldStatus, int newStatus);

        // ── Read / management (called by NotificationsController) ──────────

        Task<List<NotificationDocument>> GetNotificationsAsync(Guid userId, int pageSize, int pageNumber);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task MarkAsReadAsync(Guid notificationId, Guid userId);
        Task MarkAllAsReadAsync(Guid userId);
    }
}

