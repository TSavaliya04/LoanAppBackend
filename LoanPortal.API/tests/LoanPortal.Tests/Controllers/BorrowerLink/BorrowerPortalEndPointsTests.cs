using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.BorrowerLink;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.BorrowerLink
{
    public class BorrowerPortalEndPointsTests
    {
        private readonly Mock<IBorrowerLinkService> _mockService;
        private readonly BorrowerPortalEndPoints _controller;

        public BorrowerPortalEndPointsTests()
        {
            _mockService = new Mock<IBorrowerLinkService>();
            _controller = new BorrowerPortalEndPoints(_mockService.Object);
        }

        [Fact]
        public async Task ResolveLink_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var expected = new ResolveBorrowerLinkResponse();
            _mockService.Setup(x => x.ResolveLinkAsync(id)).ReturnsAsync(expected);

            var result = await _controller.ResolveLink(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<ResolveBorrowerLinkResponse>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task GetMyDrafts_ValidRequest_ReturnsOkResult()
        {
            var expected = new List<GetMyDraftsResponseItem>();
            _mockService.Setup(x => x.GetMyDraftsAsync()).ReturnsAsync(expected);

            var result = await _controller.GetMyDrafts();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<GetMyDraftsResponseItem>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task SaveDraft_ValidRequest_ReturnsOkResult()
        {
            var request = new SaveBorrowerDraftRequest();
            var expected = new SaveBorrowerDraftResponse();
            _mockService.Setup(x => x.SaveDraftAsync(request)).ReturnsAsync(expected);

            var result = await _controller.SaveDraft(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SaveBorrowerDraftResponse>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task Submit_ValidRequest_ReturnsOkResult()
        {
            var request = new SubmitBorrowerEmploymentRequest();
            var expected = new SubmitBorrowerEmploymentResponse();
            _mockService.Setup(x => x.SubmitAsync(request)).ReturnsAsync(expected);

            var result = await _controller.Submit(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SubmitBorrowerEmploymentResponse>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }
    }
}
