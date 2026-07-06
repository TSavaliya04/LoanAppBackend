using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.Admin;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.Admin
{
    public class AdminEndPointsTests
    {
        private readonly Mock<IAdminService> _mockAdminService;
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly Mock<IUserService> _mockUserService;
        private readonly AdminEndPoints _controller;

        public AdminEndPointsTests()
        {
            _mockAdminService = new Mock<IAdminService>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _mockUserService = new Mock<IUserService>();

            _controller = new AdminEndPoints(
                _mockAdminService.Object,
                _mockLoginUserDetails.Object,
                _mockUserService.Object);
        }

        #region GetUsers

        [Fact]
        public async Task GetUsers_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new GetUsersRequestWrapper
            {
                Params = new GetUsersRequest
                {
                    PageNumber = 1,
                    PageSize = 10
                }
            };

            var expected = new PagedAgentsDTO
            {
                Users = new List<AgentDTO>(),
                TotalCount = 0,
                PageNumber = 1,
                PageSize = 10
            };

            _mockAdminService
                .Setup(x => x.GetUsers(request.Params))
                .ReturnsAsync(expected);

            // Act
            var result = await _controller.GetUsers(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PagedAgentsDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task GetUsers_Exception_ReturnsInternalServerError()
        {
            var request = new GetUsersRequestWrapper
            {
                Params = new GetUsersRequest()
            };
            var errorMessage = "Unexpected error";

            _mockAdminService
                .Setup(x => x.GetUsers(request.Params))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetUsers(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<PagedAgentsDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetUsers_ServiceCalled_VerifyMethodInvocation()
        {
            var request = new GetUsersRequestWrapper
            {
                Params = new GetUsersRequest()
            };

            _mockAdminService
                .Setup(x => x.GetUsers(request.Params))
                .ReturnsAsync(new PagedAgentsDTO());

            await _controller.GetUsers(request);

            _mockAdminService.Verify(x => x.GetUsers(request.Params), Times.Once);
        }

        #endregion

        #region GetRecentQuotes

        [Fact]
        public async Task GetRecentQuotes_ValidRequest_ReturnsOkResult()
        {
            var req = new RecentQuoteRequest
            {
                Params = new DefaultRequest(),
                UserId = Guid.NewGuid()
            };

            var expected = new PagedRecentQuotesDTO
            {
                Quotes = new List<RecentQuoteDTO>(),
                TotalCount = 0,
                PageNumber = 1,
                PageSize = 10
            };

            _mockAdminService
                .Setup(x => x.GetRecentQuotes(req))
                .ReturnsAsync(expected);

            var result = await _controller.GetRecentQuotes(req);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PagedRecentQuotesDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task GetRecentQuotes_Exception_ReturnsInternalServerError()
        {
            var req = new RecentQuoteRequest
            {
                Params = new DefaultRequest(),
                UserId = Guid.NewGuid()
            };
            var errorMessage = "Unexpected error";

            _mockAdminService
                .Setup(x => x.GetRecentQuotes(req))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetRecentQuotes(req);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<PagedRecentQuotesDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetRecentQuotes_ServiceCalled_VerifyMethodInvocation()
        {
            var req = new RecentQuoteRequest
            {
                Params = new DefaultRequest(),
                UserId = Guid.NewGuid()
            };

            _mockAdminService
                .Setup(x => x.GetRecentQuotes(req))
                .ReturnsAsync(new PagedRecentQuotesDTO());

            await _controller.GetRecentQuotes(req);

            _mockAdminService.Verify(x => x.GetRecentQuotes(req), Times.Once);
        }

        #endregion

        #region GetAdminDashboard

        [Fact]
        public async Task GetAdminDashboard_ValidDates_ReturnsOkResult()
        {
            var start = DateTime.UtcNow.Date.AddDays(-7);
            var end = DateTime.UtcNow.Date;
            var expected = new AdminDashboardDTO();

            _mockAdminService
                .Setup(x => x.GetAdminDashboard(start, end, It.IsAny<Guid?>()))
                .ReturnsAsync(expected);

            var result = await _controller.GetAdminDashboard(start, end, null);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<AdminDashboardDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task GetAdminDashboard_Exception_ReturnsInternalServerError()
        {
            var start = DateTime.UtcNow.Date.AddDays(-7);
            var end = DateTime.UtcNow.Date;
            var errorMessage = "Dashboard failed";

            _mockAdminService
                .Setup(x => x.GetAdminDashboard(start, end, It.IsAny<Guid?>()))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetAdminDashboard(start, end, null);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<AdminDashboardDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetAdminDashboard_ServiceCalled_VerifyMethodInvocation()
        {
            var start = DateTime.UtcNow.Date.AddDays(-7);
            var end = DateTime.UtcNow.Date;

            _mockAdminService
                .Setup(x => x.GetAdminDashboard(start, end, It.IsAny<Guid?>()))
                .ReturnsAsync(new AdminDashboardDTO());

            await _controller.GetAdminDashboard(start, end, null);

            _mockAdminService.Verify(x => x.GetAdminDashboard(start, end, null), Times.Once);
        }

        #endregion

        #region GetQuotesOverview

        [Fact]
        public async Task GetQuotesOverview_ValidRequest_ReturnsOkResult()
        {
            var start = DateTime.UtcNow.Date.AddDays(-7);
            var end = DateTime.UtcNow.Date;
            var userId = Guid.NewGuid();
            var expected = new QuotesOverviewDTO { UserId = userId, StartDate = start, EndDate = end };

            _mockAdminService
                .Setup(x => x.GetQuotesOverview(start, end, userId))
                .ReturnsAsync(expected);

            var result = await _controller.GetQuotesOverview(start, end, userId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<QuotesOverviewDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task GetQuotesOverview_EndDateBeforeStartDate_ReturnsBadRequest()
        {
            var start = DateTime.UtcNow.Date;
            var end = start.AddDays(-1);
            var userId = Guid.NewGuid();

            var result = await _controller.GetQuotesOverview(start, end, userId);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponse<QuotesOverviewDTO>>(badRequest.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal("End date must be after start date", response.Error);

            _mockAdminService.Verify(
                x => x.GetQuotesOverview(It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<Guid>()),
                Times.Never);
        }

        [Fact]
        public async Task GetQuotesOverview_Exception_ReturnsInternalServerError()
        {
            var start = DateTime.UtcNow.Date.AddDays(-7);
            var end = DateTime.UtcNow.Date;
            var userId = Guid.NewGuid();
            var errorMessage = "Overview failed";

            _mockAdminService
                .Setup(x => x.GetQuotesOverview(start, end, userId))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetQuotesOverview(start, end, userId);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<QuotesOverviewDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetQuotesOverview_ServiceCalled_VerifyMethodInvocation()
        {
            var start = DateTime.UtcNow.Date.AddDays(-7);
            var end = DateTime.UtcNow.Date;
            var userId = Guid.NewGuid();

            _mockAdminService
                .Setup(x => x.GetQuotesOverview(start, end, userId))
                .ReturnsAsync(new QuotesOverviewDTO());

            await _controller.GetQuotesOverview(start, end, userId);

            _mockAdminService.Verify(x => x.GetQuotesOverview(start, end, userId), Times.Once);
        }

        #endregion

        #region UpdateUser

        [Fact]
        public async Task UpdateUser_ValidRequest_ReturnsOkResult()
        {
            var companyId = Guid.NewGuid();
            var request = new UpdateProfileRequest
            {
                Address = "123 Main St",
                JobTitle = "Agent",
                CompanyId = companyId
            };

            var expectedUser = new UserDTO
            {
                Address = request.Address,
                JobTitle = request.JobTitle,
                CompanyId = request.CompanyId
            };

            _mockUserService
                .Setup(x => x.UpdateProfile(request))
                .ReturnsAsync(expectedUser);

            var result = await _controller.UpdateUser(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task UpdateUser_Exception_ReturnsInternalServerError()
        {
            var request = new UpdateProfileRequest();
            var errorMessage = "Update failed";

            _mockUserService
                .Setup(x => x.UpdateProfile(request))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.UpdateUser(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task UpdateUser_ServiceCalled_VerifyMethodInvocation()
        {
            var request = new UpdateProfileRequest();

            _mockUserService
                .Setup(x => x.UpdateProfile(request))
                .ReturnsAsync(new UserDTO());

            await _controller.UpdateUser(request);

            _mockUserService.Verify(x => x.UpdateProfile(request), Times.Once);
        }

        #endregion

        #region GetUserDetails

        [Fact]
        public async Task GetUserDetails_ValidUserId_ReturnsOkResult()
        {
            var userId = Guid.NewGuid();
            var expectedUser = new UserDTO { Id = userId, Email = "user@example.com" };

            _mockUserService
                .Setup(x => x.GetUserProfile(userId))
                .ReturnsAsync(expectedUser);

            var result = await _controller.GetUserDetails(userId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task GetUserDetails_Exception_ReturnsInternalServerError()
        {
            var userId = Guid.NewGuid();
            var errorMessage = "User fetch failed";

            _mockUserService
                .Setup(x => x.GetUserProfile(userId))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetUserDetails(userId);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Request Failed.", response.Message);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetUserDetails_ServiceCalled_VerifyMethodInvocation()
        {
            var userId = Guid.NewGuid();

            _mockUserService
                .Setup(x => x.GetUserProfile(userId))
                .ReturnsAsync(new UserDTO());

            await _controller.GetUserDetails(userId);

            _mockUserService.Verify(x => x.GetUserProfile(userId), Times.Once);
        }

        #endregion
        #region CreateAdmin

        [Fact]
        public async Task CreateAdmin_ValidRequest_ReturnsOkResult()
        {
            var request = new CreateAdminRequest();
            var expectedUser = new UserDTO();

            _mockAdminService
                .Setup(x => x.CreateAdmin(request))
                .ReturnsAsync(expectedUser);

            var result = await _controller.CreateAdmin(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task CreateAdmin_Exception_ReturnsInternalServerError()
        {
            var request = new CreateAdminRequest();
            var errorMessage = "Create admin failed";

            _mockAdminService
                .Setup(x => x.CreateAdmin(request))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.CreateAdmin(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task CreateAdmin_ServiceCalled_VerifyMethodInvocation()
        {
            var request = new CreateAdminRequest();

            _mockAdminService
                .Setup(x => x.CreateAdmin(request))
                .ReturnsAsync(new UserDTO());

            await _controller.CreateAdmin(request);

            _mockAdminService.Verify(x => x.CreateAdmin(request), Times.Once);
        }

        #endregion

        #region GetCompanyAdmins

        [Fact]
        public async Task GetCompanyAdmins_ValidRequest_ReturnsOkResult()
        {
            var request = new DefaultRequestWrapper { Params = new DefaultRequest() };
            var expectedResult = new PagedUserDTO { Users = new List<CompanyAdminDTO>() };

            _mockAdminService
                .Setup(x => x.GetCompanyAdmins(request.Params))
                .ReturnsAsync(expectedResult);

            var result = await _controller.GetCompanyAdmins(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PagedUserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedResult, response.Data);
        }

        [Fact]
        public async Task GetCompanyAdmins_Exception_ReturnsInternalServerError()
        {
            var request = new DefaultRequestWrapper { Params = new DefaultRequest() };
            var errorMessage = "Fetch failed";

            _mockAdminService
                .Setup(x => x.GetCompanyAdmins(request.Params))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetCompanyAdmins(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<PagedUserDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        #endregion

        #region GetCompanyAdminById

        [Fact]
        public async Task GetCompanyAdminById_ValidId_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var expectedUser = new UserDTO();

            _mockUserService
                .Setup(x => x.GetUserProfile(id))
                .ReturnsAsync(expectedUser);

            var result = await _controller.GetCompanyAdminById(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task GetCompanyAdminById_Exception_ReturnsInternalServerError()
        {
            var id = Guid.NewGuid();
            var errorMessage = "User not found";

            _mockUserService
                .Setup(x => x.GetUserProfile(id))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetCompanyAdminById(id);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        #endregion

        #region UpdateCompanyAdmin

        [Fact]
        public async Task UpdateCompanyAdmin_ValidRequest_ReturnsOkResult()
        {
            var request = new UpdateProfileRequest();
            var expectedUser = new UserDTO();

            _mockUserService
                .Setup(x => x.UpdateProfile(request))
                .ReturnsAsync(expectedUser);

            var result = await _controller.UpdateCompanyAdmin(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task UpdateCompanyAdmin_UnauthorizedException_ReturnsForbidden()
        {
            var request = new UpdateProfileRequest();
            var errorMessage = "Unauthorized";

            _mockUserService
                .Setup(x => x.UpdateProfile(request))
                .ThrowsAsync(new UnauthorizedAccessException(errorMessage));

            var result = await _controller.UpdateCompanyAdmin(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(403, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task UpdateCompanyAdmin_Exception_ReturnsInternalServerError()
        {
            var request = new UpdateProfileRequest();
            var errorMessage = "Update failed";

            _mockUserService
                .Setup(x => x.UpdateProfile(request))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.UpdateCompanyAdmin(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        #endregion

        #region GetCompanies

        [Fact]
        public async Task GetCompanies_ValidRequest_ReturnsOkResult()
        {
            var request = new DefaultRequestWrapper { Params = new DefaultRequest() };
            var expectedResult = new PagedCompaniesDTO { Companies = new List<CompanyDTO>() };

            _mockAdminService
                .Setup(x => x.GetCompanies(request.Params))
                .ReturnsAsync(expectedResult);

            var result = await _controller.GetCompanies(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PagedCompaniesDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedResult, response.Data);
        }

        [Fact]
        public async Task GetCompanies_Exception_ReturnsInternalServerError()
        {
            var request = new DefaultRequestWrapper { Params = new DefaultRequest() };
            var errorMessage = "Fetch failed";

            _mockAdminService
                .Setup(x => x.GetCompanies(request.Params))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetCompanies(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<PagedCompaniesDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        #endregion

        #region GetCompanyById

        [Fact]
        public async Task GetCompanyById_ValidId_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var expectedCompany = new CompanyDTO();

            _mockAdminService
                .Setup(x => x.GetCompanyById(id))
                .ReturnsAsync(expectedCompany);

            var result = await _controller.GetCompanyById(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedCompany, response.Data);
        }

        [Fact]
        public async Task GetCompanyById_NotFound_ReturnsNotFoundResult()
        {
            var id = Guid.NewGuid();

            _mockAdminService
                .Setup(x => x.GetCompanyById(id))
                .ReturnsAsync((CompanyDTO)null!);

            var result = await _controller.GetCompanyById(id);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Company not found.", response.Error);
        }

        [Fact]
        public async Task GetCompanyById_Exception_ReturnsInternalServerError()
        {
            var id = Guid.NewGuid();
            var errorMessage = "Fetch failed";

            _mockAdminService
                .Setup(x => x.GetCompanyById(id))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.GetCompanyById(id);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        #endregion

        #region CreateCompany

        [Fact]
        public async Task CreateCompany_ValidRequest_ReturnsOkResult()
        {
            var request = new CreateCompanyRequest();
            var expectedCompany = new CompanyDTO();

            _mockAdminService
                .Setup(x => x.CreateCompany(request))
                .ReturnsAsync(expectedCompany);

            var result = await _controller.CreateCompany(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedCompany, response.Data);
        }

        [Fact]
        public async Task CreateCompany_Exception_ReturnsInternalServerError()
        {
            var request = new CreateCompanyRequest();
            var errorMessage = "Create failed";

            _mockAdminService
                .Setup(x => x.CreateCompany(request))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.CreateCompany(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        #endregion

        #region UpdateCompany

        [Fact]
        public async Task UpdateCompany_ValidRequest_ReturnsOkResult()
        {
            var request = new UpdateCompanyRequest();
            var expectedCompany = new CompanyDTO();

            _mockAdminService
                .Setup(x => x.UpdateCompany(request))
                .ReturnsAsync(expectedCompany);

            var result = await _controller.UpdateCompany(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedCompany, response.Data);
        }

        [Fact]
        public async Task UpdateCompany_NotFound_ReturnsNotFoundResult()
        {
            var request = new UpdateCompanyRequest();

            _mockAdminService
                .Setup(x => x.UpdateCompany(request))
                .ReturnsAsync((CompanyDTO)null!);

            var result = await _controller.UpdateCompany(request);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Company not found.", response.Error);
        }

        [Fact]
        public async Task UpdateCompany_UnauthorizedException_ReturnsForbidden()
        {
            var request = new UpdateCompanyRequest();
            var errorMessage = "Unauthorized";

            _mockAdminService
                .Setup(x => x.UpdateCompany(request))
                .ThrowsAsync(new UnauthorizedAccessException(errorMessage));

            var result = await _controller.UpdateCompany(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(403, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task UpdateCompany_Exception_ReturnsInternalServerError()
        {
            var request = new UpdateCompanyRequest();
            var errorMessage = "Update failed";

            _mockAdminService
                .Setup(x => x.UpdateCompany(request))
                .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.UpdateCompany(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<CompanyDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
            Assert.Equal(errorMessage, response.Error);
        }

        #endregion

    }
}
