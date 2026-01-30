/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Thin Capitalization AI Service
 *
 * AI-enhanced service for Section 94B analysis, EBITDA optimization,
 * and interest restructuring recommendations.
 * ================================================================================
 */

import {
  ThinCapitalizationEngine,
  ThinCapInput,
  ThinCapResult,
  EBITDAResult,
  InterestAnalysis,
  CarryforwardResult,
  FinancialData,
  InterestExpense,
  createThinCapEngine,
} from "./thin-cap-engine";

import {
  EBITDA_LIMITATION_PERCENTAGE,
  CARRYFORWARD_YEARS,
  getAYThinCapRules,
  getSection94BDescription,
} from "./constants/thin-cap-rules";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Enhanced thin cap result with AI analysis
 */
export interface EnhancedThinCapResult extends ThinCapResult {
  /** AI-generated analysis */
  aiAnalysis: AIThinCapAnalysis;
  /** Optimization opportunities */
  optimizationOpportunities: OptimizationOpportunity[];
  /** Risk assessment */
  riskAssessment: ThinCapRiskAssessment;
  /** Tax planning recommendations */
  taxPlanningRecommendations: TaxPlanningRecommendation[];
  /** Compliance checklist */
  complianceChecklist: ComplianceItem[];
}

/**
 * AI analysis for thin cap
 */
export interface AIThinCapAnalysis {
  /** Executive summary */
  executiveSummary: string;
  /** Detailed analysis */
  detailedAnalysis: string;
  /** Key observations */
  keyObservations: string[];
  /** EBITDA optimization analysis */
  ebitdaOptimization: EBITDAOptimizationAnalysis;
  /** Interest structure analysis */
  interestStructureAnalysis: InterestStructureAnalysis;
  /** Carryforward strategy */
  carryforwardStrategy: CarryforwardStrategy;
}

/**
 * EBITDA optimization analysis
 */
export interface EBITDAOptimizationAnalysis {
  /** Current EBITDA */
  currentEBITDA: number;
  /** Current allowable interest */
  currentAllowable: number;
  /** Potential EBITDA improvements */
  potentialImprovements: EBITDAImprovement[];
  /** Impact on interest limitation */
  impactOnLimitation: number;
  /** Optimization strategies */
  strategies: string[];
}

/**
 * EBITDA improvement opportunity
 */
export interface EBITDAImprovement {
  /** Description */
  description: string;
  /** Potential increase in EBITDA */
  potentialIncrease: number;
  /** Additional allowable interest */
  additionalAllowableInterest: number;
  /** Implementation complexity */
  complexity: "low" | "medium" | "high";
  /** Feasibility */
  feasibility: string;
}

/**
 * Interest structure analysis
 */
export interface InterestStructureAnalysis {
  /** Current structure summary */
  currentStructureSummary: string;
  /** Covered vs uncovered breakdown */
  coverageBreakdown: {
    covered: number;
    uncovered: number;
    percentageCovered: number;
  };
  /** Restructuring opportunities */
  restructuringOpportunities: RestructuringOpportunity[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Restructuring opportunity
 */
export interface RestructuringOpportunity {
  /** Description */
  description: string;
  /** Potential benefit */
  potentialBenefit: number;
  /** Implementation steps */
  implementationSteps: string[];
  /** Risks */
  risks: string[];
  /** Timeline */
  timeline: string;
}

/**
 * Carryforward strategy
 */
export interface CarryforwardStrategy {
  /** Current carryforward balance */
  currentBalance: number;
  /** Utilization projection */
  utilizationProjection: UtilizationProjection[];
  /** Expiry risk */
  expiryRisk: ExpiryRisk;
  /** Optimization recommendations */
  optimizationRecommendations: string[];
}

/**
 * Utilization projection
 */
export interface UtilizationProjection {
  /** Year */
  year: string;
  /** Opening balance */
  openingBalance: number;
  /** Projected EBITDA */
  projectedEBITDA: number;
  /** Projected utilization */
  projectedUtilization: number;
  /** Closing balance */
  closingBalance: number;
}

/**
 * Expiry risk
 */
export interface ExpiryRisk {
  /** Amount at risk of expiry */
  amountAtRisk: number;
  /** Years to expiry */
  yearsToExpiry: number;
  /** Risk level */
  riskLevel: "low" | "medium" | "high";
  /** Mitigation suggestions */
  mitigationSuggestions: string[];
}

/**
 * Optimization opportunity
 */
export interface OptimizationOpportunity {
  /** Opportunity name */
  name: string;
  /** Description */
  description: string;
  /** Potential tax savings */
  potentialTaxSavings: number;
  /** Implementation effort */
  effort: "low" | "medium" | "high";
  /** Priority */
  priority: "critical" | "high" | "medium" | "low";
  /** Implementation steps */
  implementationSteps: string[];
  /** Time to implement */
  timeToImplement: string;
}

/**
 * Risk assessment
 */
export interface ThinCapRiskAssessment {
  /** Overall risk score (0-100) */
  overallRiskScore: number;
  /** Risk level */
  riskLevel: "low" | "medium" | "high" | "critical";
  /** Risk factors */
  riskFactors: RiskFactor[];
  /** Compliance risks */
  complianceRisks: ComplianceRisk[];
  /** Mitigation strategies */
  mitigationStrategies: string[];
}

/**
 * Risk factor
 */
export interface RiskFactor {
  /** Factor name */
  factor: string;
  /** Description */
  description: string;
  /** Severity (1-10) */
  severity: number;
  /** Likelihood */
  likelihood: "low" | "medium" | "high";
}

/**
 * Compliance risk
 */
export interface ComplianceRisk {
  /** Risk description */
  risk: string;
  /** Impact if materialized */
  impact: string;
  /** Mitigation */
  mitigation: string;
}

/**
 * Tax planning recommendation
 */
export interface TaxPlanningRecommendation {
  /** Recommendation */
  recommendation: string;
  /** Category */
  category: "structure" | "timing" | "documentation" | "alternative";
  /** Potential benefit */
  potentialBenefit: number;
  /** Complexity */
  complexity: "low" | "medium" | "high";
  /** Legal basis */
  legalBasis: string;
  /** Implementation steps */
  implementationSteps: string[];
}

/**
 * Compliance item
 */
export interface ComplianceItem {
  /** Item description */
  item: string;
  /** Category */
  category: string;
  /** Status */
  status: "pending" | "completed" | "not_applicable";
  /** Priority */
  priority: "high" | "medium" | "low";
  /** Due date if applicable */
  dueDate?: Date;
}

/**
 * Multi-year projection
 */
export interface MultiYearProjection {
  /** Projection years */
  years: YearProjection[];
  /** Total disallowance over period */
  totalDisallowance: number;
  /** Total carryforward utilization */
  totalCarryforwardUtilization: number;
  /** Net tax impact */
  netTaxImpact: number;
  /** Recommendations */
  recommendations: string[];
}

/**
 * Year projection
 */
export interface YearProjection {
  /** Year */
  year: string;
  /** Projected EBITDA */
  projectedEBITDA: number;
  /** Projected interest */
  projectedInterest: number;
  /** Allowable interest */
  allowableInterest: number;
  /** Disallowance */
  disallowance: number;
  /** Carryforward opening */
  carryforwardOpening: number;
  /** Carryforward utilization */
  carryforwardUtilization: number;
  /** Carryforward closing */
  carryforwardClosing: number;
}

// =============================================================================
// THIN CAP AI SERVICE CLASS
// =============================================================================

/**
 * AI-enhanced service for thin capitalization analysis
 */
export class ThinCapAIService {
  private engine: ThinCapitalizationEngine;

  constructor(assessmentYear: string = "2025-26") {
    this.engine = createThinCapEngine(assessmentYear);
  }

  /**
   * Perform enhanced thin cap analysis
   */
  async analyzeThinCap(input: ThinCapInput): Promise<EnhancedThinCapResult> {
    // Get base calculation
    const baseResult = this.engine.calculateInterestLimitation(input);

    // Generate AI analysis
    const aiAnalysis = this.generateAIAnalysis(input, baseResult);

    // Identify optimization opportunities
    const optimizationOpportunities = this.identifyOptimizationOpportunities(
      input,
      baseResult
    );

    // Assess risks
    const riskAssessment = this.assessRisks(input, baseResult);

    // Generate tax planning recommendations
    const taxPlanningRecommendations = this.generateTaxPlanningRecommendations(
      input,
      baseResult
    );

    // Generate compliance checklist
    const complianceChecklist = this.generateComplianceChecklist(
      input,
      baseResult
    );

    return {
      ...baseResult,
      aiAnalysis,
      optimizationOpportunities,
      riskAssessment,
      taxPlanningRecommendations,
      complianceChecklist,
    };
  }

  /**
   * Generate multi-year projection
   */
  async generateMultiYearProjection(
    baseInput: ThinCapInput,
    projectionYears: number,
    growthAssumptions: GrowthAssumptions
  ): Promise<MultiYearProjection> {
    const years: YearProjection[] = [];
    let carryforwardBalance = baseInput.carryforwardHistory?.reduce(
      (sum, c) => sum + c.remainingBalance,
      0
    ) || 0;

    const baseYear = parseInt(baseInput.assessmentYear.split("-")[0]);

    for (let i = 0; i < projectionYears; i++) {
      const year = `${baseYear + i}-${(baseYear + i + 1).toString().slice(-2)}`;

      // Project EBITDA and interest
      const projectedEBITDA =
        baseInput.financials.profitBeforeTax *
        (1 + growthAssumptions.ebitdaGrowthRate) ** i;

      const projectedInterest =
        baseInput.interestExpenses.reduce((sum, e) => sum + e.interestAmount, 0) *
        (1 + growthAssumptions.interestGrowthRate) ** i;

      const allowable = projectedEBITDA * (EBITDA_LIMITATION_PERCENTAGE / 100);
      const disallowance = Math.max(0, projectedInterest - allowable);

      // Calculate carryforward utilization
      const headroom = Math.max(0, allowable - projectedInterest);
      const utilization = Math.min(carryforwardBalance, headroom);

      const carryforwardOpening = carryforwardBalance;
      carryforwardBalance = carryforwardBalance - utilization + disallowance;
      const carryforwardClosing = carryforwardBalance;

      years.push({
        year,
        projectedEBITDA,
        projectedInterest,
        allowableInterest: allowable,
        disallowance,
        carryforwardOpening,
        carryforwardUtilization: utilization,
        carryforwardClosing,
      });
    }

    const totalDisallowance = years.reduce((sum, y) => sum + y.disallowance, 0);
    const totalUtilization = years.reduce(
      (sum, y) => sum + y.carryforwardUtilization,
      0
    );
    const taxRate = 0.30; // Assumed corporate tax rate
    const netTaxImpact = (totalDisallowance - totalUtilization) * taxRate;

    return {
      years,
      totalDisallowance,
      totalCarryforwardUtilization: totalUtilization,
      netTaxImpact,
      recommendations: this.generateProjectionRecommendations(years),
    };
  }

  /**
   * Compare financing alternatives
   */
  async compareFinancingAlternatives(
    currentStructure: ThinCapInput,
    alternatives: FinancingAlternative[]
  ): Promise<FinancingComparison> {
    const currentResult = this.engine.calculateInterestLimitation(currentStructure);

    const alternativeResults = alternatives.map((alt) => {
      const modifiedInput = this.applyAlternativeStructure(currentStructure, alt);
      const result = this.engine.calculateInterestLimitation(modifiedInput);
      return {
        name: alt.name,
        result,
        savings: currentResult.disallowedInterest - result.disallowedInterest,
      };
    });

    const bestAlternative = alternativeResults.reduce((best, current) =>
      current.savings > (best?.savings || 0) ? current : best
    );

    return {
      currentDisallowance: currentResult.disallowedInterest,
      alternatives: alternativeResults.map((a) => ({
        name: a.name,
        disallowance: a.result.disallowedInterest,
        savings: a.savings,
        percentageSavings:
          currentResult.disallowedInterest > 0
            ? (a.savings / currentResult.disallowedInterest) * 100
            : 0,
      })),
      recommendedAlternative: bestAlternative?.name || "Current structure",
      recommendation: this.generateFinancingRecommendation(
        currentResult,
        alternativeResults
      ),
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateAIAnalysis(
    input: ThinCapInput,
    result: ThinCapResult
  ): AIThinCapAnalysis {
    return {
      executiveSummary: this.generateExecutiveSummary(input, result),
      detailedAnalysis: this.generateDetailedAnalysis(input, result),
      keyObservations: this.identifyKeyObservations(input, result),
      ebitdaOptimization: this.analyzeEBITDAOptimization(input, result),
      interestStructureAnalysis: this.analyzeInterestStructure(input, result),
      carryforwardStrategy: this.developCarryforwardStrategy(input, result),
    };
  }

  private generateExecutiveSummary(
    input: ThinCapInput,
    result: ThinCapResult
  ): string {
    if (!result.isApplicable) {
      return (
        `Section 94B Analysis for AY ${input.assessmentYear}\n\n` +
        `Status: NOT APPLICABLE\n` +
        `Reason: ${result.nonApplicabilityReason}\n\n` +
        `Full interest deduction of Rs. ${this.formatCurrency(input.financials.totalInterestExpense)} is available.`
      );
    }

    const disallowanceRate =
      result.interestAnalysis.interestCoveredUnder94B > 0
        ? (result.disallowedInterest / result.interestAnalysis.interestCoveredUnder94B) * 100
        : 0;

    return (
      `Section 94B Analysis for AY ${input.assessmentYear}\n\n` +
      `Status: APPLICABLE\n\n` +
      `Key Metrics:\n` +
      `- EBITDA: Rs. ${this.formatCurrency(result.ebitdaResult.totalEBITDA)}\n` +
      `- 30% of EBITDA (Limit): Rs. ${this.formatCurrency(result.ebitdaResult.thirtyPercentEBITDA)}\n` +
      `- Interest to NR AE: Rs. ${this.formatCurrency(result.interestAnalysis.interestCoveredUnder94B)}\n` +
      `- Disallowed Interest: Rs. ${this.formatCurrency(result.disallowedInterest)} (${disallowanceRate.toFixed(1)}% of covered interest)\n\n` +
      `Impact: Interest disallowance of Rs. ${this.formatCurrency(result.disallowedInterest)} will increase taxable income. ` +
      `At 30% tax rate, additional tax of Rs. ${this.formatCurrency(result.disallowedInterest * 0.3)}.`
    );
  }

  private generateDetailedAnalysis(
    input: ThinCapInput,
    result: ThinCapResult
  ): string {
    const sections: string[] = [];

    // Section 1: Background
    sections.push(
      "BACKGROUND\n" +
      getSection94BDescription()
    );

    // Section 2: EBITDA Analysis
    sections.push(
      "EBITDA ANALYSIS\n" +
      `Profit Before Tax: Rs. ${this.formatCurrency(result.ebitdaResult.profitBeforeTax)}\n` +
      `Add: Interest Expense: Rs. ${this.formatCurrency(result.ebitdaResult.interestAddBack)}\n` +
      `Add: Depreciation: Rs. ${this.formatCurrency(result.ebitdaResult.depreciationAddBack)}\n` +
      `Add: Amortization: Rs. ${this.formatCurrency(result.ebitdaResult.amortizationAddBack)}\n` +
      `EBITDA: Rs. ${this.formatCurrency(result.ebitdaResult.totalEBITDA)}\n` +
      `30% of EBITDA: Rs. ${this.formatCurrency(result.ebitdaResult.thirtyPercentEBITDA)}`
    );

    // Section 3: Interest Analysis
    sections.push(
      "INTEREST ANALYSIS\n" +
      `Total Interest Expense: Rs. ${this.formatCurrency(result.interestAnalysis.totalInterestExpense)}\n` +
      `Interest Covered under 94B: Rs. ${this.formatCurrency(result.interestAnalysis.interestCoveredUnder94B)}\n` +
      `Interest Not Covered: Rs. ${this.formatCurrency(result.interestAnalysis.interestNotCovered)}`
    );

    // Section 4: Limitation Calculation
    sections.push(
      "LIMITATION CALCULATION\n" +
      `Allowable Interest: Rs. ${this.formatCurrency(result.allowableInterest)}\n` +
      `Disallowed Interest: Rs. ${this.formatCurrency(result.disallowedInterest)}`
    );

    // Section 5: Carryforward
    if (result.carryforwardResult.closingBalance > 0) {
      sections.push(
        "CARRYFORWARD ANALYSIS\n" +
        `Opening Balance: Rs. ${this.formatCurrency(result.carryforwardResult.openingBalance)}\n` +
        `Current Year Disallowance: Rs. ${this.formatCurrency(result.carryforwardResult.currentYearDisallowance)}\n` +
        `Utilized in Current Year: Rs. ${this.formatCurrency(result.carryforwardResult.utilizationInCurrentYear)}\n` +
        `Expired in Current Year: Rs. ${this.formatCurrency(result.carryforwardResult.expiredInCurrentYear)}\n` +
        `Closing Balance: Rs. ${this.formatCurrency(result.carryforwardResult.closingBalance)}`
      );
    }

    return sections.join("\n\n");
  }

  private identifyKeyObservations(
    input: ThinCapInput,
    result: ThinCapResult
  ): string[] {
    const observations: string[] = [];

    if (!result.isApplicable) {
      observations.push(result.nonApplicabilityReason || "Section 94B not applicable");
      return observations;
    }

    // EBITDA observations
    if (result.ebitdaResult.totalEBITDA < 0) {
      observations.push(
        "CRITICAL: Negative EBITDA results in zero allowable interest deduction"
      );
    }

    // Interest coverage ratio
    const coverageRatio =
      result.ebitdaResult.thirtyPercentEBITDA /
      result.interestAnalysis.interestCoveredUnder94B;
    if (coverageRatio < 0.5) {
      observations.push(
        "HIGH RISK: Interest significantly exceeds 30% EBITDA threshold"
      );
    } else if (coverageRatio < 1) {
      observations.push(
        "MODERATE RISK: Interest exceeds 30% EBITDA threshold"
      );
    }

    // Disallowance percentage
    const disallowancePercentage =
      (result.disallowedInterest / result.interestAnalysis.interestCoveredUnder94B) * 100;
    if (disallowancePercentage > 50) {
      observations.push(
        `Over ${disallowancePercentage.toFixed(0)}% of interest to NR AE is disallowed`
      );
    }

    // Carryforward observations
    if (result.carryforwardResult.expiredInCurrentYear > 0) {
      observations.push(
        `WARNING: Rs. ${this.formatCurrency(result.carryforwardResult.expiredInCurrentYear)} of carryforward expired unutilized`
      );
    }

    if (result.carryforwardResult.availableForFuture.some((c) => c.yearsRemaining <= 2)) {
      observations.push(
        "ATTENTION: Some carryforward amounts are expiring within 2 years"
      );
    }

    return observations;
  }

  private analyzeEBITDAOptimization(
    input: ThinCapInput,
    result: ThinCapResult
  ): EBITDAOptimizationAnalysis {
    const potentialImprovements: EBITDAImprovement[] = [];

    // Revenue enhancement
    if (input.financials.totalRevenue) {
      const revenueIncrease = input.financials.totalRevenue * 0.1;
      const additionalAllowable = revenueIncrease * (EBITDA_LIMITATION_PERCENTAGE / 100);
      potentialImprovements.push({
        description: "10% revenue growth",
        potentialIncrease: revenueIncrease,
        additionalAllowableInterest: additionalAllowable,
        complexity: "high",
        feasibility: "Depends on market conditions and business strategy",
      });
    }

    // Cost optimization
    if (input.financials.totalOperatingExpenses) {
      const costReduction = input.financials.totalOperatingExpenses * 0.05;
      const additionalAllowable = costReduction * (EBITDA_LIMITATION_PERCENTAGE / 100);
      potentialImprovements.push({
        description: "5% operating cost reduction",
        potentialIncrease: costReduction,
        additionalAllowableInterest: additionalAllowable,
        complexity: "medium",
        feasibility: "Achievable through operational efficiency improvements",
      });
    }

    return {
      currentEBITDA: result.ebitdaResult.totalEBITDA,
      currentAllowable: result.ebitdaResult.thirtyPercentEBITDA,
      potentialImprovements,
      impactOnLimitation: potentialImprovements.reduce(
        (sum, i) => sum + i.additionalAllowableInterest,
        0
      ),
      strategies: [
        "Focus on revenue growth to increase EBITDA base",
        "Optimize operating costs without compromising business",
        "Review depreciation policies for optimal add-back",
        "Consider timing of capital expenditure",
      ],
    };
  }

  private analyzeInterestStructure(
    input: ThinCapInput,
    result: ThinCapResult
  ): InterestStructureAnalysis {
    const restructuringOpportunities: RestructuringOpportunity[] = [];

    // Check for domestic borrowing opportunity
    const aeInterest = result.interestAnalysis.interestCoveredUnder94B;
    if (aeInterest > result.ebitdaResult.thirtyPercentEBITDA) {
      restructuringOpportunities.push({
        description: "Replace AE debt with domestic borrowing",
        potentialBenefit: Math.min(
          result.disallowedInterest,
          aeInterest - result.ebitdaResult.thirtyPercentEBITDA
        ),
        implementationSteps: [
          "Evaluate domestic lending options",
          "Negotiate terms with Indian banks",
          "Repay NR AE loans partially",
          "Document commercial rationale",
        ],
        risks: [
          "May have higher interest cost",
          "Currency mismatch if AE loan was in foreign currency",
          "Documentation requirements for loan restructuring",
        ],
        timeline: "6-12 months",
      });
    }

    // Equity conversion opportunity
    if (result.disallowedInterest > 0) {
      restructuringOpportunities.push({
        description: "Convert part of AE debt to equity",
        potentialBenefit: result.disallowedInterest * 0.5, // Assume 50% conversion
        implementationSteps: [
          "Evaluate debt-to-equity conversion",
          "Obtain RBI approvals if required",
          "Execute conversion documentation",
          "Update capital structure",
        ],
        risks: [
          "Thin cap rules on equity",
          "Dividend distribution considerations",
          "Valuation requirements",
        ],
        timeline: "3-6 months",
      });
    }

    return {
      currentStructureSummary:
        `Current interest structure: Rs. ${this.formatCurrency(result.interestAnalysis.totalInterestExpense)} total, ` +
        `of which Rs. ${this.formatCurrency(aeInterest)} (${((aeInterest / result.interestAnalysis.totalInterestExpense) * 100).toFixed(0)}%) is to NR AE`,
      coverageBreakdown: {
        covered: aeInterest,
        uncovered: result.interestAnalysis.interestNotCovered,
        percentageCovered:
          (aeInterest / result.interestAnalysis.totalInterestExpense) * 100,
      },
      restructuringOpportunities,
      recommendations: [
        "Review debt structure annually for optimization opportunities",
        "Consider mix of domestic and foreign currency borrowings",
        "Document arm's length nature of all intercompany loans",
        "Monitor EBITDA coverage ratio quarterly",
      ],
    };
  }

  private developCarryforwardStrategy(
    input: ThinCapInput,
    result: ThinCapResult
  ): CarryforwardStrategy {
    const currentBalance = result.carryforwardResult.closingBalance;

    // Simple 3-year projection
    const utilizationProjection: UtilizationProjection[] = [];
    let projectedBalance = currentBalance;

    for (let i = 1; i <= 3; i++) {
      const yearNum = parseInt(input.assessmentYear.split("-")[0]) + i;
      const year = `${yearNum}-${(yearNum + 1).toString().slice(-2)}`;

      // Assume 10% EBITDA growth
      const projectedEBITDA = result.ebitdaResult.totalEBITDA * 1.1 ** i;
      const allowable = projectedEBITDA * (EBITDA_LIMITATION_PERCENTAGE / 100);
      const currentInterest = result.interestAnalysis.interestCoveredUnder94B;
      const headroom = Math.max(0, allowable - currentInterest);
      const utilization = Math.min(projectedBalance, headroom);

      utilizationProjection.push({
        year,
        openingBalance: projectedBalance,
        projectedEBITDA,
        projectedUtilization: utilization,
        closingBalance: projectedBalance - utilization,
      });

      projectedBalance = projectedBalance - utilization;
    }

    // Assess expiry risk
    const expiringAmount = result.carryforwardResult.availableForFuture
      .filter((c) => c.yearsRemaining <= 3)
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      currentBalance,
      utilizationProjection,
      expiryRisk: {
        amountAtRisk: expiringAmount,
        yearsToExpiry: 3,
        riskLevel: expiringAmount > currentBalance * 0.3 ? "high" : "medium",
        mitigationSuggestions: [
          "Plan for EBITDA growth to create utilization headroom",
          "Consider interest rate negotiations to reduce current interest",
          "Evaluate partial debt prepayment options",
        ],
      },
      optimizationRecommendations: [
        "Prioritize utilization of oldest carryforward amounts (FIFO)",
        "Monitor EBITDA trends to project utilization capacity",
        "Consider business restructuring to accelerate utilization",
      ],
    };
  }

  private identifyOptimizationOpportunities(
    input: ThinCapInput,
    result: ThinCapResult
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    if (result.disallowedInterest > 0) {
      opportunities.push({
        name: "Interest Rate Renegotiation",
        description: "Negotiate lower interest rate with AE lender to reduce total interest cost",
        potentialTaxSavings: result.disallowedInterest * 0.1 * 0.3, // 10% rate reduction
        effort: "low",
        priority: "high",
        implementationSteps: [
          "Benchmark interest rates",
          "Prepare negotiation case",
          "Conduct arm's length analysis",
          "Execute amendment to loan agreement",
        ],
        timeToImplement: "1-2 months",
      });

      opportunities.push({
        name: "Partial Debt Repayment",
        description: "Prepay part of AE debt to bring interest within allowable limit",
        potentialTaxSavings: Math.min(
          result.disallowedInterest,
          result.disallowedInterest * 0.3
        ),
        effort: "medium",
        priority: "medium",
        implementationSteps: [
          "Identify funds for prepayment",
          "Calculate optimal prepayment amount",
          "Execute prepayment",
          "Update loan documentation",
        ],
        timeToImplement: "3-6 months",
      });
    }

    return opportunities;
  }

  private assessRisks(
    input: ThinCapInput,
    result: ThinCapResult
  ): ThinCapRiskAssessment {
    const riskFactors: RiskFactor[] = [];
    let totalScore = 0;

    // Disallowance risk
    if (result.disallowedInterest > 0) {
      const disallowanceRatio =
        result.disallowedInterest / result.interestAnalysis.interestCoveredUnder94B;
      riskFactors.push({
        factor: "Interest Disallowance",
        description: `${(disallowanceRatio * 100).toFixed(0)}% of AE interest is disallowed`,
        severity: disallowanceRatio > 0.5 ? 8 : 5,
        likelihood: "high",
      });
      totalScore += disallowanceRatio > 0.5 ? 30 : 20;
    }

    // EBITDA volatility risk
    riskFactors.push({
      factor: "EBITDA Volatility",
      description: "Year-to-year EBITDA fluctuations affect allowable interest",
      severity: 6,
      likelihood: "medium",
    });
    totalScore += 15;

    // Carryforward expiry risk
    if (result.carryforwardResult.availableForFuture.some((c) => c.yearsRemaining <= 2)) {
      riskFactors.push({
        factor: "Carryforward Expiry",
        description: "Some disallowed amounts approaching 8-year expiry",
        severity: 7,
        likelihood: "high",
      });
      totalScore += 20;
    }

    const complianceRisks: ComplianceRisk[] = [
      {
        risk: "Incorrect EBITDA computation",
        impact: "Higher disallowance, potential penalty",
        mitigation: "Maintain detailed workings and reconciliations",
      },
      {
        risk: "Misclassification of interest",
        impact: "Covered interest treated as uncovered or vice versa",
        mitigation: "Document lender relationships and loan terms carefully",
      },
    ];

    return {
      overallRiskScore: Math.min(100, totalScore),
      riskLevel: totalScore >= 60 ? "high" : totalScore >= 30 ? "medium" : "low",
      riskFactors,
      complianceRisks,
      mitigationStrategies: [
        "Regular monitoring of EBITDA coverage",
        "Proactive debt restructuring",
        "Maintain contemporaneous documentation",
        "Annual Section 94B review",
      ],
    };
  }

  private generateTaxPlanningRecommendations(
    input: ThinCapInput,
    result: ThinCapResult
  ): TaxPlanningRecommendation[] {
    const recommendations: TaxPlanningRecommendation[] = [];

    if (result.disallowedInterest > 0) {
      recommendations.push({
        recommendation: "Consider equity infusion instead of debt",
        category: "structure",
        potentialBenefit: result.disallowedInterest * 0.3,
        complexity: "medium",
        legalBasis: "Section 94B applies only to interest expense",
        implementationSteps: [
          "Evaluate optimal debt-equity ratio",
          "Assess dividend distribution tax implications",
          "Prepare share subscription documentation",
          "Obtain necessary approvals",
        ],
      });

      recommendations.push({
        recommendation: "Optimize timing of capital expenditure",
        category: "timing",
        potentialBenefit: result.disallowedInterest * 0.1,
        complexity: "low",
        legalBasis: "Depreciation adds back to EBITDA",
        implementationSteps: [
          "Review capex plan",
          "Assess impact on EBITDA",
          "Time acquisitions strategically",
          "Monitor EBITDA projections",
        ],
      });
    }

    return recommendations;
  }

  private generateComplianceChecklist(
    input: ThinCapInput,
    result: ThinCapResult
  ): ComplianceItem[] {
    return [
      {
        item: "Calculate EBITDA as per Section 94B methodology",
        category: "Computation",
        status: "completed",
        priority: "high",
      },
      {
        item: "Identify all interest covered under Section 94B",
        category: "Analysis",
        status: "completed",
        priority: "high",
      },
      {
        item: "Maintain documentation of lender relationships",
        category: "Documentation",
        status: "pending",
        priority: "high",
      },
      {
        item: "Track carryforward of disallowed interest",
        category: "Tracking",
        status: result.carryforwardResult.closingBalance > 0 ? "pending" : "not_applicable",
        priority: "high",
      },
      {
        item: "Review exemption applicability",
        category: "Analysis",
        status: "completed",
        priority: "medium",
      },
      {
        item: "Update Form 3CEB disclosure",
        category: "Filing",
        status: "pending",
        priority: "high",
      },
    ];
  }

  private generateProjectionRecommendations(years: YearProjection[]): string[] {
    const recommendations: string[] = [];

    const totalDisallowance = years.reduce((sum, y) => sum + y.disallowance, 0);
    if (totalDisallowance > 0) {
      recommendations.push(
        "Consider debt restructuring to reduce projected disallowance"
      );
    }

    const peakDisallowanceYear = years.reduce((max, y) =>
      y.disallowance > (max?.disallowance || 0) ? y : max
    );
    if (peakDisallowanceYear.disallowance > 0) {
      recommendations.push(
        `Year ${peakDisallowanceYear.year} shows peak disallowance - plan for EBITDA enhancement`
      );
    }

    return recommendations;
  }

  private applyAlternativeStructure(
    input: ThinCapInput,
    alternative: FinancingAlternative
  ): ThinCapInput {
    // Apply alternative structure modifications
    const modifiedExpenses = input.interestExpenses.map((exp) => ({
      ...exp,
      interestAmount: exp.interestAmount * (1 - alternative.debtReductionPercentage / 100),
    }));

    return {
      ...input,
      interestExpenses: modifiedExpenses,
    };
  }

  private generateFinancingRecommendation(
    currentResult: ThinCapResult,
    alternatives: { name: string; result: ThinCapResult; savings: number }[]
  ): string {
    if (currentResult.disallowedInterest === 0) {
      return "Current structure is optimal - no disallowance under Section 94B.";
    }

    const bestAlt = alternatives.reduce((best, current) =>
      current.savings > (best?.savings || 0) ? current : best
    );

    if (bestAlt && bestAlt.savings > 0) {
      return (
        `Consider ${bestAlt.name} to reduce disallowance by ` +
        `Rs. ${this.formatCurrency(bestAlt.savings)} (` +
        `${((bestAlt.savings / currentResult.disallowedInterest) * 100).toFixed(0)}% reduction)`
      );
    }

    return "Current structure appears optimal among evaluated alternatives.";
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN").format(Math.round(amount));
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface GrowthAssumptions {
  ebitdaGrowthRate: number;
  interestGrowthRate: number;
}

interface FinancingAlternative {
  name: string;
  debtReductionPercentage: number;
  description: string;
}

interface FinancingComparison {
  currentDisallowance: number;
  alternatives: {
    name: string;
    disallowance: number;
    savings: number;
    percentageSavings: number;
  }[];
  recommendedAlternative: string;
  recommendation: string;
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new ThinCapAIService instance
 */
export function createThinCapAIService(
  assessmentYear: string = "2025-26"
): ThinCapAIService {
  return new ThinCapAIService(assessmentYear);
}

/**
 * Get singleton instance
 */
let _thinCapAIServiceInstance: ThinCapAIService | null = null;

export function getThinCapAIService(
  assessmentYear: string = "2025-26"
): ThinCapAIService {
  if (!_thinCapAIServiceInstance) {
    _thinCapAIServiceInstance = createThinCapAIService(assessmentYear);
  }
  return _thinCapAIServiceInstance;
}
