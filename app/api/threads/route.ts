import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { messagingService } from "@/lib/engines/notification-engine";

// GET /api/threads - Get user's communication threads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const firmId = searchParams.get("firmId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const status = searchParams.get("status");

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      firmId,
      // User must be a participant
      participants: {
        has: session.user.id,
      },
    };

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (status) where.status = status;

    const threads = await prisma.communicationThread.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            readBy: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add preview and unread count
    const threadsWithMeta = threads.map((thread) => ({
      ...thread,
      preview: messagingService.buildThreadPreview(
        thread.messages.map((m) => ({
          content: m.content,
          createdAt: m.createdAt,
        }))
      ),
      unreadCount: messagingService.calculateUnreadCount(
        thread.messages.map((m) => ({
          readBy: m.readBy as string[] | null,
        })),
        session.user.id
      ),
    }));

    return NextResponse.json({ threads: threadsWithMeta });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

// POST /api/threads - Create communication thread
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmId, entityType, entityId, subject, participants, initialMessage } = body;

    if (!firmId || !entityType || !entityId || !subject) {
      return NextResponse.json(
        { error: "firmId, entityType, entityId, and subject are required" },
        { status: 400 }
      );
    }

    // Ensure creator is a participant
    const allParticipants = [...new Set([...(participants || []), session.user.id])];

    const thread = await prisma.communicationThread.create({
      data: {
        firmId,
        entityType,
        entityId,
        subject,
        participants: allParticipants,
        status: "OPEN",
        createdById: session.user.id,
        messages: initialMessage
          ? {
              create: {
                senderId: session.user.id,
                content: messagingService.sanitizeContent(initialMessage, "TEXT"),
                contentType: "TEXT",
                isInternal: false,
              },
            }
          : undefined,
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
