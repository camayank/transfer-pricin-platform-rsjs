import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";

// GET /api/compliance/incidents - List security incidents
export async function GET(request: NextRequest) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.READ);
    if (!authorized || !user) return error;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Record<string, unknown> = { firmId: user.firmId };

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    if (category) {
      where.category = category;
    }

    const [incidents, total] = await Promise.all([
      prisma.securityIncident.findMany({
        where,
        orderBy: [
          { severity: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.securityIncident.count({ where }),
    ]);

    // Calculate stats
    const [statusStats, severityStats] = await Promise.all([
      prisma.securityIncident.groupBy({
        by: ["status"],
        where: { firmId: user.firmId },
        _count: true,
      }),
      prisma.securityIncident.groupBy({
        by: ["severity"],
        where: { firmId: user.firmId },
        _count: true,
      }),
    ]);

    const statusMap = statusStats.reduce((acc, s) => {
      acc[s.status] = s._count;
      return acc;
    }, {} as Record<string, number>);

    const severityMap = severityStats.reduce((acc, s) => {
      acc[s.severity] = s._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      incidents,
      stats: {
        total,
        open: statusMap["OPEN"] || 0,
        investigating: statusMap["INVESTIGATING"] || 0,
        contained: statusMap["CONTAINED"] || 0,
        eradicated: statusMap["ERADICATED"] || 0,
        recovered: statusMap["RECOVERED"] || 0,
        closed: statusMap["CLOSED"] || 0,
        critical: severityMap["CRITICAL"] || 0,
        high: severityMap["HIGH"] || 0,
        medium: severityMap["MEDIUM"] || 0,
        low: severityMap["LOW"] || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

// POST /api/compliance/incidents - Report new security incident
export async function POST(request: NextRequest) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.CREATE);
    if (!authorized || !user) return error;

    const body = await request.json();
    const {
      title,
      description,
      severity,
      category,
      affectedUsers,
      affectedEntities,
      detectedAt,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "title, description, and category are required" },
        { status: 400 }
      );
    }

    const incident = await prisma.securityIncident.create({
      data: {
        firmId: user.firmId,
        title,
        description,
        severity: severity || "MEDIUM",
        status: "OPEN",
        category,
        affectedUsers: affectedUsers || [],
        affectedEntities: affectedEntities || [],
        detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
        reportedById: user.id,
      },
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
