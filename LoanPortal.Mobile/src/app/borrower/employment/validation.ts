// ─── Borrower Employment – step validation ──────────────────────────────────
// Pure (React-free) required-field checks for each wizard step. Errors are keyed by
// react-hook-form field path so the UI can attach them to the matching input.

import { EmploymentCategory } from "@/api/models/BorrowerPortalDraftTypes";
import { EmployerFormEntry, EmploymentFormValues, Money, parseMoney } from "./formModel";

export type StepErrors = Record<string, string>;

const REQUIRED = "This field is required";

const blank = (s: string | null | undefined) => !s?.trim();
const digits = (s: string) => s.replace(/\D/g, "");

/** MM/DD/YYYY → UTC midnight ms, or null if empty / not a real date. */
function dateMs(display: string): number | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display ?? "");
  if (!m) return null;
  const [y, mo, d] = [Number(m[3]), Number(m[1]), Number(m[2])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? t.getTime() : null;
}

const isFuture = (display: string, now: Date) => {
  const t = dateMs(display);
  return t !== null && t > now.getTime();
};

/** Collects errors; the first one recorded for a path wins. */
const collector = () => {
  const errors: StepErrors = {};
  const add = (path: string, message: string) => {
    if (!(path in errors)) errors[path] = message;
  };
  return {
    errors,
    text: (path: string, value: string) => blank(value) && add(path, REQUIRED),
    startDate: (path: string, value: string, now: Date) => {
      if (blank(value)) add(path, REQUIRED);
      else if (isFuture(value, now)) add(path, "Start date cannot be in the future");
    },
    phone: (path: string, value: string) => {
      if (blank(value)) add(path, REQUIRED);
      else if (digits(value).length < 10) add(path, "Enter a valid 10-digit phone number");
    },
    /** Amount that must be greater than zero. */
    amount: (path: string, value: Money) => {
      if (blank(value)) add(path, REQUIRED);
      else if (parseMoney(value) <= 0) add(path, "Enter an amount greater than 0");
    },
    add,
  };
};

type Collector = ReturnType<typeof collector>;

function endAfterStart(c: Collector, path: string, start: string, end: string) {
  if (blank(end)) return c.add(path, REQUIRED);
  const s = dateMs(start);
  const e = dateMs(end);
  if (s !== null && e !== null && e < s) c.add(path, "End date cannot be before the start date");
}

function validatePrevious(c: Collector, emp: EmployerFormEntry, prefix: string, now: Date) {
  c.text(`${prefix}.employerName`, emp.employerName);
  c.text(`${prefix}.jobTitle`, emp.jobTitle);
  c.startDate(`${prefix}.startDate`, emp.startDate, now);
  endAfterStart(c, `${prefix}.endDate`, emp.startDate, emp.endDate);
}

const MILITARY_EXTRAS = [
  ["bah", "bahAmount"],
  ["bas", "basAmount"],
  ["vha", "vhaAmount"],
  ["flight", "flightPayAmount"],
  ["hazard", "hazardPayAmount"],
  ["special", "specialPayAmount"],
  ["other", "otherPayAmount"],
] as const;

const INCOME_EXTRAS = [
  ["bonus", "bonusPay"],
  ["overtime", "overtimePay"],
  ["commission", "commissionPay"],
  ["other", "otherPay"],
] as const;

/** Errors for the fields on `step` (the wizard's internal step number). Empty object = valid. */
export function validateStep(step: number, values: EmploymentFormValues, now: Date = new Date()): StepErrors {
  const c = collector();
  const cat = values.employmentCategory;
  const self = cat === EmploymentCategory.SelfEmployed;
  const military = cat === EmploymentCategory.Military;

  switch (step) {
    case 2: {
      const pi = values.personalInfo;
      c.text("personalInfo.firstName", pi.firstName);
      c.text("personalInfo.lastName", pi.lastName);
      if (blank(pi.dateOfBirth)) c.add("personalInfo.dateOfBirth", REQUIRED);
      else if (isFuture(pi.dateOfBirth, now)) c.add("personalInfo.dateOfBirth", "Date of birth cannot be in the future");
      if (blank(pi.last4SSN)) c.add("personalInfo.last4SSN", REQUIRED);
      else if (!/^\d{9}$/.test(pi.last4SSN.trim())) c.add("personalInfo.last4SSN", "Enter a 9-digit SSN");
      break;
    }

    case 4:
      if (self) {
        const se = values.selfEmployment;
        c.text("selfEmployment.businessName", se.businessName);
        c.text("selfEmployment.positionTitle", se.positionTitle);
        c.startDate("selfEmployment.startDate", se.startDate, now);
      } else if (military) {
        const m = values.militaryService;
        c.text("militaryService.rankPayGrade", m.rankPayGrade);
        c.startDate("militaryService.startDate", m.startDate, now);
        if (!m.isCurrentlyServing) endAfterStart(c, "militaryService.separationDate", m.startDate, m.separationDate);
      } else {
        const e = values.currentEmployer;
        c.text("currentEmployer.employerName", e.employerName);
        c.text("currentEmployer.jobTitle", e.jobTitle);
        c.startDate("currentEmployer.startDate", e.startDate, now);
      }
      break;

    case 5:
      if (self) {
        const bc = values.selfEmployment.businessContact;
        const p = "selfEmployment.businessContact";
        c.phone(`${p}.workPhone`, bc.workPhone);
        c.text(`${p}.businessAddress`, bc.businessAddress);
        c.text(`${p}.city`, bc.city);
        c.text(`${p}.state`, bc.state);
        if (blank(bc.zip)) c.add(`${p}.zip`, REQUIRED);
        else if (!/^\d{5}(-\d{4})?$/.test(bc.zip.trim())) c.add(`${p}.zip`, "Enter a 5-digit ZIP code");
      } else if (military) {
        const m = values.militaryService;
        c.amount("militaryService.monthlyBasePay", m.monthlyBasePay);
        for (const [toggle, amount] of MILITARY_EXTRAS) {
          if (values.militaryToggles[toggle]) c.amount(`militaryService.${amount}`, m[amount]);
        }
      } else {
        c.phone("currentEmployer.workPhone", values.currentEmployer.workPhone);
        c.text("currentEmployer.addressLine1", values.currentEmployer.addressLine1);
      }
      break;

    case 6:
      if (self) {
        const income = values.selfEmployment.monthlyIncomeOrLoss;
        if (blank(income)) c.add("selfEmployment.monthlyIncomeOrLoss", REQUIRED);
        else if (parseMoney(income) === 0) c.add("selfEmployment.monthlyIncomeOrLoss", "Enter an amount other than 0");
      } else if (!military) {
        const inc = values.incomeDetails;
        if (inc.isSalary) {
          c.amount("incomeDetails.basePay", inc.basePay);
        } else {
          c.amount("incomeDetails.hourlyRate", inc.hourlyRate);
          const hours = Number(inc.hoursPerWeek);
          if (blank(inc.hoursPerWeek)) c.add("incomeDetails.hoursPerWeek", REQUIRED);
          else if (!(hours > 0 && hours <= 168)) c.add("incomeDetails.hoursPerWeek", "Enter hours between 1 and 168");
        }
        for (const [toggle, amount] of INCOME_EXTRAS) {
          if (values.incomeToggles[toggle]) c.amount(`incomeDetails.${amount}`, inc[amount]);
        }
      }
      break;

    case 8:
      if (values.previousEmployers.length === 0) c.add("previousEmployers", "Add at least one previous employer");
      values.previousEmployers.forEach((emp, i) => validatePrevious(c, emp, `previousEmployers.${i}`, now));
      break;
  }

  return c.errors;
}
