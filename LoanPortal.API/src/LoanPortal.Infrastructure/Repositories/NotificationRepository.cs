using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using MongoDB.Driver;

namespace LoanPortal.Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly IMongoCollection<NotificationDocument> _collection;

        public NotificationRepository(MongoDbContext context)
        {
            _collection = context.Notifications;

            // Compound index for fast per-user paginated queries
            var indexKeys = Builders<NotificationDocument>.IndexKeys
                .Ascending(n => n.UserId)
                .Descending(n => n.CreatedAt);

            _collection.Indexes.CreateOneAsync(
                new CreateIndexModel<NotificationDocument>(
                    indexKeys,
                    new CreateIndexOptions { Background = true, Name = "idx_userId_createdAt" }
                )
            );
        }

        public async Task InsertAsync(NotificationDocument notification)
        {
            try
            {
                await _collection.InsertOneAsync(notification);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in NotificationRepository.InsertAsync -> {ex.Message}");
                throw;
            }
        }

        public async Task InsertManyAsync(IEnumerable<NotificationDocument> notifications)
        {
            try
            {
                var list = notifications.ToList();
                if (!list.Any()) return;
                await _collection.InsertManyAsync(list);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in NotificationRepository.InsertManyAsync -> {ex.Message}");
                throw;
            }
        }

        public async Task<List<NotificationDocument>> GetByUserIdAsync(Guid userId, int pageSize, int pageNumber)
        {
            try
            {
                var pageIndex = pageNumber < 1 ? 0 : pageNumber - 1;
                var skip      = pageIndex * pageSize;

                return await _collection
                    .Find(n => n.UserId == userId)
                    .SortByDescending(n => n.CreatedAt)
                    .Skip(skip)
                    .Limit(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in NotificationRepository.GetByUserIdAsync -> {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            try
            {
                var filter = Builders<NotificationDocument>.Filter.And(
                    Builders<NotificationDocument>.Filter.Eq(n => n.UserId, userId),
                    Builders<NotificationDocument>.Filter.Eq(n => n.IsRead, false)
                );
                return (int)await _collection.CountDocumentsAsync(filter);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in NotificationRepository.GetUnreadCountAsync -> {ex.Message}");
                throw;
            }
        }

        public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
        {
            try
            {
                // userId guard prevents one user marking another's notification as read
                var filter = Builders<NotificationDocument>.Filter.And(
                    Builders<NotificationDocument>.Filter.Eq(n => n.Id, notificationId),
                    Builders<NotificationDocument>.Filter.Eq(n => n.UserId, userId)
                );
                var update = Builders<NotificationDocument>.Update.Set(n => n.IsRead, true);
                await _collection.UpdateOneAsync(filter, update);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in NotificationRepository.MarkAsReadAsync -> {ex.Message}");
                throw;
            }
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            try
            {
                var filter = Builders<NotificationDocument>.Filter.And(
                    Builders<NotificationDocument>.Filter.Eq(n => n.UserId, userId),
                    Builders<NotificationDocument>.Filter.Eq(n => n.IsRead, false)
                );
                var update = Builders<NotificationDocument>.Update.Set(n => n.IsRead, true);
                await _collection.UpdateManyAsync(filter, update);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in NotificationRepository.MarkAllAsReadAsync -> {ex.Message}");
                throw;
            }
        }
    }
}

