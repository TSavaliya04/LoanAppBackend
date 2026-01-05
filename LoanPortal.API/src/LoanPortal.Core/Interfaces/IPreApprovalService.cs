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
        public Task<BorrowerInfoDTO> CreateBorrowerInfo(BorrowerInfoDTO borrowerInfo);
        public Task<PurchaseInfoDTO> CreatePurchaseInfo(PurchaseInfoDTO purchaseInfo);
        public Task<LenderFeesDTO> CreateLenderFees(LenderFeesDTO feesDTO);
        public Task<PrepaidItemsDTO> CreatePrepaidItems(PrepaidItemsDTO prepaidItemsDTO);
        public Task<MiscFeesDTO> CreateMiscFees(MiscFeesDTO miscFeesDTO);
        public Task<List<BorrowerIncomeDTO>> CreateBorrowerIncome(List<BorrowerIncomeDTO> borrowerIncomeDTO);
        public Task<PreApprovalDocument> GetPreApproval(Guid id);
        //public Task<List<DebtBreakdownDTO>> CreateDebtBreakdown(List<DebtBreakdownDTO> debtDtos);
        public Task<LoanProgramDTO> CreateLoanProgram(LoanProgramDTO loanProgramDto);
        public Task<List<TopOpportunityDTO>> GetPreApprovalsList();
        public Task<List<TopOpportunityDTO>> GetInEscrowList();
        public Task<List<TopOpportunityDTO>> GetTBDsList();
        public Task<PreApprovalReport> GetPreApprovalReport(Guid preApprovalId);
        public Task<FHAReport> GetFHAReport(Guid preApprovalId);
        public Task<QuickQuote> GetQuickQuote(Guid preApprovalId);
        public Task ClonePreApproval(Guid preApprovalId);
        public Task<PreApprovalDocument> SavePreApproval(PreApprovalDTO preApproval);
        public Task DeletePreApproval(List<Guid> preApprovalIds);
        public Task<PreApprovalDocument> UpdateApplicationStatus(Guid id, int status);
        public Task<DashboardDTO> GetDashboardData(int month, int year);
    }
}
