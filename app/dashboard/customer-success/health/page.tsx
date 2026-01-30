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
  Heart,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Building2,
  Activity,
  Zap,
  Loader2,
} from "lucide-react";
import {
  useHealthScores,
  useRecalculateHealthScores,
  type CustomerHealthScore,
} from "@/lib/hooks";
import { useFirm } from "@/lib/hooks/use-firm";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const riskConfig: Record<string, { label: string; variant: "success" | "warning" | "error"; color: string }> = {
  LOW: { label: "Low Risk", variant: "success", color: "text-green-500" },
  MEDIUM: { label: "Medium Risk", variant: "warning", color: "text-yellow-500" },
  HIGH: { label: "High Risk", variant: "error", color: "text-red-500" },
  CRITICAL: { label: "Critical", variant: "error", color: "text-red-600" },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export default function HealthDashboardPage() {
  const { firmId } = useFirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Fetch health scores from API
  const { data, isLoading, error, refetch } = useHealthScores({
    firmId,
    riskLevel: riskFilter !== "all" ? riskFilter : undefined,
  });
  const recalculateMutation = useRecalculateHealthScores();

  const healthScores = data?.healthScores || [];
  const summary = data?.summary || { total: 0, atRisk: 0, healthy: 0, averageScore: 0 };

  // Local search filter
  const filteredScores = searchQuery
    ? healthScores.filter(
        (score) =>
          score.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          score.client?.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : healthScores;

  // Calculate stats from live data
  const avgScore = summary.averageScore || 0;
  const healthyCount = healthScores.filter((s) => s.riskLevel.toLowerCase() === "low").length;
  const mediumCount = healthScores.filter((s) => s.riskLevel.toLowerCase() === "medium").length;
  const criticalCount = healthScores.filter(
    (s) => s.riskLevel.toLowerCase() === "high" || s.riskLevel.toLowerCase() === "critical"
  ).length;

  // Handle recalculate
  const handleRecalculate = () => {
    recalculateMutation.mutate(
      { firmId },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Customer Health Dashboard</h1>
          <p className="text-[var(--text-secondary)]">
            Monitor client health scores and identify at-risk accounts
          </p>
        </div>
        <Button onClick={handleRecalculate} disabled={recalculateMutation.isPending}>
          {recalculateMutation.isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-4 w-4" />
          )}
          Recalculate All
        </Button>
      </div>

      {/* Summary Stats */}
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
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">{Math.round(avgScore)}</p>
                  <p className="text-sm text-[var(--text-muted)]">Avg Health Score</p>
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
                  <p className="text-sm text-[var(--text-muted)]">Healthy</p>
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
                    {mediumCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--error-bg)] p-2 text-[var(--error)]">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {criticalCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {summary.total}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Total Clients</p>
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
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            {Object.entries(riskConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading health scores..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load health scores"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Health Score Cards */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredScores.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                  No clients found
                </p>
                <p className="text-[var(--text-secondary)]">
                  {healthScores.length === 0
                    ? "Health scores will appear once clients are added"
                    : "Adjust your filters to see client health scores"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredScores.map((score) => (
              <HealthScoreCard key={score.id} score={score} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Separate component for health score card
function HealthScoreCard({ score }: { score: CustomerHealthScore }) {
  const risk = riskConfig[score.riskLevel.toUpperCase()] || {
    label: score.riskLevel,
    variant: "secondary" as const,
    color: "text-gray-500",
  };

  return (
    <Card className="hover:border-[var(--border-default)] transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Client Info */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
              <Building2 className="h-6 w-6 text-[var(--text-muted)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[var(--text-primary)]">
                  {score.client?.name || `Client ${score.clientId}`}
                </h3>
                <Badge variant={risk.variant}>
                  {risk.label}
                </Badge>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {score.client?.industry || "Industry not specified"}
              </p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
              {Math.round(score.overallScore)}
            </div>
            <p className="text-sm text-[var(--text-muted)]">Health Score</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-6 grid grid-cols-5 gap-4">
          {[
            { label: "Engagement", value: score.engagementScore },
            { label: "Compliance", value: score.complianceScore },
            { label: "Payment", value: score.paymentScore },
            { label: "Support", value: score.supportScore },
            { label: "Usage", value: score.usageScore },
          ].map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="h-2 w-full max-w-[80px] rounded-full bg-[var(--bg-secondary)]">
                  <div
                    className={`h-2 rounded-full ${getScoreBgColor(metric.value)}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
              <p className={`text-lg font-semibold ${getScoreColor(metric.value)}`}>
                {Math.round(metric.value)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        {score.aiRecommendations && score.aiRecommendations.length > 0 && (
          <div className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
              AI Recommendations
            </p>
            <div className="flex flex-wrap gap-2">
              {score.aiRecommendations.map((rec, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-[var(--accent-glow)] px-3 py-1 text-xs text-[var(--accent)]"
                >
                  {rec}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
