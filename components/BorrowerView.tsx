
import React from 'react';
import type { Quote } from '../types';
import { Button } from './common/Button';
import { BorrowerOptionCard } from './BorrowerOptionCard';
import { ProgramType } from '../types';

interface BorrowerViewProps {
  quote: Quote;
  onBack: () => void;
  onReturnToEdit: () => void;
}

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div>
        <dt className="text-sm text-gray-400">{label}</dt>
        <dd className="font-semibold text-white">{value}</dd>
    </div>
);


export const BorrowerView: React.FC<BorrowerViewProps> = ({ quote, onBack, onReturnToEdit }) => {
    const scenariosToDisplay = quote.comparisonScenarios && quote.comparisonScenarios.length > 0
    ? quote.comparisonScenarios
    : [{
        id: 'default',
        InterestRate: quote.InterestRate,
        DiscountPoints: quote.DiscountPoints,
        LenderCredits: quote.LenderCredits,
    }];
    
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-float-in">
      <header className="flex flex-wrap gap-4 justify-between items-start px-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Your Mortgage Quote</h2>
          <p className="text-lg text-gray-400">Prepared for {quote.BorrowerName}</p>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <Button variant="secondary" onClick={onReturnToEdit}>Return to Editor</Button>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </header>
      
      <div className="bg-slate-900/40 backdrop-blur-lg border border-white/10 shadow-lg rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Loan Overview</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
             <InfoItem label="Program" value={`${quote.LoanTerm}-Year ${quote.LoanType}`} />
             <InfoItem label={quote.ProgramType === ProgramType.Purchase ? 'Purchase Price' : 'Property Value'} value={formatCurrency(quote.PurchasePrice)} />
             <InfoItem label="Loan Amount" value={formatCurrency(quote.LoanAmount)} />
             <InfoItem label="Program Type" value={quote.ProgramType} />
             {quote.ProgramType === ProgramType.Refinance && <InfoItem label="Refinance Type" value={quote.RefiType || 'N/A'} />}
             <InfoItem label="Property Address" value={quote.PropertyAddress} />
        </dl>
      </div>

      <div className="flex items-stretch gap-8 pb-4 -mx-4 px-4 overflow-x-auto">
        {scenariosToDisplay.map((scenario, index) => {
            const scenarioQuote = { ...quote, ...scenario };
            return (
                 <div key={scenario.id} className="w-[22rem] flex-shrink-0">
                    <BorrowerOptionCard 
                        quote={scenarioQuote} 
                        title={`Option ${index + 1}`} 
                        isFeatured={index === 0}
                    />
                 </div>
            )
        })}
      </div>
       <footer className="text-center text-xs text-gray-500 pt-4">
            <p>This is an estimate and not a commitment to lend. Rates, payments, and closing costs are estimates and are subject to change.</p>
            <p>Your actual rate, payment, and costs could be higher. Get an official Loan Estimate before choosing a loan.</p>
        </footer>
    </div>
  );
};
