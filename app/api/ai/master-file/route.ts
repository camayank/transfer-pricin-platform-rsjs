/**
 * ================================================================================
 * DIGICOMPLY AI API
 * Master File AI-Enhanced Endpoint
 *
 * POST /api/ai/master-file - Generate AI-enhanced Master File content
 * GET /api/ai/master-file - Get available Master File AI capabilities
 * ================================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createMasterFileAIService } from "@/lib/engines/master-file-ai";
import { EntityType, BusinessActivity } from "@/lib/engines/master-file-engine";
import { isAIConfigured } from "@/lib/ai";

// =============================================================================
// GET - Capabilities Info
// =============================================================================

export async function GET() {
  const configured = isAIConfigured();

  return NextResponse.json({
    status: configured ? "ready" : "not_configured",
    capabilities: {
      organizationalStructure: true,
      businessDescription: true,
      intangiblesStrategy: true,
      financialPolicy: true,
      farAnalysis: true,
      enhancedMasterFile: true,
    },
    actions: [
      "organizational_structure",
      "business_description",
      "intangibles_strategy",
      "financial_policy",
      "far_analysis",
      "enhanced_master_file",
    ],
    message: configured
      ? "Master File AI service is ready"
      : "AI not configured - fallback narratives will be used",
  });
}

// =============================================================================
// POST - Generate Master File Content
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing 'action' field in request body" },
        { status: 400 }
      );
    }

    const service = createMasterFileAIService();
    const aiConfigured = isAIConfigured();

    switch (action) {
      // =======================================================================
      // ORGANIZATIONAL STRUCTURE
      // =======================================================================
      case "organizational_structure": {
        if (!params?.groupEntities || !Array.isArray(params.groupEntities)) {
          return NextResponse.json(
            { error: "groupEntities array is required" },
            { status: 400 }
          );
        }

        const result = await service.generateOrganizationalStructure({
          groupName: String(params.groupName || "Group"),
          ultimateParent: String(params.ultimateParent || "Parent Co"),
          parentCountry: String(params.parentCountry || "Unknown"),
          reportingEntity: String(params.reportingEntity || "Entity"),
          entityType: (params.entityType as EntityType) || EntityType.CONSTITUENT_ENTITY,
          groupEntities: params.groupEntities.map(buildGroupEntityObject),
          recentRestructuring: params.recentRestructuring ? String(params.recentRestructuring) : undefined,
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result,
        });
      }

      // =======================================================================
      // BUSINESS DESCRIPTION
      // =======================================================================
      case "business_description": {
        if (!params?.businessActivities || !Array.isArray(params.businessActivities)) {
          return NextResponse.json(
            { error: "businessActivities array is required" },
            { status: 400 }
          );
        }

        const result = await service.generateBusinessDescription({
          groupName: String(params.groupName || "Group"),
          industrySector: String(params.industrySector || params.industry || "IT Services"),
          businessActivities: params.businessActivities.map((a: string) => a as BusinessActivity),
          entityCharacterization: String(params.entityCharacterization || "Service Provider"),
          revenue: Number(params.revenue || 0),
          exportRevenue: Number(params.exportRevenue || 0),
          employeeCount: Number(params.employeeCount || 0),
          productsServices: (params.productsServices || []).map(buildProductServiceObject),
          geographicMarkets: Array.isArray(params.geographicMarkets) ? params.geographicMarkets.map(String) : [],
          competitors: params.competitors ? params.competitors.map(String) : undefined,
          functions: params.functions ? params.functions.map(String) : undefined,
          assets: params.assets ? params.assets.map(String) : undefined,
          risks: params.risks ? params.risks.map(String) : undefined,
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result,
        });
      }

      // =======================================================================
      // INTANGIBLES STRATEGY
      // =======================================================================
      case "intangibles_strategy": {
        const result = await service.generateIntangiblesStrategy({
          groupName: String(params.groupName || "Group"),
          industry: String(params.industry || "IT Services"),
          intangiblesList: (params.intangibles || params.intangiblesList || []).map(buildIntangibleAssetObject),
          rdFacilities: (params.rdFacilities || []).map(buildRDFacilityObject),
          rdManagementLocation: String(params.rdManagementLocation || "Headquarters"),
          legalOwner: String(params.legalOwner || "Parent Company"),
          economicOwner: String(params.economicOwner || "Parent Company"),
          intangibleTransfers: params.intangibleTransfers ? String(params.intangibleTransfers) : undefined,
          costContributionArrangements: params.costContributionArrangements ? String(params.costContributionArrangements) : undefined,
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result,
        });
      }

      // =======================================================================
      // FINANCIAL POLICY
      // =======================================================================
      case "financial_policy": {
        const result = await service.generateFinancialPolicy({
          groupName: String(params.groupName || "Group"),
          financingEntities: (params.financingEntities || []).map((e: Record<string, unknown>) => ({
            entityName: String(e.entityName || e.name || ""),
            country: String(e.country || ""),
            function: String(e.function || e.role || ""),
          })),
          financingArrangements: (params.financingArrangements || []).map(buildFinancingArrangementObject),
          cashPooling: params.cashPooling ? String(params.cashPooling) : undefined,
          guarantees: params.guarantees ? String(params.guarantees) : undefined,
          interestRatePolicy: String(params.interestRatePolicy || "Market-based rates"),
          currencyManagement: String(params.currencyManagement || "Natural hedging"),
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result,
        });
      }

      // =======================================================================
      // FAR ANALYSIS
      // =======================================================================
      case "far_analysis": {
        if (!params?.entityName) {
          return NextResponse.json(
            { error: "entityName is required" },
            { status: 400 }
          );
        }

        const result = await service.generateFARAnalysis({
          entityName: String(params.entityName),
          entityType: String(params.entityType || "Subsidiary"),
          industry: String(params.industry || "IT Services"),
          principalActivity: String(params.principalActivity || params.activity || "Software Development"),
          functions: Array.isArray(params.functions) ? params.functions.map(String) : [],
          assets: Array.isArray(params.assets) ? params.assets.map(String) : [],
          risks: Array.isArray(params.risks) ? params.risks.map(String) : [],
          relatedPartyTransactions: String(params.relatedPartyTransactions || "Service revenue from parent"),
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result,
        });
      }

      // =======================================================================
      // ENHANCED MASTER FILE
      // =======================================================================
      case "enhanced_master_file": {
        if (!params?.reportingEntity || !params?.groupName) {
          return NextResponse.json(
            { error: "reportingEntity and groupName are required" },
            { status: 400 }
          );
        }

        const result = await service.buildEnhancedMasterFile({
          reportingEntity: String(params.reportingEntity),
          reportingPAN: String(params.reportingPAN || ""),
          entityType: (params.entityType as EntityType) || EntityType.CONSTITUENT_ENTITY,
          groupName: String(params.groupName),
          ultimateParent: String(params.ultimateParent || "Parent Company"),
          parentCountry: String(params.parentCountry || "Unknown"),
          groupEntities: (params.groupEntities || []).map(buildGroupEntityObject),
          industry: String(params.industry || "IT Services"),
          businessActivities: (params.businessActivities || []).map((a: string) => a as BusinessActivity),
          productsServices: (params.productsServices || []).map(buildProductServiceObject),
          geographicMarkets: Array.isArray(params.geographicMarkets) ? params.geographicMarkets.map(String) : [],
          revenue: Number(params.revenue || 0),
          exportRevenue: Number(params.exportRevenue || 0),
          employeeCount: Number(params.employeeCount || 0),
          intangibles: (params.intangibles || []).map(buildIntangibleAssetObject),
          rdFacilities: (params.rdFacilities || []).map(buildRDFacilityObject),
          financingArrangements: (params.financingArrangements || []).map(buildFinancingArrangementObject),
          consolidatedRevenue: Number(params.consolidatedRevenue || params.revenue || 0),
          consolidatedPBT: Number(params.consolidatedPBT || 0),
          consolidatedTax: Number(params.consolidatedTax || 0),
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured,
          result,
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            availableActions: [
              "organizational_structure",
              "business_description",
              "intangibles_strategy",
              "financial_policy",
              "far_analysis",
              "enhanced_master_file",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Master File AI API Error:", error);
    return NextResponse.json(
      {
        error: "Master File AI generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// Object Builders
// =============================================================================

function buildGroupEntityObject(data: Record<string, unknown>) {
  return {
    name: String(data.name || ""),
    country: String(data.country || ""),
    legalForm: String(data.legalForm || "Private Limited"),
    ownershipPercentage: Number(data.ownershipPercentage || 100),
    activities: Array.isArray(data.activities) ? data.activities.map(String) : [],
    isReportingEntity: Boolean(data.isReportingEntity),
  };
}

function buildProductServiceObject(data: Record<string, unknown>) {
  return {
    name: String(data.name || ""),
    description: String(data.description || ""),
    revenuePercentage: Number(data.revenuePercentage || 0),
    markets: Array.isArray(data.markets) ? data.markets.map(String) : [],
  };
}

function buildIntangibleAssetObject(data: Record<string, unknown>) {
  return {
    type: String(data.type || "Technology"),
    description: String(data.description || ""),
    legalOwner: String(data.legalOwner || ""),
    economicOwner: String(data.economicOwner || ""),
    developmentLocation: String(data.developmentLocation || ""),
    value: data.value ? Number(data.value) : undefined,
  };
}

function buildRDFacilityObject(data: Record<string, unknown>) {
  return {
    location: String(data.location || ""),
    country: String(data.country || ""),
    headcount: Number(data.headcount || 0),
    activities: Array.isArray(data.activities) ? data.activities.map(String) : [],
  };
}

function buildFinancingArrangementObject(data: Record<string, unknown>) {
  return {
    type: String(data.type || "Loan"),
    lender: String(data.lender || ""),
    borrower: String(data.borrower || ""),
    amount: Number(data.amount || 0),
    currency: String(data.currency || "INR"),
    interestRate: data.interestRate ? Number(data.interestRate) : undefined,
    terms: data.terms ? String(data.terms) : undefined,
  };
}
