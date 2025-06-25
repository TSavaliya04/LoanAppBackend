using FirebaseAdmin.Auth;
using LoanPortal.Core.Interfaces;
using System.Net;

namespace LoanPortal.API.Middleware;
public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILoginUserDetails _userDetailService;
    public JwtMiddleware(RequestDelegate next, ILoginUserDetails UserDetailService)
    {
        _next = next;
        _userDetailService = UserDetailService;
    }

    public async Task InvokeAsync(HttpContext context)
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

                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);

                object userID;

                if (decodedToken.Claims.TryGetValue("UserId", out userID))
                {
                    _userDetailService.UserID = new Guid(userID.ToString());
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
