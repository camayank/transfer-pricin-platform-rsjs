/**
 * API Permission Utilities
 *
 * Server-side permission checking for API routes.
 * Imports from the single source of truth in types/roles.ts
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Import everything from the single source of truth
import {
  PermissionAction,
  HIERARCHY_ROLES,
  FUNCTIONAL_ROLES,
  hasPermission,
  getRoleLevel,
  isRoleAtLeast,
  type UserRole,
  type HierarchyRole,
  type FunctionalRole,
} from "@/types/roles";

// Re-export for backwards compatibility
export {
  PermissionAction,
  HIERARCHY_ROLES as ROLE_HIERARCHY,
  FUNCTIONAL_ROLES,
  hasPermission,
  getRoleLevel,
  isRoleAtLeast,
  type UserRole,
  type HierarchyRole as HierarchicalRole,
  type FunctionalRole,
};

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
