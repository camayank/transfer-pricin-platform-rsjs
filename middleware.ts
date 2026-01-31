/**
 * ================================================================================
 * DIGICOMPLY NEXT.JS MIDDLEWARE
 *
 * Handles authentication, authorization, and rate limiting at the network boundary.
 * Enforces route-based access control before requests reach API handlers.
 *
 * Note: This is a lightweight check. Detailed permission checks happen in API routes.
 * ================================================================================
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ALL_ROLES, HIERARCHY_ROLES, FUNCTIONAL_ROLES, type UserRole } from "@/types/roles";

// ================================================================================
// RATE LIMITING CONFIGURATION
// ================================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Rate limit store (in-memory for Edge runtime)
// Note: For production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration by route type
const RATE_LIMITS = {
  // Auth endpoints - stricter limits to prevent brute force
  auth: { limit: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  // AI endpoints - more expensive operations
  ai: { limit: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  // Form generation/saving
  forms: { limit: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  // Default API endpoints
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  // Static/page requests - more lenient
  pages: { limit: 200, windowMs: 60 * 1000 }, // 200 requests per minute
};

/**
 * Get rate limit configuration for a given path
 */
function getRateLimitConfig(pathname: string): { limit: number; windowMs: number } {
  if (pathname.startsWith("/api/auth")) {
    return RATE_LIMITS.auth;
  }
  if (pathname.startsWith("/api/ai")) {
    return RATE_LIMITS.ai;
  }
  if (pathname.match(/\/api\/(form-3ceb|safe-harbour|benchmarking|penalty)/)) {
    return RATE_LIMITS.forms;
  }
  if (pathname.startsWith("/api/")) {
    return RATE_LIMITS.api;
  }
  return RATE_LIMITS.pages;
}

/**
 * Check rate limit for a given identifier
 */
function checkRateLimit(
  identifier: string,
  config: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, remaining: config.limit - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.limit) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment counter
  entry.count++;
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetIn: entry.resetTime - now,
  };
}

// Route protection configuration
interface RouteConfig {
  pattern: RegExp;
  allowedRoles: readonly string[];
  requireAuth: boolean;
}

// All hierarchical roles (for general access)
const ALL_HIERARCHICAL = [...HIERARCHY_ROLES] as const;

// All roles including functional (for API routes where handlers do detailed checks)
const ALL_AUTHENTICATED = [...ALL_ROLES] as const;

// Admin roles only
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

// Roles that can manage users (PARTNER can create/update team members)
const USER_MANAGEMENT_ROLES = ["ADMIN", "SUPER_ADMIN", "PARTNER"] as const;

// Roles that can access analytics/compliance (MANAGER+ and functional managers)
const ANALYTICS_ROLES = [
  "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN", "SUPER_ADMIN",
  "OPERATIONS_MANAGER", "COMPLIANCE_MANAGER"
] as const;

// Roles that can access compliance (includes COMPLIANCE functional role)
const COMPLIANCE_ROLES = [
  "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN", "SUPER_ADMIN",
  "COMPLIANCE", "COMPLIANCE_MANAGER"
] as const;

// Define protected routes and their allowed roles
const protectedRoutes: RouteConfig[] = [
  // Admin routes - ADMIN+ only
  { pattern: /^\/dashboard\/admin/, allowedRoles: ADMIN_ROLES, requireAuth: true },
  { pattern: /^\/api\/admin/, allowedRoles: ADMIN_ROLES, requireAuth: true },

  // User management - ADMIN+ and PARTNER
  { pattern: /^\/api\/users/, allowedRoles: USER_MANAGEMENT_ROLES, requireAuth: true },
  { pattern: /^\/dashboard\/team/, allowedRoles: USER_MANAGEMENT_ROLES, requireAuth: true },

  // Settings - ADMIN+ only
  { pattern: /^\/dashboard\/settings/, allowedRoles: ADMIN_ROLES, requireAuth: true },

  // Compliance/Audit - MANAGER+ and COMPLIANCE roles
  { pattern: /^\/dashboard\/compliance/, allowedRoles: COMPLIANCE_ROLES, requireAuth: true },
  { pattern: /^\/api\/audit/, allowedRoles: COMPLIANCE_ROLES, requireAuth: true },

  // Analytics/Status - MANAGER+ and functional managers
  { pattern: /^\/dashboard\/analytics/, allowedRoles: ANALYTICS_ROLES, requireAuth: true },
  { pattern: /^\/dashboard\/status/, allowedRoles: ANALYTICS_ROLES, requireAuth: true },
  { pattern: /^\/api\/dashboard\/status/, allowedRoles: ANALYTICS_ROLES, requireAuth: true },

  // General dashboard routes - all authenticated users (including functional roles)
  { pattern: /^\/dashboard/, allowedRoles: ALL_AUTHENTICATED, requireAuth: true },

  // API routes - all authenticated users (specific permissions checked in handlers)
  { pattern: /^\/api\/(?!auth)/, allowedRoles: ALL_AUTHENTICATED, requireAuth: true },
];

// Public routes that don't require authentication
const publicRoutes = [
  /^\/$/,
  /^\/login/,
  /^\/register/,
  /^\/forgot-password/,
  /^\/reset-password/,
  /^\/api\/auth/,
  /^\/_next/,
  /^\/favicon/,
  /^\/images/,
  /^\/fonts/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets completely
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Apply rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    // Get client identifier (IP address or forwarded IP)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const identifier = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;

    const rateLimitConfig = getRateLimitConfig(pathname);
    const { allowed, remaining, resetIn } = checkRateLimit(identifier, rateLimitConfig);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(resetIn / 1000)),
            "X-RateLimit-Limit": String(rateLimitConfig.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Date.now() + resetIn),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rateLimitConfig.limit));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
  }

  // Skip public routes
  for (const route of publicRoutes) {
    if (route.test(pathname)) {
      return NextResponse.next();
    }
  }

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if route requires authentication
  const matchingRoute = protectedRoutes.find((route) => route.pattern.test(pathname));

  if (!matchingRoute) {
    // No specific rule, allow access
    return NextResponse.next();
  }

  // Check authentication
  if (matchingRoute.requireAuth && !token) {
    // Redirect to login for page routes
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API routes
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized", message: "Authentication required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check role-based access
  if (token && matchingRoute.allowedRoles.length > 0) {
    const userRole = token.role as string;

    if (!matchingRoute.allowedRoles.includes(userRole)) {
      // Redirect to dashboard for page routes (403 page)
      if (!pathname.startsWith("/api/")) {
        const forbiddenUrl = new URL("/dashboard", request.url);
        // Could redirect to a 403 page instead
        return NextResponse.redirect(forbiddenUrl);
      }

      // Return 403 for API routes
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          message: `Role ${userRole} is not authorized for this resource`,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Add user info to request headers for API routes
  if (token && pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", token.id as string);
    requestHeaders.set("x-user-role", token.role as string);
    requestHeaders.set("x-firm-id", token.firmId as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
