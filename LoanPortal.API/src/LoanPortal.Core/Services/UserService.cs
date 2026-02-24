using FirebaseAdmin.Auth;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared;
using LoanPortal.Shared.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations;
using System.Numerics;
using System.Reflection.Metadata.Ecma335;
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

        public UserService(
            IUserHelper userHelper,
            IConfiguration config,
            IHttpClientService httpClientService,
            IUserRepository userRepository,
            IBlobStorageHelper blobStorageHelper,
            IFirebaseAuthService firebaseAuthService,
            ILoginUserDetails loginUserDetails)
        {
            _userHelper = userHelper;
            _config = config;
            _httpClientService = httpClientService;
            _userRepository = userRepository;
            _blobStorageHelper = blobStorageHelper;
            _firebaseAuthService = firebaseAuthService;
            _loginUserDetails = loginUserDetails; 
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
                };
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
                Guid userId = _loginUserDetails.UserID;
                UserEntity existingUser = null;
                if (userId == IConstants.AdminId)
                {
                    existingUser = await _userRepository.GetUserById(request.UserId.Value);
                }
                else
                {
                    existingUser = await _userRepository.GetUserById(userId);
                }


                string url = "";
                if (request.Profile != null && BlobStorageHelper.isValidFile(request.Profile.FileName))
                {
                    string filename = $"{request.Profile.FileName.Split(".")[0]}_{DateTime.UtcNow:yyMMddHHmmss}.{request.Profile.FileName.Split(".")[1]}";
                    Uri fileURI = await _blobStorageHelper.UploadFileBlobAsyncUsingSAS(request.Profile.OpenReadStream(), filename, "ProfilePictures");
                    url = fileURI.ToString();
                }

                // Create a new UserEntity with update data
                var updateEntity = new UserEntity
                {
                    Id = existingUser.Id,
                    FirstName = request.FirstName ?? existingUser.FirstName,
                    LastName = request.LastName ?? existingUser.LastName,
                    Email = existingUser.Email,
                    Phone = request.Phone ?? existingUser.Phone,
                    IsActive = existingUser.IsActive,
                    FirebaseId = existingUser.FirebaseId,
                    CreatedAt = existingUser.CreatedAt,
                    Address = request.Address ?? existingUser.Address,
                    Profile = !string.IsNullOrEmpty(url) ? url.Split("?")[0] : existingUser.Profile,
                    JobTitle = request.JobTitle ?? existingUser.JobTitle,
                    CompanyName = request.CompanyName ?? existingUser.CompanyName,
                    NMLS = request.NMLS ?? existingUser.NMLS,
                    UpdatedAt = DateTime.UtcNow
                };

                //// Use UpdateHelper to update only the provided fields
                //UpdateHelper.UpdateEntity(existingUser, updateEntity);

                // Update the user document
                await _userRepository.UpdateUserProfileAsync(_loginUserDetails.UserID, updateEntity);

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
                return UserHelper.MaptoUserDTO(await _userRepository.GetUserById(_loginUserDetails.UserID));
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
                if (!string.IsNullOrEmpty(user.Profile)){
                    user.Profile = user.Profile + "?" + IConstants.AzureToken;
                }

                if (user == null)
                {
                    throw new ValidationException($"User not found.");
                }
                return UserHelper.MaptoUserDTO(user);
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
                string uid = await _firebaseAuthService.VerifyIdTokenAsync(token);
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

                var claims = new Dictionary<string, object>()
                {
                    { "UserId", user.Id },
                    { "Phone", user.Phone },
                    { "Email", user.Email },
                    { "UserName", user.FirstName + " " + user.LastName },
                };

                if (user.Id == IConstants.AdminId)
                {
                    claims["isAdmin"] = true;
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
                return true;
            }
            catch (Exception ex)
            {
                throw;
            }
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
                };

                if (user.Id == IConstants.AdminId)
                {
                    claims["isAdmin"] = true;
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
    }
}
