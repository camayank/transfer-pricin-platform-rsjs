import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  createDigitalEconomyModule,
  JurisdictionData,
  GloBEJurisdictionData,
  DigitalJurisdictionData,
  IntangibleContribution,
  RoutineFunction,
} from "@/lib/engines/modules/digital-economy-module";
import { DigitalServiceType } from "@/lib/engines/constants/digital-economy-rules";

// =============================================================================
// DIGITAL ECONOMY MODULE API
// Pillar One, Pillar Two (GloBE), and Digital Services TP calculations
// =============================================================================

interface PillarOneRequest {
  globalRevenue: number;
  profitBeforeTax: number;
  businessModel: "automated_digital_services" | "consumer_facing_business" | "other";
  jurisdictionData: {
    country: string;
    revenue: number;
    users: number;
    localEntity?: boolean;
    currentProfitAllocation?: number;
  }[];
  fiscalYear: string;
}

interface PillarTwoRequest {
  globalRevenue: number;
  jurisdictionData: {
    country: string;
    revenue: number;
    profitBeforeTax: number;
    tangibleAssets: number;
    payrollCosts: number;
    employees: number;
    currentTax: number;
    deferredTax?: number;
  }[];
  parentJurisdiction: string;
  fiscalYear: string;
}

interface DigitalProfitSplitRequest {
  transactionType: "platform_services" | "data_licensing" | "cloud_services" | "digital_advertising";
  totalRevenue: number;
  routineReturns: {
    marketing: number;
    technology: number;
    operations: number;
  };
  uniqueContributions: {
    userBase: boolean;
    algorithms: boolean;
    brandValue: boolean;
    networkEffects: boolean;
  };
  jurisdictions: {
    country: string;
    localRevenue: number;
    userCount: number;
    dataVolume?: number;
  }[];
}

// GET /api/modules/digital-economy - Get available capabilities
export async function GET() {
  return NextResponse.json({
    module: "Digital Economy Module",
    version: "1.0.0",
    description: "OECD Pillar One/Two analysis and digital services transfer pricing",
    capabilities: [
      {
        endpoint: "POST /api/modules/digital-economy",
        action: "pillar-one",
        description: "Analyze Amount A and Amount B under Pillar One framework",
        requiredFields: ["globalRevenue", "profitBeforeTax", "businessModel", "jurisdictionData"],
        oecdReference: "OECD Pillar One Blueprint",
        thresholds: {
          revenueThreshold: "EUR 20 billion",
          profitabilityThreshold: "10% pre-tax profit margin",
        },
      },
      {
        endpoint: "POST /api/modules/digital-economy",
        action: "pillar-two-globe",
        description: "Calculate GloBE minimum tax and top-up tax liability",
        requiredFields: ["globalRevenue", "jurisdictionData", "parentJurisdiction"],
        oecdReference: "OECD Pillar Two Model Rules (GloBE)",
        thresholds: {
          revenueThreshold: "EUR 750 million",
          minimumTaxRate: "15%",
        },
      },
      {
        endpoint: "POST /api/modules/digital-economy",
        action: "digital-profit-split",
        description: "Profit split analysis for digital and platform businesses",
        requiredFields: ["transactionType", "totalRevenue", "routineReturns", "uniqueContributions", "jurisdictions"],
        oecdReference: "OECD Guidelines Chapter II - Profit Split Method",
      },
    ],
    examples: {
      "pillar-one": {
        action: "pillar-one",
        globalRevenue: 25000000000,
        profitBeforeTax: 5000000000,
        businessModel: "automated_digital_services",
        jurisdictionData: [
          { country: "USA", revenue: 10000000000, users: 50000000 },
          { country: "India", revenue: 2000000000, users: 100000000 },
        ],
        fiscalYear: "2024",
      },
    },
  });
}

// POST /api/modules/digital-economy - Execute digital economy calculations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required. Valid actions: pillar-one, pillar-two-globe, digital-profit-split" },
        { status: 400 }
      );
    }

    const digitalModule = createDigitalEconomyModule();

    switch (action) {
      case "pillar-one": {
        const data = body as PillarOneRequest & { action: string };

        if (!data.globalRevenue || !data.profitBeforeTax || !data.businessModel || !data.jurisdictionData) {
          return NextResponse.json(
            { error: "Missing required fields: globalRevenue, profitBeforeTax, businessModel, jurisdictionData" },
            { status: 400 }
          );
        }

        // Transform API input to service interface
        const jurisdictionData: JurisdictionData[] = data.jurisdictionData.map((j) => ({
          jurisdictionCode: j.country.substring(0, 2).toUpperCase(),
          jurisdictionName: j.country,
          revenue: j.revenue,
          users: j.users,
          dataPoints: j.users * 10, // Estimated data points based on users
          employeeCount: Math.round(j.revenue / 100000), // Estimated employees
          assets: j.revenue * 0.3, // Estimated assets
        }));

        // Map business model to service types
        const serviceTypeMap: Record<string, DigitalServiceType[]> = {
          automated_digital_services: [DigitalServiceType.CLOUD_COMPUTING, DigitalServiceType.SAAS],
          consumer_facing_business: [DigitalServiceType.ONLINE_ADVERTISING, DigitalServiceType.SOCIAL_MEDIA],
          other: [DigitalServiceType.DIGITAL_CONTENT],
        };

        const result = digitalModule.analyzePillarOne({
          globalRevenue: data.globalRevenue,
          profitBeforeTax: data.profitBeforeTax,
          jurisdictionData,
          serviceTypes: serviceTypeMap[data.businessModel] || [DigitalServiceType.DIGITAL_CONTENT],
          fiscalYear: parseInt(data.fiscalYear?.substring(0, 4) || "2024"),
        });

        return NextResponse.json({
          success: true,
          action: "pillar-one",
          result: {
            ...result,
            summary: {
              inScopeForAmountA: result.amountAAnalysis.inScope,
              globalProfitMargin: `${(result.amountAAnalysis.globalProfitMargin * 100).toFixed(2)}%`,
              amountAPool: result.amountAAnalysis.amountAPool.toLocaleString(),
              totalReallocation: result.totalReallocation.toLocaleString(),
              jurisdictionsAffected: result.jurisdictionAllocations.length,
            },
          },
        });
      }

      case "pillar-two-globe": {
        const data = body as PillarTwoRequest & { action: string };

        if (!data.globalRevenue || !data.jurisdictionData || !data.parentJurisdiction) {
          return NextResponse.json(
            { error: "Missing required fields: globalRevenue, jurisdictionData, parentJurisdiction" },
            { status: 400 }
          );
        }

        // Transform API input to service interface
        const jurisdictionFinancials: GloBEJurisdictionData[] = data.jurisdictionData.map((j) => ({
          jurisdictionCode: j.country.substring(0, 2).toUpperCase(),
          jurisdictionName: j.country,
          profitBeforeTax: j.profitBeforeTax,
          taxesPaid: j.currentTax,
          payroll: j.payrollCosts,
          tangibleAssets: j.tangibleAssets,
          coveredTaxes: j.currentTax + (j.deferredTax || 0),
          hasQDMTT: false, // Default to false; can be enhanced
        }));

        const result = digitalModule.analyzePillarTwo({
          globalRevenue: data.globalRevenue,
          jurisdictionFinancials,
          fiscalYear: parseInt(data.fiscalYear?.substring(0, 4) || "2024"),
          parentJurisdiction: data.parentJurisdiction,
        });

        return NextResponse.json({
          success: true,
          action: "pillar-two-globe",
          result: {
            ...result,
            summary: {
              inScopeForGloBE: result.inScope,
              jurisdictionsAnalyzed: data.jurisdictionData.length,
              totalTopUpTax: result.totalTopUpTax?.toLocaleString() || "N/A",
              minimumTaxRate: "15%",
            },
          },
        });
      }

      case "digital-profit-split": {
        const data = body as DigitalProfitSplitRequest & { action: string };

        if (!data.transactionType || !data.totalRevenue || !data.routineReturns || !data.jurisdictions) {
          return NextResponse.json(
            { error: "Missing required fields: transactionType, totalRevenue, routineReturns, jurisdictions" },
            { status: 400 }
          );
        }

        // Map transaction type to service type
        const serviceTypeMap: Record<string, DigitalServiceType> = {
          platform_services: DigitalServiceType.ONLINE_MARKETPLACE,
          data_licensing: DigitalServiceType.DATA_ANALYTICS,
          cloud_services: DigitalServiceType.CLOUD_COMPUTING,
          digital_advertising: DigitalServiceType.ONLINE_ADVERTISING,
        };

        // Transform jurisdictions to DigitalJurisdictionData
        const jurisdictionData: DigitalJurisdictionData[] = data.jurisdictions.map((j) => ({
          jurisdictionCode: j.country.substring(0, 2).toUpperCase(),
          revenue: j.localRevenue,
          activeUsers: j.userCount,
          dataContribution: j.dataVolume || j.userCount * 100,
          employeeCount: Math.round(j.localRevenue / 200000),
          rdExpenditure: j.localRevenue * 0.05,
          infrastructure: j.localRevenue * 0.1,
        }));

        // Build routine functions from routineReturns
        const routineFunctions: RoutineFunction[] = [
          {
            entityName: "Marketing Entity",
            jurisdiction: data.jurisdictions[0]?.country || "Unknown",
            functionType: "marketing",
            cost: data.routineReturns.marketing,
            routineReturn: 0.08,
          },
          {
            entityName: "Technology Entity",
            jurisdiction: data.jurisdictions[0]?.country || "Unknown",
            functionType: "technology",
            cost: data.routineReturns.technology,
            routineReturn: 0.10,
          },
          {
            entityName: "Operations Entity",
            jurisdiction: data.jurisdictions[0]?.country || "Unknown",
            functionType: "operations",
            cost: data.routineReturns.operations,
            routineReturn: 0.05,
          },
        ];

        // Build intangible contributions if unique contributions provided
        const intangibleContributions: IntangibleContribution[] = [];
        if (data.uniqueContributions?.userBase) {
          intangibleContributions.push({
            entityName: "Platform Entity",
            jurisdiction: data.jurisdictions[0]?.country || "Unknown",
            intangibleType: "user_base",
            developmentCost: data.totalRevenue * 0.1,
            dempeScore: 0.8,
          });
        }
        if (data.uniqueContributions?.algorithms) {
          intangibleContributions.push({
            entityName: "Technology Entity",
            jurisdiction: data.jurisdictions[0]?.country || "Unknown",
            intangibleType: "algorithms",
            developmentCost: data.totalRevenue * 0.15,
            dempeScore: 0.9,
          });
        }

        // Calculate combined profit (estimated as 20% of revenue)
        const combinedProfit = data.totalRevenue * 0.20;

        const result = digitalModule.calculateDigitalProfitSplit({
          serviceType: serviceTypeMap[data.transactionType] || DigitalServiceType.ONLINE_MARKETPLACE,
          combinedProfit,
          jurisdictionData,
          intangibleContributions,
          routineFunctions,
        });

        return NextResponse.json({
          success: true,
          action: "digital-profit-split",
          result: {
            ...result,
            summary: {
              totalRoutineReturns: Object.values(data.routineReturns).reduce((a, b) => a + b, 0).toLocaleString(),
              residualProfit: result.residualProfitPool?.toLocaleString() || "N/A",
              jurisdictionsInSplit: data.jurisdictions.length,
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: pillar-one, pillar-two-globe, digital-profit-split` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in Digital Economy Module API:", error);
    return NextResponse.json(
      { error: "Failed to process digital economy calculation" },
      { status: 500 }
    );
  }
}
