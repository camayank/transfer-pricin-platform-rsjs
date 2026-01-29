/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Safe Harbour Rules - Constants & Configuration
 *
 * Based on: Income Tax Rules 10TD, 10TE, 10TF
 * Valid for: AY 2020-21 to AY 2026-27 (Extended)
 *
 * Reference: CBDT Notification No. 46/2017, amended by subsequent notifications
 * ================================================================================
 */

import { SafeHarbourTransactionType, CreditRating } from "../types";

// =============================================================================
// SBI REFERENCE RATES
// =============================================================================

/**
 * SBI Reference Rates - Update these periodically
 * Source: State Bank of India official website
 */
export const SBI_RATES = {
  // Base Rate (for FC loans)
  baseRate: 10.15,
  baseRateEffectiveFrom: "2024-04-01",

  // MCLR Rates (for INR loans)
  mclr: {
    overnight: 8.4,
    oneMonth: 8.45,
    threeMonth: 8.5,
    sixMonth: 8.65,
    oneYear: 8.7, // Used for Safe Harbour
    twoYear: 8.85,
    threeYear: 8.95,
  },
  mclrEffectiveFrom: "2024-04-15",

  // Last updated timestamp
  lastUpdated: "2024-04-15",

  // Note for users
  note: "Update these rates periodically from SBI website. Safe Harbour uses Base Rate for FC loans and 1-Year MCLR for INR loans.",
};

// =============================================================================
// SAFE HARBOUR RULES - COMPLETE DEFINITION
// =============================================================================

export interface SafeHarbourThreshold {
  condition: string;
  margin?: number; // For service transactions (percentage)
  spread?: number; // For loans (basis points)
  rate?: number; // For guarantees (percentage)
  employeeCostRatioMin?: number;
  employeeCostRatioMax?: number;
  creditRatings?: CreditRating[];
}

export interface SafeHarbourRule {
  code: SafeHarbourTransactionType;
  name: string;
  description: string;
  section: string; // Income Tax Rule reference
  marginType: "OP/OC" | "Interest Rate" | "Commission";
  unit: "percentage" | "bps" | "rate";
  thresholds: SafeHarbourThreshold[];
  eligibilityConditions: string[];
  maxTransactionValue: number; // In crores
  validFrom: string; // Assessment Year
  validTo: string; // Assessment Year
  formRequired: string; // Form 3CEFA
  notes: string[];
}

/**
 * Complete Safe Harbour Rules as per Indian Income Tax
 */
export const SAFE_HARBOUR_RULES: Record<
  SafeHarbourTransactionType,
  SafeHarbourRule
> = {
  // =========================================================================
  // 1. IT/ITeS SERVICES
  // =========================================================================
  [SafeHarbourTransactionType.IT_ITES]: {
    code: SafeHarbourTransactionType.IT_ITES,
    name: "IT & IT-enabled Services",
    description:
      "Provision of software development services or IT-enabled services (BPO, call centers, data processing, etc.)",
    section: "Rule 10TD(2)",
    marginType: "OP/OC",
    unit: "percentage",
    thresholds: [
      {
        condition: "Normal case (no significant ownership)",
        margin: 17,
      },
      {
        condition: "Significant ownership (>50% by single foreign company)",
        margin: 18,
      },
    ],
    eligibilityConditions: [
      "Services provided to Associated Enterprise outside India",
      "Aggregate value of transactions <= Rs. 200 crore",
      "Must maintain prescribed documentation",
      "Entity must not be engaged in unique or high-value intangibles",
    ],
    maxTransactionValue: 200,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Significant ownership means >50% shares held by a single foreign company",
      "Operating margin = (Operating Profit / Operating Cost) x 100",
      "Operating Cost excludes interest, depreciation on assets not used for services",
    ],
  },

  // =========================================================================
  // 2. KPO SERVICES
  // =========================================================================
  [SafeHarbourTransactionType.KPO]: {
    code: SafeHarbourTransactionType.KPO,
    name: "Knowledge Process Outsourcing",
    description:
      "Provision of KPO services including research, analytics, data analysis, legal services, engineering design, etc.",
    section: "Rule 10TD(3)",
    marginType: "OP/OC",
    unit: "percentage",
    thresholds: [
      {
        condition: "Employee cost < 40% of total operating cost",
        margin: 18,
        employeeCostRatioMin: 0,
        employeeCostRatioMax: 40,
      },
      {
        condition: "Employee cost >= 40% and < 60% of total operating cost",
        margin: 21,
        employeeCostRatioMin: 40,
        employeeCostRatioMax: 60,
      },
      {
        condition: "Employee cost >= 60% of total operating cost",
        margin: 24,
        employeeCostRatioMin: 60,
        employeeCostRatioMax: 100,
      },
    ],
    eligibilityConditions: [
      "Services provided to Associated Enterprise outside India",
      "Aggregate value of transactions <= Rs. 200 crore",
      "Services must qualify as KPO (knowledge-based, requiring specialized skills)",
      "Must maintain employee cost breakup documentation",
    ],
    maxTransactionValue: 200,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Employee cost ratio = (Employee Cost / Total Operating Cost) x 100",
      "Employee cost includes salaries, wages, bonus, PF, gratuity, ESOP cost",
      "Total operating cost excludes depreciation and interest",
      "Higher employee cost ratio indicates more knowledge-intensive services",
    ],
  },

  // =========================================================================
  // 3. CONTRACT R&D - SOFTWARE
  // =========================================================================
  [SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE]: {
    code: SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
    name: "Contract R&D Services - Software Development",
    description:
      "Provision of contract research and development services in software development to Associated Enterprise",
    section: "Rule 10TD(4)",
    marginType: "OP/OC",
    unit: "percentage",
    thresholds: [
      {
        condition: "All cases",
        margin: 24,
      },
    ],
    eligibilityConditions: [
      "R&D services provided to Associated Enterprise outside India",
      "Aggregate value of transactions <= Rs. 200 crore",
      "Services must be contract R&D (not resulting in ownership of IP by Indian entity)",
      "All risks borne by foreign AE",
      "Indian entity acts as a service provider only",
    ],
    maxTransactionValue: 200,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Contract R&D means services where IP ownership remains with AE",
      "Indian entity should not bear development risk",
      "Higher margin (24%) reflects R&D nature of services",
      "Documentation should clearly establish contract R&D arrangement",
    ],
  },

  // =========================================================================
  // 4. CONTRACT R&D - PHARMA/GENERIC
  // =========================================================================
  [SafeHarbourTransactionType.CONTRACT_RD_PHARMA]: {
    code: SafeHarbourTransactionType.CONTRACT_RD_PHARMA,
    name: "Contract R&D Services - Pharmaceutical & Generic Drugs",
    description:
      "Provision of contract research and development services in pharmaceutical and generic drug development",
    section: "Rule 10TD(4A)",
    marginType: "OP/OC",
    unit: "percentage",
    thresholds: [
      {
        condition: "All cases",
        margin: 24,
      },
    ],
    eligibilityConditions: [
      "R&D services for pharmaceutical/generic drugs provided to AE outside India",
      "Aggregate value of transactions <= Rs. 200 crore",
      "Services must be contract R&D (not resulting in ownership of IP)",
      "Indian entity acts as contract research organization",
      "All development risks borne by foreign AE",
    ],
    maxTransactionValue: 200,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Includes services like drug discovery, clinical trials support, ANDA filing support",
      "Does not apply if Indian entity develops proprietary molecules",
      "Regulatory filing work can qualify if done on contract basis",
    ],
  },

  // =========================================================================
  // 5. AUTO ANCILLARY MANUFACTURING
  // =========================================================================
  [SafeHarbourTransactionType.AUTO_ANCILLARY]: {
    code: SafeHarbourTransactionType.AUTO_ANCILLARY,
    name: "Manufacture & Export of Auto Components",
    description:
      "Manufacture and export of core auto components to Associated Enterprise",
    section: "Rule 10TD(5)",
    marginType: "OP/OC",
    unit: "percentage",
    thresholds: [
      {
        condition: "All cases",
        margin: 12,
      },
    ],
    eligibilityConditions: [
      "Manufacture and export of core auto components",
      "Sale to Associated Enterprise outside India",
      "Aggregate value of transactions <= Rs. 200 crore",
      "Components must be for motor vehicles",
      "Manufacturing activity must be in India",
    ],
    maxTransactionValue: 200,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Core auto components include engine parts, transmission, braking systems, etc.",
      "Does not include accessories or non-core parts",
      "Manufacturing should be substantial (not mere assembly)",
      "Lower margin (12%) reflects manufacturing nature",
    ],
  },

  // =========================================================================
  // 6. INTRA-GROUP LOAN - FOREIGN CURRENCY
  // =========================================================================
  [SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY]: {
    code: SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,
    name: "Intra-Group Loan - Foreign Currency",
    description:
      "Advancing of intra-group loans denominated in foreign currency to/from Associated Enterprise",
    section: "Rule 10TD(6)",
    marginType: "Interest Rate",
    unit: "bps",
    thresholds: [
      {
        condition: "Credit rating AAA or AA",
        spread: 150,
        creditRatings: [CreditRating.AAA, CreditRating.AA],
      },
      {
        condition: "Credit rating A",
        spread: 300,
        creditRatings: [CreditRating.A],
      },
      {
        condition: "Credit rating BBB",
        spread: 400,
        creditRatings: [CreditRating.BBB],
      },
      {
        condition: "Credit rating BB",
        spread: 500,
        creditRatings: [CreditRating.BB],
      },
      {
        condition: "Credit rating B, C or D",
        spread: 600,
        creditRatings: [CreditRating.B, CreditRating.C, CreditRating.D],
      },
    ],
    eligibilityConditions: [
      "Loan advanced to or received from Associated Enterprise",
      "Loan denominated in foreign currency (USD, EUR, GBP, etc.)",
      "Aggregate loan amount <= Rs. 100 crore",
      "Loan must be interest-bearing",
      "Credit rating must be obtained from recognized agency",
    ],
    maxTransactionValue: 100,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Interest rate = SBI Base Rate + Spread (in bps)",
      "Current SBI Base Rate should be used",
      "Credit rating of borrower to be considered",
      "If no credit rating, use rating of parent or standalone assessment",
      "Spread is added to base rate (e.g., 150 bps = 1.5%)",
    ],
  },

  // =========================================================================
  // 7. INTRA-GROUP LOAN - INR
  // =========================================================================
  [SafeHarbourTransactionType.LOAN_INR]: {
    code: SafeHarbourTransactionType.LOAN_INR,
    name: "Intra-Group Loan - Indian Rupees",
    description:
      "Advancing of intra-group loans denominated in Indian Rupees to/from Associated Enterprise",
    section: "Rule 10TD(6A)",
    marginType: "Interest Rate",
    unit: "bps",
    thresholds: [
      {
        condition: "Credit rating AAA or AA",
        spread: 175,
        creditRatings: [CreditRating.AAA, CreditRating.AA],
      },
      {
        condition: "Credit rating A",
        spread: 325,
        creditRatings: [CreditRating.A],
      },
      {
        condition: "Credit rating BBB",
        spread: 425,
        creditRatings: [CreditRating.BBB],
      },
      {
        condition: "Credit rating BB",
        spread: 525,
        creditRatings: [CreditRating.BB],
      },
      {
        condition: "Credit rating B, C or D",
        spread: 625,
        creditRatings: [CreditRating.B, CreditRating.C, CreditRating.D],
      },
    ],
    eligibilityConditions: [
      "Loan advanced to or received from Associated Enterprise",
      "Loan denominated in Indian Rupees",
      "Aggregate loan amount <= Rs. 100 crore",
      "Loan must be interest-bearing",
      "Credit rating must be obtained from recognized agency",
    ],
    maxTransactionValue: 100,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Interest rate = SBI 1-Year MCLR + Spread (in bps)",
      "Current SBI 1-Year MCLR should be used",
      "Higher spread compared to FC loans due to currency risk",
      "Credit rating of borrower to be considered",
      "MCLR is Marginal Cost of Funds based Lending Rate",
    ],
  },

  // =========================================================================
  // 8. CORPORATE GUARANTEE
  // =========================================================================
  [SafeHarbourTransactionType.CORPORATE_GUARANTEE]: {
    code: SafeHarbourTransactionType.CORPORATE_GUARANTEE,
    name: "Corporate Guarantee",
    description:
      "Explicit corporate guarantee provided to/by Associated Enterprise",
    section: "Rule 10TD(7)",
    marginType: "Commission",
    unit: "percentage",
    thresholds: [
      {
        condition: "All cases",
        rate: 1.0,
      },
    ],
    eligibilityConditions: [
      "Explicit corporate guarantee provided to or received from AE",
      "Guarantee must be in writing",
      "Aggregate guarantee amount <= Rs. 100 crore",
      "Guarantee must be for borrowings/credit facilities",
      "Performance guarantees not covered",
    ],
    maxTransactionValue: 100,
    validFrom: "2020-21",
    validTo: "2026-27",
    formRequired: "Form 3CEFA",
    notes: [
      "Guarantee commission = 1% per annum on guarantee amount",
      "Calculated on outstanding guarantee amount",
      "Does not apply to implicit guarantees (parental support)",
      "Does not apply to performance guarantees or bid bonds",
      "Letter of comfort may not qualify as explicit guarantee",
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get Safe Harbour rule by transaction type
 */
export function getSafeHarbourRule(
  transactionType: SafeHarbourTransactionType
): SafeHarbourRule {
  return SAFE_HARBOUR_RULES[transactionType];
}

/**
 * Get required margin/rate for a transaction type
 */
export function getRequiredMargin(
  transactionType: SafeHarbourTransactionType,
  options?: {
    employeeCostRatio?: number;
    creditRating?: CreditRating;
    isSignificantOwnership?: boolean;
  }
): number {
  switch (transactionType) {
    case SafeHarbourTransactionType.IT_ITES:
      return options?.isSignificantOwnership ? 18 : 17;

    case SafeHarbourTransactionType.KPO:
      const ratio = options?.employeeCostRatio ?? 0;
      if (ratio < 40) return 18;
      if (ratio < 60) return 21;
      return 24;

    case SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE:
    case SafeHarbourTransactionType.CONTRACT_RD_PHARMA:
      return 24;

    case SafeHarbourTransactionType.AUTO_ANCILLARY:
      return 12;

    case SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY:
    case SafeHarbourTransactionType.LOAN_INR:
      return getInterestRateForLoan(transactionType, options?.creditRating);

    case SafeHarbourTransactionType.CORPORATE_GUARANTEE:
      return 1.0;

    default:
      throw new Error(`Unknown transaction type: ${transactionType}`);
  }
}

/**
 * Calculate interest rate for loan transactions
 */
export function getInterestRateForLoan(
  transactionType:
    | SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY
    | SafeHarbourTransactionType.LOAN_INR,
  creditRating?: CreditRating
): number {
  const baseRate =
    transactionType === SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY
      ? SBI_RATES.baseRate
      : SBI_RATES.mclr.oneYear;

  const rule = SAFE_HARBOUR_RULES[transactionType];
  const rating = creditRating ?? CreditRating.BBB; // Default to BBB if not provided

  // Find matching threshold
  for (const threshold of rule.thresholds) {
    if (threshold.creditRatings?.includes(rating)) {
      return baseRate + threshold.spread! / 100; // Convert bps to percentage
    }
  }

  // Default to highest spread if no match
  return baseRate + 6.0; // 600 bps for B/C/D
}

/**
 * Check if transaction value is within Safe Harbour limits
 */
export function isWithinSafeHarbourLimit(
  transactionType: SafeHarbourTransactionType,
  valueInCrores: number
): boolean {
  const rule = SAFE_HARBOUR_RULES[transactionType];
  return valueInCrores <= rule.maxTransactionValue;
}

/**
 * Get all transaction types
 */
export function getAllTransactionTypes(): SafeHarbourTransactionType[] {
  return Object.values(SafeHarbourTransactionType);
}

/**
 * Get service transaction types (margin-based)
 */
export function getServiceTransactionTypes(): SafeHarbourTransactionType[] {
  return [
    SafeHarbourTransactionType.IT_ITES,
    SafeHarbourTransactionType.KPO,
    SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
    SafeHarbourTransactionType.CONTRACT_RD_PHARMA,
    SafeHarbourTransactionType.AUTO_ANCILLARY,
  ];
}

/**
 * Get financial transaction types (interest/commission-based)
 */
export function getFinancialTransactionTypes(): SafeHarbourTransactionType[] {
  return [
    SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,
    SafeHarbourTransactionType.LOAN_INR,
    SafeHarbourTransactionType.CORPORATE_GUARANTEE,
  ];
}

/**
 * Format margin/rate for display
 */
export function formatMarginForDisplay(
  transactionType: SafeHarbourTransactionType,
  value: number
): string {
  const rule = SAFE_HARBOUR_RULES[transactionType];

  switch (rule.marginType) {
    case "OP/OC":
      return `${value.toFixed(2)}% OP/OC`;
    case "Interest Rate":
      return `${value.toFixed(2)}% p.a.`;
    case "Commission":
      return `${value.toFixed(2)}% p.a.`;
    default:
      return `${value.toFixed(2)}%`;
  }
}

// =============================================================================
// ELIGIBILITY MATRIX
// =============================================================================

/**
 * Quick eligibility check matrix
 */
export const ELIGIBILITY_MATRIX = {
  [SafeHarbourTransactionType.IT_ITES]: {
    maxValue: 200,
    direction: "receipt", // Receipt from AE
    applicableTo: ["software", "bpo", "ites", "call_center", "data_processing"],
  },
  [SafeHarbourTransactionType.KPO]: {
    maxValue: 200,
    direction: "receipt",
    applicableTo: [
      "research",
      "analytics",
      "legal",
      "engineering",
      "consulting",
    ],
  },
  [SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE]: {
    maxValue: 200,
    direction: "receipt",
    applicableTo: [
      "software_rd",
      "product_development",
      "technology_services",
    ],
  },
  [SafeHarbourTransactionType.CONTRACT_RD_PHARMA]: {
    maxValue: 200,
    direction: "receipt",
    applicableTo: ["pharma_rd", "clinical_trials", "drug_development", "anda"],
  },
  [SafeHarbourTransactionType.AUTO_ANCILLARY]: {
    maxValue: 200,
    direction: "sale", // Sale to AE
    applicableTo: [
      "auto_components",
      "engine_parts",
      "transmission",
      "braking",
    ],
  },
  [SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY]: {
    maxValue: 100,
    direction: "both", // Advance or receive
    applicableTo: ["usd_loan", "eur_loan", "gbp_loan", "foreign_currency"],
  },
  [SafeHarbourTransactionType.LOAN_INR]: {
    maxValue: 100,
    direction: "both",
    applicableTo: ["inr_loan", "rupee_loan", "domestic_currency"],
  },
  [SafeHarbourTransactionType.CORPORATE_GUARANTEE]: {
    maxValue: 100,
    direction: "both", // Provide or receive
    applicableTo: ["guarantee", "credit_support", "bank_guarantee"],
  },
};
