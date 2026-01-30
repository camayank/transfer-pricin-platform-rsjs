import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { timeEntryService } from "@/lib/engines/project-engine";

// GET /api/time-entries - Get user's time entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      firmId,
      userId: session.user.id,
    };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, projectCode: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    // Calculate totals
    const totals = {
      totalHours: timeEntries.reduce((sum, e) => sum + e.hours.toNumber(), 0),
      billableHours: timeEntries
        .filter((e) => e.billable)
        .reduce((sum, e) => sum + e.hours.toNumber(), 0),
    };

    return NextResponse.json({ timeEntries, totals });
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 }
    );
  }
}

// POST /api/time-entries - Log time
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firmId,
      projectId,
      taskId,
      date,
      hours,
      description,
      billable,
      billRate,
    } = body;

    if (!firmId || !projectId || !date || !hours) {
      return NextResponse.json(
        { error: "firmId, projectId, date, and hours are required" },
        { status: 400 }
      );
    }

    // Validate time entry
    const validation = timeEntryService.validate({
      firmId,
      projectId,
      taskId,
      userId: session.user.id,
      date: new Date(date),
      hours,
      description,
      billable: billable ?? true,
      billRate,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid time entry", details: validation.errors },
        { status: 400 }
      );
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        firmId,
        projectId,
        taskId,
        userId: session.user.id,
        date: new Date(date),
        hours,
        description,
        billable: billable ?? true,
        billRate,
        status: "DRAFT",
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
    });

    // Update task actual hours if task provided
    if (taskId) {
      await prisma.projectTask.update({
        where: { id: taskId },
        data: {
          actualHours: {
            increment: hours,
          },
        },
      });
    }

    return NextResponse.json({ timeEntry }, { status: 201 });
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json(
      { error: "Failed to create time entry" },
      { status: 500 }
    );
  }
}
