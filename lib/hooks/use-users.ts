"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  firmId: string;
  firmName: string;
  status: string;
  permissions: Array<{ resource: string; action: string }>;
  department?: string;
  title?: string;
  phone?: string;
  managerId?: string;
  managerName?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: string;
  department?: string;
  title?: string;
  phone?: string;
  managerId?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: string;
  department?: string;
  title?: string;
  phone?: string;
  managerId?: string;
  status?: string;
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
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to fetch users with filters
 */
export function useUsers(filters: UserFilters = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () =>
      apiFetch<{
        users: User[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/users?${params.toString()}`),
  });
}

/**
 * Hook to fetch a single user
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiFetch<{ user: User }>(`/api/users/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      apiFetch<{ user: User }>("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      apiFetch<{ user: User }>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to deactivate a user
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      userId,
      currentPassword,
      newPassword,
    }: {
      userId: string;
      currentPassword: string;
      newPassword: string;
    }) =>
      apiFetch<{ success: boolean }>(`/api/users/${userId}/password`, {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  });
}
