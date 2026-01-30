"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { usePermissions, PermissionAction, type UserRole } from "@/lib/hooks/use-permissions";
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  BarChart3,
  FolderOpen,
  Settings,
  LogOut,
  Shield,
  AlertTriangle,
  RefreshCw,
  Scale,
  BookOpen,
  Files,
  UserCog,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  resource: string;
  action: PermissionAction;
}

interface NavSection {
  title: string;
  items: NavItem[];
  minRole?: UserRole;
}

// Transfer Pricing focused navigation
const navigationSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        resource: "clients",
        action: PermissionAction.READ,
      },
      {
        title: "Clients",
        href: "/dashboard/clients",
        icon: Users,
        resource: "clients",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "TP Compliance",
    items: [
      {
        title: "Safe Harbour",
        href: "/dashboard/tools/safe-harbour",
        icon: Shield,
        resource: "tools",
        action: PermissionAction.READ,
      },
      {
        title: "Form 3CEB",
        href: "/dashboard/tools/form-3ceb",
        icon: FileText,
        resource: "tools",
        action: PermissionAction.READ,
      },
      {
        title: "Benchmarking",
        href: "/dashboard/tools/benchmarking",
        icon: BarChart3,
        resource: "tools",
        action: PermissionAction.READ,
      },
      {
        title: "Master File",
        href: "/dashboard/tools/master-file",
        icon: FolderOpen,
        resource: "tools",
        action: PermissionAction.READ,
      },
      {
        title: "Penalty Calculator",
        href: "/dashboard/tools/penalty",
        icon: AlertTriangle,
        resource: "tools",
        action: PermissionAction.READ,
      },
      {
        title: "Thin Cap (94B)",
        href: "/dashboard/tools/thin-cap",
        icon: Calculator,
        resource: "tools",
        action: PermissionAction.READ,
      },
      {
        title: "Secondary Adj (92CE)",
        href: "/dashboard/tools/secondary-adjustment",
        icon: RefreshCw,
        resource: "tools",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "Disputes",
    items: [
      {
        title: "Dispute Tracker",
        href: "/dashboard/disputes",
        icon: Scale,
        resource: "disputes",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        title: "Case Laws & OECD",
        href: "/dashboard/reference",
        icon: BookOpen,
        resource: "reference",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "Documents",
    items: [
      {
        title: "All Documents",
        href: "/dashboard/documents",
        icon: Files,
        resource: "documents",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Team",
        href: "/dashboard/team",
        icon: UserCog,
        resource: "users",
        action: PermissionAction.READ,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        resource: "settings",
        action: PermissionAction.ADMIN,
      },
    ],
    minRole: "MANAGER",
  },
];

// Role display labels
const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PARTNER: "Partner",
  SENIOR_MANAGER: "Sr. Manager",
  MANAGER: "Manager",
  ASSOCIATE: "Associate",
  TRAINEE: "Trainee",
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { can, isAtLeast, role, isLoading } = usePermissions();

  // Filter sections and items based on permissions
  const filteredSections = navigationSections
    .filter((section) => {
      if (section.minRole && !isAtLeast(section.minRole)) {
        return false;
      }
      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => can(item.resource, item.action)),
    }))
    .filter((section) => section.items.length > 0);

  // Get user initials
  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[var(--border-subtle)] px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
              <span className="text-sm font-bold text-white">TP</span>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              TP Platform
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.title} className="mb-4">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {section.title}
                </p>
                {section.items.map((item) => {
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
            ))
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-card)] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]">
              <span className="text-sm font-medium text-white">
                {getUserInitials(session?.user?.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {session?.user?.name || "Loading..."}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {roleLabels[role] || role}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
