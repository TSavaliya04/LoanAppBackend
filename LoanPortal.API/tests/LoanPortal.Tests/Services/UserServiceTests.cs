using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth;
using Google.Apis.Auth.OAuth2;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Shared;
using Microsoft.Extensions.Configuration;
using Moq;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Xunit;

namespace LoanPortal.Tests.Services
{
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
            await Assert.ThrowsAsync<ValidationException>(() => _userService.GetUserProfile(userId));
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

        //[Fact]
        //public async Task ValidateUserToken_WithValidPhoneProvider_ReturnsUserDTO()
        //{
        //    // Arrange
        //    var token = "valid_token";
        //    var uid = "firebase_uid";
        //    var phoneNumber = "+1234567890";
        //    var phone = "1234567890";

        //    // Create mock UserRecord with phone provider
        //    var userRecord = new Mock<UserRecord>();
        //    userRecord.Setup(x => x.Uid).Returns(uid);
        //    userRecord.Setup(x => x.PhoneNumber).Returns(phoneNumber);

        //    // Create mock provider data for phone
        //    var providerInfo = new Mock<UserInfo>();
        //    providerInfo.Setup(x => x.ProviderId).Returns("phone");

        //    var providerData = new UserInfo[] { providerInfo.Object };
        //    userRecord.Setup(x => x.ProviderData).Returns(providerData);

        //    var userEntity = new UserEntity
        //    {
        //        Id = Guid.NewGuid(),
        //        Phone = phone,
        //        Email = "test@example.com",
        //        FirstName = "John",
        //        LastName = "Doe"
        //    };

        //    _mockFirebaseAuthService.Setup(x => x.VerifyIdTokenAsync(token))
        //        .ReturnsAsync(uid);
        //    _mockFirebaseAuthService.Setup(x => x.GetUserAsync(uid))
        //        .ReturnsAsync(userRecord.Object);
        //    _mockUserRepository.Setup(x => x.GetUserByPhone(phone))
        //        .ReturnsAsync(userEntity);
        //    _mockFirebaseAuthService.Setup(x => x.SetCustomUserClaimsAsync(uid, It.IsAny<Dictionary<string, object>>()))
        //        .Returns(Task.CompletedTask);

        //    // Act
        //    var result = await _userService.ValidateUserToken(token);

        //    // Assert
        //    _mockFirebaseAuthService.Verify(x => x.VerifyIdTokenAsync(token), Times.Once);
        //    _mockFirebaseAuthService.Verify(x => x.GetUserAsync(uid), Times.Once);
        //    _mockUserRepository.Verify(x => x.GetUserByPhone(phone), Times.Once);
        //    _mockFirebaseAuthService.Verify(x => x.SetCustomUserClaimsAsync(uid, It.IsAny<Dictionary<string, object>>()), Times.Once);
        //}

        //[Fact]
        //public async Task ValidateUserToken_WithValidPasswordProvider_ReturnsUserDTO()
        //{
        //    // Arrange
        //    var token = "valid_token";
        //    var uid = "firebase_uid";
        //    var email = "test@example.com";

        //    // Create mock UserRecord with password provider
        //    var userRecord = new Mock<UserRecord>();
        //    userRecord.Setup(x => x.Uid).Returns(uid);

        //    // Create mock provider data for password
        //    var providerInfo = new Mock<UserInfo>();
        //    providerInfo.Setup(x => x.ProviderId).Returns("password");
        //    providerInfo.Setup(x => x.Email).Returns(email);

        //    var providerData = new UserInfo[] { providerInfo.Object };
        //    userRecord.Setup(x => x.ProviderData).Returns(providerData);

        //    var userEntity = new UserEntity
        //    {
        //        Id = Guid.NewGuid(),
        //        Email = email,
        //        Phone = "1234567890",
        //        FirstName = "John",
        //        LastName = "Doe"
        //    };

        //    _mockFirebaseAuthService.Setup(x => x.VerifyIdTokenAsync(token))
        //        .ReturnsAsync(uid);
        //    _mockFirebaseAuthService.Setup(x => x.GetUserAsync(uid))
        //        .ReturnsAsync(userRecord.Object);
        //    _mockUserRepository.Setup(x => x.GetUserByEmail(email))
        //        .ReturnsAsync(userEntity);
        //    _mockFirebaseAuthService.Setup(x => x.SetCustomUserClaimsAsync(uid, It.IsAny<Dictionary<string, object>>()))
        //        .Returns(Task.CompletedTask);

        //    // Act
        //    var result = await _service.ValidateUserToken(token);

        //    // Assert
        //    result.Should().NotBeNull();
        //    _mockFirebaseAuthService.Verify(x => x.VerifyIdTokenAsync(token), Times.Once);
        //    _mockFirebaseAuthService.Verify(x => x.GetUserAsync(uid), Times.Once);
        //    _mockUserRepository.Verify(x => x.GetUserByEmail(email), Times.Once);
        //    _mockFirebaseAuthService.Verify(x => x.SetCustomUserClaimsAsync(uid, It.IsAny<Dictionary<string, object>>()), Times.Once);
        //}

        //[Fact]
        //public async Task ValidateUserToken_WithInvalidToken_ThrowsException()
        //{
        //    // Arrange
        //    var token = "invalid_token";

        //    _mockFirebaseAuthService.Setup(x => x.VerifyIdTokenAsync(token))
        //        .ThrowsAsync(new FirebaseAuthException(ErrorCode.InvalidIdToken, "Invalid token"));

        //    // Act & Assert
        //    await Assert.ThrowsAsync<FirebaseAuthException>(() => _service.ValidateUserToken(token));
        //    _mockFirebaseAuthService.Verify(x => x.VerifyIdTokenAsync(token), Times.Once);
        //}
    }
}