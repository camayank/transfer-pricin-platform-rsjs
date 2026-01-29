"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  pan: string;
  industry: string;
  status: "not_started" | "in_progress" | "review" | "filed";
  assignedTo: string;
  dueDate: string;
}

const sampleClients: Client[] = [
  {
    id: "1",
    name: "TechCorp India Pvt Ltd",
    pan: "AABCT1234A",
    industry: "IT Services",
    status: "in_progress",
    assignedTo: "Priya S.",
    dueDate: "31 Oct 2025",
  },
  {
    id: "2",
    name: "Pharma Solutions Ltd",
    pan: "AABCP5678B",
    industry: "Pharmaceuticals",
    status: "review",
    assignedTo: "Rahul M.",
    dueDate: "31 Oct 2025",
  },
  {
    id: "3",
    name: "Auto Parts Manufacturing",
    pan: "AABCA9012C",
    industry: "Auto Ancillary",
    status: "filed",
    assignedTo: "Amit K.",
    dueDate: "31 Oct 2025",
  },
  {
    id: "4",
    name: "Global KPO Services",
    pan: "AABCG3456D",
    industry: "KPO",
    status: "not_started",
    assignedTo: "Sneha R.",
    dueDate: "31 Oct 2025",
  },
  {
    id: "5",
    name: "FinServ Holdings",
    pan: "AABCF7890E",
    industry: "Financial Services",
    status: "in_progress",
    assignedTo: "Vikram P.",
    dueDate: "31 Oct 2025",
  },
];

const statusConfig = {
  not_started: { label: "Not Started", variant: "secondary" as const },
  in_progress: { label: "In Progress", variant: "warning" as const },
  review: { label: "Review", variant: "info" as const },
  filed: { label: "Filed", variant: "success" as const },
};

export function ClientTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Recent Clients</CardTitle>
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="sm">
            View all
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Client
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Industry
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Status
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Assigned
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Due Date
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-[var(--border-subtle)] last:border-0"
                >
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {client.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {client.pan}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-[var(--text-secondary)]">
                    {client.industry}
                  </td>
                  <td className="py-4">
                    <Badge variant={statusConfig[client.status].variant}>
                      {statusConfig[client.status].label}
                    </Badge>
                  </td>
                  <td className="py-4 text-sm text-[var(--text-secondary)]">
                    {client.assignedTo}
                  </td>
                  <td className="py-4 text-sm text-[var(--text-secondary)]">
                    {client.dueDate}
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="icon">
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
  );
}
