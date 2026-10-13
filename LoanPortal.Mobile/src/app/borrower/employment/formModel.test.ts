import { describe, it, expect } from "vitest";
import sample from "./__fixtures__/myDraftsSample.json";
import {
  DraftStepData,
  EmploymentCategory,
} from "@/api/models/BorrowerPortalDraftTypes";
import {
  DraftMeta,
  EMPTY_GUID,
  buildReviewSections,
  defaultValues,
  displayDateToIso,
  draftToForm,
  formToStepData,
  formatMoney,
  formatMoneyInput,
  formatPhone,
  phoneDigits,
  hydrationFromDrafts,
  isoToDisplayDate,
  needsPreviousEmployment,
  parseMoney,
  resumeStep,
  toggleAfterAmountChange,
} from "./formModel";
import type { BorrowerDraftSummary } from "@/api/network/user";

const NOW = new Date("2026-09-28T04:42:36.222Z");
const sampleDraft = sample.data[0].draftData as DraftStepData;

/** `stepData` from the user-supplied savedraft sample payload. */
const SAVE_SAMPLE_STEP_DATA = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  loanOfficerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  borrowerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  preApprovalId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  lastCompletedStep: 0,
  isSubmitted: true,
  personalInfo: { firstName: "string", lastName: "string", dateOfBirth: "2026-09-28T04:42:36.222Z", last4SSN: "string", loanType: 0 },
  employmentCategory: 1,
  currentEmployers: [
    {
      employerName: "string", jobTitle: "string", employmentType: 1, isCurrentlyWorking: true,
      startDate: "2026-09-28T04:42:36.222Z", endDate: "2026-09-28T04:42:36.222Z",
      workPhone: "string", phoneExtension: "string", employerAddress: "string", isPrimaryIncome: true,
    },
  ],
  incomeDetails: {
    isSalary: true, basePay: 0, basePayFrequency: 1, hourlyRate: 0, hoursPerWeek: 0, bonusPay: 0, bonusFrequency: 1, overtimePay: 0,
    overtimeFrequency: 1, commissionPay: 0, commissionFrequency: 1, otherPay: 0, otherFrequency: 1,
  },
  additionalInfo: { isSeasonalIncome: true, isForeignIncome: true, isFamilyMemberEmployee: true, additionalComments: "string" },
  selfEmployment: {
    businessName: "string", positionTitle: "string", isCurrentlyWorking: true, isPrimaryIncome: true,
    startDate: "2026-09-28T04:42:36.222Z", endDate: "2026-09-28T04:42:36.222Z",
    businessContact: { workPhone: "string", phoneExtension: "string", businessAddress: "string", city: "string", state: "string", zip: "string" },
    incomeDetails: { ownershipShare: 1, businessEntityType: 1, monthlyIncomeOrLoss: 0, documentationType: 1 },
    additionalInfo: { isSeasonalIncome: true, isForeignIncome: true, isFamilyMemberEmployee: true, additionalComments: "string" },
  },
  militaryService: {
    branchOfService: 1, status: 1, rankPayGrade: "string", militaryOccupationalSpecialty: "string",
    startDate: "2026-09-28T04:42:36.222Z", separationDate: "2026-09-28T04:42:36.222Z", isCurrentlyServing: true,
    incomeDetails: {
      monthlyBasePay: 0, basePayFrequency: 1, bahAmount: 0, basAmount: 0, vhaAmount: 0,
      flightPayAmount: 0, hazardPayAmount: 0, specialPayAmount: 0, otherPayAmount: 0,
    },
    additionalDetails: {
      isPrimaryIncome: true, expectToRemain3Years: true, receivesTaxFreeCombatPay: true,
      receivesDeploymentHostileFirePay: true, receivesSeparationRetirementPay: true, additionalNotes: "string",
    },
  },
  previousEmployers: [],
  createdAt: "2026-09-28T04:42:36.222Z",
  updatedAt: "2026-09-28T04:42:36.222Z",
};

const keys = (o: object) => Object.keys(o).sort();

const PREV_FORM = {
  employerName: "Old Co",
  jobTitle: "Clerk",
  employmentType: 2,
  isCurrentlyWorking: false,
  startDate: "03/01/2022",
  endDate: "06/30/2024",
  workPhone: "(562) 555-1234",
  phoneExtension: "12",
  addressLine1: "1 Main St",
  addressLine2: "Long Beach, CA 90813",
  isPrimaryIncome: false,
};

const PREV_API = {
  employerName: "Old Co",
  jobTitle: "Clerk",
  employmentType: 2,
  isCurrentlyWorking: false,
  startDate: "2022-03-01T00:00:00.000Z",
  endDate: "2024-06-30T00:00:00.000Z",
  workPhone: "(562) 555-1234",
  phoneExtension: "12",
  employerAddress: "1 Main St, Long Beach, CA 90813",
  isPrimaryIncome: false,
};

describe("needsPreviousEmployment", () => {
  const withStart = (start: string) => {
    const v = structuredClone(defaultValues);
    v.currentEmployer.startDate = start;
    return v;
  };

  it("is not needed when the current job started 2+ years ago", () => {
    expect(needsPreviousEmployment(withStart("01/15/2021"), NOW)).toBe(false);
  });
  it("is needed when the current job is under 2 years", () => {
    expect(needsPreviousEmployment(withStart("01/15/2025"), NOW)).toBe(true);
  });
  it("treats exactly 2 years as enough", () => {
    expect(needsPreviousEmployment(withStart("09/28/2024"), NOW)).toBe(false);
    expect(needsPreviousEmployment(withStart("09/29/2024"), NOW)).toBe(true);
  });
  it("is needed when the start date is missing or invalid", () => {
    expect(needsPreviousEmployment(withStart(""), NOW)).toBe(true);
    expect(needsPreviousEmployment(withStart("garbage"), NOW)).toBe(true);
  });
  it("measures a finished job from start to end date", () => {
    const v = withStart("01/15/2021");
    v.currentEmployer.isCurrentlyWorking = false;
    v.currentEmployer.endDate = "02/01/2022";
    expect(needsPreviousEmployment(v, NOW)).toBe(true);
    v.currentEmployer.endDate = "02/01/2023";
    expect(needsPreviousEmployment(v, NOW)).toBe(false);
  });
  it("uses the self-employment dates for self-employed borrowers", () => {
    const v = structuredClone(defaultValues);
    v.employmentCategory = EmploymentCategory.SelfEmployed;
    v.currentEmployer.startDate = "01/15/2015"; // ignored
    v.selfEmployment.startDate = "01/15/2025";
    expect(needsPreviousEmployment(v, NOW)).toBe(true);
    v.selfEmployment.startDate = "01/15/2020";
    expect(needsPreviousEmployment(v, NOW)).toBe(false);
  });
  it("uses the military dates for military borrowers", () => {
    const v = structuredClone(defaultValues);
    v.employmentCategory = EmploymentCategory.Military;
    v.militaryService.startDate = "01/15/2025";
    expect(needsPreviousEmployment(v, NOW)).toBe(true);
    v.militaryService.startDate = "01/15/2020";
    expect(needsPreviousEmployment(v, NOW)).toBe(false);
  });
});

describe("previous employers hydration", () => {
  it("draftToForm maps previous employers to form values", () => {
    const v = draftToForm({ ...sampleDraft, previousEmployers: [PREV_API] });
    expect(v.previousEmployers).toEqual([PREV_FORM]);
  });
});

describe("review sections with history", () => {
  it("hides the previous employment card when not needed", () => {
    const v = structuredClone(defaultValues);
    v.currentEmployer.startDate = "01/15/2021";
    expect(buildReviewSections(v, NOW).some((x) => x.id === "previous")).toBe(false);
  });
});

describe("dates", () => {
  it("isoToDisplayDate uses UTC parts", () => {
    expect(isoToDisplayDate("2021-01-15T00:00:00Z")).toBe("01/15/2021");
  });
  it("isoToDisplayDate returns '' for empty or invalid input", () => {
    expect(isoToDisplayDate("")).toBe("");
    expect(isoToDisplayDate(null)).toBe("");
    expect(isoToDisplayDate("nope")).toBe("");
  });
  it("displayDateToIso returns UTC midnight", () => {
    expect(displayDateToIso("01/15/2021", NOW)).toBe("2021-01-15T00:00:00.000Z");
  });
  it("displayDateToIso falls back to now for empty or invalid input", () => {
    expect(displayDateToIso("", NOW)).toBe(NOW.toISOString());
    expect(displayDateToIso("13/45/2020", NOW)).toBe(NOW.toISOString());
  });
  it("displayDateToIso accepts other common date formats instead of replacing them with today", () => {
    expect(displayDateToIso("1/5/1985", NOW)).toBe("1985-01-05T00:00:00.000Z");
    expect(displayDateToIso("1985-01-15", NOW)).toBe("1985-01-15T00:00:00.000Z");
    expect(displayDateToIso("01-15-1985", NOW)).toBe("1985-01-15T00:00:00.000Z");
    expect(displayDateToIso("1/15/85", NOW)).toBe("1985-01-15T00:00:00.000Z");
    expect(displayDateToIso("1/15/21", NOW)).toBe("2021-01-15T00:00:00.000Z");
    expect(displayDateToIso("Jan 15 1985", NOW)).toBe("1985-01-15T00:00:00.000Z");
  });
});

describe("toggleAfterAmountChange", () => {
  it("ticks the checkbox when an amount is typed", () => {
    expect(toggleAfterAmountChange(false, "10,000")).toBe(true);
  });
  it("leaves the checkbox alone when the amount is cleared", () => {
    expect(toggleAfterAmountChange(true, "")).toBe(true);
    expect(toggleAfterAmountChange(false, "  ")).toBe(false);
  });
});

describe("hydrationFromDrafts", () => {
  it("returns null when there is no draft", () => {
    expect(hydrationFromDrafts([], "token")).toBeNull();
    expect(hydrationFromDrafts(undefined, "token")).toBeNull();
  });
  it("builds values, meta and resume step from the first draft", () => {
    const h = hydrationFromDrafts(sample.data as BorrowerDraftSummary[], "token")!;
    expect(h.values).toEqual(draftToForm(sampleDraft));
    expect(h.meta).toEqual({
      draftId: "447bc268-65fe-4401-97a2-c52e310faa05",
      loanOfficerId: "e05bc937-0026-4030-b7f4-a1507b2405f9",
      borrowerId: "a1edaf73-d345-4282-919b-09470b4ef815",
      preApprovalId: EMPTY_GUID,
      createdAt: "2026-09-25T08:40:42.06Z",
    });
    expect(h.step).toBe(3);
  });
  it("falls back to the URL token when the draft has no loanOfficerId", () => {
    const d = { ...sample.data[0], loanOfficerId: "", draftData: { ...sampleDraft, loanOfficerId: "" } };
    expect(hydrationFromDrafts([d] as BorrowerDraftSummary[], "token")!.meta.loanOfficerId).toBe("token");
  });
});

describe("money", () => {
  it.each([
    ["120,000", 120000],
    ["12.", 12],
    ["2,400.50", 2400.5],
    ["", 0],
    ["abc", 0],
  ])("parseMoney(%j) → %d", (s, n) => {
    expect(parseMoney(s)).toBe(n);
  });
  it("formatMoney adds grouping and blanks zero/null", () => {
    expect(formatMoney(120000)).toBe("120,000");
    expect(formatMoney(2400.5)).toBe("2,400.5");
    expect(formatMoney(0)).toBe("");
    expect(formatMoney(null)).toBe("");
  });
});

describe("draftToForm", () => {
  it("maps the sample mydrafts draft", () => {
    const v = draftToForm(sampleDraft);
    expect(v.employmentCategory).toBe(EmploymentCategory.Employed);
    expect(v.currentEmployer.isCurrentlyWorking).toBe(true);
    expect(v.currentEmployer.startDate).toBe("09/25/2026");
    expect(v.personalInfo.dateOfBirth).toBe("09/25/2026");
    expect(v.incomeDetails.basePay).toBe("");
    expect(v.incomeToggles).toEqual({ bonus: false, overtime: false, commission: false, other: false });
    expect(v.previousEmployers).toEqual([]);
  });

  it("splits employerAddress on the first ', '", () => {
    const v = draftToForm({
      ...sampleDraft,
      currentEmployers: [{ ...sampleDraft.currentEmployers[0], employerAddress: "1234 Industrial Ave, Long Beach, CA 90813" }],
    });
    expect(v.currentEmployer.addressLine1).toBe("1234 Industrial Ave");
    expect(v.currentEmployer.addressLine2).toBe("Long Beach, CA 90813");
  });

  it("sets income toggles from amount > 0", () => {
    const v = draftToForm({ ...sampleDraft, incomeDetails: { ...sampleDraft.incomeDetails!, bonusPay: 10000 } });
    expect(v.incomeToggles.bonus).toBe(true);
    expect(v.incomeDetails.bonusPay).toBe("10,000");
  });

  it("reads self-employed additional info from selfEmployment.additionalInfo", () => {
    const v = draftToForm({
      ...sampleDraft,
      employmentCategory: EmploymentCategory.SelfEmployed,
      selfEmployment: {
        ...SAVE_SAMPLE_STEP_DATA.selfEmployment,
        additionalInfo: { isSeasonalIncome: false, isForeignIncome: true, isFamilyMemberEmployee: false, additionalComments: "se" },
      },
    });
    expect(v.additionalInfo.isForeignIncome).toBe(true);
    expect(v.additionalInfo.additionalComments).toBe("se");
  });

  it("sets military toggles from amount > 0", () => {
    const mil = SAVE_SAMPLE_STEP_DATA.militaryService;
    const v = draftToForm({
      ...sampleDraft,
      employmentCategory: EmploymentCategory.Military,
      militaryService: { ...mil, incomeDetails: { ...mil.incomeDetails, bahAmount: 2400 } },
    });
    expect(v.militaryToggles.bah).toBe(true);
    expect(v.militaryToggles.bas).toBe(false);
    expect(v.militaryService.bahAmount).toBe("2,400");
    expect(v.militaryService.additionalDetails).toEqual(mil.additionalDetails);
  });

  it("falls back to defaults for null / empty sections", () => {
    const v = draftToForm({ ...sampleDraft, personalInfo: null, incomeDetails: null, additionalInfo: null, currentEmployers: [] });
    expect(v.personalInfo).toEqual(defaultValues.personalInfo);
    expect(v.currentEmployer).toEqual(defaultValues.currentEmployer);
    expect(v.incomeDetails).toEqual(defaultValues.incomeDetails);
    expect(v.additionalInfo).toEqual(defaultValues.additionalInfo);
  });
});

describe("formToStepData", () => {
  const meta: DraftMeta = {
    draftId: "d1",
    loanOfficerId: "lo1",
    borrowerId: null,
    preApprovalId: null,
    createdAt: "2026-09-25T08:40:42.06Z",
  };

  it("produces exactly the keys of the savedraft sample", () => {
    const mil = formToStepData({ ...defaultValues, employmentCategory: EmploymentCategory.Military }, meta, 5, false, NOW);
    expect(keys(mil)).toEqual(keys(SAVE_SAMPLE_STEP_DATA));
    expect(keys(mil.personalInfo!)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.personalInfo));
    expect(keys(mil.militaryService!)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.militaryService));
    expect(keys(mil.militaryService!.incomeDetails)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.militaryService.incomeDetails));

    const se = formToStepData({ ...defaultValues, employmentCategory: EmploymentCategory.SelfEmployed }, meta, 5, false, NOW);
    expect(keys(se.selfEmployment!)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.selfEmployment));
    expect(keys(se.selfEmployment!.businessContact)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.selfEmployment.businessContact));
    expect(keys(se.selfEmployment!.incomeDetails)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.selfEmployment.incomeDetails));

    const emp = formToStepData(defaultValues, meta, 5, false, NOW);
    expect(keys(emp.currentEmployers[0])).toEqual(keys(SAVE_SAMPLE_STEP_DATA.currentEmployers[0]));
    expect(keys(emp.incomeDetails!)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.incomeDetails));
    expect(keys(emp.additionalInfo!)).toEqual(keys(SAVE_SAMPLE_STEP_DATA.additionalInfo));
  });

  it("fills ids and meta", () => {
    const out = formToStepData(defaultValues, meta, 3, false, NOW);
    expect(out.id).toBe("d1");
    expect(out.loanOfficerId).toBe("lo1");
    expect(out.borrowerId).toBe(EMPTY_GUID);
    expect(out.preApprovalId).toBe(EMPTY_GUID);
    expect(out.lastCompletedStep).toBe(3);
    expect(out.isSubmitted).toBe(false);
    expect(out.createdAt).toBe("2026-09-25T08:40:42.06Z");
    expect(out.updatedAt).toBe(NOW.toISOString());
  });

  it("uses EMPTY_GUID for a missing draftId and now for missing createdAt", () => {
    const out = formToStepData(defaultValues, { ...meta, draftId: null, createdAt: null }, 2, false, NOW);
    expect(out.id).toBe(EMPTY_GUID);
    expect(out.createdAt).toBe(NOW.toISOString());
  });

  it("employed: joins address, parses money, zeroes untoggled extras", () => {
    const v = structuredClone(defaultValues);
    v.currentEmployer.addressLine1 = "1234 Industrial Ave";
    v.currentEmployer.addressLine2 = "Long Beach, CA 90813";
    v.currentEmployer.startDate = "01/15/2021";
    v.incomeDetails.basePay = "120,000";
    v.incomeDetails.bonusPay = "10,000";
    v.incomeToggles.bonus = false;
    v.incomeDetails.commissionPay = "5,000";
    v.incomeToggles.commission = true;
    const out = formToStepData(v, meta, 7, false, NOW);
    expect(out.employmentCategory).toBe(1);
    expect(out.currentEmployers[0].employerAddress).toBe("1234 Industrial Ave, Long Beach, CA 90813");
    expect(out.currentEmployers[0].startDate).toBe("2021-01-15T00:00:00.000Z");
    expect(out.incomeDetails!.basePay).toBe(120000);
    expect(out.incomeDetails!.bonusPay).toBe(0);
    expect(out.incomeDetails!.commissionPay).toBe(5000);
    expect(out.selfEmployment).toBeNull();
    expect(out.militaryService).toBeNull();
  });

  it("employed: address with only line 1 has no trailing separator", () => {
    const v = structuredClone(defaultValues);
    v.currentEmployer.addressLine1 = "1234 Industrial Ave";
    expect(formToStepData(v, meta, 5, false, NOW).currentEmployers[0].employerAddress).toBe("1234 Industrial Ave");
  });

  it("self-employed: SE section populated, additionalInfo mirrored, employed sections empty", () => {
    const v = { ...structuredClone(defaultValues), employmentCategory: EmploymentCategory.SelfEmployed };
    v.additionalInfo.isSeasonalIncome = true;
    v.selfEmployment.monthlyIncomeOrLoss = "12,000";
    const out = formToStepData(v, meta, 6, false, NOW);
    expect(out.currentEmployers).toEqual([]);
    expect(out.incomeDetails).toBeNull();
    expect(out.militaryService).toBeNull();
    expect(out.selfEmployment!.incomeDetails.monthlyIncomeOrLoss).toBe(12000);
    expect(out.selfEmployment!.additionalInfo.isSeasonalIncome).toBe(true);
    expect(out.additionalInfo!.isSeasonalIncome).toBe(true);
  });

  it("military: untoggled allowance → 0, additionalDetails passthrough", () => {
    const v = { ...structuredClone(defaultValues), employmentCategory: EmploymentCategory.Military };
    v.militaryService.bahAmount = "2,400.00";
    v.militaryToggles.bah = true;
    v.militaryService.basAmount = "460.00";
    v.militaryToggles.bas = false;
    const out = formToStepData(v, meta, 5, false, NOW);
    expect(out.currentEmployers).toEqual([]);
    expect(out.incomeDetails).toBeNull();
    expect(out.selfEmployment).toBeNull();
    expect(out.militaryService!.incomeDetails.bahAmount).toBe(2400);
    expect(out.militaryService!.incomeDetails.basAmount).toBe(0);
    expect(out.militaryService!.additionalDetails).toEqual(defaultValues.militaryService.additionalDetails);
  });

  it("maps previous employers to the API shape when history is needed", () => {
    const prev = { ...defaultValues.currentEmployer, ...PREV_FORM };
    const out = formToStepData({ ...defaultValues, previousEmployers: [prev] }, meta, 8, false, NOW);
    expect(out.previousEmployers).toEqual([PREV_API]);
  });

  it("sends no previous employers when the current job already covers 2 years", () => {
    const v = structuredClone(defaultValues);
    v.currentEmployer.startDate = "01/15/2021";
    v.previousEmployers = [{ ...defaultValues.currentEmployer, ...PREV_FORM }];
    expect(formToStepData(v, meta, 8, false, NOW).previousEmployers).toEqual([]);
  });

  it("round-trips the sample draft", () => {
    const out = formToStepData(draftToForm(sampleDraft), meta, 2, false, NOW);
    expect(out.currentEmployers).toEqual(
      sampleDraft.currentEmployers.map((e) => ({
        ...e,
        startDate: "2026-09-25T00:00:00.000Z",
        endDate: "2026-09-25T00:00:00.000Z",
      }))
    );
    expect(out.incomeDetails).toEqual(sampleDraft.incomeDetails);
    expect(out.additionalInfo).toEqual(sampleDraft.additionalInfo);
  });
});

describe("resumeStep", () => {
  it.each([
    [0, false, EmploymentCategory.Employed, 1],
    [2, false, EmploymentCategory.Employed, 3],
    [5, false, EmploymentCategory.Military, 7],
    [8, false, EmploymentCategory.Employed, 9],
    [9, false, EmploymentCategory.Employed, 9],
    [4, true, EmploymentCategory.Employed, 10],
  ])("(%i, %s, %i) → %i", (last, submitted, cat, want) => {
    expect(resumeStep(last, submitted, cat)).toBe(want);
  });
});

describe("buildReviewSections", () => {
  it("employed: order and details", () => {
    const v = structuredClone(defaultValues);
    v.personalInfo.firstName = "John";
    v.personalInfo.lastName = "Doe";
    v.currentEmployer.employerName = "ABC Construction Inc.";
    v.currentEmployer.startDate = "01/15/2026";
    v.incomeDetails.basePay = "120,000";
    v.incomeDetails.bonusPay = "10,000";
    v.incomeToggles.bonus = true;
    const s = buildReviewSections(v, NOW);
    expect(s.map((x) => x.id)).toEqual(["personal", "current", "previous", "income", "additional"]);
    expect(s[0].detail).toBe("John Doe");
    expect(s[1].detail).toBe("ABC Construction Inc.\n01/15/2026 – Present");
    expect(s[2].detail).toBe("No previous employers");
    expect(s[3].detail).toBe("Salary: $120,000/yr\nBonus: $10,000/yr");
    expect(s[4].detail).toBe("No special disclosures");
  });

  it("employed: not currently working shows end date", () => {
    const v = structuredClone(defaultValues);
    v.currentEmployer.employerName = "ABC";
    v.currentEmployer.startDate = "01/15/2021";
    v.currentEmployer.endDate = "02/01/2024";
    v.currentEmployer.isCurrentlyWorking = false;
    expect(buildReviewSections(v, NOW)[1].detail).toBe("ABC\n01/15/2021 – 02/01/2024");
  });

  it("previous employer count wording", () => {
    const prev = { ...defaultValues.currentEmployer, ...PREV_FORM };
    const one = buildReviewSections({ ...defaultValues, previousEmployers: [prev] }, NOW);
    const two = buildReviewSections({ ...defaultValues, previousEmployers: [prev, prev] }, NOW);
    expect(one.find((x) => x.id === "previous")!.detail).toBe("1 previous employer");
    expect(two.find((x) => x.id === "previous")!.detail).toBe("2 previous employers");
  });

  it("self-employed: order and details", () => {
    const v = { ...structuredClone(defaultValues), employmentCategory: EmploymentCategory.SelfEmployed };
    v.selfEmployment.businessName = "Doe Consulting LLC";
    v.selfEmployment.startDate = "01/15/2026";
    v.selfEmployment.monthlyIncomeOrLoss = "12,000";
    v.selfEmployment.businessContact = {
      workPhone: "(562) 555-9876", phoneExtension: "", businessAddress: "1234 Coastal Hwy",
      city: "Long Beach", state: "CA", zip: "90813",
    };
    const s = buildReviewSections(v, NOW);
    expect(s.map((x) => x.id)).toEqual(["personal", "self", "business", "income", "additional", "previous"]);
    expect(s[1].detail).toBe("Doe Consulting LLC\n01/15/2026 – Present");
    expect(s[2].detail).toBe("(562) 555-9876\n1234 Coastal Hwy, Long Beach, CA 90813");
    expect(s[3].detail).toBe("$12,000 / month\nS Corporation (S Corp), 25% or more");
  });

  it("military: order and details", () => {
    const v = { ...structuredClone(defaultValues), employmentCategory: EmploymentCategory.Military };
    v.militaryService.monthlyBasePay = "3,500.00";
    v.militaryService.bahAmount = "2,400.00";
    v.militaryToggles.bah = true;
    v.militaryService.rankPayGrade = "E-5";
    v.militaryService.startDate = "01/15/2026";
    const s = buildReviewSections(v, NOW);
    expect(s.map((x) => x.id)).toEqual(["personal", "military", "militaryIncome", "additional", "previous"]);
    expect(s[1].detail).toBe("U.S. Army · Active Duty\nE-5\n01/15/2026 – Present");
    expect(s[2].detail).toBe("Base Pay: $3,500/mo\nBAH: $2,400/mo");
  });

  it("additional info lists checked disclosures", () => {
    const v = structuredClone(defaultValues);
    v.additionalInfo.isForeignIncome = true;
    v.additionalInfo.isSeasonalIncome = true;
    expect(buildReviewSections(v).find((x) => x.id === "additional")!.detail).toBe("Seasonal income, Foreign income");
  });

  it("empty amounts render as $0", () => {
    const s = buildReviewSections(defaultValues);
    expect(s.find((x) => x.id === "income")!.detail).toBe("Salary: $0/yr");
  });
});

describe("phone helpers", () => {
  it("phoneDigits keeps digits only and caps at 10", () => {
    expect(phoneDigits("(562) 555-1234")).toBe("5625551234");
    expect(phoneDigits("562-555-12345678")).toBe("5625551234");
    expect(phoneDigits("abc")).toBe("");
  });

  it("formatPhone formats progressively as digits are typed", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone("5")).toBe("(5");
    expect(formatPhone("562")).toBe("(562");
    expect(formatPhone("5625")).toBe("(562) 5");
    expect(formatPhone("562555")).toBe("(562) 555");
    expect(formatPhone("5625551")).toBe("(562) 555-1");
    expect(formatPhone("5625551234")).toBe("(562) 555-1234");
  });

  it("formatPhone accepts already formatted or over-long input", () => {
    expect(formatPhone("(562) 555-1234")).toBe("(562) 555-1234");
    expect(formatPhone("56255512345")).toBe("(562) 555-1234");
  });
});

describe("formatMoneyInput", () => {
  it("drops letters and symbols", () => {
    expect(formatMoneyInput("abc")).toBe("");
    expect(formatMoneyInput("12abc3")).toBe("123");
    expect(formatMoneyInput("$1@2#3")).toBe("123");
  });

  it("groups thousands as digits are typed", () => {
    expect(formatMoneyInput("1000")).toBe("1,000");
    expect(formatMoneyInput("1234567")).toBe("1,234,567");
    expect(formatMoneyInput("120,000")).toBe("120,000");
  });

  it("allows one decimal point with at most 2 decimals", () => {
    expect(formatMoneyInput("12.")).toBe("12.");
    expect(formatMoneyInput("12.5")).toBe("12.5");
    expect(formatMoneyInput("1234.567")).toBe("1,234.56");
    expect(formatMoneyInput("1.2.3")).toBe("1.23");
    expect(formatMoneyInput(".5")).toBe("0.5");
  });

  it("rejects a minus sign unless negatives are allowed, and only at the start", () => {
    expect(formatMoneyInput("-500")).toBe("500");
    expect(formatMoneyInput("-2000", true)).toBe("-2,000");
    expect(formatMoneyInput("20-00", true)).toBe("2,000");
    expect(formatMoneyInput("-", true)).toBe("-");
  });
});
