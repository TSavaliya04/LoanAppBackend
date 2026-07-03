using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services
{
    public class AiStrategyService : IAiStrategyService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IPreApprovalService _preApprovalService;

        public AiStrategyService(HttpClient httpClient, IConfiguration configuration, IPreApprovalService preApprovalService)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromMinutes(5);
            _configuration = configuration;
            _preApprovalService = preApprovalService;
        }

        public async Task<AiStrategySummary> GenerateSummaryAsync(ScenarioComparisonRequest request)
        {
            var preApproval = await _preApprovalService.GetPreApproval(request.PreApprovalId);
            if (preApproval == null) throw new Exception("PreApproval not found");

            var loanScenarios = new List<LoanScenario>();
            var sbScenarios = new StringBuilder();
            decimal combinedMonthlyIncome = 0;
            decimal monthlyDebts = 0;

            foreach (var s in preApproval.Scenarios)
            {
                if (preApproval.LoanType == 0 && s.Purchase?.LoanProgram != null && s.Purchase?.PurchaseInfo != null)
                {
                    var lp = s.Purchase.LoanProgram;
                    var pi = s.Purchase.PurchaseInfo;

                    if (combinedMonthlyIncome == 0 && s.Purchase.BorrowerIncomes != null)
                    {
                        combinedMonthlyIncome = s.Purchase.BorrowerIncomes.Sum(b => b.MonthlyIncome ?? 0);
                        monthlyDebts = s.Purchase.BorrowerIncomes.Sum(b => b.Debts?.Sum(d => d.MonthlyPayment) ?? 0);
                    }

                    var loanScenario = new LoanScenario
                    {
                        ScenarioNo = s.ScenarioOrder,
                        Id = s.Id.ToString(),
                        LoanType = ((LoanPortal.Shared.Enum.LoanProgram)lp.LoanProgram).ToString(),
                        PurchasePrice = pi.PurchasePrice,
                        LoanAmount = lp.FinalLoanAmount ?? lp.BaseLoanAmount,
                        DownPaymentPct = lp.DownPaymentPercentage ?? 0,
                        Term = lp.Term,
                        InterestRate = lp.InterestRate,
                        FrontEndDTI = lp.FrontEndRatio ?? 0,
                        BackEndDTI = lp.BackEndRatio ?? 0,
                        PrincipalAndInterest = lp.PrincipalAndInterest ?? 0,
                        PropertyTax = lp.MonthlyPropertyTax ?? 0,
                        MortgageInsurance = lp.MortgageInsurance ?? 0,
                        HoaFee = lp.HoaFee ?? 0,
                        MonthlyTotal = lp.MonthlyTotal ?? 0
                    };
                    loanScenarios.Add(loanScenario);

                    AppendScenarioText(sbScenarios, loanScenario);
                }
                else if (preApproval.LoanType == 1 && s.Refinance?.LoanProgram != null && s.Refinance?.RefinanceInfo != null)
                {
                    var lp = s.Refinance.LoanProgram;
                    var ri = s.Refinance.RefinanceInfo;

                    if (combinedMonthlyIncome == 0 && s.Refinance.BorrowerIncomes != null)
                    {
                        combinedMonthlyIncome = s.Refinance.BorrowerIncomes.Sum(b => b.MonthlyIncome ?? 0);
                        monthlyDebts = s.Refinance.BorrowerIncomes.Sum(b => b.Debts?.Sum(d => d.MonthlyPayment) ?? 0);
                    }

                    var loanScenario = new LoanScenario
                    {
                        ScenarioNo = s.ScenarioOrder,
                        Id = s.Id.ToString(),
                        LoanType = ((LoanPortal.Shared.Enum.LoanProgram)lp.LoanProgram).ToString(),
                        PurchasePrice = ri.EstimatedPropertyValue,
                        LoanAmount = lp.FinalLoanAmount ?? lp.BaseLoanAmount,
                        DownPaymentPct = 100 - (ri.LTV > 0 ? ri.LTV : (lp.LTV ?? 0)),
                        Term = lp.Term,
                        InterestRate = lp.InterestRate,
                        FrontEndDTI = lp.FrontEndRatio ?? 0,
                        BackEndDTI = lp.BackEndRatio ?? 0,
                        PrincipalAndInterest = lp.PrincipalAndInterest ?? 0,
                        PropertyTax = lp.MonthlyPropertyTax ?? 0,
                        MortgageInsurance = lp.MortgageInsurance ?? 0,
                        HoaFee = lp.HoaFee ?? 0,
                        MonthlyTotal = lp.MonthlyTotal ?? 0
                    };
                    loanScenarios.Add(loanScenario);

                    AppendScenarioText(sbScenarios, loanScenario);
                }
            }

            if (!loanScenarios.Any())
                throw new ArgumentException("No valid scenarios found for this PreApproval.");

            // 1. Calculate Fit Scores for all scenarios on the backend
            var scoredScenarios = loanScenarios.Select(s => new
            {
                Scenario = s,
                Score = CalculateFitScore(s, combinedMonthlyIncome, loanScenarios)
            }).ToList();

            // 2. Call AI to get Insights, Suggestions, and the Recommended Scenario
            string goalStr = request.BorrowerGoal switch
            {
                BorrowerGoal.LowestMonthlyPayment => "lowest_monthly_payment",
                BorrowerGoal.LowestCashToClose => "lowest_cash_to_close",
                BorrowerGoal.HighestCashToBorrower => "highest_cash_to_borrower",
                BorrowerGoal.FastestApproval => "fastest_approval",
                BorrowerGoal.LowestDownPayment => "lowest_down_payment",
                _ => "lowest_monthly_payment"
            };

            var aiTextResponse = await GetAiTextResponseAsync(goalStr, combinedMonthlyIncome, monthlyDebts, sbScenarios.ToString());

            // 3. Match the AI's recommendation to our scored scenarios
            var recommendedScenarioNo = aiTextResponse?.RecommendedScenarioNo ?? loanScenarios.First().ScenarioNo;
            var bestScoredScenario = scoredScenarios.FirstOrDefault(s => s.Scenario.ScenarioNo == recommendedScenarioNo) 
                                     ?? scoredScenarios.First();
            
            // Find the "other" scenario to calculate savings and delta (pick the next best score, or just the other one if only 2)
            var otherScoredScenario = scoredScenarios.OrderByDescending(s => s.Score).FirstOrDefault(s => s.Scenario.ScenarioNo != recommendedScenarioNo) 
                                      ?? scoredScenarios.Last();

            var monthlySavings = Math.Abs(bestScoredScenario.Scenario.MonthlyTotal - otherScoredScenario.Scenario.MonthlyTotal);
            var likelihoodDelta = bestScoredScenario.Score - otherScoredScenario.Score;

            string approvalLabel = GetApprovalLikelihoodLabel(bestScoredScenario.Score);
            string fitScoreLabel = GetFitScoreLabel(bestScoredScenario.Score);

            var recommendedScenario = new RecommendedScenario
            {
                ScenarioId = bestScoredScenario.Scenario.Id,
                Title = $"Scenario {bestScoredScenario.Scenario.ScenarioNo} ({bestScoredScenario.Scenario.LoanType})",
                Reason = aiTextResponse?.RecommendationReason ?? "Best fit for your goal.",
                MonthlySavings = monthlySavings,
                AiFitScore = bestScoredScenario.Score,
                FitScoreLabel = fitScoreLabel,
                ApprovalLikelihoodLabel = approvalLabel,
                LikelihoodDelta = likelihoodDelta
            };

            var insights = new List<KeyInsight>();
            if (aiTextResponse != null && aiTextResponse.KeyInsights.ValueKind == JsonValueKind.Array)
            {
                foreach (var element in aiTextResponse.KeyInsights.EnumerateArray())
                {
                    if (element.ValueKind == JsonValueKind.String)
                    {
                        insights.Add(new KeyInsight { Text = element.GetString() });
                    }
                    else if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty("text", out var textProp))
                    {
                        insights.Add(new KeyInsight { Text = textProp.GetString() });
                    }
                }
            }

            // 4. Construct Final Summary
            return new AiStrategySummary
            {
                RecommendedScenario = recommendedScenario,
                KeyInsights = insights,
                Suggestions = aiTextResponse?.AiSuggestions ?? new List<AiSuggestion>()
            };
        }

        private void AppendScenarioText(StringBuilder sb, LoanScenario s)
        {
            sb.AppendLine($"--- Scenario {s.ScenarioNo} ---");
            sb.AppendLine($"Loan type:              {s.LoanType}");
            sb.AppendLine($"Interest rate:          {s.InterestRate}%");
            sb.AppendLine($"Purchase price:         ${s.PurchasePrice}");
            sb.AppendLine($"Loan amount:            ${s.LoanAmount}");
            sb.AppendLine($"Down payment:           {s.DownPaymentPct}%");
            sb.AppendLine($"Term:                   {s.Term} years");
            sb.AppendLine($"Front-end DTI:          {s.FrontEndDTI}%");
            sb.AppendLine($"Back-end DTI:           {s.BackEndDTI}%");
            sb.AppendLine($"Principal & interest:   ${s.PrincipalAndInterest}/mo");
            sb.AppendLine($"Property tax:           ${s.PropertyTax}/mo");
            sb.AppendLine($"Mortgage insurance:     ${s.MortgageInsurance}/mo");
            sb.AppendLine($"HOA:                    ${s.HoaFee}/mo");
            sb.AppendLine($"Monthly total:          ${s.MonthlyTotal}/mo");
            sb.AppendLine();
        }

        private int CalculateFitScore(LoanScenario scenario, decimal combinedMonthlyIncome, List<LoanScenario> allScenarios)
        {
            int score = 0;

            // 1. DTI Score (35 pts)
            if (scenario.BackEndDTI < 36) score += 35;
            else if (scenario.BackEndDTI < 43) score += 28;
            else if (scenario.BackEndDTI < 50) score += 18;
            else if (scenario.BackEndDTI < 55) score += 10;
            else score += 4;

            // 2. Payment Score (25 pts)
            if (combinedMonthlyIncome > 0)
            {
                decimal ratio = scenario.MonthlyTotal / combinedMonthlyIncome;
                if (ratio < 0.25m) score += 25;
                else if (ratio < 0.31m) score += 20;
                else if (ratio < 0.36m) score += 14;
                else if (ratio < 0.43m) score += 8;
                else score += 3;
            }

            // 3. MIP/PMI Penalty (15 pts)
            if (scenario.MortgageInsurance == 0)
            {
                score += 15;
            }
            else if (scenario.MonthlyTotal > 0)
            {
                score += (int)(15 * (1 - (scenario.MortgageInsurance / scenario.MonthlyTotal)));
            }

            // 4. Interest Rate Score (15 pts)
            decimal lowestRate = allScenarios.Min(s => s.InterestRate);
            if (scenario.InterestRate > 0)
            {
                score += (int)(15 * (lowestRate / scenario.InterestRate));
            }

            // 5. Down Payment Score (10 pts)
            if (scenario.DownPaymentPct >= 20) score += 10;
            else if (scenario.DownPaymentPct >= 10) score += 6;
            else if (scenario.DownPaymentPct >= 5) score += 3;
            else score += 1;

            return Math.Clamp(score, 0, 100);
        }

        private string GetApprovalLikelihoodLabel(int score)
        {
            if (score >= 80) return "Very High";
            if (score >= 65) return "High";
            if (score >= 50) return "Moderate";
            if (score >= 35) return "Low";
            return "Very Low";
        }

        private string GetFitScoreLabel(int score)
        {
            if (score >= 80) return "Great Fit";
            if (score >= 60) return "Good Fit";
            return "Fair Fit";
        }

        private async Task<AiTextResponse> GetAiTextResponseAsync(string borrowerGoal, decimal combinedMonthlyIncome, decimal monthlyDebts, string scenariosText)
        {
            var apiKey = Environment.GetEnvironmentVariable("Provider:ApiKey") ?? _configuration["Provider:ApiKey"];
            var baseUrl = Environment.GetEnvironmentVariable("Provider:BaseUrl") ?? _configuration["Provider:BaseUrl"];
            var modelName = Environment.GetEnvironmentVariable("Provider:Model") ?? _configuration["Provider:Model"];
            var fallbackModelName = Environment.GetEnvironmentVariable("Provider:FallbackModel") ?? _configuration["Provider:FallbackModel"];

            // Ensure the URL targets the chat completions endpoint
            if (!string.IsNullOrEmpty(baseUrl) && !baseUrl.EndsWith("/chat/completions", StringComparison.OrdinalIgnoreCase))
            {
                if (baseUrl.EndsWith("/completions", StringComparison.OrdinalIgnoreCase))
                {
                    baseUrl = baseUrl.Substring(0, baseUrl.Length - 12) + "/chat/completions";
                }
                else
                {
                    baseUrl = baseUrl.TrimEnd('/') + "/chat/completions";
                }
            }

            var systemPrompt = LoanPortal.Shared.Constants.AiConstants.StrategySystemPrompt;
            var userPrompt = string.Format(LoanPortal.Shared.Constants.AiConstants.StrategyUserPromptTemplate, borrowerGoal, combinedMonthlyIncome, monthlyDebts, scenariosText);

            var payload = new
            {
                model = modelName,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                response_format = new { type = "json_object" },
                temperature = 0.7
            };

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, baseUrl)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            
            if (!string.IsNullOrEmpty(apiKey))
            {
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            }

            var response = await _httpClient.SendAsync(requestMessage);
            
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests && !string.IsNullOrEmpty(fallbackModelName))
            {
                var fallbackPayload = new
                {
                    model = fallbackModelName,
                    messages = new[]
                    {
                        new { role = "system", content = systemPrompt },
                        new { role = "user", content = userPrompt }
                    },
                    response_format = new { type = "json_object" },
                    temperature = 0.7
                };

                var fallbackRequestMessage = new HttpRequestMessage(HttpMethod.Post, baseUrl)
                {
                    Content = new StringContent(JsonSerializer.Serialize(fallbackPayload), Encoding.UTF8, "application/json")
                };
                
                if (!string.IsNullOrEmpty(apiKey))
                {
                    fallbackRequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                }

                response = await _httpClient.SendAsync(fallbackRequestMessage);
            }

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Provider API failed with status {response.StatusCode}: {error}");
            }

            string responseData = string.Empty;
            try
            {
                responseData = await response.Content.ReadAsStringAsync();
                var jsonDocument = JsonDocument.Parse(responseData);
                var content = jsonDocument.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (content.StartsWith("```json"))
                {
                    content = content.Replace("```json", "").Replace("```", "").Trim();
                }
                else if (content.StartsWith("```"))
                {
                    content = content.Replace("```", "").Trim();
                }

                try
                {
                    return JsonSerializer.Deserialize<AiTextResponse>(content, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (JsonException ex)
                {
                    throw new Exception($"Failed to parse AI JSON response. AI Output: {content}", ex);
                }
            }
            catch (JsonException ex)
            {
                throw new Exception($"Failed to parse Provider response. Provider returned HTML or invalid JSON: {responseData}", ex);
            }
        }
    }
}
