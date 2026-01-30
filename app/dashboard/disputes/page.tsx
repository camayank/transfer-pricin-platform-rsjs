"use client";

import { useState } from "react";
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
} from "lucide-react";

interface Dispute {
  id: string;
  clientName: string;
  assessmentYear: string;
  stage: "TPO" | "DRP" | "AO" | "ITAT" | "HC" | "SC";
  status: "active" | "pending_hearing" | "order_received" | "closed" | "won" | "lost";
  disputedAmount: number;
  adjustmentType: string;
  filingDate: string;
  nextDeadline: string;
  daysToDeadline: number;
  hearingDate?: string;
  assignedTo: string;
  priority: "high" | "medium" | "low";
  successProbability: number;
}

const sampleDisputes: Dispute[] = [
  {
    id: "D001",
    clientName: "TechCorp India Pvt Ltd",
    assessmentYear: "2021-22",
    stage: "ITAT",
    status: "pending_hearing",
    disputedAmount: 125000000,
    adjustmentType: "AMP Expenses",
    filingDate: "2023-06-15",
    nextDeadline: "2025-02-15",
    daysToDeadline: 16,
    hearingDate: "2025-02-20",
    assignedTo: "Priya Sharma",
    priority: "high",
    successProbability: 75,
  },
  {
    id: "D002",
    clientName: "Global Auto Parts Ltd",
    assessmentYear: "2022-23",
    stage: "DRP",
    status: "active",
    disputedAmount: 85000000,
    adjustmentType: "Royalty Payment",
    filingDate: "2024-01-20",
    nextDeadline: "2025-02-28",
    daysToDeadline: 29,
    assignedTo: "Amit Verma",
    priority: "high",
    successProbability: 65,
  },
  {
    id: "D003",
    clientName: "Pharma Solutions India",
    assessmentYear: "2020-21",
    stage: "HC",
    status: "pending_hearing",
    disputedAmount: 250000000,
    adjustmentType: "Intangibles Transfer",
    filingDate: "2022-09-10",
    nextDeadline: "2025-03-10",
    daysToDeadline: 39,
    hearingDate: "2025-03-15",
    assignedTo: "Rajesh Kumar",
    priority: "high",
    successProbability: 55,
  },
  {
    id: "D004",
    clientName: "Digital Services Corp",
    assessmentYear: "2021-22",
    stage: "TPO",
    status: "active",
    disputedAmount: 45000000,
    adjustmentType: "Management Fees",
    filingDate: "2024-08-05",
    nextDeadline: "2025-02-05",
    daysToDeadline: 6,
    assignedTo: "Sneha Patel",
    priority: "medium",
    successProbability: 80,
  },
  {
    id: "D005",
    clientName: "Manufacturing India Ltd",
    assessmentYear: "2019-20",
    stage: "ITAT",
    status: "won",
    disputedAmount: 180000000,
    adjustmentType: "Comparable Selection",
    filingDate: "2021-11-22",
    nextDeadline: "-",
    daysToDeadline: -1,
    assignedTo: "Priya Sharma",
    priority: "low",
    successProbability: 100,
  },
];

const stageFlow = ["TPO", "DRP", "AO", "ITAT", "HC", "SC"];

const stageDeadlines: Record<string, { name: string; deadline: string }> = {
  TPO: { name: "TPO Order", deadline: "33 months from end of AY" },
  DRP: { name: "DRP Filing", deadline: "30 days from draft order" },
  AO: { name: "Final Assessment", deadline: "1 month from DRP direction" },
  ITAT: { name: "ITAT Appeal", deadline: "60 days from AO order" },
  HC: { name: "High Court", deadline: "120 days from ITAT order" },
  SC: { name: "Supreme Court", deadline: "90 days from HC order" },
};

export default function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDisputes = sampleDisputes.filter((dispute) => {
    const matchesSearch =
      dispute.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.adjustmentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || dispute.stage === stageFilter;
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    return matchesSearch && matchesStage && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "info" | "secondary"> = {
      active: "info",
      pending_hearing: "warning",
      order_received: "info",
      closed: "secondary",
      won: "success",
      lost: "error",
    };
    const labels: Record<string, string> = {
      active: "Active",
      pending_hearing: "Pending Hearing",
      order_received: "Order Received",
      closed: "Closed",
      won: "Won",
      lost: "Lost",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "high") return <AlertTriangle className="h-4 w-4 text-[var(--error)]" />;
    if (priority === "medium") return <AlertCircle className="h-4 w-4 text-[var(--warning)]" />;
    return <CheckCircle className="h-4 w-4 text-[var(--success)]" />;
  };

  // Calculate stats
  const activeDisputes = sampleDisputes.filter(d => !["closed", "won", "lost"].includes(d.status));
  const totalDisputedAmount = activeDisputes.reduce((sum, d) => sum + d.disputedAmount, 0);
  const avgSuccessProbability = Math.round(activeDisputes.reduce((sum, d) => sum + d.successProbability, 0) / activeDisputes.length);
  const urgentDisputes = activeDisputes.filter(d => d.daysToDeadline <= 15 && d.daysToDeadline > 0);

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
                <p className="text-2xl font-bold">{activeDisputes.length}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(totalDisputedAmount)}</p>
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
                <p className="text-2xl font-bold text-[var(--error)]">{urgentDisputes.length}</p>
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
                <p className="text-2xl font-bold text-[var(--success)]">{avgSuccessProbability}%</p>
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
              const count = sampleDisputes.filter(d => d.stage === stage && !["closed", "won", "lost"].includes(d.status)).length;
              const amount = sampleDisputes.filter(d => d.stage === stage && !["closed", "won", "lost"].includes(d.status))
                .reduce((sum, d) => sum + d.disputedAmount, 0);
              return (
                <div key={stage} className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 p-4 rounded-lg text-center ${
                      count > 0 ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30" : "bg-[var(--bg-secondary)]"
                    }`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm font-medium">{stage}</p>
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
            placeholder="Search clients, adjustment types..."
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
              <SelectItem key={stage} value={stage}>{stage}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_hearing">Pending Hearing</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <Card key={dispute.id} className={`${
            dispute.daysToDeadline <= 15 && dispute.daysToDeadline > 0
              ? "border-[var(--error)]/50"
              : ""
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getPriorityIcon(dispute.priority)}
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {dispute.clientName}
                    </h3>
                    <Badge variant="secondary">{dispute.stage}</Badge>
                    {getStatusBadge(dispute.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Assessment Year</p>
                      <p className="text-sm font-medium">AY {dispute.assessmentYear}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Adjustment Type</p>
                      <p className="text-sm font-medium">{dispute.adjustmentType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Disputed Amount</p>
                      <p className="text-sm font-bold text-[var(--accent)]">
                        {formatCurrency(dispute.disputedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Assigned To</p>
                      <p className="text-sm font-medium">{dispute.assignedTo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <Calendar className="h-3 w-3" />
                      Filed: {new Date(dispute.filingDate).toLocaleDateString()}
                    </span>
                    {dispute.hearingDate && (
                      <span className="flex items-center gap-1 text-[var(--warning)]">
                        <Clock className="h-3 w-3" />
                        Hearing: {new Date(dispute.hearingDate).toLocaleDateString()}
                      </span>
                    )}
                    {dispute.daysToDeadline > 0 && (
                      <span className={`flex items-center gap-1 ${
                        dispute.daysToDeadline <= 15 ? "text-[var(--error)]" : "text-[var(--text-secondary)]"
                      }`}>
                        <AlertTriangle className="h-3 w-3" />
                        {dispute.daysToDeadline} days to deadline
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-4">
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
        ))}
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
            {Object.entries(stageDeadlines).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10">
                  <span className="text-xs font-bold text-[var(--accent)]">{key}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{value.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{value.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
