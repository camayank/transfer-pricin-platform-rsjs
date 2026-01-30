"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertTriangle,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  AlertCircle,
  Calendar,
  MoreHorizontal,
  User,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useSecurityIncidents,
  useCreateIncident,
  useUpdateIncident,
  type SecurityIncident,
} from "@/lib/hooks";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const severityConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "error"; color: string }> = {
  LOW: { label: "Low", variant: "secondary", color: "bg-gray-500" },
  MEDIUM: { label: "Medium", variant: "warning", color: "bg-yellow-500" },
  HIGH: { label: "High", variant: "error", color: "bg-orange-500" },
  CRITICAL: { label: "Critical", variant: "error", color: "bg-red-600" },
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error" }> = {
  OPEN: { label: "Open", variant: "error" },
  INVESTIGATING: { label: "Investigating", variant: "warning" },
  CONTAINED: { label: "Contained", variant: "info" },
  ERADICATED: { label: "Eradicated", variant: "info" },
  RECOVERED: { label: "Recovered", variant: "success" },
  CLOSED: { label: "Closed", variant: "secondary" },
};

const categoryOptions = [
  { id: "ACCESS_CONTROL", label: "Access Control" },
  { id: "DATA_BREACH", label: "Data Breach" },
  { id: "PHISHING", label: "Phishing" },
  { id: "MALWARE", label: "Malware" },
  { id: "AVAILABILITY", label: "Availability" },
  { id: "UNAUTHORIZED_ACCESS", label: "Unauthorized Access" },
  { id: "OTHER", label: "Other" },
];

const categoryConfig: Record<string, string> = categoryOptions.reduce((acc, opt) => {
  acc[opt.id] = opt.label;
  return acc;
}, {} as Record<string, string>);

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const limit = 20;

  // Form state for creating new incident
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "MEDIUM",
    category: "OTHER",
  });

  // API hooks
  const { data, isLoading, error, refetch } = useSecurityIncidents({
    status: statusFilter !== "all" ? statusFilter : undefined,
    severity: severityFilter !== "all" ? severityFilter : undefined,
    page,
    limit,
  });

  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncident();

  const handleCreateIncident = () => {
    if (!newIncident.title || !newIncident.description) {
      alert("Title and description are required");
      return;
    }

    createIncident.mutate(newIncident, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewIncident({
          title: "",
          description: "",
          severity: "MEDIUM",
          category: "OTHER",
        });
      },
      onError: (err) => {
        alert(`Failed to create incident: ${err.message}`);
      },
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateIncident.mutate(
      { id, data: { status } },
      {
        onError: (err) => {
          alert(`Failed to update incident: ${err.message}`);
        },
      }
    );
  };

  const incidents = data?.incidents || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  // Filter locally for search
  const filteredIncidents = searchQuery
    ? incidents.filter(
        (incident) =>
          incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          incident.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : incidents;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Security Incidents</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage security incidents and responses
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Security Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="Brief incident title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Detailed description of the incident"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={newIncident.severity}
                    onValueChange={(v) => setNewIncident({ ...newIncident, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newIncident.category}
                    onValueChange={(v) => setNewIncident({ ...newIncident, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIncident} disabled={createIncident.isPending}>
                  {createIncident.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Report Incident
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
                <div className="rounded-lg bg-[var(--error-bg)] p-2 text-[var(--error)]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {(stats?.open || 0) + (stats?.investigating || 0)}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.critical || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Critical</p>
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
                    {stats?.investigating || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Investigating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.contained || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Contained</p>
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
                    {(stats?.recovered || 0) + (stats?.closed || 0)}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Resolved</p>
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
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {Object.entries(severityConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
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
      {isLoading && <LoadingState message="Loading incidents..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load incidents"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Incident List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                  No incidents found
                </p>
                <p className="text-[var(--text-secondary)]">
                  {incidents.length === 0
                    ? "No security incidents have been reported"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredIncidents.map((incident) => {
              const containmentSteps = incident.containmentSteps as string[] | null;

              return (
                <Card key={incident.id} className="hover:border-[var(--border-default)] transition-colors">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between p-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 h-3 w-3 rounded-full ${severityConfig[incident.severity]?.color || "bg-gray-500"}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-[var(--text-muted)]">
                              {incident.id.slice(0, 8)}
                            </span>
                            <h3 className="font-medium text-[var(--text-primary)]">
                              {incident.title}
                            </h3>
                            <Badge variant={severityConfig[incident.severity]?.variant || "secondary"}>
                              {severityConfig[incident.severity]?.label || incident.severity}
                            </Badge>
                            <Badge variant={statusConfig[incident.status]?.variant || "secondary"}>
                              {statusConfig[incident.status]?.label || incident.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {incident.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatTimestamp(incident.detectedAt)}
                            </span>
                            <span className="rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-xs">
                              {categoryConfig[incident.category] || incident.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Affected Systems & Actions */}
                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2">
                      <div className="flex items-center gap-4">
                        {containmentSteps && containmentSteps.length > 0 && (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">{containmentSteps.length} containment actions</span>
                          </div>
                        )}
                        {incident.externalNotified && (
                          <span className="text-xs text-[var(--info)]">External parties notified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        {incident.status === "OPEN" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(incident.id, "INVESTIGATING")}
                            disabled={updateIncident.isPending}
                          >
                            Start Investigation
                          </Button>
                        )}
                        {incident.status === "INVESTIGATING" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(incident.id, "CONTAINED")}
                            disabled={updateIncident.isPending}
                          >
                            Mark Contained
                          </Button>
                        )}
                        {incident.status === "CONTAINED" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(incident.id, "RECOVERED")}
                            disabled={updateIncident.isPending}
                          >
                            Mark Recovered
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
            {pagination.total} incidents
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
