using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Shared.Constants
{
    public static class IConstants
    {
        public const string FirebaseLoginURL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
        public const string FirebaseTokenURL = "https://securetoken.googleapis.com/v1/token";
        public static readonly Guid AdminId = new("ffffffff-ffff-ffff-ffff-ffffffffffff");
    }
}
