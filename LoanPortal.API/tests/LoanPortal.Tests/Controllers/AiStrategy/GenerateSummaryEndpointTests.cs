using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.AiStrategy;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.AiStrategy
{
    public class GenerateSummaryEndpointTests
    {
        private readonly Mock<IAiStrategyService> _mockService;
        private readonly GenerateSummaryEndpoint _controller;

        public GenerateSummaryEndpointTests()
        {
            _mockService = new Mock<IAiStrategyService>();
            _controller = new GenerateSummaryEndpoint(_mockService.Object);
        }

        [Fact]
        public async Task GenerateSummary_ValidRequest_ReturnsOkResult()
        {
            var request = new ScenarioComparisonRequest();
            var expected = new AiStrategySummary();
            _mockService.Setup(x => x.GenerateSummaryAsync(request)).ReturnsAsync(expected);

            var result = await _controller.GenerateSummary(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<AiStrategySummary>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task GenerateSummary_Exception_ReturnsInternalServerError()
        {
            var request = new ScenarioComparisonRequest();
            _mockService.Setup(x => x.GenerateSummaryAsync(request)).ThrowsAsync(new Exception("Error"));

            var result = await _controller.GenerateSummary(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }
    }
}
