import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";
import { buildClientAccessFilter } from "@/lib/api/auth";

// GET /api/clients - Get clients based on user's role and access level
export async function GET(request: NextRequest) {
  try {
    // Check READ permission on clients
    const { authorized, user, error } = await checkPermission("clients", PermissionAction.READ);
    if (!authorized || !user) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const search = searchParams.get("search");
    const showAll = searchParams.get("all") === "true"; // Admin can request all clients

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    // - Admin/Partner/Senior Manager: See ALL clients in firm
    // - Manager: See clients where assignedTo OR reviewer
    // - Associate/Trainee: See only clients where assignedTo
    const baseFilter = buildClientAccessFilter({
      id: user.id,
      email: user.email || "",
      name: user.name || null,
      role: user.role,
      firmId: user.firmId,
      firmName: null,
    });

    const where: Record<string, unknown> = { ...baseFilter };

    if (status && status !== "all") {
      where.status = status;
    }

    if (industry && industry !== "all") {
      where.industry = industry;
    }

    // Handle search with existing filters
    if (search) {
      // If we have OR conditions from role filtering, we need to AND them with search
      const existingOr = where.OR;
      delete where.OR;

      const searchConditions = [
        { name: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
      ];

      if (existingOr) {
        // Combine role-based OR with search OR using AND
        where.AND = [
          { OR: existingOr },
          { OR: searchConditions },
        ];
      } else {
        where.OR = searchConditions;
      }
    }

    // Get total count and clients in parallel
    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          reviewer: {
            select: { id: true, name: true, email: true },
          },
          engagements: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    // Check CREATE permission on clients
    const { authorized, user, error } = await checkPermission("clients", PermissionAction.CREATE);
    if (!authorized || !user) {
      return error;
    }

    const body = await request.json();

    const {
      name,
      pan,
      tan,
      cin,
      industry,
      nicCode,
      nicDescription,
      contactPerson,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      pincode,
      country,
      website,
      parentCompany,
      parentCountry,
      ultimateParent,
      ultimateParentCountry,
      consolidatedRevenue,
    } = body;

    // Validate required fields
    if (!name || !pan) {
      return NextResponse.json(
        { error: "Name and PAN are required" },
        { status: 400 }
      );
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return NextResponse.json(
        { error: "Invalid PAN format" },
        { status: 400 }
      );
    }

    // Check if client with this PAN already exists for the firm
    const existingClient = await prisma.client.findFirst({
      where: { pan, firmId: user.firmId },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this PAN already exists" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        pan,
        tan,
        cin,
        industry,
        nicCode,
        nicDescription,
        contactPerson,
        contactEmail,
        contactPhone,
        address,
        city,
        state,
        pincode,
        country: country || "India",
        website,
        parentCompany,
        parentCountry,
        ultimateParent,
        ultimateParentCountry,
        consolidatedRevenue,
        firmId: user.firmId, // Use authenticated user's firmId
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
