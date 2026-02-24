using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Shared.Constants;
using LoanPortal.Shared.Enum;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services
{
    public class AdminServiceTests
    {
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IPreApprovalRepository> _mockPreApprovalRepository;
        private readonly AdminService _service;

        public AdminServiceTests()
        {
            _mockUserRepository = new Mock<IUserRepository>();
            _mockPreApprovalRepository = new Mock<IPreApprovalRepository>();
            _service = new AdminService(_mockUserRepository.Object, _mockPreApprovalRepository.Object);
        }

        #region GetUsers

        [Fact]
        public async Task GetUsers_FiltersOutAdminAndComputesQuotesThisWeek()
        {
            // Arrange
            var adminUser = new UserEntity
            {
                Id = IConstants.AdminId,
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@example.com",
                CompanyName = "Admin Co",
                IsActive = true
            };

            var agentId = Guid.NewGuid();
            var agentUser = new UserEntity
            {
                Id = agentId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                CompanyName = "Loan Corp",
                IsActive = true
            };

            _mockUserRepository
                .Setup(x => x.GetAll())
                .ReturnsAsync(new List<UserEntity> { adminUser, agentUser });

            // Two quotes for the agent this week
            var quotes = new List<PreApprovalDocument>
            {
                new PreApprovalDocument { Id = Guid.NewGuid(), UserId = agentId, CreatedAt = DateTime.UtcNow.Date },
                new PreApprovalDocument { Id = Guid.NewGuid(), UserId = agentId, CreatedAt = DateTime.UtcNow.Date.AddDays(-1) }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByDateRangeAdmin(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(quotes);

            var request = new DefaultRequest
            {
                PageNumber = 0,
                PageSize = 10
            };

            // Act
            var result = await _service.GetUsers(request);

            // Assert
            Assert.Single(result.Users);
            var agent = result.Users.First();
            Assert.Equal(agentId, agent.AgentId);
            Assert.Equal("John Doe", agent.AgentName);
            Assert.Equal("Loan Corp", agent.Company);
            Assert.Equal("john@example.com", agent.Email);
            Assert.Equal(2, agent.QuotesThisWeek);
            Assert.Equal(1, result.TotalCount);
            Assert.Equal(0, result.PageNumber);
            Assert.Equal(10, result.PageSize);
        }

        [Fact]
        public async Task GetUsers_NegativePageAndZeroPageSize_UsesDefaults()
        {
            // Arrange
            var users = new List<UserEntity>
            {
                new UserEntity { Id = Guid.NewGuid(), FirstName = "A", LastName = "Agent" },
                new UserEntity { Id = Guid.NewGuid(), FirstName = "B", LastName = "Agent" },
                new UserEntity { Id = Guid.NewGuid(), FirstName = "C", LastName = "Agent" }
            };

            _mockUserRepository
                .Setup(x => x.GetAll())
                .ReturnsAsync(users);

            _mockPreApprovalRepository
                .Setup(x => x.GetByDateRangeAdmin(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(new List<PreApprovalDocument>());

            var request = new DefaultRequest
            {
                PageNumber = -1,
                PageSize = 0
            };

            // Act
            var result = await _service.GetUsers(request);

            // Assert
            Assert.Equal(3, result.Users.Count);
            Assert.Equal(3, result.TotalCount);
            Assert.Equal(0, result.PageNumber);   // corrected to 0
            Assert.Equal(10, result.PageSize);    // defaulted to 10
        }

        [Fact]
        public async Task GetUsers_WhenRepositoryThrows_WrapsExceptionWithCustomMessage()
        {
            // Arrange
            _mockUserRepository
                .Setup(x => x.GetAll())
                .ThrowsAsync(new Exception("DB error"));

            var request = new DefaultRequest();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.GetUsers(request));
            Assert.Equal("An error occurred while retrieving users.", ex.Message);
            Assert.NotNull(ex.InnerException);
            Assert.Equal("DB error", ex.InnerException!.Message);
        }

        #endregion

        #region GetRecentQuotes

        [Fact]
        public async Task GetRecentQuotes_MapsAndPaginatesCorrectly()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var baseDate = new DateTime(2025, 1, 1);

            var quote1 = new PreApprovalDocument
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = baseDate,
                Status = (int)ApplicationStatus.PreApproved,
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        CreatedAt = baseDate,
                        BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "Alice" },
                        PurchaseInfo = new PurchaseInfoDTO { LoanAmount = 100000 },
                        LoanProgram = new LoanProgramDTO { LoanProgram = (int)LoanProgram.FHA }
                    }
                }
            };

            var quote2 = new PreApprovalDocument
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = baseDate.AddDays(1),
                Status = (int)ApplicationStatus.InEscrow,
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        CreatedAt = baseDate.AddDays(1),
                        BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "Bob" },
                        PurchaseInfo = new PurchaseInfoDTO { LoanAmount = 150000 },
                        LoanProgram = new LoanProgramDTO { LoanProgram = (int)LoanProgram.Conventional }
                    }
                }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetAllAsync(userId))
                .ReturnsAsync(new List<PreApprovalDocument> { quote1, quote2 });

            var request = new RecentQuoteRequest
            {
                UserId = userId,
                Params = new DefaultRequest
                {
                    PageNumber = 0,
                    PageSize = 1,
                    SortBy = "date",
                    SortByDirection = "desc"
                }
            };

            // Act
            var result = await _service.GetRecentQuotes(request);

            // Assert
            Assert.Equal(2, result.TotalCount);
            Assert.Single(result.Quotes);

            var first = result.Quotes.First();
            Assert.Equal("Bob", first.ClientName);
            Assert.Equal(150000, first.LoanAmount);
            Assert.Equal(quote2.UserId, first.UserId);
            Assert.Equal(ApplicationStatus.InEscrow.ToString(), first.Stage);
        }

        #endregion

        #region GetAdminDashboard

        [Fact]
        public async Task GetAdminDashboard_ComputesSummaryCounts()
        {
            // Arrange
            var start = new DateTime(2025, 1, 1);
            var end = new DateTime(2025, 1, 7);

            var allUsers = new List<UserEntity>
            {
                new UserEntity { Id = Guid.NewGuid() },
                new UserEntity { Id = Guid.NewGuid() },
                new UserEntity { Id = Guid.NewGuid() }
            };

            var activeUsers = new List<UserEntity>
            {
                allUsers[0],
                allUsers[1]
            };

            var quotesInRange = new List<PreApprovalDocument>
            {
                new PreApprovalDocument { Id = Guid.NewGuid() },
                new PreApprovalDocument { Id = Guid.NewGuid() },
                new PreApprovalDocument { Id = Guid.NewGuid() },
                new PreApprovalDocument { Id = Guid.NewGuid() },
                new PreApprovalDocument { Id = Guid.NewGuid() }
            };

            var statusQuotes = new List<PreApprovalDocument>
            {
                new PreApprovalDocument { Id = Guid.NewGuid(), Status = (int)ApplicationStatus.PreApproved },
                new PreApprovalDocument { Id = Guid.NewGuid(), Status = (int)ApplicationStatus.PreApproved },
                new PreApprovalDocument { Id = Guid.NewGuid(), Status = (int)ApplicationStatus.InEscrow },
                new PreApprovalDocument { Id = Guid.NewGuid(), Status = (int)ApplicationStatus.TBD }
            };

            _mockUserRepository.Setup(x => x.GetAll()).ReturnsAsync(allUsers);
            _mockUserRepository.Setup(x => x.GetUsersActiveInRange(start, end)).ReturnsAsync(activeUsers);
            _mockPreApprovalRepository.Setup(x => x.GetByDateRangeAdmin(start, end)).ReturnsAsync(quotesInRange);
            _mockPreApprovalRepository.Setup(x => x.GetByStatusChangeDateRange(start, end)).ReturnsAsync(statusQuotes);

            // Act
            var result = await _service.GetAdminDashboard(start, end);

            // Assert
            Assert.Equal(3, result.TotalUser);
            Assert.Equal(2, result.ActiveUser);
            Assert.Equal(5, result.QuotesCreated);
            Assert.Equal(2, result.PreApprovals);
            Assert.Equal(1, result.FilesInEscrow);
        }

        #endregion

        #region GetQuotesOverview

        [Fact]
        public async Task GetQuotesOverview_BuildsDailyCountsAndFillsMissingDates()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var start = new DateTime(2025, 1, 1);
            var end = new DateTime(2025, 1, 3);

            var quotes = new List<PreApprovalDocument>
            {
                new PreApprovalDocument { Id = Guid.NewGuid(), UserId = userId, CreatedAt = new DateTime(2025, 1, 1) },
                new PreApprovalDocument { Id = Guid.NewGuid(), UserId = userId, CreatedAt = new DateTime(2025, 1, 3) }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByDateRange(userId, start, end))
                .ReturnsAsync(quotes);

            // Act
            var result = await _service.GetQuotesOverview(start, end, userId);

            // Assert
            Assert.Equal(userId, result.UserId);
            Assert.Equal(start.Date, result.StartDate);
            Assert.Equal(end.Date, result.EndDate);
            Assert.Equal(2, result.TotalQuotes);

            Assert.Equal(3, result.DailyQuoteCounts.Count);
            Assert.Equal(new DateTime(2025, 1, 1), result.DailyQuoteCounts[0].Date);
            Assert.Equal(1, result.DailyQuoteCounts[0].QuoteCount);
            Assert.Equal(new DateTime(2025, 1, 2), result.DailyQuoteCounts[1].Date);
            Assert.Equal(0, result.DailyQuoteCounts[1].QuoteCount);
            Assert.Equal(new DateTime(2025, 1, 3), result.DailyQuoteCounts[2].Date);
            Assert.Equal(1, result.DailyQuoteCounts[2].QuoteCount);
        }

        #endregion
    }
}

