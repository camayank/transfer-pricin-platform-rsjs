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
