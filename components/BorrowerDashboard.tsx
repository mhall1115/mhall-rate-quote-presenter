
import React from 'react';
import type { Quote } from '../types';
import { Card } from './common/Card';

interface BorrowerDashboardProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({ quotes, onSelectQuote }) => {
  if (quotes.length === 0) {
    return (
      <div className="text-center py-20 animate-float-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01M9 14h6" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-200">No quotes found.</h3>
        <p className="mt-1 text-sm text-gray-400">Your Loan Officer has not prepared any quotes for you yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-float-in">
      <h2 className="text-3xl font-bold text-white tracking-tight">Your Quotes</h2>
      <div className="space-y-4">
        {quotes.map(quote => (
          <Card key={quote.id} className="cursor-pointer hover:border-brand transition-colors" onClick={() => onSelectQuote(quote)}>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <p className="font-bold text-white">{quote.PropertyAddress || 'No Address Provided'}</p>
                    <p className="text-sm text-gray-400">Prepared on {new Date(quote.id.split('+')[0]).toLocaleDateString()}</p>
                </div>
                <div>
                    {quote.selectedScenarioId ? (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300">Selection Made</span>
                    ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300">Action Required</span>
                    )}
                </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
