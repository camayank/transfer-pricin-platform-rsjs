import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/ai/recommendations/[id] - Update recommendation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, outcome } = body; // action: 'dismiss' | 'act'

    const recommendation = await prisma.aiRecommendation.findUnique({
      where: { id },
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    if (recommendation.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};

    if (action === "dismiss") {
      updateData.status = "DISMISSED";
      updateData.dismissedAt = new Date();
    } else if (action === "act") {
      updateData.status = "ACTED";
      updateData.actedAt = new Date();
      if (outcome) {
        updateData.outcome = outcome;
      }
    }

    const updatedRecommendation = await prisma.aiRecommendation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ recommendation: updatedRecommendation });
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}
