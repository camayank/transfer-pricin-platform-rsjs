/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Core Engine Library
 *
 * This is the main entry point for all core engines and utilities.
 * Import from this file to access all platform functionality.
 *
 * Usage:
 *   import { SafeHarbourCalculator, Form3CEBValidator, BenchmarkingEngine } from '@/lib/engines';
 *
 * ================================================================================
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export * from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

export {
  SAFE_HARBOUR_RULES,
  SBI_RATES,
  getSafeHarbourRule,
  getRequiredMargin,
  getInterestRateForLoan,
  isWithinSafeHarbourLimit,
  formatMarginForDisplay,
  getAllTransactionTypes,
  getServiceTransactionTypes,
  getFinancialTransactionTypes,
  ELIGIBILITY_MATRIX,
} from "./constants/safe-harbour-rules";

export {
  TRANSACTION_NATURE_CODES,
  TRANSACTION_CATEGORIES,
  TP_METHODS,
  PLI_TYPES,
  getTransactionCode,
  getTransactionCodesByCategory,
  getSafeHarbourEligibleCodes,
  getRecommendedTPMethod,
  getCategoryOptions,
  getAllTransactionCodesFlat,
  getTransactionCodesGrouped,
} from "./constants/transaction-codes";

// =============================================================================
// SAFE HARBOUR ENGINE
// =============================================================================

export {
  SafeHarbourCalculator,
  SafeHarbourValidationError,
  createSafeHarbourCalculator,
  checkITITeSQuick,
  checkKPOQuick,
  calculateLoanRate,
  TransactionType,
  CreditRating,
  Currency,
  type BatchSummary,
  type FinancialData as SafeHarbourFinancialData,
} from "./safe-harbour-engine";

// AI-Enhanced Safe Harbour Service
export {
  SafeHarbourAIService,
  createSafeHarbourAIService,
  type SafeHarbourEnhancedResult,
  type GapAnalysisResult,
  type Form3CEFANarrativeResult,
} from "./safe-harbour-ai";

// =============================================================================
// FORM 3CEB ENGINE
// =============================================================================

export {
  Form3CEBBuilder,
  Form3CEBValidator,
  createForm3CEBBuilder,
  createForm3CEBValidator,
  TransactionNature,
  TPMethod as Form3CEBTPMethod,
  RelationshipType,
  SDTNature,
  ValidationSeverity as Form3CEBValidationSeverity,
  TRANSACTION_NATURE_DESCRIPTIONS,
  type AssesseeInfo as Form3CEBAssesseeInfo,
  type AssociatedEnterprise as Form3CEBAssociatedEnterprise,
  type InternationalTransaction as Form3CEBInternationalTransaction,
  type SpecifiedDomesticTransaction,
  type AggregateValue,
  type CADetails,
  type Form3CEB,
  type ValidationResult as Form3CEBValidationResult,
} from "./form-3ceb-engine";

// AI-Enhanced Form 3CEB Service
export {
  Form3CEBAIService,
  createForm3CEBAIService,
  type TransactionDescriptionResult,
  type MethodJustificationResult,
  type EnhancedValidationResult,
  type EnhancedTransactionData,
} from "./form-3ceb-ai";

// =============================================================================
// BENCHMARKING ENGINE
// =============================================================================

export {
  BenchmarkingEngine,
  ComparableSearchEngine,
  createBenchmarkingEngine,
  createComparableSearchEngine,
  calculatePLIs,
  DatabaseSource,
  FunctionalProfile,
  FunctionalProfile as BenchmarkingFunctionalProfile,
  PLIType,
  PLIType as BenchmarkingPLIType,
  ScreeningCriteria,
  ScreeningCriteria as BenchmarkingScreeningCriteria,
  NIC_CODES,
  type FinancialData as BenchmarkingFinancialData,
  type ComparableCompany as BenchmarkingComparableCompany,
  type SearchCriteria,
  type BenchmarkingResult as BenchmarkingEngineResult,
} from "./benchmarking-engine";

// AI-Enhanced Benchmarking Service
export {
  BenchmarkingAIService,
  createBenchmarkingAIService,
  type WorkingCapitalData,
  type WorkingCapitalAdjustmentResult,
  type ComparableRejectionResult,
  type ArmLengthConclusionResult,
  type EnhancedBenchmarkingResult,
} from "./benchmarking-ai";

// =============================================================================
// MASTER FILE ENGINE
// =============================================================================

export {
  MasterFileBuilder,
  createMasterFileBuilder,
  validateMasterFile,
  isMasterFileComplete,
  EntityType,
  BusinessActivity,
  IntangibleType,
  FinancingArrangementType,
  MASTER_FILE_TEMPLATES,
  type MasterFile,
  type OrganizationalStructure,
  type BusinessDescription,
  type IntangiblesInfo,
  type IntercompanyFinancialActivities,
  type FinancialAndTaxPositions,
  type CAVerification,
  type GroupEntity,
  type ProductService,
  type IntangibleAsset,
  type FinancingArrangement,
  type APAInfo,
} from "./master-file-engine";

// AI-Enhanced Master File Service
export {
  MasterFileAIService,
  createMasterFileAIService,
  type OrganizationalStructureResult,
  type BusinessDescriptionResult,
  type IntangiblesStrategyResult,
  type FinancialPolicyResult,
  type FARAnalysisResult,
  type EnhancedMasterFile,
} from "./master-file-ai";

// =============================================================================
// ACCOUNTING CONNECTOR ENGINE
// =============================================================================

export {
  DataExtractionEngine,
  TallyPrimeConnector,
  ZohoBooksConnector,
  AccountingConnector,
  createTallyConnector,
  createZohoConnector,
  createDataExtractionEngine,
  calculatePLIs as calculateAccountingPLIs,
  AccountingSystem,
  AccountType,
  TransactionType as AccountingTransactionType,
  TALLY_ACCOUNT_MAPPING,
  RELATED_PARTY_KEYWORDS,
  NATURE_CODE_MAPPING,
  type AccountBalance,
  type RelatedPartyTransaction,
  type FinancialStatement,
  type ConnectorConfig,
  type ConnectionTestResult,
} from "./accounting-connector-engine";

// AI-Enhanced Accounting Connector Service
export {
  AccountingConnectorAIService,
  createAccountingConnectorAIService,
  createTallyConnectorWithAI,
  createZohoConnectorWithAI,
  type TransactionClassificationResult,
  type RelatedPartyDetectionResult,
  type NatureCodeRecommendation,
  type FinancialAnomalyResult,
  type EnhancedFinancialStatement,
} from "./accounting-connector-ai";

// =============================================================================
// DASHBOARD ENGINE
// =============================================================================

export {
  DashboardEngine,
  createDashboardEngine,
  ComplianceStatus,
  FormType,
  Priority,
  TeamRole,
  NotificationType,
  COMPLIANCE_CALENDAR,
  type TeamMember as DashboardTeamMember,
  type ComplianceForm,
  type Client as DashboardClient,
  type CAFirm,
  type Notification,
  type DashboardStats,
} from "./dashboard-engine";

// AI-Enhanced Dashboard Service
export {
  DashboardAIService,
  createDashboardAIService,
  type ComplianceRiskScore,
  type ClientPriorityAnalysis,
  type SmartNotification,
  type DeadlinePrediction,
  type EnhancedDashboardStats,
} from "./dashboard-ai";

// =============================================================================
// TIER 3: CBCR AI SERVICE
// =============================================================================

export {
  CbCRAIService,
  getCbCRAIService,
  createCbCRAIService,
  type JurisdictionAllocationResult,
  type ConsolidationNarrativeResult,
  type CbCRValidationResult,
  type NexusAnalysisResult,
  type CbCREntity,
  type CbCRJurisdictionData,
  type CbCRReport,
} from "./cbcr-ai";

// =============================================================================
// TIER 3: TP DISPUTE AI SERVICE
// =============================================================================

export {
  TPDisputeAIService,
  getTPDisputeAIService,
  createTPDisputeAIService,
  type DisputeRiskResult,
  type DefenseStrategyResult,
  type APAAssistanceResult,
  type TPOResponseResult,
  type LitigationResult,
  type TPProfile,
  type RPTSummary,
  type DocumentationStatus,
  type DisputeCase,
} from "./tp-dispute-ai";

// =============================================================================
// TIER 3: ANALYTICS AI SERVICE
// =============================================================================

export {
  AnalyticsAIService,
  getAnalyticsAIService,
  createAnalyticsAIService,
  type PrecedentMiningResult,
  type CrossBorderResult,
  type TrendAnalysisResult,
  type RiskPredictionResult,
  type FinancialYearData,
  type CrossBorderTransaction,
  type BenchmarkData,
} from "./analytics-ai";

// =============================================================================
// OECD GUIDELINES REFERENCE ENGINE
// =============================================================================

export {
  OECDReferenceEngine,
  createOECDReferenceEngine,
  OECD_GUIDELINES_VERSION,
  OECD_GUIDELINES,
  OECD_CHAPTERS,
  getAllChapterTitles,
  getGuidelinesForMethod,
  getGuidelinesForTransactionType,
  type OECDGuideline,
  type OECDChapter,
  type OECDSearchQuery,
  type OECDSearchResults,
  type GuidelineSearchResult,
  type GuidelineContext,
  type TPMethodGuidance,
} from "./oecd-reference-engine";

// =============================================================================
// CASE LAW ENGINE
// =============================================================================

export {
  CaseLawEngine,
  createCaseLawEngine,
  TP_CASE_LAW_VERSION,
  TP_CASE_LAW,
  getCaseById,
  getCasesByCourt,
  getCasesByOutcome,
  getCasesByMethod,
  getCasesByNatureCode,
  getCasesByKeyword,
  getCaseLawLandmarkCases,
  getCasesByAssessmentYear,
  getCasesByBench,
  getCaseStatistics,
  type TPCaseLaw,
  type CourtType,
  type RulingOutcome,
  type CaseLawTPMethod,
  type CaseLawSearchQuery,
  type CaseLawSearchResults,
  type CaseLawSearchResult,
  type CaseContext,
  type IssueAnalysis,
} from "./case-law-engine";

// =============================================================================
// FOREX ENGINE
// =============================================================================

export {
  ForexEngine,
  createForexEngine,
  FOREX_ENGINE_VERSION,
  STATIC_INR_RATES,
  CURRENCY_INFO,
  getSupportedCurrencies,
  getCurrencyInfo,
  isValidCurrencyCode,
  formatCurrency,
  type ForexRate,
  type ForexConversionResult,
  type HistoricalRate,
  type HistoricalRateQuery,
  type CurrencyCode,
  type ConversionRequest,
  type MultiConversionRequest,
  type MultiConversionResult,
  type RateComparisonResult,
  type AveragePeriodResult,
} from "./forex-engine";

// =============================================================================
// INTEREST RATE ENGINE
// =============================================================================

export {
  InterestRateEngine,
  createInterestRateEngine,
  INTEREST_RATE_ENGINE_VERSION,
  CURRENT_BENCHMARK_RATES,
  RATE_INFO,
  CREDIT_SPREADS,
  getAllSupportedRateTypes,
  getInterestRateInfo,
  getInterestRatesByCurrency,
  getInterestCreditSpread,
  isInterestRateAvailable,
  type InterestRate,
  type InterestRateType,
  type InterestRateCurrency,
  type LoanPricingInput,
  type LoanPricingResult,
  type TPLoanBenchmarkInput,
  type TPLoanBenchmarkResult,
  type RateTrendAnalysis,
  type SafeHarbourLoanResult,
} from "./interest-rate-engine";

// =============================================================================
// COMPARABLE SEARCH ENGINE
// =============================================================================

export {
  ComparableSearchEngine as ComparableEngine,
  createComparableSearchEngine as createComparableEngine,
  COMPARABLE_ENGINE_VERSION,
  PLI_DESCRIPTIONS,
  calculateBenchmarkingSet,
  getFunctionalProfiles,
  type ComparableCompany,
  type CompanyFinancials,
  type PLICalculated,
  type ComparableSearchCriteria,
  type BenchmarkingSet,
  type FunctionalProfile as ComparableFunctionalProfile,
  type DatabaseSource as ComparableDBSource,
  type UnifiedSearchCriteria,
  type UnifiedSearchResult,
  type ComparabilityAnalysis,
  type RejectionAnalysis,
  type WorkingCapitalAdjustment,
} from "./comparable-search-engine";

// =============================================================================
// E-FILING ENGINE
// =============================================================================

export {
  EfilingEngine,
  createEfilingEngine,
  EFILING_ENGINE_VERSION,
  getFormTypes,
  getFormSchema,
  getFormDeadline,
  isFormOverdue,
  getDaysUntilDeadline,
  type FormType as EfilingFormType,
  type SubmissionStatus,
  type EfilingSubmission,
  type SubmissionResponse,
  type XMLValidationResult,
  type SubmissionError,
  type Form3CEBData,
  type Form3CEAAData,
  type Form3CEADData,
  type InternationalTransactionEntry,
  type JurisdictionEntry,
  type CbCREntityEntry,
  type SubmissionWorkflow,
  type WorkflowStep,
  type AuditLogEntry as EfilingAuditLogEntry,
  type ComplianceStatus as EfilingComplianceStatus,
} from "./efiling-engine";

// =============================================================================
// DSC SIGNING ENGINE
// =============================================================================

export {
  DSCSigningEngine,
  createDSCSigningEngine,
  DSC_ENGINE_VERSION,
  getSupportedProviders,
  getSupportedSignatureTypes,
  getDaysUntilExpiry,
  isCertificateExpiringSoon,
  type DSCProvider,
  type DSCClass,
  type SignatureType,
  type CertificateInfo,
  type SigningResponse,
  type VerificationResponse,
  type SigningError,
  type SigningSession,
  type DocumentSigningRequest,
  type DocumentSigningResult,
  type BatchSigningRequest,
  type BatchSigningResult,
  type SignatureAuditEntry,
  type CertificateHealth,
} from "./dsc-signing-engine";

// =============================================================================
// VERSION INFO
// =============================================================================

export const VERSION = {
  core: "1.4.0",
  safeHarbourRules: "2024-25", // Valid through AY 2026-27
  form3CEBSchema: "1.4",
  aiService: "3.0.0",
  oecdGuidelines: "2022",
  caseLaw: "1.0.0",
  forexEngine: "1.0.0",
  interestRateEngine: "1.0.0",
  comparableEngine: "1.0.0",
  efilingEngine: "1.0.0",
  dscEngine: "1.0.0",
  lastUpdated: "2025-01-29",
  features: {
    aiIntegration: true,
    supportedProviders: ["anthropic", "openai", "google"],
    tier1AI: ["safe-harbour", "form-3ceb", "benchmarking"],
    tier2AI: ["master-file", "dashboard", "accounting-connector"],
    tier3AI: ["cbcr", "tp-dispute", "analytics"],
    reference: ["oecd-guidelines", "case-law"],
    rates: ["forex", "interest-rates"],
    integrations: ["comparables", "efiling", "dsc-signing"],
  },
};
