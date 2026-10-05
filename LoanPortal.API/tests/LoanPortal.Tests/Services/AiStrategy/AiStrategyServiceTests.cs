using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services.AiStrategy
{
    public class AiStrategyServiceTests
    {
        private readonly HttpClient _httpClient;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<IPreApprovalService> _mockPreApproval;
        private readonly AiStrategyService _service;

        public AiStrategyServiceTests()
        {
            _httpClient = new HttpClient();
            _mockConfig = new Mock<IConfiguration>();
            _mockPreApproval = new Mock<IPreApprovalService>();
            
            _service = new AiStrategyService(
                _httpClient,
                _mockConfig.Object,
                _mockPreApproval.Object
            );
        }

        [Fact]
        public void ServiceInstantiatesSuccessfully()
        {
            Assert.NotNull(_service);
        }
    }
}
