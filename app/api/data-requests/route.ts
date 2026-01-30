import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { dataDeletionService } from "@/lib/engines/audit-engine";

// GET /api/data-requests - List data deletion requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { firmId };
    if (status) {
      where.status = status;
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

    return NextResponse.json({
      requests,
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

// POST /api/data-requests - Create data deletion request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, requestType, subjectEmail, subjectName, scope } = body;

    if (!firmId || !subjectEmail || !scope) {
      return NextResponse.json(
        { error: "firmId, subjectEmail, and scope are required" },
        { status: 400 }
      );
    }

    // Validate scope
    const validation = dataDeletionService.validateScope(scope);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid scope", details: validation.errors },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = dataDeletionService.generateVerificationToken();

    const deletionRequest = await prisma.dataDeletionRequest.create({
      data: {
        firmId,
        requestType: requestType || "ERASURE",
        subjectEmail,
        subjectName,
        scope,
        status: "PENDING_VERIFICATION",
        verificationToken,
      },
    });

    // In production, send verification email here
    // await sendVerificationEmail(subjectEmail, verificationToken);

    return NextResponse.json({ request: deletionRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating data request:", error);
    return NextResponse.json(
      { error: "Failed to create data request" },
      { status: 500 }
    );
  }
}
