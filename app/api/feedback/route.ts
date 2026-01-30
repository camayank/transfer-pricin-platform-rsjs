import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";

// GET /api/feedback - Get all feedback for the firm
export async function GET(request: NextRequest) {
  try {
    // Check READ permission on feedback
    const { authorized, user, error } = await checkPermission("feedback", PermissionAction.READ);
    if (!authorized || !user) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;
    const feedbackType = searchParams.get("feedbackType");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    // Build where clause - always filter by firmId for tenant isolation
    const where: Record<string, unknown> = {
      firmId: user.firmId,
    };

    if (feedbackType && feedbackType !== "all") {
      where.feedbackType = feedbackType;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    const feedbacks = await prisma.salesFeedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// POST /api/feedback - Create new feedback
export async function POST(request: NextRequest) {
  try {
    // Check CREATE permission on feedback
    const { authorized, user, error } = await checkPermission("feedback", PermissionAction.CREATE);
    if (!authorized || !user) {
      return error;
    }

    const body = await request.json();

    const {
      entityType,
      entityId,
      feedbackType,
      rating,
      content,
      sentiment,
      requiresFollowUp,
    } = body;

    // Validate required fields
    if (!entityType || !entityId || !feedbackType || !content) {
      return NextResponse.json(
        { error: "Entity type, entity ID, feedback type, and content are required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.salesFeedback.create({
      data: {
        entityType,
        entityId,
        feedbackType,
        rating: rating ? parseInt(rating) : null,
        content,
        sentiment: sentiment || null,
        requiresFollowUp: requiresFollowUp || false,
        firmId: user.firmId,
        givenById: user.id,
      },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}
