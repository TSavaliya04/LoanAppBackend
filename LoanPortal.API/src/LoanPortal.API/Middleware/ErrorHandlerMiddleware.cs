using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using LoanPortal.Core.Exceptions;

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
        case ImportValidationException:
          response.StatusCode = (int)HttpStatusCode.BadRequest;
          errorCode = (int)HttpStatusCode.BadRequest;
          break;
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
