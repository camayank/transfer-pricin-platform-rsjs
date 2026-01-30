/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Thin Capitalization Rules (Section 94B)
 *
 * Based on: Section 94B of Income Tax Act, 1961
 * Effective: AY 2018-19 onwards (April 1, 2017)
 * Reference: Finance Act, 2017
 * ================================================================================
 */

// =============================================================================
// THIN CAPITALIZATION THRESHOLDS
// =============================================================================

/**
 * Interest expense threshold for Section 94B applicability
 * Section 94B applies when interest exceeds Rs. 1 Crore
 */
export const INTEREST_THRESHOLD = 10000000; // Rs. 1 Crore

/**
 * EBITDA limitation percentage
 * Maximum allowable interest deduction = 30% of EBITDA
 */
export const EBITDA_LIMITATION_PERCENTAGE = 30;

/**
 * Carryforward period for disallowed interest
 * Disallowed interest can be carried forward for 8 assessment years
 */
export const CARRYFORWARD_YEARS = 8;

// =============================================================================
// SECTION 94B PROVISIONS
// =============================================================================

/**
 * Types of entities covered under Section 94B
 */
export enum Section94BEntityType {
  /** Indian company */
  INDIAN_COMPANY = "indian_company",
  /** Permanent Establishment of foreign company */
  PE_FOREIGN_COMPANY = "pe_foreign_company",
  /** LLP (if applicable) */
  LLP = "llp",
}

/**
 * Types of lenders triggering Section 94B
 */
export enum LenderType {
  /** Non-resident Associated Enterprise */
  NON_RESIDENT_AE = "non_resident_ae",
  /** Non-resident third party with AE guarantee */
  NON_RESIDENT_GUARANTEED = "non_resident_guaranteed",
  /** Resident lender with AE deposit */
  RESIDENT_WITH_AE_DEPOSIT = "resident_with_ae_deposit",
  /** Resident lender without AE connection */
  RESIDENT_NON_AE = "resident_non_ae",
}

/**
 * Section 94B applicability criteria
 */
export const SECTION_94B_CRITERIA = {
  /** Minimum interest expense threshold */
  interestThreshold: INTEREST_THRESHOLD,
  /** EBITDA limitation percentage */
  ebitdaLimitation: EBITDA_LIMITATION_PERCENTAGE,
  /** Carryforward period */
  carryforwardYears: CARRYFORWARD_YEARS,
  /** Applicable from */
  applicableFrom: "2017-04-01",
  /** First applicable AY */
  firstApplicableAY: "2018-19",
};

// =============================================================================
// EXEMPT ENTITIES
// =============================================================================

/**
 * Entities exempt from Section 94B
 */
export const EXEMPT_ENTITIES = [
  {
    code: "BANK",
    description: "Company engaged in banking business",
    section: "5(c) of BR Act 1949",
  },
  {
    code: "INSURANCE",
    description: "Company engaged in insurance business",
    section: "Insurance Act 1938",
  },
  {
    code: "NBFC_SYSTEMICALLY_IMPORTANT",
    description: "NBFC classified as systemically important by RBI",
    section: "RBI regulations",
  },
  {
    code: "INFRASTRUCTURE_PPP",
    description: "Infrastructure project entity under PPP",
    section: "Notification specific",
  },
];

/**
 * Check if entity type is exempt
 */
export function isExemptEntity(entityCode: string): boolean {
  return EXEMPT_ENTITIES.some((e) => e.code === entityCode);
}

// =============================================================================
// EBITDA COMPUTATION RULES
// =============================================================================

/**
 * Components for EBITDA calculation
 */
export interface EBITDAComponents {
  /** Profit before tax as per P&L */
  profitBeforeTax: number;
  /** Add: Interest expense */
  interestExpense: number;
  /** Add: Depreciation */
  depreciation: number;
  /** Add: Amortization */
  amortization: number;
  /** Less: Interest income (if netted) */
  interestIncome?: number;
  /** Adjustments for exceptional items */
  exceptionalItems?: number;
}

/**
 * EBITDA calculation method
 * As per Section 94B read with Rule 10TD
 */
export const EBITDA_CALCULATION = {
  formula: "PBT + Interest Expense + Depreciation + Amortization",
  components: [
    "Profit Before Tax (as per P&L)",
    "Add: Interest expense claimed as deduction",
    "Add: Depreciation as per books",
    "Add: Amortization as per books",
  ],
  exclusions: [
    "Exceptional/extraordinary items may be excluded",
    "One-time gains/losses may be adjusted",
  ],
};

// =============================================================================
// INTEREST EXPENSE RULES
// =============================================================================

/**
 * Types of interest covered under Section 94B
 */
export const COVERED_INTEREST_TYPES = [
  {
    type: "LOAN_INTEREST",
    description: "Interest on loans from non-resident AE",
    covered: true,
  },
  {
    type: "BOND_INTEREST",
    description: "Interest on bonds/debentures to non-resident AE",
    covered: true,
  },
  {
    type: "GUARANTEED_LOAN",
    description: "Interest on loan where AE has provided guarantee",
    covered: true,
  },
  {
    type: "BACK_TO_BACK_LOAN",
    description: "Interest on loan funded by AE deposits",
    covered: true,
  },
  {
    type: "TRADE_CREDIT",
    description: "Interest on trade credit from non-resident AE",
    covered: true,
  },
  {
    type: "DOMESTIC_LOAN",
    description: "Interest on loans from domestic parties (non-AE)",
    covered: false,
  },
];

/**
 * Check if interest type is covered
 */
export function isInterestCovered(interestType: string): boolean {
  const type = COVERED_INTEREST_TYPES.find((t) => t.type === interestType);
  return type?.covered ?? false;
}

// =============================================================================
// CARRYFORWARD RULES
// =============================================================================

/**
 * Carryforward rules for disallowed interest
 */
export const CARRYFORWARD_RULES = {
  /** Maximum years */
  maxYears: CARRYFORWARD_YEARS,
  /** Can be set off against */
  setOffAgainst: "Income from business or profession",
  /** Subject to limitation */
  subjectTo: "30% of EBITDA in subsequent year",
  /** Order of utilization */
  utilizationOrder: "FIFO - First in, first out",
  /** Conditions for carryforward */
  conditions: [
    "Same business must continue",
    "Books of account must be maintained",
    "Return must be filed within due date",
  ],
};

// =============================================================================
// NOTIFICATION AND CIRCULARS
// =============================================================================

/**
 * Relevant notifications and circulars
 */
export const RELEVANT_NOTIFICATIONS = [
  {
    number: "Notification No. 12/2019",
    date: "2019-02-28",
    subject: "Infrastructure projects exemption under Section 94B",
    keyPoints: ["PPP projects for infrastructure exempt from 94B"],
  },
  {
    number: "Circular No. 22/2017",
    date: "2017-06-21",
    subject: "Clarification on Section 94B provisions",
    keyPoints: [
      "Interest threshold of Rs. 1 Cr per AY",
      "EBITDA as per Indian GAAP",
    ],
  },
];

// =============================================================================
// ASSESSMENT YEAR SPECIFIC RULES
// =============================================================================

/**
 * AY-specific rules and rates
 */
export interface AYThinCapRule {
  assessmentYear: string;
  interestThreshold: number;
  ebitdaPercentage: number;
  carryforwardYears: number;
  specialProvisions: string[];
}

export const AY_THIN_CAP_RULES: Record<string, AYThinCapRule> = {
  "2018-19": {
    assessmentYear: "2018-19",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: ["First year of applicability"],
  },
  "2019-20": {
    assessmentYear: "2019-20",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: ["Infrastructure PPP exemption notified"],
  },
  "2020-21": {
    assessmentYear: "2020-21",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: [],
  },
  "2021-22": {
    assessmentYear: "2021-22",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: [],
  },
  "2022-23": {
    assessmentYear: "2022-23",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: [],
  },
  "2023-24": {
    assessmentYear: "2023-24",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: [],
  },
  "2024-25": {
    assessmentYear: "2024-25",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: [],
  },
  "2025-26": {
    assessmentYear: "2025-26",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: [],
  },
  "2026-27": {
    assessmentYear: "2026-27",
    interestThreshold: 10000000,
    ebitdaPercentage: 30,
    carryforwardYears: 8,
    specialProvisions: ["Current assessment year"],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate allowable interest based on EBITDA
 * @param ebitda EBITDA amount
 * @returns Maximum allowable interest
 */
export function calculateAllowableInterest(ebitda: number): number {
  return ebitda * (EBITDA_LIMITATION_PERCENTAGE / 100);
}

/**
 * Calculate disallowed interest
 * @param totalInterest Total interest expense
 * @param allowableInterest Allowable interest (30% of EBITDA)
 * @returns Disallowed interest amount
 */
export function calculateDisallowedInterest(
  totalInterest: number,
  allowableInterest: number
): number {
  return Math.max(0, totalInterest - allowableInterest);
}

/**
 * Check if Section 94B is applicable
 * @param totalInterest Total interest paid to non-resident AE
 * @param entityType Type of entity
 * @returns Whether Section 94B applies
 */
export function isSection94BApplicable(
  totalInterest: number,
  entityType: string
): boolean {
  // Check threshold
  if (totalInterest <= INTEREST_THRESHOLD) {
    return false;
  }

  // Check exempt entities
  if (isExemptEntity(entityType)) {
    return false;
  }

  return true;
}

/**
 * Calculate EBITDA from components
 * @param components EBITDA components
 * @returns EBITDA amount
 */
export function calculateEBITDA(components: EBITDAComponents): number {
  return (
    components.profitBeforeTax +
    components.interestExpense +
    components.depreciation +
    components.amortization -
    (components.interestIncome || 0)
  );
}

/**
 * Get AY-specific rules
 * @param assessmentYear Assessment year
 * @returns AY-specific thin cap rules
 */
export function getAYThinCapRules(assessmentYear: string): AYThinCapRule {
  return AY_THIN_CAP_RULES[assessmentYear] || AY_THIN_CAP_RULES["2026-27"];
}

/**
 * Calculate maximum carryforward expiry year
 * @param disallowanceYear Year of disallowance
 * @returns Last year to utilize
 */
export function getCarryforwardExpiryYear(disallowanceYear: string): string {
  const startYear = parseInt(disallowanceYear.split("-")[0]);
  const expiryYear = startYear + CARRYFORWARD_YEARS;
  return `${expiryYear}-${(expiryYear + 1).toString().slice(-2)}`;
}

/**
 * Validate if carryforward is still valid
 * @param disallowanceYear Year of original disallowance
 * @param currentYear Current assessment year
 * @returns Whether carryforward is still valid
 */
export function isCarryforwardValid(
  disallowanceYear: string,
  currentYear: string
): boolean {
  const disallowanceStart = parseInt(disallowanceYear.split("-")[0]);
  const currentStart = parseInt(currentYear.split("-")[0]);
  const yearsDiff = currentStart - disallowanceStart;

  return yearsDiff <= CARRYFORWARD_YEARS;
}

/**
 * Get Section 94B description
 */
export function getSection94BDescription(): string {
  return (
    "Section 94B - Limitation on interest deduction\n\n" +
    "Where an Indian company, or a permanent establishment of a foreign company, being the borrower, " +
    "incurs any expenditure by way of interest or of similar nature exceeding Rs. 1 crore, " +
    "payable to a non-resident associated enterprise, the deduction shall be limited to " +
    "30% of its EBITDA or the interest paid/payable to AE, whichever is less.\n\n" +
    "The disallowed interest can be carried forward for 8 assessment years."
  );
}
