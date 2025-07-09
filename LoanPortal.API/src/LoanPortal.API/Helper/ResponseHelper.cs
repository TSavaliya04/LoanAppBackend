using Azure.Core;
using LoanPortal.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.API.Helper
{
    public static class ResponseHelper
    {
        public static ApiResponse<T> SuccessResponse<T>(T data, int statusCode = 200, string message = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message ?? "Request successful.",
                Data = data,
                StatusCode = statusCode,
            };
        }

        public static ApiResponse<T> ErrorResponse<T>(int statusCode = 400, string error = null, string message = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message ?? "Request Failed.",
                Error = error,
                StatusCode = statusCode
            };
        }
    }
}
