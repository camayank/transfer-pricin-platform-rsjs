"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  BarChart3,
  FolderOpen,
  Calendar,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

const mainNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
];

const tpTools = [
  {
    title: "Safe Harbour",
    href: "/dashboard/tools/safe-harbour",
    icon: Shield,
  },
  {
    title: "Form 3CEB",
    href: "/dashboard/tools/form-3ceb",
    icon: FileText,
  },
  {
    title: "Benchmarking",
    href: "/dashboard/tools/benchmarking",
    icon: BarChart3,
  },
  {
    title: "Master File",
    href: "/dashboard/tools/master-file",
    icon: FolderOpen,
  },
];

const management = [
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[var(--border-subtle)] px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
              <span className="text-sm font-bold text-white">DC</span>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              DigiComply
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* Main */}
          <div className="mb-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Main
            </p>
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[var(--accent-glow)] text-[var(--accent-light)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* TP Tools */}
          <div className="mb-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              TP Tools
            </p>
            {tpTools.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[var(--accent-glow)] text-[var(--accent-light)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* Management */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Management
            </p>
            {management.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[var(--accent-glow)] text-[var(--accent-light)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-card)] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]">
              <span className="text-sm font-medium text-white">CA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                Demo User
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                Partner
              </p>
            </div>
            <button className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
