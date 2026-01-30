import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";

// PATCH /api/compliance/access-reviews/[id]/items/[itemId] - Submit review decision
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.UPDATE);
    if (!authorized || !user) return error;

    const { id: reviewId, itemId } = await params;
    const body = await request.json();
    const { decision, newRole, newAccess, justification } = body;

    // Verify the review exists and belongs to the firm
    const review = await prisma.accessReview.findFirst({
      where: {
        id: reviewId,
        firmId: user.firmId,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Access review not found" },
        { status: 404 }
      );
    }

    // Verify the item exists and belongs to this review
    const item = await prisma.accessReviewItem.findFirst({
      where: {
        id: itemId,
        accessReviewId: reviewId,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Review item not found" },
        { status: 404 }
      );
    }

    if (!decision || !["APPROVE", "REVOKE", "MODIFY"].includes(decision)) {
      return NextResponse.json(
        { error: "Valid decision (APPROVE, REVOKE, or MODIFY) is required" },
        { status: 400 }
      );
    }

    if (decision === "MODIFY" && !newRole && !newAccess) {
      return NextResponse.json(
        { error: "newRole or newAccess is required for MODIFY decision" },
        { status: 400 }
      );
    }

    // Update the item
    const updatedItem = await prisma.accessReviewItem.update({
      where: { id: itemId },
      data: {
        decision,
        newRole: decision === "MODIFY" ? newRole : null,
        newAccess: decision === "MODIFY" ? newAccess : null,
        justification,
        reviewerId: user.id,
        reviewedAt: new Date(),
      },
    });

    // Check if all items are reviewed, update review status if needed
    const remainingItems = await prisma.accessReviewItem.count({
      where: {
        accessReviewId: reviewId,
        decision: null,
      },
    });

    if (remainingItems === 0 && review.status === "IN_PROGRESS") {
      await prisma.accessReview.update({
        where: { id: reviewId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    } else if (review.status === "PENDING") {
      // Start the review if it was pending
      await prisma.accessReview.update({
        where: { id: reviewId },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Apply the decision if it's REVOKE or MODIFY
    if (decision === "REVOKE") {
      // TODO: Implement actual access revocation
      // This would update the user's role or permissions
    }

    if (decision === "MODIFY" && newRole) {
      // TODO: Implement role modification
      // This would update the user's role
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating review item:", error);
    return NextResponse.json(
      { error: "Failed to update review item" },
      { status: 500 }
    );
  }
}
