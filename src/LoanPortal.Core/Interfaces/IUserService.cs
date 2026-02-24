using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO> SignUp(CreateUserRequest user);
        Task<LoginResponse> Login(LoginRequest request);
        Task<UserDTO> UpdateProfile(UpdateProfileRequest request);
        Task<UserDTO> GetUserProfile(Guid userId);
        Task<UserDTO> ValidateUserToken(string token);
        Task<bool> ResetPassword(string email);
        Task<GetNewTokenResponse> GetNewToken(string refreshToken);
    }
}
