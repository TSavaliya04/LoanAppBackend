using LoanPortal.Core.Entities;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Interfaces
{
    /// <summary>
    /// Strategy interface for building notification documents for a specific notification type.
    /// One implementation per NotificationType — handlers are auto-discovered via DI.
    /// To add a new notification type: create a new class, register it in DI. Nothing else changes.
    /// </summary>
    public interface INotificationEventHandler
    {
        /// <summary>The notification type this handler is responsible for.</summary>
        NotificationType HandledType { get; }

        /// <summary>
        /// Builds the list of NotificationDocuments to persist and push.
        /// Handlers are pure logic — no DB access, no side effects.
        /// </summary>
        Task<IEnumerable<NotificationDocument>> BuildNotificationsAsync(NotificationContext context);
    }
}

