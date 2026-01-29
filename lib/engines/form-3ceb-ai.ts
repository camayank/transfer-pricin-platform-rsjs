/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * AI-Enhanced Form 3CEB Service
 *
 * This module extends the Form 3CEB Builder and Validator with AI-powered:
 * - Transaction description generation
 * - Method selection justification
 * - Validation suggestion enhancement
 * - Comparable search process narratives
 * ================================================================================
 */

import {
  Form3CEBBuilder,
  Form3CEBValidator,
  Form3CEB,
  InternationalTransaction,
  AssociatedEnterprise,
  TransactionNature,
  TPMethod,
  RelationshipType,
  ValidationResult,
  ValidationSeverity,
  TRANSACTION_NATURE_DESCRIPTIONS,
} from "./form-3ceb-engine";

import {
  getTPDocumentGenerator,
  TPDocumentGenerator,
  AIConfig,
  AIResponse,
  TransactionNarrative,
  MethodJustification,
} from "../ai";

// =============================================================================
// INTERNAL TYPES
// =============================================================================

/**
 * Internal type for basic method justification with extended properties
 */
interface InternalMethodJustification {
  selectedMethod: {
    name: string;
    code: string;
    rule10CReference: string;
  };
  selectionRationale: string[];
  testedPartyJustification: string;
  pliSelected: {
    pli: string;
    justification: string;
  };
  rejectedMethods: Array<{ method: string; reason: string }>;
  regulatoryReferences: string[];
  narrativeJustification: string;
}

// =============================================================================
// AI-ENHANCED FORM 3CEB SERVICE
// =============================================================================

export class Form3CEBAIService {
  private builder: Form3CEBBuilder;
  private validator: Form3CEBValidator;
  private aiGenerator: TPDocumentGenerator;
  private assessmentYear: string;

  constructor(assessmentYear: string = "2025-26", aiConfig?: Partial<AIConfig>) {
    this.assessmentYear = assessmentYear;
    this.builder = new Form3CEBBuilder();
    this.validator = new Form3CEBValidator();
    this.aiGenerator = getTPDocumentGenerator(aiConfig);
  }

  // ===========================================================================
  // TRANSACTION DESCRIPTION GENERATION
  // ===========================================================================

  /**
   * Generate AI-enhanced transaction description
   */
  async generateTransactionDescription(params: {
    serialNumber: number;
    natureCode: TransactionNature;
    indianEntity: string;
    aeName: string;
    aeCountry: string;
    relationship: RelationshipType;
    transactionValue: number;
    transactionCurrency?: string;
    methodApplied: TPMethod;
    agreementDate?: string;
    pricingMechanism?: string;
    additionalContext?: string;
  }): Promise<TransactionDescriptionResult> {
    const natureDescription =
      TRANSACTION_NATURE_DESCRIPTIONS[params.natureCode] || "Other transaction";

    try {
      const response = await this.aiGenerator.generateTransactionDescription({
        serialNumber: params.serialNumber,
        natureCode: params.natureCode,
        natureDescription,
        indianEntity: params.indianEntity,
        aeName: params.aeName,
        aeCountry: params.aeCountry,
        relationship: this.getRelationshipDescription(params.relationship),
        transactionValue: params.transactionValue / 10000000, // Convert to Cr
        transactionCurrency: params.transactionCurrency || "INR",
        methodApplied: params.methodApplied,
        agreementDate: params.agreementDate,
        pricingMechanism: params.pricingMechanism,
        additionalContext: params.additionalContext,
      });

      if (response.success && response.parsedNarrative) {
        return {
          success: true,
          aiGenerated: true,
          narrative: response.parsedNarrative,
          qualityScore: response.qualityScore?.overallScore,
          verificationRequired: response.qualityScore?.verificationRequired || false,
        };
      }

      // Fallback to basic description
      return {
        success: true,
        aiGenerated: false,
        narrative: this.generateBasicDescription(params, natureDescription),
      };
    } catch (error) {
      return {
        success: true,
        aiGenerated: false,
        narrative: this.generateBasicDescription(params, natureDescription),
        error: error instanceof Error ? error.message : "AI generation failed",
      };
    }
  }

  /**
   * Generate descriptions for all transactions in a form
   */
  async generateAllTransactionDescriptions(
    form: Form3CEB,
    indianEntity: string
  ): Promise<Map<number, TransactionDescriptionResult>> {
    const results = new Map<number, TransactionDescriptionResult>();

    for (const txn of form.partB.internationalTransactions) {
      const ae = form.associatedEnterprises.find((a) => a.aeReference === txn.aeReference);

      const result = await this.generateTransactionDescription({
        serialNumber: txn.slNo,
        natureCode: txn.natureOfTransaction,
        indianEntity,
        aeName: txn.aeName,
        aeCountry: txn.aeCountry,
        relationship: ae?.relationshipType || RelationshipType.OTHER,
        transactionValue: txn.valueAsPerBooks,
        methodApplied: txn.methodUsed,
      });

      results.set(txn.slNo, result);
    }

    return results;
  }

  // ===========================================================================
  // METHOD JUSTIFICATION GENERATION
  // ===========================================================================

  /**
   * Generate AI-enhanced method selection justification
   */
  async generateMethodJustification(params: {
    transactionType: string;
    natureCode: TransactionNature;
    transactionDescription: string;
    transactionValue: number;
    testedParty: string;
    characterization: string;
    functions: string;
    assets: string;
    risks: string;
    selectedMethod: TPMethod;
    selectedPLI?: string;
    internalCUPAvailable?: boolean;
    externalCUPAvailable?: boolean;
    comparablesAvailable?: boolean;
  }): Promise<MethodJustificationResult> {
    try {
      const response = await this.aiGenerator.generateMethodJustification({
        transactionType: params.transactionType,
        natureCode: params.natureCode,
        transactionDescription: params.transactionDescription,
        transactionValue: params.transactionValue / 10000000, // Convert to Cr
        testedParty: params.testedParty,
        characterization: params.characterization,
        functions: params.functions,
        assets: params.assets,
        risks: params.risks,
        selectedMethod: params.selectedMethod,
        selectedPLI: params.selectedPLI || this.getDefaultPLI(params.selectedMethod),
        internalCUPAvailable: params.internalCUPAvailable || false,
        externalCUPAvailable: params.externalCUPAvailable || false,
        comparablesAvailable: params.comparablesAvailable ?? true,
      });

      if (response.success && response.parsedJustification) {
        // Use response.content as the narrative since AI MethodJustification may not have narrativeJustification
        const aiJustification = response.parsedJustification as MethodJustification;
        const narrativeText = response.content || aiJustification.selectionRationale?.join("\n") || "";
        return {
          success: true,
          aiGenerated: true,
          justification: aiJustification,
          narrativeText,
          qualityScore: response.qualityScore?.overallScore,
          verificationRequired: response.qualityScore?.verificationRequired || false,
        };
      }

      // Fallback to basic justification
      const basicJustification = this.generateBasicMethodJustification(params);
      return {
        success: true,
        aiGenerated: false,
        justification: basicJustification as unknown as MethodJustification,
        narrativeText: basicJustification.narrativeJustification,
      };
    } catch (error) {
      const basicJustification = this.generateBasicMethodJustification(params);
      return {
        success: true,
        aiGenerated: false,
        justification: basicJustification as unknown as MethodJustification,
        narrativeText: basicJustification.narrativeJustification,
        error: error instanceof Error ? error.message : "AI generation failed",
      };
    }
  }

  // ===========================================================================
  // VALIDATION ENHANCEMENT
  // ===========================================================================

  /**
   * Validate form and enhance suggestions with AI
   */
  async validateWithAISuggestions(
    form: Form3CEB,
    enhanceAll: boolean = false
  ): Promise<EnhancedValidationResult> {
    // First, run standard validation
    const validationResults = this.validator.validateForm(form);
    const summary = this.validator.getSummary();

    if (!enhanceAll && summary.critical === 0 && summary.errors === 0) {
      // No critical issues, return as-is
      return {
        results: validationResults,
        summary,
        aiEnhanced: false,
      };
    }

    // Enhance critical and error suggestions with AI
    const enhancedResults: ValidationResult[] = [];

    for (const result of validationResults) {
      if (
        enhanceAll ||
        result.severity === ValidationSeverity.CRITICAL ||
        result.severity === ValidationSeverity.ERROR
      ) {
        const enhanced = await this.enhanceValidationSuggestion(
          result,
          form.partA.assesseeDetails.name,
          this.assessmentYear
        );
        enhancedResults.push(enhanced);
      } else {
        enhancedResults.push(result);
      }
    }

    return {
      results: enhancedResults,
      summary,
      aiEnhanced: true,
    };
  }

  /**
   * Enhance a single validation suggestion with AI
   */
  private async enhanceValidationSuggestion(
    validation: ValidationResult,
    entityName: string,
    assessmentYear: string
  ): Promise<ValidationResult> {
    try {
      const response = await this.aiGenerator.generateValidationSuggestion({
        fieldName: validation.field,
        section: validation.section,
        currentValue: validation.message,
        validationError: validation.message,
        severity: validation.severity,
        entityName,
        assessmentYear,
      });

      if (response.success && response.parsedContent) {
        const parsed = response.parsedContent as {
          remediation?: { steps?: string[]; example?: string };
          reference?: string;
          impactIfNotFixed?: string;
        };

        const enhancedSuggestion = [
          validation.suggestion || "",
          parsed.remediation?.steps?.join("; ") || "",
          parsed.remediation?.example ? `Example: ${parsed.remediation.example}` : "",
          parsed.reference ? `Reference: ${parsed.reference}` : "",
          parsed.impactIfNotFixed ? `Impact: ${parsed.impactIfNotFixed}` : "",
        ]
          .filter(Boolean)
          .join(" | ");

        return {
          ...validation,
          suggestion: enhancedSuggestion,
        };
      }
    } catch {
      // Return original if AI fails
    }

    return validation;
  }

  // ===========================================================================
  // COMPARABLE SEARCH PROCESS NARRATIVE
  // ===========================================================================

  /**
   * Generate comparable search process narrative for a transaction
   */
  async generateComparableSearchNarrative(params: {
    transactionType: string;
    testedParty: string;
    industry: string;
    nicCode: string;
    searchDatabase: string;
    searchDate: string;
    quantitativeScreens: string[];
    qualitativeScreens: string[];
    companiesFound: number;
    companiesRejected: number;
    finalComparables: number;
  }): Promise<ComparableSearchNarrativeResult> {
    const narrative = `
The comparable search was conducted using ${params.searchDatabase} database on ${params.searchDate}.

SEARCH STRATEGY:
The search was designed to identify companies functionally comparable to ${params.testedParty},
operating in the ${params.industry} sector (NIC Code: ${params.nicCode}).

QUANTITATIVE SCREENING CRITERIA:
${params.quantitativeScreens.map((s) => `- ${s}`).join("\n")}

QUALITATIVE SCREENING CRITERIA:
${params.qualitativeScreens.map((s) => `- ${s}`).join("\n")}

SEARCH RESULTS:
- Initial companies identified: ${params.companiesFound}
- Companies rejected after screening: ${params.companiesRejected}
- Final comparable set: ${params.finalComparables} companies

The comparable search process has been documented with screenshots of the database search
as contemporaneous evidence as required under Rule 10D.
    `.trim();

    return {
      success: true,
      narrative,
      searchSummary: {
        database: params.searchDatabase,
        searchDate: params.searchDate,
        initialCount: params.companiesFound,
        rejectedCount: params.companiesRejected,
        finalCount: params.finalComparables,
      },
    };
  }

  // ===========================================================================
  // FORM BUILDING WITH AI ENHANCEMENT
  // ===========================================================================

  /**
   * Build a transaction with AI-generated descriptions
   */
  async buildTransactionWithAI(
    aeReference: string,
    aeName: string,
    aeCountry: string,
    natureCode: TransactionNature,
    valueAsPerBooks: number,
    valueAsPerALP: number,
    method: TPMethod,
    numberOfComparables: number,
    indianEntity: string,
    testedPartyProfile: {
      characterization: string;
      functions: string;
      assets: string;
      risks: string;
    }
  ): Promise<EnhancedTransactionData> {
    // Generate AI description
    const descriptionResult = await this.generateTransactionDescription({
      serialNumber: 1, // Will be updated when added to form
      natureCode,
      indianEntity,
      aeName,
      aeCountry,
      relationship: RelationshipType.OTHER,
      transactionValue: valueAsPerBooks,
      methodApplied: method,
    });

    // Generate AI method justification
    const justificationResult = await this.generateMethodJustification({
      transactionType: TRANSACTION_NATURE_DESCRIPTIONS[natureCode] || "Transaction",
      natureCode,
      transactionDescription: descriptionResult.narrative.detailedDescription,
      transactionValue: valueAsPerBooks,
      testedParty: indianEntity,
      characterization: testedPartyProfile.characterization,
      functions: testedPartyProfile.functions,
      assets: testedPartyProfile.assets,
      risks: testedPartyProfile.risks,
      selectedMethod: method,
      comparablesAvailable: numberOfComparables > 0,
    });

    return {
      aeReference,
      aeName,
      aeCountry,
      natureCode,
      description: descriptionResult.narrative.detailedDescription,
      shortDescription: descriptionResult.narrative.shortDescription,
      valueAsPerBooks,
      valueAsPerALP,
      method,
      methodJustification: justificationResult.narrativeText,
      numberOfComparables,
      aiGenerated: {
        description: descriptionResult.aiGenerated,
        justification: justificationResult.aiGenerated,
      },
      qualityScores: {
        description: descriptionResult.qualityScore,
        justification: justificationResult.qualityScore,
      },
    };
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private getRelationshipDescription(type: RelationshipType): string {
    const descriptions: Record<RelationshipType, string> = {
      [RelationshipType.HOLDING_COMPANY]: "Holding Company",
      [RelationshipType.SUBSIDIARY]: "Subsidiary",
      [RelationshipType.FELLOW_SUBSIDIARY]: "Fellow Subsidiary",
      [RelationshipType.JOINT_VENTURE]: "Joint Venture",
      [RelationshipType.COMMON_CONTROL]: "Under Common Control",
      [RelationshipType.OTHER]: "Other Related Enterprise",
    };
    return descriptions[type] || "Associated Enterprise";
  }

  private getDefaultPLI(method: TPMethod): string {
    switch (method) {
      case TPMethod.TNMM:
        return "OP/OC";
      case TPMethod.CPM:
        return "Gross Profit Markup";
      case TPMethod.RPM:
        return "Gross Profit Margin";
      case TPMethod.PSM:
        return "Operating Profit Split";
      default:
        return "Price";
    }
  }

  private generateBasicDescription(
    params: {
      natureCode: TransactionNature;
      aeName: string;
      aeCountry: string;
      transactionValue: number;
      methodApplied: TPMethod;
    },
    natureDescription: string
  ): TransactionNarrative {
    const valueCr = (params.transactionValue / 10000000).toFixed(2);

    return {
      natureCode: params.natureCode,
      shortDescription: `${natureDescription} with ${params.aeName}`,
      detailedDescription: `${natureDescription} undertaken with ${params.aeName}, ${params.aeCountry}, an Associated Enterprise of the Company. The aggregate value of the transaction during the previous year was Rs. ${valueCr} Cr. The transaction has been benchmarked using ${params.methodApplied} method.`,
      commercialRationale: `The transaction is undertaken as part of the normal business operations of the Company within the group structure.`,
      pricingMechanism: `Pricing determined as per inter-company agreement`,
      armLengthJustification: `The arm's length nature has been established using ${params.methodApplied} method`,
    };
  }

  private generateBasicMethodJustification(params: {
    selectedMethod: TPMethod;
    testedParty: string;
    characterization: string;
  }): InternalMethodJustification {
    const methodDescriptions: Record<TPMethod, string> = {
      [TPMethod.TNMM]: "Transactional Net Margin Method",
      [TPMethod.CUP]: "Comparable Uncontrolled Price Method",
      [TPMethod.RPM]: "Resale Price Method",
      [TPMethod.CPM]: "Cost Plus Method",
      [TPMethod.PSM]: "Profit Split Method",
      [TPMethod.OTHER]: "Other Method",
    };

    return {
      selectedMethod: {
        name: methodDescriptions[params.selectedMethod],
        code: params.selectedMethod,
        rule10CReference: "Rule 10C of Income Tax Rules",
      },
      selectionRationale: [
        `${params.testedParty} has been identified as the tested party based on functional analysis`,
        `${params.characterization} characterization supports the use of ${params.selectedMethod}`,
        "Reliable comparable data is available in the Indian market",
      ],
      testedPartyJustification: `${params.testedParty} is the least complex entity in the transaction`,
      pliSelected: {
        pli: this.getDefaultPLI(params.selectedMethod),
        justification: "Selected PLI appropriately captures the value of functions performed",
      },
      rejectedMethods: [
        { method: "CUP", reason: "No comparable uncontrolled transactions available" },
        { method: "RPM", reason: "Not applicable for the nature of transaction" },
        { method: "CPM", reason: "Less reliable than TNMM for this transaction" },
        { method: "PSM", reason: "Not applicable as routine functions are performed" },
      ].filter((m) => m.method !== params.selectedMethod),
      regulatoryReferences: ["Section 92C(1)", "Rule 10B", "Rule 10C"],
      narrativeJustification: `${methodDescriptions[params.selectedMethod]} (${params.selectedMethod}) has been selected as the Most Appropriate Method under Section 92C(1) read with Rule 10C. ${params.testedParty}, characterized as ${params.characterization}, has been selected as the tested party based on functional analysis. The method selection is supported by the availability of reliable comparable data in the Indian market.`,
    };
  }

  // ===========================================================================
  // BUILDER ACCESS
  // ===========================================================================

  getBuilder(): Form3CEBBuilder {
    return this.builder;
  }

  getValidator(): Form3CEBValidator {
    return this.validator;
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface TransactionDescriptionResult {
  success: boolean;
  aiGenerated: boolean;
  narrative: TransactionNarrative;
  qualityScore?: number;
  verificationRequired?: boolean;
  error?: string;
}

export interface MethodJustificationResult {
  success: boolean;
  aiGenerated: boolean;
  justification: MethodJustification;
  narrativeText: string;
  qualityScore?: number;
  verificationRequired?: boolean;
  error?: string;
}

export interface EnhancedValidationResult {
  results: ValidationResult[];
  summary: {
    totalIssues: number;
    critical: number;
    errors: number;
    warnings: number;
    info: number;
    canFile: boolean;
    issuesBySection: Record<string, number>;
  };
  aiEnhanced: boolean;
}

export interface ComparableSearchNarrativeResult {
  success: boolean;
  narrative: string;
  searchSummary: {
    database: string;
    searchDate: string;
    initialCount: number;
    rejectedCount: number;
    finalCount: number;
  };
}

export interface EnhancedTransactionData {
  aeReference: string;
  aeName: string;
  aeCountry: string;
  natureCode: TransactionNature;
  description: string;
  shortDescription: string;
  valueAsPerBooks: number;
  valueAsPerALP: number;
  method: TPMethod;
  methodJustification: string;
  numberOfComparables: number;
  aiGenerated: {
    description: boolean;
    justification: boolean;
  };
  qualityScores: {
    description?: number;
    justification?: number;
  };
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createForm3CEBAIService(
  assessmentYear: string = "2025-26",
  aiConfig?: Partial<AIConfig>
): Form3CEBAIService {
  return new Form3CEBAIService(assessmentYear, aiConfig);
}
