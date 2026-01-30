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
  Workflow,
  Plus,
  Search,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  MoreHorizontal,
  ArrowRight,
  Zap,
} from "lucide-react";

// Sample playbook data
const samplePlaybooks = [
  {
    id: "1",
    name: "New Client Onboarding",
    description: "30-day structured onboarding journey for new clients",
    triggerCondition: "client.status === 'NEW'",
    stages: [
      { name: "Welcome Call", duration: "Day 1-2" },
      { name: "Data Collection", duration: "Day 3-7" },
      { name: "System Setup", duration: "Day 8-14" },
      { name: "Training", duration: "Day 15-25" },
      { name: "Go-Live Support", duration: "Day 26-30" },
    ],
    activeExecutions: 3,
    completedExecutions: 45,
    avgCompletionDays: 28,
    isActive: true,
  },
  {
    id: "2",
    name: "At-Risk Client Recovery",
    description: "Intervention playbook for clients with declining health scores",
    triggerCondition: "healthScore < 60",
    stages: [
      { name: "Alert Review", duration: "Day 1" },
      { name: "Executive Outreach", duration: "Day 2-3" },
      { name: "Issue Resolution", duration: "Day 4-14" },
      { name: "Follow-up Review", duration: "Day 15-21" },
    ],
    activeExecutions: 2,
    completedExecutions: 12,
    avgCompletionDays: 18,
    isActive: true,
  },
  {
    id: "3",
    name: "Renewal Preparation",
    description: "60-day renewal engagement workflow",
    triggerCondition: "daysToRenewal <= 60",
    stages: [
      { name: "Renewal Alert", duration: "Day 1" },
      { name: "Usage Review", duration: "Day 2-7" },
      { name: "Value Discussion", duration: "Day 8-21" },
      { name: "Proposal", duration: "Day 22-35" },
      { name: "Negotiation", duration: "Day 36-50" },
      { name: "Closure", duration: "Day 51-60" },
    ],
    activeExecutions: 5,
    completedExecutions: 28,
    avgCompletionDays: 52,
    isActive: true,
  },
  {
    id: "4",
    name: "Upsell Opportunity",
    description: "Guided process for expansion opportunities",
    triggerCondition: "healthScore >= 85 && monthsActive >= 6",
    stages: [
      { name: "Opportunity Identification", duration: "Day 1-3" },
      { name: "Needs Assessment", duration: "Day 4-10" },
      { name: "Solution Proposal", duration: "Day 11-20" },
      { name: "Contract Expansion", duration: "Day 21-30" },
    ],
    activeExecutions: 1,
    completedExecutions: 8,
    avgCompletionDays: 25,
    isActive: false,
  },
];

// Sample executions
const sampleExecutions = [
  {
    id: "exec-1",
    playbookId: "1",
    playbookName: "New Client Onboarding",
    clientName: "NewTech Solutions",
    currentStage: 2,
    totalStages: 5,
    startedAt: "2025-01-15",
    status: "IN_PROGRESS",
    assignedTo: "Priya S.",
  },
  {
    id: "exec-2",
    playbookId: "2",
    playbookName: "At-Risk Client Recovery",
    clientName: "Auto Parts Manufacturing",
    currentStage: 3,
    totalStages: 4,
    startedAt: "2025-01-20",
    status: "IN_PROGRESS",
    assignedTo: "Rahul M.",
  },
  {
    id: "exec-3",
    playbookId: "3",
    playbookName: "Renewal Preparation",
    clientName: "TechCorp India Pvt Ltd",
    currentStage: 4,
    totalStages: 6,
    startedAt: "2025-01-01",
    status: "IN_PROGRESS",
    assignedTo: "Amit K.",
  },
];

export default function PlaybooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"templates" | "executions">("templates");

  const filteredPlaybooks = samplePlaybooks.filter((playbook) =>
    playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playbook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExecutions = sampleExecutions.filter((execution) =>
    execution.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    execution.playbookName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Success Playbooks</h1>
          <p className="text-[var(--text-secondary)]">
            Automated workflows for customer success journeys
          </p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Create Playbook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {samplePlaybooks.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Playbooks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {samplePlaybooks.reduce((sum, p) => sum + p.activeExecutions, 0)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Active Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {samplePlaybooks.reduce((sum, p) => sum + p.completedExecutions, 0)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {samplePlaybooks.filter((p) => p.isActive).length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Active Playbooks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle & Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg bg-[var(--bg-secondary)] p-1">
          <button
            onClick={() => setView("templates")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === "templates"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setView("executions")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === "executions"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Active Executions
          </button>
        </div>
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder={view === "templates" ? "Search playbooks..." : "Search executions..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {view === "templates" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPlaybooks.map((playbook) => (
            <Card key={playbook.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{playbook.name}</CardTitle>
                      {playbook.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Paused</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{playbook.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Stages Preview */}
                <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-2">
                  {playbook.stages.map((stage, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="whitespace-nowrap rounded bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-muted)]">
                        {stage.name}
                      </span>
                      {idx < playbook.stages.length - 1 && (
                        <ArrowRight className="mx-1 h-3 w-3 text-[var(--text-muted)]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {playbook.activeExecutions} active
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {playbook.completedExecutions} completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm">
                      <Play className="mr-1 h-3 w-3" />
                      Trigger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExecutions.map((execution) => (
            <Card key={execution.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)]">
                      <Workflow className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">{execution.clientName}</h3>
                        <Badge variant="info">{execution.playbookName}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {execution.assignedTo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Started {execution.startedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Stage {execution.currentStage} of {execution.totalStages}
                      </p>
                      <div className="mt-1 h-2 w-32 rounded-full bg-[var(--bg-secondary)]">
                        <div
                          className="h-2 rounded-full bg-[var(--accent)]"
                          style={{
                            width: `${(execution.currentStage / execution.totalStages) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <Button size="sm">
                      <ArrowRight className="mr-1 h-3 w-3" />
                      Advance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
