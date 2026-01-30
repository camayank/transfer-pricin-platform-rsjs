"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  FileText,
  CheckSquare,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Target,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Building2,
  Briefcase,
} from "lucide-react";

interface StatusData {
  summary: {
    totalWorkItems: number;
    requiresAttention: number;
    totalPipelineValue: number;
    totalWonValue: number;
  };
  leads: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    proposalSent: number;
    negotiation: number;
    won: number;
    lost: number;
    pipelineValue: number;
    wonValue: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  engagements: {
    total: number;
    notStarted: number;
    inProgress: number;
    review: number;
    approved: number;
    filed: number;
    completed: number;
    overdue: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    blocked: number;
    done: number;
    overdue: number;
    critical: number;
    high: number;
  };
  upsell: {
    total: number;
    identified: number;
    qualified: number;
    proposalSent: number;
    negotiation: number;
    won: number;
    lost: number;
    pipelineValue: number;
    wonValue: number;
  };
  feedback: {
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    pendingFollowUp: number;
    complaints: number;
  };
}

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(1)} L`;
  }
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export default function StatusDashboardPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/status");
      if (!response.ok) {
        throw new Error("Failed to fetch status data");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium text-[var(--error)]">{error || "No data available"}</p>
        <Button variant="outline" className="mt-4" onClick={fetchData}>
          Try Again
        </Button>
      </div>
    );
  }

  const leadConversionRate = data.leads.total > 0
    ? ((data.leads.won / data.leads.total) * 100).toFixed(1)
    : "0";

  const taskCompletionRate = data.tasks.total > 0
    ? ((data.tasks.done / data.tasks.total) * 100).toFixed(1)
    : "0";

  const engagementCompletionRate = data.engagements.total > 0
    ? (((data.engagements.filed + data.engagements.completed) / data.engagements.total) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Status Dashboard</h1>
          <p className="text-[var(--text-secondary)]">
            Unified overview of all work items and activities
          </p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {data.summary.totalWorkItems}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Work Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={data.summary.requiresAttention > 0 ? "border-[var(--warning)]" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {data.summary.requiresAttention}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Requires Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(data.summary.totalPipelineValue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Pipeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(data.summary.totalWonValue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Won Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Leads */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-[var(--accent)]" />
                Sales Leads
              </CardTitle>
              <Link href="/dashboard/sales/leads">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Leads</span>
              <span className="font-semibold">{data.leads.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Conversion Rate</span>
                <span className="font-medium">{leadConversionRate}%</span>
              </div>
              <Progress value={parseFloat(leadConversionRate)} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--text-primary)]">{data.leads.new}</p>
                <p className="text-xs text-[var(--text-muted)]">New</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--accent)]">{data.leads.qualified + data.leads.proposalSent + data.leads.negotiation}</p>
                <p className="text-xs text-[var(--text-muted)]">In Pipeline</p>
              </div>
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--success)]">{data.leads.won}</p>
                <p className="text-xs text-[var(--text-muted)]">Won</p>
              </div>
              <div className="rounded-lg bg-[var(--error-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--error)]">{data.leads.lost}</p>
                <p className="text-xs text-[var(--text-muted)]">Lost</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Pipeline Value</span>
                <span className="font-semibold text-[var(--accent)]">{formatCurrency(data.leads.pipelineValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-[var(--accent)]" />
                Clients
              </CardTitle>
              <Link href="/dashboard/clients">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Clients</span>
              <span className="font-semibold">{data.clients.total}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg bg-[var(--success-bg)] p-3 text-center">
                <p className="text-2xl font-semibold text-[var(--success)]">{data.clients.active}</p>
                <p className="text-sm text-[var(--text-muted)]">Active</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-secondary)] p-3 text-center">
                <p className="text-2xl font-semibold text-[var(--text-secondary)]">{data.clients.inactive}</p>
                <p className="text-sm text-[var(--text-muted)]">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagements */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-[var(--accent)]" />
                Engagements
              </CardTitle>
              <Link href="/dashboard/clients">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Engagements</span>
              <span className="font-semibold">{data.engagements.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Completion Rate</span>
                <span className="font-medium">{engagementCompletionRate}%</span>
              </div>
              <Progress value={parseFloat(engagementCompletionRate)} className="h-2" />
            </div>
            {data.engagements.overdue > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-[var(--error-bg)] p-2">
                <Clock className="h-4 w-4 text-[var(--error)]" />
                <span className="text-sm font-medium text-[var(--error)]">{data.engagements.overdue} overdue</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-center">
                <p className="text-lg font-semibold">{data.engagements.notStarted}</p>
                <p className="text-xs text-[var(--text-muted)]">Not Started</p>
              </div>
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--warning)]">{data.engagements.inProgress}</p>
                <p className="text-xs text-[var(--text-muted)]">In Progress</p>
              </div>
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--success)]">{data.engagements.filed + data.engagements.completed}</p>
                <p className="text-xs text-[var(--text-muted)]">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckSquare className="h-5 w-5 text-[var(--accent)]" />
                Tasks
              </CardTitle>
              <Link href="/dashboard/projects/tasks">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Tasks</span>
              <span className="font-semibold">{data.tasks.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Completion Rate</span>
                <span className="font-medium">{taskCompletionRate}%</span>
              </div>
              <Progress value={parseFloat(taskCompletionRate)} className="h-2" />
            </div>
            <div className="flex gap-2">
              {data.tasks.critical > 0 && (
                <Badge variant="error">{data.tasks.critical} Critical</Badge>
              )}
              {data.tasks.blocked > 0 && (
                <Badge variant="warning">{data.tasks.blocked} Blocked</Badge>
              )}
              {data.tasks.overdue > 0 && (
                <Badge variant="error">{data.tasks.overdue} Overdue</Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-center">
                <p className="text-lg font-semibold">{data.tasks.todo}</p>
                <p className="text-xs text-[var(--text-muted)]">To Do</p>
              </div>
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--info)]">{data.tasks.inProgress}</p>
                <p className="text-xs text-[var(--text-muted)]">In Progress</p>
              </div>
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--warning)]">{data.tasks.review}</p>
                <p className="text-xs text-[var(--text-muted)]">Review</p>
              </div>
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--success)]">{data.tasks.done}</p>
                <p className="text-xs text-[var(--text-muted)]">Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upsell Opportunities */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-5 w-5 text-[var(--accent)]" />
                Upsell Opportunities
              </CardTitle>
              <Link href="/dashboard/sales/upsell">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Opportunities</span>
              <span className="font-semibold">{data.upsell.total}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-center">
                <p className="text-lg font-semibold">{data.upsell.identified + data.upsell.qualified}</p>
                <p className="text-xs text-[var(--text-muted)]">Identified</p>
              </div>
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--warning)]">{data.upsell.proposalSent + data.upsell.negotiation}</p>
                <p className="text-xs text-[var(--text-muted)]">In Progress</p>
              </div>
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--success)]">{data.upsell.won}</p>
                <p className="text-xs text-[var(--text-muted)]">Won</p>
              </div>
              <div className="rounded-lg bg-[var(--error-bg)] p-2 text-center">
                <p className="text-lg font-semibold text-[var(--error)]">{data.upsell.lost}</p>
                <p className="text-xs text-[var(--text-muted)]">Lost</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Pipeline Value</span>
                <span className="font-semibold text-[var(--accent)]">{formatCurrency(data.upsell.pipelineValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5 text-[var(--accent)]" />
                Customer Feedback
              </CardTitle>
              <Link href="/dashboard/sales/feedback">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Feedback</span>
              <span className="font-semibold">{data.feedback.total}</span>
            </div>
            <div className="flex gap-2">
              {data.feedback.pendingFollowUp > 0 && (
                <Badge variant="warning">{data.feedback.pendingFollowUp} Pending Follow-up</Badge>
              )}
              {data.feedback.complaints > 0 && (
                <Badge variant="error">{data.feedback.complaints} Complaints</Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-[var(--success)]" />
                  <p className="text-lg font-semibold text-[var(--success)]">{data.feedback.positive}</p>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Positive</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-center">
                <p className="text-lg font-semibold">{data.feedback.neutral}</p>
                <p className="text-xs text-[var(--text-muted)]">Neutral</p>
              </div>
              <div className="rounded-lg bg-[var(--error-bg)] p-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ThumbsDown className="h-4 w-4 text-[var(--error)]" />
                  <p className="text-lg font-semibold text-[var(--error)]">{data.feedback.negative}</p>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Negative</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
