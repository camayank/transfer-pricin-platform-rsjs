/**
 * User Management API Routes
 * GET /api/users - List users in firm
 * POST /api/users - Create new user
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userService, type CreateUserInput, type UserListFilters, type UserRole } from "@/lib/services/user-service";
import { PermissionAction } from "@/lib/engines/rbac-engine";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firmId, role } = session.user;

    // Check permission
    if (!userService.hasPermission(role as UserRole, "users", PermissionAction.READ)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const filters: UserListFilters = {
      firmId: firmId || "",
      role: searchParams.get("role") as UserListFilters["role"] || undefined,
      status: searchParams.get("status") as UserListFilters["status"] || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const result = await userService.listUsers(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, firmId, role } = session.user;

    // Check permission
    if (!userService.hasPermission(role as UserRole, "users", PermissionAction.CREATE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.role) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, role" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await userService.getUserByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Role hierarchy check - can't create user with higher role
    const roleHierarchy = ["TRAINEE", "ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN", "SUPER_ADMIN"];
    const currentRoleIndex = roleHierarchy.indexOf(role);
    const newRoleIndex = roleHierarchy.indexOf(body.role);

    if (newRoleIndex > currentRoleIndex) {
      return NextResponse.json(
        { error: "Cannot create user with higher role than your own" },
        { status: 403 }
      );
    }

    const input: CreateUserInput = {
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
      firmId: firmId || "",
      department: body.department,
      title: body.title,
      phone: body.phone,
      managerId: body.managerId,
    };

    const user = await userService.createUser(input, userId);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
