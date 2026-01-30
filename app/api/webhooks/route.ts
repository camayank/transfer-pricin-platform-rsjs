import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { webhookService } from "@/lib/engines/integration-engine";

// GET /api/webhooks - List webhook endpoints
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

    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { firmId },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Don't expose secrets
    const sanitizedWebhooks = webhooks.map((w) => ({
      ...w,
      secret: undefined,
      secretPrefix: w.secret.substring(0, 8) + "...",
    }));

    return NextResponse.json({ webhooks: sanitizedWebhooks });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, url, description, events, retryPolicy } = body;

    if (!firmId || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: "firmId, url, and events are required" },
        { status: 400 }
      );
    }

    // Validate URL
    const urlValidation = webhookService.validateUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: "Invalid URL", details: urlValidation.errors },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = webhookService.generateSecret();

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        firmId,
        url,
        description,
        events,
        secret,
        retryPolicy: retryPolicy || webhookService.getDefaultRetryPolicy(),
        isActive: true,
      },
    });

    // Return secret only on creation
    return NextResponse.json(
      {
        webhook: {
          ...webhook,
          secretPrefix: webhook.secret.substring(0, 8) + "...",
        },
        secret, // Only returned once
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
