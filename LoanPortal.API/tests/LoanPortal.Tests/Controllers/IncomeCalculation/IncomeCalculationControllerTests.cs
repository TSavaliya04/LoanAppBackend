using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.IncomeCalculation;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.IncomeCalculation
{
    public class IncomeCalculationControllerTests
    {
        private readonly Mock<IIncomeCalculationService> _mockService;
        private readonly IncomeCalculationController _controller;

        public IncomeCalculationControllerTests()
        {
            _mockService = new Mock<IIncomeCalculationService>();
            _controller = new IncomeCalculationController(_mockService.Object);
        }

        [Fact]
        public async Task GetByScenarioId_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var expected = new List<IncomeCalculationDocument>();
            _mockService.Setup(x => x.GetByScenarioId(id)).ReturnsAsync(expected);

            var result = await _controller.GetByScenarioId(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<IncomeCalculationDocument>>>(okResult.Value);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task GetById_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var expected = new IncomeCalculationDocument();
            _mockService.Setup(x => x.GetById(id)).ReturnsAsync(expected);

            var result = await _controller.GetById(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IncomeCalculationDocument>>(okResult.Value);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task Save_ValidRequest_ReturnsOkResult()
        {
            var doc = new IncomeCalculationDocument();
            var expected = new IncomeCalculationDocument();
            _mockService.Setup(x => x.Save(doc)).ReturnsAsync(expected);

            var result = await _controller.Save(doc);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IncomeCalculationDocument>>(okResult.Value);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task Update_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var doc = new IncomeCalculationDocument();
            var expected = new IncomeCalculationDocument();
            _mockService.Setup(x => x.Update(id, doc)).ReturnsAsync(expected);

            var result = await _controller.Update(id, doc);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IncomeCalculationDocument>>(okResult.Value);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task DeleteById_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            _mockService.Setup(x => x.DeleteById(id)).Returns(Task.CompletedTask);

            var result = await _controller.DeleteById(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task DeleteByScenarioId_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            _mockService.Setup(x => x.DeleteByScenarioId(id)).Returns(Task.CompletedTask);

            var result = await _controller.DeleteByScenarioId(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }
    }
}
