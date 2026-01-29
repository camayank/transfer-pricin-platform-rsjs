/**
 * ================================================================================
 * DIGICOMPLY DASHBOARD AI SERVICE
 * AI-Enhanced Practice Management
 *
 * Integrates AI capabilities for:
 * - Compliance risk scoring
 * - Client priority analysis
 * - Smart notification generation
 * - Deadline prediction
 * ================================================================================
 */

import {
  DashboardEngine,
  Client,
  ComplianceForm,
  TeamMember,
  Notification,
  DashboardStats,
  ComplianceStatus,
  FormType,
  Priority,
  NotificationType,
  COMPLIANCE_CALENDAR,
} from "./dashboard-engine";
import {
  getTPDocumentGenerator,
  isAIConfigured,
  PromptType,
  QualityResult,
} from "../ai";

// =============================================================================
// TYPES
// =============================================================================

export interface ComplianceRiskScore {
  overallScore: number; // 0-100
  riskCategory: "critical" | "high" | "medium" | "low";
  breakdown: {
    deadlineRisk: number;
    completionRisk: number;
    complexityRisk: number;
    documentationRisk: number;
  };
  topRiskFactors: Array<{
    factor: string;
    severity: "high" | "medium" | "low";
    explanation: string;
  }>;
  recommendedActions: string[];
  summary: string;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface ClientPriorityAnalysis {
  priorityRanking: Array<{
    clientId: string;
    clientName: string;
    priority: Priority;
    score: number;
    justification: string;
    recommendedHours: number;
    keyDeadlines: string[];
  }>;
  resourceAllocation: {
    criticalClients: string[];
    highPriorityClients: string[];
    recommendedTeamAssignments: Array<{
      clientId: string;
      teamMemberId: string;
      hours: number;
    }>;
  };
  workflowRecommendations: string[];
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface SmartNotification {
  title: string;
  message: string;
  priority: Priority;
  nextSteps: string[];
  regulatoryReference?: string;
  aiGenerated: boolean;
}

export interface DeadlinePrediction {
  clientId: string;
  formType: FormType;
  completionProbability: number; // 0-100
  predictedCompletionDate: string;
  confidenceLevel: "high" | "medium" | "low";
  riskFactors: string[];
  recommendations: string[];
  resourceAdjustments?: string;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface EnhancedDashboardStats extends DashboardStats {
  aiInsights: {
    overallRiskScore: number;
    criticalClientCount: number;
    predictedOverdueCount: number;
    resourceUtilization: number;
  };
  recommendations: string[];
}

// =============================================================================
// DASHBOARD AI SERVICE
// =============================================================================

export class DashboardAIService {
  private dashboardEngine: DashboardEngine;

  constructor() {
    this.dashboardEngine = new DashboardEngine();
  }

  /**
   * Set firm info for the dashboard
   */
  setFirmInfo(firm: Parameters<DashboardEngine["setFirmInfo"]>[0]): void {
    this.dashboardEngine.setFirmInfo(firm);
  }

  /**
   * Get base dashboard engine for standard operations
   */
  getEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  // ===========================================================================
  // COMPLIANCE RISK SCORING
  // ===========================================================================

  /**
   * Calculate AI-enhanced compliance risk score for a client
   */
  async calculateComplianceRiskScore(
    client: Client,
    currentDate: Date = new Date()
  ): Promise<ComplianceRiskScore> {
    // Calculate base risk factors
    const pendingForms = client.complianceForms.filter(
      (f) =>
        f.status !== ComplianceStatus.FILED &&
        f.status !== ComplianceStatus.ACKNOWLEDGED
    );

    const overdueCount = pendingForms.filter(
      (f) => new Date(f.dueDate) < currentDate
    ).length;

    const urgentCount = pendingForms.filter((f) => {
      const dueDate = new Date(f.dueDate);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    }).length;

    // Calculate risk breakdown
    const deadlineRisk = this.calculateDeadlineRisk(pendingForms, currentDate);
    const completionRisk = this.calculateCompletionRisk(pendingForms);
    const complexityRisk = this.calculateComplexityRisk(client);
    const documentationRisk = this.calculateDocumentationRisk(client);

    // Try AI-enhanced analysis
    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.COMPLIANCE_RISK_SCORE,
          {
            clientName: client.name,
            clientPAN: client.pan,
            assessmentYear: "2025-26",
            industry: client.industry,
            complianceStatus: this.formatComplianceStatus(client.complianceForms),
            pendingForms: this.formatPendingForms(pendingForms),
            deadlines: this.formatDeadlines(pendingForms),
            internationalTransactions: client.internationalTransactions.toString(),
            domesticTransactions: client.domesticTransactions.toString(),
            safeHarbourEligibility: client.tpApplicability.safeHarbour ? "Yes" : "No",
            historicalIssues: "None reported",
            currentDate: currentDate.toISOString().split("T")[0],
          }
        );

        if (response.success && response.parsedContent) {
          const parsed = response.parsedContent as Record<string, unknown>;
          return {
            overallScore: (parsed.riskScore as number) || this.calculateOverallScore(deadlineRisk, completionRisk, complexityRisk, documentationRisk),
            riskCategory: (parsed.riskCategory as ComplianceRiskScore["riskCategory"]) || this.categorizeRisk(deadlineRisk + completionRisk + complexityRisk + documentationRisk),
            breakdown: {
              deadlineRisk,
              completionRisk,
              complexityRisk,
              documentationRisk,
            },
            topRiskFactors: (parsed.topRiskFactors as ComplianceRiskScore["topRiskFactors"]) || this.identifyTopRiskFactors(client, pendingForms, currentDate),
            recommendedActions: (parsed.recommendedActions as string[]) || this.generateRecommendedActions(overdueCount, urgentCount),
            summary: (parsed.summary as string) || this.generateRiskSummary(client, deadlineRisk, completionRisk),
            aiGenerated: true,
            qualityScore: response.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI risk scoring failed:", error);
      }
    }

    // Fallback to rule-based scoring
    const overallScore = this.calculateOverallScore(deadlineRisk, completionRisk, complexityRisk, documentationRisk);

    return {
      overallScore,
      riskCategory: this.categorizeRisk(overallScore),
      breakdown: {
        deadlineRisk,
        completionRisk,
        complexityRisk,
        documentationRisk,
      },
      topRiskFactors: this.identifyTopRiskFactors(client, pendingForms, currentDate),
      recommendedActions: this.generateRecommendedActions(overdueCount, urgentCount),
      summary: this.generateRiskSummary(client, deadlineRisk, completionRisk),
      aiGenerated: false,
    };
  }

  private calculateDeadlineRisk(forms: ComplianceForm[], currentDate: Date): number {
    if (forms.length === 0) return 0;

    let risk = 0;
    for (const form of forms) {
      const dueDate = new Date(form.dueDate);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDue < 0) {
        risk += 30; // Overdue
      } else if (daysUntilDue <= 3) {
        risk += 25; // Critical
      } else if (daysUntilDue <= 7) {
        risk += 15; // Urgent
      } else if (daysUntilDue <= 14) {
        risk += 8; // Warning
      } else if (daysUntilDue <= 30) {
        risk += 3; // Notice
      }
    }

    return Math.min(100, risk);
  }

  private calculateCompletionRisk(forms: ComplianceForm[]): number {
    if (forms.length === 0) return 0;

    let risk = 0;
    for (const form of forms) {
      switch (form.status) {
        case ComplianceStatus.NOT_STARTED:
          risk += 20;
          break;
        case ComplianceStatus.IN_PROGRESS:
          risk += 10;
          break;
        case ComplianceStatus.UNDER_REVIEW:
          risk += 5;
          break;
        case ComplianceStatus.PENDING_SIGNATURE:
          risk += 2;
          break;
        case ComplianceStatus.OVERDUE:
          risk += 25;
          break;
      }
    }

    return Math.min(100, risk);
  }

  private calculateComplexityRisk(client: Client): number {
    let risk = 0;

    // International transactions complexity
    if (client.internationalTransactions > 500000000) {
      risk += 20;
    } else if (client.internationalTransactions > 100000000) {
      risk += 10;
    } else if (client.internationalTransactions > 10000000) {
      risk += 5;
    }

    // Multiple form requirements
    if (client.tpApplicability.masterFile) risk += 10;
    if (client.tpApplicability.cbcr) risk += 15;
    if (!client.tpApplicability.safeHarbour) risk += 5;

    return Math.min(100, risk);
  }

  private calculateDocumentationRisk(client: Client): number {
    let risk = 0;

    // Check for documentation completeness indicators
    if (!client.notes) risk += 10;
    if (client.complianceForms.length === 0) risk += 20;

    return Math.min(100, risk);
  }

  private calculateOverallScore(deadline: number, completion: number, complexity: number, documentation: number): number {
    // Weighted average
    return Math.round(deadline * 0.4 + completion * 0.3 + complexity * 0.2 + documentation * 0.1);
  }

  private categorizeRisk(score: number): ComplianceRiskScore["riskCategory"] {
    if (score >= 70) return "critical";
    if (score >= 50) return "high";
    if (score >= 30) return "medium";
    return "low";
  }

  private identifyTopRiskFactors(
    client: Client,
    pendingForms: ComplianceForm[],
    currentDate: Date
  ): ComplianceRiskScore["topRiskFactors"] {
    const factors: ComplianceRiskScore["topRiskFactors"] = [];

    // Check for overdue forms
    const overdueCount = pendingForms.filter((f) => new Date(f.dueDate) < currentDate).length;
    if (overdueCount > 0) {
      factors.push({
        factor: "Overdue Compliance Forms",
        severity: "high",
        explanation: `${overdueCount} form(s) are past their due date`,
      });
    }

    // Check for imminent deadlines
    const urgentCount = pendingForms.filter((f) => {
      const daysUntilDue = Math.ceil(
        (new Date(f.dueDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    }).length;
    if (urgentCount > 0) {
      factors.push({
        factor: "Imminent Deadlines",
        severity: "high",
        explanation: `${urgentCount} form(s) due within 7 days`,
      });
    }

    // Check for not started forms
    const notStartedCount = pendingForms.filter(
      (f) => f.status === ComplianceStatus.NOT_STARTED
    ).length;
    if (notStartedCount > 0) {
      factors.push({
        factor: "Forms Not Started",
        severity: "medium",
        explanation: `${notStartedCount} form(s) have not been started`,
      });
    }

    // Check for complex requirements
    if (client.tpApplicability.masterFile && client.tpApplicability.cbcr) {
      factors.push({
        factor: "Multiple Complex Requirements",
        severity: "medium",
        explanation: "Client requires Master File and CbCR in addition to Form 3CEB",
      });
    }

    return factors.slice(0, 3);
  }

  private generateRecommendedActions(overdueCount: number, urgentCount: number): string[] {
    const actions: string[] = [];

    if (overdueCount > 0) {
      actions.push("Prioritize filing of overdue forms immediately to minimize penalties");
      actions.push("Prepare explanation letter for delayed filings if required");
    }

    if (urgentCount > 0) {
      actions.push("Allocate dedicated resources for urgent deadlines");
      actions.push("Schedule review meetings with clients for pending forms");
    }

    actions.push("Update documentation and maintain audit trail");
    actions.push("Review Safe Harbour eligibility to simplify compliance");

    return actions.slice(0, 5);
  }

  private generateRiskSummary(client: Client, deadlineRisk: number, completionRisk: number): string {
    const overall = this.categorizeRisk((deadlineRisk + completionRisk) / 2);
    return `${client.name} has ${overall} compliance risk. ` +
      `Deadline risk is ${deadlineRisk > 50 ? "elevated" : "manageable"} and ` +
      `completion status requires ${completionRisk > 50 ? "immediate" : "routine"} attention.`;
  }

  private formatComplianceStatus(forms: ComplianceForm[]): string {
    const statusCounts: Record<string, number> = {};
    for (const form of forms) {
      statusCounts[form.status] = (statusCounts[form.status] || 0) + 1;
    }
    return Object.entries(statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(", ");
  }

  private formatPendingForms(forms: ComplianceForm[]): string {
    return forms
      .map((f) => `${f.formType} (${f.assessmentYear}): ${f.status}`)
      .join("\n");
  }

  private formatDeadlines(forms: ComplianceForm[]): string {
    return forms.map((f) => `${f.formType}: ${f.dueDate}`).join("\n");
  }

  // ===========================================================================
  // CLIENT PRIORITY ANALYSIS
  // ===========================================================================

  /**
   * Analyze client priorities for resource allocation
   */
  async analyzeClientPriorities(
    clients: Client[],
    teamMembers: TeamMember[],
    currentDate: Date = new Date()
  ): Promise<ClientPriorityAnalysis> {
    // Calculate risk scores for all clients
    const clientScores: Array<{
      client: Client;
      riskScore: ComplianceRiskScore;
    }> = [];

    for (const client of clients) {
      const riskScore = await this.calculateComplianceRiskScore(client, currentDate);
      clientScores.push({ client, riskScore });
    }

    // Sort by risk score
    clientScores.sort((a, b) => b.riskScore.overallScore - a.riskScore.overallScore);

    // Generate priority ranking
    const priorityRanking = clientScores.map((cs) => ({
      clientId: cs.client.id,
      clientName: cs.client.name,
      priority: this.mapRiskToPriority(cs.riskScore.riskCategory),
      score: cs.riskScore.overallScore,
      justification: cs.riskScore.summary,
      recommendedHours: this.estimateRequiredHours(cs.client, cs.riskScore),
      keyDeadlines: cs.client.complianceForms
        .filter(
          (f) =>
            f.status !== ComplianceStatus.FILED &&
            f.status !== ComplianceStatus.ACKNOWLEDGED
        )
        .map((f) => `${f.formType}: ${f.dueDate}`)
        .slice(0, 3),
    }));

    // Resource allocation
    const criticalClients = clientScores
      .filter((cs) => cs.riskScore.riskCategory === "critical")
      .map((cs) => cs.client.name);

    const highPriorityClients = clientScores
      .filter((cs) => cs.riskScore.riskCategory === "high")
      .map((cs) => cs.client.name);

    // Generate team assignments
    const recommendedTeamAssignments = this.generateTeamAssignments(
      clientScores,
      teamMembers
    );

    // Workflow recommendations
    const workflowRecommendations = this.generateWorkflowRecommendations(
      clientScores,
      teamMembers
    );

    return {
      priorityRanking,
      resourceAllocation: {
        criticalClients,
        highPriorityClients,
        recommendedTeamAssignments,
      },
      workflowRecommendations,
      aiGenerated: false, // Can be enhanced with AI
    };
  }

  private mapRiskToPriority(riskCategory: ComplianceRiskScore["riskCategory"]): Priority {
    switch (riskCategory) {
      case "critical":
        return Priority.CRITICAL;
      case "high":
        return Priority.HIGH;
      case "medium":
        return Priority.MEDIUM;
      default:
        return Priority.LOW;
    }
  }

  private estimateRequiredHours(client: Client, riskScore: ComplianceRiskScore): number {
    let hours = 0;

    // Base hours per form type
    for (const form of client.complianceForms) {
      if (
        form.status === ComplianceStatus.FILED ||
        form.status === ComplianceStatus.ACKNOWLEDGED
      ) {
        continue;
      }

      switch (form.formType) {
        case FormType.FORM_3CEB:
          hours += form.status === ComplianceStatus.NOT_STARTED ? 20 : 10;
          break;
        case FormType.FORM_3CEAA:
          hours += form.status === ComplianceStatus.NOT_STARTED ? 30 : 15;
          break;
        case FormType.FORM_3CEAD:
          hours += form.status === ComplianceStatus.NOT_STARTED ? 40 : 20;
          break;
        default:
          hours += 10;
      }
    }

    // Adjust for complexity
    if (riskScore.breakdown.complexityRisk > 50) {
      hours *= 1.3;
    }

    return Math.round(hours);
  }

  private generateTeamAssignments(
    clientScores: Array<{ client: Client; riskScore: ComplianceRiskScore }>,
    teamMembers: TeamMember[]
  ): ClientPriorityAnalysis["resourceAllocation"]["recommendedTeamAssignments"] {
    const assignments: ClientPriorityAnalysis["resourceAllocation"]["recommendedTeamAssignments"] = [];

    // Sort team members by available capacity
    const availableMembers = [...teamMembers].sort(
      (a, b) => b.availableCapacity - a.availableCapacity
    );

    for (const cs of clientScores.slice(0, 10)) {
      const hours = this.estimateRequiredHours(cs.client, cs.riskScore);
      const assignee = availableMembers.find((m) => m.availableCapacity >= hours);

      if (assignee) {
        assignments.push({
          clientId: cs.client.id,
          teamMemberId: assignee.id,
          hours,
        });
        assignee.availableCapacity -= hours;
      }
    }

    return assignments;
  }

  private generateWorkflowRecommendations(
    clientScores: Array<{ client: Client; riskScore: ComplianceRiskScore }>,
    teamMembers: TeamMember[]
  ): string[] {
    const recommendations: string[] = [];

    const criticalCount = clientScores.filter(
      (cs) => cs.riskScore.riskCategory === "critical"
    ).length;

    if (criticalCount > 0) {
      recommendations.push(
        `Prioritize ${criticalCount} critical client(s) - assign senior team members`
      );
    }

    const totalRequiredHours = clientScores.reduce(
      (sum, cs) => sum + this.estimateRequiredHours(cs.client, cs.riskScore),
      0
    );
    const totalAvailableHours = teamMembers.reduce(
      (sum, m) => sum + m.availableCapacity,
      0
    );

    if (totalRequiredHours > totalAvailableHours) {
      recommendations.push(
        `Resource constraint: Required ${totalRequiredHours}h, Available ${totalAvailableHours}h - consider overtime or temporary resources`
      );
    }

    recommendations.push("Schedule daily standup for tracking critical deadlines");
    recommendations.push("Implement parallel review process for urgent filings");
    recommendations.push("Pre-populate forms using accounting connector data where available");

    return recommendations.slice(0, 5);
  }

  // ===========================================================================
  // SMART NOTIFICATIONS
  // ===========================================================================

  /**
   * Generate AI-enhanced smart notification
   */
  async generateSmartNotification(params: {
    eventType: NotificationType;
    clientName: string;
    formType: FormType;
    dueDate: string;
    currentStatus: ComplianceStatus;
    assignedTo?: string;
    additionalContext?: string;
  }): Promise<SmartNotification> {
    const currentDate = new Date();
    const dueDate = new Date(params.dueDate);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.SMART_NOTIFICATION,
          {
            eventType: params.eventType,
            clientName: params.clientName,
            formType: params.formType,
            dueDate: params.dueDate,
            currentDate: currentDate.toISOString().split("T")[0],
            daysUntilDue: daysUntilDue.toString(),
            currentStatus: params.currentStatus,
            additionalContext: params.additionalContext || "",
            assignedTo: params.assignedTo || "Unassigned",
          }
        );

        if (response.success && response.parsedContent) {
          const parsed = response.parsedContent as Record<string, unknown>;
          return {
            title: (parsed.title as string) || this.generateNotificationTitle(params, daysUntilDue),
            message: (parsed.message as string) || this.generateNotificationMessage(params, daysUntilDue),
            priority: (parsed.priority as Priority) || this.determineNotificationPriority(daysUntilDue, params.currentStatus),
            nextSteps: (parsed.nextSteps as string[]) || this.generateNotificationNextSteps(params, daysUntilDue),
            regulatoryReference: (parsed.regulatoryReference as string) || this.getRegulatorReference(params.formType),
            aiGenerated: true,
          };
        }
      } catch (error) {
        console.error("AI notification generation failed:", error);
      }
    }

    // Fallback to template-based notification
    return {
      title: this.generateNotificationTitle(params, daysUntilDue),
      message: this.generateNotificationMessage(params, daysUntilDue),
      priority: this.determineNotificationPriority(daysUntilDue, params.currentStatus),
      nextSteps: this.generateNotificationNextSteps(params, daysUntilDue),
      regulatoryReference: this.getRegulatorReference(params.formType),
      aiGenerated: false,
    };
  }

  private generateNotificationTitle(
    params: { formType: FormType; clientName: string },
    daysUntilDue: number
  ): string {
    if (daysUntilDue < 0) {
      return `OVERDUE: ${params.formType} for ${params.clientName}`;
    }
    if (daysUntilDue <= 1) {
      return `URGENT: ${params.formType} due tomorrow`;
    }
    if (daysUntilDue <= 7) {
      return `${params.formType} due in ${daysUntilDue} days`;
    }
    return `Reminder: ${params.formType} deadline approaching`;
  }

  private generateNotificationMessage(
    params: { formType: FormType; clientName: string; dueDate: string; currentStatus: ComplianceStatus },
    daysUntilDue: number
  ): string {
    if (daysUntilDue < 0) {
      return `${params.formType} for ${params.clientName} was due on ${params.dueDate}. Immediate action required to file and minimize penalties.`;
    }
    return `${params.formType} for ${params.clientName} is due on ${params.dueDate} (${daysUntilDue} days). Current status: ${params.currentStatus}.`;
  }

  private determineNotificationPriority(daysUntilDue: number, status: ComplianceStatus): Priority {
    if (daysUntilDue < 0 || status === ComplianceStatus.OVERDUE) return Priority.CRITICAL;
    if (daysUntilDue <= 3) return Priority.CRITICAL;
    if (daysUntilDue <= 7) return Priority.HIGH;
    if (daysUntilDue <= 14) return Priority.MEDIUM;
    return Priority.LOW;
  }

  private generateNotificationNextSteps(
    params: { formType: FormType; currentStatus: ComplianceStatus; assignedTo?: string },
    daysUntilDue: number
  ): string[] {
    const steps: string[] = [];

    if (params.currentStatus === ComplianceStatus.NOT_STARTED) {
      steps.push("Begin form preparation immediately");
      steps.push("Gather required financial data and documentation");
    } else if (params.currentStatus === ComplianceStatus.IN_PROGRESS) {
      steps.push("Complete pending sections of the form");
      steps.push("Schedule internal review");
    } else if (params.currentStatus === ComplianceStatus.UNDER_REVIEW) {
      steps.push("Expedite review process");
      steps.push("Address any review comments");
    }

    if (daysUntilDue <= 3) {
      steps.push("Escalate to engagement partner");
    }

    steps.push(`Contact ${params.assignedTo || "assigned team member"} for status update`);

    return steps.slice(0, 4);
  }

  private getRegulatorReference(formType: FormType): string {
    const calendar = COMPLIANCE_CALENDAR[formType];
    return calendar
      ? `Due: ${calendar.dueDate}. Penalty: ${calendar.penalty}`
      : "";
  }

  // ===========================================================================
  // DEADLINE PREDICTION
  // ===========================================================================

  /**
   * Predict deadline completion probability
   */
  async predictDeadlineCompletion(params: {
    client: Client;
    form: ComplianceForm;
    avgCompletionDays?: number;
    onTimeRate?: number;
    availableHours?: number;
  }): Promise<DeadlinePrediction> {
    const currentDate = new Date();
    const dueDate = new Date(params.form.dueDate);
    const daysRemaining = Math.ceil(
      (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Estimate completion percentage based on status
    const completionPercentage = this.estimateCompletionPercentage(params.form.status);

    // Calculate base probability
    let probability = this.calculateBaseProbability(
      daysRemaining,
      completionPercentage,
      params.avgCompletionDays || 14,
      params.onTimeRate || 80
    );

    // Identify risk factors
    const riskFactors: string[] = [];
    if (daysRemaining < 0) {
      probability = 0;
      riskFactors.push("Deadline has already passed");
    }
    if (completionPercentage < 50 && daysRemaining < 7) {
      probability *= 0.7;
      riskFactors.push("Low completion with imminent deadline");
    }
    if (params.availableHours && params.availableHours < 10) {
      probability *= 0.8;
      riskFactors.push("Limited resource availability");
    }

    // Estimate completion date
    const estimatedDaysToComplete = Math.ceil(
      ((100 - completionPercentage) / 100) * (params.avgCompletionDays || 14)
    );
    const predictedCompletion = new Date(currentDate);
    predictedCompletion.setDate(predictedCompletion.getDate() + estimatedDaysToComplete);

    // Generate recommendations
    const recommendations: string[] = [];
    if (probability < 50) {
      recommendations.push("Allocate additional resources immediately");
      recommendations.push("Consider parallel processing of form sections");
    }
    if (probability < 80 && probability >= 50) {
      recommendations.push("Monitor progress daily");
      recommendations.push("Prepare contingency plan for delayed filing");
    }
    if (probability >= 80) {
      recommendations.push("Maintain current pace");
      recommendations.push("Schedule final review in advance");
    }

    return {
      clientId: params.client.id,
      formType: params.form.formType,
      completionProbability: Math.round(Math.max(0, Math.min(100, probability))),
      predictedCompletionDate: predictedCompletion.toISOString().split("T")[0],
      confidenceLevel: probability >= 80 ? "high" : probability >= 50 ? "medium" : "low",
      riskFactors,
      recommendations,
      resourceAdjustments:
        probability < 70 ? "Consider assigning additional team member" : undefined,
      aiGenerated: false,
    };
  }

  private estimateCompletionPercentage(status: ComplianceStatus): number {
    switch (status) {
      case ComplianceStatus.NOT_STARTED:
        return 0;
      case ComplianceStatus.IN_PROGRESS:
        return 40;
      case ComplianceStatus.UNDER_REVIEW:
        return 70;
      case ComplianceStatus.PENDING_SIGNATURE:
        return 90;
      case ComplianceStatus.FILED:
      case ComplianceStatus.ACKNOWLEDGED:
        return 100;
      default:
        return 20;
    }
  }

  private calculateBaseProbability(
    daysRemaining: number,
    completionPercentage: number,
    avgCompletionDays: number,
    historicalOnTimeRate: number
  ): number {
    // Time factor (0-1)
    const estimatedDaysNeeded = ((100 - completionPercentage) / 100) * avgCompletionDays;
    const timeFactor = daysRemaining >= estimatedDaysNeeded ? 1 : daysRemaining / estimatedDaysNeeded;

    // Progress factor (0-1)
    const progressFactor = completionPercentage / 100;

    // Historical factor (0-1)
    const historicalFactor = historicalOnTimeRate / 100;

    // Combined probability
    return (timeFactor * 0.4 + progressFactor * 0.4 + historicalFactor * 0.2) * 100;
  }

  // ===========================================================================
  // ENHANCED DASHBOARD STATS
  // ===========================================================================

  /**
   * Get AI-enhanced dashboard statistics
   */
  async getEnhancedStats(clients: Client[]): Promise<EnhancedDashboardStats> {
    const baseStats = this.dashboardEngine.getDashboardStats();

    // Calculate AI insights
    let totalRiskScore = 0;
    let criticalCount = 0;
    let predictedOverdueCount = 0;

    for (const client of clients) {
      const riskScore = await this.calculateComplianceRiskScore(client);
      totalRiskScore += riskScore.overallScore;

      if (riskScore.riskCategory === "critical") {
        criticalCount++;
      }

      // Check for predicted overdue
      for (const form of client.complianceForms) {
        if (
          form.status !== ComplianceStatus.FILED &&
          form.status !== ComplianceStatus.ACKNOWLEDGED
        ) {
          const prediction = await this.predictDeadlineCompletion({
            client,
            form,
          });
          if (prediction.completionProbability < 50) {
            predictedOverdueCount++;
          }
        }
      }
    }

    const recommendations: string[] = [];
    if (criticalCount > 0) {
      recommendations.push(`${criticalCount} client(s) require immediate attention`);
    }
    if (predictedOverdueCount > 0) {
      recommendations.push(`${predictedOverdueCount} form(s) at risk of missing deadline`);
    }
    recommendations.push("Review resource allocation for optimal coverage");

    return {
      ...baseStats,
      aiInsights: {
        overallRiskScore: clients.length > 0 ? Math.round(totalRiskScore / clients.length) : 0,
        criticalClientCount: criticalCount,
        predictedOverdueCount,
        resourceUtilization: 75, // Would need team data for accurate calculation
      },
      recommendations,
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createDashboardAIService(): DashboardAIService {
  return new DashboardAIService();
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export {
  ComplianceStatus,
  FormType,
  Priority,
  TeamRole,
  NotificationType,
  COMPLIANCE_CALENDAR,
} from "./dashboard-engine";
