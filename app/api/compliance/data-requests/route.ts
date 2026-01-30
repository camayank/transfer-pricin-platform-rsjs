import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";
import crypto from "crypto";

// GET /api/compliance/data-requests - List data deletion requests
export async function GET(request: NextRequest) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.READ);
    if (!authorized || !user) return error;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const requestType = searchParams.get("requestType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Record<string, unknown> = { firmId: user.firmId };

    if (status) {
      where.status = status;
    }

    if (requestType) {
      where.requestType = requestType;
    }

    const [requests, total] = await Promise.all([
      prisma.dataDeletionRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dataDeletionRequest.count({ where }),
    ]);

    // Calculate stats
    const stats = await prisma.dataDeletionRequest.groupBy({
      by: ["status"],
      where: { firmId: user.firmId },
      _count: true,
    });

    const statsMap = stats.reduce((acc, s) => {
      acc[s.status] = s._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      requests,
      stats: {
        total,
        pendingVerification: statsMap["PENDING_VERIFICATION"] || 0,
        verified: statsMap["VERIFIED"] || 0,
        processing: statsMap["PROCESSING"] || 0,
        completed: statsMap["COMPLETED"] || 0,
        rejected: statsMap["REJECTED"] || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching data requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch data requests" },
      { status: 500 }
    );
  }
}

// POST /api/compliance/data-requests - Create new data deletion request
export async function POST(request: NextRequest) {
  try {
    const { authorized, user, error } = await checkPermission("compliance", PermissionAction.CREATE);
    if (!authorized || !user) return error;

    const body = await request.json();
    const { subjectEmail, subjectName, requestType, scope } = body;

    if (!subjectEmail || !requestType || !scope) {
      return NextResponse.json(
        { error: "subjectEmail, requestType, and scope are required" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const dataRequest = await prisma.dataDeletionRequest.create({
      data: {
        firmId: user.firmId,
        subjectEmail,
        subjectName,
        requestType,
        scope,
        verificationToken,
        status: "PENDING_VERIFICATION",
      },
    });

    // TODO: Send verification email to subjectEmail

    return NextResponse.json({ request: dataRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating data request:", error);
    return NextResponse.json(
      { error: "Failed to create data request" },
      { status: 500 }
    );
  }
}
