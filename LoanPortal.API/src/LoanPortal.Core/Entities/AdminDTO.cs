namespace LoanPortal.Core.Entities
{
    public class DailyActiveUsersDTO
    {
        public DateTime Date { get; set; }
        public int ActiveUsers { get; set; }
        public int UniqueLogins { get; set; }
        public List<string> TopActiveEmails { get; set; }
    }

    public class DailyActiveUsersRangeDTO
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalDays { get; set; }
        public List<DailyActiveUsersDTO> DailyStats { get; set; }
        public double AverageActiveUsers { get; set; }
    }

    public class CurrentActiveUsersDTO
    {
        public int ActiveUsers { get; set; }
        public DateTime Date { get; set; }
    }

    public class AdminDashboardDTO
    {
        public int TotalUser { get; set; }
        public int ActiveUser { get; set; }
        public int QuotesCreated { get; set; }
        public int PreApprovals { get; set; }
        public int FilesInEscrow { get; set; }
    }

    public class AgentDTO
    {
        public string AgentName { get; set; }
        public string Email { get; set; }
        public string Company { get; set; }
        public DateTime LastLogin { get; set; }
        public int QuotesThisWeek { get; set; }
        public string Status { get; set; }
    }
}
