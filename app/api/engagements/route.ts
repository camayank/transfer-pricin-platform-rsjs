import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEngagementAccessFilter, canAccessClient } from "@/lib/api/auth";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";
import { EngagementStatus, Priority } from "@prisma/client";

// GET /api/engagements - Get engagements based on user's role and client access
export async function GET(request: NextRequest) {
  try {
    // Check for engagements READ permission
    const { authorized, user, error } = await checkPermission("engagements", PermissionAction.READ);
    if (!authorized || !user) return error;

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const year = searchParams.get("year");

    // Build where clause with user-level access filtering
    // - Admin/Partner/Senior Manager: See ALL firm engagements
    // - Manager: See engagements for clients they are assigned to or reviewing
    // - Associate/Trainee: See engagements for clients they are assigned to
    const accessFilter = buildEngagementAccessFilter({
      id: user.id,
      email: user.email || "",
      name: user.name || null,
      role: user.role,
      firmId: user.firmId,
      firmName: user.firmName || null,
    });

    const where: Record<string, unknown> = { ...accessFilter };

    if (clientId) {
      where.clientId = clientId;
    }

    if (status && status !== "all") {
      where.status = status as EngagementStatus;
    }

    if (year) {
      where.financialYear = year;
    }

    const engagements = await prisma.engagement.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            pan: true,
            industry: true,
            assignedToId: true,
            reviewerId: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            documents: true,
            safeHarbourResults: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ engagements });
  } catch (error) {
    console.error("Error fetching engagements:", error);
    return NextResponse.json(
      { error: "Failed to fetch engagements" },
      { status: 500 }
    );
  }
}

// POST /api/engagements - Create a new engagement
export async function POST(request: NextRequest) {
  try {
    // Check for engagements CREATE permission (MANAGER+ roles)
    const { authorized, user, error } = await checkPermission("engagements", PermissionAction.CREATE);
    if (!authorized || !user) return error;

    const body = await request.json();

    const {
      clientId,
      financialYear,
      assessmentYear,
      totalRptValue,
      priority,
      dueDate,
      notes,
      assignedToId,
    } = body;

    // Validate required fields
    if (!clientId || !financialYear) {
      return NextResponse.json(
        { error: "Client ID and Financial Year are required" },
        { status: 400 }
      );
    }

    // SECURITY: Check if client exists AND belongs to user's firm
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        firmId: user.firmId,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Check user-level access to the client
    const hasAccess = canAccessClient(
      {
        id: user.id,
        email: user.email || "",
        name: user.name || null,
        role: user.role,
        firmId: user.firmId,
        firmName: user.firmName || null,
      },
      {
        firmId: client.firmId,
        assignedToId: client.assignedToId,
        reviewerId: client.reviewerId,
      }
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied", message: "You don't have access to this client" },
        { status: 403 }
      );
    }

    // Check if engagement already exists for this client and year
    const existingEngagement = await prisma.engagement.findFirst({
      where: { clientId, financialYear },
    });

    if (existingEngagement) {
      return NextResponse.json(
        { error: "Engagement for this financial year already exists" },
        { status: 400 }
      );
    }

    // Calculate assessment year if not provided
    const calculatedAY = assessmentYear || calculateAssessmentYear(financialYear);

    const engagement = await prisma.engagement.create({
      data: {
        clientId,
        financialYear,
        assessmentYear: calculatedAY,
        totalRptValue: totalRptValue ? Number(totalRptValue) : null,
        priority: (priority as Priority) || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : getDefaultDueDate(financialYear),
        notes,
        assignedToId,
        status: EngagementStatus.NOT_STARTED,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            pan: true,
          },
        },
      },
    });

    return NextResponse.json({ engagement }, { status: 201 });
  } catch (error) {
    console.error("Error creating engagement:", error);
    return NextResponse.json(
      { error: "Failed to create engagement" },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateAssessmentYear(financialYear: string): string {
  // Financial Year format: "2025-26" -> Assessment Year: "2026-27"
  const [startYear] = financialYear.split("-");
  const startYearNum = parseInt(startYear);
  return `${startYearNum + 1}-${(startYearNum + 2).toString().slice(-2)}`;
}

function getDefaultDueDate(financialYear: string): Date {
  // Form 3CEB due date is October 31 of the assessment year
  const [startYear] = financialYear.split("-");
  const startYearNum = parseInt(startYear);
  // For FY 2025-26, AY is 2026-27, due date is Oct 31, 2026
  return new Date(startYearNum + 1, 9, 31); // Month is 0-indexed, so 9 = October
}
