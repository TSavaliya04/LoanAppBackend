using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services.Notifications
{
    public class NotificationServiceTests
    {
        private readonly Mock<INotificationRepository> _mockRepo;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<ICompanyRepository> _mockCompanyRepo;
        private readonly Mock<IFcmService> _mockFcmService;
        private readonly List<Mock<INotificationEventHandler>> _mockHandlers;
        private readonly NotificationService _service;

        public NotificationServiceTests()
        {
            _mockRepo = new Mock<INotificationRepository>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockCompanyRepo = new Mock<ICompanyRepository>();
            _mockFcmService = new Mock<IFcmService>();
            _mockHandlers = new List<Mock<INotificationEventHandler>>();

            _service = new NotificationService(
                new List<INotificationEventHandler>(),
                _mockRepo.Object,
                _mockUserRepo.Object,
                _mockCompanyRepo.Object,
                _mockFcmService.Object
            );
        }

        [Fact]
        public async Task GetUnreadCountAsync_ReturnsCount()
        {
            var userId = Guid.NewGuid();
            _mockRepo.Setup(x => x.GetUnreadCountAsync(userId)).ReturnsAsync(5);

            var result = await _service.GetUnreadCountAsync(userId);
            Assert.Equal(5, result);
        }
    }
}
