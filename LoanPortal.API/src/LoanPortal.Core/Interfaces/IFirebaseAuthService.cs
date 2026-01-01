using FirebaseAdmin.Auth;
using System.Threading.Tasks;
using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface IFirebaseAuthService
    {
        Task<string> CreateUserAsync(UserRecordArgs args);
        Task<UserRecord> GetUserAsync(string uid);
        Task<string> VerifyIdTokenAsync(string idToken);
        Task SetCustomUserClaimsAsync(string uid, Dictionary<string, object> claims);
        Task<string> GeneratePasswordResetLinkAsync(string email);
        Task<(GetNewTokenResponse Response, string UserId)> GetNewTokenAsync(string refreshToken);
        Task UpdateUserAsync(string uid, UserRecordArgs args);
    }
} 