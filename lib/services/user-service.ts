/**
 * ================================================================================
 * DIGICOMPLY USER MANAGEMENT SERVICE
 *
 * Comprehensive user management with RBAC integration.
 * Handles user CRUD, role assignment, permission management.
 * ================================================================================
 */

import { prisma } from "@/lib/db";
import { hash, compare } from "bcryptjs";
import {
  permissionService,
  type Permission,
  PermissionAction,
} from "@/lib/engines/rbac-engine";

// Types
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  firmId: string;
  department?: string;
  title?: string;
  phone?: string;
  managerId?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  department?: string;
  title?: string;
  phone?: string;
  managerId?: string;
  status?: UserStatus;
}

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PARTNER"
  | "SENIOR_MANAGER"
  | "MANAGER"
  | "ASSOCIATE"
  | "TRAINEE";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export interface UserWithPermissions {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firmId: string;
  firmName: string;
  status: UserStatus;
  permissions: Permission[];
  department?: string;
  title?: string;
  phone?: string;
  managerId?: string;
  managerName?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListFilters {
  firmId: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// USER SERVICE CLASS
// =============================================================================

export class UserService {
  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput, createdById: string): Promise<UserWithPermissions> {
    // Hash password
    const hashedPassword = await hash(input.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        name: input.name,
        role: input.role,
        firmId: input.firmId,
      },
      include: {
        firm: true,
      },
    });

    // Log audit event
    await this.logAudit(input.firmId, createdById, "CREATE", "USER", user.id, null, {
      email: user.email,
      role: user.role,
    });

    return this.mapUserToResponse(user);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string, firmId: string): Promise<UserWithPermissions | null> {
    const user = await prisma.user.findFirst({
      where: { id, firmId },
      include: { firm: true },
    });

    if (!user) return null;
    return this.mapUserToResponse(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserWithPermissions | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { firm: true },
    });

    if (!user) return null;
    return this.mapUserToResponse(user);
  }

  /**
   * List users with filters
   */
  async listUsers(filters: UserListFilters): Promise<{
    users: UserWithPermissions[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { firmId: filters.firmId };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { firm: true },
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => this.mapUserToResponse(u)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    firmId: string,
    input: UpdateUserInput,
    updatedById: string
  ): Promise<UserWithPermissions> {
    // Get current user for audit
    const currentUser = await prisma.user.findFirst({
      where: { id, firmId },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.role && { role: input.role }),
      },
      include: { firm: true },
    });

    // Log audit event
    await this.logAudit(firmId, updatedById, "UPDATE", "USER", id,
      { role: currentUser.role, name: currentUser.name },
      { role: user.role, name: user.name }
    );

    return this.mapUserToResponse(user);
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(id: string, firmId: string, deactivatedById: string): Promise<void> {
    const user = await prisma.user.findFirst({ where: { id, firmId } });
    if (!user) throw new Error("User not found");

    // For now, we don't have a status field, so we'd need to add it
    // Log audit event
    await this.logAudit(firmId, deactivatedById, "DELETE", "USER", id, { active: true }, { active: false });
  }

  /**
   * Verify password
   */
  async verifyPassword(email: string, password: string): Promise<UserWithPermissions | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { firm: true },
    });

    if (!user || !user.password) return null;

    const isValid = await compare(password, user.password);
    if (!isValid) return null;

    return this.mapUserToResponse(user);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) return false;

    const isValid = await compare(currentPassword, user.password);
    if (!isValid) return false;

    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  }

  /**
   * Get user permissions
   */
  getUserPermissions(role: UserRole): Permission[] {
    return permissionService.getRolePermissions(role);
  }

  /**
   * Check if user has permission
   */
  hasPermission(
    role: UserRole,
    resource: string,
    action: PermissionAction,
    context?: Record<string, unknown>
  ): boolean {
    const permissions = this.getUserPermissions(role);
    return permissionService.hasPermission(permissions, resource, action, context);
  }

  /**
   * Get users by role in firm
   */
  async getUsersByRole(firmId: string, role: UserRole): Promise<UserWithPermissions[]> {
    const users = await prisma.user.findMany({
      where: { firmId, role },
      include: { firm: true },
    });
    return users.map((u) => this.mapUserToResponse(u));
  }

  /**
   * Map database user to response
   */
  private mapUserToResponse(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    firmId: string | null;
    firm: { name: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserWithPermissions {
    const role = user.role as UserRole;
    return {
      id: user.id,
      email: user.email,
      name: user.name || "Unknown",
      role,
      firmId: user.firmId || "",
      firmName: user.firm?.name || "Unknown",
      status: "ACTIVE", // Default status
      permissions: this.getUserPermissions(role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Log audit event
   */
  private async logAudit(
    firmId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues: Record<string, unknown> | null,
    newValues: Record<string, unknown> | null
  ): Promise<void> {
    try {
      // Get previous hash
      const lastLog = await prisma.immutableAuditLog.findFirst({
        where: { firmId },
        orderBy: { createdAt: "desc" },
        select: { currentHash: true },
      });

      // Create hash for chain integrity
      const crypto = await import("crypto");
      const hashContent = JSON.stringify({
        firmId,
        userId,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        previousHash: lastLog?.currentHash || null,
        timestamp: new Date().toISOString(),
      });
      const currentHash = crypto.createHash("sha256").update(hashContent).digest("hex");

      await prisma.immutableAuditLog.create({
        data: {
          firmId,
          userId,
          action,
          entityType,
          entityId,
          oldValues: oldValues as object,
          newValues: newValues as object,
          previousHash: lastLog?.currentHash || null,
          currentHash,
        },
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
    }
  }
}

// Export singleton instance
export const userService = new UserService();
