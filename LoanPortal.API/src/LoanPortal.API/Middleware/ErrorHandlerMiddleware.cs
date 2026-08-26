using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;

namespace LoanPortal.API.Middleware;
public class ErrorHandlerMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<ErrorHandlerMiddleware> _ilogger;

  public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> ilogger)
  {
    _next = next;
    _ilogger = ilogger;
  }

  public async Task Invoke(HttpContext context)
  {
    try
    {
      await _next(context);
    }
    catch (Exception error)
    {
      var response = context.Response;
      response.ContentType = "application/json";
      int errorCode;
      switch (error)
      {
        case KeyNotFoundException e:
          response.StatusCode = (int)HttpStatusCode.NotFound;
          errorCode = (int)HttpStatusCode.NotFound;
          break;
        //case ValidationException ve:
        //  response.StatusCode = (int)HttpStatusCode.ba;
        //  errorCode = (int)HttpStatusCode.NotFound;
        //  break;
        default:
          response.StatusCode = (int)HttpStatusCode.InternalServerError;
          errorCode = (int)HttpStatusCode.InternalServerError;
          break;
      }

      _ilogger.LogError(error?.Message);
      _ilogger.LogError(error?.StackTrace);
      var result = JsonSerializer.Serialize(new
      {
        message = error.Message, //"Internal Server Error",
        errorCode,
      });

      await response.WriteAsync(result);
    }
  }
}
