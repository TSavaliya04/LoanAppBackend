import { usePreApprovalIndexStore } from "@/store/usePreApprovalStore";

export function usePreApprovalCalculations(index: number, values: any) {
  console.log("calculation called");
  
  // const borrowerNameStore = usePreApprovalIndexStore(
  //   (state) => state.ratios[index]?.borrowerName
  // );
  // const ficoScoreStore = usePreApprovalIndexStore(
  //   (state) => state.ratios[index]?.ficoScore
  // );
  // const setMonthlyIncome = usePreApprovalIndexStore(
  //   (state) => state.setMonthlyIncome
  // );
  // const setBackEndRatio = usePreApprovalIndexStore(
  //   (state) => state.setBackEndRatio
  // );
  let SVficoScore = 0;
  let SVborrowerName = "";
  let SVcalculatedAnnualMIPRate = 0;
  let SVcalcmiPercent = 0;
  let SVloanAmount = 0;
  let SVprepaidItemshazardInsurance = 0;
  let SVloanProgramhazardInsurance = 0;
  let SVloanOriginationFee = 0;
  let SVdiscountFee = 0;
  let SVupfrontMip = 0;
  let SVclosingCosts = 0;
  let SVpropertyTaxAmount = 0;
  let SVpropertyTaxMonths = 0;
  let SVpropertyTax = 0;
  let SVmonthlyPropertyTax = 0;
  let SVprepaidInterestAmount = 0;
  let SVhazardInsuranceReserves = 0;
  let SVborrowers = [];
  let SVupfrontMipPercentage = 0;
  let SVfrontEndRatio = 0;
  let SVbackEndRatio = 0;
  let SVdownPaymentAmount = 0;
  let SVbaseLoanAmount = 0;
  let SVupmipAmount = 0;
  let SVfinalLoanAmount = 0;
  let SVmmi = 0;
  let SVtotalNeededToClear = 0;
  let SVprincipalAndInterest = 0;
  let SVmortgageInsurance = 0;
  let SVmonthlyTotal = 0;

  const ficoScore =
    values?.borrowersIncomeData?.borrowerIncome?.[0]?.ficoScore;
  const borrowerName =
    values?.borrowersIncomeData?.borrowerIncome?.[0]?.borrowerName;
  // if (ficoScoreStore == null) {
    SVficoScore = ficoScore === "" ? undefined : ficoScore;
  // }
  // if (borrowerNameStore == "") {
    SVborrowerName = borrowerName.trim();
  // }

  const loanProgram = values?.purchaseInfo?.loanProgram;
  const purchasePrice = values?.purchaseInfo?.purchasePrice;
  const downPayment = values?.purchaseInfo?.downPayment;
  //   const annualInterestRate = values?.purchaseInfo?.annualInterestRate;
  const hazardInsurance = values?.purchaseInfo?.hazardInsurance;
  const mipFundingFee = values?.purchaseInfo?.mipFundingFee;

  const downPaymentAmount = (purchasePrice * downPayment) / 100;
  const loanAmount = purchasePrice - downPaymentAmount;
  const ltv = (loanAmount / purchasePrice) * 100;
  let calculatedAnnualMIPRate = 0;

  let calcmiPercent = 0;
  if (loanProgram == "3") {
    if (loanAmount <= 726200) {
      if (ltv <= 90) {
        calculatedAnnualMIPRate = 0.5; // 50 bps
      } else if (ltv > 90 && ltv <= 95) {
        calculatedAnnualMIPRate = 0.55; // 55 bps
      } else if (ltv > 95) {
        calculatedAnnualMIPRate = 0.55; // 55 bps
      }
    } else {
      if (ltv <= 90) {
        calculatedAnnualMIPRate = 0.7; // 70 bps
      } else if (ltv > 90 && ltv <= 95) {
        calculatedAnnualMIPRate = 0.7; // 70 bps
      } else if (ltv > 95) {
        calculatedAnnualMIPRate = 0.75; // 75 bps
      }
    }
  } else {
    calculatedAnnualMIPRate = mipFundingFee || 0;
  }
  calcmiPercent = Math.round((loanAmount * calculatedAnnualMIPRate) / 100 / 12);
  SVcalculatedAnnualMIPRate = calculatedAnnualMIPRate;
  SVcalcmiPercent = calcmiPercent;
  SVloanAmount = loanAmount;

  if (hazardInsurance > 0) {
    SVprepaidItemshazardInsurance = (hazardInsurance * 12);
    SVloanProgramhazardInsurance = hazardInsurance;
  }

  const loanOriginationFeePercentage =
    values?.lenderFees?.loanOriginationFeePercentage;
  const discountFeePercentage = values?.lenderFees?.discountFeePercentage;
  const upfrontMipPercentage = values?.lenderFees?.upfrontMipPercentage;

  if (loanAmount > 0) {
    const loanOriginationFee = Math.round(
      (loanOriginationFeePercentage / 100) * loanAmount
    );
    const discountFee = Math.round((discountFeePercentage / 100) * loanAmount);
    const upfrontMip = Math.round((upfrontMipPercentage / 100) * loanAmount);

    SVloanOriginationFee = loanOriginationFee;
    SVdiscountFee = discountFee;
    SVupfrontMip = upfrontMip;
  }

  const appraisalFee = values?.lenderFees?.appraisalFee;
  const prepaidInterestAmount =
    values?.prepaidItems?.prepaidInterestAmount;
  const prepaidHazardInsurance = values?.prepaidItems?.hazardInsurance;
  const hazardInsuranceReserves =
    values?.prepaidItems?.hazardInsuranceReserves;
  const propertyTaxAmount = values?.prepaidItems?.propertyTaxAmount;
  const escrowFees = values?.lenderFees?.escrowFees;
  const titleFees = values?.lenderFees?.titleFees;
  const thirdPartyLenderFee = values?.lenderFees?.thirdPartyLenderFee;

  const closingCosts =
    SVloanOriginationFee +
    SVdiscountFee +
    // upfrontMip +
    appraisalFee +
    prepaidInterestAmount +
    prepaidHazardInsurance +
    hazardInsuranceReserves +
    propertyTaxAmount +
    escrowFees +
    titleFees +
    thirdPartyLenderFee;

  SVclosingCosts = Math.round(closingCosts);

  const annualInterestRate = values?.purchaseInfo?.annualInterestRate;
  const prepaidInterestDays = values?.prepaidItems?.prepaidInterestDays;
  const hazardInsuranceMonths =
    values?.prepaidItems?.hazardInsuranceMonths;
  const propertyTaxMonths = values?.prepaidItems?.propertyTaxMonths;
  const monthlyPropertyTaxPercentage =
    values?.loanProgram?.monthlyPropertyTaxPercentage;

  if (purchasePrice > 0 && propertyTaxMonths > 0) {
    const months =
      propertyTaxMonths && propertyTaxMonths > 0 ? propertyTaxMonths : 12;
    const topLevelPropertyTax =
      (purchasePrice * (monthlyPropertyTaxPercentage / 100)) / 12;
    const calPropertyTaxAmount = Math.round(topLevelPropertyTax * months);
    const propertyTax = Math.round(calPropertyTaxAmount);
    SVpropertyTaxAmount = propertyTax;
    SVpropertyTaxMonths = months;
    SVpropertyTax = propertyTax;
    SVmonthlyPropertyTax = Math.round(topLevelPropertyTax);
  } else {
    SVpropertyTaxAmount = 0;
  }

  if (
    typeof loanAmount === "number" &&
    typeof annualInterestRate === "number" &&
    typeof prepaidInterestDays === "number"
  ) {
    const interest =
      ((loanAmount * (annualInterestRate / 100)) / 365) * prepaidInterestDays;
    SVprepaidInterestAmount = Math.round(interest);
  }

  const reserve = hazardInsurance * hazardInsuranceMonths;
  SVhazardInsuranceReserves = parseFloat(reserve.toFixed(2));

  const borrowerIncome = values?.borrowersIncomeData?.borrowerIncome;
  const principalAndInterest = values?.loanProgram?.principalAndInterest;
  const propertyTax = values?.loanProgram?.propertyTax;
  //   const mortgageInsurance = values?.loanProgram?.mortgageInsurance;
  const mortgageInsurance = values?.purchaseInfo?.miPercent;
  const associationFee = values?.purchaseInfo?.associationFee;

  let totalIncome = 0;
  let totalPayment = 0;
  borrowerIncome?.forEach((borrower: any) => {
    totalIncome += Number(borrower.monthlyIncome) || 0;
    borrower?.debts?.forEach((debt: any) => {
      totalPayment += Number(debt.monthlyPayment) || 0;
    });
  });
  // setMonthlyIncome(index, totalIncome);

  if (borrowerIncome) {
    const loanProgramBorrowers = borrowerIncome.map((borrower: any) => {
      const totalDebts = borrower.debts?.reduce(
        (sum: any, debt: any) => sum + (Number(debt.monthlyPayment) || 0),
        0
      );

      return {
        monthlyIncome: Number(borrower.monthlyIncome) || 0,
        debts: totalDebts,
        ficoScore: borrower.ficoScore,
      };
    });
    SVborrowers = loanProgramBorrowers;
  }

  const upmipRate = values?.lenderFees?.upfrontMipPercentage;
  const earnestMoneyDeposit = values?.miscFees?.earnestMoneyDeposit;
  const sellerCredit = values?.miscFees?.sellerCredit;
  const lenderCredit = values?.miscFees?.lenderCredit;
  const miscFee4 = values?.miscFees?.miscFee4;
  const annualMIPRate = values?.loanProgram?.annualMIPRate;
  const interestRate = values?.purchaseInfo?.annualInterestRate;
  const term = values?.loanProgram?.term;

  const upmipAmount = loanAmount * (upmipRate / 100);
  const finalLoanAmount = loanAmount + upmipAmount;

  const totalNeededToClear =
    downPaymentAmount +
    closingCosts -
    (earnestMoneyDeposit + sellerCredit + lenderCredit + miscFee4);

  const calmmi = (loanAmount * (annualMIPRate / 100)) / 12;

  const P = finalLoanAmount;
  const r = interestRate / 100 / 12;
  const n = term * 12;

  const monthlyPI =
    r === 0 ? P / n : (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  let associationFeeAmount = 0;
  if (associationFee) {
    associationFeeAmount = associationFee;
  }

  const monthlyTotal =
    monthlyPI +
    SVmonthlyPropertyTax +
    hazardInsurance +
    mortgageInsurance +
    associationFeeAmount;

  const calcPrincipalAndInterest = isNaN(monthlyPI) ? 0 : +monthlyPI.toFixed(2);
  const calMortgageInsurance = isNaN(mortgageInsurance)
    ? 0
    : +mortgageInsurance.toFixed(2);

  const monthlyHousingExpenses =
    calcPrincipalAndInterest +
    SVmonthlyPropertyTax +
    calMortgageInsurance +
    associationFee;

  const ratioBack = parseFloat(
    (((monthlyHousingExpenses + totalPayment) / totalIncome) * 100).toFixed(2)
  );
  // setBackEndRatio(index, ratioBack);

  const calculatedFrontEndRatio =
    totalIncome > 0
      ? parseFloat(((monthlyHousingExpenses / totalIncome) * 100).toFixed(2))
      : 0;

  const frontEnd = !isFinite(calculatedFrontEndRatio)
    ? 0
    : calculatedFrontEndRatio;

  // usePreApprovalIndexStore.getState().setFrontEndRatio(index, frontEnd);

  let calculatedBackEndRatio = 0;

  calculatedBackEndRatio = Number(
    (((monthlyHousingExpenses + totalPayment) / totalIncome) * 100).toFixed(2)
  );

  const backEnd = !isFinite(calculatedBackEndRatio)
    ? 0
    : calculatedBackEndRatio;

  // usePreApprovalIndexStore.getState().setBackEndRatio(index, backEnd);

  if (loanProgram !== "3") {
    SVupfrontMipPercentage = 0;
  } else {
    SVupfrontMipPercentage = 1.75;
  }

  SVfrontEndRatio = frontEnd;
  SVbackEndRatio = backEnd;
  SVdownPaymentAmount = isNaN(downPaymentAmount)
    ? 0
    : +downPaymentAmount.toFixed(2);
  SVbaseLoanAmount = isNaN(loanAmount) ? 0 : +loanAmount.toFixed(2);
  SVupmipAmount = isNaN(upmipAmount) ? 0 : +upmipAmount.toFixed(2);
  SVfinalLoanAmount = isNaN(finalLoanAmount) ? 0 : +finalLoanAmount.toFixed(2);
  SVmmi = isNaN(calmmi) ? 0 : +calmmi.toFixed(2);
  SVtotalNeededToClear = isNaN(totalNeededToClear) ? 0 : +totalNeededToClear;
  SVprincipalAndInterest = isNaN(monthlyPI) ? 0 : +monthlyPI.toFixed(0);
  SVmortgageInsurance = isNaN(mortgageInsurance)
    ? 0
    : +mortgageInsurance.toFixed(0);
  SVmonthlyTotal = isNaN(monthlyTotal) ? 0 : +monthlyTotal.toFixed(0);

  return {
    purchaseInfo: {
      mipFundingFee: SVcalculatedAnnualMIPRate,
      miPercent: SVcalcmiPercent,
      loanAmount: SVloanAmount,
    },
    lenderFees: {
      loanOriginationFee: SVloanOriginationFee,
      discountFee: SVdiscountFee,
      upfrontMipPercentage: SVupfrontMipPercentage,
      upfrontMip: SVupfrontMip,
    },
    prepaidItems: {
      propertyTaxAmount: SVpropertyTaxAmount,
      propertyTaxMonths: SVpropertyTaxMonths,
      hazardInsurance: SVprepaidItemshazardInsurance,
      prepaidInterestAmount: SVprepaidInterestAmount,
      hazardInsuranceReserves: SVhazardInsuranceReserves,
    },
    borrowersIncomeData: {
      borrowerIncome: [
        {
          borrowerName: SVborrowerName,
          ficoScore: SVficoScore,
        },
      ],
    },
    loanProgram: {
      frontEndRatio: SVfrontEndRatio,
      backEndRatio: SVbackEndRatio,
      downPaymentAmount: SVdownPaymentAmount,
      baseLoanAmount: SVbaseLoanAmount,
      finalLoanAmount: SVfinalLoanAmount,
      mmi: SVmmi,
      totalNeededToClear: SVtotalNeededToClear,
      upmipAmount: SVupmipAmount,
      principalAndInterest: SVprincipalAndInterest,
      mortgageInsurance: SVmortgageInsurance,
      monthlyTotal: SVmonthlyTotal,
      clearingCart: SVclosingCosts,
      propertyTax: SVpropertyTax,
      monthlyPropertyTax: SVmonthlyPropertyTax,
      borrowers: SVborrowers,
      hazardInsurance: SVloanProgramhazardInsurance
    },
  };
}
