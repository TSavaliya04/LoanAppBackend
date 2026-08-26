using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Exceptions
{
    public class ValidationException : Exception
    {
        public string Error { get; }

        public ValidationException(string message, string error) : base(message)
        {
            Error = error;
        }

        public ValidationException(string? message) : base(message)
        {
        }
    }

}
