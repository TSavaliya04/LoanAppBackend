using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface IAdminService
    {
        Task<AdminDashboardDTO> GetAdminDashboard(DateTime startDate, DateTime endDate);
        Task<PagedAgentsDTO> GetUsers(DefaultRequest request);
        Task<PagedRecentQuotesDTO> GetRecentQuotes(RecentQuoteRequest request);
        Task<QuotesOverviewDTO> GetQuotesOverview(DateTime startDate, DateTime endDate, Guid userId);
    }
}
