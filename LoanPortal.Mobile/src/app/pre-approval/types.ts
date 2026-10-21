export const loanProgramNames = {
    "1": "Non QM",
    "2": "Conventional",
    "3": "FHA",
    "4": "VA",
    "5": "HELOC",
    "6": "HE Loan (Closed-End Second)",
};

export const propertyTypes = {
    "1": "SFR",
    "2": "2 Units",
    "3": "3 Units",
    "4": "4 Units",
    "5": "Condo/Townhome",
    "6": "Duplex",
    "7": "Tri-plex",
    "8": "Four-plex",
};

export const occupancyStatuses = {
    "1": "Owner Occupied",
    "2": "2nd Home",
    "3": "Investment",
};

export type FormKey =
    | "borrowerInfo"
    | "purchaseInfo"
    | "propertyIncomeOffset"
    | "lenderFees"
    | "prepaidItems"
    | "miscFees"
    | "borrowersIncomeData"
    | "loanProgram";

export enum PreApprovalStatus {
    TBD = 3,
    PreApproved = 1,
    InEscrow = 2,
    ClosedEscrow = 4,
}

export const STATUS_LABELS: Record<PreApprovalStatus, string> = {
    [PreApprovalStatus.TBD]: "TBD",
    [PreApprovalStatus.PreApproved]: "Pre-Approved",
    [PreApprovalStatus.InEscrow]: "In Escrow",
    [PreApprovalStatus.ClosedEscrow]: "Closed Escrow",
};

export type RefinanceFormKey =
    | "borrowerInfo"
    | "loanStructure"
    | "refinanceInfo"
    | "lenderFees"
    | "borrowersIncomeData"
    | "loanProgram";

export const refinanceFormOrder: RefinanceFormKey[] = [
    "borrowerInfo",
    "loanStructure",
    "refinanceInfo",
    "lenderFees",
    "borrowersIncomeData",
    "loanProgram",
];
