/**
 * Workflow Transition API
 * POST /api/workflow/transition - Execute status transition
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EngagementStatus, DocStatus } from "@prisma/client";
import {
  workflowEngine,
  type WorkflowEntityType,
  type TransitionRequest,
  type WorkflowHistory,
} from "@/lib/engines/workflow-engine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, firmId, role } = session.user;
    const body = await request.json();

    // Validate required fields
    if (!body.entityType || !body.entityId || !body.targetStatus) {
      return NextResponse.json(
        { error: "Missing required fields: entityType, entityId, targetStatus" },
        { status: 400 }
      );
    }

    // Get current status based on entity type
    let currentStatus: string;
    switch (body.entityType as WorkflowEntityType) {
      case "ENGAGEMENT":
        const engagement = await prisma.engagement.findFirst({
          where: { id: body.entityId, client: { firmId: firmId || undefined } },
          select: { status: true },
        });
        if (!engagement) {
          return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
        }
        currentStatus = engagement.status;
        break;

      case "DOCUMENT":
        const document = await prisma.document.findFirst({
          where: { id: body.entityId },
          include: { client: true },
        });
        if (!document || document.client?.firmId !== firmId) {
          return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        currentStatus = document.status;
        break;

      case "TASK":
        const task = await prisma.projectTask.findFirst({
          where: { id: body.entityId },
          include: { project: true },
        });
        if (!task || task.project.firmId !== firmId) {
          return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
        currentStatus = task.status;
        break;

      case "PROJECT":
        const project = await prisma.project.findFirst({
          where: { id: body.entityId, firmId: firmId || undefined },
          select: { status: true },
        });
        if (!project) {
          return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        currentStatus = project.status;
        break;

      default:
        return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }

    // Check if transition is allowed
    const transitionRequest: TransitionRequest = {
      entityType: body.entityType,
      entityId: body.entityId,
      currentStatus,
      targetStatus: body.targetStatus,
      userId,
      userRole: role,
      firmId: firmId || "",
      metadata: body.metadata,
    };

    const validation = workflowEngine.canTransition(transitionRequest);
    if (!validation.allowed) {
      return NextResponse.json(
        { error: validation.reason, currentStatus },
        { status: 400 }
      );
    }

    // Execute the transition
    const onUpdate = async (entityId: string, newStatus: string) => {
      switch (body.entityType as WorkflowEntityType) {
        case "ENGAGEMENT":
          await prisma.engagement.update({
            where: { id: entityId },
            data: { status: newStatus as EngagementStatus },
          });
          break;
        case "DOCUMENT":
          await prisma.document.update({
            where: { id: entityId },
            data: { status: newStatus as DocStatus },
          });
          break;
        case "TASK":
          await prisma.projectTask.update({
            where: { id: entityId },
            data: { status: newStatus },
          });
          break;
        case "PROJECT":
          await prisma.project.update({
            where: { id: entityId },
            data: { status: newStatus },
          });
          break;
      }
    };

    const onAudit = async (history: WorkflowHistory) => {
      // Log to immutable audit log
      const crypto = await import("crypto");
      const auditFirmId = firmId || "";
      const lastLog = await prisma.immutableAuditLog.findFirst({
        where: { firmId: auditFirmId },
        orderBy: { createdAt: "desc" },
        select: { currentHash: true },
      });

      const hashContent = JSON.stringify({
        firmId: auditFirmId,
        userId: history.transitionedBy,
        action: "STATUS_CHANGE",
        entityType: history.entityType,
        entityId: history.entityId,
        oldValues: { status: history.fromStatus },
        newValues: { status: history.toStatus },
        previousHash: lastLog?.currentHash || null,
        timestamp: history.transitionedAt.toISOString(),
      });
      const currentHash = crypto.createHash("sha256").update(hashContent).digest("hex");

      await prisma.immutableAuditLog.create({
        data: {
          firmId: auditFirmId,
          userId: history.transitionedBy,
          action: "STATUS_CHANGE",
          entityType: history.entityType,
          entityId: history.entityId,
          oldValues: { status: history.fromStatus },
          newValues: { status: history.toStatus, comment: body.comment },
          previousHash: lastLog?.currentHash || null,
          currentHash,
        },
      });
    };

    const result = await workflowEngine.executeTransition(
      transitionRequest,
      onUpdate,
      onAudit
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      previousStatus: currentStatus,
      newStatus: result.newStatus,
      requiresApproval: result.requiresApproval,
    });
  } catch (error) {
    console.error("Error executing workflow transition:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get allowed transitions for an entity
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session.user;
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get("entityType") as WorkflowEntityType;
    const currentStatus = searchParams.get("currentStatus");

    if (!entityType || !currentStatus) {
      return NextResponse.json(
        { error: "Missing entityType or currentStatus" },
        { status: 400 }
      );
    }

    const allowedTransitions = workflowEngine.getAllowedTransitions(
      entityType,
      currentStatus,
      role
    );

    const progress = workflowEngine.calculateProgress(entityType, currentStatus);
    const isTerminal = workflowEngine.isTerminalStatus(entityType, currentStatus);

    return NextResponse.json({
      currentStatus,
      allowedTransitions,
      progress,
      isTerminal,
    });
  } catch (error) {
    console.error("Error getting transitions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
