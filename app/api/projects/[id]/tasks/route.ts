import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id]/tasks - List project tasks
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
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");

    const where: Record<string, unknown> = { projectId: id };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.projectTask.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // Fetch assignee names
    const assigneeIds = [...new Set(tasks.map((t) => t.assigneeId).filter(Boolean))];
    const assignees = await prisma.user.findMany({
      where: { id: { in: assigneeIds as string[] } },
      select: { id: true, name: true, email: true },
    });

    const assigneeMap = new Map(assignees.map((a) => [a.id, a]));
    const tasksWithAssignees = tasks.map((task) => ({
      ...task,
      assignee: task.assigneeId ? assigneeMap.get(task.assigneeId) : null,
    }));

    return NextResponse.json({ tasks: tasksWithAssignees });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/tasks - Create task
export async function POST(
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
    const {
      milestoneId,
      parentTaskId,
      title,
      description,
      priority,
      assigneeId,
      estimatedHours,
      startDate,
      dueDate,
      dependencies,
      tags,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get max sort order
    const lastTask = await prisma.projectTask.findFirst({
      where: { projectId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const task = await prisma.projectTask.create({
      data: {
        projectId: id,
        milestoneId,
        parentTaskId,
        title,
        description,
        status: "TODO",
        priority: priority || "MEDIUM",
        assigneeId,
        estimatedHours,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        dependencies,
        tags,
        sortOrder: (lastTask?.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
