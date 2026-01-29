/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Transfer Pricing Document Generator
 *
 * High-level API for generating TP documentation content
 * Integrates with existing engines and prompt store
 * ================================================================================
 */

import { AIService, createAIService } from "./ai-service";
import { getPromptStore, PromptStore } from "./prompts";
import {
  AIConfig,
  AIResponse,
  PromptType,
  SafeHarbourRecommendation,
  MethodJustification,
  TransactionNarrative,
  WorkingCapitalAdjustment,
  ArmLengthConclusion,
  ComparableRejection,
} from "./types";

// =============================================================================
// TP DOCUMENT GENERATOR CLASS
// =============================================================================

export class TPDocumentGenerator {
  private aiService: AIService;
  private promptStore: PromptStore;

  constructor(config?: Partial<AIConfig>) {
    this.aiService = createAIService(config);
    this.promptStore = getPromptStore();
  }

  // ===========================================================================
  // SAFE HARBOUR METHODS
  // ===========================================================================

  /**
   * Generate Safe Harbour eligibility recommendation
   */
  async generateSafeHarbourRecommendation(params: {
    transactionType: string;
    assessmentYear: string;
    entityName: string;
    operatingRevenue?: number;
    operatingCost?: number;
    operatingProfit?: number;
    employeeCost?: number;
    loanAmount?: number;
    loanCurrency?: string;
    creditRating?: string;
    interestRate?: number;
    guaranteeAmount?: number;
    commissionRate?: number;
    currentMargin: number;
    requiredThreshold: number;
    gap: number;
  }): Promise<AIResponse & { parsedRecommendation?: SafeHarbourRecommendation }> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.SAFE_HARBOUR_RECOMMENDATION,
      variables: params,
      context: {
        assessmentYear: params.assessmentYear,
        entityName: params.entityName,
        transactionType: params.transactionType,
        regulatoryFramework: "indian",
      },
    });

    if (!prompt) {
      return {
        success: false,
        content: "",
        error: "Failed to build prompt",
        metadata: {
          provider: this.aiService.getConfig().provider,
          model: this.aiService.getConfig().model,
          promptType: PromptType.SAFE_HARBOUR_RECOMMENDATION,
          promptVersion: "1.0.0",
          requestId: `err_${Date.now()}`,
          tokensUsed: 0,
          latencyMs: 0,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const response = await this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.SAFE_HARBOUR_RECOMMENDATION,
        promptVersion: "1.0.0",
        requestId: `sh_rec_${Date.now()}`,
      },
    });

    return {
      ...response,
      parsedRecommendation: response.parsedContent as SafeHarbourRecommendation | undefined,
    };
  }

  /**
   * Generate Safe Harbour gap analysis
   */
  async generateGapAnalysis(params: {
    transactionType: string;
    metricType: string;
    currentValue: number;
    requiredThreshold: number;
    gap: number;
    operatingCost?: number;
    operatingRevenue?: number;
    operatingProfit?: number;
  }): Promise<AIResponse> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.SAFE_HARBOUR_GAP_ANALYSIS,
      variables: params,
    });

    if (!prompt) {
      return this.createErrorResponse(PromptType.SAFE_HARBOUR_GAP_ANALYSIS, "Failed to build prompt");
    }

    return this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.SAFE_HARBOUR_GAP_ANALYSIS,
        promptVersion: "1.0.0",
        requestId: `sh_gap_${Date.now()}`,
      },
    });
  }

  // ===========================================================================
  // FORM 3CEB METHODS
  // ===========================================================================

  /**
   * Generate transaction description for Form 3CEB
   */
  async generateTransactionDescription(params: {
    serialNumber: number;
    natureCode: string;
    natureDescription: string;
    indianEntity: string;
    aeName: string;
    aeCountry: string;
    relationship: string;
    transactionValue: number;
    transactionCurrency: string;
    methodApplied: string;
    agreementDate?: string;
    pricingMechanism?: string;
    additionalContext?: string;
  }): Promise<AIResponse & { parsedNarrative?: TransactionNarrative }> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.TRANSACTION_DESCRIPTION,
      variables: {
        ...params,
        additionalContext: params.additionalContext || "No additional context provided",
      },
      context: {
        entityName: params.indianEntity,
        transactionType: params.natureDescription,
      },
    });

    if (!prompt) {
      return this.createErrorResponse(PromptType.TRANSACTION_DESCRIPTION, "Failed to build prompt");
    }

    const response = await this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.TRANSACTION_DESCRIPTION,
        promptVersion: "1.0.0",
        requestId: `txn_desc_${Date.now()}`,
      },
    });

    return {
      ...response,
      parsedNarrative: response.parsedContent as TransactionNarrative | undefined,
    };
  }

  /**
   * Generate TP method selection justification
   */
  async generateMethodJustification(params: {
    transactionType: string;
    natureCode: string;
    transactionDescription: string;
    transactionValue: number;
    testedParty: string;
    characterization: string;
    functions: string;
    assets: string;
    risks: string;
    selectedMethod: string;
    selectedPLI: string;
    internalCUPAvailable: boolean;
    externalCUPAvailable: boolean;
    comparablesAvailable: boolean;
  }): Promise<AIResponse & { parsedJustification?: MethodJustification }> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.METHOD_JUSTIFICATION,
      variables: {
        ...params,
        internalCUPAvailable: params.internalCUPAvailable ? "Yes" : "No",
        externalCUPAvailable: params.externalCUPAvailable ? "Yes" : "No",
        comparablesAvailable: params.comparablesAvailable ? "Yes" : "No",
      },
      context: {
        entityName: params.testedParty,
        transactionType: params.transactionType,
        regulatoryFramework: "indian",
      },
    });

    if (!prompt) {
      return this.createErrorResponse(PromptType.METHOD_JUSTIFICATION, "Failed to build prompt");
    }

    const response = await this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.METHOD_JUSTIFICATION,
        promptVersion: "1.0.0",
        requestId: `method_just_${Date.now()}`,
      },
    });

    return {
      ...response,
      parsedJustification: response.parsedContent as MethodJustification | undefined,
    };
  }

  /**
   * Generate contextual validation suggestion
   */
  async generateValidationSuggestion(params: {
    fieldName: string;
    section: string;
    currentValue: string;
    validationError: string;
    severity: string;
    entityName: string;
    assessmentYear: string;
    transactionType?: string;
  }): Promise<AIResponse> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.VALIDATION_SUGGESTION,
      variables: params,
      context: {
        entityName: params.entityName,
        assessmentYear: params.assessmentYear,
        transactionType: params.transactionType,
      },
    });

    if (!prompt) {
      return this.createErrorResponse(PromptType.VALIDATION_SUGGESTION, "Failed to build prompt");
    }

    return this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.VALIDATION_SUGGESTION,
        promptVersion: "1.0.0",
        requestId: `val_sug_${Date.now()}`,
      },
    });
  }

  // ===========================================================================
  // BENCHMARKING METHODS
  // ===========================================================================

  /**
   * Generate working capital adjustment narrative
   */
  async generateWorkingCapitalAdjustment(params: {
    testedPartyName: string;
    financialYear: string;
    revenue: number;
    receivables: number;
    inventory: number;
    payables: number;
    comparableFinancials: string; // JSON or formatted string
    interestRate: number;
    rateBasis: string;
  }): Promise<AIResponse & { parsedAdjustment?: WorkingCapitalAdjustment }> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.WORKING_CAPITAL_ADJUSTMENT,
      variables: params,
      context: {
        entityName: params.testedPartyName,
        financialYear: params.financialYear,
        regulatoryFramework: "indian",
      },
    });

    if (!prompt) {
      return this.createErrorResponse(PromptType.WORKING_CAPITAL_ADJUSTMENT, "Failed to build prompt");
    }

    const response = await this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.WORKING_CAPITAL_ADJUSTMENT,
        promptVersion: "1.0.0",
        requestId: `wc_adj_${Date.now()}`,
      },
    });

    return {
      ...response,
      parsedAdjustment: response.parsedContent as WorkingCapitalAdjustment | undefined,
    };
  }

  /**
   * Generate comparable rejection rationale
   */
  async generateComparableRejection(params: {
    companyName: string;
    companyCIN: string;
    industry: string;
    nicCode: string;
    financialData: string;
    businessDescription: string;
    annualReportObservations: string;
    testedPartyIndustry: string;
    testedPartyFunctions: string;
    testedPartyRevenue: number;
    rejectionCategory: string;
  }): Promise<AIResponse & { parsedRejection?: ComparableRejection }> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.COMPARABLE_REJECTION,
      variables: params,
    });

    if (!prompt) {
      return this.createErrorResponse(PromptType.COMPARABLE_REJECTION, "Failed to build prompt");
    }

    const response = await this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.COMPARABLE_REJECTION,
        promptVersion: "1.0.0",
        requestId: `comp_rej_${Date.now()}`,
      },
    });

    return {
      ...response,
      parsedRejection: response.parsedContent as ComparableRejection | undefined,
    };
  }

  /**
   * Generate arm's length conclusion
   */
  async generateArmLengthConclusion(params: {
    pliType: string;
    financialYears: string;
    numberOfComparables: number;
    comparableMargins: string; // JSON or formatted string
    percentile35: number;
    median: number;
    percentile65: number;
    arithmeticMean: number;
    testedPartyName: string;
    testedPartyMargin: number;
    operatingCost: number;
    operatingRevenue: number;
  }): Promise<AIResponse & { parsedConclusion?: ArmLengthConclusion }> {
    const prompt = this.promptStore.buildPrompt({
      promptType: PromptType.ARM_LENGTH_CONCLUSION,
      variables: params,
      context: {
        entityName: params.testedPartyName,
        financialYear: params.financialYears,
        regulatoryFramework: "indian",
      },
    });

    if (!prompt) {
      return this.createErrorResponse(PromptType.ARM_LENGTH_CONCLUSION, "Failed to build prompt");
    }

    const response = await this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType: PromptType.ARM_LENGTH_CONCLUSION,
        promptVersion: "1.0.0",
        requestId: `al_conc_${Date.now()}`,
      },
    });

    return {
      ...response,
      parsedConclusion: response.parsedContent as ArmLengthConclusion | undefined,
    };
  }

  // ===========================================================================
  // GENERIC PROMPT METHODS (for Tier 2 AI services)
  // ===========================================================================

  /**
   * Generate content using any registered prompt type
   * This is a generic method for Tier 2 AI services to use custom prompts
   */
  async generateCustomPrompt(
    promptType: PromptType,
    variables: Record<string, string | number | boolean | object | undefined>,
    context?: {
      assessmentYear?: string;
      entityName?: string;
      entityType?: string;
      transactionType?: string;
      financialYear?: string;
      regulatoryFramework?: "indian" | "oecd";
    }
  ): Promise<AIResponse> {
    const template = this.promptStore.getPrompt(promptType);
    if (!template) {
      return this.createErrorResponse(
        promptType,
        `Prompt template not found for type: ${promptType}`
      );
    }

    // Filter out undefined values to match PromptInput type requirements
    const filteredVariables = Object.fromEntries(
      Object.entries(variables).filter(([, v]) => v !== undefined)
    ) as Record<string, string | number | boolean | object>;

    const prompt = this.promptStore.buildPrompt({
      promptType,
      variables: filteredVariables,
      context,
    });

    if (!prompt) {
      return this.createErrorResponse(promptType, "Failed to build prompt");
    }

    return this.aiService.generate({
      prompt: prompt.userPrompt,
      systemPrompt: prompt.systemPrompt,
      metadata: {
        promptType,
        promptVersion: template.version,
        requestId: `custom_${promptType}_${Date.now()}`,
      },
    });
  }

  /**
   * Check if a prompt type is available
   */
  isPromptAvailable(promptType: PromptType): boolean {
    return this.promptStore.getPrompt(promptType) !== undefined;
  }

  /**
   * Get prompt metadata for a given type
   */
  getPromptMetadata(promptType: PromptType) {
    return this.promptStore.getPromptMetadata(promptType);
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Create error response
   */
  private createErrorResponse(promptType: PromptType, error: string): AIResponse {
    return {
      success: false,
      content: "",
      error,
      metadata: {
        provider: this.aiService.getConfig().provider,
        model: this.aiService.getConfig().model,
        promptType,
        promptVersion: "1.0.0",
        requestId: `err_${Date.now()}`,
        tokensUsed: 0,
        latencyMs: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Update AI configuration
   */
  setConfig(config: Partial<AIConfig>): void {
    this.aiService.setConfig(config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConfig {
    return this.aiService.getConfig();
  }

  /**
   * List available prompt types
   */
  listAvailablePrompts() {
    return this.promptStore.listPrompts();
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

let generatorInstance: TPDocumentGenerator | null = null;

export function getTPDocumentGenerator(config?: Partial<AIConfig>): TPDocumentGenerator {
  if (!generatorInstance) {
    generatorInstance = new TPDocumentGenerator(config);
  } else if (config) {
    generatorInstance.setConfig(config);
  }
  return generatorInstance;
}

export function createTPDocumentGenerator(config?: Partial<AIConfig>): TPDocumentGenerator {
  return new TPDocumentGenerator(config);
}
