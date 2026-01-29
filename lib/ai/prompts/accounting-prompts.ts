/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Accounting Connector Prompts
 *
 * AI-enhanced transaction classification and related party detection
 * ================================================================================
 */

import { PromptTemplate, PromptType, PromptCategory, QualityCheckType } from "../types";

// =============================================================================
// ACCOUNTING PROMPTS
// =============================================================================

const TRANSACTION_CLASSIFICATION_PROMPT: PromptTemplate = {
  id: "accounting_txn_classification_v1",
  version: "1.0.0",
  category: PromptCategory.ACCOUNTING,
  type: PromptType.TRANSACTION_CLASSIFICATION,
  name: "Transaction Classification",
  description: "Classify accounting transactions for transfer pricing purposes",
  systemPrompt: `You are an expert in Indian accounting and Transfer Pricing regulations.

Your task is to classify accounting transactions for Transfer Pricing purposes:
1. Identify the nature of transaction (service, royalty, interest, etc.)
2. Map to Form 3CEB Nature Codes (01-99)
3. Determine if transaction is with a related party
4. Suggest appropriate TP method
5. Flag any unusual or complex transactions

Form 3CEB Nature Codes Reference:
- 01-10: Purchase/Sale of Raw Materials, Goods
- 11-20: Purchase/Sale of Finished/Capital Goods
- 21-30: Payment/Receipt for Services
- 31-40: R&D Services, Software Development
- 41-50: Royalties, License Fees
- 51-60: Interest, Financial Transactions
- 61-70: Reimbursement, Cost Allocation
- 71-80: Guarantees, Other Financial
- 81-90: Capital Transactions
- 91-99: Other Transactions`,
  userPromptTemplate: `Classify the following accounting transactions:

Company: {{companyName}}
Financial Year: {{financialYear}}

Transactions to Classify:
{{transactions}}

Known Related Parties:
{{knownRelatedParties}}

For each transaction, provide:
1. Transaction nature classification
2. Recommended Form 3CEB nature code
3. Related party indicator (Yes/No/Likely)
4. Suggested TP method
5. Any flags or concerns
6. Confidence level (High/Medium/Low)`,
  variables: [
    "companyName",
    "financialYear",
    "transactions",
    "knownRelatedParties",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      classifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            transactionId: { type: "string" },
            natureClassification: { type: "string" },
            natureCode: { type: "string" },
            natureCodeDescription: { type: "string" },
            isRelatedParty: { type: "string", enum: ["yes", "no", "likely"] },
            suggestedTPMethod: { type: "string" },
            flags: { type: "array", items: { type: "string" } },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
          },
        },
      },
      summary: {
        type: "object",
        properties: {
          totalTransactions: { type: "number" },
          relatedPartyCount: { type: "number" },
          flaggedCount: { type: "number" },
        },
      },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Nature Code Format",
      description: "Verify nature codes are valid 2-digit codes",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Classification Consistency",
      description: "Ensure consistent classification across similar transactions",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const RELATED_PARTY_DETECTION_PROMPT: PromptTemplate = {
  id: "accounting_rp_detection_v1",
  version: "1.0.0",
  category: PromptCategory.ACCOUNTING,
  type: PromptType.RELATED_PARTY_DETECTION,
  name: "Related Party Detection",
  description: "Intelligently detect related party transactions from accounting data",
  systemPrompt: `You are an expert in identifying related party transactions for Transfer Pricing purposes under Indian tax law.

Related parties include:
1. Associated Enterprises as per Section 92A
2. Parties with common shareholding >26%
3. Directors, key management personnel, and their relatives
4. Entities under common control
5. Foreign entities with special relationships

Indicators of related party transactions:
- Overseas party names (Inc., LLC, Ltd., GmbH, BV, Pte)
- Group company naming patterns
- "Intercompany" or "IC" prefixes
- Parent/Subsidiary/Holding references
- Unusual pricing patterns
- Non-standard payment terms
- Foreign currency transactions`,
  userPromptTemplate: `Analyze these accounts and transactions for related party indicators:

Company: {{companyName}}
Industry: {{industry}}

Account Names and Balances:
{{accountData}}

Transaction Samples:
{{transactionSamples}}

Known Group Companies:
{{knownGroupCompanies}}

Parent Company: {{parentCompany}}
Parent Country: {{parentCountry}}

Identify:
1. Accounts likely to be related party accounts
2. Transactions that appear to be with related parties
3. Confidence level for each identification
4. Rationale for classification
5. Suggested related party name and country
6. Nature code recommendation`,
  variables: [
    "companyName",
    "industry",
    "accountData",
    "transactionSamples",
    "knownGroupCompanies",
    "parentCompany",
    "parentCountry",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      detectedRelatedParties: {
        type: "array",
        items: {
          type: "object",
          properties: {
            accountName: { type: "string" },
            likelyRelatedParty: { type: "string" },
            likelyCountry: { type: "string" },
            confidence: { type: "string" },
            indicators: { type: "array", items: { type: "string" } },
            transactionValue: { type: "number" },
            suggestedNatureCode: { type: "string" },
          },
        },
      },
      summary: {
        type: "object",
        properties: {
          totalRPTValue: { type: "number" },
          highConfidenceCount: { type: "number" },
          requiresReview: { type: "number" },
        },
      },
      recommendations: { type: "array", items: { type: "string" } },
    },
  },
  qualityChecks: [],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const NATURE_CODE_RECOMMENDATION_PROMPT: PromptTemplate = {
  id: "accounting_nature_code_v1",
  version: "1.0.0",
  category: PromptCategory.ACCOUNTING,
  type: PromptType.NATURE_CODE_RECOMMENDATION,
  name: "Nature Code Recommendation",
  description: "Recommend Form 3CEB nature codes based on transaction details",
  systemPrompt: `You are an expert in Form 3CEB nature codes under Indian Transfer Pricing regulations.

Form 3CEB Part B requires classification of international transactions by nature code.
Each nature code represents a specific type of transaction per CBDT guidelines.

Key Nature Code Groups:
- 01-10: Tangible property purchases (raw materials, components)
- 11-20: Tangible property sales (finished goods, capital goods)
- 21-30: Service payments (management, technical, marketing)
- 31-40: Service receipts (IT, ITeS, R&D, engineering)
- 41-50: Royalties and license fees (paid and received)
- 51-60: Interest payments and receipts
- 61-70: Reimbursements and cost sharing
- 71-80: Corporate guarantees
- 81-90: Capital transactions (equity, loans)
- 91-99: Others (insurance, derivatives, etc.)

Provide precise nature code recommendations with justification.`,
  userPromptTemplate: `Recommend nature codes for these transactions:

Transaction Details:
{{transactionDetails}}

Related Party: {{relatedPartyName}}
Related Party Country: {{relatedPartyCountry}}
Relationship: {{relationshipType}}

Industry Context: {{industryContext}}

For each transaction provide:
1. Primary recommended nature code
2. Alternative nature code (if applicable)
3. Nature code description
4. Justification for selection
5. Any special considerations or flags
6. Suggested TP method alignment`,
  variables: [
    "transactionDetails",
    "relatedPartyName",
    "relatedPartyCountry",
    "relationshipType",
    "industryContext",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            transactionDescription: { type: "string" },
            primaryNatureCode: { type: "string" },
            primaryCodeDescription: { type: "string" },
            alternativeCode: { type: "string" },
            justification: { type: "string" },
            suggestedTPMethod: { type: "string" },
            specialConsiderations: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Valid Nature Code",
      description: "Verify nature codes match Form 3CEB requirements",
      weight: 0.6,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Justification Completeness",
      description: "Ensure justification is provided for each recommendation",
      weight: 0.4,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const FINANCIAL_ANOMALY_PROMPT: PromptTemplate = {
  id: "accounting_anomaly_v1",
  version: "1.0.0",
  category: PromptCategory.ACCOUNTING,
  type: PromptType.FINANCIAL_ANOMALY,
  name: "Financial Anomaly Detection",
  description: "Detect anomalies in financial data that may indicate TP issues",
  systemPrompt: `You are an expert financial analyst specializing in Transfer Pricing risk assessment.

Analyze financial data to detect anomalies that may indicate:
1. Mispricing of intercompany transactions
2. Profit shifting arrangements
3. Unusual cost allocations
4. Non-arm's length pricing indicators
5. Documentation gaps
6. Potential audit triggers

Consider industry benchmarks and regulatory thresholds.`,
  userPromptTemplate: `Analyze this financial data for anomalies:

Company: {{companyName}}
Industry: {{industry}}
Financial Year: {{financialYear}}

Financial Summary:
- Total Revenue: {{totalRevenue}}
- Export Revenue: {{exportRevenue}}
- Operating Cost: {{operatingCost}}
- Operating Profit: {{operatingProfit}}
- OP/OC Margin: {{opOcMargin}}%
- OP/OR Margin: {{opOrMargin}}%

Related Party Transaction Summary:
- Total RPT Value: {{totalRPT}}
- RPT as % of Revenue: {{rptPercentage}}%

Industry Benchmarks:
{{industryBenchmarks}}

Year-over-Year Changes:
{{yoyChanges}}

Unusual Transactions:
{{unusualTransactions}}

Identify:
1. Financial anomalies or red flags
2. Potential Transfer Pricing concerns
3. Areas requiring deeper investigation
4. Documentation recommendations
5. Risk severity assessment`,
  variables: [
    "companyName",
    "industry",
    "financialYear",
    "totalRevenue",
    "exportRevenue",
    "operatingCost",
    "operatingProfit",
    "opOcMargin",
    "opOrMargin",
    "totalRPT",
    "rptPercentage",
    "industryBenchmarks",
    "yoyChanges",
    "unusualTransactions",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      anomalies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            description: { type: "string" },
            severity: { type: "string", enum: ["high", "medium", "low"] },
            potentialImpact: { type: "string" },
            recommendation: { type: "string" },
          },
        },
      },
      overallRiskAssessment: {
        type: "object",
        properties: {
          riskLevel: { type: "string" },
          auditLikelihood: { type: "string" },
          priorityAreas: { type: "array", items: { type: "string" } },
        },
      },
      documentationGaps: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Financial Calculations",
      description: "Verify numerical accuracy of margin and ratio calculations",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Risk Coverage",
      description: "Ensure all identified anomalies have recommendations",
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

export const ACCOUNTING_PROMPTS = {
  transactionClassification: TRANSACTION_CLASSIFICATION_PROMPT,
  relatedPartyDetection: RELATED_PARTY_DETECTION_PROMPT,
  natureCodeRecommendation: NATURE_CODE_RECOMMENDATION_PROMPT,
  financialAnomaly: FINANCIAL_ANOMALY_PROMPT,
};
