import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";

// GET /api/leads - Get all leads for the firm
export async function GET(request: NextRequest) {
  try {
    // Check READ permission on leads
    const { authorized, user, error } = await checkPermission("leads", PermissionAction.READ);
    if (!authorized || !user) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");

    // Build where clause - always filter by firmId for tenant isolation
    const where: Record<string, unknown> = {
      firmId: user.firmId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (source && source !== "all") {
      where.source = source;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (assignedToId && assignedToId !== "all") {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        interactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    // Check CREATE permission on leads
    const { authorized, user, error } = await checkPermission("leads", PermissionAction.CREATE);
    if (!authorized || !user) {
      return error;
    }

    const body = await request.json();

    const {
      companyName,
      contactPerson,
      contactEmail,
      contactPhone,
      industry,
      website,
      address,
      city,
      state,
      country,
      source,
      status,
      priority,
      estimatedValue,
      probability,
      expectedCloseDate,
      assignedToId,
      servicesInterested,
      requirements,
      notes,
    } = body;

    // Validate required fields
    if (!companyName || !contactPerson || !contactEmail) {
      return NextResponse.json(
        { error: "Company name, contact person, and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        companyName,
        contactPerson,
        contactEmail,
        contactPhone,
        industry,
        website,
        address,
        city,
        state,
        country: country || "India",
        source: source || "REFERRAL",
        status: status || "NEW",
        priority: priority || "MEDIUM",
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        probability: probability ? parseInt(probability) : null,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        assignedToId,
        servicesInterested,
        requirements,
        notes,
        firmId: user.firmId,
        createdById: user.id,
      },
      include: {
        interactions: true,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
