"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  InternationalTransactionCreateInput,
  InternationalTransactionUpdateInput,
} from "@/lib/validations";
import { engagementKeys } from "./use-engagements";

// Types
export interface InternationalTransaction {
  id: string;
  engagementId: string;
  aeId: string;
  ae: {
    id: string;
    name: string;
    country: string;
    relationship: string;
  };

  // Transaction Details
  natureCode: string;
  transactionType: TransactionType;
  description?: string | null;
  amount: number;
  currency: string;

  // TP Method
  method?: TPMethod | null;
  testedParty?: "INDIAN_ENTITY" | "AE" | null;
  pliType?: PLIType | null;
  pliValue?: number | null;

  // Safe Harbour
  safeHarbourApplied: boolean;
  safeHarbourType?: SafeHarbourType | null;

  // Benchmarking Result
  armLengthPriceLow?: number | null;
  armLengthPriceHigh?: number | null;
  armLengthMedian?: number | null;
  adjustmentAmount?: number | null;

  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | "PURCHASE"
  | "SALE"
  | "SERVICE_PAYMENT"
  | "SERVICE_INCOME"
  | "ROYALTY_PAYMENT"
  | "ROYALTY_INCOME"
  | "INTEREST_PAYMENT"
  | "INTEREST_INCOME"
  | "GUARANTEE_FEE"
  | "MANAGEMENT_FEE"
  | "REIMBURSEMENT"
  | "CAPITAL"
  | "OTHER";

export type TPMethod = "CUP" | "RPM" | "CPM" | "TNMM" | "PSM" | "OTHER";

export type PLIType =
  | "OP_OC"
  | "OP_OR"
  | "GROSS_PROFIT"
  | "NET_PROFIT"
  | "BERRY_RATIO"
  | "RETURN_ON_ASSETS"
  | "RETURN_ON_CAPITAL";

export type SafeHarbourType =
  | "IT_ITES"
  | "KPO"
  | "CONTRACT_RD"
  | "LOAN_FC"
  | "LOAN_INR"
  | "GUARANTEE"
  | "CORE_AUTO_COMPONENTS";

export interface TransactionFilters {
  engagementId?: string;
  aeId?: string;
  transactionType?: string;
  method?: string;
  safeHarbourApplied?: boolean;
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
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  byEngagement: (engagementId: string) =>
    [...transactionKeys.lists(), { engagementId }] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

/**
 * Hook to fetch transactions with filters
 */
export function useTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.engagementId) params.set("engagementId", filters.engagementId);
  if (filters.aeId) params.set("aeId", filters.aeId);
  if (filters.transactionType) params.set("transactionType", filters.transactionType);
  if (filters.method) params.set("method", filters.method);
  if (filters.safeHarbourApplied !== undefined) {
    params.set("safeHarbourApplied", String(filters.safeHarbourApplied));
  }

  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () =>
      apiFetch<{
        transactions: InternationalTransaction[];
        summary?: {
          totalAmount: number;
          byType: Record<string, number>;
          byMethod: Record<string, number>;
        };
      }>(`/api/transactions?${params.toString()}`),
  });
}

/**
 * Hook to fetch transactions for a specific engagement
 */
export function useEngagementTransactions(engagementId: string) {
  return useQuery({
    queryKey: transactionKeys.byEngagement(engagementId),
    queryFn: () =>
      apiFetch<{
        transactions: InternationalTransaction[];
        summary?: {
          totalAmount: number;
          byType: Record<string, number>;
        };
      }>(`/api/engagements/${engagementId}/transactions`),
    enabled: !!engagementId,
  });
}

/**
 * Hook to fetch a single transaction
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () =>
      apiFetch<{ transaction: InternationalTransaction }>(`/api/transactions/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InternationalTransactionCreateInput) =>
      apiFetch<{ transaction: InternationalTransaction }>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.byEngagement(result.transaction.engagementId),
      });
      // Update engagement's transaction count
      queryClient.invalidateQueries({
        queryKey: engagementKeys.detail(result.transaction.engagementId),
      });
    },
  });
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: InternationalTransactionUpdateInput;
    }) =>
      apiFetch<{ transaction: InternationalTransaction }>(`/api/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.byEngagement(result.transaction.engagementId),
      });
    },
  });
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      engagementId,
    }: {
      id: string;
      engagementId: string;
    }) =>
      apiFetch<{ success: boolean }>(`/api/transactions/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.byEngagement(variables.engagementId),
      });
      queryClient.invalidateQueries({
        queryKey: engagementKeys.detail(variables.engagementId),
      });
    },
  });
}

/**
 * Hook to bulk update transactions (e.g., after benchmarking)
 */
export function useBulkUpdateTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      engagementId,
      updates,
    }: {
      engagementId: string;
      updates: Array<{ id: string; data: InternationalTransactionUpdateInput }>;
    }) =>
      apiFetch<{ success: boolean; updated: number }>(
        `/api/engagements/${engagementId}/transactions/bulk`,
        {
          method: "PUT",
          body: JSON.stringify({ updates }),
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.byEngagement(variables.engagementId),
      });
    },
  });
}

// Helper functions
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    PURCHASE: "Purchase of Goods",
    SALE: "Sale of Goods",
    SERVICE_PAYMENT: "Payment for Services",
    SERVICE_INCOME: "Receipt for Services",
    ROYALTY_PAYMENT: "Royalty Payment",
    ROYALTY_INCOME: "Royalty Receipt",
    INTEREST_PAYMENT: "Interest Payment",
    INTEREST_INCOME: "Interest Receipt",
    GUARANTEE_FEE: "Corporate Guarantee Fee",
    MANAGEMENT_FEE: "Management Fee",
    REIMBURSEMENT: "Cost Reimbursement",
    CAPITAL: "Capital Transaction",
    OTHER: "Other Transaction",
  };
  return labels[type] || type;
}

export function getTPMethodLabel(method: TPMethod): string {
  const labels: Record<TPMethod, string> = {
    CUP: "Comparable Uncontrolled Price",
    RPM: "Resale Price Method",
    CPM: "Cost Plus Method",
    TNMM: "Transactional Net Margin Method",
    PSM: "Profit Split Method",
    OTHER: "Other Method",
  };
  return labels[method] || method;
}

export function getPLITypeLabel(pliType: PLIType): string {
  const labels: Record<PLIType, string> = {
    OP_OC: "OP/OC (Operating Profit / Operating Cost)",
    OP_OR: "OP/OR (Operating Profit / Operating Revenue)",
    GROSS_PROFIT: "Gross Profit Margin",
    NET_PROFIT: "Net Profit Margin",
    BERRY_RATIO: "Berry Ratio (GP/OC)",
    RETURN_ON_ASSETS: "Return on Assets",
    RETURN_ON_CAPITAL: "Return on Capital Employed",
  };
  return labels[pliType] || pliType;
}

export function formatAmount(amount: number, currency: string = "INR"): string {
  if (currency === "INR") {
    // Indian number formatting (lakhs, crores)
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
