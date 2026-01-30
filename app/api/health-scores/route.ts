import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/health-scores - List all client health scores
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const riskLevel = searchParams.get("riskLevel");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { firmId };
    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    const healthScores = await prisma.customerHealthScore.findMany({
      where,
      orderBy: [
        { riskLevel: "asc" }, // Critical first
        { overallScore: "asc" },
      ],
    });

    // Fetch client names
    const clientIds = healthScores.map((h) => h.clientId);
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true, pan: true },
    });

    const clientMap = new Map(clients.map((c) => [c.id, c]));
    const scoresWithClients = healthScores.map((score) => ({
      ...score,
      client: clientMap.get(score.clientId),
    }));

    // Calculate summary stats
    const summary = {
      total: healthScores.length,
      critical: healthScores.filter((h) => h.riskLevel === "CRITICAL").length,
      high: healthScores.filter((h) => h.riskLevel === "HIGH").length,
      medium: healthScores.filter((h) => h.riskLevel === "MEDIUM").length,
      low: healthScores.filter((h) => h.riskLevel === "LOW").length,
      averageScore: Math.round(
        healthScores.reduce((sum, h) => sum + h.overallScore, 0) / healthScores.length || 0
      ),
    };

    return NextResponse.json({ healthScores: scoresWithClients, summary });
  } catch (error) {
    console.error("Error fetching health scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch health scores" },
      { status: 500 }
    );
  }
}

// POST /api/health-scores/recalculate - Trigger recalculation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, clientId } = body;

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    // In production, this would trigger a background job to recalculate scores
    // For now, return success with a message

    return NextResponse.json({
      message: clientId
        ? `Health score recalculation queued for client ${clientId}`
        : "Health score recalculation queued for all clients",
      jobId: `job-${Date.now()}`,
    });
  } catch (error) {
    console.error("Error triggering recalculation:", error);
    return NextResponse.json(
      { error: "Failed to trigger recalculation" },
      { status: 500 }
    );
  }
}
