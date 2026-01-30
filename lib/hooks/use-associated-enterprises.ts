"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AssociatedEnterpriseCreateInput,
  AssociatedEnterpriseUpdateInput,
} from "@/lib/validations";
import { clientKeys } from "./use-clients";

// Types
export interface AssociatedEnterprise {
  id: string;
  clientId: string;
  name: string;
  country: string;
  relationship: RelationshipType;
  pan?: string | null;
  tin?: string | null;
  address?: string | null;
  _count?: {
    transactions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type RelationshipType =
  | "PARENT"
  | "SUBSIDIARY"
  | "FELLOW_SUBSIDIARY"
  | "ASSOCIATE"
  | "JV"
  | "BRANCH";

export interface AssociatedEnterpriseFilters {
  clientId?: string;
  country?: string;
  relationship?: string;
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
export const aeKeys = {
  all: ["associatedEnterprises"] as const,
  lists: () => [...aeKeys.all, "list"] as const,
  list: (filters: AssociatedEnterpriseFilters) => [...aeKeys.lists(), filters] as const,
  byClient: (clientId: string) => [...aeKeys.lists(), { clientId }] as const,
  details: () => [...aeKeys.all, "detail"] as const,
  detail: (id: string) => [...aeKeys.details(), id] as const,
};

/**
 * Hook to fetch all associated enterprises with filters
 */
export function useAssociatedEnterprises(filters: AssociatedEnterpriseFilters = {}) {
  const params = new URLSearchParams();
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.country) params.set("country", filters.country);
  if (filters.relationship) params.set("relationship", filters.relationship);

  return useQuery({
    queryKey: aeKeys.list(filters),
    queryFn: () =>
      apiFetch<{
        associatedEnterprises: AssociatedEnterprise[];
      }>(`/api/associated-enterprises?${params.toString()}`),
  });
}

/**
 * Hook to fetch associated enterprises for a specific client
 */
export function useClientAssociatedEnterprises(clientId: string) {
  return useQuery({
    queryKey: aeKeys.byClient(clientId),
    queryFn: () =>
      apiFetch<{
        associatedEnterprises: AssociatedEnterprise[];
      }>(`/api/clients/${clientId}/associated-enterprises`),
    enabled: !!clientId,
  });
}

/**
 * Hook to fetch a single associated enterprise
 */
export function useAssociatedEnterprise(id: string) {
  return useQuery({
    queryKey: aeKeys.detail(id),
    queryFn: () =>
      apiFetch<{ associatedEnterprise: AssociatedEnterprise }>(
        `/api/associated-enterprises/${id}`
      ),
    enabled: !!id,
  });
}

/**
 * Hook to create a new associated enterprise
 */
export function useCreateAssociatedEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssociatedEnterpriseCreateInput) =>
      apiFetch<{ associatedEnterprise: AssociatedEnterprise }>(
        "/api/associated-enterprises",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: aeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: aeKeys.byClient(result.associatedEnterprise.clientId),
      });
      // Also invalidate client detail to update counts
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(result.associatedEnterprise.clientId),
      });
    },
  });
}

/**
 * Hook to update an associated enterprise
 */
export function useUpdateAssociatedEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AssociatedEnterpriseUpdateInput;
    }) =>
      apiFetch<{ associatedEnterprise: AssociatedEnterprise }>(
        `/api/associated-enterprises/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: aeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: aeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: aeKeys.byClient(result.associatedEnterprise.clientId),
      });
    },
  });
}

/**
 * Hook to delete an associated enterprise
 */
export function useDeleteAssociatedEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId }: { id: string; clientId: string }) =>
      apiFetch<{ success: boolean }>(`/api/associated-enterprises/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: aeKeys.byClient(variables.clientId) });
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
    },
  });
}

// Relationship type helpers
export function getRelationshipLabel(relationship: RelationshipType): string {
  const labels: Record<RelationshipType, string> = {
    PARENT: "Parent Company",
    SUBSIDIARY: "Subsidiary",
    FELLOW_SUBSIDIARY: "Fellow Subsidiary",
    ASSOCIATE: "Associate Company",
    JV: "Joint Venture",
    BRANCH: "Branch",
  };
  return labels[relationship] || relationship;
}

export function getRelationshipShort(relationship: RelationshipType): string {
  const shorts: Record<RelationshipType, string> = {
    PARENT: "Parent",
    SUBSIDIARY: "Sub",
    FELLOW_SUBSIDIARY: "Fellow Sub",
    ASSOCIATE: "Assoc",
    JV: "JV",
    BRANCH: "Branch",
  };
  return shorts[relationship] || relationship;
}
