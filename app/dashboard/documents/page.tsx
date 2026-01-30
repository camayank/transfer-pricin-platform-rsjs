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
  Files,
  Plus,
  Search,
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Share2,
  MoreHorizontal,
  FolderOpen,
  Eye,
  Calendar,
  User,
} from "lucide-react";

// Sample document data
const sampleDocuments = [
  {
    id: "1",
    name: "Transfer Pricing Policy 2025.pdf",
    type: "PDF",
    size: "2.4 MB",
    category: "Policy",
    clientName: "TechCorp India Pvt Ltd",
    uploadedBy: "Priya Sharma",
    uploadedAt: "2025-01-28",
    lastModified: "2025-01-30",
    status: "FINAL",
    sharedWith: 3,
  },
  {
    id: "2",
    name: "Benchmarking Analysis Q3.xlsx",
    type: "EXCEL",
    size: "1.8 MB",
    category: "Analysis",
    clientName: "Pharma Solutions Ltd",
    uploadedBy: "Rahul Mehta",
    uploadedAt: "2025-01-25",
    lastModified: "2025-01-29",
    status: "DRAFT",
    sharedWith: 2,
  },
  {
    id: "3",
    name: "Form 3CEB Draft.pdf",
    type: "PDF",
    size: "856 KB",
    category: "Compliance",
    clientName: "Auto Parts Manufacturing",
    uploadedBy: "Amit Kumar",
    uploadedAt: "2025-01-20",
    lastModified: "2025-01-27",
    status: "REVIEW",
    sharedWith: 5,
  },
  {
    id: "4",
    name: "Client Meeting Notes.docx",
    type: "WORD",
    size: "124 KB",
    category: "Notes",
    clientName: "Global KPO Services",
    uploadedBy: "Sneha Reddy",
    uploadedAt: "2025-01-15",
    lastModified: "2025-01-15",
    status: "FINAL",
    sharedWith: 1,
  },
  {
    id: "5",
    name: "APA Documentation.pdf",
    type: "PDF",
    size: "5.2 MB",
    category: "Compliance",
    clientName: "FinServ Holdings",
    uploadedBy: "Vikram Patel",
    uploadedAt: "2025-01-10",
    lastModified: "2025-01-28",
    status: "FINAL",
    sharedWith: 4,
  },
];

const typeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  EXCEL: FileSpreadsheet,
  WORD: FileText,
  IMAGE: Image,
  OTHER: File,
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  REVIEW: { label: "In Review", variant: "warning" },
  FINAL: { label: "Final", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "info" },
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDocuments = sampleDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(sampleDocuments.map((d) => d.category))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Documents</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and organize all your documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-1 h-4 w-4" />
            Upload
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <Files className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleDocuments.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleDocuments.filter((d) => d.status === "FINAL").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Finalized</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleDocuments.reduce((sum, d) => sum + d.sharedWith, 0)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Active Shares</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {categories.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Categories</p>
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
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
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

      {/* Document List */}
      <div className="space-y-2">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Files className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No documents found
              </p>
              <p className="text-[var(--text-secondary)]">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => {
            const TypeIcon = typeIcons[doc.type] || File;
            return (
              <Card key={doc.id} className="hover:border-[var(--border-default)] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
                        <TypeIcon className="h-6 w-6 text-[var(--accent)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">{doc.name}</h3>
                          <Badge variant={statusConfig[doc.status].variant}>
                            {statusConfig[doc.status].label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <span>{doc.clientName}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{doc.category}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {doc.uploadedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {doc.lastModified}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
    </div>
  );
}
