using FirebaseAdmin.Auth;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using System.Net;

namespace LoanPortal.API.Middleware;
public class JwtMiddleware
{
    private readonly RequestDelegate _next;

    public JwtMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    // ILoginUserDetails is injected here (per-request) rather than in the constructor,
    // because middleware is instantiated once (effectively singleton) by ASP.NET Core.
    // Injecting a Scoped service via InvokeAsync ensures each request gets its own instance.
    public async Task InvokeAsync(HttpContext context, ILoginUserDetails _userDetailService, IUserRepository userRepository)
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (token == null)
        {
            var accessToken = context.Request.Query["access_token"];

            var path = context.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/user")))
            {
                // Read the token out of the query string
                token = accessToken;
            }
        }

        if (token != null)
        {
            try
            {
                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token, true);

                var tokenUser = await userRepository.GetUserByFirebaseId(decodedToken.Uid);

                // Validation endpoints must stay reachable so the client can discover
                // that a password change is required (or that the temporary password expired).
                var isTokenValidationPath =
                    context.Request.Path.StartsWithSegments("/user/ValidateUserToken") ||
                    context.Request.Path.StartsWithSegments("/user/ValidateAdminToken") ||
                    context.Request.Path.StartsWithSegments("/borrower/ValidateBorrowerToken");
                var isChangeTemporaryPasswordPath =
                    context.Request.Path.StartsWithSegments("/user/ChangeTemporaryPassword");

                if (!isTokenValidationPath && tokenUser?.PasswordChangeRequired == true)
                {
                    var temporaryPasswordExpired =
                        !tokenUser.TemporaryPasswordExpiresAtUtc.HasValue ||
                        tokenUser.TemporaryPasswordExpiresAtUtc.Value <= DateTime.UtcNow;

                    if (temporaryPasswordExpired)
                    {
                        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                        await context.Response.WriteAsJsonAsync(
                            LoanPortal.API.Helper.ResponseHelper.ErrorResponse<object>(
                                403,
                                "Your temporary password has expired. Please contact an administrator for a new temporary password.",
                                errorCode: LoanPortal.Core.Exceptions.TemporaryPasswordExpiredException.ErrorCode));
                        return;
                    }

                    if (!isChangeTemporaryPasswordPath)
                    {
                        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                        await context.Response.WriteAsJsonAsync(
                            LoanPortal.API.Helper.ResponseHelper.ErrorResponse<object>(
                                403,
                                "Password change is required before accessing this resource.",
                                errorCode: "PASSWORD_CHANGE_REQUIRED"));
                        return;
                    }
                }

                object userID;
                if (decodedToken.Claims.TryGetValue("UserId", out userID) &&
                    Guid.TryParse(userID?.ToString(), out var parsedUserId))
                {
                    _userDetailService.UserID = parsedUserId;
                }
                else if (tokenUser != null)
                {
                    // Tokens issued before custom claims are applied may not contain UserId.
                    // Fall back to the verified Firebase user's persisted record.
                    _userDetailService.UserID = tokenUser.Id;
                }

                object userName;
                if (decodedToken.Claims.TryGetValue("UserName", out userName))
                {
                    _userDetailService.UserName = Convert.ToString(userName);
                }

                object email;
                if (decodedToken.Claims.TryGetValue("Email", out email))
                {
                    _userDetailService.Email = Convert.ToString(email);
                }

                object phone;
                if (decodedToken.Claims.TryGetValue("Phone", out phone))
                {
                    _userDetailService.Phone = Convert.ToString(phone);
                }

                object role;
                if (decodedToken.Claims.TryGetValue("Role", out role))
                {
                    _userDetailService.Role = (LoanPortal.Shared.Enum.UserRole)Convert.ToInt32(role);
                }

                object companyId;
                if (decodedToken.Claims.TryGetValue("CompanyId", out companyId))
                {
                    _userDetailService.CompanyId = new Guid(companyId.ToString());
                }
            }
            catch (FirebaseAuthException)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("Token is expired.");
                return;
            }
        }

        await _next(context);
    }
}

