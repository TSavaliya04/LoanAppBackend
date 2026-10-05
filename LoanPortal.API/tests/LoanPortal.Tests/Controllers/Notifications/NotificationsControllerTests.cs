using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.Notifications;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.Notifications
{
    public class NotificationsControllerTests
    {
        private readonly Mock<INotificationService> _mockNotificationService;
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly Mock<IUserService> _mockUserService;
        private readonly NotificationsController _controller;

        public NotificationsControllerTests()
        {
            _mockNotificationService = new Mock<INotificationService>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _mockUserService = new Mock<IUserService>();

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(Guid.NewGuid());

            _controller = new NotificationsController(
                _mockNotificationService.Object,
                _mockLoginUserDetails.Object,
                _mockUserService.Object);
        }

        [Fact]
        public async Task GetNotifications_ValidRequest_ReturnsOkResult()
        {
            var expected = new List<NotificationDocument>();
            _mockNotificationService.Setup(x => x.GetNotificationsAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(expected);

            var result = await _controller.GetNotifications();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<NotificationDocument>>>(okResult.Value);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task GetUnreadCount_ValidRequest_ReturnsOkResult()
        {
            var expected = 5;
            _mockNotificationService.Setup(x => x.GetUnreadCountAsync(It.IsAny<Guid>())).ReturnsAsync(expected);

            var result = await _controller.GetUnreadCount();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task MarkAsRead_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            _mockNotificationService.Setup(x => x.MarkAsReadAsync(id, It.IsAny<Guid>())).Returns(Task.CompletedTask);

            var result = await _controller.MarkAsRead(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task MarkAllRead_ValidRequest_ReturnsOkResult()
        {
            _mockNotificationService.Setup(x => x.MarkAllAsReadAsync(It.IsAny<Guid>())).Returns(Task.CompletedTask);

            var result = await _controller.MarkAllRead();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task RegisterFcmToken_ValidRequest_ReturnsOkResult()
        {
            var request = new RegisterFcmTokenRequest { Token = "my-token" };
            _mockUserService.Setup(x => x.UpdateFcmTokenAsync(It.IsAny<Guid>(), request.Token)).Returns(Task.CompletedTask);

            var result = await _controller.RegisterFcmToken(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }
    }
}
