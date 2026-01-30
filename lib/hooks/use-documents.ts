"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DocumentCreateInput, DocumentUpdateInput } from "@/lib/validations";
import { engagementKeys } from "./use-engagements";
import { clientKeys } from "./use-clients";

// Types
export interface Document {
  id: string;
  engagementId?: string | null;
  engagement?: {
    id: string;
    financialYear: string;
    assessmentYear: string;
    client: {
      id: string;
      name: string;
      pan: string;
    };
  } | null;
  clientId?: string | null;
  client?: {
    id: string;
    name: string;
    pan: string;
  } | null;
  type: DocumentType;
  status: DocStatus;
  name?: string | null;

  // Document Data
  data?: Record<string, unknown> | null;
  validationErrors?: Record<string, unknown> | null;

  // File Info
  fileName?: string | null;
  filePath?: string | null;
  fileSize?: number | null;

  // E-Filing
  acknowledgmentNo?: string | null;
  udin?: string | null;

  // Timestamps
  uploadedAt: string;
  generatedAt?: string | null;
  filedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | "FORM_3CEB"
  | "FORM_3CEFA"
  | "FORM_3CEAA"
  | "FORM_3CEAB"
  | "FORM_3CEAC"
  | "FORM_3CEAD"
  | "LOCAL_FILE"
  | "BENCHMARKING_REPORT"
  | "TP_STUDY"
  | "AGREEMENT"
  | "FINANCIAL_STATEMENT"
  | "OTHER";

export type DocStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "PENDING_REVIEW"
  | "REVIEW"
  | "APPROVED"
  | "FILED";

export interface DocumentFilters {
  engagementId?: string;
  clientId?: string;
  type?: string;
  status?: string;
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
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: DocumentFilters) => [...documentKeys.lists(), filters] as const,
  byEngagement: (engagementId: string) =>
    [...documentKeys.lists(), { engagementId }] as const,
  byClient: (clientId: string) => [...documentKeys.lists(), { clientId }] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

/**
 * Hook to fetch documents with filters
 */
export function useDocuments(filters: DocumentFilters = {}) {
  const params = new URLSearchParams();
  if (filters.engagementId) params.set("engagementId", filters.engagementId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () =>
      apiFetch<{
        documents: Document[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/documents?${params.toString()}`),
  });
}

/**
 * Hook to fetch documents for a specific engagement
 */
export function useEngagementDocuments(engagementId: string) {
  return useQuery({
    queryKey: documentKeys.byEngagement(engagementId),
    queryFn: () =>
      apiFetch<{ documents: Document[] }>(
        `/api/engagements/${engagementId}/documents`
      ),
    enabled: !!engagementId,
  });
}

/**
 * Hook to fetch documents for a specific client
 */
export function useClientDocuments(clientId: string) {
  return useQuery({
    queryKey: documentKeys.byClient(clientId),
    queryFn: () =>
      apiFetch<{ documents: Document[] }>(`/api/clients/${clientId}/documents`),
    enabled: !!clientId,
  });
}

/**
 * Hook to fetch a single document
 */
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => apiFetch<{ document: Document }>(`/api/documents/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentCreateInput) =>
      apiFetch<{ document: Document }>("/api/documents", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      if (result.document.engagementId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byEngagement(result.document.engagementId),
        });
        queryClient.invalidateQueries({
          queryKey: engagementKeys.detail(result.document.engagementId),
        });
      }
      if (result.document.clientId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byClient(result.document.clientId),
        });
        queryClient.invalidateQueries({
          queryKey: clientKeys.detail(result.document.clientId),
        });
      }
    },
  });
}

/**
 * Hook to update a document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentUpdateInput }) =>
      apiFetch<{ document: Document }>(`/api/documents/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      if (result.document.engagementId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byEngagement(result.document.engagementId),
        });
      }
      if (result.document.clientId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byClient(result.document.clientId),
        });
      }
    },
  });
}

/**
 * Hook to generate a document (e.g., Form 3CEB)
 */
export function useGenerateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      engagementId,
      type,
    }: {
      engagementId: string;
      type: DocumentType;
    }) =>
      apiFetch<{ document: Document }>(
        `/api/engagements/${engagementId}/documents/generate`,
        {
          method: "POST",
          body: JSON.stringify({ type }),
        }
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      if (result.document.engagementId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byEngagement(result.document.engagementId),
        });
        queryClient.invalidateQueries({
          queryKey: engagementKeys.detail(result.document.engagementId),
        });
      }
    },
  });
}

/**
 * Hook to validate a document
 */
export function useValidateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{
        document: Document;
        isValid: boolean;
        errors: Record<string, string[]>;
      }>(`/api/documents/${id}/validate`, {
        method: "POST",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables),
      });
    },
  });
}

/**
 * Hook to file/submit a document
 */
export function useFileDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      acknowledgmentNo,
      udin,
    }: {
      id: string;
      acknowledgmentNo?: string;
      udin?: string;
    }) =>
      apiFetch<{ document: Document }>(`/api/documents/${id}/file`, {
        method: "POST",
        body: JSON.stringify({ acknowledgmentNo, udin }),
      }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      if (result.document.engagementId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byEngagement(result.document.engagementId),
        });
        queryClient.invalidateQueries({
          queryKey: engagementKeys.detail(result.document.engagementId),
        });
      }
    },
  });
}

/**
 * Hook to delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      engagementId,
      clientId,
    }: {
      id: string;
      engagementId?: string;
      clientId?: string;
    }) =>
      apiFetch<{ success: boolean }>(`/api/documents/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      if (variables.engagementId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byEngagement(variables.engagementId),
        });
        queryClient.invalidateQueries({
          queryKey: engagementKeys.detail(variables.engagementId),
        });
      }
      if (variables.clientId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byClient(variables.clientId),
        });
        queryClient.invalidateQueries({
          queryKey: clientKeys.detail(variables.clientId),
        });
      }
    },
  });
}

// Helper functions
export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    FORM_3CEB: "Form 3CEB",
    FORM_3CEFA: "Form 3CEFA (Safe Harbour)",
    FORM_3CEAA: "Form 3CEAA (Master File Part A)",
    FORM_3CEAB: "Form 3CEAB (Master File Part B)",
    FORM_3CEAC: "Form 3CEAC (Master File Part C)",
    FORM_3CEAD: "Form 3CEAD (CbCR)",
    LOCAL_FILE: "Local File",
    BENCHMARKING_REPORT: "Benchmarking Report",
    TP_STUDY: "Transfer Pricing Study",
    AGREEMENT: "Agreement",
    FINANCIAL_STATEMENT: "Financial Statement",
    OTHER: "Other Document",
  };
  return labels[type] || type;
}

export function getDocStatusLabel(status: DocStatus): string {
  const labels: Record<DocStatus, string> = {
    DRAFT: "Draft",
    IN_PROGRESS: "In Progress",
    PENDING_REVIEW: "Pending Review",
    REVIEW: "Under Review",
    APPROVED: "Approved",
    FILED: "Filed",
  };
  return labels[status] || status;
}

export function getDocStatusColor(status: DocStatus): string {
  const colors: Record<DocStatus, string> = {
    DRAFT: "gray",
    IN_PROGRESS: "blue",
    PENDING_REVIEW: "yellow",
    REVIEW: "orange",
    APPROVED: "green",
    FILED: "purple",
  };
  return colors[status] || "gray";
}

// Document workflow
export const DOC_STATUS_ORDER: DocStatus[] = [
  "DRAFT",
  "IN_PROGRESS",
  "PENDING_REVIEW",
  "REVIEW",
  "APPROVED",
  "FILED",
];

export function getNextDocStatus(current: DocStatus): DocStatus | null {
  const idx = DOC_STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx >= DOC_STATUS_ORDER.length - 1) return null;
  return DOC_STATUS_ORDER[idx + 1];
}

export function canTransitionTo(current: DocStatus, target: DocStatus): boolean {
  const currentIdx = DOC_STATUS_ORDER.indexOf(current);
  const targetIdx = DOC_STATUS_ORDER.indexOf(target);
  // Can only move forward or back one step
  return Math.abs(targetIdx - currentIdx) === 1;
}
