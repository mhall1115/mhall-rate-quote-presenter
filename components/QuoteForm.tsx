




// FIX: Corrected a syntax error in the import statement for React hooks.
import React, { useState, useEffect } from 'react';
import type { Quote, Scenario } from '../types';
import { LoanType, LoanTerm, ProgramType, RefiType } from '../types';
import { EMPTY_QUOTE } from '../constants';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { Button } from './common/Button';
import { useCalculations } from '../hooks/useCalculations';
import { AddressAutocomplete, AddressDetails } from './common/AddressAutocomplete';


interface QuoteFormProps {
  initialQuote?: Quote | null;
  mode: 'quick' | 'full';
  onSave: (quote: Quote | Omit<Quote, 'id'>) => void;
  onCancel: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const FormSection: React.FC<{ title: string; children: React.ReactNode; id?: string }> = ({ title, children, id }) => (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 py-6 border-t border-white/10 first:border-t-0 first:pt-0" id={id}>
        <div className="sm:col-span-2">
            <h3 className="text-lg font-medium leading-6 text-gray-100">{title}</h3>
        </div>
        <div className="sm:col-span-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
                {children}
            </div>
        </div>
    </div>
);


export const QuoteForm: React.FC<QuoteFormProps> = ({ initialQuote, mode, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Quote, 'id'>>(() => ({...EMPTY_QUOTE}));

  useEffect(() => {
    if (initialQuote) {
      // When editing, we always load the full quote data, regardless of original mode
      setFormData(initialQuote);
    } else {
      // When creating a new quote, use the mode
      const newQuoteData = { ...EMPTY_QUOTE };
      if (mode === 'quick') {
        // Zero out specific fees for a quick quote to simplify the view
        newQuoteData.LenderFees = 0;
        newQuoteData.TitleFees = 0;
        newQuoteData.EscrowFees = 0;
        newQuoteData.AppraisalFee = 0;
        newQuoteData.CreditReportFee = 0;
        newQuoteData.RecordingFee = 0;
        newQuoteData.TransferTax = 0;
        newQuoteData.Prepaids = 0;
      }
      setFormData(newQuoteData);
    }
  }, [initialQuote, mode]);

  const calcs = useCalculations(formData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number = value;

    if (type === 'number') {
        finalValue = value === '' ? '' : parseFloat(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAddressSelect = (details: AddressDetails) => {
    setFormData(prev => ({
        ...prev,
        PropertyAddress: details.fullAddress,
    }));
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteToSave = { ...formData };
    if (initialQuote) {
      onSave({ ...quoteToSave, id: initialQuote.id });
    } else {
      onSave(quoteToSave);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-float-in">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        <Card>
            <FormSection title="Loan & Property Info">
                <Input label="Borrower Name" id="BorrowerName" name="BorrowerName" value={formData.BorrowerName} onChange={handleChange} required className="md:col-span-2" />
                <AddressAutocomplete 
                    id="PropertyAddress"
                    label="Property Address"
                    initialValue={formData.PropertyAddress}
                    onSelect={handleAddressSelect}
                    helperText="Used to fetch localized fee estimates."
                    className="md:col-span-2"
                />
                 <Select label="Program Type" id="ProgramType" name="ProgramType" value={formData.ProgramType} onChange={handleChange}>
                    {Object.values(ProgramType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </Select>
                {formData.ProgramType === ProgramType.Refinance && (
                  <Select label="Refinance Type" id="RefiType" name="RefiType" value={formData.RefiType} onChange={handleChange}>
                      {Object.values(RefiType).map(rt => <option key={rt} value={rt}>{rt}</option>)}
                  </Select>
                )}
                <Input label={formData.ProgramType === ProgramType.Purchase ? 'Purchase Price' : 'Estimated Property Value'} id="PurchasePrice" name="PurchasePrice" type="number" value={formData.PurchasePrice} onChange={handleChange} leadingAddon="$" />
                <Input label="Loan Amount" id="LoanAmount" name="LoanAmount" type="number" value={formData.LoanAmount} onChange={handleChange} leadingAddon="$" />
                <Select label="Loan Type" id="LoanType" name="LoanType" value={formData.LoanType} onChange={handleChange}>
                    {Object.values(LoanType).map(lt => <option key={lt} value={lt}>{lt}</option>)}
                </Select>
                 <Select label="Loan Term (Years)" id="LoanTerm" name="LoanTerm" value={formData.LoanTerm} onChange={handleChange}>
                    {Object.values(LoanTerm).filter(val => typeof val === 'number').map(lt => <option key={lt} value={lt}>{lt}</option>)}
                </Select>
                <Input label="Credit Score" id="CreditScore" name="CreditScore" type="number" value={formData.CreditScore} onChange={handleChange} />
                 <Input label="First Payment Date" id="FirstPaymentDate" name="FirstPaymentDate" type="date" value={formData.FirstPaymentDate} onChange={handleChange} />
            </FormSection>

            {mode === 'full' && (
                <FormSection title="Fees & Costs">
                    <Input label="Lender Fees" id="LenderFees" name="LenderFees" type="number" value={formData.LenderFees} onChange={handleChange} leadingAddon="$" />
                    <Input label="Title Fees" id="TitleFees" name="TitleFees" type="number" value={formData.TitleFees} onChange={handleChange} leadingAddon="$" />
                    <Input label="Escrow Fees" id="EscrowFees" name="EscrowFees" type="number" value={formData.EscrowFees} onChange={handleChange} leadingAddon="$" />
                    <Input label="Appraisal Fee" id="AppraisalFee" name="AppraisalFee" type="number" value={formData.AppraisalFee} onChange={handleChange} leadingAddon="$" />
                    <Input label="Credit Report Fee" id="CreditReportFee" name="CreditReportFee" type="number" value={formData.CreditReportFee} onChange={handleChange} leadingAddon="$" />
                    <Input label="Recording Fee" id="RecordingFee" name="RecordingFee" type="number" value={formData.RecordingFee} onChange={handleChange} leadingAddon="$" />
                    <Input label="Transfer Tax" id="TransferTax" name="TransferTax" type="number" value={formData.TransferTax} onChange={handleChange} leadingAddon="$" />
                    <Input label="Prepaids (e.g. Taxes, Ins.)" id="Prepaids" name="Prepaids" type="number" value={formData.Prepaids} onChange={handleChange} leadingAddon="$" />
                </FormSection>
            )}

             <FormSection title="Rate & Points">
                <Input label="Interest Rate" id="InterestRate" name="InterestRate" type="number" step="0.01" value={formData.InterestRate} onChange={handleChange} leadingAddon="%" />
                <Input label="Discount Points" id="DiscountPoints" name="DiscountPoints" type="number" value={formData.DiscountPoints} onChange={handleChange} leadingAddon="$" helperText="1 point = 1% of Loan Amount" />
                <Input label="Lender Credits" id="LenderCredits" name="LenderCredits" type="number" value={formData.LenderCredits} onChange={handleChange} leadingAddon="$" helperText="Amount paid by lender to borrower" />
            </FormSection>

             <FormSection title="Assumptions">
                <Input label="Property Tax Rate" id="TaxRate" name="TaxRate" type="number" step="0.01" value={formData.TaxRate} onChange={handleChange} leadingAddon="%" />
                <Input label="Homeowner's Ins. Rate" id="InsuranceRate" name="InsuranceRate" type="number" step="0.01" value={formData.InsuranceRate} onChange={handleChange} leadingAddon="%" />
            </FormSection>

            <FormSection title="Borrower Account (Optional)">
                <Input label="Borrower Email" id="BorrowerEmail" name="BorrowerEmail" type="email" value={formData.BorrowerEmail} onChange={handleChange} helperText="Creates an account for the borrower to view quotes."/>
                <Input label="Borrower Password" id="BorrowerPassword" name="BorrowerPassword" type="password" value={formData.BorrowerPassword} onChange={handleChange} helperText="A temporary password for the borrower."/>
            </FormSection>
        </Card>

        <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{initialQuote ? 'Save Changes' : 'Create Quote'}</Button>
        </div>
        </form>

         <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <h3 className="text-lg font-bold text-gray-100">Live Summary</h3>
                    <p className="text-sm text-gray-400 mb-4">Calculations update as you type.</p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400">Total Monthly Payment</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-brand-dark to-brand-light bg-clip-text text-transparent">{formatCurrency(calcs.TotalMonthlyPayment)}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-400">Cash to Close</p>
                            <p className="text-2xl font-semibold text-gray-200">{formatCurrency(calcs.CashToClose)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Closing Costs</p>
                            <p className="text-xl font-medium text-gray-300">{formatCurrency(calcs.TotalClosingCosts)}</p>
                        </div>
                        {formData.ProgramType === ProgramType.Purchase && (
                             <div className="pt-2 border-t border-white/10">
                                 <p className="text-sm text-gray-400">Down Payment</p>
                                 <p className="text-xl font-medium text-gray-300">{formatCurrency(calcs.DownPayment)}</p>
                            </div>
                        )}
                        <div className="pt-2 border-t border-white/10">
                            <p className="text-sm text-gray-400">LTV</p>
                            <p className="text-xl font-medium text-gray-300">{calcs.LTV.toFixed(2)}%</p>
                        </div>
                    </div>
                </Card>
            </div>
    </div>
  );
};