import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { kpiService } from "@/lib/engines/analytics-engine";

// GET /api/kpis/[id] - Get KPI with current value
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

    const kpi = await prisma.kpiDefinition.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: { createdAt: "desc" },
          take: 12, // Last 12 periods
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!kpi) {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 });
    }

    const currentValue = kpi.values[0]?.value?.toNumber() ?? null;
    const previousValue = kpi.values[1]?.value?.toNumber() ?? null;

    const trend = kpiService.calculateTrend(currentValue || 0, previousValue);
    const alertLevel = kpiService.calculateAlertLevel(
      currentValue || 0,
      kpi.direction as "HIGHER_IS_BETTER" | "LOWER_IS_BETTER",
      kpi.warningThreshold?.toNumber(),
      kpi.criticalThreshold?.toNumber()
    );

    return NextResponse.json({
      kpi: {
        ...kpi,
        currentValue,
        trend,
        alertLevel,
      },
    });
  } catch (error) {
    console.error("Error fetching KPI:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI" },
      { status: 500 }
    );
  }
}

// PATCH /api/kpis/[id] - Update KPI thresholds
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

    const kpi = await prisma.kpiDefinition.findUnique({
      where: { id },
    });

    if (!kpi) {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 });
    }

    const updatedKpi = await prisma.kpiDefinition.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ kpi: updatedKpi });
  } catch (error) {
    console.error("Error updating KPI:", error);
    return NextResponse.json(
      { error: "Failed to update KPI" },
      { status: 500 }
    );
  }
}

// DELETE /api/kpis/[id] - Delete KPI
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.kpiDefinition.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting KPI:", error);
    return NextResponse.json(
      { error: "Failed to delete KPI" },
      { status: 500 }
    );
  }
}
