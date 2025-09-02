
import React, { useState, useMemo } from 'react';
import type { Quote } from '../types';
import { useCalculations, generateAmortizationSchedule, AmortizationEntry } from '../hooks/useCalculations';
import { Button } from './common/Button';

const formatCurrency = (value: number, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);


const DonutChart: React.FC<{ data: { label: string, value: number, color: string }[], total: number }> = ({ data, total }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return (
        <div className="flex items-center justify-center gap-8">
            <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r={radius} fill="transparent" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="24" />
                    {data.map((item, index) => {
                        if (item.value <= 0) return null;
                        const percentage = (item.value / total) * 100;
                        const dashoffset = circumference - (accumulatedOffset / 100) * circumference;
                        const dasharray = `${(percentage / 100) * circumference} ${circumference}`;
                        accumulatedOffset += percentage;
                        return (
                            <circle
                                key={index}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="25"
                                strokeDasharray={dasharray}
                                strokeDashoffset={dashoffset}
                                strokeLinecap="butt"
                            />
                        )
                    })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-gray-400 text-sm">Total Payment</span>
                    <span className="text-white font-bold text-3xl">{formatCurrency(total)}</span>
                </div>
            </div>
            <div className="space-y-2">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="text-sm text-gray-300">{item.label}:</span>
                        <span className="text-sm font-medium text-white ml-auto">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const AmortizationTable: React.FC<{ schedule: AmortizationEntry[] }> = ({ schedule }) => (
    <div className="max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
        <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-slate-800 sticky top-0">
                <tr>
                    <th scope="col" className="px-4 py-2">Month</th>
                    <th scope="col" className="px-4 py-2 text-right">Principal</th>
                    <th scope="col" className="px-4 py-2 text-right">Interest</th>
                    <th scope="col" className="px-4 py-2 text-right">Balance</th>
                </tr>
            </thead>
            <tbody>
                {schedule.map((row) => (
                    <tr key={row.month} className="border-b border-white/10 hover:bg-white/10">
                        <td className="px-4 py-2 font-medium">{row.month}</td>
                        <td className="px-4 py-2 text-right text-green-400">{formatCurrency(row.principal)}</td>
                        <td className="px-4 py-2 text-right text-red-400">{formatCurrency(row.interest)}</td>
                        <td className="px-4 py-2 text-right font-medium text-white">{formatCurrency(row.remainingBalance, 0)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


interface ScenarioBreakdownModalProps {
    quote: Quote;
    onClose: () => void;
    onSelect: () => void;
}

export const ScenarioBreakdownModal: React.FC<ScenarioBreakdownModalProps> = ({ quote, onClose, onSelect }) => {
    const [activeTab, setActiveTab] = useState<'breakdown' | 'amortization'>('breakdown');
    const calcs = useCalculations(quote);

    const schedule = useMemo(() => generateAmortizationSchedule(quote), [quote]);
    
    const chartData = [
        { label: 'P & I', value: calcs.MonthlyPrincipalAndInterest, color: '#3b82f6' },
        { label: 'Taxes', value: calcs.MonthlyTaxes, color: '#8b5cf6' },
        { label: 'Insurance', value: calcs.MonthlyInsurance, color: '#14b8a6' },
        { label: 'MI', value: calcs.EstimatedMortgageInsurance, color: '#f97316' }
    ].filter(d => d.value > 0);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-float-in" onClick={onClose}>
            <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-white/10 flex justify-between items-center">
                    <div>
                         <h2 className="text-xl font-bold text-white">Option Details</h2>
                         <p className="text-sm text-gray-400">{quote.InterestRate.toFixed(3)}% Rate</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-white/10">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="border-b border-white/10 mb-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                           <button onClick={() => setActiveTab('breakdown')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'breakdown' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>
                                Payment Breakdown
                           </button>
                            <button onClick={() => setActiveTab('amortization')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'amortization' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>
                                Amortization Schedule
                           </button>
                        </nav>
                    </div>
                    
                    {activeTab === 'breakdown' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Monthly Payment Breakdown</h3>
                            <DonutChart data={chartData} total={calcs.TotalMonthlyPayment} />
                            <h3 className="text-lg font-semibold text-white pt-4 border-t border-white/10">Costs at Closing</h3>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Down Payment</span>
                                    <span className="font-medium text-white">{formatCurrency(calcs.DownPayment)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Total Closing Costs</span>
                                    <span className="font-medium text-white">{formatCurrency(calcs.TotalClosingCosts)}</span>
                                </div>
                                <div className="col-span-2 flex justify-between text-base border-t border-white/10 pt-2 mt-2">
                                    <span className="text-gray-200 font-bold">Estimated Cash to Close</span>
                                    <span className="font-bold text-brand-dark">{formatCurrency(calcs.CashToClose)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'amortization' && (
                         <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Loan Amortization</h3>
                            {schedule.length > 0 ? <AmortizationTable schedule={schedule} /> : <p className="text-gray-400">Could not generate schedule. Please check loan inputs.</p>}
                        </div>
                    )}
                </div>
                
                <footer className="p-4 bg-slate-950/50 border-t border-white/10 flex justify-end">
                    <Button onClick={onSelect}>Select This Option</Button>
                </footer>
            </div>
        </div>
    )
}
