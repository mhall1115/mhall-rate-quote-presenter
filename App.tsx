


import React, { useState, useEffect } from 'react';
import type { Quote, Scenario } from './types';
import Header from './components/Header';
import { QuoteList } from './components/QuoteList';
import { QuoteForm } from './components/QuoteForm';
import { QuoteComparison } from './components/QuoteComparison';
import { useQuotes } from './hooks/useQuotes';
import { useUsers, User } from './hooks/useUsers';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BorrowerView } from './components/BorrowerView';
import { BorrowerDashboard } from './components/BorrowerDashboard';
import { BorrowerQuoteView } from './components/BorrowerQuoteView';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { QuoteTypeModal } from './components/QuoteTypeModal';

type View = 'list' | 'form' | 'summary' | 'borrowerView';

const CURRENT_USER_KEY = 'mortgageAppCurrentUser';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { users, addUser, deleteUser, findUser, validatePassword } = useUsers();

  // State for Loan Officer view
  const { quotes, addQuote, addMultipleQuotes, updateQuote, deleteQuote, getQuoteById, isLoaded } = useQuotes(user);
  const [view, setView] = useState<View>('list');
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [chatQuoteId, setChatQuoteId] = useState<string | null>(null);
  const [isQuoteTypeModalOpen, setIsQuoteTypeModalOpen] = useState(false);
  const [quoteMode, setQuoteMode] = useState<'quick' | 'full'>('full');


  // New state for borrower flow
  const [borrowerQuotes, setBorrowerQuotes] = useState<Quote[]>([]);
  const [activeBorrowerQuoteId, setActiveBorrowerQuoteId] = useState<string | null>(null);

  useEffect(() => {
    // Check for a logged-in user session on initial load
    try {
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Verify the user still exists in our user list
        if (findUser(parsedUser.email)) {
            setUser(parsedUser);
            // If the user is a borrower, pre-load their quotes
            if (parsedUser.role === 'borrower') {
              const allQuotes = getAllQuotesFromStorage();
              const quotesForBorrower = allQuotes.filter(q => q.BorrowerEmail?.toLowerCase() === parsedUser.email.toLowerCase());
              setBorrowerQuotes(quotesForBorrower);
            }
        } else {
            // The user was deleted, so log them out.
             localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
    } catch (e) {
      console.error('Could not parse user from localStorage', e);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, []); // Ran once on init. `users` dependency not needed.
  
  const getAllQuotesFromStorage = (): Quote[] => {
    let allQuotes: Quote[] = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('mortgageQuotes_')) {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                try {
                    const quotesInList = JSON.parse(storedData);
                    allQuotes.push(...quotesInList);
                } catch (e) {
                    console.error(`Could not parse quotes from ${key}`, e);
                }
            }
        }
    });
    return allQuotes;
  };

  const handleSignIn = ({ email, password }: any) => {
    setAuthError(null);
    const foundUser = findUser(email);
    if (foundUser && validatePassword(foundUser, password)) {
        setUser(foundUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
         if (foundUser.role === 'borrower') {
            const allQuotes = getAllQuotesFromStorage();
            const quotesForBorrower = allQuotes.filter(q => q.BorrowerEmail?.toLowerCase() === foundUser.email.toLowerCase());
            setBorrowerQuotes(quotesForBorrower);
            setActiveBorrowerQuoteId(null);
        }
    } else {
        setAuthError('Invalid email or password.');
    }
  };
  
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    // Reset app state on sign out
    setView('list');
    setActiveQuoteId(null);
    setBorrowerQuotes([]);
    setActiveBorrowerQuoteId(null);
    setChatQuoteId(null);
  };

  const handleNavigate = (targetView: 'list' | 'form') => {
    if (targetView === 'form') {
      // Intercept navigation to form and show type selection modal instead
      handleNewQuote();
    } else {
      setActiveQuoteId(null);
      setView(targetView);
    }
  };

  const handleSelectQuote = (id: string) => {
    setActiveQuoteId(id);
    setView('summary');
  };

  const handleEditQuote = (id: string) => {
    setActiveQuoteId(id);
    setView('form');
  };
  
  const handleNewQuote = () => {
    setActiveQuoteId(null);
    setIsQuoteTypeModalOpen(true);
  };
  
  const handleSelectQuoteType = (type: 'quick' | 'full') => {
    setQuoteMode(type);
    setView('form');
    setIsQuoteTypeModalOpen(false);
  };

  const handleDeleteQuote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      deleteQuote(id);
      if (activeQuoteId === id) {
          setView('list');
          setActiveQuoteId(null);
      }
    }
  };

  const handleSaveQuote = (quoteData: Quote | Omit<Quote, 'id'>) => {
    let savedQuote: Quote;
    if ('id' in quoteData) {
      updateQuote(quoteData);
      savedQuote = quoteData;
    } else {
      const newQuote = addQuote(quoteData);
      savedQuote = newQuote;
    }
    
    // After quote is saved, check if we need to create a borrower account
    if (savedQuote.BorrowerEmail && savedQuote.BorrowerPassword) {
      const result = addUser({
        email: savedQuote.BorrowerEmail,
        password: savedQuote.BorrowerPassword,
        role: 'borrower',
      });
      if (result.success) {
        alert(`Successfully created borrower account for ${savedQuote.BorrowerEmail}.`);
      } else {
        // We show an alert even if user exists, as LO might not know.
        alert(`Note: Could not create new borrower account. ${result.message}`);
      }
    }

    handleSelectQuote(savedQuote.id);
  };

  const handleSaveAndFinalizeQuote = (quoteId: string, scenarios: Scenario[]) => {
    const quote = getQuoteById(quoteId);
    if (quote) {
      const updatedQuote = { ...quote, comparisonScenarios: scenarios };
      updateQuote(updatedQuote);
      setActiveQuoteId(quoteId);
      setView('borrowerView');
    }
  };
  
  const handleUpdateQuoteSelection = (quoteToUpdate: Quote, selectedScenarioId: string) => {
    const updatedQuote = { ...quoteToUpdate, selectedScenarioId };
    if (!updatedQuote.loEmail) {
        alert('Error: Cannot save selection. Loan Officer information is missing.');
        return;
    }

    const loStorageKey = `mortgageQuotes_${updatedQuote.loEmail}`;
    try {
        const loQuotesRaw = localStorage.getItem(loStorageKey);
        if (loQuotesRaw) {
            const loQuotes: Quote[] = JSON.parse(loQuotesRaw);
            const updatedLoQuotes = loQuotes.map(q => q.id === updatedQuote.id ? updatedQuote : q);
            localStorage.setItem(loStorageKey, JSON.stringify(updatedLoQuotes));
            
            // Update local state for immediate feedback
            const newBorrowerQuotes = borrowerQuotes.map(q => q.id === updatedQuote.id ? updatedQuote : q);
            setBorrowerQuotes(newBorrowerQuotes);
            alert('Your selection has been saved!');
        } else {
             throw new Error(`Could not find quote list for LO: ${updatedQuote.loEmail}`);
        }
    } catch (e) {
        console.error("Failed to update quote selection", e);
        alert("Sorry, there was an error saving your selection.");
    }
  };

  const getLoanOfficerTitle = (): string => {
    if (view === 'list') return 'Dashboard';
    if (view === 'form') {
      const activeQuote = activeQuoteId ? getQuoteById(activeQuoteId) : undefined;
      return activeQuote ? `Editing Quote` : 'Create New Quote';
    }
    if (view === 'summary') {
      const activeQuote = activeQuoteId ? getQuoteById(activeQuoteId) : undefined;
      return activeQuote ? `Comparing Scenarios` : 'Compare Scenarios';
    }
    if (view === 'borrowerView') {
       return 'Borrower Preview';
    }
    return 'Dashboard';
  };

  const renderLoanOfficerView = () => {
    if (!user) return null; // Should not happen if called
    if (!isLoaded) {
      return <div className="text-center p-10">Loading Quotes...</div>;
    }

    const activeQuote = activeQuoteId ? getQuoteById(activeQuoteId) : undefined;
    
    switch (view) {
      case 'borrowerView':
         return activeQuote ? (
          <BorrowerView quote={activeQuote} onBack={() => setView('list')} onReturnToEdit={() => setView('summary')}/>
        ) : (
          <div className="text-center p-10">Quote not found. <a href="#" onClick={(e) => { e.preventDefault(); setView('list'); }} className="text-brand">Go to dashboard</a></div>
        );
      case 'summary':
        return activeQuote ? (
          <QuoteComparison 
            baseQuote={activeQuote} 
            onBack={() => setView('list')} 
            onEditBase={handleEditQuote}
            onSave={handleSaveAndFinalizeQuote}
          />
        ) : (
          <div className="text-center p-10">Quote not found. <a href="#" onClick={(e) => { e.preventDefault(); setView('list'); }} className="text-brand">Go to dashboard</a></div>
        );
      case 'form':
        return (
          <QuoteForm
            initialQuote={activeQuote || null}
            mode={activeQuote ? 'full' : quoteMode}
            onSave={handleSaveQuote}
            onCancel={() => setView('list')}
          />
        );
      case 'list':
      default:
        return (
          <QuoteList
            quotes={quotes}
            user={user}
            onSelect={handleSelectQuote}
            onEdit={handleEditQuote}
            onDelete={handleDeleteQuote}
            onCsvUpload={addMultipleQuotes}
            onNewQuote={handleNewQuote}
            onOpenChat={setChatQuoteId}
          />
        );
    }
  }

  const renderBorrowerExperience = () => {
    const activeQuote = borrowerQuotes.find(q => q.id === activeBorrowerQuoteId);

    if (activeQuote && user) {
        return <BorrowerQuoteView
                    user={user}
                    quote={activeQuote} 
                    onBack={() => setActiveBorrowerQuoteId(null)}
                    onSelectScenario={(scenarioId) => handleUpdateQuoteSelection(activeQuote, scenarioId)}
               />
    }

    return <BorrowerDashboard 
                quotes={borrowerQuotes}
                onSelectQuote={(quote) => setActiveBorrowerQuoteId(quote.id)}
           />;
  }

  if (!user) {
    return <Auth onSignIn={handleSignIn} error={authError} />;
  }

  let pageTitle = 'Dashboard';
  let content: React.ReactNode = null;
  const isLoanOfficer = user.role === 'lo';
  const chatQuoteForLo = chatQuoteId ? getQuoteById(chatQuoteId) : null;


  if (user.role === 'admin') {
      pageTitle = 'Admin Dashboard';
      content = (
        <AdminDashboard 
          loanOfficers={users.filter(u => u.role === 'lo')}
          onAddUser={addUser}
          onDeleteUser={deleteUser}
        />
      );
  } else if (user.role === 'borrower') {
      pageTitle = 'Your Quote Portal';
      content = renderBorrowerExperience();
  } else if (isLoanOfficer) {
      pageTitle = getLoanOfficerTitle();
      content = renderLoanOfficerView();
  }

  return (
    <div className="min-h-screen">
      {isLoanOfficer && (
        <Sidebar 
          onNavigate={handleNavigate}
          currentView={view}
        />
      )}
      <div className={isLoanOfficer ? 'pl-0 md:pl-64' : ''}>
        <Header 
          title={pageTitle}
          user={user}
          onSignOut={handleSignOut}
        />
        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {content}
          </div>
        </main>
      </div>
      {isLoanOfficer && isQuoteTypeModalOpen && (
        <QuoteTypeModal
          onClose={() => setIsQuoteTypeModalOpen(false)}
          onSelect={handleSelectQuoteType}
        />
      )}
      {chatQuoteForLo && user?.role === 'lo' && (
       <ChatBox 
        quoteId={chatQuoteForLo.id}
        user={user}
        onClose={() => setChatQuoteId(null)}
        loanOfficerEmail={chatQuoteForLo.loEmail}
      />
    )}
    </div>
  );
};

export default App;