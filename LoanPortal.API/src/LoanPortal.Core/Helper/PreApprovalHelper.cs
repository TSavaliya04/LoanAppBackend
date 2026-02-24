using LoanPortal.Core.Entities;
using MongoDB.Bson.Serialization.Conventions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace LoanPortal.Core.Helper
{
    public class PreApprovalHelper
    {
        public static Dictionary<string, string> ValidateBorrowerInfo(BorrowerInfoDTO info)
        {
            var errors = new Dictionary<string, string>();

            if (info.FicoScore < 300 || info.FicoScore > 850)
                errors["FicoScore"] = "FICO score must be between 300 and 850";

            if (info.CoBorrowerFicoScore < 300 || info.CoBorrowerFicoScore > 850)
                errors["CoBorrowerFicoScore"] = "Co-borrower's FICO score must be between 300 and 850";

            if (string.IsNullOrWhiteSpace(info.BorrowerCellNumber) || !Regex.IsMatch(info.BorrowerCellNumber, @"^1\d{10}$"))
            {
                errors["BorrowerCellNumber"] = "Valid U.S. borrower cell number is required";
            }

            if (string.IsNullOrWhiteSpace(info.CoBorrowerCellNumber) || !Regex.IsMatch(info.CoBorrowerCellNumber, @"^1\d{10}$"))
            {
                errors["CoBorrowerCellNumber"] = "Valid U.S. co-borrower cell number is required";
            }

            if (string.IsNullOrWhiteSpace(info.BorrowerEmail) || !info.BorrowerEmail.Contains("@"))
                errors["BorrowerEmail"] = "Valid email is required";

            return errors;
        }

        public static double CalculateMonthlyPI(decimal loanAmount, decimal annualInterestRate, int termInYears)
        {
            double monthlyRate = (double)annualInterestRate / 12 / 100;
            int totalMonths = termInYears * 12;
            double factor = Math.Pow(1 + monthlyRate, totalMonths);
            double monthlyPayment = (double)loanAmount * monthlyRate * factor / (factor - 1);

            return monthlyPayment;
        }
    }
}
