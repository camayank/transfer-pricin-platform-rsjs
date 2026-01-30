import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { accessReviewService } from "@/lib/engines/audit-engine";

// GET /api/access-reviews - List access reviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const status = searchParams.get("status");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { firmId };
    if (status) {
      where.status = status;
    }

    const reviews = await prisma.accessReview.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            decision: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add progress calculation
    const reviewsWithProgress = reviews.map((review) => {
      const totalItems = review.items.length;
      const completedItems = review.items.filter((i) => i.decision !== null).length;
      const progress = accessReviewService.calculateProgress(totalItems, completedItems);

      return {
        ...review,
        progress,
        isOverdue: accessReviewService.isOverdue(review.dueDate),
      };
    });

    return NextResponse.json({ reviews: reviewsWithProgress });
  } catch (error) {
    console.error("Error fetching access reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch access reviews" },
      { status: 500 }
    );
  }
}

// POST /api/access-reviews - Create access review cycle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, name, description, reviewerIds, scope, scopeConfig, startDate, dueDate } = body;

    if (!firmId || !name || !reviewerIds || !scope || !startDate || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get users for review based on scope
    const users = await prisma.user.findMany({
      where: { firmId },
      select: { id: true, role: true, name: true, email: true },
    });

    const userIdsForReview = accessReviewService.getUsersForReview(
      scope,
      scopeConfig,
      users.map((u) => ({ id: u.id, role: u.role }))
    );

    // Create review with items
    const review = await prisma.accessReview.create({
      data: {
        firmId,
        name,
        description,
        reviewerIds,
        scope,
        scopeConfig,
        status: "PENDING",
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        items: {
          create: userIdsForReview.map((userId) => {
            const user = users.find((u) => u.id === userId);
            return {
              userId,
              currentRole: user?.role || "UNKNOWN",
              currentAccess: {}, // Would populate with actual permissions
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating access review:", error);
    return NextResponse.json(
      { error: "Failed to create access review" },
      { status: 500 }
    );
  }
}
