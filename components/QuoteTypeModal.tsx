import React from 'react';
import { Card } from './common/Card';

interface QuoteTypeModalProps {
  onClose: () => void;
  onSelect: (type: 'quick' | 'full') => void;
}

const OptionCard: React.FC<{ title: string; description: string; onClick: () => void; icon: React.ReactNode }> = ({ title, description, onClick, icon }) => (
    <div
        onClick={onClick}
        className="group relative flex-1 p-8 bg-slate-900/40 backdrop-blur-lg border border-white/10 shadow-lg rounded-xl transition-all duration-300 hover:border-brand hover:scale-105 cursor-pointer text-center"
    >
        <div className="flex justify-center mb-4 text-brand group-hover:text-aqua transition-colors duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
    </div>
);


export const QuoteTypeModal: React.FC<QuoteTypeModalProps> = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-float-in" onClick={onClose}>
      <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <Card className="p-8">
            <h2 className="text-2xl font-bold text-center text-white mb-2">Create a New Quote</h2>
            <p className="text-base text-center text-gray-400 mb-8">Choose the level of detail you need for this quote.</p>
            <div className="flex flex-col md:flex-row gap-6">
                <OptionCard
                    onClick={() => onSelect('quick')}
                    title="Quick Quote"
                    description="Ideal for fast comparisons of rate, payment, and cash to close without detailed fee entry."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5l3-3z" clipRule="evenodd" /><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg>}
                />
                <OptionCard
                    onClick={() => onSelect('full')}
                    title="Full Cost Quote"
                    description="A comprehensive quote including all itemized fees for a detailed and accurate summary."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>}
                />
            </div>
        </Card>
      </div>
    </div>
  );
};
