"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle } from "lucide-react";

interface Deadline {
  form: string;
  date: string;
  daysLeft: number;
  clients: number;
}

const upcomingDeadlines: Deadline[] = [
  {
    form: "Form 3CEB",
    date: "31 Oct 2025",
    daysLeft: 45,
    clients: 6,
  },
  {
    form: "Form 3CEAA",
    date: "30 Nov 2025",
    daysLeft: 75,
    clients: 3,
  },
  {
    form: "Form 3CEAD",
    date: "31 Mar 2026",
    daysLeft: 196,
    clients: 2,
  },
];

export function DeadlineWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-[var(--accent)]" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingDeadlines.map((deadline) => (
          <div
            key={deadline.form}
            className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-3"
          >
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {deadline.form}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{deadline.date}</p>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  deadline.daysLeft <= 30
                    ? "error"
                    : deadline.daysLeft <= 60
                    ? "warning"
                    : "secondary"
                }
              >
                {deadline.daysLeft <= 30 && (
                  <AlertTriangle className="mr-1 h-3 w-3" />
                )}
                {deadline.daysLeft} days
              </Badge>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {deadline.clients} clients pending
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
