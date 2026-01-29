/**
 * ================================================================================
 * DIGICOMPLY AI API
 * Dashboard AI-Enhanced Endpoint
 *
 * POST /api/ai/dashboard - Generate AI-enhanced dashboard insights
 * GET /api/ai/dashboard - Get available Dashboard AI capabilities
 * ================================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createDashboardAIService,
  ComplianceRiskScore,
  ClientPriorityAnalysis,
  SmartNotification,
  DeadlinePrediction,
  EnhancedDashboardStats,
} from "@/lib/engines/dashboard-ai";
import {
  ComplianceStatus,
  FormType,
  Priority,
  NotificationType,
} from "@/lib/engines/dashboard-engine";
import { isAIConfigured } from "@/lib/ai";

// =============================================================================
// GET - Capabilities Info
// =============================================================================

export async function GET() {
  const configured = isAIConfigured();

  return NextResponse.json({
    status: configured ? "ready" : "not_configured",
    capabilities: {
      complianceRiskScoring: true,
      clientPriorityAnalysis: true,
      smartNotifications: true,
      deadlinePrediction: true,
      enhancedStats: true,
    },
    actions: [
      "compliance_risk_score",
      "client_priority",
      "smart_notification",
      "deadline_prediction",
      "enhanced_stats",
    ],
    message: configured
      ? "Dashboard AI service is ready"
      : "AI not configured - rule-based analysis will be used",
  });
}

// =============================================================================
// POST - Generate Dashboard Insights
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

    const service = createDashboardAIService();
    const aiConfigured = isAIConfigured();

    switch (action) {
      // =======================================================================
      // COMPLIANCE RISK SCORING
      // =======================================================================
      case "compliance_risk_score": {
        if (!params?.client) {
          return NextResponse.json(
            {
              error: "client object is required",
              schema: {
                client: {
                  id: "string",
                  pan: "string",
                  name: "string",
                  industry: "string",
                  segment: "string",
                  engagementPartner: "string",
                  engagementManager: "string",
                  internationalTransactions: "number",
                  domesticTransactions: "number",
                  status: "active|inactive",
                  tpApplicability: { form3ceb: "boolean", masterFile: "boolean", cbcr: "boolean", safeHarbour: "boolean" },
                  complianceForms: "array",
                  priority: "critical|high|medium|low",
                },
              },
            },
            { status: 400 }
          );
        }

        // Build client object with defaults
        const client = buildClientObject(params.client);
        const result = await service.calculateComplianceRiskScore(client);

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result: formatRiskScoreResult(result),
        });
      }

      // =======================================================================
      // CLIENT PRIORITY ANALYSIS
      // =======================================================================
      case "client_priority": {
        if (!params?.clients || !Array.isArray(params.clients)) {
          return NextResponse.json(
            { error: "clients array is required" },
            { status: 400 }
          );
        }

        const clients = params.clients.map(buildClientObject);
        const teamMembers = (params.teamMembers || []).map(buildTeamMemberObject);
        const result = await service.analyzeClientPriorities(clients, teamMembers);

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result: formatClientPriorityResult(result),
        });
      }

      // =======================================================================
      // SMART NOTIFICATIONS
      // =======================================================================
      case "smart_notification": {
        if (!params?.eventType || !params?.clientName || !params?.formType || !params?.dueDate) {
          return NextResponse.json(
            { error: "eventType, clientName, formType, and dueDate are required" },
            { status: 400 }
          );
        }

        const result = await service.generateSmartNotification({
          eventType: (params.eventType as NotificationType) || NotificationType.DEADLINE_REMINDER,
          clientName: String(params.clientName),
          formType: (params.formType as FormType) || FormType.FORM_3CEB,
          dueDate: String(params.dueDate),
          currentStatus: (params.currentStatus as ComplianceStatus) || ComplianceStatus.IN_PROGRESS,
          assignedTo: params.assignedTo ? String(params.assignedTo) : undefined,
          additionalContext: params.additionalContext ? String(params.additionalContext) : undefined,
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result: formatNotificationResult(result),
        });
      }

      // =======================================================================
      // DEADLINE PREDICTION
      // =======================================================================
      case "deadline_prediction": {
        if (!params?.client || !params?.form) {
          return NextResponse.json(
            { error: "client and form objects are required" },
            { status: 400 }
          );
        }

        const client = buildClientObject(params.client);
        const form = buildComplianceFormObject(params.form);

        const result = await service.predictDeadlineCompletion({
          client,
          form,
          avgCompletionDays: params.avgCompletionDays ? Number(params.avgCompletionDays) : undefined,
          onTimeRate: params.onTimeRate ? Number(params.onTimeRate) : undefined,
          availableHours: params.availableHours ? Number(params.availableHours) : undefined,
        });

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured && result.aiGenerated,
          result: formatDeadlinePredictionResult(result),
        });
      }

      // =======================================================================
      // ENHANCED STATS
      // =======================================================================
      case "enhanced_stats": {
        if (!params?.clients || !Array.isArray(params.clients)) {
          return NextResponse.json(
            { error: "clients array is required" },
            { status: 400 }
          );
        }

        const clients = params.clients.map(buildClientObject);
        const result = await service.getEnhancedStats(clients);

        return NextResponse.json({
          success: true,
          aiEnhanced: aiConfigured,
          result: formatEnhancedStatsResult(result),
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            availableActions: [
              "compliance_risk_score",
              "client_priority",
              "smart_notification",
              "deadline_prediction",
              "enhanced_stats",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Dashboard AI API Error:", error);
    return NextResponse.json(
      {
        error: "Dashboard AI generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// Object Builders
// =============================================================================

function buildClientObject(data: Record<string, unknown>) {
  return {
    id: String(data.id || data.clientId || ""),
    pan: String(data.pan || ""),
    name: String(data.name || data.clientName || "Client"),
    tradeName: data.tradeName ? String(data.tradeName) : undefined,
    industry: String(data.industry || "IT Services"),
    segment: String(data.segment || "Captive"),
    engagementPartner: String(data.engagementPartner || "Partner"),
    engagementManager: String(data.engagementManager || "Manager"),
    internationalTransactions: Number(data.internationalTransactions || 0),
    domesticTransactions: Number(data.domesticTransactions || 0),
    status: (data.status as "active" | "inactive") || "active",
    tpApplicability: {
      form3ceb: Boolean(data.tpApplicability && (data.tpApplicability as Record<string, boolean>).form3ceb),
      masterFile: Boolean(data.tpApplicability && (data.tpApplicability as Record<string, boolean>).masterFile),
      cbcr: Boolean(data.tpApplicability && (data.tpApplicability as Record<string, boolean>).cbcr),
      safeHarbour: Boolean(data.tpApplicability && (data.tpApplicability as Record<string, boolean>).safeHarbour),
    },
    complianceForms: Array.isArray(data.complianceForms)
      ? data.complianceForms.map(buildComplianceFormObject)
      : [],
    priority: (data.priority as Priority) || Priority.MEDIUM,
    notes: data.notes ? String(data.notes) : undefined,
  };
}

function buildTeamMemberObject(data: Record<string, unknown>) {
  return {
    id: String(data.id || ""),
    name: String(data.name || "Team Member"),
    email: String(data.email || ""),
    role: data.role || "staff",
    clients: Array.isArray(data.clients) ? data.clients.map(String) : [],
    capacity: Number(data.capacity || 40),
    currentLoad: Number(data.currentLoad || 0),
  };
}

function buildComplianceFormObject(data: Record<string, unknown>) {
  return {
    formType: (data.formType as FormType) || FormType.FORM_3CEB,
    assessmentYear: String(data.assessmentYear || "2025-26"),
    dueDate: String(data.dueDate || new Date().toISOString()),
    status: (data.status as ComplianceStatus) || ComplianceStatus.NOT_STARTED,
    assignedTo: String(data.assignedTo || "Unassigned"),
    reviewedBy: data.reviewedBy ? String(data.reviewedBy) : undefined,
    filedOn: data.filedOn ? String(data.filedOn) : undefined,
    acknowledgementNumber: data.acknowledgementNumber ? String(data.acknowledgementNumber) : undefined,
    remarks: data.remarks ? String(data.remarks) : undefined,
    lastUpdated: String(data.lastUpdated || new Date().toISOString()),
  };
}

// =============================================================================
// Response Formatters
// =============================================================================

function formatRiskScoreResult(result: ComplianceRiskScore) {
  return {
    overallScore: result.overallScore,
    riskCategory: result.riskCategory,
    breakdown: result.breakdown,
    topRiskFactors: result.topRiskFactors,
    recommendedActions: result.recommendedActions,
    summary: result.summary,
    aiGenerated: result.aiGenerated,
  };
}

function formatClientPriorityResult(result: ClientPriorityAnalysis) {
  return {
    priorityRanking: result.priorityRanking,
    resourceAllocation: result.resourceAllocation,
    workflowRecommendations: result.workflowRecommendations,
    aiGenerated: result.aiGenerated,
  };
}

function formatNotificationResult(result: SmartNotification) {
  return {
    title: result.title,
    message: result.message,
    priority: result.priority,
    nextSteps: result.nextSteps,
    regulatoryReference: result.regulatoryReference,
    aiGenerated: result.aiGenerated,
  };
}

function formatDeadlinePredictionResult(result: DeadlinePrediction) {
  return {
    clientId: result.clientId,
    formType: result.formType,
    completionProbability: result.completionProbability,
    predictedCompletionDate: result.predictedCompletionDate,
    confidenceLevel: result.confidenceLevel,
    riskFactors: result.riskFactors,
    recommendations: result.recommendations,
    resourceAdjustments: result.resourceAdjustments,
    aiGenerated: result.aiGenerated,
  };
}

function formatEnhancedStatsResult(result: EnhancedDashboardStats) {
  return {
    // Base stats from DashboardStats
    totalClients: result.totalClients,
    activeClients: result.activeClients,
    formsNotStarted: result.formsNotStarted,
    formsInProgress: result.formsInProgress,
    formsFiled: result.formsFiled,
    formsOverdue: result.formsOverdue,
    upcomingDeadlines: result.upcomingDeadlines,
    teamWorkload: result.teamWorkload,
    // Enhanced AI stats
    aiInsights: result.aiInsights,
    recommendations: result.recommendations,
  };
}
