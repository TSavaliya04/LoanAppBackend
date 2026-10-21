import type { Borrower, GoalId, Scenario } from "./refinance-scenario-data";

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function getScenarioCosts(scenario: any, borrower: Borrower) {
  return {
    propertyTaxMonthly: scenario.loanProgram?.monthlyPropertyTax ?? Math.round((scenario.purchaseInfo?.purchasePrice * 0.0125) / 12),
    hazardInsuranceMonthly: scenario.refinanceInfo?.hazardInsurance ?? 150,
    hoaMonthly: scenario.refinanceInfo?.associationFee ?? 0,
    closingCosts: scenario.loanProgram.clearingCart ?? 0,
  };
}

export function getMetrics(scenario: any, borrower: Borrower, firstScenario: any) {
  const costs = getScenarioCosts(scenario, borrower);
  const principalAndInterest = scenario.loanProgram.principalAndInterest;
  const mortgageInsuranceMonthly = scenario.refinanceInfo?.mi;
  const totalMonthlyPayment =
    principalAndInterest +
    costs.propertyTaxMonthly +
    costs.hazardInsuranceMonthly +
    costs.hoaMonthly +
    mortgageInsuranceMonthly;
  let totalBorrowerIncome = 0;
  let totalBorrowerPayment = 0;
  const borrowerIncome = firstScenario.borrowersIncomeData?.borrowerIncome;
  borrowerIncome?.forEach((b: any) => {
    totalBorrowerIncome += Number(b.monthlyIncome) || 0;
    b?.debts?.forEach((debt: any) => {
      totalBorrowerPayment += Number(debt.monthlyPayment) || 0;
    });
  });

  const totalDebtToBePaidOff =
    firstScenario.borrowersIncomeData?.borrowerIncome
      ?.flatMap((b: any) => b.debts)
      ?.filter((debt: any) => debt.debtToBePaidOff === true)
      ?.reduce((sum: number, debt: any) => sum + (Number(debt.monthlyPayment) || 0), 0) ?? 0;

  const cashToClose = scenario.refinanceInfo?.loanAmount -
    Number(scenario.refinanceInfo?.currentLoanBalance || 0) -
    Number(scenario.loanProgram?.clearingCart || 0) -
    Number(totalDebtToBePaidOff || 0);
  const dti =
    totalBorrowerIncome === 0 ? 0 : ((totalMonthlyPayment + totalBorrowerPayment) / totalBorrowerIncome) * 100;
  const ltv = Number(scenario.refinanceInfo?.ltv || 0);

  return {
    principalAndInterest,
    propertyTaxMonthly: costs.propertyTaxMonthly,
    hazardInsuranceMonthly: costs.hazardInsuranceMonthly,
    hoaMonthly: costs.hoaMonthly,
    mortgageInsuranceMonthly,
    closingCosts: costs.closingCosts,
    totalPayment: totalMonthlyPayment,
    cashToClose,
    dti,
    ltv,
  };
}

export function getLtvLimit(borrower: Borrower) {
  switch (borrower.occupancy) {
    case "Investment":
      return 85;
    case "Second Home":
      return 90;
    default:
      return 97;
  }
}

export function scoreScenario(scenario: any, borrower: Borrower, firstScenario: any, goal: GoalId) {
  const metrics = getMetrics(scenario, borrower, firstScenario);
  let score = 0;
  if (goal === "lowestMonthlyPayment") score += metrics.totalPayment;
  if (goal === "lowestCashToCloseOrHighestCashToBorrower") score += metrics.cashToClose * -0.45; // ← negated
  score += scenario.refinanceInfo?.interestRate * 120;

  return score;
}

export function getRankedScenarios(scenarios: Scenario[], borrower: Borrower, goal: GoalId) {
  const firstScenario = scenarios[0];
  return [...scenarios]
    .map((scenario) => ({
      scenario,
      metrics: getMetrics(scenario, borrower, firstScenario),
      score: scoreScenario(scenario, borrower, firstScenario, goal),
    }))
    .sort((a, b) => a.score - b.score);
}
