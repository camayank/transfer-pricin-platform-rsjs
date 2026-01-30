import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";

// GET /api/compliance/access-reviews/[id] - Get single review with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.READ);
    if (!authorized || !user) return error;

    const { id } = await params;

    const review = await prisma.accessReview.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
      include: {
        items: {
          include: {
            // Include user details if available
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Access review not found" },
        { status: 404 }
      );
    }

    // Fetch user details for items
    const userIds = review.items.map((item) => item.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true },
    });

    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {} as Record<string, typeof users[0]>);

    // Enrich items with user details
    const enrichedItems = review.items.map((item) => ({
      ...item,
      user: userMap[item.userId] || null,
    }));

    return NextResponse.json({
      review: {
        ...review,
        items: enrichedItems,
      },
    });
  } catch (error) {
    console.error("Error fetching access review:", error);
    return NextResponse.json(
      { error: "Failed to fetch access review" },
      { status: 500 }
    );
  }
}

// PATCH /api/compliance/access-reviews/[id] - Update review status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.UPDATE);
    if (!authorized || !user) return error;

    const { id } = await params;
    const body = await request.json();
    const { status, dueDate } = body;

    const review = await prisma.accessReview.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Access review not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;

      if (status === "IN_PROGRESS" && review.status === "PENDING") {
        // Review started
      }

      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      }

      if (status === "CANCELLED") {
        // Review cancelled
      }
    }

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    const updatedReview = await prisma.accessReview.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error("Error updating access review:", error);
    return NextResponse.json(
      { error: "Failed to update access review" },
      { status: 500 }
    );
  }
}
