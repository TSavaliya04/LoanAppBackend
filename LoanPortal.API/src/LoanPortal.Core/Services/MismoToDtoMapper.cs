using System.Globalization;
using System.Xml.Linq;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services;

/// <summary>Maps ARIVE's MISMO 3.4 values into the portal's quote DTO shape.</summary>
public class MismoToDtoMapper
{
    private readonly ICountyLoanLimitRepository _countyRepository;

    public MismoToDtoMapper(ICountyLoanLimitRepository countyRepository)
    {
        _countyRepository = countyRepository;
    }

    public async Task<PreApprovalDTO> MapAsync(AriveXmlPayload payload, Guid userId)
    {
        var document = payload.Document;
        var ns = payload.Namespace;
        var message = document.Descendants(ns + "MESSAGE").First();
        var isRefinance = message.Descendants(ns + "REFINANCE").Any();
        var now = DateTime.UtcNow;

        var parties = message.Descendants(ns + "PARTY").ToList();
        var primaryParty = FindParty(parties, ns, "Borrower", "Primary");
        var secondaryParty = FindParty(parties, ns, "Borrower", "Secondary");
        var loanOriginator = FindParty(parties, ns, "LoanOriginator", null);
        var terms = message.Descendants(ns + "TERMS_OF_LOAN").FirstOrDefault()
            ?? throw new XmlParseException("Missing required MISMO element: <TERMS_OF_LOAN>.");
        var property = message.Descendants(ns + "PROPERTY_DETAIL").FirstOrDefault();
        var subjectAddress = message.Descendants(ns + "SUBJECT_PROPERTY")
            .Descendants(ns + "ADDRESS").FirstOrDefault();
        var expenses = message.Descendants(ns + "HOUSING_EXPENSE").ToList();
        var liabilities = message.Descendants(ns + "LIABILITY").ToList();

        var loanAmount = ParseDecimal(terms, ns, "BaseLoanAmount") ?? 0m;
        var interestRate = ParseDecimal(terms, ns, "NoteRatePercent") ?? 0m;
        var loanProgram = MapLoanProgram(GetText(terms, ns, "MortgageType"));
        var term = ParseInt(message.Descendants(ns + "AMORTIZATION_RULE").FirstOrDefault(), ns, "LoanAmortizationPeriodCount");
        var countyName = GetText(subjectAddress, ns, "CountyName");
        var countyId = await FindCountyIdAsync(countyName);
        var propertyType = MapPropertyType(property, ns);
        var occupancy = MapOccupancy(property, ns);
        var hazardInsurance = GetHousingExpense(expenses, ns, "HomeownersInsurance");
        var associationFee = GetHousingExpense(expenses, ns, "HomeownersAssociationDuesAndFees");
        var realEstateTax = GetHousingExpense(expenses, ns, "RealEstateTax");
        var mortgageInsurance = GetHousingExpense(expenses, ns, "MIPremium");

        var scenario = new ScenarioDTO
        {
            Id = Guid.NewGuid(),
            ScenarioOrder = 1,
            ScenarioName = "Imported from XML",
            CreatedAt = now,
            UpdatedAt = now,
            LastSubmittedFormNo = 0
        };

        if (isRefinance)
        {
            scenario.Refinance = MapRefinance(
                message, ns, now, primaryParty, secondaryParty, loanOriginator, parties, liabilities,
                property, terms, loanAmount, interestRate, loanProgram, term, countyName, countyId,
                propertyType, occupancy, realEstateTax, hazardInsurance, associationFee, mortgageInsurance);
        }
        else
        {
            scenario.Purchase = MapPurchase(
                message, ns, now, primaryParty, secondaryParty, loanOriginator, parties, liabilities,
                property, loanAmount, interestRate, loanProgram, term, countyName, countyId, propertyType,
                occupancy, realEstateTax, hazardInsurance, associationFee, mortgageInsurance);
        }

        return new PreApprovalDTO
        {
            UserId = userId,
            LoanType = (int)(isRefinance ? LoanType.Refinance : LoanType.Purchase),
            Status = (int)ApplicationStatus.TBD,
            LastSubmittedFormNo = 1,
            LastSubmittedScenarioNo = 1,
            CreatedAt = now,
            UpdatedAt = now,
            IsCreatedByBorrower = false,
            IsViewedByLO = true,
            Scenarios = new List<ScenarioDTO> { scenario }
        };
    }

    private async Task<Guid?> FindCountyIdAsync(string? countyName)
    {
        if (string.IsNullOrWhiteSpace(countyName))
            return null;

        var county = await _countyRepository.FindByNameAsync(countyName);
        return county?.Id;
    }

    private static PurchaseScenarioDTO MapPurchase(
        XElement message, XNamespace ns, DateTime now, XElement? primaryParty, XElement? secondaryParty,
        XElement? loanOriginator, List<XElement> parties, List<XElement> liabilities, XElement? property,
        decimal loanAmount, decimal interestRate, LoanProgram loanProgram, int term, string? countyName,
        Guid? countyId, int propertyType, int occupancy, decimal? realEstateTax, decimal? hazardInsurance,
        decimal? associationFee, decimal? mortgageInsurance)
    {
        var purchasePrice = ParseDecimal(property, ns, "PropertyEstimatedValueAmount")
            ?? ParseDecimal(message.Descendants(ns + "SALES_CONTRACT").FirstOrDefault(), ns, "SalesContractAmount")
            ?? 0m;
        var downPayment = purchasePrice > 0m ? (purchasePrice - loanAmount) / purchasePrice * 100m : 0m;
        var monthlyTaxPercentage = purchasePrice > 0m && realEstateTax.HasValue
            ? (decimal?)(realEstateTax.Value * 12m / purchasePrice * 100m)
            : null;

        return new PurchaseScenarioDTO
        {
            BorrowerInfo = MapBorrowerInfo(primaryParty, secondaryParty, ns, now),
            PurchaseInfo = new PurchaseInfoDTO
            {
                Id = Guid.NewGuid(),
                PurchasePrice = purchasePrice,
                LoanAmount = loanAmount,
                DownPayment = downPayment,
                AnnualInterestRate = interestRate,
                MipFundingFee = 0m,
                MiPercent = null,
                LoanProgram = (int)loanProgram,
                PropertyType = propertyType,
                OccupancyStatus = occupancy,
                CountyID = countyId,
                CountyName = countyName,
                MonthlyPropertyTax = realEstateTax,
                monthlyPropertyTaxPercentage = monthlyTaxPercentage,
                HazardInsurance = hazardInsurance,
                AssociationFee = associationFee,
                CreatedAt = now,
                UpdatedAt = now
            },
            BorrowerIncomes = MapBorrowerIncomes(parties, liabilities, ns, now),
            LenderFees = new LenderFeesDTO { Id = Guid.NewGuid(), AgentName = GetFullName(loanOriginator, ns) ?? string.Empty, CreatedAt = now, UpdatedAt = now },
            LoanProgram = new LoanProgramDTO
            {
                Id = Guid.NewGuid(), LoanProgram = (int)loanProgram, Price = purchasePrice,
                InterestRate = interestRate, BaseLoanAmount = loanAmount, Term = term,
                PropertyTax = realEstateTax, HazardInsurance = hazardInsurance, HoaFee = associationFee,
                MortgageInsurance = mortgageInsurance, CreatedAt = now, UpdatedAt = now
            },
            PropertyIncomeOffset = null,
            PrepaidItems = null,
            MiscFees = null
        };
    }

    private static RefinanceScenarioDTO MapRefinance(
        XElement message, XNamespace ns, DateTime now, XElement? primaryParty, XElement? secondaryParty,
        XElement? loanOriginator, List<XElement> parties, List<XElement> liabilities, XElement? property,
        XElement terms, decimal loanAmount, decimal interestRate, LoanProgram loanProgram, int term,
        string? countyName, Guid? countyId, int propertyType, int occupancy, decimal? realEstateTax,
        decimal? hazardInsurance, decimal? associationFee, decimal? mortgageInsurance)
    {
        var estimatedValue = ParseDecimal(property, ns, "PropertyEstimatedValueAmount") ?? 0m;
        var ltv = estimatedValue > 0m ? loanAmount / estimatedValue * 100m : 0m;
        var refinance = message.Descendants(ns + "REFINANCE").FirstOrDefault();
        var currentLoanBalance = liabilities
            .Where(liability => EqualsIgnoreCase(GetText(GetLiabilityDetail(liability, ns), ns, "LiabilityType"), "MortgageLoan"))
            .Sum(liability => ParseDecimal(GetLiabilityDetail(liability, ns), ns, "LiabilityUnpaidBalanceAmount") ?? 0m);
        var heloc = liabilities.FirstOrDefault(liability =>
            EqualsIgnoreCase(GetText(GetLiabilityDetail(liability, ns), ns, "LiabilityType"), "HELOC"));
        var lienPosition = EqualsIgnoreCase(GetText(terms, ns, "LienPriorityType"), "FirstLien") ? 1 : 2;

        return new RefinanceScenarioDTO
        {
            BorrowerInfo = MapRefinanceBorrowerInfo(primaryParty, secondaryParty, ns, now),
            RefinanceInfo = new RefinanceInfoDTO
            {
                Id = Guid.NewGuid(), EstimatedPropertyValue = estimatedValue, LoanAmount = loanAmount, LTV = ltv,
                CurrentLoanBalance = currentLoanBalance, CurrentUnpaidBalance = currentLoanBalance,
                RefinanceType = EqualsIgnoreCase(GetText(refinance, ns, "RefinanceCashOutDeterminationType"), "CashOut") ? 1 : 0,
                InterestRate = interestRate, DesiredCashOut = ParseDecimal(refinance, ns, "RefinanceCashOutAmount"),
                MaxAllowed = null, MonthlyTaxAmount = realEstateTax,
                AnnualTaxAmount = realEstateTax.HasValue ? realEstateTax.Value * 12m : null,
                MipRate = mortgageInsurance, MI = mortgageInsurance, HazardInsurance = hazardInsurance,
                AssociationFee = associationFee, CreditLimit = ParseDecimal(GetLiabilityDetail(heloc, ns), ns, "CreditLimitAmount"),
                CurrentDrawAmount = ParseDecimal(GetLiabilityDetail(heloc, ns), ns, "LiabilityUnpaidBalanceAmount"),
                PropertyType = propertyType, OccupancyStatus = occupancy, CountyID = countyId, CountyName = countyName,
                CreatedAt = now, UpdatedAt = now
            },
            LoanStructure = new RefinanceLoanStructureDTO
            {
                Id = Guid.NewGuid(), LoanProgram = (int)loanProgram, LienPosition = lienPosition, CreatedAt = now, UpdatedAt = now
            },
            BorrowerIncomes = MapRefinanceBorrowerIncomes(parties, liabilities, ns, now),
            LenderFees = new RefinanceLenderFeesDTO { Id = Guid.NewGuid(), AgentName = GetFullName(loanOriginator, ns) ?? string.Empty, CreatedAt = now, UpdatedAt = now },
            LoanProgram = new RefinanceLoanProgramDTO
            {
                Id = Guid.NewGuid(), LoanProgram = (int)loanProgram, Price = estimatedValue,
                InterestRate = interestRate, BaseLoanAmount = loanAmount, Term = term, PropertyTax = realEstateTax,
                HazardInsurance = hazardInsurance, HoaFee = associationFee, MortgageInsurance = mortgageInsurance,
                LTV = ltv, CreatedAt = now, UpdatedAt = now
            }
        };
    }

    private static BorrowerInfoDTO MapBorrowerInfo(XElement? primary, XElement? secondary, XNamespace ns, DateTime now) => new()
    {
        Id = Guid.NewGuid(), BorrowerName = GetFullName(primary, ns) ?? string.Empty, CoBorrowerName = GetFullName(secondary, ns),
        BorrowerCellNumber = GetPhone(primary, ns), CoBorrowerCellNumber = GetPhone(secondary, ns),
        BorrowerEmail = GetEmail(primary, ns), DateOfBirth = GetDateOfBirth(primary, ns), CurrentAddress = GetMailingAddress(primary, ns),
        Ssn = GetSsn(primary, ns), MaritalStatus = GetMaritalStatus(primary, ns), CreatedAt = now, UpdatedAt = now
    };

    private static RefinanceBorrowerInfoDTO MapRefinanceBorrowerInfo(XElement? primary, XElement? secondary, XNamespace ns, DateTime now) => new()
    {
        Id = Guid.NewGuid(), BorrowerName = GetFullName(primary, ns) ?? string.Empty, CoBorrowerName = GetFullName(secondary, ns),
        BorrowerCellNumber = GetPhone(primary, ns), CoBorrowerCellNumber = GetPhone(secondary, ns),
        BorrowerEmail = GetEmail(primary, ns), DateOfBirth = GetDateOfBirth(primary, ns), CurrentAddress = GetMailingAddress(primary, ns),
        Ssn = GetSsn(primary, ns), MaritalStatus = GetMaritalStatus(primary, ns), CreatedAt = now, UpdatedAt = now
    };

    private static List<BorrowerIncomeDTO> MapBorrowerIncomes(List<XElement> parties, List<XElement> liabilities, XNamespace ns, DateTime now) =>
        BorrowerParties(parties, ns).Select(party => new BorrowerIncomeDTO
        {
            Id = Guid.NewGuid(), BorrowerName = GetFullName(party, ns) ?? "Unknown",
            MonthlyIncome = MonthlyIncome(party, ns), Debts = MapDebts(liabilities, ns, now), CreatedAt = now, UpdatedAt = now
        }).ToList();

    private static List<RefinanceBorrowerIncomeDTO> MapRefinanceBorrowerIncomes(List<XElement> parties, List<XElement> liabilities, XNamespace ns, DateTime now) =>
        BorrowerParties(parties, ns).Select(party => new RefinanceBorrowerIncomeDTO
        {
            Id = Guid.NewGuid(), BorrowerName = GetFullName(party, ns) ?? "Unknown",
            MonthlyIncome = MonthlyIncome(party, ns), Debts = MapRefinanceDebts(liabilities, ns, now), CreatedAt = now, UpdatedAt = now
        }).ToList();

    private static IEnumerable<XElement> BorrowerParties(IEnumerable<XElement> parties, XNamespace ns) => parties.Where(party =>
        EqualsIgnoreCase(GetText(party, ns, "PartyRoleType"), "Borrower"));

    private static List<DebtBreakdownDTO> MapDebts(IEnumerable<XElement> liabilities, XNamespace ns, DateTime now) => liabilities
        .Where(liability => !ParseBoolean(GetText(GetLiabilityDetail(liability, ns), ns, "LiabilityExclusionIndicator")))
        .Select(liability =>
        {
            var detail = GetLiabilityDetail(liability, ns);
            return new DebtBreakdownDTO
            {
                Id = Guid.NewGuid(), DebtType = MapDebtType(GetText(detail, ns, "LiabilityType")),
                Balance = ParseDecimal(detail, ns, "LiabilityUnpaidBalanceAmount") ?? 0m,
                MonthlyPayment = ParseDecimal(detail, ns, "LiabilityMonthlyPaymentAmount") ?? 0m, CreatedAt = now, UpdatedAt = now
            };
        }).ToList();

    private static List<RefinanceDebtBreakdownDTO> MapRefinanceDebts(IEnumerable<XElement> liabilities, XNamespace ns, DateTime now) => liabilities
        .Where(liability => !ParseBoolean(GetText(GetLiabilityDetail(liability, ns), ns, "LiabilityExclusionIndicator")))
        .Select(liability =>
        {
            var detail = GetLiabilityDetail(liability, ns);
            return new RefinanceDebtBreakdownDTO
            {
                Id = Guid.NewGuid(), DebtType = MapDebtType(GetText(detail, ns, "LiabilityType")),
                Balance = ParseDecimal(detail, ns, "LiabilityUnpaidBalanceAmount") ?? 0m,
                MonthlyPayment = ParseDecimal(detail, ns, "LiabilityMonthlyPaymentAmount") ?? 0m,
                DebtToBePaidOff = ParseBoolean(GetText(detail, ns, "LiabilityPayoffStatusIndicator")), CreatedAt = now, UpdatedAt = now
            };
        }).ToList();

    private static XElement? FindParty(IEnumerable<XElement> parties, XNamespace ns, string role, string? classification) => parties.FirstOrDefault(party =>
        EqualsIgnoreCase(GetText(party, ns, "PartyRoleType"), role) &&
        (classification is null || EqualsIgnoreCase(GetText(party, ns, "BorrowerClassificationType"), classification)));

    private static LoanProgram MapLoanProgram(string? value) => value?.ToLowerInvariant() switch
    {
        "conventional" => LoanProgram.Conventional, "fha" => LoanProgram.FHA, "va" => LoanProgram.VA,
        _ => LoanProgram.Conventional
    };

    private static int MapPropertyType(XElement? property, XNamespace ns) =>
        (GetText(property, ns, "ConstructionMethodType")?.ToLowerInvariant(), GetText(property, ns, "AttachmentType")?.ToLowerInvariant(), ParseInt(property, ns, "FinancedUnitCount")) switch
        {
            ("sitebuilt", "detached", 1) => (int)PropertyType.SFR,
            ("sitebuilt", "attached", 1) => (int)PropertyType.CondoTownhome,
            ("sitebuilt", "detached", 2) => (int)PropertyType.TwoUnit,
            ("sitebuilt", "detached", 3) => (int)PropertyType.ThreeUnit,
            ("sitebuilt", "detached", 4) => (int)PropertyType.FourUnit,
            _ => (int)PropertyType.SFR
        };

    private static int MapOccupancy(XElement? property, XNamespace ns) => GetText(property, ns, "PropertyUsageType")?.ToLowerInvariant() switch
    {
        "primaryresidence" => (int)OccupancyStatus.OwnerOccupied,
        "secondhome" => (int)OccupancyStatus.SecondHome,
        "investor" => (int)OccupancyStatus.Investment,
        _ => (int)OccupancyStatus.OwnerOccupied
    };

    private static int MapDebtType(string? value) => value?.ToLowerInvariant() switch
    {
        "mortgageloan" => (int)DebtType.MortgagePayment, "installment" => (int)DebtType.Installment,
        "revolving" => (int)DebtType.CreditCard, _ => (int)DebtType.Other
    };

    private static MaritalStatus? GetMaritalStatus(XElement? party, XNamespace ns) => GetText(party, ns, "MaritalStatusType")?.ToLowerInvariant() switch
    {
        "married" => MaritalStatus.Married, "single" => MaritalStatus.Single, "divorced" => MaritalStatus.Divorced,
        "widowed" => MaritalStatus.Widowed, "separated" => MaritalStatus.Separated, _ => null
    };

    private static decimal? GetHousingExpense(IEnumerable<XElement> expenses, XNamespace ns, string type) => expenses
        .Where(expense => EqualsIgnoreCase(GetText(expense, ns, "HousingExpenseType"), type))
        .Select(expense => ParseDecimal(expense, ns, "HousingExpensePaymentAmount")).FirstOrDefault();

    private static decimal MonthlyIncome(XElement party, XNamespace ns) => party.Descendants(ns + "CURRENT_INCOME_ITEM_DETAIL")
        .Sum(detail => ParseDecimal(detail, ns, "CurrentIncomeMonthlyTotalAmount") ?? 0m);

    private static XElement? GetLiabilityDetail(XElement? liability, XNamespace ns) => liability?.Descendants(ns + "LIABILITY_DETAIL").FirstOrDefault();
    private static string? GetFullName(XElement? party, XNamespace ns) => GetText(party?.Descendants(ns + "NAME").FirstOrDefault(), ns, "FullName");
    private static string? GetEmail(XElement? party, XNamespace ns) => GetText(party?.Descendants(ns + "CONTACT_POINT_EMAIL").FirstOrDefault(), ns, "ContactPointEmailValue");
    private static string? GetPhone(XElement? party, XNamespace ns) => party?.Descendants(ns + "CONTACT_POINT_TELEPHONE")
        .FirstOrDefault(point => EqualsIgnoreCase(GetText(point, ns, "ContactPointRoleType") ?? GetText(point, ns, "RoleType"), "Mobile"))
        ?.Let(point => GetText(point, ns, "ContactPointTelephoneValue"));
    private static DateTime? GetDateOfBirth(XElement? party, XNamespace ns) => DateTime.TryParse(GetText(party, ns, "BorrowerBirthDate"), CultureInfo.InvariantCulture, DateTimeStyles.None, out var value) ? value : null;
    private static string? GetSsn(XElement? party, XNamespace ns) => party?.Descendants(ns + "TAXPAYER_IDENTIFIER")
        .FirstOrDefault(identifier => EqualsIgnoreCase(GetText(identifier, ns, "TaxpayerIdentifierType"), "SocialSecurityNumber"))
        ?.Let(identifier => GetText(identifier, ns, "TaxpayerIdentifierValue"));
    private static string? GetMailingAddress(XElement? party, XNamespace ns)
    {
        var address = party?.Descendants(ns + "ADDRESS").FirstOrDefault(value => EqualsIgnoreCase(GetText(value, ns, "AddressType"), "Mailing"));
        return address is null ? null : string.Join(", ", new[] { GetText(address, ns, "AddressLineText"), GetText(address, ns, "CityName"), GetText(address, ns, "StateCode"), GetText(address, ns, "PostalCode") }.Where(value => !string.IsNullOrWhiteSpace(value))!);
    }
    private static string? GetText(XElement? element, XNamespace ns, string name) => element?.Descendants(ns + name).FirstOrDefault()?.Value.Trim();
    private static decimal? ParseDecimal(XElement? element, XNamespace ns, string name) => decimal.TryParse(GetText(element, ns, name), NumberStyles.Number, CultureInfo.InvariantCulture, out var value) ? value : null;
    private static int ParseInt(XElement? element, XNamespace ns, string name) => int.TryParse(GetText(element, ns, name), NumberStyles.Integer, CultureInfo.InvariantCulture, out var value) ? value : 0;
    private static bool ParseBoolean(string? value) => bool.TryParse(value, out var result) && result;
    private static bool EqualsIgnoreCase(string? left, string right) => string.Equals(left, right, StringComparison.OrdinalIgnoreCase);
}

internal static class MismoXElementExtensions
{
    public static TResult? Let<TSource, TResult>(this TSource? source, Func<TSource, TResult?> selector) where TSource : class => source is null ? default : selector(source);
}
