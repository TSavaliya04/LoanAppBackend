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
    public class UpdateEndPointsTests
    {
        private readonly Mock<IPreApprovalService> _mockPreApprovalService;
        private readonly UpdateEndPoints _controller;

        public UpdateEndPointsTests()
        {
            _mockPreApprovalService = new Mock<IPreApprovalService>();
            _controller = new UpdateEndPoints(_mockPreApprovalService.Object);
        }

        #region UpdateApplicationStatus

        [Fact]
        public async Task UpdateApplicationStatus_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var status = 2;
            var expectedDoc = new PreApprovalDocument { Id = id, Status = status };

            _mockPreApprovalService
                .Setup(x => x.UpdateApplicationStatus(id, status))
                .ReturnsAsync(expectedDoc);

            var result = await _controller.UpdateApplicationStatus(id, status);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PreApprovalDocument>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedDoc, response.Data);
        }

        [Fact]
        public async Task UpdateApplicationStatus_NotFound_ReturnsNotFoundResult()
        {
            var id = Guid.NewGuid();
            var status = 2;
            var errorMessage = "Pre-approval not found";

            _mockPreApprovalService
                .Setup(x => x.UpdateApplicationStatus(id, status))
                .ThrowsAsync(new NotFoundException(errorMessage));

            var result = await _controller.UpdateApplicationStatus(id, status);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<BorrowerInfoDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task UpdateApplicationStatus_Exception_ReturnsInternalServerError()
        {
            var id = Guid.NewGuid();
            var status = 2;
            var errorMessage = "Unexpected error";

            _mockPreApprovalService
                .Setup(x => x.UpdateApplicationStatus(id, status))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.UpdateApplicationStatus(id, status);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<BorrowerInfoDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task UpdateApplicationStatus_ServiceCalled_VerifyMethodInvocation()
        {
            var id = Guid.NewGuid();
            var status = 3;
            _mockPreApprovalService
                .Setup(x => x.UpdateApplicationStatus(id, status))
                .ReturnsAsync(new PreApprovalDocument { Id = id, Status = status });

            await _controller.UpdateApplicationStatus(id, status);

            _mockPreApprovalService.Verify(x => x.UpdateApplicationStatus(id, status), Times.Once);
        }

        #endregion

        #region DeletePreApproval

        [Fact]
        public async Task DeletePreApproval_ValidIds_ReturnsOkTrue()
        {
            var ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };

            _mockPreApprovalService
                .Setup(x => x.DeletePreApproval(ids))
                .Returns(Task.CompletedTask);

            var result = await _controller.DeletePreApproval(ids);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.True(response.Success);
            Assert.True(response.Data);
        }

        [Fact]
        public async Task DeletePreApproval_NotFound_ReturnsNotFoundResult()
        {
            var ids = new List<Guid> { Guid.NewGuid() };
            var errorMessage = "Pre-approval not found";

            _mockPreApprovalService
                .Setup(x => x.DeletePreApproval(ids))
                .ThrowsAsync(new NotFoundException(errorMessage));

            var result = await _controller.DeletePreApproval(ids);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<LoanProgramDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task DeletePreApproval_Exception_ReturnsInternalServerError()
        {
            var ids = new List<Guid> { Guid.NewGuid() };
            var errorMessage = "Unexpected error";

            _mockPreApprovalService
                .Setup(x => x.DeletePreApproval(ids))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.DeletePreApproval(ids);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<LoanProgramDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task DeletePreApproval_ServiceCalled_VerifyMethodInvocation()
        {
            var ids = new List<Guid> { Guid.NewGuid() };

            _mockPreApprovalService
                .Setup(x => x.DeletePreApproval(ids))
                .Returns(Task.CompletedTask);

            await _controller.DeletePreApproval(ids);

            _mockPreApprovalService.Verify(x => x.DeletePreApproval(ids), Times.Once);
        }

        #endregion
    }
}

