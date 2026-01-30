"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type KpiDefinition, type CreateKpiInput } from "@/lib/api/client";

// Query keys for cache management
export const kpiKeys = {
  all: ["kpis"] as const,
  lists: () => [...kpiKeys.all, "list"] as const,
  list: (firmId: string) => [...kpiKeys.lists(), firmId] as const,
  details: () => [...kpiKeys.all, "detail"] as const,
  detail: (id: string) => [...kpiKeys.details(), id] as const,
  history: (id: string) => [...kpiKeys.detail(id), "history"] as const,
};

/**
 * Hook to fetch KPI definitions
 */
export function useKpis(firmId: string) {
  return useQuery({
    queryKey: kpiKeys.list(firmId),
    queryFn: () => api.kpis.list(firmId),
    enabled: !!firmId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single KPI
 */
export function useKpi(id: string, firmId: string) {
  return useQuery({
    queryKey: kpiKeys.detail(id),
    queryFn: () => api.kpis.get(id, firmId),
    enabled: !!id && !!firmId,
  });
}

/**
 * Hook to fetch KPI history
 */
export function useKpiHistory(id: string, firmId: string, days = 30) {
  return useQuery({
    queryKey: kpiKeys.history(id),
    queryFn: () => api.kpis.getHistory(id, firmId, days),
    enabled: !!id && !!firmId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new KPI
 */
export function useCreateKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKpiInput) => api.kpis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kpiKeys.lists() });
    },
  });
}

/**
 * Hook to update a KPI
 */
export function useUpdateKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateKpiInput> }) =>
      api.kpis.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: kpiKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: kpiKeys.lists() });
    },
  });
}

// Type exports
export type { KpiDefinition, CreateKpiInput };
