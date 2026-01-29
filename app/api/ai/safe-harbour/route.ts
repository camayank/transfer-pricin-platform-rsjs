/**
 * ================================================================================
 * DIGICOMPLY AI API
 * Safe Harbour AI-Enhanced Endpoint
 *
 * POST /api/ai/safe-harbour - Calculate with AI recommendations
 * POST /api/ai/safe-harbour/gap-analysis - Get gap analysis with strategies
 * POST /api/ai/safe-harbour/form-3cefa - Generate Form 3CEFA narratives
 * ================================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createSafeHarbourAIService,
  SafeHarbourEnhancedResult,
  GapAnalysisResult,
  Form3CEFANarrativeResult,
} from "@/lib/engines/safe-harbour-ai";
import { SafeHarbourTransactionType } from "@/lib/engines/types";
import { CreditRating, Currency } from "@/lib/engines/safe-harbour-engine";
import { isAIConfigured } from "@/lib/ai";

// =============================================================================
// Transaction Type Mapping
// =============================================================================

const TRANSACTION_TYPE_MAP: Record<string, SafeHarbourTransactionType> = {
  // IT/ITeS variants
  IT_ITES: SafeHarbourTransactionType.IT_ITES,
  IT_ITES_SERVICES: SafeHarbourTransactionType.IT_ITES,
  it_ites: SafeHarbourTransactionType.IT_ITES,

  // KPO variants
  KPO: SafeHarbourTransactionType.KPO,
  KPO_SERVICES: SafeHarbourTransactionType.KPO,
  kpo: SafeHarbourTransactionType.KPO,

  // Contract R&D Software
  CONTRACT_RD_SOFTWARE: SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
  CONTRACT_RD: SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
  contract_rd_software: SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,

  // Contract R&D Pharma
  CONTRACT_RD_PHARMA: SafeHarbourTransactionType.CONTRACT_RD_PHARMA,
  CONTRACT_RD_GENERIC: SafeHarbourTransactionType.CONTRACT_RD_PHARMA,
  contract_rd_pharma: SafeHarbourTransactionType.CONTRACT_RD_PHARMA,

  // Auto Ancillary
  AUTO_ANCILLARY: SafeHarbourTransactionType.AUTO_ANCILLARY,
  AUTO_ANCILLARY_MANUFACTURING: SafeHarbourTransactionType.AUTO_ANCILLARY,
  auto_ancillary: SafeHarbourTransactionType.AUTO_ANCILLARY,

  // Loan FC
  LOAN_FOREIGN_CURRENCY: SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,
  INTRA_GROUP_LOAN_FC: SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,
  loan_foreign_currency: SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,

  // Loan INR
  LOAN_INR: SafeHarbourTransactionType.LOAN_INR,
  INTRA_GROUP_LOAN: SafeHarbourTransactionType.LOAN_INR,
  INTRA_GROUP_LOAN_INR: SafeHarbourTransactionType.LOAN_INR,
  loan_inr: SafeHarbourTransactionType.LOAN_INR,

  // Corporate Guarantee
  CORPORATE_GUARANTEE: SafeHarbourTransactionType.CORPORATE_GUARANTEE,
  corporate_guarantee: SafeHarbourTransactionType.CORPORATE_GUARANTEE,
};

const CREDIT_RATING_MAP: Record<string, CreditRating> = {
  AAA: CreditRating.AAA,
  AA: CreditRating.AA,
  A: CreditRating.A,
  BBB: CreditRating.BBB,
  BB: CreditRating.BB,
  B: CreditRating.B,
  C: CreditRating.C,
  D: CreditRating.D,
};

const CURRENCY_MAP: Record<string, Currency> = {
  INR: Currency.INR,
  USD: Currency.USD,
  EUR: Currency.EUR,
  GBP: Currency.GBP,
  JPY: Currency.JPY,
};

// =============================================================================
// POST - AI-Enhanced Safe Harbour Calculation
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = "calculate" } = body;

    // Check AI configuration for AI-specific actions
    const aiConfigured = isAIConfigured();

    switch (action) {
      case "calculate":
        return handleCalculate(body, aiConfigured);

      case "gap_analysis":
        return handleGapAnalysis(body, aiConfigured);

      case "form_3cefa":
        return handleForm3CEFA(body, aiConfigured);

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            availableActions: ["calculate", "gap_analysis", "form_3cefa"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Safe Harbour AI API Error:", error);
    return NextResponse.json(
      {
        error: "Safe Harbour calculation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// Action Handlers
// =============================================================================

async function handleCalculate(
  body: Record<string, unknown>,
  aiConfigured: boolean
): Promise<NextResponse> {
  const {
    transactionType,
    assessmentYear = "2025-26",
    entityName = "Entity",
    operatingRevenue,
    operatingCost,
    employeeCost,
    loanAmount,
    creditRating,
    loanCurrency = "INR",
    guaranteeAmount,
    transactionValue,
  } = body;

  // Validate transaction type
  if (!transactionType) {
    return NextResponse.json(
      { error: "Transaction type is required" },
      { status: 400 }
    );
  }

  const mappedType = TRANSACTION_TYPE_MAP[transactionType as string];
  if (!mappedType) {
    return NextResponse.json(
      {
        error: `Invalid transaction type: ${transactionType}`,
        validTypes: Object.keys(TRANSACTION_TYPE_MAP),
      },
      { status: 400 }
    );
  }

  // Prepare financial data
  const financialData = {
    assessmentYear: assessmentYear as string,
    totalRevenue: (operatingRevenue as number) || 0,
    operatingRevenue: (operatingRevenue as number) || 0,
    totalOperatingCost: (operatingCost as number) || 0,
    employeeCost: employeeCost as number | undefined,
    transactionValue: (transactionValue as number) || (operatingRevenue as number) || 0,
    loanAmount: loanAmount as number | undefined,
    creditRating: creditRating
      ? CREDIT_RATING_MAP[creditRating as string]
      : undefined,
    loanCurrency: CURRENCY_MAP[loanCurrency as string] || Currency.INR,
    guaranteeAmount: guaranteeAmount as number | undefined,
  };

  const service = createSafeHarbourAIService(assessmentYear as string);

  // If AI is configured, use AI-enhanced calculation
  if (aiConfigured) {
    const result = await service.calculateWithAIRecommendation(
      mappedType,
      financialData,
      entityName as string
    );

    return NextResponse.json({
      success: true,
      aiEnhanced: result.aiEnhanced,
      result: formatEnhancedResult(result),
    });
  }

  // Fallback to basic calculation without AI
  const basicResult = await service.calculateWithAIRecommendation(
    mappedType,
    financialData,
    entityName as string
  );

  return NextResponse.json({
    success: true,
    aiEnhanced: false,
    message: "AI not configured - using basic calculation",
    result: formatEnhancedResult(basicResult),
  });
}

async function handleGapAnalysis(
  body: Record<string, unknown>,
  aiConfigured: boolean
): Promise<NextResponse> {
  const {
    transactionType,
    assessmentYear = "2025-26",
    operatingRevenue,
    operatingCost,
    employeeCost,
    transactionValue,
  } = body;

  if (!transactionType) {
    return NextResponse.json(
      { error: "Transaction type is required" },
      { status: 400 }
    );
  }

  const mappedType = TRANSACTION_TYPE_MAP[transactionType as string];
  if (!mappedType) {
    return NextResponse.json(
      { error: `Invalid transaction type: ${transactionType}` },
      { status: 400 }
    );
  }

  const financialData = {
    assessmentYear: assessmentYear as string,
    totalRevenue: (operatingRevenue as number) || 0,
    operatingRevenue: (operatingRevenue as number) || 0,
    totalOperatingCost: (operatingCost as number) || 0,
    employeeCost: employeeCost as number | undefined,
    transactionValue: (transactionValue as number) || (operatingRevenue as number) || 0,
  };

  const service = createSafeHarbourAIService(assessmentYear as string);
  const result = await service.generateGapAnalysis(mappedType, financialData);

  return NextResponse.json({
    success: true,
    aiEnhanced: aiConfigured && result.aiGenerated,
    result: formatGapAnalysisResult(result),
  });
}

async function handleForm3CEFA(
  body: Record<string, unknown>,
  aiConfigured: boolean
): Promise<NextResponse> {
  const {
    transactionType,
    assessmentYear = "2025-26",
    operatingRevenue,
    operatingCost,
    employeeCost,
    transactionValue,
    entityName,
    entityPAN,
    aeName,
    aeCountry,
  } = body;

  // Validate required fields
  if (!transactionType || !entityName || !entityPAN || !aeName || !aeCountry) {
    return NextResponse.json(
      {
        error: "Missing required fields",
        required: ["transactionType", "entityName", "entityPAN", "aeName", "aeCountry"],
      },
      { status: 400 }
    );
  }

  const mappedType = TRANSACTION_TYPE_MAP[transactionType as string];
  if (!mappedType) {
    return NextResponse.json(
      { error: `Invalid transaction type: ${transactionType}` },
      { status: 400 }
    );
  }

  const financialData = {
    assessmentYear: assessmentYear as string,
    totalRevenue: (operatingRevenue as number) || 0,
    operatingRevenue: (operatingRevenue as number) || 0,
    totalOperatingCost: (operatingCost as number) || 0,
    employeeCost: employeeCost as number | undefined,
    transactionValue: (transactionValue as number) || (operatingRevenue as number) || 0,
  };

  const entityDetails = {
    entityName: entityName as string,
    entityPAN: entityPAN as string,
    aeName: aeName as string,
    aeCountry: aeCountry as string,
  };

  const service = createSafeHarbourAIService(assessmentYear as string);
  const result = await service.generateForm3CEFANarrative(
    mappedType,
    financialData,
    entityDetails
  );

  return NextResponse.json({
    success: result.canGenerate,
    aiEnhanced: aiConfigured && result.aiEnhanced,
    result: formatForm3CEFAResult(result),
  });
}

// =============================================================================
// Response Formatters
// =============================================================================

function formatEnhancedResult(result: SafeHarbourEnhancedResult) {
  return {
    eligible: result.meetsSafeHarbour,
    meetsSafeHarbour: result.meetsSafeHarbour,
    margin: {
      actual: result.actualMargin,
      required: result.requiredMargin,
      gap: result.marginGap,
      type: result.thresholdDetails?.marginType || "OP/OC",
    },
    recommendation: result.enhancedRecommendation,
    actionItems: result.actionItems,
    regulatoryBasis: result.regulatoryBasis,
    riskAssessment: result.riskAssessment,
    form3cefaImplication: result.form3cefaImplication,
    alternativeStrategies: result.alternativeStrategies,
    conditions: result.conditions,
    form3cefaData: result.form3cefaData,
    quality: result.qualityScore
      ? {
          score: result.qualityScore.overallScore,
          passed: result.qualityScore.passed,
          verificationRequired: result.qualityScore.verificationRequired,
        }
      : undefined,
    metadata: result.aiMetadata,
  };
}

function formatGapAnalysisResult(result: GapAnalysisResult) {
  return {
    hasGap: result.hasGap,
    message: result.message,
    margin: {
      current: result.currentMargin,
      required: result.requiredMargin,
      gap: result.gap,
    },
    additionalProfitRequired: result.additionalProfitRequired,
    remediationStrategies: result.strategies,
    recommendedApproach: result.recommendedApproach,
    aiGenerated: result.aiGenerated,
  };
}

function formatForm3CEFAResult(result: Form3CEFANarrativeResult) {
  if (!result.canGenerate) {
    return {
      canGenerate: false,
      reason: result.reason,
    };
  }

  return {
    canGenerate: true,
    narrative: result.narrative,
    aiEnhanced: result.aiEnhanced,
    quality: result.qualityScore,
    error: result.error,
  };
}
