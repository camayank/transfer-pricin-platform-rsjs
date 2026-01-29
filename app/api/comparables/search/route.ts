/**
 * Comparable Companies Search API
 * Search and benchmark comparable companies for transfer pricing
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createComparableSearchEngine,
  FunctionalProfile,
  COMPARABLE_ENGINE_VERSION
} from "@/lib/engines/comparable-search-engine";

const engine = createComparableSearchEngine();

/**
 * GET /api/comparables/search
 * Get capabilities and supported profiles
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    version: COMPARABLE_ENGINE_VERSION,
    functionalProfiles: engine.getFunctionalProfiles(),
    pliDescriptions: engine.getPLIDescriptions(),
    capabilities: {
      search: true,
      comparabilityAnalysis: true,
      workingCapitalAdjustment: true,
      rejectionAnalysis: true,
      benchmarking: true
    },
    actions: [
      "search",
      "search_text",
      "get_company",
      "analyze_comparability",
      "calculate_benchmark",
      "apply_wc_adjustment",
      "get_rejection_analysis",
      "get_recommended_pli",
      "get_industry_benchmark",
      "get_all_benchmarks",
      "get_form3ceb_comparables",
      "validate_company",
      "get_database_stats",
      "test_connections"
    ],
    databaseStats: engine.getDatabaseStats(),
    industryBenchmarks: Object.keys(engine.getAllIndustryBenchmarks()),
    sources: ["Internal Database (30+ companies)", "PROWESS (CMIE) - Coming Soon", "Capitaline - Coming Soon"]
  });
}

/**
 * POST /api/comparables/search
 * Perform comparable search actions
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
      case "search": {
        const criteria = {
          nicCodes: params?.nicCodes,
          revenueMin: params?.revenueMin,
          revenueMax: params?.revenueMax,
          functionalProfile: params?.functionalProfile as FunctionalProfile | undefined,
          excludeRelatedPartyAbove: params?.excludeRelatedPartyAbove ?? 25,
          excludePersistentLosses: params?.excludePersistentLosses ?? true,
          minYearsData: params?.minYearsData ?? 3,
          financialYear: params?.financialYear,
          employeeCostRatioMin: params?.employeeCostRatioMin,
          employeeCostRatioMax: params?.employeeCostRatioMax,
          status: params?.status ?? ["ACTIVE"],
          limit: params?.limit ?? 50,
          offset: params?.offset,
          sources: params?.sources,
          mergeResults: params?.mergeResults ?? true
        };

        const results = await engine.search(criteria);
        return NextResponse.json({
          success: true,
          data: results
        });
      }

      case "get_company": {
        if (!params?.cin) {
          return NextResponse.json(
            { error: "Missing 'cin' parameter" },
            { status: 400 }
          );
        }

        const company = await engine.getCompany(params.cin);
        if (!company) {
          return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: company
        });
      }

      case "analyze_comparability": {
        if (!params?.testedParty || !params?.searchCriteria) {
          return NextResponse.json(
            { error: "Missing 'testedParty' or 'searchCriteria' parameter" },
            { status: 400 }
          );
        }

        const analysis = await engine.performComparabilityAnalysis(
          params.testedParty,
          params.searchCriteria,
          params.pliType ?? "opOc"
        );

        return NextResponse.json({
          success: true,
          data: analysis
        });
      }

      case "calculate_benchmark": {
        if (!params?.comparables || !params?.pliType) {
          return NextResponse.json(
            { error: "Missing 'comparables' or 'pliType' parameter" },
            { status: 400 }
          );
        }

        // Search and get companies first
        const searchResult = await engine.search({
          ...params.searchCriteria,
          limit: params.limit ?? 30
        });

        const { calculateBenchmarkingSet } = await import("@/lib/engines/comparable-search-engine");
        const benchmark = calculateBenchmarkingSet(
          searchResult.companies,
          params.pliType,
          params.testedPartyPli
        );

        return NextResponse.json({
          success: true,
          data: benchmark
        });
      }

      case "apply_wc_adjustment": {
        if (!params?.comparables || !params?.testedPartyWorkingCapital) {
          return NextResponse.json(
            { error: "Missing 'comparables' or 'testedPartyWorkingCapital' parameter" },
            { status: 400 }
          );
        }

        // Get comparables from search
        const searchResult = await engine.search({
          ...params.searchCriteria,
          limit: params.limit ?? 30
        });

        const adjustments = engine.applyWorkingCapitalAdjustment(
          searchResult.companies,
          params.testedPartyWorkingCapital,
          params.adjustmentRate
        );

        return NextResponse.json({
          success: true,
          data: {
            adjustments,
            count: adjustments.length
          }
        });
      }

      case "get_rejection_analysis": {
        if (!params?.searchCriteria) {
          return NextResponse.json(
            { error: "Missing 'searchCriteria' parameter" },
            { status: 400 }
          );
        }

        const analysis = await engine.getFilteringAnalysis(params.searchCriteria);
        return NextResponse.json({
          success: true,
          data: analysis
        });
      }

      case "get_recommended_pli": {
        if (!params?.functionalProfile) {
          return NextResponse.json(
            { error: "Missing 'functionalProfile' parameter" },
            { status: 400 }
          );
        }

        const recommendedPli = engine.getRecommendedPLI(params.functionalProfile as FunctionalProfile);
        const pliDescriptions = engine.getPLIDescriptions();

        return NextResponse.json({
          success: true,
          data: {
            functionalProfile: params.functionalProfile,
            recommendedPli,
            description: pliDescriptions[recommendedPli]
          }
        });
      }

      case "get_pli_descriptions": {
        return NextResponse.json({
          success: true,
          data: engine.getPLIDescriptions()
        });
      }

      case "get_functional_profiles": {
        return NextResponse.json({
          success: true,
          data: engine.getFunctionalProfiles()
        });
      }

      case "test_connections": {
        const result = await engine.testConnections();
        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "search_text": {
        if (!params?.query) {
          return NextResponse.json(
            { error: "Missing 'query' parameter" },
            { status: 400 }
          );
        }

        const companies = engine.searchByText(params.query, params.limit ?? 20);
        return NextResponse.json({
          success: true,
          data: {
            companies,
            count: companies.length,
            query: params.query
          }
        });
      }

      case "get_industry_benchmark": {
        if (!params?.industry) {
          return NextResponse.json(
            { error: "Missing 'industry' parameter" },
            { status: 400 }
          );
        }

        const benchmark = engine.getIndustryBenchmark(params.industry);
        if (!benchmark) {
          return NextResponse.json(
            { error: "Industry benchmark not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: benchmark
        });
      }

      case "get_all_benchmarks": {
        return NextResponse.json({
          success: true,
          data: engine.getAllIndustryBenchmarks()
        });
      }

      case "get_form3ceb_comparables": {
        if (!params?.functionalProfile) {
          return NextResponse.json(
            { error: "Missing 'functionalProfile' parameter" },
            { status: 400 }
          );
        }

        const result = engine.getForm3CEBComparables(
          params.transactionNature || "Services",
          params.functionalProfile as FunctionalProfile,
          {
            min: params.revenueMin,
            max: params.revenueMax
          }
        );

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case "validate_company": {
        if (!params?.cin) {
          return NextResponse.json(
            { error: "Missing 'cin' parameter" },
            { status: 400 }
          );
        }

        const company = await engine.getCompany(params.cin);
        if (!company) {
          return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
          );
        }

        const validation = engine.validateCompanyData(company);
        return NextResponse.json({
          success: true,
          data: {
            company: company.name,
            cin: company.cin,
            ...validation
          }
        });
      }

      case "get_database_stats": {
        return NextResponse.json({
          success: true,
          data: engine.getDatabaseStats()
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Comparables API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
