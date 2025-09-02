
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchAddressSuggestions, getAddressDetails } from '../../services/mortgageAPIs';

export interface AddressDetails {
  fullAddress: string;
  zipCode: string;
}

interface AddressAutocompleteProps {
  initialValue?: string;
  onSelect: (details: AddressDetails) => void;
  label: string;
  id: string;
  helperText?: string;
  className?: string;
}

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ initialValue = '', onSelect, label, id, helperText, className }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<{description: string, id: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestionsCallback = async (input: string) => {
    if (input.length < 3) {
        setSuggestions([]);
        setIsLoading(false);
        return;
    }
    const result = await fetchAddressSuggestions(input);
    setSuggestions(result);
    setIsLoading(false);
  };
  
  const debouncedFetch = useCallback(debounce(fetchSuggestionsCallback, 400), []);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    setIsLoading(true);
    debouncedFetch(value);
  };
  
  const handleSelect = async (suggestion: {description: string, id: string}) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    
    const details = await getAddressDetails(suggestion.id);
    onSelect(details);
  };
  
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div ref={containerRef} className={`relative ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
             <input
                id={id}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onFocus={() => {if(suggestions.length > 0) setShowSuggestions(true)}}
                placeholder="Start typing an address..."
                className="block w-full rounded-md border-white/20 bg-white/5 text-white focus:border-aqua focus:ring-aqua sm:text-sm"
                autoComplete="off"
              />
        </div>
        {helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}

        {showSuggestions && (
            <ul className="absolute z-20 w-full bg-slate-800 border border-white/20 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {isLoading && <li className="px-4 py-2 text-sm text-gray-400">Searching...</li>}
                {!isLoading && suggestions.length === 0 && inputValue.length > 2 && (
                    <li className="px-4 py-2 text-sm text-gray-400">No results found.</li>
                )}
                {suggestions.map(s => (
                    <li 
                        key={s.id} 
                        onClick={() => handleSelect(s)}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-200 hover:bg-brand"
                    >
                       {s.description}
                    </li>
                ))}
            </ul>
        )}
    </div>
  );
};