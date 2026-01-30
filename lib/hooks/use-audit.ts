"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AuditLogFilters, type AuditLogEntry } from "@/lib/api/client";

// Query keys for cache management
export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (filters: AuditLogFilters) => [...auditKeys.lists(), filters] as const,
};

/**
 * Hook to fetch paginated audit logs with filters
 */
export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => api.audit.list(filters),
    enabled: !!filters.firmId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to verify audit log chain integrity
 */
export function useVerifyAuditChain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      firmId,
      startDate,
      endDate,
    }: {
      firmId: string;
      startDate?: string;
      endDate?: string;
    }) => api.audit.verify(firmId, startDate, endDate),
    onSuccess: () => {
      // Optionally invalidate audit logs after verification
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}

/**
 * Hook to export audit logs
 */
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: ({
      firmId,
      format,
      startDate,
      endDate,
    }: {
      firmId: string;
      format: "json" | "csv";
      startDate?: string;
      endDate?: string;
    }) => api.audit.export(firmId, format, startDate, endDate),
  });
}

// Type exports for convenience
export type { AuditLogEntry, AuditLogFilters };
