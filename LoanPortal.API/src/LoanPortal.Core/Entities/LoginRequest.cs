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

    public class GenerateTemporaryPasswordResponse
    {
        public string TemporaryPassword { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public bool MustChangePassword { get; set; } = true;
    }

    public class ChangeTemporaryPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
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
        public UserDTO User { get; set; }
    }
}
