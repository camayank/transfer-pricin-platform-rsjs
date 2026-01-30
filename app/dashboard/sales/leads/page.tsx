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
  Users,
  Plus,
  Search,
  Filter,
  Building2,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  UserCheck,
  DollarSign,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { usePermissions, PermissionAction } from "@/lib/hooks/use-permissions";

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  industry?: string;
  city?: string;
  state?: string;
  source: string;
  status: string;
  priority: string;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  assignedToId?: string;
  servicesInterested?: string[];
  requirements?: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  notes?: string;
  createdAt: string;
  interactions: Array<{
    id: string;
    type: string;
    content: string;
    createdAt: string;
  }>;
}

const statusConfig: Record<string, { label: string; variant: "secondary" | "warning" | "info" | "success" | "error" }> = {
  NEW: { label: "New", variant: "secondary" },
  CONTACTED: { label: "Contacted", variant: "info" },
  QUALIFIED: { label: "Qualified", variant: "info" },
  PROPOSAL_SENT: { label: "Proposal Sent", variant: "warning" },
  NEGOTIATION: { label: "Negotiation", variant: "warning" },
  WON: { label: "Won", variant: "success" },
  LOST: { label: "Lost", variant: "error" },
  ON_HOLD: { label: "On Hold", variant: "secondary" },
};

const sourceConfig: Record<string, string> = {
  REFERRAL: "Referral",
  WEBSITE: "Website",
  COLD_CALL: "Cold Call",
  TRADE_SHOW: "Trade Show",
  SOCIAL_MEDIA: "Social Media",
  ADVERTISEMENT: "Advertisement",
  PARTNER: "Partner",
  OTHER: "Other",
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { can } = usePermissions();
  const canCreateLeads = can("leads", PermissionAction.CREATE);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    industry: "",
    city: "",
    state: "",
    source: "REFERRAL",
    priority: "MEDIUM",
    estimatedValue: "",
    requirements: "",
  });

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/leads?${params.toString()}`);
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
  }, [statusFilter, sourceFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Create lead
  const handleCreateLead = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create lead");
      }

      setIsCreateDialogOpen(false);
      setFormData({
        companyName: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        industry: "",
        city: "",
        state: "",
        source: "REFERRAL",
        priority: "MEDIUM",
        estimatedValue: "",
        requirements: "",
      });
      fetchLeads();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED" || l.status === "PROPOSAL_SENT" || l.status === "NEGOTIATION").length;
  const wonLeads = leads.filter((l) => l.status === "WON").length;
  const totalPipelineValue = leads
    .filter((l) => !["WON", "LOST"].includes(l.status))
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Lead Management</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage your sales pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLeads}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
          {canCreateLeads && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Lead</DialogTitle>
                  <DialogDescription>
                    Add a new lead to your sales pipeline
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g., IT Services"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Enter contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="email@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Value (Rs.)</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                        placeholder="500000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                      >
                        <SelectTrigger id="source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(sourceConfig).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements / Notes</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Enter any requirements or notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateLead} disabled={isSubmitting || !formData.companyName || !formData.contactPerson || !formData.contactEmail}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Lead"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {totalLeads}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {newLeads}
                </p>
                <p className="text-sm text-[var(--text-muted)]">New Leads</p>
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
                  {qualifiedLeads}
                </p>
                <p className="text-sm text-[var(--text-muted)]">In Pipeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {wonLeads}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Won</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(totalPipelineValue)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Pipeline Value</p>
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
            placeholder="Search by company, contact, or email..."
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
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(sourceConfig).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lead List */}
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
              <Button variant="outline" className="mt-4" onClick={fetchLeads}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No leads found
              </p>
              <p className="text-[var(--text-secondary)]">
                {searchQuery || statusFilter !== "all" || sourceFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first lead to get started"}
              </p>
              {canCreateLeads && !searchQuery && statusFilter === "all" && sourceFilter === "all" && (
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Your First Lead
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {lead.companyName}
                        </h3>
                        <Badge variant={statusConfig[lead.status]?.variant || "secondary"}>
                          {statusConfig[lead.status]?.label || lead.status}
                        </Badge>
                        <span className={`text-xs font-medium ${priorityConfig[lead.priority]?.color || ""}`}>
                          {priorityConfig[lead.priority]?.label || lead.priority}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span>{sourceConfig[lead.source] || lead.source}</span>
                        {lead.industry && (
                          <>
                            <span className="text-[var(--border-default)]">|</span>
                            <span>{lead.industry}</span>
                          </>
                        )}
                        {lead.city && (
                          <>
                            <span className="text-[var(--border-default)]">|</span>
                            <span>{lead.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {lead.estimatedValue && (
                      <div className="hidden text-right md:block">
                        <p className="font-medium text-[var(--accent)]">
                          {formatCurrency(lead.estimatedValue)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">Est. Value</p>
                      </div>
                    )}
                    {lead.probability && (
                      <div className="hidden text-right md:block">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {lead.probability}%
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">Probability</p>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                </div>

                {/* Contact info footer */}
                <div className="flex items-center gap-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Users className="h-4 w-4" />
                    {lead.contactPerson}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Mail className="h-4 w-4" />
                    {lead.contactEmail}
                  </div>
                  {lead.contactPhone && (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Phone className="h-4 w-4" />
                      {lead.contactPhone}
                    </div>
                  )}
                  {lead.nextFollowUpAt && (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Calendar className="h-4 w-4" />
                      Follow up: {new Date(lead.nextFollowUpAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
