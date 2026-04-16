using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
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
        private readonly ILoginUserDetails _loginUserDetails;
        private readonly ICompanyRepository _companyRepository;
        private readonly IUserService _userService;

        public AdminService(IUserRepository userRepository, IPreApprovalRepository preApprovalRepository, ILoginUserDetails loginUserDetails, ICompanyRepository companyRepository, IUserService userService)
        {
            _userRepository = userRepository;
            _preApprovalRepository = preApprovalRepository;
            _loginUserDetails = loginUserDetails;
            _companyRepository = companyRepository;
            _userService = userService;
        }

        public async Task<PagedAgentsDTO> GetUsers(DefaultRequest request)
        {
            try
            {
                var users = await _userRepository.GetAll();
                // Filter out SuperAdmins instead of hardcoded AdminId
                users.RemoveAll(u => u.Role == Shared.Enum.UserRole.SuperAdmin || u.Role == Shared.Enum.UserRole.CompanyAdmin);

                // If this is a CompanyAdmin, filter users tightly to their own company
                if (_loginUserDetails.Role == Shared.Enum.UserRole.CompanyAdmin)
                {
                    users = users.Where(u => u.CompanyId == _loginUserDetails.CompanyId).ToList();
                }

                var today = DateTime.UtcNow.Date;
                var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
                var endOfWeek = startOfWeek.AddDays(7);

                var thisWeekPreApprovals = await _preApprovalRepository.GetByDateRangeAdmin(startOfWeek, endOfWeek);
                var preApprovalsByUser = thisWeekPreApprovals
                    .GroupBy(p => p.UserId)
                    .ToDictionary(g => g.Key, g => g.Count());

                var allCompanies = await _companyRepository.GetAllCompaniesAsync();
                var companyDict = allCompanies.ToDictionary(c => c.Id, c => c.Name);

                List<AgentDTO> agents = new List<AgentDTO>();

                foreach (UserEntity user in users)
                {
                    preApprovalsByUser.TryGetValue(user.Id, out var quotesThisWeek);
                    
                    string companyName = null;
                    if (user.CompanyId.HasValue && companyDict.TryGetValue(user.CompanyId.Value, out var cName))
                    {
                        companyName = cName;
                    }

                    agents.Add(new AgentDTO
                    {
                        AgentId = user.Id,
                        AgentName = user.FirstName + " " + user.LastName,
                        CompanyId = user.CompanyId,
                        Company = companyName,
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
                        (!string.IsNullOrEmpty(a.Company) && a.Company.ToLower().Contains(search)) ||
                        (!string.IsNullOrEmpty(a.Email) && a.Email.ToLower().Contains(search)));
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

                string? clientName = null;
                decimal loanAmount = 0;
                int? loanProgramValue = null;

                // 0 = Purchase, 1 = Refinance
                if (quote.LoanType == 1)
                {
                    var refinance = latestScenario?.Refinance;
                    clientName = refinance?.BorrowerInfo?.BorrowerName;
                    loanAmount = refinance?.RefinanceInfo?.LoanAmount ?? 0;
                    loanProgramValue = refinance?.LoanStructure?.LoanProgram;
                }
                else
                {
                    var purchase = latestScenario?.Purchase;
                    clientName = purchase?.BorrowerInfo?.BorrowerName;
                    loanAmount = purchase?.PurchaseInfo?.LoanAmount ?? 0;
                    loanProgramValue = purchase?.LoanProgram?.LoanProgram;
                }

                var loanType = loanProgramValue.HasValue && Enum.IsDefined(typeof(LoanProgram), loanProgramValue.Value)
                    ? ((LoanProgram)loanProgramValue.Value).ToString()
                    : string.Empty;

                var stage = Enum.IsDefined(typeof(ApplicationStatus), quote.Status)
                    ? ((ApplicationStatus)quote.Status).ToString()
                    : string.Empty;

                recentQuotes.Add(new RecentQuoteDTO
                {
                    UserId = quote.UserId,
                    Date = quote.CreatedAt,
                    ClientName = clientName,
                    LoanAmount = loanAmount,
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
            activeUsers.RemoveAll(u => u.Role == Shared.Enum.UserRole.SuperAdmin || u.Role == Shared.Enum.UserRole.CompanyAdmin);

            // Scope logic for Company Admin
            var allUsers = await _userRepository.GetAll();
            allUsers.RemoveAll(u => u.Role == Shared.Enum.UserRole.SuperAdmin || u.Role == Shared.Enum.UserRole.CompanyAdmin);

            if (_loginUserDetails.Role == Shared.Enum.UserRole.CompanyAdmin)
            {
                var companyUsers = allUsers.Where(u => u.CompanyId == _loginUserDetails.CompanyId).Select(u => u.Id).ToHashSet();
                
                quotes = quotes.Where(q => companyUsers.Contains(q.UserId)).ToList();
                quotesStatus = quotesStatus.Where(q => companyUsers.Contains(q.UserId)).ToList();
                activeUsers = activeUsers.Where(u => companyUsers.Contains(u.Id)).ToList();
                allUsers = allUsers.Where(u => companyUsers.Contains(u.Id)).ToList();
            }

            return new AdminDashboardDTO
            {
                TotalUser = allUsers.Count,
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

        public async Task<UserDTO> CreateAdmin(CreateAdminRequest request)
        {
            if (_loginUserDetails.Role != Shared.Enum.UserRole.SuperAdmin)
            {
                throw new UnauthorizedAccessException("Only SuperAdmins can create Admins.");
            }

            if (request.Role != Shared.Enum.UserRole.SuperAdmin && request.Role != Shared.Enum.UserRole.CompanyAdmin)
            {
                 throw new ValidationException("Invalid admin role requested.");
            }

            var result = await _userService.SignUp(request);

            // Fetch created user and update role
            var createdUser = await _userRepository.GetUserByEmail(request.Email);
            createdUser.Role = request.Role;
            createdUser.CompanyId = request.CompanyId;
            
            await _userRepository.UpdateUserProfileAsync(createdUser.Id, createdUser);
            result.Role = request.Role;
            result.CompanyId = request.CompanyId;
            return result;
        }

        public async Task<PagedCompaniesDTO> GetCompanies(DefaultRequest request)
        {
            if (_loginUserDetails.Role != Shared.Enum.UserRole.SuperAdmin)
            {
                throw new UnauthorizedAccessException("Only SuperAdmins can view all companies.");
            }

            var allCompanies = await _companyRepository.GetAllCompaniesAsync();
            var companiesDto = allCompanies.Select(c => new CompanyDTO
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                ContactEmail = c.ContactEmail,
                ContactPhone = c.ContactPhone,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            }).ToList();

            IEnumerable<CompanyDTO> query = companiesDto;

            // Apply search
            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var search = request.SearchText.Trim().ToLower();
                query = query.Where(c =>
                    (!string.IsNullOrEmpty(c.Name) && c.Name.ToLower().Contains(search)) ||
                    (!string.IsNullOrEmpty(c.Address) && c.Address.ToLower().Contains(search)) ||
                    (!string.IsNullOrEmpty(c.ContactEmail) && c.ContactEmail.ToLower().Contains(search)) ||
                    (!string.IsNullOrEmpty(c.ContactPhone) && c.ContactPhone.ToLower().Contains(search)));
            }

            // Apply sorting
            bool desc = string.Equals(request.SortByDirection, "desc", StringComparison.OrdinalIgnoreCase);
            switch (request.SortBy?.ToLower())
            {
                case "name":
                    query = desc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name);
                    break;
                case "contactemail":
                    query = desc ? query.OrderByDescending(c => c.ContactEmail) : query.OrderBy(c => c.ContactEmail);
                    break;
                case "isactive":
                    query = desc ? query.OrderByDescending(c => c.IsActive) : query.OrderBy(c => c.IsActive);
                    break;
                case "createdat":
                default:
                    query = desc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt);
                    break;
            }

            var totalCount = query.Count();

            var pageNumber = request.PageNumber < 0 ? 0 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var items = query
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedCompaniesDTO
            {
                Companies = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<CompanyDTO> CreateCompany(CreateCompanyRequest request)
        {
            if (_loginUserDetails.Role != Shared.Enum.UserRole.SuperAdmin)
            {
                throw new UnauthorizedAccessException("Only SuperAdmins can create new companies.");
            }

            var companyEntity = new CompanyEntity
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Address = request.Address,
                ContactEmail = request.ContactEmail,
                ContactPhone = request.ContactPhone,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _companyRepository.CreateCompanyAsync(companyEntity);

            return new CompanyDTO
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                Address = companyEntity.Address,
                ContactEmail = companyEntity.ContactEmail,
                ContactPhone = companyEntity.ContactPhone,
                IsActive = companyEntity.IsActive,
                CreatedAt = companyEntity.CreatedAt
            };
        }

        public async Task<CompanyDTO> GetCompanyById(Guid id)
        {
            var company = await _companyRepository.GetCompanyByIdAsync(id);
            if (company == null) return null;

            return new CompanyDTO
            {
                Id = company.Id,
                Name = company.Name,
                Address = company.Address,
                ContactEmail = company.ContactEmail,
                ContactPhone = company.ContactPhone,
                IsActive = company.IsActive,
                CreatedAt = company.CreatedAt
            };
        }

        public async Task<CompanyDTO> UpdateCompany(UpdateCompanyRequest request)
        {
            if (_loginUserDetails.Role != Shared.Enum.UserRole.SuperAdmin && !(_loginUserDetails.Role == Shared.Enum.UserRole.CompanyAdmin && _loginUserDetails.CompanyId == request.Id))
            {
                throw new UnauthorizedAccessException("You are not authorized to update this company.");
            }

            var companyEntity = await _companyRepository.GetCompanyByIdAsync(request.Id);
            if (companyEntity == null)
            {
                return null;
            }

            companyEntity.Name = request.Name;
            companyEntity.Address = request.Address;
            companyEntity.ContactEmail = request.ContactEmail;
            companyEntity.ContactPhone = request.ContactPhone;
            companyEntity.IsActive = request.IsActive;
            companyEntity.UpdatedAt = DateTime.UtcNow;

            await _companyRepository.UpdateCompanyAsync(request.Id, companyEntity);

            return new CompanyDTO
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                Address = companyEntity.Address,
                ContactEmail = companyEntity.ContactEmail,
                ContactPhone = companyEntity.ContactPhone,
                IsActive = companyEntity.IsActive,
                CreatedAt = companyEntity.CreatedAt
            };
        }
    }
}
