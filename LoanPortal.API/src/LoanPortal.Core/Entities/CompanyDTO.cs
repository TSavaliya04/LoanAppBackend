using MongoDB.Bson.Serialization.Attributes;
using System;

namespace LoanPortal.Core.Entities
{
    public class CompanyDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Address { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal? MonthlyGoal { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class CompanyEntity
    {
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("address")]
        public string? Address { get; set; }

        [BsonElement("contactEmail")]
        public string? ContactEmail { get; set; }

        [BsonElement("contactPhone")]
        public string? ContactPhone { get; set; }

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [BsonElement("monthlyGoal")]
        public decimal? MonthlyGoal { get; set; }
    }

    public class CreateCompanyRequest
    {
        public string Name { get; set; }
        public string? Address { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
    }

    public class PagedCompaniesDTO
    {
        public List<CompanyDTO> Companies { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class UpdateCompanyRequest
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool? IsActive { get; set; }
        public decimal? MonthlyGoal { get; set; }
    }
}
