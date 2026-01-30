import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api/permissions";

// GET /api/dashboard/status - Get unified status overview
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const firmId = user.firmId;

    // Fetch all data in parallel
    const [
      leads,
      clients,
      engagements,
      tasks,
      upsellOpportunities,
      feedbacks,
    ] = await Promise.all([
      // Leads
      prisma.lead.findMany({
        where: { firmId },
        select: { id: true, status: true, estimatedValue: true, createdAt: true },
      }),
      // Clients
      prisma.client.findMany({
        where: { firmId },
        select: { id: true, status: true, createdAt: true },
      }),
      // Engagements
      prisma.engagement.findMany({
        where: { client: { firmId } },
        select: { id: true, status: true, dueDate: true, createdAt: true },
      }),
      // Tasks
      prisma.projectTask.findMany({
        where: { project: { firmId } },
        select: { id: true, status: true, priority: true, dueDate: true, createdAt: true },
      }),
      // Upsell Opportunities
      prisma.upsellOpportunity.findMany({
        where: { firmId },
        select: { id: true, status: true, estimatedValue: true, createdAt: true },
      }),
      // Feedback
      prisma.salesFeedback.findMany({
        where: { firmId },
        select: { id: true, feedbackType: true, sentiment: true, requiresFollowUp: true, followUpCompletedAt: true, createdAt: true },
      }),
    ]);

    // Lead stats
    const leadStats = {
      total: leads.length,
      new: leads.filter((l) => l.status === "NEW").length,
      contacted: leads.filter((l) => l.status === "CONTACTED").length,
      qualified: leads.filter((l) => l.status === "QUALIFIED").length,
      proposalSent: leads.filter((l) => l.status === "PROPOSAL_SENT").length,
      negotiation: leads.filter((l) => l.status === "NEGOTIATION").length,
      won: leads.filter((l) => l.status === "WON").length,
      lost: leads.filter((l) => l.status === "LOST").length,
      pipelineValue: leads
        .filter((l) => !["WON", "LOST"].includes(l.status))
        .reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0),
      wonValue: leads
        .filter((l) => l.status === "WON")
        .reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0),
    };

    // Client stats
    const clientStats = {
      total: clients.length,
      active: clients.filter((c) => c.status === "active").length,
      inactive: clients.filter((c) => c.status !== "active").length,
    };

    // Engagement stats
    const now = new Date();
    const engagementStats = {
      total: engagements.length,
      notStarted: engagements.filter((e) => e.status === "NOT_STARTED").length,
      inProgress: engagements.filter((e) => ["DATA_COLLECTION", "SAFE_HARBOUR_CHECK", "BENCHMARKING", "DOCUMENTATION"].includes(e.status)).length,
      review: engagements.filter((e) => e.status === "REVIEW").length,
      approved: engagements.filter((e) => e.status === "APPROVED").length,
      filed: engagements.filter((e) => e.status === "FILED").length,
      completed: engagements.filter((e) => e.status === "COMPLETED").length,
      overdue: engagements.filter((e) => e.dueDate && new Date(e.dueDate) < now && !["FILED", "COMPLETED"].includes(e.status)).length,
    };

    // Task stats
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      review: tasks.filter((t) => t.status === "REVIEW").length,
      blocked: tasks.filter((t) => t.status === "BLOCKED").length,
      done: tasks.filter((t) => t.status === "DONE").length,
      overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE").length,
      critical: tasks.filter((t) => t.priority === "CRITICAL" && t.status !== "DONE").length,
      high: tasks.filter((t) => t.priority === "HIGH" && t.status !== "DONE").length,
    };

    // Upsell stats
    const upsellStats = {
      total: upsellOpportunities.length,
      identified: upsellOpportunities.filter((u) => u.status === "IDENTIFIED").length,
      qualified: upsellOpportunities.filter((u) => u.status === "QUALIFIED").length,
      proposalSent: upsellOpportunities.filter((u) => u.status === "PROPOSAL_SENT").length,
      negotiation: upsellOpportunities.filter((u) => u.status === "NEGOTIATION").length,
      won: upsellOpportunities.filter((u) => u.status === "WON").length,
      lost: upsellOpportunities.filter((u) => u.status === "LOST").length,
      pipelineValue: upsellOpportunities
        .filter((u) => !["WON", "LOST"].includes(u.status))
        .reduce((sum, u) => sum + (Number(u.estimatedValue) || 0), 0),
      wonValue: upsellOpportunities
        .filter((u) => u.status === "WON")
        .reduce((sum, u) => sum + (Number(u.estimatedValue) || 0), 0),
    };

    // Feedback stats
    const feedbackStats = {
      total: feedbacks.length,
      positive: feedbacks.filter((f) => f.sentiment === "POSITIVE").length,
      neutral: feedbacks.filter((f) => f.sentiment === "NEUTRAL").length,
      negative: feedbacks.filter((f) => f.sentiment === "NEGATIVE").length,
      pendingFollowUp: feedbacks.filter((f) => f.requiresFollowUp && !f.followUpCompletedAt).length,
      complaints: feedbacks.filter((f) => f.feedbackType === "COMPLAINT").length,
    };

    // Overall summary
    const summary = {
      totalWorkItems: leads.length + engagements.length + tasks.length + upsellOpportunities.length,
      requiresAttention: leadStats.new + engagementStats.overdue + taskStats.overdue + taskStats.blocked + feedbackStats.pendingFollowUp + feedbackStats.complaints,
      totalPipelineValue: leadStats.pipelineValue + upsellStats.pipelineValue,
      totalWonValue: leadStats.wonValue + upsellStats.wonValue,
    };

    return NextResponse.json({
      summary,
      leads: leadStats,
      clients: clientStats,
      engagements: engagementStats,
      tasks: taskStats,
      upsell: upsellStats,
      feedback: feedbackStats,
    });
  } catch (error) {
    console.error("Error fetching status dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch status dashboard" },
      { status: 500 }
    );
  }
}
