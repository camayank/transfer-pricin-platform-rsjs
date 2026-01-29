/**
 * Forex Rates API
 * Currency conversion and exchange rates
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createForexEngine,
  CurrencyCode,
  FOREX_ENGINE_VERSION
} from "@/lib/engines/forex-engine";

const engine = createForexEngine();

/**
 * GET /api/rates/forex
 * Get capabilities and supported currencies
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    version: FOREX_ENGINE_VERSION,
    supportedCurrencies: engine.getSupportedCurrencies(),
    capabilities: {
      convert: true,
      multiConvert: true,
      historicalRates: true,
      averageRate: true,
      compareRates: true
    },
    actions: [
      "get_rate",
      "convert",
      "convert_multiple",
      "get_historical",
      "get_average",
      "compare_sources",
      "get_tp_rates",
      "get_all_inr"
    ],
    sources: ["RBI", "ECB"]
  });
}

/**
 * POST /api/rates/forex
 * Perform forex actions
 */
export async function POST(request: NextRequest) {
  try {
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
        if (!params?.baseCurrency || !params?.quoteCurrency) {
          return NextResponse.json(
            { error: "Missing 'baseCurrency' or 'quoteCurrency' parameter" },
            { status: 400 }
          );
        }

        const rate = await engine.getRate(
          params.baseCurrency as CurrencyCode,
          params.quoteCurrency as CurrencyCode
        );

        return NextResponse.json({
          success: true,
          data: rate
        });
      }

      case "convert": {
        if (!params?.fromCurrency || !params?.toCurrency || params?.amount === undefined) {
          return NextResponse.json(
            { error: "Missing 'fromCurrency', 'toCurrency', or 'amount' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.convert({
          fromCurrency: params.fromCurrency as CurrencyCode,
          toCurrency: params.toCurrency as CurrencyCode,
          amount: params.amount
        });

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "convert_multiple": {
        if (!params?.baseCurrency || !params?.targetCurrencies || !params?.amount) {
          return NextResponse.json(
            { error: "Missing 'baseCurrency', 'targetCurrencies', or 'amount' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.convertMultiple({
          baseCurrency: params.baseCurrency as CurrencyCode,
          targetCurrencies: params.targetCurrencies as CurrencyCode[],
          amount: params.amount
        });

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "get_historical": {
        if (!params?.baseCurrency || !params?.quoteCurrency || !params?.startDate || !params?.endDate) {
          return NextResponse.json(
            { error: "Missing required parameters for historical rates" },
            { status: 400 }
          );
        }

        const rates = await engine.getHistoricalRates({
          baseCurrency: params.baseCurrency as CurrencyCode,
          quoteCurrency: params.quoteCurrency as CurrencyCode,
          startDate: params.startDate,
          endDate: params.endDate
        });

        return NextResponse.json({
          success: true,
          data: {
            rates,
            count: rates.length,
            period: { start: params.startDate, end: params.endDate }
          }
        });
      }

      case "get_average": {
        if (!params?.baseCurrency || !params?.quoteCurrency || !params?.startDate || !params?.endDate) {
          return NextResponse.json(
            { error: "Missing required parameters for average rate" },
            { status: 400 }
          );
        }

        const result = await engine.getAverageRate({
          baseCurrency: params.baseCurrency as CurrencyCode,
          quoteCurrency: params.quoteCurrency as CurrencyCode,
          startDate: params.startDate,
          endDate: params.endDate
        });

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "get_fy_average": {
        if (!params?.baseCurrency || !params?.quoteCurrency || !params?.financialYear) {
          return NextResponse.json(
            { error: "Missing 'baseCurrency', 'quoteCurrency', or 'financialYear' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.getFinancialYearAverageRate(
          params.baseCurrency as CurrencyCode,
          params.quoteCurrency as CurrencyCode,
          params.financialYear
        );

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "compare_sources": {
        if (!params?.baseCurrency || !params?.quoteCurrency) {
          return NextResponse.json(
            { error: "Missing 'baseCurrency' or 'quoteCurrency' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.compareRates(
          params.baseCurrency as CurrencyCode,
          params.quoteCurrency as CurrencyCode
        );

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "get_tp_rates": {
        const result = await engine.getTPComplianceRates();
        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "get_all_inr": {
        const rates = await engine.getAllINRRates();
        return NextResponse.json({
          success: true,
          data: {
            rates,
            asOf: new Date().toISOString(),
            count: rates.length
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
    console.error("Forex API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
