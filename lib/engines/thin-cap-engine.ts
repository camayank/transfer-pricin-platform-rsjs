/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Thin Capitalization Engine (Section 94B)
 *
 * Implements interest limitation calculations under Section 94B of
 * Income Tax Act, 1961. Effective from AY 2018-19.
 *
 * Key Features:
 * - EBITDA calculation and validation
 * - Interest limitation (30% of EBITDA)
 * - Carryforward tracking (8 years)
 * - Exemption checking for banks, insurance, NBFCs
 * ================================================================================
 */

import {
  INTEREST_THRESHOLD,
  EBITDA_LIMITATION_PERCENTAGE,
  CARRYFORWARD_YEARS,
  Section94BEntityType,
  LenderType,
  EXEMPT_ENTITIES,
  COVERED_INTEREST_TYPES,
  CARRYFORWARD_RULES,
  EBITDAComponents,
  isExemptEntity,
  isInterestCovered,
  calculateAllowableInterest,
  calculateDisallowedInterest,
  isSection94BApplicable,
  calculateEBITDA,
  getAYThinCapRules,
  getCarryforwardExpiryYear,
  isCarryforwardValid,
  getSection94BDescription,
} from "./constants/thin-cap-rules";

import { ValidationSeverity } from "./types";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Input for thin capitalization calculation
 */
export interface ThinCapInput {
  /** Assessment year */
  assessmentYear: string;
  /** Entity type */
  entityType: Section94BEntityType;
  /** Entity code for exemption check */
  entityCode?: string;
  /** Financial data for EBITDA calculation */
  financials: FinancialData;
  /** Interest expenses */
  interestExpenses: InterestExpense[];
  /** Carryforward from previous years */
  carryforwardHistory?: CarryforwardEntry[];
}

/**
 * Financial data for EBITDA calculation
 */
export interface FinancialData {
  /** Profit before tax as per P&L */
  profitBeforeTax: number;
  /** Total interest expense */
  totalInterestExpense: number;
  /** Depreciation as per books */
  depreciation: number;
  /** Amortization as per books */
  amortization: number;
  /** Interest income (if any) */
  interestIncome?: number;
  /** Exceptional items (gains negative, losses positive) */
  exceptionalItems?: number;
  /** Total revenue */
  totalRevenue?: number;
  /** Total operating expenses */
  totalOperatingExpenses?: number;
}

/**
 * Individual interest expense
 */
export interface InterestExpense {
  /** Lender name */
  lenderName: string;
  /** Lender type */
  lenderType: LenderType;
  /** Country of lender */
  lenderCountry: string;
  /** Interest type */
  interestType: string;
  /** Principal amount */
  principalAmount: number;
  /** Interest rate */
  interestRate: number;
  /** Interest amount */
  interestAmount: number;
  /** Is lender an AE */
  isAE: boolean;
  /** AE relationship details */
  aeRelationship?: string;
  /** Is guaranteed by AE */
  isGuaranteedByAE?: boolean;
  /** Is funded by AE deposits */
  isFundedByAEDeposit?: boolean;
}

/**
 * Carryforward entry from previous year
 */
export interface CarryforwardEntry {
  /** Original disallowance year */
  disallowanceYear: string;
  /** Original disallowed amount */
  originalAmount: number;
  /** Amount utilized in subsequent years */
  amountUtilized: number;
  /** Remaining balance */
  remainingBalance: number;
  /** Expiry year */
  expiryYear: string;
}

/**
 * Result of thin capitalization calculation
 */
export interface ThinCapResult {
  /** Whether Section 94B is applicable */
  isApplicable: boolean;
  /** Reason if not applicable */
  nonApplicabilityReason?: string;
  /** Assessment year */
  assessmentYear: string;
  /** EBITDA calculation */
  ebitdaResult: EBITDAResult;
  /** Interest analysis */
  interestAnalysis: InterestAnalysis;
  /** Allowable interest */
  allowableInterest: number;
  /** Disallowed interest */
  disallowedInterest: number;
  /** Carryforward analysis */
  carryforwardResult: CarryforwardResult;
  /** Computation steps */
  computationSteps: ComputationStep[];
  /** Validation issues */
  validationIssues: ThinCapValidationIssue[];
  /** Summary narrative */
  summary: string;
}

/**
 * EBITDA calculation result
 */
export interface EBITDAResult {
  /** Profit before tax */
  profitBeforeTax: number;
  /** Interest expense added back */
  interestAddBack: number;
  /** Depreciation added back */
  depreciationAddBack: number;
  /** Amortization added back */
  amortizationAddBack: number;
  /** Adjustments */
  adjustments: number;
  /** Total EBITDA */
  totalEBITDA: number;
  /** 30% of EBITDA */
  thirtyPercentEBITDA: number;
  /** Computation details */
  computation: ComputationStep[];
}

/**
 * Interest analysis result
 */
export interface InterestAnalysis {
  /** Total interest expense */
  totalInterestExpense: number;
  /** Interest to non-resident AE */
  interestToNonResidentAE: number;
  /** Interest covered under 94B */
  interestCoveredUnder94B: number;
  /** Interest not covered */
  interestNotCovered: number;
  /** Breakdown by lender */
  lenderWiseBreakdown: LenderInterestBreakdown[];
  /** Threshold check */
  thresholdCheck: {
    threshold: number;
    interestAmount: number;
    exceedsThreshold: boolean;
  };
}

/**
 * Lender-wise interest breakdown
 */
export interface LenderInterestBreakdown {
  /** Lender name */
  lenderName: string;
  /** Lender type */
  lenderType: LenderType;
  /** Interest amount */
  interestAmount: number;
  /** Is covered under 94B */
  isCoveredUnder94B: boolean;
  /** Reason if not covered */
  reasonIfNotCovered?: string;
}

/**
 * Carryforward calculation result
 */
export interface CarryforwardResult {
  /** Opening balance */
  openingBalance: number;
  /** Current year disallowance */
  currentYearDisallowance: number;
  /** Utilization in current year */
  utilizationInCurrentYear: number;
  /** Expired in current year */
  expiredInCurrentYear: number;
  /** Closing balance */
  closingBalance: number;
  /** Year-wise details */
  yearWiseDetails: CarryforwardYearDetail[];
  /** Available for future years */
  availableForFuture: CarryforwardFuture[];
}

/**
 * Carryforward year detail
 */
export interface CarryforwardYearDetail {
  /** Disallowance year */
  year: string;
  /** Opening */
  opening: number;
  /** Utilized */
  utilized: number;
  /** Expired */
  expired: number;
  /** Closing */
  closing: number;
  /** Expiry year */
  expiryYear: string;
}

/**
 * Carryforward available for future
 */
export interface CarryforwardFuture {
  /** Year of original disallowance */
  disallowanceYear: string;
  /** Amount available */
  amount: number;
  /** Expiry year */
  expiryYear: string;
  /** Years remaining */
  yearsRemaining: number;
}

/**
 * Computation step
 */
export interface ComputationStep {
  /** Step number */
  step: number;
  /** Description */
  description: string;
  /** Formula */
  formula: string;
  /** Value */
  value: number | string;
  /** Reference */
  reference?: string;
}

/**
 * Validation issue
 */
export interface ThinCapValidationIssue {
  /** Field */
  field: string;
  /** Message */
  message: string;
  /** Severity */
  severity: ValidationSeverity;
  /** Code */
  code: string;
  /** Suggestion */
  suggestion?: string;
}

/**
 * Exemption check result
 */
export interface ExemptionResult {
  /** Is exempt */
  isExempt: boolean;
  /** Exemption category */
  exemptionCategory?: string;
  /** Section/notification reference */
  reference?: string;
  /** Conditions to be met */
  conditionsToMeet?: string[];
}

// =============================================================================
// THIN CAPITALIZATION ENGINE CLASS
// =============================================================================

/**
 * Main engine for thin capitalization calculations
 */
export class ThinCapitalizationEngine {
  private assessmentYear: string;

  constructor(assessmentYear: string = "2025-26") {
    this.assessmentYear = assessmentYear;
  }

  /**
   * Calculate interest limitation under Section 94B
   */
  calculateInterestLimitation(input: ThinCapInput): ThinCapResult {
    const validationIssues = this.validateInput(input);
    const computationSteps: ComputationStep[] = [];

    // Step 1: Check exemptions
    const exemptionCheck = this.checkExemptions(input);
    if (exemptionCheck.isExempt) {
      return this.createExemptResult(input, exemptionCheck, validationIssues);
    }

    // Step 2: Calculate interest covered under 94B
    const interestAnalysis = this.analyzeInterest(input);
    computationSteps.push({
      step: 1,
      description: "Total interest to non-resident AE",
      formula: "Sum of interest to non-resident AE/guaranteed lenders",
      value: interestAnalysis.interestCoveredUnder94B,
      reference: "Section 94B(1)",
    });

    // Step 3: Check threshold
    if (!interestAnalysis.thresholdCheck.exceedsThreshold) {
      return this.createBelowThresholdResult(
        input,
        interestAnalysis,
        computationSteps,
        validationIssues
      );
    }

    // Step 4: Calculate EBITDA
    const ebitdaResult = this.calculateEBITDA(input.financials);
    computationSteps.push({
      step: 2,
      description: "EBITDA calculation",
      formula: "PBT + Interest + Depreciation + Amortization",
      value: ebitdaResult.totalEBITDA,
      reference: "Section 94B(2)",
    });

    computationSteps.push({
      step: 3,
      description: "30% of EBITDA",
      formula: "EBITDA × 30%",
      value: ebitdaResult.thirtyPercentEBITDA,
      reference: "Section 94B(1)",
    });

    // Step 5: Calculate allowable and disallowed interest
    const allowableInterest = Math.min(
      ebitdaResult.thirtyPercentEBITDA,
      interestAnalysis.interestCoveredUnder94B
    );

    const disallowedInterest = calculateDisallowedInterest(
      interestAnalysis.interestCoveredUnder94B,
      allowableInterest
    );

    computationSteps.push({
      step: 4,
      description: "Allowable interest (lower of 30% EBITDA or actual)",
      formula: `MIN(${ebitdaResult.thirtyPercentEBITDA}, ${interestAnalysis.interestCoveredUnder94B})`,
      value: allowableInterest,
    });

    computationSteps.push({
      step: 5,
      description: "Disallowed interest",
      formula: "Interest covered - Allowable",
      value: disallowedInterest,
    });

    // Step 6: Calculate carryforward
    const carryforwardResult = this.trackCarryforward(
      input.carryforwardHistory || [],
      disallowedInterest,
      ebitdaResult.thirtyPercentEBITDA,
      input.assessmentYear
    );

    // Generate summary
    const summary = this.generateSummary(
      input,
      ebitdaResult,
      interestAnalysis,
      allowableInterest,
      disallowedInterest,
      carryforwardResult
    );

    return {
      isApplicable: true,
      assessmentYear: input.assessmentYear,
      ebitdaResult,
      interestAnalysis,
      allowableInterest,
      disallowedInterest,
      carryforwardResult,
      computationSteps,
      validationIssues,
      summary,
    };
  }

  /**
   * Calculate EBITDA from financial data
   */
  calculateEBITDA(financials: FinancialData): EBITDAResult {
    const computation: ComputationStep[] = [];

    computation.push({
      step: 1,
      description: "Profit Before Tax",
      formula: "As per P&L",
      value: financials.profitBeforeTax,
    });

    computation.push({
      step: 2,
      description: "Add: Interest Expense",
      formula: "Interest claimed as deduction",
      value: financials.totalInterestExpense,
    });

    computation.push({
      step: 3,
      description: "Add: Depreciation",
      formula: "As per books",
      value: financials.depreciation,
    });

    computation.push({
      step: 4,
      description: "Add: Amortization",
      formula: "As per books",
      value: financials.amortization,
    });

    const adjustments = financials.exceptionalItems || 0;
    if (adjustments !== 0) {
      computation.push({
        step: 5,
        description: "Adjustments for exceptional items",
        formula: "As applicable",
        value: adjustments,
      });
    }

    const totalEBITDA =
      financials.profitBeforeTax +
      financials.totalInterestExpense +
      financials.depreciation +
      financials.amortization -
      adjustments;

    const thirtyPercentEBITDA = calculateAllowableInterest(totalEBITDA);

    computation.push({
      step: 6,
      description: "Total EBITDA",
      formula: "Sum of above",
      value: totalEBITDA,
    });

    return {
      profitBeforeTax: financials.profitBeforeTax,
      interestAddBack: financials.totalInterestExpense,
      depreciationAddBack: financials.depreciation,
      amortizationAddBack: financials.amortization,
      adjustments,
      totalEBITDA,
      thirtyPercentEBITDA,
      computation,
    };
  }

  /**
   * Track carryforward of disallowed interest
   */
  trackCarryforward(
    history: CarryforwardEntry[],
    currentDisallowance: number,
    availableHeadroom: number,
    currentYear: string
  ): CarryforwardResult {
    const yearWiseDetails: CarryforwardYearDetail[] = [];
    let totalOpening = 0;
    let totalUtilized = 0;
    let totalExpired = 0;

    // Calculate headroom available for utilizing brought forward
    let remainingHeadroom = Math.max(0, availableHeadroom - currentDisallowance);

    // Process each carryforward entry
    const sortedHistory = [...history].sort((a, b) =>
      a.disallowanceYear.localeCompare(b.disallowanceYear)
    );

    for (const entry of sortedHistory) {
      const isValid = isCarryforwardValid(entry.disallowanceYear, currentYear);
      const opening = entry.remainingBalance;
      totalOpening += opening;

      let utilized = 0;
      let expired = 0;
      let closing = opening;

      if (!isValid) {
        // Expired
        expired = opening;
        closing = 0;
        totalExpired += expired;
      } else if (remainingHeadroom > 0) {
        // Can utilize
        utilized = Math.min(opening, remainingHeadroom);
        remainingHeadroom -= utilized;
        closing = opening - utilized;
        totalUtilized += utilized;
      }

      yearWiseDetails.push({
        year: entry.disallowanceYear,
        opening,
        utilized,
        expired,
        closing,
        expiryYear: entry.expiryYear,
      });
    }

    // Add current year disallowance
    if (currentDisallowance > 0) {
      yearWiseDetails.push({
        year: currentYear,
        opening: 0,
        utilized: 0,
        expired: 0,
        closing: currentDisallowance,
        expiryYear: getCarryforwardExpiryYear(currentYear),
      });
    }

    // Calculate available for future
    const availableForFuture: CarryforwardFuture[] = yearWiseDetails
      .filter((y) => y.closing > 0)
      .map((y) => ({
        disallowanceYear: y.year,
        amount: y.closing,
        expiryYear: y.expiryYear,
        yearsRemaining: this.calculateYearsRemaining(y.expiryYear, currentYear),
      }));

    const closingBalance = yearWiseDetails.reduce(
      (sum, y) => sum + y.closing,
      0
    );

    return {
      openingBalance: totalOpening,
      currentYearDisallowance: currentDisallowance,
      utilizationInCurrentYear: totalUtilized,
      expiredInCurrentYear: totalExpired,
      closingBalance,
      yearWiseDetails,
      availableForFuture,
    };
  }

  /**
   * Check if entity is exempt from Section 94B
   */
  checkExemptions(input: ThinCapInput): ExemptionResult {
    // Check based on entity code
    if (input.entityCode) {
      const exemptEntity = EXEMPT_ENTITIES.find(
        (e) => e.code === input.entityCode
      );
      if (exemptEntity) {
        return {
          isExempt: true,
          exemptionCategory: exemptEntity.description,
          reference: exemptEntity.section,
        };
      }
    }

    // No exemption found
    return { isExempt: false };
  }

  /**
   * Validate input data
   */
  validateSecondaryAdjustment(input: ThinCapInput): ThinCapValidationIssue[] {
    return this.validateInput(input);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private validateInput(input: ThinCapInput): ThinCapValidationIssue[] {
    const issues: ThinCapValidationIssue[] = [];

    // Validate assessment year
    if (!input.assessmentYear || !/^\d{4}-\d{2}$/.test(input.assessmentYear)) {
      issues.push({
        field: "assessmentYear",
        message: "Invalid assessment year format",
        severity: ValidationSeverity.ERROR,
        code: "TC001",
        suggestion: "Use format YYYY-YY (e.g., 2025-26)",
      });
    }

    // Check if AY is before 2018-19 (Section 94B not applicable)
    const ayYear = parseInt(input.assessmentYear?.split("-")[0] || "0");
    if (ayYear < 2018) {
      issues.push({
        field: "assessmentYear",
        message: "Section 94B not applicable before AY 2018-19",
        severity: ValidationSeverity.WARNING,
        code: "TC002",
      });
    }

    // Validate financials
    if (!input.financials) {
      issues.push({
        field: "financials",
        message: "Financial data is required for EBITDA calculation",
        severity: ValidationSeverity.CRITICAL,
        code: "TC003",
      });
    } else {
      if (input.financials.totalInterestExpense < 0) {
        issues.push({
          field: "totalInterestExpense",
          message: "Interest expense cannot be negative",
          severity: ValidationSeverity.ERROR,
          code: "TC004",
        });
      }

      if (input.financials.depreciation < 0) {
        issues.push({
          field: "depreciation",
          message: "Depreciation cannot be negative",
          severity: ValidationSeverity.ERROR,
          code: "TC005",
        });
      }
    }

    // Validate interest expenses
    if (!input.interestExpenses || input.interestExpenses.length === 0) {
      issues.push({
        field: "interestExpenses",
        message: "At least one interest expense entry is required",
        severity: ValidationSeverity.WARNING,
        code: "TC006",
      });
    }

    return issues;
  }

  private analyzeInterest(input: ThinCapInput): InterestAnalysis {
    const lenderWiseBreakdown: LenderInterestBreakdown[] = [];
    let totalInterestExpense = 0;
    let interestToNonResidentAE = 0;
    let interestCoveredUnder94B = 0;
    let interestNotCovered = 0;

    for (const expense of input.interestExpenses) {
      totalInterestExpense += expense.interestAmount;

      // Check if covered under Section 94B
      const isCovered =
        expense.isAE &&
        expense.lenderType !== LenderType.RESIDENT_NON_AE &&
        isInterestCovered(expense.interestType);

      if (isCovered) {
        interestToNonResidentAE += expense.interestAmount;
        interestCoveredUnder94B += expense.interestAmount;
      } else {
        interestNotCovered += expense.interestAmount;
      }

      lenderWiseBreakdown.push({
        lenderName: expense.lenderName,
        lenderType: expense.lenderType,
        interestAmount: expense.interestAmount,
        isCoveredUnder94B: isCovered,
        reasonIfNotCovered: !isCovered
          ? this.getNotCoveredReason(expense)
          : undefined,
      });
    }

    return {
      totalInterestExpense,
      interestToNonResidentAE,
      interestCoveredUnder94B,
      interestNotCovered,
      lenderWiseBreakdown,
      thresholdCheck: {
        threshold: INTEREST_THRESHOLD,
        interestAmount: interestCoveredUnder94B,
        exceedsThreshold: interestCoveredUnder94B > INTEREST_THRESHOLD,
      },
    };
  }

  private getNotCoveredReason(expense: InterestExpense): string {
    if (!expense.isAE) {
      return "Lender is not an Associated Enterprise";
    }
    if (expense.lenderType === LenderType.RESIDENT_NON_AE) {
      return "Lender is a resident non-AE party";
    }
    return "Interest type not covered under Section 94B";
  }

  private createExemptResult(
    input: ThinCapInput,
    exemption: ExemptionResult,
    validationIssues: ThinCapValidationIssue[]
  ): ThinCapResult {
    return {
      isApplicable: false,
      nonApplicabilityReason: `Entity is exempt from Section 94B - ${exemption.exemptionCategory}`,
      assessmentYear: input.assessmentYear,
      ebitdaResult: this.createEmptyEBITDAResult(),
      interestAnalysis: this.createEmptyInterestAnalysis(),
      allowableInterest: input.financials.totalInterestExpense,
      disallowedInterest: 0,
      carryforwardResult: this.createEmptyCarryforwardResult(),
      computationSteps: [],
      validationIssues,
      summary: `Section 94B is not applicable as the entity is exempt under ${exemption.reference || "applicable provisions"}. Full interest deduction is allowable.`,
    };
  }

  private createBelowThresholdResult(
    input: ThinCapInput,
    interestAnalysis: InterestAnalysis,
    computationSteps: ComputationStep[],
    validationIssues: ThinCapValidationIssue[]
  ): ThinCapResult {
    return {
      isApplicable: false,
      nonApplicabilityReason: `Interest to non-resident AE (Rs. ${this.formatCurrency(interestAnalysis.interestCoveredUnder94B)}) does not exceed threshold of Rs. 1 Crore`,
      assessmentYear: input.assessmentYear,
      ebitdaResult: this.createEmptyEBITDAResult(),
      interestAnalysis,
      allowableInterest: input.financials.totalInterestExpense,
      disallowedInterest: 0,
      carryforwardResult: this.createEmptyCarryforwardResult(),
      computationSteps,
      validationIssues,
      summary: `Section 94B is not applicable as interest to non-resident AE does not exceed Rs. 1 Crore threshold. Full interest deduction of Rs. ${this.formatCurrency(input.financials.totalInterestExpense)} is allowable.`,
    };
  }

  private createEmptyEBITDAResult(): EBITDAResult {
    return {
      profitBeforeTax: 0,
      interestAddBack: 0,
      depreciationAddBack: 0,
      amortizationAddBack: 0,
      adjustments: 0,
      totalEBITDA: 0,
      thirtyPercentEBITDA: 0,
      computation: [],
    };
  }

  private createEmptyInterestAnalysis(): InterestAnalysis {
    return {
      totalInterestExpense: 0,
      interestToNonResidentAE: 0,
      interestCoveredUnder94B: 0,
      interestNotCovered: 0,
      lenderWiseBreakdown: [],
      thresholdCheck: {
        threshold: INTEREST_THRESHOLD,
        interestAmount: 0,
        exceedsThreshold: false,
      },
    };
  }

  private createEmptyCarryforwardResult(): CarryforwardResult {
    return {
      openingBalance: 0,
      currentYearDisallowance: 0,
      utilizationInCurrentYear: 0,
      expiredInCurrentYear: 0,
      closingBalance: 0,
      yearWiseDetails: [],
      availableForFuture: [],
    };
  }

  private calculateYearsRemaining(expiryYear: string, currentYear: string): number {
    const expiryStart = parseInt(expiryYear.split("-")[0]);
    const currentStart = parseInt(currentYear.split("-")[0]);
    return Math.max(0, expiryStart - currentStart);
  }

  private generateSummary(
    input: ThinCapInput,
    ebitdaResult: EBITDAResult,
    interestAnalysis: InterestAnalysis,
    allowableInterest: number,
    disallowedInterest: number,
    carryforwardResult: CarryforwardResult
  ): string {
    const parts: string[] = [];

    parts.push(
      `Section 94B Analysis for AY ${input.assessmentYear}:`
    );

    parts.push(
      `EBITDA: Rs. ${this.formatCurrency(ebitdaResult.totalEBITDA)} | ` +
      `30% of EBITDA: Rs. ${this.formatCurrency(ebitdaResult.thirtyPercentEBITDA)}`
    );

    parts.push(
      `Total interest to non-resident AE: Rs. ${this.formatCurrency(interestAnalysis.interestCoveredUnder94B)}`
    );

    parts.push(
      `Allowable interest: Rs. ${this.formatCurrency(allowableInterest)} | ` +
      `Disallowed interest: Rs. ${this.formatCurrency(disallowedInterest)}`
    );

    if (disallowedInterest > 0) {
      parts.push(
        `The disallowed interest of Rs. ${this.formatCurrency(disallowedInterest)} can be carried forward for 8 assessment years.`
      );
    }

    if (carryforwardResult.openingBalance > 0) {
      parts.push(
        `Brought forward disallowance: Rs. ${this.formatCurrency(carryforwardResult.openingBalance)} | ` +
        `Utilized: Rs. ${this.formatCurrency(carryforwardResult.utilizationInCurrentYear)} | ` +
        `Expired: Rs. ${this.formatCurrency(carryforwardResult.expiredInCurrentYear)}`
      );
    }

    if (carryforwardResult.closingBalance > 0) {
      parts.push(
        `Closing carryforward balance: Rs. ${this.formatCurrency(carryforwardResult.closingBalance)}`
      );
    }

    return parts.join("\n\n");
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN").format(Math.round(amount));
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new ThinCapitalizationEngine instance
 */
export function createThinCapEngine(
  assessmentYear: string = "2025-26"
): ThinCapitalizationEngine {
  return new ThinCapitalizationEngine(assessmentYear);
}

// =============================================================================
// RE-EXPORT TYPES AND CONSTANTS
// =============================================================================

export {
  INTEREST_THRESHOLD,
  EBITDA_LIMITATION_PERCENTAGE,
  CARRYFORWARD_YEARS,
  Section94BEntityType,
  LenderType,
  EXEMPT_ENTITIES,
  COVERED_INTEREST_TYPES,
  CARRYFORWARD_RULES,
  isExemptEntity,
  isInterestCovered,
  calculateAllowableInterest,
  calculateDisallowedInterest,
  isSection94BApplicable,
  calculateEBITDA,
  getAYThinCapRules,
  getCarryforwardExpiryYear,
  isCarryforwardValid,
  getSection94BDescription,
} from "./constants/thin-cap-rules";
