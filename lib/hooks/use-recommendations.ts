"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AiRecommendation } from "@/lib/api/client";

// Query keys for cache management
export const recommendationKeys = {
  all: ["recommendations"] as const,
  lists: () => [...recommendationKeys.all, "list"] as const,
  list: (firmId: string) => [...recommendationKeys.lists(), firmId] as const,
};

/**
 * Hook to fetch AI recommendations
 */
export function useRecommendations(firmId: string) {
  return useQuery({
    queryKey: recommendationKeys.list(firmId),
    queryFn: () => api.recommendations.list(firmId),
    enabled: !!firmId,
    staleTime: 5 * 60 * 1000, // 5 minutes - recommendations are generated less frequently
    refetchOnWindowFocus: true, // Refresh on tab focus for fresh recommendations
  });
}

/**
 * Hook to dismiss a recommendation
 */
export function useDismissRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.recommendations.dismiss(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
    },
  });
}

/**
 * Hook to mark a recommendation as acted upon
 */
export function useActOnRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.recommendations.act(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
    },
  });
}

// Type exports
export type { AiRecommendation };
