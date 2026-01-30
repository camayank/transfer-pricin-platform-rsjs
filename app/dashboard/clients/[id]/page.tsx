"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  Download,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useClient } from "@/lib/hooks/use-clients";
import { useEngagements } from "@/lib/hooks/use-engagements";
import { useDocuments } from "@/lib/hooks/use-documents";

const statusConfig: Record<string, { label: string; variant: "secondary" | "warning" | "info" | "success" | "error" }> = {
  // Client statuses
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "secondary" },
  // Engagement statuses (enum values)
  NOT_STARTED: { label: "Not Started", variant: "secondary" },
  DATA_COLLECTION: { label: "Data Collection", variant: "warning" },
  ANALYSIS: { label: "Analysis", variant: "warning" },
  DOCUMENTATION: { label: "Documentation", variant: "info" },
  REVIEW: { label: "Review", variant: "info" },
  FILING: { label: "Filing", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  // Document statuses (enum values)
  DRAFT: { label: "Draft", variant: "warning" },
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  FILED: { label: "Filed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "error" },
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

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "engagements" | "transactions" | "documents">("overview");

  // Fetch real data from API
  const { data: clientResponse, isLoading: clientLoading, error: clientError } = useClient(clientId);
  const { data: engagementsResponse } = useEngagements({ clientId });
  const { data: documentsResponse } = useDocuments({ clientId });

  const clientData = clientResponse?.client;
  // Use data from separate hooks (client API includes them but type doesn't expose them)
  const engagements = engagementsResponse?.engagements || [];
  const documents = documentsResponse?.documents || [];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "engagements", label: `Engagements (${engagements.length})` },
    { id: "transactions", label: "Transactions" },
    { id: "documents", label: `Documents (${documents.length})` },
  ];

  // Loading state
  if (clientLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // Error state
  if (clientError || !clientData) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-[var(--error)]" />
        <p className="text-lg text-[var(--text-primary)]">Client not found</p>
        <Link href="/dashboard/clients">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/dashboard/clients" className="hover:text-[var(--text-primary)]">
          Clients
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[var(--text-primary)]">{clientData.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                  {clientData.name}
                </h1>
                <Badge variant={statusConfig[clientData.status || "active"]?.variant || "secondary"}>
                  {statusConfig[clientData.status || "active"]?.label || "Active"}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                <span>PAN: {clientData.pan}</span>
                {clientData.industry && (
                  <>
                    <span className="text-[var(--border-default)]">|</span>
                    <span>{clientData.industry}</span>
                  </>
                )}
                {clientData.nicCode && (
                  <>
                    <span className="text-[var(--border-default)]">|</span>
                    <span>NIC: {clientData.nicCode}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/clients/${clientId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/engagements/new?clientId=${clientId}`}>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              New Engagement
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-subtle)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[var(--text-muted)]">Total Engagements</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">
                    {engagements.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[var(--text-muted)]">Active Engagements</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                    {engagements.filter((e) => e.status !== "COMPLETED").length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[var(--text-muted)]">Documents</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                    {documents.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {clientData.contactPerson && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Contact Person</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {clientData.contactPerson}
                        </p>
                      </div>
                    </div>
                  )}
                  {clientData.contactEmail && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Email</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {clientData.contactEmail}
                        </p>
                      </div>
                    </div>
                  )}
                  {clientData.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Phone</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {clientData.contactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                  {clientData.website && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Website</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {clientData.website}
                        </p>
                      </div>
                    </div>
                  )}
                  {!clientData.contactPerson && !clientData.contactEmail && !clientData.contactPhone && !clientData.website && (
                    <p className="col-span-2 text-sm text-[var(--text-muted)]">No contact information available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            {(clientData.address || clientData.city || clientData.state) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Registered Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      {clientData.address && (
                        <p className="text-[var(--text-primary)]">{clientData.address}</p>
                      )}
                      {(clientData.city || clientData.state || clientData.pincode) && (
                        <p className="text-[var(--text-secondary)]">
                          {[clientData.city, clientData.state, clientData.pincode].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <p className="text-[var(--text-muted)]">{clientData.country || "India"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Group Structure */}
            {(clientData.ultimateParent || clientData.parentCompany) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Group Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientData.ultimateParent && (
                      <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-4">
                        <div>
                          <p className="text-sm text-[var(--text-muted)]">Ultimate Parent Company</p>
                          <p className="font-medium text-[var(--text-primary)]">
                            {clientData.ultimateParent}
                          </p>
                        </div>
                        {clientData.ultimateParentCountry && (
                          <Badge variant="secondary">{clientData.ultimateParentCountry}</Badge>
                        )}
                      </div>
                    )}
                    {clientData.parentCompany && (
                      <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-4">
                        <div>
                          <p className="text-sm text-[var(--text-muted)]">Immediate Parent Company</p>
                          <p className="font-medium text-[var(--text-primary)]">
                            {clientData.parentCompany}
                          </p>
                        </div>
                        {clientData.parentCountry && (
                          <Badge variant="secondary">{clientData.parentCountry}</Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-glow)] p-4">
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Indian Entity (Assessee)</p>
                        <p className="font-medium text-[var(--accent)]">{clientData.name}</p>
                      </div>
                      <Badge variant="info">India</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entity Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Entity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">PAN</p>
                  <p className="font-mono font-medium text-[var(--text-primary)]">
                    {clientData.pan}
                  </p>
                </div>
                {clientData.tan && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">TAN</p>
                    <p className="font-mono font-medium text-[var(--text-primary)]">
                      {clientData.tan}
                    </p>
                  </div>
                )}
                {clientData.cin && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">CIN</p>
                    <p className="font-mono text-sm font-medium text-[var(--text-primary)]">
                      {clientData.cin}
                    </p>
                  </div>
                )}
                {clientData.nicCode && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">NIC Code</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {clientData.nicCode}{clientData.nicDescription ? ` - ${clientData.nicDescription}` : ""}
                    </p>
                  </div>
                )}
                {clientData.consolidatedRevenue && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Consolidated Revenue</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {formatCurrency(Number(clientData.consolidatedRevenue))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clientData.assignedTo && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Assigned To</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-glow)] text-sm font-medium text-[var(--accent)]">
                        {(clientData.assignedTo.name || "U").split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">
                        {clientData.assignedTo.name || "Unassigned"}
                      </span>
                    </div>
                  </div>
                )}
                {engagements.length > 0 && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Latest Financial Year</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {engagements[0]?.financialYear || "N/A"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Client Since</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {new Date(clientData.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Form 3CEB
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download TP Study
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Deadlines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "engagements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">
              Engagement History
            </h2>
            <Link href={`/dashboard/engagements/new?clientId=${clientId}`}>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New Engagement
              </Button>
            </Link>
          </div>
          {engagements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-[var(--text-muted)]">No engagements yet</p>
                <Link href={`/dashboard/engagements/new?clientId=${clientId}`}>
                  <Button className="mt-4">
                    <Plus className="mr-1 h-4 w-4" />
                    Create First Engagement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            engagements.map((engagement) => (
              <Card key={engagement.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">
                            FY {engagement.financialYear}
                          </h3>
                          <Badge variant={statusConfig[engagement.status]?.variant || "secondary"}>
                            {statusConfig[engagement.status]?.label || engagement.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                          Assessment Year: {engagement.assessmentYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-muted)]">Priority</p>
                        <Badge variant={engagement.priority === "HIGH" ? "error" : engagement.priority === "MEDIUM" ? "warning" : "secondary"}>
                          {engagement.priority}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-muted)]">Created</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {new Date(engagement.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Link href={`/dashboard/engagements/${engagement.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">
              International Transactions
            </h2>
          </div>
          {engagements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-[var(--text-muted)]">
                  Create an engagement first to add transactions
                </p>
                <Link href={`/dashboard/engagements/new?clientId=${clientId}`}>
                  <Button className="mt-4">
                    <Plus className="mr-1 h-4 w-4" />
                    Create Engagement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-[var(--text-primary)]">
                  Transactions are managed per engagement
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Select an engagement to view and manage its transactions
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {engagements.slice(0, 5).map((engagement) => (
                    <Link key={engagement.id} href={`/dashboard/engagements/${engagement.id}`}>
                      <Button variant="outline" size="sm">
                        FY {engagement.financialYear}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">Documents</h2>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Upload Document
            </Button>
          </div>
          {documents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-[var(--text-muted)]">No documents uploaded yet</p>
                <Button className="mt-4">
                  <Plus className="mr-1 h-4 w-4" />
                  Upload First Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {doc.name || doc.fileName || "Untitled Document"}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <span>{doc.type}</span>
                            {doc.fileSize && (
                              <>
                                <span className="text-[var(--border-default)]">|</span>
                                <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                              </>
                            )}
                            <span className="text-[var(--border-default)]">|</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusConfig[doc.status]?.variant || "secondary"}>
                          {statusConfig[doc.status]?.label || doc.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
