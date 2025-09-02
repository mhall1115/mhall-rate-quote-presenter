

import React from 'react';
import type { Quote } from '../types';
import { useCalculations } from '../hooks/useCalculations';

interface BorrowerOptionCardProps {
  quote: Quote;
  title: string;
  isFeatured?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const formatCurrency = (value: number, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

const DetailRow: React.FC<{ label: string; value: string; isSubtle?: boolean }> = ({ label, value, isSubtle = false }) => (
    <div className={`flex justify-between items-baseline ${isSubtle ? 'text-xs' : 'text-sm'}`}>
        <span className={isSubtle ? 'text-gray-400' : 'text-gray-300'}>{label}</span>
        <span className={`font-medium ${isSubtle ? 'text-gray-400' : 'text-white'}`}>{value}</span>
    </div>
)

export const BorrowerOptionCard: React.FC<BorrowerOptionCardProps> = ({ quote, title, isFeatured = false, isSelected = false, onClick }) => {
  const calcs = useCalculations(quote);

  const cardClasses = `relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border shadow-2xl shadow-black/40 p-6 flex flex-col space-y-4 h-full transition-all duration-300 ${
      isSelected
        ? 'border-aqua shadow-aqua/40 animate-pulse-glow'
        : isFeatured
        ? 'border-brand'
        : 'border-white/10'
    } ${onClick ? 'cursor-pointer hover:border-aqua/70' : ''}`;

  return (
    <div className={cardClasses} onClick={onClick}>
       {isFeatured && !isSelected && (
        <div className="absolute top-0 right-4 -translate-y-1/2 bg-brand px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-full shadow-lg shadow-brand/30">
          Recommended
        </div>
      )}
      {isSelected && (
        <div className="absolute top-0 right-4 -translate-y-1/2 bg-aqua px-3 py-1 text-xs font-bold text-slate-900 uppercase tracking-wider rounded-full shadow-lg shadow-aqua/30">
          Selected
        </div>
      )}
      <h3 className="text-xl font-bold text-white text-center">{title}</h3>
      
      {/* Key Metrics */}
      <div className="space-y-4 pt-2">
         <div className="text-center">
            <p className="text-sm text-gray-400">Interest Rate</p>
            <p className="text-4xl font-bold text-white">{quote.InterestRate.toFixed(3)}%</p>
         </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/20 flex-grow flex flex-col">
         <div className="flex-grow space-y-3">
             <div>
                <p className="text-sm text-gray-400 text-center">Total Monthly Payment</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-brand-dark to-brand-light bg-clip-text text-transparent text-center">{formatCurrency(calcs.TotalMonthlyPayment)}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400 text-center">Estimated Cash to Close</p>
                <p className="text-2xl font-semibold text-gray-200 text-center">{formatCurrency(calcs.CashToClose)}</p>
            </div>
         </div>
         <div className="space-y-2 pt-4 border-t border-white/20">
            <DetailRow label="Monthly P&I" value={formatCurrency(calcs.MonthlyPrincipalAndInterest)} />
            <DetailRow label="Monthly Taxes & Ins." value={formatCurrency(calcs.MonthlyTaxes + calcs.MonthlyInsurance)} />
             {calcs.EstimatedMortgageInsurance > 0 && <DetailRow label="Monthly MI" value={formatCurrency(calcs.EstimatedMortgageInsurance)} />}
            <div className="pt-2" />
            <DetailRow label="Closing Costs" value={formatCurrency(calcs.TotalClosingCosts)} isSubtle/>
             <DetailRow label="Down Payment" value={formatCurrency(calcs.DownPayment)} isSubtle/>
             {quote.DiscountPoints > 0 && <DetailRow label="Discount Points" value={formatCurrency(quote.DiscountPoints)} isSubtle/>}
             {quote.LenderCredits > 0 && <DetailRow label="Lender Credits" value={`(${formatCurrency(quote.LenderCredits)})`} isSubtle/>}
         </div>
      </div>
    </div>
  );
};