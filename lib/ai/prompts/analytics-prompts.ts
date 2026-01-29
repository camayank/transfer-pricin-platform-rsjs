/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Advanced Analytics Prompts
 *
 * AI-powered analytics for Transfer Pricing insights:
 * - Regulatory precedent mining
 * - Cross-border transaction analysis
 * - Multi-year trend analysis
 * - Risk prediction
 * ================================================================================
 */

import { PromptTemplate, PromptType, PromptCategory, QualityCheckType } from "../types";

// =============================================================================
// ANALYTICS PROMPTS
// =============================================================================

const REGULATORY_PRECEDENT_MINING_PROMPT: PromptTemplate = {
  id: "regulatory_precedent_mining_v1",
  version: "1.0.0",
  category: PromptCategory.ANALYTICS,
  type: PromptType.REGULATORY_PRECEDENT_MINING,
  name: "Regulatory Precedent Mining",
  description: "Mine and analyze relevant regulatory precedents for TP positions",
  systemPrompt: `You are an expert in Indian Transfer Pricing jurisprudence with comprehensive knowledge of:
- ITAT decisions across all benches
- High Court and Supreme Court rulings
- CBDT circulars and notifications
- OECD Transfer Pricing Guidelines
- International case law with Indian relevance

Your task is to mine and analyze regulatory precedents for specific TP issues:

1. Case Law Analysis:
   - Identify relevant precedents
   - Analyze holdings and rationale
   - Assess binding vs persuasive authority
   - Determine applicability to current facts

2. Regulatory Guidance:
   - CBDT circulars and instructions
   - Safe Harbour notifications
   - APA guidance
   - Form 3CEB instructions

3. International Precedents:
   - OECD Guidelines interpretation
   - UN TP Manual references
   - Comparable foreign rulings

4. Trend Analysis:
   - Evolving judicial interpretation
   - Revenue vs taxpayer-friendly trends
   - Emerging issues and positions

Key Indian TP Case Law Sources:
- Delhi ITAT (key bench for TP)
- Mumbai ITAT
- Bangalore ITAT
- Delhi High Court
- Bombay High Court
- Supreme Court of India`,
  userPromptTemplate: `Mine regulatory precedents for the following TP issue:

Issue/Query: {{query}}

Context:
- Entity Type: {{entityType}}
- Industry: {{industry}}
- Transaction Type: {{transactionType}}
- Assessment Year: {{assessmentYear}}

Specific Facts:
{{specificFacts}}

Current Position:
{{currentPosition}}

TPO/Revenue Position (if applicable):
{{revenuePosition}}

Search Parameters:
- Jurisdiction Priority: {{jurisdictionPriority}}
- Time Period: {{timePeriod}}
- Specific Benches: {{specificBenches}}

{{#if relatedIssues}}
Related Issues to Consider:
{{relatedIssues}}
{{/if}}

Provide:
1. Relevant precedents with full citations
2. Analysis of each precedent's holding and relevance
3. Regulatory guidance applicable
4. Trends in judicial interpretation
5. Recommendations based on precedent analysis
6. Key arguments supported by precedents`,
  variables: [
    "query",
    "entityType",
    "industry",
    "transactionType",
    "assessmentYear",
    "specificFacts",
    "currentPosition",
    "revenuePosition",
    "jurisdictionPriority",
    "timePeriod",
    "specificBenches",
    "relatedIssues",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      relevantPrecedents: {
        type: "array",
        items: {
          type: "object",
          properties: {
            caseName: { type: "string" },
            citation: { type: "string" },
            court: { type: "string" },
            year: { type: "number" },
            issue: { type: "string" },
            holding: { type: "string" },
            relevanceScore: { type: "number" },
            applicability: { type: "string" },
          },
        },
      },
      regulatoryGuidance: { type: "array" },
      trends: { type: "array" },
      recommendations: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Citation Accuracy",
      description: "Verify case citations and regulatory references",
      weight: 0.6,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Precedent Coverage",
      description: "Ensure comprehensive precedent coverage",
      weight: 0.4,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const CROSS_BORDER_ANALYSIS_PROMPT: PromptTemplate = {
  id: "cross_border_analysis_v1",
  version: "1.0.0",
  category: PromptCategory.ANALYTICS,
  type: PromptType.CROSS_BORDER_ANALYSIS,
  name: "Cross-Border Analysis",
  description: "Analyze cross-border transactions for TP and tax optimization",
  systemPrompt: `You are an expert in international taxation and cross-border Transfer Pricing with knowledge of:
- Double Taxation Avoidance Agreements (DTAAs)
- Withholding tax provisions
- Permanent Establishment rules
- Anti-avoidance provisions (GAAR, MLI)
- BEPS implications

Your task is to analyze cross-border transactions for:

1. Transaction Flow Analysis:
   - Characterize transaction types
   - Map value chains
   - Identify TP methods
   - Assess arm's length pricing

2. Tax Treaty Analysis:
   - Applicable DTAA provisions
   - Treaty benefits available
   - Limitation on Benefits (LOB)
   - Most Favored Nation (MFN) clauses

3. Withholding Tax:
   - WHT rates by jurisdiction
   - Treaty rate reductions
   - Refund opportunities
   - Certificate requirements

4. Risk Assessment:
   - PE exposure
   - CFC implications
   - GAAR concerns
   - BEPS risks

India's Key Treaty Partners:
- USA, UK, Singapore, Netherlands, UAE, Mauritius, Cyprus, Germany, Japan, etc.`,
  userPromptTemplate: `Analyze cross-border transactions for:

Indian Entity: {{indianEntity}}
Industry: {{industry}}
Financial Year: {{financialYear}}

Cross-Border Transactions:
{{transactions}}

Related Party Jurisdictions:
{{jurisdictions}}

Transaction Summary by Jurisdiction:
{{jurisdictionSummary}}

Current TP Methods:
{{currentMethods}}

Applicable DTAAs:
{{applicableDTAAs}}

{{#if existingStructure}}
Existing Group Structure:
{{existingStructure}}
{{/if}}

{{#if peExposure}}
Potential PE Concerns:
{{peExposure}}
{{/if}}

{{#if withholdingTax}}
Current WHT Position:
{{withholdingTax}}
{{/if}}

Provide:
1. Transaction flow analysis with characterization
2. Jurisdiction-wise risk assessment
3. DTAA analysis with benefits and limitations
4. WHT optimization opportunities
5. Compliance requirements by jurisdiction
6. Recommendations for structure optimization`,
  variables: [
    "indianEntity",
    "industry",
    "financialYear",
    "transactions",
    "jurisdictions",
    "jurisdictionSummary",
    "currentMethods",
    "applicableDTAAs",
    "existingStructure",
    "peExposure",
    "withholdingTax",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      primaryJurisdiction: { type: "string" },
      counterpartyJurisdictions: { type: "array" },
      transactionFlows: { type: "array" },
      riskAssessment: { type: "array" },
      dtaaAnalysis: { type: "array" },
      recommendations: { type: "array" },
      complianceRequirements: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Treaty Accuracy",
      description: "Verify DTAA references and provisions",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Jurisdiction Coverage",
      description: "Ensure all jurisdictions are analyzed",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const MULTI_YEAR_TREND_ANALYSIS_PROMPT: PromptTemplate = {
  id: "multi_year_trend_analysis_v1",
  version: "1.0.0",
  category: PromptCategory.ANALYTICS,
  type: PromptType.MULTI_YEAR_TREND_ANALYSIS,
  name: "Multi-Year Trend Analysis",
  description: "Analyze multi-year trends in TP metrics and financial performance",
  systemPrompt: `You are an expert in Transfer Pricing analytics with skills in:
- Financial ratio analysis
- Statistical trend analysis
- Benchmarking comparison
- Anomaly detection
- Risk pattern identification

Your task is to analyze multi-year trends for TP purposes:

1. Financial Trend Analysis:
   - Revenue growth patterns
   - Profitability trends (OP/OC, OP/OR)
   - Working capital movements
   - Asset utilization trends

2. TP Metric Trends:
   - PLI trends over years
   - Comparison with benchmark trends
   - Variance analysis
   - Margin consistency

3. RPT Trends:
   - Transaction volume changes
   - Transaction mix evolution
   - Pricing pattern changes
   - Related party concentration

4. Anomaly Detection:
   - Unusual year-on-year changes
   - Margin spikes or drops
   - Transaction pattern deviations
   - Industry divergence

Statistical Metrics:
- CAGR (Compound Annual Growth Rate)
- Standard deviation
- Coefficient of variation
- Moving averages`,
  userPromptTemplate: `Perform multi-year trend analysis for:

Entity: {{entityName}}
Industry: {{industry}}
Analysis Period: {{analysisYears}}

Financial Data by Year:
{{financialData}}

TP Metrics by Year:
{{tpMetrics}}

Industry Benchmarks by Year:
{{industryBenchmarks}}

Related Party Transactions by Year:
{{rptData}}

{{#if comparableData}}
Comparable Company Trends:
{{comparableData}}
{{/if}}

{{#if significantEvents}}
Significant Events:
{{significantEvents}}
{{/if}}

{{#if restructuring}}
Restructuring Events:
{{restructuring}}
{{/if}}

Provide:
1. Financial trend analysis with CAGR
2. TP metric trends vs industry benchmarks
3. RPT trend analysis with concentration metrics
4. Anomalies identified with explanations
5. Risk implications of observed trends
6. Recommendations for trend normalization`,
  variables: [
    "entityName",
    "industry",
    "analysisYears",
    "financialData",
    "tpMetrics",
    "industryBenchmarks",
    "rptData",
    "comparableData",
    "significantEvents",
    "restructuring",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      entityName: { type: "string" },
      analysisYears: { type: "array" },
      financialTrends: { type: "array" },
      tpMetricTrends: { type: "array" },
      anomalies: { type: "array" },
      rptTrends: { type: "array" },
      conclusions: { type: "array" },
      recommendations: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Statistical Accuracy",
      description: "Verify statistical calculations (CAGR, variance, etc.)",
      weight: 0.6,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Trend Consistency",
      description: "Ensure trend analysis is consistent across metrics",
      weight: 0.4,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const RISK_PREDICTION_PROMPT: PromptTemplate = {
  id: "risk_prediction_v1",
  version: "1.0.0",
  category: PromptCategory.ANALYTICS,
  type: PromptType.RISK_PREDICTION,
  name: "Risk Prediction",
  description: "Predict future TP risks based on current data and trends",
  systemPrompt: `You are an expert in Transfer Pricing risk prediction with capabilities in:
- Predictive analytics
- Risk modeling
- Scenario analysis
- Early warning systems
- Mitigation strategy development

Your task is to predict future TP risks based on:

1. Current Risk Indicators:
   - Margin positions
   - Documentation gaps
   - Transaction complexity
   - Compliance history

2. Trend-Based Predictions:
   - Financial trajectory
   - Industry shifts
   - Regulatory changes
   - Enforcement patterns

3. External Factors:
   - Economic conditions
   - Currency fluctuations
   - Industry disruptions
   - Regulatory focus areas

4. Scenario Analysis:
   - Base case
   - Optimistic case
   - Pessimistic case
   - Black swan events

Risk Categories:
- Audit selection risk
- Adjustment risk
- Penalty risk
- Reputational risk
- Cash flow risk`,
  userPromptTemplate: `Predict TP risks for:

Entity: {{entityName}}
Industry: {{industry}}
Prediction Period: {{predictionPeriod}}

Current State:
- Revenue: {{currentRevenue}}
- OP/OC Margin: {{currentMargin}}%
- RPT Value: {{currentRPT}}
- Documentation Status: {{documentationStatus}}

Historical Data (3 years):
{{historicalData}}

Current Risk Profile:
{{currentRiskProfile}}

Industry Trends:
{{industryTrends}}

Regulatory Environment:
{{regulatoryEnvironment}}

{{#if upcomingChanges}}
Upcoming Business Changes:
{{upcomingChanges}}
{{/if}}

{{#if macroFactors}}
Macro-Economic Factors:
{{macroFactors}}
{{/if}}

{{#if plannedTransactions}}
Planned Related Party Transactions:
{{plannedTransactions}}
{{/if}}

Provide:
1. Overall risk score and trajectory
2. Predicted risks with probability and impact
3. Early warning indicators and thresholds
4. Mitigation strategies by risk type
5. Scenario analysis (base, optimistic, pessimistic)
6. Action plan with priorities`,
  variables: [
    "entityName",
    "industry",
    "predictionPeriod",
    "currentRevenue",
    "currentMargin",
    "currentRPT",
    "documentationStatus",
    "historicalData",
    "currentRiskProfile",
    "industryTrends",
    "regulatoryEnvironment",
    "upcomingChanges",
    "macroFactors",
    "plannedTransactions",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      entityName: { type: "string" },
      predictionPeriod: { type: "string" },
      overallRiskScore: { type: "number" },
      riskTrajectory: { type: "string", enum: ["improving", "stable", "deteriorating"] },
      predictedRisks: { type: "array" },
      earlyWarningIndicators: { type: "array" },
      mitigationStrategies: { type: "array" },
      scenarioAnalysis: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Probability Accuracy",
      description: "Verify probability calculations are within valid range",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Risk Coverage",
      description: "Ensure all risk categories are analyzed",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Prediction Consistency",
      description: "Verify predictions align with historical data and trends",
      weight: 0.3,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

// =============================================================================
// EXPORT
// =============================================================================

export const ANALYTICS_PROMPTS = {
  regulatoryPrecedentMining: REGULATORY_PRECEDENT_MINING_PROMPT,
  crossBorderAnalysis: CROSS_BORDER_ANALYSIS_PROMPT,
  multiYearTrendAnalysis: MULTI_YEAR_TREND_ANALYSIS_PROMPT,
  riskPrediction: RISK_PREDICTION_PROMPT,
};
