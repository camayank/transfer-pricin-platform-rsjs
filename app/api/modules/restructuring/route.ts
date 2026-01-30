import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  BusinessRestructuringModule,
  createBusinessRestructuringModule,
  RestructuringType,
  ValuationMethod,
} from "@/lib/engines/modules/restructuring-module";

// =============================================================================
// BUSINESS RESTRUCTURING MODULE API
// Exit charges, termination payments, intangibles transfer, going concern
// =============================================================================

interface RestructuringAnalysisRequest {
  restructuringType: string;
  transferor: {
    name: string;
    jurisdiction: string;
    functionalProfile: string;
    preRestructuringRole: string;
    postRestructuringRole: string;
  };
  transferee: {
    name: string;
    jurisdiction: string;
    functionalProfile: string;
    preRestructuringRole: string;
    postRestructuringRole: string;
  };
  effectiveDate: string;
  assets?: {
    assetType: "tangible" | "intangible" | "financial";
    description: string;
    bookValue: number;
    fairMarketValue?: number;
    usefulLife?: number;
  }[];
  functions?: {
    function: string;
    description: string;
    resourcesTransferred: number;
    annualCost: number;
  }[];
  risks?: {
    riskType: string;
    description: string;
    riskValue: number;
  }[];
  contracts?: {
    contractType: string;
    counterparty: string;
    terminationClause: string;
    estimatedCompensation: number;
  }[];
  financials: {
    preRestructuringProfit: number;
    preRestructuringRevenue: number;
    projectedPostRestructuringProfit: number;
    profitPotentialTransferred: number;
    terminalValue?: number;
    discountRate?: number;
    projectionPeriod?: number;
  };
  businessJustification: string;
}

interface ExitChargeRequest {
  restructuringType: string;
  preRestructuringProfit: number;
  postRestructuringProfit: number;
  profitPotentialTransferred: number;
  assetsTransferred: {
    type: string;
    value: number;
  }[];
  discountRate: number;
  projectionYears: number;
}

interface TerminationPaymentRequest {
  contracts: {
    contractType: string;
    counterparty: string;
    remainingTermMonths: number;
    annualBenefit: number;
    terminationClause: string;
  }[];
  effectiveDate: string;
}

// GET /api/modules/restructuring - Get available capabilities
export async function GET() {
  return NextResponse.json({
    module: "Business Restructuring Module",
    version: "1.0.0",
    description: "Transfer pricing analysis for business restructurings per OECD Chapter IX",
    restructuringTypes: Object.values(RestructuringType),
    valuationMethods: Object.values(ValuationMethod),
    capabilities: [
      {
        endpoint: "POST /api/modules/restructuring",
        action: "full-analysis",
        description: "Complete restructuring analysis including exit charge, termination payments, and going concern",
        requiredFields: ["restructuringType", "transferor", "transferee", "effectiveDate", "financials", "businessJustification"],
        oecdReference: "Chapter IX - Business Restructurings",
      },
      {
        endpoint: "POST /api/modules/restructuring",
        action: "exit-charge",
        description: "Calculate exit charge for profit potential transferred",
        requiredFields: ["restructuringType", "preRestructuringProfit", "postRestructuringProfit", "profitPotentialTransferred"],
        oecdReference: "Chapter IX, Paragraphs 9.68-9.93",
      },
      {
        endpoint: "POST /api/modules/restructuring",
        action: "termination-payment",
        description: "Calculate termination payments for affected contracts",
        requiredFields: ["contracts", "effectiveDate"],
        oecdReference: "Chapter IX, Paragraphs 9.94-9.112",
      },
      {
        endpoint: "POST /api/modules/restructuring",
        action: "going-concern",
        description: "Value going concern for business sale/transfer",
        requiredFields: ["financials", "assets", "functions"],
        oecdReference: "Chapter IX, Paragraphs 9.113-9.120",
      },
    ],
    examples: {
      "exit-charge": {
        action: "exit-charge",
        restructuringType: "conversion_to_lrd",
        preRestructuringProfit: 100000000,
        postRestructuringProfit: 20000000,
        profitPotentialTransferred: 80000000,
        assetsTransferred: [
          { type: "customer_relationships", value: 50000000 },
          { type: "know_how", value: 30000000 },
        ],
        discountRate: 12,
        projectionYears: 5,
      },
    },
  });
}

// POST /api/modules/restructuring - Execute restructuring calculations
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
        { error: "Action is required. Valid actions: full-analysis, exit-charge, termination-payment, going-concern" },
        { status: 400 }
      );
    }

    const restructuringModule = createBusinessRestructuringModule();

    switch (action) {
      case "full-analysis": {
        const data = body as RestructuringAnalysisRequest & { action: string };

        if (!data.restructuringType || !data.transferor || !data.transferee || !data.effectiveDate || !data.financials) {
          return NextResponse.json(
            { error: "Missing required fields: restructuringType, transferor, transferee, effectiveDate, financials" },
            { status: 400 }
          );
        }

        const input = {
          restructuringType: data.restructuringType as RestructuringType,
          transferor: {
            ...data.transferor,
          },
          transferee: {
            ...data.transferee,
          },
          effectiveDate: new Date(data.effectiveDate),
          assets: (data.assets || []).map(a => ({
            ...a,
            transferDate: new Date(data.effectiveDate),
          })),
          functions: (data.functions || []).map(f => ({
            ...f,
            preRestructuringEntity: data.transferor.name,
            postRestructuringEntity: data.transferee.name,
          })),
          risks: (data.risks || []).map(r => ({
            ...r,
            preRestructuringBearer: data.transferor.name,
            postRestructuringBearer: data.transferee.name,
          })),
          contracts: (data.contracts || []).map(c => ({
            ...c,
            compensationProvision: c.terminationClause,
          })),
          financials: {
            ...data.financials,
            terminalValue: data.financials.terminalValue || data.financials.profitPotentialTransferred * 5,
            discountRate: data.financials.discountRate || 12,
            projectionPeriod: data.financials.projectionPeriod || 5,
          },
          businessJustification: data.businessJustification,
        };

        const result = restructuringModule.analyzeRestructuring(input);

        return NextResponse.json({
          success: true,
          action: "full-analysis",
          result: {
            ...result,
            summary: {
              restructuringType: data.restructuringType,
              totalCompensation: result.totalCompensation.toLocaleString(),
              armLengthRange: `${result.armLengthRange.min.toLocaleString()} - ${result.armLengthRange.max.toLocaleString()}`,
              componentsIncluded: {
                exitCharge: result.exitCharge.applicable,
                terminationPayment: result.terminationPayment.applicable,
                goingConcern: result.goingConcernValue.applicable,
                intangiblesTransfer: result.intangiblesTransfer.totalValue > 0,
              },
            },
          },
        });
      }

      case "exit-charge": {
        const data = body as ExitChargeRequest & { action: string };

        if (!data.restructuringType || data.preRestructuringProfit === undefined || data.profitPotentialTransferred === undefined) {
          return NextResponse.json(
            { error: "Missing required fields: restructuringType, preRestructuringProfit, profitPotentialTransferred" },
            { status: 400 }
          );
        }

        // Create minimal input for exit charge calculation
        const input = {
          restructuringType: data.restructuringType as RestructuringType,
          transferor: { name: "Transferor", jurisdiction: "IN", functionalProfile: "Full-fledged", preRestructuringRole: "Full risk", postRestructuringRole: "Limited risk" },
          transferee: { name: "Transferee", jurisdiction: "Foreign", functionalProfile: "Principal", preRestructuringRole: "Limited", postRestructuringRole: "Full risk" },
          effectiveDate: new Date(),
          assets: (data.assetsTransferred || []).map(a => ({
            assetType: "intangible" as const,
            description: a.type,
            bookValue: a.value * 0.5,
            fairMarketValue: a.value,
            transferDate: new Date(),
          })),
          functions: [],
          risks: [],
          contracts: [],
          financials: {
            preRestructuringProfit: data.preRestructuringProfit,
            preRestructuringRevenue: data.preRestructuringProfit * 10,
            projectedPostRestructuringProfit: data.postRestructuringProfit || data.preRestructuringProfit * 0.2,
            profitPotentialTransferred: data.profitPotentialTransferred,
            terminalValue: data.profitPotentialTransferred * 5,
            discountRate: data.discountRate || 12,
            projectionPeriod: data.projectionYears || 5,
          },
          businessJustification: "Business restructuring for operational efficiency",
        };

        const result = restructuringModule.calculateExitCharge(input);

        return NextResponse.json({
          success: true,
          action: "exit-charge",
          result: {
            ...result,
            summary: {
              exitChargeApplicable: result.applicable,
              chargeAmount: result.chargeAmount.toLocaleString(),
              componentsCount: result.components.length,
              valuationApproach: result.valuationApproach,
            },
          },
        });
      }

      case "termination-payment": {
        const data = body as TerminationPaymentRequest & { action: string };

        if (!data.contracts || data.contracts.length === 0) {
          return NextResponse.json(
            { error: "Missing required fields: contracts (array with at least one contract)" },
            { status: 400 }
          );
        }

        const input = {
          restructuringType: RestructuringType.TERMINATION,
          transferor: { name: "Transferor", jurisdiction: "IN", functionalProfile: "Full", preRestructuringRole: "Contractor", postRestructuringRole: "N/A" },
          transferee: { name: "Transferee", jurisdiction: "Foreign", functionalProfile: "Principal", preRestructuringRole: "Principal", postRestructuringRole: "Principal" },
          effectiveDate: new Date(data.effectiveDate || Date.now()),
          assets: [],
          functions: [],
          risks: [],
          contracts: data.contracts.map(c => ({
            contractType: c.contractType,
            counterparty: c.counterparty,
            terminationDate: new Date(data.effectiveDate || Date.now()),
            terminationClause: c.terminationClause,
            compensationProvision: c.terminationClause,
            estimatedCompensation: c.annualBenefit * (c.remainingTermMonths / 12),
          })),
          financials: {
            preRestructuringProfit: 0,
            preRestructuringRevenue: 0,
            projectedPostRestructuringProfit: 0,
            profitPotentialTransferred: 0,
            terminalValue: 0,
            discountRate: 10,
            projectionPeriod: 5,
          },
          businessJustification: "Contract termination",
        };

        const result = restructuringModule.calculateTerminationPayment(input);

        return NextResponse.json({
          success: true,
          action: "termination-payment",
          result: {
            ...result,
            summary: {
              applicable: result.applicable,
              totalPayment: result.paymentAmount.toLocaleString(),
              contractsAnalyzed: result.contracts.length,
            },
          },
        });
      }

      case "going-concern": {
        const data = body as RestructuringAnalysisRequest & { action: string };

        if (!data.financials) {
          return NextResponse.json(
            { error: "Missing required fields: financials" },
            { status: 400 }
          );
        }

        const input = {
          restructuringType: RestructuringType.BUSINESS_SALE,
          transferor: data.transferor || { name: "Seller", jurisdiction: "IN", functionalProfile: "Full", preRestructuringRole: "Owner", postRestructuringRole: "N/A" },
          transferee: data.transferee || { name: "Buyer", jurisdiction: "Foreign", functionalProfile: "Principal", preRestructuringRole: "N/A", postRestructuringRole: "Owner" },
          effectiveDate: new Date(data.effectiveDate || Date.now()),
          assets: (data.assets || []).map(a => ({
            ...a,
            transferDate: new Date(data.effectiveDate || Date.now()),
          })),
          functions: (data.functions || []).map(f => ({
            ...f,
            preRestructuringEntity: "Seller",
            postRestructuringEntity: "Buyer",
          })),
          risks: [],
          contracts: [],
          financials: {
            ...data.financials,
            terminalValue: data.financials.terminalValue || data.financials.preRestructuringProfit * 8,
            discountRate: data.financials.discountRate || 12,
            projectionPeriod: data.financials.projectionPeriod || 5,
          },
          businessJustification: data.businessJustification || "Business sale transaction",
        };

        const result = restructuringModule.calculateGoingConcernValue(input);

        return NextResponse.json({
          success: true,
          action: "going-concern",
          result: {
            ...result,
            summary: {
              applicable: result.applicable,
              goingConcernValue: result.value.toLocaleString(),
              valuationMethod: "Discounted Cash Flow",
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: full-analysis, exit-charge, termination-payment, going-concern` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in Restructuring Module API:", error);
    return NextResponse.json(
      { error: "Failed to process restructuring calculation" },
      { status: 500 }
    );
  }
}
