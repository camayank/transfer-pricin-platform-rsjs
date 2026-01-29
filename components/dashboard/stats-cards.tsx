"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "error";
}

function StatCard({ title, value, icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "text-[var(--accent)]",
    success: "text-[var(--success)]",
    warning: "text-[var(--warning)]",
    error: "text-[var(--error)]",
  };

  return (
    <Card className="hover:border-[var(--border-default)] transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {title}
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
              {value}
            </p>
            {trend && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                <span className={trend.value >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}>
                  {trend.value >= 0 ? "+" : ""}{trend.value}%
                </span>{" "}
                {trend.label}
              </p>
            )}
          </div>
          <div className={`rounded-lg bg-[var(--bg-card-hover)] p-3 ${variantStyles[variant]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Clients"
        value={24}
        icon={<Users className="h-5 w-5" />}
        trend={{ value: 12, label: "from last month" }}
      />
      <StatCard
        title="Filed"
        value={18}
        icon={<CheckCircle className="h-5 w-5" />}
        variant="success"
        trend={{ value: 8, label: "from last week" }}
      />
      <StatCard
        title="In Progress"
        value={4}
        icon={<Clock className="h-5 w-5" />}
        variant="warning"
      />
      <StatCard
        title="Overdue"
        value={2}
        icon={<AlertCircle className="h-5 w-5" />}
        variant="error"
      />
    </div>
  );
}
