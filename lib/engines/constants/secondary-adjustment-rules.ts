/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Secondary Adjustment Rules (Section 92CE)
 *
 * Based on: Section 92CE of Income Tax Act, 1961
 * Effective: April 1, 2017 (applicable from AY 2017-18)
 * Reference: Finance Act, 2017
 * ================================================================================
 */

// =============================================================================
// SECONDARY ADJUSTMENT THRESHOLDS
// =============================================================================

/**
 * Threshold for primary adjustment to trigger secondary adjustment
 * As per Section 92CE(1), secondary adjustment applies when primary
 * adjustment exceeds Rs. 1 Crore
 */
export const PRIMARY_ADJUSTMENT_THRESHOLD = 10000000; // Rs. 1 Crore = 10,000,000

/**
 * Time limit for repatriation of excess money
 * As per Rule 10CB(2), the excess money must be repatriated within 90 days
 * from the specified date
 */
export const REPATRIATION_DEADLINE_DAYS = 90;

// =============================================================================
// INTEREST RATES FOR DEEMED LOAN
// =============================================================================

/**
 * SBI Base Rates for Deemed Interest Calculation
 * As per Section 92CE(2A), deemed interest is calculated at SBI base rate + margin
 * These are historical SBI base rates (updated periodically)
 */
export const SBI_BASE_RATES: Record<string, number> = {
  "2017-18": 9.10, // Base Rate as of April 2017
  "2018-19": 8.70,
  "2019-20": 8.40,
  "2020-21": 7.40,
  "2021-22": 7.00,
  "2022-23": 7.55,
  "2023-24": 8.25,
  "2024-25": 8.25,
  "2025-26": 8.25, // Current base rate
  "2026-27": 8.25, // Projected
};

/**
 * Margin to be added to SBI base rate for INR denominated transactions
 * As per Rule 10CB(3)(a)
 */
export const INR_MARGIN = 1.0; // 1% margin for INR

/**
 * Margin based on LIBOR for foreign currency denominated transactions
 * As per Rule 10CB(3)(b)
 */
export const FOREIGN_CURRENCY_MARGINS: Record<string, number> = {
  USD: 3.0, // SOFR + 300 bps (LIBOR replacement)
  EUR: 2.5, // EURIBOR + 250 bps
  GBP: 3.0, // SONIA + 300 bps
  JPY: 2.0, // TONAR + 200 bps
  CHF: 2.0, // SARON + 200 bps
  DEFAULT: 3.0, // Default margin for other currencies
};

/**
 * Reference rates for foreign currencies (benchmark rates)
 * Updated: January 2026
 */
export const BENCHMARK_RATES: Record<string, number> = {
  USD_SOFR: 4.35, // Secured Overnight Financing Rate
  EUR_EURIBOR: 3.85, // Euro Interbank Offered Rate
  GBP_SONIA: 4.70, // Sterling Overnight Index Average
  JPY_TONAR: 0.10, // Tokyo Overnight Average Rate
  CHF_SARON: 1.50, // Swiss Average Rate Overnight
};

// =============================================================================
// SECONDARY ADJUSTMENT SCENARIOS
// =============================================================================

/**
 * Scenarios that trigger secondary adjustment
 * As per Section 92CE(1)
 */
export enum SecondaryAdjustmentTrigger {
  /** Primary adjustment made by Assessing Officer */
  AO_ADJUSTMENT = "ao_adjustment",
  /** Primary adjustment made by TPO */
  TPO_ADJUSTMENT = "tpo_adjustment",
  /** Adjustment accepted by assessee (suo motu) */
  VOLUNTARY_ADJUSTMENT = "voluntary_adjustment",
  /** APA determines primary adjustment */
  APA_ADJUSTMENT = "apa_adjustment",
  /** MAP determines primary adjustment */
  MAP_ADJUSTMENT = "map_adjustment",
  /** Safe Harbour applied with adjustment */
  SAFE_HARBOUR_ADJUSTMENT = "safe_harbour_adjustment",
}

/**
 * Options for secondary adjustment treatment
 * As per Section 92CE(2)
 */
export enum SecondaryAdjustmentOption {
  /** Repatriate excess money within 90 days */
  REPATRIATION = "repatriation",
  /** Treat as deemed dividend under Section 2(22)(e) */
  DEEMED_DIVIDEND = "deemed_dividend",
  /** Treat as deemed loan with interest */
  DEEMED_LOAN = "deemed_loan",
  /** APA/MAP covered - no secondary adjustment */
  APA_MAP_EXEMPT = "apa_map_exempt",
}

// =============================================================================
// DEEMED DIVIDEND RULES (Section 2(22)(e))
// =============================================================================

/**
 * Section 2(22)(e) deemed dividend provisions
 * Applicable when excess money is not repatriated
 */
export interface DeemedDividendRule {
  /** Threshold for deemed dividend */
  threshold: number;
  /** Tax rate on deemed dividend */
  taxRate: number;
  /** Conditions for applicability */
  conditions: string[];
}

export const DEEMED_DIVIDEND_RULES: DeemedDividendRule = {
  threshold: 0, // No threshold - entire excess becomes deemed dividend
  taxRate: 30, // Normal tax rate (plus surcharge/cess)
  conditions: [
    "Shareholder holds substantial interest (10% or more voting power)",
    "Company has accumulated profits",
    "Excess money not repatriated within time limit",
    "Not covered under APA/MAP",
  ],
};

// =============================================================================
// EXEMPTIONS FROM SECONDARY ADJUSTMENT
// =============================================================================

/**
 * Cases exempt from secondary adjustment
 * As per Section 92CE(2B)
 */
export const SECONDARY_ADJUSTMENT_EXEMPTIONS = {
  /** APA entered into before April 1, 2017 */
  APA_PRE_2017: {
    code: "APA_PRE_2017",
    description: "APA entered into before April 1, 2017",
    applicableFrom: "2017-04-01",
  },
  /** MAP conclusion before April 1, 2017 */
  MAP_PRE_2017: {
    code: "MAP_PRE_2017",
    description: "MAP concluded before April 1, 2017",
    applicableFrom: "2017-04-01",
  },
  /** Primary adjustment less than threshold */
  BELOW_THRESHOLD: {
    code: "BELOW_THRESHOLD",
    description: "Primary adjustment is less than Rs. 1 Crore",
    applicableFrom: "2017-04-01",
  },
  /** Safe harbour cases (effective from AY 2020-21) */
  SAFE_HARBOUR: {
    code: "SAFE_HARBOUR",
    description: "Safe Harbour provisions opted and conditions met",
    applicableFrom: "2019-04-01",
  },
};

// =============================================================================
// REPATRIATION MODES
// =============================================================================

/**
 * Valid modes of repatriation
 * As per Rule 10CB(4)
 */
export enum RepatriationMode {
  /** Direct remittance through banking channels */
  DIRECT_REMITTANCE = "direct_remittance",
  /** Adjustment against payables */
  PAYABLE_ADJUSTMENT = "payable_adjustment",
  /** Adjustment against receivables */
  RECEIVABLE_ADJUSTMENT = "receivable_adjustment",
  /** Set-off against existing advances */
  ADVANCE_SETOFF = "advance_setoff",
  /** Declaration of dividend */
  DIVIDEND_DECLARATION = "dividend_declaration",
}

/**
 * Documentation required for repatriation
 */
export const REPATRIATION_DOCUMENTATION = [
  "Bank statement showing remittance",
  "FIRC (Foreign Inward Remittance Certificate) if applicable",
  "Ledger account showing adjustment",
  "Board resolution for adjustment (if applicable)",
  "Form 15CB certification by CA",
  "Form 15CA submission to IT department",
];

// =============================================================================
// COMPUTATION RULES
// =============================================================================

/**
 * Rules for computing secondary adjustment
 */
export interface SecondaryAdjustmentComputationRule {
  /** Step number */
  step: number;
  /** Description of the step */
  description: string;
  /** Formula or method */
  formula: string;
}

export const COMPUTATION_STEPS: SecondaryAdjustmentComputationRule[] = [
  {
    step: 1,
    description: "Determine primary adjustment amount",
    formula: "ALP - Transaction Value = Primary Adjustment",
  },
  {
    step: 2,
    description: "Check if primary adjustment exceeds Rs. 1 Crore",
    formula: "Primary Adjustment > 10,000,000",
  },
  {
    step: 3,
    description: "Calculate excess money in hands of AE",
    formula: "Excess Money = Primary Adjustment (net of tax withheld)",
  },
  {
    step: 4,
    description: "Determine repatriation deadline",
    formula: "Deadline = Date of Order + 90 days",
  },
  {
    step: 5,
    description: "If not repatriated - calculate deemed interest",
    formula: "Interest = Excess Money × (SBI Rate + Margin) × Days / 365",
  },
  {
    step: 6,
    description: "Alternative: Treat as deemed dividend if applicable",
    formula: "Deemed Dividend = Excess Money (subject to Section 2(22)(e))",
  },
];

// =============================================================================
// FORM 3CEB DISCLOSURE REQUIREMENTS
// =============================================================================

/**
 * Secondary adjustment disclosure requirements in Form 3CEB
 */
export const FORM_3CEB_SECONDARY_ADJUSTMENT_FIELDS = {
  /** Primary adjustment details */
  primaryAdjustment: {
    field: "Part B - Clause 24",
    description: "Details of primary adjustment made/accepted",
    required: true,
  },
  /** Secondary adjustment chosen option */
  secondaryOption: {
    field: "Part B - Clause 25",
    description: "Option chosen for secondary adjustment",
    required: true,
  },
  /** Repatriation details */
  repatriationDetails: {
    field: "Part B - Clause 26",
    description: "Details of repatriation if opted",
    required: false, // Required only if repatriation chosen
  },
  /** Deemed interest computation */
  deemedInterest: {
    field: "Part B - Clause 27",
    description: "Computation of deemed interest if applicable",
    required: false, // Required only if deemed loan treatment
  },
};

// =============================================================================
// ASSESSMENT YEAR SPECIFIC RULES
// =============================================================================

/**
 * Assessment Year specific rules for secondary adjustment
 */
export interface AYSpecificRule {
  assessmentYear: string;
  applicableFrom: string;
  threshold: number;
  repatriationDays: number;
  interestRate: number;
  specialProvisions: string[];
}

export const AY_SPECIFIC_RULES: Record<string, AYSpecificRule> = {
  "2017-18": {
    assessmentYear: "2017-18",
    applicableFrom: "2016-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 10.1, // SBI 9.1% + 1%
    specialProvisions: ["First year of applicability"],
  },
  "2018-19": {
    assessmentYear: "2018-19",
    applicableFrom: "2017-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 9.7,
    specialProvisions: [],
  },
  "2019-20": {
    assessmentYear: "2019-20",
    applicableFrom: "2018-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 9.4,
    specialProvisions: ["Safe Harbour exemption introduced"],
  },
  "2020-21": {
    assessmentYear: "2020-21",
    applicableFrom: "2019-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 8.4,
    specialProvisions: ["COVID extensions available"],
  },
  "2021-22": {
    assessmentYear: "2021-22",
    applicableFrom: "2020-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 8.0,
    specialProvisions: [],
  },
  "2022-23": {
    assessmentYear: "2022-23",
    applicableFrom: "2021-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 8.55,
    specialProvisions: [],
  },
  "2023-24": {
    assessmentYear: "2023-24",
    applicableFrom: "2022-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 9.25,
    specialProvisions: [],
  },
  "2024-25": {
    assessmentYear: "2024-25",
    applicableFrom: "2023-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 9.25,
    specialProvisions: [],
  },
  "2025-26": {
    assessmentYear: "2025-26",
    applicableFrom: "2024-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 9.25,
    specialProvisions: [],
  },
  "2026-27": {
    assessmentYear: "2026-27",
    applicableFrom: "2025-04-01",
    threshold: 10000000,
    repatriationDays: 90,
    interestRate: 9.25,
    specialProvisions: ["Current assessment year"],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get applicable interest rate for secondary adjustment
 * @param assessmentYear Assessment year (e.g., "2025-26")
 * @param currency Currency code (default: INR)
 * @returns Interest rate percentage
 */
export function getSecondaryAdjustmentInterestRate(
  assessmentYear: string,
  currency: string = "INR"
): number {
  if (currency === "INR") {
    const baseRate = SBI_BASE_RATES[assessmentYear] || SBI_BASE_RATES["2026-27"];
    return baseRate + INR_MARGIN;
  }

  // For foreign currency
  const benchmarkKey = `${currency}_SOFR`;
  const benchmarkRate = BENCHMARK_RATES[benchmarkKey as keyof typeof BENCHMARK_RATES] ||
    BENCHMARK_RATES.USD_SOFR;
  const margin = FOREIGN_CURRENCY_MARGINS[currency] ||
    FOREIGN_CURRENCY_MARGINS.DEFAULT;

  return benchmarkRate + margin;
}

/**
 * Check if secondary adjustment is applicable
 * @param primaryAdjustment Primary adjustment amount
 * @param trigger Trigger for the adjustment
 * @returns Whether secondary adjustment applies
 */
export function isSecondaryAdjustmentApplicable(
  primaryAdjustment: number,
  trigger: SecondaryAdjustmentTrigger
): boolean {
  // Check threshold
  if (Math.abs(primaryAdjustment) < PRIMARY_ADJUSTMENT_THRESHOLD) {
    return false;
  }

  // Check if exempt under APA/MAP
  if (
    trigger === SecondaryAdjustmentTrigger.APA_ADJUSTMENT ||
    trigger === SecondaryAdjustmentTrigger.MAP_ADJUSTMENT
  ) {
    return false; // May be exempt based on date
  }

  return true;
}

/**
 * Calculate repatriation deadline
 * @param orderDate Date of the order/adjustment
 * @returns Deadline date for repatriation
 */
export function calculateRepatriationDeadline(orderDate: Date): Date {
  const deadline = new Date(orderDate);
  deadline.setDate(deadline.getDate() + REPATRIATION_DEADLINE_DAYS);
  return deadline;
}

/**
 * Calculate deemed interest on excess money
 * @param excessMoney Excess money amount
 * @param interestRate Annual interest rate percentage
 * @param daysOutstanding Number of days outstanding
 * @returns Deemed interest amount
 */
export function calculateDeemedInterest(
  excessMoney: number,
  interestRate: number,
  daysOutstanding: number
): number {
  return (excessMoney * (interestRate / 100) * daysOutstanding) / 365;
}

/**
 * Get assessment year specific rules
 * @param assessmentYear Assessment year
 * @returns AY specific rules or default
 */
export function getAYRules(assessmentYear: string): AYSpecificRule {
  return AY_SPECIFIC_RULES[assessmentYear] || AY_SPECIFIC_RULES["2026-27"];
}

/**
 * Check if repatriation deadline has passed
 * @param orderDate Date of the order
 * @param currentDate Current date (optional, defaults to now)
 * @returns Whether deadline has passed
 */
export function isRepatriationDeadlinePassed(
  orderDate: Date,
  currentDate: Date = new Date()
): boolean {
  const deadline = calculateRepatriationDeadline(orderDate);
  return currentDate > deadline;
}

/**
 * Get days remaining for repatriation
 * @param orderDate Date of the order
 * @param currentDate Current date (optional)
 * @returns Days remaining (negative if passed)
 */
export function getDaysRemainingForRepatriation(
  orderDate: Date,
  currentDate: Date = new Date()
): number {
  const deadline = calculateRepatriationDeadline(orderDate);
  const diffTime = deadline.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
