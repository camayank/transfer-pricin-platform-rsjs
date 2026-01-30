import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPermission,
  PermissionAction,
} from "@/lib/api/permissions";

// GET /api/clients - Get all clients for the firm
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

    // Build where clause - always filter by firmId for tenant isolation
    const where: Record<string, unknown> = {
      firmId: user.firmId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (industry && industry !== "all") {
      where.industry = industry;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        engagements: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clients });
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
