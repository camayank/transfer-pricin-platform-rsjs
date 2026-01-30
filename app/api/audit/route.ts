import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auditService, AuditAction } from "@/lib/engines/audit-engine";

// GET /api/audit - Get audit logs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const entityType = searchParams.get("entityType");
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    // Build where clause
    const where: Record<string, unknown> = { firmId };

    if (entityType) {
      where.entityType = entityType;
    }

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.immutableAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.immutableAuditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

// POST /api/audit - Create new audit log entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, action, entityType, entityId, oldValues, newValues, metadata } = body;

    if (!firmId || !action || !entityType) {
      return NextResponse.json(
        { error: "firmId, action, and entityType are required" },
        { status: 400 }
      );
    }

    // Get the previous log entry for hash chaining
    const previousEntry = await prisma.immutableAuditLog.findFirst({
      where: { firmId },
      orderBy: { createdAt: "desc" },
      select: { id: true, currentHash: true },
    });

    // Create hash-chained entry
    const logData = auditService.createLogEntry(
      {
        firmId,
        userId: session.user.id,
        action: action as AuditAction,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        metadata,
      },
      previousEntry || undefined
    );

    const auditLog = await prisma.immutableAuditLog.create({
      data: {
        firmId: logData.firmId,
        userId: logData.userId,
        action: logData.action,
        entityType: logData.entityType,
        entityId: logData.entityId,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
        currentHash: logData.currentHash,
        previousHash: logData.previousHash || null,
        oldValues: logData.oldValues
          ? (logData.oldValues as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        newValues: logData.newValues
          ? (logData.newValues as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        metadata: logData.metadata
          ? (logData.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    return NextResponse.json({ auditLog }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
