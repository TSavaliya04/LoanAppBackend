using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Shared.Constants
{
    public interface IConstants
    {
        const string FirebaseLoginURL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
        const string FirebaseTokenURL = "https://securetoken.googleapis.com/v1/token";
    }
}
