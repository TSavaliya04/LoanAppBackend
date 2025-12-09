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
}
