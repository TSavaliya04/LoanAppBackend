using Microsoft.AspNetCore.Http;
using MongoDB.Bson.Serialization.Attributes;

namespace LoanPortal.Core.Entities
{
    public class CreateUserRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Phone { get; set; }
    }

    public class UserDTO
    {
        public Guid? Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? JobTitle { get; set; }
        public string? Address { get; set; }
        public string? Profile { get; set; }
        public string? CompanyName { get; set; }
        public string? NMLS { get; set; }
        public DateTime? LastLoginDate { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class UserEntity
    {
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("firstName")]
        public string FirstName { get; set; }

        [BsonElement("lastName")]
        public string LastName { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("phone")]
        public string Phone { get; set; }

        [BsonElement("isActive")]
        public bool IsActive { get; set; }

        [BsonElement("firebaseId")]
        public string FirebaseId { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [BsonElement("address")]
        public string Address { get; set; }

        [BsonElement("profile")]
        public string Profile { get; set; }

        [BsonElement("jobTitle")]
        public string JobTitle { get; set; }

        [BsonElement("companyName")]
        public string CompanyName { get; set; }

        [BsonElement("nmls")]
        public string? NMLS { get; set; }

        [BsonElement("lastLoginDate")]
        public DateTime? LastLoginDate { get; set; }

        //[BsonElement("loginHistory")]
        //public List<DateTime> LoginHistory { get; set; } = new List<DateTime>();

        //[BsonElement("isAdmin")]
        //public bool IsAdmin { get; set; } = false;
    }

    public class UpdateProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? JobTitle { get; set; }
        public string? Address { get; set; }
        public IFormFile? Profile { get; set; }
        public string? CompanyName { get; set; }
        public string? NMLS { get; set; }
        public string? Phone { get; set; }
    }
}
