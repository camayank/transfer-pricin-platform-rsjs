import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { dashboardService } from "@/lib/engines/analytics-engine";

// GET /api/dashboards - List dashboards
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

    const dashboards = await prisma.customDashboard.findMany({
      where: {
        firmId,
        OR: [
          { userId: session.user.id },
          { isPublic: true },
        ],
      },
      orderBy: [
        { isDefault: "desc" },
        { updatedAt: "desc" },
      ],
    });

    return NextResponse.json({ dashboards });
  } catch (error) {
    console.error("Error fetching dashboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboards" },
      { status: 500 }
    );
  }
}

// POST /api/dashboards - Create dashboard
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, name, description, layout, widgets, isDefault, isPublic, refreshRate, template } = body;

    if (!firmId || !name) {
      return NextResponse.json(
        { error: "firmId and name are required" },
        { status: 400 }
      );
    }

    // Use template widgets if specified
    let dashboardWidgets = widgets;
    let dashboardLayout = layout;

    if (template && !widgets) {
      dashboardWidgets = dashboardService.generateDefaultWidgets(template);
      // Generate layout from widgets
      dashboardLayout = dashboardWidgets.map((w: { id: string; position: object }) => ({
        i: w.id,
        ...w.position,
      }));
    }

    // Validate layout if provided
    if (dashboardWidgets) {
      const validation = dashboardService.validateLayout(dashboardWidgets);
      if (!validation.valid) {
        return NextResponse.json(
          { error: "Invalid widget layout", details: validation.errors },
          { status: 400 }
        );
      }
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.customDashboard.updateMany({
        where: { firmId, userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const dashboard = await prisma.customDashboard.create({
      data: {
        firmId,
        userId: session.user.id,
        name,
        description,
        layout: dashboardLayout || [],
        widgets: dashboardWidgets || [],
        isDefault: isDefault || false,
        isPublic: isPublic || false,
        refreshRate,
      },
    });

    return NextResponse.json({ dashboard }, { status: 201 });
  } catch (error) {
    console.error("Error creating dashboard:", error);
    return NextResponse.json(
      { error: "Failed to create dashboard" },
      { status: 500 }
    );
  }
}
