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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Calendar,
  MoreHorizontal,
  AlertTriangle,
  Eye,
  Play,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useDataRequests,
  useCreateDataRequest,
  useUpdateDataRequest,
  type DataDeletionRequest,
} from "@/lib/hooks";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const requestTypeConfig: Record<string, { label: string; icon: typeof Trash2 }> = {
  ERASURE: { label: "Deletion (Right to Erasure)", icon: Trash2 },
  PORTABILITY: { label: "Export (Data Portability)", icon: Download },
  ACCESS: { label: "Access Request", icon: Eye },
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error" }> = {
  PENDING_VERIFICATION: { label: "Pending Verification", variant: "warning" },
  VERIFIED: { label: "Verified", variant: "info" },
  PROCESSING: { label: "Processing", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "error" },
};

const scopeOptions = [
  { id: "personal_data", label: "Personal Data" },
  { id: "activity_logs", label: "Activity Logs" },
  { id: "documents", label: "Documents" },
  { id: "communications", label: "Communications" },
  { id: "financial_data", label: "Financial Data" },
  { id: "all_data", label: "All Data" },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(createdAt: string): number {
  const created = new Date(createdAt);
  const dueDate = new Date(created);
  dueDate.setDate(dueDate.getDate() + 30); // 30 days compliance window
  const now = new Date();
  return Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DataRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const limit = 20;

  // Form state for creating new request
  const [newRequest, setNewRequest] = useState({
    subjectEmail: "",
    subjectName: "",
    requestType: "ERASURE",
    scope: [] as string[],
  });

  // API hooks
  const { data, isLoading, error, refetch } = useDataRequests({
    status: statusFilter !== "all" ? statusFilter : undefined,
    requestType: typeFilter !== "all" ? typeFilter : undefined,
    page,
    limit,
  });

  const createRequest = useCreateDataRequest();
  const updateRequest = useUpdateDataRequest();

  const handleCreateRequest = () => {
    if (!newRequest.subjectEmail || newRequest.scope.length === 0) {
      alert("Email and scope are required");
      return;
    }

    createRequest.mutate(newRequest, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewRequest({
          subjectEmail: "",
          subjectName: "",
          requestType: "ERASURE",
          scope: [],
        });
      },
      onError: (err) => {
        alert(`Failed to create request: ${err.message}`);
      },
    });
  };

  const handleAction = (id: string, action: string, data?: Record<string, unknown>) => {
    updateRequest.mutate(
      { id, action, data },
      {
        onError: (err) => {
          alert(`Failed to update request: ${err.message}`);
        },
      }
    );
  };

  const requests = data?.requests || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  // Filter locally for search
  const filteredRequests = searchQuery
    ? requests.filter(
        (request) =>
          request.subjectEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.subjectName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          request.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : requests;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Data Subject Requests</h1>
          <p className="text-[var(--text-secondary)]">
            DPDP Act & GDPR data subject rights management
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Data Subject Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subjectEmail">Subject Email *</Label>
                <Input
                  id="subjectEmail"
                  type="email"
                  value={newRequest.subjectEmail}
                  onChange={(e) => setNewRequest({ ...newRequest, subjectEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  value={newRequest.subjectName}
                  onChange={(e) => setNewRequest({ ...newRequest, subjectName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                <Select
                  value={newRequest.requestType}
                  onValueChange={(v) => setNewRequest({ ...newRequest, requestType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(requestTypeConfig).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Scope *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {scopeOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={newRequest.scope.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewRequest({ ...newRequest, scope: [...newRequest.scope, option.id] });
                          } else {
                            setNewRequest({
                              ...newRequest,
                              scope: newRequest.scope.filter((s) => s !== option.id),
                            });
                          }
                        }}
                      />
                      <label htmlFor={option.id} className="text-sm text-[var(--text-secondary)]">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRequest} disabled={createRequest.isPending}>
                  {createRequest.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Create Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-5">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.total || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.pendingVerification || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {(stats?.verified || 0) + (stats?.processing || 0)}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">In Progress</p>
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
                    {stats?.completed || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--error-bg)] p-2 text-[var(--error)]">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {requests.filter((r) => r.requestType === "ERASURE").length}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Deletion Requests</p>
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
            placeholder="Search by email, name, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Request Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(requestTypeConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label.split(" ")[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading data requests..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load data requests"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Request List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                  No requests found
                </p>
                <p className="text-[var(--text-secondary)]">
                  {requests.length === 0
                    ? "No data requests have been submitted yet"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const daysRemaining = getDaysRemaining(request.createdAt);
              const TypeIcon = requestTypeConfig[request.requestType]?.icon || FileText;
              const scope = request.scope as unknown as string[];

              return (
                <Card key={request.id} className="hover:border-[var(--border-default)] transition-colors">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
                          <TypeIcon className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-[var(--text-muted)]">
                              {request.id.slice(0, 8)}
                            </span>
                            <Badge variant={statusConfig[request.status]?.variant || "secondary"}>
                              {statusConfig[request.status]?.label || request.status}
                            </Badge>
                          </div>
                          <h3 className="mt-1 font-medium text-[var(--text-primary)]">
                            {request.subjectName || "Unknown"}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Mail className="h-4 w-4" />
                            {request.subjectEmail}
                          </div>
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {requestTypeConfig[request.requestType]?.label || request.requestType}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-6">
                        {/* Due Date */}
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                            <span className="text-[var(--text-muted)]">
                              Submitted: {formatDate(request.createdAt)}
                            </span>
                          </div>
                          {daysRemaining <= 7 && request.status !== "COMPLETED" && request.status !== "REJECTED" && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                              <AlertTriangle className="h-3 w-3" />
                              {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Overdue"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2">
                      <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                        <span>Scope: {Array.isArray(scope) ? scope.join(", ") : "N/A"}</span>
                        {request.verifiedAt && (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            Verified
                          </span>
                        )}
                        {request.rejectionReason && (
                          <span className="text-red-500">
                            Reason: {request.rejectionReason}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "PENDING_VERIFICATION" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(request.id, "verify")}
                              disabled={updateRequest.isPending}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verify Manually
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500"
                              onClick={() => {
                                const reason = prompt("Rejection reason:");
                                if (reason) {
                                  handleAction(request.id, "reject", { rejectionReason: reason });
                                }
                              }}
                              disabled={updateRequest.isPending}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === "VERIFIED" && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(request.id, "start_processing")}
                            disabled={updateRequest.isPending}
                          >
                            <Play className="mr-1 h-3 w-3" />
                            Start Processing
                          </Button>
                        )}
                        {request.status === "PROCESSING" && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(request.id, "complete")}
                            disabled={updateRequest.isPending}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Mark Complete
                          </Button>
                        )}
                        {request.status === "COMPLETED" && request.exportPath && (
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-3 w-3" />
                            Download Export
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of{" "}
            {pagination.total} requests
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
