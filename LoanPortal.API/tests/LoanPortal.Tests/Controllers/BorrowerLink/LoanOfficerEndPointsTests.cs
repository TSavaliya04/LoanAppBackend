using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.BorrowerLink;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.BorrowerLink
{
    public class LoanOfficerEndPointsTests
    {
        private readonly Mock<IBorrowerLinkService> _mockService;
        private readonly LoanOfficerEndPoints _controller;

        public LoanOfficerEndPointsTests()
        {
            _mockService = new Mock<IBorrowerLinkService>();
            _controller = new LoanOfficerEndPoints(_mockService.Object);
        }

        [Fact]
        public async Task GetMyPortalLink_ValidRequest_ReturnsOkResult()
        {
            var expected = new GetLOEmploymentLinkResponse();
            _mockService.Setup(x => x.GetMyPortalLinkAsync()).ReturnsAsync(expected);

            var result = await _controller.GetMyPortalLink();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<GetLOEmploymentLinkResponse>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task UpdatePortalStatus_ValidRequest_ReturnsOkResult()
        {
            var request = new UpdateLOEmploymentLinkStatusRequest();
            _mockService.Setup(x => x.UpdatePortalStatusAsync(request)).Returns(Task.CompletedTask);

            var result = await _controller.UpdatePortalStatus(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }
    }
}
