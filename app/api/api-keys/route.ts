import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiKeyService } from "@/lib/engines/integration-engine";

// GET /api/api-keys - List API keys
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

    const apiKeys = await prisma.apiKey.findMany({
      where: { firmId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        rateLimit: true,
        expiresAt: true,
        lastUsedAt: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Add expiry status
    const keysWithStatus = apiKeys.map((key) => ({
      ...key,
      isExpired: apiKeyService.isExpired(key.expiresAt),
    }));

    return NextResponse.json({ apiKeys: keysWithStatus });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, name, permissions, rateLimit, expiresAt } = body;

    if (!firmId || !name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: "firmId, name, and permissions are required" },
        { status: 400 }
      );
    }

    // Generate API key
    const keyResult = apiKeyService.generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        firmId,
        name,
        keyHash: keyResult.keyHash,
        keyPrefix: keyResult.keyPrefix,
        permissions,
        rateLimit: rateLimit || 1000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
        createdById: session.user.id,
      },
    });

    // Return the full key only once
    return NextResponse.json(
      {
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          keyPrefix: apiKey.keyPrefix,
          permissions: apiKey.permissions,
          rateLimit: apiKey.rateLimit,
          expiresAt: apiKey.expiresAt,
          isActive: apiKey.isActive,
          createdAt: apiKey.createdAt,
        },
        fullKey: keyResult.fullKey, // Only returned once on creation
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
