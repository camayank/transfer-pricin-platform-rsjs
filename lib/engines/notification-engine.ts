/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Notification & Messaging Engine
 *
 * Implements notification preferences, queue processing, and internal messaging.
 * Supports email, SMS, push, and in-app notification channels.
 * ================================================================================
 */

// Types
export interface NotificationPreferenceInput {
  firmId: string;
  userId: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  isEnabled: boolean;
  frequency?: NotificationFrequency;
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
}

export enum NotificationFrequency {
  IMMEDIATE = "IMMEDIATE",
  DAILY_DIGEST = "DAILY_DIGEST",
  WEEKLY_DIGEST = "WEEKLY_DIGEST",
}

export enum NotificationEventType {
  // Engagement events
  ENGAGEMENT_ASSIGNED = "ENGAGEMENT_ASSIGNED",
  ENGAGEMENT_STATUS_CHANGED = "ENGAGEMENT_STATUS_CHANGED",
  DEADLINE_APPROACHING = "DEADLINE_APPROACHING",
  DEADLINE_MISSED = "DEADLINE_MISSED",

  // Document events
  DOCUMENT_SHARED = "DOCUMENT_SHARED",
  DOCUMENT_COMMENT = "DOCUMENT_COMMENT",
  DOCUMENT_REQUIRES_REVIEW = "DOCUMENT_REQUIRES_REVIEW",
  DOCUMENT_APPROVED = "DOCUMENT_APPROVED",

  // Task events
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_DUE_SOON = "TASK_DUE_SOON",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_MENTIONED = "TASK_MENTIONED",

  // Team events
  USER_MENTIONED = "USER_MENTIONED",
  TEAM_ANNOUNCEMENT = "TEAM_ANNOUNCEMENT",

  // Alert events
  HEALTH_SCORE_DROPPED = "HEALTH_SCORE_DROPPED",
  KPI_THRESHOLD_BREACHED = "KPI_THRESHOLD_BREACHED",
  SECURITY_ALERT = "SECURITY_ALERT",

  // Client events
  CLIENT_DOCUMENT_UPLOADED = "CLIENT_DOCUMENT_UPLOADED",
  CLIENT_QUERY = "CLIENT_QUERY",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface NotificationInput {
  firmId: string;
  userId: string;
  type: NotificationEventType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  subject?: string;
  content: NotificationContent;
  metadata?: Record<string, unknown>;
  scheduledAt?: Date;
}

export interface NotificationContent {
  title: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, unknown>;
}

export interface MessageThreadInput {
  firmId: string;
  entityType: string;
  entityId: string;
  subject: string;
  participants: string[];
  createdById: string;
}

export interface MessageInput {
  threadId: string;
  senderId: string;
  content: string;
  contentType?: "TEXT" | "HTML";
  isInternal?: boolean;
  attachments?: AttachmentRef[];
}

export interface AttachmentRef {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface NotificationTemplate {
  id: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  subject: string;
  bodyTemplate: string;
  variables: string[];
}

// =============================================================================
// NOTIFICATION PREFERENCE SERVICE
// =============================================================================

export class NotificationPreferenceService {
  /**
   * Get default preferences for new users
   */
  getDefaultPreferences(firmId: string, userId: string): NotificationPreferenceInput[] {
    const defaults: Array<{
      event: NotificationEventType;
      channels: Array<{ channel: NotificationChannel; frequency: NotificationFrequency }>;
    }> = [
      {
        event: NotificationEventType.ENGAGEMENT_ASSIGNED,
        channels: [
          { channel: NotificationChannel.EMAIL, frequency: NotificationFrequency.IMMEDIATE },
          { channel: NotificationChannel.IN_APP, frequency: NotificationFrequency.IMMEDIATE },
        ],
      },
      {
        event: NotificationEventType.DEADLINE_APPROACHING,
        channels: [
          { channel: NotificationChannel.EMAIL, frequency: NotificationFrequency.IMMEDIATE },
          { channel: NotificationChannel.IN_APP, frequency: NotificationFrequency.IMMEDIATE },
        ],
      },
      {
        event: NotificationEventType.TASK_ASSIGNED,
        channels: [
          { channel: NotificationChannel.EMAIL, frequency: NotificationFrequency.IMMEDIATE },
          { channel: NotificationChannel.IN_APP, frequency: NotificationFrequency.IMMEDIATE },
        ],
      },
      {
        event: NotificationEventType.DOCUMENT_SHARED,
        channels: [
          { channel: NotificationChannel.EMAIL, frequency: NotificationFrequency.IMMEDIATE },
          { channel: NotificationChannel.IN_APP, frequency: NotificationFrequency.IMMEDIATE },
        ],
      },
      {
        event: NotificationEventType.USER_MENTIONED,
        channels: [
          { channel: NotificationChannel.IN_APP, frequency: NotificationFrequency.IMMEDIATE },
        ],
      },
      {
        event: NotificationEventType.SECURITY_ALERT,
        channels: [
          { channel: NotificationChannel.EMAIL, frequency: NotificationFrequency.IMMEDIATE },
          { channel: NotificationChannel.SMS, frequency: NotificationFrequency.IMMEDIATE },
          { channel: NotificationChannel.IN_APP, frequency: NotificationFrequency.IMMEDIATE },
        ],
      },
    ];

    const preferences: NotificationPreferenceInput[] = [];

    for (const { event, channels } of defaults) {
      for (const { channel, frequency } of channels) {
        preferences.push({
          firmId,
          userId,
          channel,
          eventType: event,
          isEnabled: true,
          frequency,
        });
      }
    }

    return preferences;
  }

  /**
   * Get events by category
   */
  getEventsByCategory(): Record<string, NotificationEventType[]> {
    return {
      engagements: [
        NotificationEventType.ENGAGEMENT_ASSIGNED,
        NotificationEventType.ENGAGEMENT_STATUS_CHANGED,
        NotificationEventType.DEADLINE_APPROACHING,
        NotificationEventType.DEADLINE_MISSED,
      ],
      documents: [
        NotificationEventType.DOCUMENT_SHARED,
        NotificationEventType.DOCUMENT_COMMENT,
        NotificationEventType.DOCUMENT_REQUIRES_REVIEW,
        NotificationEventType.DOCUMENT_APPROVED,
      ],
      tasks: [
        NotificationEventType.TASK_ASSIGNED,
        NotificationEventType.TASK_DUE_SOON,
        NotificationEventType.TASK_COMPLETED,
        NotificationEventType.TASK_MENTIONED,
      ],
      team: [
        NotificationEventType.USER_MENTIONED,
        NotificationEventType.TEAM_ANNOUNCEMENT,
      ],
      alerts: [
        NotificationEventType.HEALTH_SCORE_DROPPED,
        NotificationEventType.KPI_THRESHOLD_BREACHED,
        NotificationEventType.SECURITY_ALERT,
      ],
      clients: [
        NotificationEventType.CLIENT_DOCUMENT_UPLOADED,
        NotificationEventType.CLIENT_QUERY,
      ],
    };
  }

  /**
   * Check if user should receive notification
   */
  shouldNotify(
    preferences: Array<{
      channel: NotificationChannel;
      eventType: NotificationEventType;
      isEnabled: boolean;
    }>,
    channel: NotificationChannel,
    eventType: NotificationEventType
  ): boolean {
    const pref = preferences.find(
      (p) => p.channel === channel && p.eventType === eventType
    );
    return pref?.isEnabled ?? false;
  }
}

// =============================================================================
// NOTIFICATION QUEUE SERVICE
// =============================================================================

export class NotificationQueueService {
  /**
   * Calculate priority score for queue ordering
   */
  calculatePriorityScore(
    priority: NotificationPriority,
    scheduledAt?: Date
  ): number {
    const priorityScores: Record<NotificationPriority, number> = {
      [NotificationPriority.URGENT]: 1000,
      [NotificationPriority.HIGH]: 750,
      [NotificationPriority.NORMAL]: 500,
      [NotificationPriority.LOW]: 250,
    };

    let score = priorityScores[priority] || 500;

    // Scheduled notifications get lower priority until their time
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      score -= 200;
    }

    return score;
  }

  /**
   * Check if notification should be sent now
   */
  shouldSendNow(
    scheduledAt?: Date | null,
    frequency?: NotificationFrequency
  ): boolean {
    // Immediate notifications always send now
    if (frequency === NotificationFrequency.IMMEDIATE && !scheduledAt) {
      return true;
    }

    // Scheduled notifications wait for their time
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      return false;
    }

    // Digest notifications are batched
    if (
      frequency === NotificationFrequency.DAILY_DIGEST ||
      frequency === NotificationFrequency.WEEKLY_DIGEST
    ) {
      return this.isDigestTime(frequency);
    }

    return true;
  }

  private isDigestTime(frequency: NotificationFrequency): boolean {
    const now = new Date();
    const hour = now.getHours();

    // Send daily digest at 8 AM
    if (frequency === NotificationFrequency.DAILY_DIGEST) {
      return hour === 8;
    }

    // Send weekly digest on Monday at 8 AM
    if (frequency === NotificationFrequency.WEEKLY_DIGEST) {
      return now.getDay() === 1 && hour === 8;
    }

    return false;
  }

  /**
   * Calculate next retry time
   */
  calculateNextRetry(attempts: number, maxAttempts: number): Date | null {
    if (attempts >= maxAttempts) {
      return null;
    }

    // Exponential backoff: 1min, 5min, 15min, 30min, 60min
    const delays = [60, 300, 900, 1800, 3600];
    const delaySeconds = delays[Math.min(attempts, delays.length - 1)];

    const nextRetry = new Date();
    nextRetry.setSeconds(nextRetry.getSeconds() + delaySeconds);
    return nextRetry;
  }

  /**
   * Build batch for digest notification
   */
  buildDigest(
    notifications: Array<{
      type: NotificationEventType;
      content: NotificationContent;
      createdAt: Date;
    }>
  ): NotificationContent {
    const grouped = new Map<NotificationEventType, typeof notifications>();

    for (const n of notifications) {
      if (!grouped.has(n.type)) {
        grouped.set(n.type, []);
      }
      grouped.get(n.type)!.push(n);
    }

    const sections: string[] = [];
    for (const [type, items] of grouped) {
      const eventLabel = this.getEventLabel(type);
      sections.push(`**${eventLabel}** (${items.length})`);
      for (const item of items.slice(0, 5)) {
        sections.push(`- ${item.content.title}`);
      }
      if (items.length > 5) {
        sections.push(`... and ${items.length - 5} more`);
      }
    }

    return {
      title: `Your ${notifications.length > 1 ? "notifications" : "notification"} digest`,
      body: sections.join("\n"),
      actionUrl: "/notifications",
      actionText: "View All",
    };
  }

  private getEventLabel(eventType: NotificationEventType): string {
    const labels: Record<NotificationEventType, string> = {
      [NotificationEventType.ENGAGEMENT_ASSIGNED]: "Engagement Assignments",
      [NotificationEventType.ENGAGEMENT_STATUS_CHANGED]: "Status Updates",
      [NotificationEventType.DEADLINE_APPROACHING]: "Upcoming Deadlines",
      [NotificationEventType.DEADLINE_MISSED]: "Missed Deadlines",
      [NotificationEventType.DOCUMENT_SHARED]: "Shared Documents",
      [NotificationEventType.DOCUMENT_COMMENT]: "Document Comments",
      [NotificationEventType.DOCUMENT_REQUIRES_REVIEW]: "Review Requests",
      [NotificationEventType.DOCUMENT_APPROVED]: "Approvals",
      [NotificationEventType.TASK_ASSIGNED]: "Task Assignments",
      [NotificationEventType.TASK_DUE_SOON]: "Tasks Due Soon",
      [NotificationEventType.TASK_COMPLETED]: "Completed Tasks",
      [NotificationEventType.TASK_MENTIONED]: "Mentions",
      [NotificationEventType.USER_MENTIONED]: "Mentions",
      [NotificationEventType.TEAM_ANNOUNCEMENT]: "Announcements",
      [NotificationEventType.HEALTH_SCORE_DROPPED]: "Health Alerts",
      [NotificationEventType.KPI_THRESHOLD_BREACHED]: "KPI Alerts",
      [NotificationEventType.SECURITY_ALERT]: "Security Alerts",
      [NotificationEventType.CLIENT_DOCUMENT_UPLOADED]: "Client Uploads",
      [NotificationEventType.CLIENT_QUERY]: "Client Queries",
    };
    return labels[eventType] || eventType;
  }
}

// =============================================================================
// NOTIFICATION TEMPLATE SERVICE
// =============================================================================

export class NotificationTemplateService {
  /**
   * Get built-in templates
   */
  getBuiltInTemplates(): NotificationTemplate[] {
    return [
      {
        id: "engagement-assigned-email",
        eventType: NotificationEventType.ENGAGEMENT_ASSIGNED,
        channel: NotificationChannel.EMAIL,
        subject: "New Engagement Assigned: {{clientName}} - {{financialYear}}",
        bodyTemplate: `
          <p>Hi {{userName}},</p>
          <p>You have been assigned a new engagement:</p>
          <ul>
            <li><strong>Client:</strong> {{clientName}}</li>
            <li><strong>Financial Year:</strong> {{financialYear}}</li>
            <li><strong>Due Date:</strong> {{dueDate}}</li>
          </ul>
          <p><a href="{{actionUrl}}">View Engagement</a></p>
        `,
        variables: ["userName", "clientName", "financialYear", "dueDate", "actionUrl"],
      },
      {
        id: "deadline-approaching-email",
        eventType: NotificationEventType.DEADLINE_APPROACHING,
        channel: NotificationChannel.EMAIL,
        subject: "Deadline Alert: {{clientName}} due in {{daysUntil}} days",
        bodyTemplate: `
          <p>Hi {{userName}},</p>
          <p>The following engagement has an upcoming deadline:</p>
          <ul>
            <li><strong>Client:</strong> {{clientName}}</li>
            <li><strong>Due Date:</strong> {{dueDate}}</li>
            <li><strong>Days Remaining:</strong> {{daysUntil}}</li>
            <li><strong>Status:</strong> {{status}}</li>
          </ul>
          <p><a href="{{actionUrl}}">View Engagement</a></p>
        `,
        variables: ["userName", "clientName", "dueDate", "daysUntil", "status", "actionUrl"],
      },
      {
        id: "task-assigned-email",
        eventType: NotificationEventType.TASK_ASSIGNED,
        channel: NotificationChannel.EMAIL,
        subject: "Task Assigned: {{taskTitle}}",
        bodyTemplate: `
          <p>Hi {{userName}},</p>
          <p>A new task has been assigned to you:</p>
          <ul>
            <li><strong>Task:</strong> {{taskTitle}}</li>
            <li><strong>Project:</strong> {{projectName}}</li>
            <li><strong>Due Date:</strong> {{dueDate}}</li>
            <li><strong>Priority:</strong> {{priority}}</li>
          </ul>
          <p>{{description}}</p>
          <p><a href="{{actionUrl}}">View Task</a></p>
        `,
        variables: ["userName", "taskTitle", "projectName", "dueDate", "priority", "description", "actionUrl"],
      },
      {
        id: "document-shared-email",
        eventType: NotificationEventType.DOCUMENT_SHARED,
        channel: NotificationChannel.EMAIL,
        subject: "{{sharedByName}} shared a document with you",
        bodyTemplate: `
          <p>Hi {{userName}},</p>
          <p>{{sharedByName}} has shared a document with you:</p>
          <ul>
            <li><strong>Document:</strong> {{documentName}}</li>
            <li><strong>Type:</strong> {{documentType}}</li>
            <li><strong>Access:</strong> {{accessLevel}}</li>
          </ul>
          <p><a href="{{actionUrl}}">View Document</a></p>
        `,
        variables: ["userName", "sharedByName", "documentName", "documentType", "accessLevel", "actionUrl"],
      },
      {
        id: "security-alert-email",
        eventType: NotificationEventType.SECURITY_ALERT,
        channel: NotificationChannel.EMAIL,
        subject: "⚠️ Security Alert: {{alertTitle}}",
        bodyTemplate: `
          <p>Hi {{userName}},</p>
          <p><strong>A security alert requires your attention:</strong></p>
          <ul>
            <li><strong>Alert:</strong> {{alertTitle}}</li>
            <li><strong>Severity:</strong> {{severity}}</li>
            <li><strong>Time:</strong> {{timestamp}}</li>
          </ul>
          <p>{{description}}</p>
          <p><a href="{{actionUrl}}">View Details</a></p>
        `,
        variables: ["userName", "alertTitle", "severity", "timestamp", "description", "actionUrl"],
      },
    ];
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: string, variables: Record<string, unknown>): string {
    let rendered = template;

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      rendered = rendered.replace(pattern, String(value ?? ""));
    }

    return rendered;
  }

  /**
   * Extract variables from template
   */
  extractVariables(template: string): string[] {
    const pattern = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = pattern.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }
}

// =============================================================================
// MESSAGING SERVICE
// =============================================================================

export class MessagingService {
  /**
   * Generate thread subject from entity
   */
  generateThreadSubject(
    entityType: string,
    entityData: Record<string, unknown>
  ): string {
    switch (entityType) {
      case "Client":
        return `Discussion: ${entityData.name || "Client"}`;
      case "Engagement":
        return `Re: ${entityData.clientName || "Engagement"} - ${entityData.financialYear || ""}`;
      case "Document":
        return `Re: ${entityData.name || "Document"}`;
      case "Project":
        return `Project: ${entityData.name || "Project"}`;
      default:
        return `Discussion: ${entityType}`;
    }
  }

  /**
   * Extract mentions from message content
   */
  extractMentions(content: string): string[] {
    const pattern = /@\[([^\]]+)\]\(user:([^)]+)\)/g;
    const mentions: string[] = [];
    let match;

    while ((match = pattern.exec(content)) !== null) {
      mentions.push(match[2]); // User ID
    }

    return mentions;
  }

  /**
   * Sanitize message content
   */
  sanitizeContent(content: string, contentType: "TEXT" | "HTML"): string {
    if (contentType === "TEXT") {
      // For text, just trim and limit length
      return content.trim().substring(0, 10000);
    }

    // For HTML, basic sanitization
    // In production, use a proper sanitizer like DOMPurify
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "")
      .substring(0, 50000);
  }

  /**
   * Build thread preview
   */
  buildThreadPreview(
    messages: Array<{ content: string; createdAt: Date }>
  ): string {
    if (messages.length === 0) return "";

    // Get latest message
    const latest = messages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    // Truncate content
    const preview = latest.content
      .replace(/<[^>]+>/g, "") // Strip HTML tags
      .substring(0, 100);

    return preview + (latest.content.length > 100 ? "..." : "");
  }

  /**
   * Get unread count for user
   */
  calculateUnreadCount(
    messages: Array<{ readBy: string[] | null }>,
    userId: string
  ): number {
    return messages.filter(
      (m) => !m.readBy || !m.readBy.includes(userId)
    ).length;
  }
}

// Export instances for convenience
export const notificationPreferenceService = new NotificationPreferenceService();
export const notificationQueueService = new NotificationQueueService();
export const notificationTemplateService = new NotificationTemplateService();
export const messagingService = new MessagingService();
