import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { projectService } from "@/lib/engines/project-engine";

// GET /api/projects/[id] - Get project detail
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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones: {
          orderBy: { sortOrder: "asc" },
        },
        tasks: {
          orderBy: { sortOrder: "asc" },
        },
        allocations: true,
        timeEntries: {
          orderBy: { date: "desc" },
          take: 20,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const metrics = projectService.calculateMetrics(
      project.tasks.map((t) => ({
        status: t.status as any,
        estimatedHours: t.estimatedHours?.toNumber(),
        actualHours: t.actualHours?.toNumber(),
        dueDate: t.dueDate || undefined,
      })),
      project.budget?.toNumber() || 0,
      project.budgetUsed?.toNumber() || 0
    );

    return NextResponse.json({
      project: {
        ...project,
        metrics,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project
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

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Handle date conversions
    const updateData = { ...body };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.targetEndDate) {
      updateData.targetEndDate = new Date(updateData.targetEndDate);
    }
    if (updateData.actualEndDate) {
      updateData.actualEndDate = new Date(updateData.actualEndDate);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Archive project
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

    // Soft delete by setting status to CANCELLED
    await prisma.project.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error archiving project:", error);
    return NextResponse.json(
      { error: "Failed to archive project" },
      { status: 500 }
    );
  }
}
