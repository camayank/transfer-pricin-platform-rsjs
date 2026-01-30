"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  Clock,
  RefreshCw,
  Sparkles,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";

// Sample AI insights
const sampleInsights = [
  {
    id: "1",
    category: "CHURN_RISK",
    title: "High Churn Risk Detected",
    description: "Auto Parts Manufacturing shows declining engagement metrics and late payments. Historical pattern suggests 65% churn probability in next 90 days.",
    severity: "HIGH",
    confidence: 78,
    affectedEntity: "Auto Parts Manufacturing",
    recommendation: "Schedule executive call and review service delivery issues. Consider offering retention incentives.",
    createdAt: "2025-01-30T08:00:00Z",
    status: "NEW",
  },
  {
    id: "2",
    category: "REVENUE_OPPORTUNITY",
    title: "Upsell Opportunity Identified",
    description: "TechCorp India Pvt Ltd has high engagement and is expanding operations. Analysis suggests 85% likelihood of accepting APA filing service.",
    severity: "MEDIUM",
    confidence: 85,
    affectedEntity: "TechCorp India Pvt Ltd",
    recommendation: "Prepare APA service proposal and schedule discussion during next client meeting.",
    createdAt: "2025-01-29T14:00:00Z",
    status: "REVIEWED",
  },
  {
    id: "3",
    category: "COMPLIANCE_RISK",
    title: "Deadline Risk Alert",
    description: "3 clients have Form 3CEB filings due in the next 14 days with incomplete documentation. Current completion rate below threshold.",
    severity: "HIGH",
    confidence: 92,
    affectedEntity: "Multiple Clients",
    recommendation: "Prioritize data collection and escalate to team leads for resource allocation.",
    createdAt: "2025-01-30T06:00:00Z",
    status: "NEW",
  },
  {
    id: "4",
    category: "EFFICIENCY",
    title: "Process Optimization Insight",
    description: "Benchmarking analysis tasks take 40% longer than average. Pattern analysis suggests template improvements could save 12 hours per engagement.",
    severity: "LOW",
    confidence: 72,
    affectedEntity: "Benchmarking Process",
    recommendation: "Review and update benchmarking templates. Consider automation for data extraction.",
    createdAt: "2025-01-28T10:00:00Z",
    status: "IMPLEMENTED",
  },
  {
    id: "5",
    category: "MARKET_TREND",
    title: "Industry Trend Alert",
    description: "Increased regulatory scrutiny in IT Services sector. 15% increase in TP documentation requirements expected in next quarter.",
    severity: "MEDIUM",
    confidence: 68,
    affectedEntity: "IT Services Clients",
    recommendation: "Proactively reach out to IT sector clients about enhanced documentation needs.",
    createdAt: "2025-01-27T12:00:00Z",
    status: "REVIEWED",
  },
];

const categoryConfig: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  CHURN_RISK: { label: "Churn Risk", icon: TrendingDown, color: "text-red-500" },
  REVENUE_OPPORTUNITY: { label: "Revenue Opportunity", icon: DollarSign, color: "text-green-500" },
  COMPLIANCE_RISK: { label: "Compliance Risk", icon: AlertTriangle, color: "text-orange-500" },
  EFFICIENCY: { label: "Efficiency", icon: Zap, color: "text-blue-500" },
  MARKET_TREND: { label: "Market Trend", icon: BarChart3, color: "text-purple-500" },
};

const severityConfig: Record<string, { label: string; variant: "secondary" | "warning" | "error" }> = {
  LOW: { label: "Low", variant: "secondary" },
  MEDIUM: { label: "Medium", variant: "warning" },
  HIGH: { label: "High", variant: "error" },
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "success" }> = {
  NEW: { label: "New", variant: "info" },
  REVIEWED: { label: "Reviewed", variant: "secondary" },
  IMPLEMENTED: { label: "Implemented", variant: "success" },
};

export default function AIInsightsPage() {
  const [filter, setFilter] = useState<string>("all");

  const filteredInsights = filter === "all"
    ? sampleInsights
    : sampleInsights.filter((i) => i.category === filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">AI Insights</h1>
          <p className="text-[var(--text-secondary)]">
            Machine learning powered business intelligence
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleInsights.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Active Insights</p>
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
                  {sampleInsights.filter((i) => i.severity === "HIGH").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleInsights.filter((i) => i.category === "REVENUE_OPPORTUNITY").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Opportunities</p>
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
                  {Math.round(sampleInsights.reduce((sum, i) => sum + i.confidence, 0) / sampleInsights.length)}%
                </p>
                <p className="text-sm text-[var(--text-muted)]">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {Object.entries(categoryConfig).map(([key, { label, icon: Icon, color }]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            <Icon className={`mr-1 h-4 w-4 ${filter !== key ? color : ""}`} />
            {label}
          </Button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => {
          const CategoryIcon = categoryConfig[insight.category].icon;
          return (
            <Card key={insight.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg bg-[var(--bg-secondary)] p-3 ${categoryConfig[insight.category].color}`}>
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">{insight.title}</h3>
                          <Badge variant={severityConfig[insight.severity].variant}>
                            {severityConfig[insight.severity].label}
                          </Badge>
                          <Badge variant={statusConfig[insight.status].variant}>
                            {statusConfig[insight.status].label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {insight.description}
                        </p>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">
                          Affected: <span className="text-[var(--text-primary)]">{insight.affectedEntity}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Brain className="h-4 w-4 text-[var(--accent)]" />
                          <span className="font-medium text-[var(--accent)]">{insight.confidence}%</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">confidence</p>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-3">
                      <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                        AI Recommendation
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">
                        {insight.recommendation}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <Button size="sm">Take Action</Button>
                      <Button size="sm" variant="outline">Dismiss</Button>
                      <Button size="sm" variant="ghost">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
