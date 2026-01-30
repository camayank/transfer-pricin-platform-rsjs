"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

/**
 * Permission actions matching the RBAC engine
 */
export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXPORT = "EXPORT",
  APPROVE = "APPROVE",
  ADMIN = "ADMIN",
}

/**
 * User roles - Hierarchical roles (organization level)
 */
export const HIERARCHY_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PARTNER",
  "SENIOR_MANAGER",
  "MANAGER",
  "ASSOCIATE",
  "TRAINEE",
] as const;

/**
 * Functional roles (department/function level)
 */
export const FUNCTIONAL_ROLES = [
  "SALES",
  "SALES_MANAGER",
  "OPERATIONS",
  "OPERATIONS_MANAGER",
  "FINANCE",
  "FINANCE_MANAGER",
  "COMPLIANCE",
  "COMPLIANCE_MANAGER",
  "DELIVERY",
  "DELIVERY_MANAGER",
] as const;

/**
 * All roles combined
 */
export const ROLE_HIERARCHY = [...HIERARCHY_ROLES, ...FUNCTIONAL_ROLES] as const;

export type HierarchyRole = (typeof HIERARCHY_ROLES)[number];
export type FunctionalRole = (typeof FUNCTIONAL_ROLES)[number];
export type UserRole = HierarchyRole | FunctionalRole;

/**
 * Permission matrix defining what each role can do
 */
const PERMISSION_MATRIX: Record<string, Array<{ resource: string; action: PermissionAction }>> = {
  // =============================================================================
  // HIERARCHICAL ROLES (Organization-wide access)
  // =============================================================================
  SUPER_ADMIN: [{ resource: "*", action: PermissionAction.ADMIN }],

  ADMIN: [
    { resource: "clients", action: PermissionAction.ADMIN },
    { resource: "engagements", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.ADMIN },
    { resource: "users", action: PermissionAction.ADMIN },
    { resource: "settings", action: PermissionAction.ADMIN },
    { resource: "reports", action: PermissionAction.ADMIN },
    { resource: "analytics", action: PermissionAction.ADMIN },
    { resource: "compliance", action: PermissionAction.ADMIN },
    { resource: "projects", action: PermissionAction.ADMIN },
    { resource: "tasks", action: PermissionAction.ADMIN },
    { resource: "tools", action: PermissionAction.ADMIN },
    { resource: "customer-success", action: PermissionAction.ADMIN },
    { resource: "ai", action: PermissionAction.ADMIN },
    { resource: "leads", action: PermissionAction.ADMIN },
    { resource: "pipeline", action: PermissionAction.ADMIN },
    { resource: "upsell", action: PermissionAction.ADMIN },
    { resource: "feedback", action: PermissionAction.ADMIN },
  ],

  PARTNER: [
    { resource: "clients", action: PermissionAction.ADMIN },
    { resource: "engagements", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.ADMIN },
    { resource: "users", action: PermissionAction.CREATE },
    { resource: "users", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.UPDATE },
    { resource: "settings", action: PermissionAction.READ },
    { resource: "reports", action: PermissionAction.ADMIN },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.ADMIN },
    { resource: "tasks", action: PermissionAction.ADMIN },
    { resource: "tools", action: PermissionAction.ADMIN },
    { resource: "customer-success", action: PermissionAction.READ },
    { resource: "ai", action: PermissionAction.READ },
    { resource: "leads", action: PermissionAction.ADMIN },
    { resource: "pipeline", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.ADMIN },
    { resource: "feedback", action: PermissionAction.READ },
  ],

  SENIOR_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "clients", action: PermissionAction.UPDATE },
    { resource: "engagements", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.ADMIN },
    { resource: "users", action: PermissionAction.READ },
    { resource: "reports", action: PermissionAction.CREATE },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.CREATE },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.UPDATE },
    { resource: "tasks", action: PermissionAction.ADMIN },
    { resource: "tools", action: PermissionAction.ADMIN },
    { resource: "customer-success", action: PermissionAction.READ },
    { resource: "ai", action: PermissionAction.READ },
    { resource: "leads", action: PermissionAction.READ },
    { resource: "pipeline", action: PermissionAction.READ },
    { resource: "feedback", action: PermissionAction.READ },
  ],

  MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.CREATE },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.UPDATE },
    { resource: "documents", action: PermissionAction.CREATE },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.UPDATE },
    { resource: "users", action: PermissionAction.READ },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.UPDATE },
    { resource: "tasks", action: PermissionAction.CREATE },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "tools", action: PermissionAction.READ },
    { resource: "customer-success", action: PermissionAction.READ },
    { resource: "ai", action: PermissionAction.READ },
    { resource: "feedback", action: PermissionAction.READ },
  ],

  ASSOCIATE: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.CREATE },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.UPDATE },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "tools", action: PermissionAction.READ },
  ],

  TRAINEE: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.READ },
  ],

  // =============================================================================
  // FUNCTIONAL ROLES (Department-specific access)
  // =============================================================================

  // Sales Team - Lead and Pipeline focused
  SALES: [
    { resource: "leads", action: PermissionAction.CREATE },
    { resource: "leads", action: PermissionAction.READ },
    { resource: "leads", action: PermissionAction.UPDATE },
    { resource: "pipeline", action: PermissionAction.READ },
    { resource: "pipeline", action: PermissionAction.UPDATE },
    { resource: "clients", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.CREATE },
    { resource: "feedback", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "customer-success", action: PermissionAction.READ },
  ],

  SALES_MANAGER: [
    { resource: "leads", action: PermissionAction.ADMIN },
    { resource: "pipeline", action: PermissionAction.ADMIN },
    { resource: "clients", action: PermissionAction.READ },
    { resource: "clients", action: PermissionAction.CREATE },
    { resource: "upsell", action: PermissionAction.ADMIN },
    { resource: "feedback", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.CREATE },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "customer-success", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
  ],

  // Operations Team - Delivery focused
  OPERATIONS: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.UPDATE },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.UPDATE },
    { resource: "tasks", action: PermissionAction.CREATE },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "documents", action: PermissionAction.CREATE },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.UPDATE },
    { resource: "tools", action: PermissionAction.READ },
  ],

  OPERATIONS_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.ADMIN },
    { resource: "projects", action: PermissionAction.ADMIN },
    { resource: "tasks", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.ADMIN },
    { resource: "tools", action: PermissionAction.ADMIN },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
    { resource: "feedback", action: PermissionAction.READ },
  ],

  // Finance Team
  FINANCE: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.READ },
    { resource: "pipeline", action: PermissionAction.READ },
  ],

  FINANCE_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "reports", action: PermissionAction.ADMIN },
    { resource: "analytics", action: PermissionAction.ADMIN },
    { resource: "upsell", action: PermissionAction.READ },
    { resource: "pipeline", action: PermissionAction.READ },
    { resource: "settings", action: PermissionAction.READ },
  ],

  // Compliance Team
  COMPLIANCE: [
    { resource: "compliance", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "clients", action: PermissionAction.READ },
  ],

  COMPLIANCE_MANAGER: [
    { resource: "compliance", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.APPROVE },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "clients", action: PermissionAction.READ },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
  ],

  // Delivery Team (Client Success)
  DELIVERY: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.UPDATE },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "documents", action: PermissionAction.CREATE },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.UPDATE },
    { resource: "feedback", action: PermissionAction.CREATE },
    { resource: "feedback", action: PermissionAction.READ },
    { resource: "customer-success", action: PermissionAction.READ },
  ],

  DELIVERY_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.ADMIN },
    { resource: "tasks", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.ADMIN },
    { resource: "feedback", action: PermissionAction.ADMIN },
    { resource: "customer-success", action: PermissionAction.ADMIN },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
  ],
};

/**
 * Menu items and their required permissions
 */
export const MENU_PERMISSIONS: Record<string, { resource: string; action: PermissionAction }> = {
  // Main
  "/dashboard": { resource: "clients", action: PermissionAction.READ },
  "/dashboard/clients": { resource: "clients", action: PermissionAction.READ },
  "/dashboard/engagements": { resource: "engagements", action: PermissionAction.READ },

  // Sales & Pipeline
  "/dashboard/leads": { resource: "leads", action: PermissionAction.READ },
  "/dashboard/pipeline": { resource: "pipeline", action: PermissionAction.READ },
  "/dashboard/sales": { resource: "leads", action: PermissionAction.READ },
  "/dashboard/sales/leads": { resource: "leads", action: PermissionAction.READ },
  "/dashboard/sales/pipeline": { resource: "pipeline", action: PermissionAction.READ },
  "/dashboard/sales/upsell": { resource: "upsell", action: PermissionAction.READ },

  // Projects & Tasks
  "/dashboard/projects": { resource: "projects", action: PermissionAction.READ },
  "/dashboard/projects/tasks": { resource: "tasks", action: PermissionAction.READ },
  "/dashboard/projects/time": { resource: "projects", action: PermissionAction.READ },

  // Documents
  "/dashboard/documents": { resource: "documents", action: PermissionAction.READ },
  "/dashboard/documents/templates": { resource: "documents", action: PermissionAction.READ },
  "/dashboard/documents/search": { resource: "documents", action: PermissionAction.READ },

  // Analytics
  "/dashboard/analytics": { resource: "analytics", action: PermissionAction.READ },
  "/dashboard/analytics/reports": { resource: "reports", action: PermissionAction.READ },
  "/dashboard/analytics/kpis": { resource: "analytics", action: PermissionAction.READ },

  // Compliance
  "/dashboard/compliance": { resource: "compliance", action: PermissionAction.READ },
  "/dashboard/compliance/audit-log": { resource: "compliance", action: PermissionAction.READ },

  // Customer Success
  "/dashboard/customer-success": { resource: "customer-success", action: PermissionAction.READ },
  "/dashboard/customer-success/health": { resource: "customer-success", action: PermissionAction.READ },
  "/dashboard/customer-success/renewals": { resource: "upsell", action: PermissionAction.READ },
  "/dashboard/customer-success/feedback": { resource: "feedback", action: PermissionAction.READ },

  // AI
  "/dashboard/ai": { resource: "ai", action: PermissionAction.READ },
  "/dashboard/ai/recommendations": { resource: "ai", action: PermissionAction.READ },

  // Tools
  "/dashboard/tools": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/penalty": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/thin-cap": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/safe-harbour": { resource: "tools", action: PermissionAction.READ },

  // Management
  "/dashboard/team": { resource: "users", action: PermissionAction.READ },
  "/dashboard/settings": { resource: "settings", action: PermissionAction.ADMIN },
};

/**
 * Role display labels
 */
export const ROLE_LABELS: Record<string, string> = {
  // Hierarchical
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PARTNER: "Partner",
  SENIOR_MANAGER: "Senior Manager",
  MANAGER: "Manager",
  ASSOCIATE: "Associate",
  TRAINEE: "Trainee",
  // Functional
  SALES: "Sales Executive",
  SALES_MANAGER: "Sales Manager",
  OPERATIONS: "Operations",
  OPERATIONS_MANAGER: "Operations Manager",
  FINANCE: "Finance",
  FINANCE_MANAGER: "Finance Manager",
  COMPLIANCE: "Compliance",
  COMPLIANCE_MANAGER: "Compliance Manager",
  DELIVERY: "Delivery",
  DELIVERY_MANAGER: "Delivery Manager",
};

/**
 * Role categories for grouping in UI
 */
export const ROLE_CATEGORIES = {
  MANAGEMENT: ["SUPER_ADMIN", "ADMIN", "PARTNER", "SENIOR_MANAGER", "MANAGER"],
  SALES: ["SALES_MANAGER", "SALES"],
  OPERATIONS: ["OPERATIONS_MANAGER", "OPERATIONS"],
  FINANCE: ["FINANCE_MANAGER", "FINANCE"],
  COMPLIANCE: ["COMPLIANCE_MANAGER", "COMPLIANCE"],
  DELIVERY: ["DELIVERY_MANAGER", "DELIVERY"],
  STAFF: ["ASSOCIATE", "TRAINEE"],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole | string,
  resource: string,
  action: PermissionAction
): boolean {
  const permissions = PERMISSION_MATRIX[role as UserRole];
  if (!permissions) return false;

  return permissions.some((p) => {
    // Wildcard resource with ADMIN action grants all permissions
    if (p.resource === "*" && p.action === PermissionAction.ADMIN) {
      return true;
    }
    // Exact match
    if (p.resource === resource && p.action === action) {
      return true;
    }
    // ADMIN action on a resource grants all actions for that resource
    if (p.resource === resource && p.action === PermissionAction.ADMIN) {
      return true;
    }
    return false;
  });
}

/**
 * Check if a role can access a specific menu path
 */
export function canAccessMenu(role: UserRole | string, path: string): boolean {
  const permission = MENU_PERMISSIONS[path];
  if (!permission) {
    return true; // No specific permission defined, allow access
  }
  return hasPermission(role, permission.resource, permission.action);
}

/**
 * Get role level for hierarchical roles (0 = highest, 6 = lowest)
 * Functional roles return -1 (not in hierarchy)
 */
export function getRoleLevel(role: UserRole | string): number {
  const index = HIERARCHY_ROLES.indexOf(role as HierarchyRole);
  return index === -1 ? 999 : index;
}

/**
 * Check if role A is higher than or equal to role B (for hierarchical roles)
 */
export function isRoleAtLeast(userRole: UserRole | string, requiredRole: UserRole | string): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);

  // If user has a functional role, check if they have any hierarchical role too
  if (userLevel === 999) {
    // Functional roles don't have hierarchy comparison
    return false;
  }

  return userLevel <= requiredLevel;
}

/**
 * Check if role is a management role
 */
export function isManagementRole(role: string): boolean {
  return ROLE_CATEGORIES.MANAGEMENT.includes(role);
}

/**
 * Check if role is a sales role
 */
export function isSalesRole(role: string): boolean {
  return ROLE_CATEGORIES.SALES.includes(role);
}

/**
 * Check if role is a functional manager role
 */
export function isFunctionalManager(role: string): boolean {
  return role.endsWith("_MANAGER");
}

/**
 * Hook for permission checking in React components
 */
export function usePermissions() {
  const { data: session, status } = useSession();

  const userRole = (session?.user?.role || "TRAINEE") as UserRole;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const permissions = useMemo(() => {
    return {
      // Check if user has specific permission
      can: (resource: string, action: PermissionAction): boolean => {
        if (!isAuthenticated) return false;
        return hasPermission(userRole, resource, action);
      },

      // Check if user can access a menu item
      canAccessMenu: (path: string): boolean => {
        if (!isAuthenticated) return false;
        return canAccessMenu(userRole, path);
      },

      // Check if user role is at least the specified level
      isAtLeast: (requiredRole: UserRole): boolean => {
        if (!isAuthenticated) return false;
        return isRoleAtLeast(userRole, requiredRole);
      },

      // Check specific role
      isRole: (role: UserRole): boolean => userRole === role,

      // Role type checks
      isAdmin: isRoleAtLeast(userRole, "ADMIN"),
      isPartner: isRoleAtLeast(userRole, "PARTNER"),
      isManager: isRoleAtLeast(userRole, "MANAGER"),
      isSeniorManager: isRoleAtLeast(userRole, "SENIOR_MANAGER"),
      isManagement: isManagementRole(userRole),
      isSales: isSalesRole(userRole),
      isFunctionalManager: isFunctionalManager(userRole),

      // Current user info
      role: userRole,
      roleLabel: ROLE_LABELS[userRole] || userRole,
      userId: session?.user?.id,
      firmId: session?.user?.firmId,
    };
  }, [isAuthenticated, userRole, session?.user?.id, session?.user?.firmId]);

  return {
    ...permissions,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Permission guard component props
 */
export interface PermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: PermissionAction;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

/**
 * Default export for convenience
 */
export default usePermissions;
