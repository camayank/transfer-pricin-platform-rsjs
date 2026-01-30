import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { projectService, ProjectType, Priority } from "@/lib/engines/project-engine";

// GET /api/projects - List projects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { firmId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const projects = await prisma.project.findMany({
      where,
      include: {
        milestones: {
          select: { id: true, status: true },
        },
        tasks: {
          select: { id: true, status: true, estimatedHours: true, actualHours: true, dueDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate metrics for each project
    const projectsWithMetrics = projects.map((project) => {
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

      return {
        ...project,
        metrics,
      };
    });

    return NextResponse.json({ projects: projectsWithMetrics });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firmId,
      clientId,
      name,
      description,
      projectType,
      priority,
      budget,
      startDate,
      targetEndDate,
      managerId,
    } = body;

    if (!firmId || !name) {
      return NextResponse.json(
        { error: "firmId and name are required" },
        { status: 400 }
      );
    }

    // Validate dates
    const dateValidation = projectService.validateDates(
      startDate ? new Date(startDate) : undefined,
      targetEndDate ? new Date(targetEndDate) : undefined
    );

    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: "Invalid dates", details: dateValidation.errors },
        { status: 400 }
      );
    }

    // Generate project code
    const projectCode = projectService.generateProjectCode(
      firmId,
      (projectType as ProjectType) || ProjectType.ENGAGEMENT
    );

    const project = await prisma.project.create({
      data: {
        firmId,
        clientId,
        projectCode,
        name,
        description,
        projectType: projectType || "ENGAGEMENT",
        priority: (priority as Priority) || Priority.MEDIUM,
        budget,
        startDate: startDate ? new Date(startDate) : null,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
        managerId,
        status: "PLANNING",
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
