using System;
using System.Collections.Generic;
using System.Linq;
using LoanPortal.Core.Entities;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services.Notifications.Handlers
{
    public static class NotificationMetadataHelper
    {
        public static Dictionary<string, string> BuildMetadata(PreApprovalDocument quote, string? actorName = null)
        {
            var scenario = quote.Scenarios?.FirstOrDefault();
            
            string borrowerName = "Unknown Borrower";
            string scenarioType = quote.LoanType == 0 ? "Purchase" : "Refinance";
            int? lpVal = null;
            decimal loanAmount = 0m;
            
            if (quote.LoanType == 0 && scenario?.Purchase != null)
            {
                borrowerName = scenario.Purchase.BorrowerInfo?.BorrowerName ?? "Unknown Borrower";
                lpVal = scenario.Purchase.LoanProgram?.LoanProgram ?? scenario.Purchase.PurchaseInfo?.LoanProgram;
                loanAmount = scenario.Purchase.PurchaseInfo?.LoanAmount ?? 0m;
            }
            else if (quote.LoanType == 1 && scenario?.Refinance != null)
            {
                borrowerName = scenario.Refinance.BorrowerInfo?.BorrowerName ?? "Unknown Borrower";
                lpVal = scenario.Refinance.LoanProgram?.LoanProgram ?? scenario.Refinance.LoanStructure?.LoanProgram;
                loanAmount = scenario.Refinance.RefinanceInfo?.LoanAmount ?? 0m;
            }

            string loanProgramStr = (lpVal.HasValue && lpVal.Value > 0)
                ? ((LoanProgram)lpVal.Value).ToString()
                : "N/A";

            var dict = new Dictionary<string, string>
            {
                ["quoteId"]      = quote.Id.ToString(),
                ["borrowerName"] = borrowerName,
                ["scenarioType"] = scenarioType,
                ["loanProgram"]  = loanProgramStr,
                ["loanAmount"]   = loanAmount.ToString("0.##")
            };

            if (!string.IsNullOrWhiteSpace(actorName))
            {
                dict["actorName"] = actorName;
            }

            return dict;
        }

        public static string GetBorrowerName(PreApprovalDocument quote)
        {
            var first = quote.Scenarios?.FirstOrDefault();
            return first?.Purchase?.BorrowerInfo?.BorrowerName 
                ?? first?.Refinance?.BorrowerInfo?.BorrowerName 
                ?? "Unknown Borrower";
        }
    }
}
