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
        public async Task GetTopOpportunities_ReturnsOkResult()
        {
            // Arrange
            var expectedOpportunities = new List<TopOpportunityDTO>();
            _mockPreApprovalService.Setup(x => x.GetTopOpportunities())
                .ReturnsAsync(expectedOpportunities);

            // Act
            var result = await _controller.GetTopOpportunities();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<TopOpportunityDTO>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedOpportunities, response.Data);
        }

        [Fact]
        public async Task GetTopOpportunities_Exception_ReturnsInternalServerError()
        {
            // Arrange
            _mockPreApprovalService.Setup(x => x.GetTopOpportunities())
                .ThrowsAsync(new Exception());

            // Act
            var result = await _controller.GetTopOpportunities();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<TopOpportunityDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
        }

        [Fact]
        public async Task PreApprovalReport_ValidId_ReturnsOkResult()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var expectedReport = new PreApprovalReport { PreApprovalId = preApprovalId };
            _mockPreApprovalService.Setup(x => x.GetPreApprovalReport(preApprovalId))
                .ReturnsAsync(expectedReport);

            // Act
            var result = await _controller.PreApprovalReport(preApprovalId);

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
            _mockPreApprovalService.Setup(x => x.GetPreApprovalReport(preApprovalId))
                .ThrowsAsync(new Exception());

            // Act
            var result = await _controller.PreApprovalReport(preApprovalId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<PreApprovalReport>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
        }

        [Fact]
        public async Task GetFHAReport_ValidId_ReturnsOkResult()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var expectedReport = new FHAReport { PreApprovalId = preApprovalId };
            _mockPreApprovalService.Setup(x => x.GetFHAReport(preApprovalId))
                .ReturnsAsync(expectedReport);

            // Act
            var result = await _controller.GetFHAReport(preApprovalId);

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
            _mockPreApprovalService.Setup(x => x.GetFHAReport(preApprovalId))
                .ThrowsAsync(new Exception());

            // Act
            var result = await _controller.GetFHAReport(preApprovalId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<FHAReport>>(statusCodeResult.Value);
            Assert.False(response.Success);
        }

        [Fact]
        public async Task QuickQuote_ValidId_ReturnsOkResult()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var expectedQuote = new QuickQuote();
            _mockPreApprovalService.Setup(x => x.GetQuickQuote(preApprovalId))
                .ReturnsAsync(expectedQuote);

            // Act
            var result = await _controller.QuickQuote(preApprovalId);

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
            _mockPreApprovalService.Setup(x => x.GetQuickQuote(preApprovalId))
                .ThrowsAsync(new Exception());

            // Act
            var result = await _controller.QuickQuote(preApprovalId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<FHAReport>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
        }
    }
} 