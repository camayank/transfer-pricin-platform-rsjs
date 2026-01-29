/**
 * ================================================================================
 * DIGICOMPLY AI API
 * Accounting Connector AI-Enhanced Endpoint
 *
 * POST /api/ai/accounting - AI-enhanced transaction classification and analysis
 * GET /api/ai/accounting - Get available Accounting AI capabilities
 * ================================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createAccountingConnectorAIService,
  TransactionClassificationResult,
  RelatedPartyDetectionResult,
  NatureCodeRecommendation,
  FinancialAnomalyResult,
  EnhancedFinancialStatement,
} from "@/lib/engines/accounting-connector-ai";
import { AccountType, AccountingSystem } from "@/lib/engines/accounting-connector-engine";
import { isAIConfigured } from "@/lib/ai";

// =============================================================================
// GET - Capabilities Info
// =============================================================================

export async function GET() {
  const configured = isAIConfigured();

  return NextResponse.json({
    status: configured ? "ready" : "not_configured",
    capabilities: {
      transactionClassification: true,
      relatedPartyDetection: true,
      natureCodeRecommendation: true,
      financialAnomalyDetection: true,
      enhancedFinancialData: true,
    },
    actions: [
      "classify_transactions",
      "detect_related_parties",
      "recommend_nature_codes",
      "detect_anomalies",
      "enhanced_financial_data",
    ],
    supportedSystems: ["tally", "zoho"],
    message: configured
      ? "Accounting AI service is ready"
      : "AI not configured - rule-based classification will be used",
  });
}

// =============================================================================
// POST - AI-Enhanced Accounting Analysis
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

    const service = createAccountingConnectorAIService();
    const aiConfigured = isAIConfigured();

    switch (action) {
      // =======================================================================
      // TRANSACTION CLASSIFICATION
      // =======================================================================
      case "classify_transactions": {
        if (!params?.transactions || !Array.isArray(params.transactions)) {
          return NextResponse.json(
            { error: "transactions array is required. Each transaction needs: id, description, amount" },
            { status: 400 }
          );
        }

        // Map transactions to expected format
        const transactions = params.transactions.map((t: Record<string, unknown>) => ({
          id: String(t.id || t.transactionId || ""),
          description: String(t.description || ""),
          amount: Number(t.amount || 0),
          partyName: t.partyName ? String(t.partyName) : undefined,
          accountType: t.accountType as AccountType | undefined,
        }));

        const results = await service.classifyTransactions(transactions);

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured,
          result: {
            classifications: results,
            summary: {
              total: results.length,
              relatedPartyCount: results.filter((r) => r.isRelatedParty).length,
            },
          },
        });
      }

      // =======================================================================
      // RELATED PARTY DETECTION
      // =======================================================================
      case "detect_related_parties": {
        if (!params?.accounts || !Array.isArray(params.accounts)) {
          return NextResponse.json(
            { error: "accounts array is required. Each account needs: accountName, accountType, closingDebit, closingCredit" },
            { status: 400 }
          );
        }

        // Map accounts to expected format
        const accounts = params.accounts.map((a: Record<string, unknown>) => ({
          accountName: String(a.accountName || ""),
          accountType: (a.accountType as AccountType) || AccountType.OPERATING_EXPENSE,
          openingDebit: Number(a.openingDebit || 0),
          openingCredit: Number(a.openingCredit || 0),
          closingDebit: Number(a.closingDebit || 0),
          closingCredit: Number(a.closingCredit || 0),
        }));

        const results = await service.detectRelatedParties(accounts);

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured,
          result: {
            detectedParties: results,
            summary: {
              total: results.length,
              highConfidence: results.filter((r) => r.confidence === "high").length,
            },
          },
        });
      }

      // =======================================================================
      // NATURE CODE RECOMMENDATION
      // =======================================================================
      case "recommend_nature_codes": {
        if (!params?.transactions || !Array.isArray(params.transactions)) {
          return NextResponse.json(
            { error: "transactions array is required. Each transaction needs: description, amount, partyName, partyCountry" },
            { status: 400 }
          );
        }

        // Map transactions to expected format
        const transactions = params.transactions.map((t: Record<string, unknown>) => ({
          description: String(t.description || ""),
          amount: Number(t.amount || 0),
          partyName: String(t.partyName || "Unknown"),
          partyCountry: String(t.partyCountry || "Unknown"),
        }));

        const results = await service.recommendNatureCodes(transactions);

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured,
          result: {
            recommendations: results,
          },
        });
      }

      // =======================================================================
      // FINANCIAL ANOMALY DETECTION
      // =======================================================================
      case "detect_anomalies": {
        if (!params?.companyName || !params?.financialYear) {
          return NextResponse.json(
            { error: "companyName and financialYear are required" },
            { status: 400 }
          );
        }

        // Build financial statement object with all required properties
        const totalRevenue = Number(params.totalRevenue || 0);
        const operatingCost = Number(params.operatingCost || 0);
        const operatingProfit = Number(params.operatingProfit || (totalRevenue - operatingCost));
        const employeeCost = Number(params.employeeCost || 0);
        const depreciation = Number(params.depreciation || 0);
        const exportRevenue = Number(params.exportRevenue || 0);

        const statement = {
          companyName: String(params.companyName),
          financialYear: String(params.financialYear),
          currency: String(params.currency || "INR"),
          sourceSystem: AccountingSystem.TALLY_PRIME,
          extractionDate: new Date().toISOString(),
          accounts: [],
          // P&L
          totalRevenue,
          exportRevenue,
          domesticRevenue: totalRevenue - exportRevenue,
          costOfGoodsSold: Number(params.costOfGoodsSold || 0),
          grossProfit: Number(params.grossProfit || totalRevenue),
          operatingExpenses: operatingCost,
          employeeCost,
          depreciation,
          otherOperatingExpenses: operatingCost - employeeCost - depreciation,
          operatingProfit,
          otherIncome: Number(params.otherIncome || 0),
          otherExpenses: Number(params.otherExpenses || 0),
          profitBeforeTax: Number(params.profitBeforeTax || operatingProfit),
          taxExpense: Number(params.taxExpense || 0),
          profitAfterTax: Number(params.profitAfterTax || operatingProfit),
          // Balance Sheet
          totalAssets: Number(params.totalAssets || 0),
          fixedAssets: Number(params.fixedAssets || 0),
          currentAssets: Number(params.currentAssets || 0),
          totalLiabilities: Number(params.totalLiabilities || 0),
          currentLiabilities: Number(params.currentLiabilities || 0),
          longTermLiabilities: Number(params.longTermLiabilities || 0),
          shareholdersEquity: Number(params.shareholdersEquity || 0),
          capitalEmployed: Number(params.capitalEmployed || 0),
          // Related party
          relatedPartyTransactions: params.relatedPartyTransactions || [],
          totalRPTValue: Number(params.totalRPT || 0),
          rptAsPercentage: totalRevenue > 0 ? (Number(params.totalRPT || 0) / totalRevenue) * 100 : 0,
        };

        const benchmarks = params.industryBenchmarks
          ? {
              avgOpMargin: Number(params.industryBenchmarks.avgOpMargin || 15),
              avgRptPercentage: Number(params.industryBenchmarks.avgRptPercentage || 50),
            }
          : undefined;

        const result = await service.detectFinancialAnomalies(statement, benchmarks);

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured,
          result: formatAnomalyResult(result),
        });
      }

      // =======================================================================
      // ENHANCED FINANCIAL DATA
      // =======================================================================
      case "enhanced_financial_data": {
        if (!params?.accountingSystem || !params?.companyName || !params?.financialYear) {
          return NextResponse.json(
            { error: "accountingSystem (tally/zoho), companyName, and financialYear are required" },
            { status: 400 }
          );
        }

        const system = params.accountingSystem === "zoho"
          ? AccountingSystem.ZOHO_BOOKS
          : AccountingSystem.TALLY_PRIME;

        const fy = String(params.financialYear);
        const fyParts = fy.split("-");
        const fromDate = params.fromDate || `${fyParts[0]}-04-01`;
        const toDate = params.toDate || `20${fyParts[1]}-03-31`;

        const result = await service.extractEnhancedFinancialData(
          system,
          String(params.companyName),
          fy,
          fromDate,
          toDate
        );

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured,
          result: formatEnhancedDataResult(result),
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            availableActions: [
              "classify_transactions",
              "detect_related_parties",
              "recommend_nature_codes",
              "detect_anomalies",
              "enhanced_financial_data",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Accounting AI API Error:", error);
    return NextResponse.json(
      {
        error: "Accounting AI analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// Response Formatters
// =============================================================================

function formatAnomalyResult(result: FinancialAnomalyResult) {
  return {
    anomalies: result.anomalies,
    riskAssessment: result.overallRiskAssessment,
    documentationGaps: result.documentationGaps,
    recommendations: result.recommendations,
    aiGenerated: result.aiGenerated,
  };
}

function formatEnhancedDataResult(result: EnhancedFinancialStatement) {
  return {
    financialStatement: {
      companyName: result.companyName,
      financialYear: result.financialYear,
      extractionDate: result.extractionDate,
      totalRevenue: result.totalRevenue,
      operatingExpenses: result.operatingExpenses,
      operatingProfit: result.operatingProfit,
      currency: result.currency,
      sourceSystem: result.sourceSystem,
    },
    aiClassifications: result.aiClassifications,
    detectedRelatedParties: result.detectedRelatedParties,
    anomalyAnalysis: result.anomalyAnalysis,
    form3cebReadyData: result.form3cebReadyData,
  };
}
