using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services.IncomeCalculation
{
    public class IncomeCalculationServiceTests
    {
        private readonly Mock<IIncomeCalculationRepository> _mockRepo;
        private readonly IncomeCalculationService _service;

        public IncomeCalculationServiceTests()
        {
            _mockRepo = new Mock<IIncomeCalculationRepository>();
            _service = new IncomeCalculationService(_mockRepo.Object);
        }

        [Fact]
        public async Task GetById_ReturnsDocument()
        {
            var id = Guid.NewGuid();
            var doc = new IncomeCalculationDocument();
            _mockRepo.Setup(x => x.GetByIdAsync(id)).ReturnsAsync(doc);

            var result = await _service.GetById(id);
            Assert.Equal(doc, result);
        }
    }
}
