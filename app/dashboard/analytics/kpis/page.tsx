"use client";

import { useState } from "react";
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
  Target,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { useKpis, type KpiDefinition } from "@/lib/hooks";
import { useFirm } from "@/lib/hooks/use-firm";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "error"; icon: typeof CheckCircle }> = {
  healthy: { label: "Healthy", variant: "success", icon: CheckCircle },
  warning: { label: "Warning", variant: "warning", icon: AlertTriangle },
  critical: { label: "Critical", variant: "error", icon: AlertTriangle },
};

const categoryColors: Record<string, string> = {
  Customer: "bg-blue-500/10 text-blue-500",
  Operations: "bg-green-500/10 text-green-500",
  Revenue: "bg-purple-500/10 text-purple-500",
  Compliance: "bg-orange-500/10 text-orange-500",
  Financial: "bg-indigo-500/10 text-indigo-500",
  Other: "bg-gray-500/10 text-gray-500",
};

// Determine KPI status from current value and thresholds
function getKpiStatus(kpi: KpiDefinition): "healthy" | "warning" | "critical" {
  if (kpi.alertLevel) {
    return kpi.alertLevel === "normal" ? "healthy" : kpi.alertLevel;
  }
  const current = kpi.currentValue || 0;
  const critical = kpi.criticalThreshold;
  const warning = kpi.warningThreshold;

  if (critical !== null && current <= critical) return "critical";
  if (warning !== null && current <= warning) return "warning";
  return "healthy";
}

export default function KpisPage() {
  const { firmId } = useFirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch KPIs from API
  const { data, isLoading, error, refetch } = useKpis(firmId);

  const kpis = data?.kpis || [];

  // Filter KPIs locally
  const filteredKpis = kpis.filter((kpi) => {
    const matchesSearch =
      kpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kpi.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || kpi.category === categoryFilter;
    const status = getKpiStatus(kpi);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories from data
  const categories = [...new Set(kpis.map((k) => k.category))];

  // Calculate stats
  const activeCount = kpis.filter((k) => k.isActive).length;
  const healthyCount = kpis.filter((k) => getKpiStatus(k) === "healthy").length;
  const warningCount = kpis.filter((k) => getKpiStatus(k) === "warning").length;
  const alertsCount = kpis.filter((k) => k.alerts && k.alerts.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">KPI Tracker</h1>
          <p className="text-[var(--text-secondary)]">
            Monitor key performance indicators and set alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Define KPI
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
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
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {activeCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Active KPIs</p>
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
                    {healthyCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">On Track</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {warningCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Needs Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {alertsCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Active Alerts</p>
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
            placeholder="Search KPIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      {isLoading && <LoadingState message="Loading KPIs..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load KPIs"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* KPI Cards */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredKpis.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                  No KPIs found
                </p>
                <p className="text-[var(--text-secondary)]">
                  {kpis.length === 0
                    ? "Define your first KPI to start tracking"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredKpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Separate component for KPI card
function KpiCard({ kpi }: { kpi: KpiDefinition }) {
  const status = getKpiStatus(kpi);
  const StatusIcon = statusConfig[status].icon;
  const currentValue = kpi.currentValue || 0;
  const targetValue = kpi.targetValue || 100;
  const hasAlerts = kpi.alerts && kpi.alerts.length > 0;

  // Calculate trend direction
  const isUpTrend = kpi.trend === "up";
  const isDownTrend = kpi.trend === "down";

  // Calculate progress percentage
  const progressPercent = Math.min((currentValue / targetValue) * 100, 100);

  return (
    <Card className="hover:border-[var(--border-default)] transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{kpi.name}</CardTitle>
              {hasAlerts ? (
                <Bell className="h-4 w-4 text-[var(--accent)]" />
              ) : (
                <BellOff className="h-4 w-4 text-[var(--text-muted)]" />
              )}
            </div>
            <p className="text-sm text-[var(--text-muted)]">{kpi.description || "No description"}</p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Value Display */}
        <div className="mb-4">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[var(--text-primary)]">
              {currentValue.toLocaleString()}
            </span>
            <span className="mb-1 text-lg text-[var(--text-muted)]">{kpi.unit}</span>
            {kpi.trend && (
              <div className={`mb-1 flex items-center gap-1 text-sm ${
                isUpTrend ? "text-green-500" : isDownTrend ? "text-red-500" : "text-gray-500"
              }`}>
                {isUpTrend ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : isDownTrend ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
          {kpi.targetValue !== null && (
            <p className="text-sm text-[var(--text-muted)]">
              Target: {targetValue.toLocaleString()} {kpi.unit}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 rounded-full bg-[var(--bg-secondary)]">
            <div
              className={`h-2 rounded-full ${
                status === "healthy"
                  ? "bg-green-500"
                  : status === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            categoryColors[kpi.category] || categoryColors.Other
          }`}>
            {kpi.category}
          </span>
          <Badge variant={statusConfig[status].variant}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
