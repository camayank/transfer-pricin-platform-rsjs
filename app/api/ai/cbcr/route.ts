/**
 * CbCR AI API Routes
 * Country-by-Country Reporting AI-enhanced endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCbCRAIService,
  CbCRReport,
  CbCRJurisdictionData,
  CbCREntity,
} from "@/lib/engines/cbcr-ai";

// =============================================================================
// GET - Service capabilities
// =============================================================================

export async function GET() {
  const service = getCbCRAIService();

  return NextResponse.json({
    service: "CbCR AI Service",
    version: "1.0.0",
    available: service.isAvailable(),
    endpoints: {
      POST: {
        "/api/ai/cbcr": {
          actions: [
            "jurisdiction-allocation",
            "consolidation-narrative",
            "validate",
            "nexus-analysis",
          ],
        },
      },
    },
    capabilities: [
      "Jurisdiction allocation with AI narrative",
      "Consolidation narrative generation",
      "CbCR validation and consistency checks",
      "Nexus and economic substance analysis",
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

    const service = getCbCRAIService();

    switch (action) {
      case "jurisdiction-allocation":
        return handleJurisdictionAllocation(service, params);
      case "consolidation-narrative":
        return handleConsolidationNarrative(service, params);
      case "validate":
        return handleValidation(service, params);
      case "nexus-analysis":
        return handleNexusAnalysis(service, params);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("CbCR AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

async function handleJurisdictionAllocation(
  service: ReturnType<typeof getCbCRAIService>,
  params: {
    report: Partial<CbCRReport>;
    jurisdictionData: Partial<CbCRJurisdictionData>;
    adjustments?: string;
    consolidationNotes?: string;
  }
) {
  const report = buildCbCRReport(params.report);
  const jurisdictionData = buildJurisdictionData(params.jurisdictionData);

  const result = await service.generateJurisdictionAllocation(
    report,
    jurisdictionData,
    params.adjustments,
    params.consolidationNotes
  );

  return NextResponse.json({
    success: true,
    data: result.allocation,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleConsolidationNarrative(
  service: ReturnType<typeof getCbCRAIService>,
  params: {
    report: Partial<CbCRReport>;
    dataSources: string;
    currencyMethod: string;
    exchangeRates: string;
    eliminationEntries?: string;
    specialConsiderations?: string;
  }
) {
  const report = buildCbCRReport(params.report);

  const result = await service.generateConsolidationNarrative(
    report,
    params.dataSources || "Consolidated Financial Statements",
    params.currencyMethod || "Average Rate",
    params.exchangeRates || "As per RBI reference rates",
    params.eliminationEntries,
    params.specialConsiderations
  );

  return NextResponse.json({
    success: true,
    data: result.narrative,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleValidation(
  service: ReturnType<typeof getCbCRAIService>,
  params: {
    report: Partial<CbCRReport>;
    previousYearData?: Partial<CbCRReport>;
  }
) {
  const report = buildCbCRReport(params.report);
  const previousYearData = params.previousYearData
    ? buildCbCRReport(params.previousYearData)
    : undefined;

  const result = await service.validateCbCR(report, previousYearData);

  return NextResponse.json({
    success: true,
    data: result.validation,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleNexusAnalysis(
  service: ReturnType<typeof getCbCRAIService>,
  params: {
    report: Partial<CbCRReport>;
    jurisdictionData: Partial<CbCRJurisdictionData>;
    businessActivities: string;
    substanceIndicators: string;
    localSubstanceRules?: string;
  }
) {
  const report = buildCbCRReport(params.report);
  const jurisdictionData = buildJurisdictionData(params.jurisdictionData);

  const result = await service.analyzeNexus(
    report,
    jurisdictionData,
    params.businessActivities || "Standard business activities",
    params.substanceIndicators || "Standard substance indicators",
    params.localSubstanceRules
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildCbCRReport(partial: Partial<CbCRReport>): CbCRReport {
  return {
    groupName: partial.groupName || "MNE Group",
    ultimateParent: partial.ultimateParent || "Parent Entity",
    parentJurisdiction: partial.parentJurisdiction || "India",
    reportingPeriod: partial.reportingPeriod || "FY 2024-25",
    reportingCurrency: partial.reportingCurrency || "INR",
    jurisdictions: (partial.jurisdictions || []).map(buildJurisdictionData),
    consolidatedRevenue: partial.consolidatedRevenue || 0,
    consolidatedPBT: partial.consolidatedPBT || 0,
    consolidatedTax: partial.consolidatedTax || 0,
  };
}

function buildJurisdictionData(
  partial: Partial<CbCRJurisdictionData>
): CbCRJurisdictionData {
  return {
    jurisdictionCode: partial.jurisdictionCode || "IN",
    jurisdictionName: partial.jurisdictionName || "India",
    entities: (partial.entities || []).map(buildCbCREntity),
    unrelatedRevenue: partial.unrelatedRevenue || 0,
    relatedRevenue: partial.relatedRevenue || 0,
    totalRevenue: partial.totalRevenue || 0,
    profitBeforeTax: partial.profitBeforeTax || 0,
    taxPaid: partial.taxPaid || 0,
    taxAccrued: partial.taxAccrued || 0,
    statedCapital: partial.statedCapital || 0,
    accumulatedEarnings: partial.accumulatedEarnings || 0,
    employeeCount: partial.employeeCount || 0,
    tangibleAssets: partial.tangibleAssets || 0,
  };
}

function buildCbCREntity(partial: Partial<CbCREntity>): CbCREntity {
  return {
    entityName: partial.entityName || "Entity",
    entityType: partial.entityType || "Subsidiary",
    jurisdiction: partial.jurisdiction || "India",
    mainBusinessActivity: partial.mainBusinessActivity || "Services",
    incorporationCountry: partial.incorporationCountry || "India",
  };
}
