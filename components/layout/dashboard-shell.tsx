"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DashboardShell({
  children,
  title,
  description,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-[260px]">
        <Header title={title} description={description} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
