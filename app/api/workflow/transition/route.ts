/**
 * Workflow Transition API
 * POST /api/workflow/transition - Execute status transition for engagements and documents
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { EngagementStatus, DocStatus } from "@prisma/client";
import {
  workflowEngine,
  type WorkflowEntityType,
  type TransitionRequest,
  type WorkflowHistory,
} from "@/lib/engines/workflow-engine";

// Supported entity types for TP platform
type SupportedEntityType = "ENGAGEMENT" | "DOCUMENT";

function isSupportedEntityType(type: string): type is SupportedEntityType {
  return type === "ENGAGEMENT" || type === "DOCUMENT";
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (!user) return error;

    const { id: userId, firmId, role } = user;
    const body = await request.json();

    // Validate required fields
    if (!body.entityType || !body.entityId || !body.targetStatus) {
      return NextResponse.json(
        { error: "Missing required fields: entityType, entityId, targetStatus" },
        { status: 400 }
      );
    }

    // Validate entity type
    if (!isSupportedEntityType(body.entityType)) {
      return NextResponse.json(
        { error: "Invalid entity type. Supported types: ENGAGEMENT, DOCUMENT" },
        { status: 400 }
      );
    }

    // Get current status based on entity type
    let currentStatus: string;
    switch (body.entityType) {
      case "ENGAGEMENT":
        const engagement = await prisma.engagement.findFirst({
          where: { id: body.entityId, client: { firmId } },
          select: { status: true },
        });
        if (!engagement) {
          return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
        }
        currentStatus = engagement.status;
        break;

      case "DOCUMENT":
        const document = await prisma.document.findFirst({
          where: {
            id: body.entityId,
            OR: [
              { client: { firmId } },
              { engagement: { client: { firmId } } },
            ],
          },
          select: { status: true },
        });
        if (!document) {
          return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        currentStatus = document.status;
        break;

      default:
        // This should never be reached due to isSupportedEntityType check above
        return NextResponse.json({ error: "Unsupported entity type" }, { status: 400 });
    }

    // Check if transition is allowed
    const transitionRequest: TransitionRequest = {
      entityType: body.entityType as WorkflowEntityType,
      entityId: body.entityId,
      currentStatus,
      targetStatus: body.targetStatus,
      userId,
      userRole: role,
      firmId,
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
      switch (body.entityType as SupportedEntityType) {
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
      }
    };

    const onAudit = async (history: WorkflowHistory) => {
      // Log to immutable audit log
      const crypto = await import("crypto");
      const lastLog = await prisma.immutableAuditLog.findFirst({
        where: { firmId },
        orderBy: { createdAt: "desc" },
        select: { currentHash: true },
      });

      const hashContent = JSON.stringify({
        firmId,
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
          firmId,
          userId,
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
    const { user, error } = await getAuthenticatedUser();
    if (!user) return error;

    const { role } = user;
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get("entityType") as WorkflowEntityType;
    const currentStatus = searchParams.get("currentStatus");

    if (!entityType || !currentStatus) {
      return NextResponse.json(
        { error: "Missing entityType or currentStatus" },
        { status: 400 }
      );
    }

    if (!isSupportedEntityType(entityType)) {
      return NextResponse.json(
        { error: "Invalid entity type. Supported types: ENGAGEMENT, DOCUMENT" },
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
