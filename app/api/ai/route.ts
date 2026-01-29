/**
 * ================================================================================
 * DIGICOMPLY AI API
 * Main AI Generation Endpoint
 *
 * POST /api/ai - Generate AI content for TP documentation
 * GET /api/ai - Get AI service status and available capabilities
 * ================================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getTPDocumentGenerator,
  PromptType,
  isAIConfigured,
  getConfiguredProviders,
  AI_SERVICE_VERSION,
} from "@/lib/ai";

// =============================================================================
// GET - Service Status
// =============================================================================

export async function GET() {
  const configured = isAIConfigured();
  const providers = getConfiguredProviders();

  return NextResponse.json({
    status: configured ? "ready" : "not_configured",
    version: AI_SERVICE_VERSION,
    configuredProviders: providers,
    availablePromptTypes: Object.values(PromptType),
    capabilities: {
      // Tier 1 AI Capabilities
      safeHarbour: {
        recommendation: true,
        gapAnalysis: true,
        form3cefaNarrative: true,
      },
      form3ceb: {
        transactionDescription: true,
        methodJustification: true,
        validationSuggestion: true,
      },
      benchmarking: {
        workingCapitalAdjustment: true,
        comparableRejection: true,
        armLengthConclusion: true,
      },
      // Tier 2 AI Capabilities
      masterFile: {
        organizationalStructure: true,
        businessDescription: true,
        intangiblesStrategy: true,
        financialPolicy: true,
        farAnalysis: true,
      },
      dashboard: {
        complianceRiskScore: true,
        clientPriorityAnalysis: true,
        smartNotification: true,
        deadlinePrediction: true,
      },
      accounting: {
        transactionClassification: true,
        relatedPartyDetection: true,
        natureCodeRecommendation: true,
        financialAnomaly: true,
      },
      // Tier 3 AI Capabilities
      cbcr: {
        jurisdictionAllocation: true,
        consolidationNarrative: true,
        validation: true,
        nexusAnalysis: true,
      },
      tpDispute: {
        riskAssessment: true,
        defenseStrategy: true,
        apaAssistance: true,
        tpoResponse: true,
        litigationAnalysis: true,
      },
      analytics: {
        precedentMining: true,
        crossBorderAnalysis: true,
        trendAnalysis: true,
        riskPrediction: true,
      },
    },
    message: configured
      ? "AI service is configured and ready"
      : "No AI API keys configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY",
  });
}

// =============================================================================
// POST - Generate AI Content
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check if AI is configured
    if (!isAIConfigured()) {
      return NextResponse.json(
        {
          error: "AI service not configured",
          message: "Please configure an AI API key (ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY)",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing 'action' field in request body" },
        { status: 400 }
      );
    }

    const generator = getTPDocumentGenerator();

    switch (action) {
      // =======================================================================
      // SAFE HARBOUR ACTIONS
      // =======================================================================
      case "safe_harbour_recommendation": {
        const result = await generator.generateSafeHarbourRecommendation({
          transactionType: params.transactionType,
          assessmentYear: params.assessmentYear || "2025-26",
          entityName: params.entityName,
          operatingRevenue: params.operatingRevenue,
          operatingCost: params.operatingCost,
          operatingProfit: params.operatingProfit,
          employeeCost: params.employeeCost,
          loanAmount: params.loanAmount,
          loanCurrency: params.loanCurrency,
          creditRating: params.creditRating,
          interestRate: params.interestRate,
          guaranteeAmount: params.guaranteeAmount,
          commissionRate: params.commissionRate,
          currentMargin: params.currentMargin,
          requiredThreshold: params.requiredThreshold,
          gap: params.gap,
        });
        return NextResponse.json(result);
      }

      case "safe_harbour_gap_analysis": {
        const result = await generator.generateGapAnalysis({
          transactionType: params.transactionType,
          metricType: params.metricType || "OP/OC",
          currentValue: params.currentValue,
          requiredThreshold: params.requiredThreshold,
          gap: params.gap,
          operatingCost: params.operatingCost,
          operatingRevenue: params.operatingRevenue,
          operatingProfit: params.operatingProfit,
        });
        return NextResponse.json(result);
      }

      // =======================================================================
      // FORM 3CEB ACTIONS
      // =======================================================================
      case "transaction_description": {
        const result = await generator.generateTransactionDescription({
          serialNumber: params.serialNumber || 1,
          natureCode: params.natureCode,
          natureDescription: params.natureDescription,
          indianEntity: params.indianEntity,
          aeName: params.aeName,
          aeCountry: params.aeCountry,
          relationship: params.relationship || "Associated Enterprise",
          transactionValue: params.transactionValue,
          transactionCurrency: params.transactionCurrency || "INR",
          methodApplied: params.methodApplied,
          agreementDate: params.agreementDate,
          pricingMechanism: params.pricingMechanism,
          additionalContext: params.additionalContext,
        });
        return NextResponse.json(result);
      }

      case "method_justification": {
        const result = await generator.generateMethodJustification({
          transactionType: params.transactionType,
          natureCode: params.natureCode,
          transactionDescription: params.transactionDescription,
          transactionValue: params.transactionValue,
          testedParty: params.testedParty,
          characterization: params.characterization,
          functions: params.functions,
          assets: params.assets,
          risks: params.risks,
          selectedMethod: params.selectedMethod,
          selectedPLI: params.selectedPLI,
          internalCUPAvailable: params.internalCUPAvailable || false,
          externalCUPAvailable: params.externalCUPAvailable || false,
          comparablesAvailable: params.comparablesAvailable || true,
        });
        return NextResponse.json(result);
      }

      case "validation_suggestion": {
        const result = await generator.generateValidationSuggestion({
          fieldName: params.fieldName,
          section: params.section,
          currentValue: params.currentValue,
          validationError: params.validationError,
          severity: params.severity,
          entityName: params.entityName,
          assessmentYear: params.assessmentYear || "2025-26",
          transactionType: params.transactionType,
        });
        return NextResponse.json(result);
      }

      // =======================================================================
      // BENCHMARKING ACTIONS
      // =======================================================================
      case "working_capital_adjustment": {
        const result = await generator.generateWorkingCapitalAdjustment({
          testedPartyName: params.testedPartyName,
          financialYear: params.financialYear,
          revenue: params.revenue,
          receivables: params.receivables,
          inventory: params.inventory,
          payables: params.payables,
          comparableFinancials: params.comparableFinancials,
          interestRate: params.interestRate,
          rateBasis: params.rateBasis || "SBI PLR",
        });
        return NextResponse.json(result);
      }

      case "comparable_rejection": {
        const result = await generator.generateComparableRejection({
          companyName: params.companyName,
          companyCIN: params.companyCIN,
          industry: params.industry,
          nicCode: params.nicCode,
          financialData: params.financialData,
          businessDescription: params.businessDescription,
          annualReportObservations: params.annualReportObservations,
          testedPartyIndustry: params.testedPartyIndustry,
          testedPartyFunctions: params.testedPartyFunctions,
          testedPartyRevenue: params.testedPartyRevenue,
          rejectionCategory: params.rejectionCategory,
        });
        return NextResponse.json(result);
      }

      case "arm_length_conclusion": {
        const result = await generator.generateArmLengthConclusion({
          pliType: params.pliType,
          financialYears: params.financialYears,
          numberOfComparables: params.numberOfComparables,
          comparableMargins: params.comparableMargins,
          percentile35: params.percentile35,
          median: params.median,
          percentile65: params.percentile65,
          arithmeticMean: params.arithmeticMean,
          testedPartyName: params.testedPartyName,
          testedPartyMargin: params.testedPartyMargin,
          operatingCost: params.operatingCost,
          operatingRevenue: params.operatingRevenue,
        });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            availableActions: [
              "safe_harbour_recommendation",
              "safe_harbour_gap_analysis",
              "transaction_description",
              "method_justification",
              "validation_suggestion",
              "working_capital_adjustment",
              "comparable_rejection",
              "arm_length_conclusion",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      {
        error: "AI generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
