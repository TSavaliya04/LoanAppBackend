using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.PreApproval;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using System;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.PreApproval
{
    public class CreateEndPointsTests
    {
        private readonly Mock<IPreApprovalService> _mockPreApprovalService;
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly CreateEndPoints _controller;

        public CreateEndPointsTests()
        {
            _mockPreApprovalService = new Mock<IPreApprovalService>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _controller = new CreateEndPoints(_mockPreApprovalService.Object, _mockLoginUserDetails.Object);
        }

        [Fact]
        public async Task SavePreApproval_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var dto = new PreApprovalDTO();
            var expectedDocument = new PreApprovalDocument { Id = Guid.NewGuid() };

            _mockPreApprovalService
                .Setup(x => x.SavePreApproval(dto))
                .ReturnsAsync(expectedDocument);

            // Act
            var result = await _controller.SavePreApproval(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PreApprovalDocument>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedDocument, response.Data);
        }

        [Fact]
        public async Task SavePreApproval_NotFound_ReturnsNotFoundResult()
        {
            // Arrange
            var dto = new PreApprovalDTO();
            var errorMessage = "Pre-approval not found";

            _mockPreApprovalService
                .Setup(x => x.SavePreApproval(dto))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act
            var result = await _controller.SavePreApproval(dto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<LoanProgramDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task SavePreApproval_Exception_ReturnsInternalServerError()
        {
            // Arrange
            var dto = new PreApprovalDTO();
            var errorMessage = "Unexpected error";

            _mockPreApprovalService
                .Setup(x => x.SavePreApproval(dto))
                .ThrowsAsync(new Exception(errorMessage));

            // Act
            var result = await _controller.SavePreApproval(dto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<LoanProgramDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task SavePreApproval_ServiceCalled_VerifyMethodInvocation()
        {
            var dto = new PreApprovalDTO();
            _mockPreApprovalService
                .Setup(x => x.SavePreApproval(dto))
                .ReturnsAsync(new PreApprovalDocument { Id = Guid.NewGuid() });

            await _controller.SavePreApproval(dto);

            _mockPreApprovalService.Verify(x => x.SavePreApproval(dto), Times.Once);
        }
    }
}

