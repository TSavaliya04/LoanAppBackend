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
using LoanPortal.Shared.Constants;
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
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _mockUserHelper = new Mock<IUserHelper>();
            _mockConfig = new Mock<IConfiguration>();
            _mockHttpClientService = new Mock<IHttpClientService>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockBlobStorageHelper = new Mock<IBlobStorageHelper>();
            _mockFirebaseAuthService = new Mock<IFirebaseAuthService>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();

            _userService = new UserService(
                _mockUserHelper.Object,
                _mockConfig.Object,
                _mockHttpClientService.Object,
                _mockUserRepository.Object,
                _mockBlobStorageHelper.Object,
                _mockFirebaseAuthService.Object,
                _mockLoginUserDetails.Object
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
            await Assert.ThrowsAsync<ValidationException>(() => _userService.SignUp(createUserRequest));
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

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);

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
            await Assert.ThrowsAsync<NullReferenceException>(() => _userService.UpdateProfile(null));
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

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);

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
            await Assert.ThrowsAsync<NullReferenceException>(() => _userService.GetUserProfile(userId));
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
            var exception = await Assert.ThrowsAsync<ValidationException>(() => _userService.SignUp(createUserRequest));
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
            await Assert.ThrowsAsync<ValidationException>(() => _userService.SignUp(createUserRequest));
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
            await Assert.ThrowsAsync<ValidationException>(() => _userService.SignUp(createUserRequest));
        }

        [Fact]
        public async Task SignUp_NullRequest_ThrowsArgumentNullException()
        {
            // Arrange
            CreateUserRequest createUserRequest = null;

            // Act & Assert
            await Assert.ThrowsAsync<NullReferenceException>(() => _userService.SignUp(createUserRequest));
        }

        [Fact]
        public async Task ResetPassword_ValidEmail_ReturnsTrue()
        {
            // Arrange
            string email = "test@example.com";
            string expectedLink = "https://firebase.com/reset-link";

            var existingUser = new UserEntity
            {
                Id = Guid.NewGuid(),
                Email = email,
                FirstName = "Test",
                LastName = "User",
                IsActive = true
            };

            _mockUserRepository
                .Setup(x => x.GetUserByEmail(email))
                .ReturnsAsync(existingUser);

            _mockFirebaseAuthService
                .Setup(x => x.GeneratePasswordResetLinkAsync(email))
                .ReturnsAsync(expectedLink);

            _mockUserHelper
                .Setup(x => x.ResetPassword(email, expectedLink))
                .Verifiable();

            // Act
            bool result = await _userService.ResetPassword(email);

            // Assert
            Assert.True(result);
            _mockUserRepository.Verify(x => x.GetUserByEmail(email), Times.Once);
            _mockFirebaseAuthService.Verify(x => x.GeneratePasswordResetLinkAsync(email), Times.Once);
            _mockUserHelper.Verify(x => x.ResetPassword(email, expectedLink), Times.Once);
        }

        [Fact]
        public async Task ResetPassword_FirebaseServiceThrowsException_ThrowsException()
        {
            // Arrange
            string email = "test@example.com";
            var expectedException = new Exception("Firebase service error");

            _mockFirebaseAuthService
                .Setup(x => x.GeneratePasswordResetLinkAsync(email))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var actualException = await Assert.ThrowsAsync<ValidationException>(() => _userService.ResetPassword(email));

            _mockFirebaseAuthService.Verify(x => x.GeneratePasswordResetLinkAsync(email), Times.Never);
            _mockUserHelper.Verify(x => x.ResetPassword(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task ValidateUserToken_VerifyIdTokenFails_ThrowsValidationException()
        {
            // Arrange
            var token = "invalid-token";
            var validationException = new ValidationException("Invalid token");

            _mockFirebaseAuthService
                .Setup(x => x.VerifyIdTokenAsync(token))
                .ThrowsAsync(validationException);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ValidationException>(() => _userService.ValidateUserToken(token));
            Assert.Equal("Invalid token", ex.Message);
        }

        [Fact]
        public async Task GetNewToken_ValidRefreshToken_ReturnsResponseWithUserAndSetsClaims()
        {
            // Arrange
            var refreshToken = "valid-refresh-token";
            var firebaseUserId = "firebase-user-id";

            var initialResponse = new GetNewTokenResponse
            {
                IdToken = "new-id-token",
                RefreshToken = "new-refresh-token"
            };

            var user = new UserEntity
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                FirstName = "John",
                LastName = "Doe",
                Phone = "1234567890"
            };

            _mockFirebaseAuthService
                .Setup(x => x.GetNewTokenAsync(refreshToken))
                .ReturnsAsync((initialResponse, firebaseUserId));

            _mockUserRepository
                .Setup(x => x.GetUserByFirebaseId(firebaseUserId))
                .ReturnsAsync(user);

            _mockFirebaseAuthService
                .Setup(x => x.SetCustomUserClaimsAsync(firebaseUserId, It.IsAny<Dictionary<string, object>>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _userService.GetNewToken(refreshToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(initialResponse.IdToken, result.IdToken);
            Assert.Equal(initialResponse.RefreshToken, result.RefreshToken);
            Assert.NotNull(result.User);
            Assert.Equal(user.Email, result.User.Email);

            _mockFirebaseAuthService.Verify(x => x.GetNewTokenAsync(refreshToken), Times.Once);
            _mockUserRepository.Verify(x => x.GetUserByFirebaseId(firebaseUserId), Times.Once);
            _mockFirebaseAuthService.Verify(x => x.SetCustomUserClaimsAsync(firebaseUserId, It.IsAny<Dictionary<string, object>>()), Times.Once);
        }

        [Fact]
        public async Task GetNewToken_AdminUser_SetsIsAdminClaim()
        {
            // Arrange
            var refreshToken = "admin-refresh-token";
            var firebaseUserId = "admin-firebase-id";

            var response = new GetNewTokenResponse
            {
                IdToken = "admin-id-token",
                RefreshToken = "admin-refresh-token"
            };

            var adminUser = new UserEntity
            {
                Id = IConstants.AdminId,
                Email = "admin@example.com",
                FirstName = "Admin",
                LastName = "User",
                Phone = "9999999999"
            };

            _mockFirebaseAuthService
                .Setup(x => x.GetNewTokenAsync(refreshToken))
                .ReturnsAsync((response, firebaseUserId));

            _mockUserRepository
                .Setup(x => x.GetUserByFirebaseId(firebaseUserId))
                .ReturnsAsync(adminUser);

            Dictionary<string, object>? capturedClaims = null;
            _mockFirebaseAuthService
                .Setup(x => x.SetCustomUserClaimsAsync(firebaseUserId, It.IsAny<Dictionary<string, object>>()))
                .Callback<string, Dictionary<string, object>>((uid, claims) => capturedClaims = claims)
                .Returns(Task.CompletedTask);

            // Act
            await _userService.GetNewToken(refreshToken);

            // Assert
            Assert.NotNull(capturedClaims);
            Assert.True(capturedClaims!.ContainsKey("isAdmin"));
            Assert.True((bool)capturedClaims["isAdmin"]);
        }
    }
}