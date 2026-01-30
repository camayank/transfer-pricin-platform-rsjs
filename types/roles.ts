/**
 * =============================================================================
 * SINGLE SOURCE OF TRUTH FOR ROLES AND PERMISSIONS
 *
 * All role definitions, permission actions, and permission matrices are
 * defined here. Both server-side and client-side code should import from
 * this file to ensure consistency.
 * =============================================================================
 */

/**
 * Permission actions
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
 * Hierarchical roles (highest to lowest privilege)
 * Index 0 = highest privilege, Index 6 = lowest privilege
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
 * Functional roles (TP-specific department roles)
 * These roles have specific resource access but don't fit in the hierarchy
 */
export const FUNCTIONAL_ROLES = [
  "OPERATIONS",
  "OPERATIONS_MANAGER",
  "COMPLIANCE",
  "COMPLIANCE_MANAGER",
] as const;

/**
 * All roles combined for type checking
 */
export const ALL_ROLES = [...HIERARCHY_ROLES, ...FUNCTIONAL_ROLES] as const;

/**
 * Type definitions
 */
export type HierarchyRole = (typeof HIERARCHY_ROLES)[number];
export type FunctionalRole = (typeof FUNCTIONAL_ROLES)[number];
export type UserRole = HierarchyRole | FunctionalRole;

/**
 * Role display labels for UI
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  // Hierarchical
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PARTNER: "Partner",
  SENIOR_MANAGER: "Senior Manager",
  MANAGER: "Manager",
  ASSOCIATE: "Associate",
  TRAINEE: "Trainee",
  // Functional
  OPERATIONS: "Operations",
  OPERATIONS_MANAGER: "Operations Manager",
  COMPLIANCE: "Compliance",
  COMPLIANCE_MANAGER: "Compliance Manager",
};

/**
 * Role categories for grouping in UI
 */
export const ROLE_CATEGORIES = {
  MANAGEMENT: ["SUPER_ADMIN", "ADMIN", "PARTNER", "SENIOR_MANAGER", "MANAGER"] as const,
  OPERATIONS: ["OPERATIONS_MANAGER", "OPERATIONS"] as const,
  COMPLIANCE: ["COMPLIANCE_MANAGER", "COMPLIANCE"] as const,
  STAFF: ["ASSOCIATE", "TRAINEE"] as const,
};

/**
 * Permission matrix defining what each role can do
 * Resources: clients, engagements, documents, users, settings, reports, analytics,
 *            compliance, projects, tasks, tools, disputes, reference, ai, audit
 */
export const PERMISSION_MATRIX: Record<UserRole, Array<{ resource: string; action: PermissionAction }>> = {
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
    { resource: "disputes", action: PermissionAction.ADMIN },
    { resource: "reference", action: PermissionAction.ADMIN },
    { resource: "ai", action: PermissionAction.ADMIN },
    { resource: "audit", action: PermissionAction.ADMIN },
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
    { resource: "disputes", action: PermissionAction.ADMIN },
    { resource: "reference", action: PermissionAction.READ },
    { resource: "ai", action: PermissionAction.READ },
    { resource: "audit", action: PermissionAction.READ },
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
    { resource: "disputes", action: PermissionAction.CREATE },
    { resource: "disputes", action: PermissionAction.READ },
    { resource: "disputes", action: PermissionAction.UPDATE },
    { resource: "reference", action: PermissionAction.READ },
    { resource: "ai", action: PermissionAction.READ },
    { resource: "audit", action: PermissionAction.READ },
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
    { resource: "disputes", action: PermissionAction.READ },
    { resource: "reference", action: PermissionAction.READ },
    { resource: "ai", action: PermissionAction.READ },
    { resource: "audit", action: PermissionAction.READ },
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
    { resource: "disputes", action: PermissionAction.READ },
    { resource: "reference", action: PermissionAction.READ },
  ],

  TRAINEE: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tools", action: PermissionAction.READ },
    { resource: "reference", action: PermissionAction.READ },
  ],

  // =============================================================================
  // FUNCTIONAL ROLES (TP-specific department access)
  // =============================================================================

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
    { resource: "disputes", action: PermissionAction.READ },
    { resource: "reference", action: PermissionAction.READ },
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
    { resource: "disputes", action: PermissionAction.READ },
    { resource: "reference", action: PermissionAction.READ },
  ],

  COMPLIANCE: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.UPDATE },
    { resource: "disputes", action: PermissionAction.READ },
    { resource: "reference", action: PermissionAction.READ },
  ],

  COMPLIANCE_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.APPROVE },
    { resource: "compliance", action: PermissionAction.ADMIN },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
    { resource: "disputes", action: PermissionAction.READ },
    { resource: "disputes", action: PermissionAction.UPDATE },
    { resource: "reference", action: PermissionAction.READ },
    { resource: "audit", action: PermissionAction.READ },
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

  // Documents
  "/dashboard/documents": { resource: "documents", action: PermissionAction.READ },
  "/dashboard/documents/templates": { resource: "documents", action: PermissionAction.READ },
  "/dashboard/documents/search": { resource: "documents", action: PermissionAction.READ },

  // TP Tools
  "/dashboard/tools": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/penalty": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/thin-cap": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/safe-harbour": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/form-3ceb": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/benchmarking": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/master-file": { resource: "tools", action: PermissionAction.READ },
  "/dashboard/tools/secondary-adjustment": { resource: "tools", action: PermissionAction.READ },

  // Disputes
  "/dashboard/disputes": { resource: "disputes", action: PermissionAction.READ },

  // Reference
  "/dashboard/reference": { resource: "reference", action: PermissionAction.READ },

  // Analytics
  "/dashboard/analytics": { resource: "analytics", action: PermissionAction.READ },
  "/dashboard/analytics/reports": { resource: "reports", action: PermissionAction.READ },
  "/dashboard/analytics/kpis": { resource: "analytics", action: PermissionAction.READ },
  "/dashboard/status": { resource: "analytics", action: PermissionAction.READ },

  // Compliance & Audit
  "/dashboard/compliance": { resource: "compliance", action: PermissionAction.READ },
  "/dashboard/compliance/audit-log": { resource: "audit", action: PermissionAction.READ },

  // AI
  "/dashboard/ai": { resource: "ai", action: PermissionAction.READ },
  "/dashboard/ai/recommendations": { resource: "ai", action: PermissionAction.READ },

  // Management
  "/dashboard/team": { resource: "users", action: PermissionAction.READ },
  "/dashboard/settings": { resource: "settings", action: PermissionAction.ADMIN },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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
 * Get role level for hierarchical roles
 * 0 = highest privilege (SUPER_ADMIN), 6 = lowest (TRAINEE)
 * Functional roles return 999 (not in hierarchy)
 */
export function getRoleLevel(role: UserRole | string): number {
  const index = HIERARCHY_ROLES.indexOf(role as HierarchyRole);
  return index === -1 ? 999 : index;
}

/**
 * Check if userRole has at least the privilege level of requiredRole
 * Lower index = higher privilege
 */
export function isRoleAtLeast(userRole: UserRole | string, requiredRole: UserRole | string): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);

  // If user has a functional role, they don't fit in the hierarchy
  if (userLevel === 999) {
    return false;
  }

  // Lower index means higher privilege
  return userLevel <= requiredLevel;
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
 * Check if role is a management role
 */
export function isManagementRole(role: string): boolean {
  return (ROLE_CATEGORIES.MANAGEMENT as readonly string[]).includes(role);
}

/**
 * Check if role is a functional manager role
 */
export function isFunctionalManager(role: string): boolean {
  return role.endsWith("_MANAGER") && FUNCTIONAL_ROLES.includes(role as FunctionalRole);
}

/**
 * Check if role is a functional role (not hierarchical)
 */
export function isFunctionalRole(role: string): boolean {
  return FUNCTIONAL_ROLES.includes(role as FunctionalRole);
}

/**
 * Check if role is a hierarchical role
 */
export function isHierarchicalRole(role: string): boolean {
  return HIERARCHY_ROLES.includes(role as HierarchyRole);
}
