using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Entities
{
    public class DashboardDTO
    {
        public int Month {  get; set; }
        public int Year { get; set; }
        public int PreApprovedCount { get; set; }
        public int InEscrowCount { get; set; }
    }
}
