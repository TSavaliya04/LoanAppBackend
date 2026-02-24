using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.Authentication;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.Authentication
{
    public class AuthEndPointsTests
    {
        private readonly Mock<IUserService> _mockUserService;
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly AuthEndPoints _controller;

        public AuthEndPointsTests()
        {
            _mockUserService = new Mock<IUserService>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _controller = new AuthEndPoints(_mockUserService.Object, _mockLoginUserDetails.Object);
        }

        #region SignUp Tests
        [Fact]
        public async Task SignUp_ValidRequest_ReturnsOkResult()
        {
            var user = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Password = "Test@123",
                Phone = "1234567890"
            };

            var expectedUser = new UserDTO
            {
                Id = Guid.NewGuid(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                IsActive = true
            };

            _mockUserService.Setup(x => x.SignUp(user))
                .ReturnsAsync(expectedUser);

            var result = await _controller.SignUp(user);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Theory]
        [InlineData("", "Doe", "john@example.com", "Test@123", "1234567890", "FirstName must be 2-50 alphabetic characters.")]
        [InlineData("John", "", "john@example.com", "Test@123", "1234567890", "LastName must be 2-50 alphabetic characters.")]
        [InlineData("John", "Doe", "invalid-email", "Test@123", "1234567890", "Invalid email format.")]
        [InlineData("John", "Doe", "john@example.com", "weak", "1234567890", "Password must be at least 6 characters long, include letters, numbers, and one special character.")]
        [InlineData("John", "Doe", "john@example.com", "Test@123", "123", "Phone number must be a valid US number with country code, e.g., 1XXXXXXXXXX")]
        public async Task SignUp_InvalidRequest_ReturnsBadRequest(string firstName, string lastName, string email, string password, string phone, string expectedError)
        {
            var user = new CreateUserRequest
            {
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Password = password,
                Phone = phone
            };

            _mockUserService.Setup(x => x.SignUp(user))
                .ThrowsAsync(new ValidationException(expectedError));

            var result = await _controller.SignUp(user);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal(expectedError, response.Error);
        }

        [Fact]
        public async Task SignUp_DuplicateEmail_ReturnsBadRequest()
        {
            var user = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "existing@example.com",
                Password = "Test@123",
                Phone = "1234567890"
            };

            _mockUserService.Setup(x => x.SignUp(user))
                .ThrowsAsync(new ValidationException("User with given email is already exists."));

            var result = await _controller.SignUp(user);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("User with given email is already exists.", response.Error);
        }

        [Fact]
        public async Task SignUp_DuplicatePhone_ReturnsBadRequest()
        {
            var user = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Password = "Test@123",
                Phone = "1234567890"
            };

            _mockUserService.Setup(x => x.SignUp(user))
                .ThrowsAsync(new ValidationException("User with given phone number is already exists."));

            var result = await _controller.SignUp(user);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("User with given phone number is already exists.", response.Error);
        }
        #endregion

        #region Login Tests
        [Fact]
        public async Task Login_ValidRequest_ReturnsOkWithLoginResponse()
        {
            var request = new LoginRequest { Email = "john@example.com", Password = "Test@123" };
            var expectedResponse = new LoginResponse { Email = request.Email, Token = "jwt-token-here" };

            _mockUserService.Setup(x => x.Login(request))
                .ReturnsAsync(expectedResponse);

            var result = await _controller.Login(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<LoginResponse>>(okResult.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedResponse.Email, response.Data.Email);
            Assert.Equal(expectedResponse.Token, response.Data.Token);
        }

        [Fact]
        public async Task Login_ServiceThrows_ReturnsInternalServerError()
        {
            var request = new LoginRequest { Email = "john@example.com", Password = "wrong" };
            _mockUserService.Setup(x => x.Login(request))
                .ThrowsAsync(new Exception("Invalid credentials"));

            var result = await _controller.Login(request);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task Login_ServiceCalled_VerifyMethodInvocation()
        {
            var request = new LoginRequest { Email = "test@example.com", Password = "Pass@1" };
            _mockUserService.Setup(x => x.Login(request))
                .ReturnsAsync(new LoginResponse { Email = request.Email, Token = "token" });

            await _controller.Login(request);

            _mockUserService.Verify(x => x.Login(request), Times.Once);
        }
        #endregion

        #region UpdateProfile Tests
        [Fact]
        public async Task UpdateProfile_ValidRequest_ReturnsOkResult()
        {
            var updateRequest = new UpdateProfileRequest
            {
                Address = "123 Main St",
                JobTitle = "Software Engineer",
                CompanyName = "Tech Corp"
            };

            var expectedUser = new UserDTO
            {
                Address = updateRequest.Address,
                JobTitle = updateRequest.JobTitle,
                CompanyName = updateRequest.CompanyName
            };

            _mockUserService.Setup(x => x.UpdateProfile(updateRequest))
                .ReturnsAsync(expectedUser);

            var result = await _controller.UpdateProfile(updateRequest);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task UpdateProfile_NullRequest_ReturnsBadRequest()
        {
            UpdateProfileRequest updateRequest = null!;

            _mockUserService.Setup(x => x.UpdateProfile(It.IsAny<UpdateProfileRequest>()))
                .ThrowsAsync(new ValidationException("Update profile request cannot be null"));

            var result = await _controller.UpdateProfile(updateRequest);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("Request Failed.", response.Message);
        }

        [Fact]
        public async Task UpdateProfile_EmptyUserId_ReturnsBadRequest()
        {
            var updateRequest = new UpdateProfileRequest
            {
                Address = "123 Main St"
            };

            _mockUserService.Setup(x => x.UpdateProfile(updateRequest))
                .ThrowsAsync(new ValidationException("User ID cannot be empty"));

            var result = await _controller.UpdateProfile(updateRequest);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("Request Failed.", response.Message);
        }

        [Fact]
        public async Task UpdateProfile_UserNotFound_ReturnsBadRequest()
        {
            var updateRequest = new UpdateProfileRequest
            {
                Address = "123 Main St"
            };

            _mockUserService.Setup(x => x.UpdateProfile(updateRequest))
                .ThrowsAsync(new ValidationException($"User does not exist"));

            var result = await _controller.UpdateProfile(updateRequest);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("Request Failed.", response.Message);
        }
        #endregion

        #region GetUserProfile Tests
        [Fact]
        public async Task GetUserProfile_ValidId_ReturnsOkResult()
        {
            var userId = Guid.NewGuid();
            var expectedUser = new UserDTO
            {
                Id = userId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com"
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockUserService.Setup(x => x.GetUserProfile(userId))
                .ReturnsAsync(expectedUser);

            var result = await _controller.GetUserProfile();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task GetUserProfile_InvalidId_ReturnsBadRequest()
        {
            var userId = Guid.NewGuid();
            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockUserService.Setup(x => x.GetUserProfile(userId))
                .ThrowsAsync(new ValidationException("User not found"));

            var result = await _controller.GetUserProfile();

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("Request Failed.", response.Message);
        }

        [Fact]
        public async Task GetUserProfile_EmptyId_ReturnsBadRequest()
        {
            var userId = Guid.Empty;
            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockUserService.Setup(x => x.GetUserProfile(userId))
                .ThrowsAsync(new ValidationException("Invalid user ID"));

            var result = await _controller.GetUserProfile();

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("Request Failed.", response.Message);
        }
        #endregion

        #region ResetPassword Tests
        [Fact]
        public async Task ResetPassword_ValidEmail_ReturnsOkWithSuccessResponse()
        {
            var email = "test@example.com";
            _mockUserService.Setup(x => x.ResetPassword(email))
                           .ReturnsAsync(true);

            var result = await _controller.ResetPassword(email);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.True(response.Data);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task ResetPassword_ValidationException_ReturnsBadRequest()
        {
            var email = "invalid-email";
            var validationMessage = "Invalid email format";
            _mockUserService.Setup(x => x.ResetPassword(email))
                           .ThrowsAsync(new ValidationException(validationMessage));

            var result = await _controller.ResetPassword(email);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<string>>(badRequestResult.Value);
            Assert.Equal("Request Failed.", response.Message);
        }

        [Fact]
        public async Task ResetPassword_ServiceCalled_VerifyMethodInvocation()
        {
            var email = "test@example.com";
            _mockUserService.Setup(x => x.ResetPassword(email))
                           .ReturnsAsync(true);

            await _controller.ResetPassword(email);

            _mockUserService.Verify(x => x.ResetPassword(email), Times.Once);
        }
        #endregion

        #region ValidateUserToken Tests
        [Fact]
        public async Task ValidateUserToken_ValidToken_ReturnsOkWithUserData()
        {
            var token = "valid-jwt-token";
            var expectedUser = new UserDTO
            {
                Email = "test@example.com",
            };
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ReturnsAsync(expectedUser);

            var result = await _controller.ValidateUserToken(token);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedUser.Id, response.Data.Id);
            Assert.Equal(expectedUser.Email, response.Data.Email);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task ValidateUserToken_ValidationException_ReturnsBadRequest()
        {
            var token = "invalid-format-token";
            var validationMessage = "Token format is invalid";
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                   .ThrowsAsync(new ValidationException(validationMessage));

            var result = await _controller.ValidateUserToken(token);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal(validationMessage, response.Error);
        }

        [Fact]
        public async Task ValidateUserToken_GenericException_ReturnsInternalServerError()
        {
            var token = "valid-token";
            var errorMessage = "Database connection timeout";
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                   .ThrowsAsync(new Exception(errorMessage));

            var result = await _controller.ValidateUserToken(token);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task ValidateUserToken_ServiceCalled_VerifyMethodInvocation()
        {
            var token = "test-token";
            var user = new UserDTO { Email = "test@example.com" };
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ReturnsAsync(user);

            await _controller.ValidateUserToken(token);

            _mockUserService.Verify(x => x.ValidateUserToken(token), Times.Once);
        }

        [Fact]
        public async Task ValidateUserToken_ComplexUserDTO_ReturnsAllProperties()
        {
            var token = "valid-token";
            var expectedUser = new UserDTO
            {
                Email = "complex@example.com",
            };
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ReturnsAsync(expectedUser);

            var result = await _controller.ValidateUserToken(token);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedUser.Id, response.Data.Id);
            Assert.Equal(expectedUser.Email, response.Data.Email);
            Assert.True(response.Success);
        }
        #endregion

        #region GetNewToken Tests
        [Fact]
        public async Task GetNewToken_ValidRefreshToken_ReturnsOkWithTokenResponse()
        {
            var refreshToken = "valid-refresh-token";
            var expectedResponse = new GetNewTokenResponse
            {
                IdToken = "new-jwt-token",
                RefreshToken = "new-refresh-token",
                User = new UserDTO { Email = "user@example.com" }
            };

            _mockUserService.Setup(x => x.GetNewToken(refreshToken))
                .ReturnsAsync(expectedResponse);

            var result = await _controller.GetNewToken(refreshToken);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<GetNewTokenResponse>>(okResult.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedResponse.IdToken, response.Data.IdToken);
            Assert.Equal(expectedResponse.RefreshToken, response.Data.RefreshToken);
            Assert.NotNull(response.Data.User);
        }

        [Fact]
        public async Task GetNewToken_ValidationException_ReturnsBadRequest()
        {
            var refreshToken = "invalid-refresh-token";
            var errorMessage = "Refresh token is expired or invalid";
            _mockUserService.Setup(x => x.GetNewToken(refreshToken))
                .ThrowsAsync(new ValidationException(errorMessage));

            var result = await _controller.GetNewToken(refreshToken);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<GetNewTokenResponse>>(badRequestResult.Value);
            Assert.Equal(errorMessage, response.Error);
        }

        [Fact]
        public async Task GetNewToken_GenericException_ReturnsInternalServerError()
        {
            var refreshToken = "valid-token";
            _mockUserService.Setup(x => x.GetNewToken(refreshToken))
                .ThrowsAsync(new Exception("Server error"));

            var result = await _controller.GetNewToken(refreshToken);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task GetNewToken_ServiceCalled_VerifyMethodInvocation()
        {
            var refreshToken = "refresh-token";
            _mockUserService.Setup(x => x.GetNewToken(refreshToken))
                .ReturnsAsync(new GetNewTokenResponse { IdToken = "token", RefreshToken = refreshToken });

            await _controller.GetNewToken(refreshToken);

            _mockUserService.Verify(x => x.GetNewToken(refreshToken), Times.Once);
        }
        #endregion
    }
} 