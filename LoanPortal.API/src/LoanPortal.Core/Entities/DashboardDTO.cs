using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Entities
{
    public class DashboardDTO
    {
        public int QuotesCreatedThisWeek { get; set; }
        public int QuotesCreatedLastWeek { get; set; }
        public int QuotesCreatedChange { get; set; } // Difference: this week - last week
        
        public int PreApprovedThisWeek { get; set; }
        public int PreApprovedLastWeek { get; set; }
        public int PreApprovedChange { get; set; } // Difference: this week - last week
    }
}
