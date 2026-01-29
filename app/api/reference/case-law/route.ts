/**
 * Transfer Pricing Case Law API
 * Search and retrieve Indian TP case precedents
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createCaseLawEngine,
  CaseLawSearchQuery,
  TP_CASE_LAW_VERSION
} from "@/lib/engines/case-law-engine";

const engine = createCaseLawEngine();

/**
 * GET /api/reference/case-law
 * Get capabilities and statistics
 */
export async function GET() {
  const stats = engine.getStatistics();

  return NextResponse.json({
    status: "ready",
    version: TP_CASE_LAW_VERSION,
    statistics: stats,
    capabilities: {
      search: true,
      getById: true,
      getByCourt: true,
      getByMethod: true,
      getByNatureCode: true,
      analyzeIssue: true,
      getLandmark: true
    },
    actions: [
      "search",
      "get_case",
      "get_by_court",
      "get_by_method",
      "get_by_nature_code",
      "get_landmark",
      "analyze_issue",
      "get_statistics"
    ]
  });
}

/**
 * POST /api/reference/case-law
 * Perform actions on case law database
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
        const query: CaseLawSearchQuery = {
          text: params?.text,
          keywords: params?.keywords,
          court: params?.court,
          outcome: params?.outcome,
          method: params?.method,
          natureCode: params?.natureCode,
          assessmentYear: params?.assessmentYear,
          bench: params?.bench,
          onlyLandmark: params?.onlyLandmark,
          limit: params?.limit ?? 20,
          minScore: params?.minScore ?? 5
        };

        const results = engine.search(query);
        return NextResponse.json({
          success: true,
          data: results
        });
      }

      case "get_case": {
        if (!params?.id) {
          return NextResponse.json(
            { error: "Missing 'id' parameter" },
            { status: 400 }
          );
        }

        const context = engine.getCaseContext(params.id);
        if (!context) {
          return NextResponse.json(
            { error: "Case not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: context
        });
      }

      case "get_by_court": {
        if (!params?.court) {
          return NextResponse.json(
            { error: "Missing 'court' parameter. Valid: ITAT, High Court, Supreme Court" },
            { status: 400 }
          );
        }

        const cases = engine.getCasesByCriteria({ court: params.court });
        return NextResponse.json({
          success: true,
          data: {
            court: params.court,
            cases,
            count: cases.length
          }
        });
      }

      case "get_by_method": {
        if (!params?.method) {
          return NextResponse.json(
            { error: "Missing 'method' parameter. Valid: CUP, RPM, CPM, TNMM, PSM, OTHER" },
            { status: 400 }
          );
        }

        const cases = engine.getCasesByCriteria({ method: params.method });
        return NextResponse.json({
          success: true,
          data: {
            method: params.method,
            cases,
            count: cases.length
          }
        });
      }

      case "get_by_nature_code": {
        if (!params?.natureCode) {
          return NextResponse.json(
            { error: "Missing 'natureCode' parameter" },
            { status: 400 }
          );
        }

        const results = engine.getCasesForTransaction(params.natureCode);
        return NextResponse.json({
          success: true,
          data: {
            natureCode: params.natureCode,
            ...results,
            totalCases: results.favorable.length + results.adverse.length
          }
        });
      }

      case "get_landmark": {
        const cases = engine.getLandmarkCases();
        return NextResponse.json({
          success: true,
          data: {
            cases,
            count: cases.length
          }
        });
      }

      case "analyze_issue": {
        if (!params?.issue) {
          return NextResponse.json(
            { error: "Missing 'issue' parameter" },
            { status: 400 }
          );
        }

        const analysis = engine.analyzeIssue(params.issue);
        return NextResponse.json({
          success: true,
          data: analysis
        });
      }

      case "get_statistics": {
        return NextResponse.json({
          success: true,
          data: engine.getStatistics()
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Case Law API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
