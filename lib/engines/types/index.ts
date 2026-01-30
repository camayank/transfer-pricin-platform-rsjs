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

// =============================================================================
// SECONDARY ADJUSTMENT TYPES (Section 92CE)
// =============================================================================

export type AERelationship = "subsidiary" | "parent" | "sister" | "pe" | "other";

export interface SecondaryAdjustmentInput {
  primaryAdjustmentAmount: number;
  assessmentYear: string;
  aeJurisdiction: string;
  aeRelationship: AERelationship;
  taxTreatyExists: boolean;
  treatyCountry?: string;
  shareholdingPercentage?: number;
  repatriationEvents?: RepatriationEvent[];
}

export interface RepatriationEvent {
  date: Date;
  amount: number;
  mode: "bank_transfer" | "dividend" | "loan_repayment" | "other";
  reference?: string;
}

export interface SecondaryAdjustmentResult {
  isSecondaryAdjustmentApplicable: boolean;
  adjustmentType: "deemed_dividend" | "deemed_loan" | "not_applicable";
  excessMoney: number;
  adjustmentDate: Date;
  repatriationDeadline: Date | null;
  deemedDividend: DeemedDividendResult | null;
  deemedLoanInterest: DeemedLoanInterestResult | null;
  applicableSection: string;
  recommendations: string[];
}

export interface DeemedDividendResult {
  amount: number;
  section: string;
  taxRate: number;
  taxLiability: number;
}

export interface DeemedLoanInterestResult {
  principal: number;
  interestRate: number;
  periodDays: number;
  totalInterest: number;
}

export interface RepatriationTrackerResult {
  totalRepatriated: number;
  pendingAmount: number;
  isFullyRepatriated: boolean;
  daysRemaining: number;
  events: RepatriationEvent[];
}

// =============================================================================
// PENALTY ENGINE TYPES (Sections 271, 234)
// =============================================================================

export interface ConcealmentPenaltyInput {
  assessmentYear: string;
  undisclosedIncome: number;
  taxEvaded: number;
  isWilfulConcealment: boolean;
  isRepeatOffence: boolean;
}

export interface ConcealmentPenaltyResult {
  section: string;
  minimumPenalty: number;
  maximumPenalty: number;
  taxEvaded: number;
  applicableRate: { min: number; max: number };
  mitigatingFactors: string[];
  aggravatingFactors: string[];
}

export interface DocumentationPenaltyInput {
  assessmentYear: string;
  transactionValue: number;
  penaltyType: "271AA" | "271G";
}

export interface DocumentationPenaltyResult {
  section: string;
  penalty: number;
  transactionValue: number;
  penaltyRate: number;
  basis: string;
}

export interface ReportFailurePenaltyResult {
  section: string;
  penalty: number;
  reportType: string;
  basis: string;
}

export interface InterestInput234A {
  taxDue: number;
  dueDate: Date;
  filingDate: Date;
}

export interface InterestInput234B {
  assessedTax: number;
  advanceTaxPaid: number;
  assessmentDate: Date;
}

export interface InterestInput234C {
  totalAdvanceTaxLiability: number;
  quarterlyPayments: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  assessmentYear: string;
}

export interface InterestInput234D {
  refundGranted: number;
  refundDate: Date;
  regularAssessmentDate: Date;
  refundAdjusted: number;
}

export interface InterestResult {
  section: string;
  interest: number;
  principal: number;
  months: number;
  rate: number;
}

export interface TotalPenaltyExposure {
  concealmentPenalty: ConcealmentPenaltyResult;
  documentationPenalty: DocumentationPenaltyResult | null;
  reportPenalty: ReportFailurePenaltyResult | null;
  interestLiability: InterestResult[];
  totalMinimumPenalty: number;
  totalMaximumPenalty: number;
  totalInterest: number;
}

export interface PenaltyMitigationAnalysis {
  mitigationPotential: "high" | "medium" | "low";
  recommendations: string[];
  precedents: string[];
  estimatedReduction: number;
}

// =============================================================================
// THIN CAPITALIZATION TYPES (Section 94B)
// =============================================================================

export type ThinCapEntityType = "company" | "llp" | "firm" | "other";
export type ThinCapEntityCategory = "banking" | "insurance" | "nbfc" | "general";

export interface ThinCapFinancials {
  operatingProfit: number;
  depreciation: number;
  interestExpense: number;
  totalAssets?: number;
  totalDebt?: number;
  equity?: number;
}

export interface ThinCapInput {
  assessmentYear: string;
  entityType: ThinCapEntityType;
  financials: ThinCapFinancials;
  interestPaidToNonResidentAE: number;
  interestReceivedFromNonResidentAE?: number;
}

export interface ThinCapResult {
  isLimitationApplicable: boolean;
  ebitda: number;
  allowableInterest: number;
  disallowedInterest: number;
  limitPercentage: number;
  netInterestExpense: number;
  carryforwardEligible: boolean;
  exemptionReason?: string;
}

export interface EBITDAResult {
  operatingProfit: number;
  depreciation: number;
  interestExpense: number;
  ebitda: number;
}

export interface ThinCapHistory {
  year: string;
  disallowedInterest: number;
  utilized: number;
  expired: boolean;
}

export interface CarryforwardResult {
  totalCarryforward: number;
  yearWiseBreakdown: ThinCapHistory[];
  expiringNextYear: number;
  totalUtilized: number;
  totalExpired: number;
}

export interface ThinCapExemptionResult {
  isExempt: boolean;
  reason?: string;
  reference?: string;
}

// =============================================================================
// MAM SELECTION TYPES
// =============================================================================

export type TPMethodCode = "CUP" | "RPM" | "CPM" | "TNMM" | "PSM" | "OTHER";

export type TransactionTypeCode =
  | "sale_of_goods"
  | "provision_of_services"
  | "use_of_intangibles"
  | "financial_transaction"
  | "cost_sharing"
  | "business_restructuring";

export interface FunctionalProfileInput {
  functions: string[];
  assets: string[];
  risks: string[];
}

export interface DataAvailabilityInput {
  internalComparables: boolean;
  externalComparables: boolean;
  grossMarginData: boolean;
  netMarginData: boolean;
  profitSplitData: boolean;
}

export interface IndustryCharacteristicsInput {
  industry: string;
  isUniqueIntangibles: boolean;
  isIntegratedOperations: boolean;
  isRoutineFunction: boolean;
}

export interface TransactionProfile {
  transactionType: TransactionTypeCode;
  transactionDescription: string;
  transactionValue: number;
  functionalProfile: FunctionalProfileInput;
  dataAvailability: DataAvailabilityInput;
  industryCharacteristics?: IndustryCharacteristicsInput;
}

export interface MAMSelectionInput {
  transaction: TransactionProfile;
  testedParty: "indian_entity" | "foreign_ae";
  assessmentYear: string;
}

export interface MethodRanking {
  method: TPMethodCode;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface MAMSelectionResult {
  selectedMethod: TPMethodCode;
  methodRanking: MethodRanking[];
  confidence: "high" | "medium" | "low";
  justification: string;
  alternativeMethod?: TPMethodCode;
  alternativeJustification?: string;
}

// =============================================================================
// DISPUTE WORKFLOW TYPES
// =============================================================================

export enum DisputeStage {
  TPO_PROCEEDING = "tpo_proceeding",
  DRP_FILING = "drp_filing",
  DRP_HEARING = "drp_hearing",
  ASSESSMENT = "assessment",
  CIT_APPEAL = "cit_appeal",
  ITAT_APPEAL = "itat_appeal",
  ITAT_HEARING = "itat_hearing",
  HIGH_COURT = "high_court",
  SUPREME_COURT = "supreme_court",
  MAP = "map",
  APA = "apa",
  COMPLETED = "completed",
}

export enum DisputeStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  HEARING_SCHEDULED = "hearing_scheduled",
  AWAITING_ORDER = "awaiting_order",
  ORDER_RECEIVED = "order_received",
  FAVORABLE = "favorable",
  PARTIALLY_FAVORABLE = "partially_favorable",
  ADVERSE = "adverse",
  WITHDRAWN = "withdrawn",
  SETTLED = "settled",
}

export interface TaxpayerDetails {
  name: string;
  pan: string;
  address: string;
}

export interface DRPInput {
  tpoOrderDate: Date;
  tpoOrderNumber: string;
  assessmentYear: string;
  adjustmentAmount: number;
  adjustmentType: "primary" | "secondary" | "penalty";
  transactionType: string;
  objections: DRPObjection[];
  taxpayerDetails: TaxpayerDetails;
}

export interface DRPObjection {
  ground: string;
  description: string;
  supportingEvidence: string[];
}

export interface DRPApplication {
  applicationId: string;
  filingDate: Date;
  deadline: Date;
  objections: DRPObjection[];
  status: DisputeStatus;
  timeline: DRPTimeline;
}

export interface DRPTimeline {
  filingDeadline: Date;
  expectedDirectionDate: Date | null;
  hearingDates: Date[];
  milestones: { event: string; date: Date; completed: boolean }[];
}

export interface DRPEligibility {
  eligible: boolean;
  reason?: string;
  deadlineDate?: Date;
  daysRemaining?: number;
}

export interface ITATInput {
  drpDirectionDate?: Date;
  assessmentOrderDate: Date;
  assessmentOrderNumber: string;
  assessmentYear: string;
  adjustmentAmount: number;
  groundsOfAppeal: string[];
  taxpayerDetails: TaxpayerDetails;
}

export interface ITATAppeal {
  appealId: string;
  filingDate: Date;
  deadline: Date;
  grounds: string[];
  status: DisputeStatus;
  courtFee: number;
}

export interface Form35Data {
  appellantDetails: TaxpayerDetails;
  assessmentYear: string;
  orderAppealed: {
    orderNumber: string;
    orderDate: Date;
    authority: string;
  };
  groundsOfAppeal: string[];
  reliefSought: string;
  verification: {
    place: string;
    date: Date;
  };
}

export interface Form36Data {
  appellantDetails: TaxpayerDetails;
  assessmentYear: string;
  statementOfFacts: string;
  groundsOfAppeal: string[];
  argumentsSummary: string;
}

export interface DisputeCase {
  caseId: string;
  stage: DisputeStage;
  status: DisputeStatus;
  filingDate: Date;
  events: { date: Date; event: string; notes?: string }[];
}

export interface DisputeProgress {
  currentStage: DisputeStage;
  currentStatus: DisputeStatus;
  daysInCurrentStage: number;
  expectedNextMilestone: string;
  timeline: { stage: DisputeStage; startDate: Date; endDate?: Date }[];
}

// =============================================================================
// CBCR TYPES (Country-by-Country Reporting)
// =============================================================================

export enum CbCREntityRole {
  ULTIMATE_PARENT = "ultimate_parent",
  SURROGATE_PARENT = "surrogate_parent",
  CONSTITUENT_ENTITY = "constituent_entity",
  EXCLUDED_ENTITY = "excluded_entity",
}

export interface CbCRInput {
  groupName: string;
  ultimateParentEntity: {
    name: string;
    jurisdiction: string;
    tin: string;
  };
  reportingFiscalYear: string;
  groupRevenue: number;
  currency: string;
  entities: CbCREntityData[];
  additionalInfo?: string;
}

export interface CbCREntityData {
  entityName: string;
  jurisdiction: string;
  tin?: string;
  role: CbCREntityRole;
  incorporationJurisdiction?: string;
  businessActivities: string[];
  revenues: {
    unrelatedParty: number;
    relatedParty: number;
  };
  profitBeforeTax: number;
  incomeTaxPaid: number;
  incomeTaxAccrued: number;
  statedCapital: number;
  accumulatedEarnings: number;
  numberOfEmployees: number;
  tangibleAssets: number;
}

export interface CbCRJurisdictionData {
  jurisdiction: string;
  entityCount: number;
  revenues: {
    unrelatedParty: number;
    relatedParty: number;
    total: number;
  };
  profitBeforeTax: number;
  incomeTaxPaid: number;
  incomeTaxAccrued: number;
  statedCapital: number;
  accumulatedEarnings: number;
  numberOfEmployees: number;
  tangibleAssets: number;
}

export interface CbCRReport {
  groupName: string;
  ultimateParentEntity: {
    name: string;
    jurisdiction: string;
    tin: string;
  };
  reportingFiscalYear: string;
  currency: string;
  table1: CbCRJurisdictionData[];
  table2: CbCREntityData[];
  table3: string;
  generatedAt: Date;
}

export interface CbCRApplicability {
  applicable: boolean;
  reason?: string;
  threshold?: number;
  groupRevenue?: number;
}

export interface CbCRValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Form3CEADData {
  partA: {
    groupDetails: {
      name: string;
      ultimateParent: string;
      jurisdiction: string;
    };
    reportingPeriod: {
      from: string;
      to: string;
    };
    filingEntity: {
      name: string;
      pan: string;
      role: CbCREntityRole;
    };
  };
  partB: CbCRJurisdictionData[];
  partC: CbCREntityData[];
  additionalInfo: string;
}

// =============================================================================
// COMPARABILITY ADJUSTMENTS TYPES
// =============================================================================

export interface WorkingCapitalInput {
  testedParty: {
    receivables: number;
    inventory: number;
    payables: number;
    revenue: number;
  };
  comparable: {
    receivables: number;
    inventory: number;
    payables: number;
    revenue: number;
  };
  interestRate: number;
}

export interface WorkingCapitalResult {
  testedPartyDays: {
    receivableDays: number;
    inventoryDays: number;
    payableDays: number;
    netWorkingCapitalDays: number;
  };
  comparableDays: {
    receivableDays: number;
    inventoryDays: number;
    payableDays: number;
    netWorkingCapitalDays: number;
  };
  adjustment: number;
  adjustmentPercentage: number;
  methodology: string;
}

export interface RiskAdjustmentInput {
  testedPartyRisks: string[];
  comparableRisks: string[];
  riskCategory: "market" | "credit" | "operational" | "forex" | "inventory";
}

export interface RiskAdjustmentResult {
  riskDifferential: number;
  adjustment: number;
  methodology: string;
  factors: { risk: string; impact: number }[];
}

export interface CapacityAdjustmentInput {
  testedPartyUtilization: number;
  comparableUtilization: number;
  fixedCostPercentage: number;
}

export interface CapacityAdjustmentResult {
  utilizationDifferential: number;
  adjustment: number;
  methodology: string;
}

export interface GeographicAdjustmentInput {
  testedPartyCountry: string;
  comparableCountry: string;
  adjustmentFactors: string[];
}

export interface GeographicAdjustmentResult {
  marketSizeFactor: number;
  purchasingPowerFactor: number;
  totalAdjustment: number;
  methodology: string;
}

export interface AccountingReconciliationInput {
  testedPartyStandard: "IND_AS" | "IGAAP" | "IFRS" | "US_GAAP";
  comparableStandard: "IND_AS" | "IGAAP" | "IFRS" | "US_GAAP";
  differences: string[];
}

export interface AccountingReconciliationResult {
  adjustments: { item: string; amount: number }[];
  totalAdjustment: number;
  methodology: string;
}

export interface AdjustedComparable {
  originalMargin: number;
  workingCapitalAdjustment: number;
  riskAdjustment: number;
  capacityAdjustment: number;
  geographicAdjustment: number;
  accountingAdjustment: number;
  totalAdjustment: number;
  adjustedMargin: number;
}

// =============================================================================
// BFSI MODULE TYPES
// =============================================================================

export interface LoanPricingInput {
  loanAmount: number;
  currency: string;
  tenor: number; // in months
  borrowerCreditRating: CreditRating;
  benchmarkRate: string;
  isSecured: boolean;
  collateralValue?: number;
}

export interface LoanPricingResult {
  benchmarkRate: number;
  creditSpread: number;
  totalRate: number;
  armLengthRange: { min: number; max: number };
  comparables: string[];
  methodology: string;
}

export interface GuaranteePricingInput {
  guaranteeAmount: number;
  currency: string;
  tenor: number;
  beneficiaryCreditRating: CreditRating;
  guarantorCreditRating: CreditRating;
  isFinancialGuarantee: boolean;
}

export interface GuaranteePricingResult {
  feeRate: number;
  annualFee: number;
  armLengthRange: { min: number; max: number };
  methodology: string;
  yieldApproachValue?: number;
  creditDefaultApproachValue?: number;
}

export interface CaptiveInsuranceInput {
  premiumAmount: number;
  coverageType: string;
  riskProfile: "low" | "medium" | "high";
  claimsHistory: number[];
  industryLossRatio: number;
}

export interface CaptiveInsurancePricingResult {
  armLengthPremium: number;
  expectedLossRatio: number;
  loadingFactor: number;
  methodology: string;
  comparableAnalysis: string;
}

export interface CashPoolInput {
  participants: {
    entityName: string;
    position: "depositor" | "borrower";
    amount: number;
    currency: string;
  }[];
  poolCurrency: string;
  poolLeaderFee?: number;
}

export interface CashPoolResult {
  netPosition: number;
  depositRate: number;
  borrowingRate: number;
  spread: number;
  poolLeaderCompensation: number;
  armLengthAssessment: string;
}

// =============================================================================
// DIGITAL ECONOMY MODULE TYPES
// =============================================================================

export interface PillarOneInput {
  groupRevenue: number;
  groupProfitability: number;
  revenueByJurisdiction: { jurisdiction: string; revenue: number }[];
  userBasedRevenue: number;
  digitalServiceRevenue: number;
}

export interface PillarOneResult {
  inScope: boolean;
  amountA: number;
  amountB: number;
  allocationByJurisdiction: { jurisdiction: string; amount: number }[];
  methodology: string;
  exemptionReason?: string;
}

export interface PillarTwoInput {
  groupRevenue: number;
  jurisdictionData: {
    jurisdiction: string;
    coveredTaxes: number;
    gloBEIncome: number;
    qualifiedRefundableTaxCredits: number;
  }[];
}

export interface PillarTwoResult {
  inScope: boolean;
  jurisdictionETRs: { jurisdiction: string; etr: number; topUpTax: number }[];
  totalTopUpTax: number;
  iirAmount: number;
  utprAmount: number;
  qdmttAmount: number;
  methodology: string;
}

export interface DigitalProfitSplitInput {
  digitalServiceRevenue: number;
  routineFunctions: { entity: string; function: string; compensation: number }[];
  userParticipationValue: number;
  dataValue: number;
  networkEffectsValue: number;
}

export interface DigitalProfitSplitResult {
  totalProfit: number;
  routineReturns: { entity: string; amount: number }[];
  residualProfit: number;
  userParticipationShare: number;
  dataShare: number;
  networkEffectsShare: number;
  splitAllocation: { entity: string; amount: number }[];
  methodology: string;
}

export interface UserParticipationInput {
  activeUsers: number;
  userGeneratedContent: number;
  dataCollected: number;
  engagementMetrics: { metric: string; value: number }[];
  revenuePerUser: number;
}

export interface UserParticipationResult {
  participationValue: number;
  valueDrivers: { driver: string; contribution: number }[];
  allocationBasis: string;
  methodology: string;
}

export interface MarketingIntangibleInput {
  brandValue: number;
  customerRelationships: number;
  marketData: number;
  localMarketingSpend: number;
}

export interface MarketingIntangibleResult {
  totalValue: number;
  dempeAnalysis: {
    development: number;
    enhancement: number;
    maintenance: number;
    protection: number;
    exploitation: number;
  };
  localContribution: number;
  methodology: string;
}

// =============================================================================
// BUSINESS RESTRUCTURING MODULE TYPES
// =============================================================================

export interface RestructuringInput {
  restructuringType:
    | "function_transfer"
    | "risk_transfer"
    | "asset_transfer"
    | "contract_termination"
    | "business_line_transfer";
  transferorEntity: string;
  transfereeEntity: string;
  transferDate: Date;
  functionsTransferred: string[];
  assetsTransferred: { name: string; bookValue: number; fairValue: number }[];
  risksTransferred: string[];
  employeesTransferred: number;
  contractsTerminated: { counterparty: string; remainingValue: number }[];
  historicalProfitability: number[];
}

export interface RestructuringResult {
  requiresCompensation: boolean;
  exitChargeRequired: boolean;
  totalCompensation: number;
  componentBreakdown: {
    tangibleAssets: number;
    intangibleAssets: number;
    workforceValue: number;
    contractTermination: number;
    goingConcernPremium: number;
    lostProfits: number;
  };
  armLengthRange: { min: number; max: number };
  methodology: string;
  recommendations: string[];
}

export interface ExitChargeInput {
  transferredFunctions: string[];
  transferredAssets: { type: string; value: number }[];
  transferredRisks: string[];
  historicalProfits: number[];
  projectedProfits: number[];
  discountRate: number;
  projectionYears: number;
}

export interface ExitChargeResult {
  exitCharge: number;
  valuationMethodology: string;
  functionsValue: number;
  assetsValue: number;
  risksValue: number;
  goingConcernValue: number;
  discountedCashFlowValue: number;
}

export interface TerminationPaymentInput {
  contractType: string;
  remainingTerm: number; // in months
  expectedProfits: number[];
  terminationReason: string;
  hasSubstituteArrangement: boolean;
}

export interface TerminationPaymentResult {
  payment: number;
  methodology: string;
  lostProfitsCompensation: number;
  transitionCosts: number;
  mitigationCredit: number;
}

export interface GoingConcernInput {
  historicalRevenue: number[];
  historicalProfits: number[];
  projectedGrowthRate: number;
  discountRate: number;
  terminalMultiple: number;
}

export interface GoingConcernResult {
  value: number;
  methodology: string;
  dcfValue: number;
  multiplesValue: number;
  selectedValue: number;
  premiumPercentage: number;
}

export interface IntangibleTransferInput {
  intangibleType: "patent" | "trademark" | "copyright" | "trade_secret" | "know_how" | "customer_list";
  developmentCosts: number;
  expectedRevenue: number[];
  royaltyRate?: number;
  remainingLife: number;
  discountRate: number;
}

export interface IntangibleTransferResult {
  value: number;
  valuationMethodology: string;
  incomeApproachValue: number;
  costApproachValue: number;
  marketApproachValue?: number;
  dempeAnalysis: {
    developer: string;
    enhancer: string;
    maintainer: string;
    protector: string;
    exploiter: string;
  };
}

export interface WorkforceTransferInput {
  employeeCount: number;
  averageSalary: number;
  trainingCosts: number;
  recruitmentCosts: number;
  retentionRisk: number;
}

export interface WorkforceTransferResult {
  value: number;
  methodology: string;
  replacementCost: number;
  productivityValue: number;
  knowledgeValue: number;
}

// =============================================================================
// MULTI-YEAR TESTING TYPES
// =============================================================================

export type WeightingMethod = "equal" | "revenue_weighted" | "recency_weighted";

export interface MultiYearTestingConfig {
  yearsToAnalyze: number;
  weightingMethod: WeightingMethod;
  excludeExceptionalYears: boolean;
  exceptionalYearThreshold: number;
  cyclicalAdjustment: boolean;
  industryGrowthRate?: number;
}

export interface YearlyFinancialData {
  year: string;
  revenue: number;
  operatingProfit: number;
  operatingCost: number;
  totalAssets?: number;
  capitalEmployed?: number;
}

export interface MultiYearAnalysisResult {
  yearlyResults: {
    year: string;
    pli: number;
    weight: number;
    isExceptional: boolean;
    exceptionalReason?: string;
  }[];
  weightedAveragePLI: number;
  simpleAveragePLI: number;
  trend: "increasing" | "decreasing" | "stable";
  volatility: number;
  cyclicalAdjustment?: number;
  excludedYears: string[];
  methodology: string;
}

export interface EnhancedBenchmarkingResult {
  singleYearResult: {
    year: string;
    pli: number;
    range: { min: number; q1: number; median: number; q3: number; max: number };
    inRange: boolean;
  };
  multiYearResult: MultiYearAnalysisResult;
  recommendation: "use_single_year" | "use_multi_year";
  rationale: string;
}
