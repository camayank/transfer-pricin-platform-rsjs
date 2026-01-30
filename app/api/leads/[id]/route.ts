import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/leads/[id] - Get a single lead
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check READ permission on leads
    const { authorized, user, error } = await checkPermission("leads", PermissionAction.READ);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;

    // Find lead with tenant isolation
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
      include: {
        interactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

// PUT /api/leads/[id] - Update a lead
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check UPDATE permission on leads
    const { authorized, user, error } = await checkPermission("leads", PermissionAction.UPDATE);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;
    const body = await request.json();

    // Check if lead exists and belongs to user's firm
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Handle conversion to client
    if (body.status === "WON" && !existingLead.convertedToClientId && body.convertToClient) {
      // Create a new client from this lead
      const client = await prisma.client.create({
        data: {
          name: existingLead.companyName,
          pan: body.pan || "PENDING",
          industry: existingLead.industry,
          contactPerson: existingLead.contactPerson,
          contactEmail: existingLead.contactEmail,
          contactPhone: existingLead.contactPhone,
          address: existingLead.address,
          city: existingLead.city,
          state: existingLead.state,
          country: existingLead.country || "India",
          website: existingLead.website,
          firmId: user.firmId,
          assignedToId: existingLead.assignedToId,
        },
      });

      body.convertedToClientId = client.id;
      body.convertedAt = new Date();
    }

    // Handle lost status
    if (body.status === "LOST" && !existingLead.lostAt) {
      body.lostAt = new Date();
    }

    // Remove firmId from body to prevent changing firm
    const { firmId, convertToClient, pan, ...updateData } = body;

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        interactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check DELETE permission on leads
    const { authorized, user, error } = await checkPermission("leads", PermissionAction.DELETE);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;

    // Check if lead exists and belongs to user's firm
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Don't allow deletion of converted leads
    if (existingLead.convertedToClientId) {
      return NextResponse.json(
        { error: "Cannot delete a lead that has been converted to a client" },
        { status: 400 }
      );
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
