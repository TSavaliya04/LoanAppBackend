namespace LoanPortal.Core.Entities
{
    public class AdminDashboardDTO
    {
        public int TotalUser { get; set; }
        public int ActiveUser { get; set; }
        public int NewUsers { get; set; }
        public int QuotesCreated { get; set; }
        public int PreApprovals { get; set; }
        public int FilesInEscrow { get; set; }
    }

    public class AgentDTO
    {

        public Guid AgentId { get; set; }
        public string AgentName { get; set; }
        public string Email { get; set; }
        public Guid? CompanyId { get; set; }
        public string Company { get; set; }
        public DateTime? LastLogin { get; set; }
        public int QuotesThisWeek { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class DefaultRequestWrapper
    {
        public DefaultRequest Params { get; set; }
    }

    public class DefaultRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchText { get; set; }
        public string? SortBy { get; set; }
        public string? SortByDirection { get; set; } = "asc";
        public Guid? CompanyId { get; set; }
        public string? FilterBy { get; set; }
    }

    public class GetUsersRequest : DefaultRequest
    {
        public Shared.Enum.UserStatus? Status { get; set; } 
        public DateTime? LastLoginFrom { get; set; }
        public DateTime? LastLoginTo { get; set; }
        public int? QuotesThisWeekMin { get; set; }
        public int? QuotesThisWeekMax { get; set; }
        public DateTime? CreatedAtFrom { get; set; }
        public DateTime? CreatedAtTo { get; set; }
    }

    public class GetUsersRequestWrapper
    {
        public GetUsersRequest Params { get; set; }
    }


    public class PagedAgentsDTO
    {
        public List<AgentDTO> Users { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class CompanyAdminDTO
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public Guid? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public Shared.Enum.UserRole Role { get; set; }
    }

    public class PagedUserDTO
    {
        public List<CompanyAdminDTO> Users { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class RecentQuoteRequest
    {
        public DefaultRequest Params { get; set; }
        public Guid UserId { get; set; }
    }

    public class RecentQuoteDTO
    {
        public Guid UserId { get; set; }
        public DateTime Date { get; set; }
        public string? ClientName { get; set; }
        public decimal LoanAmount { get; set; }
        public string? LoanType { get; set; }
        public string? Stage { get; set; }
    }

    public class PagedRecentQuotesDTO
    {
        public List<RecentQuoteDTO> Quotes { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class DailyQuoteCountDTO
    {
        public DateTime Date { get; set; }
        public int QuoteCount { get; set; }
    }

    public class QuotesOverviewDTO
    {
        public Guid UserId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalQuotes { get; set; }
        public List<DailyQuoteCountDTO> DailyQuoteCounts { get; set; }
    }
}
