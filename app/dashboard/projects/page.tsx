"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  ChevronRight,
  Target,
  TrendingUp,
} from "lucide-react";
import { useProjects, type Project } from "@/lib/hooks";
import { useFirm } from "@/lib/hooks/use-firm";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error"; color: string }> = {
  NOT_STARTED: { label: "Not Started", variant: "secondary", color: "bg-gray-500" },
  IN_PROGRESS: { label: "In Progress", variant: "info", color: "bg-blue-500" },
  ON_TRACK: { label: "On Track", variant: "success", color: "bg-green-500" },
  AT_RISK: { label: "At Risk", variant: "error", color: "bg-red-500" },
  COMPLETED: { label: "Completed", variant: "success", color: "bg-green-600" },
};

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "N/A";
  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(1)} L`;
  }
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const { firmId } = useFirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch projects from API
  const { data, isLoading, error, refetch } = useProjects({
    firmId,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const projects = data?.projects || [];

  // Local search filter (API handles status filter)
  const filteredProjects = searchQuery
    ? projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  // Calculate stats from live data
  const totalProjects = projects.length;
  const onTrackCount = projects.filter(
    (p) => p.status === "ON_TRACK" || p.status === "COMPLETED"
  ).length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetAmount || 0), 0);
  const overdueTasks = projects.reduce(
    (sum, p) => sum + (p.metrics?.totalTasks || 0) - (p.metrics?.completedTasks || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Projects</h1>
          <p className="text-[var(--text-secondary)]">
            Manage client engagements and track progress
          </p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          New Project
        </Button>
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
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {totalProjects}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Active Projects</p>
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
                    {onTrackCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">On Track</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--error-bg)] p-2 text-[var(--error)]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {overdueTasks}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {formatCurrency(totalBudget)}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Total Budget</p>
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
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      {isLoading && <LoadingState message="Loading projects..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load projects"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Project List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                  No projects found
                </p>
                <p className="text-[var(--text-secondary)]">
                  {projects.length === 0
                    ? "Create your first project to get started"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Separate component for project card
function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig[project.status] || {
    label: project.status,
    variant: "secondary" as const,
    color: "bg-gray-500",
  };
  const progress = project.metrics?.progressPercentage || 0;
  const totalTasks = project.metrics?.totalTasks || 0;
  const completedTasks = project.metrics?.completedTasks || 0;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <Card className="hover:border-[var(--border-default)] transition-colors">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-1 rounded-full ${status.color}`} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[var(--text-primary)]">{project.name}</h3>
                <Badge variant={status.variant}>
                  {status.label}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <span>{project.client?.name || "No Client"}</span>
                <span className="text-[var(--border-default)]">|</span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {project.projectManager?.name || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Progress */}
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {progress}%
              </p>
              <div className="mt-1 h-2 w-24 rounded-full bg-[var(--bg-secondary)]">
                <div
                  className={`h-2 rounded-full ${status.color}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {completedTasks}/{totalTasks}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Tasks</p>
            </div>

            {/* Budget */}
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--accent)]">
                {formatCurrency(project.budgetAmount)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {project.budgetCurrency || "INR"}
              </p>
            </div>

            <Link href={`/dashboard/projects/${project.id}`}>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2">
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </span>
            {pendingTasks > 0 && (
              <span className="flex items-center gap-1 text-[var(--warning)]">
                <Clock className="h-4 w-4" />
                {pendingTasks} pending
              </span>
            )}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {project.projectCode}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
