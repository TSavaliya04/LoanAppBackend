using MongoDB.Bson.Serialization.Attributes;
using LoanPortal.Shared.Enum;
using System;
using System.Collections.Generic;

namespace LoanPortal.Core.Entities
{
    [BsonIgnoreExtraElements]
    public class IncomeCalculationDocument
    {
        [BsonId]
        public Guid Id { get; set; }

        [BsonElement("preApprovalId")]
        public Guid PreApprovalId { get; set; }

        [BsonElement("scenarioId")]
        public Guid ScenarioId { get; set; }

        // Step 1 — Borrower employment info (borrower-level)
        [BsonElement("borrowerName")]
        public string BorrowerName { get; set; }

        [BsonElement("employer")]
        public string Employer { get; set; }

        [BsonElement("employmentType")]
        public EmploymentType EmploymentType { get; set; }

        [BsonElement("startDate")]
        public DateTime? StartDate { get; set; }

        [BsonElement("ytdPeriodEnding")]
        public DateTime? YtdPeriodEnding { get; set; }

        // Step 2 + 3 + 4 — Income sources
        [BsonElement("incomeSources")]
        public List<IncomeSourceCalculationDTO> IncomeSources { get; set; }

        // Sum of all sources' MonthlyIncomeFromSource
        [BsonElement("totalMonthlyIncomeFromSources")]
        public decimal TotalMonthlyIncomeFromSources { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class IncomeSourceCalculationDTO
    {
        [BsonElement("id")]
        public Guid Id { get; set; }

        [BsonElement("incomeType")]
        public IncomeSourceType IncomeType { get; set; }

        // Only one will be non-null depending on IncomeType
        [BsonElement("salary")]
        public SalaryIncomeDetailDTO? Salary { get; set; }

        [BsonElement("hourly")]
        public HourlyIncomeDetailDTO? Hourly { get; set; }

        [BsonElement("overtimeBonus")]
        public OvertimeBonusIncomeDetailDTO? OvertimeBonus { get; set; }

        [BsonElement("commission")]
        public CommissionIncomeDetailDTO? Commission { get; set; }

        [BsonElement("scheduleC")]
        public ScheduleCIncomeDetailDTO? ScheduleC { get; set; }

        [BsonElement("nonTaxable")]
        public NonTaxableIncomeDetailDTO? NonTaxable { get; set; }

        [BsonElement("other")]
        public OtherIncomeDetailDTO? Other { get; set; }

        [BsonElement("bankStatement")]
        public BankStatementIncomeDetailDTO? BankStatement { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class SalaryIncomeDetailDTO
    {
        [BsonElement("payFrequency")]
        public PayFrequency PayFrequency { get; set; }

        [BsonElement("grossSalary")]
        public decimal GrossSalary { get; set; }

        [BsonElement("ytdSalary")]
        public decimal? YtdSalary { get; set; }

        [BsonElement("ytdMonths")]
        public decimal? YtdMonths { get; set; }

        [BsonElement("priorYear1W2Income")]
        public decimal? PriorYear1W2Income { get; set; }

        [BsonElement("priorYear1Months")]
        public decimal? PriorYear1Months { get; set; }

        [BsonElement("priorYear2W2Income")]
        public decimal? PriorYear2W2Income { get; set; }

        [BsonElement("priorYear2Months")]
        public decimal? PriorYear2Months { get; set; }

        // Step 4 — Suggested income chosen by the user
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class HourlyIncomeDetailDTO
    {
        [BsonElement("hourlyRate")]
        public decimal HourlyRate { get; set; }

        [BsonElement("hoursPerWeek")]
        public decimal HoursPerWeek { get; set; }

        [BsonElement("ytdEarnings")]
        public decimal? YtdEarnings { get; set; }

        [BsonElement("ytdMonths")]
        public decimal? YtdMonths { get; set; }

        [BsonElement("priorYear1W2Income")]
        public decimal? PriorYear1W2Income { get; set; }

        [BsonElement("priorYear1Months")]
        public decimal? PriorYear1Months { get; set; }

        [BsonElement("priorYear2W2Income")]
        public decimal? PriorYear2W2Income { get; set; }

        [BsonElement("priorYear2Months")]
        public decimal? PriorYear2Months { get; set; }

        // Step 4 — Suggested income chosen by the user
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class OvertimeBonusIncomeDetailDTO
    {
        [BsonElement("ytdOvertimeBonus")]
        public decimal? YtdOvertimeBonus { get; set; }

        [BsonElement("ytdMonths")]
        public decimal? YtdMonths { get; set; }

        [BsonElement("priorYear1OvertimeBonus")]
        public decimal? PriorYear1OvertimeBonus { get; set; }

        [BsonElement("priorYear1Months")]
        public decimal? PriorYear1Months { get; set; }

        [BsonElement("priorYear2OvertimeBonus")]
        public decimal? PriorYear2OvertimeBonus { get; set; }

        [BsonElement("priorYear2Months")]
        public decimal? PriorYear2Months { get; set; }

        // Step 4 — Suggested income chosen by the user
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class CommissionIncomeDetailDTO
    {
        [BsonElement("ytdCommission")]
        public decimal? YtdCommission { get; set; }

        [BsonElement("ytdExpenses")]
        public decimal? YtdExpenses { get; set; }

        [BsonElement("ytdMonths")]
        public decimal? YtdMonths { get; set; }

        [BsonElement("priorYear1Commission")]
        public decimal? PriorYear1Commission { get; set; }

        [BsonElement("priorYear1Expenses")]
        public decimal? PriorYear1Expenses { get; set; }

        [BsonElement("priorYear1Months")]
        public decimal? PriorYear1Months { get; set; }

        [BsonElement("priorYear2Commission")]
        public decimal? PriorYear2Commission { get; set; }

        [BsonElement("priorYear2Expenses")]
        public decimal? PriorYear2Expenses { get; set; }

        [BsonElement("priorYear2Months")]
        public decimal? PriorYear2Months { get; set; }

        // Step 4 — Suggested income chosen by the user
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class ScheduleCIncomeDetailDTO
    {
        [BsonElement("ytdAdjustedIncome")]
        public decimal? YtdAdjustedIncome { get; set; }

        [BsonElement("ytdMonths")]
        public decimal? YtdMonths { get; set; }

        [BsonElement("priorYear1TaxReturn")]
        public decimal? PriorYear1TaxReturn { get; set; }

        [BsonElement("priorYear1Months")]
        public decimal? PriorYear1Months { get; set; }

        [BsonElement("priorYear2TaxReturn")]
        public decimal? PriorYear2TaxReturn { get; set; }

        [BsonElement("priorYear2Months")]
        public decimal? PriorYear2Months { get; set; }

        // Step 4 — Suggested income chosen by the user
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class NonTaxableIncomeDetailDTO
    {
        [BsonElement("monthlyBenefit")]
        public decimal? MonthlyBenefit { get; set; }

        [BsonElement("annualUntaxedIncome")]
        public decimal? AnnualUntaxedIncome { get; set; }

        [BsonElement("directDepositCheckVerified")]
        public bool DirectDepositCheckVerified { get; set; }

        [BsonElement("grossUpForQualifying")]
        public bool GrossUpForQualifying { get; set; }

        [BsonElement("grossUpPercentage")]
        public decimal? GrossUpPercentage { get; set; }

        // Step 4 — Suggested income chosen by the user
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class OtherIncomeDetailDTO
    {
        [BsonElement("items")]
        public List<OtherIncomeDeductionItemDTO> Items { get; set; }

        // Step 4 — Suggested income chosen by the user (or calculated total impact)
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class OtherIncomeDeductionItemDTO
    {
        [BsonElement("type")]
        public string Type { get; set; }

        [BsonElement("amount")]
        public decimal Amount { get; set; }

        [BsonElement("averagingMonths")]
        public decimal? AveragingMonths { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class BankStatementIncomeDetailDTO
    {
        // Stores 12 months of deposits
        [BsonElement("deposits")]
        public List<decimal?> Deposits { get; set; }

        [BsonElement("expenseFactor")]
        public decimal? ExpenseFactor { get; set; }

        // Step 4 — Suggested income chosen by the user (or calculated net annual / 12)
        [BsonElement("monthlyIncomeFromSource")]
        public decimal MonthlyIncomeFromSource { get; set; }
    }
}
