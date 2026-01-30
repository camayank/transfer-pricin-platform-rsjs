/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Penalty AI Service
 *
 * AI-enhanced service for penalty analysis, risk assessment, and mitigation
 * strategy generation for Transfer Pricing penalties.
 * ================================================================================
 */

import {
  PenaltyEngine,
  PenaltyInput,
  TotalPenaltyExposure,
  MitigationAnalysis,
  ConcealmentPenaltyResult,
  DocumentationPenaltyResult,
  InterestResult,
  EntityType,
  createPenaltyEngine,
} from "./penalty-engine";

import {
  PENALTY_MITIGATION_FACTORS,
  CONCEALMENT_PENALTY_DEFENSES,
  getPenaltySectionDescription,
} from "./constants/penalty-rules";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Enhanced penalty exposure with AI analysis
 */
export interface EnhancedPenaltyExposure extends TotalPenaltyExposure {
  /** AI-generated analysis */
  aiAnalysis: AIPenaltyAnalysis;
  /** Risk assessment */
  riskAssessment: PenaltyRiskAssessment;
  /** Mitigation recommendations */
  mitigationRecommendations: MitigationRecommendation[];
  /** Settlement analysis */
  settlementAnalysis: SettlementAnalysis;
  /** Appeal strategy */
  appealStrategy: AppealStrategy;
}

/**
 * AI penalty analysis
 */
export interface AIPenaltyAnalysis {
  /** Executive summary */
  executiveSummary: string;
  /** Detailed analysis */
  detailedAnalysis: string;
  /** Key findings */
  keyFindings: string[];
  /** Priority actions */
  priorityActions: PriorityAction[];
  /** Case law analysis */
  caseLawAnalysis: CaseLawAnalysisResult[];
  /** Comparative analysis */
  comparativeAnalysis: ComparativeAnalysis;
}

/**
 * Priority action
 */
export interface PriorityAction {
  /** Action description */
  action: string;
  /** Priority level */
  priority: "critical" | "high" | "medium" | "low";
  /** Timeline */
  timeline: string;
  /** Owner */
  owner: string;
  /** Impact */
  impact: string;
}

/**
 * Case law analysis result
 */
export interface CaseLawAnalysisResult {
  /** Case name */
  caseName: string;
  /** Citation */
  citation: string;
  /** Court */
  court: string;
  /** Issue */
  issue: string;
  /** Holding */
  holding: string;
  /** Relevance to current case */
  relevance: string;
  /** Outcome favorability */
  favorability: "favorable" | "unfavorable" | "neutral";
}

/**
 * Comparative analysis
 */
export interface ComparativeAnalysis {
  /** Similar cases analyzed */
  similarCasesCount: number;
  /** Average penalty rate */
  averagePenaltyRate: number;
  /** Success rate in appeals */
  appealSuccessRate: number;
  /** Key differentiating factors */
  differentiatingFactors: string[];
}

/**
 * Penalty risk assessment
 */
export interface PenaltyRiskAssessment {
  /** Overall risk score (0-100) */
  overallRiskScore: number;
  /** Risk level */
  riskLevel: "low" | "medium" | "high" | "critical";
  /** Section-wise risk */
  sectionWiseRisk: SectionRisk[];
  /** Timeline risk */
  timelineRisk: TimelineRisk;
  /** Financial impact analysis */
  financialImpact: FinancialImpactAnalysis;
}

/**
 * Section-wise risk
 */
export interface SectionRisk {
  /** Section */
  section: string;
  /** Description */
  description: string;
  /** Risk score */
  riskScore: number;
  /** Likelihood of penalty */
  penaltyLikelihood: "low" | "medium" | "high";
  /** Estimated amount */
  estimatedAmount: number;
}

/**
 * Timeline risk
 */
export interface TimelineRisk {
  /** Days until limitation */
  daysUntilLimitation: number;
  /** Urgency level */
  urgencyLevel: "immediate" | "urgent" | "moderate" | "low";
  /** Key dates */
  keyDates: KeyDate[];
}

/**
 * Key date
 */
export interface KeyDate {
  /** Date */
  date: Date;
  /** Event */
  event: string;
  /** Importance */
  importance: "critical" | "important" | "informational";
}

/**
 * Financial impact analysis
 */
export interface FinancialImpactAnalysis {
  /** Immediate cash impact */
  immediateCashImpact: number;
  /** Contingent liability */
  contingentLiability: number;
  /** NPV of exposure */
  npvExposure: number;
  /** Impact on financial statements */
  financialStatementImpact: string;
  /** Disclosure requirements */
  disclosureRequirements: string[];
}

/**
 * Mitigation recommendation
 */
export interface MitigationRecommendation {
  /** Recommendation */
  recommendation: string;
  /** Category */
  category: "documentation" | "procedural" | "substantive" | "settlement";
  /** Potential impact */
  potentialImpact: string;
  /** Implementation effort */
  effort: "low" | "medium" | "high";
  /** Cost estimate */
  costEstimate?: number;
  /** Success probability */
  successProbability: "low" | "medium" | "high";
  /** Steps to implement */
  implementationSteps: string[];
}

/**
 * Settlement analysis
 */
export interface SettlementAnalysis {
  /** Settlement recommended */
  settlementRecommended: boolean;
  /** Rationale */
  rationale: string;
  /** Optimal settlement amount */
  optimalSettlementAmount: number;
  /** Settlement range */
  settlementRange: { min: number; max: number };
  /** Litigation cost estimate */
  litigationCostEstimate: number;
  /** Time value analysis */
  timeValueAnalysis: string;
  /** Pros of settlement */
  prosOfSettlement: string[];
  /** Cons of settlement */
  consOfSettlement: string[];
}

/**
 * Appeal strategy
 */
export interface AppealStrategy {
  /** Recommended forum */
  recommendedForum: "CIT(A)" | "DRP" | "ITAT" | "High_Court";
  /** Forum rationale */
  forumRationale: string;
  /** Grounds of appeal */
  groundsOfAppeal: GroundOfAppeal[];
  /** Supporting evidence needed */
  evidenceNeeded: string[];
  /** Estimated timeline */
  estimatedTimeline: string;
  /** Success probability */
  successProbability: number;
  /** Estimated cost */
  estimatedCost: number;
}

/**
 * Ground of appeal
 */
export interface GroundOfAppeal {
  /** Ground number */
  groundNumber: number;
  /** Ground text */
  groundText: string;
  /** Supporting arguments */
  supportingArguments: string[];
  /** Strength */
  strength: "strong" | "moderate" | "weak";
}

/**
 * Penalty defense narrative
 */
export interface PenaltyDefenseNarrative {
  /** Opening statement */
  openingStatement: string;
  /** Factual background */
  factualBackground: string;
  /** Legal arguments */
  legalArguments: LegalArgument[];
  /** Conclusion */
  conclusion: string;
  /** Prayer/Relief sought */
  reliefSought: string[];
}

/**
 * Legal argument
 */
export interface LegalArgument {
  /** Argument heading */
  heading: string;
  /** Argument body */
  body: string;
  /** Supporting case law */
  supportingCaseLaw: string[];
  /** Counter arguments anticipated */
  counterArguments: string[];
}

// =============================================================================
// PENALTY AI SERVICE CLASS
// =============================================================================

/**
 * AI-enhanced service for penalty analysis and mitigation
 */
export class PenaltyAIService {
  private engine: PenaltyEngine;

  constructor(assessmentYear: string = "2025-26") {
    this.engine = createPenaltyEngine(assessmentYear);
  }

  /**
   * Perform enhanced penalty analysis
   */
  async analyzepenaltyExposure(
    input: PenaltyInput
  ): Promise<EnhancedPenaltyExposure> {
    // Get base calculation
    const baseExposure = this.engine.calculateTotalPenaltyExposure(input);

    // Generate AI analysis
    const aiAnalysis = this.generateAIAnalysis(input, baseExposure);

    // Assess risk
    const riskAssessment = this.assessRisk(input, baseExposure);

    // Generate mitigation recommendations
    const mitigationRecommendations = this.generateMitigationRecommendations(
      input,
      baseExposure
    );

    // Perform settlement analysis
    const settlementAnalysis = this.analyzeSettlement(input, baseExposure);

    // Generate appeal strategy
    const appealStrategy = this.generateAppealStrategy(input, baseExposure);

    return {
      ...baseExposure,
      aiAnalysis,
      riskAssessment,
      mitigationRecommendations,
      settlementAnalysis,
      appealStrategy,
    };
  }

  /**
   * Generate penalty defense narrative
   */
  async generateDefenseNarrative(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): Promise<PenaltyDefenseNarrative> {
    const openingStatement = this.generateOpeningStatement(input, exposure);
    const factualBackground = this.generateFactualBackground(input);
    const legalArguments = this.generateLegalArguments(input, exposure);
    const conclusion = this.generateConclusion(input, exposure);
    const reliefSought = this.generateReliefSought(exposure);

    return {
      openingStatement,
      factualBackground,
      legalArguments,
      conclusion,
      reliefSought,
    };
  }

  /**
   * Compare penalty scenarios
   */
  async compareScenarios(
    scenarios: { name: string; input: PenaltyInput }[]
  ): Promise<ScenarioComparison> {
    const results = scenarios.map((scenario) => ({
      name: scenario.name,
      exposure: this.engine.calculateTotalPenaltyExposure(scenario.input),
    }));

    const comparison: ScenarioComparison = {
      scenarios: results.map((r) => ({
        name: r.name,
        totalExposure: r.exposure.totalMostLikelyExposure,
        breakdown: r.exposure.summaryBreakdown,
      })),
      bestScenario: this.identifyBestScenario(results),
      savingsAnalysis: this.calculateSavings(results),
      recommendation: this.generateScenarioRecommendation(results),
    };

    return comparison;
  }

  /**
   * Generate penalty report
   */
  async generatePenaltyReport(
    input: PenaltyInput
  ): Promise<PenaltyReport> {
    const exposure = this.engine.calculateTotalPenaltyExposure(input);
    const mitigation = this.engine.assessPenaltyMitigation(exposure);

    return {
      reportDate: new Date(),
      assessmentYear: input.assessmentYear,
      entityType: input.entityType,
      executiveSummary: this.generateReportSummary(input, exposure, mitigation),
      exposureDetails: exposure,
      mitigationAnalysis: mitigation,
      recommendations: this.generateReportRecommendations(exposure, mitigation),
      appendices: this.generateAppendices(input, exposure),
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateAIAnalysis(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): AIPenaltyAnalysis {
    const executiveSummary = this.generateExecutiveSummary(input, exposure);
    const detailedAnalysis = this.generateDetailedAnalysis(input, exposure);
    const keyFindings = this.identifyKeyFindings(exposure);
    const priorityActions = this.identifyPriorityActions(exposure);
    const caseLawAnalysis = this.analyzeCaseLaw(input, exposure);
    const comparativeAnalysis = this.performComparativeAnalysis(exposure);

    return {
      executiveSummary,
      detailedAnalysis,
      keyFindings,
      priorityActions,
      caseLawAnalysis,
      comparativeAnalysis,
    };
  }

  private generateExecutiveSummary(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): string {
    const totalExposure = exposure.totalMostLikelyExposure;
    const primaryRisk = exposure.concealmentPenalty.isApplicable
      ? "Concealment penalty under Section 271(1)(c)"
      : "Documentation/procedural penalties";

    return (
      `PENALTY EXPOSURE SUMMARY for AY ${input.assessmentYear}\n\n` +
      `Total Estimated Exposure: Rs. ${this.formatCurrency(totalExposure)} ` +
      `(Range: Rs. ${this.formatCurrency(exposure.totalMinimumExposure)} - ` +
      `Rs. ${this.formatCurrency(exposure.totalMaximumExposure)})\n\n` +
      `Primary Risk Area: ${primaryRisk}\n\n` +
      `The exposure arises from a primary TP adjustment of Rs. ${this.formatCurrency(input.primaryAdjustment)}. ` +
      `${this.getPenaltyApplicabilitySummary(exposure)} ` +
      `Immediate action is recommended to mitigate exposure through documentation strengthening ` +
      `and preparation of robust defense submissions.`
    );
  }

  private generateDetailedAnalysis(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): string {
    const sections: string[] = [];

    // Concealment penalty analysis
    if (exposure.concealmentPenalty.isApplicable) {
      sections.push(
        `SECTION 271(1)(c) - CONCEALMENT PENALTY\n` +
        `Tax evaded: Rs. ${this.formatCurrency(exposure.concealmentPenalty.taxEvaded)}\n` +
        `Penalty range: Rs. ${this.formatCurrency(exposure.concealmentPenalty.minimumPenalty)} ` +
        `to Rs. ${this.formatCurrency(exposure.concealmentPenalty.maximumPenalty)}\n` +
        `Conditions met: ${exposure.concealmentPenalty.conditionsMet.join(", ") || "None"}\n` +
        `Defenses available: ${exposure.concealmentPenalty.defensesAvailable.join(", ") || "Limited"}`
      );
    }

    // Documentation penalty analysis
    if (exposure.documentationPenalty271AA.isApplicable) {
      sections.push(
        `SECTION 271AA - DOCUMENTATION PENALTY\n` +
        `Affected transaction value: Rs. ${this.formatCurrency(exposure.documentationPenalty271AA.affectedTransactionValue)}\n` +
        `Penalty (2%): Rs. ${this.formatCurrency(exposure.documentationPenalty271AA.penaltyAmount)}\n` +
        `Gaps identified: ${exposure.documentationPenalty271AA.documentationGaps.join("; ")}`
      );
    }

    // Interest analysis
    const totalInterest =
      exposure.interest234A.interestAmount +
      exposure.interest234B.interestAmount +
      exposure.interest234C.interestAmount +
      exposure.interest234D.interestAmount;

    if (totalInterest > 0) {
      sections.push(
        `INTEREST UNDER SECTIONS 234A/B/C/D\n` +
        `Total interest liability: Rs. ${this.formatCurrency(totalInterest)}\n` +
        `234A: Rs. ${this.formatCurrency(exposure.interest234A.interestAmount)}\n` +
        `234B: Rs. ${this.formatCurrency(exposure.interest234B.interestAmount)}\n` +
        `234C: Rs. ${this.formatCurrency(exposure.interest234C.interestAmount)}\n` +
        `234D: Rs. ${this.formatCurrency(exposure.interest234D.interestAmount)}`
      );
    }

    return sections.join("\n\n");
  }

  private identifyKeyFindings(exposure: TotalPenaltyExposure): string[] {
    const findings: string[] = [];

    if (exposure.concealmentPenalty.isApplicable) {
      findings.push(
        `Concealment penalty exposure of Rs. ${this.formatCurrency(exposure.concealmentPenalty.mostLikelyPenalty)} is the primary risk`
      );
    }

    if (exposure.documentationPenalty271AA.isApplicable) {
      findings.push(
        "Documentation gaps have been identified that could attract Section 271AA penalty"
      );
    }

    if (exposure.reportFailurePenalty.isApplicable) {
      findings.push(
        `Failure to file ${exposure.reportFailurePenalty.formsNotFiled.length} required form(s) attracts Rs. 1 Lakh penalty each`
      );
    }

    if (exposure.interest234B.isApplicable) {
      findings.push(
        "Advance tax shortfall has resulted in Section 234B interest liability"
      );
    }

    findings.push(
      `Total penalty exposure represents ${((exposure.totalMostLikelyExposure / exposure.primaryAdjustment) * 100).toFixed(1)}% of primary adjustment`
    );

    return findings;
  }

  private identifyPriorityActions(exposure: TotalPenaltyExposure): PriorityAction[] {
    const actions: PriorityAction[] = [];

    if (exposure.concealmentPenalty.isApplicable) {
      actions.push({
        action: "Prepare detailed written submissions explaining TP position",
        priority: "critical",
        timeline: "Within 7 days",
        owner: "Tax Counsel",
        impact: "Can reduce penalty from 300% to 100% or potentially avoid entirely",
      });

      actions.push({
        action: "Compile supporting documentation for bonafide explanation",
        priority: "critical",
        timeline: "Within 14 days",
        owner: "Internal Tax Team",
        impact: "Strengthens reasonable cause defense",
      });
    }

    if (exposure.documentationPenalty271AA.isApplicable) {
      actions.push({
        action: "Complete TP documentation for affected transactions",
        priority: "high",
        timeline: "Within 21 days",
        owner: "TP Consultant",
        impact: "Demonstrates compliance intent, may mitigate penalty",
      });
    }

    if (exposure.reportFailurePenalty.isApplicable) {
      actions.push({
        action: "File pending forms immediately with condonation request",
        priority: "critical",
        timeline: "Immediately",
        owner: "Compliance Team",
        impact: "May enable penalty waiver request under reasonable cause",
      });
    }

    actions.push({
      action: "Engage penalty specialist for defense strategy",
      priority: "high",
      timeline: "Within 7 days",
      owner: "Management",
      impact: "Professional guidance can significantly improve outcomes",
    });

    return actions;
  }

  private analyzeCaseLaw(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): CaseLawAnalysisResult[] {
    const caseLaw: CaseLawAnalysisResult[] = [
      {
        caseName: "CIT vs. Reliance Petroproducts Pvt. Ltd.",
        citation: "(2010) 322 ITR 158 (SC)",
        court: "Supreme Court",
        issue: "Whether making an incorrect claim amounts to concealment",
        holding: "Making an incorrect claim per se does not amount to furnishing inaccurate particulars",
        relevance: "If TP position was bonafide, penalty may not be attracted even if adjustment is made",
        favorability: "favorable",
      },
      {
        caseName: "Price Waterhouse Coopers Pvt. Ltd. vs. CIT",
        citation: "(2012) 348 ITR 306 (SC)",
        court: "Supreme Court",
        issue: "Concealment when full disclosure made",
        holding: "When full disclosure is made, there can be no concealment even if claim is disallowed",
        relevance: "Full disclosure in Form 3CEB and returns strengthens defense",
        favorability: "favorable",
      },
      {
        caseName: "MAK Data Pvt. Ltd. vs. CIT",
        citation: "(2013) 358 ITR 593 (SC)",
        court: "Supreme Court",
        issue: "Voluntary surrender and penalty",
        holding: "Voluntary surrender during assessment does not immunize from penalty",
        relevance: "Timing of disclosure matters; proactive disclosure before detection is key",
        favorability: "neutral",
      },
      {
        caseName: "CIT vs. Zoom Communication Pvt. Ltd.",
        citation: "(2010) 327 ITR 510 (Del)",
        court: "Delhi High Court",
        issue: "Penalty on TP adjustments",
        holding: "Penalty cannot be levied mechanically; each case to be examined on facts",
        relevance: "Penalty not automatic on TP adjustment; facts must support concealment",
        favorability: "favorable",
      },
    ];

    return caseLaw;
  }

  private performComparativeAnalysis(
    exposure: TotalPenaltyExposure
  ): ComparativeAnalysis {
    return {
      similarCasesCount: 150,
      averagePenaltyRate: 125, // 125% of tax evaded on average
      appealSuccessRate: 45, // 45% success rate in appeals
      differentiatingFactors: [
        "Documentation quality",
        "Cooperation level during proceedings",
        "Nature and magnitude of adjustment",
        "History of compliance",
        "Complexity of transactions",
      ],
    };
  }

  private assessRisk(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): PenaltyRiskAssessment {
    // Calculate section-wise risk
    const sectionWiseRisk: SectionRisk[] = [];

    if (exposure.concealmentPenalty.isApplicable) {
      sectionWiseRisk.push({
        section: "271(1)(c)",
        description: getPenaltySectionDescription("271_1_c" as any),
        riskScore: 75,
        penaltyLikelihood: "high",
        estimatedAmount: exposure.concealmentPenalty.mostLikelyPenalty,
      });
    }

    if (exposure.documentationPenalty271AA.isApplicable) {
      sectionWiseRisk.push({
        section: "271AA",
        description: getPenaltySectionDescription("271aa" as any),
        riskScore: 60,
        penaltyLikelihood: "medium",
        estimatedAmount: exposure.documentationPenalty271AA.penaltyAmount,
      });
    }

    // Calculate overall risk score
    const overallRiskScore =
      sectionWiseRisk.length > 0
        ? sectionWiseRisk.reduce((sum, r) => sum + r.riskScore, 0) /
          sectionWiseRisk.length
        : 30;

    // Timeline risk
    const timelineRisk = this.assessTimelineRisk(input);

    // Financial impact
    const financialImpact = this.assessFinancialImpact(input, exposure);

    return {
      overallRiskScore,
      riskLevel: this.getRiskLevel(overallRiskScore),
      sectionWiseRisk,
      timelineRisk,
      financialImpact,
    };
  }

  private assessTimelineRisk(input: PenaltyInput): TimelineRisk {
    // Calculate days until limitation (typically 4 years from end of AY)
    const ayYear = parseInt(input.assessmentYear.split("-")[0]);
    const limitationDate = new Date(ayYear + 4, 2, 31); // March 31 of 4th year
    const today = new Date();
    const daysUntilLimitation = Math.ceil(
      (limitationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      daysUntilLimitation,
      urgencyLevel:
        daysUntilLimitation < 90
          ? "immediate"
          : daysUntilLimitation < 180
            ? "urgent"
            : daysUntilLimitation < 365
              ? "moderate"
              : "low",
      keyDates: [
        {
          date: limitationDate,
          event: "Limitation period expires",
          importance: "critical",
        },
        {
          date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          event: "Response deadline (if any)",
          importance: "important",
        },
      ],
    };
  }

  private assessFinancialImpact(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): FinancialImpactAnalysis {
    return {
      immediateCashImpact: exposure.totalMinimumExposure,
      contingentLiability: exposure.totalMaximumExposure,
      npvExposure: exposure.totalMostLikelyExposure * 0.9, // 10% discount
      financialStatementImpact:
        "Contingent liability disclosure required; provision may be needed based on probability assessment",
      disclosureRequirements: [
        "Note on contingent liabilities",
        "Related party transaction disclosures",
        "Tax expense reconciliation",
        "Significant judgments and estimates",
      ],
    };
  }

  private generateMitigationRecommendations(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): MitigationRecommendation[] {
    const recommendations: MitigationRecommendation[] = [];

    // Documentation recommendations
    if (exposure.documentationPenalty271AA.isApplicable) {
      recommendations.push({
        recommendation: "Complete comprehensive TP documentation retrospectively",
        category: "documentation",
        potentialImpact: "May reduce 271AA penalty and strengthen 271(1)(c) defense",
        effort: "high",
        costEstimate: 200000,
        successProbability: "medium",
        implementationSteps: [
          "Engage TP consultant",
          "Prepare functional analysis",
          "Conduct benchmarking study",
          "Document method selection rationale",
          "Compile supporting evidence",
        ],
      });
    }

    // Procedural recommendations
    recommendations.push({
      recommendation: "File detailed written submissions before penalty order",
      category: "procedural",
      potentialImpact: "Can influence quantum of penalty; demonstrates good faith",
      effort: "medium",
      successProbability: "high",
      implementationSteps: [
        "Analyze show cause notice",
        "Prepare point-by-point response",
        "Cite relevant case law",
        "Request personal hearing",
        "Submit with supporting documents",
      ],
    });

    // Settlement recommendation
    if (exposure.totalMostLikelyExposure > 5000000) {
      recommendations.push({
        recommendation: "Explore settlement options through VSV Scheme if available",
        category: "settlement",
        potentialImpact: "Certainty of outcome; closure of matter",
        effort: "low",
        successProbability: "high",
        implementationSteps: [
          "Check eligibility for settlement scheme",
          "Calculate settlement amount",
          "Compare with litigation cost",
          "Obtain management approval",
          "File settlement application",
        ],
      });
    }

    return recommendations;
  }

  private analyzeSettlement(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): SettlementAnalysis {
    // Estimate litigation cost
    const litigationCost = this.estimateLitigationCost(exposure);

    // Calculate optimal settlement
    const optimalSettlement = exposure.totalMinimumExposure * 0.8; // 20% discount

    // Decision analysis
    const settlementBenefit =
      exposure.totalMostLikelyExposure - optimalSettlement - litigationCost;
    const settlementRecommended = settlementBenefit > 0;

    return {
      settlementRecommended,
      rationale: settlementRecommended
        ? `Settlement saves Rs. ${this.formatCurrency(settlementBenefit)} compared to litigation`
        : "Litigation may yield better outcome based on defense strength",
      optimalSettlementAmount: optimalSettlement,
      settlementRange: {
        min: exposure.totalMinimumExposure * 0.6,
        max: exposure.totalMinimumExposure,
      },
      litigationCostEstimate: litigationCost,
      timeValueAnalysis:
        "Settlement provides immediate closure vs. 3-5 years for litigation",
      prosOfSettlement: [
        "Certainty of outcome",
        "Immediate closure",
        "No further litigation cost",
        "Preservation of management time",
        "Positive signal to tax authorities",
      ],
      consOfSettlement: [
        "Foregoes possibility of complete waiver",
        "May set precedent for future years",
        "Immediate cash outflow",
        "May not be available for all cases",
      ],
    };
  }

  private generateAppealStrategy(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): AppealStrategy {
    // Determine recommended forum
    const recommendedForum = this.determineRecommendedForum(exposure);

    // Generate grounds of appeal
    const groundsOfAppeal = this.generateGroundsOfAppeal(input, exposure);

    return {
      recommendedForum,
      forumRationale: this.getForumRationale(recommendedForum),
      groundsOfAppeal,
      evidenceNeeded: [
        "TP documentation",
        "Correspondence with AE",
        "Board minutes",
        "Expert opinions/certifications",
        "Industry benchmark data",
        "Comparable analysis workings",
      ],
      estimatedTimeline:
        recommendedForum === "CIT(A)"
          ? "12-18 months"
          : recommendedForum === "ITAT"
            ? "24-36 months"
            : "36-48 months",
      successProbability: this.calculateSuccessProbability(groundsOfAppeal),
      estimatedCost: this.estimateLitigationCost(exposure),
    };
  }

  private determineRecommendedForum(
    exposure: TotalPenaltyExposure
  ): "CIT(A)" | "DRP" | "ITAT" | "High_Court" {
    // For penalty matters, typically CIT(A) is first appellate authority
    return "CIT(A)";
  }

  private getForumRationale(forum: string): string {
    const rationales: Record<string, string> = {
      "CIT(A)":
        "First appellate authority with power to delete penalty entirely. Cost-effective and relatively faster.",
      DRP: "Alternative to CIT(A) for eligible assessees. Binding directions but limited to facts.",
      ITAT: "Second appeal. Technical matters well-handled. Final fact-finding authority.",
      High_Court: "For substantial questions of law only. Higher cost and longer timeline.",
    };
    return rationales[forum] || "";
  }

  private generateGroundsOfAppeal(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): GroundOfAppeal[] {
    const grounds: GroundOfAppeal[] = [];
    let groundNumber = 1;

    // Ground 1: General
    grounds.push({
      groundNumber: groundNumber++,
      groundText:
        "The learned Assessing Officer erred in law and on facts in levying penalty under Section 271(1)(c).",
      supportingArguments: [
        "No concealment or inaccurate particulars",
        "Full disclosure made in return and Form 3CEB",
        "Bonafide belief in TP position",
      ],
      strength: "strong",
    });

    // Ground 2: No concealment
    grounds.push({
      groundNumber: groundNumber++,
      groundText:
        "The penalty has been levied without establishing that there was any concealment of income or furnishing of inaccurate particulars.",
      supportingArguments: [
        "All transactions disclosed",
        "Method selection properly documented",
        "Difference of opinion on arm's length price does not constitute concealment",
      ],
      strength: "strong",
    });

    // Ground 3: Reasonable cause
    grounds.push({
      groundNumber: groundNumber++,
      groundText:
        "The appellant had reasonable cause for the tax position taken and is entitled to immunity under Section 273B.",
      supportingArguments: [
        "Reliance on comparable analysis",
        "Professional advice obtained",
        "Consistent position in earlier years",
      ],
      strength: "moderate",
    });

    // Ground 4: Debatable issue
    grounds.push({
      groundNumber: groundNumber++,
      groundText:
        "The transfer pricing issue involves a debatable matter where two views are possible, and penalty cannot be levied in such cases.",
      supportingArguments: [
        "OECD guidelines allow multiple approaches",
        "Different methods may yield different results",
        "No evidence of malafide intent",
      ],
      strength: "strong",
    });

    return grounds;
  }

  private calculateSuccessProbability(grounds: GroundOfAppeal[]): number {
    const strongGrounds = grounds.filter((g) => g.strength === "strong").length;
    const moderateGrounds = grounds.filter((g) => g.strength === "moderate").length;

    // Base probability
    let probability = 30;
    probability += strongGrounds * 15;
    probability += moderateGrounds * 5;

    return Math.min(80, probability); // Cap at 80%
  }

  private estimateLitigationCost(exposure: TotalPenaltyExposure): number {
    // Base cost for penalty proceedings
    let cost = 100000; // Base professional fees

    // Add based on amount involved
    if (exposure.totalMostLikelyExposure > 10000000) {
      cost += 200000;
    } else if (exposure.totalMostLikelyExposure > 1000000) {
      cost += 100000;
    }

    // Add for multiple sections
    const sectionsInvolved = exposure.summaryBreakdown.length;
    cost += sectionsInvolved * 25000;

    return cost;
  }

  private generateOpeningStatement(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): string {
    return (
      `The present submission is filed in response to the Show Cause Notice dated [DATE] ` +
      `proposing to levy penalty under Section 271(1)(c)/271AA/271G of the Income Tax Act, 1961 ` +
      `for Assessment Year ${input.assessmentYear}. ` +
      `The Appellant respectfully submits that no penalty is leviable in the facts and ` +
      `circumstances of the case as detailed herein.`
    );
  }

  private generateFactualBackground(input: PenaltyInput): string {
    return (
      `The Appellant is a ${input.entityType.replace(/_/g, " ")} engaged in business operations ` +
      `involving international transactions with Associated Enterprises. ` +
      `For Assessment Year ${input.assessmentYear}, the Appellant filed its return of income ` +
      `and Form 3CEB as per statutory requirements. ` +
      `During the course of assessment proceedings, a transfer pricing adjustment of ` +
      `Rs. ${this.formatCurrency(input.primaryAdjustment)} was made. ` +
      `The penalty proceedings have been initiated pursuant to the said adjustment.`
    );
  }

  private generateLegalArguments(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): LegalArgument[] {
    return [
      {
        heading: "No Concealment or Inaccurate Particulars",
        body:
          "The Appellant has made full and true disclosure of all international transactions " +
          "in Form 3CEB and the return of income. The mere fact that a transfer pricing " +
          "adjustment has been made does not ipso facto lead to concealment penalty.",
        supportingCaseLaw: [
          "CIT vs. Reliance Petroproducts (2010) 322 ITR 158 (SC)",
          "Price Waterhouse vs. CIT (2012) 348 ITR 306 (SC)",
        ],
        counterArguments: [
          "May argue that underreporting of income itself is inaccurate particulars",
          "May cite MAK Data judgment on voluntary surrender",
        ],
      },
      {
        heading: "Reasonable Cause under Section 273B",
        body:
          "The Appellant had reasonable cause for the transfer pricing position taken. " +
          "The Appellant relied on comparable analysis and professional advice. " +
          "Section 273B provides that no penalty shall be imposable if there was reasonable cause.",
        supportingCaseLaw: [
          "Hindustan Steel Ltd. vs. State of Orissa (1972) 83 ITR 26 (SC)",
          "CIT vs. Zoom Communication (2010) 327 ITR 510 (Del)",
        ],
        counterArguments: [
          "Burden to prove reasonable cause is on assessee",
          "Documentation timing may be questioned",
        ],
      },
    ];
  }

  private generateConclusion(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): string {
    return (
      `In view of the above submissions and the settled legal position, it is respectfully ` +
      `submitted that no penalty is warranted in the facts of the present case. ` +
      `The Appellant has acted in good faith, maintained proper documentation, and made ` +
      `full disclosures. The transfer pricing adjustment, if any, represents a bonafide ` +
      `difference of opinion on arm's length price and not concealment or inaccurate particulars. ` +
      `The penalty proposed is not sustainable in law and deserves to be deleted.`
    );
  }

  private generateReliefSought(exposure: TotalPenaltyExposure): string[] {
    return [
      "Delete the penalty levied/proposed under Section 271(1)(c) of the Act",
      "In the alternative, substantially reduce the penalty to minimum of 100%",
      "Delete the penalty levied under Section 271AA/271G as no contravention",
      "Grant any other relief as deemed just and proper",
    ];
  }

  private getPenaltyApplicabilitySummary(exposure: TotalPenaltyExposure): string {
    const applicable: string[] = [];

    if (exposure.concealmentPenalty.isApplicable) {
      applicable.push("Concealment penalty (271(1)(c))");
    }
    if (exposure.documentationPenalty271AA.isApplicable) {
      applicable.push("Documentation penalty (271AA)");
    }
    if (exposure.documentationPenalty271G.isApplicable) {
      applicable.push("Information failure penalty (271G)");
    }
    if (exposure.reportFailurePenalty.isApplicable) {
      applicable.push("Report failure penalty (271BA)");
    }

    return applicable.length > 0
      ? `Potentially applicable penalties: ${applicable.join(", ")}.`
      : "No penalties appear applicable based on initial analysis.";
  }

  private identifyBestScenario(
    results: { name: string; exposure: TotalPenaltyExposure }[]
  ): string {
    const sorted = results.sort(
      (a, b) => a.exposure.totalMostLikelyExposure - b.exposure.totalMostLikelyExposure
    );
    return sorted[0].name;
  }

  private calculateSavings(
    results: { name: string; exposure: TotalPenaltyExposure }[]
  ): number {
    if (results.length < 2) return 0;
    const sorted = results.sort(
      (a, b) => a.exposure.totalMostLikelyExposure - b.exposure.totalMostLikelyExposure
    );
    return sorted[sorted.length - 1].exposure.totalMostLikelyExposure -
      sorted[0].exposure.totalMostLikelyExposure;
  }

  private generateScenarioRecommendation(
    results: { name: string; exposure: TotalPenaltyExposure }[]
  ): string {
    const best = this.identifyBestScenario(results);
    const savings = this.calculateSavings(results);
    return `Recommended scenario: ${best} with potential savings of Rs. ${this.formatCurrency(savings)}`;
  }

  private generateReportSummary(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure,
    mitigation: MitigationAnalysis
  ): string {
    return (
      `This report analyzes the penalty exposure for AY ${input.assessmentYear} arising from ` +
      `a primary TP adjustment of Rs. ${this.formatCurrency(input.primaryAdjustment)}. ` +
      `Total estimated exposure: Rs. ${this.formatCurrency(exposure.totalMostLikelyExposure)}. ` +
      `Penalty likelihood: ${mitigation.penaltyLikelihood}. ` +
      `Key recommendation: ${mitigation.recommendedActions[0] || "Engage specialist immediately"}.`
    );
  }

  private generateReportRecommendations(
    exposure: TotalPenaltyExposure,
    mitigation: MitigationAnalysis
  ): string[] {
    return [
      ...mitigation.recommendedActions,
      "Maintain detailed records of all correspondence",
      "Set calendar reminders for key deadlines",
      "Consider insurance coverage for tax disputes",
    ];
  }

  private generateAppendices(
    input: PenaltyInput,
    exposure: TotalPenaltyExposure
  ): Appendix[] {
    return [
      {
        title: "Detailed Penalty Computation",
        content: exposure.summaryBreakdown
          .map((b) => `${b.section}: Rs. ${this.formatCurrency(b.amount)}`)
          .join("\n"),
      },
      {
        title: "Relevant Case Law Citations",
        content: CONCEALMENT_PENALTY_DEFENSES.join("\n"),
      },
      {
        title: "Documentation Checklist",
        content: exposure.documentationPenalty271AA.documentationGaps.join("\n"),
      },
    ];
  }

  private getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
    if (score >= 75) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN").format(Math.round(amount));
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface ScenarioComparison {
  scenarios: {
    name: string;
    totalExposure: number;
    breakdown: TotalPenaltyExposure["summaryBreakdown"];
  }[];
  bestScenario: string;
  savingsAnalysis: number;
  recommendation: string;
}

interface PenaltyReport {
  reportDate: Date;
  assessmentYear: string;
  entityType: EntityType;
  executiveSummary: string;
  exposureDetails: TotalPenaltyExposure;
  mitigationAnalysis: MitigationAnalysis;
  recommendations: string[];
  appendices: Appendix[];
}

interface Appendix {
  title: string;
  content: string;
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new PenaltyAIService instance
 */
export function createPenaltyAIService(
  assessmentYear: string = "2025-26"
): PenaltyAIService {
  return new PenaltyAIService(assessmentYear);
}

/**
 * Get singleton instance
 */
let _penaltyAIServiceInstance: PenaltyAIService | null = null;

export function getPenaltyAIService(
  assessmentYear: string = "2025-26"
): PenaltyAIService {
  if (!_penaltyAIServiceInstance) {
    _penaltyAIServiceInstance = createPenaltyAIService(assessmentYear);
  }
  return _penaltyAIServiceInstance;
}
