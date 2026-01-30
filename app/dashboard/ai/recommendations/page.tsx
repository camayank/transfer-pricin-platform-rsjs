"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  useRecommendations,
  useDismissRecommendation,
  useActOnRecommendation,
  type AiRecommendation,
} from "@/lib/hooks";
import { useFirm } from "@/lib/hooks/use-firm";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "success" | "error" }> = {
  ACTIVE: { label: "Active", variant: "info" },
  active: { label: "Active", variant: "info" },
  ACTED: { label: "Acted", variant: "success" },
  acted: { label: "Acted", variant: "success" },
  DISMISSED: { label: "Dismissed", variant: "secondary" },
  dismissed: { label: "Dismissed", variant: "secondary" },
};

// Map recommendation types to display config
function getTypeConfig(type: string) {
  const config: Record<string, { label: string; icon: typeof Lightbulb; color: string }> = {
    TASK_SUGGESTION: { label: "Task", icon: CheckCircle, color: "text-blue-500" },
    EFFICIENCY_TIP: { label: "Efficiency", icon: Zap, color: "text-yellow-500" },
    CLIENT_OUTREACH: { label: "Outreach", icon: Users, color: "text-green-500" },
    RISK_MITIGATION: { label: "Risk", icon: Target, color: "text-red-500" },
    UPSELL: { label: "Upsell", icon: TrendingUp, color: "text-purple-500" },
    PROCESS_IMPROVEMENT: { label: "Process", icon: RefreshCw, color: "text-orange-500" },
  };
  return config[type] || { label: type, icon: Lightbulb, color: "text-gray-500" };
}

export default function RecommendationsPage() {
  const { firmId } = useFirm();
  const [filter, setFilter] = useState<"all" | "active" | "acted" | "dismissed">("all");

  // Fetch recommendations from API
  const { data, isLoading, error, refetch } = useRecommendations(firmId);
  const dismissMutation = useDismissRecommendation();
  const actMutation = useActOnRecommendation();

  const recommendations = data?.recommendations || [];

  const filteredRecommendations = filter === "all"
    ? recommendations
    : recommendations.filter((r) => r.status.toLowerCase() === filter);

  const activeCount = recommendations.filter((r) => r.status.toLowerCase() === "active").length;
  const actedCount = recommendations.filter((r) => r.status.toLowerCase() === "acted").length;
  const dismissedCount = recommendations.filter((r) => r.status.toLowerCase() === "dismissed").length;

  // Handle actions
  const handleAct = async (id: string) => {
    await actMutation.mutateAsync(id);
  };

  const handleDismiss = async (id: string) => {
    await dismissMutation.mutateAsync({ id });

  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">AI Recommendations</h1>
          <p className="text-[var(--text-secondary)]">
            Personalized next-best-action suggestions
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-4 w-4" />
          )}
          Refresh
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
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {recommendations.length}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {activeCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Active</p>
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
                    {actedCount}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Acted Upon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {recommendations.length > 0
                      ? Math.round((actedCount / recommendations.length) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Action Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--border-subtle)]">
        {[
          { key: "all", count: recommendations.length },
          { key: "active", count: activeCount },
          { key: "acted", count: actedCount },
          { key: "dismissed", count: dismissedCount },
        ].map(({ key, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`pb-3 text-sm font-medium capitalize transition-colors ${
              filter === key
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {key} ({count})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading recommendations..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load recommendations"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Recommendations List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lightbulb className="h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                  No recommendations
                </p>
                <p className="text-[var(--text-secondary)]">
                  {recommendations.length === 0
                    ? "AI recommendations will appear here when available"
                    : "No recommendations match the current filter"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAct={handleAct}
                onDismiss={handleDismiss}
                isActing={actMutation.isPending}
                isDismissing={dismissMutation.isPending}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Separate component for recommendation card
function RecommendationCard({
  recommendation: rec,
  onAct,
  onDismiss,
  isActing,
  isDismissing,
}: {
  recommendation: AiRecommendation;
  onAct: (id: string) => void;
  onDismiss: (id: string) => void;
  isActing: boolean;
  isDismissing: boolean;
}) {
  const typeConfig = getTypeConfig(rec.recommendationType);
  const TypeIcon = typeConfig.icon;
  const status = statusConfig[rec.status] || { label: rec.status, variant: "secondary" as const };
  const isActive = rec.status.toLowerCase() === "active";
  const isDismissed = rec.status.toLowerCase() === "dismissed";

  return (
    <Card className={`transition-colors hover:border-[var(--border-default)] ${
      isDismissed ? "opacity-60" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`rounded-lg bg-[var(--bg-secondary)] p-2 ${typeConfig.color}`}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[var(--text-primary)]">{rec.title}</h3>
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {rec.description}
                </p>
                {rec.entityType && (
                  <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span>{rec.entityType}: {rec.entityId || "N/A"}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-[var(--accent)]">{rec.confidence}%</p>
                <p className="text-xs text-[var(--text-muted)]">confidence</p>
              </div>
            </div>

            {/* Outcome for acted */}
            {rec.actedAt && (
              <div className="mt-3 rounded-lg bg-[var(--success-bg)] p-2 text-sm text-[var(--success)]">
                Acted on: {new Date(rec.actedAt).toLocaleDateString("en-IN")}
              </div>
            )}

            {/* Dismiss reason */}
            {rec.dismissReason && (
              <div className="mt-3 rounded-lg bg-[var(--bg-secondary)] p-2 text-sm text-[var(--text-muted)]">
                Dismissed: {rec.dismissReason}
              </div>
            )}

            {/* Actions */}
            {isActive && (
              <div className="mt-4 flex items-center gap-2">
                {rec.actionUrl ? (
                  <Link href={rec.actionUrl}>
                    <Button size="sm" onClick={() => onAct(rec.id)} disabled={isActing}>
                      {isActing ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          Take Action
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" onClick={() => onAct(rec.id)} disabled={isActing}>
                    {isActing ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        Mark as Done
                        <CheckCircle className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDismiss(rec.id)}
                  disabled={isDismissing}
                >
                  {isDismissing ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Dismiss
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
