import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { aiRecommendationService } from "@/lib/engines/ai-ml-engine";

// GET /api/ai/recommendations - Get AI recommendations for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    // Get existing recommendations
    const existingRecommendations = await prisma.aiRecommendation.findMany({
      where: {
        firmId,
        userId: session.user.id,
        status: "ACTIVE",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { confidence: "desc" },
      take: 10,
    });

    // If few recommendations, generate new ones
    if (existingRecommendations.length < 3) {
      // Get context for recommendations
      const [tasksOverdue, engagementsInProgress, clientsManaged] = await Promise.all([
        prisma.projectTask.count({
          where: {
            assigneeId: session.user.id,
            status: { not: "DONE" },
            dueDate: { lt: new Date() },
          },
        }),
        prisma.engagement.count({
          where: {
            assignedToId: session.user.id,
            status: { notIn: ["COMPLETED", "FILED"] },
          },
        }),
        prisma.client.count({
          where: {
            assignedToId: session.user.id,
            isActive: true,
          },
        }),
      ]);

      const newRecommendations = aiRecommendationService.generateRecommendations({
        firmId,
        userId: session.user.id,
        context: {
          userRole: session.user.role || "ASSOCIATE",
          recentActions: [], // Would track from activity log
          clientsManaged,
          engagementsInProgress,
          tasksOverdue,
        },
      });

      // Save new recommendations
      if (newRecommendations.length > 0) {
        await prisma.aiRecommendation.createMany({
          data: newRecommendations.map((r) => ({
            firmId,
            userId: session.user.id,
            recommendationType: r.type,
            entityType: r.entityType || null,
            entityId: r.entityId || null,
            title: r.title,
            description: r.description,
            confidence: r.confidence,
            actionUrl: r.actionUrl || null,
            actionData: r.actionData
              ? (r.actionData as Prisma.InputJsonValue)
              : Prisma.JsonNull,
            status: "ACTIVE",
            expiresAt: r.expiresAt || null,
          })),
        });

        // Fetch the newly created ones
        const allRecommendations = await prisma.aiRecommendation.findMany({
          where: {
            firmId,
            userId: session.user.id,
            status: "ACTIVE",
          },
          orderBy: { confidence: "desc" },
          take: 10,
        });

        return NextResponse.json({ recommendations: allRecommendations });
      }
    }

    return NextResponse.json({ recommendations: existingRecommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
