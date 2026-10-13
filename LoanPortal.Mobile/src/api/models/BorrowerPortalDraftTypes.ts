// ─── Borrower Portal – Save Draft Types ──────────────────────────────────────

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601
  last4SSN: string;
  loanType: number;
}

export interface EmployerEntry {
  employerName: string;
  jobTitle: string;
  employmentType: number;
  isCurrentlyWorking: boolean;
  startDate: string;
  endDate: string;
  workPhone: string;
  phoneExtension: string;
  employerAddress: string;
  isPrimaryIncome: boolean;
}

export interface IncomeDetails {
  isSalary: boolean;
  basePay: number;
  basePayFrequency: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  bonusPay: number;
  bonusFrequency: number;
  overtimePay: number;
  overtimeFrequency: number;
  commissionPay: number;
  commissionFrequency: number;
  otherPay: number;
  otherFrequency: number;
}

export interface AdditionalInfo {
  isSeasonalIncome: boolean;
  isForeignIncome: boolean;
  isFamilyMemberEmployee: boolean;
  additionalComments: string;
}

export interface BusinessContact {
  workPhone: string;
  phoneExtension: string;
  businessAddress: string;
  city: string;
  state: string;
  zip: string;
}

export interface SelfEmploymentIncomeDetails {
  ownershipShare: number;
  businessEntityType: number;
  monthlyIncomeOrLoss: number;
  documentationType: number;
}

export interface SelfEmployment {
  businessName: string;
  positionTitle: string;
  isCurrentlyWorking: boolean;
  isPrimaryIncome: boolean;
  startDate: string;
  endDate: string;
  businessContact: BusinessContact;
  incomeDetails: SelfEmploymentIncomeDetails;
  additionalInfo: AdditionalInfo;
}

export interface MilitaryIncomeDetails {
  monthlyBasePay: number;
  basePayFrequency: number;
  bahAmount: number;
  basAmount: number;
  vhaAmount: number;
  flightPayAmount: number;
  hazardPayAmount: number;
  specialPayAmount: number;
  otherPayAmount: number;
}

export interface MilitaryAdditionalDetails {
  isPrimaryIncome: boolean;
  expectToRemain3Years: boolean;
  receivesTaxFreeCombatPay: boolean;
  receivesDeploymentHostileFirePay: boolean;
  receivesSeparationRetirementPay: boolean;
  additionalNotes: string;
}

export interface MilitaryService {
  branchOfService: number;
  status: number;
  rankPayGrade: string;
  militaryOccupationalSpecialty: string;
  startDate: string;
  separationDate: string;
  isCurrentlyServing: boolean;
  incomeDetails: MilitaryIncomeDetails;
  additionalDetails: MilitaryAdditionalDetails;
}

export interface DraftStepData {
  id: string;
  loanOfficerId: string;
  borrowerId: string;
  preApprovalId: string;
  lastCompletedStep: number;
  isSubmitted: boolean;
  personalInfo: PersonalInfo | null;
  employmentCategory: number;
  currentEmployers: EmployerEntry[];
  incomeDetails: IncomeDetails | null;
  additionalInfo: AdditionalInfo | null;
  selfEmployment: SelfEmployment | null;
  militaryService: MilitaryService | null;
  previousEmployers: EmployerEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveDraftPayload {
  draftId: string | null;
  loanOfficerId: string;
  completedStep: number;
  stepData: DraftStepData;
}

export interface SaveDraftResponse {
  success: boolean;
  message: string;
  data: { draftId: string } | null;
  error: string | null;
  statusCode: number;
}

export interface SubmitEmploymentPayload {
  draftId: string;
  employmentData: DraftStepData;
}

// ─── Borrower Portal – Enums (1-based, in UI order) ──────────────────────────

export enum EmploymentCategory {
  Employed = 1,
  SelfEmployed = 2,
  Military = 3,
}

export enum EmploymentTypeEnum {
  FullTime = 1,
  PartTime = 2,
  Contract = 3,
  Seasonal = 4,
}

export enum PayFrequency {
  Annual = 1,
  Monthly = 2,
  BiWeekly = 3,
  Weekly = 4,
}

export enum MilitaryPayFrequency {
  Monthly = 1,
  BiWeekly = 2,
  Weekly = 3,
}

export enum BranchOfService {
  Army = 1,
  Navy = 2,
  MarineCorps = 3,
  AirForce = 4,
  SpaceForce = 5,
  CoastGuard = 6,
  NationalGuard = 7,
  Reserves = 8,
}

export enum MilitaryStatus {
  ActiveDuty = 1,
  Veteran = 2,
  Retired = 3,
  Reservist = 4,
  NationalGuard = 5,
}

export enum OwnershipShare {
  TwentyFivePercentOrMore = 1,
  LessThanTwentyFivePercent = 2,
}

export enum BusinessEntityType {
  SCorp = 1,
  CCorp = 2,
  Partnership = 3,
  SoleProprietorship = 4,
  LLC = 5,
}

export enum DocumentationType {
  TaxReturns = 1,
  BankStatements = 2,
  NotSure = 3,
}

// ─── Borrower Portal – Select option labels ──────────────────────────────────

export type SelectOption<T> = { value: T; label: string };

export const employmentTypeOptions: readonly SelectOption<EmploymentTypeEnum>[] = [
  { value: EmploymentTypeEnum.FullTime, label: "Full-time" },
  { value: EmploymentTypeEnum.PartTime, label: "Part-time" },
  { value: EmploymentTypeEnum.Contract, label: "Contract" },
  { value: EmploymentTypeEnum.Seasonal, label: "Seasonal" },
];

export const payFrequencyOptions: readonly SelectOption<PayFrequency>[] = [
  { value: PayFrequency.Annual, label: "Annual" },
  { value: PayFrequency.Monthly, label: "Monthly" },
  { value: PayFrequency.BiWeekly, label: "Bi-Weekly" },
  { value: PayFrequency.Weekly, label: "Weekly" },
];

export const militaryPayFrequencyOptions: readonly SelectOption<MilitaryPayFrequency>[] = [
  { value: MilitaryPayFrequency.Monthly, label: "Monthly" },
  { value: MilitaryPayFrequency.BiWeekly, label: "Bi-Weekly" },
  { value: MilitaryPayFrequency.Weekly, label: "Weekly" },
];

export const branchOfServiceOptions: readonly SelectOption<BranchOfService>[] = [
  { value: BranchOfService.Army, label: "U.S. Army" },
  { value: BranchOfService.Navy, label: "U.S. Navy" },
  { value: BranchOfService.MarineCorps, label: "U.S. Marine Corps" },
  { value: BranchOfService.AirForce, label: "U.S. Air Force" },
  { value: BranchOfService.SpaceForce, label: "U.S. Space Force" },
  { value: BranchOfService.CoastGuard, label: "U.S. Coast Guard" },
  { value: BranchOfService.NationalGuard, label: "National Guard" },
  { value: BranchOfService.Reserves, label: "Reserves" },
];

export const militaryStatusOptions: readonly SelectOption<MilitaryStatus>[] = [
  { value: MilitaryStatus.ActiveDuty, label: "Active Duty" },
  { value: MilitaryStatus.Veteran, label: "Veteran" },
  { value: MilitaryStatus.Retired, label: "Retired" },
  { value: MilitaryStatus.Reservist, label: "Reservist" },
  { value: MilitaryStatus.NationalGuard, label: "National Guard" },
];

export const ownershipShareOptions: readonly SelectOption<OwnershipShare>[] = [
  { value: OwnershipShare.TwentyFivePercentOrMore, label: "25% or more" },
  { value: OwnershipShare.LessThanTwentyFivePercent, label: "Less than 25%" },
];

export const businessEntityTypeOptions: readonly SelectOption<BusinessEntityType>[] = [
  { value: BusinessEntityType.SCorp, label: "S Corporation (S Corp)" },
  { value: BusinessEntityType.CCorp, label: "C Corporation" },
  { value: BusinessEntityType.Partnership, label: "Partnership" },
  { value: BusinessEntityType.SoleProprietorship, label: "Sole Proprietorship" },
  { value: BusinessEntityType.LLC, label: "LLC" },
];

export const documentationTypeOptions: readonly SelectOption<DocumentationType>[] = [
  { value: DocumentationType.TaxReturns, label: "Tax Returns" },
  { value: DocumentationType.BankStatements, label: "Bank Statements" },
  { value: DocumentationType.NotSure, label: "Not Sure" },
];

export const US_STATES: readonly string[] = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
  "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND",
  "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];
