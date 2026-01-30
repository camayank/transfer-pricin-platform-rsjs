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
  MultiYearTestingEngine,
  createBenchmarkingEngine,
  createComparableSearchEngine,
  createMultiYearTestingEngine,
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
  type MultiYearTestingConfig,
  type MultiYearAnalysisResult,
  type EnhancedBenchmarkingResult,
  type YearOnYearTrend,
  type ComparableMultiYearData,
  type TrendComparison,
} from "./benchmarking-engine";

// AI-Enhanced Benchmarking Service
export {
  BenchmarkingAIService,
  createBenchmarkingAIService,
  type WorkingCapitalData,
  type WorkingCapitalAdjustmentResult,
  type ComparableRejectionResult,
  type ArmLengthConclusionResult,
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
// SECONDARY ADJUSTMENT ENGINE (Section 92CE)
// =============================================================================

export {
  SecondaryAdjustmentEngine,
  createSecondaryAdjustmentEngine,
  type SecondaryAdjustmentInput,
  type SecondaryAdjustmentResult,
  type DeemedDividendResult,
  type DeemedLoanInterestResult,
  type RepatriationEvent,
  type RepatriationTracker,
  type SecondaryAdjustmentValidationIssue,
} from "./secondary-adjustment-engine";

export {
  SecondaryAdjustmentAIService,
  createSecondaryAdjustmentAIService,
  getSecondaryAdjustmentAIService,
  type EnhancedSecondaryAdjustmentResult,
  type RepatriationStrategy,
  type RepatriationStrategyResult,
} from "./secondary-adjustment-ai";

// =============================================================================
// PENALTY COMPUTATION ENGINE
// =============================================================================

export {
  PenaltyEngine,
  createPenaltyEngine,
  EntityType as PenaltyEntityType,
  type PenaltyInput,
  type ConcealmentPenaltyResult,
  type DocumentationPenaltyResult,
  type ReportFailurePenaltyResult,
  type InterestResult,
  type TotalPenaltyExposure,
  type MitigationAnalysis,
} from "./penalty-engine";

export {
  PenaltyAIService,
  createPenaltyAIService,
  getPenaltyAIService,
  type EnhancedPenaltyExposure,
  type PenaltyDefenseNarrative,
  type AIPenaltyAnalysis,
} from "./penalty-ai";

// =============================================================================
// THIN CAPITALIZATION ENGINE (Section 94B)
// =============================================================================

export {
  ThinCapitalizationEngine,
  createThinCapEngine,
  type ThinCapInput,
  type ThinCapResult,
  type EBITDAResult,
  type InterestAnalysis,
  type CarryforwardResult,
  type ExemptionResult,
  type FinancialData as ThinCapFinancialData,
  type InterestExpense as ThinCapInterestExpense,
  INTEREST_THRESHOLD,
  EBITDA_LIMITATION_PERCENTAGE,
  CARRYFORWARD_YEARS,
  Section94BEntityType,
  LenderType,
  calculateAllowableInterest,
  calculateDisallowedInterest,
  calculateEBITDA,
  isExemptEntity,
} from "./thin-cap-engine";

export {
  ThinCapAIService,
  createThinCapAIService,
  getThinCapAIService,
  type EnhancedThinCapResult,
  type EBITDAOptimizationAnalysis,
  type MultiYearProjection,
  type RestructuringOpportunity,
} from "./thin-cap-ai";

// =============================================================================
// MAM SELECTION ENGINE
// =============================================================================

export {
  MAMSelectionEngine,
  createMAMSelectionEngine,
  getMethodDetails,
  TPMethod,
  TransactionType as MAMTransactionType,
  FunctionalProfile as MAMFunctionalProfile,
  type MAMSelectionInput,
  type MAMSelectionResult,
  type MethodRanking,
  type ComparabilityAssessment,
  type MethodRejection,
  type RecommendedPLI,
} from "./mam-selection-engine";

export {
  MAMSelectionAIService,
  createMAMSelectionAIService,
  getMAMSelectionAIService,
  type EnhancedMAMSelectionResult,
  type AIMAMAnalysis,
  type OECDComplianceCheck,
  type IndianTPRulesCheck,
  type DocumentationGuidance,
  type MAMRiskAnalysis,
  type AlternativeScenario,
} from "./mam-selection-ai";

// =============================================================================
// DISPUTE WORKFLOW ENGINE (DRP/ITAT)
// =============================================================================

export {
  DisputeWorkflowEngine,
  createDisputeWorkflowEngine,
  getDisputeWorkflowEngine,
  type TPOOrder,
  type DraftAssessmentOrder,
  type DRPApplication,
  type DRPObjection,
  type DRPTimeline,
  type DRPDirection,
  type ITATAppeal,
  type ITATTimeline,
  type StayApplication,
  type GroundsOfAppeal,
  type Form35Data,
  type Form36Data,
  type DRPDocument,
  type EligibilityResult,
  type ProgressTracker,
} from "./dispute-workflow-engine";

// =============================================================================
// COMPARABILITY ADJUSTMENTS ENGINE
// =============================================================================

export {
  ComparabilityAdjustmentsEngine,
  createComparabilityAdjustmentsEngine,
  getComparabilityAdjustmentsEngine,
  AdjustmentType,
  IndustryType,
  RiskType,
  AccountingStandard,
  type ComparableEntity,
  type ComparableFinancials,
  type TestedPartyData,
  type WorkingCapitalInput,
  type WorkingCapitalResult,
  type RiskAdjustmentInput,
  type RiskAdjustmentResult,
  type CapacityAdjustmentInput,
  type CapacityAdjustmentResult,
  type GeographicAdjustmentInput,
  type GeographicAdjustmentResult,
  type AccountingAdjustmentInput,
  type AccountingAdjustmentResult,
  type AdjustedComparable,
  type ComparabilityAnalysisResult,
} from "./comparability-adjustments-engine";

// =============================================================================
// CBCR FULL ENGINE (Form 3CEAD)
// =============================================================================

export {
  CbCREngine,
  createCbCREngine,
  getCbCREngine,
  CbCREntityRole,
  CbCRBusinessActivity,
  CBCR_THRESHOLDS,
  INDIA_CBCR_FORMS,
  KEY_JURISDICTIONS,
  type CbCRApplicabilityInput,
  type CbCRApplicabilityResult,
  type CbCRInput,
  type CbCRGenerationResult,
  type CbCRValidationResult as CbCREngineValidationResult,
  type CbCRSummaryStatistics,
  type EntityData as CbCREntityData,
  type JurisdictionAggregation,
} from "./cbcr-engine";

// =============================================================================
// BFSI INDUSTRY MODULE
// =============================================================================

export {
  BFSIModule,
  createBFSIModule,
  getBFSIModule,
  BFSITransactionType,
  type LoanPricingInput as BFSILoanPricingInput,
  type LoanPricingResult as BFSILoanPricingResult,
  type GuaranteePricingInput,
  type GuaranteePricingResult,
  type CaptiveInsuranceInput,
  type CaptiveInsuranceResult,
  type TreasuryServiceInput,
  type TreasuryServiceResult,
  type CashPoolInput,
  type CashPoolResult,
} from "./modules/bfsi-module";

// =============================================================================
// DIGITAL ECONOMY MODULE
// =============================================================================

export {
  DigitalEconomyModule,
  createDigitalEconomyModule,
  getDigitalEconomyModule,
  DigitalServiceType,
  type PillarOneInput,
  type PillarOneResult,
  type PillarTwoInput,
  type PillarTwoResult,
  type DigitalProfitSplitInput,
  type DigitalProfitSplitResult,
  type UserParticipationInput,
  type UserParticipationResult,
  type MarketingIntangibleInput,
  type MarketingIntangibleResult,
  type GloBEJurisdictionData,
  type GloBEJurisdictionAnalysis,
} from "./modules/digital-economy-module";

// =============================================================================
// BUSINESS RESTRUCTURING MODULE
// =============================================================================

export {
  BusinessRestructuringModule,
  createBusinessRestructuringModule,
  getBusinessRestructuringModule,
  RestructuringType,
  ValuationMethod,
  type RestructuringInput,
  type RestructuringResult,
  type ExitChargeResult,
  type TerminationPaymentResult,
  type GoingConcernResult,
  type IntangiblesTransferResult,
  type WorkforceTransferResult,
  type DEMPEAnalysis,
  type OECDComplianceAssessment,
} from "./modules/restructuring-module";

// =============================================================================
// CONSTANTS EXPORTS
// =============================================================================

export {
  PRIMARY_ADJUSTMENT_THRESHOLD,
  REPATRIATION_DEADLINE_DAYS,
  SecondaryAdjustmentTrigger,
  SecondaryAdjustmentOption,
  DEEMED_DIVIDEND_RULES,
  SECONDARY_ADJUSTMENT_EXEMPTIONS,
  AY_SPECIFIC_RULES as SECONDARY_ADJUSTMENT_AY_RULES,
  getSecondaryAdjustmentInterestRate,
  calculateRepatriationDeadline,
  isSecondaryAdjustmentApplicable,
} from "./constants/secondary-adjustment-rules";

export {
  PenaltySection,
  CONCEALMENT_PENALTY_RATES,
  DOCUMENTATION_PENALTY_271AA,
  REPORT_FAILURE_PENALTY_271BA,
  INTEREST_234A,
  INTEREST_234B,
  INTEREST_234C,
  INTEREST_234D,
  PENALTY_MITIGATION_FACTORS,
  calculateConcealmentPenaltyRange,
  calculate271AAPenalty,
  calculate271BAPenalty,
} from "./constants/penalty-rules";

export {
  AY_THIN_CAP_RULES,
  EXEMPT_ENTITIES as THIN_CAP_EXEMPT_ENTITIES,
  CARRYFORWARD_RULES,
  isSection94BApplicable,
} from "./constants/thin-cap-rules";

export {
  MAM_SELECTION_FACTORS,
  TRANSACTION_METHOD_MAPPING,
  FUNCTIONAL_PROFILE_MAPPING,
  METHOD_REJECTION_RATIONALES,
  getMethodDetails as getMAMMethodDetails,
  getPreferredMethods,
} from "./constants/mam-criteria";

export {
  DisputeStage,
  DisputeStatus,
  FormType as DisputeFormType,
  DISPUTE_TIMELINES,
  FORM_REQUIREMENTS,
  STANDARD_TP_GROUNDS,
  calculateDeadline,
  isWithinTimeLimit,
} from "./constants/dispute-timelines";

export {
  WORKING_CAPITAL_PARAMETERS,
  INDUSTRY_WORKING_CAPITAL_BENCHMARKS,
  RISK_ADJUSTMENT_FACTORS,
  INDUSTRY_CAPACITY_PARAMETERS,
  GEOGRAPHIC_FACTORS,
  PLI_ADJUSTMENT_THRESHOLDS,
} from "./constants/adjustment-parameters";

export {
  CBCR_VALIDATION_RULES,
  isCbCRApplicable,
  calculateCbCRDeadline,
  calculateCbCRPenalty,
} from "./constants/cbcr-rules";

export {
  INTEREST_RATE_BENCHMARKS,
  CREDIT_RATING_SPREADS,
  GUARANTEE_FEE_RANGES,
  CAPTIVE_INSURANCE_PARAMETERS,
  TREASURY_SERVICE_FEES,
  NBFC_LENDING_PARAMETERS,
  getBenchmarkRate,
  getCreditSpread,
  getGuaranteeFeeRange,
} from "./constants/bfsi-benchmarks";

export {
  PILLAR_ONE_THRESHOLDS,
  PILLAR_TWO_THRESHOLDS,
  DIGITAL_SERVICE_CHARACTERISTICS,
  USER_PARTICIPATION_FACTORS,
  DIGITAL_PROFIT_SPLIT_KEYS,
  isInScopeForAmountA,
  isInScopeForGloBE,
  calculateAmountAReallocation,
  calculateGloBETopUp,
} from "./constants/digital-economy-rules";

// =============================================================================
// VERSION INFO
// =============================================================================

export const VERSION = {
  core: "2.0.0",
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
  secondaryAdjustmentEngine: "1.0.0",
  penaltyEngine: "1.0.0",
  thinCapEngine: "1.0.0",
  mamSelectionEngine: "1.0.0",
  disputeWorkflowEngine: "1.0.0",
  comparabilityAdjustmentsEngine: "1.0.0",
  cbcrEngine: "1.0.0",
  bfsiModule: "1.0.0",
  digitalEconomyModule: "1.0.0",
  restructuringModule: "1.0.0",
  lastUpdated: "2026-01-30",
  features: {
    aiIntegration: true,
    supportedProviders: ["anthropic", "openai", "google"],
    tier1AI: ["safe-harbour", "form-3ceb", "benchmarking"],
    tier2AI: ["master-file", "dashboard", "accounting-connector"],
    tier3AI: ["cbcr", "tp-dispute", "analytics"],
    regulatory: ["secondary-adjustment", "penalty", "thin-cap"],
    workflow: ["mam-selection", "dispute-workflow", "comparability-adjustments"],
    industryModules: ["bfsi", "digital-economy", "restructuring"],
    reference: ["oecd-guidelines", "case-law"],
    rates: ["forex", "interest-rates"],
    integrations: ["comparables", "efiling", "dsc-signing"],
  },
};
