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

        public async Task<PagedAgentsDTO> GetUsers(DefaultRequest request)
        {
            try
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
                        AgentId = user.Id,
                        AgentName = user.FirstName + " " + user.LastName,
                        Company = user.CompanyName,
                        Email = user.Email,
                        LastLogin = user.LastLoginDate,
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
                    case "agentname":
                        query = desc ? query.OrderByDescending(a => a.AgentName) : query.OrderBy(a => a.AgentName);
                        break;
                    default:
                        query = query.OrderByDescending(a => a.LastLogin);
                        break;
                }

                var totalCount = query.Count();

                var pageNumber = request.PageNumber < 0 ? 0 : request.PageNumber;
                var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

                var items = query
                    .Skip(pageNumber * pageSize)
                    .Take(pageSize)
                    .ToList();

                return new PagedAgentsDTO
                {
                    Users = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                // TODO: add logging here if a logging framework is available
                throw new Exception("An error occurred while retrieving users.", ex);
            }
        }

        public async Task<PagedRecentQuotesDTO> GetRecentQuotes(RecentQuoteRequest request)
        {
            var quotes = await _preApprovalRepository.GetAllAsync(request.UserId);

            var recentQuotes = new List<RecentQuoteDTO>();

            foreach (var quote in quotes)
            {
                var latestScenario = quote.Scenarios?
                    .OrderByDescending(s => s.CreatedAt ?? DateTime.MinValue)
                    .FirstOrDefault();

                var borrowerInfo = latestScenario?.BorrowerInfo;
                var purchaseInfo = latestScenario?.PurchaseInfo;
                var loanProgram = latestScenario?.LoanProgram;

                var loanType = loanProgram != null
                    ? Enum.IsDefined(typeof(LoanProgram), loanProgram.LoanProgram)
                        ? ((LoanProgram)loanProgram.LoanProgram).ToString()
                        : string.Empty
                    : string.Empty;

                var stage = Enum.IsDefined(typeof(ApplicationStatus), quote.Status)
                    ? ((ApplicationStatus)quote.Status).ToString()
                    : string.Empty;

                recentQuotes.Add(new RecentQuoteDTO
                {
                    UserId = quote.UserId,
                    Date = quote.CreatedAt,
                    ClientName = borrowerInfo?.BorrowerName,
                    LoanAmount = purchaseInfo?.LoanAmount ?? 0,
                    LoanType = loanType,
                    Stage = stage
                });
            }

            IEnumerable<RecentQuoteDTO> query = recentQuotes;

            if (!string.IsNullOrWhiteSpace(request.Params.SearchText))
            {
                var search = request.Params.SearchText.Trim().ToLower();
                query = query.Where(q =>
                    (!string.IsNullOrEmpty(q.ClientName) && q.ClientName.ToLower().Contains(search)) ||
                    (!string.IsNullOrEmpty(q.LoanType) && q.LoanType.ToLower().Contains(search)) ||
                    (!string.IsNullOrEmpty(q.Stage) && q.Stage.ToLower().Contains(search)) ||
                    q.UserId.ToString().ToLower().Contains(search));
            }

            bool desc = string.Equals(request.Params.SortByDirection, "desc", StringComparison.OrdinalIgnoreCase);
            switch (request.Params.SortBy?.ToLower())
            {
                case "clientname":
                    query = desc ? query.OrderByDescending(q => q.ClientName) : query.OrderBy(q => q.ClientName);
                    break;
                case "loanamount":
                    query = desc ? query.OrderByDescending(q => q.LoanAmount) : query.OrderBy(q => q.LoanAmount);
                    break;
                case "loantype":
                    query = desc ? query.OrderByDescending(q => q.LoanType) : query.OrderBy(q => q.LoanType);
                    break;
                case "stage":
                    query = desc ? query.OrderByDescending(q => q.Stage) : query.OrderBy(q => q.Stage);
                    break;
                case "date":
                default:
                    query = desc ? query.OrderByDescending(q => q.Date) : query.OrderBy(q => q.Date);
                    break;
            }

            var total = query.Count();

            var pageNumber = request.Params.PageNumber < 0 ? 0 : request.Params.PageNumber;
            var pageSize = request.Params.PageSize <= 0 ? 10 : request.Params.PageSize;

            var items = query
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedRecentQuotesDTO
            {
                Quotes = items,
                TotalCount = total,
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
            List<UserEntity> activeUsers = await _userRepository.GetUsersActiveInRange(startDate, endDate);
            activeUsers.Remove(activeUsers.Find(u => u.Id == IConstants.AdminId));
            return new AdminDashboardDTO
            {
                TotalUser = (await _userRepository.GetAll()).Count,
                ActiveUser = activeUsers.Count,
                QuotesCreated = quotes.Count(),
                PreApprovals = quotesStatus.Where(q => q.Status == (int)ApplicationStatus.PreApproved).Count(),
                FilesInEscrow = quotesStatus.Where(q => q.Status == (int)ApplicationStatus.InEscrow).Count(),
            };
        }

        public async Task<QuotesOverviewDTO> GetQuotesOverview(DateTime startDate, DateTime endDate, Guid userId)
        {
            if (startDate == DateTime.MinValue || endDate == DateTime.MinValue)
            {
                startDate = DateTime.UtcNow.Date;
                endDate = startDate.AddDays(1);
            }

            var quotes = await _preApprovalRepository.GetByDateRange(userId, startDate, endDate);
            
            // Group quotes by date
            var dailyQuoteCounts = quotes
                .GroupBy(q => q.CreatedAt.Date)
                .Select(g => new DailyQuoteCountDTO
                {
                    Date = g.Key,
                    QuoteCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            // Fill in missing dates with 0 counts
            var allDates = new List<DailyQuoteCountDTO>();
            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var existingCount = dailyQuoteCounts.FirstOrDefault(d => d.Date.Date == date.Date);
                allDates.Add(existingCount ?? new DailyQuoteCountDTO
                {
                    Date = date,
                    QuoteCount = 0
                });
            }

            return new QuotesOverviewDTO
            {
                UserId = userId,
                StartDate = startDate.Date,
                EndDate = endDate.Date,
                TotalQuotes = quotes.Count,
                DailyQuoteCounts = allDates
            };
        }
    }
}
