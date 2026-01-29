"use client";

import { useState } from "react";
import Link from "next/link";
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
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
} from "lucide-react";

// Sample client data
const sampleClients = [
  {
    id: "1",
    name: "TechCorp India Pvt Ltd",
    pan: "AABCT1234A",
    industry: "IT Services",
    nicCode: "6201",
    contactPerson: "Rahul Sharma",
    contactEmail: "rahul@techcorp.com",
    contactPhone: "9876543210",
    city: "Bangalore",
    state: "Karnataka",
    status: "in_progress",
    assignedTo: "Priya S.",
    engagements: [
      { year: "2025-26", status: "in_progress", dueDate: "2025-10-31" },
    ],
    totalRptValue: 82_00_00_000,
  },
  {
    id: "2",
    name: "Pharma Solutions Ltd",
    pan: "AABCP5678B",
    industry: "Pharmaceuticals",
    nicCode: "2100",
    contactPerson: "Meera Patel",
    contactEmail: "meera@pharmasol.com",
    contactPhone: "9876543211",
    city: "Mumbai",
    state: "Maharashtra",
    status: "review",
    assignedTo: "Rahul M.",
    engagements: [
      { year: "2025-26", status: "review", dueDate: "2025-10-31" },
    ],
    totalRptValue: 150_00_00_000,
  },
  {
    id: "3",
    name: "Auto Parts Manufacturing",
    pan: "AABCA9012C",
    industry: "Auto Ancillary",
    nicCode: "2930",
    contactPerson: "Amit Kumar",
    contactEmail: "amit@autoparts.com",
    contactPhone: "9876543212",
    city: "Chennai",
    state: "Tamil Nadu",
    status: "filed",
    assignedTo: "Amit K.",
    engagements: [
      { year: "2025-26", status: "filed", dueDate: "2025-10-31" },
    ],
    totalRptValue: 45_00_00_000,
  },
  {
    id: "4",
    name: "Global KPO Services",
    pan: "AABCG3456D",
    industry: "KPO",
    nicCode: "8220",
    contactPerson: "Sneha Reddy",
    contactEmail: "sneha@globalkpo.com",
    contactPhone: "9876543213",
    city: "Hyderabad",
    state: "Telangana",
    status: "not_started",
    assignedTo: "Sneha R.",
    engagements: [
      { year: "2025-26", status: "not_started", dueDate: "2025-10-31" },
    ],
    totalRptValue: 65_00_00_000,
  },
  {
    id: "5",
    name: "FinServ Holdings",
    pan: "AABCF7890E",
    industry: "Financial Services",
    nicCode: "6419",
    contactPerson: "Vikram Singh",
    contactEmail: "vikram@finserv.com",
    contactPhone: "9876543214",
    city: "Delhi",
    state: "Delhi",
    status: "data_collection",
    assignedTo: "Vikram P.",
    engagements: [
      { year: "2025-26", status: "data_collection", dueDate: "2025-10-31" },
    ],
    totalRptValue: 200_00_00_000,
  },
];

const statusConfig: Record<string, { label: string; variant: "secondary" | "warning" | "info" | "success" | "error" }> = {
  not_started: { label: "Not Started", variant: "secondary" },
  data_collection: { label: "Data Collection", variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  review: { label: "Review", variant: "info" },
  filed: { label: "Filed", variant: "success" },
  completed: { label: "Completed", variant: "success" },
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

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");

  // Filter clients
  const filteredClients = sampleClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.pan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesIndustry = industryFilter === "all" || client.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Get unique industries
  const industries = [...new Set(sampleClients.map((c) => c.industry))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Clients</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your client portfolio and engagements
          </p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleClients.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Clients</p>
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
                  {sampleClients.filter((c) => c.status === "in_progress" || c.status === "data_collection").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleClients.filter((c) => c.status === "filed").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Filed</p>
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
                  {formatCurrency(sampleClients.reduce((sum, c) => sum + c.totalRptValue, 0))}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total RPT Value</p>
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
            placeholder="Search by name or PAN..."
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
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No clients found
              </p>
              <p className="text-[var(--text-secondary)]">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-0">
                <Link href={`/dashboard/clients/${client.id}`}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">
                            {client.name}
                          </h3>
                          <Badge variant={statusConfig[client.status].variant}>
                            {statusConfig[client.status].label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                          <span>{client.pan}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{client.industry}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{client.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden text-right md:block">
                        <p className="font-medium text-[var(--accent)]">
                          {formatCurrency(client.totalRptValue)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">RPT Value</p>
                      </div>
                      <div className="hidden text-right md:block">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {client.assignedTo}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">Assigned</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>
                  </div>

                  {/* Contact info footer */}
                  <div className="flex items-center gap-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Users className="h-4 w-4" />
                      {client.contactPerson}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Mail className="h-4 w-4" />
                      {client.contactEmail}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Phone className="h-4 w-4" />
                      {client.contactPhone}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
