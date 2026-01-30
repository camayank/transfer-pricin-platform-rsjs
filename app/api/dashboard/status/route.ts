import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";

// GET /api/dashboard/status - Get TP dashboard status overview
export async function GET() {
  try {
    // Check for analytics READ permission (MANAGER+ roles)
    const { authorized, user, error } = await checkPermission("analytics", PermissionAction.READ);
    if (!authorized || !user) return error;

    const firmId = user.firmId;

    // Fetch all data in parallel
    const [clients, engagements, disputes, documents] = await Promise.all([
      // Clients
      prisma.client.findMany({
        where: { firmId },
        select: { id: true, status: true, createdAt: true },
      }),
      // Engagements
      prisma.engagement.findMany({
        where: { client: { firmId } },
        select: {
          id: true,
          status: true,
          priority: true,
          dueDate: true,
          totalRptValue: true,
          createdAt: true,
        },
      }),
      // Disputes
      prisma.disputeCase.findMany({
        where: { engagement: { client: { firmId } } },
        select: {
          id: true,
          stage: true,
          status: true,
          amountAtStake: true,
          nextHearingDate: true,
          createdAt: true,
        },
      }),
      // Documents
      prisma.document.findMany({
        where: {
          OR: [
            { client: { firmId } },
            { engagement: { client: { firmId } } },
          ],
        },
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

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
      dataCollection: engagements.filter((e) => e.status === "DATA_COLLECTION").length,
      safeHarbourCheck: engagements.filter((e) => e.status === "SAFE_HARBOUR_CHECK").length,
      benchmarking: engagements.filter((e) => e.status === "BENCHMARKING").length,
      documentation: engagements.filter((e) => e.status === "DOCUMENTATION").length,
      review: engagements.filter((e) => e.status === "REVIEW").length,
      approved: engagements.filter((e) => e.status === "APPROVED").length,
      filed: engagements.filter((e) => e.status === "FILED").length,
      completed: engagements.filter((e) => e.status === "COMPLETED").length,
      overdue: engagements.filter(
        (e) =>
          e.dueDate &&
          new Date(e.dueDate) < now &&
          !["FILED", "COMPLETED"].includes(e.status)
      ).length,
      critical: engagements.filter(
        (e) => e.priority === "CRITICAL" && !["FILED", "COMPLETED"].includes(e.status)
      ).length,
      high: engagements.filter(
        (e) => e.priority === "HIGH" && !["FILED", "COMPLETED"].includes(e.status)
      ).length,
      totalRptValue: engagements.reduce(
        (sum, e) => sum + (Number(e.totalRptValue) || 0),
        0
      ),
    };

    // Dispute stats
    const disputeStats = {
      total: disputes.length,
      open: disputes.filter((d) => d.status === "OPEN").length,
      inProgress: disputes.filter((d) => d.status === "IN_PROGRESS").length,
      pendingHearing: disputes.filter((d) => d.status === "PENDING_HEARING").length,
      decided: disputes.filter((d) => d.status === "DECIDED").length,
      byStage: {
        TPO: disputes.filter((d) => d.stage === "TPO").length,
        DRP: disputes.filter((d) => d.stage === "DRP").length,
        AO: disputes.filter((d) => d.stage === "AO").length,
        ITAT: disputes.filter((d) => d.stage === "ITAT").length,
        HIGH_COURT: disputes.filter((d) => d.stage === "HIGH_COURT").length,
        SUPREME_COURT: disputes.filter((d) => d.stage === "SUPREME_COURT").length,
      },
      totalAmountAtStake: disputes.reduce(
        (sum, d) => sum + (Number(d.amountAtStake) || 0),
        0
      ),
      upcomingHearings: disputes.filter(
        (d) =>
          d.nextHearingDate &&
          new Date(d.nextHearingDate) > now &&
          new Date(d.nextHearingDate) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      ).length,
    };

    // Document stats
    const documentStats = {
      total: documents.length,
      draft: documents.filter((d) => d.status === "DRAFT").length,
      inProgress: documents.filter((d) => d.status === "IN_PROGRESS").length,
      pendingReview: documents.filter((d) => d.status === "PENDING_REVIEW").length,
      review: documents.filter((d) => d.status === "REVIEW").length,
      approved: documents.filter((d) => d.status === "APPROVED").length,
      filed: documents.filter((d) => d.status === "FILED").length,
      form3CEB: documents.filter((d) => d.type === "FORM_3CEB").length,
      form3CEFA: documents.filter((d) => d.type === "FORM_3CEFA").length,
      tpStudy: documents.filter((d) => d.type === "TP_STUDY").length,
    };

    // Overall summary
    const summary = {
      totalClients: clientStats.total,
      activeEngagements: engagementStats.total - engagementStats.completed - engagementStats.filed,
      overdueEngagements: engagementStats.overdue,
      criticalItems: engagementStats.critical,
      openDisputes: disputeStats.open + disputeStats.inProgress + disputeStats.pendingHearing,
      pendingDocuments: documentStats.draft + documentStats.inProgress + documentStats.pendingReview,
      totalRptValue: engagementStats.totalRptValue,
      totalDisputeValue: disputeStats.totalAmountAtStake,
    };

    return NextResponse.json({
      summary,
      clients: clientStats,
      engagements: engagementStats,
      disputes: disputeStats,
      documents: documentStats,
    });
  } catch (error) {
    console.error("Error fetching status dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch status dashboard" },
      { status: 500 }
    );
  }
}
