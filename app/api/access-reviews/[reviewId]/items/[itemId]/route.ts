import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/access-reviews/[reviewId]/items/[itemId] - Submit decision
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string; itemId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, itemId } = await params;
    const body = await request.json();
    const { decision, newRole, newAccess, justification } = body;

    if (!decision || !["APPROVE", "REVOKE", "MODIFY"].includes(decision)) {
      return NextResponse.json(
        { error: "Valid decision (APPROVE, REVOKE, MODIFY) is required" },
        { status: 400 }
      );
    }

    if (decision === "MODIFY" && !newRole && !newAccess) {
      return NextResponse.json(
        { error: "newRole or newAccess is required for MODIFY decision" },
        { status: 400 }
      );
    }

    // Verify item belongs to review
    const item = await prisma.accessReviewItem.findFirst({
      where: { id: itemId, accessReviewId: reviewId },
    });

    if (!item) {
      return NextResponse.json({ error: "Review item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.accessReviewItem.update({
      where: { id: itemId },
      data: {
        decision,
        newRole,
        newAccess,
        justification,
        reviewerId: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // Check if all items are reviewed
    const remainingItems = await prisma.accessReviewItem.count({
      where: {
        accessReviewId: reviewId,
        decision: null,
      },
    });

    // If all items reviewed, update review status
    if (remainingItems === 0) {
      await prisma.accessReview.update({
        where: { id: reviewId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    } else {
      // Update to IN_PROGRESS if not already
      await prisma.accessReview.update({
        where: { id: reviewId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({
      item: updatedItem,
      remainingItems,
    });
  } catch (error) {
    console.error("Error updating review item:", error);
    return NextResponse.json(
      { error: "Failed to update review item" },
      { status: 500 }
    );
  }
}
