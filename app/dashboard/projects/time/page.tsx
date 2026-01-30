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
  Clock,
  Plus,
  Search,
  Calendar,
  User,
  CheckCircle,
  DollarSign,
  Play,
  Pause,
  MoreHorizontal,
  Timer,
} from "lucide-react";

// Sample time entry data
const sampleTimeEntries = [
  {
    id: "1",
    date: "2025-01-30",
    projectName: "TechCorp TP Compliance 2025",
    taskName: "Collect financial statements from client",
    user: "Priya Sharma",
    hours: 2.5,
    description: "Reviewed and organized financial data received from client",
    billable: true,
    status: "APPROVED",
    rate: 5000,
  },
  {
    id: "2",
    date: "2025-01-30",
    projectName: "Pharma Solutions APA Filing",
    taskName: "Draft transfer pricing policy document",
    user: "Rahul Mehta",
    hours: 4,
    description: "Drafted sections on intangible transactions and DEMPE analysis",
    billable: true,
    status: "PENDING",
    rate: 6000,
  },
  {
    id: "3",
    date: "2025-01-29",
    projectName: "Auto Parts Benchmarking Study",
    taskName: "Comparable company search",
    user: "Amit Kumar",
    hours: 6,
    description: "Database searches in CapIQ and Orbis for comparable companies",
    billable: true,
    status: "APPROVED",
    rate: 4500,
  },
  {
    id: "4",
    date: "2025-01-29",
    projectName: "TechCorp TP Compliance 2025",
    taskName: "Internal team meeting",
    user: "Priya Sharma",
    hours: 1,
    description: "Weekly project status meeting",
    billable: false,
    status: "APPROVED",
    rate: 0,
  },
  {
    id: "5",
    date: "2025-01-28",
    projectName: "Pharma Solutions APA Filing",
    taskName: "Review Form 3CEB calculations",
    user: "Amit Kumar",
    hours: 3.5,
    description: "Validated TP calculations and cross-checked with source documents",
    billable: true,
    status: "REJECTED",
    rate: 4500,
  },
];

const statusConfig: Record<string, { label: string; variant: "secondary" | "success" | "warning" | "error" }> = {
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "error" },
};

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export default function TimeTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredEntries = sampleTimeEntries.filter((entry) => {
    const matchesSearch =
      entry.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = filteredEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);
  const totalRevenue = filteredEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours * e.rate, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Time Tracking</h1>
          <p className="text-[var(--text-secondary)]">
            Log and manage time entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Timer className="mr-1 h-4 w-4" />
            Start Timer
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Log Time
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {totalHours.toFixed(1)}h
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Hours</p>
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
                  {billableHours.toFixed(1)}h
                </p>
                <p className="text-sm text-[var(--text-muted)]">Billable Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Billable Value</p>
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
                  {filteredEntries.filter((e) => e.status === "PENDING").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Pending Approval</p>
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
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Entries */}
      <div className="space-y-2">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:border-[var(--border-default)] transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{entry.hours}</p>
                    <p className="text-xs text-[var(--text-muted)]">hours</p>
                  </div>
                  <div className="h-10 w-px bg-[var(--border-subtle)]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--text-primary)]">{entry.taskName}</h3>
                      <Badge variant={statusConfig[entry.status].variant}>
                        {statusConfig[entry.status].label}
                      </Badge>
                      {entry.billable && (
                        <Badge variant="info">Billable</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{entry.description}</p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                      <span>{entry.projectName}</span>
                      <span className="text-[var(--border-default)]">|</span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {entry.user}
                      </span>
                      <span className="text-[var(--border-default)]">|</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {entry.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {entry.billable && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--accent)]">
                        {formatCurrency(entry.hours * entry.rate)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        @ {formatCurrency(entry.rate)}/hr
                      </p>
                    </div>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
