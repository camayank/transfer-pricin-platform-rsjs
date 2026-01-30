import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/data-requests/[id] - Get single data request
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

    const deletionRequest = await prisma.dataDeletionRequest.findUnique({
      where: { id },
    });

    if (!deletionRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: deletionRequest });
  } catch (error) {
    console.error("Error fetching data request:", error);
    return NextResponse.json(
      { error: "Failed to fetch data request" },
      { status: 500 }
    );
  }
}

// PATCH /api/data-requests/[id] - Update data request status
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
    const { status, rejectionReason } = body;

    const existingRequest = await prisma.dataDeletionRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;

      if (status === "PROCESSING") {
        updateData.processingStarted = new Date();
      } else if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      } else if (status === "REJECTED" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
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
