using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces
{
    public interface IPreApprovalService
    {
        public Task<PreApprovalDocument> GetPreApproval(Guid id);
        public Task<PreApprovalReport> GetPreApprovalReport(Guid preApprovalId, Guid scenarioId);
        public Task<FHAReport> GetFHAReport(Guid preApprovalId, Guid scenarioId);
        public Task<QuickQuote> GetQuickQuote(Guid preApprovalId, Guid scenarioId);
        public Task<List<TopOpportunityDTO>> GetQuoteList(int status);
        public Task ClonePreApproval(Guid preApprovalId);
        public Task<PreApprovalDocument> SavePreApproval(PreApprovalDTO preApproval);
        public Task DeletePreApproval(List<Guid> preApprovalIds);
        public Task<PreApprovalDocument> UpdateApplicationStatus(Guid id, int status);
        public Task<DashboardDTO> GetDashboardData();
    }
}
