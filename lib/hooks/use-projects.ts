"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Project, type ProjectFilters, type CreateProjectInput } from "@/lib/api/client";

// Query keys for cache management
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Hook to fetch projects with filters
 */
export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => api.projects.list(filters),
    enabled: !!filters.firmId,
  });
}

/**
 * Hook to fetch a single project
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => api.projects.get(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => api.projects.create(data),
    onSuccess: (_, variables) => {
      // Invalidate project list to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectInput> }) =>
      api.projects.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific project and list
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Type exports
export type { Project, ProjectFilters, CreateProjectInput };
