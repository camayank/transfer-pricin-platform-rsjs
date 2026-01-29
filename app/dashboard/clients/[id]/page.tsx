"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";

// Sample client data (would come from API in real app)
const clientData = {
  id: "1",
  name: "TechCorp India Pvt Ltd",
  pan: "AABCT1234A",
  tan: "BLRT12345A",
  cin: "U72200KA2015PTC123456",
  industry: "IT Services",
  nicCode: "6201",
  nicDescription: "Computer programming activities",
  contactPerson: "Rahul Sharma",
  contactEmail: "rahul@techcorp.com",
  contactPhone: "9876543210",
  address: "123, Tech Park, Electronic City",
  city: "Bangalore",
  state: "Karnataka",
  pincode: "560100",
  country: "India",
  website: "www.techcorp.com",
  status: "in_progress",
  assignedTo: "Priya Sharma",
  createdAt: "2024-01-15",
  financialYear: "2025-26",
  parentCompany: "TechCorp Global Inc.",
  parentCountry: "USA",
  ultimateParent: "TechCorp Holdings LLC",
  ultimateParentCountry: "USA",
  consolidatedRevenue: 850_00_00_000,
  totalRptValue: 82_00_00_000,
};

const engagements = [
  {
    id: "1",
    year: "2025-26",
    status: "in_progress",
    dueDate: "2025-10-31",
    form3cebStatus: "draft",
    masterFileStatus: "not_started",
    localFileStatus: "not_started",
    assignedTo: "Priya S.",
    progress: 35,
  },
  {
    id: "2",
    year: "2024-25",
    status: "filed",
    dueDate: "2024-10-31",
    form3cebStatus: "filed",
    masterFileStatus: "filed",
    localFileStatus: "filed",
    assignedTo: "Rahul M.",
    progress: 100,
  },
];

const transactions = [
  {
    id: "1",
    natureCode: "01",
    description: "Purchase of raw materials",
    counterparty: "TechCorp US Inc",
    country: "USA",
    method: "TNMM",
    amount: 25_00_00_000,
    currency: "USD",
    status: "documented",
  },
  {
    id: "2",
    natureCode: "03",
    description: "IT enabled services (ITES)",
    counterparty: "TechCorp Singapore Pte Ltd",
    country: "Singapore",
    method: "TNMM",
    amount: 45_00_00_000,
    currency: "INR",
    status: "documented",
  },
  {
    id: "3",
    natureCode: "06",
    description: "Payment for technical services",
    counterparty: "TechCorp Japan KK",
    country: "Japan",
    method: "CUP",
    amount: 12_00_00_000,
    currency: "JPY",
    status: "pending",
  },
];

const documents = [
  {
    id: "1",
    name: "Transfer Pricing Study 2024-25.pdf",
    type: "TP Study",
    uploadedAt: "2024-08-15",
    size: "2.4 MB",
    status: "approved",
  },
  {
    id: "2",
    name: "Form 3CEB Draft FY 2025-26.json",
    type: "Form 3CEB",
    uploadedAt: "2025-09-20",
    size: "124 KB",
    status: "draft",
  },
  {
    id: "3",
    name: "Intercompany Agreement - TechCorp US.pdf",
    type: "Agreement",
    uploadedAt: "2024-01-10",
    size: "1.8 MB",
    status: "approved",
  },
  {
    id: "4",
    name: "Benchmarking Analysis Q2 2025.xlsx",
    type: "Benchmarking",
    uploadedAt: "2025-07-30",
    size: "856 KB",
    status: "review",
  },
];

const statusConfig: Record<string, { label: string; variant: "secondary" | "warning" | "info" | "success" | "error" }> = {
  not_started: { label: "Not Started", variant: "secondary" },
  draft: { label: "Draft", variant: "warning" },
  in_progress: { label: "In Progress", variant: "warning" },
  review: { label: "Review", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  documented: { label: "Documented", variant: "success" },
  approved: { label: "Approved", variant: "success" },
  filed: { label: "Filed", variant: "success" },
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
  const [activeTab, setActiveTab] = useState<"overview" | "engagements" | "transactions" | "documents">("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "engagements", label: "Engagements" },
    { id: "transactions", label: "Transactions" },
    { id: "documents", label: "Documents" },
  ];

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
                <Badge variant={statusConfig[clientData.status].variant}>
                  {statusConfig[clientData.status].label}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                <span>PAN: {clientData.pan}</span>
                <span className="text-[var(--border-default)]">|</span>
                <span>{clientData.industry}</span>
                <span className="text-[var(--border-default)]">|</span>
                <span>NIC: {clientData.nicCode}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            New Engagement
          </Button>
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
                  <p className="text-sm text-[var(--text-muted)]">Total RPT Value</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">
                    {formatCurrency(clientData.totalRptValue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[var(--text-muted)]">Active Engagements</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                    {engagements.filter((e) => e.status !== "filed").length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[var(--text-muted)]">Transactions</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                    {transactions.length}
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
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Phone</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        +91 {clientData.contactPhone}
                      </p>
                    </div>
                  </div>
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
                </div>
              </CardContent>
            </Card>

            {/* Address */}
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
                    <p className="text-[var(--text-primary)]">{clientData.address}</p>
                    <p className="text-[var(--text-secondary)]">
                      {clientData.city}, {clientData.state} - {clientData.pincode}
                    </p>
                    <p className="text-[var(--text-muted)]">{clientData.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Group Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-4">
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Ultimate Parent Company</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {clientData.ultimateParent}
                      </p>
                    </div>
                    <Badge variant="secondary">{clientData.ultimateParentCountry}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-4">
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Immediate Parent Company</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {clientData.parentCompany}
                      </p>
                    </div>
                    <Badge variant="secondary">{clientData.parentCountry}</Badge>
                  </div>
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
                <div>
                  <p className="text-sm text-[var(--text-muted)]">TAN</p>
                  <p className="font-mono font-medium text-[var(--text-primary)]">
                    {clientData.tan}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">CIN</p>
                  <p className="font-mono text-sm font-medium text-[var(--text-primary)]">
                    {clientData.cin}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">NIC Code</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {clientData.nicCode} - {clientData.nicDescription}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Consolidated Revenue</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(clientData.consolidatedRevenue)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Assigned To</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-glow)] text-sm font-medium text-[var(--accent)]">
                      {clientData.assignedTo.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">
                      {clientData.assignedTo}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Financial Year</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {clientData.financialYear}
                  </p>
                </div>
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
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              New Engagement
            </Button>
          </div>
          {engagements.map((engagement) => (
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
                          FY {engagement.year}
                        </h3>
                        <Badge variant={statusConfig[engagement.status].variant}>
                          {statusConfig[engagement.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        Due: {new Date(engagement.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Badge variant={statusConfig[engagement.form3cebStatus].variant} className="text-xs">
                          {statusConfig[engagement.form3cebStatus].label}
                        </Badge>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Form 3CEB</p>
                      </div>
                      <div>
                        <Badge variant={statusConfig[engagement.masterFileStatus].variant} className="text-xs">
                          {statusConfig[engagement.masterFileStatus].label}
                        </Badge>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Master File</p>
                      </div>
                      <div>
                        <Badge variant={statusConfig[engagement.localFileStatus].variant} className="text-xs">
                          {statusConfig[engagement.localFileStatus].label}
                        </Badge>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Local File</p>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Progress</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {engagement.progress}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                        <div
                          className={`h-full ${
                            engagement.progress === 100
                              ? "bg-[var(--success)]"
                              : "bg-[var(--accent)]"
                          }`}
                          style={{ width: `${engagement.progress}%` }}
                        />
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">
              International Transactions
            </h2>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                        Nature
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                        Counterparty
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                        Method
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-muted)]">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-[var(--text-muted)]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-muted)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="border-b border-[var(--border-subtle)] last:border-0"
                      >
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{txn.natureCode}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--text-primary)]">
                            {txn.description}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[var(--text-primary)]">{txn.counterparty}</p>
                          <p className="text-sm text-[var(--text-muted)]">{txn.country}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{txn.method}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-medium text-[var(--text-primary)]">
                            {formatCurrency(txn.amount)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={statusConfig[txn.status].variant}>
                            {statusConfig[txn.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
                        <p className="font-medium text-[var(--text-primary)]">{doc.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <span>{doc.type}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{doc.size}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[doc.status].variant}>
                        {statusConfig[doc.status].label}
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
        </div>
      )}
    </div>
  );
}
