
export enum LoanType {
  Conv = 'Conv',
  FHA = 'FHA',
  VA = 'VA',
  NonQM = 'Non-QM',
}

export enum LoanTerm {
  Thirty = 30,
  Twenty = 20,
  Fifteen = 15,
  Ten = 10,
}

export enum ProgramType {
  Purchase = 'Purchase',
  Refinance = 'Refinance',
}

export enum RefiType {
  RateAndTerm = 'Rate & Term',
  CashOut = 'Cash Out',
}

export interface Scenario {
  id: string;
  InterestRate: number;
  DiscountPoints: number;
  LenderCredits: number;
}


export interface Quote {
  id: string;
  loEmail: string;
  BorrowerName: string;
  PropertyAddress: string;
  LoanType: LoanType;
  LoanTerm: LoanTerm;
  LoanAmount: number;
  PurchasePrice: number;
  InterestRate: number;
  CreditScore: number;
  EstimatedDTI: number;
  FirstPaymentDate: string;
  LenderFees: number;
  TitleFees: number;
  EscrowFees: number;
  AppraisalFee: number;
  CreditReportFee: number;
  RecordingFee: number;
  TransferTax: number;
  Prepaids: number;
  DiscountPoints: number;
  LenderCredits: number;
  TaxRate: number;
  InsuranceRate: number;
  ProgramType: ProgramType;
  RefiType?: RefiType;
  BorrowerEmail?: string;
  BorrowerPassword?: string;
  comparisonScenarios?: Scenario[];
  selectedScenarioId?: string;
}