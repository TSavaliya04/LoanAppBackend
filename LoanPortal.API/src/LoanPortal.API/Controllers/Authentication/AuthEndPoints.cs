using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using static LoanPortal.API.Helper.ResponseHelper;
using System.ComponentModel.DataAnnotations;

namespace LoanPortal.API.Controllers.Authentication
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AuthEndPoints : EndpointBase
    {
        private readonly IUserService _userService;
        private readonly ILoginUserDetails _loginUserDetails;
        private readonly ILogger<AuthEndPoints> _logger;
        public AuthEndPoints(IUserService userService, ILoginUserDetails loginUserDetails, ILogger<AuthEndPoints>? logger = null)
        {
            _userService = userService;
            _loginUserDetails = loginUserDetails;
            _logger = logger ?? NullLogger<AuthEndPoints>.Instance;
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
        [HttpPost("borrower/SignUp")]
        public async Task<IActionResult> SignUpBorrower(CreateUserRequest request)
        {
            try
            {
                var result = await _userService.SignUpBorrower(request);
                return Ok(SuccessResponse(data: result, message: "Borrower Created Successfully."));
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

        [HttpPut("user/ChangeTemporaryPassword")]
        public async Task<IActionResult> ChangeTemporaryPassword([FromBody] ChangeTemporaryPasswordRequest request)
        {
            try
            {
                if (_loginUserDetails.UserID == Guid.Empty)
                    return Unauthorized(ErrorResponse<object>(401, "Authenticated user details are unavailable."));

                await _userService.ChangeTemporaryPassword(_loginUserDetails.UserID, request);
                return Ok(SuccessResponse(data: true, message: "Password changed successfully. Please sign in again."));
            }
            catch (LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException ex)
            {
                return StatusCode(400, ErrorResponse<object>(400, ex.Message, errorCode: LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException.ErrorCode));
            }
            catch (ValidationException ex)
            {
                return BadRequest(ErrorResponse<object>(400, ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ErrorResponse<object>(403, ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while changing the temporary password for user {UserId}.", _loginUserDetails.UserID);
                return StatusCode(500, ErrorResponse<object>(500, "Unable to change the password. Please try again."));
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
            catch (LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException ex)
            {
                return StatusCode(400, ErrorResponse<UserDTO>(400, ex.Message, errorCode: LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException.ErrorCode));
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
        [HttpPost("user/ValidateAdminToken")]
        public async Task<IActionResult> ValidateAdminToken(string token)
        {
            try
            {
                var result = await _userService.ValidateAdminToken(token);
                return Ok(SuccessResponse(result));
            }
            catch (LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException ex)
            {
                return StatusCode(400, ErrorResponse<UserDTO>(400, ex.Message, errorCode: LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException.ErrorCode));
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
        [HttpPost("borrower/ValidateBorrowerToken")]
        public async Task<IActionResult> ValidateBorrowerToken([FromQuery] string token)
        {
            try
            {
                var result = await _userService.ValidateBorrowerToken(token);
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
        [HttpPost("user/RequestDemo")]
        public async Task<IActionResult> RequestDemo(RequestDemoRequest request)
        {
            try
            {
                await _userService.RequestDemo(request);
                return Ok(SuccessResponse(data: true, message: "Demo request sent successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<string>(500, ex.Message));
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
