
import React, { useState, useEffect } from 'react';
import type { Quote, Scenario } from '../types';
import { Button } from './common/Button';
import { ComparisonCard } from './ComparisonCard';

interface QuoteComparisonProps {
  baseQuote: Quote;
  onBack: () => void;
  onEditBase: (id: string) => void;
  onSave: (quoteId: string, scenarios: Scenario[]) => void;
}

export const QuoteComparison: React.FC<QuoteComparisonProps> = ({ baseQuote, onBack, onEditBase, onSave }) => {
  const [scenarios, setScenarios] = useState<Quote[]>([]);

  useEffect(() => {
    if (baseQuote.comparisonScenarios && baseQuote.comparisonScenarios.length > 0) {
        const initialScenarios = baseQuote.comparisonScenarios.map(scenarioData => ({
            ...baseQuote,
            ...scenarioData,
        }));
        setScenarios(initialScenarios);
    } else {
        // If no scenarios are saved, start with the base quote as the first option
        setScenarios([baseQuote]);
    }
  }, [baseQuote]);

  const handleUpdateScenario = (index: number, updatedScenario: Quote) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = updatedScenario;
    setScenarios(newScenarios);
  };

  const handleAddScenario = () => {
    const lastScenario = scenarios[scenarios.length - 1];
    const newScenario = {
      ...lastScenario,
      id: `scenario-${Date.now()}`,
      InterestRate: parseFloat((lastScenario.InterestRate + 0.125).toFixed(3)),
      DiscountPoints: 0,
      LenderCredits: 0,
    };
    setScenarios([...scenarios, newScenario]);
  };

  const handleDeleteScenario = (index: number) => {
    if (scenarios.length <= 1) return;
    const newScenarios = scenarios.filter((_, i) => i !== index);
    setScenarios(newScenarios);
  };

  const handleSave = () => {
     const scenarioData: Scenario[] = scenarios.map(s => ({
         id: s.id.startsWith('scenario-') ? s.id : `scenario-${Date.now()}-${Math.random()}`,
         InterestRate: s.InterestRate,
         DiscountPoints: s.DiscountPoints,
         LenderCredits: s.LenderCredits,
     }));
     onSave(baseQuote.id, scenarioData);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-float-in">
      <div className="flex flex-wrap gap-4 justify-between items-start px-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Compare Scenarios</h2>
          <p className="text-lg text-gray-400">Adjust options for {baseQuote.BorrowerName}</p>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <Button variant="secondary" onClick={onBack}>Dashboard</Button>
          <Button variant="secondary" onClick={() => onEditBase(baseQuote.id)}>Edit Base Inputs</Button>
          <Button onClick={handleSave}>Save & View as Borrower</Button>
        </div>
      </div>

      <div className="flex items-stretch gap-8 pb-4 -mx-4 px-4 overflow-x-auto">
        {scenarios.map((scenario, index) => (
          <div key={scenario.id || index} className="w-[22rem] flex-shrink-0">
            <ComparisonCard
              quote={scenario}
              onUpdate={(updatedQuote) => handleUpdateScenario(index, updatedQuote)}
              onDelete={() => handleDeleteScenario(index)}
              title={`Option ${index + 1}`}
              canDelete={scenarios.length > 1}
            />
          </div>
        ))}
        
        <div className="w-80 flex-shrink-0 flex items-center justify-center">
            <button 
                onClick={handleAddScenario}
                className="w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-300 group"
            >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-brand transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <span className="font-semibold text-white">Add Option</span>
                <span className="text-sm text-gray-400">Create a new column</span>
            </button>
        </div>
      </div>
    </div>
  );
};