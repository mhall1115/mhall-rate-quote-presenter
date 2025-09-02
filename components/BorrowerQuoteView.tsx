

import React, { useState } from 'react';
import type { Quote } from '../types';
import { Button } from './common/Button';
import { BorrowerOptionCard } from './BorrowerOptionCard';
import { ProgramType } from '../types';
import { Card } from './common/Card';
import { ScenarioBreakdownModal } from './QuoteSummary';
import { ChatBox } from './ChatBox';
import { User } from '../hooks/useUsers';
import { useChatNotifications } from '../hooks/useChatNotifications';


interface BorrowerQuoteViewProps {
  quote: Quote;
  user: User;
  onBack: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div>
        <dt className="text-sm text-gray-400">{label}</dt>
        <dd className="font-semibold text-white">{value}</dd>
    </div>
);

export const BorrowerQuoteView: React.FC<BorrowerQuoteViewProps> = ({ quote, user, onBack, onSelectScenario }) => {
    const [modalScenario, setModalScenario] = useState<Quote | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { hasUnread, markAsRead } = useChatNotifications(user);


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

    const openChat = () => {
        markAsRead(quote.id);
        setIsChatOpen(true);
    }


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-float-in">
      <header className="flex flex-wrap gap-4 justify-between items-start px-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Your Mortgage Quote</h2>
          <p className="text-lg text-gray-400">Prepared for {quote.BorrowerName}</p>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
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
                        isSelected={quote.selectedScenarioId === scenario.id}
                        onClick={() => setModalScenario(scenarioQuote)}
                    />
                 </div>
            )
        })}
      </div>

       <footer className="text-center text-xs text-gray-500 pt-4">
            <p>This is an estimate and not a commitment to lend. Rates, payments, and closing costs are estimates and are subject to change.</p>
            <p>Your actual rate, payment, and costs could be higher. Get an official Loan Estimate before choosing a loan.</p>
        </footer>

        {modalScenario && (
            <ScenarioBreakdownModal 
                quote={modalScenario}
                onClose={() => setModalScenario(null)}
                onSelect={() => {
                    if (modalScenario && 'id' in modalScenario) {
                        onSelectScenario(modalScenario.id);
                    }
                    setModalScenario(null);
                }}
            />
        )}

        <div className="fixed bottom-6 right-6 z-40">
            <Button 
                onClick={openChat}
                className="rounded-full h-16 w-16 shadow-lg shadow-brand/40 relative"
                aria-label="Open chat"
            >
                {hasUnread(quote.id) && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-aqua"></span>
                    </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.903 8.903 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.416 14.532l.028.017a6.94 6.94 0 003.556.953 7.003 7.003 0 007-7c0-2.897-2.703-5-6-5s-6 2.103-6 5c0 1.39.525 2.665 1.38 3.655l.027.033.033.027z" clipRule="evenodd" />
                </svg>
            </Button>
        </div>

        {isChatOpen && (
            <ChatBox 
                quoteId={quote.id}
                user={user}
                onClose={() => setIsChatOpen(false)}
                loanOfficerEmail={quote.loEmail}
            />
        )}
    </div>
  );
};
