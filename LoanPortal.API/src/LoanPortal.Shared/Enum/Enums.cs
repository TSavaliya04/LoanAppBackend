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
        User = 2
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
        FHA = 3
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
        FourUnit = 4
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

    public enum BorrowerGoal
    {
        LowestMonthlyPayment = 1,
        LowestCashToClose = 2,
        HighestCashToBorrower = 3,
        FastestApproval = 4
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
}
