using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanPortal.Core.Interfaces;
using static LoanPortal.API.Helper.ResponseHelper;

namespace LoanPortal.API.Controllers.Notifications
{
    [ApiController]
    [Route("notifications")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILoginUserDetails _loginUserDetails;
        private readonly IUserService _userService;

        public NotificationsController(
            INotificationService notificationService,
            ILoginUserDetails loginUserDetails,
            IUserService userService)
        {
            _notificationService = notificationService;
            _loginUserDetails    = loginUserDetails;
            _userService         = userService;
        }

        /// <summary>Get paginated notifications for the currently logged-in user.</summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications(
            [FromQuery] int pageSize   = 20,
            [FromQuery] int pageNumber = 1)
        {
            try
            {
                var userId        = _loginUserDetails.UserID;
                var notifications = await _notificationService.GetNotificationsAsync(userId, pageSize, pageNumber);
                return Ok(SuccessResponse(notifications));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }

        /// <summary>Get the count of unread notifications for the current user (for badge display).</summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = _loginUserDetails.UserID;
                var count  = await _notificationService.GetUnreadCountAsync(userId);
                return Ok(SuccessResponse(new { count }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }

        /// <summary>Mark a single notification as read.</summary>
        [HttpPut("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            try
            {
                var userId = _loginUserDetails.UserID;
                await _notificationService.MarkAsReadAsync(id, userId);
                return Ok(SuccessResponse<object>(null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }

        /// <summary>Mark all notifications for the current user as read.</summary>
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            try
            {
                var userId = _loginUserDetails.UserID;
                await _notificationService.MarkAllAsReadAsync(userId);
                return Ok(SuccessResponse<object>(null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }

        /// <summary>
        /// Register or refresh the FCM Web Push token for the current user.
        /// The Next.js PWA frontend calls this after the user grants notification permission.
        /// </summary>
        [HttpPost("fcm-token")]
        public async Task<IActionResult> RegisterFcmToken([FromBody] RegisterFcmTokenRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Token))
                    return BadRequest(ErrorResponse<object>(400, "FCM token is required."));

                var userId = _loginUserDetails.UserID;
                await _userService.UpdateFcmTokenAsync(userId, request.Token);
                return Ok(SuccessResponse<object>(null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ErrorResponse<object>(500, ex.Message));
            }
        }
    }

    public class RegisterFcmTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}

