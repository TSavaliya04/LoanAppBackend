using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Core.Interfaces;
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
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly Mock<ICompanyRepository> _mockCompanyRepository;
        private readonly Mock<IUserService> _mockUserService;
        private readonly AdminService _service;

        public AdminServiceTests()
        {
            _mockUserRepository = new Mock<IUserRepository>();
            _mockPreApprovalRepository = new Mock<IPreApprovalRepository>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _mockCompanyRepository = new Mock<ICompanyRepository>();
            _mockUserService = new Mock<IUserService>();
            _service = new AdminService(
                _mockUserRepository.Object, 
                _mockPreApprovalRepository.Object,
                _mockLoginUserDetails.Object,
                _mockCompanyRepository.Object,
                _mockUserService.Object
            );
        }

        #region GetUsers

        [Fact]
        public async Task GetUsers_FiltersOutAdminAndComputesQuotesThisWeek()
        {
            // Arrange
            var adminCompanyId = Guid.NewGuid();
            var agentCompanyId = Guid.NewGuid();

            var adminUser = new UserEntity
            {
                Id = IConstants.AdminId,
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@example.com",
                CompanyId = adminCompanyId,
                IsActive = true
            };

            var agentId = Guid.NewGuid();
            var agentUser = new UserEntity
            {
                Id = agentId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                CompanyId = agentCompanyId,
                IsActive = true
            };

            var request = new GetUsersRequest
            {
                PageNumber = 0,
                PageSize = 10
            };

            var expectedUsers = new List<UserEntity> { agentUser };
            var expectedQuotesThisWeek = new Dictionary<Guid, int> { { agentId, 2 } };

            _mockUserRepository
                .Setup(x => x.GetUsersWithFiltersAsync(request, It.IsAny<UserRole>(), It.IsAny<Guid?>()))
                .ReturnsAsync((expectedUsers, expectedQuotesThisWeek, 1));

            _mockCompanyRepository
                .Setup(x => x.GetAllCompaniesAsync())
                .ReturnsAsync(new List<CompanyEntity> 
                { 
                    new CompanyEntity { Id = adminCompanyId, Name = "Admin Co" },
                    new CompanyEntity { Id = agentCompanyId, Name = "Loan Corp" }
                });



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

            var request = new GetUsersRequest
            {
                PageNumber = -1,
                PageSize = 0
            };

            _mockUserRepository
                .Setup(x => x.GetUsersWithFiltersAsync(request, It.IsAny<UserRole>(), It.IsAny<Guid?>()))
                .ReturnsAsync((users, new Dictionary<Guid, int>(), 3));

            _mockCompanyRepository
                .Setup(x => x.GetAllCompaniesAsync())
                .ReturnsAsync(new List<CompanyEntity>());

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
                .Setup(x => x.GetUsersWithFiltersAsync(It.IsAny<GetUsersRequest>(), It.IsAny<UserRole>(), It.IsAny<Guid?>()))
                .ThrowsAsync(new Exception("DB error"));

            var request = new GetUsersRequest();

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
                        Purchase = new PurchaseScenarioDTO
                        {
                            BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "Alice" },
                            PurchaseInfo = new PurchaseInfoDTO { LoanAmount = 100000 },
                            LoanProgram = new LoanProgramDTO { LoanProgram = (int)LoanProgram.FHA }
                        }
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
                        Purchase = new PurchaseScenarioDTO
                        {
                            BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "Bob" },
                            PurchaseInfo = new PurchaseInfoDTO { LoanAmount = 150000 },
                            LoanProgram = new LoanProgramDTO { LoanProgram = (int)LoanProgram.Conventional }
                        }
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

        [Fact]
        public async Task GetRecentQuotes_RefinanceScenario_MapsCorrectly()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var baseDate = new DateTime(2025, 1, 2);

            var quote = new PreApprovalDocument
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = baseDate,
                LoanType = 1,
                Status = (int)ApplicationStatus.PreApproved,
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        CreatedAt = baseDate,
                        Refinance = new RefinanceScenarioDTO
                        {
                            BorrowerInfo = new RefinanceBorrowerInfoDTO { BorrowerName = "Rita" },
                            RefinanceInfo = new RefinanceInfoDTO { LoanAmount = 222000 },
                            LoanStructure = new RefinanceLoanStructureDTO { LoanProgram = (int)LoanProgram.FHA }
                        }
                    }
                }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetAllAsync(userId))
                .ReturnsAsync(new List<PreApprovalDocument> { quote });

            var request = new RecentQuoteRequest
            {
                UserId = userId,
                Params = new DefaultRequest
                {
                    PageNumber = 0,
                    PageSize = 10,
                    SortBy = "date",
                    SortByDirection = "desc"
                }
            };

            // Act
            var result = await _service.GetRecentQuotes(request);

            // Assert
            Assert.Equal(1, result.TotalCount);
            Assert.Single(result.Quotes);

            var first = result.Quotes.First();
            Assert.Equal("Rita", first.ClientName);
            Assert.Equal(222000, first.LoanAmount);
            Assert.Equal(LoanProgram.FHA.ToString(), first.LoanType);
            Assert.Equal(ApplicationStatus.PreApproved.ToString(), first.Stage);
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
                .Setup(x => x.GetByDateRange(null, userId, start, end))
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


        #region CreateAdmin

        [Fact]
        public async Task CreateAdmin_ValidRequest_CreatesUserAndReturnsDTO()
        {
            var request = new CreateAdminRequest
            {
                Email = "admin2@example.com",
                FirstName = "Admin",
                LastName = "Two",
                Password = "Password@123",
                Role = UserRole.CompanyAdmin,
                CompanyId = Guid.NewGuid()
            };

            var userEntity = new UserEntity
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Role = request.Role,
                CompanyId = request.CompanyId
            };

            _mockUserService.Setup(x => x.SignUp(It.IsAny<CreateUserRequest>()))
                .ReturnsAsync(new UserDTO { Id = userEntity.Id, Email = request.Email, Role = UserRole.User });

            _mockUserRepository.Setup(x => x.GetUserByEmail(request.Email))
                .ReturnsAsync(userEntity);

            _mockUserRepository.Setup(x => x.UpdateUserProfileAsync(userEntity.Id, userEntity))
                .Returns(Task.CompletedTask);

            var result = await _service.CreateAdmin(request);

            Assert.NotNull(result);
            Assert.Equal(request.Email, result.Email);
            Assert.Equal(request.Role, result.Role);
            _mockUserRepository.Verify(x => x.UpdateUserProfileAsync(userEntity.Id, It.Is<UserEntity>(u => u.Role == request.Role)), Times.Once);
        }

        #endregion

        #region GetCompanyAdmins

        [Fact]
        public async Task GetCompanyAdmins_ReturnsCompanyAdminsPaged()
        {
            var request = new DefaultRequest { PageNumber = 0, PageSize = 10 };
            var adminId = Guid.NewGuid();
            var companyId = Guid.NewGuid();

            var adminUser = new UserEntity
            {
                Id = adminId,
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@example.com",
                CompanyId = companyId,
                Role = UserRole.CompanyAdmin
            };

            var expectedUsers = new List<UserEntity> { adminUser };

            _mockUserRepository
                .Setup(x => x.GetAll())
                .ReturnsAsync(expectedUsers);

            _mockUserRepository
                .Setup(x => x.GetUsersWithFiltersAsync(It.IsAny<GetUsersRequest>(), UserRole.CompanyAdmin, null))
                .ReturnsAsync((expectedUsers, new Dictionary<Guid, int>(), 1));

            _mockCompanyRepository
                .Setup(x => x.GetAllCompaniesAsync())
                .ReturnsAsync(new List<CompanyEntity> { new CompanyEntity { Id = companyId, Name = "Admin Co" } });

            _mockLoginUserDetails.Setup(x => x.Role).Returns(UserRole.SuperAdmin);

            var result = await _service.GetCompanyAdmins(request);

            Assert.NotNull(result);
            Assert.Single(result.Users);
            Assert.Equal(1, result.TotalCount);
            Assert.Equal(adminId, result.Users.First().Id);
            Assert.Equal("Admin Co", result.Users.First().CompanyName);
        }

        #endregion

        #region GetCompanies

        [Fact]
        public async Task GetCompanies_ReturnsCompaniesPaged()
        {
            var request = new DefaultRequest { PageNumber = 0, PageSize = 10, SearchText = "Co" };
            var company1 = new CompanyEntity { Id = Guid.NewGuid(), Name = "Alpha Co" };
            var company2 = new CompanyEntity { Id = Guid.NewGuid(), Name = "Beta Corp" };
            
            var allCompanies = new List<CompanyEntity> { company1, company2 };

            _mockLoginUserDetails.Setup(x => x.Role).Returns(UserRole.SuperAdmin);

            _mockCompanyRepository
                .Setup(x => x.GetAllCompaniesAsync())
                .ReturnsAsync(allCompanies);

            var result = await _service.GetCompanies(request);

            Assert.NotNull(result);
            Assert.Equal(2, result.Companies.Count);
            Assert.Equal(2, result.TotalCount);
            Assert.Contains(result.Companies, c => c.Name == "Alpha Co");
        }

        #endregion

        #region CreateCompany

        [Fact]
        public async Task CreateCompany_ValidRequest_CreatesCompanyAndReturnsDTO()
        {
            var request = new CreateCompanyRequest
            {
                Name = "New Company",
                Address = "123 Main St",
                ContactEmail = "test@company.com"
            };

            _mockCompanyRepository
                .Setup(x => x.CreateCompanyAsync(It.IsAny<CompanyEntity>()))
                .Returns(Task.CompletedTask);

            var result = await _service.CreateCompany(request);

            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.Address, result.Address);
            Assert.Equal(request.ContactEmail, result.ContactEmail);
            Assert.NotEqual(Guid.Empty, result.Id);
            _mockCompanyRepository.Verify(x => x.CreateCompanyAsync(It.Is<CompanyEntity>(c => c.Name == request.Name)), Times.Once);
        }

        #endregion

        #region GetCompanyById

        [Fact]
        public async Task GetCompanyById_ExistingId_ReturnsCompanyDTO()
        {
            var id = Guid.NewGuid();
            var company = new CompanyEntity { Id = id, Name = "Test Co" };

            _mockCompanyRepository
                .Setup(x => x.GetCompanyByIdAsync(id))
                .ReturnsAsync(company);

            var result = await _service.GetCompanyById(id);

            Assert.NotNull(result);
            Assert.Equal(id, result.Id);
            Assert.Equal("Test Co", result.Name);
        }

        [Fact]
        public async Task GetCompanyById_NonExistingId_ReturnsNull()
        {
            var id = Guid.NewGuid();

            _mockCompanyRepository
                .Setup(x => x.GetCompanyByIdAsync(id))
                .ReturnsAsync((CompanyEntity)null!);

            var result = await _service.GetCompanyById(id);

            Assert.Null(result);
        }

        #endregion

        #region UpdateCompany

        [Fact]
        public async Task UpdateCompany_ExistingId_UpdatesAndReturnsCompanyDTO()
        {
            var id = Guid.NewGuid();
            var request = new UpdateCompanyRequest
            {
                Id = id,
                Name = "Updated Co",
                Address = "456 Main St"
            };

            var existingCompany = new CompanyEntity { Id = id, Name = "Old Co", Address = "123 Main St" };

            _mockLoginUserDetails.Setup(x => x.Role).Returns(UserRole.SuperAdmin);

            _mockCompanyRepository
                .Setup(x => x.GetCompanyByIdAsync(id))
                .ReturnsAsync(existingCompany);

            _mockCompanyRepository
                .Setup(x => x.UpdateCompanyAsync(id, It.IsAny<CompanyEntity>()))
                .Returns(Task.CompletedTask);

            var result = await _service.UpdateCompany(request);

            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.Address, result.Address);
            _mockCompanyRepository.Verify(x => x.UpdateCompanyAsync(id, It.Is<CompanyEntity>(c => c.Name == request.Name)), Times.Once);
        }

        [Fact]
        public async Task UpdateCompany_NonExistingId_ReturnsNull()
        {
            var id = Guid.NewGuid();
            var request = new UpdateCompanyRequest { Id = id };

            _mockLoginUserDetails.Setup(x => x.Role).Returns(UserRole.SuperAdmin);

            _mockCompanyRepository
                .Setup(x => x.GetCompanyByIdAsync(id))
                .ReturnsAsync((CompanyEntity)null!);

            var result = await _service.UpdateCompany(request);

            Assert.Null(result);
        }

        #endregion

    }
}
