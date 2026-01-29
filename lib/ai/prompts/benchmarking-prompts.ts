/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Benchmarking Prompts - Tier 1
 *
 * Production-grade prompts for benchmarking analysis and narratives
 * ================================================================================
 */

import { PromptTemplate, PromptCategory, PromptType, QualityCheckType } from "../types";

// =============================================================================
// WORKING CAPITAL ADJUSTMENT PROMPT
// =============================================================================

export const WORKING_CAPITAL_ADJUSTMENT_PROMPT: PromptTemplate = {
  id: "wc_adjustment_v1",
  version: "1.0.0",
  category: PromptCategory.BENCHMARKING,
  type: PromptType.WORKING_CAPITAL_ADJUSTMENT,
  name: "Working Capital Adjustment Analysis",
  description: "Generate working capital adjustment computations with narrative",

  systemPrompt: `You are a Transfer Pricing analyst computing working capital adjustments.

REGULATORY BASIS:
- Rule 10B(3): Adjustments for material differences affecting price/margin
- Working capital differences represent implicit financing costs
- Adjustment standardizes comparables to tested party's working capital profile

METHODOLOGY:
1. Compute Working Capital Ratio = (Receivables + Inventory - Payables) / Revenue
2. Compute WC Difference = Tested Party WC% - Comparable WC%
3. Compute Adjustment = WC Difference × Interest Rate
4. Apply adjustment to comparable's PLI

IMPORTANT:
- Use provided financial data only - never fabricate numbers
- Interest rate should be SBI PLR or average borrowing rate
- Explain direction of adjustment clearly (positive/negative)
- Document data sources for audit trail`,

  userPromptTemplate: `Compute working capital adjustment:

═══════════════════════════════════════════════════════════════════════════════
TESTED PARTY FINANCIALS
═══════════════════════════════════════════════════════════════════════════════
Entity: {{testedPartyName}}
Financial Year: {{financialYear}}

Revenue: ₹{{revenue}} Cr
Trade Receivables (Average): ₹{{receivables}} Cr
Inventory (Average): ₹{{inventory}} Cr
Trade Payables (Average): ₹{{payables}} Cr

═══════════════════════════════════════════════════════════════════════════════
COMPARABLE FINANCIALS
═══════════════════════════════════════════════════════════════════════════════
{{comparableFinancials}}

═══════════════════════════════════════════════════════════════════════════════
INTEREST RATE FOR ADJUSTMENT
═══════════════════════════════════════════════════════════════════════════════
Rate: {{interestRate}}%
Basis: {{rateBasis}}

═══════════════════════════════════════════════════════════════════════════════
TASK: Compute Working Capital Adjustment
═══════════════════════════════════════════════════════════════════════════════

Provide in JSON format:
{
  "testedParty": {
    "name": "{{testedPartyName}}",
    "receivables": number,
    "inventory": number,
    "payables": number,
    "revenue": number,
    "wcRatio": number,
    "computation": "Step-by-step calculation"
  },
  "interestRate": {
    "rate": number,
    "source": "SBI PLR / Other",
    "date": "Rate effective date"
  },
  "adjustments": [
    {
      "company": "Comparable name",
      "wcRatio": number,
      "wcDifference": number,
      "adjustmentDirection": "positive/negative",
      "adjustmentPercent": number,
      "unadjustedPLI": number,
      "adjustedPLI": number,
      "computation": "Step-by-step calculation"
    }
  ],
  "summary": {
    "averageAdjustment": number,
    "rangeOfAdjustments": "X% to Y%",
    "materialityAssessment": "Material/Immaterial"
  },
  "methodology": "Paragraph describing methodology adopted",
  "narrative": "Formal narrative for TP documentation (2-3 paragraphs)",
  "dataSourcesUsed": [
    {"data": "Tested party financials", "source": "Management accounts / Audited financials"},
    {"data": "Comparable financials", "source": "Prowess / Annual Reports"},
    {"data": "Interest rate", "source": "RBI / SBI website"}
  ],
  "qualityChecks": {
    "calculationsVerified": true,
    "interestRateAppropriate": true,
    "adjustmentDirectionLogical": true,
    "consistentWithPriorYear": "Yes/No/NA"
  }
}`,

  variables: [
    "testedPartyName",
    "financialYear",
    "revenue",
    "receivables",
    "inventory",
    "payables",
    "comparableFinancials",
    "interestRate",
    "rateBasis",
  ],

  outputFormat: "json",

  expectedOutputSchema: {
    type: "object",
    required: ["testedParty", "interestRate", "adjustments", "narrative"],
  },

  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Calculation Accuracy",
      description: "All calculations mathematically correct",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Rule 10B Compliance",
      description: "Proper regulatory basis cited",
      weight: 0.2,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Documentation Completeness",
      description: "All required elements present",
      weight: 0.2,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Narrative Quality",
      description: "Suitable for TP documentation",
      weight: 0.2,
      required: false,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// COMPARABLE REJECTION PROMPT
// =============================================================================

export const COMPARABLE_REJECTION_PROMPT: PromptTemplate = {
  id: "comparable_rejection_v1",
  version: "1.0.0",
  category: PromptCategory.BENCHMARKING,
  type: PromptType.COMPARABLE_REJECTION,
  name: "Comparable Company Rejection Rationale",
  description: "Generate documented reasons for rejecting comparable companies",

  systemPrompt: `You are a Transfer Pricing analyst documenting comparable rejection rationale.

REJECTION CRITERIA (per Rule 10B):
1. Functional Dissimilarity - Different functions, assets, risks
2. Related Party Transactions - RPT > 25% of revenue typically rejected
3. Financial Anomalies - Persistent losses, exceptional items
4. Data Unavailability - Missing financial years or segmental data
5. Geographic Differences - Different market conditions
6. Size Differences - If materially affecting margins
7. Business Model Differences - Different value chain position

DOCUMENTATION REQUIREMENTS:
- Cite specific source (annual report page, database field)
- Be precise about the rejection reason
- Use verifiable facts, not opinions
- Reference the comparability factor affected

CRITICAL: Only use information that can be verified. Do not invent annual report content.`,

  userPromptTemplate: `Generate comparable rejection rationale:

═══════════════════════════════════════════════════════════════════════════════
COMPANY TO BE REJECTED
═══════════════════════════════════════════════════════════════════════════════
Company Name: {{companyName}}
CIN: {{companyCIN}}
Industry: {{industry}}
NIC Code: {{nicCode}}

AVAILABLE FINANCIAL DATA:
{{financialData}}

BUSINESS DESCRIPTION FROM DATABASE:
{{businessDescription}}

ANNUAL REPORT OBSERVATIONS:
{{annualReportObservations}}

TESTED PARTY PROFILE:
- Industry: {{testedPartyIndustry}}
- Functions: {{testedPartyFunctions}}
- Revenue Scale: ₹{{testedPartyRevenue}} Cr

REJECTION REASON CATEGORY: {{rejectionCategory}}

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Rejection Documentation
═══════════════════════════════════════════════════════════════════════════════

Provide in JSON format:
{
  "company": {
    "name": "{{companyName}}",
    "cin": "{{companyCIN}}",
    "nicCode": "{{nicCode}}"
  },
  "rejectionCategory": "functional/rpt/financial/data/other",
  "primaryReason": "Main reason for rejection (1-2 sentences)",
  "detailedRationale": "Detailed explanation (1 paragraph)",
  "sourceReferences": [
    {
      "source": "Annual Report FY 2023-24",
      "page": "Page XX / Note YY",
      "relevantExtract": "Brief quote or description"
    }
  ],
  "comparabilityFactorAffected": "Functions/Assets/Risks/Industry/Other",
  "rule10BReference": "Specific Rule 10B clause",
  "alternativeConsideration": "Was any adjustment considered before rejection? Why not feasible?",
  "rejectionNarrative": "Formal rejection statement for TP documentation"
}`,

  variables: [
    "companyName",
    "companyCIN",
    "industry",
    "nicCode",
    "financialData",
    "businessDescription",
    "annualReportObservations",
    "testedPartyIndustry",
    "testedPartyFunctions",
    "testedPartyRevenue",
    "rejectionCategory",
  ],

  outputFormat: "json",

  qualityChecks: [
    {
      type: QualityCheckType.HALLUCINATION_DETECTION,
      name: "Source Verification",
      description: "Sources can be verified",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Rule 10B Compliance",
      description: "Proper comparability criteria cited",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Documentation Quality",
      description: "Suitable for regulatory review",
      weight: 0.3,
      required: false,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// ARM'S LENGTH CONCLUSION PROMPT
// =============================================================================

export const ARM_LENGTH_CONCLUSION_PROMPT: PromptTemplate = {
  id: "al_conclusion_v1",
  version: "1.0.0",
  category: PromptCategory.BENCHMARKING,
  type: PromptType.ARM_LENGTH_CONCLUSION,
  name: "Arm's Length Conclusion Generator",
  description: "Generate arm's length determination conclusion with regulatory compliance",

  systemPrompt: `You are a Transfer Pricing expert drafting the arm's length conclusion.

REGULATORY FRAMEWORK:
- Rule 10CA: Determination of arm's length price
- If dataset has comparability defects, use interquartile range (35th to 65th percentile)
- Arithmetic mean used for adjustment computation if price falls outside range
- Section 92C(2): Adjustment to be made if not at arm's length

CONCLUSION STRUCTURE:
1. State the arm's length range determined
2. State the tested party's margin
3. Conclude whether within range or not
4. If adjustment required, compute quantum
5. Provide formal conclusion statement

The conclusion must be:
- Factually accurate with provided data
- Regulatory compliant
- Clear and unambiguous
- Defensible before TPO`,

  userPromptTemplate: `Generate arm's length conclusion:

═══════════════════════════════════════════════════════════════════════════════
BENCHMARKING DATA
═══════════════════════════════════════════════════════════════════════════════
PLI Used: {{pliType}}
Financial Years: {{financialYears}}
Number of Comparables: {{numberOfComparables}}

COMPARABLE MARGINS (Adjusted):
{{comparableMargins}}

RANGE STATISTICS:
- 35th Percentile: {{percentile35}}%
- Median (50th): {{median}}%
- 65th Percentile: {{percentile65}}%
- Arithmetic Mean: {{arithmeticMean}}%

TESTED PARTY:
- Entity: {{testedPartyName}}
- PLI Margin: {{testedPartyMargin}}%
- Operating Cost: ₹{{operatingCost}} Cr
- Operating Revenue: ₹{{operatingRevenue}} Cr

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Arm's Length Conclusion
═══════════════════════════════════════════════════════════════════════════════

Provide in JSON format:
{
  "armLengthRange": {
    "percentile35": number,
    "median": number,
    "percentile65": number,
    "arithmeticMean": number,
    "rangeDescription": "X% to Y%"
  },
  "testedParty": {
    "name": "{{testedPartyName}}",
    "margin": number,
    "costBase": number,
    "revenueBase": number
  },
  "comparison": {
    "status": "WITHIN_RANGE" or "BELOW_RANGE" or "ABOVE_RANGE",
    "description": "Tested party margin of X% is [within/below/above] the arm's length range of Y% to Z%"
  },
  "adjustmentAnalysis": {
    "required": boolean,
    "referencePoint": "Median/Arithmetic Mean",
    "shortfall": number,
    "adjustmentAmount": number,
    "computation": "Step-by-step calculation"
  },
  "conclusion": {
    "status": "AT_ARMS_LENGTH" or "ADJUSTMENT_REQUIRED",
    "formalStatement": "2-3 sentence formal conclusion for TP documentation",
    "regulatoryCompliance": "Statement on Rule 10CA compliance"
  },
  "summaryTable": {
    "headers": ["Particulars", "Value"],
    "rows": [
      ["Number of Comparables", "X"],
      ["PLI Used", "OP/OC"],
      ["Arm's Length Range", "X% to Y%"],
      ["Tested Party Margin", "Z%"],
      ["Status", "At Arm's Length / Adjustment Required"],
      ["Adjustment Amount", "₹X Cr / Nil"]
    ]
  },
  "documentationStatement": "Statement for inclusion in TP documentation conclusion chapter"
}`,

  variables: [
    "pliType",
    "financialYears",
    "numberOfComparables",
    "comparableMargins",
    "percentile35",
    "median",
    "percentile65",
    "arithmeticMean",
    "testedPartyName",
    "testedPartyMargin",
    "operatingCost",
    "operatingRevenue",
  ],

  outputFormat: "json",

  expectedOutputSchema: {
    type: "object",
    required: ["armLengthRange", "testedParty", "comparison", "conclusion"],
  },

  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Range Accuracy",
      description: "Percentile calculations correct",
      weight: 0.35,
      required: true,
    },
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Rule 10CA Compliance",
      description: "Proper regulatory framework applied",
      weight: 0.25,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Logic Consistency",
      description: "Conclusion matches data",
      weight: 0.2,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Formal Language",
      description: "Suitable for regulatory submission",
      weight: 0.2,
      required: false,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// EXPORT ALL BENCHMARKING PROMPTS
// =============================================================================

export const BENCHMARKING_PROMPTS = {
  workingCapitalAdjustment: WORKING_CAPITAL_ADJUSTMENT_PROMPT,
  comparableRejection: COMPARABLE_REJECTION_PROMPT,
  armLengthConclusion: ARM_LENGTH_CONCLUSION_PROMPT,
};
