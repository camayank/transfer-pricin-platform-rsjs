import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { taskService, TaskStatus } from "@/lib/engines/project-engine";

// GET /api/tasks/[id] - Get task detail
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

    const task = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        timeEntries: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task
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

    const task = await prisma.projectTask.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Validate status transition if status is being changed
    if (body.status && body.status !== task.status) {
      const isValidTransition = taskService.isValidStatusTransition(
        task.status as TaskStatus,
        body.status as TaskStatus
      );

      if (!isValidTransition) {
        return NextResponse.json(
          { error: `Invalid status transition from ${task.status} to ${body.status}` },
          { status: 400 }
        );
      }

      // Set completedAt if moving to DONE
      if (body.status === "DONE" && !task.completedAt) {
        body.completedAt = new Date();
      }
    }

    // Handle date conversions
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.dueDate) body.dueDate = new Date(body.dueDate);

    const updatedTask = await prisma.projectTask.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
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

    await prisma.projectTask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
