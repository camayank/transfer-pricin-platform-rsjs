/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Country-by-Country Reporting (CbCR) Prompts - Form 3CEAD
 *
 * Based on:
 * - Section 286 of Income Tax Act
 * - Rule 10DB of Income Tax Rules
 * - OECD BEPS Action 13 Guidelines
 * - CbCR Implementation Package
 * ================================================================================
 */

import { PromptTemplate, PromptType, PromptCategory, QualityCheckType } from "../types";

// =============================================================================
// CBCR PROMPTS
// =============================================================================

const CBCR_JURISDICTION_ALLOCATION_PROMPT: PromptTemplate = {
  id: "cbcr_jurisdiction_allocation_v1",
  version: "1.0.0",
  category: PromptCategory.CBCR,
  type: PromptType.CBCR_JURISDICTION_ALLOCATION,
  name: "CbCR Jurisdiction Allocation",
  description: "Generate jurisdiction-wise allocation for Country-by-Country Report",
  systemPrompt: `You are an expert in Country-by-Country Reporting (CbCR) under OECD BEPS Action 13 and Indian Section 286 regulations.

Your task is to analyze and allocate financial data for a specific tax jurisdiction in the CbCR (Form 3CEAD).

Requirements:
1. Allocate revenues between related and unrelated parties accurately
2. Ensure profit/loss allocation follows consolidation rules
3. Apply correct currency conversion methodology
4. Identify all constituent entities in the jurisdiction
5. Classify main business activities per Table 3 codes
6. Document material adjustments and their rationale

Table 3 Business Activity Codes:
- R&D
- Holding or Managing Intellectual Property
- Purchasing or Procurement
- Manufacturing or Production
- Sales, Marketing or Distribution
- Administrative, Management or Support Services
- Provision of Services to Unrelated Parties
- Internal Group Finance
- Regulated Financial Services
- Insurance
- Holding Shares or Other Equity Instruments
- Dormant
- Other

Ensure compliance with Rule 10DB and OECD CbCR Implementation Package.`,
  userPromptTemplate: `Generate jurisdiction allocation for the CbCR with the following data:

MNE Group: {{groupName}}
Reporting Period: {{reportingPeriod}}
Reporting Currency: {{reportingCurrency}}

Jurisdiction: {{jurisdictionCode}} - {{jurisdictionName}}

Entities in this Jurisdiction:
{{entityList}}

Financial Data:
- Revenue from Unrelated Parties: {{unrelatedRevenue}}
- Revenue from Related Parties: {{relatedRevenue}}
- Total Revenue: {{totalRevenue}}
- Profit/(Loss) Before Tax: {{profitBeforeTax}}
- Income Tax Paid (Cash Basis): {{taxPaid}}
- Income Tax Accrued (Current Year): {{taxAccrued}}
- Stated Capital: {{statedCapital}}
- Accumulated Earnings: {{accumulatedEarnings}}
- Number of Employees: {{employeeCount}}
- Tangible Assets (other than cash): {{tangibleAssets}}

{{#if adjustments}}
Adjustments Applied:
{{adjustments}}
{{/if}}

{{#if consolidationNotes}}
Consolidation Notes:
{{consolidationNotes}}
{{/if}}

Generate:
1. Detailed jurisdiction allocation with entity breakdown
2. Business activity classification for each entity
3. Narrative explaining the allocation methodology
4. Any material adjustments and their rationale
5. Validation of data consistency`,
  variables: [
    "groupName",
    "reportingPeriod",
    "reportingCurrency",
    "jurisdictionCode",
    "jurisdictionName",
    "entityList",
    "unrelatedRevenue",
    "relatedRevenue",
    "totalRevenue",
    "profitBeforeTax",
    "taxPaid",
    "taxAccrued",
    "statedCapital",
    "accumulatedEarnings",
    "employeeCount",
    "tangibleAssets",
    "adjustments",
    "consolidationNotes",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      jurisdictionCode: { type: "string" },
      jurisdictionName: { type: "string" },
      entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            entityName: { type: "string" },
            entityType: { type: "string" },
            mainBusinessActivity: { type: "string" },
          },
        },
      },
      financials: { type: "object" },
      allocationNarrative: { type: "string" },
      materialAdjustments: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Financial Reconciliation",
      description: "Verify revenue totals and financial consistency",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "CbCR Compliance",
      description: "Ensure compliance with Rule 10DB and BEPS Action 13",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const CBCR_CONSOLIDATION_NARRATIVE_PROMPT: PromptTemplate = {
  id: "cbcr_consolidation_narrative_v1",
  version: "1.0.0",
  category: PromptCategory.CBCR,
  type: PromptType.CBCR_CONSOLIDATION_NARRATIVE,
  name: "CbCR Consolidation Narrative",
  description: "Generate consolidation narrative for Country-by-Country Report",
  systemPrompt: `You are an expert in CbCR consolidation and multinational group reporting under OECD and Indian regulations.

Your task is to generate a comprehensive consolidation narrative for the CbCR that:
1. Explains the data sources used (consolidated financial statements, statutory accounts, etc.)
2. Describes the currency conversion methodology
3. Documents the consolidation approach (elimination of intercompany transactions)
4. Highlights any deviations from standard CbCR reporting
5. Explains material differences between CbCR data and consolidated accounts

The narrative should be suitable for filing with tax authorities and withstand regulatory scrutiny.`,
  userPromptTemplate: `Generate a CbCR consolidation narrative for:

MNE Group: {{groupName}}
Ultimate Parent Entity: {{ultimateParent}}
Ultimate Parent Jurisdiction: {{parentJurisdiction}}
Reporting Period: {{reportingPeriod}}
Reporting Currency: {{reportingCurrency}}

Jurisdictions Covered: {{jurisdictionCount}}
Total Constituent Entities: {{entityCount}}

Jurisdiction Summary:
{{jurisdictionSummary}}

Data Sources:
{{dataSources}}

Currency Conversion:
- Method: {{currencyMethod}}
- Exchange Rates Used: {{exchangeRates}}

{{#if eliminationEntries}}
Intercompany Eliminations:
{{eliminationEntries}}
{{/if}}

{{#if specialConsiderations}}
Special Considerations:
{{specialConsiderations}}
{{/if}}

Consolidated Financials Reconciliation:
- Consolidated Revenue: {{consolidatedRevenue}}
- CbCR Total Revenue: {{cbcrTotalRevenue}}
- Variance: {{revenueVariance}}
- Variance Explanation: {{varianceExplanation}}

Generate:
1. Executive summary of the CbCR
2. Data source and methodology description
3. Currency conversion explanation
4. Jurisdiction-wise summary
5. Material transactions and special items
6. Regulatory compliance statement`,
  variables: [
    "groupName",
    "ultimateParent",
    "parentJurisdiction",
    "reportingPeriod",
    "reportingCurrency",
    "jurisdictionCount",
    "entityCount",
    "jurisdictionSummary",
    "dataSources",
    "currencyMethod",
    "exchangeRates",
    "eliminationEntries",
    "specialConsiderations",
    "consolidatedRevenue",
    "cbcrTotalRevenue",
    "revenueVariance",
    "varianceExplanation",
  ],
  outputFormat: "markdown",
  qualityChecks: [
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Narrative Completeness",
      description: "Ensure all required CbCR narrative elements are covered",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Data Consistency",
      description: "Verify consistency between narrative and reported figures",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const CBCR_VALIDATION_PROMPT: PromptTemplate = {
  id: "cbcr_validation_v1",
  version: "1.0.0",
  category: PromptCategory.CBCR,
  type: PromptType.CBCR_VALIDATION,
  name: "CbCR Validation",
  description: "Validate Country-by-Country Report for completeness and consistency",
  systemPrompt: `You are an expert CbCR reviewer with deep knowledge of OECD BEPS Action 13 requirements and Indian Rule 10DB compliance.

Your task is to validate a CbCR submission for:
1. Completeness of all required fields
2. Consistency across jurisdictions (revenue reconciliation)
3. Proper classification of business activities
4. Accuracy of entity information
5. Currency conversion correctness
6. Compliance with filing requirements

Flag any issues that could trigger regulatory queries or penalties.

Common CbCR Validation Points:
- Total revenues should reconcile with consolidated accounts
- Profit/loss allocations should be consistent
- Employee counts should be reasonable for activities performed
- Tax paid vs accrued should be explainable
- Permanent establishments must be correctly identified
- Stateless entities must be justified`,
  userPromptTemplate: `Validate the following CbCR data:

MNE Group: {{groupName}}
Reporting Period: {{reportingPeriod}}
Filing Jurisdiction: {{filingJurisdiction}}

Table 1 Data (Jurisdiction Summary):
{{table1Data}}

Table 2 Data (Entity List):
{{table2Data}}

Table 3 Data (Additional Information):
{{table3Data}}

Consolidated Financial Statements:
- Total Revenue: {{consolidatedRevenue}}
- Profit Before Tax: {{consolidatedPBT}}
- Income Tax: {{consolidatedTax}}

{{#if previousYearData}}
Previous Year Comparison:
{{previousYearData}}
{{/if}}

Perform comprehensive validation:
1. Completeness check for all mandatory fields
2. Cross-jurisdiction consistency validation
3. Reconciliation with consolidated accounts
4. Entity classification review
5. Identify any red flags or anomalies
6. Provide remediation recommendations`,
  variables: [
    "groupName",
    "reportingPeriod",
    "filingJurisdiction",
    "table1Data",
    "table2Data",
    "table3Data",
    "consolidatedRevenue",
    "consolidatedPBT",
    "consolidatedTax",
    "previousYearData",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      isValid: { type: "boolean" },
      completenessScore: { type: "number" },
      consistencyScore: { type: "number" },
      issues: { type: "array" },
      crossJurisdictionChecks: { type: "array" },
      recommendations: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Validation Accuracy",
      description: "Ensure validation checks are mathematically accurate",
      weight: 0.6,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Validation Coverage",
      description: "Verify all validation checks are performed",
      weight: 0.4,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const CBCR_NEXUS_ANALYSIS_PROMPT: PromptTemplate = {
  id: "cbcr_nexus_analysis_v1",
  version: "1.0.0",
  category: PromptCategory.CBCR,
  type: PromptType.CBCR_NEXUS_ANALYSIS,
  name: "CbCR Nexus Analysis",
  description: "Analyze economic substance and nexus for CbCR jurisdictions",
  systemPrompt: `You are an expert in BEPS and economic substance regulations, specializing in nexus analysis for CbCR purposes.

Your task is to analyze whether entities in a jurisdiction have sufficient economic substance to justify their tax position, considering:

1. BEPS Action 5: Nexus approach for IP regimes
2. Economic Substance Regulations (ESR) in relevant jurisdictions
3. DEMPE functions for intangibles
4. Real activities test
5. Adequate people and premises

Key Nexus Indicators:
- Physical presence (offices, employees)
- Decision-making authority
- Core income-generating activities
- Risk assumption and management
- Use of assets
- Qualification under tax treaties

Flag potential substance concerns that could lead to:
- Denial of treaty benefits
- CFC taxation
- Recharacterization of income
- Penalties under substance regulations`,
  userPromptTemplate: `Perform nexus analysis for the following jurisdiction:

MNE Group: {{groupName}}
Jurisdiction: {{jurisdictionCode}} - {{jurisdictionName}}

Entities in Jurisdiction:
{{entityDetails}}

Financial Profile:
- Revenue: {{revenue}}
- Profit Before Tax: {{profitBeforeTax}}
- Employees: {{employeeCount}}
- Tangible Assets: {{tangibleAssets}}

Business Activities:
{{businessActivities}}

{{#if ipActivities}}
IP-Related Activities:
{{ipActivities}}
{{/if}}

{{#if financingActivities}}
Financing Activities:
{{financingActivities}}
{{/if}}

{{#if holdingActivities}}
Holding Activities:
{{holdingActivities}}
{{/if}}

Local Substance Indicators:
{{substanceIndicators}}

Relevant Substance Requirements:
{{localSubstanceRules}}

Analyze:
1. Substantive activities present in the jurisdiction
2. Adequacy of people and physical presence
3. Decision-making and risk management capabilities
4. BEPS risk indicators
5. Recommendations for strengthening substance
6. Documentation requirements`,
  variables: [
    "groupName",
    "jurisdictionCode",
    "jurisdictionName",
    "entityDetails",
    "revenue",
    "profitBeforeTax",
    "employeeCount",
    "tangibleAssets",
    "businessActivities",
    "ipActivities",
    "financingActivities",
    "holdingActivities",
    "substanceIndicators",
    "localSubstanceRules",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      jurisdiction: { type: "string" },
      substantiveActivities: { type: "array" },
      nexusRiskLevel: { type: "string", enum: ["low", "medium", "high"] },
      bepsActionPoints: { type: "array" },
      recommendations: { type: "array" },
      documentationRequired: { type: "array" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "BEPS Compliance",
      description: "Ensure analysis aligns with BEPS guidelines",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Substance Analysis",
      description: "Verify all substance factors are analyzed",
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

export const CBCR_PROMPTS = {
  jurisdictionAllocation: CBCR_JURISDICTION_ALLOCATION_PROMPT,
  consolidationNarrative: CBCR_CONSOLIDATION_NARRATIVE_PROMPT,
  validation: CBCR_VALIDATION_PROMPT,
  nexusAnalysis: CBCR_NEXUS_ANALYSIS_PROMPT,
};
