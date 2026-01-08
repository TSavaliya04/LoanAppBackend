using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Entities
{
    [BsonIgnoreExtraElements]
    public class BorrowerInfoDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid? PreApprovalId { get; set; }
        public string BorrowerName { get; set; }
        public string? CoBorrowerName { get; set; }
        public int? FicoScore { get; set; }
        public int? CoBorrowerFicoScore { get; set; }
        public string? BorrowerCellNumber { get; set; }
        public string? CoBorrowerCellNumber { get; set; }
        public string? BorrowerEmail { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    //[BsonIgnoreExtraElements]
    //public class PreApprovalDTO
    //{
    //    public Guid? Id { get; set; }
    //    public Guid UserId { get; set; }
    //    public DateTime? CreatedAt { get; set; }
    //}

    [BsonIgnoreExtraElements]
    public class PurchaseInfoDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public decimal PurchasePrice { get; set; }
        public decimal DownPayment { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal AnnualInterestRate { get; set; }
        public decimal MipFundingFee { get; set; }
        public decimal? HazardInsurance { get; set; }
        public decimal? AssociationFee { get; set; }
        public decimal? MiPercent { get; set; }
        public int LoanProgram { get; set; }
        public int PropertyType { get; set; }
        public int OccupancyStatus { get; set; }

        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class LenderFeesDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public string AgentName { get; set; }
        public decimal LoanOriginationFee { get; set; }
        public decimal LoanOriginationFeePercentage { get; set; }
        public decimal DiscountFee { get; set; }
        public decimal DiscountFeePercentage { get; set; }
        public decimal UpfrontMip { get; set; }
        public decimal UpfrontMipPercentage { get; set; }
        public decimal AppraisalFee { get; set; }
        public decimal EscrowFees { get; set; }
        public decimal? TitleFees { get; set; }
        public decimal? ThirdPartyLenderFee { get; set; }
        public decimal NotaryFee { get; set; }
        public decimal UnderWriter { get; set; }
        public decimal ProcessFee { get; set; }
        public decimal? NonRecurringCost { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PrepaidItemsDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public int PrepaidInterestDays { get; set; }
        public decimal PrepaidInterestAmount { get; set; }
        public decimal HazardInsurance { get; set; }
        public int HazardInsuranceMonths { get; set; }
        public decimal HazardInsuranceReserves { get; set; }
        public int PropertyTaxMonths { get; set; }
        public decimal PropertyTaxAmount { get; set; }
        public decimal PrePayCost { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class MiscFeesDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public decimal? EarnestMoneyDeposit { get; set; }
        public decimal? SellerCredit { get; set; }
        public decimal? LenderCredit { get; set; }
        public decimal? MiscFee4 { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PreApprovalTrackDTO
    {
        public Guid PreApprovalId { get; set; }
        public int LastSubmittedFormNo { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class BorrowerIncomeDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public string BorrowerName { get; set; }
        public int? FicoScore { get; set; }
        public decimal? MonthlyIncome { get; set; }
        public List<DebtBreakdownDTO> Debts { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class W2DTO
    {
        public Guid Id { get; set; }
        public decimal? Amount { get; set; }
        public int? TaxYear { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class DebtBreakdownDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public int DebtType { get; set; }
        public decimal Balance { get; set; }
        public decimal MonthlyPayment { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class LoanProgramBorrowerIncomeDTO
    {
        public Guid? Id { get; set; }
        public decimal? MonthlyIncome { get; set; }
        public decimal? Debts { get; set; }
        public int? FicoScore { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class LoanProgramDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public int LoanProgram { get; set; }
        public decimal? FrontEndRatio { get; set; }
        public decimal? BackEndRatio { get; set; }
        public decimal? Price { get; set; }
        public decimal InterestRate { get; set; }
        public decimal BaseLoanAmount { get; set; }
        public decimal? UPMIPRate { get; set; }
        public decimal? UPMIPAmount { get; set; }
        public decimal? FinalLoanAmount { get; set; }
        public decimal? MMI { get; set; }
        public int Term { get; set; }
        public decimal? DownPaymentAmount { get; set; }
        public decimal? DownPaymentPercentage { get; set; }
        public decimal? ClearingCart { get; set; }
        public decimal? PropertyTax { get; set; }
        public decimal? TotalNeededToClear { get; set; }
        public List<LoanProgramBorrowerIncomeDTO> Borrowers { get; set; }
        public decimal? CombinedMonthlyIncome { get; set; }
        public decimal? PrincipalAndInterest { get; set; }
        public decimal? MonthlyPropertyTax { get; set; }
        public decimal? HazardInsurance { get; set; }
        public decimal? MortgageInsurance { get; set; }
        public decimal? HoaFee { get; set; }
        public decimal? MonthlyTotal { get; set; }
        public decimal? AnnualMIPRate { get; set; }
        public decimal? monthlyPropertyTaxPercentage { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class TopOpportunityDTO
    {
        public Guid PreApprovalId { get; set; }
        public string? BorrowerName { get; set; }
        public string? LoanProgram { get; set; }
        public string? AgentName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool? isLoanProgramFilled { get; set; }
        public List<BorrowerIncomeDTO> Borrowers { get; set; }
        public List<ScenarioData> Scenarios { get; set; }
    }

    public class ScenarioData
    {
        public decimal? LoanAmount { get; set; }
        public decimal? AnnualInterestRate { get; set; }
        public string? LoanProgram { get; set; }
        public decimal? MonthlyTotal { get; set; }
        public bool? isLoanProgramFilled { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PreApprovalReport
    {
        public Guid PreApprovalId { get; set; }
        public DateTime Date { get; set; }
        public string BorrowerName { get; set; }
        public List<string> Borrowers { get; set; }
        public string LendingCompany { get; set; }
        public decimal FirstMortgageAmount { get; set; }
        public decimal DownPaymentAmount { get; set; }
        public decimal DownPaymentPercentage { get; set; }
        public decimal PurchasePrice { get; set; }
        public int LoanProgram { get; set; }
        public int PropertyType { get; set; }
        public int OccupancyStatus { get; set; }
        public string AgentName { get; set; }
        public UserDTO AgentInfo { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class FHAReport
    {
        public Guid PreApprovalId { get; set; }
        public DateTime Date { get; set; }
        public string BorrowerName { get; set; }
        public decimal SalePrice { get; set; }
        public decimal DownPaymentAmount { get; set; }
        public decimal SubFinancing { get; set; }
        public decimal UpfrontMipPercent { get; set; }
        public decimal UpfrontMipAmount { get; set; }
        public decimal TotalLoanAmount { get; set; }
        public decimal PILoanAmount { get; set; }
        public decimal InterestRate { get; set; }
        public int LoanTerm { get; set; }
        public decimal PropertyTax { get; set; }
        public decimal HazardInsurancePremium { get; set; }
        public decimal MortgageInsurance { get; set; }
        public decimal CoverageRate { get; set; }
        public decimal HOADues { get; set; }
        public decimal TotalMonthlyPayment { get; set; }
        public int LoanProgram { get; set; }
        public decimal OtherFinancedItems { get; set; }
        public DateTime ExpirationDate { get; set; }
        public EstimatedClosingCostDTO estimatedClosingCost { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class QuickQuote
    {
        public decimal HomeValue { get; set; }
        public decimal InterestRate { get; set; }
        public decimal DownPaymentPercent { get; set; }
        public decimal LoanProgram { get; set; }
        public decimal PrincipalAndInterest { get; set; }
        public decimal PropertyTax { get; set; }
        public decimal HazardInsurance { get; set; }
        public decimal MortgageInsurance { get; set; }
        public decimal? HoaFee { get; set; }
        public decimal MonthlyTotal { get; set; }
        public decimal DownPayment { get; set; }
        public decimal ClosingCosts { get; set; }
        //public decimal Prepaids { get; set; }
        public decimal TotalRequired { get; set; }
        public decimal SellerCredit { get; set; }
        public decimal LenderCredit { get; set; }
        public decimal EarnestMoneyDeposit { get; set; }
        public decimal MiscFee4 { get; set; }
    }


    [BsonIgnoreExtraElements]
    public class EstimatedClosingCostDTO
    {
        public decimal DiscountFeePercent { get; set; }
        public decimal DiscountFee { get; set; }
        public decimal OriginationFeePercent { get; set; }
        public decimal OriginationFee { get; set; }
        public int PrepaidInterestDays { get; set; }
        public decimal PrepaidInterest { get; set; }
        public decimal HazInsPremium { get; set; }
        public int HazInsReserveMonths { get; set; }
        public decimal HazInsReserve { get; set; }
        public int PpdPropTaxesMonths { get; set; }
        public decimal PpdPropTaxes { get; set; }
        public decimal EscrowFees { get; set; }
        public decimal TitleInsurance { get; set; }
        public decimal ThirdPartyLenderFee { get; set; }
        public decimal AppraisalFee { get; set; }
        public decimal TotalEstSettlementCharges { get; set; }
        public decimal DownPayment { get; set; }
        public decimal TotalEstFundToClose { get; set; }
        public decimal? EarnestMoneyDeposit { get; set; }
        public decimal? SellerCredit { get; set; }
        public decimal? LenderCredit { get; set; }
        public decimal? MiscFee4 { get; set; }
        //public decimal NotaryFee { get; set; }
        //public decimal LoanOriginationFees { get; set; }
        //public decimal UnderWritingFee { get; set; }
        //public decimal WireFee { get; set; }
        //public decimal MtgInsPremium { get; set; }
        //public decimal MtgInsReserve { get; set; }
        //public decimal PropertyTaxReserves { get; set; }
        //public decimal SettlementFee { get; set; }
        //public decimal WIREFee { get; set; }
        //public decimal AttorneyFee { get; set; }
        //public decimal AddTitleCharges { get; set; }
        //public decimal AddEscrowCharges { get; set; }
        //public decimal RecordingFee { get; set; }
        //public decimal RecordingFeeOtherOne { get; set; }
        //public decimal RecordingFeeOtherTwo { get; set; }
        //public decimal RecordingFeeUPMIP { get; set; }
        //public decimal RecordingFeePadding { get; set; }
        //public decimal SellerCredit { get; set; }
        //public decimal EscrowDepositEMD { get; set; }
        //public decimal UpFrontMIP { get; set; }
        //public decimal UnderWriter { get; set; }
        //public decimal ProcessFee { get; set; }
        //public decimal EstClosingCost { get; set; }
        //public decimal EstPrepaidItemReserves { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class ScenarioDTO
    {
        [BsonId]
        public Guid Id { get; set; }

        public int ScenarioOrder { get; set; }  
        public string? ScenarioName { get; set; }  
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int LastSubmittedFormNo { get; set; }

        // All form data per scenario
        public BorrowerInfoDTO? BorrowerInfo { get; set; }
        public PurchaseInfoDTO? PurchaseInfo { get; set; }
        public LenderFeesDTO? LenderFees { get; set; }
        public PrepaidItemsDTO? PrepaidItems { get; set; }
        public MiscFeesDTO? MiscFees { get; set; }
        public List<BorrowerIncomeDTO>? BorrowerIncomes { get; set; }
        public LoanProgramDTO? LoanProgram { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PreApprovalDocument
    {
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("userId")]
        public Guid UserId { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [BsonElement("lastSubmittedFormNo")]
        public int LastSubmittedFormNo { get; set; }

        [BsonElement("lastSubmittedScenarioNo")]
        public int LastSubmittedScenarioNo { get; set; }

        [BsonElement("Status")]
        public int Status { get; set; }

        [BsonElement("Scenarios")]
        public List<ScenarioDTO> Scenarios { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PreApprovalDTO
    {
        public Guid? Id { get; set; }

        public Guid? UserId { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public int? LastSubmittedFormNo { get; set; }

        public int? LastSubmittedScenarioNo { get; set; }

        public int Status { get; set; }

        public List<ScenarioDTO> Scenarios { get; set; }
    }
}
