using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Entities
{
    public class BorrowerInfoDTO
    {
        public Guid? Id { get; set; }
        
        [BsonIgnore]
        public Guid? PreApprovalId { get; set; }
        public string? BorrowerName { get; set; }
        public string? CoBorrowerName { get; set; }
        public int? FicoScore { get; set; }
        public int? CoBorrowerFicoScore { get; set; }
        public string? BorrowerCellNumber { get; set; }
        public string? CoBorrowerCellNumber { get; set; }
        public string? BorrowerEmail { get; set; }
        public int? LoanProgram { get; set; }
        public int? PropertyType { get; set; }
        public int? OccupancyStatus { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class PreApprovalDTO
    {
        public Guid? Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class PurchaseInfoDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public decimal? PurchasePrice { get; set; }
        public decimal? DownPayment { get; set; }
        public decimal? LoanAmount { get; set; }
        public decimal? FirstRateLoan { get; set; }
        public decimal? MipFundingFee { get; set; }
        public decimal? HazardInsurance { get; set; }
        public decimal? AssociationFee { get; set; }
        public decimal? MiPercent { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class LenderFeesDTO
    {
        public Guid? Id { get; set; }
        
        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public string? AgentName { get; set; }
        public decimal? LoanOriginationFee { get; set; }
        public decimal? DiscountFee { get; set; }
        public decimal? UpfrontMip { get; set; }
        public decimal? AppraisalFee { get; set; }
        public decimal? EscrowFees { get; set; }
        public decimal? TitleFees { get; set; }
        public decimal? ThirdPartyLenderFee { get; set; }
        public decimal? NotaryFee { get; set; }
        public decimal? UnderWriter { get; set; }
        public decimal? ProcessFee { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class PrepaidItemsDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public int? PrepaidInterestDays { get; set; }
        public decimal? PrepaidInterestAmount { get; set; }
        public decimal? HazardInsurance { get; set; }
        public int? HazardInsuranceMonths { get; set; }
        public decimal? HazardInsuranceReserves { get; set; }
        public int? PropertyTaxMonths { get; set; }
        public decimal? PropertyTaxAmount { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class MiscFeesDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public decimal? MiscFee1 { get; set; }
        public decimal? MiscFee2 { get; set; }
        public decimal? MiscFee3 { get; set; }
        public decimal? MiscFee4 { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class PreApprovalTrackDTO
    {
        public Guid PreApprovalId { get; set; }
        public int LastSubmittedFormNo { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class BorrowerIncomeDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore] 
        public Guid PreApprovalId { get; set; }
        public string? BorrowerName { get; set; }
        public string? Employer { get; set; }
        public decimal? MonthlyIncome { get; set; }
        //public decimal? YTDEarnings { get; set; }
        //public List<W2DTO>? W2Forms { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class W2DTO
    {
        public Guid Id {  get; set; }
        public decimal? Amount { get; set; }
        public int? TaxYear { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class DebtBreakdownDTO
    {
        public Guid? Id { get; set; }
        
        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public int DebtType { get; set; }
        public decimal Balance { get; set; }
        public decimal HighCredit { get; set; }
        public decimal MonthlyPayment { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class LoanProgramDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }
        public int? LoanProgram { get; set; }
        public decimal? FrontEndRatio { get; set; }
        public decimal? BackEndRatio { get; set; }
        public decimal? Price { get; set; }
        public decimal? InterestRate { get; set; }
        public decimal? BaseLoanAmount { get; set; }
        public decimal? UPMIPRate { get; set; }
        public decimal? UPMIPAmount { get; set; }
        public decimal? FinalLoanAmount { get; set; }
        public decimal? MMI { get; set; }
        public int? Term { get; set; }
        public decimal? DownPaymentAmount { get; set; }
        public decimal? DownPaymentPercentage { get; set; }
        public decimal? ClearingCart { get; set; }
        public decimal? PropertyTax { get; set; }
        public decimal? TotalNeededToClear{ get; set; }
        // Borrower 1
        public decimal? Borrower1MonthlyIncome { get; set; }
        public decimal? Borrower1Debts { get; set; }
        public int? Borrower1FicoScore { get; set; }
        // Borrower 2
        public decimal? Borrower2MonthlyIncome { get; set; }
        public decimal? Borrower2Debts { get; set; }
        public int? Borrower2FicoScore { get; set; }
        public decimal? CombinedMonthlyIncome { get; set; }
        public decimal? PrincipalAndInterest { get; set; }
        public decimal? MonthlyPropertyTax { get; set; }
        public decimal? HazardInsurance { get; set; }
        public decimal? MortgageInsurance { get; set; }
        public decimal? MonthlyTotal { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class TopOpportunityDTO
    {
        public Guid PreApprovalId { get; set; }
        public string? BorrowerName { get; set; }
        public int? LoanProgram { get; set; }
        public string? AgentName { get; set; }
    }

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
    }

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
        public EstimatedClosingCostDTO estimatedClosingCost { get; set; }
    }

    public class EstimatedClosingCostDTO
    {
        public decimal LoanOriginationFees { get; set; }
        public decimal DiscountFee { get; set; }
        public decimal UpFrontMIP { get; set; }
        public decimal UnderWriter { get; set; }
        public decimal ProcessFee { get; set; }
        public decimal PrepaidInterest { get; set; }
        public decimal HazInsPremium { get; set; }
        public decimal HazInsReserve { get; set; }
        public decimal PpdPropTaxes { get; set; }
        public decimal EscrowFee { get; set; }
        public decimal NotaryFee { get; set; }
        public decimal TitleInsurance { get; set; }
        public decimal AppraisalFee { get; set; }
        public decimal UnderWritingFee { get; set; }
        public decimal WireFee { get; set; }
        public decimal MtgInsPremium { get; set; }
        public decimal MtgInsReserve { get; set; }
        public decimal PropertyTaxReserves { get; set; }
        public decimal SettlementFee { get; set; }
        public decimal WIREFee { get; set; }
        public decimal AttorneyFee { get; set; }
        public decimal AddTitleCharges { get; set; }
        public decimal AddEscrowCharges { get; set; }
        public decimal RecordingFee { get; set; }
        public decimal RecordingFeeOtherOne { get; set; }
        public decimal RecordingFeeOtherTwo { get; set; }
        public decimal RecordingFeeUPMIP { get; set; }
        public decimal RecordingFeePadding { get; set; }
        public decimal EstClosingCost { get; set; }
        public decimal EstPrepaidItemReserves { get; set; }
        public decimal TotalEstSettlementCharges { get; set; }
        public decimal SellerCredit { get; set; }
        public decimal EscrowDepositEMD { get; set; }
        public decimal TotalEstFundToClose { get; set; }
    }

    public class PreApprovalDocument
    {
        [BsonId]
        //[BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }

        [BsonElement("userId")]
        //[BsonRepresentation(BsonType.String)]
        public Guid UserId { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [BsonElement("lastSubmittedFormNo")]
        public int LastSubmittedFormNo { get; set; }

        [BsonElement("borrowerInfo")]
        public BorrowerInfoDTO BorrowerInfo { get; set; }

        [BsonElement("purchaseInfo")]
        public PurchaseInfoDTO PurchaseInfo { get; set; }

        [BsonElement("lenderFees")]
        public LenderFeesDTO LenderFees { get; set; }

        [BsonElement("prepaidItems")]
        public PrepaidItemsDTO PrepaidItems { get; set; }

        [BsonElement("miscFees")]
        public MiscFeesDTO MiscFees { get; set; }

        [BsonElement("borrowerIncomes")]
        public List<BorrowerIncomeDTO> BorrowerIncomes { get; set; }
        
        [BsonElement("debtBreakdowns")]
        public List<DebtBreakdownDTO> DebtBreakdowns { get; set; }

        [BsonElement("loanProgram")]
        public LoanProgramDTO LoanProgram { get; set; }
    }
}
