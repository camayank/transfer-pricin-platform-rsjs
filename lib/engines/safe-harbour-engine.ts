/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Safe Harbour Calculator Engine
 *
 * This is the core calculation engine for Safe Harbour eligibility analysis.
 * Implements all rules as per Income Tax Rules 10TD, 10TE, 10TF.
 * ================================================================================
 */

import {
  SafeHarbourTransactionType,
  SafeHarbourInput,
  SafeHarbourResult,
  CreditRating,
  ValidationSeverity,
  ValidationIssue,
} from "./types";

import {
  SAFE_HARBOUR_RULES,
  SBI_RATES,
  getInterestRateForLoan,
  isWithinSafeHarbourLimit,
} from "./constants/safe-harbour-rules";

// Re-export types for backward compatibility
export { SafeHarbourTransactionType as TransactionType };
export { CreditRating };
export { SAFE_HARBOUR_RULES, SBI_RATES };

// Legacy Currency enum for backward compatibility
export enum Currency {
  INR = "INR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  OTHER_FC = "OTHER_FC",
}

// Legacy FinancialData interface for backward compatibility
export interface FinancialData {
  assessmentYear: string;
  totalRevenue: number;
  operatingRevenue: number;
  totalOperatingCost: number;
  employeeCost?: number;
  transactionValue: number;
  loanAmount?: number;
  creditRating?: CreditRating;
  loanCurrency?: Currency;
  guaranteeAmount?: number;
}

// =============================================================================
// SAFE HARBOUR CALCULATOR CLASS
// =============================================================================

export class SafeHarbourCalculator {
  private assessmentYear: string;

  constructor(assessmentYear: string = "2025-26") {
    this.assessmentYear = assessmentYear;
  }

  /**
   * Check Safe Harbour eligibility for a transaction
   */
  checkEligibility(input: SafeHarbourInput): SafeHarbourResult {
    const validationErrors = this.validateInput(input);
    if (validationErrors.length > 0) {
      throw new SafeHarbourValidationError(
        "Invalid input for Safe Harbour calculation",
        validationErrors
      );
    }

    const rule = SAFE_HARBOUR_RULES[input.transactionType];
    const transactionValue = this.getTransactionValue(input);
    const valueInCrores = transactionValue / 10000000;

    if (!isWithinSafeHarbourLimit(input.transactionType, valueInCrores)) {
      return this.createIneligibleResult(
        input,
        `Transaction value (Rs. ${valueInCrores.toFixed(2)} Cr) exceeds Safe Harbour limit of Rs. ${rule.maxTransactionValue} Cr`
      );
    }

    switch (input.transactionType) {
      case SafeHarbourTransactionType.IT_ITES:
        return this.checkITITeSEligibility(input);
      case SafeHarbourTransactionType.KPO:
        return this.checkKPOEligibility(input);
      case SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE:
      case SafeHarbourTransactionType.CONTRACT_RD_PHARMA:
        return this.checkContractRDEligibility(input);
      case SafeHarbourTransactionType.AUTO_ANCILLARY:
        return this.checkAutoAncillaryEligibility(input);
      case SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY:
      case SafeHarbourTransactionType.LOAN_INR:
        return this.checkLoanEligibility(input);
      case SafeHarbourTransactionType.CORPORATE_GUARANTEE:
        return this.checkGuaranteeEligibility(input);
      default:
        throw new Error(`Unsupported transaction type: ${input.transactionType}`);
    }
  }

  /**
   * Legacy method: Calculate eligibility using FinancialData
   */
  calculateEligibility(
    transactionType: SafeHarbourTransactionType,
    financialData: FinancialData
  ): {
    isEligible: boolean;
    meetsSafeHarbour: boolean;
    requiredMargin?: number;
    actualMargin?: number;
    requiredInterestRate?: number;
    requiredGuaranteeCommission?: number;
    complianceDetails: string;
    recommendation: string;
    conditions: string[];
    form3cefaData?: Record<string, unknown>;
    marginGap?: number;
    thresholdDetails?: Record<string, unknown>;
    eligibilityReason?: string;
  } {
    const operatingProfit = financialData.operatingRevenue - financialData.totalOperatingCost;

    const input: SafeHarbourInput = {
      transactionType,
      assessmentYear: financialData.assessmentYear,
      operatingRevenue: financialData.operatingRevenue,
      operatingCost: financialData.totalOperatingCost,
      operatingProfit,
      employeeCost: financialData.employeeCost,
      loanAmount: financialData.loanAmount,
      creditRating: financialData.creditRating,
      guaranteeAmount: financialData.guaranteeAmount,
    };

    try {
      const result = this.checkEligibility(input);
      const rule = SAFE_HARBOUR_RULES[transactionType];

      return {
        isEligible: result.eligible,
        meetsSafeHarbour: result.eligible,
        requiredMargin: result.marginType === "percentage" ? result.requiredValue : undefined,
        actualMargin: result.marginType === "percentage" ? result.currentValue : undefined,
        requiredInterestRate:
          result.marginType === "interest_rate" ? result.requiredValue : undefined,
        requiredGuaranteeCommission:
          result.marginType === "commission" ? result.requiredValue : undefined,
        complianceDetails: result.recommendation,
        recommendation: result.recommendation,
        conditions: rule.eligibilityConditions,
        form3cefaData: result.form3CEFAData,
        marginGap: result.gap,
        thresholdDetails: {
          maxValue: rule.maxTransactionValue,
          marginType: rule.marginType,
        },
        eligibilityReason: result.eligible
          ? "Transaction meets Safe Harbour requirements"
          : "Transaction does not meet Safe Harbour requirements",
      };
    } catch (error) {
      return {
        isEligible: false,
        meetsSafeHarbour: false,
        complianceDetails: error instanceof Error ? error.message : "Unknown error",
        recommendation: "Review input data and try again",
        conditions: [],
        eligibilityReason: "Error in calculation",
      };
    }
  }

  // ===========================================================================
  // IT/ITeS SERVICES ELIGIBILITY
  // ===========================================================================

  private checkITITeSEligibility(input: SafeHarbourInput): SafeHarbourResult {
    const { operatingRevenue = 0, operatingCost = 0, isSignificantOwnership = false } = input;
    const operatingProfit = operatingRevenue - operatingCost;
    const currentMargin = operatingCost > 0 ? (operatingProfit / operatingCost) * 100 : 0;
    const requiredMargin = isSignificantOwnership ? 18 : 17;
    const eligible = currentMargin >= requiredMargin;
    const gap = currentMargin - requiredMargin;

    let recommendation: string;
    if (eligible) {
      recommendation = `Transaction qualifies for Safe Harbour. Current OP/OC margin (${currentMargin.toFixed(2)}%) meets the required threshold of ${requiredMargin}%.`;
    } else {
      const requiredOP = (requiredMargin / 100) * operatingCost;
      const additionalOP = requiredOP - operatingProfit;
      recommendation = `To qualify for Safe Harbour, increase operating profit by Rs. ${this.formatCurrency(additionalOP)} to achieve ${requiredMargin}% OP/OC margin.`;
    }

    return {
      eligible,
      transactionType: input.transactionType,
      currentValue: currentMargin,
      requiredValue: requiredMargin,
      gap,
      marginType: "percentage",
      recommendation,
      details: { ownershipPercentage: input.ownershipPercentage },
      form3CEFAData: this.generateForm3CEFAData(input, eligible, currentMargin, requiredMargin),
    };
  }

  // ===========================================================================
  // KPO SERVICES ELIGIBILITY
  // ===========================================================================

  private checkKPOEligibility(input: SafeHarbourInput): SafeHarbourResult {
    const { operatingRevenue = 0, operatingCost = 0, employeeCost = 0 } = input;
    const employeeCostRatio = operatingCost > 0 ? (employeeCost / operatingCost) * 100 : 0;
    const operatingProfit = operatingRevenue - operatingCost;
    const currentMargin = operatingCost > 0 ? (operatingProfit / operatingCost) * 100 : 0;

    let requiredMargin: number;
    let marginCategory: string;

    if (employeeCostRatio < 40) {
      requiredMargin = 18;
      marginCategory = "Employee cost < 40% of operating cost";
    } else if (employeeCostRatio < 60) {
      requiredMargin = 21;
      marginCategory = "Employee cost 40-60% of operating cost";
    } else {
      requiredMargin = 24;
      marginCategory = "Employee cost >= 60% of operating cost";
    }

    const eligible = currentMargin >= requiredMargin;
    const gap = currentMargin - requiredMargin;

    let recommendation: string;
    if (eligible) {
      recommendation = `Transaction qualifies for Safe Harbour under KPO. Employee cost ratio: ${employeeCostRatio.toFixed(2)}% (${marginCategory}). Current OP/OC margin (${currentMargin.toFixed(2)}%) meets required ${requiredMargin}%.`;
    } else {
      const requiredOP = (requiredMargin / 100) * operatingCost;
      const additionalOP = requiredOP - operatingProfit;
      recommendation = `To qualify, increase operating profit by Rs. ${this.formatCurrency(additionalOP)} to achieve ${requiredMargin}% OP/OC margin.`;
    }

    return {
      eligible,
      transactionType: input.transactionType,
      currentValue: currentMargin,
      requiredValue: requiredMargin,
      gap,
      marginType: "percentage",
      recommendation,
      details: { employeeCostRatio },
      form3CEFAData: this.generateForm3CEFAData(input, eligible, currentMargin, requiredMargin),
    };
  }

  // ===========================================================================
  // CONTRACT R&D ELIGIBILITY
  // ===========================================================================

  private checkContractRDEligibility(input: SafeHarbourInput): SafeHarbourResult {
    const { operatingRevenue = 0, operatingCost = 0 } = input;
    const operatingProfit = operatingRevenue - operatingCost;
    const currentMargin = operatingCost > 0 ? (operatingProfit / operatingCost) * 100 : 0;
    const requiredMargin = 24;
    const eligible = currentMargin >= requiredMargin;
    const gap = currentMargin - requiredMargin;

    const rdType =
      input.transactionType === SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE
        ? "Software Development"
        : "Pharmaceutical/Generic Drugs";

    let recommendation: string;
    if (eligible) {
      recommendation = `Transaction qualifies for Safe Harbour under Contract R&D (${rdType}). Current OP/OC margin (${currentMargin.toFixed(2)}%) meets the required 24% threshold.`;
    } else {
      const requiredOP = (requiredMargin / 100) * operatingCost;
      const additionalOP = requiredOP - operatingProfit;
      recommendation = `Contract R&D requires 24% OP/OC margin. Increase operating profit by Rs. ${this.formatCurrency(additionalOP)} to qualify.`;
    }

    return {
      eligible,
      transactionType: input.transactionType,
      currentValue: currentMargin,
      requiredValue: requiredMargin,
      gap,
      marginType: "percentage",
      recommendation,
      details: {},
      form3CEFAData: this.generateForm3CEFAData(input, eligible, currentMargin, requiredMargin),
    };
  }

  // ===========================================================================
  // AUTO ANCILLARY ELIGIBILITY
  // ===========================================================================

  private checkAutoAncillaryEligibility(input: SafeHarbourInput): SafeHarbourResult {
    const { operatingRevenue = 0, operatingCost = 0 } = input;
    const operatingProfit = operatingRevenue - operatingCost;
    const currentMargin = operatingCost > 0 ? (operatingProfit / operatingCost) * 100 : 0;
    const requiredMargin = 12;
    const eligible = currentMargin >= requiredMargin;
    const gap = currentMargin - requiredMargin;

    let recommendation: string;
    if (eligible) {
      recommendation = `Transaction qualifies for Safe Harbour under Auto Component Manufacturing. Current OP/OC margin (${currentMargin.toFixed(2)}%) meets the required 12% threshold.`;
    } else {
      const requiredOP = (requiredMargin / 100) * operatingCost;
      const additionalOP = requiredOP - operatingProfit;
      recommendation = `Auto Ancillary requires 12% OP/OC margin. Increase operating profit by Rs. ${this.formatCurrency(additionalOP)} to qualify.`;
    }

    return {
      eligible,
      transactionType: input.transactionType,
      currentValue: currentMargin,
      requiredValue: requiredMargin,
      gap,
      marginType: "percentage",
      recommendation,
      details: {},
      form3CEFAData: this.generateForm3CEFAData(input, eligible, currentMargin, requiredMargin),
    };
  }

  // ===========================================================================
  // LOAN ELIGIBILITY
  // ===========================================================================

  private checkLoanEligibility(input: SafeHarbourInput): SafeHarbourResult {
    const { interestRate = 0, creditRating = CreditRating.BBB, transactionType } = input;

    const requiredRate = getInterestRateForLoan(
      transactionType as
        | SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY
        | SafeHarbourTransactionType.LOAN_INR,
      creditRating
    );

    const eligible = interestRate >= requiredRate;
    const gap = interestRate - requiredRate;

    const isFC = transactionType === SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY;
    const baseRateType = isFC ? "SBI Base Rate" : "SBI 1-Year MCLR";
    const baseRate = isFC ? SBI_RATES.baseRate : SBI_RATES.mclr.oneYear;

    const rule = SAFE_HARBOUR_RULES[transactionType];
    const matchingThreshold = rule.thresholds.find((t) =>
      t.creditRatings?.includes(creditRating)
    );
    const spread = matchingThreshold?.spread || 400;

    let recommendation: string;
    if (eligible) {
      recommendation = `Loan qualifies for Safe Harbour. Interest rate (${interestRate.toFixed(2)}%) meets required rate of ${requiredRate.toFixed(2)}% (${baseRateType} ${baseRate}% + ${spread} bps for ${creditRating} rating).`;
    } else {
      recommendation = `Interest rate (${interestRate.toFixed(2)}%) is below Safe Harbour rate. Increase to at least ${requiredRate.toFixed(2)}%.`;
    }

    return {
      eligible,
      transactionType,
      currentValue: interestRate,
      requiredValue: requiredRate,
      gap,
      marginType: "interest_rate",
      recommendation,
      details: { creditRating },
      form3CEFAData: this.generateForm3CEFADataForLoan(input, eligible, interestRate, requiredRate),
    };
  }

  // ===========================================================================
  // GUARANTEE ELIGIBILITY
  // ===========================================================================

  private checkGuaranteeEligibility(input: SafeHarbourInput): SafeHarbourResult {
    const { guaranteeAmount = 0, guaranteeCommission = 0 } = input;
    const requiredCommissionRate = 1.0;
    const actualCommissionRate =
      guaranteeAmount > 0 ? (guaranteeCommission / guaranteeAmount) * 100 : 0;
    const eligible = actualCommissionRate >= requiredCommissionRate;
    const gap = actualCommissionRate - requiredCommissionRate;

    let recommendation: string;
    if (eligible) {
      recommendation = `Corporate guarantee qualifies for Safe Harbour. Commission rate (${actualCommissionRate.toFixed(2)}% p.a.) meets required 1% p.a.`;
    } else {
      const requiredCommission = (requiredCommissionRate / 100) * guaranteeAmount;
      recommendation = `Guarantee commission (${actualCommissionRate.toFixed(2)}%) is below 1% p.a. Charge at least Rs. ${this.formatCurrency(requiredCommission)}.`;
    }

    return {
      eligible,
      transactionType: input.transactionType,
      currentValue: actualCommissionRate,
      requiredValue: requiredCommissionRate,
      gap,
      marginType: "commission",
      recommendation,
      details: {},
      form3CEFAData: this.generateForm3CEFADataForGuarantee(input, eligible, actualCommissionRate),
    };
  }

  // ===========================================================================
  // FORM 3CEFA DATA GENERATION
  // ===========================================================================

  private generateForm3CEFAData(
    input: SafeHarbourInput,
    eligible: boolean,
    currentMargin: number,
    requiredMargin: number
  ): Record<string, unknown> {
    const rule = SAFE_HARBOUR_RULES[input.transactionType];
    return {
      assessmentYear: input.assessmentYear || this.assessmentYear,
      transactionType: input.transactionType,
      transactionCategory: rule.name,
      section: rule.section,
      operatingRevenue: input.operatingRevenue,
      operatingCost: input.operatingCost,
      operatingProfit: (input.operatingRevenue || 0) - (input.operatingCost || 0),
      employeeCost: input.employeeCost,
      marginType: rule.marginType,
      actualMargin: currentMargin,
      requiredMargin: requiredMargin,
      marginGap: currentMargin - requiredMargin,
      isEligible: eligible,
      eligibilityConditions: rule.eligibilityConditions,
      maxTransactionValue: rule.maxTransactionValue,
      generatedOn: new Date().toISOString(),
      validFrom: rule.validFrom,
      validTo: rule.validTo,
    };
  }

  private generateForm3CEFADataForLoan(
    input: SafeHarbourInput,
    eligible: boolean,
    actualRate: number,
    requiredRate: number
  ): Record<string, unknown> {
    const rule = SAFE_HARBOUR_RULES[input.transactionType];
    const isFC = input.transactionType === SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY;
    return {
      assessmentYear: input.assessmentYear || this.assessmentYear,
      transactionType: input.transactionType,
      transactionCategory: rule.name,
      section: rule.section,
      loanAmount: input.loanAmount,
      currency: input.currency || (isFC ? "USD" : "INR"),
      creditRating: input.creditRating,
      actualInterestRate: actualRate,
      requiredInterestRate: requiredRate,
      baseRate: isFC ? SBI_RATES.baseRate : SBI_RATES.mclr.oneYear,
      baseRateType: isFC ? "SBI Base Rate" : "SBI 1-Year MCLR",
      isEligible: eligible,
      generatedOn: new Date().toISOString(),
      sbiRatesAsOf: SBI_RATES.lastUpdated,
    };
  }

  private generateForm3CEFADataForGuarantee(
    input: SafeHarbourInput,
    eligible: boolean,
    actualRate: number
  ): Record<string, unknown> {
    const rule = SAFE_HARBOUR_RULES[input.transactionType];
    return {
      assessmentYear: input.assessmentYear || this.assessmentYear,
      transactionType: input.transactionType,
      transactionCategory: rule.name,
      section: rule.section,
      guaranteeAmount: input.guaranteeAmount,
      guaranteeCommission: input.guaranteeCommission,
      actualCommissionRate: actualRate,
      requiredCommissionRate: 1.0,
      isEligible: eligible,
      generatedOn: new Date().toISOString(),
    };
  }

  // ===========================================================================
  // VALIDATION
  // ===========================================================================

  private validateInput(input: SafeHarbourInput): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!input.transactionType) {
      issues.push({
        field: "transactionType",
        message: "Transaction type is required",
        severity: ValidationSeverity.CRITICAL,
        code: "SH001",
      });
      return issues;
    }

    const serviceTypes = [
      SafeHarbourTransactionType.IT_ITES,
      SafeHarbourTransactionType.KPO,
      SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
      SafeHarbourTransactionType.CONTRACT_RD_PHARMA,
      SafeHarbourTransactionType.AUTO_ANCILLARY,
    ];

    const loanTypes = [
      SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,
      SafeHarbourTransactionType.LOAN_INR,
    ];

    if (serviceTypes.includes(input.transactionType)) {
      if (input.operatingRevenue === undefined || input.operatingRevenue < 0) {
        issues.push({
          field: "operatingRevenue",
          message: "Operating revenue is required and must be non-negative",
          severity: ValidationSeverity.CRITICAL,
          code: "SH002",
        });
      }
      if (input.operatingCost === undefined || input.operatingCost <= 0) {
        issues.push({
          field: "operatingCost",
          message: "Operating cost is required and must be positive",
          severity: ValidationSeverity.CRITICAL,
          code: "SH003",
        });
      }
      if (input.transactionType === SafeHarbourTransactionType.KPO) {
        if (input.employeeCost === undefined || input.employeeCost < 0) {
          issues.push({
            field: "employeeCost",
            message: "Employee cost is required for KPO transactions",
            severity: ValidationSeverity.CRITICAL,
            code: "SH004",
          });
        }
      }
    } else if (loanTypes.includes(input.transactionType)) {
      if (input.loanAmount === undefined || input.loanAmount <= 0) {
        issues.push({
          field: "loanAmount",
          message: "Loan amount is required and must be positive",
          severity: ValidationSeverity.CRITICAL,
          code: "SH005",
        });
      }
      if (input.interestRate === undefined || input.interestRate < 0) {
        issues.push({
          field: "interestRate",
          message: "Interest rate is required and must be non-negative",
          severity: ValidationSeverity.CRITICAL,
          code: "SH006",
        });
      }
    } else if (input.transactionType === SafeHarbourTransactionType.CORPORATE_GUARANTEE) {
      if (input.guaranteeAmount === undefined || input.guaranteeAmount <= 0) {
        issues.push({
          field: "guaranteeAmount",
          message: "Guarantee amount is required and must be positive",
          severity: ValidationSeverity.CRITICAL,
          code: "SH008",
        });
      }
      if (input.guaranteeCommission === undefined || input.guaranteeCommission < 0) {
        issues.push({
          field: "guaranteeCommission",
          message: "Guarantee commission is required and must be non-negative",
          severity: ValidationSeverity.CRITICAL,
          code: "SH009",
        });
      }
    }

    return issues;
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private getTransactionValue(input: SafeHarbourInput): number {
    switch (input.transactionType) {
      case SafeHarbourTransactionType.IT_ITES:
      case SafeHarbourTransactionType.KPO:
      case SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE:
      case SafeHarbourTransactionType.CONTRACT_RD_PHARMA:
      case SafeHarbourTransactionType.AUTO_ANCILLARY:
        return input.operatingRevenue || 0;
      case SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY:
      case SafeHarbourTransactionType.LOAN_INR:
        return input.loanAmount || 0;
      case SafeHarbourTransactionType.CORPORATE_GUARANTEE:
        return input.guaranteeAmount || 0;
      default:
        return 0;
    }
  }

  private createIneligibleResult(input: SafeHarbourInput, reason: string): SafeHarbourResult {
    return {
      eligible: false,
      transactionType: input.transactionType,
      currentValue: 0,
      requiredValue: 0,
      gap: 0,
      marginType: "percentage",
      recommendation: reason,
      details: {},
    };
  }

  private formatCurrency(amount: number): string {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN").format(amount);
  }

  // ===========================================================================
  // BATCH PROCESSING
  // ===========================================================================

  checkEligibilityBatch(inputs: SafeHarbourInput[]): SafeHarbourResult[] {
    return inputs.map((input) => {
      try {
        return this.checkEligibility(input);
      } catch (error) {
        return this.createIneligibleResult(
          input,
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });
  }

  getBatchSummary(results: SafeHarbourResult[]): BatchSummary {
    const eligible = results.filter((r) => r.eligible);
    return {
      totalTransactions: results.length,
      eligibleCount: eligible.length,
      ineligibleCount: results.length - eligible.length,
      eligibilityRate: results.length > 0 ? (eligible.length / results.length) * 100 : 0,
      byTransactionType: this.groupByTransactionType(results),
    };
  }

  private groupByTransactionType(
    results: SafeHarbourResult[]
  ): Record<string, { total: number; eligible: number; ineligible: number }> {
    const grouped: Record<string, { total: number; eligible: number; ineligible: number }> = {};
    for (const result of results) {
      const type = result.transactionType;
      if (!grouped[type]) grouped[type] = { total: 0, eligible: 0, ineligible: 0 };
      grouped[type].total++;
      if (result.eligible) grouped[type].eligible++;
      else grouped[type].ineligible++;
    }
    return grouped;
  }
}

// =============================================================================
// TYPES & EXPORTS
// =============================================================================

export interface BatchSummary {
  totalTransactions: number;
  eligibleCount: number;
  ineligibleCount: number;
  eligibilityRate: number;
  byTransactionType: Record<string, { total: number; eligible: number; ineligible: number }>;
}

export class SafeHarbourValidationError extends Error {
  public validationIssues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[]) {
    super(message);
    this.name = "SafeHarbourValidationError";
    this.validationIssues = issues;
  }
}

export function createSafeHarbourCalculator(
  assessmentYear: string = "2025-26"
): SafeHarbourCalculator {
  return new SafeHarbourCalculator(assessmentYear);
}

// Quick helper functions
export function checkITITeSQuick(
  revenue: number,
  cost: number,
  isSignificantOwnership = false
) {
  const margin = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
  const required = isSignificantOwnership ? 18 : 17;
  return { eligible: margin >= required, margin, required };
}

export function checkKPOQuick(revenue: number, cost: number, employeeCost: number) {
  const margin = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
  const empRatio = cost > 0 ? (employeeCost / cost) * 100 : 0;
  const required = empRatio < 40 ? 18 : empRatio < 60 ? 21 : 24;
  return { eligible: margin >= required, margin, required, employeeCostRatio: empRatio };
}

export function calculateLoanRate(
  isFC: boolean,
  creditRating: CreditRating = CreditRating.BBB
): number {
  const type = isFC
    ? SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY
    : SafeHarbourTransactionType.LOAN_INR;
  return getInterestRateForLoan(type, creditRating);
}
