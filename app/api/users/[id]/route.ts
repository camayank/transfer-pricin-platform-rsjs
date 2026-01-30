/**
 * Individual User API Routes
 * GET /api/users/[id] - Get user by ID
 * PUT /api/users/[id] - Update user
 * DELETE /api/users/[id] - Deactivate user
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userService, type UpdateUserInput, type UserRole } from "@/lib/services/user-service";
import { PermissionAction } from "@/lib/engines/rbac-engine";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, firmId, role } = session.user;

    // Users can always read their own profile
    const canReadOwn = id === userId;
    const canReadOthers = userService.hasPermission(role as UserRole, "users", PermissionAction.READ);

    if (!canReadOwn && !canReadOthers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await userService.getUserById(id, firmId || "");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, firmId, role } = session.user;

    // Users can update their own profile (limited fields)
    const isOwnProfile = id === userId;
    const canUpdateOthers = userService.hasPermission(role as UserRole, "users", PermissionAction.UPDATE);

    if (!isOwnProfile && !canUpdateOthers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Restrict role changes if updating own profile
    if (isOwnProfile && body.role) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 403 }
      );
    }

    // Role hierarchy check for updating others
    if (body.role && canUpdateOthers) {
      const roleHierarchy = ["TRAINEE", "ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN", "SUPER_ADMIN"];
      const currentRoleIndex = roleHierarchy.indexOf(role);
      const newRoleIndex = roleHierarchy.indexOf(body.role);

      if (newRoleIndex > currentRoleIndex) {
        return NextResponse.json(
          { error: "Cannot assign role higher than your own" },
          { status: 403 }
        );
      }
    }

    const input: UpdateUserInput = {};
    if (body.name) input.name = body.name;
    if (body.role && canUpdateOthers && !isOwnProfile) input.role = body.role;
    if (body.department) input.department = body.department;
    if (body.title) input.title = body.title;
    if (body.phone) input.phone = body.phone;
    if (body.managerId) input.managerId = body.managerId;
    if (body.status && canUpdateOthers) input.status = body.status;

    const user = await userService.updateUser(id, firmId || "", input, userId);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, firmId, role } = session.user;

    // Check permission
    if (!userService.hasPermission(role as UserRole, "users", PermissionAction.DELETE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot delete yourself
    if (id === userId) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 }
      );
    }

    await userService.deactivateUser(id, firmId || "", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
