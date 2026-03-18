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

        [BsonElement("borrowerName")]
        public string BorrowerName { get; set; }

        [BsonElement("coBorrowerName")]
        public string? CoBorrowerName { get; set; }

        [BsonElement("ficoScore")]
        public int? FicoScore { get; set; }

        [BsonElement("coBorrowerFicoScore")]
        public int? CoBorrowerFicoScore { get; set; }

        [BsonElement("borrowerCellNumber")]
        public string? BorrowerCellNumber { get; set; }

        [BsonElement("coBorrowerCellNumber")]
        public string? CoBorrowerCellNumber { get; set; }

        [BsonElement("borrowerEmail")]
        public string? BorrowerEmail { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class RefinanceBorrowerInfoDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid? PreApprovalId { get; set; }

        [BsonElement("borrowerName")]
        public string BorrowerName { get; set; }

        [BsonElement("coBorrowerName")]
        public string? CoBorrowerName { get; set; }

        [BsonElement("borrowerCellNumber")]
        public string? BorrowerCellNumber { get; set; }

        [BsonElement("coBorrowerCellNumber")]
        public string? CoBorrowerCellNumber { get; set; }

        [BsonElement("borrowerEmail")]
        public string? BorrowerEmail { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PurchaseInfoDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("purchasePrice")]
        public decimal PurchasePrice { get; set; }

        [BsonElement("downPayment")]
        public decimal DownPayment { get; set; }

        [BsonElement("loanAmount")]
        public decimal LoanAmount { get; set; }

        [BsonElement("annualInterestRate")]
        public decimal AnnualInterestRate { get; set; }

        [BsonElement("mipFundingFee")]
        public decimal MipFundingFee { get; set; }

        [BsonElement("hazardInsurance")]
        public decimal? HazardInsurance { get; set; }

        [BsonElement("associationFee")]
        public decimal? AssociationFee { get; set; }

        [BsonElement("miPercent")]
        public decimal? MiPercent { get; set; }

        [BsonElement("loanProgram")]
        public int LoanProgram { get; set; }

        [BsonElement("propertyType")]
        public int PropertyType { get; set; }

        [BsonElement("occupancyStatus")]
        public int OccupancyStatus { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class RefinanceInfoDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("occupancyStatus")]
        public int OccupancyStatus { get; set; }

        [BsonElement("estimatedPropertyValue")]
        public decimal EstimatedPropertyValue { get; set; }

        [BsonElement("ltv")]
        public decimal LTV { get; set; }

        [BsonElement("loanAmount")]
        public decimal LoanAmount { get; set; }

        [BsonElement("currentLoanBalance")]
        public decimal CurrentLoanBalance { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class RefinanceLoanStructureDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("loanProgram")]
        public int LoanProgram { get; set; }

        [BsonElement("refinanceType")]
        public int RefinanceType { get; set; }  // 0 = Rate and Term, 1 = Cash Out

        [BsonElement("interestRate")]
        public decimal InterestRate { get; set; }

        [BsonElement("desiredCashOut")]
        public decimal? DesiredCashOut { get; set; }

        [BsonElement("maxAllowed")]
        public decimal? MaxAllowed { get; set; }

        [BsonElement("monthlyTaxAmount")]
        public decimal? MonthlyTaxAmount { get; set; }

        [BsonElement("annualTaxAmount")]
        public decimal? AnnualTaxAmount { get; set; }

        [BsonElement("mipRate")]
        public decimal? MipRate { get; set; }

        [BsonElement("hazardInsurance")]
        public decimal? HazardInsurance { get; set; }

        [BsonElement("associationFee")]
        public decimal? AssociationFee { get; set; }

        [BsonElement("mi")]
        public decimal? MI { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class LenderFeesDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("agentName")]
        public string AgentName { get; set; }

        [BsonElement("loanOriginationFee")]
        public decimal LoanOriginationFee { get; set; }

        [BsonElement("loanOriginationFeePercentage")]
        public decimal LoanOriginationFeePercentage { get; set; }

        [BsonElement("discountFee")]
        public decimal DiscountFee { get; set; }

        [BsonElement("discountFeePercentage")]
        public decimal DiscountFeePercentage { get; set; }

        [BsonElement("upfrontMip")]
        public decimal UpfrontMip { get; set; }

        [BsonElement("upfrontMipPercentage")]
        public decimal UpfrontMipPercentage { get; set; }

        [BsonElement("appraisalFee")]
        public decimal AppraisalFee { get; set; }

        [BsonElement("escrowFees")]
        public decimal EscrowFees { get; set; }

        [BsonElement("titleFees")]
        public decimal? TitleFees { get; set; }

        [BsonElement("thirdPartyLenderFee")]
        public decimal? ThirdPartyLenderFee { get; set; }

        [BsonElement("notaryFee")]
        public decimal NotaryFee { get; set; }

        [BsonElement("underWriter")]
        public decimal UnderWriter { get; set; }

        [BsonElement("processFee")]
        public decimal ProcessFee { get; set; }

        [BsonElement("nonRecurringCost")]
        public decimal? NonRecurringCost { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class RefinanceLenderFeesDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("loanOriginationFee")]
        public decimal LoanOriginationFee { get; set; }

        [BsonElement("loanOriginationFeePercentage")]
        public decimal LoanOriginationFeePercentage { get; set; }

        [BsonElement("discountFee")]
        public decimal DiscountFee { get; set; }

        [BsonElement("discountFeePercentage")]
        public decimal DiscountFeePercentage { get; set; }

        [BsonElement("upfrontMip")]
        public decimal UpfrontMip { get; set; }

        [BsonElement("upfrontMipPercentage")]
        public decimal UpfrontMipPercentage { get; set; }

        [BsonElement("appraisalFee")]
        public decimal AppraisalFee { get; set; }

        [BsonElement("escrowFees")]
        public decimal EscrowFees { get; set; }

        [BsonElement("titleFees")]
        public decimal? TitleFees { get; set; }

        [BsonElement("thirdPartyLenderFee")]
        public decimal? ThirdPartyLenderFee { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PrepaidItemsDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("prepaidInterestDays")]
        public int PrepaidInterestDays { get; set; }

        [BsonElement("prepaidInterestAmount")]
        public decimal PrepaidInterestAmount { get; set; }

        [BsonElement("hazardInsurance")]
        public decimal HazardInsurance { get; set; }

        [BsonElement("hazardInsuranceMonths")]
        public int HazardInsuranceMonths { get; set; }

        [BsonElement("hazardInsuranceReserves")]
        public decimal HazardInsuranceReserves { get; set; }

        [BsonElement("propertyTaxMonths")]
        public int PropertyTaxMonths { get; set; }

        [BsonElement("propertyTaxAmount")]
        public decimal PropertyTaxAmount { get; set; }

        [BsonElement("prePayCost")]
        public decimal PrePayCost { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class MiscFeesDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("earnestMoneyDeposit")]
        public decimal? EarnestMoneyDeposit { get; set; }

        [BsonElement("sellerCredit")]
        public decimal? SellerCredit { get; set; }

        [BsonElement("lenderCredit")]
        public decimal? LenderCredit { get; set; }

        [BsonElement("miscFee4")]
        public decimal? MiscFee4 { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class BorrowerIncomeDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("borrowerName")]
        public string BorrowerName { get; set; }

        [BsonElement("ficoScore")]
        public int? FicoScore { get; set; }

        [BsonElement("monthlyIncome")]
        public decimal? MonthlyIncome { get; set; }

        [BsonElement("debts")]
        public List<DebtBreakdownDTO> Debts { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class DebtBreakdownDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("debtType")]
        public int DebtType { get; set; }

        [BsonElement("balance")]
        public decimal Balance { get; set; }

        [BsonElement("monthlyPayment")]
        public decimal MonthlyPayment { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class LoanProgramBorrowerIncomeDTO
    {
        public Guid? Id { get; set; }

        [BsonElement("monthlyIncome")]
        public decimal? MonthlyIncome { get; set; }

        [BsonElement("debts")]
        public decimal? Debts { get; set; }

        [BsonElement("ficoScore")]
        public int? FicoScore { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class LoanProgramDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("loanProgram")]
        public int LoanProgram { get; set; }

        [BsonElement("frontEndRatio")]
        public decimal? FrontEndRatio { get; set; }

        [BsonElement("backEndRatio")]
        public decimal? BackEndRatio { get; set; }

        [BsonElement("price")]
        public decimal? Price { get; set; }

        [BsonElement("interestRate")]
        public decimal InterestRate { get; set; }

        [BsonElement("baseLoanAmount")]
        public decimal BaseLoanAmount { get; set; }

        [BsonElement("upmipRate")]
        public decimal? UPMIPRate { get; set; }

        [BsonElement("upmipAmount")]
        public decimal? UPMIPAmount { get; set; }

        [BsonElement("finalLoanAmount")]
        public decimal? FinalLoanAmount { get; set; }

        [BsonElement("mmi")]
        public decimal? MMI { get; set; }

        [BsonElement("term")]
        public int Term { get; set; }

        [BsonElement("downPaymentAmount")]
        public decimal? DownPaymentAmount { get; set; }

        [BsonElement("downPaymentPercentage")]
        public decimal? DownPaymentPercentage { get; set; }

        [BsonElement("clearingCart")]
        public decimal? ClearingCart { get; set; }

        [BsonElement("propertyTax")]
        public decimal? PropertyTax { get; set; }

        [BsonElement("totalNeededToClear")]
        public decimal? TotalNeededToClear { get; set; }

        [BsonElement("borrowers")]
        public List<LoanProgramBorrowerIncomeDTO> Borrowers { get; set; }

        [BsonElement("combinedMonthlyIncome")]
        public decimal? CombinedMonthlyIncome { get; set; }

        [BsonElement("principalAndInterest")]
        public decimal? PrincipalAndInterest { get; set; }

        [BsonElement("monthlyPropertyTax")]
        public decimal? MonthlyPropertyTax { get; set; }

        [BsonElement("hazardInsurance")]
        public decimal? HazardInsurance { get; set; }

        [BsonElement("mortgageInsurance")]
        public decimal? MortgageInsurance { get; set; }

        [BsonElement("hoaFee")]
        public decimal? HoaFee { get; set; }

        [BsonElement("monthlyTotal")]
        public decimal? MonthlyTotal { get; set; }

        [BsonElement("annualMipRate")]
        public decimal? AnnualMIPRate { get; set; }

        [BsonElement("monthlyPropertyTaxPercentage")]
        public decimal? monthlyPropertyTaxPercentage { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class RefinanceLoanProgramDTO
    {
        public Guid? Id { get; set; }

        [BsonIgnore]
        public Guid PreApprovalId { get; set; }

        [BsonElement("loanProgram")]
        public int LoanProgram { get; set; }

        [BsonElement("frontEndRatio")]
        public decimal? FrontEndRatio { get; set; }

        [BsonElement("backEndRatio")]
        public decimal? BackEndRatio { get; set; }

        [BsonElement("price")]
        public decimal? Price { get; set; }

        [BsonElement("interestRate")]
        public decimal InterestRate { get; set; }

        [BsonElement("baseLoanAmount")]
        public decimal BaseLoanAmount { get; set; }

        [BsonElement("upmipRate")]
        public decimal? UPMIPRate { get; set; }

        [BsonElement("upmipAmount")]
        public decimal? UPMIPAmount { get; set; }

        [BsonElement("finalLoanAmount")]
        public decimal? FinalLoanAmount { get; set; }

        [BsonElement("mmi")]
        public decimal? MMI { get; set; }

        [BsonElement("term")]
        public int Term { get; set; }

        [BsonElement("clearingCart")]
        public decimal? ClearingCart { get; set; }

        [BsonElement("propertyTax")]
        public decimal? PropertyTax { get; set; }

        [BsonElement("totalNeededToClear")]
        public decimal? TotalNeededToClear { get; set; }

        [BsonElement("borrowers")]
        public List<LoanProgramBorrowerIncomeDTO>? Borrowers { get; set; }

        [BsonElement("combinedMonthlyIncome")]
        public decimal? CombinedMonthlyIncome { get; set; }

        [BsonElement("principalAndInterest")]
        public decimal? PrincipalAndInterest { get; set; }

        [BsonElement("monthlyPropertyTax")]
        public decimal? MonthlyPropertyTax { get; set; }

        [BsonElement("hazardInsurance")]
        public decimal? HazardInsurance { get; set; }

        [BsonElement("mortgageInsurance")]
        public decimal? MortgageInsurance { get; set; }

        [BsonElement("hoaFee")]
        public decimal? HoaFee { get; set; }

        [BsonElement("monthlyTotal")]
        public decimal? MonthlyTotal { get; set; }

        [BsonElement("annualMipRate")]
        public decimal? AnnualMIPRate { get; set; }

        [BsonElement("monthlyPropertyTaxPercentage")]
        public decimal? monthlyPropertyTaxPercentage { get; set; }
        // Refinance-specific

        [BsonElement("ltv")]
        public decimal? LTV { get; set; }

        [BsonElement("ltvAmount")]
        public decimal? LTVAmount { get; set; }

        [BsonElement("closingCosts")]
        public decimal? ClosingCosts { get; set; }

        [BsonElement("cashOutAmount")]
        public decimal? CashOutAmount { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
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
        public decimal LoanAmount { get; set; }
        public decimal AnnualInterestRate { get; set; }
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
    public class PurchaseScenarioDTO
    {
        [BsonElement("borrowerInfo")]
        public BorrowerInfoDTO? BorrowerInfo { get; set; }

        [BsonElement("purchaseInfo")]
        public PurchaseInfoDTO? PurchaseInfo { get; set; }

        [BsonElement("lenderFees")]
        public LenderFeesDTO? LenderFees { get; set; }

        [BsonElement("prepaidItems")]
        public PrepaidItemsDTO? PrepaidItems { get; set; }

        [BsonElement("miscFees")]
        public MiscFeesDTO? MiscFees { get; set; }

        [BsonElement("borrowerIncomes")]
        //[BsonSerializer(typeof(SingleOrArraySerializer<BorrowerIncomeDTO>))]
        public List<BorrowerIncomeDTO>? BorrowerIncomes { get; set; }

        [BsonElement("loanProgram")]
        public LoanProgramDTO? LoanProgram { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class RefinanceScenarioDTO
    {
        [BsonElement("borrowerInfo")]
        public RefinanceBorrowerInfoDTO? BorrowerInfo { get; set; }

        [BsonElement("refinanceInfo")]
        public RefinanceInfoDTO? RefinanceInfo { get; set; }

        [BsonElement("loanStructure")]
        public RefinanceLoanStructureDTO? LoanStructure { get; set; }

        [BsonElement("lenderFees")]
        public RefinanceLenderFeesDTO? LenderFees { get; set; }

        [BsonElement("borrowerIncomes")]
        //[BsonSerializer(typeof(SingleOrArraySerializer<BorrowerIncomeDTO>))]
        public List<BorrowerIncomeDTO>? BorrowerIncomes { get; set; }

        [BsonElement("loanProgram")]
        public RefinanceLoanProgramDTO? LoanProgram { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class ScenarioDTO
    {
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("scenarioOrder")]
        public int ScenarioOrder { get; set; }

        [BsonElement("scenarioName")]
        public string? ScenarioName { get; set; }

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [BsonElement("lastSubmittedFormNo")]
        public int LastSubmittedFormNo { get; set; }

        // Only one will be populated based on PreApprovalDTO.LoanType

        [BsonElement("purchase")]
        public PurchaseScenarioDTO? Purchase { get; set; }

        [BsonElement("refinance")]
        public RefinanceScenarioDTO? Refinance { get; set; }
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

        // 0 = Purchase, 1 = Refinance
        [BsonElement("loanType")]
        public int LoanType { get; set; }

        [BsonElement("status")]
        public int Status { get; set; }

        [BsonElement("scenarios")]
        public List<ScenarioDTO> Scenarios { get; set; }

        [BsonElement("statusUpdatedAt")]
        public DateTime? StatusUpdatedAt { get; set; }
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

        // 0 = Purchase, 1 = Refinance
        public int LoanType { get; set; }

        public int Status { get; set; }
        
        public List<ScenarioDTO> Scenarios { get; set; }
        
        public DateTime? StatusUpdatedAt { get; set; }
    }
}
