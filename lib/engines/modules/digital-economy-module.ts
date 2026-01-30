/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Digital Economy Module
 *
 * Specialized module for digital economy transfer pricing including
 * Pillar One/Two analysis, user participation allocation, and digital profit split.
 * ================================================================================
 */

import {
  PILLAR_ONE_THRESHOLDS,
  PILLAR_TWO_THRESHOLDS,
  DigitalServiceType,
  DIGITAL_SERVICE_CHARACTERISTICS,
  USER_PARTICIPATION_FACTORS,
  MARKETING_INTANGIBLE_TYPES,
  DIGITAL_PROFIT_SPLIT_KEYS,
  DigitalServiceCharacteristics,
  UserParticipationFactor,
  AllocationKey,
  isInScopeForAmountA,
  isInScopeForGloBE,
  calculateAmountAReallocation,
  calculateGloBETopUp,
  getDigitalServiceCharacteristics,
  getApplicableProfitSplitKeys,
} from "../constants/digital-economy-rules";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface PillarOneInput {
  globalRevenue: number;
  profitBeforeTax: number;
  jurisdictionData: JurisdictionData[];
  serviceTypes: DigitalServiceType[];
  fiscalYear: number;
}

export interface JurisdictionData {
  jurisdictionCode: string;
  jurisdictionName: string;
  revenue: number;
  users: number;
  dataPoints: number;
  employeeCount: number;
  assets: number;
}

export interface PillarOneResult {
  amountAAnalysis: AmountAAnalysis;
  amountBAnalysis: AmountBAnalysis;
  totalReallocation: number;
  jurisdictionAllocations: JurisdictionAllocation[];
  methodology: string;
  documentation: string[];
}

export interface AmountAAnalysis {
  inScope: boolean;
  scopeReasons: string[];
  globalProfitMargin: number;
  residualProfit: number;
  amountAPool: number;
  allocationBasis: string;
}

export interface AmountBAnalysis {
  applicable: boolean;
  qualifyingActivities: string[];
  fixedReturn: number;
  returnRange: { min: number; max: number };
}

export interface JurisdictionAllocation {
  jurisdiction: string;
  revenueShare: number;
  userShare: number;
  allocatedAmount: number;
  existingTaxBase: number;
  incrementalAllocation: number;
}

export interface PillarTwoInput {
  globalRevenue: number;
  jurisdictionFinancials: GloBEJurisdictionData[];
  fiscalYear: number;
  parentJurisdiction: string;
}

export interface GloBEJurisdictionData {
  jurisdictionCode: string;
  jurisdictionName: string;
  profitBeforeTax: number;
  taxesPaid: number;
  payroll: number;
  tangibleAssets: number;
  coveredTaxes: number;
  hasQDMTT: boolean;
}

export interface PillarTwoResult {
  inScope: boolean;
  globalETR: number;
  jurisdictionAnalysis: GloBEJurisdictionAnalysis[];
  totalTopUpTax: number;
  iirExposure: number;
  utprExposure: number;
  recommendations: string[];
  documentation: string[];
}

export interface GloBEJurisdictionAnalysis {
  jurisdiction: string;
  profit: number;
  taxes: number;
  etr: number;
  minimumTax: number;
  substanceExclusion: number;
  topUpTax: number;
  effectiveTopUpRate: number;
  taxingJurisdiction: "iir" | "utpr" | "qdmtt" | "none";
}

export interface DigitalProfitSplitInput {
  serviceType: DigitalServiceType;
  combinedProfit: number;
  jurisdictionData: DigitalJurisdictionData[];
  intangibleContributions: IntangibleContribution[];
  routineFunctions: RoutineFunction[];
}

export interface DigitalJurisdictionData {
  jurisdictionCode: string;
  revenue: number;
  activeUsers: number;
  dataContribution: number;
  employeeCount: number;
  rdExpenditure: number;
  infrastructure: number;
}

export interface IntangibleContribution {
  entityName: string;
  jurisdiction: string;
  intangibleType: string;
  developmentCost: number;
  dempeScore: number;
}

export interface RoutineFunction {
  entityName: string;
  jurisdiction: string;
  functionType: string;
  cost: number;
  routineReturn: number;
}

export interface DigitalProfitSplitResult {
  residualProfitPool: number;
  routineReturns: { entity: string; return: number }[];
  residualAllocation: ResidualAllocation[];
  allocationKeys: AllocationKeyResult[];
  totalAllocatedProfit: number;
  methodology: string;
  oecdCompliance: string[];
  documentation: string[];
}

export interface ResidualAllocation {
  jurisdiction: string;
  allocatedProfit: number;
  allocationBasis: { key: string; share: number; contribution: number }[];
  percentageShare: number;
}

export interface AllocationKeyResult {
  key: string;
  weight: number;
  totalValue: number;
  jurisdictionValues: { jurisdiction: string; value: number; share: number }[];
}

export interface UserParticipationInput {
  serviceType: DigitalServiceType;
  jurisdictionData: UserJurisdictionData[];
  totalRevenue: number;
  totalProfit: number;
}

export interface UserJurisdictionData {
  jurisdiction: string;
  monthlyActiveUsers: number;
  dailyActiveUsers: number;
  userGeneratedContent: number;
  dataPointsCollected: number;
  engagementMinutes: number;
  transactionValue: number;
}

export interface UserParticipationResult {
  valueAllocation: UserValueAllocation[];
  allocationMethodology: string;
  factorWeights: { factor: string; weight: number }[];
  totalUserValue: number;
  jurisdictionShares: { jurisdiction: string; share: number; value: number }[];
}

export interface UserValueAllocation {
  jurisdiction: string;
  factors: { factor: string; value: number; normalizedValue: number; contribution: number }[];
  totalScore: number;
  allocatedValue: number;
  percentageShare: number;
}

export interface MarketingIntangibleInput {
  intangibleType: string;
  jurisdictions: string[];
  revenueByJurisdiction: Record<string, number>;
  brandMetrics: BrandMetrics;
  historicalCosts: number;
  expectedLife: number;
}

export interface BrandMetrics {
  brandRecognition: number; // 0-100
  customerLoyalty: number; // 0-100
  marketPosition: "leader" | "challenger" | "follower" | "niche";
  premiumPricing: number; // % premium over generic
}

export interface MarketingIntangibleResult {
  valuationMethod: string;
  totalValue: number;
  royaltyRate: number;
  jurisdictionAllocations: { jurisdiction: string; value: number; royalty: number }[];
  methodology: string;
  documentation: string[];
}

// =============================================================================
// DIGITAL ECONOMY MODULE CLASS
// =============================================================================

export class DigitalEconomyModule {
  // ===========================================================================
  // PILLAR ONE ANALYSIS
  // ===========================================================================

  /**
   * Analyze Pillar One Amount A and Amount B applicability
   */
  analyzePillarOne(input: PillarOneInput): PillarOneResult {
    const profitMargin = input.profitBeforeTax / input.globalRevenue;

    // Amount A Analysis
    const amountAScopeCheck = isInScopeForAmountA(input.globalRevenue, profitMargin);
    let amountAPool = 0;
    let residualProfit = 0;

    if (amountAScopeCheck.inScope) {
      const threshold = PILLAR_ONE_THRESHOLDS.amountA.profitabilityThreshold;
      residualProfit = (profitMargin - threshold) * input.globalRevenue;
      amountAPool = residualProfit * PILLAR_ONE_THRESHOLDS.amountA.reallocationPercentage;
    }

    const amountAAnalysis: AmountAAnalysis = {
      inScope: amountAScopeCheck.inScope,
      scopeReasons: amountAScopeCheck.reasons,
      globalProfitMargin: profitMargin,
      residualProfit,
      amountAPool,
      allocationBasis: "Revenue-based allocation to market jurisdictions",
    };

    // Amount B Analysis
    const amountBAnalysis = this.analyzeAmountB(input.jurisdictionData);

    // Jurisdiction allocations
    const jurisdictionAllocations = this.calculateJurisdictionAllocations(
      input.jurisdictionData,
      input.globalRevenue,
      amountAPool
    );

    const totalReallocation = jurisdictionAllocations.reduce(
      (sum, ja) => sum + ja.incrementalAllocation,
      0
    );

    return {
      amountAAnalysis,
      amountBAnalysis,
      totalReallocation,
      jurisdictionAllocations,
      methodology: this.generatePillarOneMethodology(input, amountAAnalysis),
      documentation: [
        "Global consolidated financial statements",
        "Revenue by jurisdiction",
        "User data by jurisdiction",
        "Segmented profit analysis",
        "Nexus analysis for each market",
      ],
    };
  }

  private analyzeAmountB(jurisdictionData: JurisdictionData[]): AmountBAnalysis {
    const qualifyingActivities = [...PILLAR_ONE_THRESHOLDS.amountB.qualifyingCriteria];
    const returnRange = PILLAR_ONE_THRESHOLDS.amountB.returnOnSales.distribution;

    return {
      applicable: true,
      qualifyingActivities,
      fixedReturn: (returnRange.min + returnRange.max) / 2,
      returnRange,
    };
  }

  private calculateJurisdictionAllocations(
    jurisdictionData: JurisdictionData[],
    globalRevenue: number,
    amountAPool: number
  ): JurisdictionAllocation[] {
    const totalUsers = jurisdictionData.reduce((sum, j) => sum + j.users, 0);

    return jurisdictionData.map((jd) => {
      const revenueShare = jd.revenue / globalRevenue;
      const userShare = totalUsers > 0 ? jd.users / totalUsers : 0;

      // Weighted allocation (70% revenue, 30% users)
      const weightedShare = revenueShare * 0.7 + userShare * 0.3;
      const allocatedAmount = amountAPool * weightedShare;

      return {
        jurisdiction: jd.jurisdictionCode,
        revenueShare,
        userShare,
        allocatedAmount,
        existingTaxBase: jd.revenue * 0.10, // Assumed existing profit
        incrementalAllocation: allocatedAmount,
      };
    });
  }

  private generatePillarOneMethodology(
    input: PillarOneInput,
    amountAAnalysis: AmountAAnalysis
  ): string {
    return (
      `PILLAR ONE ANALYSIS\n\n` +
      `Fiscal Year: ${input.fiscalYear}\n` +
      `Global Revenue: ${input.globalRevenue.toLocaleString()}\n` +
      `Profit Margin: ${(amountAAnalysis.globalProfitMargin * 100).toFixed(1)}%\n\n` +
      `AMOUNT A ASSESSMENT:\n` +
      `In Scope: ${amountAAnalysis.inScope ? "Yes" : "No"}\n` +
      (amountAAnalysis.inScope
        ? `Residual Profit: ${amountAAnalysis.residualProfit.toLocaleString()}\n` +
          `Amount A Pool (25%): ${amountAAnalysis.amountAPool.toLocaleString()}\n`
        : `Reason: ${amountAAnalysis.scopeReasons.join("; ")}\n`) +
      `\nAMOUNT B:\n` +
      `Simplified return for baseline marketing/distribution activities.`
    );
  }

  // ===========================================================================
  // PILLAR TWO ANALYSIS
  // ===========================================================================

  /**
   * Analyze Pillar Two GloBE rules exposure
   */
  analyzePillarTwo(input: PillarTwoInput): PillarTwoResult {
    const inScope = isInScopeForGloBE(input.globalRevenue);

    if (!inScope) {
      return {
        inScope: false,
        globalETR: 0,
        jurisdictionAnalysis: [],
        totalTopUpTax: 0,
        iirExposure: 0,
        utprExposure: 0,
        recommendations: ["Group below EUR 750M revenue threshold - GloBE rules not applicable"],
        documentation: [],
      };
    }

    // Calculate global ETR
    const totalProfit = input.jurisdictionFinancials.reduce((sum, j) => sum + j.profitBeforeTax, 0);
    const totalTax = input.jurisdictionFinancials.reduce((sum, j) => sum + j.taxesPaid, 0);
    const globalETR = totalTax / totalProfit;

    // Analyze each jurisdiction
    const jurisdictionAnalysis: GloBEJurisdictionAnalysis[] = input.jurisdictionFinancials.map((jd) => {
      const result = calculateGloBETopUp(
        jd.profitBeforeTax,
        jd.taxesPaid,
        jd.payroll,
        jd.tangibleAssets,
        input.fiscalYear
      );

      // Determine which rule applies
      let taxingJurisdiction: "iir" | "utpr" | "qdmtt" | "none" = "none";
      if (result.topUpTax > 0) {
        if (jd.hasQDMTT) {
          taxingJurisdiction = "qdmtt";
        } else if (jd.jurisdictionCode === input.parentJurisdiction) {
          taxingJurisdiction = "iir";
        } else {
          taxingJurisdiction = "utpr";
        }
      }

      return {
        jurisdiction: jd.jurisdictionCode,
        profit: jd.profitBeforeTax,
        taxes: jd.taxesPaid,
        etr: result.etr,
        minimumTax: jd.profitBeforeTax * PILLAR_TWO_THRESHOLDS.globe.minimumTaxRate,
        substanceExclusion: result.substanceExclusion,
        topUpTax: result.topUpTax,
        effectiveTopUpRate: jd.profitBeforeTax > 0 ? result.topUpTax / jd.profitBeforeTax : 0,
        taxingJurisdiction,
      };
    });

    const totalTopUpTax = jurisdictionAnalysis.reduce((sum, ja) => sum + ja.topUpTax, 0);
    const iirExposure = jurisdictionAnalysis
      .filter((ja) => ja.taxingJurisdiction === "iir")
      .reduce((sum, ja) => sum + ja.topUpTax, 0);
    const utprExposure = jurisdictionAnalysis
      .filter((ja) => ja.taxingJurisdiction === "utpr")
      .reduce((sum, ja) => sum + ja.topUpTax, 0);

    const recommendations = this.generateGloBERecommendations(jurisdictionAnalysis);

    return {
      inScope: true,
      globalETR,
      jurisdictionAnalysis,
      totalTopUpTax,
      iirExposure,
      utprExposure,
      recommendations,
      documentation: [
        "Consolidated financial statements",
        "Jurisdiction-by-jurisdiction profit analysis",
        "Tax expense breakdown by jurisdiction",
        "Payroll and tangible asset data",
        "QDMTT status by jurisdiction",
      ],
    };
  }

  private generateGloBERecommendations(
    jurisdictionAnalysis: GloBEJurisdictionAnalysis[]
  ): string[] {
    const recommendations: string[] = [];
    const lowETRJurisdictions = jurisdictionAnalysis.filter(
      (ja) => ja.etr < PILLAR_TWO_THRESHOLDS.globe.minimumTaxRate && ja.profit > 0
    );

    if (lowETRJurisdictions.length > 0) {
      recommendations.push(
        `${lowETRJurisdictions.length} jurisdiction(s) with ETR below 15% minimum`
      );
      lowETRJurisdictions.forEach((j) => {
        recommendations.push(
          `  - ${j.jurisdiction}: ETR ${(j.etr * 100).toFixed(1)}%, Top-up tax: ${j.topUpTax.toLocaleString()}`
        );
      });
    }

    recommendations.push(
      "Consider QDMTT adoption in low-tax jurisdictions to retain top-up tax locally"
    );
    recommendations.push(
      "Review substance-based exclusion optimization (payroll and tangible assets)"
    );

    return recommendations;
  }

  // ===========================================================================
  // DIGITAL PROFIT SPLIT
  // ===========================================================================

  /**
   * Calculate profit split for digital services
   */
  calculateDigitalProfitSplit(input: DigitalProfitSplitInput): DigitalProfitSplitResult {
    // Step 1: Calculate routine returns
    const routineReturns = input.routineFunctions.map((rf) => ({
      entity: rf.entityName,
      return: rf.cost * rf.routineReturn,
    }));

    const totalRoutineReturn = routineReturns.reduce((sum, rr) => sum + rr.return, 0);
    const residualProfitPool = input.combinedProfit - totalRoutineReturn;

    // Step 2: Get applicable allocation keys
    const allocationKeys = getApplicableProfitSplitKeys(input.serviceType);

    // Step 3: Calculate allocation key results
    const allocationKeyResults = this.calculateAllocationKeyResults(
      allocationKeys,
      input.jurisdictionData
    );

    // Step 4: Calculate residual allocation
    const residualAllocation = this.calculateResidualAllocation(
      input.jurisdictionData,
      allocationKeyResults,
      residualProfitPool
    );

    const totalAllocatedProfit =
      totalRoutineReturn + residualAllocation.reduce((sum, ra) => sum + ra.allocatedProfit, 0);

    return {
      residualProfitPool,
      routineReturns,
      residualAllocation,
      allocationKeys: allocationKeyResults,
      totalAllocatedProfit,
      methodology: this.generateProfitSplitMethodology(input),
      oecdCompliance: [
        "Contribution analysis based on DEMPE functions",
        "Allocation keys reflect value drivers",
        "Residual profit split per OECD Guidelines Chapter II",
        "Routine functions remunerated first",
      ],
      documentation: [
        "Combined profit calculation",
        "Routine function analysis",
        "Allocation key data sources",
        "DEMPE contribution analysis",
        "Value chain analysis",
      ],
    };
  }

  private calculateAllocationKeyResults(
    allocationKeys: AllocationKey[],
    jurisdictionData: DigitalJurisdictionData[]
  ): AllocationKeyResult[] {
    return allocationKeys.map((key) => {
      const jurisdictionValues = jurisdictionData.map((jd) => {
        let value = 0;
        switch (key.key) {
          case "Revenue by Jurisdiction":
            value = jd.revenue;
            break;
          case "User/Customer Base":
            value = jd.activeUsers;
            break;
          case "Data Generated":
            value = jd.dataContribution;
            break;
          case "R&D Expenditure":
            value = jd.rdExpenditure;
            break;
          case "Infrastructure/Assets":
            value = jd.infrastructure;
            break;
          case "Personnel":
            value = jd.employeeCount;
            break;
        }
        return { jurisdiction: jd.jurisdictionCode, value, share: 0 };
      });

      const totalValue = jurisdictionValues.reduce((sum, jv) => sum + jv.value, 0);
      jurisdictionValues.forEach((jv) => {
        jv.share = totalValue > 0 ? jv.value / totalValue : 0;
      });

      return {
        key: key.key,
        weight: key.weight,
        totalValue,
        jurisdictionValues,
      };
    });
  }

  private calculateResidualAllocation(
    jurisdictionData: DigitalJurisdictionData[],
    allocationKeyResults: AllocationKeyResult[],
    residualProfitPool: number
  ): ResidualAllocation[] {
    return jurisdictionData.map((jd) => {
      const allocationBasis = allocationKeyResults.map((akr) => {
        const jurisdictionValue = akr.jurisdictionValues.find(
          (jv) => jv.jurisdiction === jd.jurisdictionCode
        );
        return {
          key: akr.key,
          share: jurisdictionValue?.share || 0,
          contribution: (jurisdictionValue?.share || 0) * akr.weight,
        };
      });

      const percentageShare = allocationBasis.reduce((sum, ab) => sum + ab.contribution, 0);
      const allocatedProfit = residualProfitPool * percentageShare;

      return {
        jurisdiction: jd.jurisdictionCode,
        allocatedProfit,
        allocationBasis,
        percentageShare,
      };
    });
  }

  private generateProfitSplitMethodology(input: DigitalProfitSplitInput): string {
    const characteristics = getDigitalServiceCharacteristics(input.serviceType);

    return (
      `DIGITAL PROFIT SPLIT METHODOLOGY\n\n` +
      `Service Type: ${input.serviceType}\n` +
      `User Participation Level: ${characteristics.userParticipationLevel}\n` +
      `Data Intensity: ${characteristics.dataIntensity}\n\n` +
      `APPROACH:\n` +
      `1. Residual Profit Split Method applied\n` +
      `2. Routine functions remunerated at arm's length\n` +
      `3. Residual profit allocated based on contribution analysis\n\n` +
      `KEY PROFIT SPLIT FACTORS:\n` +
      characteristics.typicalProfitSplitFactors.map((f) => `- ${f}`).join("\n")
    );
  }

  // ===========================================================================
  // USER PARTICIPATION ANALYSIS
  // ===========================================================================

  /**
   * Analyze user participation value allocation
   */
  analyzeUserParticipation(input: UserParticipationInput): UserParticipationResult {
    const characteristics = getDigitalServiceCharacteristics(input.serviceType);
    const applicableFactors = USER_PARTICIPATION_FACTORS.filter((f) =>
      f.applicableServices.includes(input.serviceType)
    );

    // Normalize factor weights
    const totalWeight = applicableFactors.reduce((sum, f) => sum + f.weight, 0);
    const factorWeights = applicableFactors.map((f) => ({
      factor: f.factor,
      weight: f.weight / totalWeight,
    }));

    // Calculate value allocation
    const valueAllocation: UserValueAllocation[] = input.jurisdictionData.map((jd) => {
      const factors = applicableFactors.map((f) => {
        let value = 0;
        switch (f.factor) {
          case "Active User Base":
            value = jd.monthlyActiveUsers;
            break;
          case "User-Generated Content":
            value = jd.userGeneratedContent;
            break;
          case "Data Contribution":
            value = jd.dataPointsCollected;
            break;
          case "Network Effects":
            value = jd.monthlyActiveUsers * Math.log(jd.monthlyActiveUsers + 1);
            break;
          case "Engagement Metrics":
            value = jd.engagementMinutes;
            break;
          case "Transaction Value":
            value = jd.transactionValue;
            break;
        }
        return { factor: f.factor, value, normalizedValue: 0, contribution: 0 };
      });

      return {
        jurisdiction: jd.jurisdiction,
        factors,
        totalScore: 0,
        allocatedValue: 0,
        percentageShare: 0,
      };
    });

    // Normalize values across jurisdictions
    applicableFactors.forEach((af, index) => {
      const totalValue = valueAllocation.reduce(
        (sum, va) => sum + va.factors[index].value,
        0
      );
      valueAllocation.forEach((va) => {
        va.factors[index].normalizedValue =
          totalValue > 0 ? va.factors[index].value / totalValue : 0;
        va.factors[index].contribution =
          va.factors[index].normalizedValue * factorWeights[index].weight;
      });
    });

    // Calculate total scores
    const totalUserValue = input.totalProfit * (characteristics.userParticipationLevel === "high" ? 0.30 :
      characteristics.userParticipationLevel === "medium" ? 0.20 : 0.10);

    valueAllocation.forEach((va) => {
      va.totalScore = va.factors.reduce((sum, f) => sum + f.contribution, 0);
    });

    const totalScore = valueAllocation.reduce((sum, va) => sum + va.totalScore, 0);

    valueAllocation.forEach((va) => {
      va.percentageShare = totalScore > 0 ? va.totalScore / totalScore : 0;
      va.allocatedValue = totalUserValue * va.percentageShare;
    });

    return {
      valueAllocation,
      allocationMethodology: `User participation value allocated based on ${characteristics.userParticipationLevel} participation level`,
      factorWeights,
      totalUserValue,
      jurisdictionShares: valueAllocation.map((va) => ({
        jurisdiction: va.jurisdiction,
        share: va.percentageShare,
        value: va.allocatedValue,
      })),
    };
  }

  // ===========================================================================
  // MARKETING INTANGIBLES
  // ===========================================================================

  /**
   * Value marketing intangibles for digital businesses
   */
  valueMarketingIntangibles(input: MarketingIntangibleInput): MarketingIntangibleResult {
    const intangibleType = MARKETING_INTANGIBLE_TYPES.find(
      (t) => t.type.toLowerCase().includes(input.intangibleType.toLowerCase())
    ) || MARKETING_INTANGIBLE_TYPES[0];

    // Calculate royalty rate based on brand metrics
    const baseRoyalty = (intangibleType.typicalRoyaltyRange.min + intangibleType.typicalRoyaltyRange.max) / 2;
    const brandFactor = (input.brandMetrics.brandRecognition / 100) * 0.3 +
      (input.brandMetrics.customerLoyalty / 100) * 0.3 +
      this.getMarketPositionFactor(input.brandMetrics.marketPosition) * 0.2 +
      Math.min(input.brandMetrics.premiumPricing / 50, 1) * 0.2;

    const royaltyRate = baseRoyalty * (0.5 + brandFactor);

    // Calculate total value using Relief from Royalty
    const totalRevenue = Object.values(input.revenueByJurisdiction).reduce((sum, r) => sum + r, 0);
    const annualRoyalty = totalRevenue * (royaltyRate / 100);
    const discountRate = 0.12; // 12% discount rate
    const totalValue = this.calculatePresentValue(annualRoyalty, discountRate, input.expectedLife);

    // Allocate to jurisdictions
    const jurisdictionAllocations = input.jurisdictions.map((j) => {
      const jurisdictionRevenue = input.revenueByJurisdiction[j] || 0;
      const revenueShare = totalRevenue > 0 ? jurisdictionRevenue / totalRevenue : 0;
      return {
        jurisdiction: j,
        value: totalValue * revenueShare,
        royalty: annualRoyalty * revenueShare,
      };
    });

    return {
      valuationMethod: "Relief from Royalty Method",
      totalValue,
      royaltyRate,
      jurisdictionAllocations,
      methodology: this.generateIntangibleMethodology(input, intangibleType, royaltyRate),
      documentation: [
        "Brand valuation report",
        "Royalty rate benchmarking study",
        "Revenue allocation by jurisdiction",
        "Brand metrics and recognition data",
        "Comparable royalty agreements",
      ],
    };
  }

  private getMarketPositionFactor(position: string): number {
    switch (position) {
      case "leader": return 1.0;
      case "challenger": return 0.75;
      case "follower": return 0.50;
      case "niche": return 0.60;
      default: return 0.50;
    }
  }

  private calculatePresentValue(annualAmount: number, discountRate: number, years: number): number {
    let pv = 0;
    for (let i = 1; i <= years; i++) {
      pv += annualAmount / Math.pow(1 + discountRate, i);
    }
    return pv;
  }

  private generateIntangibleMethodology(
    input: MarketingIntangibleInput,
    intangibleType: typeof MARKETING_INTANGIBLE_TYPES[0],
    royaltyRate: number
  ): string {
    return (
      `MARKETING INTANGIBLE VALUATION\n\n` +
      `Intangible Type: ${input.intangibleType}\n` +
      `Valuation Method: Relief from Royalty\n\n` +
      `The royalty rate of ${royaltyRate.toFixed(2)}% has been determined based on:\n` +
      `- Brand recognition: ${input.brandMetrics.brandRecognition}/100\n` +
      `- Customer loyalty: ${input.brandMetrics.customerLoyalty}/100\n` +
      `- Market position: ${input.brandMetrics.marketPosition}\n` +
      `- Premium pricing ability: ${input.brandMetrics.premiumPricing}%\n\n` +
      `Comparable royalty range: ${intangibleType.typicalRoyaltyRange.min}% - ${intangibleType.typicalRoyaltyRange.max}%`
    );
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createDigitalEconomyModule(): DigitalEconomyModule {
  return new DigitalEconomyModule();
}

let _digitalEconomyModuleInstance: DigitalEconomyModule | null = null;

export function getDigitalEconomyModule(): DigitalEconomyModule {
  if (!_digitalEconomyModuleInstance) {
    _digitalEconomyModuleInstance = createDigitalEconomyModule();
  }
  return _digitalEconomyModuleInstance;
}

// Re-export types
export { DigitalServiceType };
