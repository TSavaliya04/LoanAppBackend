// ─── Borrower Employment – form model ───────────────────────────────────────
// Pure (React-free) form shape for the employment wizard plus the conversions
// between it and the borrowerportal draft API contract.

import {
  AdditionalInfo,
  BranchOfService,
  BusinessContact,
  BusinessEntityType,
  DocumentationType,
  DraftStepData,
  EmployerEntry,
  EmploymentCategory,
  EmploymentTypeEnum,
  MilitaryAdditionalDetails,
  MilitaryPayFrequency,
  MilitaryStatus,
  OwnershipShare,
  PayFrequency,
  SelectOption,
  branchOfServiceOptions,
  businessEntityTypeOptions,
  militaryStatusOptions,
  ownershipShareOptions,
} from "@/api/models/BorrowerPortalDraftTypes";
import type { BorrowerDraftSummary } from "@/api/network/user";

/** Money as typed by the user, e.g. "120,000". Parsed only when building the payload. */
export type Money = string;

export interface EmploymentFormValues {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // MM/DD/YYYY
    last4SSN: string;
    loanType: number; // 0 = Purchase, 1 = Refinance
  };
  employmentCategory: EmploymentCategory;
  currentEmployer: {
    employerName: string;
    jobTitle: string;
    employmentType: EmploymentTypeEnum;
    isCurrentlyWorking: boolean;
    startDate: string;
    endDate: string;
    workPhone: string;
    phoneExtension: string;
    addressLine1: string;
    addressLine2: string;
    isPrimaryIncome: boolean;
  };
  incomeDetails: {
    isSalary: boolean;
    basePay: Money;
    basePayFrequency: PayFrequency;
    hourlyRate: Money;
    hoursPerWeek: string;
    bonusPay: Money;
    bonusFrequency: PayFrequency;
    overtimePay: Money;
    overtimeFrequency: PayFrequency;
    commissionPay: Money;
    commissionFrequency: PayFrequency;
    otherPay: Money;
    otherFrequency: PayFrequency;
  };
  incomeToggles: { bonus: boolean; overtime: boolean; commission: boolean; other: boolean };
  additionalInfo: AdditionalInfo;
  selfEmployment: {
    businessName: string;
    positionTitle: string;
    isCurrentlyWorking: boolean;
    isPrimaryIncome: boolean;
    startDate: string;
    endDate: string;
    businessContact: BusinessContact;
    ownershipShare: OwnershipShare;
    businessEntityType: BusinessEntityType;
    monthlyIncomeOrLoss: Money;
    documentationType: DocumentationType;
  };
  militaryService: {
    branchOfService: BranchOfService;
    status: MilitaryStatus;
    rankPayGrade: string;
    militaryOccupationalSpecialty: string;
    startDate: string;
    separationDate: string;
    isCurrentlyServing: boolean;
    monthlyBasePay: Money;
    basePayFrequency: MilitaryPayFrequency;
    bahAmount: Money;
    basAmount: Money;
    vhaAmount: Money;
    flightPayAmount: Money;
    hazardPayAmount: Money;
    specialPayAmount: Money;
    otherPayAmount: Money;
    additionalDetails: MilitaryAdditionalDetails; // no UI – passthrough
  };
  militaryToggles: {
    bah: boolean;
    bas: boolean;
    vha: boolean;
    flight: boolean;
    hazard: boolean;
    special: boolean;
    other: boolean;
  };
  previousEmployers: EmployerFormEntry[];
}

/** One employer as edited in the form (same shape as `currentEmployer`). */
export type EmployerFormEntry = EmploymentFormValues["currentEmployer"];

/** Identifiers carried alongside the form but not edited by the user. */
export interface DraftMeta {
  draftId: string | null;
  loanOfficerId: string;
  borrowerId: string | null;
  preApprovalId: string | null;
  createdAt: string | null;
}

export const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

export const defaultValues: EmploymentFormValues = {
  personalInfo: { firstName: "", lastName: "", dateOfBirth: "", last4SSN: "", loanType: 0 },
  employmentCategory: EmploymentCategory.Employed,
  currentEmployer: {
    employerName: "",
    jobTitle: "",
    employmentType: EmploymentTypeEnum.FullTime,
    isCurrentlyWorking: true,
    startDate: "",
    endDate: "",
    workPhone: "",
    phoneExtension: "",
    addressLine1: "",
    addressLine2: "",
    isPrimaryIncome: true,
  },
  incomeDetails: {
    isSalary: true,
    basePay: "",
    basePayFrequency: PayFrequency.Annual,
    hourlyRate: "",
    hoursPerWeek: "",
    bonusPay: "",
    bonusFrequency: PayFrequency.Annual,
    overtimePay: "",
    overtimeFrequency: PayFrequency.Annual,
    commissionPay: "",
    commissionFrequency: PayFrequency.Annual,
    otherPay: "",
    otherFrequency: PayFrequency.Annual,
  },
  incomeToggles: { bonus: false, overtime: false, commission: false, other: false },
  additionalInfo: {
    isSeasonalIncome: false,
    isForeignIncome: false,
    isFamilyMemberEmployee: false,
    additionalComments: "",
  },
  selfEmployment: {
    businessName: "",
    positionTitle: "",
    isCurrentlyWorking: true,
    isPrimaryIncome: true,
    startDate: "",
    endDate: "",
    businessContact: { workPhone: "", phoneExtension: "", businessAddress: "", city: "", state: "", zip: "" },
    ownershipShare: OwnershipShare.TwentyFivePercentOrMore,
    businessEntityType: BusinessEntityType.SCorp,
    monthlyIncomeOrLoss: "",
    documentationType: DocumentationType.TaxReturns,
  },
  militaryService: {
    branchOfService: BranchOfService.Army,
    status: MilitaryStatus.ActiveDuty,
    rankPayGrade: "",
    militaryOccupationalSpecialty: "",
    startDate: "",
    separationDate: "",
    isCurrentlyServing: true,
    monthlyBasePay: "",
    basePayFrequency: MilitaryPayFrequency.Monthly,
    bahAmount: "",
    basAmount: "",
    vhaAmount: "",
    flightPayAmount: "",
    hazardPayAmount: "",
    specialPayAmount: "",
    otherPayAmount: "",
    additionalDetails: {
      isPrimaryIncome: true,
      expectToRemain3Years: true,
      receivesTaxFreeCombatPay: false,
      receivesDeploymentHostileFirePay: false,
      receivesSeparationRetirementPay: false,
      additionalNotes: "",
    },
  },
  militaryToggles: { bah: false, bas: false, vha: false, flight: false, hazard: false, special: false, other: false },
  previousEmployers: [],
};

/** Blank previous employer: they no longer work there and it is not their primary income. */
export const defaultPreviousEmployer: EmployerFormEntry = {
  ...defaultValues.currentEmployer,
  isCurrentlyWorking: false,
  isPrimaryIncome: false,
};

/* ── Dates ─────────────────────────────────────────────── */

const pad2 = (n: number) => String(n).padStart(2, "0");

/** ISO timestamp → MM/DD/YYYY using UTC parts (avoids a one-day shift in US time zones). */
export function isoToDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getUTCMonth() + 1)}/${pad2(d.getUTCDate())}/${d.getUTCFullYear()}`;
}

/** Calendar date → ISO at UTC midnight, or null if the date does not exist. */
function utcMidnight(year: number, month: number, day: number): string | null {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return d.toISOString();
}

/**
 * User-typed date → ISO at UTC midnight. Accepts M/D/YYYY (the UI format), M-D-YYYY,
 * M/D/YY (pivoting on the current year), YYYY-MM-DD, and textual dates like "Jan 15 1985".
 * Empty or unparseable input falls back to `now`.
 */
export function displayDateToIso(display: string, now: Date): string {
  const s = (display ?? "").trim();

  const mdy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/.exec(s);
  if (mdy) {
    let year = Number(mdy[3]);
    if (mdy[3].length === 2) {
      const pivot = now.getUTCFullYear() % 100;
      year += year <= pivot ? 2000 : 1900;
    }
    return utcMidnight(year, Number(mdy[1]), Number(mdy[2])) ?? now.toISOString();
  }

  const ymd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (ymd) return utcMidnight(Number(ymd[1]), Number(ymd[2]), Number(ymd[3])) ?? now.toISOString();

  if (/[a-z]/i.test(s)) {
    const t = new Date(s);
    if (!Number.isNaN(t.getTime())) {
      return utcMidnight(t.getFullYear(), t.getMonth() + 1, t.getDate()) ?? now.toISOString();
    }
  }

  return now.toISOString();
}

/* ── Money ─────────────────────────────────────────────── */

export function parseMoney(value: Money): number {
  const n = parseFloat((value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Live formatting for an amount input: digits only, thousands separators, one decimal
 * point with at most 2 decimals. A leading "-" is kept only when `allowNegative`.
 */
export function formatMoneyInput(value: string, allowNegative = false): string {
  const negative = allowNegative && (value ?? "").trimStart().startsWith("-");
  const cleaned = (value ?? "").replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  let whole = dot === -1 ? cleaned : cleaned.slice(0, dot);
  const decimals = dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  if (whole === "" && decimals !== null) whole = "0";
  whole = whole.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${whole}${decimals !== null ? `.${decimals}` : ""}`;
}

export function formatMoney(value: number | null | undefined): Money {
  if (!value) return "";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/* ── Phone ─────────────────────────────────────────────── */

const PHONE_DIGITS = 10;

/** Digits only, capped at 10 – the value stored in the form and sent to the API. */
export function phoneDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "").slice(0, PHONE_DIGITS);
}

/** Display format "(562) 555-1234", built up progressively as digits are typed. */
export function formatPhone(value: string | null | undefined): string {
  const d = phoneDigits(value);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export const SSN_DIGITS = 9;

export function ssnDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "").slice(0, SSN_DIGITS);
}

/** Display format "123-45-6789", built up progressively as digits are typed. */
export function formatSsn(value: string | null | undefined): string {
  const d = ssnDigits(value);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

/* ── API → form ────────────────────────────────────────── */

function splitAddress(address: string): [string, string] {
  const i = address.indexOf(", ");
  return i === -1 ? [address, ""] : [address.slice(0, i), address.slice(i + 2)];
}

/** API employer → form values; missing fields fall back to `base`. */
function employerToForm(emp: EmployerEntry, base: EmployerFormEntry): EmployerFormEntry {
  const [addressLine1, addressLine2] = splitAddress(emp.employerAddress ?? "");
  return {
    employerName: emp.employerName ?? "",
    jobTitle: emp.jobTitle ?? "",
    employmentType: emp.employmentType || base.employmentType,
    isCurrentlyWorking: emp.isCurrentlyWorking ?? base.isCurrentlyWorking,
    startDate: isoToDisplayDate(emp.startDate),
    endDate: isoToDisplayDate(emp.endDate),
    workPhone: emp.workPhone ?? "",
    phoneExtension: emp.phoneExtension ?? "",
    addressLine1,
    addressLine2,
    isPrimaryIncome: emp.isPrimaryIncome ?? base.isPrimaryIncome,
  };
}

/** Form employer → API employer. */
function employerToApi(emp: EmployerFormEntry, iso: (display: string) => string): EmployerEntry {
  return {
    employerName: emp.employerName,
    jobTitle: emp.jobTitle,
    employmentType: emp.employmentType,
    isCurrentlyWorking: emp.isCurrentlyWorking,
    startDate: iso(emp.startDate),
    endDate: iso(emp.endDate),
    workPhone: emp.workPhone,
    phoneExtension: emp.phoneExtension,
    employerAddress: [emp.addressLine1, emp.addressLine2].filter(Boolean).join(", "),
    isPrimaryIncome: emp.isPrimaryIncome,
  };
}

const MIN_HISTORY_YEARS = 2;

/**
 * True when the current job (employment, self-employment or military, by category) covers
 * less than 2 years, so the borrower must add previous employment. A missing or invalid
 * start date counts as not enough.
 */
export function needsPreviousEmployment(values: EmploymentFormValues, now: Date = new Date()): boolean {
  const cat = values.employmentCategory;
  const { start, end, current } =
    cat === EmploymentCategory.SelfEmployed
      ? { start: values.selfEmployment.startDate, end: values.selfEmployment.endDate, current: values.selfEmployment.isCurrentlyWorking }
      : cat === EmploymentCategory.Military
      ? { start: values.militaryService.startDate, end: values.militaryService.separationDate, current: values.militaryService.isCurrentlyServing }
      : { start: values.currentEmployer.startDate, end: values.currentEmployer.endDate, current: values.currentEmployer.isCurrentlyWorking };

  if (!start?.trim()) return true;
  const from = new Date(displayDateToIso(start, now));
  const to = current ? now : new Date(displayDateToIso(end, now));
  const enough = new Date(from);
  enough.setUTCFullYear(enough.getUTCFullYear() + MIN_HISTORY_YEARS);
  return enough > to;
}

export function draftToForm(draft: DraftStepData): EmploymentFormValues {
  const d = defaultValues;
  const pi = draft.personalInfo;
  const emp = draft.currentEmployers?.[0];
  const inc = draft.incomeDetails;
  const se = draft.selfEmployment;
  const mil = draft.militaryService;
  const additional =
    (draft.employmentCategory === EmploymentCategory.SelfEmployed ? se?.additionalInfo : null) ??
    draft.additionalInfo;

  return {
    personalInfo: pi
      ? {
          firstName: pi.firstName ?? "",
          lastName: pi.lastName ?? "",
          dateOfBirth: isoToDisplayDate(pi.dateOfBirth),
          last4SSN: pi.last4SSN ?? "",
          loanType: pi.loanType ?? 0,
        }
      : { ...d.personalInfo },
    employmentCategory: draft.employmentCategory || EmploymentCategory.Employed,
    currentEmployer: emp ? employerToForm(emp, d.currentEmployer) : { ...d.currentEmployer },
    incomeDetails: inc
      ? {
          isSalary: inc.isSalary ?? true,
          basePay: formatMoney(inc.basePay),
          basePayFrequency: inc.basePayFrequency || PayFrequency.Annual,
          hourlyRate: formatMoney(inc.hourlyRate ?? 0),
          hoursPerWeek: inc.hoursPerWeek ? String(inc.hoursPerWeek) : "",
          bonusPay: formatMoney(inc.bonusPay),
          bonusFrequency: inc.bonusFrequency || PayFrequency.Annual,
          overtimePay: formatMoney(inc.overtimePay),
          overtimeFrequency: inc.overtimeFrequency || PayFrequency.Annual,
          commissionPay: formatMoney(inc.commissionPay),
          commissionFrequency: inc.commissionFrequency || PayFrequency.Annual,
          otherPay: formatMoney(inc.otherPay),
          otherFrequency: inc.otherFrequency || PayFrequency.Annual,
        }
      : { ...d.incomeDetails },
    incomeToggles: {
      bonus: (inc?.bonusPay ?? 0) > 0,
      overtime: (inc?.overtimePay ?? 0) > 0,
      commission: (inc?.commissionPay ?? 0) > 0,
      other: (inc?.otherPay ?? 0) > 0,
    },
    additionalInfo: additional
      ? {
          isSeasonalIncome: additional.isSeasonalIncome ?? false,
          isForeignIncome: additional.isForeignIncome ?? false,
          isFamilyMemberEmployee: additional.isFamilyMemberEmployee ?? false,
          additionalComments: additional.additionalComments ?? "",
        }
      : { ...d.additionalInfo },
    selfEmployment: se
      ? {
          businessName: se.businessName ?? "",
          positionTitle: se.positionTitle ?? "",
          isCurrentlyWorking: se.isCurrentlyWorking ?? true,
          isPrimaryIncome: se.isPrimaryIncome ?? true,
          startDate: isoToDisplayDate(se.startDate),
          endDate: isoToDisplayDate(se.endDate),
          businessContact: { ...d.selfEmployment.businessContact, ...se.businessContact },
          ownershipShare: se.incomeDetails?.ownershipShare || d.selfEmployment.ownershipShare,
          businessEntityType: se.incomeDetails?.businessEntityType || d.selfEmployment.businessEntityType,
          monthlyIncomeOrLoss: formatMoney(se.incomeDetails?.monthlyIncomeOrLoss),
          documentationType: se.incomeDetails?.documentationType || d.selfEmployment.documentationType,
        }
      : { ...d.selfEmployment, businessContact: { ...d.selfEmployment.businessContact } },
    militaryService: mil
      ? {
          branchOfService: mil.branchOfService || d.militaryService.branchOfService,
          status: mil.status || d.militaryService.status,
          rankPayGrade: mil.rankPayGrade ?? "",
          militaryOccupationalSpecialty: mil.militaryOccupationalSpecialty ?? "",
          startDate: isoToDisplayDate(mil.startDate),
          separationDate: isoToDisplayDate(mil.separationDate),
          isCurrentlyServing: mil.isCurrentlyServing ?? true,
          monthlyBasePay: formatMoney(mil.incomeDetails?.monthlyBasePay),
          basePayFrequency: mil.incomeDetails?.basePayFrequency || MilitaryPayFrequency.Monthly,
          bahAmount: formatMoney(mil.incomeDetails?.bahAmount),
          basAmount: formatMoney(mil.incomeDetails?.basAmount),
          vhaAmount: formatMoney(mil.incomeDetails?.vhaAmount),
          flightPayAmount: formatMoney(mil.incomeDetails?.flightPayAmount),
          hazardPayAmount: formatMoney(mil.incomeDetails?.hazardPayAmount),
          specialPayAmount: formatMoney(mil.incomeDetails?.specialPayAmount),
          otherPayAmount: formatMoney(mil.incomeDetails?.otherPayAmount),
          additionalDetails: { ...d.militaryService.additionalDetails, ...mil.additionalDetails },
        }
      : { ...d.militaryService, additionalDetails: { ...d.militaryService.additionalDetails } },
    militaryToggles: {
      bah: (mil?.incomeDetails?.bahAmount ?? 0) > 0,
      bas: (mil?.incomeDetails?.basAmount ?? 0) > 0,
      vha: (mil?.incomeDetails?.vhaAmount ?? 0) > 0,
      flight: (mil?.incomeDetails?.flightPayAmount ?? 0) > 0,
      hazard: (mil?.incomeDetails?.hazardPayAmount ?? 0) > 0,
      special: (mil?.incomeDetails?.specialPayAmount ?? 0) > 0,
      other: (mil?.incomeDetails?.otherPayAmount ?? 0) > 0,
    },
    previousEmployers: (draft.previousEmployers ?? []).map((e) => employerToForm(e, defaultPreviousEmployer)),
  };
}

/* ── Form → API ────────────────────────────────────────── */

export function formToStepData(
  values: EmploymentFormValues,
  meta: DraftMeta,
  completedStep: number,
  isSubmitted: boolean,
  now: Date = new Date()
): DraftStepData {
  const iso = (display: string) => displayDateToIso(display, now);
  const toggled = (on: boolean, amount: Money) => (on ? parseMoney(amount) : 0);
  const cat = values.employmentCategory;
  const { currentEmployer: emp, incomeDetails: inc, incomeToggles: incT, selfEmployment: se } = values;
  const { militaryService: mil, militaryToggles: milT } = values;
  const additionalInfo: AdditionalInfo = { ...values.additionalInfo };

  return {
    id: meta.draftId ?? EMPTY_GUID,
    loanOfficerId: meta.loanOfficerId,
    borrowerId: meta.borrowerId ?? EMPTY_GUID,
    preApprovalId: meta.preApprovalId ?? EMPTY_GUID,
    lastCompletedStep: completedStep,
    isSubmitted,
    personalInfo: {
      firstName: values.personalInfo.firstName,
      lastName: values.personalInfo.lastName,
      dateOfBirth: iso(values.personalInfo.dateOfBirth),
      last4SSN: values.personalInfo.last4SSN,
      loanType: values.personalInfo.loanType,
    },
    employmentCategory: cat,
    currentEmployers:
      cat === EmploymentCategory.Employed
        ? [employerToApi(emp, iso)]
        : [],
    incomeDetails:
      cat === EmploymentCategory.Employed
        ? {
            isSalary: inc.isSalary,
            basePay: inc.isSalary ? parseMoney(inc.basePay) : 0,
            basePayFrequency: inc.basePayFrequency,
            hourlyRate: inc.isSalary ? 0 : parseMoney(inc.hourlyRate),
            hoursPerWeek: inc.isSalary ? 0 : Number(inc.hoursPerWeek) || 0,
            bonusPay: toggled(incT.bonus, inc.bonusPay),
            bonusFrequency: inc.bonusFrequency,
            overtimePay: toggled(incT.overtime, inc.overtimePay),
            overtimeFrequency: inc.overtimeFrequency,
            commissionPay: toggled(incT.commission, inc.commissionPay),
            commissionFrequency: inc.commissionFrequency,
            otherPay: toggled(incT.other, inc.otherPay),
            otherFrequency: inc.otherFrequency,
          }
        : null,
    additionalInfo,
    selfEmployment:
      cat === EmploymentCategory.SelfEmployed
        ? {
            businessName: se.businessName,
            positionTitle: se.positionTitle,
            isCurrentlyWorking: se.isCurrentlyWorking,
            isPrimaryIncome: se.isPrimaryIncome,
            startDate: iso(se.startDate),
            endDate: iso(se.endDate),
            businessContact: { ...se.businessContact },
            incomeDetails: {
              ownershipShare: se.ownershipShare,
              businessEntityType: se.businessEntityType,
              monthlyIncomeOrLoss: parseMoney(se.monthlyIncomeOrLoss),
              documentationType: se.documentationType,
            },
            additionalInfo: { ...additionalInfo },
          }
        : null,
    militaryService:
      cat === EmploymentCategory.Military
        ? {
            branchOfService: mil.branchOfService,
            status: mil.status,
            rankPayGrade: mil.rankPayGrade,
            militaryOccupationalSpecialty: mil.militaryOccupationalSpecialty,
            startDate: iso(mil.startDate),
            separationDate: iso(mil.separationDate),
            isCurrentlyServing: mil.isCurrentlyServing,
            incomeDetails: {
              monthlyBasePay: parseMoney(mil.monthlyBasePay),
              basePayFrequency: mil.basePayFrequency,
              bahAmount: toggled(milT.bah, mil.bahAmount),
              basAmount: toggled(milT.bas, mil.basAmount),
              vhaAmount: toggled(milT.vha, mil.vhaAmount),
              flightPayAmount: toggled(milT.flight, mil.flightPayAmount),
              hazardPayAmount: toggled(milT.hazard, mil.hazardPayAmount),
              specialPayAmount: toggled(milT.special, mil.specialPayAmount),
              otherPayAmount: toggled(milT.other, mil.otherPayAmount),
            },
            additionalDetails: { ...mil.additionalDetails },
          }
        : null,
    previousEmployers: needsPreviousEmployment(values, now)
      ? values.previousEmployers.map((e) => employerToApi(e, iso))
      : [],
    createdAt: meta.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/* ── Navigation ────────────────────────────────────────── */

/** Step to open when a saved draft is loaded. Military has no step 6. */
export function resumeStep(lastCompletedStep: number, isSubmitted: boolean, category: EmploymentCategory): number {
  if (isSubmitted) return 10;
  const next = Math.min(Math.max(lastCompletedStep, 0) + 1, 9);
  return category === EmploymentCategory.Military && next === 6 ? 7 : next;
}

/** Form state to load from the `mydrafts` response, or null when there is no draft yet. */
export function hydrationFromDrafts(
  drafts: BorrowerDraftSummary[] | null | undefined,
  fallbackLoanOfficerId: string
): { values: EmploymentFormValues; meta: DraftMeta; step: number } | null {
  const summary = drafts?.[0];
  const draft = summary?.draftData;
  if (!summary || !draft) return null;
  return {
    values: draftToForm(draft),
    meta: {
      draftId: summary.draftId || null,
      loanOfficerId: summary.loanOfficerId || draft.loanOfficerId || fallbackLoanOfficerId,
      borrowerId: draft.borrowerId || null,
      preApprovalId: draft.preApprovalId || null,
      createdAt: draft.createdAt || null,
    },
    step: resumeStep(summary.lastCompletedStep, summary.isSubmitted, draft.employmentCategory),
  };
}

/** Typing an amount ticks its "include" checkbox; clearing it leaves the checkbox as is. */
export function toggleAfterAmountChange(current: boolean, amount: Money): boolean {
  return amount.trim() !== "" ? true : current;
}

/* ── Review (Step 9) ───────────────────────────────────── */

export type ReviewSectionId =
  | "personal"
  | "current"
  | "previous"
  | "income"
  | "additional"
  | "self"
  | "business"
  | "military"
  | "militaryIncome";

export interface ReviewSection {
  id: ReviewSectionId;
  title: string;
  detail: string;
}

const labelOf = <T,>(options: readonly SelectOption<T>[], value: T) =>
  options.find((o) => o.value === value)?.label ?? "";

const money = (amount: Money) => `$${formatMoney(parseMoney(amount)) || "0"}`;

const FREQ_SUFFIX: Record<PayFrequency, string> = {
  [PayFrequency.Annual]: "yr",
  [PayFrequency.Monthly]: "mo",
  [PayFrequency.BiWeekly]: "2wk",
  [PayFrequency.Weekly]: "wk",
};

const dateRange = (start: string, end: string, current: boolean) => `${start} – ${current ? "Present" : end}`;

export function buildReviewSections(values: EmploymentFormValues, now: Date = new Date()): ReviewSection[] {
  const { personalInfo: pi, currentEmployer: emp, incomeDetails: inc, incomeToggles: incT } = values;
  const { selfEmployment: se, militaryService: mil, militaryToggles: milT, additionalInfo: ai } = values;

  const showPrevious = needsPreviousEmployment(values, now);

  const personal: ReviewSection = {
    id: "personal",
    title: "Personal Info",
    detail: `${pi.firstName} ${pi.lastName}`.trim(),
  };

  const count = values.previousEmployers.length;
  const previous: ReviewSection = {
    id: "previous",
    title: "Previous Employment",
    detail: count === 0 ? "No previous employers" : `${count} previous employer${count === 1 ? "" : "s"}`,
  };

  const disclosures = [
    ai.isSeasonalIncome && "Seasonal income",
    ai.isForeignIncome && "Foreign income",
    ai.isFamilyMemberEmployee && "Related-party employer",
  ].filter(Boolean);
  const additional: ReviewSection = {
    id: "additional",
    title: "Additional Info",
    detail: disclosures.length ? disclosures.join(", ") : "No special disclosures",
  };

  if (values.employmentCategory === EmploymentCategory.SelfEmployed) {
    const bc = se.businessContact;
    return [
      personal,
      { id: "self", title: "Self-Employment", detail: `${se.businessName}\n${dateRange(se.startDate, se.endDate, se.isCurrentlyWorking)}` },
      {
        id: "business",
        title: "Business Contact",
        detail: `${bc.workPhone}\n${[bc.businessAddress, bc.city, `${bc.state} ${bc.zip}`.trim()].filter(Boolean).join(", ")}`,
      },
      {
        id: "income",
        title: "Income Details",
        detail: `${money(se.monthlyIncomeOrLoss)} / month\n${labelOf(businessEntityTypeOptions, se.businessEntityType)}, ${labelOf(ownershipShareOptions, se.ownershipShare)}`,
      },
      additional,
      ...(showPrevious ? [previous] : []),
    ];
  }

  if (values.employmentCategory === EmploymentCategory.Military) {
    const extras: [boolean, string, Money][] = [
      [milT.bah, "BAH", mil.bahAmount],
      [milT.bas, "BAS", mil.basAmount],
      [milT.vha, "VHA", mil.vhaAmount],
      [milT.flight, "Flight Pay", mil.flightPayAmount],
      [milT.hazard, "Hazard Pay", mil.hazardPayAmount],
      [milT.special, "Special Pay", mil.specialPayAmount],
      [milT.other, "Other", mil.otherPayAmount],
    ];
    return [
      personal,
      {
        id: "military",
        title: "Military Service",
        detail: `${labelOf(branchOfServiceOptions, mil.branchOfService)} · ${labelOf(militaryStatusOptions, mil.status)}\n${mil.rankPayGrade}\n${dateRange(mil.startDate, mil.separationDate, mil.isCurrentlyServing)}`,
      },
      {
        id: "militaryIncome",
        title: "Military Income",
        detail: [
          `Base Pay: ${money(mil.monthlyBasePay)}/mo`,
          ...extras.filter(([on]) => on).map(([, label, amt]) => `${label}: ${money(amt)}/mo`),
        ].join("\n"),
      },
      additional,
      ...(showPrevious ? [previous] : []),
    ];
  }

  const incomeExtras: [boolean, string, Money, PayFrequency][] = [
    [incT.bonus, "Bonus", inc.bonusPay, inc.bonusFrequency],
    [incT.overtime, "Overtime", inc.overtimePay, inc.overtimeFrequency],
    [incT.commission, "Commission", inc.commissionPay, inc.commissionFrequency],
    [incT.other, "Other", inc.otherPay, inc.otherFrequency],
  ];
  return [
    personal,
    {
      id: "current",
      title: "Current Employment",
      detail: `${emp.employerName}\n${dateRange(emp.startDate, emp.endDate, emp.isCurrentlyWorking)}`,
    },
    ...(showPrevious ? [previous] : []),
    {
      id: "income",
      title: "Income Details",
      detail: [
        inc.isSalary
          ? `Salary: ${money(inc.basePay)}/${FREQ_SUFFIX[inc.basePayFrequency]}`
          : `Hourly: ${money(inc.hourlyRate)}/hr, ${inc.hoursPerWeek} hrs/week`,
        ...incomeExtras
          .filter(([on]) => on)
          .map(([, label, amt, freq]) => `${label}: ${money(amt)}/${FREQ_SUFFIX[freq]}`),
      ].join("\n"),
    },
    additional,
  ];
}
