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
  FileText,
  Plus,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Table,
  Play,
  Clock,
  MoreHorizontal,
  Calendar,
  Download,
} from "lucide-react";

// Sample report data
const sampleReports = [
  {
    id: "1",
    name: "Monthly Client Engagement Report",
    description: "Track client engagement metrics across all services",
    reportType: "TABLE",
    dataSource: "clients",
    createdAt: "2025-01-15",
    lastRun: "2025-01-29",
    runCount: 24,
    isScheduled: true,
    scheduleFrequency: "weekly",
  },
  {
    id: "2",
    name: "RPT Value Analysis",
    description: "Related party transaction values by industry and region",
    reportType: "CHART",
    dataSource: "transactions",
    createdAt: "2025-01-10",
    lastRun: "2025-01-28",
    runCount: 12,
    isScheduled: false,
    scheduleFrequency: null,
  },
  {
    id: "3",
    name: "Compliance Status Dashboard",
    description: "Overview of filing status across all clients",
    reportType: "PIVOT",
    dataSource: "engagements",
    createdAt: "2025-01-05",
    lastRun: "2025-01-30",
    runCount: 45,
    isScheduled: true,
    scheduleFrequency: "daily",
  },
  {
    id: "4",
    name: "Team Productivity Report",
    description: "Team member workload and task completion rates",
    reportType: "TABLE",
    dataSource: "tasks",
    createdAt: "2024-12-20",
    lastRun: "2025-01-25",
    runCount: 8,
    isScheduled: true,
    scheduleFrequency: "monthly",
  },
];

const reportTypeConfig: Record<string, { label: string; icon: typeof BarChart3; color: string }> = {
  TABLE: { label: "Table", icon: Table, color: "text-blue-500" },
  CHART: { label: "Chart", icon: BarChart3, color: "text-green-500" },
  PIVOT: { label: "Pivot", icon: PieChart, color: "text-purple-500" },
};

const frequencyConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" }> = {
  daily: { label: "Daily", variant: "info" },
  weekly: { label: "Weekly", variant: "warning" },
  monthly: { label: "Monthly", variant: "secondary" },
};

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredReports = sampleReports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || report.reportType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Custom Reports</h1>
          <p className="text-[var(--text-secondary)]">
            Build and schedule custom reports for your data
          </p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Create Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleReports.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleReports.filter((r) => r.isScheduled).length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Scheduled</p>
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
                  {sampleReports.reduce((sum, r) => sum + r.runCount, 0)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleReports.filter((r) => r.reportType === "CHART").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Chart Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(reportTypeConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredReports.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No reports found
              </p>
              <p className="text-[var(--text-secondary)]">
                Create your first custom report
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => {
            const TypeIcon = reportTypeConfig[report.reportType].icon;
            return (
              <Card key={report.id} className="hover:border-[var(--border-default)] transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg bg-[var(--bg-secondary)] p-2 ${reportTypeConfig[report.reportType].color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                        <p className="text-sm text-[var(--text-muted)]">{report.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Last run: {report.lastRun}
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {report.runCount} runs
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.isScheduled && report.scheduleFrequency && (
                        <Badge variant={frequencyConfig[report.scheduleFrequency].variant}>
                          {frequencyConfig[report.scheduleFrequency].label}
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Play className="mr-1 h-3 w-3" />
                        Run
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
