import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { auditService, AuditAction } from "@/lib/engines/audit-engine";

// POST /api/audit/verify - Verify audit chain integrity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, startDate, endDate } = body;

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    // Build where clause for date range
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

    // Fetch all entries in range
    const entries = await prisma.immutableAuditLog.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    // Verify chain integrity - convert null to undefined for optional fields
    const result = auditService.verifyChain(entries.map(e => ({
      id: e.id,
      firmId: e.firmId,
      action: e.action as AuditAction,
      entityType: e.entityType,
      currentHash: e.currentHash,
      createdAt: e.createdAt,
      userId: e.userId ?? undefined,
      entityId: e.entityId ?? undefined,
      ipAddress: e.ipAddress ?? undefined,
      userAgent: e.userAgent ?? undefined,
      oldValues: (e.oldValues as Record<string, unknown>) ?? undefined,
      newValues: (e.newValues as Record<string, unknown>) ?? undefined,
      metadata: (e.metadata as Record<string, unknown>) ?? undefined,
      previousHash: e.previousHash ?? undefined,
    })));

    return NextResponse.json({
      verification: result,
      entriesVerified: entries.length,
      dateRange: {
        from: startDate || entries[0]?.createdAt,
        to: endDate || entries[entries.length - 1]?.createdAt,
      },
    });
  } catch (error) {
    console.error("Error verifying audit chain:", error);
    return NextResponse.json(
      { error: "Failed to verify audit chain" },
      { status: 500 }
    );
  }
}
