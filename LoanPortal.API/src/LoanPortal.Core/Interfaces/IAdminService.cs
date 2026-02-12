using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface IAdminService
    {
        Task<DailyActiveUsersDTO> GetDailyActiveUsers(DateTime date);
        Task<DailyActiveUsersRangeDTO> GetDailyActiveUsersRange(DateTime startDate, DateTime endDate);
        Task<CurrentActiveUsersDTO> GetCurrentActiveUsers();
        Task<AdminDashboardDTO> GetAdminDashboard(DateTime startDate, DateTime endDate);
        Task<PagedAgentsDTO> GetUsers(AgentListRequest request);
    }
}
