import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";

// GET /api/compliance/incidents/[id] - Get single incident
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.READ);
    if (!authorized || !user) return error;

    const { id } = await params;

    const incident = await prisma.securityIncident.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Error fetching incident:", error);
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

// PATCH /api/compliance/incidents/[id] - Update incident
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.UPDATE);
    if (!authorized || !user) return error;

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      severity,
      containmentSteps,
      remediationSteps,
      rootCause,
      lessonsLearned,
      externalNotified,
    } = body;

    const incident = await prisma.securityIncident.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (severity) {
      updateData.severity = severity;
    }

    if (containmentSteps !== undefined) {
      updateData.containmentSteps = containmentSteps;
    }

    if (remediationSteps !== undefined) {
      updateData.remediationSteps = remediationSteps;
    }

    if (rootCause !== undefined) {
      updateData.rootCause = rootCause;
    }

    if (lessonsLearned !== undefined) {
      updateData.lessonsLearned = lessonsLearned;
    }

    if (externalNotified !== undefined) {
      updateData.externalNotified = externalNotified;
    }

    // Handle status transitions
    if (status) {
      updateData.status = status;

      // Set timestamps based on status
      if (status === "CONTAINED" && !incident.containedAt) {
        updateData.containedAt = new Date();
      }

      if ((status === "RECOVERED" || status === "CLOSED") && !incident.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }

    const updatedIncident = await prisma.securityIncident.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ incident: updatedIncident });
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}
