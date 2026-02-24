using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Entities
{
    public class ApiResponse<T>
    {
        public T? Data { get; set; }
        public bool? Success { get; set; }
        public string? Message { get; set; }
        public string? Error { get; set; }
        public int? StatusCode { get; set; }
    }
}
