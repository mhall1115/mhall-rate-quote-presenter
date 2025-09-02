
import { useMemo } from 'react';
import type { Quote } from '../types';
import { LoanType, ProgramType } from '../types';

export interface CalculatedValues {
  MonthlyPrincipalAndInterest: number;
  MonthlyTaxes: number;
  MonthlyInsurance: number;
  EstimatedMortgageInsurance: number;
  TotalMonthlyPayment: number;
  TotalClosingCosts: number;
  DownPayment: number;
  CashToClose: number;
  LTV: number;
}

export interface AmortizationEntry {
  month: number;
  interest: number;
  principal: number;
  remainingBalance: number;
}


export const calculateQuoteMetrics = (quote: Quote | Partial<Quote> | null): CalculatedValues => {
    const loanAmount = quote?.LoanAmount ?? 0;
    const interestRate = quote?.InterestRate ?? 0;
    const loanTerm = quote?.LoanTerm ?? 30;
    const purchasePrice = quote?.PurchasePrice ?? 0;
    const taxRate = quote?.TaxRate ?? 0;
    const insuranceRate = quote?.InsuranceRate ?? 0;
    const loanType = quote?.LoanType ?? LoanType.Conv;
    const programType = quote?.ProgramType ?? ProgramType.Purchase;

    // P&I
    const monthlyInterestRate = interestRate / 1200;
    const numberOfPayments = loanTerm * 12;
    let MonthlyPrincipalAndInterest = 0;
    if (monthlyInterestRate > 0) {
      MonthlyPrincipalAndInterest =
        (loanAmount * monthlyInterestRate) /
        (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    } else {
       MonthlyPrincipalAndInterest = loanAmount / numberOfPayments;
    }

    // Taxes & Insurance
    const MonthlyTaxes = (purchasePrice * (taxRate / 100)) / 12;
    const MonthlyInsurance = (purchasePrice * (insuranceRate / 100)) / 12;

    // LTV & MI
    const LTV = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;
    let EstimatedMortgageInsurance = 0;
    if (loanType === LoanType.Conv && LTV > 80) {
      EstimatedMortgageInsurance = (loanAmount * 0.005) / 12; // Simplified 0.5% annual PMI
    }
     // Note: FHA MIP would be calculated differently, this is a simplified example.

    // Total Payment
    const TotalMonthlyPayment =
      MonthlyPrincipalAndInterest +
      MonthlyTaxes +
      MonthlyInsurance +
      EstimatedMortgageInsurance;

    // Closing Costs
    const TotalClosingCosts =
      (quote?.LenderFees ?? 0) +
      (quote?.TitleFees ?? 0) +
      (quote?.EscrowFees ?? 0) +
      (quote?.AppraisalFee ?? 0) +
      (quote?.CreditReportFee ?? 0) +
      (quote?.RecordingFee ?? 0) +
      (quote?.TransferTax ?? 0) +
      (quote?.Prepaids ?? 0) +
      (quote?.DiscountPoints ?? 0) -
      (quote?.LenderCredits ?? 0);
      
    // Cash to Close
    const DownPayment = programType === ProgramType.Purchase && purchasePrice > loanAmount ? purchasePrice - loanAmount : 0;
    const CashToClose = DownPayment + TotalClosingCosts;

    const format = (num: number) => (isNaN(num) || !isFinite(num) ? 0 : num);

    return {
      MonthlyPrincipalAndInterest: format(MonthlyPrincipalAndInterest),
      MonthlyTaxes: format(MonthlyTaxes),
      MonthlyInsurance: format(MonthlyInsurance),
      EstimatedMortgageInsurance: format(EstimatedMortgageInsurance),
      TotalMonthlyPayment: format(TotalMonthlyPayment),
      TotalClosingCosts: format(TotalClosingCosts),
      DownPayment: format(DownPayment),
      CashToClose: format(CashToClose),
      LTV: format(LTV),
    };
};


export const useCalculations = (quote: Quote | Partial<Quote> | null): CalculatedValues => {
  const calculations = useMemo(() => calculateQuoteMetrics(quote), [quote]);
  return calculations;
};

export const generateAmortizationSchedule = (quote: Quote | Partial<Quote> | null): AmortizationEntry[] => {
    const loanAmount = quote?.LoanAmount ?? 0;
    const interestRate = quote?.InterestRate ?? 0;
    const loanTerm = quote?.LoanTerm ?? 30;

    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) {
        return [];
    }

    const monthlyInterestRate = interestRate / 1200;
    const numberOfPayments = loanTerm * 12;
    let monthlyPayment = 0;
    if (monthlyInterestRate > 0) {
      monthlyPayment =
        (loanAmount * monthlyInterestRate) /
        (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    } else {
       monthlyPayment = loanAmount / numberOfPayments;
    }

    if (!isFinite(monthlyPayment) || monthlyPayment <= 0) return [];
    
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = loanAmount;

    for (let i = 1; i <= numberOfPayments; i++) {
        const interestForMonth = remainingBalance * monthlyInterestRate;
        let principalForMonth = monthlyPayment - interestForMonth;
        
        if (remainingBalance < principalForMonth) {
            principalForMonth = remainingBalance;
        }
        
        remainingBalance -= principalForMonth;

        if (remainingBalance < 0) {
            remainingBalance = 0;
        }

        schedule.push({
            month: i,
            interest: interestForMonth,
            principal: principalForMonth,
            remainingBalance,
        });
        
        if (remainingBalance === 0) break;
    }

    return schedule;
}