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
  CheckSquare,
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Filter,
} from "lucide-react";

// Sample task data
const sampleTasks = [
  {
    id: "1",
    title: "Collect financial statements from client",
    projectName: "TechCorp TP Compliance 2025",
    assignee: "Priya Sharma",
    dueDate: "2025-02-05",
    priority: "HIGH",
    status: "IN_PROGRESS",
    estimatedHours: 4,
    loggedHours: 2,
  },
  {
    id: "2",
    title: "Prepare comparable company analysis",
    projectName: "TechCorp TP Compliance 2025",
    assignee: "Rahul Mehta",
    dueDate: "2025-02-10",
    priority: "HIGH",
    status: "TODO",
    estimatedHours: 16,
    loggedHours: 0,
  },
  {
    id: "3",
    title: "Draft transfer pricing policy document",
    projectName: "Pharma Solutions APA Filing",
    assignee: "Rahul Mehta",
    dueDate: "2025-01-28",
    priority: "URGENT",
    status: "OVERDUE",
    estimatedHours: 24,
    loggedHours: 18,
  },
  {
    id: "4",
    title: "Review Form 3CEB calculations",
    projectName: "Pharma Solutions APA Filing",
    assignee: "Amit Kumar",
    dueDate: "2025-02-01",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    estimatedHours: 8,
    loggedHours: 4,
  },
  {
    id: "5",
    title: "Client meeting preparation",
    projectName: "Auto Parts Benchmarking Study",
    assignee: "Amit Kumar",
    dueDate: "2025-02-03",
    priority: "MEDIUM",
    status: "TODO",
    estimatedHours: 2,
    loggedHours: 0,
  },
  {
    id: "6",
    title: "Final documentation review",
    projectName: "Global KPO Master File",
    assignee: "Sneha Reddy",
    dueDate: "2025-01-30",
    priority: "LOW",
    status: "DONE",
    estimatedHours: 6,
    loggedHours: 5,
  },
];

const statusConfig: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error"; icon: typeof Circle }> = {
  TODO: { label: "To Do", variant: "secondary", icon: Circle },
  IN_PROGRESS: { label: "In Progress", variant: "info", icon: Clock },
  DONE: { label: "Done", variant: "success", icon: CheckCircle },
  OVERDUE: { label: "Overdue", variant: "error", icon: AlertTriangle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-gray-500" },
  MEDIUM: { label: "Medium", color: "bg-blue-500" },
  HIGH: { label: "High", color: "bg-orange-500" },
  URGENT: { label: "Urgent", color: "bg-red-500" },
};

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredTasks = sampleTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Tasks</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and track all project tasks
          </p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleTasks.length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleTasks.filter((t) => t.status === "IN_PROGRESS").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--error-bg)] p-2 text-[var(--error)]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {sampleTasks.filter((t) => t.status === "OVERDUE").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Overdue</p>
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
                  {sampleTasks.filter((t) => t.status === "DONE").length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Completed</p>
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
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
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
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(priorityConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const StatusIcon = statusConfig[task.status].icon;
          return (
            <Card key={task.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${priorityConfig[task.priority].color}`} />
                    <StatusIcon className={`h-5 w-5 ${
                      task.status === "DONE" ? "text-green-500" :
                      task.status === "OVERDUE" ? "text-red-500" :
                      task.status === "IN_PROGRESS" ? "text-blue-500" :
                      "text-gray-400"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">{task.title}</h3>
                        <Badge variant={statusConfig[task.status].variant}>
                          {statusConfig[task.status].label}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span>{task.projectName}</span>
                        <span className="text-[var(--border-default)]">|</span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {task.assignee}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Hours */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {task.loggedHours}h / {task.estimatedHours}h
                      </p>
                      <div className="mt-1 h-1.5 w-16 rounded-full bg-[var(--bg-secondary)]">
                        <div
                          className="h-1.5 rounded-full bg-[var(--accent)]"
                          style={{ width: `${Math.min((task.loggedHours / task.estimatedHours) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-sm ${
                        task.status === "OVERDUE" ? "text-red-500" : "text-[var(--text-muted)]"
                      }`}>
                        <Calendar className="h-4 w-4" />
                        {task.dueDate}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
