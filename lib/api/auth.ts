/**
 * Authentication Helper for API Routes
 *
 * Provides consistent authentication across all API routes with proper typing.
 */

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  firmId: string;
  firmName: string | null;
}

export type AuthResult =
  | { user: AuthenticatedUser; error: null }
  | { user: null; error: NextResponse };

/**
 * Get the authenticated user from the session.
 * Returns the user object with firmId guaranteed, or an error response.
 *
 * Usage:
 * ```ts
 * const { user, error } = await getAuthenticatedUser();
 * if (!user) return error;
 *
 * // user.firmId is guaranteed to exist
 * const data = await prisma.client.findMany({
 *   where: { firmId: user.firmId },
 * });
 * ```
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Unauthorized", message: "Please log in to continue" },
          { status: 401 }
        ),
      };
    }

    // Get fresh user data from database to ensure firmId is valid
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        firmId: true,
        firm: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "User not found", message: "Your account could not be found" },
          { status: 401 }
        ),
      };
    }

    if (!user.firmId) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "No firm assigned", message: "Your account is not associated with a firm" },
          { status: 403 }
        ),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firmId: user.firmId,
        firmName: user.firm?.name ?? null,
      },
      error: null,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication failed", message: "An error occurred during authentication" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Check if the user has a specific role or higher.
 * Uses the single source of truth from types/roles.ts
 */
import { isRoleAtLeast, HIERARCHY_ROLES, type UserRole } from "@/types/roles";

export function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  return isRoleAtLeast(userRole as UserRole, requiredRole as UserRole);
}

// Re-export for backwards compatibility
export { HIERARCHY_ROLES as ROLE_HIERARCHY };

/**
 * Require a minimum role for an API operation.
 * Returns an error response if the user doesn't have sufficient permissions.
 */
export function requireRole(
  userRole: string,
  requiredRole: string
): NextResponse | null {
  if (!hasMinimumRole(userRole, requiredRole)) {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: `This action requires ${requiredRole} role or higher`
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Helper to ensure an entity belongs to the user's firm.
 * Use this when fetching/updating resources that should be tenant-isolated.
 */
export function firmFilter(firmId: string) {
  return { firmId };
}

/**
 * Helper for filtering through relations (e.g., engagement -> client -> firmId)
 */
export function firmFilterThroughClient(firmId: string) {
  return {
    client: {
      firmId,
    },
  };
}

/**
 * Roles that can see ALL clients in their firm (no user-level filtering)
 */
const FULL_ACCESS_ROLES = ["SUPER_ADMIN", "ADMIN", "PARTNER", "SENIOR_MANAGER"];

/**
 * Roles that can see clients they are assigned to OR reviewing
 */
const ASSIGNED_OR_REVIEWER_ROLES = ["MANAGER", "OPERATIONS_MANAGER", "COMPLIANCE_MANAGER"];

/**
 * Build client filter based on user role
 * - Admin/Partner/Senior Manager: See ALL clients in firm
 * - Manager: See clients where assignedTo OR reviewer
 * - Associate/Trainee: See only clients where assignedTo
 *
 * Usage:
 * ```ts
 * const where = buildClientAccessFilter(user);
 * const clients = await prisma.client.findMany({ where });
 * ```
 */
export function buildClientAccessFilter(user: AuthenticatedUser): Record<string, unknown> {
  // Base filter: always filter by firm
  const baseFilter = { firmId: user.firmId };

  // Full access roles see all firm clients
  if (FULL_ACCESS_ROLES.includes(user.role)) {
    return baseFilter;
  }

  // Manager-level roles see assigned + reviewing clients
  if (ASSIGNED_OR_REVIEWER_ROLES.includes(user.role)) {
    return {
      ...baseFilter,
      OR: [
        { assignedToId: user.id },
        { reviewerId: user.id },
      ],
    };
  }

  // Associate/Trainee/Others see only assigned clients
  return {
    ...baseFilter,
    assignedToId: user.id,
  };
}

/**
 * Check if user has access to a specific client
 */
export function canAccessClient(
  user: AuthenticatedUser,
  client: { firmId: string; assignedToId?: string | null; reviewerId?: string | null }
): boolean {
  // Must be same firm
  if (client.firmId !== user.firmId) {
    return false;
  }

  // Full access roles can access any client in their firm
  if (FULL_ACCESS_ROLES.includes(user.role)) {
    return true;
  }

  // Manager-level roles can access if assigned or reviewer
  if (ASSIGNED_OR_REVIEWER_ROLES.includes(user.role)) {
    return client.assignedToId === user.id || client.reviewerId === user.id;
  }

  // Others can only access if assigned
  return client.assignedToId === user.id;
}

/**
 * Build engagement filter based on user's client access
 * Filters engagements through the client relationship
 */
export function buildEngagementAccessFilter(user: AuthenticatedUser): Record<string, unknown> {
  // Full access roles see all firm engagements
  if (FULL_ACCESS_ROLES.includes(user.role)) {
    return {
      client: {
        firmId: user.firmId,
      },
    };
  }

  // Manager-level roles see engagements for their clients
  if (ASSIGNED_OR_REVIEWER_ROLES.includes(user.role)) {
    return {
      client: {
        firmId: user.firmId,
        OR: [
          { assignedToId: user.id },
          { reviewerId: user.id },
        ],
      },
    };
  }

  // Others see only engagements for assigned clients
  return {
    client: {
      firmId: user.firmId,
      assignedToId: user.id,
    },
  };
}
