"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Plus,
  Search,
  User,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Send,
  Paperclip,
} from "lucide-react";

// Sample thread data
const sampleThreads = [
  {
    id: "1",
    subject: "TechCorp Form 3CEB Query",
    entityType: "CLIENT",
    entityName: "TechCorp India Pvt Ltd",
    participants: ["Priya S.", "Rahul M.", "Client Contact"],
    lastMessage: "Please find the updated financial statements attached.",
    lastMessageBy: "Client Contact",
    lastMessageAt: "2025-01-30T14:30:00Z",
    unreadCount: 2,
    status: "OPEN",
  },
  {
    id: "2",
    subject: "Benchmarking Analysis Review",
    entityType: "ENGAGEMENT",
    entityName: "Pharma Solutions APA Filing",
    participants: ["Rahul M.", "Amit K."],
    lastMessage: "I've reviewed the comparables. Can we discuss the functional analysis?",
    lastMessageBy: "Amit K.",
    lastMessageAt: "2025-01-30T11:15:00Z",
    unreadCount: 0,
    status: "OPEN",
  },
  {
    id: "3",
    subject: "Documentation Requirements",
    entityType: "CLIENT",
    entityName: "Auto Parts Manufacturing",
    participants: ["Amit K.", "Sneha R.", "Client Contact"],
    lastMessage: "Thanks for the clarification. We'll proceed accordingly.",
    lastMessageBy: "Sneha R.",
    lastMessageAt: "2025-01-29T16:45:00Z",
    unreadCount: 0,
    status: "CLOSED",
  },
  {
    id: "4",
    subject: "Master File Completion",
    entityType: "ENGAGEMENT",
    entityName: "Global KPO Master File",
    participants: ["Sneha R.", "Vikram P."],
    lastMessage: "Final review completed. Ready for client sign-off.",
    lastMessageBy: "Vikram P.",
    lastMessageAt: "2025-01-28T10:00:00Z",
    unreadCount: 0,
    status: "CLOSED",
  },
];

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<string | null>("1");
  const [messageInput, setMessageInput] = useState("");

  const filteredThreads = sampleThreads.filter((thread) =>
    thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.entityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentThread = sampleThreads.find((t) => t.id === selectedThread);

  // Sample messages for selected thread
  const sampleMessages = selectedThread === "1" ? [
    {
      id: "m1",
      senderId: "client",
      senderName: "Client Contact",
      content: "Hi team, we have some queries regarding the Form 3CEB filing for this year.",
      timestamp: "2025-01-30T09:00:00Z",
      isInternal: false,
    },
    {
      id: "m2",
      senderId: "priya",
      senderName: "Priya Sharma",
      content: "Hello! Sure, please share your queries and we'll address them.",
      timestamp: "2025-01-30T09:30:00Z",
      isInternal: false,
    },
    {
      id: "m3",
      senderId: "client",
      senderName: "Client Contact",
      content: "We need clarification on the arm's length pricing for the IT services transaction. The methodology used last year may need revision.",
      timestamp: "2025-01-30T10:00:00Z",
      isInternal: false,
    },
    {
      id: "m4",
      senderId: "rahul",
      senderName: "Rahul Mehta",
      content: "@Priya - Let's discuss this internally before responding.",
      timestamp: "2025-01-30T11:00:00Z",
      isInternal: true,
    },
    {
      id: "m5",
      senderId: "client",
      senderName: "Client Contact",
      content: "Please find the updated financial statements attached.",
      timestamp: "2025-01-30T14:30:00Z",
      isInternal: false,
    },
  ] : [];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Thread List */}
      <div className="w-96 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Messages</h1>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Thread
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 overflow-y-auto">
          {filteredThreads.map((thread) => (
            <Card
              key={thread.id}
              className={`cursor-pointer transition-colors hover:border-[var(--border-default)] ${
                selectedThread === thread.id ? "border-[var(--accent)] bg-[var(--accent-glow)]" : ""
              }`}
              onClick={() => setSelectedThread(thread.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-[var(--text-primary)]">
                        {thread.subject}
                      </h3>
                      {thread.unreadCount > 0 && (
                        <Badge variant="error">{thread.unreadCount}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{thread.entityName}</p>
                    <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                      {thread.lastMessageBy}: {thread.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatTime(thread.lastMessageAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Message View */}
      <Card className="flex flex-1 flex-col">
        {currentThread ? (
          <>
            {/* Header */}
            <CardHeader className="border-b border-[var(--border-subtle)] py-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{currentThread.subject}</CardTitle>
                  <p className="text-sm text-[var(--text-muted)]">
                    {currentThread.entityType}: {currentThread.entityName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {currentThread.participants.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)]"
                        title={p}
                      >
                        {p.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
              {sampleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === "priya" || message.senderId === "rahul"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isInternal
                        ? "bg-yellow-500/10 border border-yellow-500/30"
                        : message.senderId === "priya" || message.senderId === "rahul"
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        message.senderId === "priya" || message.senderId === "rahul"
                          ? message.isInternal ? "text-yellow-600" : "text-white/80"
                          : "text-[var(--text-muted)]"
                      }`}>
                        {message.senderName}
                        {message.isInternal && (
                          <Badge variant="warning" className="ml-2">Internal</Badge>
                        )}
                      </span>
                    </div>
                    <p className={
                      message.senderId === "priya" || message.senderId === "rahul"
                        ? message.isInternal ? "text-[var(--text-primary)]" : "text-white"
                        : "text-[var(--text-primary)]"
                    }>
                      {message.content}
                    </p>
                    <span className={`mt-1 block text-xs ${
                      message.senderId === "priya" || message.senderId === "rahul"
                        ? message.isInternal ? "text-[var(--text-muted)]" : "text-white/60"
                        : "text-[var(--text-muted)]"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input */}
            <div className="border-t border-[var(--border-subtle)] p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-[var(--text-secondary)]">
                Select a conversation to view messages
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
