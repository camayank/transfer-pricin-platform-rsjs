import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { auditService, AuditAction } from "@/lib/engines/audit-engine";

// GET /api/audit/export - Export audit logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const format = (searchParams.get("format") || "json") as "json" | "csv";

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    // Build where clause
    const where: Record<string, unknown> = { firmId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Fetch entries
    const entries = await prisma.immutableAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Format for export - convert null to undefined for optional fields
    const exportData = auditService.formatForExport(
      entries.map(e => ({
        ...e,
        action: e.action as AuditAction,
        userId: e.userId ?? undefined,
        entityId: e.entityId ?? undefined,
        ipAddress: e.ipAddress ?? undefined,
        userAgent: e.userAgent ?? undefined,
        oldValues: (e.oldValues as Record<string, unknown>) ?? undefined,
        newValues: (e.newValues as Record<string, unknown>) ?? undefined,
        metadata: (e.metadata as Record<string, unknown>) ?? undefined,
        previousHash: e.previousHash ?? undefined,
      })),
      format
    );

    // Set appropriate headers for download
    const headers: Record<string, string> = {
      "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().split("T")[0]}.${format}"`,
    };

    if (format === "csv") {
      headers["Content-Type"] = "text/csv";
    } else {
      headers["Content-Type"] = "application/json";
    }

    return new NextResponse(exportData, { headers });
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    return NextResponse.json(
      { error: "Failed to export audit logs" },
      { status: 500 }
    );
  }
}
