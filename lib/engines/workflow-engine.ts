/**
 * ================================================================================
 * DIGICOMPLY WORKFLOW STATE MACHINE ENGINE
 *
 * Manages state transitions for engagements, documents, and tasks.
 * Enforces valid transitions, role-based permissions, and audit logging.
 * ================================================================================
 */

// =============================================================================
// TYPES
// =============================================================================

export type WorkflowEntityType = "ENGAGEMENT" | "DOCUMENT" | "TASK" | "PROJECT";

// Engagement Status
export enum EngagementStatus {
  NOT_STARTED = "NOT_STARTED",
  DATA_COLLECTION = "DATA_COLLECTION",
  SAFE_HARBOUR_CHECK = "SAFE_HARBOUR_CHECK",
  BENCHMARKING = "BENCHMARKING",
  DOCUMENTATION = "DOCUMENTATION",
  REVIEW = "REVIEW",
  APPROVED = "APPROVED",
  FILED = "FILED",
  COMPLETED = "COMPLETED",
}

// Document Status
export enum DocumentStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING_REVIEW = "PENDING_REVIEW",
  REVIEW = "REVIEW",
  APPROVED = "APPROVED",
  FILED = "FILED",
}

// Task Status
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  BLOCKED = "BLOCKED",
  DONE = "DONE",
}

// Project Status
export enum ProjectStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  ON_TRACK = "ON_TRACK",
  AT_RISK = "AT_RISK",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface WorkflowTransition {
  from: string;
  to: string;
  allowedRoles: string[];
  requiresApproval?: boolean;
  approverRoles?: string[];
  autoTransition?: boolean;
  conditions?: TransitionCondition[];
}

export interface TransitionCondition {
  type: "FIELD_VALUE" | "TASK_COMPLETE" | "DOCUMENT_APPROVED" | "CUSTOM";
  field?: string;
  value?: unknown;
  operator?: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "LESS_THAN";
  customCheck?: string;
}

export interface TransitionRequest {
  entityType: WorkflowEntityType;
  entityId: string;
  currentStatus: string;
  targetStatus: string;
  userId: string;
  userRole: string;
  firmId: string;
  metadata?: Record<string, unknown>;
}

export interface TransitionResult {
  success: boolean;
  newStatus?: string;
  error?: string;
  requiresApproval?: boolean;
  pendingApprovalId?: string;
}

export interface WorkflowHistory {
  entityType: WorkflowEntityType;
  entityId: string;
  fromStatus: string;
  toStatus: string;
  transitionedBy: string;
  transitionedAt: Date;
  comment?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// WORKFLOW DEFINITIONS
// =============================================================================

const engagementTransitions: WorkflowTransition[] = [
  // Initial transitions
  { from: "NOT_STARTED", to: "DATA_COLLECTION", allowedRoles: ["ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },

  // Forward flow
  { from: "DATA_COLLECTION", to: "SAFE_HARBOUR_CHECK", allowedRoles: ["ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "SAFE_HARBOUR_CHECK", to: "BENCHMARKING", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "BENCHMARKING", to: "DOCUMENTATION", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "DOCUMENTATION", to: "REVIEW", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "REVIEW", to: "APPROVED", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"], requiresApproval: true, approverRoles: ["PARTNER", "ADMIN"] },
  { from: "APPROVED", to: "FILED", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "FILED", to: "COMPLETED", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },

  // Skip safe harbour (for non-applicable cases)
  { from: "DATA_COLLECTION", to: "BENCHMARKING", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },

  // Backward transitions (for rework)
  { from: "REVIEW", to: "DOCUMENTATION", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "DOCUMENTATION", to: "BENCHMARKING", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "BENCHMARKING", to: "DATA_COLLECTION", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"] },
];

const documentTransitions: WorkflowTransition[] = [
  { from: "DRAFT", to: "IN_PROGRESS", allowedRoles: ["TRAINEE", "ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "IN_PROGRESS", to: "PENDING_REVIEW", allowedRoles: ["ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "PENDING_REVIEW", to: "REVIEW", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "REVIEW", to: "APPROVED", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"], requiresApproval: true },
  { from: "APPROVED", to: "FILED", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },

  // Rework transitions
  { from: "REVIEW", to: "IN_PROGRESS", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "PENDING_REVIEW", to: "IN_PROGRESS", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
];

const taskTransitions: WorkflowTransition[] = [
  { from: "TODO", to: "IN_PROGRESS", allowedRoles: ["TRAINEE", "ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "IN_PROGRESS", to: "REVIEW", allowedRoles: ["TRAINEE", "ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "IN_PROGRESS", to: "BLOCKED", allowedRoles: ["TRAINEE", "ASSOCIATE", "MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "BLOCKED", to: "IN_PROGRESS", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "REVIEW", to: "DONE", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "REVIEW", to: "IN_PROGRESS", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] }, // Rework
];

const projectTransitions: WorkflowTransition[] = [
  { from: "NOT_STARTED", to: "IN_PROGRESS", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "IN_PROGRESS", to: "ON_TRACK", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "IN_PROGRESS", to: "AT_RISK", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "IN_PROGRESS", to: "ON_HOLD", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "ON_TRACK", to: "AT_RISK", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "ON_TRACK", to: "COMPLETED", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "AT_RISK", to: "ON_TRACK", allowedRoles: ["MANAGER", "SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "AT_RISK", to: "ON_HOLD", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "ON_HOLD", to: "IN_PROGRESS", allowedRoles: ["SENIOR_MANAGER", "PARTNER", "ADMIN"] },
  { from: "ON_HOLD", to: "CANCELLED", allowedRoles: ["PARTNER", "ADMIN"] },
  { from: "IN_PROGRESS", to: "CANCELLED", allowedRoles: ["PARTNER", "ADMIN"] },
];

// =============================================================================
// WORKFLOW ENGINE CLASS
// =============================================================================

export class WorkflowEngine {
  private transitions: Map<WorkflowEntityType, WorkflowTransition[]>;

  constructor() {
    this.transitions = new Map([
      ["ENGAGEMENT", engagementTransitions],
      ["DOCUMENT", documentTransitions],
      ["TASK", taskTransitions],
      ["PROJECT", projectTransitions],
    ]);
  }

  /**
   * Get allowed transitions for current state
   */
  getAllowedTransitions(
    entityType: WorkflowEntityType,
    currentStatus: string,
    userRole: string
  ): string[] {
    const entityTransitions = this.transitions.get(entityType) || [];

    return entityTransitions
      .filter((t) => t.from === currentStatus && t.allowedRoles.includes(userRole))
      .map((t) => t.to);
  }

  /**
   * Validate if transition is allowed
   */
  canTransition(request: TransitionRequest): { allowed: boolean; reason?: string } {
    const entityTransitions = this.transitions.get(request.entityType);
    if (!entityTransitions) {
      return { allowed: false, reason: "Unknown entity type" };
    }

    const transition = entityTransitions.find(
      (t) => t.from === request.currentStatus && t.to === request.targetStatus
    );

    if (!transition) {
      return {
        allowed: false,
        reason: `Invalid transition from ${request.currentStatus} to ${request.targetStatus}`,
      };
    }

    if (!transition.allowedRoles.includes(request.userRole)) {
      return {
        allowed: false,
        reason: `Role ${request.userRole} is not allowed to make this transition`,
      };
    }

    return { allowed: true };
  }

  /**
   * Execute state transition
   */
  async executeTransition(
    request: TransitionRequest,
    onUpdate: (entityId: string, newStatus: string) => Promise<void>,
    onAudit: (history: WorkflowHistory) => Promise<void>
  ): Promise<TransitionResult> {
    // Validate transition
    const validation = this.canTransition(request);
    if (!validation.allowed) {
      return { success: false, error: validation.reason };
    }

    const entityTransitions = this.transitions.get(request.entityType)!;
    const transition = entityTransitions.find(
      (t) => t.from === request.currentStatus && t.to === request.targetStatus
    )!;

    // Check if approval is required
    if (transition.requiresApproval) {
      const isApprover = transition.approverRoles?.includes(request.userRole);
      if (!isApprover) {
        // Create approval request (would need approval table)
        return {
          success: true,
          requiresApproval: true,
          newStatus: request.currentStatus, // Status unchanged until approved
        };
      }
    }

    // Execute update
    try {
      await onUpdate(request.entityId, request.targetStatus);

      // Log history
      await onAudit({
        entityType: request.entityType,
        entityId: request.entityId,
        fromStatus: request.currentStatus,
        toStatus: request.targetStatus,
        transitionedBy: request.userId,
        transitionedAt: new Date(),
        metadata: request.metadata,
      });

      return { success: true, newStatus: request.targetStatus };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get workflow definition for entity type
   */
  getWorkflowDefinition(entityType: WorkflowEntityType): {
    statuses: string[];
    transitions: WorkflowTransition[];
  } {
    const transitions = this.transitions.get(entityType) || [];
    const statuses = new Set<string>();

    for (const t of transitions) {
      statuses.add(t.from);
      statuses.add(t.to);
    }

    return {
      statuses: Array.from(statuses),
      transitions,
    };
  }

  /**
   * Check if status is terminal (no outgoing transitions)
   */
  isTerminalStatus(entityType: WorkflowEntityType, status: string): boolean {
    const transitions = this.transitions.get(entityType) || [];
    return !transitions.some((t) => t.from === status);
  }

  /**
   * Get status progression (ordered statuses for progress display)
   */
  getStatusProgression(entityType: WorkflowEntityType): string[] {
    switch (entityType) {
      case "ENGAGEMENT":
        return [
          EngagementStatus.NOT_STARTED,
          EngagementStatus.DATA_COLLECTION,
          EngagementStatus.SAFE_HARBOUR_CHECK,
          EngagementStatus.BENCHMARKING,
          EngagementStatus.DOCUMENTATION,
          EngagementStatus.REVIEW,
          EngagementStatus.APPROVED,
          EngagementStatus.FILED,
          EngagementStatus.COMPLETED,
        ];
      case "DOCUMENT":
        return [
          DocumentStatus.DRAFT,
          DocumentStatus.IN_PROGRESS,
          DocumentStatus.PENDING_REVIEW,
          DocumentStatus.REVIEW,
          DocumentStatus.APPROVED,
          DocumentStatus.FILED,
        ];
      case "TASK":
        return [
          TaskStatus.TODO,
          TaskStatus.IN_PROGRESS,
          TaskStatus.REVIEW,
          TaskStatus.DONE,
        ];
      case "PROJECT":
        return [
          ProjectStatus.NOT_STARTED,
          ProjectStatus.IN_PROGRESS,
          ProjectStatus.ON_TRACK,
          ProjectStatus.COMPLETED,
        ];
      default:
        return [];
    }
  }

  /**
   * Calculate progress percentage based on current status
   */
  calculateProgress(entityType: WorkflowEntityType, currentStatus: string): number {
    const progression = this.getStatusProgression(entityType);
    const index = progression.indexOf(currentStatus);

    if (index === -1) return 0;
    if (index === progression.length - 1) return 100;

    return Math.round((index / (progression.length - 1)) * 100);
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();
