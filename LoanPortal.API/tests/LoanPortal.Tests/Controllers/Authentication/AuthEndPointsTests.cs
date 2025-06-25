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
    }
} 