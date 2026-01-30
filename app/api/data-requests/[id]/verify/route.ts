import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/data-requests/[id]/verify - Verify deletion request via token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const deletionRequest = await prisma.dataDeletionRequest.findUnique({
      where: { id },
    });

    if (!deletionRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (deletionRequest.status !== "PENDING_VERIFICATION") {
      return NextResponse.json(
        { error: "Request has already been verified or processed" },
        { status: 400 }
      );
    }

    if (deletionRequest.verificationToken !== token) {
      return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
    }

    const updatedRequest = await prisma.dataDeletionRequest.update({
      where: { id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      request: updatedRequest,
      message: "Request verified successfully",
    });
  } catch (error) {
    console.error("Error verifying data request:", error);
    return NextResponse.json(
      { error: "Failed to verify data request" },
      { status: 500 }
    );
  }
}
