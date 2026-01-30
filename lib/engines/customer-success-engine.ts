/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Customer Success Engine
 *
 * Implements health scoring, NPS tracking, playbook execution, and renewal management.
 * Enables proactive customer retention through data-driven insights.
 * ================================================================================
 */

// Types
export interface HealthScoreInput {
  firmId: string;
  clientId: string;
  engagementData: {
    lastLogin?: Date;
    loginFrequency: number; // per month
    documentsViewed: number;
    formsSubmitted: number;
  };
  complianceData: {
    totalEngagements: number;
    completedEngagements: number;
    overdueEngagements: number;
  };
  paymentData: {
    totalInvoices: number;
    paidOnTime: number;
    outstandingAmount: number;
    averageDaysLate: number;
  };
  supportData: {
    totalTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number; // in hours
    escalatedTickets: number;
  };
  usageData: {
    featuresUsed: number;
    totalFeatures: number;
    apiCalls: number;
    storageUsed: number; // in MB
  };
}

export interface HealthScoreResult {
  overallScore: number;
  engagementScore: number;
  complianceScore: number;
  paymentScore: number;
  supportScore: number;
  usageScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  factors: HealthFactor[];
  recommendations: Recommendation[];
}

export interface HealthFactor {
  name: string;
  score: number;
  weight: number;
  impact: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  detail: string;
}

export interface Recommendation {
  type: "ACTION" | "ALERT" | "OPPORTUNITY";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  actionUrl?: string;
}

export interface EngagementEvent {
  firmId: string;
  clientId: string;
  eventType: EngagementEventType;
  eventData?: Record<string, unknown>;
  userId?: string;
  source?: "WEB" | "MOBILE" | "API";
}

export enum EngagementEventType {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  DOCUMENT_VIEW = "DOCUMENT_VIEW",
  DOCUMENT_DOWNLOAD = "DOCUMENT_DOWNLOAD",
  FORM_START = "FORM_START",
  FORM_SUBMIT = "FORM_SUBMIT",
  REPORT_GENERATE = "REPORT_GENERATE",
  SUPPORT_TICKET = "SUPPORT_TICKET",
  FEATURE_USE = "FEATURE_USE",
  SEARCH = "SEARCH",
  EXPORT = "EXPORT",
  SETTINGS_CHANGE = "SETTINGS_CHANGE",
}

export interface NpsSurveyInput {
  firmId: string;
  clientId: string;
  touchpoint: "POST_ENGAGEMENT" | "QUARTERLY" | "ANNUAL" | "MILESTONE";
  score?: number;
  feedback?: string;
}

export interface NpsSurveyResult {
  score: number;
  sentiment: "PROMOTER" | "PASSIVE" | "DETRACTOR";
  requiresFollowUp: boolean;
  suggestedActions: string[];
}

export interface PlaybookInput {
  firmId: string;
  name: string;
  description?: string;
  triggerType: "MANUAL" | "SCORE_CHANGE" | "EVENT" | "SCHEDULED";
  triggerConditions?: TriggerCondition[];
  stages: PlaybookStage[];
}

export interface TriggerCondition {
  field: string;
  operator: "EQUALS" | "GREATER_THAN" | "LESS_THAN" | "CHANGED_TO";
  value: unknown;
}

export interface PlaybookStage {
  name: string;
  order: number;
  tasks: PlaybookTask[];
  duration?: number; // in days
  completionCriteria?: string;
}

export interface PlaybookTask {
  title: string;
  description?: string;
  assigneeRole?: string;
  dueOffset?: number; // days from stage start
  isRequired: boolean;
  automatable: boolean;
  automationConfig?: Record<string, unknown>;
}

export interface RenewalInput {
  firmId: string;
  clientId: string;
  contractType: "ANNUAL" | "MULTI_YEAR" | "PROJECT_BASED";
  currentValue: number;
  renewalDate: Date;
}

export interface RenewalAnalysis {
  probability: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskFactors: RiskFactor[];
  recommendedActions: string[];
  upsellOpportunities: string[];
}

export interface RiskFactor {
  name: string;
  impact: number; // -100 to 100
  mitigation?: string;
}

// =============================================================================
// HEALTH SCORE SERVICE
// =============================================================================

export class HealthScoreService {
  // Score weights
  private readonly weights = {
    engagement: 0.25,
    compliance: 0.25,
    payment: 0.20,
    support: 0.15,
    usage: 0.15,
  };

  /**
   * Calculate comprehensive health score
   */
  calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
    const engagementScore = this.calculateEngagementScore(input.engagementData);
    const complianceScore = this.calculateComplianceScore(input.complianceData);
    const paymentScore = this.calculatePaymentScore(input.paymentData);
    const supportScore = this.calculateSupportScore(input.supportData);
    const usageScore = this.calculateUsageScore(input.usageData);

    const overallScore = Math.round(
      engagementScore * this.weights.engagement +
      complianceScore * this.weights.compliance +
      paymentScore * this.weights.payment +
      supportScore * this.weights.support +
      usageScore * this.weights.usage
    );

    const riskLevel = this.determineRiskLevel(overallScore);
    const factors = this.buildHealthFactors(
      engagementScore,
      complianceScore,
      paymentScore,
      supportScore,
      usageScore,
      input
    );
    const recommendations = this.generateRecommendations(
      riskLevel,
      factors,
      input
    );

    return {
      overallScore,
      engagementScore,
      complianceScore,
      paymentScore,
      supportScore,
      usageScore,
      riskLevel,
      trend: "STABLE", // Would need historical data to calculate
      factors,
      recommendations,
    };
  }

  private calculateEngagementScore(
    data: HealthScoreInput["engagementData"]
  ): number {
    let score = 0;

    // Login recency (max 30 points)
    if (data.lastLogin) {
      const daysSinceLogin = Math.floor(
        (Date.now() - new Date(data.lastLogin).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLogin <= 1) score += 30;
      else if (daysSinceLogin <= 7) score += 25;
      else if (daysSinceLogin <= 14) score += 20;
      else if (daysSinceLogin <= 30) score += 10;
    }

    // Login frequency (max 30 points)
    if (data.loginFrequency >= 20) score += 30;
    else if (data.loginFrequency >= 10) score += 25;
    else if (data.loginFrequency >= 5) score += 20;
    else if (data.loginFrequency >= 2) score += 10;

    // Document activity (max 20 points)
    if (data.documentsViewed >= 10) score += 20;
    else if (data.documentsViewed >= 5) score += 15;
    else if (data.documentsViewed >= 1) score += 10;

    // Form submissions (max 20 points)
    if (data.formsSubmitted >= 5) score += 20;
    else if (data.formsSubmitted >= 2) score += 15;
    else if (data.formsSubmitted >= 1) score += 10;

    return score;
  }

  private calculateComplianceScore(
    data: HealthScoreInput["complianceData"]
  ): number {
    if (data.totalEngagements === 0) return 50; // Neutral for new clients

    const completionRate = data.completedEngagements / data.totalEngagements;
    const overdueRate = data.overdueEngagements / data.totalEngagements;

    let score = Math.round(completionRate * 70);
    score -= Math.round(overdueRate * 50);

    return Math.max(0, Math.min(100, score + 30)); // Base score of 30
  }

  private calculatePaymentScore(
    data: HealthScoreInput["paymentData"]
  ): number {
    if (data.totalInvoices === 0) return 70; // Good default for new clients

    let score = 0;

    // On-time payment rate (max 60 points)
    const onTimeRate = data.paidOnTime / data.totalInvoices;
    score += Math.round(onTimeRate * 60);

    // Outstanding amount impact (max 20 points deduction)
    if (data.outstandingAmount === 0) {
      score += 20;
    } else if (data.outstandingAmount < 10000) {
      score += 15;
    } else if (data.outstandingAmount < 50000) {
      score += 10;
    }

    // Average days late (max 20 points deduction)
    if (data.averageDaysLate === 0) {
      score += 20;
    } else if (data.averageDaysLate < 7) {
      score += 15;
    } else if (data.averageDaysLate < 14) {
      score += 10;
    } else if (data.averageDaysLate < 30) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateSupportScore(
    data: HealthScoreInput["supportData"]
  ): number {
    if (data.totalTickets === 0) return 80; // Good for clients with no issues

    let score = 80; // Start high, deduct for issues

    // Resolution rate impact
    const resolutionRate = data.resolvedTickets / data.totalTickets;
    if (resolutionRate < 0.9) score -= 20;
    else if (resolutionRate < 0.95) score -= 10;

    // Average resolution time impact
    if (data.averageResolutionTime > 48) score -= 20;
    else if (data.averageResolutionTime > 24) score -= 10;

    // Escalation rate impact
    const escalationRate = data.escalatedTickets / data.totalTickets;
    if (escalationRate > 0.2) score -= 30;
    else if (escalationRate > 0.1) score -= 15;
    else if (escalationRate > 0.05) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculateUsageScore(
    data: HealthScoreInput["usageData"]
  ): number {
    let score = 0;

    // Feature adoption (max 50 points)
    const featureAdoption = data.featuresUsed / data.totalFeatures;
    score += Math.round(featureAdoption * 50);

    // API usage (max 30 points)
    if (data.apiCalls >= 1000) score += 30;
    else if (data.apiCalls >= 500) score += 25;
    else if (data.apiCalls >= 100) score += 20;
    else if (data.apiCalls >= 10) score += 10;

    // Storage utilization (max 20 points - moderate use is good)
    if (data.storageUsed >= 100 && data.storageUsed <= 1000) {
      score += 20;
    } else if (data.storageUsed > 0) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private determineRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (score >= 80) return "LOW";
    if (score >= 60) return "MEDIUM";
    if (score >= 40) return "HIGH";
    return "CRITICAL";
  }

  private buildHealthFactors(
    engagementScore: number,
    complianceScore: number,
    paymentScore: number,
    supportScore: number,
    usageScore: number,
    input: HealthScoreInput
  ): HealthFactor[] {
    return [
      {
        name: "Engagement",
        score: engagementScore,
        weight: this.weights.engagement,
        impact: engagementScore >= 70 ? "POSITIVE" : engagementScore >= 50 ? "NEUTRAL" : "NEGATIVE",
        detail: `${input.engagementData.loginFrequency} logins/month, ${input.engagementData.formsSubmitted} forms submitted`,
      },
      {
        name: "Compliance",
        score: complianceScore,
        weight: this.weights.compliance,
        impact: complianceScore >= 70 ? "POSITIVE" : complianceScore >= 50 ? "NEUTRAL" : "NEGATIVE",
        detail: `${input.complianceData.completedEngagements}/${input.complianceData.totalEngagements} completed, ${input.complianceData.overdueEngagements} overdue`,
      },
      {
        name: "Payment",
        score: paymentScore,
        weight: this.weights.payment,
        impact: paymentScore >= 70 ? "POSITIVE" : paymentScore >= 50 ? "NEUTRAL" : "NEGATIVE",
        detail: `${input.paymentData.paidOnTime}/${input.paymentData.totalInvoices} on-time, ₹${input.paymentData.outstandingAmount} outstanding`,
      },
      {
        name: "Support",
        score: supportScore,
        weight: this.weights.support,
        impact: supportScore >= 70 ? "POSITIVE" : supportScore >= 50 ? "NEUTRAL" : "NEGATIVE",
        detail: `${input.supportData.resolvedTickets}/${input.supportData.totalTickets} resolved, ${input.supportData.escalatedTickets} escalated`,
      },
      {
        name: "Usage",
        score: usageScore,
        weight: this.weights.usage,
        impact: usageScore >= 70 ? "POSITIVE" : usageScore >= 50 ? "NEUTRAL" : "NEGATIVE",
        detail: `${input.usageData.featuresUsed}/${input.usageData.totalFeatures} features, ${input.usageData.apiCalls} API calls`,
      },
    ];
  }

  private generateRecommendations(
    riskLevel: string,
    factors: HealthFactor[],
    input: HealthScoreInput
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Critical risk - immediate action needed
    if (riskLevel === "CRITICAL") {
      recommendations.push({
        type: "ALERT",
        priority: "HIGH",
        title: "Schedule Immediate Check-in",
        description: "Client health score is critical. Schedule a call within 24 hours to understand concerns.",
        actionUrl: "/calendar/schedule",
      });
    }

    // Engagement-specific recommendations
    const engagementFactor = factors.find((f) => f.name === "Engagement");
    if (engagementFactor && engagementFactor.impact === "NEGATIVE") {
      recommendations.push({
        type: "ACTION",
        priority: "HIGH",
        title: "Re-engage Client",
        description: "Low engagement detected. Send personalized training invitation or feature update.",
        actionUrl: "/messages/compose",
      });
    }

    // Payment-specific recommendations
    const paymentFactor = factors.find((f) => f.name === "Payment");
    if (paymentFactor && paymentFactor.impact === "NEGATIVE") {
      recommendations.push({
        type: "ACTION",
        priority: "MEDIUM",
        title: "Review Payment Terms",
        description: "Payment delays detected. Consider discussing payment terms or setting up auto-debit.",
        actionUrl: "/finance/invoices",
      });
    }

    // Usage-specific opportunities
    const usageFactor = factors.find((f) => f.name === "Usage");
    if (usageFactor && usageFactor.score < 50) {
      recommendations.push({
        type: "OPPORTUNITY",
        priority: "LOW",
        title: "Feature Adoption Training",
        description: `Client is only using ${input.usageData.featuresUsed} of ${input.usageData.totalFeatures} features. Schedule a training session.`,
        actionUrl: "/training/schedule",
      });
    }

    return recommendations;
  }
}

// =============================================================================
// NPS SERVICE
// =============================================================================

export class NpsService {
  /**
   * Analyze NPS response
   */
  analyzeResponse(score: number): NpsSurveyResult {
    const sentiment = this.classifySentiment(score);
    const requiresFollowUp = sentiment === "DETRACTOR" || score <= 5;
    const suggestedActions = this.getSuggestedActions(sentiment, score);

    return {
      score,
      sentiment,
      requiresFollowUp,
      suggestedActions,
    };
  }

  private classifySentiment(score: number): "PROMOTER" | "PASSIVE" | "DETRACTOR" {
    if (score >= 9) return "PROMOTER";
    if (score >= 7) return "PASSIVE";
    return "DETRACTOR";
  }

  private getSuggestedActions(sentiment: string, score: number): string[] {
    const actions: string[] = [];

    if (sentiment === "PROMOTER") {
      actions.push("Request testimonial or case study");
      actions.push("Invite to referral program");
      actions.push("Offer beta access to new features");
    } else if (sentiment === "PASSIVE") {
      actions.push("Schedule follow-up to understand concerns");
      actions.push("Send personalized value proposition");
      actions.push("Offer additional training resources");
    } else {
      actions.push("Immediate callback from customer success manager");
      actions.push("Create escalation ticket");
      actions.push("Offer service recovery");
      if (score <= 3) {
        actions.push("Involve leadership in resolution");
      }
    }

    return actions;
  }

  /**
   * Calculate NPS score for a firm
   */
  calculateNps(responses: number[]): number {
    if (responses.length === 0) return 0;

    const promoters = responses.filter((r) => r >= 9).length;
    const detractors = responses.filter((r) => r <= 6).length;

    const promoterPct = (promoters / responses.length) * 100;
    const detractorPct = (detractors / responses.length) * 100;

    return Math.round(promoterPct - detractorPct);
  }
}

// =============================================================================
// PLAYBOOK SERVICE
// =============================================================================

export class PlaybookService {
  /**
   * Evaluate if trigger conditions are met
   */
  evaluateTrigger(
    conditions: TriggerCondition[],
    data: Record<string, unknown>
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((condition) => {
      const value = data[condition.field];

      switch (condition.operator) {
        case "EQUALS":
          return value === condition.value;
        case "GREATER_THAN":
          return (value as number) > (condition.value as number);
        case "LESS_THAN":
          return (value as number) < (condition.value as number);
        case "CHANGED_TO":
          return data[`${condition.field}_changed`] && value === condition.value;
        default:
          return false;
      }
    });
  }

  /**
   * Get tasks for current stage
   */
  getStageTasks(
    stages: PlaybookStage[],
    currentStage: number
  ): PlaybookTask[] {
    if (currentStage < 0 || currentStage >= stages.length) {
      return [];
    }
    return stages[currentStage].tasks;
  }

  /**
   * Calculate due dates for stage tasks
   */
  calculateTaskDueDates(
    tasks: PlaybookTask[],
    stageStartDate: Date
  ): Array<{ task: PlaybookTask; dueDate: Date }> {
    return tasks.map((task) => {
      const dueDate = new Date(stageStartDate);
      if (task.dueOffset) {
        dueDate.setDate(dueDate.getDate() + task.dueOffset);
      }
      return { task, dueDate };
    });
  }
}

// =============================================================================
// RENEWAL SERVICE
// =============================================================================

export class RenewalService {
  /**
   * Analyze renewal opportunity
   */
  analyzeRenewal(
    input: RenewalInput,
    healthScore?: HealthScoreResult
  ): RenewalAnalysis {
    const riskFactors = this.identifyRiskFactors(input, healthScore);
    const probability = this.calculateProbability(riskFactors, healthScore);
    const riskLevel = this.determineRenewalRiskLevel(probability);
    const recommendedActions = this.getRecommendedActions(riskLevel, riskFactors);
    const upsellOpportunities = this.identifyUpsellOpportunities(input, healthScore);

    return {
      probability,
      riskLevel,
      riskFactors,
      recommendedActions,
      upsellOpportunities,
    };
  }

  private identifyRiskFactors(
    input: RenewalInput,
    healthScore?: HealthScoreResult
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Time to renewal
    const daysToRenewal = Math.floor(
      (new Date(input.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysToRenewal < 30) {
      factors.push({
        name: "Late Engagement",
        impact: -20,
        mitigation: "Immediately schedule renewal discussion",
      });
    }

    // Health score factors
    if (healthScore) {
      if (healthScore.riskLevel === "CRITICAL") {
        factors.push({
          name: "Critical Health Score",
          impact: -40,
          mitigation: "Address health score issues before renewal discussion",
        });
      } else if (healthScore.riskLevel === "HIGH") {
        factors.push({
          name: "High Risk Health Score",
          impact: -25,
          mitigation: "Create remediation plan",
        });
      }

      if (healthScore.paymentScore < 50) {
        factors.push({
          name: "Payment Issues",
          impact: -15,
          mitigation: "Resolve outstanding invoices",
        });
      }

      if (healthScore.engagementScore < 50) {
        factors.push({
          name: "Low Engagement",
          impact: -20,
          mitigation: "Re-engage with value demonstration",
        });
      }
    }

    return factors;
  }

  private calculateProbability(
    riskFactors: RiskFactor[],
    healthScore?: HealthScoreResult
  ): number {
    let baseProbability = 70; // Default assumption

    // Adjust based on health score
    if (healthScore) {
      if (healthScore.overallScore >= 80) baseProbability = 90;
      else if (healthScore.overallScore >= 60) baseProbability = 75;
      else if (healthScore.overallScore >= 40) baseProbability = 50;
      else baseProbability = 30;
    }

    // Apply risk factor impacts
    const totalImpact = riskFactors.reduce((sum, f) => sum + f.impact, 0);
    const adjustedProbability = baseProbability + totalImpact;

    return Math.max(0, Math.min(100, adjustedProbability));
  }

  private determineRenewalRiskLevel(probability: number): "LOW" | "MEDIUM" | "HIGH" {
    if (probability >= 70) return "LOW";
    if (probability >= 40) return "MEDIUM";
    return "HIGH";
  }

  private getRecommendedActions(
    riskLevel: string,
    riskFactors: RiskFactor[]
  ): string[] {
    const actions: string[] = [];

    if (riskLevel === "HIGH") {
      actions.push("Escalate to leadership for strategic intervention");
      actions.push("Prepare competitive analysis and retention offer");
    }

    // Add mitigations from risk factors
    riskFactors.forEach((f) => {
      if (f.mitigation) actions.push(f.mitigation);
    });

    if (riskLevel !== "LOW") {
      actions.push("Conduct QBR to demonstrate value");
      actions.push("Document success stories and ROI");
    }

    return [...new Set(actions)]; // Remove duplicates
  }

  private identifyUpsellOpportunities(
    input: RenewalInput,
    healthScore?: HealthScoreResult
  ): string[] {
    const opportunities: string[] = [];

    if (healthScore && healthScore.overallScore >= 70) {
      opportunities.push("Enterprise plan upgrade with advanced features");
      opportunities.push("Additional user licenses");
      opportunities.push("API access for integrations");
      opportunities.push("Premium support package");
    }

    if (input.contractType === "ANNUAL") {
      opportunities.push("Multi-year discount for commitment");
    }

    return opportunities;
  }
}

// Export instances for convenience
export const healthScoreService = new HealthScoreService();
export const npsService = new NpsService();
export const playbookService = new PlaybookService();
export const renewalService = new RenewalService();
