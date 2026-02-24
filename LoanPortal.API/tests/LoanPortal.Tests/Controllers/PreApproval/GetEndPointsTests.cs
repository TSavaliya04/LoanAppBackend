using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.PreApproval;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.PreApproval
{
    public class GetEndPointsTests
    {
        private readonly Mock<IPreApprovalService> _mockPreApprovalService;
        private readonly GetEndPoints _controller;

        public GetEndPointsTests()
        {
            _mockPreApprovalService = new Mock<IPreApprovalService>();
            _controller = new GetEndPoints(_mockPreApprovalService.Object);
        }

        [Fact]
        public async Task GetPreApproval_ValidId_ReturnsOkResult()
        {
            // Arrange
            var id = Guid.NewGuid();
            var expectedPreApproval = new PreApprovalDocument { Id = id };
            _mockPreApprovalService.Setup(x => x.GetPreApproval(id))
                .ReturnsAsync(expectedPreApproval);

            // Act
            var result = await _controller.GetPreApproval(id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PreApprovalDocument>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedPreApproval, response.Data);
        }

        [Fact]
        public async Task GetPreApproval_NotFound_ReturnsNotFoundResult()
        {
            // Arrange
            var id = Guid.NewGuid();
            _mockPreApprovalService.Setup(x => x.GetPreApproval(id))
                .ThrowsAsync(new NotFoundException("Pre-approval not found"));

            // Act
            var result = await _controller.GetPreApproval(id);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<BorrowerInfoDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Pre-approval not found", response.Error);
        }

        [Fact]
        public async Task GetPreApproval_Exception_ReturnsInternalServerError()
        {
            // Arrange
            var id = Guid.NewGuid();
            var errorMessage = "Unexpected error";
            _mockPreApprovalService.Setup(x => x.GetPreApproval(id))
                .ThrowsAsync(new Exception(errorMessage));

            // Act
            var result = await _controller.GetPreApproval(id);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<BorrowerInfoDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetQuoteList_ReturnsOkResult()
        {
            // Arrange
            var status = 1;
            var expectedOpportunities = new List<TopOpportunityDTO>();
            _mockPreApprovalService.Setup(x => x.GetQuoteList(status))
                .ReturnsAsync(expectedOpportunities);

            // Act
            var result = await _controller.GetQuoteList(status);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<TopOpportunityDTO>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedOpportunities, response.Data);
        }

        [Fact]
        public async Task GetQuoteList_Exception_ReturnsInternalServerError()
        {
            // Arrange
            var status = 1;
            var errorMessage = "Something went wrong";
            _mockPreApprovalService.Setup(x => x.GetQuoteList(status))
                .ThrowsAsync(new Exception(errorMessage));

            // Act
            var result = await _controller.GetQuoteList(status);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<TopOpportunityDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetQuoteList_ServiceCalled_VerifyMethodInvocation()
        {
            var status = 2;
            _mockPreApprovalService.Setup(x => x.GetQuoteList(status))
                .ReturnsAsync(new List<TopOpportunityDTO>());

            await _controller.GetQuoteList(status);

            _mockPreApprovalService.Verify(x => x.GetQuoteList(status), Times.Once);
        }

        [Fact]
        public async Task PreApprovalReport_ValidIds_ReturnsOkResult()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var expectedReport = new PreApprovalReport { PreApprovalId = preApprovalId };
            _mockPreApprovalService.Setup(x => x.GetPreApprovalReport(preApprovalId, scenarioId))
                .ReturnsAsync(expectedReport);

            // Act
            var result = await _controller.PreApprovalReport(preApprovalId, scenarioId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PreApprovalReport>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedReport, response.Data);
        }

        [Fact]
        public async Task PreApprovalReport_Exception_ReturnsInternalServerError()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var errorMessage = "Report generation failed";
            _mockPreApprovalService.Setup(x => x.GetPreApprovalReport(preApprovalId, scenarioId))
                .ThrowsAsync(new Exception(errorMessage));

            // Act
            var result = await _controller.PreApprovalReport(preApprovalId, scenarioId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<PreApprovalReport>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task PreApprovalReport_ServiceCalled_VerifyMethodInvocation()
        {
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            _mockPreApprovalService.Setup(x => x.GetPreApprovalReport(preApprovalId, scenarioId))
                .ReturnsAsync(new PreApprovalReport { PreApprovalId = preApprovalId });

            await _controller.PreApprovalReport(preApprovalId, scenarioId);

            _mockPreApprovalService.Verify(x => x.GetPreApprovalReport(preApprovalId, scenarioId), Times.Once);
        }

        [Fact]
        public async Task GetFHAReport_ValidIds_ReturnsOkResult()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var expectedReport = new FHAReport { PreApprovalId = preApprovalId };
            _mockPreApprovalService.Setup(x => x.GetFHAReport(preApprovalId, scenarioId))
                .ReturnsAsync(expectedReport);

            // Act
            var result = await _controller.GetFHAReport(preApprovalId, scenarioId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<FHAReport>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedReport, response.Data);
        }

        [Fact]
        public async Task GetFHAReport_Exception_ReturnsInternalServerError()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var errorMessage = "FHA report failed";
            _mockPreApprovalService.Setup(x => x.GetFHAReport(preApprovalId, scenarioId))
                .ThrowsAsync(new Exception(errorMessage));

            // Act
            var result = await _controller.GetFHAReport(preApprovalId, scenarioId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<FHAReport>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetFHAReport_ServiceCalled_VerifyMethodInvocation()
        {
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            _mockPreApprovalService.Setup(x => x.GetFHAReport(preApprovalId, scenarioId))
                .ReturnsAsync(new FHAReport { PreApprovalId = preApprovalId });

            await _controller.GetFHAReport(preApprovalId, scenarioId);

            _mockPreApprovalService.Verify(x => x.GetFHAReport(preApprovalId, scenarioId), Times.Once);
        }

        [Fact]
        public async Task QuickQuote_ValidIds_ReturnsOkResult()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var expectedQuote = new QuickQuote();
            _mockPreApprovalService.Setup(x => x.GetQuickQuote(preApprovalId, scenarioId))
                .ReturnsAsync(expectedQuote);

            // Act
            var result = await _controller.QuickQuote(preApprovalId, scenarioId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<QuickQuote>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedQuote, response.Data);
        }

        [Fact]
        public async Task QuickQuote_Exception_ReturnsInternalServerError()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var errorMessage = "Quote generation failed";
            _mockPreApprovalService.Setup(x => x.GetQuickQuote(preApprovalId, scenarioId))
                .ThrowsAsync(new Exception(errorMessage));

            // Act
            var result = await _controller.QuickQuote(preApprovalId, scenarioId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<QuickQuote>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task QuickQuote_ServiceCalled_VerifyMethodInvocation()
        {
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            _mockPreApprovalService.Setup(x => x.GetQuickQuote(preApprovalId, scenarioId))
                .ReturnsAsync(new QuickQuote());

            await _controller.QuickQuote(preApprovalId, scenarioId);

            _mockPreApprovalService.Verify(x => x.GetQuickQuote(preApprovalId, scenarioId), Times.Once);
        }

        [Fact]
        public async Task GetDashboardData_ReturnsOkResult()
        {
            var expectedDashboard = new DashboardDTO();
            _mockPreApprovalService.Setup(x => x.GetDashboardData())
                .ReturnsAsync(expectedDashboard);

            var result = await _controller.GetDashboardData();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<DashboardDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedDashboard, response.Data);
        }

        [Fact]
        public async Task GetDashboardData_Exception_ReturnsInternalServerError()
        {
            var errorMessage = "Dashboard unavailable";
            _mockPreApprovalService.Setup(x => x.GetDashboardData())
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetDashboardData();

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<DashboardDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetDashboardData_ServiceCalled_VerifyMethodInvocation()
        {
            _mockPreApprovalService.Setup(x => x.GetDashboardData())
                .ReturnsAsync(new DashboardDTO());

            await _controller.GetDashboardData();

            _mockPreApprovalService.Verify(x => x.GetDashboardData(), Times.Once);
        }
    }
} 