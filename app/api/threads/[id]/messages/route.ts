import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { messagingService } from "@/lib/engines/notification-engine";

// GET /api/threads/[id]/messages - Get thread messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const thread = await prisma.communicationThread.findUnique({
      where: { id },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Check if user is a participant
    const participants = thread.participants as string[];
    if (!participants.includes(session.user.id)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const messages = await prisma.threadMessage.findMany({
      where: { threadId: id },
      orderBy: { createdAt: "asc" },
    });

    // Fetch sender names
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, email: true },
    });

    const senderMap = new Map(senders.map((s) => [s.id, s]));
    const messagesWithSenders = messages.map((msg) => ({
      ...msg,
      sender: senderMap.get(msg.senderId),
    }));

    return NextResponse.json({ thread, messages: messagesWithSenders });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/threads/[id]/messages - Send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content, contentType, isInternal, attachments } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const thread = await prisma.communicationThread.findUnique({
      where: { id },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Check if user is a participant
    const participants = thread.participants as string[];
    if (!participants.includes(session.user.id)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Sanitize content
    const sanitizedContent = messagingService.sanitizeContent(
      content,
      contentType || "TEXT"
    );

    // Extract mentions
    const mentions = messagingService.extractMentions(content);

    const message = await prisma.threadMessage.create({
      data: {
        threadId: id,
        senderId: session.user.id,
        content: sanitizedContent,
        contentType: contentType || "TEXT",
        isInternal: isInternal || false,
        attachments,
        readBy: [session.user.id], // Sender has read it
      },
    });

    // Update thread's updatedAt
    await prisma.communicationThread.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // TODO: Create notifications for mentioned users and participants

    return NextResponse.json({ message, mentions }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
