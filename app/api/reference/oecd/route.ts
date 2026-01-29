/**
 * OECD Guidelines Reference API
 * Search and retrieve OECD Transfer Pricing Guidelines
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createOECDReferenceEngine,
  OECDSearchQuery,
  OECD_GUIDELINES_VERSION
} from "@/lib/engines/oecd-reference-engine";

const engine = createOECDReferenceEngine();

/**
 * GET /api/reference/oecd
 * Get capabilities and version info
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    version: OECD_GUIDELINES_VERSION,
    capabilities: {
      search: true,
      getByChapter: true,
      getByParagraph: true,
      getByMethod: true,
      getByTransactionType: true,
      relatedGuidelines: true
    },
    actions: [
      "search",
      "get_chapter",
      "get_guideline",
      "get_method_guidance",
      "get_related",
      "get_chapters"
    ],
    chapters: engine.getChapterSummary().map(c => ({ number: c.number, title: c.title }))
  });
}

/**
 * POST /api/reference/oecd
 * Perform actions on OECD guidelines
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
        const query: OECDSearchQuery = {
          text: params?.text,
          keywords: params?.keywords,
          chapter: params?.chapter,
          method: params?.method,
          transactionType: params?.transactionType,
          limit: params?.limit ?? 20,
          minScore: params?.minScore ?? 10
        };

        const results = engine.search(query);
        return NextResponse.json({
          success: true,
          data: results
        });
      }

      case "get_chapter": {
        if (!params?.chapter) {
          return NextResponse.json(
            { error: "Missing 'chapter' parameter" },
            { status: 400 }
          );
        }

        const chapterData = engine.getChapterGuidelines(params.chapter);
        return NextResponse.json({
          success: true,
          data: chapterData
        });
      }

      case "get_guideline": {
        if (!params?.chapter || !params?.paragraph) {
          return NextResponse.json(
            { error: "Missing 'chapter' or 'paragraph' parameter" },
            { status: 400 }
          );
        }

        const context = engine.getGuidelineContext(params.chapter, params.paragraph);
        if (!context) {
          return NextResponse.json(
            { error: "Guideline not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: context
        });
      }

      case "get_method_guidance": {
        if (!params?.method) {
          return NextResponse.json(
            { error: "Missing 'method' parameter. Valid methods: CUP, RPM, CPM, TNMM, PSM" },
            { status: 400 }
          );
        }

        const methodGuidance = engine.getMethodGuidance(params.method);
        return NextResponse.json({
          success: true,
          data: methodGuidance
        });
      }

      case "get_related": {
        const scenario = {
          transactionType: params?.transactionType ?? "",
          functions: params?.functions,
          intangiblesInvolved: params?.intangiblesInvolved,
          crossBorderServices: params?.crossBorderServices,
          financialTransaction: params?.financialTransaction
        };

        const guidelines = engine.findRelevantGuidelines(scenario);
        return NextResponse.json({
          success: true,
          data: {
            scenario,
            guidelines,
            count: guidelines.length
          }
        });
      }

      case "get_chapters": {
        return NextResponse.json({
          success: true,
          data: engine.getChapterSummary()
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("OECD Reference API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
