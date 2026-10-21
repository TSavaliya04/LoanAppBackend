export interface IncomeCalculationDocument {
  id?: string | null;
  preApprovalId: string;
  scenarioId: string;
  borrowerName: string;
  employer: string;
  employmentType: number;
  startDate?: string;
  ytdPeriodEnding?: string;
  incomeSources: IncomeSource[];
  totalMonthlyIncomeFromSources: number;
}

export interface IncomeSource {
  id?: string;
  incomeType: number;
  salary?: SalaryIncome;
  hourly?: HourlyIncome;
  overtimeBonus?: OvertimeBonusIncome;
  commission?: CommissionIncome;
  scheduleC?: ScheduleCIncome;
  bankStatement?: BankStatementIncome;
  other?: OtherIncome;
}

export interface SalaryIncome {
  payFrequency: number;
  grossSalary: number;
  ytdSalary?: number;
  ytdMonths?: number;
  priorYear1W2Income?: number;
  priorYear1Months?: number;
  priorYear2W2Income?: number;
  priorYear2Months?: number;
  monthlyIncomeFromSource: number;
}

export interface HourlyIncome {
  hourlyRate: number;
  hoursPerWeek: number;
  ytdEarnings?: number;
  ytdMonths?: number;
  priorYear1W2Income?: number;
  priorYear1Months?: number;
  priorYear2W2Income?: number;
  priorYear2Months?: number;
  monthlyIncomeFromSource: number;
}

export interface OvertimeBonusIncome {
  ytdOvertimeBonus?: number;
  ytdMonths?: number;
  priorYear1OvertimeBonus?: number;
  priorYear1Months?: number;
  priorYear2OvertimeBonus?: number;
  priorYear2Months?: number;
  monthlyIncomeFromSource: number;
}

export interface CommissionIncome {
  ytdCommission?: number;
  ytdExpenses?: number;
  ytdMonths?: number;
  priorYear1Commission?: number;
  priorYear1Expenses?: number;
  priorYear1Months?: number;
  priorYear2Commission?: number;
  priorYear2Expenses?: number;
  priorYear2Months?: number;
  monthlyIncomeFromSource: number;
}

export interface ScheduleCIncome {
  priorYear1TaxReturn?: number;
  priorYear1Months?: number;
  priorYear2TaxReturn?: number;
  priorYear2Months?: number;
  calculationMethod?: string; // "1year" | "2year"
  monthlyIncomeFromSource: number;
}

export interface BankStatementIncome {
  deposits: number[];
  expenseFactor: number;
  monthlyIncomeFromSource: number;
}

export interface OtherIncomeItem {
  type: string;
  amount: number;
  averagingMonths: number;
}

export interface OtherIncome {
  items: OtherIncomeItem[];
  monthlyIncomeFromSource: number;
}

export enum EmploymentType {
  FullTime = 1,
  PartTime = 2,
  Seasonal = 3,
  Temporary = 4,
  Contract1099 = 5,
  SelfEmployed = 6,
  Retired = 7,
  Other = 8,
}

export enum IncomeType {
  Salary = 1,
  Hourly = 2,
  OvertimeBonus = 3,
  Commission = 4,
  ScheduleC = 5,
  BankStatement = 6,
  Other = 7,
}

export enum PayFrequency {
  Annual = 1,
  Monthly = 2,
  BiWeekly = 3,
  SemiMonthly = 4,
  Weekly = 5,
}

