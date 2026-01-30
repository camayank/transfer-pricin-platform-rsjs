"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Loader2,
  RefreshCw,
  MessageSquare,
  Star,
  AlertCircle,
} from "lucide-react";

interface Feedback {
  id: string;
  entityType: string;
  entityId: string;
  feedbackType: string;
  rating?: number;
  content: string;
  sentiment?: string;
  requiresFollowUp: boolean;
  followUpCompletedAt?: string;
  response?: string;
  createdAt: string;
}

const feedbackTypeConfig: Record<string, { label: string; icon: typeof MessageSquare }> = {
  SERVICE_FEEDBACK: { label: "Service Feedback", icon: MessageSquare },
  PRODUCT_FEEDBACK: { label: "Product Feedback", icon: MessageSquare },
  COMPLAINT: { label: "Complaint", icon: AlertCircle },
  SUGGESTION: { label: "Suggestion", icon: MessageSquare },
  COMPLIMENT: { label: "Compliment", icon: ThumbsUp },
  NPS: { label: "NPS Score", icon: Star },
};

const sentimentConfig: Record<string, { label: string; color: string; icon: typeof ThumbsUp }> = {
  POSITIVE: { label: "Positive", color: "text-green-500", icon: ThumbsUp },
  NEUTRAL: { label: "Neutral", color: "text-yellow-500", icon: Minus },
  NEGATIVE: { label: "Negative", color: "text-red-500", icon: ThumbsDown },
};

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("feedbackType", typeFilter);

      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [typeFilter]);

  // Stats
  const totalFeedback = feedbacks.length;
  const positiveFeedback = feedbacks.filter((f) => f.sentiment === "POSITIVE").length;
  const negativeFeedback = feedbacks.filter((f) => f.sentiment === "NEGATIVE").length;
  const pendingFollowUp = feedbacks.filter((f) => f.requiresFollowUp && !f.followUpCompletedAt).length;
  const avgRating = feedbacks.filter((f) => f.rating).length > 0
    ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter((f) => f.rating).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Customer Feedback</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage customer feedback and satisfaction
          </p>
        </div>
        <Button variant="outline" onClick={fetchFeedbacks}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {totalFeedback}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <ThumbsUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {positiveFeedback}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Positive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--error-bg)] p-2 text-[var(--error)]">
                <ThumbsDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {negativeFeedback}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Negative</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {pendingFollowUp}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Pending Follow-up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Feedback Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(feedbackTypeConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
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
              <Button variant="outline" className="mt-4" onClick={fetchFeedbacks}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : feedbacks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No feedback found
              </p>
              <p className="text-[var(--text-secondary)]">
                {typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Customer feedback will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          feedbacks.map((feedback) => {
            const SentimentIcon = feedback.sentiment ? sentimentConfig[feedback.sentiment]?.icon : Minus;
            return (
              <Card key={feedback.id} className="hover:border-[var(--border-default)] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {feedbackTypeConfig[feedback.feedbackType]?.label || feedback.feedbackType}
                        </Badge>
                        {feedback.sentiment && (
                          <span className={`flex items-center gap-1 text-sm ${sentimentConfig[feedback.sentiment]?.color || ""}`}>
                            <SentimentIcon className="h-4 w-4" />
                            {sentimentConfig[feedback.sentiment]?.label}
                          </span>
                        )}
                        {feedback.rating && (
                          <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {feedback.rating}/5
                          </span>
                        )}
                        {feedback.requiresFollowUp && !feedback.followUpCompletedAt && (
                          <Badge variant="warning">Needs Follow-up</Badge>
                        )}
                      </div>
                      <p className="text-[var(--text-primary)]">{feedback.content}</p>
                      {feedback.response && (
                        <div className="mt-3 rounded-lg bg-[var(--bg-secondary)] p-3">
                          <p className="text-sm text-[var(--text-muted)]">Response:</p>
                          <p className="text-sm text-[var(--text-secondary)]">{feedback.response}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-[var(--text-muted)]">
                      <p>{new Date(feedback.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs">{feedback.entityType}</p>
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
