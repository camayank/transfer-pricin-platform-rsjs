"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Building2,
  DollarSign,
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  Loader2,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import { usePermissions, PermissionAction } from "@/lib/hooks/use-permissions";

interface UpsellOpportunity {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  serviceType: string;
  estimatedValue: number;
  probability?: number;
  status: string;
  priority: string;
  targetCloseDate?: string;
  notes?: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

const statusConfig: Record<string, { label: string; variant: "secondary" | "warning" | "info" | "success" | "error" }> = {
  IDENTIFIED: { label: "Identified", variant: "secondary" },
  QUALIFIED: { label: "Qualified", variant: "info" },
  PROPOSAL_SENT: { label: "Proposal Sent", variant: "warning" },
  NEGOTIATION: { label: "Negotiation", variant: "warning" },
  WON: { label: "Won", variant: "success" },
  LOST: { label: "Lost", variant: "error" },
  ON_HOLD: { label: "On Hold", variant: "secondary" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  CRITICAL: { label: "Critical", color: "text-red-500" },
  HIGH: { label: "High", color: "text-orange-500" },
  MEDIUM: { label: "Medium", color: "text-yellow-500" },
  LOW: { label: "Low", color: "text-green-500" },
};

function formatCurrency(amount?: number): string {
  if (!amount) return "-";
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(1)} L`;
  }
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export default function UpsellPage() {
  const [opportunities, setOpportunities] = useState<UpsellOpportunity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { can } = usePermissions();
  const canCreateUpsell = can("upsell", PermissionAction.CREATE);

  // Form state
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    serviceType: "",
    estimatedValue: "",
    probability: "",
    priority: "MEDIUM",
    targetCloseDate: "",
    notes: "",
  });

  // Fetch opportunities and clients
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const [opportunitiesRes, clientsRes] = await Promise.all([
        fetch(`/api/upsell?${params.toString()}`),
        fetch("/api/clients"),
      ]);

      if (!opportunitiesRes.ok) {
        throw new Error("Failed to fetch upsell opportunities");
      }

      const opportunitiesData = await opportunitiesRes.json();
      setOpportunities(opportunitiesData.opportunities || []);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Create upsell opportunity
  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create upsell opportunity");
      }

      setIsCreateDialogOpen(false);
      setFormData({
        clientId: "",
        title: "",
        description: "",
        serviceType: "",
        estimatedValue: "",
        probability: "",
        priority: "MEDIUM",
        targetCloseDate: "",
        notes: "",
      });
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create upsell opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const totalValue = opportunities
    .filter((o) => !["WON", "LOST"].includes(o.status))
    .reduce((sum, o) => sum + o.estimatedValue, 0);
  const wonValue = opportunities
    .filter((o) => o.status === "WON")
    .reduce((sum, o) => sum + o.estimatedValue, 0);
  const totalOpportunities = opportunities.length;
  const activeOpportunities = opportunities.filter((o) => !["WON", "LOST"].includes(o.status)).length;

  // Get client name helper
  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Unknown Client";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Upsell Opportunities</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage upsell opportunities with existing clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
          {canCreateUpsell && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Opportunity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Upsell Opportunity</DialogTitle>
                  <DialogDescription>
                    Identify a new upsell opportunity with an existing client
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client *</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                      >
                        <SelectTrigger id="clientId">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Input
                        id="serviceType"
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        placeholder="e.g., Transfer Pricing Audit"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief description of the opportunity"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Value (Rs.) *</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                        placeholder="500000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="probability">Probability (%)</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetCloseDate">Target Close Date</Label>
                    <Input
                      id="targetCloseDate"
                      type="date"
                      value={formData.targetCloseDate}
                      onChange={(e) => setFormData({ ...formData, targetCloseDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Details about the upsell opportunity..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isSubmitting || !formData.clientId || !formData.title || !formData.serviceType || !formData.estimatedValue}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Opportunity"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(totalValue)}
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
                  {formatCurrency(wonValue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Won Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {totalOpportunities}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {activeOpportunities}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Active Opportunities</p>
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
            placeholder="Search by title or service type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
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

      {/* Opportunity List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-[var(--error)]">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No upsell opportunities found
              </p>
              <p className="text-[var(--text-secondary)]">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first upsell opportunity to get started"}
              </p>
              {canCreateUpsell && !searchQuery && statusFilter === "all" && (
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Your First Opportunity
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {opp.title}
                        </h3>
                        <Badge variant={statusConfig[opp.status]?.variant || "secondary"}>
                          {statusConfig[opp.status]?.label || opp.status}
                        </Badge>
                        <span className={`text-xs font-medium ${priorityConfig[opp.priority]?.color || ""}`}>
                          {priorityConfig[opp.priority]?.label || opp.priority}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {getClientName(opp.clientId)}
                        </span>
                        <span className="text-[var(--border-default)]">|</span>
                        <span>{opp.serviceType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden text-right md:block">
                      <p className="font-medium text-[var(--accent)]">
                        {formatCurrency(opp.estimatedValue)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Est. Value</p>
                    </div>
                    {opp.probability && (
                      <div className="hidden text-right md:block">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {opp.probability}%
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">Probability</p>
                      </div>
                    )}
                    {opp.targetCloseDate && (
                      <div className="hidden text-right md:block">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {new Date(opp.targetCloseDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">Target Close</p>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
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
