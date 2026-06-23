using System;
using System.Collections.Generic;
using System.Text.Json;

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
        public JsonElement KeyInsights { get; set; }
        public List<AiSuggestion> AiSuggestions { get; set; }
    }

    public class KeyInsight
    {
        public string Text { get; set; }
    }

    public class AiSuggestion
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Impact { get; set; } // "positive" | "neutral" | "warning"
    }

    // Final summary object returned by the API
    public class AiStrategySummary
    {
        public RecommendedScenario RecommendedScenario { get; set; }
        public List<KeyInsight> KeyInsights { get; set; }
        public List<AiSuggestion> Suggestions { get; set; }
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
