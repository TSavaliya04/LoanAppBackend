using FirebaseAdmin.Auth;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces
{
    public interface IFirebaseAuthService
    {
        Task<string> CreateUserAsync(UserRecordArgs args);
        Task<UserRecord> GetUserAsync(string uid);
        Task<string> VerifyIdTokenAsync(string idToken);
        Task SetCustomUserClaimsAsync(string uid, Dictionary<string, object> claims);
    }
} 