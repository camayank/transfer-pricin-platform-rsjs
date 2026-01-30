/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * AI/ML Intelligence Engine
 *
 * Implements lead scoring, churn prediction, AI recommendations,
 * and document data extraction.
 * ================================================================================
 */

// Types
export interface LeadScoreInput {
  firmId: string;
  leadId: string;
  companySize: "MICRO" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";
  industry: string;
  annualRevenue?: number;
  employeeCount?: number;
  website?: string;
  engagementHistory: {
    emailOpens: number;
    websiteVisits: number;
    demoRequested: boolean;
    contentDownloads: number;
    eventsAttended: number;
  };
  firmographics: {
    hasRelatedPartyTransactions: boolean;
    isMultinational: boolean;
    hasPreviousTpEngagement: boolean;
    complianceDeadlineApproaching: boolean;
  };
  source: string;
  createdAt: Date;
}

export interface LeadScoreResult {
  score: number; // 0-100
  scoreFactors: ScoreFactor[];
  conversionProbability: number; // 0-1
  segment: "HOT" | "WARM" | "COLD";
  recommendedAction: string;
  confidence: number;
}

export interface ScoreFactor {
  name: string;
  weight: number;
  value: number;
  contribution: number;
  description: string;
}

export interface ChurnScoreInput {
  firmId: string;
  clientId: string;
  healthScore: number;
  engagementTrend: "INCREASING" | "STABLE" | "DECREASING";
  paymentHistory: {
    onTimePayments: number;
    latePayments: number;
    outstandingAmount: number;
  };
  supportHistory: {
    ticketsLast90Days: number;
    escalations: number;
    avgResolutionTime: number;
  };
  usageMetrics: {
    lastLoginDays: number;
    featureAdoption: number;
    apiUsage: number;
  };
  contractInfo: {
    monthsRemaining: number;
    contractValue: number;
    renewalDiscussionStarted: boolean;
  };
  competitorMentions: number;
}

export interface ChurnScoreResult {
  churnProbability: number; // 0-1
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskFactors: RiskFactor[];
  retentionActions: RetentionAction[];
  predictedChurnDate?: Date;
  confidence: number;
}

export interface RiskFactor {
  name: string;
  impact: number; // -100 to 100
  description: string;
  category: "ENGAGEMENT" | "FINANCIAL" | "SUPPORT" | "USAGE" | "CONTRACT";
}

export interface RetentionAction {
  action: string;
  priority: "IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW";
  expectedImpact: number;
  owner: string;
}

export interface RecommendationInput {
  firmId: string;
  userId: string;
  context: {
    userRole: string;
    currentPage?: string;
    recentActions: string[];
    clientsManaged: number;
    engagementsInProgress: number;
    tasksOverdue: number;
  };
  userPreferences?: {
    preferredWorkingHours: { start: number; end: number };
    notificationPreference: string;
  };
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  actionUrl?: string;
  actionData?: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  expiresAt?: Date;
}

export enum RecommendationType {
  NEXT_BEST_ACTION = "NEXT_BEST_ACTION",
  UPSELL = "UPSELL",
  TASK_PRIORITY = "TASK_PRIORITY",
  RISK_ALERT = "RISK_ALERT",
  EFFICIENCY_TIP = "EFFICIENCY_TIP",
  LEARNING = "LEARNING",
}

export interface DocumentExtractionInput {
  documentId: string;
  firmId: string;
  extractionType: "PAN" | "GST" | "FINANCIALS" | "FULL";
  documentContent: string; // Raw text or base64 image
  contentType: "TEXT" | "IMAGE" | "PDF";
}

export interface DocumentExtractionResult {
  extractedData: Record<string, ExtractedField>;
  rawText?: string;
  confidence: Record<string, number>;
  suggestedCorrections?: Record<string, string>;
  processingTime: number;
}

export interface ExtractedField {
  value: unknown;
  confidence: number;
  source: "OCR" | "REGEX" | "ML" | "MANUAL";
  boundingBox?: { x: number; y: number; width: number; height: number };
}

// =============================================================================
// LEAD SCORING SERVICE
// =============================================================================

export class LeadScoringService {
  private weights = {
    companySize: 0.15,
    industry: 0.10,
    revenue: 0.15,
    engagement: 0.25,
    firmographics: 0.25,
    source: 0.10,
  };

  /**
   * Calculate lead score
   */
  calculateScore(input: LeadScoreInput): LeadScoreResult {
    const factors: ScoreFactor[] = [];

    // Company size factor
    const sizeScore = this.scorCompanySize(input.companySize);
    factors.push({
      name: "Company Size",
      weight: this.weights.companySize,
      value: sizeScore,
      contribution: sizeScore * this.weights.companySize,
      description: this.describeSizeScore(input.companySize),
    });

    // Industry factor
    const industryScore = this.scoreIndustry(input.industry);
    factors.push({
      name: "Industry Fit",
      weight: this.weights.industry,
      value: industryScore,
      contribution: industryScore * this.weights.industry,
      description: this.describeIndustryScore(input.industry, industryScore),
    });

    // Revenue factor
    const revenueScore = this.scoreRevenue(input.annualRevenue);
    factors.push({
      name: "Annual Revenue",
      weight: this.weights.revenue,
      value: revenueScore,
      contribution: revenueScore * this.weights.revenue,
      description: this.describeRevenueScore(input.annualRevenue),
    });

    // Engagement factor
    const engagementScore = this.scoreEngagement(input.engagementHistory);
    factors.push({
      name: "Engagement Level",
      weight: this.weights.engagement,
      value: engagementScore,
      contribution: engagementScore * this.weights.engagement,
      description: this.describeEngagementScore(input.engagementHistory),
    });

    // Firmographics factor
    const firmographicsScore = this.scoreFirmographics(input.firmographics);
    factors.push({
      name: "TP Relevance",
      weight: this.weights.firmographics,
      value: firmographicsScore,
      contribution: firmographicsScore * this.weights.firmographics,
      description: this.describeFirmographicsScore(input.firmographics),
    });

    // Source factor
    const sourceScore = this.scoreSource(input.source);
    factors.push({
      name: "Lead Source",
      weight: this.weights.source,
      value: sourceScore,
      contribution: sourceScore * this.weights.source,
      description: `Lead from ${input.source}`,
    });

    const totalScore = Math.round(
      factors.reduce((sum, f) => sum + f.contribution, 0)
    );
    const conversionProbability = this.calculateConversionProbability(totalScore);
    const segment = this.determineSegment(totalScore);
    const recommendedAction = this.getRecommendedAction(segment, input);

    return {
      score: totalScore,
      scoreFactors: factors,
      conversionProbability,
      segment,
      recommendedAction,
      confidence: 0.85,
    };
  }

  private scorCompanySize(size: string): number {
    const scores: Record<string, number> = {
      ENTERPRISE: 100,
      LARGE: 85,
      MEDIUM: 70,
      SMALL: 50,
      MICRO: 30,
    };
    return scores[size] || 50;
  }

  private describeSizeScore(size: string): string {
    const descriptions: Record<string, string> = {
      ENTERPRISE: "Enterprise company - high value potential",
      LARGE: "Large company - strong fit",
      MEDIUM: "Medium company - good fit",
      SMALL: "Small company - moderate fit",
      MICRO: "Micro company - may need simplified offering",
    };
    return descriptions[size] || "Unknown company size";
  }

  private scoreIndustry(industry: string): number {
    const highValue = ["IT", "ITES", "PHARMA", "MANUFACTURING", "AUTOMOBILE", "BANKING"];
    const mediumValue = ["TRADING", "REAL_ESTATE", "TELECOM", "ENERGY"];

    if (highValue.includes(industry.toUpperCase())) return 90;
    if (mediumValue.includes(industry.toUpperCase())) return 70;
    return 50;
  }

  private describeIndustryScore(industry: string, score: number): string {
    if (score >= 80) return `${industry} - High TP relevance`;
    if (score >= 60) return `${industry} - Moderate TP relevance`;
    return `${industry} - Standard TP requirements`;
  }

  private scoreRevenue(revenue?: number): number {
    if (!revenue) return 50;
    if (revenue >= 50_000_000_000) return 100; // 5000 Cr+
    if (revenue >= 10_000_000_000) return 90;  // 1000 Cr+
    if (revenue >= 1_000_000_000) return 80;   // 100 Cr+
    if (revenue >= 200_000_000) return 70;     // 20 Cr+
    if (revenue >= 50_000_000) return 50;      // 5 Cr+
    return 30;
  }

  private describeRevenueScore(revenue?: number): string {
    if (!revenue) return "Revenue not specified";
    const crores = revenue / 10_000_000;
    return `Annual revenue: ₹${crores.toFixed(1)} Cr`;
  }

  private scoreEngagement(history: LeadScoreInput["engagementHistory"]): number {
    let score = 0;

    if (history.demoRequested) score += 40;
    score += Math.min(history.emailOpens * 2, 20);
    score += Math.min(history.websiteVisits, 15);
    score += Math.min(history.contentDownloads * 5, 15);
    score += Math.min(history.eventsAttended * 10, 10);

    return Math.min(score, 100);
  }

  private describeEngagementScore(history: LeadScoreInput["engagementHistory"]): string {
    const activities = [];
    if (history.demoRequested) activities.push("Demo requested");
    if (history.emailOpens > 5) activities.push("High email engagement");
    if (history.websiteVisits > 10) activities.push("Frequent website visits");
    if (history.contentDownloads > 0) activities.push(`${history.contentDownloads} downloads`);
    if (history.eventsAttended > 0) activities.push(`${history.eventsAttended} events attended`);

    return activities.length > 0 ? activities.join(", ") : "Low engagement";
  }

  private scoreFirmographics(firmographics: LeadScoreInput["firmographics"]): number {
    let score = 0;

    if (firmographics.hasRelatedPartyTransactions) score += 35;
    if (firmographics.isMultinational) score += 30;
    if (firmographics.complianceDeadlineApproaching) score += 25;
    if (firmographics.hasPreviousTpEngagement) score += 10;

    return Math.min(score, 100);
  }

  private describeFirmographicsScore(firmographics: LeadScoreInput["firmographics"]): string {
    const factors = [];
    if (firmographics.hasRelatedPartyTransactions) factors.push("Has RPT");
    if (firmographics.isMultinational) factors.push("MNC");
    if (firmographics.complianceDeadlineApproaching) factors.push("Deadline soon");
    if (firmographics.hasPreviousTpEngagement) factors.push("Previous TP work");

    return factors.length > 0 ? factors.join(", ") : "No TP indicators";
  }

  private scoreSource(source: string): number {
    const scores: Record<string, number> = {
      REFERRAL: 90,
      WEBINAR: 80,
      WEBSITE: 70,
      LINKEDIN: 60,
      COLD_OUTREACH: 40,
      PURCHASED_LIST: 30,
    };
    return scores[source.toUpperCase()] || 50;
  }

  private calculateConversionProbability(score: number): number {
    // Sigmoid function to map score to probability
    const k = 0.05;
    const midpoint = 50;
    return 1 / (1 + Math.exp(-k * (score - midpoint)));
  }

  private determineSegment(score: number): "HOT" | "WARM" | "COLD" {
    if (score >= 75) return "HOT";
    if (score >= 50) return "WARM";
    return "COLD";
  }

  private getRecommendedAction(segment: string, input: LeadScoreInput): string {
    if (segment === "HOT") {
      if (input.engagementHistory.demoRequested) {
        return "Schedule demo immediately and prepare custom proposal";
      }
      return "High priority outreach - schedule discovery call";
    }

    if (segment === "WARM") {
      if (input.firmographics.complianceDeadlineApproaching) {
        return "Send compliance deadline reminder with service overview";
      }
      return "Add to nurture sequence with educational content";
    }

    return "Add to awareness campaign and monitor engagement";
  }
}

// =============================================================================
// CHURN PREDICTION SERVICE
// =============================================================================

export class ChurnPredictionService {
  /**
   * Calculate churn risk
   */
  calculateChurnRisk(input: ChurnScoreInput): ChurnScoreResult {
    const riskFactors: RiskFactor[] = [];

    // Health score impact
    if (input.healthScore < 50) {
      riskFactors.push({
        name: "Low Health Score",
        impact: -30,
        description: `Health score of ${input.healthScore} is below threshold`,
        category: "ENGAGEMENT",
      });
    } else if (input.healthScore < 70) {
      riskFactors.push({
        name: "Moderate Health Score",
        impact: -15,
        description: `Health score of ${input.healthScore} needs attention`,
        category: "ENGAGEMENT",
      });
    }

    // Engagement trend impact
    if (input.engagementTrend === "DECREASING") {
      riskFactors.push({
        name: "Declining Engagement",
        impact: -25,
        description: "User engagement has been decreasing",
        category: "ENGAGEMENT",
      });
    }

    // Payment history impact
    const paymentIssues = input.paymentHistory.latePayments /
      (input.paymentHistory.onTimePayments + input.paymentHistory.latePayments || 1);
    if (paymentIssues > 0.3) {
      riskFactors.push({
        name: "Payment Issues",
        impact: -20,
        description: `${Math.round(paymentIssues * 100)}% late payments`,
        category: "FINANCIAL",
      });
    }

    if (input.paymentHistory.outstandingAmount > 0) {
      riskFactors.push({
        name: "Outstanding Balance",
        impact: -10,
        description: `₹${input.paymentHistory.outstandingAmount.toLocaleString()} outstanding`,
        category: "FINANCIAL",
      });
    }

    // Support issues impact
    if (input.supportHistory.escalations > 2) {
      riskFactors.push({
        name: "Multiple Escalations",
        impact: -25,
        description: `${input.supportHistory.escalations} escalated tickets`,
        category: "SUPPORT",
      });
    }

    if (input.supportHistory.avgResolutionTime > 48) {
      riskFactors.push({
        name: "Slow Issue Resolution",
        impact: -15,
        description: `Average resolution time: ${input.supportHistory.avgResolutionTime}h`,
        category: "SUPPORT",
      });
    }

    // Usage metrics impact
    if (input.usageMetrics.lastLoginDays > 30) {
      riskFactors.push({
        name: "Inactive User",
        impact: -30,
        description: `No login in ${input.usageMetrics.lastLoginDays} days`,
        category: "USAGE",
      });
    } else if (input.usageMetrics.lastLoginDays > 14) {
      riskFactors.push({
        name: "Reduced Activity",
        impact: -15,
        description: `Last login ${input.usageMetrics.lastLoginDays} days ago`,
        category: "USAGE",
      });
    }

    if (input.usageMetrics.featureAdoption < 30) {
      riskFactors.push({
        name: "Low Feature Adoption",
        impact: -20,
        description: `Only ${input.usageMetrics.featureAdoption}% features used`,
        category: "USAGE",
      });
    }

    // Contract factors
    if (input.contractInfo.monthsRemaining <= 3 && !input.contractInfo.renewalDiscussionStarted) {
      riskFactors.push({
        name: "Approaching Contract End",
        impact: -25,
        description: `Contract ends in ${input.contractInfo.monthsRemaining} months, no renewal discussion`,
        category: "CONTRACT",
      });
    }

    // Competitor mentions
    if (input.competitorMentions > 0) {
      riskFactors.push({
        name: "Competitor Interest",
        impact: -15 * Math.min(input.competitorMentions, 3),
        description: `${input.competitorMentions} competitor mentions detected`,
        category: "ENGAGEMENT",
      });
    }

    // Calculate churn probability
    const baseRisk = 0.1; // 10% base churn rate
    const totalImpact = riskFactors.reduce((sum, f) => sum + f.impact, 0);
    const churnProbability = Math.min(
      1,
      Math.max(0, baseRisk - totalImpact / 100)
    );

    const riskLevel = this.determineRiskLevel(churnProbability);
    const retentionActions = this.generateRetentionActions(riskFactors, input);
    const predictedChurnDate = this.predictChurnDate(churnProbability, input);

    return {
      churnProbability: Math.round(churnProbability * 100) / 100,
      riskLevel,
      riskFactors,
      retentionActions,
      predictedChurnDate,
      confidence: 0.78,
    };
  }

  private determineRiskLevel(probability: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (probability >= 0.7) return "CRITICAL";
    if (probability >= 0.5) return "HIGH";
    if (probability >= 0.3) return "MEDIUM";
    return "LOW";
  }

  private generateRetentionActions(
    factors: RiskFactor[],
    input: ChurnScoreInput
  ): RetentionAction[] {
    const actions: RetentionAction[] = [];

    // Address engagement issues
    if (factors.some(f => f.category === "ENGAGEMENT" && f.impact <= -25)) {
      actions.push({
        action: "Schedule executive check-in call",
        priority: "IMMEDIATE",
        expectedImpact: 20,
        owner: "Customer Success Manager",
      });
    }

    // Address usage issues
    if (factors.some(f => f.category === "USAGE")) {
      actions.push({
        action: "Offer personalized training session",
        priority: "HIGH",
        expectedImpact: 15,
        owner: "Customer Success Manager",
      });
    }

    // Address support issues
    if (factors.some(f => f.category === "SUPPORT")) {
      actions.push({
        action: "Review and resolve all open tickets",
        priority: "IMMEDIATE",
        expectedImpact: 25,
        owner: "Support Lead",
      });
    }

    // Address contract issues
    if (input.contractInfo.monthsRemaining <= 3) {
      actions.push({
        action: "Initiate renewal discussion with value summary",
        priority: "IMMEDIATE",
        expectedImpact: 30,
        owner: "Account Manager",
      });
    }

    // Generic retention offer
    if (factors.length >= 3) {
      actions.push({
        action: "Prepare retention offer (discount or extended terms)",
        priority: "HIGH",
        expectedImpact: 20,
        owner: "Sales Director",
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { IMMEDIATE: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private predictChurnDate(probability: number, input: ChurnScoreInput): Date | undefined {
    if (probability < 0.3) return undefined;

    const today = new Date();

    // If contract is ending, that's likely the churn date
    if (input.contractInfo.monthsRemaining <= 6) {
      const churnDate = new Date(today);
      churnDate.setMonth(churnDate.getMonth() + input.contractInfo.monthsRemaining);
      return churnDate;
    }

    // Otherwise, estimate based on probability
    const monthsToChurn = Math.round(6 * (1 - probability));
    const churnDate = new Date(today);
    churnDate.setMonth(churnDate.getMonth() + monthsToChurn);
    return churnDate;
  }
}

// =============================================================================
// AI RECOMMENDATION SERVICE
// =============================================================================

export class AiRecommendationService {
  /**
   * Generate personalized recommendations
   */
  generateRecommendations(input: RecommendationInput): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Task priority recommendations
    if (input.context.tasksOverdue > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        type: RecommendationType.TASK_PRIORITY,
        title: `${input.context.tasksOverdue} overdue tasks need attention`,
        description: "Review and prioritize overdue tasks to maintain client satisfaction",
        confidence: 0.95,
        actionUrl: "/tasks?filter=overdue",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    // Engagement recommendations
    if (input.context.engagementsInProgress > 5) {
      recommendations.push({
        id: `rec-${Date.now()}-2`,
        type: RecommendationType.EFFICIENCY_TIP,
        title: "Consider batch processing similar engagements",
        description: `You have ${input.context.engagementsInProgress} active engagements. Group similar tasks for efficiency.`,
        confidence: 0.75,
        actionUrl: "/engagements",
      });
    }

    // Role-based recommendations
    if (["ADMIN", "PARTNER", "SENIOR_MANAGER"].includes(input.context.userRole)) {
      recommendations.push({
        id: `rec-${Date.now()}-3`,
        type: RecommendationType.NEXT_BEST_ACTION,
        title: "Review team workload distribution",
        description: "Check resource allocation to ensure balanced workload",
        confidence: 0.70,
        actionUrl: "/resources/planning",
      });
    }

    // Learning recommendations
    if (input.context.recentActions.length < 5) {
      recommendations.push({
        id: `rec-${Date.now()}-4`,
        type: RecommendationType.LEARNING,
        title: "Explore advanced features",
        description: "Check out our latest features for benchmarking and safe harbour analysis",
        confidence: 0.60,
        actionUrl: "/help/features",
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }
}

// =============================================================================
// DOCUMENT EXTRACTION SERVICE
// =============================================================================

export class DocumentExtractionService {
  private patterns = {
    PAN: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
    TAN: /[A-Z]{4}[0-9]{5}[A-Z]{1}/g,
    CIN: /[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}/g,
    GSTIN: /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}/g,
    AMOUNT: /(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{2})?/gi,
    DATE: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
    PERCENTAGE: /\d+(?:\.\d+)?%/g,
  };

  /**
   * Extract data from document text
   */
  extractData(input: DocumentExtractionInput): DocumentExtractionResult {
    const startTime = Date.now();
    const extractedData: Record<string, ExtractedField> = {};
    const confidence: Record<string, number> = {};

    const text = input.documentContent;

    // Extract based on type
    if (input.extractionType === "PAN" || input.extractionType === "FULL") {
      const panMatches = text.match(this.patterns.PAN);
      if (panMatches && panMatches.length > 0) {
        extractedData["pan"] = {
          value: panMatches[0],
          confidence: this.validatePan(panMatches[0]) ? 0.95 : 0.70,
          source: "REGEX",
        };
        confidence["pan"] = extractedData["pan"].confidence;
      }
    }

    if (input.extractionType === "GST" || input.extractionType === "FULL") {
      const gstMatches = text.match(this.patterns.GSTIN);
      if (gstMatches && gstMatches.length > 0) {
        extractedData["gstin"] = {
          value: gstMatches[0],
          confidence: this.validateGstin(gstMatches[0]) ? 0.95 : 0.70,
          source: "REGEX",
        };
        confidence["gstin"] = extractedData["gstin"].confidence;
      }
    }

    if (input.extractionType === "FINANCIALS" || input.extractionType === "FULL") {
      const amounts = text.match(this.patterns.AMOUNT);
      if (amounts && amounts.length > 0) {
        extractedData["amounts"] = {
          value: amounts.map(a => this.parseAmount(a)),
          confidence: 0.80,
          source: "REGEX",
        };
        confidence["amounts"] = 0.80;
      }

      const percentages = text.match(this.patterns.PERCENTAGE);
      if (percentages && percentages.length > 0) {
        extractedData["percentages"] = {
          value: percentages,
          confidence: 0.85,
          source: "REGEX",
        };
        confidence["percentages"] = 0.85;
      }
    }

    // Extract dates
    const dates = text.match(this.patterns.DATE);
    if (dates && dates.length > 0) {
      extractedData["dates"] = {
        value: dates,
        confidence: 0.80,
        source: "REGEX",
      };
      confidence["dates"] = 0.80;
    }

    return {
      extractedData,
      rawText: text.substring(0, 1000),
      confidence,
      processingTime: Date.now() - startTime,
    };
  }

  private validatePan(pan: string): boolean {
    // PAN validation logic
    // 4th character indicates entity type
    const validFourthChars = ["C", "P", "H", "F", "A", "T", "B", "L", "J", "G"];
    return validFourthChars.includes(pan[3]);
  }

  private validateGstin(gstin: string): boolean {
    // Basic GSTIN validation
    return gstin.length === 15 && gstin[12] === "Z";
  }

  private parseAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/[Rs.INR₹,\s]/gi, "");
    return parseFloat(cleaned) || 0;
  }

  /**
   * Apply corrections to extraction
   */
  applyCorrections(
    extraction: DocumentExtractionResult,
    corrections: Record<string, unknown>
  ): DocumentExtractionResult {
    for (const [field, correctedValue] of Object.entries(corrections)) {
      if (extraction.extractedData[field]) {
        extraction.extractedData[field] = {
          ...extraction.extractedData[field],
          value: correctedValue,
          confidence: 1.0,
          source: "MANUAL",
        };
        extraction.confidence[field] = 1.0;
      } else {
        extraction.extractedData[field] = {
          value: correctedValue,
          confidence: 1.0,
          source: "MANUAL",
        };
        extraction.confidence[field] = 1.0;
      }
    }

    return extraction;
  }
}

// Export instances for convenience
export const leadScoringService = new LeadScoringService();
export const churnPredictionService = new ChurnPredictionService();
export const aiRecommendationService = new AiRecommendationService();
export const documentExtractionService = new DocumentExtractionService();
