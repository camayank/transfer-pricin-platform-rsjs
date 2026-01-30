"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type DataDeletionRequest,
  type SecurityIncident,
  type AccessReview,
  type AccessReviewItem,
  type DataRequestFilters,
  type AccessReviewFilters,
} from "@/lib/api/client";

// ============================================================================
// DATA DELETION REQUESTS
// ============================================================================

export const dataRequestKeys = {
  all: ["dataRequests"] as const,
  lists: () => [...dataRequestKeys.all, "list"] as const,
  list: (filters: DataRequestFilters) => [...dataRequestKeys.lists(), filters] as const,
  detail: (id: string) => [...dataRequestKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch paginated data deletion requests
 */
export function useDataRequests(filters: DataRequestFilters = {}) {
  return useQuery({
    queryKey: dataRequestKeys.list(filters),
    queryFn: () => api.dataRequests.list(filters),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single data request
 */
export function useDataRequest(id: string) {
  return useQuery({
    queryKey: dataRequestKeys.detail(id),
    queryFn: () => api.dataRequests.get(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new data deletion request
 */
export function useCreateDataRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { subjectEmail: string; subjectName?: string; requestType: string; scope: string[] }) =>
      api.dataRequests.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dataRequestKeys.all });
    },
  });
}

/**
 * Hook to update a data request status
 */
export function useUpdateDataRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, data }: { id: string; action: string; data?: Record<string, unknown> }) =>
      api.dataRequests.update(id, action, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dataRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: dataRequestKeys.detail(variables.id) });
    },
  });
}

// ============================================================================
// SECURITY INCIDENTS
// ============================================================================

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...incidentKeys.lists(), filters] as const,
  detail: (id: string) => [...incidentKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch paginated security incidents
 */
export function useSecurityIncidents(
  filters: { status?: string; severity?: string; category?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () => api.incidents.list(filters),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single security incident
 */
export function useSecurityIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => api.incidents.get(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new security incident
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      severity?: string;
      category: string;
      affectedUsers?: string[];
      affectedEntities?: string[];
      detectedAt?: string;
    }) => api.incidents.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
}

/**
 * Hook to update a security incident
 */
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SecurityIncident> }) =>
      api.incidents.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(variables.id) });
    },
  });
}

// ============================================================================
// ACCESS REVIEWS
// ============================================================================

export const accessReviewKeys = {
  all: ["accessReviews"] as const,
  lists: () => [...accessReviewKeys.all, "list"] as const,
  list: (filters: AccessReviewFilters) => [...accessReviewKeys.lists(), filters] as const,
  detail: (id: string) => [...accessReviewKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch paginated access reviews
 */
export function useAccessReviews(filters: AccessReviewFilters = {}) {
  return useQuery({
    queryKey: accessReviewKeys.list(filters),
    queryFn: () => api.accessReviews.list(filters),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single access review with items
 */
export function useAccessReview(id: string) {
  return useQuery({
    queryKey: accessReviewKeys.detail(id),
    queryFn: () => api.accessReviews.get(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new access review cycle
 */
export function useCreateAccessReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      reviewerIds: string[];
      scope: string;
      scopeConfig?: Record<string, unknown>;
      startDate: string;
      dueDate: string;
    }) => api.accessReviews.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessReviewKeys.all });
    },
  });
}

/**
 * Hook to update an access review
 */
export function useUpdateAccessReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; dueDate?: string } }) =>
      api.accessReviews.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessReviewKeys.all });
      queryClient.invalidateQueries({ queryKey: accessReviewKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook to submit a review decision for an access review item
 */
export function useSubmitReviewDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      itemId,
      decision,
      newRole,
      newAccess,
      justification,
    }: {
      reviewId: string;
      itemId: string;
      decision: "APPROVE" | "REVOKE" | "MODIFY";
      newRole?: string;
      newAccess?: Record<string, unknown>;
      justification?: string;
    }) => api.accessReviews.submitDecision(reviewId, itemId, { decision, newRole, newAccess, justification }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessReviewKeys.all });
      queryClient.invalidateQueries({ queryKey: accessReviewKeys.detail(variables.reviewId) });
    },
  });
}

// Type exports for convenience
export type {
  DataDeletionRequest,
  SecurityIncident,
  AccessReview,
  AccessReviewItem,
  DataRequestFilters,
  AccessReviewFilters,
};
