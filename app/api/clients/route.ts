import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/clients - Get all clients for the firm
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};

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
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      firmId,
    } = body;

    // Validate required fields
    if (!name || !pan || !firmId) {
      return NextResponse.json(
        { error: "Name, PAN, and Firm ID are required" },
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
      where: { pan, firmId },
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
        firmId,
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
