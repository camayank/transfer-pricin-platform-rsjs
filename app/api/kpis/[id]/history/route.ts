import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/kpis/[id]/history - Get KPI time series
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const periods = parseInt(searchParams.get("periods") || "12");

    const kpi = await prisma.kpiDefinition.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        unit: true,
        direction: true,
        warningThreshold: true,
        criticalThreshold: true,
        targetValue: true,
      },
    });

    if (!kpi) {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 });
    }

    const values = await prisma.kpiValue.findMany({
      where: { kpiId: id },
      orderBy: { createdAt: "desc" },
      take: periods,
    });

    // Format for charts
    const history = values.reverse().map((v) => ({
      period: v.period,
      value: v.value.toNumber(),
      createdAt: v.createdAt,
    }));

    return NextResponse.json({
      kpi,
      history,
      thresholds: {
        warning: kpi.warningThreshold?.toNumber(),
        critical: kpi.criticalThreshold?.toNumber(),
        target: kpi.targetValue?.toNumber(),
      },
    });
  } catch (error) {
    console.error("Error fetching KPI history:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI history" },
      { status: 500 }
    );
  }
}
