using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Shared.Enum;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services
{
    public class CountyLoanLimitServiceTests
    {
        private readonly Mock<ICountyLoanLimitRepository> _mockCountyRepository;
        private readonly CountyLoanLimitService _service;

        public CountyLoanLimitServiceTests()
        {
            _mockCountyRepository = new Mock<ICountyLoanLimitRepository>();
            _service = new CountyLoanLimitService(_mockCountyRepository.Object);
        }

        #region SearchCountiesAsync

        [Fact]
        public async Task SearchCountiesAsync_ReturnsDistinctOrderedCounties()
        {
            // Arrange
            var searchTerm = "Los";
            var id1 = Guid.NewGuid();
            var id2 = Guid.NewGuid();
            
            var mockCounties = new List<CountyLoanLimitEntity>
            {
                new CountyLoanLimitEntity { Id = id1, County = "Los Angeles" },
                new CountyLoanLimitEntity { Id = id1, County = "Los Angeles" }, // Duplicate name
                new CountyLoanLimitEntity { Id = id2, County = "Alamosa" }, // Won't match logically, but repository returns it
                new CountyLoanLimitEntity { Id = Guid.NewGuid(), County = null } // Should be filtered out
            };

            _mockCountyRepository.Setup(x => x.SearchCountiesAsync(searchTerm))
                .ReturnsAsync(mockCounties);

            // Act
            var result = await _service.SearchCountiesAsync(searchTerm);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            
            // Should be ordered alphabetically
            Assert.Equal("Alamosa", result[0].County);
            Assert.Equal(id2, result[0].Id);
            
            Assert.Equal("Los Angeles", result[1].County);
            Assert.Equal(id1, result[1].Id);
        }

        #endregion

        #region GetLoanLimitAsync

        [Fact]
        public async Task GetLoanLimitAsync_CountyNotFound_ReturnsNull()
        {
            // Arrange
            var countyId = Guid.NewGuid();
            _mockCountyRepository.Setup(x => x.GetByIdAsync(countyId))
                .ReturnsAsync((CountyLoanLimitEntity)null!);

            // Act
            var result = await _service.GetLoanLimitAsync(countyId, PropertyType.SFR);

            // Assert
            Assert.Null(result);
        }

        [Theory]
        [InlineData(PropertyType.SFR, 100000)]
        [InlineData(PropertyType.TwoUnit, 200000)]
        [InlineData(PropertyType.Duplex, 200000)]
        [InlineData(PropertyType.ThreeUnit, 300000)]
        [InlineData(PropertyType.Triplex, 300000)]
        [InlineData(PropertyType.FourUnit, 400000)]
        [InlineData(PropertyType.FourPlex, 400000)]
        public async Task GetLoanLimitAsync_ValidCountyAndPropertyType_ReturnsCorrectLimit(PropertyType propertyType, decimal expectedLimit)
        {
            // Arrange
            var countyId = Guid.NewGuid();
            var county = new CountyLoanLimitEntity
            {
                Id = countyId,
                Single = 100000,
                Duplex = 200000,
                TriPlex = 300000,
                FourPlex = 400000
            };

            _mockCountyRepository.Setup(x => x.GetByIdAsync(countyId))
                .ReturnsAsync(county);

            // Act
            var result = await _service.GetLoanLimitAsync(countyId, propertyType);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedLimit, result.Value);
        }

        [Fact]
        public async Task GetLoanLimitAsync_UnknownPropertyType_ReturnsNull()
        {
            // Arrange
            var countyId = Guid.NewGuid();
            var county = new CountyLoanLimitEntity
            {
                Id = countyId
            };

            _mockCountyRepository.Setup(x => x.GetByIdAsync(countyId))
                .ReturnsAsync(county);

            // Cast an invalid int to enum
            var invalidPropertyType = (PropertyType)999;

            // Act
            var result = await _service.GetLoanLimitAsync(countyId, invalidPropertyType);

            // Assert
            Assert.Null(result);
        }

        #endregion
    }
}
