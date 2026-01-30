import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/leads/[id]/interactions - Get all interactions for a lead
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check READ permission on leads
    const { authorized, user, error } = await checkPermission("leads", PermissionAction.READ);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;

    // Verify lead belongs to user's firm
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const interactions = await prisma.leadInteraction.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ interactions });
  } catch (error) {
    console.error("Error fetching interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

// POST /api/leads/[id]/interactions - Create a new interaction
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check UPDATE permission on leads (adding interaction is an update action)
    const { authorized, user, error } = await checkPermission("leads", PermissionAction.UPDATE);
    if (!authorized || !user) {
      return error;
    }

    const { id } = await params;
    const body = await request.json();

    // Verify lead belongs to user's firm
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const {
      type,
      subject,
      content,
      outcome,
      nextAction,
      scheduledAt,
    } = body;

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    const interaction = await prisma.leadInteraction.create({
      data: {
        leadId: id,
        type,
        subject,
        content,
        outcome,
        nextAction,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: user.id,
      },
    });

    // Update last contact on the lead
    await prisma.lead.update({
      where: { id },
      data: {
        lastContactAt: new Date(),
        nextFollowUpAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json({ interaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating interaction:", error);
    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    );
  }
}
