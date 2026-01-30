"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Search,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Filter,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuditLogs, useVerifyAuditChain, type AuditLogEntry } from "@/lib/hooks";
import { useFirm } from "@/lib/hooks/use-firm";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

// Configuration for action badges
const actionConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error" }> = {
  CREATE: { label: "Create", variant: "success" },
  UPDATE: { label: "Update", variant: "info" },
  DELETE: { label: "Delete", variant: "error" },
  LOGIN: { label: "Login", variant: "secondary" },
  LOGOUT: { label: "Logout", variant: "secondary" },
  EXPORT: { label: "Export", variant: "warning" },
  VIEW: { label: "View", variant: "secondary" },
  DATA_EXPORT: { label: "Data Export", variant: "warning" },
  PASSWORD_CHANGE: { label: "Password", variant: "info" },
  ROLE_CHANGE: { label: "Role Change", variant: "warning" },
  PERMISSION_GRANT: { label: "Permission Grant", variant: "success" },
  PERMISSION_REVOKE: { label: "Permission Revoke", variant: "error" },
};

const entityTypeConfig: Record<string, string> = {
  CLIENT: "Client",
  ENGAGEMENT: "Engagement",
  DOCUMENT: "Document",
  USER: "User",
  SESSION: "Session",
  REPORT: "Report",
  SETTING: "Setting",
  FORM: "Form",
};

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogPage() {
  const { firmId } = useFirm();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch audit logs from API
  const { data, isLoading, error, refetch } = useAuditLogs({
    firmId,
    page,
    limit,
    action: actionFilter !== "all" ? actionFilter : undefined,
    entityType: entityFilter !== "all" ? entityFilter : undefined,
  });

  // Chain verification mutation
  const verifyChain = useVerifyAuditChain();

  // Handle verify chain click
  const handleVerifyChain = () => {
    verifyChain.mutate(
      { firmId },
      {
        onSuccess: (result) => {
          if (result.verification.isValid) {
            alert(`Chain verified successfully! ${result.verification.entriesChecked} entries checked.`);
          } else {
            alert(`Chain verification failed: ${result.verification.errorMessage}`);
          }
        },
        onError: (err) => {
          alert(`Verification failed: ${err.message}`);
        },
      }
    );
  };

  // Handle export click
  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/audit/export?firmId=${firmId}&format=csv`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export audit logs");
    }
  };

  // Filter logs locally for search (API handles action/entity filters)
  const logs = data?.logs || [];
  const filteredLogs = searchQuery
    ? logs.filter(
        (log) =>
          log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.entityId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const pagination = data?.pagination;

  // Calculate stats
  const totalEntries = pagination?.total || 0;
  const verifiedCount = logs.filter((l) => l.currentHash).length;
  const uniqueUsers = new Set(logs.filter((l) => l.userId).map((l) => l.userId)).size;
  const updateCount = logs.filter((l) => l.action === "UPDATE").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Audit Log</h1>
          <p className="text-[var(--text-secondary)]">
            Immutable audit trail with hash chain verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleVerifyChain}
            disabled={verifyChain.isPending}
          >
            {verifyChain.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-1 h-4 w-4" />
            )}
            Verify Chain
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {totalEntries.toLocaleString()}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {verifiedCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Verified (This Page)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {uniqueUsers}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {updateCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Changes (This Page)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search by entity or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {Object.entries(actionConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {Object.entries(entityTypeConfig).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading audit logs..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load audit logs"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Audit Log List */}
      {!isLoading && !error && (
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                  No audit entries found
                </p>
                <p className="text-[var(--text-secondary)]">
                  {logs.length === 0
                    ? "No audit entries have been recorded yet"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <AuditLogCard key={log.id} log={log} />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of{" "}
            {pagination.total} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-[var(--text-muted)]">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for audit log card
function AuditLogCard({ log }: { log: AuditLogEntry }) {
  const action = actionConfig[log.action] || { label: log.action, variant: "secondary" as const };
  const entityType = entityTypeConfig[log.entityType] || log.entityType;
  const changes = log.newValues || log.oldValues;

  return (
    <Card className="hover:border-[var(--border-default)] transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
              <User className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--text-primary)]">
                  {log.userId || "System"}
                </span>
                <Badge variant={action.variant}>
                  {action.label}
                </Badge>
                <span className="text-[var(--text-secondary)]">
                  {entityType}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span>{log.entityId || "N/A"}</span>
                {changes && Object.keys(changes).length > 0 && (
                  <>
                    <span className="text-[var(--border-default)]">|</span>
                    <span className="text-[var(--info)]">
                      {Object.keys(changes).slice(0, 3).join(", ")} changed
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-[var(--text-muted)]">
                <Clock className="h-4 w-4" />
                {formatTimestamp(log.createdAt)}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {log.ipAddress || "N/A"}
              </div>
            </div>
            <span title={log.currentHash ? "Hash verified" : "No hash"}>
              {log.currentHash ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </span>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
