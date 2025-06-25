using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace LoanPortal.API.Controllers.Authentication
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AuthEndPoints : EndpointBase
    {
        private readonly IUserService _userService;
        private readonly ILoginUserDetails _loginUserDetails;
        public AuthEndPoints(IUserService userService, ILoginUserDetails loginUserDetails)
        {
            _userService = userService;
            _loginUserDetails = loginUserDetails;
        }

        [AllowAnonymous]
        [HttpPost("user/SignUp")]
        public async Task<IActionResult> SignUp(CreateUserRequest user)
        {
            try
            {
                var result = await _userService.SignUp(user);
                return Ok(new ApiResponse<UserDTO>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (ValidationException ex)
            {
                return StatusCode(400, new ApiResponse<UserDTO>
                {
                    Message = ex.Message,
                    IsSuccess = true
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserController.SignUp -> " + ex.Message);
                throw new Exception("Exception in UserController.SignUp -> " + ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("user/Login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                var result = await _userService.Login(request);
                return Ok(new ApiResponse<LoginResponse>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserController.Login -> " + ex.Message);
                throw new Exception("Exception in UserController.Login -> " + ex.Message);
            }
        }

        [HttpPut("user/UpdateProfile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            try
            {
                var result = await _userService.UpdateProfile(request);
                return Ok(new ApiResponse<UserDTO>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (ValidationException ex)
            {
                Console.WriteLine("Exception in UserController.UpdateProfile -> " + ex.Message);
                throw new Exception("Exception in UserController.UpdateProfile -> " + ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserController.UpdateProfile -> " + ex.Message);
                throw new Exception("Exception in UserController.UpdateProfile -> " + ex.Message);
            }
        }

        [HttpGet("user/GetUserProfile")]
        public async Task<IActionResult> GetUserProfile(Guid id)
        {
            try
            {
                var result = await _userService.GetUserProfile(id);
                return Ok(new ApiResponse<UserDTO>
                {
                    Data = result,
                    IsSuccess = true
                });
            }
            catch (ValidationException ex)
            {
                Console.WriteLine("Exception in UserController.GetUserProfile -> " + ex.Message);
                throw new Exception("Exception in UserController.GetUserProfile -> " + ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserController.GetUserProfile -> " + ex.Message);
                throw new Exception("Exception in UserController.GetUserProfile -> " + ex.Message);
            }
        }
    }
}
