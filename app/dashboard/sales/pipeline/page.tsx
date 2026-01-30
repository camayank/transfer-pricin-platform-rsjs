"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  DollarSign,
  Loader2,
  RefreshCw,
  User,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  source: string;
  status: string;
  priority: string;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  nextFollowUpAt?: string;
  createdAt: string;
}

interface PipelineStage {
  id: string;
  name: string;
  status: string;
  color: string;
  leads: Lead[];
  totalValue: number;
}

const pipelineStages = [
  { id: "new", name: "New Leads", status: "NEW", color: "bg-slate-500" },
  { id: "contacted", name: "Contacted", status: "CONTACTED", color: "bg-blue-500" },
  { id: "qualified", name: "Qualified", status: "QUALIFIED", color: "bg-indigo-500" },
  { id: "proposal", name: "Proposal Sent", status: "PROPOSAL_SENT", color: "bg-purple-500" },
  { id: "negotiation", name: "Negotiation", status: "NEGOTIATION", color: "bg-orange-500" },
  { id: "won", name: "Won", status: "WON", color: "bg-green-500" },
];

const priorityColors: Record<string, string> = {
  CRITICAL: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-yellow-500",
  LOW: "border-l-green-500",
};

function formatCurrency(amount?: number): string {
  if (!amount) return "-";
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)} L`;
  }
  return amount.toLocaleString("en-IN");
}

export default function SalesPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leads");
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      const data = await response.json();
      setLeads(data.leads);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Group leads by status
  const pipelineData: PipelineStage[] = pipelineStages.map((stage) => {
    const stageLeads = leads.filter((lead) => lead.status === stage.status);
    return {
      ...stage,
      leads: stageLeads,
      totalValue: stageLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0),
    };
  });

  // Summary stats
  const totalPipelineValue = leads
    .filter((l) => !["WON", "LOST"].includes(l.status))
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const wonValue = leads
    .filter((l) => l.status === "WON")
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const avgDealSize = leads.length > 0
    ? leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) / leads.length
    : 0;
  const conversionRate = leads.length > 0
    ? (leads.filter((l) => l.status === "WON").length / leads.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium text-[var(--error)]">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchLeads}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Sales Pipeline</h1>
          <p className="text-[var(--text-secondary)]">
            Track lead progress through your sales funnel
          </p>
        </div>
        <Button variant="outline" onClick={fetchLeads}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
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
                  Rs. {formatCurrency(totalPipelineValue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Pipeline Value</p>
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
                  Rs. {formatCurrency(wonValue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Won Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  Rs. {formatCurrency(avgDealSize)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Avg Deal Size</p>
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
                  {conversionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-[var(--text-muted)]">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {pipelineData.map((stage) => (
            <div key={stage.id} className="w-80 flex-shrink-0">
              <Card className="h-full">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                      <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{stage.leads.length}</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Rs. {formatCurrency(stage.totalValue)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {stage.leads.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--border-subtle)] p-4 text-center text-sm text-[var(--text-muted)]">
                      No leads in this stage
                    </div>
                  ) : (
                    stage.leads.map((lead) => (
                      <Card
                        key={lead.id}
                        className={`cursor-pointer border-l-4 transition-all hover:shadow-md ${priorityColors[lead.priority] || ""}`}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-[var(--text-primary)] text-sm line-clamp-1">
                                {lead.companyName}
                              </h4>
                              {lead.probability && (
                                <Badge variant="outline" className="text-xs">
                                  {lead.probability}%
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              <User className="h-3 w-3" />
                              <span className="line-clamp-1">{lead.contactPerson}</span>
                            </div>

                            {lead.estimatedValue && (
                              <div className="flex items-center gap-2 text-xs">
                                <DollarSign className="h-3 w-3 text-[var(--accent)]" />
                                <span className="font-medium text-[var(--accent)]">
                                  Rs. {formatCurrency(lead.estimatedValue)}
                                </span>
                              </div>
                            )}

                            {lead.nextFollowUpAt && (
                              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(lead.nextFollowUpAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
