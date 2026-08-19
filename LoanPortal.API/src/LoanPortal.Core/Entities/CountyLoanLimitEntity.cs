using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace LoanPortal.Core.Entities
{
    [BsonIgnoreExtraElements]
    public class CountyLoanLimitEntity
    {
        // Guid in C# maps natively to a UUID (BinData) in MongoDB.
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("county")]
        public string County { get; set; }

        [BsonElement("single")]
        public decimal Single { get; set; }

        [BsonElement("duplex")]
        public decimal Duplex { get; set; }

        [BsonElement("triPlex")]
        public decimal TriPlex { get; set; }

        [BsonElement("fourPlex")]
        public decimal FourPlex { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }
}
