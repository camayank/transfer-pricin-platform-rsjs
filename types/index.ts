import { Role, Plan, EngagementStatus, Priority, DocumentType, DocStatus } from "@prisma/client";

// Re-export Prisma enums
export { Role, Plan, EngagementStatus, Priority, DocumentType, DocStatus };

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    firmId: string | null;
    firmName?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      firmId: string | null;
      firmName?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firmId: string | null;
    firmName?: string | null;
  }
}

// Safe Harbour Analysis Result
export interface SafeHarbourResult {
  type: string;
  eligible: boolean;
  requiredMargin: number | string;
  actualMargin?: number;
  gap?: number;
  message: string;
  recommendations: string[];
}

// Form 3CEB Types
export interface AssociatedEnterprise {
  id: string;
  name: string;
  pan?: string;
  country: string;
  relationship: string;
  address?: string;
}

export interface InternationalTransaction {
  id: string;
  aeId: string;
  natureCode: string;
  description: string;
  value: number;
  currency: string;
  method: string;
  pli?: string;
  pliValue?: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalClients: number;
  filedCount: number;
  pendingCount: number;
  overdueCount: number;
}

// Client with engagement info
export interface ClientWithEngagement {
  id: string;
  name: string;
  pan: string;
  industry?: string;
  assignedTo?: {
    name: string;
  };
  latestEngagement?: {
    assessmentYear: string;
    status: EngagementStatus;
    dueDate?: Date;
  };
}
