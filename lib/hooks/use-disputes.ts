"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DisputeCaseCreateInput, DisputeCaseUpdateInput } from "@/lib/validations";
import { engagementKeys } from "./use-engagements";

// Types
export interface DisputeCase {
  id: string;
  engagementId: string;
  engagement?: {
    id: string;
    financialYear: string;
    assessmentYear: string;
    client: {
      id: string;
      name: string;
      pan: string;
    };
  };

  // Case Details
  caseNumber?: string | null;
  assessmentYear: string;
  stage: DisputeStage;
  status: DisputeStatus;

  // Amounts
  adjustmentByTPO?: number | null;
  adjustmentByDRP?: number | null;
  adjustmentByITAT?: number | null;
  amountAtStake: number;

  // Dates
  tpoOrderDate?: string | null;
  drpFilingDate?: string | null;
  drpDirectionDate?: string | null;
  itatFilingDate?: string | null;
  nextHearingDate?: string | null;

  // Outcome
  successProbability?: number | null;
  outcome?: "WON" | "LOST" | "PARTIAL" | "SETTLED" | null;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export type DisputeStage =
  | "TPO"
  | "DRP"
  | "AO"
  | "ITAT"
  | "HIGH_COURT"
  | "SUPREME_COURT";

export type DisputeStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING_HEARING"
  | "DECIDED"
  | "APPEALED"
  | "CLOSED";

export interface DisputeFilters {
  engagementId?: string;
  clientId?: string;
  stage?: string;
  status?: string;
  assessmentYear?: string;
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
export const disputeKeys = {
  all: ["disputes"] as const,
  lists: () => [...disputeKeys.all, "list"] as const,
  list: (filters: DisputeFilters) => [...disputeKeys.lists(), filters] as const,
  byEngagement: (engagementId: string) =>
    [...disputeKeys.lists(), { engagementId }] as const,
  details: () => [...disputeKeys.all, "detail"] as const,
  detail: (id: string) => [...disputeKeys.details(), id] as const,
  stats: () => [...disputeKeys.all, "stats"] as const,
};

/**
 * Hook to fetch disputes with filters
 */
export function useDisputes(filters: DisputeFilters = {}) {
  const params = new URLSearchParams();
  if (filters.engagementId) params.set("engagementId", filters.engagementId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.status) params.set("status", filters.status);
  if (filters.assessmentYear) params.set("assessmentYear", filters.assessmentYear);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: disputeKeys.list(filters),
    queryFn: () =>
      apiFetch<{
        disputes: DisputeCase[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/disputes?${params.toString()}`),
  });
}

/**
 * Hook to fetch disputes for a specific engagement
 */
export function useEngagementDisputes(engagementId: string) {
  return useQuery({
    queryKey: disputeKeys.byEngagement(engagementId),
    queryFn: () =>
      apiFetch<{ disputes: DisputeCase[] }>(
        `/api/engagements/${engagementId}/disputes`
      ),
    enabled: !!engagementId,
  });
}

/**
 * Hook to fetch a single dispute
 */
export function useDispute(id: string) {
  return useQuery({
    queryKey: disputeKeys.detail(id),
    queryFn: () => apiFetch<{ dispute: DisputeCase }>(`/api/disputes/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create a new dispute case
 */
export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DisputeCaseCreateInput) =>
      apiFetch<{ dispute: DisputeCase }>("/api/disputes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: disputeKeys.byEngagement(result.dispute.engagementId),
      });
      queryClient.invalidateQueries({
        queryKey: engagementKeys.detail(result.dispute.engagementId),
      });
    },
  });
}

/**
 * Hook to update a dispute case
 */
export function useUpdateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DisputeCaseUpdateInput }) =>
      apiFetch<{ dispute: DisputeCase }>(`/api/disputes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: disputeKeys.byEngagement(result.dispute.engagementId),
      });
    },
  });
}

/**
 * Hook to update dispute stage (escalation)
 */
export function useEscalateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      newStage,
      filingDate,
    }: {
      id: string;
      newStage: DisputeStage;
      filingDate?: Date;
    }) =>
      apiFetch<{ dispute: DisputeCase }>(`/api/disputes/${id}/escalate`, {
        method: "POST",
        body: JSON.stringify({ stage: newStage, filingDate }),
      }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: disputeKeys.byEngagement(result.dispute.engagementId),
      });
    },
  });
}

/**
 * Hook to close/resolve a dispute
 */
export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      outcome,
      finalAdjustment,
      notes,
    }: {
      id: string;
      outcome: "WON" | "LOST" | "PARTIAL" | "SETTLED";
      finalAdjustment?: number;
      notes?: string;
    }) =>
      apiFetch<{ dispute: DisputeCase }>(`/api/disputes/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ outcome, finalAdjustment, notes }),
      }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: disputeKeys.byEngagement(result.dispute.engagementId),
      });
    },
  });
}

/**
 * Hook to delete a dispute case
 */
export function useDeleteDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, engagementId }: { id: string; engagementId: string }) =>
      apiFetch<{ success: boolean }>(`/api/disputes/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: disputeKeys.byEngagement(variables.engagementId),
      });
      queryClient.invalidateQueries({
        queryKey: engagementKeys.detail(variables.engagementId),
      });
    },
  });
}

/**
 * Hook to get dispute statistics
 */
export function useDisputeStats() {
  return useQuery({
    queryKey: disputeKeys.stats(),
    queryFn: () =>
      apiFetch<{
        total: number;
        open: number;
        byStage: Record<DisputeStage, number>;
        byStatus: Record<DisputeStatus, number>;
        totalAmountAtStake: number;
        avgSuccessProbability: number;
        upcomingHearings: number;
        recentlyDecided: number;
      }>("/api/disputes/stats"),
  });
}

// Helper functions
export function getStageLabel(stage: DisputeStage): string {
  const labels: Record<DisputeStage, string> = {
    TPO: "Transfer Pricing Officer",
    DRP: "Dispute Resolution Panel",
    AO: "Assessing Officer",
    ITAT: "Income Tax Appellate Tribunal",
    HIGH_COURT: "High Court",
    SUPREME_COURT: "Supreme Court",
  };
  return labels[stage] || stage;
}

export function getStageShort(stage: DisputeStage): string {
  return stage;
}

export function getStatusLabel(status: DisputeStatus): string {
  const labels: Record<DisputeStatus, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    PENDING_HEARING: "Pending Hearing",
    DECIDED: "Decided",
    APPEALED: "Appealed",
    CLOSED: "Closed",
  };
  return labels[status] || status;
}

export function getOutcomeLabel(
  outcome: "WON" | "LOST" | "PARTIAL" | "SETTLED"
): string {
  const labels = {
    WON: "Won",
    LOST: "Lost",
    PARTIAL: "Partial Relief",
    SETTLED: "Settled",
  };
  return labels[outcome] || outcome;
}

export function getOutcomeColor(
  outcome: "WON" | "LOST" | "PARTIAL" | "SETTLED"
): string {
  const colors = {
    WON: "green",
    LOST: "red",
    PARTIAL: "yellow",
    SETTLED: "blue",
  };
  return colors[outcome] || "gray";
}

// Stage order for escalation
export const DISPUTE_STAGE_ORDER: DisputeStage[] = [
  "TPO",
  "DRP",
  "AO",
  "ITAT",
  "HIGH_COURT",
  "SUPREME_COURT",
];

export function getNextStage(current: DisputeStage): DisputeStage | null {
  const idx = DISPUTE_STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx >= DISPUTE_STAGE_ORDER.length - 1) return null;
  return DISPUTE_STAGE_ORDER[idx + 1];
}

export function canEscalate(current: DisputeStage): boolean {
  return getNextStage(current) !== null;
}

// Timeline calculation helpers
export function getDRPDeadline(tpoOrderDate: Date): Date {
  // DRP filing must be within 30 days of TPO order
  const deadline = new Date(tpoOrderDate);
  deadline.setDate(deadline.getDate() + 30);
  return deadline;
}

export function getITATDeadline(aoOrderDate: Date): Date {
  // ITAT appeal must be within 60 days of AO order
  const deadline = new Date(aoOrderDate);
  deadline.setDate(deadline.getDate() + 60);
  return deadline;
}
