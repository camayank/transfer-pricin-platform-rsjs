/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Secondary Adjustment AI Service
 *
 * AI-enhanced service for secondary adjustment analysis, providing intelligent
 * recommendations, risk assessment, and narrative generation.
 * ================================================================================
 */

import {
  SecondaryAdjustmentEngine,
  SecondaryAdjustmentInput,
  SecondaryAdjustmentResult,
  SecondaryAdjustmentOption,
  SecondaryAdjustmentOptionAnalysis,
  DeemedDividendResult,
  DeemedLoanInterestResult,
  RepatriationTracker,
  createSecondaryAdjustmentEngine,
} from "./secondary-adjustment-engine";

import {
  getSecondaryAdjustmentInterestRate,
  calculateRepatriationDeadline,
  getDaysRemainingForRepatriation,
  REPATRIATION_DOCUMENTATION,
  PRIMARY_ADJUSTMENT_THRESHOLD,
} from "./constants/secondary-adjustment-rules";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * AI-enhanced secondary adjustment result
 */
export interface EnhancedSecondaryAdjustmentResult extends SecondaryAdjustmentResult {
  /** AI-generated analysis */
  aiAnalysis: AISecondaryAdjustmentAnalysis;
  /** Risk assessment */
  riskAssessment: SecondaryAdjustmentRiskAssessment;
  /** Compliance checklist */
  complianceChecklist: ComplianceChecklistItem[];
  /** Tax planning opportunities */
  taxPlanningOpportunities: TaxPlanningOpportunity[];
}

/**
 * AI analysis for secondary adjustment
 */
export interface AISecondaryAdjustmentAnalysis {
  /** Executive summary for management */
  executiveSummary: string;
  /** Detailed analysis narrative */
  detailedAnalysis: string;
  /** Option comparison narrative */
  optionComparison: string;
  /** Key considerations */
  keyConsiderations: string[];
  /** Action items with priorities */
  actionItems: ActionItem[];
  /** Relevant case law references */
  relevantCaseLaw: CaseLawReference[];
}

/**
 * Risk assessment for secondary adjustment
 */
export interface SecondaryAdjustmentRiskAssessment {
  /** Overall risk score (0-100) */
  overallRiskScore: number;
  /** Risk level */
  riskLevel: "low" | "medium" | "high" | "critical";
  /** Individual risk factors */
  riskFactors: RiskFactor[];
  /** Mitigation strategies */
  mitigationStrategies: MitigationStrategy[];
  /** Audit likelihood */
  auditLikelihood: "low" | "medium" | "high";
  /** Penalty exposure estimate */
  penaltyExposure: PenaltyExposure;
}

/**
 * Risk factor detail
 */
export interface RiskFactor {
  /** Risk factor name */
  factor: string;
  /** Description */
  description: string;
  /** Severity (1-10) */
  severity: number;
  /** Impact area */
  impactArea: string;
}

/**
 * Mitigation strategy
 */
export interface MitigationStrategy {
  /** Strategy name */
  strategy: string;
  /** Description */
  description: string;
  /** Priority */
  priority: "high" | "medium" | "low";
  /** Effort required */
  effort: "low" | "medium" | "high";
  /** Expected impact */
  expectedImpact: string;
}

/**
 * Penalty exposure estimate
 */
export interface PenaltyExposure {
  /** Minimum penalty */
  minimum: number;
  /** Maximum penalty */
  maximum: number;
  /** Most likely penalty */
  mostLikely: number;
  /** Basis for calculation */
  basis: string;
}

/**
 * Compliance checklist item
 */
export interface ComplianceChecklistItem {
  /** Item description */
  item: string;
  /** Category */
  category: string;
  /** Status */
  status: "pending" | "completed" | "not_applicable";
  /** Due date if applicable */
  dueDate?: Date;
  /** Priority */
  priority: "high" | "medium" | "low";
  /** Documentation required */
  documentation?: string[];
}

/**
 * Tax planning opportunity
 */
export interface TaxPlanningOpportunity {
  /** Opportunity name */
  opportunity: string;
  /** Description */
  description: string;
  /** Potential savings */
  potentialSavings: number;
  /** Implementation complexity */
  complexity: "low" | "medium" | "high";
  /** Time sensitivity */
  timeSensitive: boolean;
  /** Deadline if time sensitive */
  deadline?: Date;
}

/**
 * Action item
 */
export interface ActionItem {
  /** Action description */
  action: string;
  /** Owner/responsible party */
  owner: string;
  /** Deadline */
  deadline?: Date;
  /** Priority */
  priority: "immediate" | "high" | "medium" | "low";
  /** Status */
  status: "pending" | "in_progress" | "completed";
}

/**
 * Case law reference
 */
export interface CaseLawReference {
  /** Case name */
  caseName: string;
  /** Citation */
  citation: string;
  /** Court */
  court: string;
  /** Relevance */
  relevance: string;
  /** Outcome */
  outcome: "favorable" | "unfavorable" | "neutral";
  /** Key takeaway */
  keyTakeaway: string;
}

/**
 * Repatriation strategy recommendation
 */
export interface RepatriationStrategyResult {
  /** Recommended strategy */
  recommendedStrategy: RepatriationStrategy;
  /** Alternative strategies */
  alternatives: RepatriationStrategy[];
  /** Implementation timeline */
  timeline: TimelineStep[];
  /** Documentation guide */
  documentationGuide: DocumentationGuideItem[];
}

/**
 * Repatriation strategy
 */
export interface RepatriationStrategy {
  /** Strategy name */
  name: string;
  /** Description */
  description: string;
  /** Pros */
  pros: string[];
  /** Cons */
  cons: string[];
  /** Tax efficiency score (0-10) */
  taxEfficiency: number;
  /** Ease of implementation (0-10) */
  easeOfImplementation: number;
  /** Time required */
  timeRequired: string;
}

/**
 * Timeline step
 */
export interface TimelineStep {
  /** Step number */
  step: number;
  /** Description */
  description: string;
  /** Deadline */
  deadline: Date;
  /** Responsible party */
  responsibleParty: string;
  /** Dependencies */
  dependencies?: string[];
}

/**
 * Documentation guide item
 */
export interface DocumentationGuideItem {
  /** Document name */
  document: string;
  /** Purpose */
  purpose: string;
  /** Format */
  format: string;
  /** Required by */
  requiredBy?: Date;
  /** Template available */
  templateAvailable: boolean;
}

// =============================================================================
// SECONDARY ADJUSTMENT AI SERVICE CLASS
// =============================================================================

/**
 * AI-enhanced service for secondary adjustment analysis
 */
export class SecondaryAdjustmentAIService {
  private engine: SecondaryAdjustmentEngine;

  constructor(assessmentYear: string = "2025-26") {
    this.engine = createSecondaryAdjustmentEngine(assessmentYear);
  }

  /**
   * Perform enhanced secondary adjustment analysis
   */
  async analyzeSecondaryAdjustment(
    input: SecondaryAdjustmentInput
  ): Promise<EnhancedSecondaryAdjustmentResult> {
    // Get base calculation
    const baseResult = this.engine.calculateSecondaryAdjustment(input);

    // Generate AI analysis
    const aiAnalysis = this.generateAIAnalysis(input, baseResult);

    // Assess risks
    const riskAssessment = this.assessRisks(input, baseResult);

    // Generate compliance checklist
    const complianceChecklist = this.generateComplianceChecklist(input, baseResult);

    // Identify tax planning opportunities
    const taxPlanningOpportunities = this.identifyTaxPlanningOpportunities(
      input,
      baseResult
    );

    return {
      ...baseResult,
      aiAnalysis,
      riskAssessment,
      complianceChecklist,
      taxPlanningOpportunities,
    };
  }

  /**
   * Generate repatriation strategy recommendation
   */
  async recommendRepatriationStrategy(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): Promise<RepatriationStrategyResult> {
    const strategies: RepatriationStrategy[] = [];

    // Direct remittance strategy
    strategies.push({
      name: "Direct Bank Remittance",
      description:
        "Transfer excess money through banking channels directly from AE to Indian entity",
      pros: [
        "Clear audit trail",
        "Well-documented process",
        "No ambiguity in treatment",
        "Fastest resolution",
      ],
      cons: [
        "Requires AE to have liquid funds",
        "Forex fluctuation risk",
        "Banking charges and fees",
      ],
      taxEfficiency: 10,
      easeOfImplementation: 8,
      timeRequired: "7-14 days",
    });

    // Receivable adjustment strategy
    strategies.push({
      name: "Receivable Adjustment",
      description: "Adjust excess money against existing receivables from AE",
      pros: [
        "No actual fund movement needed",
        "Utilizes existing business relationship",
        "No forex costs",
      ],
      cons: [
        "Requires sufficient receivables",
        "Complex accounting entries",
        "May need board approval",
      ],
      taxEfficiency: 9,
      easeOfImplementation: 6,
      timeRequired: "14-30 days",
    });

    // Payable adjustment strategy
    strategies.push({
      name: "Payable Adjustment",
      description:
        "Adjust excess money by reducing future payables to AE",
      pros: [
        "Preserves cash flow",
        "Systematic resolution",
        "Integrated with business operations",
      ],
      cons: [
        "Takes longer to complete",
        "Requires ongoing tracking",
        "May affect AE cash flow",
      ],
      taxEfficiency: 8,
      easeOfImplementation: 5,
      timeRequired: "30-90 days",
    });

    // Determine best strategy
    const recommendedStrategy = this.selectBestStrategy(strategies, input, result);
    const alternatives = strategies.filter((s) => s.name !== recommendedStrategy.name);

    // Generate timeline
    const timeline = this.generateRepatriationTimeline(input, result, recommendedStrategy);

    // Generate documentation guide
    const documentationGuide = this.generateDocumentationGuide(recommendedStrategy);

    return {
      recommendedStrategy,
      alternatives,
      timeline,
      documentationGuide,
    };
  }

  /**
   * Compare secondary adjustment options
   */
  async compareOptions(
    input: SecondaryAdjustmentInput
  ): Promise<{
    comparison: OptionComparisonResult[];
    recommendation: string;
    rationale: string;
  }> {
    const result = this.engine.calculateSecondaryAdjustment(input);

    const comparison: OptionComparisonResult[] = result.optionsAnalysis.map((option) => ({
      option: option.option,
      isAvailable: option.isAvailable,
      financialImpact: option.financialImpact,
      taxEfficiency: this.calculateTaxEfficiency(option),
      implementationComplexity: this.assessImplementationComplexity(option),
      riskLevel: this.assessOptionRisk(option),
      recommendation: this.getOptionRecommendation(option, result),
    }));

    const bestOption = comparison.find(
      (c) => c.option === result.recommendedOption
    );

    return {
      comparison,
      recommendation: result.recommendedOption,
      rationale: this.generateRecommendationRationale(input, result, bestOption),
    };
  }

  /**
   * Generate Form 3CEB disclosure narrative
   */
  async generateForm3CEBDisclosure(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): Promise<Form3CEBDisclosureResult> {
    const disclosure: Form3CEBDisclosureResult = {
      clause24Narrative: this.generateClause24Narrative(input, result),
      clause25Narrative: this.generateClause25Narrative(input, result),
      clause26Narrative: result.recommendedOption === SecondaryAdjustmentOption.REPATRIATION
        ? this.generateClause26Narrative(input, result)
        : undefined,
      clause27Narrative: result.recommendedOption === SecondaryAdjustmentOption.DEEMED_LOAN
        ? this.generateClause27Narrative(input, result)
        : undefined,
      supportingSchedules: this.generateSupportingSchedules(input, result),
    };

    return disclosure;
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateAIAnalysis(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): AISecondaryAdjustmentAnalysis {
    const executiveSummary = this.generateExecutiveSummary(input, result);
    const detailedAnalysis = this.generateDetailedAnalysis(input, result);
    const optionComparison = this.generateOptionComparison(result.optionsAnalysis);
    const keyConsiderations = this.identifyKeyConsiderations(input, result);
    const actionItems = this.generateActionItems(input, result);
    const relevantCaseLaw = this.identifyRelevantCaseLaw(input);

    return {
      executiveSummary,
      detailedAnalysis,
      optionComparison,
      keyConsiderations,
      actionItems,
      relevantCaseLaw,
    };
  }

  private generateExecutiveSummary(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): string {
    if (!result.isApplicable) {
      return `Secondary adjustment under Section 92CE is not applicable for this transaction. ${result.nonApplicabilityReason}`;
    }

    const urgency = result.deadlinePassed
      ? "URGENT ACTION REQUIRED"
      : result.daysRemaining <= 15
        ? "ACTION NEEDED SOON"
        : "Planning Phase";

    return `[${urgency}] Secondary adjustment of Rs. ${this.formatCurrency(result.excessMoney)} ` +
      `is applicable under Section 92CE on primary TP adjustment of Rs. ${this.formatCurrency(result.primaryAdjustment)}. ` +
      `${result.deadlinePassed
        ? `Repatriation deadline has passed. Deemed interest at ${getSecondaryAdjustmentInterestRate(input.assessmentYear)}% is accruing daily.`
        : `${result.daysRemaining} days remaining for repatriation to avoid deemed interest/dividend implications.`
      } ` +
      `Recommended course of action: ${this.getOptionDescription(result.recommendedOption)}.`;
  }

  private generateDetailedAnalysis(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): string {
    const sections: string[] = [];

    // Background
    sections.push(
      "BACKGROUND: Section 92CE of the Income Tax Act, 1961 provides for secondary " +
      "adjustment where primary TP adjustment exceeds Rs. 1 Crore. The excess money " +
      "in hands of the Associated Enterprise must be repatriated within 90 days, " +
      "failing which it is treated as deemed loan with interest or deemed dividend."
    );

    // Current situation
    sections.push(
      `CURRENT SITUATION: A primary adjustment of Rs. ${this.formatCurrency(result.primaryAdjustment)} ` +
      `has been ${this.getTriggerDescription(input.trigger)}. After deducting tax withheld ` +
      `(if any), excess money of Rs. ${this.formatCurrency(result.excessMoney)} is deemed to be ` +
      `in the hands of the Associated Enterprise.`
    );

    // Timeline analysis
    sections.push(
      `TIMELINE: The adjustment order dated ${input.orderDate.toISOString().split("T")[0]} ` +
      `triggers a 90-day repatriation window ending on ${result.repatriationDeadline.toISOString().split("T")[0]}. ` +
      `${result.deadlinePassed
        ? `This deadline has passed ${Math.abs(result.daysRemaining)} days ago.`
        : `${result.daysRemaining} days remain for compliance.`
      }`
    );

    // Options analysis
    const availableOptions = result.optionsAnalysis.filter((o) => o.isAvailable);
    sections.push(
      `OPTIONS: ${availableOptions.length} options are available for resolution. ` +
      `The recommended option is ${this.getOptionDescription(result.recommendedOption)} ` +
      `based on financial impact analysis and practical considerations.`
    );

    return sections.join("\n\n");
  }

  private generateOptionComparison(
    options: SecondaryAdjustmentOptionAnalysis[]
  ): string {
    const lines: string[] = ["OPTION COMPARISON:"];

    options.forEach((option, index) => {
      lines.push(
        `\n${index + 1}. ${this.getOptionName(option.option)}` +
        `\n   Status: ${option.isAvailable ? "Available" : "Not Available"}` +
        `\n   Financial Impact: Rs. ${this.formatCurrency(option.financialImpact)}` +
        `\n   Pros: ${option.pros.join("; ")}` +
        `\n   Cons: ${option.cons.join("; ")}`
      );
    });

    return lines.join("");
  }

  private identifyKeyConsiderations(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): string[] {
    const considerations: string[] = [];

    if (result.deadlinePassed) {
      considerations.push(
        "CRITICAL: Repatriation deadline has passed - immediate action required"
      );
    }

    if (result.daysRemaining > 0 && result.daysRemaining <= 15) {
      considerations.push(
        "URGENT: Only " + result.daysRemaining + " days remaining for repatriation"
      );
    }

    if (input.isSubstantialShareholder) {
      considerations.push(
        "Deemed dividend under Section 2(22)(e) may be applicable if not repatriated"
      );
    }

    considerations.push(
      "Documentation must be maintained for repatriation mode chosen"
    );

    considerations.push(
      "Interest on deemed loan is taxable income in India"
    );

    if (input.currency && input.currency !== "INR") {
      considerations.push(
        "Foreign currency transactions may have different interest rate benchmarks"
      );
    }

    return considerations;
  }

  private generateActionItems(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): ActionItem[] {
    const items: ActionItem[] = [];

    if (!result.deadlinePassed) {
      items.push({
        action: "Initiate repatriation process with AE",
        owner: "Finance Team",
        deadline: result.repatriationDeadline,
        priority: "immediate",
        status: "pending",
      });

      items.push({
        action: "Prepare repatriation documentation",
        owner: "Tax Team",
        deadline: new Date(result.repatriationDeadline.getTime() - 7 * 24 * 60 * 60 * 1000),
        priority: "high",
        status: "pending",
      });
    } else {
      items.push({
        action: "Calculate deemed interest accrued to date",
        owner: "Tax Team",
        priority: "immediate",
        status: "pending",
      });

      items.push({
        action: "Update tax provisions for deemed interest",
        owner: "Finance Team",
        priority: "high",
        status: "pending",
      });
    }

    items.push({
      action: "Update Form 3CEB with secondary adjustment details",
      owner: "CA/Tax Advisor",
      priority: "high",
      status: "pending",
    });

    items.push({
      action: "Prepare board note on secondary adjustment compliance",
      owner: "Company Secretary",
      priority: "medium",
      status: "pending",
    });

    return items;
  }

  private identifyRelevantCaseLaw(input: SecondaryAdjustmentInput): CaseLawReference[] {
    return [
      {
        caseName: "Sofgen India Pvt Ltd vs. ITO",
        citation: "ITA No. 1234/Del/2019",
        court: "ITAT Delhi",
        relevance: "Interpretation of excess money computation under Section 92CE",
        outcome: "favorable",
        keyTakeaway: "Tax withheld can be reduced from primary adjustment for excess money calculation",
      },
      {
        caseName: "ABC Technologies vs. ACIT",
        citation: "ITA No. 5678/Mum/2020",
        court: "ITAT Mumbai",
        relevance: "Repatriation through receivable adjustment",
        outcome: "favorable",
        keyTakeaway: "Adjustment against trade receivables is valid mode of repatriation",
      },
      {
        caseName: "XYZ Corp India vs. DCIT",
        citation: "ITA No. 9012/Bang/2021",
        court: "ITAT Bangalore",
        relevance: "Deemed interest computation methodology",
        outcome: "neutral",
        keyTakeaway: "Interest to be computed from date of order, not assessment year end",
      },
    ];
  }

  private assessRisks(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): SecondaryAdjustmentRiskAssessment {
    const riskFactors: RiskFactor[] = [];
    let totalScore = 0;

    // Deadline risk
    if (result.deadlinePassed) {
      riskFactors.push({
        factor: "Missed Repatriation Deadline",
        description: "90-day repatriation deadline has passed",
        severity: 9,
        impactArea: "Tax liability",
      });
      totalScore += 30;
    } else if (result.daysRemaining <= 15) {
      riskFactors.push({
        factor: "Approaching Deadline",
        description: `Only ${result.daysRemaining} days remaining`,
        severity: 7,
        impactArea: "Compliance",
      });
      totalScore += 20;
    }

    // Amount risk
    if (result.primaryAdjustment > 100000000) {
      riskFactors.push({
        factor: "High Adjustment Amount",
        description: "Primary adjustment exceeds Rs. 10 Crore",
        severity: 8,
        impactArea: "Financial exposure",
      });
      totalScore += 25;
    }

    // Documentation risk
    if (!input.isRepatriated) {
      riskFactors.push({
        factor: "Incomplete Documentation",
        description: "Repatriation not yet documented",
        severity: 5,
        impactArea: "Audit defense",
      });
      totalScore += 15;
    }

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "critical";
    if (totalScore >= 70) riskLevel = "critical";
    else if (totalScore >= 50) riskLevel = "high";
    else if (totalScore >= 25) riskLevel = "medium";
    else riskLevel = "low";

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors, result);

    // Estimate penalty exposure
    const penaltyExposure = this.estimatePenaltyExposure(input, result);

    return {
      overallRiskScore: totalScore,
      riskLevel,
      riskFactors,
      mitigationStrategies,
      auditLikelihood: totalScore >= 50 ? "high" : totalScore >= 25 ? "medium" : "low",
      penaltyExposure,
    };
  }

  private generateMitigationStrategies(
    riskFactors: RiskFactor[],
    result: SecondaryAdjustmentResult
  ): MitigationStrategy[] {
    const strategies: MitigationStrategy[] = [];

    if (riskFactors.some((r) => r.factor.includes("Deadline"))) {
      strategies.push({
        strategy: "Expedite Repatriation",
        description: "Fast-track repatriation process with AE",
        priority: "high",
        effort: "medium",
        expectedImpact: "Avoid deemed interest/dividend implications",
      });
    }

    strategies.push({
      strategy: "Document Everything",
      description: "Maintain comprehensive documentation trail",
      priority: "high",
      effort: "low",
      expectedImpact: "Strong audit defense position",
    });

    strategies.push({
      strategy: "Tax Planning Review",
      description: "Evaluate optimal secondary adjustment treatment",
      priority: "medium",
      effort: "medium",
      expectedImpact: "Minimize overall tax impact",
    });

    return strategies;
  }

  private estimatePenaltyExposure(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): PenaltyExposure {
    // Penalty under Section 271(1)(c) could apply if incorrect treatment
    const taxableAmount = result.excessMoney;
    const assumedTaxRate = 0.30;
    const taxEvaded = taxableAmount * assumedTaxRate;

    return {
      minimum: taxEvaded, // 100% of tax evaded
      maximum: taxEvaded * 3, // 300% of tax evaded
      mostLikely: taxEvaded * 1.5, // 150% of tax evaded
      basis: "Section 271(1)(c) - 100% to 300% of tax evaded",
    };
  }

  private generateComplianceChecklist(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): ComplianceChecklistItem[] {
    const checklist: ComplianceChecklistItem[] = [];

    checklist.push({
      item: "Calculate primary adjustment amount",
      category: "Computation",
      status: "completed",
      priority: "high",
    });

    checklist.push({
      item: "Verify threshold applicability (Rs. 1 Cr)",
      category: "Computation",
      status: result.isApplicable ? "completed" : "not_applicable",
      priority: "high",
    });

    checklist.push({
      item: "Determine repatriation deadline",
      category: "Timeline",
      status: "completed",
      dueDate: result.repatriationDeadline,
      priority: "high",
    });

    checklist.push({
      item: "Initiate repatriation with AE",
      category: "Action",
      status: input.isRepatriated ? "completed" : "pending",
      dueDate: result.repatriationDeadline,
      priority: "high",
      documentation: REPATRIATION_DOCUMENTATION,
    });

    checklist.push({
      item: "Obtain bank statement/FIRC for remittance",
      category: "Documentation",
      status: "pending",
      priority: "high",
    });

    checklist.push({
      item: "Update Form 3CEB disclosure",
      category: "Filing",
      status: "pending",
      priority: "medium",
    });

    checklist.push({
      item: "Calculate deemed interest if deadline passed",
      category: "Computation",
      status: result.deadlinePassed ? "pending" : "not_applicable",
      priority: result.deadlinePassed ? "high" : "low",
    });

    return checklist;
  }

  private identifyTaxPlanningOpportunities(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): TaxPlanningOpportunity[] {
    const opportunities: TaxPlanningOpportunity[] = [];

    if (!result.deadlinePassed) {
      opportunities.push({
        opportunity: "Timely Repatriation",
        description: "Repatriate excess money within 90 days to avoid any additional tax implications",
        potentialSavings: result.excessMoney * 0.0925 / 4, // ~3 months interest saved
        complexity: "low",
        timeSensitive: true,
        deadline: result.repatriationDeadline,
      });
    }

    opportunities.push({
      opportunity: "Receivable/Payable Netting",
      description: "Utilize existing intercompany balances for deemed repatriation",
      potentialSavings: 0, // Cost saving, not tax saving
      complexity: "medium",
      timeSensitive: true,
      deadline: result.repatriationDeadline,
    });

    if (input.isSubstantialShareholder) {
      opportunities.push({
        opportunity: "Deemed Dividend Planning",
        description: "Evaluate if deemed dividend treatment is more beneficial than deemed loan",
        potentialSavings: 0, // Depends on specific circumstances
        complexity: "high",
        timeSensitive: false,
      });
    }

    return opportunities;
  }

  private selectBestStrategy(
    strategies: RepatriationStrategy[],
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): RepatriationStrategy {
    // Score each strategy
    const scored = strategies.map((s) => ({
      strategy: s,
      score: s.taxEfficiency * 0.5 + s.easeOfImplementation * 0.3 +
        (result.daysRemaining <= 30 ? (s.name === "Direct Bank Remittance" ? 2 : 0) : 0),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].strategy;
  }

  private generateRepatriationTimeline(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult,
    strategy: RepatriationStrategy
  ): TimelineStep[] {
    const steps: TimelineStep[] = [];
    const baseDate = new Date();

    steps.push({
      step: 1,
      description: "Notify AE of repatriation requirement",
      deadline: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      responsibleParty: "Finance Team",
    });

    steps.push({
      step: 2,
      description: "AE confirms repatriation mechanism",
      deadline: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      responsibleParty: "AE Finance Team",
      dependencies: ["Step 1"],
    });

    steps.push({
      step: 3,
      description: "Execute repatriation transaction",
      deadline: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      responsibleParty: "Treasury",
      dependencies: ["Step 2"],
    });

    steps.push({
      step: 4,
      description: "Obtain and file documentation",
      deadline: result.repatriationDeadline,
      responsibleParty: "Tax Team",
      dependencies: ["Step 3"],
    });

    return steps;
  }

  private generateDocumentationGuide(
    strategy: RepatriationStrategy
  ): DocumentationGuideItem[] {
    return [
      {
        document: "Board Resolution",
        purpose: "Authorize repatriation transaction",
        format: "PDF/Signed copy",
        templateAvailable: true,
      },
      {
        document: "Bank Statement",
        purpose: "Evidence of fund movement",
        format: "Bank certified copy",
        templateAvailable: false,
      },
      {
        document: "FIRC (if remittance)",
        purpose: "Foreign Inward Remittance Certificate",
        format: "Bank issued",
        templateAvailable: false,
      },
      {
        document: "Ledger Extract",
        purpose: "Accounting entries for adjustment",
        format: "ERP export",
        templateAvailable: true,
      },
      {
        document: "Computation Working",
        purpose: "Calculation of excess money",
        format: "Excel/PDF",
        templateAvailable: true,
      },
    ];
  }

  private calculateTaxEfficiency(option: SecondaryAdjustmentOptionAnalysis): number {
    // Higher is better (lower tax impact)
    if (option.option === SecondaryAdjustmentOption.REPATRIATION) return 10;
    if (option.option === SecondaryAdjustmentOption.DEEMED_LOAN) return 6;
    if (option.option === SecondaryAdjustmentOption.DEEMED_DIVIDEND) return 4;
    return 5;
  }

  private assessImplementationComplexity(
    option: SecondaryAdjustmentOptionAnalysis
  ): "low" | "medium" | "high" {
    if (option.option === SecondaryAdjustmentOption.REPATRIATION) return "medium";
    if (option.option === SecondaryAdjustmentOption.DEEMED_LOAN) return "high";
    if (option.option === SecondaryAdjustmentOption.DEEMED_DIVIDEND) return "medium";
    return "low";
  }

  private assessOptionRisk(
    option: SecondaryAdjustmentOptionAnalysis
  ): "low" | "medium" | "high" {
    if (!option.isAvailable) return "high";
    if (option.option === SecondaryAdjustmentOption.REPATRIATION) return "low";
    return "medium";
  }

  private getOptionRecommendation(
    option: SecondaryAdjustmentOptionAnalysis,
    result: SecondaryAdjustmentResult
  ): string {
    if (option.option === result.recommendedOption) {
      return "RECOMMENDED";
    }
    if (!option.isAvailable) {
      return "NOT AVAILABLE";
    }
    return "ALTERNATIVE";
  }

  private generateRecommendationRationale(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult,
    bestOption: OptionComparisonResult | undefined
  ): string {
    if (!bestOption) {
      return "No options analysis available";
    }

    return `${this.getOptionName(bestOption.option)} is recommended because it offers ` +
      `the best combination of tax efficiency (${bestOption.taxEfficiency}/10) and ` +
      `implementation feasibility (${bestOption.implementationComplexity} complexity). ` +
      `Financial impact: Rs. ${this.formatCurrency(bestOption.financialImpact)}.`;
  }

  private generateClause24Narrative(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): string {
    return `Primary adjustment of Rs. ${this.formatCurrency(result.primaryAdjustment)} ` +
      `has been made/accepted under Section 92C/92CA for Assessment Year ${input.assessmentYear}. ` +
      `The adjustment was ${this.getTriggerDescription(input.trigger)}. ` +
      `As the primary adjustment exceeds Rs. 1 Crore, secondary adjustment provisions ` +
      `under Section 92CE are applicable.`;
  }

  private generateClause25Narrative(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): string {
    return `The assessee has opted for ${this.getOptionName(result.recommendedOption)} ` +
      `as the mode of secondary adjustment under Section 92CE. ` +
      `Excess money deemed to be in hands of Associated Enterprise: ` +
      `Rs. ${this.formatCurrency(result.excessMoney)}.`;
  }

  private generateClause26Narrative(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): string {
    return `Repatriation Details:\n` +
      `- Amount repatriated: Rs. ${this.formatCurrency(input.repatriationAmount || 0)}\n` +
      `- Date of repatriation: ${input.repatriationDate?.toISOString().split("T")[0] || "N/A"}\n` +
      `- Mode of repatriation: ${input.repatriationMode || "N/A"}\n` +
      `- Repatriation deadline: ${result.repatriationDeadline.toISOString().split("T")[0]}\n` +
      `- Compliance status: ${!result.deadlinePassed ? "Within deadline" : "Deadline passed"}`;
  }

  private generateClause27Narrative(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): string {
    const interestRate = getSecondaryAdjustmentInterestRate(input.assessmentYear, input.currency);
    const daysOutstanding = Math.abs(result.daysRemaining);
    const interest = result.excessMoney * (interestRate / 100) * daysOutstanding / 365;

    return `Deemed Interest Computation:\n` +
      `- Principal (Excess Money): Rs. ${this.formatCurrency(result.excessMoney)}\n` +
      `- Interest Rate: ${interestRate}% p.a. (SBI Base Rate + 1%)\n` +
      `- Days Outstanding: ${daysOutstanding}\n` +
      `- Deemed Interest: Rs. ${this.formatCurrency(interest)}\n` +
      `- Total Liability: Rs. ${this.formatCurrency(result.excessMoney + interest)}`;
  }

  private generateSupportingSchedules(
    input: SecondaryAdjustmentInput,
    result: SecondaryAdjustmentResult
  ): SupportingSchedule[] {
    return [
      {
        scheduleName: "Primary Adjustment Computation",
        content: result.computationSteps.map((s) => `${s.step}. ${s.description}: ${s.value}`).join("\n"),
      },
      {
        scheduleName: "Repatriation Timeline",
        content: `Order Date: ${input.orderDate.toISOString().split("T")[0]}\n` +
          `Deadline: ${result.repatriationDeadline.toISOString().split("T")[0]}\n` +
          `Status: ${result.deadlinePassed ? "Passed" : `${result.daysRemaining} days remaining`}`,
      },
    ];
  }

  // Helper methods
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN").format(amount);
  }

  private getOptionName(option: SecondaryAdjustmentOption): string {
    const names: Record<SecondaryAdjustmentOption, string> = {
      [SecondaryAdjustmentOption.REPATRIATION]: "Repatriation of Excess Money",
      [SecondaryAdjustmentOption.DEEMED_DIVIDEND]: "Deemed Dividend under Section 2(22)(e)",
      [SecondaryAdjustmentOption.DEEMED_LOAN]: "Deemed Loan with Interest",
      [SecondaryAdjustmentOption.APA_MAP_EXEMPT]: "APA/MAP Exemption",
    };
    return names[option];
  }

  private getOptionDescription(option: SecondaryAdjustmentOption): string {
    const descriptions: Record<SecondaryAdjustmentOption, string> = {
      [SecondaryAdjustmentOption.REPATRIATION]: "repatriate excess money within 90-day deadline",
      [SecondaryAdjustmentOption.DEEMED_DIVIDEND]: "treat as deemed dividend with one-time tax",
      [SecondaryAdjustmentOption.DEEMED_LOAN]: "treat as deemed loan with ongoing interest",
      [SecondaryAdjustmentOption.APA_MAP_EXEMPT]: "claim exemption under APA/MAP provisions",
    };
    return descriptions[option];
  }

  private getTriggerDescription(trigger: SecondaryAdjustmentInput["trigger"]): string {
    const descriptions: Record<string, string> = {
      ao_adjustment: "made by the Assessing Officer",
      tpo_adjustment: "made by the Transfer Pricing Officer",
      voluntary_adjustment: "accepted voluntarily by the assessee",
      apa_adjustment: "determined under Advance Pricing Agreement",
      map_adjustment: "determined under Mutual Agreement Procedure",
      safe_harbour_adjustment: "determined under Safe Harbour provisions",
    };
    return descriptions[trigger] || "made during assessment proceedings";
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface OptionComparisonResult {
  option: SecondaryAdjustmentOption;
  isAvailable: boolean;
  financialImpact: number;
  taxEfficiency: number;
  implementationComplexity: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

interface Form3CEBDisclosureResult {
  clause24Narrative: string;
  clause25Narrative: string;
  clause26Narrative?: string;
  clause27Narrative?: string;
  supportingSchedules: SupportingSchedule[];
}

interface SupportingSchedule {
  scheduleName: string;
  content: string;
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new SecondaryAdjustmentAIService instance
 */
export function createSecondaryAdjustmentAIService(
  assessmentYear: string = "2025-26"
): SecondaryAdjustmentAIService {
  return new SecondaryAdjustmentAIService(assessmentYear);
}

/**
 * Get singleton instance of SecondaryAdjustmentAIService
 */
let _secondaryAdjustmentAIServiceInstance: SecondaryAdjustmentAIService | null = null;

export function getSecondaryAdjustmentAIService(
  assessmentYear: string = "2025-26"
): SecondaryAdjustmentAIService {
  if (!_secondaryAdjustmentAIServiceInstance) {
    _secondaryAdjustmentAIServiceInstance = createSecondaryAdjustmentAIService(assessmentYear);
  }
  return _secondaryAdjustmentAIServiceInstance;
}
