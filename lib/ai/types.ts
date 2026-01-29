/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Type Definitions
 * ================================================================================
 */

// =============================================================================
// AI PROVIDER TYPES
// =============================================================================

export enum AIProvider {
  ANTHROPIC = "anthropic",
  OPENAI = "openai",
  GOOGLE = "google",
}

export enum AIModel {
  // Anthropic
  CLAUDE_3_5_SONNET = "claude-3-5-sonnet-20241022",
  CLAUDE_3_OPUS = "claude-3-opus-20240229",
  CLAUDE_3_HAIKU = "claude-3-haiku-20240307",
  // OpenAI
  GPT_4_TURBO = "gpt-4-turbo-preview",
  GPT_4 = "gpt-4",
  GPT_35_TURBO = "gpt-3.5-turbo",
  // Google
  GEMINI_PRO = "gemini-pro",
  GEMINI_PRO_VISION = "gemini-pro-vision",
}

export interface AIConfig {
  provider: AIProvider;
  model: AIModel;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

// =============================================================================
// PROMPT TYPES
// =============================================================================

export enum PromptCategory {
  SAFE_HARBOUR = "safe_harbour",
  FORM_3CEB = "form_3ceb",
  BENCHMARKING = "benchmarking",
  MASTER_FILE = "master_file",
  DASHBOARD = "dashboard",
  ACCOUNTING = "accounting",
  INDUSTRY_ANALYSIS = "industry_analysis",
  QUALITY_CONTROL = "quality_control",
  // Tier 3 Categories
  CBCR = "cbcr",
  TP_DISPUTE = "tp_dispute",
  ANALYTICS = "analytics",
}

export enum PromptType {
  // Safe Harbour
  SAFE_HARBOUR_RECOMMENDATION = "safe_harbour_recommendation",
  SAFE_HARBOUR_GAP_ANALYSIS = "safe_harbour_gap_analysis",
  FORM_3CEFA_NARRATIVE = "form_3cefa_narrative",

  // Form 3CEB
  TRANSACTION_DESCRIPTION = "transaction_description",
  METHOD_JUSTIFICATION = "method_justification",
  METHOD_REJECTION_RATIONALE = "method_rejection_rationale",
  VALIDATION_SUGGESTION = "validation_suggestion",

  // Benchmarking
  WORKING_CAPITAL_ADJUSTMENT = "working_capital_adjustment",
  COMPARABLE_REJECTION = "comparable_rejection",
  RANGE_DETERMINATION = "range_determination",
  ARM_LENGTH_CONCLUSION = "arm_length_conclusion",

  // Master File
  FAR_ANALYSIS = "far_analysis",
  INDUSTRY_ANALYSIS = "industry_analysis",
  SUPPLY_CHAIN_NARRATIVE = "supply_chain_narrative",
  ORGANIZATIONAL_STRUCTURE = "organizational_structure",
  INTANGIBLES_STRATEGY = "intangibles_strategy",
  FINANCIAL_POLICY = "financial_policy",
  BUSINESS_DESCRIPTION = "business_description",

  // Dashboard
  COMPLIANCE_RISK_SCORE = "compliance_risk_score",
  CLIENT_PRIORITY_ANALYSIS = "client_priority_analysis",
  SMART_NOTIFICATION = "smart_notification",
  DEADLINE_PREDICTION = "deadline_prediction",

  // Accounting
  TRANSACTION_CLASSIFICATION = "transaction_classification",
  RELATED_PARTY_DETECTION = "related_party_detection",
  NATURE_CODE_RECOMMENDATION = "nature_code_recommendation",
  FINANCIAL_ANOMALY = "financial_anomaly",

  // Quality Control
  CONSISTENCY_CHECK = "consistency_check",
  COMPLIANCE_VALIDATION = "compliance_validation",
  QUALITY_SCORE = "quality_score",

  // Tier 3: CbCR (Country-by-Country Reporting)
  CBCR_JURISDICTION_ALLOCATION = "cbcr_jurisdiction_allocation",
  CBCR_CONSOLIDATION_NARRATIVE = "cbcr_consolidation_narrative",
  CBCR_VALIDATION = "cbcr_validation",
  CBCR_NEXUS_ANALYSIS = "cbcr_nexus_analysis",

  // Tier 3: TP Dispute & Audit
  TP_DISPUTE_RISK_ASSESSMENT = "tp_dispute_risk_assessment",
  AUDIT_DEFENSE_STRATEGY = "audit_defense_strategy",
  APA_ASSISTANCE = "apa_assistance",
  TPO_RESPONSE_TEMPLATE = "tpo_response_template",
  LITIGATION_ANALYSIS = "litigation_analysis",

  // Tier 3: Advanced Analytics
  REGULATORY_PRECEDENT_MINING = "regulatory_precedent_mining",
  CROSS_BORDER_ANALYSIS = "cross_border_analysis",
  MULTI_YEAR_TREND_ANALYSIS = "multi_year_trend_analysis",
  RISK_PREDICTION = "risk_prediction",
}

export interface PromptTemplate {
  id: string;
  version: string;
  category: PromptCategory;
  type: PromptType;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  outputFormat: "text" | "json" | "markdown";
  expectedOutputSchema?: Record<string, unknown>;
  qualityChecks: QualityCheck[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptInput {
  promptType: PromptType;
  variables: Record<string, string | number | boolean | object>;
  context?: AIContext;
}

// =============================================================================
// AI GENERATION TYPES
// =============================================================================

export interface AIContext {
  assessmentYear?: string;
  entityName?: string;
  entityType?: string;
  transactionType?: string;
  financialYear?: string;
  previousAnalysis?: string;
  regulatoryFramework?: "indian" | "oecd";
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  config?: Partial<AIConfig>;
  context?: AIContext;
  metadata?: {
    promptType: PromptType;
    promptVersion: string;
    requestId: string;
  };
}

export interface AIResponse {
  success: boolean;
  content: string;
  parsedContent?: Record<string, unknown>;
  metadata: {
    provider: AIProvider;
    model: AIModel;
    promptType: PromptType;
    promptVersion: string;
    requestId: string;
    tokensUsed: number;
    latencyMs: number;
    timestamp: string;
  };
  qualityScore?: QualityResult;
  error?: string;
}

// =============================================================================
// QUALITY CONTROL TYPES
// =============================================================================

export enum QualityCheckType {
  REGULATORY_REFERENCE = "regulatory_reference",
  NUMERICAL_ACCURACY = "numerical_accuracy",
  CONSISTENCY = "consistency",
  HALLUCINATION_DETECTION = "hallucination_detection",
  COMPLETENESS = "completeness",
  PROFESSIONAL_LANGUAGE = "professional_language",
}

export interface QualityCheck {
  type: QualityCheckType;
  name: string;
  description: string;
  weight: number;
  required: boolean;
}

export interface QualityCheckResult {
  check: QualityCheck;
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface QualityResult {
  overallScore: number;
  passed: boolean;
  checkResults: QualityCheckResult[];
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  verificationRequired: boolean;
}

// =============================================================================
// AUDIT TRAIL TYPES
// =============================================================================

export interface AIAuditLog {
  id: string;
  timestamp: string;
  requestId: string;
  userId?: string;
  clientId?: string;
  engagementId?: string;
  promptType: PromptType;
  promptVersion: string;
  input: {
    variables: Record<string, unknown>;
    context?: AIContext;
  };
  output: {
    content: string;
    tokensUsed: number;
    latencyMs: number;
  };
  qualityResult?: QualityResult;
  humanModifications?: {
    modifiedBy: string;
    modifiedAt: string;
    originalContent: string;
    modifiedContent: string;
    reason: string;
  };
}

// =============================================================================
// SPECIFIC OUTPUT TYPES FOR TP DOCUMENTATION
// =============================================================================

export interface SafeHarbourRecommendation {
  eligible: boolean;
  regulatoryBasis: string;
  currentStatus: {
    metric: string;
    value: number;
    threshold: number;
    gap: number;
  };
  recommendation: string;
  actionItems: string[];
  form3cefaImplication: string;
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
  citations: string[];
}

export interface MethodJustification {
  selectedMethod: string;
  methodCode: string;
  selectionRationale: string[];
  rejectedMethods: {
    method: string;
    reason: string;
  }[];
  pliSelected: string;
  pliJustification: string;
  regulatoryReferences: string[];
  oecdGuidanceReference?: string;
}

export interface TransactionNarrative {
  natureCode: string;
  shortDescription: string;
  detailedDescription: string;
  commercialRationale: string;
  pricingMechanism: string;
  armLengthJustification: string;
}

export interface WorkingCapitalAdjustment {
  testedPartyWCRatio: number;
  interestRateUsed: number;
  interestRateSource: string;
  adjustments: {
    company: string;
    wcRatio: number;
    wcDifference: number;
    adjustmentPercent: number;
    unadjustedPLI: number;
    adjustedPLI: number;
  }[];
  narrative: string;
  methodology: string;
  dataSourcesUsed: string[];
}

export interface ComparableRejection {
  companyName: string;
  rejectionReason: string;
  sourceReference: string;
  pageReference?: string;
  category: "functional" | "financial" | "rpt" | "other";
}

export interface ArmLengthConclusion {
  testedPartyMargin: number;
  armLengthRange: {
    percentile35: number;
    median: number;
    percentile65: number;
    arithmeticMean: number;
  };
  status: "within_range" | "below_range" | "above_range";
  adjustmentRequired: boolean;
  adjustmentAmount?: number;
  conclusionNarrative: string;
  regulatoryCompliance: string;
}

// =============================================================================
// TIER 3: CBCR OUTPUT TYPES
// =============================================================================

export interface CbCRJurisdictionAllocation {
  jurisdictionCode: string;
  jurisdictionName: string;
  entities: {
    entityName: string;
    entityType: string;
    mainBusinessActivity: string;
  }[];
  financials: {
    revenue: {
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
    tangibleAssetsOtherThanCash: number;
  };
  allocationNarrative: string;
  materialAdjustments?: string[];
}

export interface CbCRConsolidationNarrative {
  reportingPeriod: string;
  ultimateParentEntity: string;
  consolidationBasis: string;
  currencyUsed: string;
  exchangeRateMethod: string;
  jurisdictionSummary: {
    jurisdiction: string;
    entityCount: number;
    totalRevenue: number;
    profitBeforeTax: number;
  }[];
  materialTransactions: string[];
  specialConsiderations: string[];
  regulatoryCompliance: string;
}

export interface CbCRValidation {
  isValid: boolean;
  completenessScore: number;
  consistencyScore: number;
  issues: {
    severity: "critical" | "warning" | "info";
    jurisdiction?: string;
    field: string;
    issue: string;
    recommendation: string;
  }[];
  crossJurisdictionChecks: {
    check: string;
    passed: boolean;
    details: string;
  }[];
  recommendations: string[];
}

export interface CbCRNexusAnalysis {
  jurisdiction: string;
  substantiveActivities: {
    activity: string;
    present: boolean;
    evidence: string;
  }[];
  nexusRiskLevel: "low" | "medium" | "high";
  bepsActionPoints: string[];
  recommendations: string[];
  documentationRequired: string[];
}

// =============================================================================
// TIER 3: TP DISPUTE OUTPUT TYPES
// =============================================================================

export interface TPDisputeRiskAssessment {
  overallRiskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: {
    factor: string;
    score: number;
    weight: number;
    explanation: string;
  }[];
  auditLikelihood: {
    probability: number;
    triggerFactors: string[];
    mitigatingFactors: string[];
  };
  potentialAdjustment: {
    estimatedAmount: number;
    confidenceLevel: string;
    basis: string;
  };
  recommendations: {
    priority: "immediate" | "short_term" | "long_term";
    action: string;
    impact: string;
  }[];
  complianceGaps: string[];
}

export interface AuditDefenseStrategy {
  transactionType: string;
  defensePillars: {
    pillar: string;
    strength: "strong" | "moderate" | "weak";
    supportingEvidence: string[];
    potentialChallenges: string[];
  }[];
  documentationStrategy: {
    requiredDocuments: string[];
    gapsIdentified: string[];
    remedialActions: string[];
  };
  argumentFramework: {
    primaryArgument: string;
    supportingArguments: string[];
    anticipatedCounterarguments: string[];
    rebuttals: string[];
  };
  regulatoryReferences: {
    reference: string;
    relevance: string;
    supportLevel: "strong" | "moderate" | "weak";
  }[];
  settlementConsiderations: {
    rangeFloor: number;
    rangeCeiling: number;
    optimalPosition: number;
    negotiationPoints: string[];
  };
}

export interface APAAssistance {
  apaType: "unilateral" | "bilateral" | "multilateral";
  eligibility: {
    isEligible: boolean;
    eligibilityCriteria: {
      criterion: string;
      met: boolean;
      notes: string;
    }[];
  };
  coveredTransactions: {
    transactionType: string;
    annualValue: number;
    proposedMethodology: string;
    proposedRange: { min: number; max: number };
  }[];
  proposedTerms: {
    rollbackYears: number;
    prospectiveYears: number;
    criticalAssumptions: string[];
    testingProcedure: string;
  };
  applicationStrategy: {
    timing: string;
    keyConsiderations: string[];
    potentialChallenges: string[];
    recommendedApproach: string;
  };
  costBenefitAnalysis: {
    estimatedFees: number;
    potentialTaxCertainty: number;
    riskReduction: string;
    recommendation: string;
  };
}

export interface TPOResponseTemplate {
  referenceNumber: string;
  responseType: "initial" | "supplementary" | "appeal";
  executiveSummary: string;
  issueWiseResponse: {
    issueNumber: number;
    tpoObservation: string;
    taxpayerResponse: string;
    supportingEvidence: string[];
    legalReferences: string[];
    caselaw: string[];
  }[];
  documentationProvided: {
    documentName: string;
    relevance: string;
    pageReference: string;
  }[];
  concludingArguments: string;
  reliefSought: string;
  regulatoryCompliance: string;
}

export interface LitigationAnalysis {
  caseStrength: "strong" | "moderate" | "weak";
  successProbability: number;
  keyIssues: {
    issue: string;
    legalPosition: string;
    precedents: {
      caseName: string;
      citation: string;
      relevance: string;
      outcome: string;
    }[];
    strength: "strong" | "moderate" | "weak";
  }[];
  costBenefitAnalysis: {
    estimatedLitigationCost: number;
    potentialTaxAtStake: number;
    timelineEstimate: string;
    recommendation: string;
  };
  alternativeResolutions: {
    option: string;
    pros: string[];
    cons: string[];
    likelihood: number;
  }[];
  strategicRecommendation: string;
}

// =============================================================================
// TIER 3: ANALYTICS OUTPUT TYPES
// =============================================================================

export interface RegulatoryPrecedentMining {
  query: string;
  relevantPrecedents: {
    caseName: string;
    citation: string;
    court: string;
    year: number;
    issue: string;
    holding: string;
    relevanceScore: number;
    applicability: string;
  }[];
  regulatoryGuidance: {
    source: string;
    reference: string;
    excerpt: string;
    applicability: string;
  }[];
  trends: {
    trend: string;
    direction: "favorable" | "unfavorable" | "neutral";
    significance: string;
  }[];
  recommendations: string[];
}

export interface CrossBorderAnalysis {
  primaryJurisdiction: string;
  counterpartyJurisdictions: string[];
  transactionFlows: {
    fromJurisdiction: string;
    toJurisdiction: string;
    transactionType: string;
    value: number;
    tpMethod: string;
    withholdingTax: number;
    treatyBenefit: boolean;
  }[];
  riskAssessment: {
    jurisdiction: string;
    riskLevel: "low" | "medium" | "high";
    riskFactors: string[];
  }[];
  dtaaAnalysis: {
    treaty: string;
    relevantArticles: string[];
    benefits: string[];
    limitations: string[];
  }[];
  recommendations: string[];
  complianceRequirements: {
    jurisdiction: string;
    requirements: string[];
    deadlines: string[];
  }[];
}

export interface MultiYearTrendAnalysis {
  entityName: string;
  analysisYears: string[];
  financialTrends: {
    metric: string;
    values: { year: string; value: number }[];
    trend: "increasing" | "decreasing" | "stable" | "volatile";
    cagr?: number;
  }[];
  tpMetricTrends: {
    metric: string;
    values: { year: string; value: number }[];
    industryBenchmark: { year: string; value: number }[];
    variance: { year: string; variance: number }[];
  }[];
  anomalies: {
    year: string;
    metric: string;
    observation: string;
    potentialCause: string;
    riskImplication: string;
  }[];
  rptTrends: {
    transactionType: string;
    values: { year: string; value: number }[];
    percentageOfRevenue: { year: string; percentage: number }[];
  }[];
  conclusions: string[];
  recommendations: string[];
}

export interface RiskPrediction {
  entityName: string;
  predictionPeriod: string;
  overallRiskScore: number;
  riskTrajectory: "improving" | "stable" | "deteriorating";
  predictedRisks: {
    riskType: string;
    probability: number;
    impact: "low" | "medium" | "high";
    timeframe: string;
    triggers: string[];
  }[];
  earlyWarningIndicators: {
    indicator: string;
    currentValue: number;
    threshold: number;
    status: "normal" | "warning" | "critical";
  }[];
  mitigationStrategies: {
    risk: string;
    strategy: string;
    effectiveness: number;
    implementation: string;
  }[];
  scenarioAnalysis: {
    scenario: string;
    probability: number;
    impact: string;
    recommendedResponse: string;
  }[];
}
