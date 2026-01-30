"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Plus,
  Search,
  Star,
  StarOff,
  MoreHorizontal,
  Eye,
  Edit,
  Share2,
  Clock,
  Users,
} from "lucide-react";

// Sample dashboard data
const sampleDashboards = [
  {
    id: "1",
    name: "Executive Overview",
    description: "High-level metrics for leadership team",
    isDefault: true,
    isShared: true,
    widgetCount: 8,
    lastViewed: "2025-01-30",
    viewCount: 156,
    createdBy: "Admin",
    refreshInterval: 300,
  },
  {
    id: "2",
    name: "Client Health Dashboard",
    description: "Monitor client engagement and satisfaction",
    isDefault: false,
    isShared: true,
    widgetCount: 6,
    lastViewed: "2025-01-29",
    viewCount: 89,
    createdBy: "Priya S.",
    refreshInterval: 600,
  },
  {
    id: "3",
    name: "Compliance Tracker",
    description: "Track filing deadlines and completion status",
    isDefault: false,
    isShared: false,
    widgetCount: 5,
    lastViewed: "2025-01-28",
    viewCount: 45,
    createdBy: "Rahul M.",
    refreshInterval: 900,
  },
  {
    id: "4",
    name: "Team Performance",
    description: "Individual and team productivity metrics",
    isDefault: false,
    isShared: true,
    widgetCount: 7,
    lastViewed: "2025-01-27",
    viewCount: 67,
    createdBy: "Admin",
    refreshInterval: 600,
  },
];

export default function DashboardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSharedOnly, setShowSharedOnly] = useState(false);

  const filteredDashboards = sampleDashboards.filter((dashboard) => {
    const matchesSearch =
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShared = !showSharedOnly || dashboard.isShared;
    return matchesSearch && matchesShared;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Custom Dashboards</h1>
          <p className="text-[var(--text-secondary)]">
            Create and manage interactive dashboards
          </p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          New Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleDashboards.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Dashboards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleDashboards.filter((d) => d.isShared).length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Shared</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleDashboards.reduce((sum, d) => sum + d.viewCount, 0)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleDashboards.filter((d) => d.isDefault).length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Default</p>
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
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showSharedOnly ? "default" : "outline"}
          onClick={() => setShowSharedOnly(!showSharedOnly)}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Shared Only
        </Button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDashboards.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LayoutDashboard className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No dashboards found
              </p>
              <p className="text-[var(--text-secondary)]">
                Create your first custom dashboard
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDashboards.map((dashboard) => (
            <Card key={dashboard.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{dashboard.name}</CardTitle>
                    {dashboard.isDefault && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{dashboard.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-4 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    {dashboard.widgetCount} widgets
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {dashboard.viewCount} views
                  </div>
                  {dashboard.isShared && (
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      Shared
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Users className="h-4 w-4" />
                    {dashboard.createdBy}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button size="sm">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
