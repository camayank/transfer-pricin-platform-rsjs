/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Analytics & KPI Engine
 *
 * Implements custom reporting, dashboard management, and KPI tracking.
 * Supports scheduled report delivery and threshold-based alerting.
 * ================================================================================
 */

// Types
export interface ReportConfig {
  reportType: "TABLE" | "CHART" | "PIVOT";
  dataSource: string;
  columns: ColumnConfig[];
  filters?: FilterConfig[];
  sorting?: SortConfig[];
  chartConfig?: ChartConfig;
  aggregations?: AggregationConfig[];
}

export interface ColumnConfig {
  field: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "currency";
  visible: boolean;
  width?: number;
  format?: string;
  aggregation?: "sum" | "avg" | "count" | "min" | "max";
}

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: unknown;
  conjunction?: "AND" | "OR";
}

export enum FilterOperator {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  GREATER_OR_EQUAL = "GREATER_OR_EQUAL",
  LESS_OR_EQUAL = "LESS_OR_EQUAL",
  BETWEEN = "BETWEEN",
  IN = "IN",
  NOT_IN = "NOT_IN",
  IS_NULL = "IS_NULL",
  IS_NOT_NULL = "IS_NOT_NULL",
}

export interface SortConfig {
  field: string;
  direction: "ASC" | "DESC";
}

export interface ChartConfig {
  chartType: "BAR" | "LINE" | "PIE" | "DOUGHNUT" | "AREA" | "SCATTER" | "GAUGE";
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  colors?: string[];
  legend?: boolean;
  stacked?: boolean;
}

export interface AggregationConfig {
  field: string;
  function: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX" | "DISTINCT";
  alias?: string;
}

export interface DashboardWidget {
  id: string;
  type: "KPI_CARD" | "CHART" | "TABLE" | "GAUGE" | "LIST" | "CALENDAR";
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval?: number;
}

export interface KpiDefinitionInput {
  firmId: string;
  name: string;
  description?: string;
  category: "COMPLIANCE" | "FINANCIAL" | "OPERATIONAL" | "CUSTOMER";
  calculationQuery: string;
  unit: "PERCENTAGE" | "CURRENCY" | "NUMBER" | "DAYS";
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  warningThreshold?: number;
  criticalThreshold?: number;
  targetValue?: number;
}

export interface KpiCalculationResult {
  value: number;
  period: string;
  trend?: "UP" | "DOWN" | "STABLE";
  trendPercentage?: number;
  alertLevel?: "NORMAL" | "WARNING" | "CRITICAL";
}

export interface ScheduleConfig {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  format: "PDF" | "EXCEL" | "CSV";
}

// =============================================================================
// REPORT SERVICE
// =============================================================================

export class ReportService {
  /**
   * Build SQL-like query from report configuration
   * Note: This returns a query descriptor, actual execution happens via Prisma
   */
  buildQueryDescriptor(config: ReportConfig): QueryDescriptor {
    const descriptor: QueryDescriptor = {
      table: this.mapDataSourceToTable(config.dataSource),
      select: config.columns.filter((c) => c.visible).map((c) => c.field),
      where: this.buildWhereClause(config.filters || []),
      orderBy: this.buildOrderBy(config.sorting || []),
      groupBy: this.extractGroupByFields(config),
      aggregations: config.aggregations || [],
    };

    return descriptor;
  }

  private mapDataSourceToTable(dataSource: string): string {
    const tableMap: Record<string, string> = {
      clients: "Client",
      engagements: "Engagement",
      documents: "Document",
      users: "User",
      time_entries: "TimeEntry",
      projects: "Project",
      invoices: "Invoice",
      health_scores: "CustomerHealthScore",
      audit_logs: "ImmutableAuditLog",
    };
    return tableMap[dataSource] || dataSource;
  }

  private buildWhereClause(
    filters: FilterConfig[]
  ): Record<string, unknown> {
    if (filters.length === 0) return {};

    const conditions: Record<string, unknown>[] = [];

    for (const filter of filters) {
      const condition = this.mapFilterToCondition(filter);
      if (condition) {
        conditions.push(condition);
      }
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  private mapFilterToCondition(filter: FilterConfig): Record<string, unknown> | null {
    const { field, operator, value } = filter;

    switch (operator) {
      case FilterOperator.EQUALS:
        return { [field]: value };
      case FilterOperator.NOT_EQUALS:
        return { [field]: { not: value } };
      case FilterOperator.CONTAINS:
        return { [field]: { contains: value, mode: "insensitive" } };
      case FilterOperator.GREATER_THAN:
        return { [field]: { gt: value } };
      case FilterOperator.LESS_THAN:
        return { [field]: { lt: value } };
      case FilterOperator.GREATER_OR_EQUAL:
        return { [field]: { gte: value } };
      case FilterOperator.LESS_OR_EQUAL:
        return { [field]: { lte: value } };
      case FilterOperator.IN:
        return { [field]: { in: value as unknown[] } };
      case FilterOperator.IS_NULL:
        return { [field]: null };
      case FilterOperator.IS_NOT_NULL:
        return { NOT: { [field]: null } };
      default:
        return null;
    }
  }

  private buildOrderBy(sorting: SortConfig[]): Record<string, string>[] {
    return sorting.map((s) => ({
      [s.field]: s.direction.toLowerCase(),
    }));
  }

  private extractGroupByFields(config: ReportConfig): string[] {
    if (config.chartConfig?.groupBy) {
      return [config.chartConfig.groupBy];
    }
    return [];
  }

  /**
   * Format report data for export
   */
  formatForExport(
    data: Record<string, unknown>[],
    columns: ColumnConfig[],
    format: "json" | "csv"
  ): string {
    if (format === "csv") {
      const headers = columns.filter((c) => c.visible).map((c) => c.label);
      const rows = data.map((row) =>
        columns
          .filter((c) => c.visible)
          .map((c) => {
            const value = row[c.field];
            if (value === null || value === undefined) return "";
            if (c.type === "currency") return this.formatCurrency(value as number);
            if (c.type === "date") return this.formatDate(value as string);
            return String(value);
          })
          .join(",")
      );
      return [headers.join(","), ...rows].join("\n");
    }
    return JSON.stringify(data, null, 2);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString("en-IN");
  }
}

interface QueryDescriptor {
  table: string;
  select: string[];
  where: Record<string, unknown>;
  orderBy: Record<string, string>[];
  groupBy: string[];
  aggregations: AggregationConfig[];
}

// =============================================================================
// DASHBOARD SERVICE
// =============================================================================

export class DashboardService {
  /**
   * Validate dashboard layout
   */
  validateLayout(
    widgets: DashboardWidget[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for overlapping widgets
    for (let i = 0; i < widgets.length; i++) {
      for (let j = i + 1; j < widgets.length; j++) {
        if (this.widgetsOverlap(widgets[i], widgets[j])) {
          errors.push(
            `Widgets "${widgets[i].title}" and "${widgets[j].title}" overlap`
          );
        }
      }
    }

    // Check for widgets with invalid dimensions
    for (const widget of widgets) {
      if (widget.position.w <= 0 || widget.position.h <= 0) {
        errors.push(`Widget "${widget.title}" has invalid dimensions`);
      }
      if (widget.position.x < 0 || widget.position.y < 0) {
        errors.push(`Widget "${widget.title}" has invalid position`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private widgetsOverlap(a: DashboardWidget, b: DashboardWidget): boolean {
    const aLeft = a.position.x;
    const aRight = a.position.x + a.position.w;
    const aTop = a.position.y;
    const aBottom = a.position.y + a.position.h;

    const bLeft = b.position.x;
    const bRight = b.position.x + b.position.w;
    const bTop = b.position.y;
    const bBottom = b.position.y + b.position.h;

    return !(aRight <= bLeft || bRight <= aLeft || aBottom <= bTop || bBottom <= aTop);
  }

  /**
   * Generate default widgets for a dashboard type
   */
  generateDefaultWidgets(dashboardType: string): DashboardWidget[] {
    const defaultWidgets: Record<string, DashboardWidget[]> = {
      compliance: [
        {
          id: "kpi-compliance-rate",
          type: "KPI_CARD",
          title: "Overall Compliance Rate",
          config: { kpiId: "compliance_rate", showTrend: true },
          position: { x: 0, y: 0, w: 3, h: 2 },
        },
        {
          id: "kpi-pending-filings",
          type: "KPI_CARD",
          title: "Pending Filings",
          config: { kpiId: "pending_filings", showTrend: true },
          position: { x: 3, y: 0, w: 3, h: 2 },
        },
        {
          id: "chart-filing-trend",
          type: "CHART",
          title: "Filing Trend",
          config: { chartType: "LINE", dataSource: "engagements" },
          position: { x: 0, y: 2, w: 6, h: 4 },
        },
        {
          id: "list-upcoming-deadlines",
          type: "LIST",
          title: "Upcoming Deadlines",
          config: { dataSource: "deadlines", limit: 5 },
          position: { x: 6, y: 0, w: 6, h: 6 },
        },
      ],
      executive: [
        {
          id: "kpi-total-clients",
          type: "KPI_CARD",
          title: "Total Clients",
          config: { kpiId: "total_clients", showTrend: true },
          position: { x: 0, y: 0, w: 3, h: 2 },
        },
        {
          id: "kpi-revenue",
          type: "KPI_CARD",
          title: "Monthly Revenue",
          config: { kpiId: "monthly_revenue", showTrend: true },
          position: { x: 3, y: 0, w: 3, h: 2 },
        },
        {
          id: "kpi-health-score",
          type: "GAUGE",
          title: "Portfolio Health",
          config: { kpiId: "avg_health_score", min: 0, max: 100 },
          position: { x: 6, y: 0, w: 3, h: 2 },
        },
        {
          id: "kpi-churn-risk",
          type: "KPI_CARD",
          title: "At-Risk Clients",
          config: { kpiId: "at_risk_clients", alertOnIncrease: true },
          position: { x: 9, y: 0, w: 3, h: 2 },
        },
      ],
    };

    return defaultWidgets[dashboardType] || [];
  }
}

// =============================================================================
// KPI SERVICE
// =============================================================================

export class KpiService {
  /**
   * Calculate KPI value and determine alert level
   */
  calculateAlertLevel(
    value: number,
    direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER",
    warningThreshold?: number,
    criticalThreshold?: number
  ): "NORMAL" | "WARNING" | "CRITICAL" {
    if (warningThreshold === undefined && criticalThreshold === undefined) {
      return "NORMAL";
    }

    if (direction === "HIGHER_IS_BETTER") {
      if (criticalThreshold !== undefined && value <= criticalThreshold) {
        return "CRITICAL";
      }
      if (warningThreshold !== undefined && value <= warningThreshold) {
        return "WARNING";
      }
    } else {
      if (criticalThreshold !== undefined && value >= criticalThreshold) {
        return "CRITICAL";
      }
      if (warningThreshold !== undefined && value >= warningThreshold) {
        return "WARNING";
      }
    }

    return "NORMAL";
  }

  /**
   * Calculate trend from historical values
   */
  calculateTrend(
    currentValue: number,
    previousValue: number | null
  ): { trend: "UP" | "DOWN" | "STABLE"; percentage: number } {
    if (previousValue === null || previousValue === 0) {
      return { trend: "STABLE", percentage: 0 };
    }

    const change = currentValue - previousValue;
    const percentage = (change / previousValue) * 100;

    if (Math.abs(percentage) < 1) {
      return { trend: "STABLE", percentage: 0 };
    }

    return {
      trend: change > 0 ? "UP" : "DOWN",
      percentage: Math.round(percentage * 10) / 10,
    };
  }

  /**
   * Get period string based on frequency
   */
  getPeriodString(
    date: Date,
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  ): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    switch (frequency) {
      case "DAILY":
        return `${year}-${month}-${day}`;
      case "WEEKLY":
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
      case "MONTHLY":
        return `${year}-${month}`;
      case "QUARTERLY":
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        return `${year}-Q${quarter}`;
      case "YEARLY":
        return `${year}`;
      default:
        return `${year}-${month}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Pre-defined KPI calculations for common metrics
   */
  getBuiltInKpiCalculations(): Record<string, string> {
    return {
      total_clients: "SELECT COUNT(*) FROM Client WHERE firmId = :firmId AND isActive = true",
      compliance_rate:
        "SELECT (COUNT(CASE WHEN status = 'COMPLETED' OR status = 'FILED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) FROM Engagement WHERE firmId = :firmId",
      pending_filings:
        "SELECT COUNT(*) FROM Engagement WHERE firmId = :firmId AND status NOT IN ('COMPLETED', 'FILED')",
      avg_health_score:
        "SELECT AVG(overallScore) FROM CustomerHealthScore WHERE firmId = :firmId",
      at_risk_clients:
        "SELECT COUNT(*) FROM CustomerHealthScore WHERE firmId = :firmId AND riskLevel IN ('HIGH', 'CRITICAL')",
      monthly_revenue:
        "SELECT SUM(amount) FROM Invoice WHERE firmId = :firmId AND status = 'PAID' AND EXTRACT(MONTH FROM createdAt) = :month AND EXTRACT(YEAR FROM createdAt) = :year",
    };
  }
}

// =============================================================================
// SCHEDULE SERVICE
// =============================================================================

export class ScheduleService {
  /**
   * Calculate next run time based on schedule configuration
   */
  calculateNextRunTime(schedule: ScheduleConfig, fromDate: Date = new Date()): Date {
    const now = new Date(fromDate);
    const [hours, minutes] = schedule.time.split(":").map(Number);

    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case "DAILY":
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case "WEEKLY":
        const targetDay = schedule.dayOfWeek ?? 1; // Default to Monday
        const currentDay = now.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7;
        }
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        break;

      case "MONTHLY":
        const targetDate = schedule.dayOfMonth ?? 1;
        nextRun.setDate(targetDate);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;

      case "QUARTERLY":
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        const nextQuarterStart = (currentQuarter + 1) * 3;
        nextRun.setMonth(nextQuarterStart);
        nextRun.setDate(schedule.dayOfMonth ?? 1);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 3);
        }
        break;
    }

    return nextRun;
  }

  /**
   * Validate schedule configuration
   */
  validateSchedule(schedule: ScheduleConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.time)) {
      errors.push("Invalid time format. Use HH:MM");
    }

    // Validate recipients
    if (!schedule.recipients || schedule.recipients.length === 0) {
      errors.push("At least one recipient is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = schedule.recipients.filter((r) => !emailRegex.test(r));
    if (invalidEmails.length > 0) {
      errors.push(`Invalid email addresses: ${invalidEmails.join(", ")}`);
    }

    // Validate day of week for weekly schedules
    if (schedule.frequency === "WEEKLY") {
      if (
        schedule.dayOfWeek === undefined ||
        schedule.dayOfWeek < 0 ||
        schedule.dayOfWeek > 6
      ) {
        errors.push("Day of week must be between 0 (Sunday) and 6 (Saturday)");
      }
    }

    // Validate day of month for monthly/quarterly schedules
    if (schedule.frequency === "MONTHLY" || schedule.frequency === "QUARTERLY") {
      if (
        schedule.dayOfMonth !== undefined &&
        (schedule.dayOfMonth < 1 || schedule.dayOfMonth > 31)
      ) {
        errors.push("Day of month must be between 1 and 31");
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// Export instances for convenience
export const reportService = new ReportService();
export const dashboardService = new DashboardService();
export const kpiService = new KpiService();
export const scheduleService = new ScheduleService();
