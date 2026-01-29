/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * AI-Enhanced Safe Harbour Service
 *
 * This module extends the Safe Harbour Calculator with AI-powered:
 * - Detailed recommendation narratives
 * - Gap analysis with remediation strategies
 * - Form 3CEFA narrative generation
 * ================================================================================
 */

import {
  SafeHarbourCalculator,
  FinancialData,
  BatchSummary,
  CreditRating,
  Currency,
} from "./safe-harbour-engine";

import { SafeHarbourTransactionType } from "./types";
import { SAFE_HARBOUR_RULES } from "./constants/safe-harbour-rules";

import {
  getTPDocumentGenerator,
  TPDocumentGenerator,
  AIConfig,
  AIResponse,
  SafeHarbourRecommendation,
} from "../ai";

// =============================================================================
// AI-ENHANCED SAFE HARBOUR SERVICE
// =============================================================================

export class SafeHarbourAIService {
  private calculator: SafeHarbourCalculator;
  private aiGenerator: TPDocumentGenerator;
  private assessmentYear: string;

  constructor(assessmentYear: string = "2025-26", aiConfig?: Partial<AIConfig>) {
    this.assessmentYear = assessmentYear;
    this.calculator = new SafeHarbourCalculator(assessmentYear);
    this.aiGenerator = getTPDocumentGenerator(aiConfig);
  }

  /**
   * Calculate eligibility with AI-enhanced recommendation
   */
  async calculateWithAIRecommendation(
    transactionType: SafeHarbourTransactionType,
    financialData: FinancialData,
    entityName: string
  ): Promise<SafeHarbourEnhancedResult> {
    // First, get the standard calculation result
    const baseResult = this.calculator.calculateEligibility(transactionType, financialData);

    // Prepare AI parameters
    const aiParams = this.prepareAIParams(transactionType, financialData, baseResult, entityName);

    // Generate AI recommendation
    let aiRecommendation: AIResponse & { parsedRecommendation?: SafeHarbourRecommendation };
    try {
      aiRecommendation = await this.aiGenerator.generateSafeHarbourRecommendation(aiParams);
    } catch (error) {
      // If AI fails, return base result with error note
      return {
        ...baseResult,
        aiEnhanced: false,
        aiError: error instanceof Error ? error.message : "AI generation failed",
        enhancedRecommendation: baseResult.recommendation,
        actionItems: this.getDefaultActionItems(baseResult.meetsSafeHarbour),
        regulatoryBasis: this.getRegulatoryBasis(transactionType),
        riskAssessment: this.getDefaultRiskAssessment(baseResult),
      };
    }

    // Merge AI response with base result
    return this.mergeResults(baseResult, aiRecommendation, transactionType);
  }

  /**
   * Generate detailed gap analysis with AI
   */
  async generateGapAnalysis(
    transactionType: SafeHarbourTransactionType,
    financialData: FinancialData
  ): Promise<GapAnalysisResult> {
    const baseResult = this.calculator.calculateEligibility(transactionType, financialData);

    if (baseResult.meetsSafeHarbour) {
      return {
        hasGap: false,
        message: "Transaction already meets Safe Harbour requirements",
        currentMargin: baseResult.actualMargin || 0,
        requiredMargin: baseResult.requiredMargin || 0,
        gap: 0,
        strategies: [],
      };
    }

    const gap = (baseResult.requiredMargin || 0) - (baseResult.actualMargin || 0);
    const metricType = this.getMetricType(transactionType);

    try {
      const aiResponse = await this.aiGenerator.generateGapAnalysis({
        transactionType: this.getTransactionTypeName(transactionType),
        metricType,
        currentValue: baseResult.actualMargin || 0,
        requiredThreshold: baseResult.requiredMargin || 0,
        gap,
        operatingCost: financialData.totalOperatingCost,
        operatingRevenue: financialData.operatingRevenue,
        operatingProfit: financialData.operatingRevenue - financialData.totalOperatingCost,
      });

      if (aiResponse.success && aiResponse.parsedContent) {
        const parsed = aiResponse.parsedContent as {
          gapQuantification?: { additionalProfitRequired?: number };
          remediationStrategies?: Array<{
            strategy: string;
            description: string;
            financialImpact: string;
            feasibility: string;
          }>;
          recommendedApproach?: { primary: string; rationale: string };
        };

        return {
          hasGap: true,
          currentMargin: baseResult.actualMargin || 0,
          requiredMargin: baseResult.requiredMargin || 0,
          gap,
          additionalProfitRequired: parsed.gapQuantification?.additionalProfitRequired || 0,
          strategies: parsed.remediationStrategies || [],
          recommendedApproach: parsed.recommendedApproach,
          aiGenerated: true,
        };
      }
    } catch {
      // Fall through to default response
    }

    // Default response if AI fails
    return {
      hasGap: true,
      currentMargin: baseResult.actualMargin || 0,
      requiredMargin: baseResult.requiredMargin || 0,
      gap,
      additionalProfitRequired: this.calculateAdditionalProfit(
        gap,
        financialData.totalOperatingCost
      ),
      strategies: this.getDefaultStrategies(transactionType, gap, financialData),
      aiGenerated: false,
    };
  }

  /**
   * Generate Form 3CEFA narrative content
   */
  async generateForm3CEFANarrative(
    transactionType: SafeHarbourTransactionType,
    financialData: FinancialData,
    entityDetails: {
      entityName: string;
      entityPAN: string;
      aeName: string;
      aeCountry: string;
    }
  ): Promise<Form3CEFANarrativeResult> {
    const baseResult = this.calculator.calculateEligibility(transactionType, financialData);

    if (!baseResult.meetsSafeHarbour) {
      return {
        canGenerate: false,
        reason: "Transaction does not meet Safe Harbour requirements",
      };
    }

    const rule = SAFE_HARBOUR_RULES[transactionType];

    try {
      const aiResponse = await this.aiGenerator.generateSafeHarbourRecommendation({
        transactionType: this.getTransactionTypeName(transactionType),
        assessmentYear: this.assessmentYear,
        entityName: entityDetails.entityName,
        operatingRevenue: financialData.operatingRevenue,
        operatingCost: financialData.totalOperatingCost,
        operatingProfit: financialData.operatingRevenue - financialData.totalOperatingCost,
        employeeCost: financialData.employeeCost,
        currentMargin: baseResult.actualMargin || 0,
        requiredThreshold: baseResult.requiredMargin || 0,
        gap: (baseResult.actualMargin || 0) - (baseResult.requiredMargin || 0),
      });

      // Generate declaration statements
      const declarationStatement = `I/We, ${entityDetails.entityName} (PAN: ${entityDetails.entityPAN}), hereby opt for the Safe Harbour provisions under Rule 10TD read with Rule 10TE of the Income Tax Rules, 1962, for the assessment year ${this.assessmentYear}, in respect of the eligible international transaction(s) with ${entityDetails.aeName}, ${entityDetails.aeCountry}.`;

      const complianceConfirmation = `It is confirmed that the international transaction pertaining to ${rule.name} meets all conditions specified under Rule 10TD(2) and the operating profit margin of ${(baseResult.actualMargin || 0).toFixed(2)}% on operating costs is not less than the prescribed margin of ${baseResult.requiredMargin}%.`;

      const undertaking = `I/We undertake to maintain and furnish the prescribed information and documents as required under the Safe Harbour Rules and will comply with all conditions specified therein throughout the relevant assessment year.`;

      return {
        canGenerate: true,
        narrative: {
          declarationStatement,
          transactionDescription: `${rule.name} services provided to ${entityDetails.aeName}, a related entity in ${entityDetails.aeCountry}, with aggregate transaction value of Rs. ${(financialData.transactionValue / 10000000).toFixed(2)} Cr.`,
          complianceConfirmation,
          undertaking,
          regulatoryReference: `${rule.section} - ${rule.name}`,
          marginDetails: {
            achieved: baseResult.actualMargin || 0,
            required: baseResult.requiredMargin || 0,
            marginType: rule.marginType,
          },
        },
        aiEnhanced: aiResponse.success,
        qualityScore: aiResponse.qualityScore,
      };
    } catch (error) {
      return {
        canGenerate: true,
        narrative: {
          declarationStatement: `Declaration for Safe Harbour opt-in for ${entityDetails.entityName}`,
          transactionDescription: `${rule.name} with ${entityDetails.aeName}`,
          complianceConfirmation: "Margin requirements met as per Rule 10TD",
          undertaking: "Standard undertaking as per Rule 10TE",
          regulatoryReference: rule.section,
          marginDetails: {
            achieved: baseResult.actualMargin || 0,
            required: baseResult.requiredMargin || 0,
            marginType: rule.marginType,
          },
        },
        aiEnhanced: false,
        error: error instanceof Error ? error.message : "AI generation failed",
      };
    }
  }

  /**
   * Batch process with AI recommendations
   */
  async processBatchWithAI(
    transactions: Array<{
      transactionType: SafeHarbourTransactionType;
      financialData: FinancialData;
      entityName: string;
    }>
  ): Promise<{
    results: SafeHarbourEnhancedResult[];
    summary: BatchSummary;
  }> {
    const results: SafeHarbourEnhancedResult[] = [];

    for (const txn of transactions) {
      const result = await this.calculateWithAIRecommendation(
        txn.transactionType,
        txn.financialData,
        txn.entityName
      );
      results.push(result);
    }

    // Generate batch summary from base calculator
    const baseResults = results.map((r) => ({
      eligible: r.meetsSafeHarbour,
      transactionType: r.transactionType || SafeHarbourTransactionType.IT_ITES,
      currentValue: r.actualMargin || 0,
      requiredValue: r.requiredMargin || 0,
      gap: r.marginGap || 0,
      marginType: "percentage" as const,
      recommendation: r.recommendation,
      details: {},
    }));

    const summary = this.calculator.getBatchSummary(baseResults);

    return { results, summary };
  }

  // ===========================================================================
  // PRIVATE HELPER METHODS
  // ===========================================================================

  private prepareAIParams(
    transactionType: SafeHarbourTransactionType,
    financialData: FinancialData,
    baseResult: ReturnType<SafeHarbourCalculator["calculateEligibility"]>,
    entityName: string
  ) {
    return {
      transactionType: this.getTransactionTypeName(transactionType),
      assessmentYear: this.assessmentYear,
      entityName,
      operatingRevenue: financialData.operatingRevenue,
      operatingCost: financialData.totalOperatingCost,
      operatingProfit: financialData.operatingRevenue - financialData.totalOperatingCost,
      employeeCost: financialData.employeeCost,
      loanAmount: financialData.loanAmount,
      loanCurrency: financialData.loanCurrency?.toString(),
      creditRating: financialData.creditRating?.toString(),
      guaranteeAmount: financialData.guaranteeAmount,
      currentMargin: baseResult.actualMargin || 0,
      requiredThreshold: baseResult.requiredMargin || baseResult.requiredInterestRate || 0,
      gap: baseResult.marginGap || 0,
    };
  }

  private mergeResults(
    baseResult: ReturnType<SafeHarbourCalculator["calculateEligibility"]>,
    aiResponse: AIResponse & { parsedRecommendation?: SafeHarbourRecommendation },
    transactionType: SafeHarbourTransactionType
  ): SafeHarbourEnhancedResult {
    const parsed = aiResponse.parsedRecommendation;

    return {
      ...baseResult,
      transactionType,
      aiEnhanced: aiResponse.success,
      enhancedRecommendation: parsed?.recommendation || baseResult.recommendation,
      actionItems: parsed?.actionItems || this.getDefaultActionItems(baseResult.meetsSafeHarbour),
      regulatoryBasis: parsed?.regulatoryBasis || this.getRegulatoryBasis(transactionType),
      riskAssessment: parsed?.riskAssessment || this.getDefaultRiskAssessment(baseResult),
      form3cefaImplication: parsed?.form3cefaImplication,
      alternativeStrategies: (parsed as unknown as { alternativeStrategies?: Array<{ strategy: string; impact: string }> })?.alternativeStrategies,
      qualityScore: aiResponse.qualityScore,
      aiMetadata: {
        promptVersion: aiResponse.metadata.promptVersion,
        generatedAt: aiResponse.metadata.timestamp,
        tokensUsed: aiResponse.metadata.tokensUsed,
        latencyMs: aiResponse.metadata.latencyMs,
      },
    };
  }

  private getTransactionTypeName(type: SafeHarbourTransactionType): string {
    const names: Record<SafeHarbourTransactionType, string> = {
      [SafeHarbourTransactionType.IT_ITES]: "IT/ITeS Services",
      [SafeHarbourTransactionType.KPO]: "Knowledge Process Outsourcing",
      [SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE]: "Contract R&D - Software",
      [SafeHarbourTransactionType.CONTRACT_RD_PHARMA]: "Contract R&D - Pharmaceutical",
      [SafeHarbourTransactionType.AUTO_ANCILLARY]: "Auto Component Manufacturing",
      [SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY]: "Intra-Group Loan - Foreign Currency",
      [SafeHarbourTransactionType.LOAN_INR]: "Intra-Group Loan - INR",
      [SafeHarbourTransactionType.CORPORATE_GUARANTEE]: "Corporate Guarantee",
    };
    return names[type] || type;
  }

  private getMetricType(type: SafeHarbourTransactionType): string {
    if (type === SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY ||
        type === SafeHarbourTransactionType.LOAN_INR) {
      return "Interest Rate";
    }
    if (type === SafeHarbourTransactionType.CORPORATE_GUARANTEE) {
      return "Commission Rate";
    }
    return "OP/OC";
  }

  private getRegulatoryBasis(type: SafeHarbourTransactionType): string {
    const rule = SAFE_HARBOUR_RULES[type];
    return `${rule.section} read with Rules 10TD, 10TE, and 10TF of Income Tax Rules, 1962`;
  }

  private getDefaultActionItems(eligible: boolean): string[] {
    if (eligible) {
      return [
        "Maintain contemporaneous documentation as per Rule 10D",
        "Ensure all conditions under Rule 10TD(2) are satisfied",
        "File Form 3CEFA before return filing due date",
        "Preserve supporting documents for 8 years from end of relevant AY",
      ];
    }
    return [
      "Prepare comprehensive Transfer Pricing documentation",
      "Conduct benchmarking study to determine arm's length price",
      "Consider adjusting intercompany pricing for future transactions",
      "Document functional analysis thoroughly",
    ];
  }

  private getDefaultRiskAssessment(
    baseResult: ReturnType<SafeHarbourCalculator["calculateEligibility"]>
  ): { level: "low" | "medium" | "high"; factors: string[] } {
    if (baseResult.meetsSafeHarbour) {
      return {
        level: "low",
        factors: ["Transaction meets Safe Harbour requirements", "Reduced scrutiny from TPO"],
      };
    }
    const gap = baseResult.marginGap || 0;
    if (gap > -5) {
      return {
        level: "medium",
        factors: [
          "Close to Safe Harbour threshold",
          "May attract TPO scrutiny",
          "Consider margin improvement",
        ],
      };
    }
    return {
      level: "high",
      factors: [
        "Significant gap from Safe Harbour threshold",
        "High likelihood of TPO adjustment",
        "Requires robust benchmarking documentation",
      ],
    };
  }

  private getDefaultStrategies(
    _type: SafeHarbourTransactionType,
    gap: number,
    financialData: FinancialData
  ) {
    const additionalProfit = (gap / 100) * financialData.totalOperatingCost;
    return [
      {
        strategy: "Revenue Enhancement",
        description: "Renegotiate service fees with associated enterprise",
        financialImpact: `Increase revenue by Rs. ${(additionalProfit / 10000000).toFixed(2)} Cr`,
        feasibility: "Medium",
      },
      {
        strategy: "Cost Optimization",
        description: "Review and optimize operating costs",
        financialImpact: `Reduce costs to improve margin by ${gap.toFixed(2)}%`,
        feasibility: "Medium",
      },
      {
        strategy: "Transfer Pricing Documentation",
        description: "Prepare comprehensive TP documentation as alternative to Safe Harbour",
        financialImpact: "No direct financial impact",
        feasibility: "High",
      },
    ];
  }

  private calculateAdditionalProfit(gap: number, operatingCost: number): number {
    return (gap / 100) * operatingCost;
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface SafeHarbourEnhancedResult {
  isEligible: boolean;
  meetsSafeHarbour: boolean;
  transactionType?: SafeHarbourTransactionType;
  requiredMargin?: number;
  actualMargin?: number;
  requiredInterestRate?: number;
  requiredGuaranteeCommission?: number;
  complianceDetails: string;
  recommendation: string;
  conditions: string[];
  form3cefaData?: Record<string, unknown>;
  marginGap?: number;
  thresholdDetails?: Record<string, unknown>;
  eligibilityReason?: string;

  // AI-enhanced fields
  aiEnhanced: boolean;
  aiError?: string;
  enhancedRecommendation: string;
  actionItems: string[];
  regulatoryBasis: string;
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
  form3cefaImplication?: string;
  alternativeStrategies?: Array<{ strategy: string; impact: string }>;
  qualityScore?: {
    overallScore: number;
    passed: boolean;
    verificationRequired: boolean;
  };
  aiMetadata?: {
    promptVersion: string;
    generatedAt: string;
    tokensUsed: number;
    latencyMs: number;
  };
}

export interface GapAnalysisResult {
  hasGap: boolean;
  message?: string;
  currentMargin: number;
  requiredMargin: number;
  gap: number;
  additionalProfitRequired?: number;
  strategies: Array<{
    strategy: string;
    description: string;
    financialImpact: string;
    feasibility: string;
  }>;
  recommendedApproach?: {
    primary: string;
    rationale: string;
  };
  aiGenerated?: boolean;
}

export interface Form3CEFANarrativeResult {
  canGenerate: boolean;
  reason?: string;
  narrative?: {
    declarationStatement: string;
    transactionDescription: string;
    complianceConfirmation: string;
    undertaking: string;
    regulatoryReference: string;
    marginDetails: {
      achieved: number;
      required: number;
      marginType: string;
    };
  };
  aiEnhanced?: boolean;
  qualityScore?: {
    overallScore: number;
    passed: boolean;
  };
  error?: string;
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createSafeHarbourAIService(
  assessmentYear: string = "2025-26",
  aiConfig?: Partial<AIConfig>
): SafeHarbourAIService {
  return new SafeHarbourAIService(assessmentYear, aiConfig);
}
