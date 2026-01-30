"use client";

import { useState, useMemo } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useDocuments,
  type Document,
  type DocumentType,
  type DocStatus,
  getDocumentTypeLabel,
  getDocStatusLabel,
} from "@/lib/hooks/use-documents";

const typeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  EXCEL: FileSpreadsheet,
  WORD: FileText,
  IMAGE: Image,
  OTHER: File,
  // Document types from API
  FORM_3CEB: FileText,
  FORM_3CEFA: FileText,
  FORM_3CEAA: FileText,
  FORM_3CEAB: FileText,
  FORM_3CEAC: FileText,
  FORM_3CEAD: FileText,
  LOCAL_FILE: FileText,
  BENCHMARKING_REPORT: FileSpreadsheet,
  TP_STUDY: FileText,
  AGREEMENT: FileText,
  FINANCIAL_STATEMENT: FileSpreadsheet,
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  REVIEW: { label: "In Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  FILED: { label: "Filed", variant: "success" },
  FINAL: { label: "Final", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "info" },
};

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch documents from API
  const { data, isLoading, error } = useDocuments({
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const documents = data?.documents || [];

  // Filter locally for search
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: Document) => {
      const docName = doc.name || doc.fileName || "";
      const clientName = doc.client?.name || doc.engagement?.client?.name || "";
      const matchesSearch =
        !searchQuery ||
        docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [documents, searchQuery]);

  // Document types for filter
  const documentTypes: DocumentType[] = [
    "FORM_3CEB",
    "FORM_3CEFA",
    "FORM_3CEAA",
    "FORM_3CEAB",
    "FORM_3CEAC",
    "FORM_3CEAD",
    "LOCAL_FILE",
    "BENCHMARKING_REPORT",
    "TP_STUDY",
    "AGREEMENT",
    "FINANCIAL_STATEMENT",
    "OTHER",
  ];

  // Stats
  const stats = useMemo(() => ({
    total: documents.length,
    filed: documents.filter((d: Document) => d.status === "FILED" || d.status === "APPROVED").length,
    inProgress: documents.filter((d: Document) => d.status === "IN_PROGRESS" || d.status === "DRAFT").length,
    typeCount: [...new Set(documents.map((d: Document) => d.type))].length,
  }), [documents]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        <span className="ml-2 text-[var(--text-secondary)]">Loading documents...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-[var(--error)]" />
        <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
          Failed to load documents
        </p>
        <p className="text-[var(--text-secondary)]">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
      </div>
    );
  }

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
                  {stats.total}
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
                  {stats.filed}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Filed/Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {stats.inProgress}
                </p>
                <p className="text-sm text-[var(--text-muted)]">In Progress</p>
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
                  {stats.typeCount}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Document Types</p>
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map((docType) => (
              <SelectItem key={docType} value={docType}>
                {getDocumentTypeLabel(docType)}
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
                {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first document to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc: Document) => {
            const TypeIcon = typeIcons[doc.type] || File;
            const statusInfo = statusConfig[doc.status] || { label: doc.status, variant: "secondary" as const };
            const clientName = doc.client?.name || doc.engagement?.client?.name || "—";
            const docName = doc.name || doc.fileName || getDocumentTypeLabel(doc.type);

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
                          <h3 className="font-medium text-[var(--text-primary)]">{docName}</h3>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <span>{clientName}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{getDocumentTypeLabel(doc.type)}</span>
                          {doc.fileSize && (
                            <>
                              <span className="text-[var(--border-default)]">|</span>
                              <span>{formatFileSize(doc.fileSize)}</span>
                            </>
                          )}
                          {doc.engagement && (
                            <>
                              <span className="text-[var(--border-default)]">|</span>
                              <span>FY {doc.engagement.financialYear}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-[var(--text-muted)]">
                        {doc.acknowledgmentNo && (
                          <div className="flex items-center gap-1">
                            <span className="text-[var(--success)]">Ack: {doc.acknowledgmentNo}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(doc.updatedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.filePath && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
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
