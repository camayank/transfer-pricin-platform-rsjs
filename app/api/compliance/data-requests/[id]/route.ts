import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";

// GET /api/compliance/data-requests/[id] - Get single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.READ);
    if (!authorized || !user) return error;

    const { id } = await params;

    const dataRequest = await prisma.dataDeletionRequest.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!dataRequest) {
      return NextResponse.json(
        { error: "Data request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: dataRequest });
  } catch (error) {
    console.error("Error fetching data request:", error);
    return NextResponse.json(
      { error: "Failed to fetch data request" },
      { status: 500 }
    );
  }
}

// PATCH /api/compliance/data-requests/[id] - Update request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.UPDATE);
    if (!authorized || !user) return error;

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason, deletionLog } = body;

    const dataRequest = await prisma.dataDeletionRequest.findFirst({
      where: {
        id,
        firmId: user.firmId,
      },
    });

    if (!dataRequest) {
      return NextResponse.json(
        { error: "Data request not found" },
        { status: 404 }
      );
    }

    // Handle different actions
    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "verify":
        if (dataRequest.status !== "PENDING_VERIFICATION") {
          return NextResponse.json(
            { error: "Request is not pending verification" },
            { status: 400 }
          );
        }
        updateData = {
          status: "VERIFIED",
          verifiedAt: new Date(),
        };
        break;

      case "start_processing":
        if (dataRequest.status !== "VERIFIED") {
          return NextResponse.json(
            { error: "Request must be verified before processing" },
            { status: 400 }
          );
        }
        updateData = {
          status: "PROCESSING",
          processingStarted: new Date(),
        };
        break;

      case "complete":
        if (dataRequest.status !== "PROCESSING") {
          return NextResponse.json(
            { error: "Request must be processing to complete" },
            { status: 400 }
          );
        }
        updateData = {
          status: "COMPLETED",
          completedAt: new Date(),
          deletionLog: deletionLog || dataRequest.deletionLog,
        };
        break;

      case "reject":
        if (!rejectionReason) {
          return NextResponse.json(
            { error: "Rejection reason is required" },
            { status: 400 }
          );
        }
        updateData = {
          status: "REJECTED",
          rejectionReason,
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const updatedRequest = await prisma.dataDeletionRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("Error updating data request:", error);
    return NextResponse.json(
      { error: "Failed to update data request" },
      { status: 500 }
    );
  }
}
