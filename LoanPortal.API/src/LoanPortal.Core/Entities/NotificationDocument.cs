using LoanPortal.Shared.Enum;
using MongoDB.Bson.Serialization.Attributes;

namespace LoanPortal.Core.Entities
{
    [BsonIgnoreExtraElements]
    public class NotificationDocument
    {
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("userId")]
        public Guid UserId { get; set; }

        [BsonElement("type")]
        public NotificationType Type { get; set; }

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("message")]
        public string Message { get; set; } = string.Empty;

        [BsonElement("isRead")]
        public bool IsRead { get; set; } = false;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>The PreApprovalId for quote-related types; null for other types.</summary>
        [BsonElement("relatedEntityId")]
        public Guid? RelatedEntityId { get; set; }

        /// <summary>
        /// Flexible bag for type-specific context — no schema change needed when adding new types.
        /// e.g. { "borrowerName":"John", "oldStatus":"TBD", "newStatus":"Pre-Approved", "quoteId":"..." }
        /// </summary>
        [BsonElement("metadata")]
        public Dictionary<string, string> Metadata { get; set; } = new();
    }
}

