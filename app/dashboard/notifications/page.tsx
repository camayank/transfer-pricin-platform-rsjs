"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  AlertTriangle,
  MessageSquare,
  FileText,
  Users,
  Clock,
  MoreHorizontal,
  Settings,
  Trash2,
} from "lucide-react";

// Sample notification data
const sampleNotifications = [
  {
    id: "1",
    type: "TASK_ASSIGNED",
    title: "New task assigned",
    message: "You have been assigned to 'Prepare comparable company analysis' for TechCorp TP Compliance 2025",
    timestamp: "2025-01-30T15:00:00Z",
    read: false,
    actionUrl: "/dashboard/projects/tasks",
    icon: FileText,
    priority: "HIGH",
  },
  {
    id: "2",
    type: "DEADLINE_REMINDER",
    title: "Deadline approaching",
    message: "Form 3CEB filing for Pharma Solutions Ltd is due in 3 days",
    timestamp: "2025-01-30T10:00:00Z",
    read: false,
    actionUrl: "/dashboard/clients/2",
    icon: Calendar,
    priority: "URGENT",
  },
  {
    id: "3",
    type: "MESSAGE",
    title: "New message",
    message: "Client Contact replied in 'TechCorp Form 3CEB Query' thread",
    timestamp: "2025-01-30T09:30:00Z",
    read: true,
    actionUrl: "/dashboard/messages",
    icon: MessageSquare,
    priority: "NORMAL",
  },
  {
    id: "4",
    type: "DOCUMENT_SHARED",
    title: "Document shared",
    message: "Rahul Mehta shared 'Benchmarking Analysis Q3.xlsx' with you",
    timestamp: "2025-01-29T16:00:00Z",
    read: true,
    actionUrl: "/dashboard/documents",
    icon: FileText,
    priority: "NORMAL",
  },
  {
    id: "5",
    type: "ACCESS_REVIEW",
    title: "Access review required",
    message: "Q1 2025 Access Review requires your attention - 5 items pending",
    timestamp: "2025-01-29T09:00:00Z",
    read: true,
    actionUrl: "/dashboard/compliance/access-reviews",
    icon: Users,
    priority: "HIGH",
  },
  {
    id: "6",
    type: "SYSTEM_ALERT",
    title: "System maintenance",
    message: "Scheduled maintenance on Feb 1, 2025 from 2:00 AM to 4:00 AM IST",
    timestamp: "2025-01-28T12:00:00Z",
    read: true,
    actionUrl: null,
    icon: AlertTriangle,
    priority: "LOW",
  },
];

const priorityConfig: Record<string, { color: string; bg: string }> = {
  LOW: { color: "text-gray-500", bg: "bg-gray-500/10" },
  NORMAL: { color: "text-blue-500", bg: "bg-blue-500/10" },
  HIGH: { color: "text-orange-500", bg: "bg-orange-500/10" },
  URGENT: { color: "text-red-500", bg: "bg-red-500/10" },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-[var(--text-secondary)]">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="mr-1 h-4 w-4" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 text-sm font-medium transition-colors ${
            filter === "all"
              ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`pb-3 text-sm font-medium transition-colors ${
            filter === "unread"
              ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No notifications
              </p>
              <p className="text-[var(--text-secondary)]">
                {filter === "unread" ? "All notifications have been read" : "You're all caught up!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`transition-colors hover:border-[var(--border-default)] ${
                  !notification.read ? "bg-[var(--accent-glow)]/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-2 ${priorityConfig[notification.priority].bg}`}>
                      <Icon className={`h-5 w-5 ${priorityConfig[notification.priority].color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${
                              !notification.read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--text-muted)]">
                            {formatTime(notification.timestamp)}
                          </span>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        )}
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
