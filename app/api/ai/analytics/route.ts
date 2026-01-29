/**
 * Analytics AI API Routes
 * Advanced TP Analytics AI-enhanced endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyticsAIService,
  FinancialYearData,
  CrossBorderTransaction,
  BenchmarkData,
} from "@/lib/engines/analytics-ai";

// =============================================================================
// GET - Service capabilities
// =============================================================================

export async function GET() {
  const service = getAnalyticsAIService();

  return NextResponse.json({
    service: "Analytics AI Service",
    version: "1.0.0",
    available: service.isAvailable(),
    endpoints: {
      POST: {
        "/api/ai/analytics": {
          actions: [
            "precedent-mining",
            "cross-border-analysis",
            "trend-analysis",
            "risk-prediction",
          ],
        },
      },
    },
    capabilities: [
      "Regulatory precedent mining",
      "Cross-border transaction analysis",
      "Multi-year trend analysis",
      "TP risk prediction",
    ],
  });
}

// =============================================================================
// POST - AI generation endpoints
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const service = getAnalyticsAIService();

    switch (action) {
      case "precedent-mining":
        return handlePrecedentMining(service, params);
      case "cross-border-analysis":
        return handleCrossBorderAnalysis(service, params);
      case "trend-analysis":
        return handleTrendAnalysis(service, params);
      case "risk-prediction":
        return handleRiskPrediction(service, params);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

async function handlePrecedentMining(
  service: ReturnType<typeof getAnalyticsAIService>,
  params: {
    query: string;
    entityType: string;
    industry: string;
    transactionType: string;
    assessmentYear: string;
    specificFacts: string;
    currentPosition: string;
    revenuePosition?: string;
    jurisdictionPriority?: string;
    timePeriod?: string;
    specificBenches?: string;
    relatedIssues?: string;
  }
) {
  const result = await service.mineRegulatoryPrecedents(
    params.query || "Transfer pricing issue",
    params.entityType || "Subsidiary",
    params.industry || "Services",
    params.transactionType || "Services",
    params.assessmentYear || "2024-25",
    params.specificFacts || "Specific facts pending",
    params.currentPosition || "Current position pending",
    params.revenuePosition,
    params.jurisdictionPriority,
    params.timePeriod,
    params.specificBenches,
    params.relatedIssues
  );

  return NextResponse.json({
    success: true,
    data: result.mining,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleCrossBorderAnalysis(
  service: ReturnType<typeof getAnalyticsAIService>,
  params: {
    indianEntity: string;
    industry: string;
    financialYear: string;
    transactions: Partial<CrossBorderTransaction>[];
    currentMethods: string;
    applicableDTAAs: string[];
    existingStructure?: string;
    peExposure?: string;
    withholdingTax?: string;
  }
) {
  const transactions = (params.transactions || []).map(buildCrossBorderTransaction);

  const result = await service.analyzeCrossBorder(
    params.indianEntity || "Indian Entity",
    params.industry || "Services",
    params.financialYear || "2024-25",
    transactions,
    params.currentMethods || "TNMM",
    params.applicableDTAAs || [],
    params.existingStructure,
    params.peExposure,
    params.withholdingTax
  );

  return NextResponse.json({
    success: true,
    data: result.analysis,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleTrendAnalysis(
  service: ReturnType<typeof getAnalyticsAIService>,
  params: {
    entityName: string;
    industry: string;
    financialData: Partial<FinancialYearData>[];
    industryBenchmarks: Partial<BenchmarkData>[];
    comparableData?: string;
    significantEvents?: string;
    restructuring?: string;
  }
) {
  const financialData = (params.financialData || []).map(buildFinancialYearData);
  const industryBenchmarks = (params.industryBenchmarks || []).map(buildBenchmarkData);

  const result = await service.analyzeMultiYearTrends(
    params.entityName || "Entity",
    params.industry || "Services",
    financialData,
    industryBenchmarks,
    params.comparableData,
    params.significantEvents,
    params.restructuring
  );

  return NextResponse.json({
    success: true,
    data: result.analysis,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleRiskPrediction(
  service: ReturnType<typeof getAnalyticsAIService>,
  params: {
    entityName: string;
    industry: string;
    predictionPeriod: string;
    currentRevenue: number;
    currentMargin: number;
    currentRPT: number;
    documentationStatus: string;
    historicalData: Partial<FinancialYearData>[];
    currentRiskProfile: string;
    industryTrends?: string;
    regulatoryEnvironment?: string;
    upcomingChanges?: string;
    macroFactors?: string;
    plannedTransactions?: string;
  }
) {
  const historicalData = (params.historicalData || []).map(buildFinancialYearData);

  const result = await service.predictRisks(
    params.entityName || "Entity",
    params.industry || "Services",
    params.predictionPeriod || "Next 12 months",
    params.currentRevenue || 0,
    params.currentMargin || 0,
    params.currentRPT || 0,
    params.documentationStatus || "complete",
    historicalData,
    params.currentRiskProfile || "Medium risk",
    params.industryTrends,
    params.regulatoryEnvironment,
    params.upcomingChanges,
    params.macroFactors,
    params.plannedTransactions
  );

  return NextResponse.json({
    success: true,
    data: result.prediction,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildCrossBorderTransaction(
  partial: Partial<CrossBorderTransaction>
): CrossBorderTransaction {
  return {
    fromJurisdiction: partial.fromJurisdiction || "India",
    toJurisdiction: partial.toJurisdiction || "USA",
    transactionType: partial.transactionType || "Services",
    value: partial.value || 0,
    tpMethod: partial.tpMethod || "TNMM",
    currency: partial.currency || "INR",
  };
}

function buildFinancialYearData(
  partial: Partial<FinancialYearData>
): FinancialYearData {
  return {
    year: partial.year || "2024-25",
    revenue: partial.revenue || 0,
    operatingProfit: partial.operatingProfit || 0,
    opOcMargin: partial.opOcMargin || 0,
    opOrMargin: partial.opOrMargin || 0,
    rptValue: partial.rptValue || 0,
    employeeCost: partial.employeeCost,
  };
}

function buildBenchmarkData(partial: Partial<BenchmarkData>): BenchmarkData {
  return {
    year: partial.year || "2024-25",
    metric: partial.metric || "OP/OC",
    value: partial.value || 0,
  };
}
