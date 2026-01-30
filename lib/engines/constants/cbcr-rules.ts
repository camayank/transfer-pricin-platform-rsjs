/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Country-by-Country Reporting (CbCR) Rules Constants
 *
 * Rules, thresholds, and data structures for CbCR compliance under
 * BEPS Action 13 and Indian Income Tax Rules (Rule 10DA, 10DB).
 * ================================================================================
 */

// =============================================================================
// CBCR THRESHOLDS AND RULES
// =============================================================================

export const CBCR_THRESHOLDS = {
  // Global threshold
  groupRevenueThreshold: {
    eur: 750000000, // EUR 750 million
    inr: 64000000000, // INR 6,400 Crores (approx)
    usd: 850000000, // USD 850 million (approx)
  },

  // Penalty thresholds
  penalty: {
    nonFilingPerDay: 5000, // Rs. 5,000 per day initial
    maxNonFilingPerDay: 15000, // Rs. 15,000 per day after first period
    inaccurateInfoPerDay: 50000, // Rs. 50,000 per day
  },

  // Filing deadlines
  deadlines: {
    cbcNotificationMonths: 2, // 2 months from end of reporting FY
    cbcReportMonths: 12, // 12 months from end of reporting FY
    masterFileMonths: 12, // 12 months from end of reporting FY
    localFileMonths: 12, // Due date of filing ROI
  },
} as const;

// =============================================================================
// ENTITY TYPES AND ROLES
// =============================================================================

export enum CbCREntityRole {
  ULTIMATE_PARENT = "ultimate_parent",
  SURROGATE_PARENT = "surrogate_parent",
  CONSTITUENT_ENTITY = "constituent_entity",
  REPORTING_ENTITY = "reporting_entity",
  EXCLUDED_ENTITY = "excluded_entity",
}

export enum CbCRBusinessActivity {
  RESEARCH_DEVELOPMENT = "research_development",
  HOLDING_IP = "holding_ip",
  PURCHASING_PROCUREMENT = "purchasing_procurement",
  MANUFACTURING = "manufacturing",
  SALES_MARKETING = "sales_marketing",
  ADMINISTRATIVE_MANAGEMENT = "administrative_management",
  SERVICES_TO_UNRELATED = "services_to_unrelated",
  INTERNAL_GROUP_FINANCE = "internal_group_finance",
  REGULATED_FINANCIAL_SERVICES = "regulated_financial_services",
  INSURANCE = "insurance",
  HOLDING_SHARES = "holding_shares",
  DORMANT = "dormant",
  OTHER = "other",
}

export const BUSINESS_ACTIVITY_CODES: Record<CbCRBusinessActivity, string> = {
  [CbCRBusinessActivity.RESEARCH_DEVELOPMENT]: "R&D",
  [CbCRBusinessActivity.HOLDING_IP]: "Holding or managing intellectual property",
  [CbCRBusinessActivity.PURCHASING_PROCUREMENT]: "Purchasing or Procurement",
  [CbCRBusinessActivity.MANUFACTURING]: "Manufacturing or Production",
  [CbCRBusinessActivity.SALES_MARKETING]: "Sales, Marketing or Distribution",
  [CbCRBusinessActivity.ADMINISTRATIVE_MANAGEMENT]: "Administrative, Management or Support Services",
  [CbCRBusinessActivity.SERVICES_TO_UNRELATED]: "Provision of Services to unrelated parties",
  [CbCRBusinessActivity.INTERNAL_GROUP_FINANCE]: "Internal Group Finance",
  [CbCRBusinessActivity.REGULATED_FINANCIAL_SERVICES]: "Regulated Financial Services",
  [CbCRBusinessActivity.INSURANCE]: "Insurance",
  [CbCRBusinessActivity.HOLDING_SHARES]: "Holding shares or other equity instruments",
  [CbCRBusinessActivity.DORMANT]: "Dormant",
  [CbCRBusinessActivity.OTHER]: "Other",
};

// =============================================================================
// JURISDICTION DATA
// =============================================================================

export interface JurisdictionInfo {
  code: string;
  name: string;
  hasCbCRExchange: boolean;
  localCbCRRequired: boolean;
  currencyCode: string;
}

export const KEY_JURISDICTIONS: JurisdictionInfo[] = [
  { code: "IN", name: "India", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "INR" },
  { code: "US", name: "United States", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "USD" },
  { code: "GB", name: "United Kingdom", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "GBP" },
  { code: "DE", name: "Germany", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "EUR" },
  { code: "JP", name: "Japan", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "JPY" },
  { code: "SG", name: "Singapore", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "SGD" },
  { code: "NL", name: "Netherlands", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "EUR" },
  { code: "CH", name: "Switzerland", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "CHF" },
  { code: "AE", name: "United Arab Emirates", hasCbCRExchange: true, localCbCRRequired: false, currencyCode: "AED" },
  { code: "HK", name: "Hong Kong", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "HKD" },
  { code: "CN", name: "China", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "CNY" },
  { code: "AU", name: "Australia", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "AUD" },
  { code: "IE", name: "Ireland", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "EUR" },
  { code: "LU", name: "Luxembourg", hasCbCRExchange: true, localCbCRRequired: true, currencyCode: "EUR" },
  { code: "MU", name: "Mauritius", hasCbCRExchange: true, localCbCRRequired: false, currencyCode: "MUR" },
];

// =============================================================================
// FORM 3CEAD STRUCTURE (India-specific)
// =============================================================================

export interface Form3CEADStructure {
  partA: Form3CEADPartA;
  partB: Form3CEADPartB;
  partC: Form3CEADPartC;
}

export interface Form3CEADPartA {
  // Reporting Entity Information
  reportingEntityName: string;
  reportingEntityPAN: string;
  reportingEntityAddress: string;
  reportingEntityRole: CbCREntityRole;
  reportingFiscalYear: {
    startDate: Date;
    endDate: Date;
  };

  // Ultimate Parent Entity Information
  ultimateParentName: string;
  ultimateParentJurisdiction: string;
  ultimateParentTIN?: string;
}

export interface Form3CEADPartB {
  // Table 1: Overview of allocation of income, taxes and business activities by jurisdiction
  table1: CbCRTable1Row[];

  // Table 2: List of all constituent entities of the MNE group included in each aggregation per jurisdiction
  table2: CbCRTable2Row[];
}

export interface Form3CEADPartC {
  // Table 3: Additional Information
  additionalInfo: CbCRTable3Entry[];
}

export interface CbCRTable1Row {
  jurisdictionCode: string;
  jurisdictionName: string;
  revenues: {
    unrelatedParty: number;
    relatedParty: number;
    total: number;
  };
  profitOrLossBeforeTax: number;
  incomeTaxPaid: number;
  incomeTaxAccrued: number;
  statedCapital: number;
  accumulatedEarnings: number;
  numberOfEmployees: number;
  tangibleAssetsOtherThanCash: number;
}

export interface CbCRTable2Row {
  jurisdictionCode: string;
  jurisdictionName: string;
  constituentEntityName: string;
  jurisdictionOfIncorporation: string;
  taxIdentificationNumber?: string;
  mainBusinessActivities: CbCRBusinessActivity[];
}

export interface CbCRTable3Entry {
  item: string;
  description: string;
  jurisdictionsAffected?: string[];
}

// =============================================================================
// VALIDATION RULES
// =============================================================================

export interface CbCRValidationRule {
  ruleId: string;
  description: string;
  severity: "error" | "warning";
  validation: string;
}

export const CBCR_VALIDATION_RULES: CbCRValidationRule[] = [
  {
    ruleId: "CBCR-001",
    description: "Total revenue must equal sum of related and unrelated party revenues",
    severity: "error",
    validation: "revenues.total === revenues.relatedParty + revenues.unrelatedParty",
  },
  {
    ruleId: "CBCR-002",
    description: "Number of employees cannot be negative",
    severity: "error",
    validation: "numberOfEmployees >= 0",
  },
  {
    ruleId: "CBCR-003",
    description: "Income tax paid should generally not exceed income tax accrued significantly",
    severity: "warning",
    validation: "incomeTaxPaid <= incomeTaxAccrued * 1.5",
  },
  {
    ruleId: "CBCR-004",
    description: "Entity with revenue but zero employees may need explanation",
    severity: "warning",
    validation: "!(revenues.total > 0 && numberOfEmployees === 0)",
  },
  {
    ruleId: "CBCR-005",
    description: "Dormant entity should have minimal activity",
    severity: "warning",
    validation: "dormant implies minimal revenues and employees",
  },
  {
    ruleId: "CBCR-006",
    description: "Each constituent entity must be listed in at least one jurisdiction",
    severity: "error",
    validation: "all entities appear in Table 2",
  },
  {
    ruleId: "CBCR-007",
    description: "At least one business activity must be selected for each entity",
    severity: "error",
    validation: "mainBusinessActivities.length >= 1",
  },
  {
    ruleId: "CBCR-008",
    description: "Currency must be consistent across all jurisdictions",
    severity: "error",
    validation: "single reporting currency used",
  },
];

// =============================================================================
// XML SCHEMA ELEMENTS
// =============================================================================

export const CBCR_XML_NAMESPACE = "urn:oecd:ties:cbc:v2";

export const CBCR_XML_ELEMENTS = {
  root: "CBC_OECD",
  messageSpec: "MessageSpec",
  cbcBody: "CbcBody",
  reportingEntity: "ReportingEntity",
  cbcReports: "CbcReports",
  jurisdictionReport: "CbcReports",
  summary: "Summary",
  constituentEntity: "ConstEntity",
  additionalInfo: "AdditionalInfo",
} as const;

// =============================================================================
// FILING FORMS (India)
// =============================================================================

export const INDIA_CBCR_FORMS = {
  notification: {
    formNumber: "Form 3CEAC",
    description: "Intimation by a constituent entity of an international group",
    filingAuthority: "DGIT (Risk Assessment)",
    deadline: "2 months from end of reporting accounting year of parent entity",
    electronicFiling: true,
  },
  report: {
    formNumber: "Form 3CEAD",
    description: "Country-by-Country Report",
    filingAuthority: "DGIT (Risk Assessment)",
    deadline: "12 months from end of reporting accounting year",
    electronicFiling: true,
  },
  masterFile: {
    formNumber: "Form 3CEAA",
    description: "Master File",
    filingAuthority: "DGIT (Risk Assessment)",
    deadline: "12 months from end of FY",
    electronicFiling: true,
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if group is subject to CbCR based on consolidated revenue
 */
export function isCbCRApplicable(
  consolidatedRevenue: number,
  currency: "EUR" | "INR" | "USD"
): boolean {
  return consolidatedRevenue >= CBCR_THRESHOLDS.groupRevenueThreshold[currency.toLowerCase() as keyof typeof CBCR_THRESHOLDS.groupRevenueThreshold];
}

/**
 * Calculate CbCR filing deadline
 */
export function calculateCbCRDeadline(
  reportingYearEnd: Date,
  formType: "notification" | "report" | "masterFile"
): Date {
  const deadline = new Date(reportingYearEnd);
  const months = formType === "notification"
    ? CBCR_THRESHOLDS.deadlines.cbcNotificationMonths
    : CBCR_THRESHOLDS.deadlines.cbcReportMonths;

  deadline.setMonth(deadline.getMonth() + months);
  return deadline;
}

/**
 * Calculate penalty for non-filing
 */
export function calculateCbCRPenalty(
  daysOfDefault: number,
  penaltyType: "nonFiling" | "inaccurate"
): number {
  if (penaltyType === "inaccurate") {
    return daysOfDefault * CBCR_THRESHOLDS.penalty.inaccurateInfoPerDay;
  }

  // Non-filing penalty escalates after initial period
  if (daysOfDefault <= 30) {
    return daysOfDefault * CBCR_THRESHOLDS.penalty.nonFilingPerDay;
  }

  const initialPenalty = 30 * CBCR_THRESHOLDS.penalty.nonFilingPerDay;
  const additionalDays = daysOfDefault - 30;
  const additionalPenalty = additionalDays * CBCR_THRESHOLDS.penalty.maxNonFilingPerDay;

  return initialPenalty + additionalPenalty;
}

/**
 * Get jurisdiction info by code
 */
export function getJurisdictionInfo(code: string): JurisdictionInfo | undefined {
  return KEY_JURISDICTIONS.find((j) => j.code === code);
}

/**
 * Get business activity description
 */
export function getBusinessActivityDescription(activity: CbCRBusinessActivity): string {
  return BUSINESS_ACTIVITY_CODES[activity];
}

/**
 * Determine reporting entity role
 */
export function determineReportingRole(
  isUltimateParent: boolean,
  isSurrogateParent: boolean,
  parentJurisdictionHasExchange: boolean
): CbCREntityRole {
  if (isUltimateParent) {
    return CbCREntityRole.ULTIMATE_PARENT;
  }
  if (isSurrogateParent) {
    return CbCREntityRole.SURROGATE_PARENT;
  }
  if (!parentJurisdictionHasExchange) {
    return CbCREntityRole.REPORTING_ENTITY;
  }
  return CbCREntityRole.CONSTITUENT_ENTITY;
}

/**
 * Validate Table 1 row
 */
export function validateTable1Row(row: CbCRTable1Row): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Revenue total validation
  if (Math.abs(row.revenues.total - (row.revenues.relatedParty + row.revenues.unrelatedParty)) > 0.01) {
    errors.push(`Revenue total mismatch for ${row.jurisdictionCode}`);
  }

  // Employee validation
  if (row.numberOfEmployees < 0) {
    errors.push(`Negative employees for ${row.jurisdictionCode}`);
  }

  // Tax paid vs accrued
  if (row.incomeTaxPaid > row.incomeTaxAccrued * 1.5 && row.incomeTaxAccrued > 0) {
    warnings.push(`Tax paid significantly exceeds accrued for ${row.jurisdictionCode}`);
  }

  // Zero employees with revenue
  if (row.revenues.total > 0 && row.numberOfEmployees === 0) {
    warnings.push(`Revenue but zero employees in ${row.jurisdictionCode} - may need explanation`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Convert currency to reporting currency
 */
export function convertToReportingCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  return amount * exchangeRate;
}

/**
 * Generate XML element for CbCR
 */
export function generateXMLElement(
  elementName: string,
  content: string | number,
  attributes?: Record<string, string>
): string {
  const attrs = attributes
    ? " " + Object.entries(attributes).map(([k, v]) => `${k}="${v}"`).join(" ")
    : "";

  return `<${elementName}${attrs}>${content}</${elementName}>`;
}
