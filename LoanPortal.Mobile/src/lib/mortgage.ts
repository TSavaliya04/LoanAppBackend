import type { Borrower, GoalId, Scenario } from "./scenario-data";

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function getScenarioCosts(scenario: any, borrower: Borrower) {
  return {
    propertyTaxMonthly: scenario.loanProgram?.monthlyPropertyTax ?? Math.round((scenario.purchaseInfo?.purchasePrice * 0.0125) / 12),
    hazardInsuranceMonthly: scenario.purchaseInfo?.hazardInsurance ?? 350,
    hoaMonthly: scenario.purchaseInfo?.associationFee ?? 0,
    closingCosts: scenario.loanProgram.clearingCart ?? 0,
  };
}

export function getMetrics(scenario: any, borrower: Borrower, firstScenario: any) {
  const purchasePrice = scenario.purchaseInfo?.purchasePrice;
  const downPayment = purchasePrice * (scenario.purchaseInfo?.downPayment / 100);
  const earnestMoneyDeposit = scenario?.miscFees?.earnestMoneyDeposit;
  const sellerCredit = scenario?.miscFees?.sellerCredit;
  const lenderCredit = scenario?.miscFees?.lenderCredit;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = scenario.purchaseInfo?.annualInterestRate / 100 / 12;
  const months = scenario.loanProgram.term * 12;
  const costs = getScenarioCosts(scenario, borrower);
  const principalAndInterest = scenario.loanProgram.principalAndInterest;
  const annualMiRate = scenario.purchaseInfo?.mipFundingFee;
  const mortgageInsuranceMonthly = scenario.purchaseInfo?.miPercent;
  const totalMonthlyPayment =
    principalAndInterest +
    costs.propertyTaxMonthly +
    costs.hazardInsuranceMonthly +
    costs.hoaMonthly +
    mortgageInsuranceMonthly;
  const cashToClose = downPayment + costs.closingCosts - (Number(earnestMoneyDeposit) + Number(sellerCredit) + Number(lenderCredit));
  let totalBorrowerIncome = 0;
  let totalBorrowerPayment = 0;
  const borrowerIncome = firstScenario.borrowersIncomeData?.borrowerIncome;
  borrowerIncome?.forEach((borrower: any) => {
    totalBorrowerIncome += Number(borrower.monthlyIncome) || 0;
    borrower?.debts?.forEach((debt: any) => {
      totalBorrowerPayment += Number(debt.monthlyPayment) || 0;
    });
  });
  const dti =
    totalBorrowerIncome === 0 ? 0 : ((totalMonthlyPayment + totalBorrowerPayment) / totalBorrowerIncome) * 100;
  const ltv = purchasePrice === 0 ? 0 : (loanAmount / purchasePrice) * 100;

  return {
    downPayment,
    loanAmount,
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
  if (goal === "lowestDownPayment") score += metrics.downPayment * 0.7;
  if (goal === "lowestCashToClose") score += metrics.cashToClose * 0.45;
  score += scenario.purchaseInfo?.annualInterestRate * 120;

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
