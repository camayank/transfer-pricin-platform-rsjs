/**
 * DigiComply API Client
 *
 * Type-safe API client with comprehensive error handling.
 * All API calls go through this client for consistency.
 */

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// BASE FETCH WRAPPER
// ============================================================================

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  // Handle non-OK responses
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || `API Error: ${response.status}`,
      errorData
    );
  }

  // Return JSON data
  return response.json();
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Audit Log Types
export interface AuditLogEntry {
  id: string;
  firmId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  currentHash: string;
  previousHash: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogFilters extends PaginationParams {
  firmId: string;
  entityType?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Project Types
export interface Project {
  id: string;
  firmId: string;
  projectCode: string;
  name: string;
  description: string | null;
  clientId: string | null;
  client?: { name: string };
  projectManagerId: string | null;
  projectManager?: { name: string };
  status: string;
  startDate: string | null;
  endDate: string | null;
  budgetAmount: number | null;
  budgetCurrency: string;
  createdAt: string;
  updatedAt: string;
  metrics?: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    totalHoursLogged: number;
    budgetUtilization: number;
  };
}

export interface CreateProjectInput {
  firmId: string;
  name: string;
  description?: string;
  clientId?: string;
  projectManagerId?: string;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number;
  budgetCurrency?: string;
}

export interface ProjectFilters extends PaginationParams {
  firmId: string;
  status?: string;
  clientId?: string;
  projectManagerId?: string;
}

// Health Score Types
export interface CustomerHealthScore {
  id: string;
  firmId: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    industry: string | null;
  };
  overallScore: number;
  engagementScore: number;
  complianceScore: number;
  paymentScore: number;
  supportScore: number;
  usageScore: number;
  riskLevel: string;
  aiRecommendations: string[];
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthScoreFilters {
  firmId: string;
  riskLevel?: string;
  minScore?: number;
  maxScore?: number;
}

// AI Recommendation Types
export interface AiRecommendation {
  id: string;
  firmId: string;
  userId: string;
  recommendationType: string;
  entityType: string | null;
  entityId: string | null;
  title: string;
  description: string;
  confidence: number;
  actionUrl: string | null;
  actionData: Record<string, unknown> | null;
  status: string;
  actedAt: string | null;
  dismissedAt: string | null;
  dismissReason: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// KPI Types
export interface KpiDefinition {
  id: string;
  firmId: string;
  name: string;
  description: string | null;
  category: string;
  calculationQuery: string;
  unit: string;
  direction: string;
  warningThreshold: number | null;
  criticalThreshold: number | null;
  targetValue: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  currentValue?: number;
  trend?: "up" | "down" | "stable";
  alertLevel?: "normal" | "warning" | "critical";
  values?: Array<{ value: number; calculatedAt: string }>;
  alerts?: Array<{ id: string; alertType: string; acknowledgedAt: string | null }>;
}

export interface CreateKpiInput {
  firmId: string;
  name: string;
  category: string;
  calculationQuery: string;
  unit: string;
  description?: string;
  direction?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  targetValue?: number;
}

// Report Types
export interface CustomReport {
  id: string;
  firmId: string;
  createdById: string;
  createdBy?: { name: string };
  name: string;
  description: string | null;
  reportType: string;
  dataSource: string;
  filters: Record<string, unknown>;
  columns: string[];
  chartConfig: Record<string, unknown> | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Security Incident Types
export interface SecurityIncident {
  id: string;
  firmId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reportedById: string;
  affectedUsers: string[] | null;
  affectedEntities: string[] | null;
  detectedAt: string;
  containedAt: string | null;
  resolvedAt: string | null;
  rootCause: string | null;
  containmentSteps: string[] | null;
  remediationSteps: string[] | null;
  lessonsLearned: string | null;
  externalNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Data Deletion Request Types
export interface DataDeletionRequest {
  id: string;
  firmId: string;
  requestType: string;
  subjectEmail: string;
  subjectName: string | null;
  scope: Record<string, unknown>;
  status: string;
  verificationToken: string | null;
  verifiedAt: string | null;
  processingStarted: string | null;
  completedAt: string | null;
  deletionLog: Record<string, unknown> | null;
  exportPath: string | null;
  rejectionReason: string | null;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataRequestFilters extends PaginationParams {
  status?: string;
  requestType?: string;
}

// Access Review Types
export interface AccessReview {
  id: string;
  firmId: string;
  name: string;
  description: string | null;
  reviewerIds: string[];
  scope: string;
  scopeConfig: Record<string, unknown> | null;
  status: string;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalItems: number;
  completedItems: number;
  approvedItems: number;
  revokedItems: number;
  modifiedItems: number;
  pendingItems: number;
}

export interface AccessReviewItem {
  id: string;
  accessReviewId: string;
  userId: string;
  currentRole: string;
  currentAccess: Record<string, unknown> | null;
  decision: string | null;
  newRole: string | null;
  newAccess: Record<string, unknown> | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  justification: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AccessReviewFilters extends PaginationParams {
  status?: string;
}

// ============================================================================
// API CLIENT METHODS
// ============================================================================

export const api = {
  // -------------------------------------------------------------------------
  // AUDIT LOGS
  // -------------------------------------------------------------------------
  audit: {
    list: (filters: AuditLogFilters) =>
      apiFetch<{ logs: AuditLogEntry[]; pagination: PaginatedResponse<AuditLogEntry>["pagination"] }>(
        "/api/audit",
        { params: filters as unknown as Record<string, string | number | boolean | undefined> }
      ),

    verify: (firmId: string, startDate?: string, endDate?: string) =>
      apiFetch<{ verification: { isValid: boolean; entriesChecked: number; errorMessage?: string } }>(
        "/api/audit/verify",
        {
          method: "POST",
          body: JSON.stringify({ firmId, startDate, endDate }),
        }
      ),

    export: (firmId: string, format: "json" | "csv", startDate?: string, endDate?: string) =>
      apiFetch<Blob>(`/api/audit/export`, {
        params: { firmId, format, startDate, endDate },
      }),
  },

  // -------------------------------------------------------------------------
  // PROJECTS
  // -------------------------------------------------------------------------
  projects: {
    list: (filters: ProjectFilters) =>
      apiFetch<{ projects: Project[] }>("/api/projects", {
        params: filters as unknown as Record<string, string | number | boolean | undefined>,
      }),

    get: (id: string) =>
      apiFetch<{ project: Project }>(`/api/projects/${id}`),

    create: (data: CreateProjectInput) =>
      apiFetch<{ project: Project }>("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<CreateProjectInput>) =>
      apiFetch<{ project: Project }>(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/projects/${id}`, {
        method: "DELETE",
      }),
  },

  // -------------------------------------------------------------------------
  // PROJECT TASKS
  // -------------------------------------------------------------------------
  tasks: {
    list: (projectId: string) =>
      apiFetch<{ tasks: Array<Record<string, unknown>> }>(`/api/projects/${projectId}/tasks`),

    create: (projectId: string, data: Record<string, unknown>) =>
      apiFetch<{ task: Record<string, unknown> }>(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (taskId: string, data: Record<string, unknown>) =>
      apiFetch<{ task: Record<string, unknown> }>(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // -------------------------------------------------------------------------
  // CUSTOMER HEALTH SCORES
  // -------------------------------------------------------------------------
  healthScores: {
    list: (filters: HealthScoreFilters) =>
      apiFetch<{
        healthScores: CustomerHealthScore[];
        summary: {
          total: number;
          atRisk: number;
          healthy: number;
          averageScore: number;
        };
      }>("/api/health-scores", {
        params: filters as unknown as Record<string, string | number | boolean | undefined>,
      }),

    get: (clientId: string, firmId: string) =>
      apiFetch<{ healthScore: CustomerHealthScore }>(`/api/health-scores/${clientId}`, {
        params: { firmId },
      }),

    recalculate: (firmId: string, clientIds?: string[]) =>
      apiFetch<{ message: string; jobId: string }>("/api/health-scores", {
        method: "POST",
        body: JSON.stringify({ firmId, clientIds }),
      }),
  },

  // -------------------------------------------------------------------------
  // AI RECOMMENDATIONS
  // -------------------------------------------------------------------------
  recommendations: {
    list: (firmId: string) =>
      apiFetch<{ recommendations: AiRecommendation[] }>("/api/ai/recommendations", {
        params: { firmId },
      }),

    dismiss: (id: string, reason?: string) =>
      apiFetch<{ recommendation: AiRecommendation }>(`/api/ai/recommendations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "dismiss", reason }),
      }),

    act: (id: string) =>
      apiFetch<{ recommendation: AiRecommendation }>(`/api/ai/recommendations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "act" }),
      }),
  },

  // -------------------------------------------------------------------------
  // KPIs
  // -------------------------------------------------------------------------
  kpis: {
    list: (firmId: string) =>
      apiFetch<{ kpis: KpiDefinition[] }>("/api/kpis", {
        params: { firmId },
      }),

    get: (id: string, firmId: string) =>
      apiFetch<{ kpi: KpiDefinition }>(`/api/kpis/${id}`, {
        params: { firmId },
      }),

    getHistory: (id: string, firmId: string, days?: number) =>
      apiFetch<{ kpi: KpiDefinition; history: Array<{ value: number; calculatedAt: string }> }>(
        `/api/kpis/${id}/history`,
        { params: { firmId, days } }
      ),

    create: (data: CreateKpiInput) =>
      apiFetch<{ kpi: KpiDefinition }>("/api/kpis", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<CreateKpiInput>) =>
      apiFetch<{ kpi: KpiDefinition }>(`/api/kpis/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // -------------------------------------------------------------------------
  // REPORTS
  // -------------------------------------------------------------------------
  reports: {
    list: (firmId: string) =>
      apiFetch<{ reports: CustomReport[] }>("/api/reports", {
        params: { firmId },
      }),

    get: (id: string) =>
      apiFetch<{ report: CustomReport }>(`/api/reports/${id}`),

    create: (data: Record<string, unknown>) =>
      apiFetch<{ report: CustomReport }>("/api/reports", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    execute: (id: string, filters?: Record<string, unknown>) =>
      apiFetch<{ data: unknown[] }>(`/api/reports/${id}/execute`, {
        method: "POST",
        body: JSON.stringify({ filters }),
      }),
  },

  // -------------------------------------------------------------------------
  // COMPLIANCE - DATA REQUESTS
  // -------------------------------------------------------------------------
  dataRequests: {
    list: (filters: DataRequestFilters = {}) =>
      apiFetch<{
        requests: DataDeletionRequest[];
        stats: {
          total: number;
          pendingVerification: number;
          verified: number;
          processing: number;
          completed: number;
          rejected: number;
        };
        pagination: PaginatedResponse<DataDeletionRequest>["pagination"];
      }>("/api/compliance/data-requests", {
        params: filters as unknown as Record<string, string | number | boolean | undefined>,
      }),

    get: (id: string) =>
      apiFetch<{ request: DataDeletionRequest }>(`/api/compliance/data-requests/${id}`),

    create: (data: { subjectEmail: string; subjectName?: string; requestType: string; scope: string[] }) =>
      apiFetch<{ request: DataDeletionRequest }>("/api/compliance/data-requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, action: string, data?: Record<string, unknown>) =>
      apiFetch<{ request: DataDeletionRequest }>(`/api/compliance/data-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, ...data }),
      }),
  },

  // -------------------------------------------------------------------------
  // COMPLIANCE - SECURITY INCIDENTS
  // -------------------------------------------------------------------------
  incidents: {
    list: (filters: { status?: string; severity?: string; category?: string; page?: number; limit?: number } = {}) =>
      apiFetch<{
        incidents: SecurityIncident[];
        stats: {
          total: number;
          open: number;
          investigating: number;
          contained: number;
          eradicated: number;
          recovered: number;
          closed: number;
          critical: number;
          high: number;
          medium: number;
          low: number;
        };
        pagination: PaginatedResponse<SecurityIncident>["pagination"];
      }>("/api/compliance/incidents", {
        params: filters as unknown as Record<string, string | number | boolean | undefined>,
      }),

    get: (id: string) =>
      apiFetch<{ incident: SecurityIncident }>(`/api/compliance/incidents/${id}`),

    create: (data: {
      title: string;
      description: string;
      severity?: string;
      category: string;
      affectedUsers?: string[];
      affectedEntities?: string[];
      detectedAt?: string;
    }) =>
      apiFetch<{ incident: SecurityIncident }>("/api/compliance/incidents", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<SecurityIncident>) =>
      apiFetch<{ incident: SecurityIncident }>(`/api/compliance/incidents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // -------------------------------------------------------------------------
  // COMPLIANCE - ACCESS REVIEWS
  // -------------------------------------------------------------------------
  accessReviews: {
    list: (filters: AccessReviewFilters = {}) =>
      apiFetch<{
        reviews: AccessReview[];
        stats: {
          total: number;
          pending: number;
          inProgress: number;
          completed: number;
          totalItems: number;
          pendingItems: number;
          approvedItems: number;
          revokedItems: number;
          modifiedItems: number;
        };
        pagination: PaginatedResponse<AccessReview>["pagination"];
      }>("/api/compliance/access-reviews", {
        params: filters as unknown as Record<string, string | number | boolean | undefined>,
      }),

    get: (id: string) =>
      apiFetch<{ review: AccessReview & { items: AccessReviewItem[] } }>(`/api/compliance/access-reviews/${id}`),

    create: (data: {
      name: string;
      description?: string;
      reviewerIds: string[];
      scope: string;
      scopeConfig?: Record<string, unknown>;
      startDate: string;
      dueDate: string;
    }) =>
      apiFetch<{ review: AccessReview }>("/api/compliance/access-reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { status?: string; dueDate?: string }) =>
      apiFetch<{ review: AccessReview }>(`/api/compliance/access-reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    submitDecision: (reviewId: string, itemId: string, data: {
      decision: "APPROVE" | "REVOKE" | "MODIFY";
      newRole?: string;
      newAccess?: Record<string, unknown>;
      justification?: string;
    }) =>
      apiFetch<{ item: AccessReviewItem }>(`/api/compliance/access-reviews/${reviewId}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // -------------------------------------------------------------------------
  // DASHBOARDS
  // -------------------------------------------------------------------------
  dashboards: {
    list: (firmId: string) =>
      apiFetch<{ dashboards: Array<Record<string, unknown>> }>("/api/dashboards", {
        params: { firmId },
      }),

    get: (id: string) =>
      apiFetch<{ dashboard: Record<string, unknown> }>(`/api/dashboards/${id}`),

    create: (data: Record<string, unknown>) =>
      apiFetch<{ dashboard: Record<string, unknown> }>("/api/dashboards", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // -------------------------------------------------------------------------
  // CLIENTS
  // -------------------------------------------------------------------------
  clients: {
    list: (firmId: string) =>
      apiFetch<{ clients: Array<Record<string, unknown>> }>("/api/clients", {
        params: { firmId },
      }),

    get: (id: string) =>
      apiFetch<{ client: Record<string, unknown> }>(`/api/clients/${id}`),
  },
};
