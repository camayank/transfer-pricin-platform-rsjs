import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { integrationService } from "@/lib/engines/integration-engine";

// GET /api/integrations - List tenant integrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const integrations = await prisma.tenantIntegration.findMany({
      where: { firmId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            provider: true,
            category: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Don't expose credentials
    const sanitizedIntegrations = integrations.map((i) => ({
      ...i,
      credentials: undefined,
    }));

    return NextResponse.json({ integrations: sanitizedIntegrations });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

// POST /api/integrations - Activate integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, templateId, config, credentials } = body;

    if (!firmId || !templateId || !config) {
      return NextResponse.json(
        { error: "firmId, templateId, and config are required" },
        { status: 400 }
      );
    }

    // Get template
    const template = await prisma.integrationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Validate config against schema
    const validation = integrationService.validateConfig(
      config,
      template.configSchema as any
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid configuration", details: validation.errors },
        { status: 400 }
      );
    }

    // Check for existing integration
    const existing = await prisma.tenantIntegration.findUnique({
      where: {
        firmId_templateId: { firmId, templateId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Integration already exists. Update the existing one." },
        { status: 400 }
      );
    }

    const integration = await prisma.tenantIntegration.create({
      data: {
        firmId,
        templateId,
        config,
        credentials, // In production, encrypt this
        status: "PENDING",
        isActive: true,
      },
      include: {
        template: {
          select: { name: true, provider: true },
        },
      },
    });

    return NextResponse.json(
      {
        integration: {
          ...integration,
          credentials: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating integration:", error);
    return NextResponse.json(
      { error: "Failed to create integration" },
      { status: 500 }
    );
  }
}
