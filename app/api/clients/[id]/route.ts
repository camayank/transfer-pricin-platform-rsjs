import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";
import { canAccessClient } from "@/lib/api/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id] - Get a single client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check READ permission on clients
    const { authorized, user, error } = await checkPermission("clients", PermissionAction.READ);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;

    // Find client with firm isolation first
    const client = await prisma.client.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { id: true, name: true, email: true },
        },
        engagements: {
          orderBy: { createdAt: "desc" },
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        associatedEnterprises: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check user-level access based on role
    const hasAccess = canAccessClient(
      {
        id: user.id,
        email: user.email || "",
        name: user.name || null,
        role: user.role,
        firmId: user.firmId,
        firmName: null,
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

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check UPDATE permission on clients
    const { authorized, user, error } = await checkPermission("clients", PermissionAction.UPDATE);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;
    const body = await request.json();

    // Check if client exists and belongs to user's firm
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check user-level access
    const hasAccess = canAccessClient(
      {
        id: user.id,
        email: user.email || "",
        name: user.name || null,
        role: user.role,
        firmId: user.firmId,
        firmName: null,
      },
      {
        firmId: existingClient.firmId,
        assignedToId: existingClient.assignedToId,
        reviewerId: existingClient.reviewerId,
      }
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied", message: "You don't have access to update this client" },
        { status: 403 }
      );
    }

    // Validate PAN if being updated
    if (body.pan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(body.pan)) {
        return NextResponse.json(
          { error: "Invalid PAN format" },
          { status: 400 }
        );
      }

      // Check if another client has this PAN
      const duplicatePan = await prisma.client.findFirst({
        where: {
          pan: body.pan,
          firmId: user.firmId,
          NOT: { id },
        },
      });

      if (duplicatePan) {
        return NextResponse.json(
          { error: "Another client with this PAN already exists" },
          { status: 400 }
        );
      }
    }

    // Remove firmId from body to prevent changing firm
    const { firmId, ...updateData } = body;

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check DELETE permission on clients
    const { authorized, user, error } = await checkPermission("clients", PermissionAction.DELETE);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;

    // Check if client exists and belongs to user's firm
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check user-level access (only Admin/Partner can delete)
    const hasAccess = canAccessClient(
      {
        id: user.id,
        email: user.email || "",
        name: user.name || null,
        role: user.role,
        firmId: user.firmId,
        firmName: null,
      },
      {
        firmId: existingClient.firmId,
        assignedToId: existingClient.assignedToId,
        reviewerId: existingClient.reviewerId,
      }
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied", message: "You don't have access to delete this client" },
        { status: 403 }
      );
    }

    // Delete client (cascade will handle engagements and documents)
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
