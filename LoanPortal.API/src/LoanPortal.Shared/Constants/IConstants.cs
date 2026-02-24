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
        public static readonly string AzureToken = "sp=racwdli&st=2025-10-01T17:14:14Z&se=2026-10-02T01:29:14Z&sv=2024-11-04&sr=c&sig=tbTUGvn1%2F7uCyUtIvk8coOlzS9RD%2FGKBtdNyVxLR33Q%3D";
    }
}
