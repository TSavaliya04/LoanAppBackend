using FirebaseAdmin.Auth;
using LoanPortal.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Services
{
    public class FirebaseAuthService : IFirebaseAuthService
    {
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
    }
} 