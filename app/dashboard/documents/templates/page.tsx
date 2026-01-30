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
  FileCog,
  Plus,
  Search,
  FileText,
  Copy,
  Eye,
  MoreHorizontal,
  Zap,
  Calendar,
} from "lucide-react";

// Sample template data
const sampleTemplates = [
  {
    id: "1",
    name: "Form 3CEB Template",
    description: "Standard template for Form 3CEB filing with all required sections",
    category: "Compliance",
    variables: ["clientName", "pan", "assessmentYear", "rptDetails"],
    usageCount: 145,
    lastUsed: "2025-01-30",
    createdBy: "System",
    isActive: true,
  },
  {
    id: "2",
    name: "Benchmarking Report Template",
    description: "Comprehensive benchmarking analysis report template",
    category: "Analysis",
    variables: ["clientName", "industry", "comparables", "armLengthRange"],
    usageCount: 89,
    lastUsed: "2025-01-28",
    createdBy: "Priya Sharma",
    isActive: true,
  },
  {
    id: "3",
    name: "Client Engagement Letter",
    description: "Standard engagement letter for new clients",
    category: "Legal",
    variables: ["clientName", "scopeOfWork", "fees", "timeline"],
    usageCount: 234,
    lastUsed: "2025-01-29",
    createdBy: "System",
    isActive: true,
  },
  {
    id: "4",
    name: "Transfer Pricing Policy Document",
    description: "TP policy document template with customizable sections",
    category: "Policy",
    variables: ["clientName", "groupStructure", "transactions", "methods"],
    usageCount: 67,
    lastUsed: "2025-01-25",
    createdBy: "Rahul Mehta",
    isActive: true,
  },
  {
    id: "5",
    name: "Master File Template",
    description: "CbCR Master File documentation template",
    category: "Compliance",
    variables: ["clientName", "groupInfo", "tpPolicy", "intangibles"],
    usageCount: 45,
    lastUsed: "2025-01-20",
    createdBy: "System",
    isActive: false,
  },
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredTemplates = sampleTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(sampleTemplates.map((t) => t.category))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Document Templates</h1>
          <p className="text-[var(--text-secondary)]">
            Manage document generation templates
          </p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <FileCog className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleTemplates.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleTemplates.filter((t) => t.isActive).length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <Copy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleTemplates.reduce((sum, t) => sum + t.usageCount, 0)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Documents Generated</p>
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
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:border-[var(--border-default)] transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--accent)]" />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                {template.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)]">{template.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Variables */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
                  Variables
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-mono text-[var(--text-muted)]"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-4 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  {template.usageCount} uses
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {template.lastUsed}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">
                  {template.category}
                </span>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline">
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Zap className="mr-1 h-3 w-3" />
                    Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
