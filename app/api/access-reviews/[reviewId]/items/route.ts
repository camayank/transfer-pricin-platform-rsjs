import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/access-reviews/[reviewId]/items - Get review items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // pending, completed

    const where: Record<string, unknown> = { accessReviewId: reviewId };
    if (status === "pending") {
      where.decision = null;
    } else if (status === "completed") {
      where.decision = { not: null };
    }

    const items = await prisma.accessReviewItem.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    // Fetch user details for each item
    const userIds = [...new Set(items.map((i) => i.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const itemsWithUsers = items.map((item) => ({
      ...item,
      user: userMap.get(item.userId),
    }));

    return NextResponse.json({ items: itemsWithUsers });
  } catch (error) {
    console.error("Error fetching review items:", error);
    return NextResponse.json(
      { error: "Failed to fetch review items" },
      { status: 500 }
    );
  }
}
