"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileCheck,
  Scale,
  TrendingUp,
  IndianRupee,
  Play,
  Check,
  Clock,
  BarChart2,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import {
  useEngagement,
  useUpdateEngagementStatus,
  type Engagement,
  type EngagementStatus,
  ENGAGEMENT_STATUS_ORDER,
  getStatusLabel,
  getNextStatus,
  getPreviousStatus,
  getStatusIndex,
} from "@/lib/hooks/use-engagements";
import { useEngagementDocuments } from "@/lib/hooks/use-documents";
import { useEngagementDisputes } from "@/lib/hooks/use-disputes";

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "—";
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(1)} L`;
  }
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusColors: Record<EngagementStatus, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-800",
  DATA_COLLECTION: "bg-blue-100 text-blue-800",
  SAFE_HARBOUR_CHECK: "bg-purple-100 text-purple-800",
  BENCHMARKING: "bg-yellow-100 text-yellow-800",
  DOCUMENTATION: "bg-orange-100 text-orange-800",
  REVIEW: "bg-indigo-100 text-indigo-800",
  APPROVED: "bg-green-100 text-green-800",
  FILED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-teal-100 text-teal-800",
};

const statusIcons: Record<EngagementStatus, typeof FileText> = {
  NOT_STARTED: Clock,
  DATA_COLLECTION: FileSpreadsheet,
  SAFE_HARBOUR_CHECK: Shield,
  BENCHMARKING: BarChart2,
  DOCUMENTATION: FileText,
  REVIEW: Users,
  APPROVED: CheckCircle,
  FILED: FileCheck,
  COMPLETED: Check,
};

export default function EngagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = params.id as string;

  // Fetch engagement data
  const { data, isLoading, error } = useEngagement(engagementId);
  const { data: docsData } = useEngagementDocuments(engagementId);
  const { data: disputesData } = useEngagementDisputes(engagementId);

  const updateStatus = useUpdateEngagementStatus();

  const engagement = data?.engagement;
  const documents = docsData?.documents || [];
  const disputes = disputesData?.disputes || [];

  // Calculate workflow progress
  const workflowProgress = useMemo(() => {
    if (!engagement) return 0;
    const currentIndex = getStatusIndex(engagement.status);
    const totalSteps = ENGAGEMENT_STATUS_ORDER.length - 1; // -1 because we count steps, not statuses
    return Math.round((currentIndex / totalSteps) * 100);
  }, [engagement]);

  const handleAdvanceStatus = async () => {
    if (!engagement) return;
    const nextStatus = getNextStatus(engagement.status);
    if (nextStatus) {
      await updateStatus.mutateAsync({ id: engagementId, status: nextStatus });
    }
  };

  const handleRevertStatus = async () => {
    if (!engagement) return;
    const prevStatus = getPreviousStatus(engagement.status);
    if (prevStatus) {
      await updateStatus.mutateAsync({ id: engagementId, status: prevStatus });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        <span className="ml-2 text-[var(--text-secondary)]">Loading engagement...</span>
      </div>
    );
  }

  // Error state
  if (error || !engagement) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-[var(--error)]" />
        <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
          Failed to load engagement
        </p>
        <p className="text-[var(--text-secondary)]">
          {error instanceof Error ? error.message : "Engagement not found"}
        </p>
        <Button className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const nextStatus = getNextStatus(engagement.status);
  const prevStatus = getPreviousStatus(engagement.status);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/dashboard/clients" className="hover:text-[var(--text-primary)]">
          Clients
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/dashboard/clients/${engagement.clientId}`}
          className="hover:text-[var(--text-primary)]"
        >
          {engagement.client.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[var(--text-primary)]">FY {engagement.financialYear}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                  FY {engagement.financialYear}
                </h1>
                <Badge className={statusColors[engagement.status]}>
                  {getStatusLabel(engagement.status)}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                <span>{engagement.client.name}</span>
                <span className="text-[var(--border-default)]">|</span>
                <span>PAN: {engagement.client.pan}</span>
                <span className="text-[var(--border-default)]">|</span>
                <span>AY {engagement.assessmentYear}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Link href={`/dashboard/tools/form-3ceb?engagementId=${engagementId}`}>
            <Button>
              <FileText className="mr-1 h-4 w-4" />
              Generate Form 3CEB
            </Button>
          </Link>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Workflow Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              {prevStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevertStatus}
                  disabled={updateStatus.isPending}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to {getStatusLabel(prevStatus)}
                </Button>
              )}
              {nextStatus && (
                <Button
                  size="sm"
                  onClick={handleAdvanceStatus}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-1 h-4 w-4" />
                  )}
                  Advance to {getStatusLabel(nextStatus)}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">Overall Progress</span>
              <span className="font-medium">{workflowProgress}%</span>
            </div>
            <Progress value={workflowProgress} className="h-2" />
          </div>

          {/* Workflow Steps */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
            {ENGAGEMENT_STATUS_ORDER.map((status, index) => {
              const Icon = statusIcons[status];
              const currentIndex = getStatusIndex(engagement.status);
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={status} className="flex items-center">
                  <div
                    className={`flex flex-col items-center min-w-[100px] ${
                      isCurrent ? "opacity-100" : isCompleted ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-[var(--success)] text-white"
                          : isCurrent
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        isCurrent
                          ? "font-medium text-[var(--accent)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  {index < ENGAGEMENT_STATUS_ORDER.length - 1 && (
                    <div
                      className={`h-0.5 w-8 mx-1 ${
                        isCompleted ? "bg-[var(--success)]" : "bg-[var(--border-subtle)]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total RPT Value</p>
                <p className="text-2xl font-semibold text-[var(--accent)]">
                  {formatCurrency(engagement.totalRptValue)}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-[var(--accent)]/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Transactions</p>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {engagement._count?.transactions || 0}
                </p>
              </div>
              <BarChart2 className="h-8 w-8 text-[var(--info)]/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Documents</p>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {documents.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-[var(--warning)]/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Due Date</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">
                  {formatDate(engagement.dueDate)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-[var(--error)]/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          {(engagement.totalRevenue || engagement.operatingProfit) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Total Revenue</p>
                    <p className="text-xl font-semibold text-[var(--text-primary)]">
                      {formatCurrency(engagement.totalRevenue)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Operating Cost</p>
                    <p className="text-xl font-semibold text-[var(--text-primary)]">
                      {formatCurrency(engagement.operatingCost)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Operating Profit</p>
                    <p className="text-xl font-semibold text-[var(--success)]">
                      {formatCurrency(engagement.operatingProfit)}
                    </p>
                  </div>
                </div>

                {/* PLIs */}
                {(engagement.opOc || engagement.opOr || engagement.berryRatio) && (
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {engagement.opOc && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[var(--accent)]">
                          {(engagement.opOc * 100).toFixed(2)}%
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">OP/OC</p>
                      </div>
                    )}
                    {engagement.opOr && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[var(--accent)]">
                          {(engagement.opOr * 100).toFixed(2)}%
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">OP/OR</p>
                      </div>
                    )}
                    {engagement.berryRatio && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[var(--accent)]">
                          {engagement.berryRatio.toFixed(2)}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Berry Ratio</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Safe Harbour Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5" />
                Safe Harbour Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagement.safeHarbourEligible != null ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {engagement.safeHarbourEligible ? (
                      <CheckCircle className="h-8 w-8 text-[var(--success)]" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-[var(--warning)]" />
                    )}
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {engagement.safeHarbourEligible
                          ? "Eligible for Safe Harbour"
                          : "Not Eligible for Safe Harbour"}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {engagement.safeHarbourEligible
                          ? "Simplified compliance available under Section 92CB"
                          : "Full benchmarking analysis required"}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/tools/safe-harbour?engagementId=${engagementId}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-[var(--text-muted)]">
                    Safe harbour analysis not yet performed
                  </p>
                  <Link href={`/dashboard/tools/safe-harbour?engagementId=${engagementId}`}>
                    <Button size="sm">
                      <Play className="mr-1 h-4 w-4" />
                      Run Analysis
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benchmarking Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-5 w-5" />
                Benchmarking Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagement.benchmarkingCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-[var(--success)]" />
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          Benchmarking Completed
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {engagement.adjustmentRequired
                            ? `Adjustment required: ${formatCurrency(engagement.adjustmentAmount)}`
                            : "Within arm's length range"}
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/tools/benchmarking?engagementId=${engagementId}`}>
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-[var(--text-muted)]">
                    Benchmarking analysis not yet performed
                  </p>
                  <Link href={`/dashboard/tools/benchmarking?engagementId=${engagementId}`}>
                    <Button size="sm">
                      <Play className="mr-1 h-4 w-4" />
                      Start Analysis
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disputes */}
          {disputes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale className="h-5 w-5" />
                  Active Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {disputes.slice(0, 3).map((dispute) => (
                    <div
                      key={dispute.id}
                      className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-3"
                    >
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {dispute.caseNumber || `AY ${dispute.assessmentYear}`}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          Stage: {dispute.stage} | Amount: {formatCurrency(dispute.amountAtStake)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          dispute.status === "DECIDED"
                            ? "success"
                            : dispute.status === "PENDING_HEARING"
                            ? "warning"
                            : "info"
                        }
                      >
                        {dispute.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {disputes.length > 3 && (
                  <Link href={`/dashboard/disputes?engagementId=${engagementId}`}>
                    <Button variant="link" className="mt-2 px-0">
                      View all {disputes.length} disputes
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/dashboard/tools/form-3ceb?engagementId=${engagementId}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Form 3CEB
                </Button>
              </Link>
              <Link
                href={`/dashboard/tools/safe-harbour?engagementId=${engagementId}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Safe Harbour Check
                </Button>
              </Link>
              <Link
                href={`/dashboard/tools/benchmarking?engagementId=${engagementId}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Benchmarking Analysis
                </Button>
              </Link>
              <Link
                href={`/dashboard/tools/master-file?engagementId=${engagementId}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate Master File
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Documents</CardTitle>
                <Badge variant="secondary">{documents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-[var(--bg-secondary)]"
                    >
                      <FileText className="h-4 w-4 text-[var(--text-muted)]" />
                      <span className="flex-1 truncate text-sm">{doc.name || doc.type}</span>
                      <Badge variant="secondary" className="text-xs">
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                  {documents.length > 5 && (
                    <Link href={`/dashboard/documents?engagementId=${engagementId}`}>
                      <Button variant="link" size="sm" className="px-0">
                        View all documents
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No documents yet</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {engagement.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-secondary)]">{engagement.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Financial Year</span>
                <span className="font-medium">{engagement.financialYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Assessment Year</span>
                <span className="font-medium">{engagement.assessmentYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Due Date</span>
                <span className="font-medium">{formatDate(engagement.dueDate)}</span>
              </div>
              {engagement.filedDate && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Filed Date</span>
                  <span className="font-medium text-[var(--success)]">
                    {formatDate(engagement.filedDate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Created</span>
                <span className="font-medium">{formatDate(engagement.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Last Updated</span>
                <span className="font-medium">{formatDate(engagement.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
