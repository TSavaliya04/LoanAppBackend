using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;
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
                return Ok(SuccessResponse(data:result, message:"User Created Successfully."));
            }
            catch (ValidationException ex)
            {
                return StatusCode(400, ErrorResponse<UserDTO>(error:ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500,ex.Message));
            }
        }

        [AllowAnonymous]
        [HttpPost("user/Login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                var result = await _userService.Login(request);
                return Ok(SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [HttpPut("user/UpdateProfile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileRequest request)
        {
            try
            {
                var result = await _userService.UpdateProfile(request);
                return Ok(SuccessResponse(result));
            }
            catch (ValidationException ex)
            {
                return StatusCode(400, ErrorResponse<UserDTO>(error: ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [HttpGet("user/GetUserProfile")]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                var result = await _userService.GetUserProfile(_loginUserDetails.UserID);
                return Ok(SuccessResponse(result));
            }
            catch (ValidationException ex)
            {
                return StatusCode(400, ErrorResponse<UserDTO>(error: ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [AllowAnonymous]
        [HttpPost("user/ValidateUserToken")]
        public async Task<IActionResult> ValidateUserToken(string token)
        {
            try
            {
                var result = await _userService.ValidateUserToken(token);
                return Ok(SuccessResponse(result));
            }
            catch (ValidationException ex)
            {
                return StatusCode(400, ErrorResponse<UserDTO>(error: ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<UserDTO>(500, ex.Message));
            }
        }

        [AllowAnonymous]
        [HttpPost("user/ResetPassword")]
        public async Task<IActionResult> ResetPassword(string email)
        {
            try
            {
                var result = await _userService.ResetPassword(email);
                return Ok(SuccessResponse(data:result, message:"Password reset link sent successfully."));
            }
            catch (ValidationException ex)
            {
                return StatusCode(400, ErrorResponse<string>(error: ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<string>(500, ex.Message));
            }
        }

        [AllowAnonymous]
        [HttpPost("user/GetNewToken")]
        public async Task<IActionResult> GetNewToken(string refreshToken)
        {
            try
            {
                var result = await _userService.GetNewToken(refreshToken);
                return Ok(SuccessResponse(data: result, message: "New token generated successfully."));
            }
            catch (ValidationException ex)
            {
                return StatusCode(400, ErrorResponse<GetNewTokenResponse>(error: ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<GetNewTokenResponse>(500, ex.Message));
            }
        }
    }
}
