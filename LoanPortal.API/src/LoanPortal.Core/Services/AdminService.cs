using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;

namespace LoanPortal.Core.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;

        public AdminService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<DailyActiveUsersDTO> GetDailyActiveUsers(DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            var users = await _userRepository.GetUsersActiveInRange(startOfDay, endOfDay);

            return new DailyActiveUsersDTO
            {
                Date = date.Date,
                ActiveUsers = users.Count,
                UniqueLogins = users.Count,
                TopActiveEmails = users
                    .OrderByDescending(u => u.LastLoginDate)
                    .Take(5)
                    .Select(u => u.Email)
                    .ToList()
            };
        }

        public async Task<DailyActiveUsersRangeDTO> GetDailyActiveUsersRange(DateTime startDate, DateTime endDate)
        {
            var days = (endDate.Date - startDate.Date).Days + 1;
            var dailyStats = new List<DailyActiveUsersDTO>();

            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var dayStats = await GetDailyActiveUsers(date);
                dailyStats.Add(dayStats);
            }

            return new DailyActiveUsersRangeDTO
            {
                StartDate = startDate.Date,
                EndDate = endDate.Date,
                TotalDays = days,
                DailyStats = dailyStats,
                AverageActiveUsers = dailyStats.Any() ? dailyStats.Average(d => d.ActiveUsers) : 0
            };
        }

        public async Task<CurrentActiveUsersDTO> GetCurrentActiveUsers()
        {
            var today = await GetDailyActiveUsers(DateTime.UtcNow);
            return new CurrentActiveUsersDTO
            {
                ActiveUsers = today.ActiveUsers,
                Date = DateTime.UtcNow.Date
            };
        }

        public async Task<List<UserDTO>> GetUsers(List<Guid> userIds)
        {
            if (userIds == null || userIds.Count == 0)
            {
                return new List<UserDTO>();
            }

            var users = await _userRepository.GetUsersByIds(userIds);
            return users.Select(user => UserHelper.MaptoUserDTO(user)).ToList();
        }
    }
}
