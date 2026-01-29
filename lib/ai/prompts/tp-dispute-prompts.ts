/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Transfer Pricing Dispute & Audit Prompts
 *
 * Based on:
 * - Section 92CA (TPO Reference)
 * - Section 92C (Arm's Length Price)
 * - Rule 10MA-10ME (APA Regulations)
 * - ITAT and High Court Precedents
 * ================================================================================
 */

import { PromptTemplate, PromptType, PromptCategory, QualityCheckType } from "../types";

// =============================================================================
// TP DISPUTE PROMPTS
// =============================================================================

const TP_DISPUTE_RISK_ASSESSMENT_PROMPT: PromptTemplate = {
  id: "tp_dispute_risk_assessment_v1",
  version: "1.0.0",
  category: PromptCategory.TP_DISPUTE,
  type: PromptType.TP_DISPUTE_RISK_ASSESSMENT,
  name: "TP Dispute Risk Assessment",
  description: "Assess risk of transfer pricing disputes and potential adjustments",
  systemPrompt: `You are an expert in Transfer Pricing dispute risk assessment under Indian tax law, with deep knowledge of TPO examination patterns, ITAT rulings, and settlement trends.

Your task is to assess the risk of TP disputes and potential adjustments based on:

1. Transaction Profile Risk Factors:
   - High-value related party transactions
   - Loss-making entities with RPT
   - Intangible-related transactions
   - Management fees and cost allocations
   - Intercompany financing arrangements

2. Documentation Risk Factors:
   - Incomplete TP documentation
   - Inconsistent comparable selection
   - Inadequate FAR analysis
   - Missing contemporaneous documentation

3. Pricing Risk Factors:
   - Margins below benchmark range
   - Unusual pricing patterns
   - Significant year-on-year changes
   - Industry-specific concerns

4. Historical Risk Factors:
   - Previous TP adjustments
   - Pending litigation
   - Adverse precedents in similar cases

Provide a comprehensive risk assessment with actionable recommendations.`,
  userPromptTemplate: `Assess TP dispute risk for:

Entity: {{entityName}}
PAN: {{entityPAN}}
Assessment Year: {{assessmentYear}}
Industry: {{industry}}

Financial Overview:
- Total Revenue: {{totalRevenue}}
- Operating Profit: {{operatingProfit}}
- OP/OC Margin: {{opOcMargin}}%
- OP/OR Margin: {{opOrMargin}}%

Related Party Transactions:
{{rptSummary}}

Total RPT Value: {{totalRPT}}
RPT as % of Revenue: {{rptPercentage}}%

Current TP Position:
- Selected Method: {{selectedMethod}}
- Tested Party Margin: {{testedPartyMargin}}%
- Benchmark Range: {{benchmarkRange}}
- Position vs Range: {{positionVsRange}}

Documentation Status:
{{documentationStatus}}

Historical Issues:
{{historicalIssues}}

{{#if industryTrends}}
Industry-Specific Concerns:
{{industryTrends}}
{{/if}}

{{#if recentPrecedents}}
Recent Relevant Precedents:
{{recentPrecedents}}
{{/if}}

Provide:
1. Overall risk score (0-100) with category breakdown
2. Key risk factors with explanations
3. Probability of TPO adjustment
4. Estimated potential adjustment range
5. Priority recommendations for risk mitigation
6. Documentation enhancement suggestions`,
  variables: [
    "entityName",
    "entityPAN",
    "assessmentYear",
    "industry",
    "totalRevenue",
    "operatingProfit",
    "opOcMargin",
    "opOrMargin",
    "rptSummary",
    "totalRPT",
    "rptPercentage",
    "selectedMethod",
    "testedPartyMargin",
    "benchmarkRange",
    "positionVsRange",
    "documentationStatus",
    "historicalIssues",
    "industryTrends",
    "recentPrecedents",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      overallRiskScore: { type: "number", minimum: 0, maximum: 100 },
      riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
      riskFactors: { type: "array" },
      auditLikelihood: { type: "object" },
      potentialAdjustment: { type: "object" },
      recommendations: { type: "array" },
      complianceGaps: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Risk Score Accuracy",
      description: "Verify risk scores are properly calculated and within range",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Risk Factor Coverage",
      description: "Ensure all major risk factors are analyzed",
      weight: 0.6,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const AUDIT_DEFENSE_STRATEGY_PROMPT: PromptTemplate = {
  id: "audit_defense_strategy_v1",
  version: "1.0.0",
  category: PromptCategory.TP_DISPUTE,
  type: PromptType.AUDIT_DEFENSE_STRATEGY,
  name: "Audit Defense Strategy",
  description: "Generate comprehensive audit defense strategy for TP proceedings",
  systemPrompt: `You are an expert TP litigation strategist with extensive experience in TPO proceedings, DRP hearings, and ITAT appeals under Indian tax law.

Your task is to develop a comprehensive audit defense strategy that:

1. Identifies Defense Pillars:
   - Economic substance arguments
   - Comparable selection justification
   - Method selection rationale
   - Industry-specific factors
   - COVID/economic adjustments if applicable

2. Builds Argumentation Framework:
   - Primary legal arguments
   - Supporting economic rationale
   - Documentary evidence mapping
   - Precedent-based defenses

3. Anticipates TPO Challenges:
   - Common TPO objections
   - Comparable rejection grounds
   - Margin analysis disputes
   - Documentation gaps

4. Recommends Settlement Strategy:
   - Negotiation positions
   - Alternative pricing proposals
   - Risk-adjusted settlement range

Key Legal References:
- Section 92C: Arm's Length Price computation
- Section 92CA: TPO reference and proceedings
- Rule 10B: Determination of arm's length price
- DRP Rules: Dispute Resolution Panel procedures`,
  userPromptTemplate: `Develop audit defense strategy for:

Entity: {{entityName}}
Assessment Year: {{assessmentYear}}
TPO Reference Date: {{tpoReferenceDate}}

Challenged Transaction:
- Transaction Type: {{transactionType}}
- Related Party: {{relatedParty}}
- Transaction Value: {{transactionValue}}
- Method Applied: {{methodApplied}}

TPO's Position:
{{tpoPosition}}

Proposed Adjustment: {{proposedAdjustment}}

Current Defense Position:
- TP Documentation: {{tpDocumentation}}
- Benchmark Study: {{benchmarkStudy}}
- Tested Party Margin: {{testedPartyMargin}}%
- Comparable Set: {{comparableSet}}

FAR Profile:
- Functions: {{functions}}
- Assets: {{assets}}
- Risks: {{risks}}

Economic Arguments:
{{economicArguments}}

Available Evidence:
{{availableEvidence}}

{{#if precedents}}
Favorable Precedents:
{{precedents}}
{{/if}}

{{#if adversePrecedents}}
Adverse Precedents to Address:
{{adversePrecedents}}
{{/if}}

Generate:
1. Defense pillars with strength assessment
2. Comprehensive documentation strategy
3. Argument framework with counter-arguments
4. Regulatory and precedent references
5. Settlement range and negotiation strategy
6. Timeline and milestone recommendations`,
  variables: [
    "entityName",
    "assessmentYear",
    "tpoReferenceDate",
    "transactionType",
    "relatedParty",
    "transactionValue",
    "methodApplied",
    "tpoPosition",
    "proposedAdjustment",
    "tpDocumentation",
    "benchmarkStudy",
    "testedPartyMargin",
    "comparableSet",
    "functions",
    "assets",
    "risks",
    "economicArguments",
    "availableEvidence",
    "precedents",
    "adversePrecedents",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      transactionType: { type: "string" },
      defensePillars: { type: "array" },
      documentationStrategy: { type: "object" },
      argumentFramework: { type: "object" },
      regulatoryReferences: { type: "array" },
      settlementConsiderations: { type: "object" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Legal Accuracy",
      description: "Verify legal references and precedent citations",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Strategy Completeness",
      description: "Ensure all defense aspects are covered",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const APA_ASSISTANCE_PROMPT: PromptTemplate = {
  id: "apa_assistance_v1",
  version: "1.0.0",
  category: PromptCategory.TP_DISPUTE,
  type: PromptType.APA_ASSISTANCE,
  name: "APA Assistance",
  description: "Assist with Advance Pricing Agreement application and strategy",
  systemPrompt: `You are an expert in Advance Pricing Agreements (APA) under Indian regulations (Rule 10MA-10ME) and international APA practices.

Your task is to assist with APA applications covering:

1. Eligibility Assessment:
   - Transaction value thresholds
   - Covered transaction types
   - Applicant eligibility
   - Historical compliance status

2. APA Type Selection:
   - Unilateral APA (with CBDT)
   - Bilateral APA (with treaty partner)
   - Multilateral APA (multiple jurisdictions)

3. Application Strategy:
   - Pre-filing consultation approach
   - Transaction coverage scope
   - Proposed methodology and range
   - Critical assumptions
   - Rollback provisions

4. Cost-Benefit Analysis:
   - Application fees
   - Professional costs
   - Tax certainty benefits
   - Dispute avoidance value

Key APA Provisions:
- Rule 10MA: Interpretation and definitions
- Rule 10MB: Pre-filing consultation
- Rule 10MC: APA application process
- Rule 10MD: APA terms and conditions
- Rule 10ME: Rollback provisions`,
  userPromptTemplate: `Provide APA assistance for:

Applicant: {{applicantName}}
PAN: {{applicantPAN}}
Industry: {{industry}}

Proposed APA Type: {{apaType}}

Transactions to be Covered:
{{coveredTransactions}}

Transaction History (3 years):
{{transactionHistory}}

Current TP Methodology:
- Method: {{currentMethod}}
- PLI: {{currentPLI}}
- Margin Range: {{marginRange}}

Related Party Details:
{{relatedPartyDetails}}

Treaty Partner (for BAPA): {{treatyPartner}}

Historical TP Positions:
{{historicalPositions}}

{{#if pendingDisputes}}
Pending TP Disputes:
{{pendingDisputes}}
{{/if}}

{{#if previousAPA}}
Previous APA History:
{{previousAPA}}
{{/if}}

Financial Projections (APA Term):
{{financialProjections}}

Provide:
1. Eligibility assessment with criteria analysis
2. Recommended APA type with justification
3. Transactions to be covered and methodology
4. Proposed terms (rollback, prospective years)
5. Application strategy and timeline
6. Cost-benefit analysis and recommendation`,
  variables: [
    "applicantName",
    "applicantPAN",
    "industry",
    "apaType",
    "coveredTransactions",
    "transactionHistory",
    "currentMethod",
    "currentPLI",
    "marginRange",
    "relatedPartyDetails",
    "treatyPartner",
    "historicalPositions",
    "pendingDisputes",
    "previousAPA",
    "financialProjections",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      apaType: { type: "string", enum: ["unilateral", "bilateral", "multilateral"] },
      eligibility: { type: "object" },
      coveredTransactions: { type: "array" },
      proposedTerms: { type: "object" },
      applicationStrategy: { type: "object" },
      costBenefitAnalysis: { type: "object" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "APA Rule Compliance",
      description: "Ensure recommendations comply with Rule 10MA-10ME",
      weight: 0.6,
      required: true,
    },
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Financial Analysis",
      description: "Verify cost-benefit calculations are accurate",
      weight: 0.4,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const TPO_RESPONSE_TEMPLATE_PROMPT: PromptTemplate = {
  id: "tpo_response_template_v1",
  version: "1.0.0",
  category: PromptCategory.TP_DISPUTE,
  type: PromptType.TPO_RESPONSE_TEMPLATE,
  name: "TPO Response Template",
  description: "Generate response template for TPO queries and show-cause notices",
  systemPrompt: `You are an expert in drafting formal responses to Transfer Pricing Officer (TPO) communications under Indian tax law.

Your task is to draft professional, comprehensive responses that:

1. Address Each Query Systematically:
   - Restate the TPO's observation
   - Provide clear taxpayer response
   - Reference supporting documentation
   - Cite relevant legal provisions
   - Include applicable case law

2. Maintain Professional Standards:
   - Formal, respectful tone
   - Clear and concise language
   - Proper legal terminology
   - Systematic organization
   - Complete cross-referencing

3. Include Strategic Elements:
   - Factual defense
   - Legal defense
   - Economic rationale
   - Alternative analysis if applicable
   - Without prejudice positions

Response Structure:
- Reference number and dates
- Executive summary
- Issue-wise detailed response
- Document annexure listing
- Concluding submissions
- Relief sought`,
  userPromptTemplate: `Draft TPO response for:

Assessee: {{assesseeName}}
PAN: {{assesseePAN}}
Assessment Year: {{assessmentYear}}
TPO Reference Number: {{tpoReferenceNumber}}
Response Type: {{responseType}}

TPO Queries/Observations:
{{tpoQueries}}

{{#if showCauseNotice}}
Show Cause Notice Details:
{{showCauseNotice}}
{{/if}}

Transaction Under Review:
- Nature: {{transactionNature}}
- Related Party: {{relatedParty}}
- Value: {{transactionValue}}
- Method Applied: {{methodApplied}}

Taxpayer's Position:
{{taxpayerPosition}}

Supporting Documentation Available:
{{availableDocuments}}

Key Arguments:
{{keyArguments}}

Relevant Case Laws:
{{relevantCaseLaws}}

{{#if additionalSubmissions}}
Additional Submissions Required:
{{additionalSubmissions}}
{{/if}}

Generate:
1. Formal response with proper structure
2. Executive summary paragraph
3. Issue-wise detailed responses
4. Document reference matrix
5. Concluding arguments
6. Relief sought statement`,
  variables: [
    "assesseeName",
    "assesseePAN",
    "assessmentYear",
    "tpoReferenceNumber",
    "responseType",
    "tpoQueries",
    "showCauseNotice",
    "transactionNature",
    "relatedParty",
    "transactionValue",
    "methodApplied",
    "taxpayerPosition",
    "availableDocuments",
    "keyArguments",
    "relevantCaseLaws",
    "additionalSubmissions",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      referenceNumber: { type: "string" },
      responseType: { type: "string" },
      executiveSummary: { type: "string" },
      issueWiseResponse: { type: "array" },
      documentationProvided: { type: "array" },
      concludingArguments: { type: "string" },
      reliefSought: { type: "string" },
      regulatoryCompliance: { type: "string" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Professional Tone",
      description: "Ensure response maintains professional and formal tone",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Query Coverage",
      description: "Verify all TPO queries are addressed",
      weight: 0.6,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const LITIGATION_ANALYSIS_PROMPT: PromptTemplate = {
  id: "litigation_analysis_v1",
  version: "1.0.0",
  category: PromptCategory.TP_DISPUTE,
  type: PromptType.LITIGATION_ANALYSIS,
  name: "Litigation Analysis",
  description: "Analyze litigation prospects and strategy for TP disputes",
  systemPrompt: `You are an expert TP litigation analyst with comprehensive knowledge of Indian tax tribunal and court procedures.

Your task is to analyze litigation prospects for TP disputes considering:

1. Case Strength Assessment:
   - Factual merits
   - Legal positions
   - Precedent support
   - Evidence availability

2. Forum Analysis:
   - DRP vs CIT(A) route
   - ITAT prospects
   - High Court/Supreme Court viability
   - MAP considerations

3. Cost-Benefit Analysis:
   - Litigation costs
   - Time investment
   - Tax amount at stake
   - Interest and penalties
   - Business considerations

4. Alternative Dispute Resolution:
   - Settlement possibilities
   - MAP filing opportunity
   - APA for future years
   - Mediation options

Indian TP Litigation Forums:
1. Dispute Resolution Panel (DRP)
2. Commissioner of Income Tax (Appeals)
3. Income Tax Appellate Tribunal (ITAT)
4. High Court
5. Supreme Court
6. Mutual Agreement Procedure (MAP)`,
  userPromptTemplate: `Analyze litigation prospects for:

Assessee: {{assesseeName}}
Assessment Year: {{assessmentYear}}
Current Forum: {{currentForum}}

Dispute Details:
- Transaction Type: {{transactionType}}
- Adjustment Amount: {{adjustmentAmount}}
- Tax Effect: {{taxEffect}}
- Interest: {{interestAmount}}

TPO/AO Position:
{{tpoPosition}}

Taxpayer Position:
{{taxpayerPosition}}

Evidence Strength:
{{evidenceStrength}}

Relevant Precedents:
{{relevantPrecedents}}

Similar Cases in Progress:
{{similarCases}}

Previous Orders (if any):
{{previousOrders}}

Budget Constraints: {{budgetConstraints}}
Timeline Expectations: {{timelineExpectations}}

Provide:
1. Case strength assessment (strong/moderate/weak)
2. Success probability by forum
3. Key issues and legal analysis
4. Cost-benefit analysis
5. Alternative resolution options
6. Strategic recommendation`,
  variables: [
    "assesseeName",
    "assessmentYear",
    "currentForum",
    "transactionType",
    "adjustmentAmount",
    "taxEffect",
    "interestAmount",
    "tpoPosition",
    "taxpayerPosition",
    "evidenceStrength",
    "relevantPrecedents",
    "similarCases",
    "previousOrders",
    "budgetConstraints",
    "timelineExpectations",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      caseStrength: { type: "string", enum: ["strong", "moderate", "weak"] },
      successProbability: { type: "number" },
      keyIssues: { type: "array" },
      costBenefitAnalysis: { type: "object" },
      alternativeResolutions: { type: "array" },
      strategicRecommendation: { type: "string" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Precedent Analysis",
      description: "Verify case law citations and relevance",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Cost Analysis",
      description: "Verify financial calculations in cost-benefit analysis",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

// =============================================================================
// EXPORT
// =============================================================================

export const TP_DISPUTE_PROMPTS = {
  riskAssessment: TP_DISPUTE_RISK_ASSESSMENT_PROMPT,
  auditDefenseStrategy: AUDIT_DEFENSE_STRATEGY_PROMPT,
  apaAssistance: APA_ASSISTANCE_PROMPT,
  tpoResponseTemplate: TPO_RESPONSE_TEMPLATE_PROMPT,
  litigationAnalysis: LITIGATION_ANALYSIS_PROMPT,
};
