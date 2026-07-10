using System;
using System.Collections.Generic;

namespace LoanPortal.Core.Entities
{
    public class ScenarioComparisonRequest
    {
        public Guid PreApprovalId { get; set; }
        public LoanPortal.Shared.Enum.BorrowerGoal BorrowerGoal { get; set; }
    }

    public class LoanScenario
    {
        public int ScenarioNo { get; set; }
        public string Id { get; set; }
        public string LoanType { get; set; }
        public decimal PurchasePrice { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal DownPaymentPct { get; set; }
        public int Term { get; set; }
        public decimal InterestRate { get; set; }
        public decimal FrontEndDTI { get; set; }
        public decimal BackEndDTI { get; set; }
        public decimal PrincipalAndInterest { get; set; }
        public decimal PropertyTax { get; set; }
        public decimal MortgageInsurance { get; set; }
        public decimal HoaFee { get; set; }
        public decimal MonthlyTotal { get; set; }
    }

    // This maps to the JSON returned by the AI
    public class AiTextResponse
    {
        public int RecommendedScenarioNo { get; set; }
        public string RecommendationReason { get; set; }
        public List<ScenarioNarrative> ScenarioNarratives { get; set; }
        public AiSection BuyingPowerAnalysis { get; set; }
        public AiSection CashToCloseImpact { get; set; }
        public AiSection ShoppingStrategy { get; set; }
        public AiSection FinancingStrategy { get; set; }
    }

    public class ScenarioNarrative
    {
        public int ScenarioNo { get; set; }
        public string Label { get; set; }
        public List<string> Highlights { get; set; }
    }

    public class AiSection
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }

    // Final summary object returned by the API
    public class AiStrategySummary
    {
        public RecommendedScenario RecommendedScenario { get; set; }
        public List<ScenarioNarrative> ScenarioNarratives { get; set; }
        public AiSection BuyingPowerAnalysis { get; set; }
        public AiSection CashToCloseImpact { get; set; }
        public AiSection ShoppingStrategy { get; set; }
        public AiSection FinancingStrategy { get; set; }
    }

    public class RecommendedScenario
    {
        public string ScenarioId { get; set; }
        public string Title { get; set; }
        public string Reason { get; set; } 
        public decimal MonthlySavings { get; set; }
        public int AiFitScore { get; set; }
        public string FitScoreLabel { get; set; }
        public string ApprovalLikelihoodLabel { get; set; }
        public int LikelihoodDelta { get; set; }
    }
}
