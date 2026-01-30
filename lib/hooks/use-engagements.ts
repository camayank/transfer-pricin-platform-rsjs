"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EngagementCreateInput, EngagementUpdateInput } from "@/lib/validations";

// Types
export interface Engagement {
  id: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    pan: string;
    industry?: string | null;
  };
  financialYear: string;
  assessmentYear: string;
  status: EngagementStatus;
  priority: Priority;
  notes?: string | null;
  assignedToId?: string | null;

  // Financial Data
  financialData?: Record<string, unknown> | null;
  totalRevenue?: number | null;
  operatingCost?: number | null;
  operatingProfit?: number | null;
  employeeCost?: number | null;

  // PLIs
  opOc?: number | null;
  opOr?: number | null;
  berryRatio?: number | null;

  // Safe Harbour
  safeHarbourEligible?: boolean | null;
  safeHarbourAnalysis?: Record<string, unknown> | null;

  // Benchmarking
  benchmarkingCompleted: boolean;
  benchmarkingResults?: Record<string, unknown> | null;
  armLengthRange?: Record<string, unknown> | null;
  adjustmentRequired?: boolean | null;
  adjustmentAmount?: number | null;

  // RPT
  totalRptValue?: number | null;

  // Counts
  _count?: {
    transactions: number;
    documents: number;
    safeHarbourResults: number;
    disputes: number;
  };

  // Dates
  dueDate?: string | null;
  filedDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EngagementStatus =
  | "NOT_STARTED"
  | "DATA_COLLECTION"
  | "SAFE_HARBOUR_CHECK"
  | "BENCHMARKING"
  | "DOCUMENTATION"
  | "REVIEW"
  | "APPROVED"
  | "FILED"
  | "COMPLETED";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface EngagementFilters {
  clientId?: string;
  status?: string;
  year?: string;
  priority?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}

// API Client
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// Query keys
export const engagementKeys = {
  all: ["engagements"] as const,
  lists: () => [...engagementKeys.all, "list"] as const,
  list: (filters: EngagementFilters) => [...engagementKeys.lists(), filters] as const,
  details: () => [...engagementKeys.all, "detail"] as const,
  detail: (id: string) => [...engagementKeys.details(), id] as const,
  transactions: (engagementId: string) =>
    [...engagementKeys.detail(engagementId), "transactions"] as const,
  safeHarbour: (engagementId: string) =>
    [...engagementKeys.detail(engagementId), "safeHarbour"] as const,
  benchmarking: (engagementId: string) =>
    [...engagementKeys.detail(engagementId), "benchmarking"] as const,
  disputes: (engagementId: string) =>
    [...engagementKeys.detail(engagementId), "disputes"] as const,
};

/**
 * Hook to fetch engagements with filters
 */
export function useEngagements(filters: EngagementFilters = {}) {
  const params = new URLSearchParams();
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.status) params.set("status", filters.status);
  if (filters.year) params.set("year", filters.year);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assignedToId) params.set("assignedToId", filters.assignedToId);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: engagementKeys.list(filters),
    queryFn: () =>
      apiFetch<{
        engagements: Engagement[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/engagements?${params.toString()}`),
  });
}

/**
 * Hook to fetch a single engagement with full details
 */
export function useEngagement(id: string) {
  return useQuery({
    queryKey: engagementKeys.detail(id),
    queryFn: () => apiFetch<{ engagement: Engagement }>(`/api/engagements/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to fetch engagements for a specific client
 */
export function useClientEngagements(clientId: string) {
  return useEngagements({ clientId });
}

/**
 * Hook to create a new engagement
 */
export function useCreateEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EngagementCreateInput) =>
      apiFetch<{ engagement: Engagement }>("/api/engagements", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.lists() });
      // Also invalidate client's engagement list
      if (result.engagement.clientId) {
        queryClient.invalidateQueries({
          queryKey: engagementKeys.list({ clientId: result.engagement.clientId }),
        });
      }
    },
  });
}

/**
 * Hook to update an engagement
 */
export function useUpdateEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EngagementUpdateInput }) =>
      apiFetch<{ engagement: Engagement }>(`/api/engagements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: engagementKeys.lists() });
      if (result.engagement.clientId) {
        queryClient.invalidateQueries({
          queryKey: engagementKeys.list({ clientId: result.engagement.clientId }),
        });
      }
    },
  });
}

/**
 * Hook to update engagement status (workflow transitions)
 */
export function useUpdateEngagementStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EngagementStatus }) =>
      apiFetch<{ engagement: Engagement }>(`/api/engagements/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: engagementKeys.lists() });
    },
  });
}

/**
 * Hook to delete an engagement
 */
export function useDeleteEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/engagements/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.lists() });
    },
  });
}

/**
 * Hook to get engagement statistics/dashboard data
 */
export function useEngagementStats(year?: string) {
  const params = new URLSearchParams();
  if (year) params.set("year", year);

  return useQuery({
    queryKey: [...engagementKeys.all, "stats", year],
    queryFn: () =>
      apiFetch<{
        total: number;
        byStatus: Record<EngagementStatus, number>;
        byPriority: Record<Priority, number>;
        pendingFiling: number;
        overdue: number;
        completedThisMonth: number;
      }>(`/api/engagements/stats?${params.toString()}`),
  });
}

// Workflow status helpers
export const ENGAGEMENT_STATUS_ORDER: EngagementStatus[] = [
  "NOT_STARTED",
  "DATA_COLLECTION",
  "SAFE_HARBOUR_CHECK",
  "BENCHMARKING",
  "DOCUMENTATION",
  "REVIEW",
  "APPROVED",
  "FILED",
  "COMPLETED",
];

export function getStatusIndex(status: EngagementStatus): number {
  return ENGAGEMENT_STATUS_ORDER.indexOf(status);
}

export function getNextStatus(current: EngagementStatus): EngagementStatus | null {
  const idx = getStatusIndex(current);
  if (idx === -1 || idx >= ENGAGEMENT_STATUS_ORDER.length - 1) return null;
  return ENGAGEMENT_STATUS_ORDER[idx + 1];
}

export function getPreviousStatus(current: EngagementStatus): EngagementStatus | null {
  const idx = getStatusIndex(current);
  if (idx <= 0) return null;
  return ENGAGEMENT_STATUS_ORDER[idx - 1];
}

export function getStatusLabel(status: EngagementStatus): string {
  const labels: Record<EngagementStatus, string> = {
    NOT_STARTED: "Not Started",
    DATA_COLLECTION: "Data Collection",
    SAFE_HARBOUR_CHECK: "Safe Harbour Check",
    BENCHMARKING: "Benchmarking",
    DOCUMENTATION: "Documentation",
    REVIEW: "Under Review",
    APPROVED: "Approved",
    FILED: "Filed",
    COMPLETED: "Completed",
  };
  return labels[status] || status;
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    CRITICAL: "red",
    HIGH: "orange",
    MEDIUM: "yellow",
    LOW: "green",
  };
  return colors[priority] || "gray";
}
