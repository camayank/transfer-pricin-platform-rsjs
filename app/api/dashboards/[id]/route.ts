import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboards/[id] - Get dashboard with data
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

    const dashboard = await prisma.customDashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }

    // In production, would fetch widget data here based on widget configs
    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboards/[id] - Update dashboard
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

    const dashboard = await prisma.customDashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }

    if (dashboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.customDashboard.updateMany({
        where: {
          firmId: dashboard.firmId,
          userId: session.user.id,
          isDefault: true,
          NOT: { id },
        },
        data: { isDefault: false },
      });
    }

    const updatedDashboard = await prisma.customDashboard.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ dashboard: updatedDashboard });
  } catch (error) {
    console.error("Error updating dashboard:", error);
    return NextResponse.json(
      { error: "Failed to update dashboard" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboards/[id] - Delete dashboard
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

    const dashboard = await prisma.customDashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }

    if (dashboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.customDashboard.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dashboard:", error);
    return NextResponse.json(
      { error: "Failed to delete dashboard" },
      { status: 500 }
    );
  }
}
