import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/health-scores/[clientId] - Get single client health score detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    const healthScore = await prisma.customerHealthScore.findFirst({
      where: { clientId },
    });

    if (!healthScore) {
      return NextResponse.json({ error: "Health score not found" }, { status: 404 });
    }

    // Fetch client details
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, pan: true, industry: true },
    });

    // Fetch recent engagement events
    const recentEvents = await prisma.customerEngagementEvent.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch recent NPS surveys
    const npsSurveys = await prisma.npsSurvey.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      healthScore: {
        ...healthScore,
        client,
      },
      recentEvents,
      npsSurveys,
    });
  } catch (error) {
    console.error("Error fetching health score:", error);
    return NextResponse.json(
      { error: "Failed to fetch health score" },
      { status: 500 }
    );
  }
}
