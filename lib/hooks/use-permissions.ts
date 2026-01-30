"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

// Import everything from the single source of truth
import {
  PermissionAction,
  HIERARCHY_ROLES,
  FUNCTIONAL_ROLES,
  ALL_ROLES,
  ROLE_LABELS,
  ROLE_CATEGORIES,
  MENU_PERMISSIONS,
  hasPermission,
  canAccessMenu,
  getRoleLevel,
  isRoleAtLeast,
  isManagementRole,
  isFunctionalManager,
  type UserRole,
  type HierarchyRole,
  type FunctionalRole,
} from "@/types/roles";

// Re-export for backwards compatibility
export {
  PermissionAction,
  HIERARCHY_ROLES,
  FUNCTIONAL_ROLES,
  ROLE_LABELS,
  ROLE_CATEGORIES,
  MENU_PERMISSIONS,
  hasPermission,
  canAccessMenu,
  getRoleLevel,
  isRoleAtLeast,
  isManagementRole,
  isFunctionalManager,
  type UserRole,
  type HierarchyRole,
  type FunctionalRole,
};

// Legacy export name
export const ROLE_HIERARCHY = ALL_ROLES;

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
