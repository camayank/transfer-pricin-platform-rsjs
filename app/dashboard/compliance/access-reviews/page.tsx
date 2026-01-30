"use client";

import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  User,
  ChevronRight,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import {
  useAccessReviews,
  useAccessReview,
  useCreateAccessReview,
  useSubmitReviewDecision,
  type AccessReview,
  type AccessReviewItem,
} from "@/lib/hooks";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "error" },
};

const itemStatusConfig: Record<string, { label: string; variant: "secondary" | "success" | "error" }> = {
  PENDING: { label: "Pending Review", variant: "secondary" },
  APPROVE: { label: "Approved", variant: "success" },
  REVOKE: { label: "Revoked", variant: "error" },
  MODIFY: { label: "Modified", variant: "secondary" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AccessReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const limit = 20;

  // Form state for creating new review
  const [newReview, setNewReview] = useState({
    name: "",
    description: "",
    scope: "ALL_USERS",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // API hooks
  const { data: reviewsData, isLoading, error, refetch } = useAccessReviews({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit,
  });

  const { data: selectedReviewData, isLoading: isLoadingReview } = useAccessReview(selectedReviewId || "");
  const createReview = useCreateAccessReview();
  const submitDecision = useSubmitReviewDecision();

  const handleCreateReview = () => {
    if (!newReview.name) {
      alert("Review name is required");
      return;
    }

    createReview.mutate(
      {
        ...newReview,
        reviewerIds: [], // Will need to add a reviewer selector in a full implementation
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewReview({
            name: "",
            description: "",
            scope: "ALL_USERS",
            startDate: new Date().toISOString().split("T")[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          });
        },
        onError: (err) => {
          alert(`Failed to create review: ${err.message}`);
        },
      }
    );
  };

  const handleDecision = (reviewId: string, itemId: string, decision: "APPROVE" | "REVOKE" | "MODIFY") => {
    submitDecision.mutate(
      { reviewId, itemId, decision },
      {
        onError: (err) => {
          alert(`Failed to submit decision: ${err.message}`);
        },
      }
    );
  };

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats;
  const pagination = reviewsData?.pagination;
  const selectedReview = selectedReviewData?.review;
  const selectedReviewItems = selectedReview?.items || [];

  // Filter locally for search
  const filteredReviews = searchQuery
    ? reviews.filter(
        (review) =>
          review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (review.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      )
    : reviews;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Access Reviews</h1>
          <p className="text-[var(--text-secondary)]">
            Periodic access certification and review campaigns
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              New Review Cycle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Access Review Cycle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Review Name *</Label>
                <Input
                  id="name"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="Q1 2025 Access Review"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newReview.description}
                  onChange={(e) => setNewReview({ ...newReview, description: e.target.value })}
                  placeholder="Quarterly review of all user access rights"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select
                  value={newReview.scope}
                  onValueChange={(v) => setNewReview({ ...newReview, scope: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_USERS">All Users</SelectItem>
                    <SelectItem value="SPECIFIC_ROLES">Specific Roles</SelectItem>
                    <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newReview.startDate}
                    onChange={(e) => setNewReview({ ...newReview, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newReview.dueDate}
                    onChange={(e) => setNewReview({ ...newReview, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReview} disabled={createReview.isPending}>
                  {createReview.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Create Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.total || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Review Cycles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.inProgress || 0}
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
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.pendingItems || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Pending Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--error-bg)] p-2 text-[var(--error)]">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {stats?.revokedItems || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Access Revoked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
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

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading access reviews..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load access reviews"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Review Cycles */}
          <div className="space-y-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Review Cycles</h2>
            {filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShieldCheck className="h-12 w-12 text-[var(--text-muted)]" />
                  <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                    No review cycles found
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Create your first access review cycle
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReviews.map((review) => (
                <Card
                  key={review.id}
                  className={`cursor-pointer transition-colors hover:border-[var(--border-default)] ${
                    selectedReviewId === review.id ? "border-[var(--accent)]" : ""
                  }`}
                  onClick={() => setSelectedReviewId(review.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">{review.name}</h3>
                          <Badge variant={statusConfig[review.status]?.variant || "secondary"}>
                            {statusConfig[review.status]?.label || review.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{review.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Progress</span>
                        <span className="text-[var(--text-primary)]">
                          {review.completedItems}/{review.totalItems} reviewed
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-secondary)]">
                        <div
                          className="h-2 rounded-full bg-[var(--accent)]"
                          style={{
                            width: `${review.totalItems > 0 ? (review.completedItems / review.totalItems) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        {review.approvedItems} approved
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        {review.revokedItems} revoked
                      </span>
                      <span className="flex items-center gap-1 text-[var(--text-muted)]">
                        <Calendar className="h-4 w-4" />
                        Due {formatDate(review.dueDate)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Review Items */}
          <div className="space-y-4">
            <h2 className="font-semibold text-[var(--text-primary)]">
              {selectedReviewId ? "Review Items" : "Select a review cycle"}
            </h2>
            {selectedReviewId ? (
              isLoadingReview ? (
                <LoadingState message="Loading review items..." />
              ) : selectedReviewItems.length > 0 ? (
                selectedReviewItems.map((item) => (
                  <Card key={item.id} className="hover:border-[var(--border-default)] transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
                            <User className="h-5 w-5 text-[var(--text-muted)]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-[var(--text-primary)]">
                                {item.user?.name || "Unknown User"}
                              </h4>
                              <Badge variant={itemStatusConfig[item.decision || "PENDING"]?.variant || "secondary"}>
                                {itemStatusConfig[item.decision || "PENDING"]?.label || "Pending"}
                              </Badge>
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">{item.user?.email || item.userId}</p>
                            <p className="text-xs text-[var(--text-muted)]">
                              Role: {item.currentRole}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Current Access */}
                      {item.currentAccess && (
                        <div className="mt-3">
                          <p className="mb-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
                            Current Access
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {Object.keys(item.currentAccess).slice(0, 5).map((perm, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                              >
                                {perm}
                              </span>
                            ))}
                            {Object.keys(item.currentAccess).length > 5 && (
                              <span className="text-xs text-[var(--text-muted)]">
                                +{Object.keys(item.currentAccess).length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {!item.decision && selectedReviewId && (
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-500 border-green-500 hover:bg-green-500/10"
                            onClick={() => handleDecision(selectedReviewId, item.id, "APPROVE")}
                            disabled={submitDecision.isPending}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-500 hover:bg-red-500/10"
                            onClick={() => handleDecision(selectedReviewId, item.id, "REVOKE")}
                            disabled={submitDecision.isPending}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Revoke
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(selectedReviewId, item.id, "MODIFY")}
                            disabled={submitDecision.isPending}
                          >
                            Modify
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-[var(--text-muted)]" />
                    <p className="mt-4 text-[var(--text-secondary)]">
                      No items in this review
                    </p>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShieldCheck className="h-12 w-12 text-[var(--text-muted)]" />
                  <p className="mt-4 text-[var(--text-secondary)]">
                    Select a review cycle to see items
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of{" "}
            {pagination.total} reviews
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-[var(--text-muted)]">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
