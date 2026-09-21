using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Repositories
{
    public interface INotificationRepository
    {
        Task InsertAsync(NotificationDocument notification);
        Task InsertManyAsync(IEnumerable<NotificationDocument> notifications);
        Task<List<NotificationDocument>> GetByUserIdAsync(Guid userId, int pageSize, int pageNumber);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task MarkAsReadAsync(Guid notificationId, Guid userId);
        Task MarkAllAsReadAsync(Guid userId);
    }
}

