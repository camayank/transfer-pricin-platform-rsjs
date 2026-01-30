"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClientCreateInput, ClientUpdateInput } from "@/lib/validations";

// Types
export interface Client {
  id: string;
  name: string;
  pan: string;
  tan?: string | null;
  cin?: string | null;
  industry?: string | null;
  nicCode?: string | null;
  nicDescription?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country: string;
  website?: string | null;
  parentCompany?: string | null;
  parentCountry?: string | null;
  ultimateParent?: string | null;
  ultimateParentCountry?: string | null;
  consolidatedRevenue?: number | null;
  firmId: string;
  assignedToId?: string | null;
  assignedTo?: { id: string; name: string | null } | null;
  reviewerId?: string | null;
  reviewer?: { id: string; name: string | null } | null;
  status: string;
  isActive: boolean;
  _count?: {
    engagements: number;
    documents: number;
    associatedEnterprises: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClientFilters {
  status?: string;
  industry?: string;
  search?: string;
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
export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters: ClientFilters) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  associatedEnterprises: (clientId: string) =>
    [...clientKeys.detail(clientId), "associatedEnterprises"] as const,
};

/**
 * Hook to fetch clients with filters
 */
export function useClients(filters: ClientFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.industry) params.set("industry", filters.industry);
  if (filters.search) params.set("search", filters.search);
  if (filters.assignedToId) params.set("assignedToId", filters.assignedToId);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: () =>
      apiFetch<{
        clients: Client[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/clients?${params.toString()}`),
  });
}

/**
 * Hook to fetch a single client
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => apiFetch<{ client: Client }>(`/api/clients/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientCreateInput) =>
      apiFetch<{ client: Client }>("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook to update a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientUpdateInput }) =>
      apiFetch<{ client: Client }>(`/api/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook to delete/deactivate a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/clients/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook to get client statistics
 */
export function useClientStats() {
  return useQuery({
    queryKey: [...clientKeys.all, "stats"],
    queryFn: () =>
      apiFetch<{
        total: number;
        active: number;
        byIndustry: Record<string, number>;
        withEngagements: number;
      }>("/api/clients/stats"),
  });
}
