"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";

// Compliance deadlines
const DEADLINES = [
  {
    id: "3ceb",
    form: "Form 3CEB",
    description: "Transfer Pricing Audit Report under Section 92E",
    dueDate: new Date(2025, 9, 31), // Oct 31, 2025
    penalty: "Rs. 1,00,000",
    clientsTotal: 24,
    clientsFiled: 18,
    clientsPending: 6,
  },
  {
    id: "3ceaa",
    form: "Form 3CEAA",
    description: "Master File as per Rule 10DA",
    dueDate: new Date(2025, 10, 30), // Nov 30, 2025
    penalty: "Rs. 5,00,000",
    clientsTotal: 8,
    clientsFiled: 2,
    clientsPending: 6,
  },
  {
    id: "3ceab",
    form: "Form 3CEAB",
    description: "Intimation for Master File",
    dueDate: new Date(2025, 10, 30), // Nov 30, 2025
    penalty: "Rs. 5,00,000",
    clientsTotal: 8,
    clientsFiled: 2,
    clientsPending: 6,
  },
  {
    id: "itr",
    form: "Income Tax Return",
    description: "For entities requiring TP audit",
    dueDate: new Date(2025, 10, 30), // Nov 30, 2025
    penalty: "Rs. 5,000 - Rs. 10,000 + interest",
    clientsTotal: 24,
    clientsFiled: 12,
    clientsPending: 12,
  },
  {
    id: "3cead",
    form: "Form 3CEAD",
    description: "Country-by-Country Report",
    dueDate: new Date(2026, 2, 31), // Mar 31, 2026
    penalty: "Rs. 5,000 - Rs. 15,000 per day",
    clientsTotal: 3,
    clientsFiled: 0,
    clientsPending: 3,
  },
];

// Client deadlines
const CLIENT_DEADLINES = [
  { client: "TechCorp India Pvt Ltd", form: "Form 3CEB", dueDate: new Date(2025, 9, 31), status: "pending", assignedTo: "Priya S." },
  { client: "Pharma Solutions Ltd", form: "Form 3CEB", dueDate: new Date(2025, 9, 31), status: "review", assignedTo: "Rahul M." },
  { client: "Global KPO Services", form: "Form 3CEB", dueDate: new Date(2025, 9, 31), status: "not_started", assignedTo: "Sneha R." },
  { client: "FinServ Holdings", form: "Form 3CEB", dueDate: new Date(2025, 9, 31), status: "in_progress", assignedTo: "Vikram P." },
  { client: "TechCorp India Pvt Ltd", form: "Form 3CEAA", dueDate: new Date(2025, 10, 30), status: "not_started", assignedTo: "Priya S." },
  { client: "Pharma Solutions Ltd", form: "Form 3CEAA", dueDate: new Date(2025, 10, 30), status: "not_started", assignedTo: "Rahul M." },
];

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = date.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const statusConfig: Record<string, { label: string; variant: "secondary" | "warning" | "info" | "success" | "error" }> = {
  not_started: { label: "Not Started", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "warning" },
  review: { label: "Review", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  filed: { label: "Filed", variant: "success" },
};

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const navigateMonth = (direction: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  // Get upcoming deadlines sorted by date
  const upcomingDeadlines = DEADLINES
    .filter((d) => getDaysUntil(d.dueDate) >= 0)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Compliance Calendar
          </h1>
          <p className="text-[var(--text-secondary)]">
            Track TP compliance deadlines and client filings
          </p>
        </div>
        <Button variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          Set Reminders
        </Button>
      </div>

      {/* Deadline Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {upcomingDeadlines.slice(0, 3).map((deadline) => {
          const daysLeft = getDaysUntil(deadline.dueDate);
          const progress = (deadline.clientsFiled / deadline.clientsTotal) * 100;

          return (
            <Card
              key={deadline.id}
              className={`${
                daysLeft <= 30
                  ? "border-[var(--error)]/50"
                  : daysLeft <= 60
                  ? "border-[var(--warning)]/50"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {deadline.form}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {deadline.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      daysLeft <= 30 ? "error" : daysLeft <= 60 ? "warning" : "secondary"
                    }
                  >
                    {daysLeft <= 0 ? "Overdue" : `${daysLeft} days`}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Progress</span>
                    <span className="text-[var(--text-primary)]">
                      {deadline.clientsFiled}/{deadline.clientsTotal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-[var(--text-muted)]">
                    <Calendar className="h-4 w-4" />
                    {formatDate(deadline.dueDate)}
                  </div>
                  <div className="flex items-center gap-1 text-[var(--warning)]">
                    <AlertTriangle className="h-4 w-4" />
                    {deadline.clientsPending} pending
                  </div>
                </div>

                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  Penalty: {deadline.penalty}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Calendar View and Client List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mini Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedMonth.toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <div key={day} className="py-2 text-[var(--text-muted)]">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const firstDay = new Date(
                  selectedMonth.getFullYear(),
                  selectedMonth.getMonth(),
                  1
                ).getDay();
                const daysInMonth = new Date(
                  selectedMonth.getFullYear(),
                  selectedMonth.getMonth() + 1,
                  0
                ).getDate();
                const day = i - firstDay + 1;
                const isValidDay = day > 0 && day <= daysInMonth;
                const date = new Date(
                  selectedMonth.getFullYear(),
                  selectedMonth.getMonth(),
                  day
                );
                const hasDeadline = DEADLINES.some(
                  (d) =>
                    d.dueDate.getDate() === day &&
                    d.dueDate.getMonth() === selectedMonth.getMonth() &&
                    d.dueDate.getFullYear() === selectedMonth.getFullYear()
                );
                const isToday =
                  day === new Date().getDate() &&
                  selectedMonth.getMonth() === new Date().getMonth() &&
                  selectedMonth.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={i}
                    className={`relative rounded py-2 ${
                      !isValidDay
                        ? "text-[var(--text-muted)]/30"
                        : isToday
                        ? "bg-[var(--accent)] text-white"
                        : hasDeadline
                        ? "bg-[var(--error-bg)] text-[var(--error)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    {isValidDay ? day : ""}
                    {hasDeadline && (
                      <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--error)]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                <span className="text-[var(--text-muted)]">Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-[var(--error)]" />
                <span className="text-[var(--text-muted)]">Deadline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Deadlines List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--accent)]" />
                Upcoming Client Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CLIENT_DEADLINES.sort(
                  (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
                ).map((item, idx) => {
                  const daysLeft = getDaysUntil(item.dueDate);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-lg p-2 ${
                            daysLeft <= 30
                              ? "bg-[var(--error-bg)] text-[var(--error)]"
                              : daysLeft <= 60
                              ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                              : "bg-[var(--info-bg)] text-[var(--info)]"
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {item.client}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {item.form} | {item.assignedTo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={statusConfig[item.status].variant}>
                          {statusConfig[item.status].label}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {formatDate(item.dueDate)}
                          </p>
                          <p
                            className={`text-xs ${
                              daysLeft <= 30
                                ? "text-[var(--error)]"
                                : daysLeft <= 60
                                ? "text-[var(--warning)]"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            {daysLeft} days left
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Deadlines Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Compliance Deadlines - AY 2025-26</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="py-3 text-left font-medium text-[var(--text-muted)]">Form</th>
                  <th className="py-3 text-left font-medium text-[var(--text-muted)]">Description</th>
                  <th className="py-3 text-left font-medium text-[var(--text-muted)]">Due Date</th>
                  <th className="py-3 text-left font-medium text-[var(--text-muted)]">Status</th>
                  <th className="py-3 text-left font-medium text-[var(--text-muted)]">Penalty</th>
                  <th className="py-3 text-right font-medium text-[var(--text-muted)]">Progress</th>
                </tr>
              </thead>
              <tbody>
                {DEADLINES.map((deadline) => {
                  const daysLeft = getDaysUntil(deadline.dueDate);
                  const progress = (deadline.clientsFiled / deadline.clientsTotal) * 100;

                  return (
                    <tr key={deadline.id} className="border-b border-[var(--border-subtle)]">
                      <td className="py-4 font-medium text-[var(--text-primary)]">
                        {deadline.form}
                      </td>
                      <td className="py-4 text-[var(--text-secondary)]">
                        {deadline.description}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                          {formatDate(deadline.dueDate)}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={
                            daysLeft <= 0
                              ? "error"
                              : daysLeft <= 30
                              ? "error"
                              : daysLeft <= 60
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {daysLeft <= 0 ? "Overdue" : `${daysLeft} days`}
                        </Badge>
                      </td>
                      <td className="py-4 text-[var(--text-secondary)]">{deadline.penalty}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[var(--text-primary)]">
                            {deadline.clientsFiled}/{deadline.clientsTotal}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
