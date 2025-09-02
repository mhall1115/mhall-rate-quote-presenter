import React, { useState, useRef } from 'react';
import type { Quote } from '../types';
import { LoanType, LoanTerm } from '../types';
import { Button } from './common/Button';

// Make Papa object available from CDN
declare const Papa: any;

interface CsvUploaderProps {
  onUpload: (quotes: Omit<Quote, 'id'>[]) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          setFileName(null);
          return;
        }
        
        const requiredFields = ['BorrowerName', 'LoanAmount', 'PurchasePrice', 'InterestRate'];
        const hasRequiredFields = requiredFields.every(field => results.meta.fields.includes(field));

        if (!hasRequiredFields) {
            setError(`CSV must contain at least the following columns: ${requiredFields.join(', ')}`);
            setFileName(null);
            return;
        }

        const parsedQuotes: Omit<Quote, 'id'>[] = results.data.map((row: any) => ({
          BorrowerName: row.BorrowerName ?? 'N/A',
          PropertyAddress: row.PropertyAddress ?? '',
          LoanType: Object.values(LoanType).includes(row.LoanType) ? row.LoanType : LoanType.Conv,
          LoanTerm: Object.values(LoanTerm).includes(row.LoanTerm) ? row.LoanTerm : LoanTerm.Thirty,
          LoanAmount: Number(row.LoanAmount) || 0,
          PurchasePrice: Number(row.PurchasePrice) || 0,
          InterestRate: Number(row.InterestRate) || 0,
          CreditScore: Number(row.CreditScore) || 740,
          EstimatedDTI: Number(row.EstimatedDTI) || 43,
          FirstPaymentDate: row.FirstPaymentDate ?? new Date().toISOString().split('T')[0],
          LenderFees: Number(row.LenderFees) || 1200,
          TitleFees: Number(row.TitleFees) || 1500,
          EscrowFees: Number(row.EscrowFees) || 800,
          AppraisalFee: Number(row.AppraisalFee) || 600,
          CreditReportFee: Number(row.CreditReportFee) || 75,
          RecordingFee: Number(row.RecordingFee) || 150,
          TransferTax: Number(row.TransferTax) || 0,
          Prepaids: Number(row.Prepaids) || 2500,
          DiscountPoints: Number(row.DiscountPoints) || 0,
          LenderCredits: Number(row.LenderCredits) || 0,
          TaxRate: Number(row.TaxRate) || 1.25,
          InsuranceRate: Number(row.InsuranceRate) || 0.35,
        }));
        
        onUpload(parsedQuotes);
        setFileName(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      },
      error: (err: any) => {
        setError(`Failed to read file: ${err.message}`);
        setFileName(null);
      }
    });
  };

  return (
    <div className="bg-white/5 p-4 rounded-lg border-2 border-dashed border-white/20 text-center">
      <label
        htmlFor="csv-upload"
        className="cursor-pointer text-sm font-medium text-brand-dark hover:text-brand"
      >
        Upload a CSV file
      </label>
      <input
        id="csv-upload"
        name="csv-upload"
        type="file"
        className="sr-only"
        accept=".csv"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <p className="text-xs text-gray-400 mt-1">
        {fileName ? `Selected: ${fileName}` : 'Or drag and drop. Must match expected format.'}
      </p>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};