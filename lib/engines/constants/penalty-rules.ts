/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Penalty Rules & Constants
 *
 * Based on: Income Tax Act, 1961
 * Applicable Sections: 271(1)(c), 271AA, 271BA, 271G, 234A/B/C/D
 * ================================================================================
 */

// =============================================================================
// PENALTY SECTIONS
// =============================================================================

/**
 * Penalty section types
 */
export enum PenaltySection {
  /** Concealment of income - Section 271(1)(c) */
  CONCEALMENT_271_1_C = "271_1_c",
  /** Failure to report international transaction - Section 271AA */
  DOCUMENTATION_271AA = "271aa",
  /** Failure to furnish report - Section 271BA */
  REPORT_FAILURE_271BA = "271ba",
  /** Failure to furnish information/documents - Section 271G */
  DOCUMENT_FAILURE_271G = "271g",
  /** Interest on delayed filing - Section 234A */
  INTEREST_234A = "234a",
  /** Interest on delayed advance tax - Section 234B */
  INTEREST_234B = "234b",
  /** Interest on deferment of advance tax - Section 234C */
  INTEREST_234C = "234c",
  /** Interest on excess refund - Section 234D */
  INTEREST_234D = "234d",
}

// =============================================================================
// SECTION 271(1)(c) - CONCEALMENT PENALTY
// =============================================================================

/**
 * Section 271(1)(c) penalty rates
 * Penalty ranges from 100% to 300% of tax evaded
 */
export const CONCEALMENT_PENALTY_RATES = {
  /** Minimum penalty - 100% of tax evaded */
  minimumRate: 100,
  /** Maximum penalty - 300% of tax evaded */
  maximumRate: 300,
  /** Default penalty usually levied - 100% */
  defaultRate: 100,
};

/**
 * Conditions for concealment penalty applicability
 */
export const CONCEALMENT_PENALTY_CONDITIONS = [
  "Concealment of particulars of income",
  "Furnishing of inaccurate particulars of income",
  "Transfer pricing adjustment sustained on appeal",
  "Deliberate non-disclosure of international transactions",
  "Underreporting of income due to TP adjustment",
];

/**
 * Defenses against concealment penalty
 */
export const CONCEALMENT_PENALTY_DEFENSES = [
  "Bonafide mistake in computation",
  "Reliance on expert advice",
  "Full disclosure made in return",
  "Reasonable interpretation of law",
  "No mens rea/fraudulent intention",
  "Consistent position in earlier years accepted",
];

// =============================================================================
// SECTION 271AA - DOCUMENTATION PENALTY
// =============================================================================

/**
 * Section 271AA penalty for international transaction documentation
 */
export const DOCUMENTATION_PENALTY_271AA = {
  /** Rate as percentage of transaction value */
  rate: 2,
  /** Section description */
  section: "271AA",
  /** Applicable for */
  applicableFor: [
    "Failure to keep and maintain prescribed documents under Section 92D",
    "Failure to report any transaction which is required to be reported",
    "Maintaining/furnishing incorrect information or documents",
  ],
  /** Maximum penalty cap - None specified */
  maxCap: null,
  /** Minimum penalty - No minimum */
  minPenalty: 0,
};

/**
 * Documents required under Section 92D
 */
export const SECTION_92D_DOCUMENTS = [
  "Description of ownership structure",
  "Description of business operations",
  "Nature of international transactions",
  "Functional analysis (FAR)",
  "Transfer pricing method selection",
  "Comparability analysis",
  "Assumptions, policies, and price negotiations",
  "Details of uncontrolled transactions for comparability",
  "Adjustment computations",
  "Supporting evidence/documentation",
];

// =============================================================================
// SECTION 271BA - REPORT FAILURE PENALTY
// =============================================================================

/**
 * Section 271BA penalty for failure to furnish reports
 */
export const REPORT_FAILURE_PENALTY_271BA = {
  /** Penalty per form/report */
  penaltyPerForm: 100000, // Rs. 1,00,000
  /** Section description */
  section: "271BA",
  /** Applicable forms */
  applicableForms: [
    { form: "Form 3CEB", description: "TP Audit Report" },
    { form: "Form 3CEAA", description: "Master File" },
    { form: "Form 3CEAD", description: "Country-by-Country Report" },
  ],
};

// =============================================================================
// SECTION 271G - DOCUMENT FAILURE PENALTY
// =============================================================================

/**
 * Section 271G penalty for failure to furnish information/documents
 */
export const DOCUMENT_FAILURE_PENALTY_271G = {
  /** Rate as percentage of transaction value */
  rate: 2,
  /** Section description */
  section: "271G",
  /** Applicable for */
  applicableFor: [
    "Failure to furnish information under Section 92D(3)",
    "Failure to furnish documents when called for by AO/TPO",
    "Non-compliance with specific information requests",
  ],
  /** Maximum penalty cap - None specified */
  maxCap: null,
};

// =============================================================================
// SECTIONS 234A/B/C/D - INTEREST
// =============================================================================

/**
 * Section 234A - Interest for delay in filing return
 */
export const INTEREST_234A = {
  /** Interest rate per month */
  ratePerMonth: 1,
  /** Maximum period - Till date of filing */
  maxPeriod: null,
  /** Section description */
  section: "234A",
  /** Calculation basis */
  basis: "Tax payable after TDS/TCS/Advance Tax",
  /** Part of month treatment */
  partMonth: "Considered as full month",
};

/**
 * Section 234B - Interest for delay in payment of advance tax
 */
export const INTEREST_234B = {
  /** Interest rate per month */
  ratePerMonth: 1,
  /** Applicable when */
  applicableWhen: "Advance tax paid is less than 90% of assessed tax",
  /** Section description */
  section: "234B",
  /** Calculation period */
  period: "April 1 of AY to date of determination of income",
  /** Part of month treatment */
  partMonth: "Considered as full month",
};

/**
 * Section 234C - Interest for deferment of advance tax
 */
export const INTEREST_234C = {
  /** Interest rate per month */
  ratePerMonth: 1,
  /** Due dates for advance tax */
  dueDates: [
    { date: "June 15", percentage: 15, shortfall: "3 months" },
    { date: "September 15", percentage: 45, shortfall: "3 months" },
    { date: "December 15", percentage: 75, shortfall: "3 months" },
    { date: "March 15", percentage: 100, shortfall: "1 month" },
  ],
  /** Section description */
  section: "234C",
};

/**
 * Section 234D - Interest on excess refund
 */
export const INTEREST_234D = {
  /** Interest rate per month */
  ratePerMonth: 0.5,
  /** Section description */
  section: "234D",
  /** Calculation period */
  period: "From date of grant of refund to date of regular assessment",
  /** Applicable when */
  applicableWhen: "Refund granted on provisional basis is found excessive",
};

// =============================================================================
// PENALTY MITIGATION FACTORS
// =============================================================================

/**
 * Factors that may mitigate penalties
 */
export const PENALTY_MITIGATION_FACTORS = {
  /** Factors that reduce penalty likelihood */
  reducingFactors: [
    {
      factor: "Contemporaneous documentation",
      impact: "high",
      description: "Maintained proper TP documentation at transaction time",
    },
    {
      factor: "Consistent methodology",
      impact: "high",
      description: "Used consistent TP methods across years",
    },
    {
      factor: "Timely compliance",
      impact: "medium",
      description: "Filed all returns and reports on time",
    },
    {
      factor: "Cooperative attitude",
      impact: "medium",
      description: "Full cooperation during assessment proceedings",
    },
    {
      factor: "Good faith reliance",
      impact: "high",
      description: "Relied on professional advice in good faith",
    },
    {
      factor: "Voluntary disclosure",
      impact: "high",
      description: "Proactively disclosed issues before detection",
    },
    {
      factor: "Immaterial adjustment",
      impact: "medium",
      description: "Adjustment is immaterial relative to total income",
    },
  ],
  /** Factors that increase penalty risk */
  aggravatingFactors: [
    {
      factor: "Repeated non-compliance",
      impact: "high",
      description: "Pattern of non-compliance across years",
    },
    {
      factor: "Deliberate concealment",
      impact: "critical",
      description: "Evidence of deliberate attempt to evade tax",
    },
    {
      factor: "Non-cooperation",
      impact: "high",
      description: "Failure to cooperate during proceedings",
    },
    {
      factor: "No documentation",
      impact: "critical",
      description: "Complete absence of TP documentation",
    },
    {
      factor: "Large adjustments",
      impact: "high",
      description: "Material TP adjustments sustained",
    },
  ],
} as const;

// =============================================================================
// TAX RATES FOR PENALTY CALCULATION
// =============================================================================

/**
 * Tax rates for penalty calculation
 */
export const TAX_RATES = {
  /** Domestic company rate */
  domestic_company: 25.168, // 22% + surcharge + cess (new regime)
  domestic_company_old: 34.944, // 30% + surcharge + cess (old regime)
  /** Foreign company rate */
  foreign_company: 43.68, // 40% + surcharge + cess
  /** LLP/Firm rate */
  llp_firm: 34.944, // 30% + surcharge + cess
  /** Individual (highest slab) */
  individual_highest: 39, // 30% + surcharge + cess
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate concealment penalty range
 * @param taxEvaded Amount of tax evaded
 * @returns Minimum and maximum penalty amounts
 */
export function calculateConcealmentPenaltyRange(taxEvaded: number): {
  minimum: number;
  maximum: number;
  default: number;
} {
  return {
    minimum: taxEvaded * (CONCEALMENT_PENALTY_RATES.minimumRate / 100),
    maximum: taxEvaded * (CONCEALMENT_PENALTY_RATES.maximumRate / 100),
    default: taxEvaded * (CONCEALMENT_PENALTY_RATES.defaultRate / 100),
  };
}

/**
 * Calculate Section 271AA penalty
 * @param transactionValue Value of international transaction
 * @returns Penalty amount
 */
export function calculate271AAPenalty(transactionValue: number): number {
  return transactionValue * (DOCUMENTATION_PENALTY_271AA.rate / 100);
}

/**
 * Calculate Section 271G penalty
 * @param transactionValue Value of international transaction
 * @returns Penalty amount
 */
export function calculate271GPenalty(transactionValue: number): number {
  return transactionValue * (DOCUMENT_FAILURE_PENALTY_271G.rate / 100);
}

/**
 * Calculate Section 271BA penalty
 * @param numberOfForms Number of forms not filed
 * @returns Penalty amount
 */
export function calculate271BAPenalty(numberOfForms: number): number {
  return numberOfForms * REPORT_FAILURE_PENALTY_271BA.penaltyPerForm;
}

/**
 * Calculate Section 234A interest
 * @param taxPayable Tax payable
 * @param delayMonths Number of months delayed
 * @returns Interest amount
 */
export function calculate234AInterest(
  taxPayable: number,
  delayMonths: number
): number {
  return taxPayable * (INTEREST_234A.ratePerMonth / 100) * delayMonths;
}

/**
 * Calculate Section 234B interest
 * @param shortfall Shortfall in advance tax
 * @param months Number of months
 * @returns Interest amount
 */
export function calculate234BInterest(
  shortfall: number,
  months: number
): number {
  return shortfall * (INTEREST_234B.ratePerMonth / 100) * months;
}

/**
 * Calculate Section 234C interest
 * @param shortfallAmounts Array of shortfall amounts for each quarter
 * @returns Total interest amount
 */
export function calculate234CInterest(
  shortfallAmounts: { amount: number; months: number }[]
): number {
  return shortfallAmounts.reduce(
    (total, { amount, months }) =>
      total + amount * (INTEREST_234C.ratePerMonth / 100) * months,
    0
  );
}

/**
 * Calculate Section 234D interest
 * @param excessRefund Excess refund amount
 * @param months Number of months
 * @returns Interest amount
 */
export function calculate234DInterest(
  excessRefund: number,
  months: number
): number {
  return excessRefund * (INTEREST_234D.ratePerMonth / 100) * months;
}

/**
 * Get applicable tax rate for entity type
 * @param entityType Type of entity
 * @returns Applicable tax rate
 */
export function getTaxRate(entityType: keyof typeof TAX_RATES): number {
  return TAX_RATES[entityType] || TAX_RATES.domestic_company;
}

/**
 * Assess penalty likelihood based on factors
 * @param reducingFactorsPresent Number of reducing factors present
 * @param aggravatingFactorsPresent Number of aggravating factors present
 * @returns Likelihood assessment
 */
export function assessPenaltyLikelihood(
  reducingFactorsPresent: number,
  aggravatingFactorsPresent: number
): {
  likelihood: "low" | "medium" | "high" | "very_high";
  score: number;
  recommendation: string;
} {
  const score =
    aggravatingFactorsPresent * 20 - reducingFactorsPresent * 15 + 50;
  const clampedScore = Math.max(0, Math.min(100, score));

  let likelihood: "low" | "medium" | "high" | "very_high";
  let recommendation: string;

  if (clampedScore < 30) {
    likelihood = "low";
    recommendation =
      "Penalty likelihood is low. Maintain documentation and compliance posture.";
  } else if (clampedScore < 50) {
    likelihood = "medium";
    recommendation =
      "Moderate penalty risk. Consider strengthening documentation and seeking professional advice.";
  } else if (clampedScore < 75) {
    likelihood = "high";
    recommendation =
      "High penalty risk. Strongly recommend engaging experts and preparing defense documentation.";
  } else {
    likelihood = "very_high";
    recommendation =
      "Very high penalty risk. Immediate action required - consider voluntary disclosure or settlement.";
  }

  return { likelihood, score: clampedScore, recommendation };
}

/**
 * Get penalty section description
 * @param section Penalty section
 * @returns Description of the section
 */
export function getPenaltySectionDescription(section: PenaltySection): string {
  const descriptions: Record<PenaltySection, string> = {
    [PenaltySection.CONCEALMENT_271_1_C]:
      "Section 271(1)(c) - Penalty for concealment of income or furnishing inaccurate particulars (100%-300% of tax evaded)",
    [PenaltySection.DOCUMENTATION_271AA]:
      "Section 271AA - Penalty for failure to keep/maintain prescribed documents or reporting incorrect information (2% of transaction value)",
    [PenaltySection.REPORT_FAILURE_271BA]:
      "Section 271BA - Penalty for failure to furnish accountant's report (Rs. 1,00,000 per form)",
    [PenaltySection.DOCUMENT_FAILURE_271G]:
      "Section 271G - Penalty for failure to furnish information/documents to AO/TPO (2% of transaction value)",
    [PenaltySection.INTEREST_234A]:
      "Section 234A - Interest for delay in filing return (1% per month)",
    [PenaltySection.INTEREST_234B]:
      "Section 234B - Interest for delay in payment of advance tax (1% per month)",
    [PenaltySection.INTEREST_234C]:
      "Section 234C - Interest for deferment of advance tax (1% per month)",
    [PenaltySection.INTEREST_234D]:
      "Section 234D - Interest on excess refund (0.5% per month)",
  };
  return descriptions[section];
}
