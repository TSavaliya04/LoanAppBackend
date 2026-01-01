using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Entities
{
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public string Email { get; set; }
        public string Token { get; set; }
    }

    public class FirebaseLoginResponse
    {
        public string IdToken { get; set; }
        public string Email { get; set; }
        public string RefreshToken { get; set; }
        public string ExpiresIn { get; set; }
        public string LocalId { get; set; }
    }

    public class GetNewTokenResponse
    {
        public string IdToken { get; set; }
        public string RefreshToken { get; set; }
        //public string ExpiresIn { get; set; }
        //public string TokenType { get; set; }
        //public string UserId { get; set; }
        //public string ProjectId { get; set; }
        public UserDTO User { get; set; }
    }

    public class FirebaseTokenResponse
    {
        //[JsonProperty("expires_in")]
        //public string ExpiresIn { get; set; }

        //[JsonProperty("token_type")]
        //public string TokenType { get; set; }

        [JsonProperty("refresh_token")]
        public string RefreshToken { get; set; }

        [JsonProperty("id_token")]
        public string IdToken { get; set; }

        //[JsonProperty("user_id")]
        //public string UserId { get; set; }

        //[JsonProperty("project_id")]
        //public string ProjectId { get; set; }
    }
}
