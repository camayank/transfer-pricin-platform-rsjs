import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { kpiService } from "@/lib/engines/analytics-engine";

// GET /api/kpis - List KPI definitions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const category = searchParams.get("category");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { firmId, isActive: true };
    if (category) {
      where.category = category;
    }

    const kpis = await prisma.kpiDefinition.findMany({
      where,
      include: {
        values: {
          orderBy: { createdAt: "desc" },
          take: 2,
        },
        alerts: {
          where: { acknowledgedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    // Add trend and alert level to each KPI
    const kpisWithMetrics = kpis.map((kpi) => {
      const currentValue = kpi.values[0]?.value?.toNumber() ?? null;
      const previousValue = kpi.values[1]?.value?.toNumber() ?? null;

      const trend = kpiService.calculateTrend(currentValue || 0, previousValue);
      const alertLevel = kpiService.calculateAlertLevel(
        currentValue || 0,
        kpi.direction as "HIGHER_IS_BETTER" | "LOWER_IS_BETTER",
        kpi.warningThreshold?.toNumber(),
        kpi.criticalThreshold?.toNumber()
      );

      return {
        ...kpi,
        currentValue,
        trend,
        alertLevel,
        hasActiveAlert: kpi.alerts.length > 0,
      };
    });

    return NextResponse.json({ kpis: kpisWithMetrics });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPIs" },
      { status: 500 }
    );
  }
}

// POST /api/kpis - Define KPI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firmId,
      name,
      description,
      category,
      calculationQuery,
      unit,
      direction,
      warningThreshold,
      criticalThreshold,
      targetValue,
    } = body;

    if (!firmId || !name || !category || !calculationQuery || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.kpiDefinition.findUnique({
      where: { firmId_name: { firmId, name } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "KPI with this name already exists" },
        { status: 400 }
      );
    }

    const kpi = await prisma.kpiDefinition.create({
      data: {
        firmId,
        name,
        description,
        category,
        calculationQuery,
        unit,
        direction: direction || "HIGHER_IS_BETTER",
        warningThreshold,
        criticalThreshold,
        targetValue,
      },
    });

    return NextResponse.json({ kpi }, { status: 201 });
  } catch (error) {
    console.error("Error creating KPI:", error);
    return NextResponse.json(
      { error: "Failed to create KPI" },
      { status: 500 }
    );
  }
}
