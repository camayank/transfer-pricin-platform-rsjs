"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Scale,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Building2,
  IndianRupee,
  ArrowRight,
  Plus,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  ChevronRight,
  Eye,
  Edit,
  MoreHorizontal,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  useDisputes,
  type DisputeCase,
  type DisputeStage,
  type DisputeStatus,
  getStageLabel,
  getStatusLabel,
  DISPUTE_STAGE_ORDER,
} from "@/lib/hooks/use-disputes";

const stageFlow: DisputeStage[] = ["TPO", "DRP", "AO", "ITAT", "HIGH_COURT", "SUPREME_COURT"];

const stageDeadlines: Record<string, { name: string; deadline: string }> = {
  TPO: { name: "TPO Order", deadline: "33 months from end of AY" },
  DRP: { name: "DRP Filing", deadline: "30 days from draft order" },
  AO: { name: "Final Assessment", deadline: "1 month from DRP direction" },
  ITAT: { name: "ITAT Appeal", deadline: "60 days from AO order" },
  HIGH_COURT: { name: "High Court", deadline: "120 days from ITAT order" },
  SUPREME_COURT: { name: "Supreme Court", deadline: "90 days from HC order" },
};

function getDaysToDeadline(nextHearingDate?: string | null): number {
  if (!nextHearingDate) return -1;
  const hearing = new Date(nextHearingDate);
  const today = new Date();
  const diff = hearing.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getPriority(dispute: DisputeCase): "high" | "medium" | "low" {
  const daysToDeadline = getDaysToDeadline(dispute.nextHearingDate);
  if (daysToDeadline > 0 && daysToDeadline <= 15) return "high";
  if (dispute.amountAtStake > 100000000) return "high"; // > 10 Cr
  if (dispute.amountAtStake > 50000000) return "medium"; // > 5 Cr
  return "low";
}

export default function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch disputes from API
  const { data, isLoading, error } = useDisputes({
    stage: stageFilter !== "all" ? stageFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const disputes = data?.disputes || [];

  // Filter locally for search
  const filteredDisputes = useMemo(() => {
    return disputes.filter((dispute: DisputeCase) => {
      const clientName = dispute.engagement?.client?.name || "";
      const matchesSearch =
        !searchQuery ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [disputes, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        <span className="ml-2 text-[var(--text-secondary)]">Loading disputes...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-[var(--error)]" />
        <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
          Failed to load disputes
        </p>
        <p className="text-[var(--text-secondary)]">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status: DisputeStatus) => {
    const variants: Record<DisputeStatus, "success" | "warning" | "error" | "info" | "secondary"> = {
      OPEN: "info",
      IN_PROGRESS: "info",
      PENDING_HEARING: "warning",
      DECIDED: "success",
      APPEALED: "warning",
      CLOSED: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{getStatusLabel(status)}</Badge>;
  };

  const getPriorityIcon = (priority: "high" | "medium" | "low") => {
    if (priority === "high") return <AlertTriangle className="h-4 w-4 text-[var(--error)]" />;
    if (priority === "medium") return <AlertCircle className="h-4 w-4 text-[var(--warning)]" />;
    return <CheckCircle className="h-4 w-4 text-[var(--success)]" />;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const activeDisputes = disputes.filter((d: DisputeCase) =>
      d.status !== "CLOSED" && d.status !== "DECIDED"
    );
    const totalDisputedAmount = activeDisputes.reduce((sum: number, d: DisputeCase) => sum + (d.amountAtStake || 0), 0);
    const disputesWithProb = activeDisputes.filter((d: DisputeCase) => d.successProbability != null);
    const avgSuccessProbability = disputesWithProb.length > 0
      ? Math.round(disputesWithProb.reduce((sum: number, d: DisputeCase) => sum + (d.successProbability || 0), 0) / disputesWithProb.length)
      : 0;
    const urgentDisputes = activeDisputes.filter((d: DisputeCase) => {
      const days = getDaysToDeadline(d.nextHearingDate);
      return days <= 15 && days > 0;
    });
    return { activeDisputes, totalDisputedAmount, avgSuccessProbability, urgentDisputes };
  }, [disputes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dispute Management
          </h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage TP disputes across DRP, ITAT, and Courts
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Dispute
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Active Disputes</p>
                <p className="text-2xl font-bold">{stats.activeDisputes.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <Scale className="h-6 w-6 text-[var(--accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Disputed</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalDisputedAmount)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                <IndianRupee className="h-6 w-6 text-[var(--warning)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Urgent (≤15 days)</p>
                <p className="text-2xl font-bold text-[var(--error)]">{stats.urgentDisputes.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--error)]/10">
                <AlertTriangle className="h-6 w-6 text-[var(--error)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Avg Success Prob.</p>
                <p className="text-2xl font-bold text-[var(--success)]">{stats.avgSuccessProbability}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--success)]/10">
                <TrendingUp className="h-6 w-6 text-[var(--success)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Dispute Pipeline by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            {stageFlow.map((stage, index) => {
              const stageDisputes = disputes.filter((d: DisputeCase) =>
                d.stage === stage && d.status !== "CLOSED" && d.status !== "DECIDED"
              );
              const count = stageDisputes.length;
              const amount = stageDisputes.reduce((sum: number, d: DisputeCase) => sum + (d.amountAtStake || 0), 0);
              const displayStage = stage === "HIGH_COURT" ? "HC" : stage === "SUPREME_COURT" ? "SC" : stage;
              return (
                <div key={stage} className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 p-4 rounded-lg text-center ${
                      count > 0 ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30" : "bg-[var(--bg-secondary)]"
                    }`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm font-medium">{displayStage}</p>
                      {count > 0 && (
                        <p className="text-xs text-[var(--text-secondary)]">{formatCurrency(amount)}</p>
                      )}
                    </div>
                    {index < stageFlow.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search clients, case numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stageFlow.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage === "HIGH_COURT" ? "High Court" : stage === "SUPREME_COURT" ? "Supreme Court" : stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="PENDING_HEARING">Pending Hearing</SelectItem>
            <SelectItem value="DECIDED">Decided</SelectItem>
            <SelectItem value="APPEALED">Appealed</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Scale className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No disputes found
              </p>
              <p className="text-[var(--text-secondary)]">
                {searchQuery || stageFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No active dispute cases"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDisputes.map((dispute: DisputeCase) => {
            const daysToDeadline = getDaysToDeadline(dispute.nextHearingDate);
            const priority = getPriority(dispute);
            const clientName = dispute.engagement?.client?.name || "Unknown Client";
            const displayStage = dispute.stage === "HIGH_COURT" ? "HC" : dispute.stage === "SUPREME_COURT" ? "SC" : dispute.stage;

            return (
              <Card key={dispute.id} className={`${
                daysToDeadline <= 15 && daysToDeadline > 0
                  ? "border-[var(--error)]/50"
                  : ""
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPriorityIcon(priority)}
                        <h3 className="font-semibold text-[var(--text-primary)]">
                          {clientName}
                        </h3>
                        <Badge variant="secondary">{displayStage}</Badge>
                        {getStatusBadge(dispute.status)}
                        {dispute.outcome && (
                          <Badge variant={dispute.outcome === "WON" ? "success" : dispute.outcome === "LOST" ? "error" : "warning"}>
                            {dispute.outcome}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Assessment Year</p>
                          <p className="text-sm font-medium">AY {dispute.assessmentYear}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Case Number</p>
                          <p className="text-sm font-medium">{dispute.caseNumber || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Amount at Stake</p>
                          <p className="text-sm font-bold text-[var(--accent)]">
                            {formatCurrency(dispute.amountAtStake)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">TPO Adjustment</p>
                          <p className="text-sm font-medium">
                            {dispute.adjustmentByTPO ? formatCurrency(dispute.adjustmentByTPO) : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs">
                        {dispute.tpoOrderDate && (
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                            <Calendar className="h-3 w-3" />
                            TPO Order: {new Date(dispute.tpoOrderDate).toLocaleDateString()}
                          </span>
                        )}
                        {dispute.nextHearingDate && (
                          <span className="flex items-center gap-1 text-[var(--warning)]">
                            <Clock className="h-3 w-3" />
                            Next Hearing: {new Date(dispute.nextHearingDate).toLocaleDateString()}
                          </span>
                        )}
                        {daysToDeadline > 0 && (
                          <span className={`flex items-center gap-1 ${
                            daysToDeadline <= 15 ? "text-[var(--error)]" : "text-[var(--text-secondary)]"
                          }`}>
                            <AlertTriangle className="h-3 w-3" />
                            {daysToDeadline} days to hearing
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 ml-4">
                      {dispute.successProbability != null && (
                        <div className="text-right">
                          <p className="text-xs text-[var(--text-muted)]">Success Probability</p>
                          <div className="flex items-center gap-2">
                            <Progress value={dispute.successProbability} className="w-20 h-2" />
                            <span className={`text-sm font-bold ${
                              dispute.successProbability >= 70 ? "text-[var(--success)]" :
                              dispute.successProbability >= 50 ? "text-[var(--warning)]" : "text-[var(--error)]"
                            }`}>
                              {dispute.successProbability}%
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Statutory Deadlines Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Statutory Deadlines Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(stageDeadlines).map(([key, value]) => {
              const displayKey = key === "HIGH_COURT" ? "HC" : key === "SUPREME_COURT" ? "SC" : key;
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10">
                    <span className="text-xs font-bold text-[var(--accent)]">{displayKey}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{value.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{value.deadline}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
