/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Secondary Adjustment Engine (Section 92CE)
 *
 * Implements secondary adjustment calculations as per Section 92CE of
 * Income Tax Act, 1961. Mandatory since April 1, 2017.
 *
 * Key Features:
 * - Primary adjustment threshold checking (Rs. 1 Cr)
 * - Deemed dividend calculation under Section 2(22)(e)
 * - Deemed loan interest calculation (SBI base rate + 1%)
 * - Repatriation tracking and deadline management
 * - APA/MAP exemption handling
 * ================================================================================
 */

import {
  PRIMARY_ADJUSTMENT_THRESHOLD,
  REPATRIATION_DEADLINE_DAYS,
  SecondaryAdjustmentTrigger,
  SecondaryAdjustmentOption,
  RepatriationMode,
  DEEMED_DIVIDEND_RULES,
  SECONDARY_ADJUSTMENT_EXEMPTIONS,
  REPATRIATION_DOCUMENTATION,
  COMPUTATION_STEPS,
  getSecondaryAdjustmentInterestRate,
  isSecondaryAdjustmentApplicable,
  calculateRepatriationDeadline,
  calculateDeemedInterest,
  getAYRules,
  getDaysRemainingForRepatriation,
  isRepatriationDeadlinePassed,
} from "./constants/secondary-adjustment-rules";

import { ValidationSeverity } from "./types";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Input for secondary adjustment calculation
 */
export interface SecondaryAdjustmentInput {
  /** Assessment year (e.g., "2025-26") */
  assessmentYear: string;
  /** Primary adjustment amount (positive for income addition) */
  primaryAdjustment: number;
  /** Transaction value as per books */
  transactionValue: number;
  /** Arm's length price determined */
  armLengthPrice: number;
  /** Date of the adjustment order */
  orderDate: Date;
  /** Trigger for the adjustment */
  trigger: SecondaryAdjustmentTrigger;
  /** Currency of transaction */
  currency?: string;
  /** Whether AE is a shareholder with substantial interest */
  isSubstantialShareholder?: boolean;
  /** Shareholding percentage of AE */
  shareholdingPercentage?: number;
  /** Accumulated profits of the company */
  accumulatedProfits?: number;
  /** Whether covered under APA */
  isAPACovered?: boolean;
  /** APA signing date if applicable */
  apaDate?: Date;
  /** Whether covered under MAP */
  isMAPCovered?: boolean;
  /** MAP conclusion date if applicable */
  mapDate?: Date;
  /** Whether repatriation has been done */
  isRepatriated?: boolean;
  /** Repatriation date if done */
  repatriationDate?: Date;
  /** Repatriation amount */
  repatriationAmount?: number;
  /** Mode of repatriation */
  repatriationMode?: RepatriationMode;
  /** Tax already withheld on primary adjustment */
  taxWithheld?: number;
}

/**
 * Result of secondary adjustment calculation
 */
export interface SecondaryAdjustmentResult {
  /** Whether secondary adjustment is applicable */
  isApplicable: boolean;
  /** Reason if not applicable */
  nonApplicabilityReason?: string;
  /** Primary adjustment amount */
  primaryAdjustment: number;
  /** Excess money in hands of AE */
  excessMoney: number;
  /** Repatriation deadline */
  repatriationDeadline: Date;
  /** Days remaining for repatriation */
  daysRemaining: number;
  /** Whether deadline has passed */
  deadlinePassed: boolean;
  /** Recommended option */
  recommendedOption: SecondaryAdjustmentOption;
  /** Options analysis */
  optionsAnalysis: SecondaryAdjustmentOptionAnalysis[];
  /** Computation steps performed */
  computationSteps: ComputationStep[];
  /** Validation issues */
  validationIssues: SecondaryAdjustmentValidationIssue[];
  /** Summary narrative */
  summary: string;
}

/**
 * Analysis of each secondary adjustment option
 */
export interface SecondaryAdjustmentOptionAnalysis {
  /** Option type */
  option: SecondaryAdjustmentOption;
  /** Whether this option is available */
  isAvailable: boolean;
  /** Tax/interest impact */
  financialImpact: number;
  /** Pros of this option */
  pros: string[];
  /** Cons of this option */
  cons: string[];
  /** Documentation required */
  documentationRequired: string[];
  /** Deadline for this option */
  deadline?: Date;
}

/**
 * Individual computation step
 */
export interface ComputationStep {
  /** Step number */
  step: number;
  /** Description */
  description: string;
  /** Formula used */
  formula: string;
  /** Calculated value */
  value: number | string;
  /** Notes */
  notes?: string;
}

/**
 * Validation issue for secondary adjustment
 */
export interface SecondaryAdjustmentValidationIssue {
  /** Field with issue */
  field: string;
  /** Issue message */
  message: string;
  /** Severity */
  severity: ValidationSeverity;
  /** Error code */
  code: string;
  /** Suggestion to fix */
  suggestion?: string;
}

/**
 * Deemed dividend calculation result
 */
export interface DeemedDividendResult {
  /** Applicable amount as deemed dividend */
  deemedDividendAmount: number;
  /** Whether Section 2(22)(e) applies */
  isApplicable: boolean;
  /** Reason if not applicable */
  nonApplicabilityReason?: string;
  /** Tax on deemed dividend */
  taxLiability: number;
  /** Conditions checked */
  conditionsChecked: ConditionCheckResult[];
}

/**
 * Deemed loan interest calculation result
 */
export interface DeemedLoanInterestResult {
  /** Principal (excess money) */
  principal: number;
  /** Interest rate applied */
  interestRate: number;
  /** Rate breakdown */
  rateBreakdown: {
    baseRate: number;
    margin: number;
    currency: string;
  };
  /** Days outstanding */
  daysOutstanding: number;
  /** Interest amount */
  interestAmount: number;
  /** Total liability (principal + interest) */
  totalLiability: number;
  /** Year-wise breakdown if multiple years */
  yearWiseBreakdown?: YearWiseInterest[];
}

/**
 * Year-wise interest breakdown
 */
export interface YearWiseInterest {
  /** Financial year */
  financialYear: string;
  /** Days in this year */
  days: number;
  /** Interest rate for this year */
  rate: number;
  /** Interest amount */
  interest: number;
}

/**
 * Condition check result
 */
export interface ConditionCheckResult {
  /** Condition description */
  condition: string;
  /** Whether condition is met */
  isMet: boolean;
  /** Details */
  details?: string;
}

/**
 * Repatriation tracking
 */
export interface RepatriationTracker {
  /** Total amount to be repatriated */
  totalAmount: number;
  /** Amount repatriated */
  amountRepatriated: number;
  /** Balance pending */
  balancePending: number;
  /** Deadline */
  deadline: Date;
  /** Days remaining */
  daysRemaining: number;
  /** Status */
  status: "on_track" | "at_risk" | "overdue" | "completed";
  /** Repatriation events */
  events: RepatriationEvent[];
}

/**
 * Repatriation event
 */
export interface RepatriationEvent {
  /** Event date */
  date: Date;
  /** Amount repatriated */
  amount: number;
  /** Mode of repatriation */
  mode: RepatriationMode;
  /** Reference number */
  referenceNumber?: string;
  /** Documentation */
  documentation: string[];
}

// =============================================================================
// SECONDARY ADJUSTMENT ENGINE CLASS
// =============================================================================

/**
 * Main engine for secondary adjustment calculations
 */
export class SecondaryAdjustmentEngine {
  private assessmentYear: string;

  constructor(assessmentYear: string = "2025-26") {
    this.assessmentYear = assessmentYear;
  }

  /**
   * Calculate secondary adjustment for given input
   */
  calculateSecondaryAdjustment(
    input: SecondaryAdjustmentInput
  ): SecondaryAdjustmentResult {
    const validationIssues = this.validateInput(input);
    const computationSteps: ComputationStep[] = [];

    // Step 1: Determine primary adjustment
    computationSteps.push({
      step: 1,
      description: "Primary adjustment amount",
      formula: "ALP - Transaction Value",
      value: input.primaryAdjustment,
      notes: `Primary adjustment of Rs. ${this.formatCurrency(input.primaryAdjustment)}`,
    });

    // Step 2: Check threshold
    const meetsThreshold = Math.abs(input.primaryAdjustment) >= PRIMARY_ADJUSTMENT_THRESHOLD;
    computationSteps.push({
      step: 2,
      description: "Check threshold (Rs. 1 Crore)",
      formula: `|${input.primaryAdjustment}| >= ${PRIMARY_ADJUSTMENT_THRESHOLD}`,
      value: meetsThreshold ? "Yes" : "No",
      notes: meetsThreshold
        ? "Primary adjustment exceeds threshold - secondary adjustment applicable"
        : "Primary adjustment below threshold - secondary adjustment not applicable",
    });

    // Check applicability
    const isApplicable = this.checkApplicability(input);
    if (!isApplicable.applicable) {
      return {
        isApplicable: false,
        nonApplicabilityReason: isApplicable.reason,
        primaryAdjustment: input.primaryAdjustment,
        excessMoney: 0,
        repatriationDeadline: calculateRepatriationDeadline(input.orderDate),
        daysRemaining: getDaysRemainingForRepatriation(input.orderDate),
        deadlinePassed: isRepatriationDeadlinePassed(input.orderDate),
        recommendedOption: SecondaryAdjustmentOption.APA_MAP_EXEMPT,
        optionsAnalysis: [],
        computationSteps,
        validationIssues,
        summary: `Secondary adjustment is not applicable. Reason: ${isApplicable.reason}`,
      };
    }

    // Step 3: Calculate excess money
    const taxWithheld = input.taxWithheld || 0;
    const excessMoney = input.primaryAdjustment - taxWithheld;
    computationSteps.push({
      step: 3,
      description: "Calculate excess money in hands of AE",
      formula: "Primary Adjustment - Tax Withheld",
      value: excessMoney,
      notes: `Tax withheld: Rs. ${this.formatCurrency(taxWithheld)}`,
    });

    // Step 4: Calculate repatriation deadline
    const repatriationDeadline = calculateRepatriationDeadline(input.orderDate);
    const daysRemaining = getDaysRemainingForRepatriation(input.orderDate);
    const deadlinePassed = isRepatriationDeadlinePassed(input.orderDate);
    computationSteps.push({
      step: 4,
      description: "Repatriation deadline",
      formula: `Order Date + ${REPATRIATION_DEADLINE_DAYS} days`,
      value: repatriationDeadline.toISOString().split("T")[0],
      notes: deadlinePassed
        ? `Deadline passed ${Math.abs(daysRemaining)} days ago`
        : `${daysRemaining} days remaining`,
    });

    // Analyze options
    const optionsAnalysis = this.analyzeOptions(input, excessMoney);

    // Determine recommended option
    const recommendedOption = this.determineRecommendedOption(
      input,
      optionsAnalysis,
      deadlinePassed
    );

    // Generate summary
    const summary = this.generateSummary(
      input,
      excessMoney,
      recommendedOption,
      deadlinePassed,
      daysRemaining
    );

    return {
      isApplicable: true,
      primaryAdjustment: input.primaryAdjustment,
      excessMoney,
      repatriationDeadline,
      daysRemaining,
      deadlinePassed,
      recommendedOption,
      optionsAnalysis,
      computationSteps,
      validationIssues,
      summary,
    };
  }

  /**
   * Calculate deemed dividend under Section 2(22)(e)
   */
  calculateDeemedDividend(
    excessMoney: number,
    isSubstantialShareholder: boolean,
    shareholdingPercentage: number = 0,
    accumulatedProfits: number = 0
  ): DeemedDividendResult {
    const conditionsChecked: ConditionCheckResult[] = [];

    // Check substantial shareholder (10% voting power)
    const meetsShareholding = shareholdingPercentage >= 10;
    conditionsChecked.push({
      condition: "Shareholder holds 10% or more voting power",
      isMet: meetsShareholding,
      details: `Shareholding: ${shareholdingPercentage}%`,
    });

    // Check accumulated profits
    const hasProfits = accumulatedProfits > 0;
    conditionsChecked.push({
      condition: "Company has accumulated profits",
      isMet: hasProfits,
      details: `Accumulated profits: Rs. ${this.formatCurrency(accumulatedProfits)}`,
    });

    // Check if deemed dividend applies
    const isApplicable = isSubstantialShareholder && meetsShareholding && hasProfits;

    if (!isApplicable) {
      const reasons: string[] = [];
      if (!meetsShareholding) reasons.push("shareholding below 10%");
      if (!hasProfits) reasons.push("no accumulated profits");

      return {
        deemedDividendAmount: 0,
        isApplicable: false,
        nonApplicabilityReason: `Section 2(22)(e) not applicable: ${reasons.join(", ")}`,
        taxLiability: 0,
        conditionsChecked,
      };
    }

    // Calculate deemed dividend (limited to accumulated profits)
    const deemedDividendAmount = Math.min(excessMoney, accumulatedProfits);
    const taxLiability = deemedDividendAmount * (DEEMED_DIVIDEND_RULES.taxRate / 100);

    conditionsChecked.push({
      condition: "Deemed dividend limited to accumulated profits",
      isMet: true,
      details: `Deemed dividend: Rs. ${this.formatCurrency(deemedDividendAmount)}`,
    });

    return {
      deemedDividendAmount,
      isApplicable: true,
      taxLiability,
      conditionsChecked,
    };
  }

  /**
   * Calculate deemed loan interest
   */
  calculateDeemedLoanInterest(
    principal: number,
    daysOutstanding: number,
    currency: string = "INR"
  ): DeemedLoanInterestResult {
    const interestRate = getSecondaryAdjustmentInterestRate(this.assessmentYear, currency);
    const interestAmount = calculateDeemedInterest(principal, interestRate, daysOutstanding);

    // Get rate breakdown
    const ayRules = getAYRules(this.assessmentYear);
    const rateBreakdown = {
      baseRate: ayRules.interestRate - 1, // Remove margin to get base
      margin: 1,
      currency,
    };

    return {
      principal,
      interestRate,
      rateBreakdown,
      daysOutstanding,
      interestAmount,
      totalLiability: principal + interestAmount,
    };
  }

  /**
   * Track repatriation progress
   */
  trackRepatriation(
    adjustment: SecondaryAdjustmentResult,
    events: RepatriationEvent[]
  ): RepatriationTracker {
    const totalAmount = adjustment.excessMoney;
    const amountRepatriated = events.reduce((sum, e) => sum + e.amount, 0);
    const balancePending = totalAmount - amountRepatriated;

    // Determine status
    let status: "on_track" | "at_risk" | "overdue" | "completed";
    if (balancePending <= 0) {
      status = "completed";
    } else if (adjustment.deadlinePassed) {
      status = "overdue";
    } else if (adjustment.daysRemaining <= 15) {
      status = "at_risk";
    } else {
      status = "on_track";
    }

    return {
      totalAmount,
      amountRepatriated,
      balancePending,
      deadline: adjustment.repatriationDeadline,
      daysRemaining: adjustment.daysRemaining,
      status,
      events,
    };
  }

  /**
   * Validate secondary adjustment input
   */
  validateSecondaryAdjustment(
    input: SecondaryAdjustmentInput
  ): SecondaryAdjustmentValidationIssue[] {
    return this.validateInput(input);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private validateInput(
    input: SecondaryAdjustmentInput
  ): SecondaryAdjustmentValidationIssue[] {
    const issues: SecondaryAdjustmentValidationIssue[] = [];

    // Validate assessment year
    if (!input.assessmentYear || !/^\d{4}-\d{2}$/.test(input.assessmentYear)) {
      issues.push({
        field: "assessmentYear",
        message: "Invalid assessment year format. Expected format: YYYY-YY (e.g., 2025-26)",
        severity: ValidationSeverity.ERROR,
        code: "SA001",
        suggestion: "Use format like 2025-26",
      });
    }

    // Validate primary adjustment
    if (input.primaryAdjustment === undefined || input.primaryAdjustment === null) {
      issues.push({
        field: "primaryAdjustment",
        message: "Primary adjustment amount is required",
        severity: ValidationSeverity.CRITICAL,
        code: "SA002",
      });
    }

    // Validate order date
    if (!input.orderDate) {
      issues.push({
        field: "orderDate",
        message: "Order date is required for deadline calculation",
        severity: ValidationSeverity.CRITICAL,
        code: "SA003",
      });
    }

    // Validate trigger
    if (!input.trigger) {
      issues.push({
        field: "trigger",
        message: "Adjustment trigger is required",
        severity: ValidationSeverity.ERROR,
        code: "SA004",
        suggestion: "Specify whether adjustment was made by AO, TPO, or accepted voluntarily",
      });
    }

    // Validate repatriation details if claimed
    if (input.isRepatriated) {
      if (!input.repatriationDate) {
        issues.push({
          field: "repatriationDate",
          message: "Repatriation date required when repatriation is claimed",
          severity: ValidationSeverity.ERROR,
          code: "SA005",
        });
      }
      if (!input.repatriationAmount || input.repatriationAmount <= 0) {
        issues.push({
          field: "repatriationAmount",
          message: "Valid repatriation amount required",
          severity: ValidationSeverity.ERROR,
          code: "SA006",
        });
      }
      if (!input.repatriationMode) {
        issues.push({
          field: "repatriationMode",
          message: "Mode of repatriation must be specified",
          severity: ValidationSeverity.WARNING,
          code: "SA007",
          suggestion: "Specify mode: direct remittance, payable adjustment, etc.",
        });
      }
    }

    // Validate APA details if claimed
    if (input.isAPACovered && !input.apaDate) {
      issues.push({
        field: "apaDate",
        message: "APA signing date required when APA coverage is claimed",
        severity: ValidationSeverity.WARNING,
        code: "SA008",
      });
    }

    // Validate shareholding for deemed dividend
    if (input.isSubstantialShareholder && !input.shareholdingPercentage) {
      issues.push({
        field: "shareholdingPercentage",
        message: "Shareholding percentage required for deemed dividend analysis",
        severity: ValidationSeverity.INFO,
        code: "SA009",
      });
    }

    return issues;
  }

  private checkApplicability(
    input: SecondaryAdjustmentInput
  ): { applicable: boolean; reason?: string } {
    // Check threshold
    if (Math.abs(input.primaryAdjustment) < PRIMARY_ADJUSTMENT_THRESHOLD) {
      return {
        applicable: false,
        reason: `Primary adjustment (Rs. ${this.formatCurrency(input.primaryAdjustment)}) is below threshold of Rs. 1 Crore`,
      };
    }

    // Check APA exemption
    if (input.isAPACovered && input.apaDate) {
      const apaEffectiveDate = new Date("2017-04-01");
      if (input.apaDate < apaEffectiveDate) {
        return {
          applicable: false,
          reason: "Exempt under Section 92CE(2B) - APA entered before April 1, 2017",
        };
      }
    }

    // Check MAP exemption
    if (input.isMAPCovered && input.mapDate) {
      const mapEffectiveDate = new Date("2017-04-01");
      if (input.mapDate < mapEffectiveDate) {
        return {
          applicable: false,
          reason: "Exempt under Section 92CE(2B) - MAP concluded before April 1, 2017",
        };
      }
    }

    // Check if already repatriated within deadline
    if (input.isRepatriated && input.repatriationDate) {
      const deadline = calculateRepatriationDeadline(input.orderDate);
      if (input.repatriationDate <= deadline) {
        if (input.repatriationAmount && input.repatriationAmount >= input.primaryAdjustment) {
          return {
            applicable: false,
            reason: "Excess money fully repatriated within 90-day deadline",
          };
        }
      }
    }

    return { applicable: true };
  }

  private analyzeOptions(
    input: SecondaryAdjustmentInput,
    excessMoney: number
  ): SecondaryAdjustmentOptionAnalysis[] {
    const options: SecondaryAdjustmentOptionAnalysis[] = [];
    const deadline = calculateRepatriationDeadline(input.orderDate);
    const deadlinePassed = isRepatriationDeadlinePassed(input.orderDate);

    // Option 1: Repatriation
    options.push({
      option: SecondaryAdjustmentOption.REPATRIATION,
      isAvailable: !deadlinePassed,
      financialImpact: 0, // No additional tax impact
      pros: [
        "No additional tax liability",
        "Cleanest resolution",
        "No ongoing compliance burden",
      ],
      cons: [
        "Requires actual fund movement",
        "May impact working capital of AE",
        "Documentation requirements",
      ],
      documentationRequired: REPATRIATION_DOCUMENTATION,
      deadline,
    });

    // Option 2: Deemed Dividend
    const deemedDividend = this.calculateDeemedDividend(
      excessMoney,
      input.isSubstantialShareholder || false,
      input.shareholdingPercentage || 0,
      input.accumulatedProfits || 0
    );

    options.push({
      option: SecondaryAdjustmentOption.DEEMED_DIVIDEND,
      isAvailable: deemedDividend.isApplicable,
      financialImpact: deemedDividend.taxLiability,
      pros: [
        "One-time tax settlement",
        "No ongoing interest accrual",
        "Certainty of tax liability",
      ],
      cons: [
        "Immediate tax outflow at 30%",
        "Requires accumulated profits",
        "Only for substantial shareholders",
      ],
      documentationRequired: [
        "Board resolution",
        "Computation of accumulated profits",
        "Shareholding certificate",
        "Tax payment challan",
      ],
    });

    // Option 3: Deemed Loan
    const daysOutstanding = deadlinePassed
      ? Math.abs(getDaysRemainingForRepatriation(input.orderDate))
      : 365; // Assume 1 year for comparison

    const deemedLoan = this.calculateDeemedLoanInterest(
      excessMoney,
      daysOutstanding,
      input.currency || "INR"
    );

    options.push({
      option: SecondaryAdjustmentOption.DEEMED_LOAN,
      isAvailable: true,
      financialImpact: deemedLoan.interestAmount,
      pros: [
        "No immediate cash outflow",
        "Interest is deductible expense",
        "Flexibility in timing",
      ],
      cons: [
        "Ongoing interest accrual",
        "Complexity in multi-year tracking",
        "TDS implications on deemed interest",
      ],
      documentationRequired: [
        "Interest computation workings",
        "Year-end journal entries",
        "TDS compliance documentation",
        "Income tax return disclosure",
      ],
    });

    return options;
  }

  private determineRecommendedOption(
    input: SecondaryAdjustmentInput,
    optionsAnalysis: SecondaryAdjustmentOptionAnalysis[],
    deadlinePassed: boolean
  ): SecondaryAdjustmentOption {
    // If deadline not passed, recommend repatriation
    if (!deadlinePassed) {
      return SecondaryAdjustmentOption.REPATRIATION;
    }

    // Find lowest financial impact option that is available
    const availableOptions = optionsAnalysis.filter((o) => o.isAvailable);
    if (availableOptions.length === 0) {
      return SecondaryAdjustmentOption.DEEMED_LOAN;
    }

    availableOptions.sort((a, b) => a.financialImpact - b.financialImpact);
    return availableOptions[0].option;
  }

  private generateSummary(
    input: SecondaryAdjustmentInput,
    excessMoney: number,
    recommendedOption: SecondaryAdjustmentOption,
    deadlinePassed: boolean,
    daysRemaining: number
  ): string {
    const parts: string[] = [];

    parts.push(
      `Secondary adjustment is applicable for primary adjustment of Rs. ${this.formatCurrency(input.primaryAdjustment)}.`
    );
    parts.push(`Excess money in hands of AE: Rs. ${this.formatCurrency(excessMoney)}.`);

    if (deadlinePassed) {
      parts.push(
        `ALERT: Repatriation deadline has passed ${Math.abs(daysRemaining)} days ago.`
      );
      parts.push(
        `Deemed interest at ${getSecondaryAdjustmentInterestRate(this.assessmentYear, input.currency || "INR")}% p.a. is accruing.`
      );
    } else {
      parts.push(
        `${daysRemaining} days remaining for repatriation (deadline: ${calculateRepatriationDeadline(input.orderDate).toISOString().split("T")[0]}).`
      );
    }

    const optionDescriptions: Record<SecondaryAdjustmentOption, string> = {
      [SecondaryAdjustmentOption.REPATRIATION]:
        "Repatriate excess money within deadline to avoid any additional tax implications.",
      [SecondaryAdjustmentOption.DEEMED_DIVIDEND]:
        "Treat excess money as deemed dividend under Section 2(22)(e) - one-time tax at 30%.",
      [SecondaryAdjustmentOption.DEEMED_LOAN]:
        "Treat excess money as deemed loan with interest accruing at SBI rate + 1%.",
      [SecondaryAdjustmentOption.APA_MAP_EXEMPT]:
        "Transaction is exempt from secondary adjustment under APA/MAP provisions.",
    };

    parts.push(`Recommended: ${optionDescriptions[recommendedOption]}`);

    return parts.join(" ");
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN").format(amount);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new SecondaryAdjustmentEngine instance
 */
export function createSecondaryAdjustmentEngine(
  assessmentYear: string = "2025-26"
): SecondaryAdjustmentEngine {
  return new SecondaryAdjustmentEngine(assessmentYear);
}

// =============================================================================
// RE-EXPORT TYPES AND CONSTANTS
// =============================================================================

export {
  PRIMARY_ADJUSTMENT_THRESHOLD,
  REPATRIATION_DEADLINE_DAYS,
  SecondaryAdjustmentTrigger,
  SecondaryAdjustmentOption,
  RepatriationMode,
  DEEMED_DIVIDEND_RULES,
  SECONDARY_ADJUSTMENT_EXEMPTIONS,
  REPATRIATION_DOCUMENTATION,
  COMPUTATION_STEPS,
  getSecondaryAdjustmentInterestRate,
  isSecondaryAdjustmentApplicable,
  calculateRepatriationDeadline,
  calculateDeemedInterest,
  getAYRules,
  getDaysRemainingForRepatriation,
  isRepatriationDeadlinePassed,
} from "./constants/secondary-adjustment-rules";
