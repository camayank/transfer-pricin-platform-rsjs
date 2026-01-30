import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";

// GET /api/compliance/access-reviews - List access reviews
export async function GET(request: NextRequest) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.READ);
    if (!authorized || !user) return error;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Record<string, unknown> = { firmId: user.firmId };

    if (status) {
      where.status = status;
    }

    const [reviews, total] = await Promise.all([
      prisma.accessReview.findMany({
        where,
        include: {
          _count: {
            select: { items: true },
          },
          items: {
            select: {
              decision: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accessReview.count({ where }),
    ]);

    // Transform reviews to include stats
    const reviewsWithStats = reviews.map((review) => {
      const totalItems = review._count.items;
      const completedItems = review.items.filter((i) => i.decision !== null).length;
      const approvedItems = review.items.filter((i) => i.decision === "APPROVE").length;
      const revokedItems = review.items.filter((i) => i.decision === "REVOKE").length;
      const modifiedItems = review.items.filter((i) => i.decision === "MODIFY").length;
      const pendingItems = totalItems - completedItems;

      return {
        id: review.id,
        firmId: review.firmId,
        name: review.name,
        description: review.description,
        reviewerIds: review.reviewerIds,
        scope: review.scope,
        scopeConfig: review.scopeConfig,
        status: review.status,
        startDate: review.startDate,
        dueDate: review.dueDate,
        completedAt: review.completedAt,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        totalItems,
        completedItems,
        approvedItems,
        revokedItems,
        modifiedItems,
        pendingItems,
      };
    });

    // Calculate overall stats
    const allReviews = await prisma.accessReview.findMany({
      where: { firmId: user.firmId },
      include: {
        items: {
          select: { decision: true },
        },
      },
    });

    const stats = allReviews.reduce(
      (acc, review) => {
        acc.total += 1;
        if (review.status === "PENDING") acc.pending += 1;
        if (review.status === "IN_PROGRESS") acc.inProgress += 1;
        if (review.status === "COMPLETED") acc.completed += 1;

        review.items.forEach((item) => {
          acc.totalItems += 1;
          if (item.decision === null) acc.pendingItems += 1;
          if (item.decision === "APPROVE") acc.approvedItems += 1;
          if (item.decision === "REVOKE") acc.revokedItems += 1;
          if (item.decision === "MODIFY") acc.modifiedItems += 1;
        });

        return acc;
      },
      {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        totalItems: 0,
        pendingItems: 0,
        approvedItems: 0,
        revokedItems: 0,
        modifiedItems: 0,
      }
    );

    return NextResponse.json({
      reviews: reviewsWithStats,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching access reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch access reviews" },
      { status: 500 }
    );
  }
}

// POST /api/compliance/access-reviews - Create new access review cycle
export async function POST(request: NextRequest) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.CREATE);
    if (!authorized || !user) return error;

    const body = await request.json();
    const {
      name,
      description,
      reviewerIds,
      scope,
      scopeConfig,
      startDate,
      dueDate,
    } = body;

    if (!name || !reviewerIds || !scope || !startDate || !dueDate) {
      return NextResponse.json(
        { error: "name, reviewerIds, scope, startDate, and dueDate are required" },
        { status: 400 }
      );
    }

    // Create the access review
    const review = await prisma.accessReview.create({
      data: {
        firmId: user.firmId,
        name,
        description,
        reviewerIds,
        scope,
        scopeConfig,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        status: "PENDING",
      },
    });

    // If scope is ALL_USERS, populate review items with all users
    if (scope === "ALL_USERS") {
      const users = await prisma.user.findMany({
        where: { firmId: user.firmId },
        select: { id: true, role: true },
      });

      if (users.length > 0) {
        await prisma.accessReviewItem.createMany({
          data: users.map((u) => ({
            accessReviewId: review.id,
            userId: u.id,
            currentRole: u.role,
          })),
        });
      }
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating access review:", error);
    return NextResponse.json(
      { error: "Failed to create access review" },
      { status: 500 }
    );
  }
}
