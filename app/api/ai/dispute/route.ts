/**
 * TP Dispute AI API Routes
 * Transfer Pricing Dispute & Audit AI-enhanced endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getTPDisputeAIService,
  TPProfile,
  RPTSummary,
  DocumentationStatus,
  DisputeCase,
} from "@/lib/engines/tp-dispute-ai";

// =============================================================================
// GET - Service capabilities
// =============================================================================

export async function GET() {
  const service = getTPDisputeAIService();

  return NextResponse.json({
    service: "TP Dispute AI Service",
    version: "1.0.0",
    available: service.isAvailable(),
    endpoints: {
      POST: {
        "/api/ai/dispute": {
          actions: [
            "risk-assessment",
            "defense-strategy",
            "apa-assistance",
            "tpo-response",
            "litigation-analysis",
          ],
        },
      },
    },
    capabilities: [
      "TP dispute risk assessment",
      "Audit defense strategy generation",
      "APA eligibility and assistance",
      "TPO response template generation",
      "Litigation analysis and strategy",
    ],
  });
}

// =============================================================================
// POST - AI generation endpoints
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const service = getTPDisputeAIService();

    switch (action) {
      case "risk-assessment":
        return handleRiskAssessment(service, params);
      case "defense-strategy":
        return handleDefenseStrategy(service, params);
      case "apa-assistance":
        return handleAPAAssistance(service, params);
      case "tpo-response":
        return handleTPOResponse(service, params);
      case "litigation-analysis":
        return handleLitigationAnalysis(service, params);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("TP Dispute AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

async function handleRiskAssessment(
  service: ReturnType<typeof getTPDisputeAIService>,
  params: {
    profile: Partial<TPProfile>;
    rptSummary: Partial<RPTSummary>[];
    documentationStatus: Partial<DocumentationStatus>;
    benchmarkRange: { min: number; max: number };
    historicalIssues?: string;
    industryTrends?: string;
    recentPrecedents?: string;
  }
) {
  const profile = buildTPProfile(params.profile);
  const rptSummary = (params.rptSummary || []).map(buildRPTSummary);
  const documentationStatus = buildDocumentationStatus(params.documentationStatus);

  const result = await service.assessDisputeRisk(
    profile,
    rptSummary,
    documentationStatus,
    params.benchmarkRange || { min: 5, max: 15 },
    params.historicalIssues,
    params.industryTrends,
    params.recentPrecedents
  );

  return NextResponse.json({
    success: true,
    data: result.assessment,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleDefenseStrategy(
  service: ReturnType<typeof getTPDisputeAIService>,
  params: {
    disputeCase: Partial<DisputeCase>;
    tpoPosition: string;
    farProfile: { functions: string; assets: string; risks: string };
    economicArguments: string;
    availableEvidence: string;
    precedents?: string;
    adversePrecedents?: string;
  }
) {
  const disputeCase = buildDisputeCase(params.disputeCase);

  const result = await service.generateDefenseStrategy(
    disputeCase,
    params.tpoPosition || "TPO position pending",
    params.farProfile || { functions: "", assets: "", risks: "" },
    params.economicArguments || "Economic arguments to be provided",
    params.availableEvidence || "Evidence to be compiled",
    params.precedents,
    params.adversePrecedents
  );

  return NextResponse.json({
    success: true,
    data: result.strategy,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleAPAAssistance(
  service: ReturnType<typeof getTPDisputeAIService>,
  params: {
    applicantName: string;
    applicantPAN: string;
    industry: string;
    apaType: "unilateral" | "bilateral" | "multilateral";
    coveredTransactions: Partial<RPTSummary>[];
    transactionHistory: string;
    currentMethod: string;
    currentPLI: string;
    marginRange: string;
    relatedPartyDetails: string;
    treatyPartner?: string;
    historicalPositions?: string;
    pendingDisputes?: string;
    financialProjections?: string;
  }
) {
  const coveredTransactions = (params.coveredTransactions || []).map(buildRPTSummary);

  const result = await service.generateAPAAssistance(
    params.applicantName || "Applicant",
    params.applicantPAN || "AAAAA0000A",
    params.industry || "Services",
    params.apaType || "unilateral",
    coveredTransactions,
    params.transactionHistory || "Transaction history pending",
    params.currentMethod || "TNMM",
    params.currentPLI || "OP/OC",
    params.marginRange || "5% - 15%",
    params.relatedPartyDetails || "Related party details pending",
    params.treatyPartner,
    params.historicalPositions,
    params.pendingDisputes,
    params.financialProjections
  );

  return NextResponse.json({
    success: true,
    data: result.assistance,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleTPOResponse(
  service: ReturnType<typeof getTPDisputeAIService>,
  params: {
    assesseeName: string;
    assesseePAN: string;
    assessmentYear: string;
    tpoReferenceNumber: string;
    responseType: "initial" | "supplementary" | "appeal";
    tpoQueries: string;
    transactionNature: string;
    relatedParty: string;
    transactionValue: number;
    methodApplied: string;
    taxpayerPosition: string;
    availableDocuments: string;
    keyArguments: string;
    relevantCaseLaws: string;
    showCauseNotice?: string;
    additionalSubmissions?: string;
  }
) {
  const result = await service.generateTPOResponse(
    params.assesseeName || "Assessee",
    params.assesseePAN || "AAAAA0000A",
    params.assessmentYear || "2024-25",
    params.tpoReferenceNumber || "TPO/REF/2024",
    params.responseType || "initial",
    params.tpoQueries || "TPO queries pending",
    params.transactionNature || "Services",
    params.relatedParty || "Related Party",
    params.transactionValue || 0,
    params.methodApplied || "TNMM",
    params.taxpayerPosition || "Taxpayer position",
    params.availableDocuments || "TP documentation",
    params.keyArguments || "Key arguments",
    params.relevantCaseLaws || "Relevant case laws",
    params.showCauseNotice,
    params.additionalSubmissions
  );

  return NextResponse.json({
    success: true,
    data: result.response,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

async function handleLitigationAnalysis(
  service: ReturnType<typeof getTPDisputeAIService>,
  params: {
    disputeCase: Partial<DisputeCase>;
    tpoPosition: string;
    taxpayerPosition: string;
    evidenceStrength: string;
    relevantPrecedents: string;
    budgetConstraints?: string;
    timelineExpectations?: string;
  }
) {
  const disputeCase = buildDisputeCase(params.disputeCase);

  const result = await service.analyzeLitigation(
    disputeCase,
    params.tpoPosition || "TPO position pending",
    params.taxpayerPosition || "Taxpayer position pending",
    params.evidenceStrength || "Evidence strength to be assessed",
    params.relevantPrecedents || "Precedents to be researched",
    params.budgetConstraints,
    params.timelineExpectations
  );

  return NextResponse.json({
    success: true,
    data: result.analysis,
    metadata: {
      aiGenerated: result.aiGenerated,
      qualityScore: result.qualityScore,
    },
  });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildTPProfile(partial: Partial<TPProfile>): TPProfile {
  return {
    entityName: partial.entityName || "Entity",
    entityPAN: partial.entityPAN || "AAAAA0000A",
    assessmentYear: partial.assessmentYear || "2024-25",
    industry: partial.industry || "Services",
    totalRevenue: partial.totalRevenue || 0,
    operatingProfit: partial.operatingProfit || 0,
    opOcMargin: partial.opOcMargin || 0,
    opOrMargin: partial.opOrMargin || 0,
  };
}

function buildRPTSummary(partial: Partial<RPTSummary>): RPTSummary {
  return {
    transactionType: partial.transactionType || "Services",
    relatedParty: partial.relatedParty || "Related Party",
    value: partial.value || 0,
    method: partial.method || "TNMM",
    margin: partial.margin,
  };
}

function buildDocumentationStatus(
  partial: Partial<DocumentationStatus>
): DocumentationStatus {
  return {
    tpStudy: partial.tpStudy || "complete",
    benchmarkStudy: partial.benchmarkStudy || "complete",
    agreements: partial.agreements || "complete",
    farAnalysis: partial.farAnalysis || "complete",
  };
}

function buildDisputeCase(partial: Partial<DisputeCase>): DisputeCase {
  return {
    entityName: partial.entityName || "Entity",
    assessmentYear: partial.assessmentYear || "2024-25",
    transactionType: partial.transactionType || "Services",
    relatedParty: partial.relatedParty || "Related Party",
    transactionValue: partial.transactionValue || 0,
    methodApplied: partial.methodApplied || "TNMM",
    testedPartyMargin: partial.testedPartyMargin || 0,
    proposedAdjustment: partial.proposedAdjustment || 0,
    currentForum: partial.currentForum || "TPO",
  };
}
