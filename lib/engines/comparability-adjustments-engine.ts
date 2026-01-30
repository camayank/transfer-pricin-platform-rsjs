/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Comparability Adjustments Engine
 *
 * Comprehensive engine for calculating all types of comparability adjustments
 * including working capital, risk, capacity, geographic, and accounting adjustments.
 * Follows OECD Guidelines and Indian TP Rules (Rule 10B).
 * ================================================================================
 */

import {
  AdjustmentType,
  IndustryType,
  RiskType,
  AccountingStandard,
  WORKING_CAPITAL_PARAMETERS,
  INDUSTRY_WORKING_CAPITAL_BENCHMARKS,
  RISK_ADJUSTMENT_FACTORS,
  INDUSTRY_RISK_PROFILES,
  INDUSTRY_CAPACITY_PARAMETERS,
  GEOGRAPHIC_FACTORS,
  ACCOUNTING_ADJUSTMENTS,
  PLI_ADJUSTMENT_THRESHOLDS,
  calculateWorkingCapitalFactor,
  calculateCapacityAdjustment,
  getIndustryParameters,
  getGeographicAdjustmentFactor,
  isAdjustmentMaterial,
  isAdjustmentReasonable,
  getRequiredDocumentation,
} from "./constants/adjustment-parameters";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ComparableEntity {
  name: string;
  financialYear: string;
  industry: IndustryType;
  region: string;
  financials: ComparableFinancials;
  operationalData: OperationalData;
  accountingStandard: AccountingStandard;
}

export interface ComparableFinancials {
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  totalAssets: number;
  currentAssets: number;
  currentLiabilities: number;
  tradeReceivables: number;
  tradePayables: number;
  inventory: number;
  fixedAssets: number;
}

export interface OperationalData {
  capacityUtilization: number;
  riskProfile: RiskAssumption[];
  employeeCount?: number;
  yearsInBusiness?: number;
}

export interface RiskAssumption {
  riskType: RiskType;
  assumed: boolean;
  mitigated: boolean;
  level: "low" | "medium" | "high";
}

export interface TestedPartyData extends ComparableEntity {
  transactionValue: number;
  relatedPartyPercentage: number;
}

export interface WorkingCapitalInput {
  testedParty: {
    receivableDays: number;
    payableDays: number;
    inventoryDays: number;
    revenue: number;
    costOfSales: number;
  };
  comparable: {
    receivableDays: number;
    payableDays: number;
    inventoryDays: number;
    revenue: number;
    costOfSales: number;
  };
  interestRate: number;
}

export interface WorkingCapitalResult {
  testedPartyWCFactor: number;
  comparableWCFactor: number;
  netAdjustment: number;
  adjustedMargin: number;
  methodology: string;
  calculation: WorkingCapitalCalculation;
  isMaterial: boolean;
}

export interface WorkingCapitalCalculation {
  testedParty: {
    netWCDays: number;
    workingCapitalRequired: number;
    interestCost: number;
  };
  comparable: {
    netWCDays: number;
    workingCapitalRequired: number;
    interestCost: number;
  };
  difference: number;
}

export interface RiskAdjustmentInput {
  testedParty: {
    riskProfile: RiskAssumption[];
    industry: IndustryType;
  };
  comparable: {
    riskProfile: RiskAssumption[];
    industry: IndustryType;
  };
}

export interface RiskAdjustmentResult {
  netRiskAdjustment: number;
  riskScoreTestedParty: number;
  riskScoreComparable: number;
  riskWiseAnalysis: RiskWiseAnalysis[];
  methodology: string;
  isMaterial: boolean;
}

export interface RiskWiseAnalysis {
  riskType: RiskType;
  testedPartyAssumes: boolean;
  comparableAssumes: boolean;
  adjustmentContribution: number;
}

export interface CapacityAdjustmentInput {
  testedParty: {
    actualUtilization: number;
    operatingCost: number;
    industry: IndustryType;
  };
  comparable: {
    actualUtilization: number;
    operatingCost: number;
    industry: IndustryType;
  };
}

export interface CapacityAdjustmentResult {
  testedPartyAdjustment: number;
  comparableAdjustment: number;
  netAdjustment: number;
  normalUtilization: number;
  methodology: string;
  isMaterial: boolean;
}

export interface GeographicAdjustmentInput {
  testedPartyRegion: string;
  comparableRegion: string;
  laborCostWeightage: number;
  overheadWeightage: number;
  marketWeightage: number;
}

export interface GeographicAdjustmentResult {
  netAdjustment: number;
  laborCostAdjustment: number;
  overheadAdjustment: number;
  marketAdjustment: number;
  methodology: string;
  isMaterial: boolean;
}

export interface AccountingAdjustmentInput {
  testedPartyStandard: AccountingStandard;
  comparableStandard: AccountingStandard;
  adjustmentItems: AccountingAdjustmentItem[];
}

export interface AccountingAdjustmentItem {
  item: string;
  testedPartyValue: number;
  comparableValue: number;
  adjustedValue: number;
  adjustmentReason: string;
}

export interface AccountingAdjustmentResult {
  totalAdjustment: number;
  itemWiseAdjustments: AccountingAdjustmentItem[];
  methodology: string;
  isMaterial: boolean;
}

export interface AdjustedComparable {
  originalEntity: ComparableEntity;
  originalMargin: number;
  adjustments: AppliedAdjustment[];
  totalAdjustment: number;
  adjustedMargin: number;
  adjustmentSummary: string;
  documentation: string[];
}

export interface AppliedAdjustment {
  type: AdjustmentType;
  amount: number;
  percentageImpact: number;
  methodology: string;
  isMaterial: boolean;
  isReasonable: boolean;
}

export interface ComparabilityAnalysisResult {
  testedParty: TestedPartyData;
  comparables: ComparableEntity[];
  adjustedComparables: AdjustedComparable[];
  unadjustedRange: { min: number; max: number; median: number };
  adjustedRange: { min: number; max: number; median: number };
  armLengthRange: { lowerQuartile: number; median: number; upperQuartile: number };
  totalAdjustmentImpact: number;
  recommendedAdjustments: AdjustmentType[];
  documentationRequired: string[];
}

// =============================================================================
// COMPARABILITY ADJUSTMENTS ENGINE CLASS
// =============================================================================

export class ComparabilityAdjustmentsEngine {
  private pli: string;

  constructor(pli: string = "Operating Profit/Operating Cost (OP/OC)") {
    this.pli = pli;
  }

  // ===========================================================================
  // WORKING CAPITAL ADJUSTMENT
  // ===========================================================================

  /**
   * Calculate working capital adjustment per Mentor Graphics methodology
   */
  calculateWorkingCapitalAdjustment(input: WorkingCapitalInput): WorkingCapitalResult {
    const { testedParty, comparable, interestRate } = input;

    // Calculate net working capital days
    const tpNetWCDays =
      testedParty.receivableDays - testedParty.payableDays + testedParty.inventoryDays;
    const compNetWCDays =
      comparable.receivableDays - comparable.payableDays + comparable.inventoryDays;

    // Calculate working capital required
    const tpDailyRevenue = testedParty.revenue / WORKING_CAPITAL_PARAMETERS.daysInYear;
    const compDailyRevenue = comparable.revenue / WORKING_CAPITAL_PARAMETERS.daysInYear;

    const tpWCRequired = tpNetWCDays * tpDailyRevenue;
    const compWCRequired = compNetWCDays * compDailyRevenue;

    // Calculate interest cost (opportunity cost)
    const tpInterestCost = tpWCRequired * interestRate;
    const compInterestCost = compWCRequired * interestRate;

    // Calculate adjustment factor as % of revenue/cost
    const tpWCFactor = tpInterestCost / testedParty.revenue;
    const compWCFactor = compInterestCost / comparable.revenue;

    // Net adjustment to be applied to comparable's margin
    const netAdjustment = tpWCFactor - compWCFactor;

    const isMaterial = isAdjustmentMaterial(netAdjustment, this.pli);

    return {
      testedPartyWCFactor: tpWCFactor,
      comparableWCFactor: compWCFactor,
      netAdjustment,
      adjustedMargin: netAdjustment, // To be added to comparable's margin
      methodology:
        "Working capital adjustment computed using Mentor Graphics methodology. " +
        "Net working capital = Receivables + Inventory - Payables. " +
        "Adjustment = (WC Days × Daily Revenue × Interest Rate) / Revenue",
      calculation: {
        testedParty: {
          netWCDays: tpNetWCDays,
          workingCapitalRequired: tpWCRequired,
          interestCost: tpInterestCost,
        },
        comparable: {
          netWCDays: compNetWCDays,
          workingCapitalRequired: compWCRequired,
          interestCost: compInterestCost,
        },
        difference: tpNetWCDays - compNetWCDays,
      },
      isMaterial,
    };
  }

  /**
   * Batch working capital adjustment for multiple comparables
   */
  batchWorkingCapitalAdjustment(
    testedParty: WorkingCapitalInput["testedParty"],
    comparables: WorkingCapitalInput["comparable"][],
    interestRate: number
  ): WorkingCapitalResult[] {
    return comparables.map((comparable) =>
      this.calculateWorkingCapitalAdjustment({
        testedParty,
        comparable,
        interestRate,
      })
    );
  }

  // ===========================================================================
  // RISK ADJUSTMENT
  // ===========================================================================

  /**
   * Calculate risk adjustment based on functional risk profiles
   */
  calculateRiskAdjustment(input: RiskAdjustmentInput): RiskAdjustmentResult {
    const riskWiseAnalysis: RiskWiseAnalysis[] = [];
    let netAdjustment = 0;
    let tpRiskScore = 0;
    let compRiskScore = 0;

    RISK_ADJUSTMENT_FACTORS.forEach((factor) => {
      const tpRisk = input.testedParty.riskProfile.find((r) => r.riskType === factor.riskType);
      const compRisk = input.comparable.riskProfile.find((r) => r.riskType === factor.riskType);

      const tpAssumes = tpRisk?.assumed && !tpRisk?.mitigated;
      const compAssumes = compRisk?.assumed && !compRisk?.mitigated;

      // Calculate risk scores
      if (tpAssumes) {
        tpRiskScore += factor.weightage * this.getRiskLevelMultiplier(tpRisk?.level || "medium");
      }
      if (compAssumes) {
        compRiskScore += factor.weightage * this.getRiskLevelMultiplier(compRisk?.level || "medium");
      }

      // Calculate adjustment contribution
      let contribution = 0;
      if (tpAssumes && !compAssumes) {
        contribution = factor.adjustmentRange.max * factor.weightage;
      } else if (!tpAssumes && compAssumes) {
        contribution = factor.adjustmentRange.min * factor.weightage;
      }

      netAdjustment += contribution;

      riskWiseAnalysis.push({
        riskType: factor.riskType,
        testedPartyAssumes: tpAssumes || false,
        comparableAssumes: compAssumes || false,
        adjustmentContribution: contribution,
      });
    });

    const isMaterial = isAdjustmentMaterial(netAdjustment / 100, this.pli);

    return {
      netRiskAdjustment: netAdjustment / 100, // Convert to decimal
      riskScoreTestedParty: tpRiskScore * 100,
      riskScoreComparable: compRiskScore * 100,
      riskWiseAnalysis,
      methodology:
        "Risk adjustment based on comparative FAR analysis. " +
        "Each risk factor weighted by significance and adjusted based on assumption/mitigation status.",
      isMaterial,
    };
  }

  private getRiskLevelMultiplier(level: "low" | "medium" | "high"): number {
    switch (level) {
      case "low":
        return 0.5;
      case "medium":
        return 1.0;
      case "high":
        return 1.5;
    }
  }

  // ===========================================================================
  // CAPACITY UTILIZATION ADJUSTMENT
  // ===========================================================================

  /**
   * Calculate capacity utilization adjustment
   */
  calculateCapacityUtilizationAdjustment(input: CapacityAdjustmentInput): CapacityAdjustmentResult {
    const tpParams = INDUSTRY_CAPACITY_PARAMETERS[input.testedParty.industry];
    const compParams = INDUSTRY_CAPACITY_PARAMETERS[input.comparable.industry];

    const normalUtilization = (tpParams.normalUtilization + compParams.normalUtilization) / 2;

    // Calculate adjustments for each party
    const tpAdjustment = calculateCapacityAdjustment(
      input.testedParty.actualUtilization,
      normalUtilization,
      tpParams.fixedCostPercentage,
      input.testedParty.operatingCost
    );

    const compAdjustment = calculateCapacityAdjustment(
      input.comparable.actualUtilization,
      normalUtilization,
      compParams.fixedCostPercentage,
      input.comparable.operatingCost
    );

    // Net adjustment as percentage of operating cost
    const netAdjustment =
      (tpAdjustment / input.testedParty.operatingCost) -
      (compAdjustment / input.comparable.operatingCost);

    const isMaterial = isAdjustmentMaterial(netAdjustment, this.pli);

    return {
      testedPartyAdjustment: tpAdjustment,
      comparableAdjustment: compAdjustment,
      netAdjustment,
      normalUtilization,
      methodology:
        "Capacity adjustment computed based on deviation from normal industry utilization. " +
        "Adjustment = (Fixed Cost % × Operating Cost × Utilization Gap) / Actual Utilization",
      isMaterial,
    };
  }

  // ===========================================================================
  // GEOGRAPHIC ADJUSTMENT
  // ===========================================================================

  /**
   * Calculate geographic/location savings adjustment
   */
  calculateGeographicAdjustment(input: GeographicAdjustmentInput): GeographicAdjustmentResult {
    const laborAdj = getGeographicAdjustmentFactor(
      input.testedPartyRegion,
      input.comparableRegion,
      "laborCostIndex"
    );
    const overheadAdj = getGeographicAdjustmentFactor(
      input.testedPartyRegion,
      input.comparableRegion,
      "overheadCostIndex"
    );
    const marketAdj = getGeographicAdjustmentFactor(
      input.testedPartyRegion,
      input.comparableRegion,
      "marketSizeIndex"
    );

    if (laborAdj === null || overheadAdj === null || marketAdj === null) {
      return {
        netAdjustment: 0,
        laborCostAdjustment: 0,
        overheadAdjustment: 0,
        marketAdjustment: 0,
        methodology: "Geographic adjustment not computed - region data not available",
        isMaterial: false,
      };
    }

    const weightedLaborAdj = laborAdj * input.laborCostWeightage;
    const weightedOverheadAdj = overheadAdj * input.overheadWeightage;
    const weightedMarketAdj = marketAdj * input.marketWeightage;

    const netAdjustment = weightedLaborAdj + weightedOverheadAdj + weightedMarketAdj;
    const isMaterial = isAdjustmentMaterial(netAdjustment, this.pli);

    return {
      netAdjustment,
      laborCostAdjustment: weightedLaborAdj,
      overheadAdjustment: weightedOverheadAdj,
      marketAdjustment: weightedMarketAdj,
      methodology:
        `Geographic adjustment based on cost and market indices. ` +
        `Labor cost weight: ${input.laborCostWeightage * 100}%, ` +
        `Overhead weight: ${input.overheadWeightage * 100}%, ` +
        `Market weight: ${input.marketWeightage * 100}%`,
      isMaterial,
    };
  }

  // ===========================================================================
  // ACCOUNTING ADJUSTMENT
  // ===========================================================================

  /**
   * Calculate accounting differences adjustment
   */
  reconcileAccountingDifferences(input: AccountingAdjustmentInput): AccountingAdjustmentResult {
    const itemWiseAdjustments: AccountingAdjustmentItem[] = input.adjustmentItems.map((item) => ({
      ...item,
      adjustedValue: item.adjustedValue || item.comparableValue,
    }));

    const totalAdjustment = itemWiseAdjustments.reduce(
      (sum, item) => sum + (item.adjustedValue - item.comparableValue),
      0
    );

    const isMaterial = isAdjustmentMaterial(totalAdjustment, this.pli);

    return {
      totalAdjustment,
      itemWiseAdjustments,
      methodology:
        `Accounting adjustments to normalize ${input.comparableStandard} to ${input.testedPartyStandard}. ` +
        `Adjustments made for differences in ${itemWiseAdjustments.map((i) => i.item).join(", ")}.`,
      isMaterial,
    };
  }

  // ===========================================================================
  // COMPREHENSIVE ADJUSTMENT APPLICATION
  // ===========================================================================

  /**
   * Apply all applicable adjustments to a comparable
   */
  applyAllAdjustments(
    testedParty: TestedPartyData,
    comparable: ComparableEntity,
    adjustmentsToApply: AdjustmentType[],
    interestRate: number = WORKING_CAPITAL_PARAMETERS.interestRate
  ): AdjustedComparable {
    const appliedAdjustments: AppliedAdjustment[] = [];
    let totalAdjustment = 0;

    // Calculate original margin
    const originalMargin =
      comparable.financials.operatingProfit / comparable.financials.operatingExpenses;

    // Apply Working Capital Adjustment
    if (adjustmentsToApply.includes(AdjustmentType.WORKING_CAPITAL)) {
      const wcResult = this.calculateWorkingCapitalAdjustment({
        testedParty: {
          receivableDays: this.calculateDays(
            testedParty.financials.tradeReceivables,
            testedParty.financials.revenue
          ),
          payableDays: this.calculateDays(
            testedParty.financials.tradePayables,
            testedParty.financials.costOfSales
          ),
          inventoryDays: this.calculateDays(
            testedParty.financials.inventory,
            testedParty.financials.costOfSales
          ),
          revenue: testedParty.financials.revenue,
          costOfSales: testedParty.financials.costOfSales,
        },
        comparable: {
          receivableDays: this.calculateDays(
            comparable.financials.tradeReceivables,
            comparable.financials.revenue
          ),
          payableDays: this.calculateDays(
            comparable.financials.tradePayables,
            comparable.financials.costOfSales
          ),
          inventoryDays: this.calculateDays(
            comparable.financials.inventory,
            comparable.financials.costOfSales
          ),
          revenue: comparable.financials.revenue,
          costOfSales: comparable.financials.costOfSales,
        },
        interestRate,
      });

      const reasonableCheck = isAdjustmentReasonable(wcResult.netAdjustment, this.pli);

      appliedAdjustments.push({
        type: AdjustmentType.WORKING_CAPITAL,
        amount: wcResult.netAdjustment,
        percentageImpact: wcResult.netAdjustment * 100,
        methodology: wcResult.methodology,
        isMaterial: wcResult.isMaterial,
        isReasonable: reasonableCheck.reasonable,
      });

      if (wcResult.isMaterial && reasonableCheck.reasonable) {
        totalAdjustment += wcResult.netAdjustment;
      }
    }

    // Apply Risk Adjustment
    if (adjustmentsToApply.includes(AdjustmentType.RISK)) {
      const riskResult = this.calculateRiskAdjustment({
        testedParty: {
          riskProfile: testedParty.operationalData.riskProfile,
          industry: testedParty.industry,
        },
        comparable: {
          riskProfile: comparable.operationalData.riskProfile,
          industry: comparable.industry,
        },
      });

      const reasonableCheck = isAdjustmentReasonable(riskResult.netRiskAdjustment, this.pli);

      appliedAdjustments.push({
        type: AdjustmentType.RISK,
        amount: riskResult.netRiskAdjustment,
        percentageImpact: riskResult.netRiskAdjustment * 100,
        methodology: riskResult.methodology,
        isMaterial: riskResult.isMaterial,
        isReasonable: reasonableCheck.reasonable,
      });

      if (riskResult.isMaterial && reasonableCheck.reasonable) {
        totalAdjustment += riskResult.netRiskAdjustment;
      }
    }

    // Apply Capacity Utilization Adjustment
    if (adjustmentsToApply.includes(AdjustmentType.CAPACITY_UTILIZATION)) {
      const capResult = this.calculateCapacityUtilizationAdjustment({
        testedParty: {
          actualUtilization: testedParty.operationalData.capacityUtilization,
          operatingCost:
            testedParty.financials.costOfSales + testedParty.financials.operatingExpenses,
          industry: testedParty.industry,
        },
        comparable: {
          actualUtilization: comparable.operationalData.capacityUtilization,
          operatingCost:
            comparable.financials.costOfSales + comparable.financials.operatingExpenses,
          industry: comparable.industry,
        },
      });

      const reasonableCheck = isAdjustmentReasonable(capResult.netAdjustment, this.pli);

      appliedAdjustments.push({
        type: AdjustmentType.CAPACITY_UTILIZATION,
        amount: capResult.netAdjustment,
        percentageImpact: capResult.netAdjustment * 100,
        methodology: capResult.methodology,
        isMaterial: capResult.isMaterial,
        isReasonable: reasonableCheck.reasonable,
      });

      if (capResult.isMaterial && reasonableCheck.reasonable) {
        totalAdjustment += capResult.netAdjustment;
      }
    }

    // Apply Geographic Adjustment
    if (adjustmentsToApply.includes(AdjustmentType.GEOGRAPHIC)) {
      const geoResult = this.calculateGeographicAdjustment({
        testedPartyRegion: testedParty.region,
        comparableRegion: comparable.region,
        laborCostWeightage: 0.50,
        overheadWeightage: 0.30,
        marketWeightage: 0.20,
      });

      const reasonableCheck = isAdjustmentReasonable(geoResult.netAdjustment, this.pli);

      appliedAdjustments.push({
        type: AdjustmentType.GEOGRAPHIC,
        amount: geoResult.netAdjustment,
        percentageImpact: geoResult.netAdjustment * 100,
        methodology: geoResult.methodology,
        isMaterial: geoResult.isMaterial,
        isReasonable: reasonableCheck.reasonable,
      });

      if (geoResult.isMaterial && reasonableCheck.reasonable) {
        totalAdjustment += geoResult.netAdjustment;
      }
    }

    const adjustedMargin = originalMargin + totalAdjustment;
    const documentation = getRequiredDocumentation(adjustmentsToApply);

    return {
      originalEntity: comparable,
      originalMargin,
      adjustments: appliedAdjustments,
      totalAdjustment,
      adjustedMargin,
      adjustmentSummary: this.generateAdjustmentSummary(appliedAdjustments),
      documentation,
    };
  }

  /**
   * Perform full comparability analysis
   */
  performComparabilityAnalysis(
    testedParty: TestedPartyData,
    comparables: ComparableEntity[],
    adjustmentsToApply: AdjustmentType[],
    interestRate: number = WORKING_CAPITAL_PARAMETERS.interestRate
  ): ComparabilityAnalysisResult {
    // Calculate unadjusted margins
    const unadjustedMargins = comparables.map(
      (c) => c.financials.operatingProfit / c.financials.operatingExpenses
    );

    // Apply adjustments to all comparables
    const adjustedComparables = comparables.map((comparable) =>
      this.applyAllAdjustments(testedParty, comparable, adjustmentsToApply, interestRate)
    );

    const adjustedMargins = adjustedComparables.map((ac) => ac.adjustedMargin);

    // Calculate ranges
    const unadjustedRange = this.calculateRange(unadjustedMargins);
    const adjustedRange = this.calculateRange(adjustedMargins);

    // Calculate interquartile range for arm's length
    const sortedAdjusted = [...adjustedMargins].sort((a, b) => a - b);
    const armLengthRange = this.calculateInterquartileRange(sortedAdjusted);

    // Calculate total adjustment impact
    const totalAdjustmentImpact = adjustedRange.median - unadjustedRange.median;

    // Get all required documentation
    const documentation = getRequiredDocumentation(adjustmentsToApply);

    return {
      testedParty,
      comparables,
      adjustedComparables,
      unadjustedRange,
      adjustedRange,
      armLengthRange,
      totalAdjustmentImpact,
      recommendedAdjustments: adjustmentsToApply,
      documentationRequired: documentation,
    };
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private calculateDays(balance: number, turnover: number): number {
    if (turnover === 0) return 0;
    return (balance / turnover) * WORKING_CAPITAL_PARAMETERS.daysInYear;
  }

  private calculateRange(values: number[]): { min: number; max: number; median: number } {
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0] || 0;
    const max = sorted[sorted.length - 1] || 0;
    const median = this.calculateMedian(sorted);
    return { min, max, median };
  }

  private calculateMedian(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
      return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
    }
    return sortedValues[mid];
  }

  private calculateInterquartileRange(sortedValues: number[]): {
    lowerQuartile: number;
    median: number;
    upperQuartile: number;
  } {
    const n = sortedValues.length;
    const lowerQuartileIndex = Math.floor(n * 0.25);
    const medianIndex = Math.floor(n * 0.5);
    const upperQuartileIndex = Math.floor(n * 0.75);

    return {
      lowerQuartile: sortedValues[lowerQuartileIndex] || 0,
      median: sortedValues[medianIndex] || 0,
      upperQuartile: sortedValues[upperQuartileIndex] || 0,
    };
  }

  private generateAdjustmentSummary(adjustments: AppliedAdjustment[]): string {
    const materialAdjustments = adjustments.filter((a) => a.isMaterial && a.isReasonable);

    if (materialAdjustments.length === 0) {
      return "No material adjustments were required for this comparable.";
    }

    const summaryParts = materialAdjustments.map(
      (a) =>
        `${a.type.replace(/_/g, " ")}: ${(a.percentageImpact >= 0 ? "+" : "") + a.percentageImpact.toFixed(2)}%`
    );

    return `Adjustments applied: ${summaryParts.join("; ")}`;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createComparabilityAdjustmentsEngine(
  pli?: string
): ComparabilityAdjustmentsEngine {
  return new ComparabilityAdjustmentsEngine(pli);
}

let _comparabilityEngineInstance: ComparabilityAdjustmentsEngine | null = null;

export function getComparabilityAdjustmentsEngine(): ComparabilityAdjustmentsEngine {
  if (!_comparabilityEngineInstance) {
    _comparabilityEngineInstance = createComparabilityAdjustmentsEngine();
  }
  return _comparabilityEngineInstance;
}

// Re-export types and enums from constants
export {
  AdjustmentType,
  IndustryType,
  RiskType,
  AccountingStandard,
};
