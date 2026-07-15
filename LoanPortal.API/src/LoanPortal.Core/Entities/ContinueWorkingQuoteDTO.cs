using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Entities
{
    public class ContinueWorkingQuoteDTO
    {
        public Guid PreApprovalId { get; set; }
        public string BorrowerName { get; set; }
        public string LoanType { get; set; }
        public string LoanProgram { get; set; }
        public string OwnerName { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public int TotalScenarios { get; set; }
    }

    public class PagedContinueWorkingQuotesDTO
    {
        public List<ContinueWorkingQuoteDTO> Items { get; set; } = new List<ContinueWorkingQuoteDTO>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class GetContinueWorkingRequest : DefaultRequest
    {
        /// <summary>0 = all statuses, any other value filters by that ApplicationStatus</summary>
        public int? Status { get; set; }
    }

    public class GetContinueWorkingRequestWrapper
    {
        public GetContinueWorkingRequest Params { get; set; }
    }
}
