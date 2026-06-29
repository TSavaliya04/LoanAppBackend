using LoanPortal.Core.Entities;
using MongoDB.Bson.Serialization.Conventions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Helper
{
    public class PreApprovalHelper
    {
        private static readonly XNamespace ns    = "http://www.mismo.org/residential/2009/schemas";
        private static readonly XNamespace xlink = "http://www.w3.org/1999/xlink";
        private static readonly XNamespace xsi   = "http://www.w3.org/2001/XMLSchema-instance";
        private static readonly XNamespace ulad  = "http://www.datamodelextension.org/Schema/ULAD";


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

        public static string MapMortgageType(int lp)
        {
            var val = ((LoanProgram)lp).ToString();
            return val == "NonQM" ? "NonQm" : val;
        }

        public static string MapOccupancy(int occ) => ((OccupancyStatus)occ).ToString();

        public static string MapDebtType(int dt)
        {
            // Fallback for 0 or unmapped enum values
            if (!Enum.IsDefined(typeof(DebtType), dt))
                return "Other";
            
            var val = ((DebtType)dt).ToString();
            // In the XML they usually want space-separated if it's "Credit Card", but standard enum ToString gives "CreditCard".
            // Since you mentioned we can use the enum directly, I will just use the string.
            // Wait, the image says "Credit Card" with a space.
            if (val == "CreditCard") return "Credit Card";
            if (val == "MortgagePayment") return "Mortgage Payment";
            if (val == "CarPayment") return "Car Payment";
            return val;
        }

        public static (string first, string last) SplitName(string full)
        {
            if (string.IsNullOrWhiteSpace(full)) return ("", "");
            int idx = full.LastIndexOf(' ');
            return idx < 0 ? (full, "") : (full[..idx].Trim(), full[(idx + 1)..].Trim());
        }

        public static XElement BuildParty(int seq, string fullName, string email, string phone,
            decimal? income, string intentToOccupy)
        {
            var (first, last)           = SplitName(fullName);

            var contactPoints = new List<XElement>();
            if (!string.IsNullOrEmpty(email))
                contactPoints.Add(new XElement("CONTACT_POINT",
                    new XElement("CONTACT_POINT_EMAIL",
                        new XElement("ContactPointEmailValue", email))));
            if (!string.IsNullOrEmpty(phone))
                contactPoints.Add(new XElement("CONTACT_POINT",
                    new XElement("CONTACT_POINT_TELEPHONE",
                        new XElement("ContactPointTelephoneValue", phone))));

            return new XElement("PARTY",
                new XAttribute(xlink + "label", $"Party_Borrower_{seq}"),
                new XAttribute(XNamespace.Xmlns + "xlink", xlink.NamespaceName),
                new XElement("INDIVIDUAL",
                    new XElement("NAME",
                        new XElement("FirstName", first),
                        new XElement("LastName",  last))),
                new XElement("CONTACT_POINTS", contactPoints),
                new XElement("ROLES",
                    new XElement("ROLE",
                        new XAttribute("SequenceNumber", seq),
                        new XAttribute(xlink + "label", $"Role_Borrower_{seq}"),
                        new XElement("ROLE_DETAIL",
                            new XElement("PartyRoleType", "Borrower")),
                        new XElement("BORROWER",
                            new XElement("BORROWER_DETAIL",
                                new XElement("BorrowerBirthDate",  ""),
                                new XElement("MaritalStatusType",  ""),
                                new XElement("DependentCount",     "")),
                            new XElement("DECLARATION",
                                new XElement("DECLARATION_DETAIL",
                                    new XElement("CitizenshipResidencyType", ""),
                                    new XElement("IntentToOccupyType", intentToOccupy))),
                            new XElement("CURRENT_INCOME",
                                new XElement("CURRENT_INCOME_ITEMS",
                                    new XElement("CURRENT_INCOME_ITEM",
                                        new XElement("CURRENT_INCOME_ITEM_DETAIL",
                                            new XElement("EmploymentIncomeIndicator", "true"),
                                            new XElement("IncomeType", "Base"),
                                            new XElement("CurrentIncomeMonthlyTotalAmount",
                                                income.HasValue ? income.Value.ToString("F2") : "")))))))),
                new XElement("TAXPAYER_IDENTIFIERS",
                    new XElement("TAXPAYER_IDENTIFIER",
                        new XElement("TaxpayerIdentifierType",  ""),
                        new XElement("TaxpayerIdentifierValue", ""))),
                new XElement("ADDRESSES",
                    new XElement("ADDRESS",
                        new XElement("AddressLineText", ""),
                        new XElement("CityName",        ""),
                        new XElement("StateCode",       ""),
                        new XElement("PostalCode",      ""))));
        }

        public static List<XElement> BuildLiabilities(List<DebtBreakdownDTO> allDebts)
        {
            var liabilities = allDebts.Select(d =>
                new XElement("LIABILITY",
                    new XElement("LIABILITY_DETAIL",
                        new XElement("LiabilityType",                MapDebtType(d.DebtType)),
                        new XElement("LiabilityMonthlyPaymentAmount", d.MonthlyPayment.ToString("F2")),
                        new XElement("LiabilityUnpaidBalanceAmount",  d.Balance.ToString("F2"))),
                    new XElement("LIABILITY_HOLDER",
                        new XElement("NAME", new XElement("FullName", ""))))).ToList();

            if (!liabilities.Any())
                liabilities.Add(new XElement("LIABILITY",
                    new XElement("LIABILITY_DETAIL",
                        new XElement("LiabilityType",                ""),
                        new XElement("LiabilityMonthlyPaymentAmount",""),
                        new XElement("LiabilityUnpaidBalanceAmount", "")),
                    new XElement("LIABILITY_HOLDER",
                        new XElement("NAME", new XElement("FullName", "")))));

            return liabilities;
        }

        public static string BuildMismoXmlString(
            PreApprovalDocument preApproval,
            string loanPurpose,
            int borrowerCount,
            decimal baseLoanAmount,
            decimal interestRate,
            int periodCount,
            string mortgageType,
            decimal backEndRatio,
            decimal frontEndRatio,
            string productDesc,
            int propertyType,
            decimal propertyValue,
            int occupancyStatus,
            List<XElement> parties,
            List<XElement> liabilities)
        {
            var xmlDoc = new XDocument(
                new XDeclaration("1.0", "UTF-8", null),
                new XElement(ns + "MESSAGE",
                    new XAttribute("xmlns",            ns.NamespaceName),
                    new XAttribute(XNamespace.Xmlns + "xsi",  xsi.NamespaceName),
                    new XAttribute(XNamespace.Xmlns + "ULAD", ulad.NamespaceName),
                    new XAttribute("MISMOReferenceModelIdentifier", "3.4.032420160128"),
                    new XElement("ABOUT_VERSIONS",
                        new XElement("ABOUT_VERSION",
                            new XElement("CreatedDatetime",       preApproval.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")),
                            new XElement("DataVersionIdentifier", "LoansNStuff-MISMO34-v1"))),
                    new XElement("DEAL_SETS",
                        new XElement("DEAL_SET",
                            new XElement("DEALS",
                                new XElement("DEAL",
                                    new XElement("DEAL_DETAIL",
                                        new XElement("ApplicationReceivedDate", preApproval.CreatedAt.ToString("yyyy-MM-dd"))),
                                    new XElement("LOANS",
                                        new XElement("LOAN",
                                            new XAttribute("LoanRoleType", "SubjectLoan"),
                                            new XElement("LOAN_DETAIL",
                                                new XElement("LoanPurposeType",              loanPurpose),
                                                new XElement("BorrowerCount",                borrowerCount),
                                                new XElement("TotalMortgagedPropertiesCount", 1)),
                                            new XElement("TERMS_OF_LOAN",
                                                new XElement("BaseLoanAmount",              baseLoanAmount.ToString("F2")),
                                                new XElement("NoteRatePercent",             interestRate.ToString("F3")),
                                                new XElement("LoanAmortizationPeriodCount", periodCount),
                                                new XElement("LoanAmortizationPeriodType",  "Month"),
                                                new XElement("LoanAmortizationType",        "Fixed"),
                                                new XElement("MortgageType",                mortgageType),
                                                new XElement("LienPriorityType",            "FirstLien")),
                                            new XElement("PURCHASE_CREDITS"),
                                            new XElement("QUALIFICATION",
                                                new XElement("BorrowerReservesMonthlyPaymentCount", ""),
                                                new XElement("TotalDebtExpenseRatioPercent", backEndRatio.ToString("F3")),
                                                new XElement("HousingExpenseRatioPercent",   frontEndRatio.ToString("F3"))),
                                            new XElement("LOAN_PRODUCT",
                                                new XElement("LOAN_PRODUCT_DETAIL",
                                                    new XElement("LoanProductDescription", productDesc))))),
                                    new XElement("COLLATERALS",
                                        new XElement("COLLATERAL",
                                            new XElement("SUBJECT_PROPERTY",
                                                new XElement("ADDRESS",
                                                    new XElement("AddressLineText", ""),
                                                    new XElement("CityName",        ""),
                                                    new XElement("StateCode",       ""),
                                                    new XElement("PostalCode",      "")),
                                                new XElement("PROPERTY_DETAIL",
                                                    new XElement("FinancedUnitCount",             propertyType),
                                                    new XElement("PropertyEstimatedValueAmount",  propertyValue.ToString("F2")),
                                                    new XElement("PropertyUsageType",             MapOccupancy(occupancyStatus)),
                                                    new XElement("PropertyStructureBuiltYear",    ""))))),
                                    new XElement("PARTIES", parties),
                                    new XElement("EMPLOYERS",
                                        new XElement("EMPLOYER",
                                            new XElement("LEGAL_ENTITY",
                                                new XElement("LEGAL_ENTITY_DETAIL",
                                                    new XElement("FullName", ""))),
                                            new XElement("EMPLOYMENT",
                                                new XElement("EmploymentBorrowerSelfEmployedIndicator", ""),
                                                new XElement("EmploymentPositionDescription",           ""),
                                                new XElement("EmploymentStartDate",                     ""),
                                                new XElement("EmploymentStatusType",                    "")))),
                                    new XElement("ASSETS",
                                        new XElement("ASSET",
                                            new XElement("ASSET_DETAIL",
                                                new XElement("AssetAccountIdentifier",       ""),
                                                new XElement("AssetCashOrMarketValueAmount", ""),
                                                new XElement("AssetType",                   "")))),
                                    new XElement("LIABILITIES", liabilities)))))));

            var sb = new System.Text.StringBuilder();
            using (var writer = new System.IO.StringWriter(sb))
                xmlDoc.Save(writer);
            return sb.ToString();
        }
    }
}
