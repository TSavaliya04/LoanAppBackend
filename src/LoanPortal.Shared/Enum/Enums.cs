using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Shared.Enum
{
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

}
