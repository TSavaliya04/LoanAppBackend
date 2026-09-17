using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Shared.Enum
{
    public enum UserRole
    {
        SuperAdmin = 0,
        CompanyAdmin = 1,
        User = 2,
        Borrower = 3
    }

    public enum UserStatus
    {
        InActive,
        Active
    }

    public enum LoanProgram
    {
        NonQM = 1,
        Conventional = 2,
        FHA = 3,
        VA = 4,
        HELOC = 5,
        HELOAN = 6
    }

    public enum ApplicationStatus
    {
        PreApproved = 1,
        InEscrow = 2,
        TBD = 3,
        ClosedEscrow=4,
    }

    public enum OccupancyStatus
    {
        OwnerOccupied = 1,
        SecondHome = 2,
        Investment = 3,
    }

    public enum PropertyType
    {
        SFR = 1,
        TwoUnit = 2,
        ThreeUnit = 3,
        FourUnit = 4,
        CondoTownhome = 5,
        Duplex = 6,
        Triplex = 7,
        FourPlex = 8
    }

    public enum FormType
    {
        BorrowerInfo = 1,
        PurchaseInfo = 2,   
        PropertyIncomeOffset = 8,
        LenderFees = 3,
        PrepaidItems = 4,
        MiscFees = 5,
        BorrowerIncomeData = 6,
        LoanProgram = 7
        //DebtBreakdown = 7,
        //BorrowerIncomeDataHourly = 7,
        //BorrowerIncomeDataSalary = 8,
        //BorrowerIncomeDataBonus = 9,
    }

    public enum LoanType
    {
        Purchase = 0,
        Refinance = 1
    }

    public enum MaritalStatus
    {
        Single = 0,
        Married = 1,
        Divorced = 2,
        Widowed = 3,
        Separated = 4
    }

    public enum DebtType
    {
        MortgagePayment = 1,
        CarPayment = 2,
        CreditCard = 3,
        Installment = 4,
        Other = 5
    }

    public enum BorrowerGoal
    {
        LowestMonthlyPayment = 1,
        LowestCashToClose = 2,
        HighestCashToBorrower = 3,
        FastestApproval = 4,
        LowestDownPayment = 5,
        MaximumPurchasePrice = 6,
        BalancedOption = 7
    }

    public enum IncomeSourceType
    {
        Salary        = 1,
        Hourly        = 2,
        OvertimeBonus = 3,
        Commission    = 4,
        ScheduleC     = 5,
        BankStatement = 6,
        Other         = 7
    }

    public enum PayFrequency
    {
        Annual      = 1,
        Monthly     = 2,
        BiWeekly    = 3,
        SemiMonthly = 4,
        Weekly      = 5
    }

    public enum EmploymentType
    {
        FullTime     = 1,
        PartTime     = 2,
        Seasonal     = 3,
        Temporary    = 4,
        Contract1099 = 5,
        SelfEmployed = 6,
        Retired      = 7,
        Other        = 8
    }

    public enum BorrowerLinkStatus
    {
        Active    = 0,
        Submitted = 1,
        Expired   = 2,
        Revoked   = 3    // when LO regenerates a new link, the old one is revoked
    }

    public enum EmploymentCategory
    {
        EmployedByCompany = 1,
        SelfEmployed      = 2,
        Military          = 3
    }

    // ── Self-Employed enums ────────────────────────────────────────────────

    /// <summary>Ownership percentage threshold (Step 6: Self-Employment Income Details).</summary>
    public enum OwnershipShareType
    {
        LessThan25Percent = 1,   // < 25%
        AtLeast25Percent  = 2    // 25% or more
    }

    /// <summary>Business entity / tax filing type (Step 6: Self-Employment Income Details).</summary>
    public enum BusinessEntityType
    {
        SoleProprietary     = 1,
        Partnership         = 2,
        SCorporation        = 3,
        CCorporation        = 4,
        LLC                 = 5,
        Other               = 6
    }

    /// <summary>Income documentation preference (Step 6: Self-Employment Income Details).</summary>
    public enum IncomeDocumentationType
    {
        TaxReturns        = 1,
        BankStatements    = 2,
        NotSure           = 3
    }

    // ── Military enums ────────────────────────────────────────────────────

    /// <summary>Branch of U.S. military service (Step 3: Military Service Details).</summary>
    public enum MilitaryBranch
    {
        Army           = 1,
        Navy           = 2,
        AirForce       = 3,
        MarineCorps    = 4,
        CoastGuard     = 5,
        SpaceForce     = 6,
        NationalGuard  = 7,
        Reserves       = 8
    }

    /// <summary>Current duty status (Step 3: Military Service Details).</summary>
    public enum MilitaryStatus
    {
        ActiveDuty  = 1,
        Reserve     = 2,
        NationalGuard = 3,
        Retired     = 4,
        Veteran     = 5
    }
}

