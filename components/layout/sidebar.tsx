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
  Calendar,
  Settings,
  LogOut,
  Shield,
  PieChart,
  Target,
  Heart,
  Workflow,
  RefreshCw,
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Files,
  FileCog,
  Search,
  FolderKanban,
  CheckSquare,
  Clock,
  MessageSquare,
  Bell,
  Brain,
  UserCog,
  Loader2,
  TrendingUp,
  DollarSign,
  ThumbsUp,
  UserPlus,
  Activity,
  Scale,
  BookOpen,
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
  minRole?: UserRole; // Minimum role to see this section
}

// Navigation with permission requirements
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
        title: "Status Overview",
        href: "/dashboard/status",
        icon: Activity,
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
    title: "Sales",
    items: [
      {
        title: "Leads",
        href: "/dashboard/sales/leads",
        icon: UserPlus,
        resource: "leads",
        action: PermissionAction.READ,
      },
      {
        title: "Pipeline",
        href: "/dashboard/sales/pipeline",
        icon: TrendingUp,
        resource: "pipeline",
        action: PermissionAction.READ,
      },
      {
        title: "Upsell",
        href: "/dashboard/sales/upsell",
        icon: DollarSign,
        resource: "upsell",
        action: PermissionAction.READ,
      },
      {
        title: "Feedback",
        href: "/dashboard/sales/feedback",
        icon: ThumbsUp,
        resource: "feedback",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "TP Tools",
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
    minRole: "ASSOCIATE", // TRAINEE cannot access tools
  },
  {
    title: "Disputes",
    items: [
      {
        title: "Dispute Dashboard",
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
    title: "Analytics",
    items: [
      {
        title: "Reports",
        href: "/dashboard/analytics/reports",
        icon: FileText,
        resource: "reports",
        action: PermissionAction.READ,
      },
      {
        title: "Dashboards",
        href: "/dashboard/analytics/dashboards",
        icon: PieChart,
        resource: "analytics",
        action: PermissionAction.READ,
      },
      {
        title: "KPIs",
        href: "/dashboard/analytics/kpis",
        icon: Target,
        resource: "analytics",
        action: PermissionAction.READ,
      },
    ],
    minRole: "MANAGER", // Only MANAGER+ can see analytics
  },
  {
    title: "Customer Success",
    items: [
      {
        title: "Health Scores",
        href: "/dashboard/customer-success/health",
        icon: Heart,
        resource: "customer-success",
        action: PermissionAction.READ,
      },
      {
        title: "Playbooks",
        href: "/dashboard/customer-success/playbooks",
        icon: Workflow,
        resource: "customer-success",
        action: PermissionAction.READ,
      },
      {
        title: "Renewals",
        href: "/dashboard/customer-success/renewals",
        icon: RefreshCw,
        resource: "customer-success",
        action: PermissionAction.READ,
      },
    ],
    minRole: "MANAGER", // Only MANAGER+ can see customer success
  },
  {
    title: "Compliance",
    items: [
      {
        title: "Audit Log",
        href: "/dashboard/compliance/audit-log",
        icon: ClipboardList,
        resource: "compliance",
        action: PermissionAction.READ,
      },
      {
        title: "Access Reviews",
        href: "/dashboard/compliance/access-reviews",
        icon: ShieldCheck,
        resource: "compliance",
        action: PermissionAction.READ,
      },
      {
        title: "Incidents",
        href: "/dashboard/compliance/incidents",
        icon: AlertTriangle,
        resource: "compliance",
        action: PermissionAction.READ,
      },
      {
        title: "Data Requests",
        href: "/dashboard/compliance/data-requests",
        icon: Trash2,
        resource: "compliance",
        action: PermissionAction.READ,
      },
    ],
    minRole: "MANAGER", // Only MANAGER+ can see compliance
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
      {
        title: "Templates",
        href: "/dashboard/documents/templates",
        icon: FileCog,
        resource: "documents",
        action: PermissionAction.READ,
      },
      {
        title: "Search",
        href: "/dashboard/documents/search",
        icon: Search,
        resource: "documents",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "Projects",
    items: [
      {
        title: "Projects",
        href: "/dashboard/projects",
        icon: FolderKanban,
        resource: "projects",
        action: PermissionAction.READ,
      },
      {
        title: "Tasks",
        href: "/dashboard/projects/tasks",
        icon: CheckSquare,
        resource: "tasks",
        action: PermissionAction.READ,
      },
      {
        title: "Time Tracking",
        href: "/dashboard/projects/time",
        icon: Clock,
        resource: "projects",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
        resource: "clients",
        action: PermissionAction.READ,
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        resource: "clients",
        action: PermissionAction.READ,
      },
    ],
  },
  {
    title: "AI",
    items: [
      {
        title: "AI Insights",
        href: "/dashboard/ai/insights",
        icon: Brain,
        resource: "ai",
        action: PermissionAction.READ,
      },
      {
        title: "Recommendations",
        href: "/dashboard/ai/recommendations",
        icon: Target,
        resource: "ai",
        action: PermissionAction.READ,
      },
    ],
    minRole: "MANAGER", // Only MANAGER+ can see AI features
  },
  {
    title: "Management",
    items: [
      {
        title: "Calendar",
        href: "/dashboard/calendar",
        icon: Calendar,
        resource: "clients",
        action: PermissionAction.READ,
      },
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
  },
];

// Role display labels
const roleLabels: Record<string, string> = {
  // Hierarchical roles
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PARTNER: "Partner",
  SENIOR_MANAGER: "Sr. Manager",
  MANAGER: "Manager",
  ASSOCIATE: "Associate",
  TRAINEE: "Trainee",
  // Functional roles
  SALES: "Sales",
  SALES_MANAGER: "Sales Manager",
  OPERATIONS: "Operations",
  OPERATIONS_MANAGER: "Ops Manager",
  FINANCE: "Finance",
  FINANCE_MANAGER: "Finance Manager",
  COMPLIANCE: "Compliance",
  COMPLIANCE_MANAGER: "Compliance Mgr",
  DELIVERY: "Delivery",
  DELIVERY_MANAGER: "Delivery Manager",
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { can, isAtLeast, role, isLoading } = usePermissions();

  // Filter sections and items based on permissions
  const filteredSections = navigationSections
    .filter((section) => {
      // Check minimum role requirement for section
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
              <span className="text-sm font-bold text-white">DC</span>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              DigiComply
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
