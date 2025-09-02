


import React from 'react';
import type { Quote } from '../types';
import { useCalculations } from '../hooks/useCalculations';
import { Button } from './common/Button';
import { CsvUploader } from './CsvUploader';
import { useChatNotifications } from '../hooks/useChatNotifications';
import { User } from '../hooks/useUsers';


interface QuoteListProps {
  quotes: Quote[];
  user: User;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCsvUpload: (newQuotes: Omit<Quote, 'id'>[]) => void;
  onNewQuote: () => void;
  onOpenChat: (id: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const QuoteListItem: React.FC<{
  quote: Quote,
  user: User,
  hasUnread: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenChat: (id: string) => void;
}> = ({ quote, user, hasUnread, onSelect, onEdit, onDelete, onOpenChat }) => {
    const calcs = useCalculations(quote);
    const selectedScenario = quote.selectedScenarioId
    ? quote.comparisonScenarios?.find(s => s.id === quote.selectedScenarioId)
    : null;

    return (
        <div className="bg-slate-900/40 backdrop-blur-lg border border-white/10 shadow-lg rounded-xl transition-all duration-300 hover:border-white/20 hover:bg-slate-900/60 animate-float-in">
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <div className="col-span-1">
                  <p className="font-bold text-white truncate">{quote.BorrowerName}</p>
                  <p className="text-sm text-gray-400 truncate">{quote.PropertyAddress}</p>
              </div>
              <div className="col-span-1">
                  <p className="text-sm text-gray-400">Monthly Payment</p>
                  <p className="font-semibold text-white">{formatCurrency(calcs.TotalMonthlyPayment)}</p>
              </div>
              <div className="col-span-1">
                {selectedScenario ? (
                     <div>
                        <p className="text-sm text-green-400 font-semibold flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                           Borrower Selected
                        </p>
                        <p className="font-semibold text-white">{selectedScenario.InterestRate.toFixed(3)}% Rate</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-400">Cash to Close</p>
                        <p className="font-semibold text-white">{formatCurrency(calcs.CashToClose)}</p>
                    </>
                )}
              </div>
              <div className="col-span-1 flex justify-end items-center space-x-2">
                   <Button variant="secondary" onClick={() => onOpenChat(quote.id)} className="p-2 relative" aria-label="Open chat">
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-aqua"></span>
                            </span>
                        )}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.903 8.903 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.416 14.532l.028.017a6.94 6.94 0 003.556.953 7.003 7.003 0 007-7c0-2.897-2.703-5-6-5s-6 2.103-6 5c0 1.39.525 2.665 1.38 3.655l.027.033.033.027z" clipRule="evenodd" />
                        </svg>
                   </Button>
                   <Button variant="secondary" onClick={() => onEdit(quote.id)}>Edit</Button>
                   <Button variant="primary" onClick={() => onSelect(quote.id)}>View</Button>
                   <Button variant="danger" onClick={() => onDelete(quote.id)}>Delete</Button>
              </div>
          </div>
        </div>
    )
}

export const QuoteList: React.FC<QuoteListProps> = ({ quotes, user, onSelect, onEdit, onDelete, onCsvUpload, onNewQuote, onOpenChat }) => {
  const { statuses, hasUnread } = useChatNotifications(user);

  if (quotes.length === 0) {
      return (
          <div className="text-center py-20 animate-float-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-200">No quotes yet</h3>
              <p className="mt-1 text-sm text-gray-400">Get started by creating a new quote or uploading a CSV.</p>
              <div className="mt-6">
                  <Button onClick={onNewQuote}>Create New Quote</Button>
              </div>
              <div className="mt-8 max-w-md mx-auto">
                <CsvUploader onUpload={onCsvUpload} />
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
        <div className="max-w-md">
           <CsvUploader onUpload={onCsvUpload} />
        </div>
        <div className="space-y-4">
           {quotes.map(quote => (
               <QuoteListItem 
                key={quote.id} 
                quote={quote} 
                user={user}
                hasUnread={hasUnread(quote.id)}
                onSelect={onSelect} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onOpenChat={onOpenChat}/>
           ))}
        </div>
    </div>
  );
};