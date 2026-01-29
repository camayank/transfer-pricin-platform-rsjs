import { StatsCards } from "@/components/dashboard/stats-cards";
import { ClientTable } from "@/components/dashboard/client-table";
import { DeadlineWidget } from "@/components/dashboard/deadline-widget";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Dashboard
        </h1>
        <p className="text-[var(--text-secondary)]">
          Welcome back! Here&apos;s your compliance overview for AY 2025-26.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Table - 2 columns */}
        <div className="lg:col-span-2">
          <ClientTable />
        </div>

        {/* Sidebar Widgets - 1 column */}
        <div className="space-y-6">
          <DeadlineWidget />

          {/* Quick Actions Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
            <h3 className="mb-4 font-medium text-[var(--text-primary)]">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/dashboard/tools/safe-harbour"
                className="flex flex-col items-center rounded-lg bg-[var(--bg-secondary)] p-4 text-center transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                <span className="mb-2 text-2xl">🛡️</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Safe Harbour
                </span>
              </a>
              <a
                href="/dashboard/tools/form-3ceb"
                className="flex flex-col items-center rounded-lg bg-[var(--bg-secondary)] p-4 text-center transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                <span className="mb-2 text-2xl">📄</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Form 3CEB
                </span>
              </a>
              <a
                href="/dashboard/tools/benchmarking"
                className="flex flex-col items-center rounded-lg bg-[var(--bg-secondary)] p-4 text-center transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                <span className="mb-2 text-2xl">📊</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Benchmarking
                </span>
              </a>
              <a
                href="/dashboard/tools/master-file"
                className="flex flex-col items-center rounded-lg bg-[var(--bg-secondary)] p-4 text-center transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                <span className="mb-2 text-2xl">📁</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Master File
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
