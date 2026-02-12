using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Constants;
using LoanPortal.Shared.Enum;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LoanPortal.Core.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPreApprovalRepository _preApprovalRepository;

        public AdminService(IUserRepository userRepository, IPreApprovalRepository preApprovalRepository)
        {
            _userRepository = userRepository;
            _preApprovalRepository = preApprovalRepository;
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

        public async Task<PagedAgentsDTO> GetUsers(AgentListRequest request)
        {
            var users = await _userRepository.GetAll();
            users.Remove(users.Find(u => u.Id == IConstants.AdminId));

            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            var thisWeekPreApprovals = await _preApprovalRepository.GetByDateRangeAdmin(startOfWeek, endOfWeek);
            var preApprovalsByUser = thisWeekPreApprovals
                .GroupBy(p => p.UserId)
                .ToDictionary(g => g.Key, g => g.Count());

            List<AgentDTO> agents = new List<AgentDTO>();

            foreach (UserEntity user in users)
            {
                preApprovalsByUser.TryGetValue(user.Id, out var quotesThisWeek);

                agents.Add(new AgentDTO
                {
                    AgentName = user.FirstName + " " + user.LastName,
                    Company = user.CompanyName,
                    Email = user.Email,
                    LastLogin = user.LastLoginDate ?? DateTime.UtcNow,
                    Status = user.IsActive ? "Active" : "InActive",
                    QuotesThisWeek = quotesThisWeek
                });
            }

            // Apply search
            IEnumerable<AgentDTO> query = agents;
            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var search = request.SearchText.Trim().ToLower();
                query = query.Where(a =>
                    (!string.IsNullOrEmpty(a.AgentName) && a.AgentName.ToLower().Contains(search)) ||
                    (!string.IsNullOrEmpty(a.Email) && a.Email.ToLower().Contains(search)) ||
                    (!string.IsNullOrEmpty(a.Company) && a.Company.ToLower().Contains(search)));
            }

            // Apply sorting
            bool desc = string.Equals(request.SortByDirection, "desc", StringComparison.OrdinalIgnoreCase);
            switch (request.SortBy?.ToLower())
            {
                case "email":
                    query = desc ? query.OrderByDescending(a => a.Email) : query.OrderBy(a => a.Email);
                    break;
                case "company":
                    query = desc ? query.OrderByDescending(a => a.Company) : query.OrderBy(a => a.Company);
                    break;
                case "lastlogin":
                    query = desc ? query.OrderByDescending(a => a.LastLogin) : query.OrderBy(a => a.LastLogin);
                    break;
                case "quotesthisweek":
                    query = desc ? query.OrderByDescending(a => a.QuotesThisWeek) : query.OrderBy(a => a.QuotesThisWeek);
                    break;
                case "status":
                    query = desc ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status);
                    break;
                default:
                    query = desc ? query.OrderByDescending(a => a.AgentName) : query.OrderBy(a => a.AgentName);
                    break;
            }

            var totalCount = query.Count();

            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var items = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedAgentsDTO
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<AdminDashboardDTO> GetAdminDashboard(DateTime startDate, DateTime endDate)
        {
            if (startDate == DateTime.MinValue || endDate == DateTime.MinValue)
            {
                startDate = DateTime.UtcNow.Date;
                endDate = startDate.AddDays(1);
            }

            List<PreApprovalDocument> quotes = await _preApprovalRepository.GetByDateRangeAdmin(startDate, endDate);
            List<PreApprovalDocument> quotesStatus = await _preApprovalRepository.GetByStatusChangeDateRange(startDate, endDate);
            return new AdminDashboardDTO
            {
                TotalUser = (await _userRepository.GetAll()).Count,
                ActiveUser = (await _userRepository.GetUsersActiveInRange(startDate,endDate)).Count,
                QuotesCreated = quotes.Count(),
                PreApprovals = quotesStatus.Where(q => q.Status == (int)ApplicationStatus.PreApproved).Count(),
                FilesInEscrow = quotesStatus.Where(q => q.Status == (int)ApplicationStatus.InEscrow).Count(),
            };
        }
    }
}
