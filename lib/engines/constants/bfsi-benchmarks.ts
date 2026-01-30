/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * BFSI (Banking, Financial Services, Insurance) Industry Benchmarks
 *
 * Industry-specific benchmarks, rates, and parameters for BFSI sector
 * transfer pricing including treasury, insurance, NBFC, and guarantee transactions.
 * ================================================================================
 */

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

export enum BFSITransactionType {
  // Banking
  INTER_COMPANY_LOAN = "inter_company_loan",
  CASH_POOL = "cash_pool",
  TREASURY_SERVICES = "treasury_services",
  CORRESPONDENT_BANKING = "correspondent_banking",
  TRADE_FINANCE = "trade_finance",
  FOREX_SERVICES = "forex_services",

  // Insurance
  CAPTIVE_INSURANCE = "captive_insurance",
  REINSURANCE = "reinsurance",
  INSURANCE_COMMISSION = "insurance_commission",

  // NBFC
  NBFC_LENDING = "nbfc_lending",
  FACTORING = "factoring",
  LEASING = "leasing",

  // Guarantees
  CORPORATE_GUARANTEE = "corporate_guarantee",
  PERFORMANCE_GUARANTEE = "performance_guarantee",
  LETTER_OF_CREDIT = "letter_of_credit",

  // Investment
  PORTFOLIO_MANAGEMENT = "portfolio_management",
  ASSET_MANAGEMENT = "asset_management",
  CUSTODY_SERVICES = "custody_services",
}

// =============================================================================
// INTEREST RATE BENCHMARKS
// =============================================================================

export interface InterestRateBenchmark {
  name: string;
  currency: string;
  currentRate: number;
  spread: { min: number; max: number };
  description: string;
  source: string;
  lastUpdated: Date;
}

export const INTEREST_RATE_BENCHMARKS: InterestRateBenchmark[] = [
  // India
  {
    name: "SBI Base Rate",
    currency: "INR",
    currentRate: 8.50,
    spread: { min: 0.50, max: 3.00 },
    description: "State Bank of India Base Rate",
    source: "SBI",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    name: "SBI MCLR (1 Year)",
    currency: "INR",
    currentRate: 8.75,
    spread: { min: 0.25, max: 2.50 },
    description: "Marginal Cost of Funds based Lending Rate - 1 Year",
    source: "SBI",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    name: "RBI Repo Rate",
    currency: "INR",
    currentRate: 6.50,
    spread: { min: 2.00, max: 5.00 },
    description: "Reserve Bank of India Repo Rate",
    source: "RBI",
    lastUpdated: new Date("2024-01-01"),
  },
  // International
  {
    name: "SOFR",
    currency: "USD",
    currentRate: 5.25,
    spread: { min: 0.50, max: 3.00 },
    description: "Secured Overnight Financing Rate",
    source: "Federal Reserve",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    name: "EURIBOR (6M)",
    currency: "EUR",
    currentRate: 3.75,
    spread: { min: 0.50, max: 2.50 },
    description: "Euro Interbank Offered Rate - 6 Months",
    source: "EMMI",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    name: "SONIA",
    currency: "GBP",
    currentRate: 5.00,
    spread: { min: 0.50, max: 2.50 },
    description: "Sterling Overnight Index Average",
    source: "Bank of England",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    name: "SARON",
    currency: "CHF",
    currentRate: 1.75,
    spread: { min: 0.50, max: 2.00 },
    description: "Swiss Average Rate Overnight",
    source: "SIX",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    name: "TONA",
    currency: "JPY",
    currentRate: 0.10,
    spread: { min: 0.50, max: 2.00 },
    description: "Tokyo Overnight Average Rate",
    source: "Bank of Japan",
    lastUpdated: new Date("2024-01-01"),
  },
];

// =============================================================================
// CREDIT RATING SPREADS
// =============================================================================

export interface CreditRatingSpread {
  rating: string;
  ratingAgency: string;
  spread: number; // basis points over benchmark
  description: string;
}

export const CREDIT_RATING_SPREADS: CreditRatingSpread[] = [
  { rating: "AAA", ratingAgency: "Standard", spread: 50, description: "Highest credit quality" },
  { rating: "AA+", ratingAgency: "Standard", spread: 75, description: "Very high credit quality" },
  { rating: "AA", ratingAgency: "Standard", spread: 100, description: "High credit quality" },
  { rating: "AA-", ratingAgency: "Standard", spread: 125, description: "High credit quality" },
  { rating: "A+", ratingAgency: "Standard", spread: 150, description: "Good credit quality" },
  { rating: "A", ratingAgency: "Standard", spread: 175, description: "Good credit quality" },
  { rating: "A-", ratingAgency: "Standard", spread: 200, description: "Good credit quality" },
  { rating: "BBB+", ratingAgency: "Standard", spread: 250, description: "Adequate credit quality" },
  { rating: "BBB", ratingAgency: "Standard", spread: 300, description: "Adequate credit quality" },
  { rating: "BBB-", ratingAgency: "Standard", spread: 350, description: "Adequate credit quality" },
  { rating: "BB+", ratingAgency: "Standard", spread: 450, description: "Non-investment grade" },
  { rating: "BB", ratingAgency: "Standard", spread: 550, description: "Non-investment grade" },
  { rating: "BB-", ratingAgency: "Standard", spread: 650, description: "Non-investment grade" },
  { rating: "B+", ratingAgency: "Standard", spread: 800, description: "Highly speculative" },
  { rating: "B", ratingAgency: "Standard", spread: 1000, description: "Highly speculative" },
  { rating: "Unrated", ratingAgency: "Internal", spread: 400, description: "No external rating" },
];

// =============================================================================
// GUARANTEE FEE BENCHMARKS
// =============================================================================

export interface GuaranteeFeeRange {
  guaranteeType: BFSITransactionType;
  creditRating: string;
  feeRange: { min: number; max: number }; // percentage per annum
  tenorAdjustment: { shortTerm: number; longTerm: number };
  methodology: string;
}

export const GUARANTEE_FEE_RANGES: GuaranteeFeeRange[] = [
  {
    guaranteeType: BFSITransactionType.CORPORATE_GUARANTEE,
    creditRating: "AAA",
    feeRange: { min: 0.15, max: 0.50 },
    tenorAdjustment: { shortTerm: -0.05, longTerm: 0.10 },
    methodology: "Credit default swap plus administrative margin",
  },
  {
    guaranteeType: BFSITransactionType.CORPORATE_GUARANTEE,
    creditRating: "AA",
    feeRange: { min: 0.25, max: 0.75 },
    tenorAdjustment: { shortTerm: -0.05, longTerm: 0.15 },
    methodology: "Credit default swap plus administrative margin",
  },
  {
    guaranteeType: BFSITransactionType.CORPORATE_GUARANTEE,
    creditRating: "A",
    feeRange: { min: 0.40, max: 1.00 },
    tenorAdjustment: { shortTerm: -0.10, longTerm: 0.20 },
    methodology: "Credit default swap plus administrative margin",
  },
  {
    guaranteeType: BFSITransactionType.CORPORATE_GUARANTEE,
    creditRating: "BBB",
    feeRange: { min: 0.75, max: 1.50 },
    tenorAdjustment: { shortTerm: -0.15, longTerm: 0.30 },
    methodology: "Credit default swap plus administrative margin",
  },
  {
    guaranteeType: BFSITransactionType.CORPORATE_GUARANTEE,
    creditRating: "BB",
    feeRange: { min: 1.25, max: 2.50 },
    tenorAdjustment: { shortTerm: -0.20, longTerm: 0.40 },
    methodology: "Credit default swap plus administrative margin",
  },
  {
    guaranteeType: BFSITransactionType.PERFORMANCE_GUARANTEE,
    creditRating: "Standard",
    feeRange: { min: 0.50, max: 2.00 },
    tenorAdjustment: { shortTerm: -0.10, longTerm: 0.25 },
    methodology: "Bank margin on performance bond",
  },
  {
    guaranteeType: BFSITransactionType.LETTER_OF_CREDIT,
    creditRating: "Standard",
    feeRange: { min: 0.125, max: 1.00 },
    tenorAdjustment: { shortTerm: 0, longTerm: 0.15 },
    methodology: "LC commission rates from banks",
  },
];

// =============================================================================
// INSURANCE PRICING PARAMETERS
// =============================================================================

export interface InsurancePricingParameter {
  coverageType: string;
  baseRate: number; // per 1000 sum insured
  riskFactors: RiskFactor[];
  commissionRange: { min: number; max: number };
  loadingFactors: string[];
}

export interface RiskFactor {
  factor: string;
  multiplier: number;
}

export const CAPTIVE_INSURANCE_PARAMETERS: InsurancePricingParameter[] = [
  {
    coverageType: "Property All Risk",
    baseRate: 0.15,
    riskFactors: [
      { factor: "Manufacturing industry", multiplier: 1.2 },
      { factor: "Natural disaster prone area", multiplier: 1.5 },
      { factor: "Fire protection systems", multiplier: 0.8 },
    ],
    commissionRange: { min: 5, max: 15 },
    loadingFactors: ["Deductible", "Sum insured", "Claims history"],
  },
  {
    coverageType: "Business Interruption",
    baseRate: 0.10,
    riskFactors: [
      { factor: "Single location dependency", multiplier: 1.3 },
      { factor: "Diversified operations", multiplier: 0.9 },
    ],
    commissionRange: { min: 5, max: 12 },
    loadingFactors: ["Indemnity period", "Revenue concentration"],
  },
  {
    coverageType: "Directors & Officers Liability",
    baseRate: 0.25,
    riskFactors: [
      { factor: "Listed company", multiplier: 1.5 },
      { factor: "Regulated industry", multiplier: 1.2 },
    ],
    commissionRange: { min: 10, max: 20 },
    loadingFactors: ["Limit of liability", "Claims history", "Industry sector"],
  },
  {
    coverageType: "Product Liability",
    baseRate: 0.20,
    riskFactors: [
      { factor: "Consumer products", multiplier: 1.4 },
      { factor: "Export to US market", multiplier: 2.0 },
    ],
    commissionRange: { min: 8, max: 18 },
    loadingFactors: ["Product type", "Geographic spread", "Quality controls"],
  },
];

// =============================================================================
// TREASURY SERVICES BENCHMARKS
// =============================================================================

export interface TreasuryServiceFee {
  service: string;
  feeType: "percentage" | "flat" | "tiered";
  feeRange: { min: number; max: number };
  basis: string;
  industry: string;
}

export const TREASURY_SERVICE_FEES: TreasuryServiceFee[] = [
  {
    service: "Cash Pooling - Notional",
    feeType: "percentage",
    feeRange: { min: 0.05, max: 0.15 },
    basis: "Per annum on average balance",
    industry: "Banking",
  },
  {
    service: "Cash Pooling - Physical",
    feeType: "percentage",
    feeRange: { min: 0.10, max: 0.25 },
    basis: "Per annum on swept amounts",
    industry: "Banking",
  },
  {
    service: "FX Hedging",
    feeType: "percentage",
    feeRange: { min: 0.05, max: 0.20 },
    basis: "Per transaction notional",
    industry: "Banking",
  },
  {
    service: "Interest Rate Hedging",
    feeType: "percentage",
    feeRange: { min: 0.02, max: 0.10 },
    basis: "Per annum on notional",
    industry: "Banking",
  },
  {
    service: "Correspondent Banking",
    feeType: "flat",
    feeRange: { min: 10, max: 50 },
    basis: "Per transaction USD",
    industry: "Banking",
  },
  {
    service: "Trade Finance - LC Issuance",
    feeType: "percentage",
    feeRange: { min: 0.125, max: 0.50 },
    basis: "Per quarter on LC value",
    industry: "Banking",
  },
  {
    service: "Trade Finance - LC Confirmation",
    feeType: "percentage",
    feeRange: { min: 0.10, max: 0.40 },
    basis: "Per quarter on LC value",
    industry: "Banking",
  },
  {
    service: "Custody Services",
    feeType: "tiered",
    feeRange: { min: 0.01, max: 0.10 },
    basis: "Per annum on AUC",
    industry: "Asset Management",
  },
  {
    service: "Fund Administration",
    feeType: "tiered",
    feeRange: { min: 0.02, max: 0.15 },
    basis: "Per annum on NAV",
    industry: "Asset Management",
  },
];

// =============================================================================
// NBFC LENDING PARAMETERS
// =============================================================================

export interface NBFCLendingParameter {
  loanType: string;
  tenorRange: { min: number; max: number }; // months
  spreadOverBase: { min: number; max: number }; // percentage
  processingFee: { min: number; max: number }; // percentage
  typicalSecurity: string[];
}

export const NBFC_LENDING_PARAMETERS: NBFCLendingParameter[] = [
  {
    loanType: "Working Capital",
    tenorRange: { min: 6, max: 12 },
    spreadOverBase: { min: 2.0, max: 5.0 },
    processingFee: { min: 0.50, max: 1.50 },
    typicalSecurity: ["Receivables", "Inventory", "Corporate guarantee"],
  },
  {
    loanType: "Term Loan - Secured",
    tenorRange: { min: 12, max: 84 },
    spreadOverBase: { min: 1.5, max: 4.0 },
    processingFee: { min: 0.50, max: 1.00 },
    typicalSecurity: ["Fixed assets", "Property", "Corporate guarantee"],
  },
  {
    loanType: "Term Loan - Unsecured",
    tenorRange: { min: 12, max: 60 },
    spreadOverBase: { min: 3.0, max: 7.0 },
    processingFee: { min: 1.00, max: 2.00 },
    typicalSecurity: ["Personal guarantee", "Corporate guarantee"],
  },
  {
    loanType: "Equipment Finance",
    tenorRange: { min: 12, max: 60 },
    spreadOverBase: { min: 2.0, max: 5.0 },
    processingFee: { min: 0.50, max: 1.50 },
    typicalSecurity: ["Equipment financed", "Hypothecation"],
  },
  {
    loanType: "Factoring",
    tenorRange: { min: 1, max: 3 },
    spreadOverBase: { min: 2.5, max: 6.0 },
    processingFee: { min: 0.25, max: 1.00 },
    typicalSecurity: ["Receivables assigned", "Credit insurance"],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get benchmark rate for currency
 */
export function getBenchmarkRate(currency: string): InterestRateBenchmark | undefined {
  return INTEREST_RATE_BENCHMARKS.find((b) => b.currency === currency);
}

/**
 * Get credit spread for rating
 */
export function getCreditSpread(rating: string): number {
  const spread = CREDIT_RATING_SPREADS.find((s) => s.rating === rating);
  return spread?.spread || 400; // Default to 400 bps if not found
}

/**
 * Calculate guarantee fee range
 */
export function getGuaranteeFeeRange(
  guaranteeType: BFSITransactionType,
  creditRating: string,
  tenorMonths: number
): { min: number; max: number } {
  const range = GUARANTEE_FEE_RANGES.find(
    (g) => g.guaranteeType === guaranteeType && g.creditRating.startsWith(creditRating.substring(0, 1))
  );

  if (!range) {
    return { min: 0.50, max: 1.50 }; // Default range
  }

  const tenorAdjustment = tenorMonths <= 12
    ? range.tenorAdjustment.shortTerm
    : tenorMonths > 36
      ? range.tenorAdjustment.longTerm
      : 0;

  return {
    min: range.feeRange.min + tenorAdjustment,
    max: range.feeRange.max + tenorAdjustment,
  };
}

/**
 * Calculate interest rate with spread
 */
export function calculateInterestRate(
  currency: string,
  creditRating: string,
  additionalSpread: number = 0
): { rate: number; breakdown: { benchmark: number; creditSpread: number; additional: number } } {
  const benchmark = getBenchmarkRate(currency);
  const creditSpread = getCreditSpread(creditRating);

  const benchmarkRate = benchmark?.currentRate || 8.0;
  const spreadInPercent = creditSpread / 100;

  return {
    rate: benchmarkRate + spreadInPercent + additionalSpread,
    breakdown: {
      benchmark: benchmarkRate,
      creditSpread: spreadInPercent,
      additional: additionalSpread,
    },
  };
}

/**
 * Get treasury service fee
 */
export function getTreasuryServiceFee(serviceName: string): TreasuryServiceFee | undefined {
  return TREASURY_SERVICE_FEES.find(
    (f) => f.service.toLowerCase().includes(serviceName.toLowerCase())
  );
}

/**
 * Get NBFC lending parameters
 */
export function getNBFCLendingParams(loanType: string): NBFCLendingParameter | undefined {
  return NBFC_LENDING_PARAMETERS.find(
    (p) => p.loanType.toLowerCase().includes(loanType.toLowerCase())
  );
}
