/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Form 3CEB Prompts - Tier 1
 *
 * Production-grade prompts for Form 3CEB narratives and justifications
 * ================================================================================
 */

import { PromptTemplate, PromptCategory, PromptType, QualityCheckType } from "../types";

// =============================================================================
// TRANSACTION NATURE CODE MAPPING
// =============================================================================

const NATURE_CODE_DESCRIPTIONS: Record<string, string> = {
  "01": "Purchase of raw materials",
  "02": "Purchase of finished goods",
  "03": "Purchase of capital goods",
  "04": "Purchase of traded goods",
  "05": "Sale of raw materials",
  "06": "Sale of finished goods",
  "07": "Sale of capital goods",
  "08": "Sale of traded goods",
  "09": "Purchase/Sale of tangible property not covered above",
  "10": "IT enabled services",
  "11": "Software development services",
  "12": "Technical services",
  "13": "Business support services",
  "14": "Research and development services",
  "15": "Other services not covered above",
  "16": "Payment/receipt of royalty for use of trademark/brand/technology",
  "17": "Payment/receipt for use of intellectual property",
  "18": "Lending/borrowing of money",
  "19": "Issuance/subscription of equity shares",
  "20": "Issuance/subscription of preference shares",
  "21": "Issuance/subscription of debentures/bonds",
  "22": "Corporate guarantee",
  "23": "Cost sharing/contribution arrangement",
  "24": "Business restructuring transaction",
  "99": "Any other transaction",
};

// =============================================================================
// TRANSACTION DESCRIPTION PROMPT
// =============================================================================

export const TRANSACTION_DESCRIPTION_PROMPT: PromptTemplate = {
  id: "txn_description_v1",
  version: "1.0.0",
  category: PromptCategory.FORM_3CEB,
  type: PromptType.TRANSACTION_DESCRIPTION,
  name: "Transaction Description Generator",
  description: "Generate comprehensive transaction descriptions for Form 3CEB Part B",

  systemPrompt: `You are a Transfer Pricing expert preparing Form 3CEB transaction descriptions.

Form 3CEB Part B requires detailed description of each international transaction including:
1. Nature and purpose of the transaction
2. Pricing mechanism as per agreement
3. Value of transaction during the year
4. Commercial rationale for the transaction

Your descriptions must:
- Be factually accurate and specific to the transaction
- Use formal, regulatory-appropriate language
- Include relevant commercial context
- Reference the inter-company agreement terms
- Be suitable for filing with Income Tax Department

CRITICAL: Never fabricate agreement terms or financial data. Use only provided information.`,

  userPromptTemplate: `Generate Form 3CEB transaction description:

═══════════════════════════════════════════════════════════════════════════════
TRANSACTION DETAILS
═══════════════════════════════════════════════════════════════════════════════
Serial Number: {{serialNumber}}
Nature Code: {{natureCode}}
Nature Description: {{natureDescription}}

PARTIES:
- Indian Entity: {{indianEntity}}
- Associated Enterprise: {{aeName}}
- AE Country: {{aeCountry}}
- Relationship: {{relationship}}

TRANSACTION SPECIFICS:
- Transaction Value: ₹{{transactionValue}} Cr
- Currency of Transaction: {{transactionCurrency}}
- Method Applied: {{methodApplied}}
{{#if agreementDate}}
- Agreement Date: {{agreementDate}}
{{/if}}
{{#if pricingMechanism}}
- Pricing Mechanism: {{pricingMechanism}}
{{/if}}

ADDITIONAL CONTEXT:
{{additionalContext}}

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Transaction Description
═══════════════════════════════════════════════════════════════════════════════

Provide in JSON format:
{
  "natureCode": "{{natureCode}}",
  "shortDescription": "One-line description (max 100 chars)",
  "detailedDescription": "Detailed description (2-3 paragraphs) suitable for Form 3CEB",
  "commercialRationale": "Business/commercial reason for this transaction",
  "pricingMechanism": "How the price/fee is determined as per agreement",
  "armLengthJustification": "Brief justification for arm's length nature",
  "keyTerms": {
    "paymentTerms": "Description of payment terms",
    "deliveryTerms": "Description of delivery/service terms",
    "otherMaterialTerms": "Any other material terms"
  },
  "documentationReference": "Reference to supporting agreement/documentation"
}`,

  variables: [
    "serialNumber",
    "natureCode",
    "natureDescription",
    "indianEntity",
    "aeName",
    "aeCountry",
    "relationship",
    "transactionValue",
    "transactionCurrency",
    "methodApplied",
    "agreementDate",
    "pricingMechanism",
    "additionalContext",
  ],

  outputFormat: "json",

  expectedOutputSchema: {
    type: "object",
    required: ["natureCode", "shortDescription", "detailedDescription", "commercialRationale"],
    properties: {
      natureCode: { type: "string" },
      shortDescription: { type: "string", maxLength: 100 },
      detailedDescription: { type: "string" },
      commercialRationale: { type: "string" },
    },
  },

  qualityChecks: [
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Description Completeness",
      description: "All required elements present",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Regulatory Language",
      description: "Formal language suitable for Form 3CEB",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Data Consistency",
      description: "Description matches provided transaction details",
      weight: 0.2,
      required: true,
    },
    {
      type: QualityCheckType.HALLUCINATION_DETECTION,
      name: "Fabrication Check",
      description: "No fabricated terms or values",
      weight: 0.2,
      required: true,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// METHOD JUSTIFICATION PROMPT
// =============================================================================

export const METHOD_JUSTIFICATION_PROMPT: PromptTemplate = {
  id: "method_justification_v1",
  version: "1.0.0",
  category: PromptCategory.FORM_3CEB,
  type: PromptType.METHOD_JUSTIFICATION,
  name: "TP Method Selection Justification",
  description: "Generate comprehensive method selection justification per Section 92C",

  systemPrompt: `You are a Transfer Pricing expert justifying the selection of Most Appropriate Method (MAM) under Section 92C.

REGULATORY FRAMEWORK:
- Section 92C(1): Lists six prescribed methods - CUP, RPM, CPM, PSM, TNMM, and "such other method"
- Rule 10C: Criteria for determining MAM - nature of transaction, class of transactions, availability of reliable data
- Rule 10B: Comparability factors to be considered

METHOD SELECTION PRINCIPLES:
1. CUP is generally preferred where comparable data exists
2. RPM/CPM preferred for distribution/manufacturing with routine functions
3. TNMM most common for service transactions and where tested party is routine
4. PSM appropriate for highly integrated operations or unique intangibles
5. Selection must be based on functional analysis and data availability

Your justification must:
- Explain why selected method is most appropriate for THIS transaction
- Provide specific reasons for rejecting other methods
- Reference Rule 10C selection criteria
- Justify the Profit Level Indicator (PLI) chosen
- Be defensible before Transfer Pricing Officer (TPO)`,

  userPromptTemplate: `Generate Method Selection Justification:

═══════════════════════════════════════════════════════════════════════════════
TRANSACTION PROFILE
═══════════════════════════════════════════════════════════════════════════════
Transaction Type: {{transactionType}}
Nature Code: {{natureCode}}
Transaction Description: {{transactionDescription}}
Transaction Value: ₹{{transactionValue}} Cr

TESTED PARTY:
- Entity: {{testedParty}}
- Characterization: {{characterization}}
- Functions: {{functions}}
- Assets: {{assets}}
- Risks: {{risks}}

METHOD SELECTED:
- Method: {{selectedMethod}}
- PLI: {{selectedPLI}}

DATA AVAILABILITY:
- Internal CUP available: {{internalCUPAvailable}}
- External CUP available: {{externalCUPAvailable}}
- Comparable companies available: {{comparablesAvailable}}

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Method Justification
═══════════════════════════════════════════════════════════════════════════════

Provide in JSON format:
{
  "selectedMethod": {
    "name": "Full method name",
    "code": "CUP/RPM/CPM/TNMM/PSM/OTHER",
    "rule10CReference": "Specific rule reference"
  },
  "selectionRationale": [
    "Primary reason for selection",
    "Supporting reason 1",
    "Supporting reason 2"
  ],
  "testedPartyJustification": "Why this entity is the tested party",
  "pliSelected": {
    "pli": "OP/OC or other PLI",
    "justification": "Why this PLI is appropriate"
  },
  "rejectedMethods": [
    {
      "method": "CUP",
      "reason": "Specific reason for rejection"
    },
    {
      "method": "RPM",
      "reason": "Specific reason for rejection"
    },
    {
      "method": "CPM",
      "reason": "Specific reason for rejection"
    },
    {
      "method": "PSM",
      "reason": "Specific reason for rejection"
    }
  ],
  "regulatoryReferences": ["Section 92C(1)", "Rule 10B(1)(e)", "Rule 10C"],
  "oecdGuidanceReference": "Relevant OECD TP Guidelines paragraph if applicable",
  "narrativeJustification": "2-3 paragraph formal justification suitable for TP documentation"
}`,

  variables: [
    "transactionType",
    "natureCode",
    "transactionDescription",
    "transactionValue",
    "testedParty",
    "characterization",
    "functions",
    "assets",
    "risks",
    "selectedMethod",
    "selectedPLI",
    "internalCUPAvailable",
    "externalCUPAvailable",
    "comparablesAvailable",
  ],

  outputFormat: "json",

  expectedOutputSchema: {
    type: "object",
    required: ["selectedMethod", "selectionRationale", "rejectedMethods", "narrativeJustification"],
    properties: {
      selectedMethod: { type: "object" },
      selectionRationale: { type: "array" },
      rejectedMethods: { type: "array" },
      narrativeJustification: { type: "string" },
    },
  },

  qualityChecks: [
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Section 92C Compliance",
      description: "Proper regulatory references",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Rejection Analysis",
      description: "All methods properly analyzed",
      weight: 0.3,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "FAR Alignment",
      description: "Justification consistent with functional profile",
      weight: 0.2,
      required: true,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Documentation Quality",
      description: "Suitable for regulatory submission",
      weight: 0.2,
      required: false,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// VALIDATION SUGGESTION PROMPT
// =============================================================================

export const VALIDATION_SUGGESTION_PROMPT: PromptTemplate = {
  id: "validation_suggestion_v1",
  version: "1.0.0",
  category: PromptCategory.FORM_3CEB,
  type: PromptType.VALIDATION_SUGGESTION,
  name: "Form 3CEB Validation Suggestion",
  description: "Generate contextual validation suggestions for Form 3CEB errors",

  systemPrompt: `You are a Form 3CEB expert providing guidance on validation errors.

Your suggestions must:
1. Explain the regulatory requirement behind the validation
2. Provide specific remediation steps
3. Include examples where helpful
4. Reference relevant rules or guidelines
5. Be actionable and specific, not generic

Consider the context of the entire form when providing suggestions.`,

  userPromptTemplate: `Provide validation suggestion for Form 3CEB error:

ERROR DETAILS:
- Field: {{fieldName}}
- Section: {{section}}
- Current Value: {{currentValue}}
- Validation Error: {{validationError}}
- Severity: {{severity}}

FORM CONTEXT:
- Entity: {{entityName}}
- Assessment Year: {{assessmentYear}}
- Transaction Type: {{transactionType}}

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate Contextual Suggestion
═══════════════════════════════════════════════════════════════════════════════

Provide in JSON format:
{
  "regulatoryRequirement": "Why this field/validation exists",
  "remediation": {
    "steps": ["Step 1", "Step 2", "..."],
    "example": "Example of correct value/format"
  },
  "commonMistakes": ["Common mistake 1", "..."],
  "reference": "Relevant rule or guideline reference",
  "urgency": "Critical/High/Medium/Low",
  "impactIfNotFixed": "Consequence of not fixing this error"
}`,

  variables: [
    "fieldName",
    "section",
    "currentValue",
    "validationError",
    "severity",
    "entityName",
    "assessmentYear",
    "transactionType",
  ],

  outputFormat: "json",

  qualityChecks: [
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Actionable Steps",
      description: "Specific remediation provided",
      weight: 0.4,
      required: true,
    },
    {
      type: QualityCheckType.REGULATORY_REFERENCE,
      name: "Regulatory Basis",
      description: "Proper rule reference",
      weight: 0.3,
      required: false,
    },
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Clear Language",
      description: "Understandable guidance",
      weight: 0.3,
      required: false,
    },
  ],

  createdAt: "2025-01-29T00:00:00Z",
  updatedAt: "2025-01-29T00:00:00Z",
};

// =============================================================================
// EXPORT ALL FORM 3CEB PROMPTS
// =============================================================================

export const FORM_3CEB_PROMPTS = {
  transactionDescription: TRANSACTION_DESCRIPTION_PROMPT,
  methodJustification: METHOD_JUSTIFICATION_PROMPT,
  validationSuggestion: VALIDATION_SUGGESTION_PROMPT,
};
