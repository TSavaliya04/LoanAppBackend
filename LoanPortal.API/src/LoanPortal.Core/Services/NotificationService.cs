using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IEnumerable<INotificationEventHandler> _handlers;
        private readonly INotificationRepository _notificationRepo;
        private readonly IUserRepository _userRepo;
        private readonly ICompanyRepository _companyRepo;
        private readonly IFcmService _fcmService;

        public NotificationService(
            IEnumerable<INotificationEventHandler> handlers,
            INotificationRepository notificationRepo,
            IUserRepository userRepo,
            ICompanyRepository companyRepo,
            IFcmService fcmService)
        {
            _handlers         = handlers;
            _notificationRepo = notificationRepo;
            _userRepo         = userRepo;
            _companyRepo      = companyRepo;
            _fcmService       = fcmService;
        }

        // ── Event triggers ──────────────────────────────────────────────────

        public async Task NotifyQuoteCreatedAsync(PreApprovalDocument quote, UserEntity creator)
        {
            try
            {
                // Creator notification — no company-mates needed
                var context = new NotificationContext
                {
                    Type         = NotificationType.QuoteCreated,
                    Quote        = quote,
                    Actor        = creator,
                    CompanyMates = new List<UserEntity>()
                };
                await DispatchAsync(context);
            }
            catch (Exception ex)
            {
                // Notification failure must never break the quote operation
                Console.WriteLine($"[NotificationService] NotifyQuoteCreatedAsync failed: {ex.Message}");
            }
        }

        public async Task NotifyQuoteUpdatedAsync(PreApprovalDocument quote, UserEntity actor)
        {
            try
            {
                var companyMates = await GetValidCompanyMatesAsync(actor);
                var context = new NotificationContext
                {
                    Type         = NotificationType.QuoteUpdated,
                    Quote        = quote,
                    Actor        = actor,
                    CompanyMates = companyMates
                };
                await DispatchAsync(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NotificationService] NotifyQuoteUpdatedAsync failed: {ex.Message}");
            }
        }

        public async Task NotifyQuoteStatusChangedAsync(
            PreApprovalDocument quote, UserEntity actor, int oldStatus, int newStatus)
        {
            try
            {
                var companyMates = await GetValidCompanyMatesAsync(actor);
                var context = new NotificationContext
                {
                    Type         = NotificationType.QuoteStatusChanged,
                    Quote        = quote,
                    Actor        = actor,
                    CompanyMates = companyMates,
                    OldStatus    = oldStatus,
                    NewStatus    = newStatus
                };
                await DispatchAsync(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NotificationService] NotifyQuoteStatusChangedAsync failed: {ex.Message}");
            }
        }

        // ── Read / management ───────────────────────────────────────────────

        public Task<List<NotificationDocument>> GetNotificationsAsync(Guid userId, int pageSize, int pageNumber)
            => _notificationRepo.GetByUserIdAsync(userId, pageSize, pageNumber);

        public Task<int> GetUnreadCountAsync(Guid userId)
            => _notificationRepo.GetUnreadCountAsync(userId);

        public Task MarkAsReadAsync(Guid notificationId, Guid userId)
            => _notificationRepo.MarkAsReadAsync(notificationId, userId);

        public Task MarkAllAsReadAsync(Guid userId)
            => _notificationRepo.MarkAllAsReadAsync(userId);

        // ── Private helpers ─────────────────────────────────────────────────

        /// <summary>
        /// Routes the context to the correct handler, persists the resulting notifications,
        /// and fires FCM push to each recipient that has a registered token.
        /// </summary>
        private async Task DispatchAsync(NotificationContext context)
        {
            var handler = _handlers.FirstOrDefault(h => h.HandledType == context.Type);
            if (handler == null)
            {
                Console.WriteLine($"[NotificationService] No handler registered for {context.Type}");
                return;
            }

            var notifications = (await handler.BuildNotificationsAsync(context)).ToList();
            if (!notifications.Any()) return;

            // Persist all to MongoDB
            await _notificationRepo.InsertManyAsync(notifications);

            // Determine push recipients and their tokens
            // For QuoteCreated: actor is the only recipient; for others: company-mates
            var pushRecipients = context.Type == NotificationType.QuoteCreated
                ? new List<UserEntity> { context.Actor }
                : context.CompanyMates;

            var fcmTokens = pushRecipients
                .Where(u => !string.IsNullOrWhiteSpace(u.FcmToken))
                .Select(u => u.FcmToken!)
                .ToList();

            if (fcmTokens.Any())
            {
                var title   = notifications.First().Title;
                var message = notifications.First().Message;
                var data    = notifications.First().Metadata;
                await _fcmService.SendMulticastAsync(fcmTokens, title, message, data);
            }
        }

        /// <summary>
        /// Fetches and filters company-mates for the given actor:
        ///   - Actor must have a non-null CompanyId
        ///   - Company name must not be null or "N/A"
        ///   - The actor themselves is excluded from the result
        /// </summary>
        private async Task<List<UserEntity>> GetValidCompanyMatesAsync(UserEntity actor)
        {
            if (actor.CompanyId == null)
                return new List<UserEntity>();

            var company = await _companyRepo.GetCompanyByIdAsync(actor.CompanyId.Value);
            if (company == null ||
                string.IsNullOrWhiteSpace(company.Name) ||
                company.Name.Trim().Equals("N/A", StringComparison.OrdinalIgnoreCase))
            {
                return new List<UserEntity>();
            }

            var allCompanyUsers = await _userRepo.GetUsersByCompanyIdAsync(actor.CompanyId.Value);

            return allCompanyUsers
                .Where(u => u.Id != actor.Id)
                .ToList();
        }
    }
}

