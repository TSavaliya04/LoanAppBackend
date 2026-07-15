using MongoDB.Bson.Serialization.Attributes;

namespace LoanPortal.Core.Entities
{
    [BsonIgnoreExtraElements]
    public class TeamEntity
    {
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("description")]
        public string? Description { get; set; }

        [BsonElement("companyId")]
        public Guid CompanyId { get; set; }

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [BsonElement("createdBy")]
        public Guid CreatedBy { get; set; }
    }

    public class TeamDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public Guid CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public int MemberCount { get; set; }
    }

    public class CreateTeamRequest
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        // CompanyId is resolved from the logged-in CompanyAdmin's token; not accepted from request body.
    }

    public class UpdateTeamRequest
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AssignUserToTeamRequest
    {
        public Guid UserId { get; set; }
        public Guid TeamId { get; set; }
    }

    public class PagedTeamsDTO
    {
        public List<TeamDTO> Teams { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class TeamMembersDTO
    {
        public TeamDTO Team { get; set; }
        public List<AgentDTO> Members { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
