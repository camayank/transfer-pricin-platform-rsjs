import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";

// GET /api/upsell - Get all upsell opportunities for the firm
export async function GET(request: NextRequest) {
  try {
    // Check READ permission on upsell
    const { authorized, user, error } = await checkPermission("upsell", PermissionAction.READ);
    if (!authorized || !user) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    // Build where clause - always filter by firmId for tenant isolation
    const where: Record<string, unknown> = {
      firmId: user.firmId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const opportunities = await prisma.upsellOpportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Error fetching upsell opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch upsell opportunities" },
      { status: 500 }
    );
  }
}

// POST /api/upsell - Create a new upsell opportunity
export async function POST(request: NextRequest) {
  try {
    // Check CREATE permission on upsell
    const { authorized, user, error } = await checkPermission("upsell", PermissionAction.CREATE);
    if (!authorized || !user) {
      return error;
    }

    const body = await request.json();

    const {
      clientId,
      title,
      description,
      serviceType,
      estimatedValue,
      probability,
      priority,
      targetCloseDate,
      notes,
    } = body;

    // Validate required fields
    if (!clientId || !title || !serviceType || !estimatedValue) {
      return NextResponse.json(
        { error: "Client, title, service type, and estimated value are required" },
        { status: 400 }
      );
    }

    // Verify client belongs to user's firm
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

    const opportunity = await prisma.upsellOpportunity.create({
      data: {
        clientId,
        title,
        description,
        serviceType,
        estimatedValue: parseFloat(estimatedValue),
        probability: probability ? parseInt(probability) : null,
        priority: priority || "MEDIUM",
        targetCloseDate: targetCloseDate ? new Date(targetCloseDate) : null,
        notes,
        firmId: user.firmId,
        identifiedById: user.id,
        assignedToId: user.id,
      },
    });

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    console.error("Error creating upsell opportunity:", error);
    return NextResponse.json(
      { error: "Failed to create upsell opportunity" },
      { status: 500 }
    );
  }
}
