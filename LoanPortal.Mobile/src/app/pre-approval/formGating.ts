import { FormKey, RefinanceFormKey, refinanceFormOrder } from "./types";

export const purchaseFormOrder: FormKey[] = [
  "borrowerInfo",
  "purchaseInfo",
  "propertyIncomeOffset",
  "lenderFees",
  "prepaidItems",
  "miscFees",
  "borrowersIncomeData",
  "loanProgram",
];

/**
 * A form is locked unless every earlier required form is completed, so a
 * record that arrives with later sections pre-filled (e.g. created from the
 * borrower's employment history) cannot unlock forms past an empty one.
 * Forms listed in `optional` never block the ones after them.
 */
export function computeLockedForms<K extends string>(
  order: readonly K[],
  completed: Record<K, boolean>,
  optional: readonly K[] = [],
): Record<K, boolean> {
  const disabled = {} as Record<K, boolean>;
  let blocked = false;

  order.forEach((formKey) => {
    disabled[formKey] = blocked;
    if (!completed[formKey] && !optional.includes(formKey)) {
      blocked = true;
    }
  });

  return disabled;
}

/** propertyIncomeOffset is only required when occupancyStatus is 3. */
export function computeDisabledState(
  completed: Record<FormKey, boolean>,
  occupancyStatus?: number | null,
): Record<FormKey, boolean> {
  const offsetOptional = !!occupancyStatus && occupancyStatus !== 3;
  return computeLockedForms(
    purchaseFormOrder,
    completed,
    offsetOptional ? ["propertyIncomeOffset"] : [],
  );
}

export function computeRefinanceDisabledState(
  completed: Record<RefinanceFormKey, boolean>,
): Record<RefinanceFormKey, boolean> {
  return computeLockedForms(refinanceFormOrder, completed);
}
