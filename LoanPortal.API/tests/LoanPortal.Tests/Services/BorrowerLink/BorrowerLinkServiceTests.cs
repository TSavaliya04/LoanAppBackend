using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services.BorrowerLink
{
    public class BorrowerLinkServiceTests
    {
        private readonly Mock<ILOEmploymentLinkRepository> _mockPortalRepo;
        private readonly Mock<IBorrowerEmploymentRepository> _mockDraftRepo;
        private readonly Mock<IPreApprovalRepository> _mockPreApprovalRepo;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly Mock<IOptions<SMTPConfigModel>> _mockSmtpConfig;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly BorrowerLinkService _service;

        public BorrowerLinkServiceTests()
        {
            _mockPortalRepo = new Mock<ILOEmploymentLinkRepository>();
            _mockDraftRepo = new Mock<IBorrowerEmploymentRepository>();
            _mockPreApprovalRepo = new Mock<IPreApprovalRepository>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            
            _mockSmtpConfig = new Mock<IOptions<SMTPConfigModel>>();
            _mockSmtpConfig.Setup(x => x.Value).Returns(new SMTPConfigModel());
            
            _mockConfig = new Mock<IConfiguration>();

            _service = new BorrowerLinkService(
                _mockPortalRepo.Object,
                _mockDraftRepo.Object,
                _mockPreApprovalRepo.Object,
                _mockUserRepo.Object,
                _mockLoginUserDetails.Object,
                _mockSmtpConfig.Object,
                _mockConfig.Object
            );
        }

        [Fact]
        public async Task GetMyPortalLinkAsync_ReturnsLink()
        {
            var userId = Guid.NewGuid();
            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockUserRepo.Setup(x => x.GetUserById(userId)).ReturnsAsync(new UserEntity { CompanyId = Guid.NewGuid() });
            
            var expected = new LOEmploymentLinkDocument();
            _mockPortalRepo.Setup(x => x.GetByLoanOfficerIdAsync(userId)).ReturnsAsync(expected);

            var result = await _service.GetMyPortalLinkAsync();

            Assert.NotNull(result);
        }
    }
}
