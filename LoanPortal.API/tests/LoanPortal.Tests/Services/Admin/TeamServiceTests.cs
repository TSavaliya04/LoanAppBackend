using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Infrastructure.Services;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services.Admin
{
    public class TeamServiceTests
    {
        private readonly Mock<ITeamRepository> _mockRepo;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<ICompanyRepository> _mockCompanyRepo;
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly TeamService _service;

        public TeamServiceTests()
        {
            _mockRepo = new Mock<ITeamRepository>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockCompanyRepo = new Mock<ICompanyRepository>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();

            _service = new TeamService(
                _mockRepo.Object,
                _mockUserRepo.Object,
                _mockCompanyRepo.Object,
                _mockLoginUserDetails.Object
            );
        }

        [Fact]
        public async Task CreateTeam_ValidRequest_CreatesTeam()
        {
            var companyId = Guid.NewGuid();
            _mockLoginUserDetails.Setup(x => x.CompanyId).Returns(companyId);
            _mockCompanyRepo.Setup(x => x.GetCompanyByIdAsync(companyId)).ReturnsAsync(new CompanyEntity { Id = companyId });
            
            var request = new CreateTeamRequest { Name = "Test Team" };
            _mockRepo.Setup(x => x.CreateTeamAsync(It.IsAny<TeamEntity>())).Returns(Task.CompletedTask);

            var result = await _service.CreateTeam(request);

            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
        }
    }
}


