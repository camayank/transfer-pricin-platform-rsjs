/**
 * Zod Validation Schemas for Transfer Pricing Platform
 *
 * These schemas ensure data integrity and provide type-safe validation
 * for all API endpoints and form inputs.
 */

import { z } from "zod";

// ============== REGEX PATTERNS ==============

// PAN: 5 letters + 4 digits + 1 letter (e.g., AABCT1234A)
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// TAN: 4 letters + 5 digits + 1 letter (e.g., MUMT12345A)
const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

// CIN: 21 alphanumeric characters (e.g., U72200MH2010PTC123456)
const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

// Financial Year: "2025-26" format
const fyRegex = /^[0-9]{4}-[0-9]{2}$/;

// NIC Code: 2-5 digits
const nicCodeRegex = /^[0-9]{2,5}$/;

// Indian Pincode: 6 digits
const pincodeRegex = /^[0-9]{6}$/;

// Phone: 10 digits (Indian mobile)
const phoneRegex = /^[6-9][0-9]{9}$/;

// ============== ENUMS ==============

export const RoleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "PARTNER",
  "SENIOR_MANAGER",
  "MANAGER",
  "ASSOCIATE",
  "TRAINEE",
]);

export const PlanEnum = z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]);

export const EngagementStatusEnum = z.enum([
  "NOT_STARTED",
  "DATA_COLLECTION",
  "SAFE_HARBOUR_CHECK",
  "BENCHMARKING",
  "DOCUMENTATION",
  "REVIEW",
  "APPROVED",
  "FILED",
  "COMPLETED",
]);

export const PriorityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

export const DocumentTypeEnum = z.enum([
  "FORM_3CEB",
  "FORM_3CEFA",
  "FORM_3CEAA",
  "FORM_3CEAB",
  "FORM_3CEAC",
  "FORM_3CEAD",
  "LOCAL_FILE",
  "BENCHMARKING_REPORT",
  "TP_STUDY",
  "AGREEMENT",
  "FINANCIAL_STATEMENT",
  "OTHER",
]);

export const DocStatusEnum = z.enum([
  "DRAFT",
  "IN_PROGRESS",
  "PENDING_REVIEW",
  "REVIEW",
  "APPROVED",
  "FILED",
]);

export const TPMethodEnum = z.enum([
  "CUP",
  "RPM",
  "CPM",
  "TNMM",
  "PSM",
  "OTHER",
]);

export const DisputeStageEnum = z.enum([
  "TPO",
  "DRP",
  "AO",
  "ITAT",
  "HIGH_COURT",
  "SUPREME_COURT",
]);

export const DisputeStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "PENDING_HEARING",
  "DECIDED",
  "APPEALED",
  "CLOSED",
]);

export const RelationshipTypeEnum = z.enum([
  "PARENT",
  "SUBSIDIARY",
  "FELLOW_SUBSIDIARY",
  "ASSOCIATE",
  "JV",
  "BRANCH",
]);

export const TransactionTypeEnum = z.enum([
  "PURCHASE",
  "SALE",
  "SERVICE_PAYMENT",
  "SERVICE_INCOME",
  "ROYALTY_PAYMENT",
  "ROYALTY_INCOME",
  "INTEREST_PAYMENT",
  "INTEREST_INCOME",
  "GUARANTEE_FEE",
  "MANAGEMENT_FEE",
  "REIMBURSEMENT",
  "CAPITAL",
  "OTHER",
]);

export const PLITypeEnum = z.enum([
  "OP_OC",
  "OP_OR",
  "GROSS_PROFIT",
  "NET_PROFIT",
  "BERRY_RATIO",
  "RETURN_ON_ASSETS",
  "RETURN_ON_CAPITAL",
]);

export const SafeHarbourTypeEnum = z.enum([
  "IT_ITES",
  "KPO",
  "CONTRACT_RD",
  "LOAN_FC",
  "LOAN_INR",
  "GUARANTEE",
  "CORE_AUTO_COMPONENTS",
]);

// ============== CLIENT SCHEMAS ==============

export const clientCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200),
  pan: z.string().regex(panRegex, "Invalid PAN format (e.g., AABCT1234A)"),
  tan: z.string().regex(tanRegex, "Invalid TAN format (e.g., MUMT12345A)").optional().nullable(),
  cin: z.string().regex(cinRegex, "Invalid CIN format").optional().nullable(),
  industry: z.string().min(2).max(100).optional().nullable(),
  nicCode: z.string().regex(nicCodeRegex, "NIC code must be 2-5 digits").optional().nullable(),
  nicDescription: z.string().max(500).optional().nullable(),
  contactPerson: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email("Invalid email format").optional().nullable(),
  contactPhone: z.string().regex(phoneRegex, "Invalid phone number").optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(pincodeRegex, "Pincode must be 6 digits").optional().nullable(),
  country: z.string().max(100).default("India"),
  website: z.string().url("Invalid URL format").optional().nullable(),

  // Group Structure
  parentCompany: z.string().max(200).optional().nullable(),
  parentCountry: z.string().max(100).optional().nullable(),
  ultimateParent: z.string().max(200).optional().nullable(),
  ultimateParentCountry: z.string().max(100).optional().nullable(),
  consolidatedRevenue: z.number().min(0).optional().nullable(),

  // Assignments
  assignedToId: z.string().cuid().optional().nullable(),
  reviewerId: z.string().cuid().optional().nullable(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

// ============== ENGAGEMENT SCHEMAS ==============

export const engagementCreateSchema = z.object({
  clientId: z.string().cuid("Invalid client ID"),
  financialYear: z.string().regex(fyRegex, "Financial year must be in format YYYY-YY (e.g., 2025-26)"),
  assessmentYear: z.string().regex(fyRegex, "Assessment year must be in format YYYY-YY").optional(),
  priority: PriorityEnum.optional().default("MEDIUM"),
  notes: z.string().max(2000).optional().nullable(),
  assignedToId: z.string().cuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),

  // Financial Data
  totalRevenue: z.number().min(0).optional().nullable(),
  operatingCost: z.number().min(0).optional().nullable(),
  operatingProfit: z.number().optional().nullable(),
  employeeCost: z.number().min(0).optional().nullable(),
  totalRptValue: z.number().min(0).optional().nullable(),
});

export const engagementUpdateSchema = z.object({
  status: EngagementStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  notes: z.string().max(2000).optional().nullable(),
  assignedToId: z.string().cuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),

  // Financial Data
  totalRevenue: z.number().min(0).optional().nullable(),
  operatingCost: z.number().min(0).optional().nullable(),
  operatingProfit: z.number().optional().nullable(),
  employeeCost: z.number().min(0).optional().nullable(),
  totalRptValue: z.number().min(0).optional().nullable(),

  // PLIs
  opOc: z.number().min(-1).max(2).optional().nullable(),
  opOr: z.number().min(-1).max(2).optional().nullable(),
  berryRatio: z.number().min(0).max(10).optional().nullable(),

  // Safe Harbour
  safeHarbourEligible: z.boolean().optional().nullable(),
  safeHarbourAnalysis: z.record(z.string(), z.unknown()).optional().nullable(),

  // Benchmarking
  benchmarkingCompleted: z.boolean().optional(),
  benchmarkingResults: z.record(z.string(), z.unknown()).optional().nullable(),
  armLengthRange: z.record(z.string(), z.unknown()).optional().nullable(),
  adjustmentRequired: z.boolean().optional().nullable(),
  adjustmentAmount: z.number().optional().nullable(),
});

export type EngagementCreateInput = z.infer<typeof engagementCreateSchema>;
export type EngagementUpdateInput = z.infer<typeof engagementUpdateSchema>;

// ============== ASSOCIATED ENTERPRISE SCHEMAS ==============

export const associatedEnterpriseCreateSchema = z.object({
  clientId: z.string().cuid("Invalid client ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  country: z.string().min(2, "Country is required").max(100),
  relationship: RelationshipTypeEnum,
  pan: z.string().regex(panRegex, "Invalid PAN format").optional().nullable(),
  tin: z.string().max(50, "TIN too long").optional().nullable(),
  address: z.string().max(500).optional().nullable(),
});

export const associatedEnterpriseUpdateSchema = associatedEnterpriseCreateSchema.omit({ clientId: true }).partial();

export type AssociatedEnterpriseCreateInput = z.infer<typeof associatedEnterpriseCreateSchema>;
export type AssociatedEnterpriseUpdateInput = z.infer<typeof associatedEnterpriseUpdateSchema>;

// ============== INTERNATIONAL TRANSACTION SCHEMAS ==============

export const internationalTransactionCreateSchema = z.object({
  engagementId: z.string().cuid("Invalid engagement ID"),
  aeId: z.string().cuid("Invalid associated enterprise ID"),

  // Transaction Details
  natureCode: z.string().min(1).max(2, "Nature code must be 1-2 digits"),
  transactionType: TransactionTypeEnum,
  description: z.string().max(1000).optional().nullable(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3-letter code").default("INR"),

  // TP Method
  method: TPMethodEnum.optional().nullable(),
  testedParty: z.enum(["INDIAN_ENTITY", "AE"]).optional().nullable(),
  pliType: PLITypeEnum.optional().nullable(),
  pliValue: z.number().min(-1).max(2).optional().nullable(),

  // Safe Harbour
  safeHarbourApplied: z.boolean().default(false),
  safeHarbourType: SafeHarbourTypeEnum.optional().nullable(),
});

export const internationalTransactionUpdateSchema = internationalTransactionCreateSchema
  .omit({ engagementId: true, aeId: true })
  .partial()
  .extend({
    aeId: z.string().cuid().optional(),
    // Benchmarking Result (updated after analysis)
    armLengthPriceLow: z.number().optional().nullable(),
    armLengthPriceHigh: z.number().optional().nullable(),
    armLengthMedian: z.number().optional().nullable(),
    adjustmentAmount: z.number().optional().nullable(),
  });

export type InternationalTransactionCreateInput = z.infer<typeof internationalTransactionCreateSchema>;
export type InternationalTransactionUpdateInput = z.infer<typeof internationalTransactionUpdateSchema>;

// ============== SAFE HARBOUR RESULT SCHEMAS ==============

export const safeHarbourResultCreateSchema = z.object({
  engagementId: z.string().cuid("Invalid engagement ID"),
  transactionType: SafeHarbourTypeEnum,
  isEligible: z.boolean(),

  // For IT/ITES/KPO
  turnover: z.number().min(0).optional().nullable(),
  opOcMargin: z.number().min(-1).max(2).optional().nullable(),
  appliedRate: z.number().min(0).max(1).optional().nullable(),
  minimumRate: z.number().min(0).max(1).optional().nullable(),

  // For loans/guarantees
  interestRate: z.number().min(0).max(1).optional().nullable(),
  guaranteeFee: z.number().min(0).max(1).optional().nullable(),

  recommendation: z.string().max(2000).optional().nullable(),
  analysis: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const safeHarbourResultUpdateSchema = safeHarbourResultCreateSchema
  .omit({ engagementId: true })
  .partial();

export type SafeHarbourResultCreateInput = z.infer<typeof safeHarbourResultCreateSchema>;
export type SafeHarbourResultUpdateInput = z.infer<typeof safeHarbourResultUpdateSchema>;

// ============== BENCHMARKING RESULT SCHEMAS ==============

export const benchmarkingResultCreateSchema = z.object({
  engagementId: z.string().cuid("Invalid engagement ID"),
  transactionId: z.string().cuid().optional().nullable(),
  method: TPMethodEnum,
  pliType: PLITypeEnum,

  // Tested Party PLI
  testedPartyPLI: z.number(),

  // Arm's Length Range
  lowerQuartile: z.number(),
  median: z.number(),
  upperQuartile: z.number(),

  // Result
  isWithinRange: z.boolean(),
  adjustment: z.number().optional().nullable(),

  // Comparables
  comparablesCount: z.number().int().min(1),
  comparablesList: z.array(z.object({
    name: z.string(),
    country: z.string().optional(),
    pli: z.number(),
    year: z.string().optional(),
  })).optional().nullable(),

  // Adjustments
  adjustmentsApplied: z.record(z.string(), z.number()).optional().nullable(),
});

export const benchmarkingResultUpdateSchema = benchmarkingResultCreateSchema
  .omit({ engagementId: true })
  .partial();

export type BenchmarkingResultCreateInput = z.infer<typeof benchmarkingResultCreateSchema>;
export type BenchmarkingResultUpdateInput = z.infer<typeof benchmarkingResultUpdateSchema>;

// ============== DISPUTE CASE SCHEMAS ==============

export const disputeCaseCreateSchema = z.object({
  engagementId: z.string().cuid("Invalid engagement ID"),
  caseNumber: z.string().max(50).optional().nullable(),
  assessmentYear: z.string().regex(fyRegex, "Assessment year must be in format YYYY-YY"),
  stage: DisputeStageEnum.default("TPO"),
  status: DisputeStatusEnum.default("OPEN"),

  // Amounts
  adjustmentByTPO: z.number().min(0).optional().nullable(),
  amountAtStake: z.number().min(0),

  // Dates
  tpoOrderDate: z.coerce.date().optional().nullable(),
  drpFilingDate: z.coerce.date().optional().nullable(),
  nextHearingDate: z.coerce.date().optional().nullable(),

  // Outcome
  successProbability: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const disputeCaseUpdateSchema = z.object({
  caseNumber: z.string().max(50).optional().nullable(),
  stage: DisputeStageEnum.optional(),
  status: DisputeStatusEnum.optional(),

  // Amounts at each stage
  adjustmentByTPO: z.number().min(0).optional().nullable(),
  adjustmentByDRP: z.number().min(0).optional().nullable(),
  adjustmentByITAT: z.number().min(0).optional().nullable(),
  amountAtStake: z.number().min(0).optional(),

  // Dates
  tpoOrderDate: z.coerce.date().optional().nullable(),
  drpFilingDate: z.coerce.date().optional().nullable(),
  drpDirectionDate: z.coerce.date().optional().nullable(),
  itatFilingDate: z.coerce.date().optional().nullable(),
  nextHearingDate: z.coerce.date().optional().nullable(),

  // Outcome
  successProbability: z.number().int().min(0).max(100).optional().nullable(),
  outcome: z.enum(["WON", "LOST", "PARTIAL", "SETTLED"]).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type DisputeCaseCreateInput = z.infer<typeof disputeCaseCreateSchema>;
export type DisputeCaseUpdateInput = z.infer<typeof disputeCaseUpdateSchema>;

// ============== DOCUMENT SCHEMAS ==============

export const documentCreateSchema = z.object({
  engagementId: z.string().cuid().optional().nullable(),
  clientId: z.string().cuid().optional().nullable(),
  type: DocumentTypeEnum,
  name: z.string().max(255).optional().nullable(),
  data: z.record(z.string(), z.unknown()).optional().nullable(),
}).refine(
  (data) => data.engagementId || data.clientId,
  { message: "Either engagementId or clientId must be provided" }
);

export const documentUpdateSchema = z.object({
  status: DocStatusEnum.optional(),
  name: z.string().max(255).optional().nullable(),
  data: z.record(z.string(), z.unknown()).optional().nullable(),
  validationErrors: z.record(z.string(), z.unknown()).optional().nullable(),
  acknowledgmentNo: z.string().max(50).optional().nullable(),
  udin: z.string().max(50).optional().nullable(),
  filedAt: z.coerce.date().optional().nullable(),
});

export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;

// ============== FORM 3CEB SPECIFIC SCHEMAS ==============

export const form3CEBAssesseeSchema = z.object({
  name: z.string().min(1, "Assessee name is required"),
  pan: z.string().regex(panRegex, "Invalid PAN format"),
  address: z.string().optional(),
  principalPlaceOfBusiness: z.string().optional(),
  assessmentYear: z.string().regex(fyRegex),
});

export const form3CEBTransactionSchema = z.object({
  slNo: z.number().int().positive(),
  aeDetails: z.object({
    name: z.string(),
    country: z.string(),
    address: z.string().optional(),
    tin: z.string().optional(),
    relationship: z.string(),
  }),
  natureCode: z.string().min(1).max(2),
  natureDescription: z.string(),
  amount: z.number(),
  method: TPMethodEnum,
  armLengthPrice: z.number().optional(),
  adjustment: z.number().optional(),
});

export const form3CEBDataSchema = z.object({
  assesseeInfo: form3CEBAssesseeSchema,
  transactions: z.array(form3CEBTransactionSchema).optional(),
  aggregateValue: z.number().optional(),
  certifyingCA: z.object({
    name: z.string(),
    firmName: z.string(),
    membershipNo: z.string(),
    frn: z.string().optional(),
    udin: z.string().optional(),
    date: z.coerce.date().optional(),
  }).optional(),
});

export type Form3CEBData = z.infer<typeof form3CEBDataSchema>;

// ============== SAFE HARBOUR TOOL INPUT SCHEMAS ==============

export const safeHarbourITITESInputSchema = z.object({
  type: z.literal("IT_ITES"),
  turnover: z.number().positive("Turnover must be positive"),
  operatingCost: z.number().positive("Operating cost must be positive"),
  operatingProfit: z.number(),
  employeeCost: z.number().min(0),
});

export const safeHarbourKPOInputSchema = z.object({
  type: z.literal("KPO"),
  turnover: z.number().positive("Turnover must be positive"),
  operatingCost: z.number().positive("Operating cost must be positive"),
  operatingProfit: z.number(),
  isSignificantRD: z.boolean().default(false),
});

export const safeHarbourLoanInputSchema = z.object({
  type: z.enum(["LOAN_FC", "LOAN_INR"]),
  principal: z.number().positive("Principal must be positive"),
  interestRate: z.number().min(0).max(1, "Interest rate should be between 0 and 1"),
  currency: z.string().length(3).optional(),
  creditRating: z.string().optional(),
});

export const safeHarbourGuaranteeInputSchema = z.object({
  type: z.literal("GUARANTEE"),
  guaranteeAmount: z.number().positive("Guarantee amount must be positive"),
  guaranteeFee: z.number().min(0).max(1),
  creditRating: z.string().optional(),
});

export const safeHarbourInputSchema = z.discriminatedUnion("type", [
  safeHarbourITITESInputSchema,
  safeHarbourKPOInputSchema,
  safeHarbourLoanInputSchema,
  safeHarbourGuaranteeInputSchema,
]);

export type SafeHarbourInput = z.infer<typeof safeHarbourInputSchema>;

// ============== BENCHMARKING TOOL INPUT SCHEMAS ==============

export const benchmarkingInputSchema = z.object({
  method: TPMethodEnum,
  pliType: PLITypeEnum,
  testedPartyPLI: z.number(),

  // Financial data for PLI calculation
  financials: z.object({
    revenue: z.number().min(0).optional(),
    operatingCost: z.number().min(0).optional(),
    operatingProfit: z.number().optional(),
    grossProfit: z.number().optional(),
    totalAssets: z.number().min(0).optional(),
    capitalEmployed: z.number().min(0).optional(),
  }).optional(),

  // Search criteria
  industry: z.string().optional(),
  nicCode: z.string().optional(),
  region: z.string().optional(),
  years: z.array(z.string()).optional(),

  // Filters
  turnoverRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
});

export type BenchmarkingInput = z.infer<typeof benchmarkingInputSchema>;

// ============== HELPER FUNCTIONS ==============

/**
 * Validate and parse input with detailed error messages
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Format Zod errors for API response
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  return errors;
}

/**
 * Get first error message for simple display
 */
export function getFirstError(error: z.ZodError): string {
  return error.issues[0]?.message || "Validation failed";
}
