import { describe, it, expect } from "vitest";
import {
  computeDisabledState,
  computeRefinanceDisabledState,
  purchaseFormOrder,
} from "./formGating";
import { FormKey, RefinanceFormKey, refinanceFormOrder } from "./types";

describe("computeRefinanceDisabledState", () => {
  const done = (d: RefinanceFormKey[]) =>
    Object.fromEntries(
      refinanceFormOrder.map((k) => [k, d.includes(k)]),
    ) as Record<RefinanceFormKey, boolean>;
  const open = (c: Record<RefinanceFormKey, boolean>) => {
    const d = computeRefinanceDisabledState(c);
    return refinanceFormOrder.filter((k) => !d[k]);
  };

  it("new record: only borrowerInfo enabled", () => {
    expect(open(done([]))).toEqual(["borrowerInfo"]);
  });

  it("borrower-created record: loanProgram stays locked", () => {
    expect(open(done(["borrowerInfo", "borrowersIncomeData"]))).toEqual([
      "borrowerInfo",
      "loanStructure",
    ]);
  });

  it("agent-created record filled in order: next form unlocks", () => {
    expect(
      open(done(["borrowerInfo", "loanStructure", "refinanceInfo"])),
    ).toEqual(["borrowerInfo", "loanStructure", "refinanceInfo", "lenderFees"]);
  });
});

const completedFrom = (done: FormKey[]) =>
  Object.fromEntries(
    purchaseFormOrder.map((k) => [k, done.includes(k)]),
  ) as Record<FormKey, boolean>;

const enabled = (d: Record<FormKey, boolean>) =>
  purchaseFormOrder.filter((k) => !d[k]);

describe("computeDisabledState", () => {
  it("new record: only borrowerInfo enabled", () => {
    expect(enabled(computeDisabledState(completedFrom([])))).toEqual([
      "borrowerInfo",
    ]);
  });

  it("borrower-created record (info + income filled): loanProgram stays locked", () => {
    const d = computeDisabledState(
      completedFrom(["borrowerInfo", "borrowersIncomeData"]),
      1,
    );
    expect(enabled(d)).toEqual(["borrowerInfo", "purchaseInfo"]);
  });

  it("agent-created record filled in order: next form unlocks", () => {
    const d = computeDisabledState(
      completedFrom(["borrowerInfo", "purchaseInfo", "lenderFees"]),
      1,
    );
    // propertyIncomeOffset skipped (occupancy 1) and lenderFees done
    expect(enabled(d)).toEqual([
      "borrowerInfo",
      "purchaseInfo",
      "propertyIncomeOffset",
      "lenderFees",
      "prepaidItems",
    ]);
  });

  it("propertyIncomeOffset is required when occupancyStatus is 3", () => {
    const d = computeDisabledState(
      completedFrom(["borrowerInfo", "purchaseInfo"]),
      3,
    );
    expect(enabled(d)).toEqual([
      "borrowerInfo",
      "purchaseInfo",
      "propertyIncomeOffset",
    ]);
  });

  it("fully completed record: everything enabled", () => {
    const d = computeDisabledState(completedFrom(purchaseFormOrder), 1);
    expect(enabled(d)).toEqual(purchaseFormOrder);
  });
});
