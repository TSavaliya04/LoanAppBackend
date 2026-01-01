using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface IAdminService
    {
        Task<DailyActiveUsersDTO> GetDailyActiveUsers(DateTime date);
        Task<DailyActiveUsersRangeDTO> GetDailyActiveUsersRange(DateTime startDate, DateTime endDate);
        Task<CurrentActiveUsersDTO> GetCurrentActiveUsers();
        Task<List<UserDTO>> GetUsers(List<Guid> userIds);
    }
}
