import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/security-incidents/[id] - Get single incident
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const incident = await prisma.securityIncident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Error fetching security incident:", error);
    return NextResponse.json(
      { error: "Failed to fetch security incident" },
      { status: 500 }
    );
  }
}

// PATCH /api/security-incidents/[id] - Update incident status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      rootCause,
      containmentSteps,
      remediationSteps,
      lessonsLearned,
      externalNotified,
    } = body;

    const incident = await prisma.securityIncident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;

      // Set timestamps based on status
      if (status === "CONTAINED" && !incident.containedAt) {
        updateData.containedAt = new Date();
      }
      if (status === "CLOSED" && !incident.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }

    if (rootCause) updateData.rootCause = rootCause;
    if (containmentSteps) updateData.containmentSteps = containmentSteps;
    if (remediationSteps) updateData.remediationSteps = remediationSteps;
    if (lessonsLearned) updateData.lessonsLearned = lessonsLearned;
    if (externalNotified !== undefined) updateData.externalNotified = externalNotified;

    const updatedIncident = await prisma.securityIncident.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ incident: updatedIncident });
  } catch (error) {
    console.error("Error updating security incident:", error);
    return NextResponse.json(
      { error: "Failed to update security incident" },
      { status: 500 }
    );
  }
}
