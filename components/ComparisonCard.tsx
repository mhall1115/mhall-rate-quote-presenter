import React from 'react';
import type { Quote } from '../types';
import { useCalculations } from '../hooks/useCalculations';

interface ComparisonCardProps {
  quote: Quote;
  onUpdate: (quote: Quote) => void;
  onDelete: () => void;
  title: string;
  canDelete: boolean;
}

const formatCurrency = (value: number, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

const ComparisonInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, addon?: string }> = ({ label, addon, id, ...props }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-gray-400">{label}</label>
            <div className="mt-1 relative">
                 <input 
                    id={id}
                    className="w-full bg-white/10 border border-white/20 rounded-md py-1.5 px-3 text-white text-base font-semibold focus:border-aqua focus:ring-aqua transition-colors"
                    {...props}
                 />
                 {addon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{addon}</span>}
            </div>
        </div>
    )
}


export const ComparisonCard: React.FC<ComparisonCardProps> = ({ quote, onUpdate, onDelete, title, canDelete }) => {
  const calcs = useCalculations(quote);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...quote, [name]: value === '' ? 0 : parseFloat(value) });
  };

  return (
    <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-6 flex flex-col space-y-4 h-full">
      {canDelete && (
        <button onClick={onDelete} className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        </button>
      )}

      <h3 className="text-xl font-bold text-white">{title}</h3>

      {/* Editable Section */}
      <div className="space-y-3">
         <ComparisonInput 
            label="Interest Rate"
            name="InterestRate"
            id={`rate-${quote.id}`}
            type="number"
            step="0.001"
            value={quote.InterestRate}
            onChange={handleChange}
            addon="%"
         />
         <ComparisonInput 
            label="Discount Points ($)"
            name="DiscountPoints"
            id={`points-${quote.id}`}
            type="number"
            step="100"
            value={quote.DiscountPoints}
            onChange={handleChange}
            addon="$"
         />
          <ComparisonInput 
            label="Lender Credits ($)"
            name="LenderCredits"
            id={`credits-${quote.id}`}
            type="number"
            step="100"
            value={quote.LenderCredits}
            onChange={handleChange}
            addon="$"
         />
      </div>

      {/* Calculated Summary Section */}
      <div className="space-y-4 pt-4 border-t border-white/10 flex-grow flex flex-col">
         <div className="flex-grow space-y-2">
            <div>
                <p className="text-sm text-gray-400">Total Monthly Payment</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-brand-dark to-brand-light bg-clip-text text-transparent">{formatCurrency(calcs.TotalMonthlyPayment)}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">Estimated Cash to Close</p>
                <p className="text-2xl font-semibold text-gray-200">{formatCurrency(calcs.CashToClose)}</p>
            </div>
         </div>
         <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-white/10">
            <div className="flex justify-between"><span>P&I</span> <span>{formatCurrency(calcs.MonthlyPrincipalAndInterest, 2)}</span></div>
            <div className="flex justify-between"><span>Taxes & Ins</span> <span>{formatCurrency(calcs.MonthlyTaxes + calcs.MonthlyInsurance, 2)}</span></div>
            <div className="flex justify-between"><span>Down Payment</span> <span>{formatCurrency(calcs.DownPayment, 0)}</span></div>
            <div className="flex justify-between"><span>Closing Costs</span> <span>{formatCurrency(calcs.TotalClosingCosts, 0)}</span></div>
         </div>
      </div>
    </div>
  );
};
