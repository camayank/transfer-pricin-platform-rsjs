import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/reports - List custom reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const dataSource = searchParams.get("dataSource");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      firmId,
      OR: [
        { createdById: session.user.id },
        { isPublic: true },
      ],
    };

    if (dataSource) {
      where.dataSource = dataSource;
    }

    const reports = await prisma.customReport.findMany({
      where,
      include: {
        schedules: {
          where: { isActive: true },
          select: { id: true, frequency: true, nextRunAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create custom report
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
      reportType,
      dataSource,
      columns,
      filters,
      sorting,
      chartConfig,
      isPublic,
    } = body;

    if (!firmId || !name || !reportType || !dataSource || !columns) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const report = await prisma.customReport.create({
      data: {
        firmId,
        createdById: session.user.id,
        name,
        description,
        reportType,
        dataSource,
        columns,
        filters,
        sorting,
        chartConfig,
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
