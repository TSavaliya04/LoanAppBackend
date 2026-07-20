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
        public Guid? TeamId { get; set; }
        public string? TeamName { get; set; }
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
        public Guid? TeamId { get; set; }
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
        public Guid? TeamId { get; set; }
        public string? TeamName { get; set; }
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

    // ─── Leaderboard DTOs ────────────────────────────────────────────────────

    public class LoanOfficerRankDTO
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public decimal LoanAmountFunded { get; set; }      // ClosedEscrow total for the period
        public decimal PercentOfOfficeTotal { get; set; }  // % share of office total
        public int LoansFunded { get; set; }               // count of ClosedEscrow loans
        public int Rank { get; set; }
    }

    public class DailyFundedAmountDTO
    {
        public DateTime Date { get; set; }
        public decimal DailyAmount { get; set; }           // that single day's funded total
        public decimal CumulativeAmount { get; set; }      // running total up to this day (for area chart)
    }

    public class CompanyLeaderboardDTO
    {
        // Summary stats
        public decimal TotalLoanAmountFunded { get; set; }
        public decimal MonthlyGoal { get; set; }
        public decimal GoalProgressPercent { get; set; }
        public decimal ProjectedMonthEndAmount { get; set; }
        public decimal AmountToGo { get; set; }

        // Daily trend data for chart (one entry per calendar day in the range)
        public List<DailyFundedAmountDTO> DailyTrend { get; set; }

        // MISMO files count (unique per scenario, ClosedEscrow only)
        public int MismoFilesGenerated { get; set; }

        // Average loan amount across closed loans
        public decimal AverageLoanAmount { get; set; }

        // Leaderboard table — sorted by LoanAmountFunded descending
        public List<LoanOfficerRankDTO> TopLoanOfficers { get; set; }

        // Period metadata
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime DataAsOf { get; set; }
    }
}
