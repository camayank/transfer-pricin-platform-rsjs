/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Master File (Form 3CEAA) Prompts
 *
 * Based on:
 * - Section 92D(4) of Income Tax Act
 * - Rule 10DA of Income Tax Rules
 * - OECD BEPS Action 13 Guidelines
 * ================================================================================
 */

import { PromptTemplate, PromptType, PromptCategory, QualityCheckType } from "../types";

// =============================================================================
// MASTER FILE PROMPTS
// =============================================================================

const ORGANIZATIONAL_STRUCTURE_PROMPT: PromptTemplate = {
  id: "master_file_org_structure_v1",
  version: "1.0.0",
  category: PromptCategory.MASTER_FILE,
  type: PromptType.ORGANIZATIONAL_STRUCTURE,
  name: "Organizational Structure Narrative",
  description: "Generate ownership chart description for Master File Part A",
  systemPrompt: `You are an expert in Transfer Pricing documentation, specializing in Master File preparation under Indian Income Tax Rules and OECD BEPS Action 13 guidelines.

Your task is to generate a comprehensive organizational structure description for the Master File (Form 3CEAA) Part A.

Requirements:
1. Describe the ownership structure clearly and accurately
2. Identify the ultimate parent entity and its jurisdiction
3. List key operating entities with their functions
4. Explain the shareholding pattern and any significant ownership changes
5. Use professional, regulatory-compliant language
6. Ensure consistency with Rule 10DA requirements

The description should be suitable for submission to Indian tax authorities.`,
  userPromptTemplate: `Generate an organizational structure description for the Master File with the following details:

MNE Group Name: {{groupName}}
Ultimate Parent Entity: {{ultimateParent}}
Ultimate Parent Country: {{parentCountry}}
Reporting Entity: {{reportingEntity}}
Reporting Entity Type: {{entityType}}

Group Entities:
{{groupEntities}}

Assessment Year: {{assessmentYear}}

{{#if recentRestructuring}}
Recent Restructuring: {{recentRestructuring}}
{{/if}}

Please provide:
1. A narrative description of the organizational structure (2-3 paragraphs)
2. Key observations about the group structure
3. Any material changes in the reporting period`,
  variables: [
    "groupName",
    "ultimateParent",
    "parentCountry",
    "reportingEntity",
    "entityType",
    "groupEntities",
    "assessmentYear",
    "recentRestructuring",
  ],
  outputFormat: "markdown",
  qualityChecks: [
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Entity Consistency",
      description: "Verify consistency of entity references and ownership details",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Regulatory Compliance",
      description: "Ensure compliance with Rule 10DA and BEPS Action 13",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const BUSINESS_DESCRIPTION_PROMPT: PromptTemplate = {
  id: "master_file_business_desc_v1",
  version: "1.0.0",
  category: PromptCategory.MASTER_FILE,
  type: PromptType.BUSINESS_DESCRIPTION,
  name: "Business Description Narrative",
  description: "Generate comprehensive business description for Master File Part B",
  systemPrompt: `You are an expert in Transfer Pricing documentation, specializing in Master File preparation under Indian tax regulations and OECD guidelines.

Your task is to generate a comprehensive business description for the Master File (Form 3CEAA) Part B covering:
1. Important drivers of business profit
2. Supply chain description
3. Main geographic markets
4. Key competitors
5. Principal functions, assets, and risks

Requirements:
- Use professional language appropriate for regulatory submission
- Be specific and factual
- Align with Rule 10DA requirements
- Follow OECD BEPS Action 13 format`,
  userPromptTemplate: `Generate a business description for the Master File with the following inputs:

MNE Group Name: {{groupName}}
Industry Sector: {{industrySector}}
Principal Business Activities: {{businessActivities}}
Entity Characterization: {{entityCharacterization}}

Financial Data:
- Revenue: {{revenue}}
- Export Revenue: {{exportRevenue}}
- Employee Count: {{employeeCount}}

Key Products/Services:
{{productsServices}}

Geographic Markets: {{geographicMarkets}}

Known Competitors: {{competitors}}

{{#if functionalProfile}}
Functional Profile:
- Functions: {{functions}}
- Assets: {{assets}}
- Risks: {{risks}}
{{/if}}

Please generate:
1. A comprehensive description of the MNE group's business (3-4 paragraphs)
2. Important drivers of business profit
3. Supply chain narrative
4. Principal functions, assets, and risks analysis`,
  variables: [
    "groupName",
    "industrySector",
    "businessActivities",
    "entityCharacterization",
    "revenue",
    "exportRevenue",
    "employeeCount",
    "productsServices",
    "geographicMarkets",
    "competitors",
    "functionalProfile",
    "functions",
    "assets",
    "risks",
  ],
  outputFormat: "markdown",
  qualityChecks: [
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Business Description Completeness",
      description: "Ensure coverage of profit drivers, supply chain, markets, and functions",
      weight: 1.0,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const SUPPLY_CHAIN_NARRATIVE_PROMPT: PromptTemplate = {
  id: "master_file_supply_chain_v1",
  version: "1.0.0",
  category: PromptCategory.MASTER_FILE,
  type: PromptType.SUPPLY_CHAIN_NARRATIVE,
  name: "Supply Chain Narrative",
  description: "Generate supply chain description for Master File",
  systemPrompt: `You are a Transfer Pricing expert specializing in supply chain documentation for Master File preparation.

Generate a detailed supply chain narrative that:
1. Describes the flow of goods/services within the MNE group
2. Identifies key procurement and distribution hubs
3. Explains intercompany transaction flows
4. Highlights the role of each significant entity
5. Complies with OECD BEPS Action 13 and Indian Rule 10DA requirements`,
  userPromptTemplate: `Generate a supply chain narrative for the Master File:

MNE Group: {{groupName}}
Industry: {{industry}}
Business Model: {{businessModel}}

Entity Role: {{entityRole}}
Parent Entity: {{parentEntity}}

Intercompany Transactions:
{{intercompanyTransactions}}

Key Procurement Sources: {{procurementSources}}
Key Distribution Channels: {{distributionChannels}}

{{#if manufacturingLocations}}
Manufacturing Locations: {{manufacturingLocations}}
{{/if}}

{{#if serviceDeliveryModel}}
Service Delivery Model: {{serviceDeliveryModel}}
{{/if}}

Generate a comprehensive supply chain narrative (2-3 paragraphs) covering:
1. Overall supply chain structure
2. Role of the Indian entity within the supply chain
3. Flow of intercompany transactions
4. Key value drivers in the supply chain`,
  variables: [
    "groupName",
    "industry",
    "businessModel",
    "entityRole",
    "parentEntity",
    "intercompanyTransactions",
    "procurementSources",
    "distributionChannels",
    "manufacturingLocations",
    "serviceDeliveryModel",
  ],
  outputFormat: "text",
  qualityChecks: [
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Transaction Consistency",
      description: "Verify consistency in transaction flow description",
      weight: 1.0,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const INTANGIBLES_STRATEGY_PROMPT: PromptTemplate = {
  id: "master_file_intangibles_v1",
  version: "1.0.0",
  category: PromptCategory.MASTER_FILE,
  type: PromptType.INTANGIBLES_STRATEGY,
  name: "Intangibles Strategy Documentation",
  description: "Generate intangibles strategy for Master File Part C",
  systemPrompt: `You are an expert in Transfer Pricing with deep knowledge of intangible assets and DEMPE functions (Development, Enhancement, Maintenance, Protection, Exploitation).

Generate intangibles documentation for the Master File that:
1. Describes the group's overall strategy for IP development and ownership
2. Identifies key intangible assets and their legal/economic owners
3. Explains the transfer pricing policy for intangibles
4. Documents any IP transfers or cost contribution arrangements
5. Complies with OECD BEPS guidelines and Indian regulations`,
  userPromptTemplate: `Generate intangibles strategy documentation for the Master File:

MNE Group: {{groupName}}
Industry: {{industry}}

Intangible Assets:
{{intangiblesList}}

R&D Facilities:
{{rdFacilities}}

R&D Management Location: {{rdManagementLocation}}

Legal Owner of IP: {{legalOwner}}
Economic Owner of IP: {{economicOwner}}

{{#if intangibleTransfers}}
Recent IP Transfers:
{{intangibleTransfers}}
{{/if}}

{{#if costContributionArrangements}}
Cost Contribution Arrangements:
{{costContributionArrangements}}
{{/if}}

Generate:
1. Group's overall strategy for development, ownership, and exploitation of intangibles
2. DEMPE analysis for key intangibles
3. Transfer pricing policy for intangible-related transactions
4. Documentation of any important intangible transfers`,
  variables: [
    "groupName",
    "industry",
    "intangiblesList",
    "rdFacilities",
    "rdManagementLocation",
    "legalOwner",
    "economicOwner",
    "intangibleTransfers",
    "costContributionArrangements",
  ],
  outputFormat: "markdown",
  qualityChecks: [
    {
      type: QualityCheckType.COMPLETENESS,
      name: "DEMPE Completeness",
      description: "Ensure all DEMPE functions are addressed",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "OECD Compliance",
      description: "Verify compliance with OECD Chapter VI guidelines",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const FINANCIAL_POLICY_PROMPT: PromptTemplate = {
  id: "master_file_financial_policy_v1",
  version: "1.0.0",
  category: PromptCategory.MASTER_FILE,
  type: PromptType.FINANCIAL_POLICY,
  name: "Intercompany Financial Policy",
  description: "Generate financial activities documentation for Master File Part D",
  systemPrompt: `You are a Transfer Pricing expert specializing in intercompany financial transactions.

Generate documentation for intercompany financial activities that:
1. Describes the group's intercompany financing arrangements
2. Explains the treasury and cash management structure
3. Documents the transfer pricing policy for financial transactions
4. Identifies key financing entities and their functions
5. Complies with OECD guidelines and Indian Safe Harbour rules for financial transactions`,
  userPromptTemplate: `Generate intercompany financial policy documentation for the Master File:

MNE Group: {{groupName}}

Financing Entities:
{{financingEntities}}

Financing Arrangements:
{{financingArrangements}}

{{#if cashPooling}}
Cash Pooling Arrangements:
{{cashPooling}}
{{/if}}

{{#if guarantees}}
Corporate Guarantees:
{{guarantees}}
{{/if}}

Interest Rate Policy: {{interestRatePolicy}}
Currency Management: {{currencyManagement}}

Generate:
1. Description of how the MNE group is financed
2. Identification of group members with central financing functions
3. General transfer pricing policy for financial transactions
4. Documentation of major financing arrangements`,
  variables: [
    "groupName",
    "financingEntities",
    "financingArrangements",
    "cashPooling",
    "guarantees",
    "interestRatePolicy",
    "currencyManagement",
  ],
  outputFormat: "markdown",
  qualityChecks: [
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Financial Consistency",
      description: "Verify consistency of financial arrangements and rates",
      weight: 1.0,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const FAR_ANALYSIS_PROMPT: PromptTemplate = {
  id: "master_file_far_v1",
  version: "1.0.0",
  category: PromptCategory.MASTER_FILE,
  type: PromptType.FAR_ANALYSIS,
  name: "Functions-Assets-Risks Analysis",
  description: "Generate comprehensive FAR analysis for Master File",
  systemPrompt: `You are a Transfer Pricing expert specializing in functional analysis under OECD Transfer Pricing Guidelines.

Generate a comprehensive Functions-Assets-Risks (FAR) analysis that:
1. Identifies and documents all significant functions performed
2. Lists assets employed including tangible and intangible assets
3. Analyzes risks assumed and managed
4. Characterizes the entity based on FAR profile
5. Supports the selection of appropriate transfer pricing method`,
  userPromptTemplate: `Generate a FAR analysis for the following entity:

Entity Name: {{entityName}}
Entity Type: {{entityType}}
Industry: {{industry}}
Principal Activity: {{principalActivity}}

Functions Performed:
{{functions}}

Assets Employed:
{{assets}}

Risks Assumed:
{{risks}}

Related Party Transactions:
{{relatedPartyTransactions}}

{{#if comparableEntities}}
Comparable Entity Functions: {{comparableEntities}}
{{/if}}

Generate:
1. Detailed function-by-function analysis with significance assessment
2. Asset utilization analysis including intangibles
3. Risk allocation analysis with economic substance
4. Entity characterization conclusion
5. Implications for transfer pricing method selection`,
  variables: [
    "entityName",
    "entityType",
    "industry",
    "principalActivity",
    "functions",
    "assets",
    "risks",
    "relatedPartyTransactions",
    "comparableEntities",
  ],
  outputFormat: "markdown",
  qualityChecks: [
    {
      type: QualityCheckType.COMPLETENESS,
      name: "FAR Completeness",
      description: "Ensure all FAR elements (functions, assets, risks) are analyzed",
      weight: 1.0,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

// =============================================================================
// EXPORT
// =============================================================================

export const MASTER_FILE_PROMPTS = {
  organizationalStructure: ORGANIZATIONAL_STRUCTURE_PROMPT,
  businessDescription: BUSINESS_DESCRIPTION_PROMPT,
  supplyChainNarrative: SUPPLY_CHAIN_NARRATIVE_PROMPT,
  intangiblesStrategy: INTANGIBLES_STRATEGY_PROMPT,
  financialPolicy: FINANCIAL_POLICY_PROMPT,
  farAnalysis: FAR_ANALYSIS_PROMPT,
};
