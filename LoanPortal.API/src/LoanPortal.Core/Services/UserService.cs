using FirebaseAdmin.Auth;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared;
using LoanPortal.Shared.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations;
using System.Numerics;
using System.Reflection.Metadata.Ecma335;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace LoanPortal.Core.Services
{
    public class UserService : IUserService
    {
        private readonly IUserHelper _userHelper;
        private readonly IConfiguration _config;
        private readonly IHttpClientService _httpClientService;
        private readonly IUserRepository _userRepository;
        private readonly IBlobStorageHelper _blobStorageHelper;
        private readonly IFirebaseAuthService _firebaseAuthService;
        private readonly ILoginUserDetails _loginUserDetails;
        private readonly ICompanyRepository _companyRepository;
        private readonly INotificationService _notificationService;
        private readonly ITeamRepository _teamRepository;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserHelper userHelper,
            IConfiguration config,
            IHttpClientService httpClientService,
            IUserRepository userRepository,
            IBlobStorageHelper blobStorageHelper,
            IFirebaseAuthService firebaseAuthService,
            ILoginUserDetails loginUserDetails,
            ICompanyRepository companyRepository,
            ITeamRepository teamRepository,
            INotificationService notificationService,
            ILogger<UserService>? logger = null)
        {
            _userHelper = userHelper;
            _config = config;
            _httpClientService = httpClientService;
            _userRepository = userRepository;
            _blobStorageHelper = blobStorageHelper;
            _firebaseAuthService = firebaseAuthService;
            _loginUserDetails = loginUserDetails; 
            _companyRepository = companyRepository;
            _teamRepository = teamRepository;
            _notificationService = notificationService;
            _logger = logger ?? NullLogger<UserService>.Instance;
        }

        public async Task<UserDTO> SignUp(CreateUserRequest user)
        {
            try
            {
                string error = await _userHelper.ValidateUser(user);
                if (!string.IsNullOrEmpty(error))
                {
                    throw new ValidationException(error);
                }

                UserRecordArgs args = new UserRecordArgs()
                {
                    Email = user.Email,
                    EmailVerified = true,
                    Password = user.Password,
                    DisplayName = user.FirstName + " " + user.LastName,
                    Disabled = false,
                };
                if (user != null && !string.IsNullOrEmpty(user.Phone))
                {
                    user.Phone = user.Phone.Replace(" ", "");
                    args.PhoneNumber = "+" + user.Phone;
                }

                // Create Firebase user
                string newUserId = await _firebaseAuthService.CreateUserAsync(args);

                // Create user
                UserEntity userEntity = new UserEntity
                {
                    Id = Guid.NewGuid(),
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    IsActive = true,
                    Role = user.Role ?? Shared.Enum.UserRole.User, // Default to User if not specified
                    FirebaseId = newUserId,
                    CreatedAt = DateTime.UtcNow,
                };
                if (user != null && !string.IsNullOrEmpty(user.Phone))
                {
                    userEntity.Phone = user.Phone;
                }
                await _userRepository.CreateUser(userEntity);

                var entity = await _userRepository.GetUserByEmail(user.Email);
                _userHelper.SendWelcomeMail(userEntity.Email, user.FirstName + " " + user.LastName);
                return UserHelper.MaptoUserDTO(entity);
            }
            catch (ValidationException ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<UserDTO> SignUpBorrower(CreateUserRequest request)
        {
            var userDto = await SignUp(new CreateUserRequest
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Password = request.Password,
                Phone = request.Phone,
                Role = Shared.Enum.UserRole.Borrower,
                LoanOfficerId = request.LoanOfficerId
            });

            if (request.LoanOfficerId.HasValue && userDto.Id.HasValue)
            {
                var loUser = await _userRepository.GetUserById(request.LoanOfficerId.Value);
                var borrowerUser = await _userRepository.GetUserById(userDto.Id.Value);

                if (loUser != null && borrowerUser != null)
                {
                    _ = _notificationService.NotifyBorrowerCreatedViaLinkAsync(borrowerUser, loUser);
                }
            }

            return userDto;
        }

        public async Task<LoginResponse> Login(LoginRequest request)
        {
            try
            {
                UserEntity user = await _userRepository.GetUserByEmail(request.Email);
                if (user == null)
                {
                    throw new Exception("Account not found with given email.");
                }
                else if (!user.IsActive)
                {
                    throw new Exception("Account is not active.");
                }

                var requestBody = new
                {
                    email = request.Email,
                    password = request.Password,
                    returnSecureToken = true
                };
                var firebaseKey = Environment.GetEnvironmentVariable("FirebaseKey") ?? _config["FirebaseKey"];
                var url = $"{IConstants.FirebaseLoginURL}{firebaseKey}";
                var json = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await _httpClientService.PostAsync(url, json);
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Login failed: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var loginResponse = JsonSerializer.Deserialize<FirebaseLoginResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                //Setting Custom Claims
                string uid = await _firebaseAuthService.VerifyIdTokenAsync(loginResponse.IdToken);
                var claims = new Dictionary<string, object>()
                {
                    { "UserId", user.Id },
                    { "Phone", user.Phone },
                    { "Email", user.Email },
                    { "UserName", user.FirstName + " " + user.LastName },
                    { "Role", (int)user.Role }
                };
                if (user.CompanyId.HasValue)
                {
                    claims.Add("CompanyId", user.CompanyId.Value.ToString());
                }
                await _firebaseAuthService.SetCustomUserClaimsAsync(uid, claims);

                return new LoginResponse
                {
                    Email = user.Email,
                    Token = loginResponse.IdToken
                };
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<UserDTO> UpdateProfile(UpdateProfileRequest request)
        {
            try
            {
                Guid currentUserId = _loginUserDetails.UserID;
                Guid targetUserId = request.UserId ?? currentUserId;
                UserEntity existingUser = await _userRepository.GetUserById(targetUserId);

                if (existingUser == null)
                {
                    throw new ValidationException("User not found.");
                }

                if (targetUserId != currentUserId)
                {
                    if (_loginUserDetails.Role == Shared.Enum.UserRole.User)
                    {
                        throw new UnauthorizedAccessException("You can only update your own profile.");
                    }

                    if (_loginUserDetails.Role == Shared.Enum.UserRole.CompanyAdmin && existingUser.CompanyId != _loginUserDetails.CompanyId)
                    {
                        throw new UnauthorizedAccessException("You can only update users within your company.");
                    }
                }

                // Status change guards
                if (request.IsActive.HasValue)
                {
                    if (_loginUserDetails.Role == Shared.Enum.UserRole.User)
                    {
                        throw new UnauthorizedAccessException("You are not allowed to change user status.");
                    }

                    if (_loginUserDetails.Role == Shared.Enum.UserRole.CompanyAdmin)
                    {
                        if (existingUser.Role == Shared.Enum.UserRole.SuperAdmin)
                            throw new UnauthorizedAccessException("Company admins cannot change the status of a SuperAdmin.");

                        if (existingUser.CompanyId != _loginUserDetails.CompanyId)
                            throw new UnauthorizedAccessException("You can only change the status of users within your company.");
                    }

                    // SuperAdmin can change status of both CompanyAdmin and User — no extra guard needed
                }

                // Role change guards
                if (request.Role.HasValue)
                {
                    if (_loginUserDetails.Role == Shared.Enum.UserRole.User)
                    {
                        throw new UnauthorizedAccessException("You are not allowed to change user roles.");
                    }

                    if (_loginUserDetails.Role == Shared.Enum.UserRole.CompanyAdmin)
                    {
                        if (request.Role.Value == Shared.Enum.UserRole.SuperAdmin)
                        {
                            throw new UnauthorizedAccessException("Company admins cannot assign the SuperAdmin role.");
                        }

                        if (existingUser.Role == Shared.Enum.UserRole.SuperAdmin)
                        {
                            throw new UnauthorizedAccessException("Company admins cannot change the role of a SuperAdmin.");
                        }

                        if (existingUser.CompanyId != _loginUserDetails.CompanyId)
                        {
                            throw new UnauthorizedAccessException("You can only change the role of users within your company.");
                        }
                    }
                }
                
                request.UserId = targetUserId;


                string url = "";
                if (request.Profile != null)
                {
                    if (request.Profile.Length > 2 * 1024 * 1024)
                    {
                        throw new ValidationException("Profile photo size cannot exceed 2 MB.");
                    }

                    if (BlobStorageHelper.isValidFile(request.Profile.FileName))
                    {
                        string filename = $"{request.Profile.FileName.Split(".")[0]}_{DateTime.UtcNow:yyMMddHHmmss}.{request.Profile.FileName.Split(".")[1]}";
                        Uri fileURI = await _blobStorageHelper.UploadFileBlobAsyncUsingSAS(request.Profile.OpenReadStream(), filename, "ProfilePictures");
                        url = fileURI.ToString();
                    }
                }

                // Create a new UserEntity with update data
                var updateEntity = new UserEntity
                {
                    Id = existingUser.Id,           // must match the document's _id for ReplaceOneAsync
                    Role = request.Role ?? existingUser.Role,
                    FirstName = request.FirstName ?? existingUser.FirstName,
                    LastName = request.LastName ?? existingUser.LastName,
                    Email = existingUser.Email,
                    Phone = request.Phone ?? existingUser.Phone,
                    IsActive = request.IsActive ?? existingUser.IsActive,
                    FirebaseId = existingUser.FirebaseId,
                    CreatedAt = existingUser.CreatedAt,
                    LastLoginDate = existingUser.LastLoginDate,
                    Address = request.Address ?? existingUser.Address,
                    Profile = !string.IsNullOrEmpty(url) ? url.Split("?")[0] : existingUser.Profile,
                    JobTitle = request.JobTitle ?? existingUser.JobTitle,
                    NMLS = request.NMLS ?? existingUser.NMLS,
                    CompanyId = request.CompanyId ?? existingUser.CompanyId,
                    TeamId = request.TeamId ?? existingUser.TeamId,
                    PasswordChangeRequired = existingUser.PasswordChangeRequired,
                    TemporaryPasswordExpiresAtUtc = existingUser.TemporaryPasswordExpiresAtUtc,
                    UpdatedAt = DateTime.UtcNow
                };

                //// Use UpdateHelper to update only the provided fields
                //UpdateHelper.UpdateEntity(existingUser, updateEntity);

                // Update the user document
                await _userRepository.UpdateUserProfileAsync(targetUserId, updateEntity);

                // Track last activity for normal users updating their own profile
                if (_loginUserDetails.Role == Shared.Enum.UserRole.User && targetUserId == currentUserId)
                {
                    await _userRepository.UpdateUserLastActivityAsync(targetUserId, DateTime.UtcNow);
                }

                // Update Firebase user if phone or display name changed
                bool shouldUpdateFirebase = false;
                var firebaseUpdateArgs = new UserRecordArgs
                {
                    Uid = existingUser.FirebaseId
                };

                // Check if display name changed
                string newDisplayName = $"{updateEntity.FirstName} {updateEntity.LastName}";
                string oldDisplayName = $"{existingUser.FirstName} {existingUser.LastName}";
                if (newDisplayName != oldDisplayName)
                {
                    firebaseUpdateArgs.DisplayName = newDisplayName;
                    shouldUpdateFirebase = true;
                }

                // Check if phone changed
                if (!string.IsNullOrEmpty(updateEntity.Phone) && updateEntity.Phone != existingUser.Phone)
                {
                    string formattedPhone = updateEntity.Phone.Replace(" ", "");
                    firebaseUpdateArgs.PhoneNumber = "+" + formattedPhone;
                    shouldUpdateFirebase = true;
                }

                if (shouldUpdateFirebase)
                {
                    await _firebaseAuthService.UpdateUserAsync(existingUser.FirebaseId, firebaseUpdateArgs);
                }

                // Return updated user data
                return UserHelper.MaptoUserDTO(await _userRepository.GetUserById(targetUserId));
            }
            catch (ValidationException ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<UserDTO> GetUserProfile(Guid userId)
        {
            try
            {
                var user = await _userRepository.GetUserById(userId);
                if (user == null)
                {
                    throw new ValidationException($"User not found.");
                }

                if (!string.IsNullOrEmpty(user.Profile)){
                    user.Profile = user.Profile + "?" + IConstants.AzureToken;
                }

                var userDto = UserHelper.MaptoUserDTO(user);
                
                if (user.CompanyId.HasValue)
                {
                    var company = await _companyRepository.GetCompanyByIdAsync(user.CompanyId.Value);
                    if (company != null)
                    {
                        userDto.CompanyName = company.Name;
                    }
                }

                if (user.TeamId.HasValue)
                {
                    var team = await _teamRepository.GetTeamByIdAsync(user.TeamId.Value);
                    if (team != null)
                    {
                        userDto.TeamName = team.Name;
                    }
                }

                return userDto;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<UserDTO> ValidateUserToken(string token)
        {
            try
            {
                string uid = await _firebaseAuthService.VerifyIdTokenAsync(token, true);
                UserRecord userRecord = await _firebaseAuthService.GetUserAsync(uid);

                var user = new UserEntity();
                if (userRecord.ProviderData != null && userRecord.ProviderData.ToList().Count > 0 && userRecord.ProviderData[0].ProviderId == "phone")
                {
                    var phone = userRecord.PhoneNumber.Substring(1);
                    user = await _userRepository.GetUserByPhone(phone);
                }
                else if (userRecord.ProviderData != null && userRecord.ProviderData.ToList().Count > 0 && userRecord.ProviderData[0].ProviderId == "password")
                {
                    user = await _userRepository.GetUserByEmail(userRecord.ProviderData[0].Email);
                }

                if (user == null || user.Id == Guid.Empty)
                {
                    throw new ValidationException($"User with email {user.Email} not found.");
                }

                EnsureTemporaryPasswordIsNotExpired(user);

                if (user.Role == Shared.Enum.UserRole.SuperAdmin || user.Role == Shared.Enum.UserRole.CompanyAdmin)
                {
                    throw new UnauthorizedAccessException("Admin can't login in user portal");
                }

                var claims = new Dictionary<string, object>()
                {
                    { "UserId", user.Id },
                    { "Phone", user.Phone },
                    { "Email", user.Email },
                    { "UserName", user.FirstName + " " + user.LastName },
                    { "Role", (int)user.Role }
                };
                if (user.CompanyId.HasValue)
                {
                    claims.Add("CompanyId", user.CompanyId.Value.ToString());
                }

                // Track login activity
                await _userRepository.UpdateUserLoginActivity(user.Id, DateTime.UtcNow);
                await _userRepository.UpdateUserLastActivityAsync(user.Id, DateTime.UtcNow);

                await _firebaseAuthService.SetCustomUserClaimsAsync(uid, claims);
                return UserHelper.MaptoUserDTO(user);
            }
            catch (ValidationException ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<UserDTO> ValidateBorrowerToken(string token)
        {
            try
            {
                string uid = await _firebaseAuthService.VerifyIdTokenAsync(token, true);
                UserRecord userRecord = await _firebaseAuthService.GetUserAsync(uid);

                var user = new UserEntity();
                var email = userRecord.Email;
                var phone = userRecord.PhoneNumber;

                if (userRecord.ProviderData != null && userRecord.ProviderData.ToList().Count > 0)
                {
                    if (userRecord.ProviderData[0].ProviderId == "phone")
                    {
                        phone = userRecord.PhoneNumber.Substring(1);
                        user = await _userRepository.GetUserByPhone(phone);
                    }
                    else if (userRecord.ProviderData[0].ProviderId == "password")
                    {
                        email = userRecord.ProviderData[0].Email;
                        user = await _userRepository.GetUserByEmail(email);
                    }
                }

                // Throw if borrower doesn't exist (must use SignUp flow)
                if (user == null || user.Id == Guid.Empty)
                {
                    throw new ValidationException($"Borrower with email {email} not found.");
                }

                if (user.Role != Shared.Enum.UserRole.Borrower)
                {
                    throw new UnauthorizedAccessException("Only borrowers can authenticate via this endpoint.");
                }

                var claims = new Dictionary<string, object>()
                {
                    { "UserId", user.Id },
                    { "Phone", user.Phone ?? "" },
                    { "Email", user.Email ?? "" },
                    { "UserName", (user.FirstName + " " + user.LastName).Trim() },
                    { "Role", (int)user.Role }
                };

                await _userRepository.UpdateUserLoginActivity(user.Id, DateTime.UtcNow);
                await _userRepository.UpdateUserLastActivityAsync(user.Id, DateTime.UtcNow);

                await _firebaseAuthService.SetCustomUserClaimsAsync(uid, claims);
                return UserHelper.MaptoUserDTO(user);
            }
            catch (ValidationException ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<UserDTO> ValidateAdminToken(string token)
        {
            try
            {
                string uid = await _firebaseAuthService.VerifyIdTokenAsync(token, true);
                UserRecord userRecord = await _firebaseAuthService.GetUserAsync(uid);

                var user = new UserEntity();
                if (userRecord.ProviderData != null && userRecord.ProviderData.ToList().Count > 0 && userRecord.ProviderData[0].ProviderId == "phone")
                {
                    var phone = userRecord.PhoneNumber.Substring(1);
                    user = await _userRepository.GetUserByPhone(phone);
                }
                else if (userRecord.ProviderData != null && userRecord.ProviderData.ToList().Count > 0 && userRecord.ProviderData[0].ProviderId == "password")
                {
                    user = await _userRepository.GetUserByEmail(userRecord.ProviderData[0].Email);
                }

                if (user == null || user.Id == Guid.Empty)
                {
                    throw new ValidationException($"User with email {user.Email} not found.");
                }

                EnsureTemporaryPasswordIsNotExpired(user);

                if (user.Role == Shared.Enum.UserRole.User)
                {
                    throw new UnauthorizedAccessException("User can't login in admin portal");
                }

                var claims = new Dictionary<string, object>()
                {
                    { "UserId", user.Id },
                    { "Phone", user.Phone },
                    { "Email", user.Email },
                    { "UserName", user.FirstName + " " + user.LastName },
                    { "Role", (int)user.Role }
                };
                if (user.CompanyId.HasValue)
                {
                    claims.Add("CompanyId", user.CompanyId.Value.ToString());
                }

                // Track login activity
                await _userRepository.UpdateUserLoginActivity(user.Id, DateTime.UtcNow);

                await _firebaseAuthService.SetCustomUserClaimsAsync(uid, claims);
                return UserHelper.MaptoUserDTO(user);
            }
            catch (ValidationException ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<bool> ResetPassword(string email)
        {
            try
            {
                UserEntity user = await _userRepository.GetUserByEmail(email);
                if(user == null || user.Id == Guid.Empty)
                {
                    throw new ValidationException($"User with email {email} is not exists.");
                }
                string link = await _firebaseAuthService.GeneratePasswordResetLinkAsync(email);
                _userHelper.ResetPassword(email,link);

                 // Track last activity for normal users
                if (user.Role == Shared.Enum.UserRole.User)
                {
                    await _userRepository.UpdateUserLastActivityAsync(user.Id, DateTime.UtcNow);
                }
                
                return true;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<GenerateTemporaryPasswordResponse> GenerateTemporaryPassword(Guid userId)
        {
            if (_loginUserDetails.Role != Shared.Enum.UserRole.CompanyAdmin &&
                _loginUserDetails.Role != Shared.Enum.UserRole.SuperAdmin)
            {
                throw new UnauthorizedAccessException("Only administrators can generate temporary passwords.");
            }

            var targetUser = await _userRepository.GetUserById(userId);
            if (targetUser == null || targetUser.Id == Guid.Empty)
                throw new ValidationException("User not found.");

            if (!targetUser.IsActive)
                throw new ValidationException("A temporary password cannot be generated for an inactive user.");

            if (targetUser.Role == Shared.Enum.UserRole.SuperAdmin)
                throw new UnauthorizedAccessException("Temporary passwords cannot be generated for SuperAdmin accounts.");

            if (_loginUserDetails.Role == Shared.Enum.UserRole.CompanyAdmin)
            {
                if (targetUser.Role != Shared.Enum.UserRole.User ||
                    !targetUser.CompanyId.HasValue || targetUser.CompanyId != _loginUserDetails.CompanyId)
                {
                    throw new UnauthorizedAccessException("You can only generate temporary passwords for users in your company.");
                }
            }
            else if (targetUser.Role != Shared.Enum.UserRole.User && targetUser.Role != Shared.Enum.UserRole.CompanyAdmin)
            {
                throw new UnauthorizedAccessException("Temporary passwords can only be generated for standard or company-admin accounts.");
            }

            if (string.IsNullOrWhiteSpace(targetUser.FirebaseId))
                throw new ValidationException("The user does not have a linked Firebase account.");

            var temporaryPassword = GenerateSecurePassword();
            var expiresAtUtc = DateTime.UtcNow.AddHours(1);

            try
            {
                await _firebaseAuthService.UpdateUserAsync(targetUser.FirebaseId, new UserRecordArgs
                {
                    Uid = targetUser.FirebaseId,
                    Password = temporaryPassword
                });
                await _userRepository.UpdateTemporaryPasswordStateAsync(targetUser.Id, true, expiresAtUtc);
                await _firebaseAuthService.RevokeRefreshTokensAsync(targetUser.FirebaseId);
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogError(ex,
                    "Failed to generate a temporary password for user {TargetUserId} by actor {ActorUserId} at {TimestampUtc:o}.",
                    targetUser.Id, _loginUserDetails.UserID, DateTime.UtcNow);
                throw new ValidationException("Unable to generate a temporary password for this user. Please try again.");
            }

            _logger.LogInformation(
                "Temporary password generated for user {TargetUserId} ({TargetEmail}) by actor {ActorUserId} at {TimestampUtc:o}.",
                targetUser.Id, targetUser.Email, _loginUserDetails.UserID, DateTime.UtcNow);

            return new GenerateTemporaryPasswordResponse
            {
                TemporaryPassword = temporaryPassword,
                ExpiresAtUtc = expiresAtUtc
            };
        }

        public async Task ChangeTemporaryPassword(Guid userId, ChangeTemporaryPasswordRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.NewPassword))
                throw new ValidationException("A new password is required.");

            ValidatePassword(request.NewPassword);

            var user = await _userRepository.GetUserById(userId);
            if (user == null || user.Id == Guid.Empty)
                throw new ValidationException("User not found.");

            if (!user.IsActive)
                throw new ValidationException("Account is not active.");

            if (!user.PasswordChangeRequired)
                throw new ValidationException("There is no temporary password change in progress for this user.");

            if (!user.TemporaryPasswordExpiresAtUtc.HasValue || user.TemporaryPasswordExpiresAtUtc.Value <= DateTime.UtcNow)
                throw new LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException();

            if (string.IsNullOrWhiteSpace(user.FirebaseId))
                throw new ValidationException("The user does not have a linked Firebase account.");

            try
            {
                await _firebaseAuthService.UpdateUserAsync(user.FirebaseId, new UserRecordArgs
                {
                    Uid = user.FirebaseId,
                    Password = request.NewPassword
                });
                await _userRepository.UpdateTemporaryPasswordStateAsync(user.Id, false, null);
                await _firebaseAuthService.RevokeRefreshTokensAsync(user.FirebaseId);
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogError(ex,
                    "Failed to complete the temporary password change for user {TargetUserId} at {TimestampUtc:o}.",
                    user.Id, DateTime.UtcNow);
                throw new ValidationException("Unable to change the password. Please try again.");
            }

            _logger.LogInformation(
                "Temporary password completed for user {TargetUserId} at {TimestampUtc:o}.",
                user.Id, DateTime.UtcNow);
        }

        private static void EnsureTemporaryPasswordIsNotExpired(UserEntity user)
        {
            if (!user.PasswordChangeRequired)
                return;

            if (!user.TemporaryPasswordExpiresAtUtc.HasValue || user.TemporaryPasswordExpiresAtUtc.Value <= DateTime.UtcNow)
                throw new LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException();
        }

        private static void ValidatePassword(string password)
        {
            if (password.Length < 6 || !password.Any(char.IsLetter) || !password.Any(char.IsDigit) ||
                !password.Any(ch => !char.IsLetterOrDigit(ch)))
            {
                throw new ValidationException("Password must be at least 6 characters long, include letters, numbers, and one special character.");
            }
        }

        private static string GenerateSecurePassword()
        {
            const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
            const string lower = "abcdefghijkmnopqrstuvwxyz";
            const string digits = "23456789";
            const string special = "!@#$%*-_";
            const string all = upper + lower + digits + special;

            var characters = new[]
            {
                upper[RandomNumberGenerator.GetInt32(upper.Length)],
                lower[RandomNumberGenerator.GetInt32(lower.Length)],
                digits[RandomNumberGenerator.GetInt32(digits.Length)],
                special[RandomNumberGenerator.GetInt32(special.Length)]
            }.ToList();

            while (characters.Count < 16)
                characters.Add(all[RandomNumberGenerator.GetInt32(all.Length)]);

            for (var index = characters.Count - 1; index > 0; index--)
            {
                var swapIndex = RandomNumberGenerator.GetInt32(index + 1);
                (characters[index], characters[swapIndex]) = (characters[swapIndex], characters[index]);
            }

            return new string(characters.ToArray());
        }

        public async Task<GetNewTokenResponse> GetNewToken(string refreshToken)
        {
            try
            {
                var (response, userId) = await _firebaseAuthService.GetNewTokenAsync(refreshToken);
                var user = await _userRepository.GetUserByFirebaseId(userId);

                response.User = UserHelper.MaptoUserDTO(user);
                var claims = new Dictionary<string, object>()
                {
                    { "UserId", user.Id },
                    { "Phone", user.Phone },
                    { "Email", user.Email },
                    { "UserName", user.FirstName + " " + user.LastName },
                    { "Role", (int)user.Role }
                };
                if (user.CompanyId.HasValue)
                {
                    claims.Add("CompanyId", user.CompanyId.Value.ToString());
                }

                await _firebaseAuthService.SetCustomUserClaimsAsync(userId, claims);
                // Track login activity
                //await _userRepository.UpdateUserLoginActivity(user.Id, DateTime.UtcNow);

                return response;
            }
            catch (ValidationException ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public async Task RequestDemo(RequestDemoRequest request)
        {
            try
            {
                await _userHelper.SendDemoRequestMail(request);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task UpdateFcmTokenAsync(Guid userId, string fcmToken)
        {
            try
            {
                await _userRepository.UpdateFcmTokenAsync(userId, fcmToken);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
