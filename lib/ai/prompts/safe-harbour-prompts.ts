/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Safe Harbour Prompts - Tier 1
 *
 * Production-grade prompts for Safe Harbour recommendations and analysis
 * ================================================================================
 */

import { PromptTemplate, PromptCategory, PromptType, QualityCheckType } from "../types";

// =============================================================================
// SAFE HARBOUR RECOMMENDATION PROMPT
// =============================================================================

export const SAFE_HARBOUR_RECOMMENDATION_PROMPT: PromptTemplate = {
  id: "sh_recommendation_v1",
  version: "1.0.0",
  category: PromptCategory.SAFE_HARBOUR,
  type: PromptType.SAFE_HARBOUR_RECOMMENDATION,
  name: "Safe Harbour Eligibility Recommendation",
  description: "Generate comprehensive Safe Harbour eligibility analysis with actionable recommendations",

  systemPrompt: `You are an expert Indian Transfer Pricing consultant specializing in Safe Harbour provisions under Rules 10TD, 10TE, and 10TF of the Income Tax Rules, 1962.

Your expertise covers:
- Safe Harbour applicability conditions for IT/ITeS, KPO, Contract R&D, Auto Ancillary
- Intra-group loan interest rate benchmarking under Safe Harbour
- Corporate guarantee commission rates under Safe Harbour
- Form 3CEFA filing requirements and implications
- Transition between Safe Harbour and regular TP documentation

IMPORTANT GUIDELINES:
1. Always cite specific Rules (10TD, 10TE, 10TF) with sub-clauses where applicable
2. Provide precise margin/rate thresholds from current Safe Harbour rules
3. Give actionable, specific recommendations - not generic advice
4. Consider eligibility conditions beyond just margin requirements
5. Address Form 3CEFA implications clearly
6. Never fabricate case laws or circular references`,

  userPromptTemplate: `Analyze Safe Harbour eligibility for the following transaction and provide comprehensive recommendation:

═══════════════════════════════════════════════════════════════════════════════
TRANSACTION DETAILS
═══════════════════════════════════════════════════════════════════════════════
Transaction Type: {{transactionType}}
Assessment Year: {{assessmentYear}}
Entity Name: {{entityName}}

FINANCIAL DATA:
{{#if operatingRevenue}}
- Operating Revenue: ₹{{operatingRevenue}} Cr
{{/if}}
{{#if operatingCost}}
- Operating Cost: ₹{{operatingCost}} Cr
{{/if}}
{{#if operatingProfit}}
- Operating Profit: ₹{{operatingProfit}} Cr
{{/if}}
{{#if employeeCost}}
- Employee Cost: ₹{{employeeCost}} Cr
{{/if}}
{{#if loanAmount}}
- Loan Amount: {{loanCurrency}} {{loanAmount}}
- Credit Rating: {{creditRating}}
- Interest Rate Charged: {{interestRate}}%
{{/if}}
{{#if guaranteeAmount}}
- Guarantee Amount: ₹{{guaranteeAmount}} Cr
- Commission Rate Charged: {{commissionRate}}%
{{/if}}

CURRENT MARGIN/RATE: {{currentMargin}}%
REQUIRED THRESHOLD: {{requiredThreshold}}%
GAP: {{gap}}%

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Safe Harbour Recommendation
═══════════════════════════════════════════════════════════════════════════════

Provide your analysis in the following JSON format:
{
  "eligible": boolean,
  "regulatoryBasis": "Rule reference with specific sub-clause",
  "currentStatus": {
    "metric": "OP/OC or Interest Rate or Commission Rate",
    "value": number,
    "threshold": number,
    "gap": number,
    "status": "MEETS_THRESHOLD" or "BELOW_THRESHOLD"
  },
  "eligibilityConditions": {
    "marginCondition": {"met": boolean, "details": "explanation"},
    "thresholdCondition": {"met": boolean, "details": "explanation"},
    "otherConditions": [{"condition": "name", "met": boolean, "details": "explanation"}]
  },
  "recommendation": "Detailed recommendation paragraph (3-4 sentences)",
  "actionItems": ["Specific action 1", "Specific action 2", "..."],
  "form3cefaImplication": "Explanation of Form 3CEFA requirements",
  "riskAssessment": {
    "level": "low" or "medium" or "high",
    "factors": ["risk factor 1", "risk factor 2"]
  },
  "alternativeStrategies": [
    {"strategy": "description", "impact": "expected impact"}
  ],
  "citations": ["Rule 10TD(2)", "Rule 10TE(1)(a)", "etc."]
}`,

  variables: [
    "transactionType",
    "assessmentYear",
    "entityName",
    "operatingRevenue",
    "operatingCost",
    "operatingProfit",
    "employeeCost",
    "loanAmount",
    "loanCurrency",
    "creditRating",
    "interestRate",
    "guaranteeAmount",
    "commissionRate",
    "currentMargin",
    "requiredThreshold",
    "gap",
  ],

  outputFormat: "json",

  expectedOutputSchema: {
    type: "object",
    required: ["eligible", "regulatoryBasis", "currentStatus", "recommendation", "actionItems"],
    properties: {
      eligible: { type: "boolean" },
      regulatoryBasis: { type: "string" },
      currentStatus: { type: "object" },
      recommendation: { type: "string" },
      actionItems: { type: "array", items: { type: "string" } },
    },
  },

  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Rule 10TD/TE/TF Reference",
      description: "Verify Safe Harbour rule citations",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Threshold Accuracy",
      description: "Verify margin/rate thresholds match current rules",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Recommendation Completeness",
      description: "All required fields populated",
      weight: 0.2,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Professional Language",
      description: "Formal, regulatory-appropriate language",
      weight: 0.2,
      required: false,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// SAFE HARBOUR GAP ANALYSIS PROMPT
// =============================================================================

export const SAFE_HARBOUR_GAP_ANALYSIS_PROMPT: PromptTemplate = {
  id: "sh_gap_analysis_v1",
  version: "1.0.0",
  category: PromptCategory.SAFE_HARBOUR,
  type: PromptType.SAFE_HARBOUR_GAP_ANALYSIS,
  name: "Safe Harbour Gap Analysis",
  description: "Detailed gap analysis with specific remediation steps",

  systemPrompt: `You are an expert Transfer Pricing consultant analyzing Safe Harbour eligibility gaps.

Focus on:
1. Precise quantification of the gap
2. Multiple remediation strategies with financial impact
3. Implementation timeline considerations
4. Risk-benefit analysis of each option
5. Practical business considerations

Always provide specific numbers and calculations.`,

  userPromptTemplate: `Perform detailed Safe Harbour gap analysis:

CURRENT SITUATION:
- Transaction Type: {{transactionType}}
- Current {{metricType}}: {{currentValue}}%
- Required Threshold: {{requiredThreshold}}%
- Gap: {{gap}}%

FINANCIAL CONTEXT:
{{#if operatingCost}}
- Operating Cost Base: ₹{{operatingCost}} Cr
{{/if}}
{{#if operatingRevenue}}
- Operating Revenue: ₹{{operatingRevenue}} Cr
{{/if}}
{{#if operatingProfit}}
- Current Operating Profit: ₹{{operatingProfit}} Cr
{{/if}}

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Gap Analysis with Remediation Strategies
═══════════════════════════════════════════════════════════════════════════════

Provide analysis in JSON format:
{
  "gapQuantification": {
    "currentMargin": number,
    "requiredMargin": number,
    "absoluteGap": number,
    "additionalProfitRequired": number,
    "additionalProfitRequiredFormatted": "₹X.XX Cr"
  },
  "remediationStrategies": [
    {
      "strategy": "Strategy name",
      "description": "Detailed description",
      "financialImpact": "₹X.XX Cr additional profit",
      "implementation": "How to implement",
      "timeline": "Immediate/Short-term/Medium-term",
      "feasibility": "High/Medium/Low",
      "risks": ["risk 1", "risk 2"]
    }
  ],
  "recommendedApproach": {
    "primary": "Primary recommended strategy",
    "rationale": "Why this is recommended",
    "expectedOutcome": "Expected result"
  },
  "alternativeIfNotFeasible": "What to do if Safe Harbour cannot be achieved",
  "documentationRequirements": ["Required document 1", "Required document 2"]
}`,

  variables: [
    "transactionType",
    "metricType",
    "currentValue",
    "requiredThreshold",
    "gap",
    "operatingCost",
    "operatingRevenue",
    "operatingProfit",
  ],

  outputFormat: "json",

  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Calculation Accuracy",
      description: "Verify gap calculations are mathematically correct",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Strategy Completeness",
      description: "Multiple viable strategies provided",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Professional Language",
      description: "Business-appropriate recommendations",
      weight: 0.3,
      required: false,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// FORM 3CEFA NARRATIVE PROMPT
// =============================================================================

export const FORM_3CEFA_NARRATIVE_PROMPT: PromptTemplate = {
  id: "form_3cefa_narrative_v1",
  version: "1.0.0",
  category: PromptCategory.SAFE_HARBOUR,
  type: PromptType.FORM_3CEFA_NARRATIVE,
  name: "Form 3CEFA Narrative Generation",
  description: "Generate narrative sections for Form 3CEFA Safe Harbour declaration",

  systemPrompt: `You are preparing Form 3CEFA declaration content for Safe Harbour opt-in.

Form 3CEFA Requirements:
1. Declaration that eligible international transaction exists
2. Confirmation of Safe Harbour conditions compliance
3. Undertaking to maintain prescribed documentation
4. Details of the opted transaction

Generate content that:
- Uses formal declaration language
- Is precise about transaction details
- Meets statutory form requirements
- Is suitable for signing by authorized representative`,

  userPromptTemplate: `Generate Form 3CEFA narrative content:

TRANSACTION DETAILS:
- Entity: {{entityName}}
- PAN: {{entityPAN}}
- Assessment Year: {{assessmentYear}}
- Transaction Type: {{transactionType}}
- Transaction Value: ₹{{transactionValue}} Cr
- Associated Enterprise: {{aeName}}
- AE Country: {{aeCountry}}

SAFE HARBOUR COMPLIANCE:
- Applicable Rule: {{applicableRule}}
- Margin Achieved: {{marginAchieved}}%
- Threshold Required: {{thresholdRequired}}%
- Compliance Status: {{complianceStatus}}

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Form 3CEFA Narrative Sections
═══════════════════════════════════════════════════════════════════════════════

Provide in JSON format:
{
  "declarationStatement": "Formal declaration paragraph",
  "transactionDescription": "Description of the international transaction",
  "complianceConfirmation": "Confirmation of meeting Safe Harbour conditions",
  "undertaking": "Undertaking regarding documentation maintenance",
  "additionalDisclosures": ["Any additional disclosure 1", "..."],
  "signatoryStatement": "Statement for authorized signatory"
}`,

  variables: [
    "entityName",
    "entityPAN",
    "assessmentYear",
    "transactionType",
    "transactionValue",
    "aeName",
    "aeCountry",
    "applicableRule",
    "marginAchieved",
    "thresholdRequired",
    "complianceStatus",
  ],

  outputFormat: "json",

  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Form Compliance",
      description: "Content meets Form 3CEFA requirements",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Declaration Language",
      description: "Formal declaration language used",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Section Completeness",
      description: "All required sections present",
      weight: 0.2,
      required: true,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// EXPORT ALL SAFE HARBOUR PROMPTS
// =============================================================================

export const SAFE_HARBOUR_PROMPTS = {
  recommendation: SAFE_HARBOUR_RECOMMENDATION_PROMPT,
  gapAnalysis: SAFE_HARBOUR_GAP_ANALYSIS_PROMPT,
  form3cefaNarrative: FORM_3CEFA_NARRATIVE_PROMPT,
};
