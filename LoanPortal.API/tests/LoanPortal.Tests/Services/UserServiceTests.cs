using FirebaseAdmin.Auth;
using Microsoft.Extensions.Configuration;
using Moq;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Shared;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Xunit;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth;

namespace LoanPortal.Tests.Services
{
    // Test abstraction for UserRecord
    public interface ITestUserRecord
    {
        string Uid { get; }
        string Email { get; }
        bool EmailVerified { get; }
        string DisplayName { get; }
        string PhotoUrl { get; }
        string PhoneNumber { get; }
        bool Disabled { get; }
        long TokensValidAfterTimestamp { get; }
        IReadOnlyDictionary<string, object> CustomClaims { get; }
        IReadOnlyList<IUserInfo> ProviderData { get; }
        string TenantId { get; }
    }

    // Custom class that matches the structure we need
    public class TestUserRecord : ITestUserRecord
    {
        public string Uid { get; set; }
        public string Email { get; set; }
        public bool EmailVerified { get; set; }
        public string DisplayName { get; set; }
        public string PhotoUrl { get; set; }
        public string PhoneNumber { get; set; }
        public bool Disabled { get; set; }
        public long TokensValidAfterTimestamp { get; set; }
        public IReadOnlyDictionary<string, object> CustomClaims { get; set; }
        public IReadOnlyList<IUserInfo> ProviderData { get; set; }
        public string TenantId { get; set; }
    }

    public class UserServiceTests
    {
        private readonly Mock<IUserHelper> _mockUserHelper;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<IHttpClientService> _mockHttpClientService;
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IBlobStorageHelper> _mockBlobStorageHelper;
        private readonly Mock<IFirebaseAuthService> _mockFirebaseAuthService;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _mockUserHelper = new Mock<IUserHelper>();
            _mockConfig = new Mock<IConfiguration>();
            _mockHttpClientService = new Mock<IHttpClientService>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockBlobStorageHelper = new Mock<IBlobStorageHelper>();
            _mockFirebaseAuthService = new Mock<IFirebaseAuthService>();

            _userService = new UserService(
                _mockUserHelper.Object,
                _mockConfig.Object,
                _mockHttpClientService.Object,
                _mockUserRepository.Object,
                _mockBlobStorageHelper.Object,
                _mockFirebaseAuthService.Object
            );

            // Initialize IUserHelper
            _mockUserHelper.Setup(x => x.ValidateUser(It.IsAny<CreateUserRequest>()))
                .ReturnsAsync(string.Empty);
        }

        [Fact]
        public async Task SignUp_ValidUser_ReturnsUserDTO()
        {
            // Arrange
            var createUserRequest = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Phone = "1234567890",
                Password = "Password123!"
            };

            _mockUserHelper.Setup(x => x.ValidateUser(It.IsAny<CreateUserRequest>()))
                .ReturnsAsync(string.Empty);

            var expectedUser = new UserEntity
            {
                Id = Guid.NewGuid(),
                FirstName = createUserRequest.FirstName,
                LastName = createUserRequest.LastName,
                Email = createUserRequest.Email,
                Phone = createUserRequest.Phone,
                IsActive = true,
                FirebaseId = "firebase123",
                CreatedAt = DateTime.UtcNow
            };

            _mockFirebaseAuthService.Setup(x => x.CreateUserAsync(It.IsAny<UserRecordArgs>()))
                .ReturnsAsync("test-uid-123");

            _mockUserRepository.Setup(x => x.CreateUser(It.IsAny<UserEntity>()))
                .Returns(Task.CompletedTask);

            _mockUserRepository.Setup(x => x.GetUserByEmail(createUserRequest.Email))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _userService.SignUp(createUserRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(createUserRequest.Email, result.Email);
            Assert.Equal(createUserRequest.FirstName, result.FirstName);
            Assert.Equal(createUserRequest.LastName, result.LastName);
        }

        [Fact]
        public async Task SignUp_InvalidUser_ThrowsValidationException()
        {
            // Arrange
            var createUserRequest = new CreateUserRequest();
            _mockUserHelper.Setup(x => x.ValidateUser(It.IsAny<CreateUserRequest>()))
                .ReturnsAsync("Invalid user data");

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.SignUp(createUserRequest));
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsLoginResponse()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "john.doe@example.com",
                Password = "Password123!"
            };

            var user = new UserEntity
            {
                Id = Guid.NewGuid(),
                Email = loginRequest.Email,
                IsActive = true
            };

            var firebaseResponse = new FirebaseLoginResponse
            {
                IdToken = "valid-token"
            };

            _mockFirebaseAuthService.Setup(x => x.VerifyIdTokenAsync(It.IsAny<string>()))
                .ReturnsAsync("firebase-id");

            _mockUserRepository.Setup(x => x.GetUserByEmail(loginRequest.Email))
                .ReturnsAsync(user);

            _mockConfig.Setup(x => x["FirebaseKey"])
                .Returns("firebase-key");

            // Mock HTTP response
            var httpResponse = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonSerializer.Serialize(firebaseResponse))
            };

            _mockHttpClientService.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(httpResponse);

            // Act
            var result = await _userService.Login(loginRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(loginRequest.Email, result.Email);
            Assert.Equal(firebaseResponse.IdToken, result.Token);
        }

        [Fact]
        public async Task Login_InactiveUser_ThrowsException()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "john.doe@example.com",
                Password = "Password123!"
            };

            var user = new UserEntity
            {
                Id = Guid.NewGuid(),
                Email = loginRequest.Email,
                IsActive = false
            };

            _mockUserRepository.Setup(x => x.GetUserByEmail(loginRequest.Email))
                .ReturnsAsync(user);

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.Login(loginRequest));
        }

        [Fact]
        public async Task UpdateProfile_ValidRequest_ReturnsUpdatedUserDTO()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var updateRequest = new UpdateProfileRequest
            {
                UserId = userId,
                Address = "123 Main St",
                JobTitle = "Developer",
                CompanyName = "Tech Corp"
            };

            var existingUser = new UserEntity
            {
                Id = userId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                IsActive = true
            };

            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(existingUser);

            _mockUserRepository.Setup(x => x.UpdateUserProfileAsync(userId, It.IsAny<UserEntity>()))
                .Returns(Task.CompletedTask);

            // Setup mock to return updated user data
            var updatedUser = new UserEntity
            {
                Id = userId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                IsActive = true,
                Address = updateRequest.Address,
                JobTitle = updateRequest.JobTitle,
                CompanyName = updateRequest.CompanyName
            };
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(updatedUser);

            // Act
            var result = await _userService.UpdateProfile(updateRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(updateRequest.Address, result.Address);
            Assert.Equal(updateRequest.JobTitle, result.JobTitle);
            Assert.Equal(updateRequest.CompanyName, result.CompanyName);
        }

        [Fact]
        public async Task UpdateProfile_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _userService.UpdateProfile(null));
        }

        [Fact]
        public async Task GetUserProfile_ValidUserId_ReturnsUserDTO()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new UserEntity
            {
                Id = userId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                IsActive = true
            };

            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(user);

            // Act
            var result = await _userService.GetUserProfile(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Email, result.Email);
            Assert.Equal(user.FirstName, result.FirstName);
            Assert.Equal(user.LastName, result.LastName);
        }

        [Fact]
        public async Task GetUserProfile_InvalidUserId_ThrowsException()
        {
            // Arrange
            var userId = Guid.NewGuid();
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync((UserEntity)null);

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.GetUserProfile(userId));
        }

        [Fact]
        public async Task SignUp_UserAlreadyExists_ThrowsException()
        {
            // Arrange
            var createUserRequest = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Phone = "1234567890",
                Password = "Password123!"
            };

            _mockUserHelper.Setup(x => x.ValidateUser(It.IsAny<CreateUserRequest>()))
                .ReturnsAsync("User with given email is already exists.");

            var existingUser = new UserEntity
            {
                Id = Guid.NewGuid(),
                FirstName = createUserRequest.FirstName,
                LastName = createUserRequest.LastName,
                Email = createUserRequest.Email,
                Phone = createUserRequest.Phone,
                IsActive = true,
                FirebaseId = "firebase123",
                CreatedAt = DateTime.UtcNow
            };

            _mockUserRepository.Setup(x => x.CreateUser(It.IsAny<UserEntity>()))
                .Returns(Task.CompletedTask);

            _mockUserRepository.Setup(x => x.GetUserByEmail(createUserRequest.Email))
                .ReturnsAsync(existingUser);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _userService.SignUp(createUserRequest));
            Assert.Contains("User with given email is already exists", exception.Message);
        }

        [Fact]
        public async Task SignUp_InvalidEmail_ThrowsValidationException()
        {
            // Arrange
            var createUserRequest = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "invalid.email", // Invalid email
                Phone = "1234567890",
                Password = "Password123!"
            };

            _mockUserHelper.Setup(x => x.ValidateUser(It.IsAny<CreateUserRequest>()))
                .ReturnsAsync("Invalid email format"); // Expected validation error message

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.SignUp(createUserRequest));
        }

        [Fact]
        public async Task SignUp_InvalidPassword_ThrowsValidationException()
        {
            // Arrange
            var createUserRequest = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Phone = "1234567890",
                Password = "Invalid!" // Invalid password
            };

            _mockUserHelper.Setup(x => x.ValidateUser(It.IsAny<CreateUserRequest>()))
                .ReturnsAsync("Invalid password"); // Validation returns an error message

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.SignUp(createUserRequest));
        }

        [Fact]
        public async Task SignUp_NullRequest_ThrowsArgumentNullException()
        {
            // Arrange
            CreateUserRequest createUserRequest = null;

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.SignUp(createUserRequest));
        }
    }
}