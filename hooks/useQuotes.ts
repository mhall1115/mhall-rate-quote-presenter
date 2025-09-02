import { useState, useEffect, useCallback } from 'react';
import type { Quote } from '../types';
import { User } from './useUsers';


export const useQuotes = (user: User | null) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const STORAGE_KEY = user && user.role === 'lo' ? `mortgageQuotes_${user.email}` : null;

  useEffect(() => {
    if (!user) { 
      setIsLoaded(true);
      return;
    }
    
    if (user.role !== 'lo' || !STORAGE_KEY) {
      setQuotes([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    try {
      const storedQuotes = localStorage.getItem(STORAGE_KEY);
      if (storedQuotes) {
        setQuotes(JSON.parse(storedQuotes));
      } else {
        setQuotes([]);
      }
    } catch (error) {
      console.error("Failed to load quotes from localStorage", error);
      setQuotes([]);
    } finally {
      setIsLoaded(true);
    }
  }, [user, STORAGE_KEY]);

  useEffect(() => {
    if (isLoaded && STORAGE_KEY) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      } catch (error) {
        console.error("Failed to save quotes to localStorage", error);
      }
    }
  }, [quotes, isLoaded, STORAGE_KEY]);

  const addQuote = useCallback((newQuoteData: Omit<Quote, 'id'>) => {
    if (!STORAGE_KEY || !user) return newQuoteData as Quote; // Should not happen
    const newQuote: Quote = {
      ...newQuoteData,
      id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
      loEmail: user.email,
    };
    setQuotes(prevQuotes => [newQuote, ...prevQuotes]);
    return newQuote;
  }, [STORAGE_KEY, user]);

  const addMultipleQuotes = useCallback((newQuotesData: Omit<Quote, 'id'>[]) => {
    if (!STORAGE_KEY || !user) return;
    const newQuotes: Quote[] = newQuotesData.map(q => ({
        ...q,
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9) + q.BorrowerName,
        loEmail: user.email,
    }));
    setQuotes(prevQuotes => [...newQuotes, ...prevQuotes]);
  }, [STORAGE_KEY, user]);


  const updateQuote = useCallback((updatedQuote: Quote) => {
    if (!STORAGE_KEY) return;
    setQuotes(prevQuotes =>
      prevQuotes.map(q => (q.id === updatedQuote.id ? updatedQuote : q))
    );
  }, [STORAGE_KEY]);

  const deleteQuote = useCallback((quoteId: string) => {
    if (!STORAGE_KEY) return;
    setQuotes(prevQuotes => prevQuotes.filter(q => q.id !== quoteId));
  }, [STORAGE_KEY]);
  
  const getQuoteById = useCallback((quoteId: string) => {
    return quotes.find(q => q.id === quoteId);
  }, [quotes]);

  return { quotes, addQuote, addMultipleQuotes, updateQuote, deleteQuote, getQuoteById, isLoaded };
};