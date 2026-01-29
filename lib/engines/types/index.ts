/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Core Types & Interfaces
 *
 * Shared TypeScript types used across all engines.
 * ================================================================================
 */

// =============================================================================
// SAFE HARBOUR TYPES
// =============================================================================

export enum SafeHarbourTransactionType {
  IT_ITES = "it_ites",
  KPO = "kpo",
  CONTRACT_RD_SOFTWARE = "contract_rd_software",
  CONTRACT_RD_PHARMA = "contract_rd_pharma",
  AUTO_ANCILLARY = "auto_ancillary",
  LOAN_FOREIGN_CURRENCY = "loan_foreign_currency",
  LOAN_INR = "loan_inr",
  CORPORATE_GUARANTEE = "corporate_guarantee",
}

export enum CreditRating {
  AAA = "AAA",
  AA = "AA",
  A = "A",
  BBB = "BBB",
  BB = "BB",
  B = "B",
  C = "C",
  D = "D",
}

export interface SafeHarbourInput {
  transactionType: SafeHarbourTransactionType;
  assessmentYear?: string;
  operatingRevenue?: number;
  operatingCost?: number;
  operatingProfit?: number;
  employeeCost?: number;
  isSignificantOwnership?: boolean;
  ownershipPercentage?: number;
  loanAmount?: number;
  interestRate?: number;
  creditRating?: CreditRating;
  currency?: string;
  guaranteeAmount?: number;
  guaranteeCommission?: number;
}

export interface SafeHarbourResult {
  eligible: boolean;
  transactionType: SafeHarbourTransactionType;
  currentValue: number;
  requiredValue: number;
  gap: number;
  marginType: "percentage" | "interest_rate" | "commission";
  recommendation: string;
  details: Record<string, unknown>;
  form3CEFAData?: Record<string, unknown>;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export enum ValidationSeverity {
  CRITICAL = "critical",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: ValidationSeverity;
  code: string;
  section?: string;
}

export interface ValidationResult {
  isValid: boolean;
  canFile: boolean;
  totalIssues: number;
  criticalCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  issuesBySection: Record<string, ValidationIssue[]>;
}

// =============================================================================
// FORM 3CEB TYPES
// =============================================================================

export enum TPMethod {
  CUP = "CUP",
  RPM = "RPM",
  CPM = "CPM",
  TNMM = "TNMM",
  PSM = "PSM",
  OTHER = "OTHER",
}

export interface AssesseeInfo {
  name: string;
  pan: string;
  status: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
  nicCode: string;
  previousYearFrom: string;
  previousYearTo: string;
  assessmentYear: string;
  email: string;
  phone?: string;
}

export interface AssociatedEnterprise {
  referenceId: string;
  name: string;
  country: string;
  countryCode: string;
  address?: string;
  relationshipType: string;
  natureOfRelationship?: string;
  panIfIndian?: string;
}

export interface InternationalTransaction {
  serialNumber: number;
  aeReferenceId: string;
  natureCode: string;
  description?: string;
  valueAsPerBooks: number;
  armLengthPrice: number;
  method: TPMethod;
  methodJustification?: string;
  numberOfComparables?: number;
  safeHarbourOpted?: boolean;
  documentationMaintained?: boolean;
}

export interface CACertification {
  caName: string;
  firmName?: string;
  membershipNumber: string;
  firmRegistrationNumber?: string;
  udin: string;
  dateOfReport: string;
  address?: string;
  city?: string;
  pinCode?: string;
  email?: string;
}

export interface Form3CEB {
  assessmentYear: string;
  partA: AssesseeInfo;
  associatedEnterprises: AssociatedEnterprise[];
  partB: {
    internationalTransactions: InternationalTransaction[];
    totalValue: number;
    totalAdjustments: number;
  };
  caDetails: CACertification;
}

// =============================================================================
// BENCHMARKING TYPES
// Note: PLIType, FunctionalProfile, ScreeningCriteria are defined in benchmarking-engine.ts
// to maintain backward compatibility. Import them from there.
// =============================================================================

// These interfaces are for the new reference structure and don't conflict with existing code

// =============================================================================
// DASHBOARD & CLIENT TYPES
// Note: ComplianceStatus, FormType, Priority are defined in dashboard-engine.ts
// to maintain backward compatibility. Import them from there.
// =============================================================================
