/**
 * Interest Rates API
 * Benchmark interest rates for TP loan pricing
 */

import { NextRequest, NextResponse } from "next/server";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";
import {
  createInterestRateEngine,
  InterestRateType,
  InterestRateCurrency,
  INTEREST_RATE_ENGINE_VERSION
} from "@/lib/engines/interest-rate-engine";

const engine = createInterestRateEngine();

/**
 * GET /api/rates/interest
 * Get capabilities and supported rates
 */
export async function GET() {
  // Check authentication and permission
  const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
  if (!authorized) return error;

  return NextResponse.json({
    status: "ready",
    version: INTEREST_RATE_ENGINE_VERSION,
    supportedRateTypes: engine.getSupportedRateTypes(),
    capabilities: {
      currentRates: true,
      historicalRates: true,
      loanBenchmarking: true,
      safeHarbourCheck: true,
      trendAnalysis: true
    },
    actions: [
      "get_rate",
      "get_rates_by_currency",
      "get_all_rates",
      "get_historical",
      "benchmark_loan",
      "check_safe_harbour",
      "analyze_trend",
      "compare_currencies",
      "calculate_loan_pricing"
    ],
    sources: ["NY Fed (SOFR)", "FBIL (MIBOR)", "EMMI (EURIBOR)", "RBI", "SBI"]
  });
}

/**
 * POST /api/rates/interest
 * Perform interest rate actions
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
    if (!authorized) return error;

    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing 'action' field" },
        { status: 400 }
      );
    }

    switch (action) {
      case "get_rate": {
        if (!params?.rateType) {
          return NextResponse.json(
            { error: "Missing 'rateType' parameter" },
            { status: 400 }
          );
        }

        const rate = await engine.getRate(params.rateType as InterestRateType);
        return NextResponse.json({
          success: true,
          data: rate
        });
      }

      case "get_rates_by_currency": {
        if (!params?.currency) {
          return NextResponse.json(
            { error: "Missing 'currency' parameter. Valid: USD, INR, EUR, GBP" },
            { status: 400 }
          );
        }

        const rates = await engine.getRatesForCurrency(params.currency as InterestRateCurrency);
        return NextResponse.json({
          success: true,
          data: {
            currency: params.currency,
            rates,
            count: rates.length
          }
        });
      }

      case "get_all_rates": {
        const result = await engine.getAllBenchmarkRates();
        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "get_historical": {
        if (!params?.rateType || !params?.startDate || !params?.endDate) {
          return NextResponse.json(
            { error: "Missing 'rateType', 'startDate', or 'endDate' parameter" },
            { status: 400 }
          );
        }

        const rates = await engine.getHistoricalRates({
          rateType: params.rateType as InterestRateType,
          startDate: params.startDate,
          endDate: params.endDate
        });

        return NextResponse.json({
          success: true,
          data: {
            rateType: params.rateType,
            rates,
            count: rates.length,
            period: { start: params.startDate, end: params.endDate }
          }
        });
      }

      case "benchmark_loan": {
        if (!params?.loanAmount || !params?.currency || !params?.tenor) {
          return NextResponse.json(
            { error: "Missing required loan parameters" },
            { status: 400 }
          );
        }

        const result = await engine.benchmarkTPLoan({
          loanAmount: params.loanAmount,
          currency: params.currency as InterestRateCurrency,
          tenor: params.tenor,
          loanType: params.loanType ?? "intercompany",
          borrowerCreditRating: params.borrowerCreditRating,
          lenderCreditRating: params.lenderCreditRating,
          secured: params.secured ?? false,
          relatedParty: params.relatedParty ?? true
        });

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "check_safe_harbour": {
        if (!params?.currency || !params?.creditRating || params?.proposedSpread === undefined) {
          return NextResponse.json(
            { error: "Missing 'currency', 'creditRating', or 'proposedSpread' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.checkSafeHarbourLoan(
          params.currency as InterestRateCurrency,
          params.creditRating,
          params.proposedSpread
        );

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "analyze_trend": {
        if (!params?.rateType) {
          return NextResponse.json(
            { error: "Missing 'rateType' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.analyzeRateTrend(
          params.rateType as InterestRateType,
          params.periodDays ?? 90
        );

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "compare_currencies": {
        const result = await engine.compareRatesAcrossCurrencies();
        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "calculate_loan_pricing": {
        if (!params?.principal || !params?.benchmarkRate || params?.spread === undefined) {
          return NextResponse.json(
            { error: "Missing 'principal', 'benchmarkRate', or 'spread' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.calculateLoanPricing({
          principal: params.principal,
          currency: (params.currency ?? "USD") as InterestRateCurrency,
          tenor: params.tenor ?? 12,
          benchmarkRate: params.benchmarkRate as InterestRateType,
          spread: params.spread
        });

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "get_recommended_benchmark": {
        if (!params?.currency) {
          return NextResponse.json(
            { error: "Missing 'currency' parameter" },
            { status: 400 }
          );
        }

        const benchmark = engine.getRecommendedBenchmark(params.currency as InterestRateCurrency);
        const rateInfo = engine.getRateInfo(benchmark);

        return NextResponse.json({
          success: true,
          data: {
            currency: params.currency,
            recommendedBenchmark: benchmark,
            info: rateInfo
          }
        });
      }

      case "test_connections": {
        const result = await engine.testConnections();
        return NextResponse.json({
          success: true,
          data: result
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Interest Rate API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
