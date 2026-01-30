import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { securityIncidentService } from "@/lib/engines/audit-engine";

// GET /api/security-incidents - List security incidents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { firmId };
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const incidents = await prisma.securityIncident.findMany({
      where,
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    });

    // Add SLA information
    const incidentsWithSla = incidents.map((incident) => {
      const sla = securityIncidentService.getResponseSLA(incident.severity);
      const externalNotification = securityIncidentService.requiresExternalNotification(
        incident.severity,
        incident.category,
        (incident.affectedUsers as string[] | null)?.length || 0
      );

      return {
        ...incident,
        sla,
        externalNotification,
      };
    });

    return NextResponse.json({ incidents: incidentsWithSla });
  } catch (error) {
    console.error("Error fetching security incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch security incidents" },
      { status: 500 }
    );
  }
}

// POST /api/security-incidents - Report security incident
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firmId,
      title,
      description,
      severity,
      category,
      affectedUsers,
      affectedEntities,
      detectedAt,
    } = body;

    if (!firmId || !title || !description || !severity || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const incident = await prisma.securityIncident.create({
      data: {
        firmId,
        title,
        description,
        severity,
        status: "OPEN",
        category,
        affectedUsers,
        affectedEntities,
        detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
        reportedById: session.user.id,
      },
    });

    // Get notification requirements
    const notifications = securityIncidentService.getRequiredNotifications(severity);
    const externalNotification = securityIncidentService.requiresExternalNotification(
      severity,
      category,
      affectedUsers?.length || 0
    );

    return NextResponse.json(
      {
        incident,
        notifications,
        externalNotification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating security incident:", error);
    return NextResponse.json(
      { error: "Failed to create security incident" },
      { status: 500 }
    );
  }
}
