"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CustomerHealthScore, type HealthScoreFilters } from "@/lib/api/client";

// Query keys for cache management
export const healthScoreKeys = {
  all: ["healthScores"] as const,
  lists: () => [...healthScoreKeys.all, "list"] as const,
  list: (filters: HealthScoreFilters) => [...healthScoreKeys.lists(), filters] as const,
  details: () => [...healthScoreKeys.all, "detail"] as const,
  detail: (clientId: string) => [...healthScoreKeys.details(), clientId] as const,
};

/**
 * Hook to fetch customer health scores with filters
 */
export function useHealthScores(filters: HealthScoreFilters) {
  return useQuery({
    queryKey: healthScoreKeys.list(filters),
    queryFn: () => api.healthScores.list(filters),
    enabled: !!filters.firmId,
    staleTime: 60 * 1000, // 1 minute - health scores don't change frequently
  });
}

/**
 * Hook to fetch a single client's health score
 */
export function useHealthScore(clientId: string, firmId: string) {
  return useQuery({
    queryKey: healthScoreKeys.detail(clientId),
    queryFn: () => api.healthScores.get(clientId, firmId),
    enabled: !!clientId && !!firmId,
  });
}

/**
 * Hook to trigger health score recalculation
 */
export function useRecalculateHealthScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ firmId, clientIds }: { firmId: string; clientIds?: string[] }) =>
      api.healthScores.recalculate(firmId, clientIds),
    onSuccess: () => {
      // Invalidate all health scores to refetch after recalculation
      queryClient.invalidateQueries({ queryKey: healthScoreKeys.all });
    },
  });
}

// Type exports
export type { CustomerHealthScore, HealthScoreFilters };
