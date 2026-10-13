import { describe, it, expect } from "vitest";
import { EmploymentCategory } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues, defaultPreviousEmployer, defaultValues } from "./formModel";
import { validateStep } from "./validation";

const NOW = new Date("2026-09-28T12:00:00.000Z");

const make = (patch: (v: EmploymentFormValues) => void): EmploymentFormValues => {
  const v = structuredClone(defaultValues);
  patch(v);
  return v;
};

const errorsFor = (step: number, v: EmploymentFormValues) => validateStep(step, v, NOW);

describe("step 2 – identity", () => {
  const valid = make((v) => {
    v.personalInfo = { firstName: "John", lastName: "Doe", dateOfBirth: "01/15/1985", last4SSN: "123456789", loanType: 0 };
  });

  it("accepts complete identity", () => {
    expect(errorsFor(2, valid)).toEqual({});
  });

  it("requires every field, treating whitespace as empty", () => {
    const errs = errorsFor(2, make((v) => { v.personalInfo.firstName = "   "; }));
    expect(Object.keys(errs).sort()).toEqual(
      ["personalInfo.dateOfBirth", "personalInfo.firstName", "personalInfo.last4SSN", "personalInfo.lastName"]
    );
  });

  it("rejects an SSN that is not exactly 9 digits", () => {
    for (const bad of ["1234", "12345678", "1234567890", "12345678a"]) {
      const errs = errorsFor(2, { ...valid, personalInfo: { ...valid.personalInfo, last4SSN: bad } });
      expect(errs["personalInfo.last4SSN"]).toBeTruthy();
    }
  });

  it("rejects a date of birth in the future", () => {
    const errs = errorsFor(2, { ...valid, personalInfo: { ...valid.personalInfo, dateOfBirth: "01/01/2030" } });
    expect(errs["personalInfo.dateOfBirth"]).toBeTruthy();
  });
});

describe("step 3 – employment type", () => {
  it("has nothing to validate", () => {
    expect(errorsFor(3, structuredClone(defaultValues))).toEqual({});
  });
});

describe("employed", () => {
  const filled = make((v) => {
    v.currentEmployer.employerName = "ABC";
    v.currentEmployer.jobTitle = "PM";
    v.currentEmployer.startDate = "01/01/2020";
    v.currentEmployer.workPhone = "(562) 555-1234";
    v.currentEmployer.addressLine1 = "1 Main St";
    v.incomeDetails.basePay = "120,000";
  });

  it("step 4 requires name, title and start date", () => {
    expect(Object.keys(errorsFor(4, structuredClone(defaultValues))).sort()).toEqual([
      "currentEmployer.employerName",
      "currentEmployer.jobTitle",
      "currentEmployer.startDate",
    ]);
    expect(errorsFor(4, filled)).toEqual({});
  });

  it("step 4 rejects a future start date", () => {
    const errs = errorsFor(4, make((v) => { Object.assign(v.currentEmployer, filled.currentEmployer, { startDate: "01/01/2030" }); }));
    expect(errs["currentEmployer.startDate"]).toBeTruthy();
  });

  it("step 5 requires phone and address", () => {
    expect(Object.keys(errorsFor(5, structuredClone(defaultValues))).sort()).toEqual([
      "currentEmployer.addressLine1",
      "currentEmployer.workPhone",
    ]);
    expect(errorsFor(5, filled)).toEqual({});
  });

  it("step 5 rejects a phone with fewer than 10 digits", () => {
    const errs = errorsFor(5, make((v) => { Object.assign(v.currentEmployer, filled.currentEmployer, { workPhone: "555-1234" }); }));
    expect(errs["currentEmployer.workPhone"]).toBeTruthy();
  });

  it("step 6 requires a base pay greater than zero", () => {
    expect(errorsFor(6, structuredClone(defaultValues))["incomeDetails.basePay"]).toBeTruthy();
    expect(errorsFor(6, make((v) => { v.incomeDetails.basePay = "0"; }))["incomeDetails.basePay"]).toBeTruthy();
    expect(errorsFor(6, filled)).toEqual({});
  });

  it("step 6 requires an amount for each ticked extra income", () => {
    const errs = errorsFor(6, make((v) => {
      v.incomeDetails.basePay = "100";
      v.incomeToggles.bonus = true;
      v.incomeToggles.other = true;
      v.incomeDetails.otherPay = "50";
    }));
    expect(Object.keys(errs)).toEqual(["incomeDetails.bonusPay"]);
  });
});

describe("self-employed", () => {
  const base = make((v) => { v.employmentCategory = EmploymentCategory.SelfEmployed; });
  const filled = make((v) => {
    v.employmentCategory = EmploymentCategory.SelfEmployed;
    v.selfEmployment.businessName = "Doe LLC";
    v.selfEmployment.positionTitle = "Owner";
    v.selfEmployment.startDate = "01/01/2020";
    v.selfEmployment.businessContact = {
      workPhone: "5625551234", phoneExtension: "", businessAddress: "1 Main St", city: "LA", state: "CA", zip: "90001",
    };
    v.selfEmployment.monthlyIncomeOrLoss = "5,000";
  });

  it("step 4 requires business name, title and start date", () => {
    expect(Object.keys(errorsFor(4, base)).sort()).toEqual([
      "selfEmployment.businessName",
      "selfEmployment.positionTitle",
      "selfEmployment.startDate",
    ]);
    expect(errorsFor(4, filled)).toEqual({});
  });

  it("step 5 requires phone, address, city, state and zip", () => {
    expect(Object.keys(errorsFor(5, base)).sort()).toEqual([
      "selfEmployment.businessContact.businessAddress",
      "selfEmployment.businessContact.city",
      "selfEmployment.businessContact.state",
      "selfEmployment.businessContact.workPhone",
      "selfEmployment.businessContact.zip",
    ]);
    expect(errorsFor(5, filled)).toEqual({});
  });

  it("step 5 accepts ZIP+4 and rejects a malformed ZIP", () => {
    const withZip = (zip: string) => {
      const v = structuredClone(filled);
      v.selfEmployment.businessContact.zip = zip;
      return errorsFor(5, v)["selfEmployment.businessContact.zip"];
    };
    expect(withZip("90001-1234")).toBeUndefined();
    expect(withZip("9000")).toBeTruthy();
  });

  it("step 6 requires income, which may be negative but not empty or zero", () => {
    expect(errorsFor(6, base)["selfEmployment.monthlyIncomeOrLoss"]).toBeTruthy();
    const neg = structuredClone(filled);
    neg.selfEmployment.monthlyIncomeOrLoss = "-2,000";
    expect(errorsFor(6, neg)).toEqual({});
    const zero = structuredClone(filled);
    zero.selfEmployment.monthlyIncomeOrLoss = "0";
    expect(errorsFor(6, zero)["selfEmployment.monthlyIncomeOrLoss"]).toBeTruthy();
  });
});

describe("military", () => {
  const base = make((v) => { v.employmentCategory = EmploymentCategory.Military; });
  const filled = make((v) => {
    v.employmentCategory = EmploymentCategory.Military;
    v.militaryService.rankPayGrade = "E-5";
    v.militaryService.startDate = "01/01/2015";
    v.militaryService.monthlyBasePay = "3,000";
  });

  it("step 4 requires rank and start date", () => {
    expect(Object.keys(errorsFor(4, base)).sort()).toEqual(["militaryService.rankPayGrade", "militaryService.startDate"]);
    expect(errorsFor(4, filled)).toEqual({});
  });

  it("step 4 requires a separation date on or after start when not serving", () => {
    const noSep = structuredClone(filled);
    noSep.militaryService.isCurrentlyServing = false;
    expect(errorsFor(4, noSep)["militaryService.separationDate"]).toBeTruthy();

    const before = structuredClone(noSep);
    before.militaryService.separationDate = "01/01/2010";
    expect(errorsFor(4, before)["militaryService.separationDate"]).toBeTruthy();

    const ok = structuredClone(noSep);
    ok.militaryService.separationDate = "01/01/2020";
    expect(errorsFor(4, ok)).toEqual({});
  });

  it("step 4 ignores the separation date while currently serving", () => {
    const v = structuredClone(filled);
    v.militaryService.separationDate = "";
    expect(errorsFor(4, v)).toEqual({});
  });

  it("step 5 requires base pay and amounts for ticked extras", () => {
    expect(errorsFor(5, base)["militaryService.monthlyBasePay"]).toBeTruthy();
    const v = structuredClone(filled);
    v.militaryToggles.bah = true;
    expect(Object.keys(errorsFor(5, v))).toEqual(["militaryService.bahAmount"]);
    v.militaryService.bahAmount = "900";
    expect(errorsFor(5, v)).toEqual({});
  });
});

describe("shared steps", () => {
  it("step 7 has nothing to validate", () => {
    expect(errorsFor(7, structuredClone(defaultValues))).toEqual({});
  });

  it("step 8 requires at least one previous employer", () => {
    expect(errorsFor(8, structuredClone(defaultValues))["previousEmployers"]).toBeTruthy();
  });

  it("step 8 requires name, title, start and end for each employer, keyed by index", () => {
    const v = make((x) => {
      x.previousEmployers = [
        { ...defaultPreviousEmployer, employerName: "A", jobTitle: "B", startDate: "01/01/2015", endDate: "01/01/2018" },
        { ...defaultPreviousEmployer },
      ];
    });
    expect(Object.keys(errorsFor(8, v)).sort()).toEqual([
      "previousEmployers.1.employerName",
      "previousEmployers.1.endDate",
      "previousEmployers.1.jobTitle",
      "previousEmployers.1.startDate",
    ]);
  });

  it("step 8 rejects an end date before the start date and a future start date", () => {
    const v = make((x) => {
      x.previousEmployers = [
        { ...defaultPreviousEmployer, employerName: "A", jobTitle: "B", startDate: "01/01/2018", endDate: "01/01/2015" },
        { ...defaultPreviousEmployer, employerName: "A", jobTitle: "B", startDate: "01/01/2030", endDate: "01/01/2031" },
      ];
    });
    const errs = errorsFor(8, v);
    expect(errs["previousEmployers.0.endDate"]).toBeTruthy();
    expect(errs["previousEmployers.1.startDate"]).toBeTruthy();
  });
});
