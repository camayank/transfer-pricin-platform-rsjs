import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Register a new user and optionally create a new firm
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, firmName } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with or without firm
    let user;

    if (firmName) {
      // Create new firm and user as ADMIN of that firm
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role: "ADMIN", // First user of a firm is ADMIN
          status: "ACTIVE",
          firm: {
            create: {
              name: firmName,
              plan: "STARTER",
              maxClients: 10,
            },
          },
        },
        include: {
          firm: true,
        },
      });
    } else {
      // Create user without firm (will need to be added to a firm later)
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role: "ASSOCIATE", // Default role for users without firm
          status: "PENDING", // Pending until added to a firm
        },
      });
    }

    // Return success without password
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firmId: user.firmId,
        firmName: "firm" in user && user.firm ? user.firm.name : null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
