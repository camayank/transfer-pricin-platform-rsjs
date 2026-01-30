/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Integration & Webhook Engine
 *
 * Implements webhook management, API key handling, integration templates,
 * and third-party service connections.
 * ================================================================================
 */

import crypto from "crypto";

// Types
export interface WebhookEndpointInput {
  firmId: string;
  url: string;
  description?: string;
  events: WebhookEvent[];
  retryPolicy?: RetryPolicy;
}

export enum WebhookEvent {
  // Client events
  CLIENT_CREATED = "client.created",
  CLIENT_UPDATED = "client.updated",
  CLIENT_DELETED = "client.deleted",

  // Engagement events
  ENGAGEMENT_CREATED = "engagement.created",
  ENGAGEMENT_STATUS_CHANGED = "engagement.status_changed",
  ENGAGEMENT_COMPLETED = "engagement.completed",

  // Document events
  DOCUMENT_CREATED = "document.created",
  DOCUMENT_FILED = "document.filed",
  DOCUMENT_SHARED = "document.shared",

  // User events
  USER_CREATED = "user.created",
  USER_ROLE_CHANGED = "user.role_changed",

  // Project events
  PROJECT_CREATED = "project.created",
  PROJECT_COMPLETED = "project.completed",
  TASK_COMPLETED = "task.completed",

  // Financial events
  INVOICE_CREATED = "invoice.created",
  PAYMENT_RECEIVED = "payment.received",

  // Alert events
  DEADLINE_APPROACHING = "deadline.approaching",
  HEALTH_SCORE_CHANGED = "health_score.changed",
  KPI_ALERT_TRIGGERED = "kpi_alert.triggered",
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  firmId: string;
  data: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  errorMessage?: string;
  duration: number;
}

export interface ApiKeyInput {
  firmId: string;
  name: string;
  permissions: string[];
  rateLimit?: number;
  expiresAt?: Date;
}

export interface ApiKeyResult {
  keyPrefix: string;
  fullKey: string; // Only returned once on creation
  keyHash: string;
}

export interface IntegrationTemplate {
  name: string;
  provider: string;
  category: IntegrationCategory;
  description: string;
  logoUrl?: string;
  authType: AuthType;
  configSchema: ConfigSchema;
  endpoints: IntegrationEndpoint[];
}

export enum IntegrationCategory {
  ACCOUNTING = "ACCOUNTING",
  CRM = "CRM",
  COMMUNICATION = "COMMUNICATION",
  STORAGE = "STORAGE",
  PAYMENT = "PAYMENT",
  TAX = "TAX",
}

export enum AuthType {
  OAUTH2 = "OAUTH2",
  API_KEY = "API_KEY",
  BASIC = "BASIC",
  BEARER = "BEARER",
}

export interface ConfigSchema {
  type: "object";
  required: string[];
  properties: Record<string, ConfigProperty>;
}

export interface ConfigProperty {
  type: "string" | "number" | "boolean";
  title: string;
  description?: string;
  enum?: string[];
  default?: unknown;
}

export interface IntegrationEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requestSchema?: ConfigSchema;
  responseMapping?: Record<string, string>;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: Array<{ record: string; error: string }>;
  duration: number;
}

// =============================================================================
// WEBHOOK SERVICE
// =============================================================================

export class WebhookService {
  /**
   * Generate webhook secret
   */
  generateSecret(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Create webhook signature
   */
  createSignature(payload: string, secret: string): string {
    return crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Build webhook payload
   */
  buildPayload(
    event: WebhookEvent,
    firmId: string,
    data: Record<string, unknown>
  ): WebhookPayload {
    return {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      firmId,
      data,
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt: number, policy: RetryPolicy): number {
    const delay = policy.initialDelay * Math.pow(policy.backoffMultiplier, attempt);
    return Math.min(delay, policy.maxDelay);
  }

  /**
   * Get default retry policy
   */
  getDefaultRetryPolicy(): RetryPolicy {
    return {
      maxRetries: 3,
      initialDelay: 1000, // 1 second
      maxDelay: 60000, // 1 minute
      backoffMultiplier: 2,
    };
  }

  /**
   * Validate webhook URL
   */
  validateUrl(url: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parsed = new URL(url);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        errors.push("URL must use HTTP or HTTPS protocol");
      }

      if (parsed.protocol === "http:" && !parsed.hostname.includes("localhost")) {
        errors.push("HTTP is only allowed for localhost URLs");
      }

      // Block common internal IPs
      const blockedHosts = ["127.0.0.1", "0.0.0.0", "localhost"];
      if (parsed.protocol === "https:" && blockedHosts.includes(parsed.hostname)) {
        errors.push("Cannot use localhost for HTTPS webhooks");
      }
    } catch {
      errors.push("Invalid URL format");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get events by category
   */
  getEventsByCategory(): Record<string, WebhookEvent[]> {
    return {
      clients: [
        WebhookEvent.CLIENT_CREATED,
        WebhookEvent.CLIENT_UPDATED,
        WebhookEvent.CLIENT_DELETED,
      ],
      engagements: [
        WebhookEvent.ENGAGEMENT_CREATED,
        WebhookEvent.ENGAGEMENT_STATUS_CHANGED,
        WebhookEvent.ENGAGEMENT_COMPLETED,
      ],
      documents: [
        WebhookEvent.DOCUMENT_CREATED,
        WebhookEvent.DOCUMENT_FILED,
        WebhookEvent.DOCUMENT_SHARED,
      ],
      users: [
        WebhookEvent.USER_CREATED,
        WebhookEvent.USER_ROLE_CHANGED,
      ],
      projects: [
        WebhookEvent.PROJECT_CREATED,
        WebhookEvent.PROJECT_COMPLETED,
        WebhookEvent.TASK_COMPLETED,
      ],
      financial: [
        WebhookEvent.INVOICE_CREATED,
        WebhookEvent.PAYMENT_RECEIVED,
      ],
      alerts: [
        WebhookEvent.DEADLINE_APPROACHING,
        WebhookEvent.HEALTH_SCORE_CHANGED,
        WebhookEvent.KPI_ALERT_TRIGGERED,
      ],
    };
  }
}

// =============================================================================
// API KEY SERVICE
// =============================================================================

export class ApiKeyService {
  /**
   * Generate new API key
   */
  generateApiKey(): ApiKeyResult {
    const fullKey = `dc_${crypto.randomBytes(32).toString("hex")}`;
    const keyPrefix = fullKey.substring(0, 11); // dc_ + 8 chars
    const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");

    return {
      keyPrefix,
      fullKey,
      keyHash,
    };
  }

  /**
   * Hash API key for storage
   */
  hashKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
  }

  /**
   * Validate API key format
   */
  validateKeyFormat(key: string): boolean {
    return /^dc_[a-f0-9]{64}$/.test(key);
  }

  /**
   * Extract prefix from key
   */
  extractPrefix(key: string): string {
    return key.substring(0, 11);
  }

  /**
   * Check if key is expired
   */
  isExpired(expiresAt?: Date | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  /**
   * Check rate limit
   */
  checkRateLimit(
    usageCount: number,
    rateLimit: number,
    windowMinutes: number = 60
  ): { allowed: boolean; remaining: number; resetAt: Date } {
    const remaining = Math.max(0, rateLimit - usageCount);
    const resetAt = new Date();
    resetAt.setMinutes(resetAt.getMinutes() + windowMinutes);

    return {
      allowed: usageCount < rateLimit,
      remaining,
      resetAt,
    };
  }

  /**
   * Parse permission string
   */
  parsePermission(permission: string): { resource: string; action: string } {
    const [resource, action] = permission.split(":");
    return { resource, action };
  }

  /**
   * Check if key has permission
   */
  hasPermission(keyPermissions: string[], requiredPermission: string): boolean {
    // Check for wildcard permission
    if (keyPermissions.includes("*")) return true;
    if (keyPermissions.includes("*:*")) return true;

    // Check for exact match
    if (keyPermissions.includes(requiredPermission)) return true;

    // Check for resource wildcard
    const { resource } = this.parsePermission(requiredPermission);
    if (keyPermissions.includes(`${resource}:*`)) return true;

    return false;
  }
}

// =============================================================================
// INTEGRATION SERVICE
// =============================================================================

export class IntegrationService {
  /**
   * Get built-in integration templates
   */
  getBuiltInTemplates(): IntegrationTemplate[] {
    return [
      {
        name: "Tally Prime",
        provider: "TALLY",
        category: IntegrationCategory.ACCOUNTING,
        description: "Sync financial data from Tally Prime accounting software",
        authType: AuthType.API_KEY,
        configSchema: {
          type: "object",
          required: ["serverUrl", "companyName"],
          properties: {
            serverUrl: {
              type: "string",
              title: "Tally Server URL",
              description: "URL of your Tally server (e.g., http://localhost:9000)",
            },
            companyName: {
              type: "string",
              title: "Company Name",
              description: "Name of the company in Tally",
            },
          },
        },
        endpoints: [
          {
            name: "getLedgers",
            method: "POST",
            path: "/",
            description: "Fetch all ledgers from Tally",
          },
          {
            name: "getVouchers",
            method: "POST",
            path: "/",
            description: "Fetch vouchers/transactions from Tally",
          },
        ],
      },
      {
        name: "Zoho Books",
        provider: "ZOHO_BOOKS",
        category: IntegrationCategory.ACCOUNTING,
        description: "Sync invoices, payments, and financial data from Zoho Books",
        authType: AuthType.OAUTH2,
        configSchema: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: {
              type: "string",
              title: "Organization ID",
              description: "Your Zoho Books organization ID",
            },
          },
        },
        endpoints: [
          {
            name: "getInvoices",
            method: "GET",
            path: "/invoices",
            description: "Fetch invoices from Zoho Books",
          },
          {
            name: "getPayments",
            method: "GET",
            path: "/customerpayments",
            description: "Fetch payments from Zoho Books",
          },
        ],
      },
      {
        name: "Google Drive",
        provider: "GOOGLE_DRIVE",
        category: IntegrationCategory.STORAGE,
        description: "Store and sync documents with Google Drive",
        authType: AuthType.OAUTH2,
        configSchema: {
          type: "object",
          required: ["folderId"],
          properties: {
            folderId: {
              type: "string",
              title: "Root Folder ID",
              description: "Google Drive folder ID to sync documents to",
            },
            autoSync: {
              type: "boolean",
              title: "Auto Sync",
              description: "Automatically sync new documents",
              default: true,
            },
          },
        },
        endpoints: [
          {
            name: "uploadFile",
            method: "POST",
            path: "/upload",
            description: "Upload file to Google Drive",
          },
          {
            name: "listFiles",
            method: "GET",
            path: "/files",
            description: "List files in folder",
          },
        ],
      },
      {
        name: "Slack",
        provider: "SLACK",
        category: IntegrationCategory.COMMUNICATION,
        description: "Send notifications to Slack channels",
        authType: AuthType.OAUTH2,
        configSchema: {
          type: "object",
          required: ["defaultChannel"],
          properties: {
            defaultChannel: {
              type: "string",
              title: "Default Channel",
              description: "Default Slack channel for notifications",
            },
            botName: {
              type: "string",
              title: "Bot Name",
              description: "Name displayed for bot messages",
              default: "DigiComply",
            },
          },
        },
        endpoints: [
          {
            name: "sendMessage",
            method: "POST",
            path: "/chat.postMessage",
            description: "Send message to Slack channel",
          },
        ],
      },
      {
        name: "Razorpay",
        provider: "RAZORPAY",
        category: IntegrationCategory.PAYMENT,
        description: "Accept payments and track transactions via Razorpay",
        authType: AuthType.API_KEY,
        configSchema: {
          type: "object",
          required: ["keyId"],
          properties: {
            keyId: {
              type: "string",
              title: "Key ID",
              description: "Your Razorpay Key ID",
            },
            webhookSecret: {
              type: "string",
              title: "Webhook Secret",
              description: "Secret for verifying webhook signatures",
            },
          },
        },
        endpoints: [
          {
            name: "createPaymentLink",
            method: "POST",
            path: "/payment_links",
            description: "Create a payment link",
          },
          {
            name: "getPayment",
            method: "GET",
            path: "/payments/{id}",
            description: "Get payment details",
          },
        ],
      },
    ];
  }

  /**
   * Validate integration configuration against schema
   */
  validateConfig(
    config: Record<string, unknown>,
    schema: ConfigSchema
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    for (const field of schema.required) {
      if (config[field] === undefined || config[field] === null || config[field] === "") {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate field types
    for (const [field, property] of Object.entries(schema.properties)) {
      const value = config[field];
      if (value === undefined) continue;

      switch (property.type) {
        case "string":
          if (typeof value !== "string") {
            errors.push(`Field ${field} must be a string`);
          }
          if (property.enum && !property.enum.includes(value as string)) {
            errors.push(`Field ${field} must be one of: ${property.enum.join(", ")}`);
          }
          break;
        case "number":
          if (typeof value !== "number") {
            errors.push(`Field ${field} must be a number`);
          }
          break;
        case "boolean":
          if (typeof value !== "boolean") {
            errors.push(`Field ${field} must be a boolean`);
          }
          break;
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Encrypt credentials for storage
   */
  encryptCredentials(
    credentials: Record<string, unknown>,
    encryptionKey: string
  ): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(encryptionKey, "hex"),
      iv
    );

    let encrypted = cipher.update(JSON.stringify(credentials), "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString("hex"),
      encrypted,
      authTag: authTag.toString("hex"),
    });
  }

  /**
   * Decrypt stored credentials
   */
  decryptCredentials(
    encryptedData: string,
    encryptionKey: string
  ): Record<string, unknown> {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(encryptionKey, "hex"),
      Buffer.from(iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  }
}

// =============================================================================
// API USAGE SERVICE
// =============================================================================

export class ApiUsageService {
  /**
   * Aggregate usage by endpoint
   */
  aggregateByEndpoint(
    logs: Array<{
      endpoint: string;
      method: string;
      statusCode: number;
      responseTime: number;
    }>
  ): Map<string, { count: number; avgResponseTime: number; errorRate: number }> {
    const aggregation = new Map<
      string,
      { count: number; totalTime: number; errors: number }
    >();

    for (const log of logs) {
      const key = `${log.method} ${log.endpoint}`;
      const current = aggregation.get(key) || { count: 0, totalTime: 0, errors: 0 };

      current.count++;
      current.totalTime += log.responseTime;
      if (log.statusCode >= 400) {
        current.errors++;
      }

      aggregation.set(key, current);
    }

    const result = new Map<
      string,
      { count: number; avgResponseTime: number; errorRate: number }
    >();

    for (const [key, value] of aggregation) {
      result.set(key, {
        count: value.count,
        avgResponseTime: Math.round(value.totalTime / value.count),
        errorRate: Math.round((value.errors / value.count) * 100),
      });
    }

    return result;
  }

  /**
   * Get usage summary for time period
   */
  getUsageSummary(
    logs: Array<{
      statusCode: number;
      responseTime: number;
      createdAt: Date;
    }>
  ): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    p95ResponseTime: number;
  } {
    if (logs.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
      };
    }

    const successful = logs.filter((l) => l.statusCode < 400).length;
    const responseTimes = logs.map((l) => l.responseTime).sort((a, b) => a - b);
    const avgResponseTime = Math.round(
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    );
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95ResponseTime = responseTimes[p95Index] || responseTimes[responseTimes.length - 1];

    return {
      totalRequests: logs.length,
      successfulRequests: successful,
      failedRequests: logs.length - successful,
      avgResponseTime,
      p95ResponseTime,
    };
  }
}

// Export instances for convenience
export const webhookService = new WebhookService();
export const apiKeyService = new ApiKeyService();
export const integrationService = new IntegrationService();
export const apiUsageService = new ApiUsageService();
