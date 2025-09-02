
import { Quote, LoanType, LoanTerm, ProgramType } from './types';

export const DEFAULT_TAX_RATE = 1.25;
export const DEFAULT_INSURANCE_RATE = 0.35;

export const EMPTY_QUOTE: Omit<Quote, 'id'> = {
  loEmail: '',
  BorrowerName: '',
  PropertyAddress: '',
  LoanType: LoanType.Conv,
  LoanTerm: LoanTerm.Thirty,
  LoanAmount: 500000,
  PurchasePrice: 625000,
  InterestRate: 6.5,
  CreditScore: 740,
  EstimatedDTI: 43,
  FirstPaymentDate: new Date().toISOString().split('T')[0],
  LenderFees: 1200,
  TitleFees: 1500,
  EscrowFees: 800,
  AppraisalFee: 600,
  CreditReportFee: 75,
  RecordingFee: 150,
  TransferTax: 0,
  Prepaids: 2500,
  DiscountPoints: 0,
  LenderCredits: 0,
  TaxRate: DEFAULT_TAX_RATE,
  InsuranceRate: DEFAULT_INSURANCE_RATE,
  ProgramType: ProgramType.Purchase,
  RefiType: undefined,
  BorrowerEmail: '',
  BorrowerPassword: '',
  comparisonScenarios: undefined,
  selectedScenarioId: undefined,
};