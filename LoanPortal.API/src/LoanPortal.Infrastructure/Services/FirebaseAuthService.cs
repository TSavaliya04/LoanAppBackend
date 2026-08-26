using FirebaseAdmin.Auth;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Constants;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Services
{
    public class FirebaseAuthService : IFirebaseAuthService
    {
        private readonly IHttpClientService _httpClientService;
        private readonly IConfiguration _config;

        public FirebaseAuthService(IHttpClientService httpClientService, IConfiguration config)
        {
            _httpClientService = httpClientService;
            _config = config;
        }

        public async Task<string> CreateUserAsync(UserRecordArgs args)
        {
            UserRecord newUser = await FirebaseAuth.DefaultInstance.CreateUserAsync(args);
            return newUser.Uid;
        }

        public async Task<string> VerifyIdTokenAsync(string idToken)
        {
            FirebaseToken token = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            return token.Uid;
        }

        public async Task SetCustomUserClaimsAsync(string uid, Dictionary<string, object> claims)
        {
            await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(uid, claims);
        }

        public async Task<UserRecord> GetUserAsync(string uid)
        {
            return await FirebaseAuth.DefaultInstance.GetUserAsync(uid);
        }

        public async Task<string> GeneratePasswordResetLinkAsync(string email)
        {
            return await FirebaseAuth.DefaultInstance.GeneratePasswordResetLinkAsync(email);
        }

        public async Task<(GetNewTokenResponse Response, string UserId)> GetNewTokenAsync(string refreshToken)
        {
            try
            {
                var requestData = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("grant_type", "refresh_token"),
                    new KeyValuePair<string, string>("refresh_token", refreshToken)
                };

                var content = new FormUrlEncodedContent(requestData);
                var firebaseKey = Environment.GetEnvironmentVariable("FirebaseKey") ?? _config["FirebaseKey"];
                var requestUri = $"{IConstants.FirebaseTokenURL}?key={firebaseKey}";

                var response = await _httpClientService.PostAsync(requestUri, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Firebase token refresh failed: {responseContent}");
                }

                var tokenResponse = JsonConvert.DeserializeObject<dynamic>(responseContent);
                var result = new GetNewTokenResponse
                {
                    IdToken = tokenResponse.id_token,
                    RefreshToken = tokenResponse.refresh_token,
                };

                return (result, tokenResponse.user_id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to get refresh token: {ex.Message}", ex);
            }
        }

        public async Task UpdateUserAsync(string uid, UserRecordArgs args)
        {
            await FirebaseAuth.DefaultInstance.UpdateUserAsync(args);
        }
    }

} 