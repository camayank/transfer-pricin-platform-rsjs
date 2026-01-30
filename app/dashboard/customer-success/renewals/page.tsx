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
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Phone,
  MoreHorizontal,
} from "lucide-react";

// Sample renewal data
const sampleRenewals = [
  {
    id: "1",
    clientId: "client-1",
    clientName: "TechCorp India Pvt Ltd",
    contractType: "ANNUAL",
    currentValue: 1200000,
    proposedValue: 1350000,
    renewalDate: "2025-03-15",
    daysUntilRenewal: 44,
    status: "NEGOTIATION",
    probability: 85,
    riskFactors: [],
    lastContact: "2025-01-28",
    assignedTo: "Priya S.",
  },
  {
    id: "2",
    clientId: "client-2",
    clientName: "Pharma Solutions Ltd",
    contractType: "ANNUAL",
    currentValue: 2400000,
    proposedValue: 2400000,
    renewalDate: "2025-02-28",
    daysUntilRenewal: 29,
    status: "IN_PROGRESS",
    probability: 70,
    riskFactors: ["Low engagement last quarter"],
    lastContact: "2025-01-25",
    assignedTo: "Rahul M.",
  },
  {
    id: "3",
    clientId: "client-3",
    clientName: "Auto Parts Manufacturing",
    contractType: "ANNUAL",
    currentValue: 800000,
    proposedValue: 800000,
    renewalDate: "2025-02-15",
    daysUntilRenewal: 16,
    status: "AT_RISK",
    probability: 35,
    riskFactors: ["Payment issues", "Low health score", "Competitor evaluation"],
    lastContact: "2025-01-20",
    assignedTo: "Amit K.",
  },
  {
    id: "4",
    clientId: "client-4",
    clientName: "Global KPO Services",
    contractType: "MULTI_YEAR",
    currentValue: 1800000,
    proposedValue: 2100000,
    renewalDate: "2025-06-01",
    daysUntilRenewal: 122,
    status: "UPCOMING",
    probability: 90,
    riskFactors: [],
    lastContact: "2025-01-15",
    assignedTo: "Sneha R.",
  },
  {
    id: "5",
    clientId: "client-5",
    clientName: "FinServ Holdings",
    contractType: "ANNUAL",
    currentValue: 3600000,
    proposedValue: 3960000,
    renewalDate: "2025-04-30",
    daysUntilRenewal: 90,
    status: "PROPOSAL",
    probability: 75,
    riskFactors: ["Budget constraints mentioned"],
    lastContact: "2025-01-26",
    assignedTo: "Vikram P.",
  },
];

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error" }> = {
  UPCOMING: { label: "Upcoming", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  PROPOSAL: { label: "Proposal Sent", variant: "info" },
  NEGOTIATION: { label: "Negotiation", variant: "warning" },
  AT_RISK: { label: "At Risk", variant: "error" },
  WON: { label: "Won", variant: "success" },
  LOST: { label: "Lost", variant: "error" },
};

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(1)} L`;
  }
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function getDaysColor(days: number): string {
  if (days <= 14) return "text-red-500";
  if (days <= 30) return "text-yellow-500";
  return "text-green-500";
}

export default function RenewalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRenewals = sampleRenewals.filter((renewal) => {
    const matchesSearch =
      renewal.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || renewal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPipeline = sampleRenewals.reduce((sum, r) => sum + r.proposedValue, 0);
  const atRiskValue = sampleRenewals
    .filter((r) => r.status === "AT_RISK")
    .reduce((sum, r) => sum + r.proposedValue, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Renewal Pipeline</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage upcoming contract renewals
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-1 h-4 w-4" />
          Sync Renewals
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(totalPipeline)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleRenewals.filter((r) => r.daysUntilRenewal <= 30).length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Due in 30 Days</p>
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
                  {formatCurrency(atRiskValue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">At Risk Value</p>
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
                  {Math.round(
                    sampleRenewals.reduce((sum, r) => sum + r.probability, 0) /
                      sampleRenewals.length
                  )}%
                </p>
                <p className="text-sm text-[var(--text-muted)]">Avg Probability</p>
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
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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

      {/* Renewal Cards */}
      <div className="space-y-4">
        {filteredRenewals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No renewals found
              </p>
              <p className="text-[var(--text-secondary)]">
                Adjust your filters to see renewal opportunities
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRenewals.map((renewal) => (
            <Card key={renewal.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
                      <Building2 className="h-6 w-6 text-[var(--text-muted)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {renewal.clientName}
                        </h3>
                        <Badge variant={statusConfig[renewal.status].variant}>
                          {statusConfig[renewal.status].label}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Renews {renewal.renewalDate}
                        </span>
                        <span className={`font-medium ${getDaysColor(renewal.daysUntilRenewal)}`}>
                          {renewal.daysUntilRenewal} days
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Value */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[var(--accent)]">
                        {formatCurrency(renewal.proposedValue)}
                      </p>
                      {renewal.proposedValue !== renewal.currentValue && (
                        <p className="text-xs text-[var(--text-muted)]">
                          Current: {formatCurrency(renewal.currentValue)}
                        </p>
                      )}
                    </div>

                    {/* Probability */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-[var(--bg-secondary)]">
                          <div
                            className={`h-2 rounded-full ${
                              renewal.probability >= 70
                                ? "bg-green-500"
                                : renewal.probability >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${renewal.probability}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {renewal.probability}%
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">Probability</p>
                    </div>

                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Risk Factors & Actions */}
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2">
                  <div className="flex items-center gap-4">
                    {renewal.riskFactors.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                        <div className="flex flex-wrap gap-1">
                          {renewal.riskFactors.map((risk, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-[var(--warning-bg)] px-2 py-0.5 text-xs text-[var(--warning)]"
                            >
                              {risk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-[var(--success)]">
                        <CheckCircle className="h-4 w-4" />
                        No risk factors
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-muted)]">
                      Assigned: {renewal.assignedTo}
                    </span>
                    <Button size="sm" variant="outline">
                      <Phone className="mr-1 h-3 w-3" />
                      Schedule Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
