/**
 * API Permission Utilities
 *
 * Server-side permission checking for API routes.
 * Uses the same permission matrix as the client-side hooks.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
 * Hierarchical roles (highest to lowest)
 */
export const ROLE_HIERARCHY = [
  "SUPER_ADMIN",
  "ADMIN",
  "PARTNER",
  "SENIOR_MANAGER",
  "MANAGER",
  "ASSOCIATE",
  "TRAINEE",
] as const;

/**
 * Functional roles (department-specific)
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

export type HierarchicalRole = (typeof ROLE_HIERARCHY)[number];
export type FunctionalRole = (typeof FUNCTIONAL_ROLES)[number];
export type UserRole = HierarchicalRole | FunctionalRole;

/**
 * Permission matrix defining what each role can do
 */
const PERMISSION_MATRIX: Record<string, Array<{ resource: string; action: PermissionAction }>> = {
  // === HIERARCHICAL ROLES ===
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
    { resource: "leads", action: PermissionAction.ADMIN },
    { resource: "pipeline", action: PermissionAction.ADMIN },
    { resource: "upsell", action: PermissionAction.ADMIN },
    { resource: "feedback", action: PermissionAction.ADMIN },
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
    { resource: "leads", action: PermissionAction.READ },
    { resource: "pipeline", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.READ },
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
    { resource: "leads", action: PermissionAction.READ },
    { resource: "pipeline", action: PermissionAction.READ },
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

  // === FUNCTIONAL ROLES - SALES ===
  SALES: [
    { resource: "leads", action: PermissionAction.CREATE },
    { resource: "leads", action: PermissionAction.READ },
    { resource: "leads", action: PermissionAction.UPDATE },
    { resource: "pipeline", action: PermissionAction.READ },
    { resource: "pipeline", action: PermissionAction.UPDATE },
    { resource: "clients", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.CREATE },
    { resource: "feedback", action: PermissionAction.CREATE },
    { resource: "feedback", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
  ],
  SALES_MANAGER: [
    { resource: "leads", action: PermissionAction.ADMIN },
    { resource: "pipeline", action: PermissionAction.ADMIN },
    { resource: "clients", action: PermissionAction.READ },
    { resource: "upsell", action: PermissionAction.ADMIN },
    { resource: "feedback", action: PermissionAction.ADMIN },
    { resource: "tasks", action: PermissionAction.CREATE },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
  ],

  // === FUNCTIONAL ROLES - OPERATIONS ===
  OPERATIONS: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.UPDATE },
    { resource: "tasks", action: PermissionAction.CREATE },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.UPDATE },
  ],
  OPERATIONS_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.ADMIN },
    { resource: "tasks", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.ADMIN },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "projects", action: PermissionAction.UPDATE },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
  ],

  // === FUNCTIONAL ROLES - FINANCE ===
  FINANCE: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "invoices", action: PermissionAction.CREATE },
    { resource: "invoices", action: PermissionAction.READ },
    { resource: "invoices", action: PermissionAction.UPDATE },
    { resource: "payments", action: PermissionAction.READ },
    { resource: "payments", action: PermissionAction.UPDATE },
  ],
  FINANCE_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "invoices", action: PermissionAction.ADMIN },
    { resource: "payments", action: PermissionAction.ADMIN },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
  ],

  // === FUNCTIONAL ROLES - COMPLIANCE ===
  COMPLIANCE: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.UPDATE },
  ],
  COMPLIANCE_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "compliance", action: PermissionAction.ADMIN },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
  ],

  // === FUNCTIONAL ROLES - DELIVERY ===
  DELIVERY: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.UPDATE },
    { resource: "documents", action: PermissionAction.CREATE },
    { resource: "documents", action: PermissionAction.READ },
    { resource: "documents", action: PermissionAction.UPDATE },
    { resource: "tasks", action: PermissionAction.READ },
    { resource: "tasks", action: PermissionAction.UPDATE },
    { resource: "projects", action: PermissionAction.READ },
    { resource: "tools", action: PermissionAction.READ },
  ],
  DELIVERY_MANAGER: [
    { resource: "clients", action: PermissionAction.READ },
    { resource: "engagements", action: PermissionAction.ADMIN },
    { resource: "documents", action: PermissionAction.ADMIN },
    { resource: "tasks", action: PermissionAction.ADMIN },
    { resource: "projects", action: PermissionAction.ADMIN },
    { resource: "tools", action: PermissionAction.ADMIN },
    { resource: "reports", action: PermissionAction.READ },
    { resource: "analytics", action: PermissionAction.READ },
    { resource: "users", action: PermissionAction.READ },
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole | string,
  resource: string,
  action: PermissionAction
): boolean {
  const permissions = PERMISSION_MATRIX[role];
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
 * Get role level (0 = highest, 6 = lowest)
 * Functional roles default to lowest level
 */
export function getRoleLevel(role: UserRole | string): number {
  const index = ROLE_HIERARCHY.indexOf(role as HierarchicalRole);
  return index === -1 ? ROLE_HIERARCHY.length : index;
}

/**
 * Check if role A is higher than or equal to role B
 */
export function isRoleAtLeast(userRole: UserRole | string, requiredRole: UserRole | string): boolean {
  return getRoleLevel(userRole) <= getRoleLevel(requiredRole);
}

/**
 * Session user type
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firmId: string;
}

/**
 * Get session and validate authentication
 */
export async function getAuthenticatedUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user as SessionUser;
}

/**
 * API permission check result
 */
export interface PermissionCheckResult {
  authorized: boolean;
  user?: SessionUser;
  error?: NextResponse;
}

/**
 * Check if user has permission for an API action
 * Returns the user if authorized, or an error response if not
 */
export async function checkPermission(
  resource: string,
  action: PermissionAction
): Promise<PermissionCheckResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(user.role, resource, action)) {
    return {
      authorized: false,
      error: NextResponse.json(
        {
          error: "Forbidden",
          message: `Role ${user.role} does not have ${action} permission on ${resource}`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Check if user has at least the specified role
 */
export async function checkRole(requiredRole: UserRole): Promise<PermissionCheckResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (!isRoleAtLeast(user.role, requiredRole)) {
    return {
      authorized: false,
      error: NextResponse.json(
        {
          error: "Forbidden",
          message: `Role ${user.role} does not have sufficient privileges. Required: ${requiredRole}+`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Helper to create permission-denied response
 */
export function permissionDenied(message: string = "Permission denied"): NextResponse {
  return NextResponse.json({ error: "Forbidden", message }, { status: 403 });
}

/**
 * Helper to create unauthorized response
 */
export function unauthorized(message: string = "Authentication required"): NextResponse {
  return NextResponse.json({ error: "Unauthorized", message }, { status: 401 });
}
