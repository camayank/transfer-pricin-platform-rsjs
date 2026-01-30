/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Project Management Engine
 *
 * Implements project tracking, milestone management, task hierarchy,
 * time tracking, resource allocation, and Kanban board management.
 * ================================================================================
 */

// Types
export interface ProjectInput {
  firmId: string;
  clientId?: string;
  name: string;
  description?: string;
  projectType?: ProjectType;
  priority: Priority;
  budget?: number;
  startDate?: Date;
  targetEndDate?: Date;
  managerId?: string;
}

export enum ProjectType {
  ENGAGEMENT = "ENGAGEMENT",
  INTERNAL = "INTERNAL",
  RETAINER = "RETAINER",
  CONSULTING = "CONSULTING",
  AUDIT = "AUDIT",
}

export enum Priority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  BLOCKED = "BLOCKED",
  DONE = "DONE",
}

export interface MilestoneInput {
  projectId: string;
  name: string;
  description?: string;
  targetDate: Date;
  deliverables?: string[];
}

export interface TaskInput {
  projectId: string;
  milestoneId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  priority: Priority;
  assigneeId?: string;
  estimatedHours?: number;
  startDate?: Date;
  dueDate?: Date;
  dependencies?: string[];
  tags?: string[];
}

export interface TimeEntryInput {
  firmId: string;
  projectId: string;
  taskId?: string;
  userId: string;
  date: Date;
  hours: number;
  description?: string;
  billable: boolean;
  billRate?: number;
}

export interface ResourceAllocationInput {
  projectId: string;
  userId: string;
  role: string;
  allocationPct: number;
  startDate: Date;
  endDate?: Date;
  hourlyRate?: number;
}

export interface KanbanColumn {
  id: string;
  name: string;
  status: TaskStatus;
  wipLimit?: number;
  sortOrder: number;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalHoursEstimated: number;
  totalHoursActual: number;
  budgetUsed: number;
  budgetRemaining: number;
  progressPercentage: number;
  healthStatus: "ON_TRACK" | "AT_RISK" | "DELAYED";
}

export interface ResourceUtilization {
  userId: string;
  totalAllocatedPct: number;
  allocations: Array<{
    projectId: string;
    projectName: string;
    allocationPct: number;
    role: string;
  }>;
  availableCapacity: number;
  isOverallocated: boolean;
}

// =============================================================================
// PROJECT SERVICE
// =============================================================================

export class ProjectService {
  /**
   * Generate unique project code
   */
  generateProjectCode(firmId: string, projectType: ProjectType): string {
    const typePrefix: Record<ProjectType, string> = {
      [ProjectType.ENGAGEMENT]: "ENG",
      [ProjectType.INTERNAL]: "INT",
      [ProjectType.RETAINER]: "RET",
      [ProjectType.CONSULTING]: "CON",
      [ProjectType.AUDIT]: "AUD",
    };

    const prefix = typePrefix[projectType] || "PRJ";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `${prefix}-${timestamp.slice(-4)}${random}`;
  }

  /**
   * Calculate project metrics
   */
  calculateMetrics(
    tasks: Array<{
      status: TaskStatus;
      estimatedHours?: number;
      actualHours?: number;
      dueDate?: Date;
    }>,
    budget: number,
    budgetUsed: number
  ): ProjectMetrics {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const overdueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== TaskStatus.DONE
    ).length;

    const totalHoursEstimated = tasks.reduce(
      (sum, t) => sum + (t.estimatedHours || 0),
      0
    );
    const totalHoursActual = tasks.reduce(
      (sum, t) => sum + (t.actualHours || 0),
      0
    );

    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Determine health status
    let healthStatus: "ON_TRACK" | "AT_RISK" | "DELAYED" = "ON_TRACK";
    if (overdueTasks > 0 || budgetUsed > budget * 0.9) {
      healthStatus = "DELAYED";
    } else if (
      overdueTasks > 0 ||
      totalHoursActual > totalHoursEstimated * 1.1
    ) {
      healthStatus = "AT_RISK";
    }

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      totalHoursEstimated,
      totalHoursActual,
      budgetUsed,
      budgetRemaining: budget - budgetUsed,
      progressPercentage,
      healthStatus,
    };
  }

  /**
   * Validate project dates
   */
  validateDates(
    startDate?: Date,
    targetEndDate?: Date
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (startDate && targetEndDate) {
      if (new Date(startDate) > new Date(targetEndDate)) {
        errors.push("Start date must be before target end date");
      }
    }

    if (targetEndDate && new Date(targetEndDate) < new Date()) {
      errors.push("Target end date cannot be in the past for new projects");
    }

    return { valid: errors.length === 0, errors };
  }
}

// =============================================================================
// MILESTONE SERVICE
// =============================================================================

export class MilestoneService {
  /**
   * Calculate milestone progress
   */
  calculateProgress(
    tasks: Array<{ status: TaskStatus }>
  ): { percentage: number; status: string } {
    if (tasks.length === 0) {
      return { percentage: 0, status: "PENDING" };
    }

    const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const percentage = Math.round((completed / tasks.length) * 100);

    let status = "PENDING";
    if (percentage === 100) status = "COMPLETED";
    else if (percentage > 0) status = "IN_PROGRESS";

    return { percentage, status };
  }

  /**
   * Check if milestone is at risk
   */
  isAtRisk(
    targetDate: Date,
    tasks: Array<{ status: TaskStatus; estimatedHours?: number; actualHours?: number }>
  ): { atRisk: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const daysUntilTarget = Math.ceil(
      (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Check if target date is near
    if (daysUntilTarget < 7) {
      const incompleteTasks = tasks.filter(
        (t) => t.status !== TaskStatus.DONE
      ).length;
      if (incompleteTasks > 0) {
        reasons.push(
          `${incompleteTasks} tasks remaining with only ${daysUntilTarget} days until deadline`
        );
      }
    }

    // Check if tasks are over estimated hours
    const overrunTasks = tasks.filter(
      (t) =>
        t.estimatedHours &&
        t.actualHours &&
        t.actualHours > t.estimatedHours * 1.2
    );
    if (overrunTasks.length > 0) {
      reasons.push(`${overrunTasks.length} tasks significantly over estimated hours`);
    }

    // Check blocked tasks
    const blockedTasks = tasks.filter((t) => t.status === TaskStatus.BLOCKED);
    if (blockedTasks.length > 0) {
      reasons.push(`${blockedTasks.length} tasks are blocked`);
    }

    return { atRisk: reasons.length > 0, reasons };
  }
}

// =============================================================================
// TASK SERVICE
// =============================================================================

export class TaskService {
  /**
   * Validate task status transition
   */
  isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus
  ): boolean {
    const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],
      [TaskStatus.IN_PROGRESS]: [
        TaskStatus.REVIEW,
        TaskStatus.BLOCKED,
        TaskStatus.TODO,
        TaskStatus.DONE,
      ],
      [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
      [TaskStatus.BLOCKED]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS], // Allow reopening
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Check if task has unresolved dependencies
   */
  hasUnresolvedDependencies(
    dependencies: string[],
    allTasks: Array<{ id: string; status: TaskStatus }>
  ): { blocked: boolean; blockingTasks: string[] } {
    if (!dependencies || dependencies.length === 0) {
      return { blocked: false, blockingTasks: [] };
    }

    const blockingTasks = dependencies.filter((depId) => {
      const depTask = allTasks.find((t) => t.id === depId);
      return depTask && depTask.status !== TaskStatus.DONE;
    });

    return {
      blocked: blockingTasks.length > 0,
      blockingTasks,
    };
  }

  /**
   * Build task hierarchy (parent-child)
   */
  buildTaskHierarchy(
    tasks: Array<{
      id: string;
      parentTaskId?: string;
      title: string;
      status: TaskStatus;
    }>
  ): Array<{
    id: string;
    title: string;
    status: TaskStatus;
    subtasks: unknown[];
  }> {
    const rootTasks = tasks.filter((t) => !t.parentTaskId);
    const childMap = new Map<string, typeof tasks>();

    tasks.forEach((t) => {
      if (t.parentTaskId) {
        if (!childMap.has(t.parentTaskId)) {
          childMap.set(t.parentTaskId, []);
        }
        childMap.get(t.parentTaskId)!.push(t);
      }
    });

    const buildSubtasks = (parentId: string): unknown[] => {
      const children = childMap.get(parentId) || [];
      return children.map((child) => ({
        id: child.id,
        title: child.title,
        status: child.status,
        subtasks: buildSubtasks(child.id),
      }));
    };

    return rootTasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      subtasks: buildSubtasks(task.id),
    }));
  }

  /**
   * Calculate task priority score for sorting
   */
  calculatePriorityScore(
    priority: Priority,
    dueDate?: Date,
    status?: TaskStatus
  ): number {
    const priorityScores: Record<Priority, number> = {
      [Priority.CRITICAL]: 1000,
      [Priority.HIGH]: 750,
      [Priority.MEDIUM]: 500,
      [Priority.LOW]: 250,
    };

    let score = priorityScores[priority] || 500;

    // Adjust for due date proximity
    if (dueDate) {
      const daysUntilDue = Math.ceil(
        (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDue < 0) score += 500; // Overdue
      else if (daysUntilDue <= 1) score += 300;
      else if (daysUntilDue <= 3) score += 200;
      else if (daysUntilDue <= 7) score += 100;
    }

    // Blocked tasks get lower score
    if (status === TaskStatus.BLOCKED) {
      score -= 200;
    }

    return score;
  }
}

// =============================================================================
// TIME ENTRY SERVICE
// =============================================================================

export class TimeEntryService {
  /**
   * Validate time entry
   */
  validate(input: TimeEntryInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.hours <= 0) {
      errors.push("Hours must be greater than 0");
    }

    if (input.hours > 24) {
      errors.push("Hours cannot exceed 24 per entry");
    }

    if (new Date(input.date) > new Date()) {
      errors.push("Cannot log time for future dates");
    }

    // Check if date is not too far in the past (configurable)
    const maxPastDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxPastDays);
    if (new Date(input.date) < cutoffDate) {
      errors.push(`Cannot log time for dates more than ${maxPastDays} days in the past`);
    }

    if (input.billable && !input.billRate) {
      // Warning, not error - can use default rate
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Calculate billable amount
   */
  calculateBillableAmount(
    hours: number,
    billRate: number,
    billable: boolean
  ): number {
    if (!billable) return 0;
    return hours * billRate;
  }

  /**
   * Aggregate time entries by project
   */
  aggregateByProject(
    entries: Array<{
      projectId: string;
      hours: number;
      billable: boolean;
      billRate?: number;
    }>
  ): Map<string, { totalHours: number; billableHours: number; billableAmount: number }> {
    const aggregation = new Map<
      string,
      { totalHours: number; billableHours: number; billableAmount: number }
    >();

    for (const entry of entries) {
      const current = aggregation.get(entry.projectId) || {
        totalHours: 0,
        billableHours: 0,
        billableAmount: 0,
      };

      current.totalHours += entry.hours;
      if (entry.billable) {
        current.billableHours += entry.hours;
        current.billableAmount += entry.hours * (entry.billRate || 0);
      }

      aggregation.set(entry.projectId, current);
    }

    return aggregation;
  }

  /**
   * Generate weekly timesheet structure
   */
  generateWeeklyTimesheet(
    startDate: Date,
    entries: Array<{ date: Date; hours: number; projectId: string; taskId?: string }>
  ): Array<{
    date: Date;
    dayOfWeek: string;
    entries: Array<{ projectId: string; taskId?: string; hours: number }>;
    totalHours: number;
  }> {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timesheet = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const dayEntries = entries.filter(
        (e) => new Date(e.date).toISOString().split("T")[0] === dateStr
      );

      timesheet.push({
        date,
        dayOfWeek: days[date.getDay()],
        entries: dayEntries.map((e) => ({
          projectId: e.projectId,
          taskId: e.taskId,
          hours: e.hours,
        })),
        totalHours: dayEntries.reduce((sum, e) => sum + e.hours, 0),
      });
    }

    return timesheet;
  }
}

// =============================================================================
// RESOURCE SERVICE
// =============================================================================

export class ResourceService {
  /**
   * Calculate resource utilization
   */
  calculateUtilization(
    allocations: Array<{
      projectId: string;
      projectName: string;
      allocationPct: number;
      role: string;
      startDate: Date;
      endDate?: Date;
    }>
  ): ResourceUtilization & { userId: string } {
    // Filter active allocations (current date falls within allocation period)
    const now = new Date();
    const activeAllocations = allocations.filter(
      (a) =>
        new Date(a.startDate) <= now &&
        (!a.endDate || new Date(a.endDate) >= now)
    );

    const totalAllocatedPct = activeAllocations.reduce(
      (sum, a) => sum + a.allocationPct,
      0
    );

    return {
      userId: "", // Will be set by caller
      totalAllocatedPct,
      allocations: activeAllocations,
      availableCapacity: Math.max(0, 100 - totalAllocatedPct),
      isOverallocated: totalAllocatedPct > 100,
    };
  }

  /**
   * Find available resources for a project
   */
  findAvailableResources(
    users: Array<{ id: string; name: string; role: string }>,
    allAllocations: Array<{
      userId: string;
      allocationPct: number;
      startDate: Date;
      endDate?: Date;
    }>,
    requiredCapacity: number,
    startDate: Date,
    endDate?: Date
  ): Array<{ userId: string; name: string; availableCapacity: number }> {
    return users
      .map((user) => {
        const userAllocations = allAllocations.filter(
          (a) =>
            a.userId === user.id &&
            // Check date overlap
            new Date(a.startDate) <= (endDate || new Date()) &&
            (!a.endDate || new Date(a.endDate) >= startDate)
        );

        const totalAllocated = userAllocations.reduce(
          (sum, a) => sum + a.allocationPct,
          0
        );
        const availableCapacity = 100 - totalAllocated;

        return {
          userId: user.id,
          name: user.name,
          availableCapacity,
        };
      })
      .filter((u) => u.availableCapacity >= requiredCapacity)
      .sort((a, b) => b.availableCapacity - a.availableCapacity);
  }

  /**
   * Detect resource conflicts
   */
  detectConflicts(
    allocations: Array<{
      userId: string;
      projectId: string;
      allocationPct: number;
      startDate: Date;
      endDate?: Date;
    }>
  ): Array<{
    userId: string;
    period: { start: Date; end: Date };
    totalAllocation: number;
    projects: string[];
  }> {
    const conflicts: Array<{
      userId: string;
      period: { start: Date; end: Date };
      totalAllocation: number;
      projects: string[];
    }> = [];

    // Group by user
    const userAllocations = new Map<string, typeof allocations>();
    for (const a of allocations) {
      if (!userAllocations.has(a.userId)) {
        userAllocations.set(a.userId, []);
      }
      userAllocations.get(a.userId)!.push(a);
    }

    // Check each user for over-allocation
    for (const [userId, userAllocs] of userAllocations) {
      // Simple check: sum all active allocations
      const now = new Date();
      const activeAllocs = userAllocs.filter(
        (a) =>
          new Date(a.startDate) <= now &&
          (!a.endDate || new Date(a.endDate) >= now)
      );

      const totalPct = activeAllocs.reduce((sum, a) => sum + a.allocationPct, 0);

      if (totalPct > 100) {
        conflicts.push({
          userId,
          period: {
            start: now,
            end: new Date(Math.min(...activeAllocs.filter(a => a.endDate).map(a => new Date(a.endDate!).getTime())) || now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          totalAllocation: totalPct,
          projects: activeAllocs.map((a) => a.projectId),
        });
      }
    }

    return conflicts;
  }
}

// =============================================================================
// KANBAN SERVICE
// =============================================================================

export class KanbanService {
  /**
   * Get default Kanban columns
   */
  getDefaultColumns(): KanbanColumn[] {
    return [
      { id: "todo", name: "To Do", status: TaskStatus.TODO, sortOrder: 0 },
      {
        id: "in-progress",
        name: "In Progress",
        status: TaskStatus.IN_PROGRESS,
        wipLimit: 5,
        sortOrder: 1,
      },
      { id: "review", name: "Review", status: TaskStatus.REVIEW, wipLimit: 3, sortOrder: 2 },
      { id: "done", name: "Done", status: TaskStatus.DONE, sortOrder: 3 },
    ];
  }

  /**
   * Check WIP limit violation
   */
  checkWipLimit(
    column: KanbanColumn,
    currentTaskCount: number
  ): { violated: boolean; message?: string } {
    if (!column.wipLimit) {
      return { violated: false };
    }

    if (currentTaskCount >= column.wipLimit) {
      return {
        violated: true,
        message: `WIP limit of ${column.wipLimit} reached for column "${column.name}"`,
      };
    }

    return { violated: false };
  }

  /**
   * Reorder tasks within a column
   */
  reorderTasks(
    tasks: Array<{ id: string; sortOrder: number }>,
    taskId: string,
    newIndex: number
  ): Array<{ id: string; sortOrder: number }> {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return tasks;

    const reordered = [...tasks];
    const [movedTask] = reordered.splice(taskIndex, 1);
    reordered.splice(newIndex, 0, movedTask);

    // Update sort orders
    return reordered.map((task, index) => ({
      ...task,
      sortOrder: index,
    }));
  }

  /**
   * Calculate column statistics
   */
  getColumnStats(
    tasks: Array<{ status: TaskStatus; estimatedHours?: number; actualHours?: number }>
  ): Record<
    TaskStatus,
    { count: number; totalEstimatedHours: number; totalActualHours: number }
  > {
    const stats: Record<
      TaskStatus,
      { count: number; totalEstimatedHours: number; totalActualHours: number }
    > = {
      [TaskStatus.TODO]: { count: 0, totalEstimatedHours: 0, totalActualHours: 0 },
      [TaskStatus.IN_PROGRESS]: { count: 0, totalEstimatedHours: 0, totalActualHours: 0 },
      [TaskStatus.REVIEW]: { count: 0, totalEstimatedHours: 0, totalActualHours: 0 },
      [TaskStatus.BLOCKED]: { count: 0, totalEstimatedHours: 0, totalActualHours: 0 },
      [TaskStatus.DONE]: { count: 0, totalEstimatedHours: 0, totalActualHours: 0 },
    };

    for (const task of tasks) {
      stats[task.status].count++;
      stats[task.status].totalEstimatedHours += task.estimatedHours || 0;
      stats[task.status].totalActualHours += task.actualHours || 0;
    }

    return stats;
  }
}

// Export instances for convenience
export const projectService = new ProjectService();
export const milestoneService = new MilestoneService();
export const taskService = new TaskService();
export const timeEntryService = new TimeEntryService();
export const resourceService = new ResourceService();
export const kanbanService = new KanbanService();
