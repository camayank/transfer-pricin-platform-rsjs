import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createBFSIModule, BFSITransactionType } from "@/lib/engines/modules/bfsi-module";

// =============================================================================
// BFSI INDUSTRY MODULE API
// Banking, Financial Services & Insurance specific TP calculations
// =============================================================================

interface LoanPricingRequest {
  principal: number;
  currency: string;
  borrowerCreditRating: string;
  tenorMonths: number;
  securityType: "secured" | "unsecured";
  lenderType: "bank" | "nbfc" | "group_company";
  purpose: string;
  repaymentStructure: "bullet" | "amortizing" | "balloon";
}

interface GuaranteePricingRequest {
  guaranteeType: string;  // BFSITransactionType enum value
  guaranteeAmount: number;
  currency: string;
  beneficiaryCreditRating: string;
  guarantorCreditRating: string;
  tenorMonths: number;
  securityProvided: boolean;
  probabilityOfDefault?: number;
}

interface CaptiveInsuranceRequest {
  coverageType: string;
  sumInsured: number;
  currency?: string;
  industryType: string;
  claimsHistory: "good" | "average" | "poor";
  riskFactors: string[];
  deductible: number;
  indemnityPeriod?: number;
}

interface CashPoolRequest {
  poolType: "notional" | "physical" | "zero_balancing";
  participatingEntities: {
    entityName: string;
    jurisdiction: string;
    averagePosition: number;
    creditRating: string;
    currency: string;
  }[];
  poolLeaderCurrency: string;
  interestRateBasis: string;
  spreadAllocation: "benefit_sharing" | "risk_based" | "fixed";
}

// GET /api/modules/bfsi - Get available BFSI capabilities
export async function GET() {
  return NextResponse.json({
    module: "BFSI Industry Module",
    version: "1.0.0",
    description: "Specialized transfer pricing tools for Banking, Financial Services & Insurance sector",
    capabilities: [
      {
        endpoint: "POST /api/modules/bfsi",
        action: "loan-pricing",
        description: "Calculate arm's length interest rate for intercompany loans",
        requiredFields: ["principal", "currency", "borrowerCreditRating", "tenorMonths", "securityType", "lenderType", "purpose", "repaymentStructure"],
        oecdReference: "Chapter X - Financial Transactions",
      },
      {
        endpoint: "POST /api/modules/bfsi",
        action: "guarantee-pricing",
        description: "Calculate arm's length fee for corporate guarantees",
        requiredFields: ["guaranteeAmount", "tenorMonths", "guaranteeType", "guarantorCreditRating", "beneficiaryCreditRating"],
        oecdReference: "Chapter X - Financial Guarantees",
      },
      {
        endpoint: "POST /api/modules/bfsi",
        action: "captive-insurance",
        description: "Calculate arm's length premium for captive insurance arrangements",
        requiredFields: ["coverageType", "sumInsured", "deductible", "industryRisk"],
        oecdReference: "Chapter X - Captive Insurance",
      },
      {
        endpoint: "POST /api/modules/bfsi",
        action: "cash-pool-analysis",
        description: "Analyze cash pooling arrangements for arm's length compliance",
        requiredFields: ["poolType", "participantEntities", "poolCurrency", "headerCreditRating"],
        oecdReference: "Chapter X - Cash Pooling",
      },
    ],
    examples: {
      "loan-pricing": {
        action: "loan-pricing",
        currency: "USD",
        principalAmount: 10000000,
        tenorMonths: 36,
        borrowerCreditRating: "BBB",
        securityType: "unsecured",
      },
    },
  });
}

// POST /api/modules/bfsi - Execute BFSI calculations
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
        { error: "Action is required. Valid actions: loan-pricing, guarantee-pricing, captive-insurance, cash-pool-analysis" },
        { status: 400 }
      );
    }

    const bfsiModule = createBFSIModule();

    switch (action) {
      case "loan-pricing": {
        const data = body as LoanPricingRequest & { action: string };

        if (!data.currency || !data.principal || !data.tenorMonths || !data.borrowerCreditRating || !data.securityType) {
          return NextResponse.json(
            { error: "Missing required fields: principal, currency, borrowerCreditRating, tenorMonths, securityType, lenderType, purpose, repaymentStructure" },
            { status: 400 }
          );
        }

        const result = bfsiModule.priceIntercompanyLoan({
          principal: data.principal,
          currency: data.currency,
          borrowerCreditRating: data.borrowerCreditRating,
          tenorMonths: data.tenorMonths,
          securityType: data.securityType,
          lenderType: data.lenderType || "group_company",
          purpose: data.purpose || "Working capital",
          repaymentStructure: data.repaymentStructure || "bullet",
        });

        return NextResponse.json({
          success: true,
          action: "loan-pricing",
          result: {
            ...result,
            summary: {
              recommendedRateRange: `${result.recommendedRate.min.toFixed(2)}% - ${result.recommendedRate.max.toFixed(2)}%`,
              midpointRate: `${result.rateBreakdown.totalRate.toFixed(2)}%`,
              annualInterest: Math.round(data.principal * result.rateBreakdown.totalRate / 100),
            },
          },
        });
      }

      case "guarantee-pricing": {
        const data = body as GuaranteePricingRequest & { action: string };

        if (!data.guaranteeAmount || !data.tenorMonths || !data.guarantorCreditRating || !data.beneficiaryCreditRating) {
          return NextResponse.json(
            { error: "Missing required fields: guaranteeType, guaranteeAmount, currency, beneficiaryCreditRating, guarantorCreditRating, tenorMonths, securityProvided" },
            { status: 400 }
          );
        }

        const result = bfsiModule.priceGuarantee({
          guaranteeType: (data.guaranteeType || "corporate_guarantee") as BFSITransactionType,
          guaranteeAmount: data.guaranteeAmount,
          currency: data.currency || "INR",
          beneficiaryCreditRating: data.beneficiaryCreditRating,
          guarantorCreditRating: data.guarantorCreditRating,
          tenorMonths: data.tenorMonths,
          securityProvided: data.securityProvided ?? false,
          probabilityOfDefault: data.probabilityOfDefault,
        });

        return NextResponse.json({
          success: true,
          action: "guarantee-pricing",
          result: {
            ...result,
            summary: {
              recommendedFeeRange: `${(result.recommendedFee.min * 100).toFixed(2)}% - ${(result.recommendedFee.max * 100).toFixed(2)}%`,
              totalFee: `${(result.feeBreakdown.totalFee * 100).toFixed(2)}%`,
              annualFeeAmount: Math.round(data.guaranteeAmount * result.feeBreakdown.totalFee),
            },
          },
        });
      }

      case "captive-insurance": {
        const data = body as CaptiveInsuranceRequest & { action: string };

        if (!data.coverageType || !data.sumInsured || data.deductible === undefined || !data.industryType || !data.claimsHistory) {
          return NextResponse.json(
            { error: "Missing required fields: coverageType, sumInsured, currency, industryType, claimsHistory, riskFactors, deductible" },
            { status: 400 }
          );
        }

        const result = bfsiModule.priceCaptiveInsurance({
          coverageType: data.coverageType,
          sumInsured: data.sumInsured,
          currency: data.currency || "INR",
          industryType: data.industryType,
          claimsHistory: data.claimsHistory,
          riskFactors: data.riskFactors || [],
          deductible: data.deductible,
          indemnityPeriod: data.indemnityPeriod,
        });

        return NextResponse.json({
          success: true,
          action: "captive-insurance",
          result: {
            ...result,
            summary: {
              recommendedPremiumRange: `${result.recommendedPremium.min.toLocaleString()} - ${result.recommendedPremium.max.toLocaleString()}`,
              totalPremium: result.premiumBreakdown.totalPremium.toLocaleString(),
              rateOnSum: `${((result.premiumBreakdown.totalPremium / data.sumInsured) * 100).toFixed(3)}%`,
            },
          },
        });
      }

      case "cash-pool-analysis": {
        const data = body as CashPoolRequest & { action: string };

        if (!data.poolType || !data.participatingEntities || !data.poolLeaderCurrency) {
          return NextResponse.json(
            { error: "Missing required fields: poolType, participatingEntities, poolLeaderCurrency, interestRateBasis, spreadAllocation" },
            { status: 400 }
          );
        }

        const result = bfsiModule.analyzeCashPool({
          poolType: data.poolType,
          participatingEntities: data.participatingEntities,
          poolLeaderCurrency: data.poolLeaderCurrency,
          interestRateBasis: data.interestRateBasis || "SOFR",
          spreadAllocation: data.spreadAllocation || "benefit_sharing",
        });

        return NextResponse.json({
          success: true,
          action: "cash-pool-analysis",
          result: {
            ...result,
            summary: {
              poolType: data.poolType,
              participantCount: data.participatingEntities.length,
              totalPoolPosition: data.participatingEntities.reduce((sum, e) => sum + e.averagePosition, 0).toLocaleString(),
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: loan-pricing, guarantee-pricing, captive-insurance, cash-pool-analysis` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in BFSI Module API:", error);
    return NextResponse.json(
      { error: "Failed to process BFSI calculation" },
      { status: 500 }
    );
  }
}
