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
            // Arrange
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

            // Act
            var result = await _controller.SignUp(user);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.IsSuccess);
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
            // Arrange
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

            // Act
            var result = await _controller.SignUp(user);

            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal(expectedError, response.Message);
        }

        [Fact]
        public async Task SignUp_DuplicateEmail_ReturnsBadRequest()
        {
            // Arrange
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

            // Act
            var result = await _controller.SignUp(user);

            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("User with given email is already exists.", response.Message);
        }

        [Fact]
        public async Task SignUp_DuplicatePhone_ReturnsBadRequest()
        {
            // Arrange
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

            // Act
            var result = await _controller.SignUp(user);

            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
            var response = Assert.IsType<ApiResponse<UserDTO>>(badRequestResult.Value);
            Assert.Equal("User with given phone number is already exists.", response.Message);
        }
        #endregion

        #region Login Tests
        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "john.doe@example.com",
                Password = "Test@123"
            };

            var expectedResponse = new LoginResponse
            {
                Email = loginRequest.Email,
                Token = "valid-jwt-token"
            };

            _mockUserService.Setup(x => x.Login(loginRequest))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<LoginResponse>>(okResult.Value);
            Assert.True(response.IsSuccess);
            Assert.Equal(expectedResponse, response.Data);
        }

        [Fact]
        public async Task Login_AccountNotFound_ThrowsException()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "nonexistent@example.com",
                Password = "Test@123"
            };

            _mockUserService.Setup(x => x.Login(loginRequest))
                .ThrowsAsync(new Exception("Account not found with given email."));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.Login(loginRequest));
        }

        [Fact]
        public async Task Login_InactiveAccount_ThrowsException()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "inactive@example.com",
                Password = "Test@123"
            };

            _mockUserService.Setup(x => x.Login(loginRequest))
                .ThrowsAsync(new Exception("Account is not active."));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.Login(loginRequest));
        }

        [Fact]
        public async Task Login_InvalidCredentials_ThrowsException()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "john.doe@example.com",
                Password = "WrongPassword"
            };

            _mockUserService.Setup(x => x.Login(loginRequest))
                .ThrowsAsync(new Exception("Login failed: Invalid credentials"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.Login(loginRequest));
        }
        #endregion

        #region UpdateProfile Tests
        [Fact]
        public async Task UpdateProfile_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var updateRequest = new UpdateProfileRequest
            {
                UserId = Guid.NewGuid(),
                Address = "123 Main St",
                JobTitle = "Software Engineer",
                CompanyName = "Tech Corp"
            };

            var expectedUser = new UserDTO
            {
                Id = updateRequest.UserId,
                Address = updateRequest.Address,
                JobTitle = updateRequest.JobTitle,
                CompanyName = updateRequest.CompanyName
            };

            _mockUserService.Setup(x => x.UpdateProfile(updateRequest))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.UpdateProfile(updateRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.IsSuccess);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task UpdateProfile_NullRequest_ThrowsException()
        {
            // Arrange
            UpdateProfileRequest updateRequest = null;

            _mockUserService.Setup(x => x.UpdateProfile(updateRequest))
                .ThrowsAsync(new ArgumentNullException(nameof(updateRequest), "Update profile request cannot be null"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.UpdateProfile(updateRequest));
        }

        [Fact]
        public async Task UpdateProfile_EmptyUserId_ThrowsException()
        {
            // Arrange
            var updateRequest = new UpdateProfileRequest
            {
                UserId = Guid.Empty,
                Address = "123 Main St"
            };

            _mockUserService.Setup(x => x.UpdateProfile(updateRequest))
                .ThrowsAsync(new ValidationException("User ID cannot be empty"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.UpdateProfile(updateRequest));
        }

        [Fact]
        public async Task UpdateProfile_UserNotFound_ThrowsException()
        {
            // Arrange
            var updateRequest = new UpdateProfileRequest
            {
                UserId = Guid.NewGuid(),
                Address = "123 Main St"
            };

            _mockUserService.Setup(x => x.UpdateProfile(updateRequest))
                .ThrowsAsync(new ValidationException($"User with ID {updateRequest.UserId} does not exist"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.UpdateProfile(updateRequest));
        }
        #endregion

        #region GetUserProfile Tests
        [Fact]
        public async Task GetUserProfile_ValidId_ReturnsOkResult()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var expectedUser = new UserDTO
            {
                Id = userId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com"
            };

            _mockUserService.Setup(x => x.GetUserProfile(userId))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.GetUserProfile(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.True(response.IsSuccess);
            Assert.Equal(expectedUser, response.Data);
        }

        [Fact]
        public async Task GetUserProfile_InvalidId_ThrowsException()
        {
            // Arrange
            var userId = Guid.NewGuid();
            _mockUserService.Setup(x => x.GetUserProfile(userId))
                .ThrowsAsync(new ValidationException("User not found"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetUserProfile(userId));
        }

        [Fact]
        public async Task GetUserProfile_EmptyId_ThrowsException()
        {
            // Arrange
            var userId = Guid.Empty;
            _mockUserService.Setup(x => x.GetUserProfile(userId))
                .ThrowsAsync(new ValidationException("Invalid user ID"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetUserProfile(userId));
        }
        #endregion

        #region ResetPassword Tests
        [Fact]
        public async Task ResetPassword_ValidEmail_ReturnsOkWithSuccessResponse()
        {
            // Arrange
            var email = "test@example.com";
            _mockUserService.Setup(x => x.ResetPassword(email))
                           .ReturnsAsync(true);

            // Act
            var result = await _controller.ResetPassword(email);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.True(response.Data);
            Assert.True(response.IsSuccess);
        }

        [Fact]
        public async Task ResetPassword_ValidationException_ThrowsException()
        {
            // Arrange
            var email = "invalid-email";
            var validationMessage = "Invalid email format";
            _mockUserService.Setup(x => x.ResetPassword(email))
                           .ThrowsAsync(new ValidationException(validationMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() =>
                _controller.ResetPassword(email));

            Assert.Contains("Exception in UserController.ResetPassword ->", exception.Message);
            Assert.Contains(validationMessage, exception.Message);
        }

        [Fact]
        public async Task ResetPassword_ServiceCalled_VerifyMethodInvocation()
        {
            // Arrange
            var email = "test@example.com";
            _mockUserService.Setup(x => x.ResetPassword(email))
                           .ReturnsAsync(true);

            // Act
            await _controller.ResetPassword(email);

            // Assert
            _mockUserService.Verify(x => x.ResetPassword(email), Times.Once);
        }
        #endregion

        #region ValidateUserToken Tests
        [Fact]
        public async Task ValidateUserToken_ValidToken_ReturnsOkWithUserData()
        {
            // Arrange
            var token = "valid-jwt-token";
            var expectedUser = new UserDTO
            {
                Email = "test@example.com",
                UserName = "Test User"
            };
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.ValidateUserToken(token);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedUser.Id, response.Data.Id);
            Assert.Equal(expectedUser.Email, response.Data.Email);
            Assert.Equal(expectedUser.UserName, response.Data.UserName);
            Assert.True(response.IsSuccess);
        }

        [Fact]
        public async Task ValidateUserToken_ValidationException_ThrowsException()
        {
            // Arrange
            var token = "invalid-format-token";
            var validationMessage = "Token format is invalid";
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ThrowsAsync(new ValidationException(validationMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() =>
                _controller.ValidateUserToken(token));

            Assert.Contains("Exception in UserController.ValidateUserToken ->", exception.Message);
            Assert.Contains(validationMessage, exception.Message);
        }

        [Fact]
        public async Task ValidateUserToken_GenericException_ThrowsException()
        {
            // Arrange
            var token = "valid-token";
            var errorMessage = "Database connection timeout";
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ThrowsAsync(new Exception(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() =>
                _controller.ValidateUserToken(token));

            Assert.Contains("Exception in UserController.ValidateUserToken ->", exception.Message);
            Assert.Contains(errorMessage, exception.Message);
        }

        [Fact]
        public async Task ValidateUserToken_ServiceCalled_VerifyMethodInvocation()
        {
            // Arrange
            var token = "test-token";
            var user = new UserDTO { Email = "test@example.com" };
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ReturnsAsync(user);

            // Act
            await _controller.ValidateUserToken(token);

            // Assert
            _mockUserService.Verify(x => x.ValidateUserToken(token), Times.Once);
        }

        [Fact]
        public async Task ValidateUserToken_ComplexUserDTO_ReturnsAllProperties()
        {
            // Arrange
            var token = "valid-token";
            var expectedUser = new UserDTO
            {
                Email = "complex@example.com",
                UserName = "Complex User",
            };
            _mockUserService.Setup(x => x.ValidateUserToken(token))
                           .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.ValidateUserToken(token);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedUser.Id, response.Data.Id);
            Assert.Equal(expectedUser.Email, response.Data.Email);
            Assert.Equal(expectedUser.UserName, response.Data.UserName);
            Assert.True(response.IsSuccess);
        }
        #endregion

        [Fact]
        public async Task GetUserByUserName_ValidUserName_ReturnsOkWithUserData()
        {
            // Arrange
            var userName = "testuser";
            var expectedUser = new UserDTO
            {
                Email = "testuser@example.com",
                UserName = "testuser"
            };
            _mockUserService.Setup(x => x.GetUserProfileByUserName(userName))
                           .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.GetUserByUserName(userName);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedUser.Email, response.Data.Email);
            Assert.Equal(expectedUser.UserName, response.Data.UserName);
            Assert.True(response.IsSuccess);
        }

        [Fact]
        public async Task GetUserByUserName_ValidationException_ThrowsException()
        {
            // Arrange
            var userName = "invalid@username";
            var validationMessage = "Username contains invalid characters";
            _mockUserService.Setup(x => x.GetUserProfileByUserName(userName))
                           .ThrowsAsync(new ValidationException(validationMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() =>
                _controller.GetUserByUserName(userName));

            Assert.Contains("Exception in UserController.GetUserProfile ->", exception.Message);
            Assert.Contains(validationMessage, exception.Message);
        }

        [Fact]
        public async Task GetUserByUserName_GenericException_ThrowsException()
        {
            // Arrange
            var userName = "testuser";
            var errorMessage = "Database connection failed";
            _mockUserService.Setup(x => x.GetUserProfileByUserName(userName))
                           .ThrowsAsync(new Exception(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() =>
                _controller.GetUserByUserName(userName));

            Assert.Contains("Exception in UserController.GetUserProfile ->", exception.Message);
            Assert.Contains(errorMessage, exception.Message);
        }

        [Theory]
        [InlineData("user123")]
        [InlineData("test_user")]
        [InlineData("user.name")]
        [InlineData("user-name")]
        [InlineData("123user")]
        public async Task GetUserByUserName_ValidUserNameFormats_ReturnsUserData(string userName)
        {
            // Arrange
            var expectedUser = new UserDTO
            {
                Email = $"{userName}@example.com",
                UserName = userName
            };
            _mockUserService.Setup(x => x.GetUserProfileByUserName(userName))
                           .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.GetUserByUserName(userName);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<UserDTO>>(okResult.Value);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedUser.UserName, response.Data.UserName);
            Assert.True(response.IsSuccess);
        }
    }
} 