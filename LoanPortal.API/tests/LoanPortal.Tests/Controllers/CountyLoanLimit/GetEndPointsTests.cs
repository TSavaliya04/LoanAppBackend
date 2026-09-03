using LoanPortal.API.Controllers.CountyLoanLimit;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.CountyLoanLimit
{
    public class GetEndPointsTests
    {
        private readonly Mock<ICountyLoanLimitService> _mockCountyService;
        private readonly GetEndPoints _controller;

        public GetEndPointsTests()
        {
            _mockCountyService = new Mock<ICountyLoanLimitService>();
            _controller = new GetEndPoints(_mockCountyService.Object);
        }

        #region SearchCounties

        [Fact]
        public async Task SearchCounties_ValidSearch_ReturnsOkWithData()
        {
            // Arrange
            var searchTerm = "Los";
            var expectedResult = new List<CountySearchDTO>
            {
                new CountySearchDTO { Id = Guid.NewGuid(), County = "Los Angeles" }
            };

            _mockCountyService.Setup(x => x.SearchCountiesAsync(searchTerm))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.SearchCounties(searchTerm) as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public async Task SearchCounties_ServiceThrowsException_Returns500InternalServerError()
        {
            // Arrange
            var searchTerm = "Los";
            _mockCountyService.Setup(x => x.SearchCountiesAsync(searchTerm))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act
            var result = await _controller.SearchCounties(searchTerm) as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(500, result.StatusCode);
        }

        #endregion
        
        #region GetAllCounties

        [Fact]
        public async Task GetAllCounties_ReturnsOkWithData()
        {
            // Arrange
            var expectedResult = new List<CountySearchDTO>
            {
                new CountySearchDTO { Id = Guid.NewGuid(), County = "Los Angeles" },
                new CountySearchDTO { Id = Guid.NewGuid(), County = "Orange" }
            };

            _mockCountyService.Setup(x => x.SearchCountiesAsync(string.Empty))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetAllCounties() as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public async Task GetAllCounties_ServiceThrowsException_Returns500InternalServerError()
        {
            // Arrange
            _mockCountyService.Setup(x => x.SearchCountiesAsync(string.Empty))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act
            var result = await _controller.GetAllCounties() as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(500, result.StatusCode);
        }

        #endregion

        #region GetLoanLimit

        [Fact]
        public async Task GetLoanLimit_ValidRequest_ReturnsOkWithData()
        {
            // Arrange
            var countyId = Guid.NewGuid();
            var propertyType = PropertyType.SFR;
            decimal expectedLimit = 400000m;

            _mockCountyService.Setup(x => x.GetLoanLimitAsync(countyId, propertyType))
                .ReturnsAsync(expectedLimit);

            // Act
            var result = await _controller.GetLoanLimit(countyId, propertyType) as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public async Task GetLoanLimit_LimitNotFound_Returns404NotFound()
        {
            // Arrange
            var countyId = Guid.NewGuid();
            var propertyType = PropertyType.SFR;

            _mockCountyService.Setup(x => x.GetLoanLimitAsync(countyId, propertyType))
                .ReturnsAsync((decimal?)null);

            // Act
            var result = await _controller.GetLoanLimit(countyId, propertyType) as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(404, result.StatusCode);
        }

        [Fact]
        public async Task GetLoanLimit_ServiceThrowsException_Returns500InternalServerError()
        {
            // Arrange
            var countyId = Guid.NewGuid();
            var propertyType = PropertyType.SFR;

            _mockCountyService.Setup(x => x.GetLoanLimitAsync(countyId, propertyType))
                .ThrowsAsync(new Exception("Service error"));

            // Act
            var result = await _controller.GetLoanLimit(countyId, propertyType) as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(500, result.StatusCode);
        }

        #endregion
    }
}
