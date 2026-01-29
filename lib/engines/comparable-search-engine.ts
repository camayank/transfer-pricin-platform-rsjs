/**
 * Comparable Search Engine
 * Orchestrates comparable database connectors for TP benchmarking
 */

import {
  ComparableConnector,
  ProwessConnector,
  CapitalineConnector,
  ComparableCompany,
  CompanyFinancials,
  PLICalculated,
  ComparableSearchCriteria,
  ComparableSearchResult,
  BenchmarkingSet,
  FunctionalProfile,
  DatabaseSource,
  createProwessConnector,
  createCapitalineConnector,
  getFunctionalProfiles,
  calculateBenchmarkingSet
} from "../connectors/comparable-connector";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ComparableEngineConfig {
  prowessApiKey?: string;
  capitalineApiKey?: string;
  preferredSource: DatabaseSource;
  enableCaching: boolean;
  cacheTTL: number;
  maxResultsPerSource: number;
}

export interface UnifiedSearchCriteria extends ComparableSearchCriteria {
  sources?: DatabaseSource[];
  mergeResults?: boolean;
}

export interface UnifiedSearchResult {
  companies: ComparableCompany[];
  totalFound: number;
  bySource: Record<DatabaseSource, number>;
  searchCriteria: UnifiedSearchCriteria;
  searchTime: number;
  appliedFilters: string[];
  rejectedCompanies?: {
    company: ComparableCompany;
    reason: string;
  }[];
}

export interface ComparabilityAnalysis {
  testedParty: {
    name: string;
    functionalProfile: FunctionalProfile;
    pli: PLICalculated;
  };
  comparableSet: ComparableCompany[];
  pliType: "opOc" | "opOr" | "opTa" | "opCe" | "berryRatio";
  benchmarkingSet: BenchmarkingSet;
  adjustment: {
    required: boolean;
    amount?: number;
    direction?: "increase" | "decrease";
    targetPli?: number;
  };
  summary: string;
}

export interface RejectionAnalysis {
  totalScreened: number;
  accepted: number;
  rejected: number;
  rejectionReasons: {
    relatedParty: number;
    persistentLosses: number;
    insufficientData: number;
    functionalDissimilarity: number;
    other: number;
  };
}

export interface WorkingCapitalAdjustment {
  company: ComparableCompany;
  originalPli: number;
  adjustedPli: number;
  adjustmentFactor: number;
  receivablesDays: number;
  payablesDays: number;
  inventoryDays: number;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: ComparableEngineConfig = {
  preferredSource: "PROWESS",
  enableCaching: true,
  cacheTTL: 86400000, // 24 hours
  maxResultsPerSource: 100
};

// =============================================================================
// PLI DESCRIPTIONS
// =============================================================================

export const PLI_DESCRIPTIONS: Record<string, { name: string; formula: string; bestFor: string[] }> = {
  opOc: {
    name: "Operating Profit to Operating Cost",
    formula: "Operating Profit / Operating Cost",
    bestFor: ["Contract manufacturing", "Contract R&D", "Captive service providers"]
  },
  opOr: {
    name: "Operating Profit to Operating Revenue (Net Margin)",
    formula: "Operating Profit / Operating Revenue",
    bestFor: ["Distribution activities", "Full-fledged manufacturers", "Service providers"]
  },
  opTa: {
    name: "Operating Profit to Total Assets (ROA)",
    formula: "Operating Profit / Total Assets",
    bestFor: ["Asset-intensive industries", "Manufacturing with significant assets"]
  },
  opCe: {
    name: "Operating Profit to Capital Employed (ROCE)",
    formula: "Operating Profit / Capital Employed",
    bestFor: ["Capital-intensive operations", "Infrastructure projects"]
  },
  berryRatio: {
    name: "Berry Ratio",
    formula: "Gross Profit / Operating Expenses",
    bestFor: ["Distribution activities", "Low value-adding services", "Buy-sell arrangements"]
  }
};

// =============================================================================
// MAIN ENGINE CLASS
// =============================================================================

export class ComparableSearchEngine {
  private config: ComparableEngineConfig;
  private prowessConnector: ProwessConnector;
  private capitalineConnector: CapitalineConnector;
  private searchCache: Map<string, { result: UnifiedSearchResult; expires: number }> = new Map();

  constructor(config?: Partial<ComparableEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.prowessConnector = createProwessConnector({
      apiKey: this.config.prowessApiKey
    });

    this.capitalineConnector = createCapitalineConnector({
      apiKey: this.config.capitalineApiKey
    });
  }

  /**
   * Get connector by source
   */
  private getConnector(source: DatabaseSource): ComparableConnector {
    switch (source) {
      case "PROWESS":
        return this.prowessConnector;
      case "CAPITALINE":
        return this.capitalineConnector;
      default:
        return this.prowessConnector;
    }
  }

  /**
   * Test all connections
   */
  async testConnections(): Promise<{
    prowess: { success: boolean; message: string };
    capitaline: { success: boolean; message: string };
  }> {
    const [prowessResult, capitalineResult] = await Promise.all([
      this.prowessConnector.testConnection(),
      this.capitalineConnector.testConnection()
    ]);

    return {
      prowess: { success: prowessResult.success, message: prowessResult.message },
      capitaline: { success: capitalineResult.success, message: capitalineResult.message }
    };
  }

  /**
   * Unified search across multiple databases
   */
  async search(criteria: UnifiedSearchCriteria): Promise<UnifiedSearchResult> {
    const startTime = Date.now();
    const sources = criteria.sources ?? [this.config.preferredSource];
    const mergeResults = criteria.mergeResults ?? true;

    // Check cache
    if (this.config.enableCaching) {
      const cacheKey = JSON.stringify(criteria);
      const cached = this.searchCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.result;
      }
    }

    // Search each source
    const searchPromises = sources.map(source =>
      this.getConnector(source).searchComparables({
        ...criteria,
        limit: this.config.maxResultsPerSource
      })
    );

    const results = await Promise.all(searchPromises);

    // Merge or concatenate results
    let companies: ComparableCompany[] = [];
    const bySource: Record<DatabaseSource, number> = {
      PROWESS: 0,
      CAPITALINE: 0,
      MCA: 0,
      MANUAL: 0
    };
    const appliedFilters: string[] = [];

    for (const result of results) {
      bySource[result.source] = result.totalFound;

      if (mergeResults) {
        // Deduplicate by CIN
        for (const company of result.companies) {
          if (!companies.some(c => c.cin === company.cin)) {
            companies.push(company);
          }
        }
      } else {
        companies.push(...result.companies);
      }

      appliedFilters.push(...result.appliedFilters);
    }

    // Apply overall limit
    if (criteria.limit) {
      companies = companies.slice(0, criteria.limit);
    }

    const unifiedResult: UnifiedSearchResult = {
      companies,
      totalFound: companies.length,
      bySource,
      searchCriteria: criteria,
      searchTime: Date.now() - startTime,
      appliedFilters: [...new Set(appliedFilters)]
    };

    // Cache result
    if (this.config.enableCaching) {
      const cacheKey = JSON.stringify(criteria);
      this.searchCache.set(cacheKey, {
        result: unifiedResult,
        expires: Date.now() + this.config.cacheTTL
      });
    }

    return unifiedResult;
  }

  /**
   * Get company by CIN
   */
  async getCompany(cin: string): Promise<ComparableCompany | null> {
    // Try preferred source first
    let company = await this.getConnector(this.config.preferredSource).getCompanyByCIN(cin);

    if (!company) {
      // Try other source
      const otherSource = this.config.preferredSource === "PROWESS" ? "CAPITALINE" : "PROWESS";
      company = await this.getConnector(otherSource).getCompanyByCIN(cin);
    }

    return company;
  }

  /**
   * Perform full comparability analysis
   */
  async performComparabilityAnalysis(
    testedParty: {
      name: string;
      functionalProfile: FunctionalProfile;
      financials: CompanyFinancials;
    },
    searchCriteria: UnifiedSearchCriteria,
    pliType: "opOc" | "opOr" | "opTa" | "opCe" | "berryRatio" = "opOc"
  ): Promise<ComparabilityAnalysis> {
    // Calculate tested party PLI
    const testedPartyPli = this.calculatePLI(testedParty.financials);

    // Search for comparables
    const searchResult = await this.search({
      ...searchCriteria,
      functionalProfile: testedParty.functionalProfile
    });

    // Calculate benchmarking set
    const benchmarkingSet = calculateBenchmarkingSet(
      searchResult.companies,
      pliType,
      testedPartyPli[pliType]
    );

    // Determine if adjustment is required
    const testedPliValue = testedPartyPli[pliType];
    const adjustment = this.calculateAdjustment(testedPliValue, benchmarkingSet);

    // Generate summary
    const summary = this.generateAnalysisSummary(
      testedParty.name,
      testedPliValue,
      benchmarkingSet,
      adjustment
    );

    return {
      testedParty: {
        name: testedParty.name,
        functionalProfile: testedParty.functionalProfile,
        pli: testedPartyPli
      },
      comparableSet: searchResult.companies,
      pliType,
      benchmarkingSet,
      adjustment,
      summary
    };
  }

  /**
   * Calculate PLI from financials
   */
  private calculatePLI(financials: CompanyFinancials): PLICalculated {
    const operatingProfit = financials.operatingProfit;
    const operatingCost = financials.operatingCost;
    const operatingRevenue = financials.operatingRevenue;
    const totalAssets = financials.totalAssets;
    const capitalEmployed = totalAssets - (financials.totalLiabilities - financials.interestExpense);
    const grossProfit = financials.grossProfit;
    const operatingExpenses = operatingCost - financials.employeeCost;

    return {
      opOc: operatingCost > 0 ? operatingProfit / operatingCost : 0,
      opOr: operatingRevenue > 0 ? operatingProfit / operatingRevenue : 0,
      opTa: totalAssets > 0 ? operatingProfit / totalAssets : 0,
      opCe: capitalEmployed > 0 ? operatingProfit / capitalEmployed : 0,
      berryRatio: operatingExpenses > 0 ? grossProfit / operatingExpenses : 0,
      ncpSales: operatingCost > 0 ? operatingProfit / operatingCost : 0
    };
  }

  /**
   * Calculate adjustment needed
   */
  private calculateAdjustment(
    testedPli: number,
    benchmark: BenchmarkingSet
  ): ComparabilityAnalysis["adjustment"] {
    if (testedPli >= benchmark.quartile25 && testedPli <= benchmark.quartile75) {
      return { required: false };
    }

    const targetPli = benchmark.median;
    const direction = testedPli < benchmark.quartile25 ? "increase" : "decrease";
    const amount = Math.abs(targetPli - testedPli);

    return {
      required: true,
      amount,
      direction,
      targetPli
    };
  }

  /**
   * Generate analysis summary
   */
  private generateAnalysisSummary(
    companyName: string,
    testedPli: number,
    benchmark: BenchmarkingSet,
    adjustment: ComparabilityAnalysis["adjustment"]
  ): string {
    const pliPercent = (testedPli * 100).toFixed(2);
    const q25Percent = (benchmark.quartile25 * 100).toFixed(2);
    const medianPercent = (benchmark.median * 100).toFixed(2);
    const q75Percent = (benchmark.quartile75 * 100).toFixed(2);

    let summary = `Comparability Analysis for ${companyName}:\n\n`;
    summary += `Tested Party ${benchmark.pliType.toUpperCase()}: ${pliPercent}%\n`;
    summary += `Arm's Length Range (IQR): ${q25Percent}% - ${q75Percent}%\n`;
    summary += `Median: ${medianPercent}%\n`;
    summary += `Comparables Used: ${benchmark.comparables.length}\n\n`;

    if (adjustment.required) {
      summary += `ADJUSTMENT REQUIRED\n`;
      summary += `Direction: ${adjustment.direction} margin\n`;
      summary += `To bring margin within arm's length range (target: ${(adjustment.targetPli! * 100).toFixed(2)}%)\n`;
    } else {
      summary += `NO ADJUSTMENT REQUIRED\n`;
      summary += `Tested party margin is within the arm's length range.\n`;
    }

    return summary;
  }

  /**
   * Apply working capital adjustment to comparables
   */
  applyWorkingCapitalAdjustment(
    comparables: ComparableCompany[],
    testedPartyWorkingCapital: {
      receivablesDays: number;
      payablesDays: number;
      inventoryDays: number;
    },
    adjustmentRate: number = 0.10 // 10% cost of capital assumption
  ): WorkingCapitalAdjustment[] {
    const adjustments: WorkingCapitalAdjustment[] = [];

    for (const company of comparables) {
      const financials = company.financials[0];
      if (!financials) continue;

      // Calculate comparable's working capital days (simplified)
      const comparableReceivables = (financials.currentAssets * 0.4 / financials.revenue) * 365;
      const comparablePayables = (financials.totalLiabilities * 0.3 / financials.totalCost) * 365;
      const comparableInventory = (financials.currentAssets * 0.3 / financials.totalCost) * 365;

      // Calculate working capital difference
      const wcDiff =
        (testedPartyWorkingCapital.receivablesDays - comparableReceivables) +
        (testedPartyWorkingCapital.inventoryDays - comparableInventory) -
        (testedPartyWorkingCapital.payablesDays - comparablePayables);

      // Calculate adjustment factor
      const adjustmentFactor = (wcDiff / 365) * adjustmentRate;

      // Adjust PLI
      const originalPli = company.averagePli.opOc;
      const adjustedPli = originalPli - adjustmentFactor;

      adjustments.push({
        company,
        originalPli,
        adjustedPli,
        adjustmentFactor,
        receivablesDays: comparableReceivables,
        payablesDays: comparablePayables,
        inventoryDays: comparableInventory
      });
    }

    return adjustments;
  }

  /**
   * Get rejection analysis
   */
  async getFilteringAnalysis(
    initialCriteria: UnifiedSearchCriteria
  ): Promise<RejectionAnalysis> {
    // Get all companies without filters
    const allCompanies = await this.search({
      ...initialCriteria,
      excludeRelatedPartyAbove: undefined,
      excludePersistentLosses: false,
      minYearsData: undefined
    });

    // Get filtered companies
    const filteredCompanies = await this.search(initialCriteria);

    // Analyze rejections
    const rejected = allCompanies.companies.filter(
      c => !filteredCompanies.companies.some(fc => fc.cin === c.cin)
    );

    const rejectionReasons = {
      relatedParty: 0,
      persistentLosses: 0,
      insufficientData: 0,
      functionalDissimilarity: 0,
      other: 0
    };

    for (const company of rejected) {
      if (initialCriteria.excludeRelatedPartyAbove !== undefined &&
          company.relatedPartyTransactions > initialCriteria.excludeRelatedPartyAbove) {
        rejectionReasons.relatedParty++;
      } else if (initialCriteria.excludePersistentLosses && company.persistentLosses) {
        rejectionReasons.persistentLosses++;
      } else if (initialCriteria.minYearsData !== undefined &&
                 company.yearsContinuousData < initialCriteria.minYearsData) {
        rejectionReasons.insufficientData++;
      } else if (initialCriteria.functionalProfile &&
                 company.functionalProfile !== initialCriteria.functionalProfile) {
        rejectionReasons.functionalDissimilarity++;
      } else {
        rejectionReasons.other++;
      }
    }

    return {
      totalScreened: allCompanies.totalFound,
      accepted: filteredCompanies.totalFound,
      rejected: rejected.length,
      rejectionReasons
    };
  }

  /**
   * Get recommended PLI for functional profile
   */
  getRecommendedPLI(functionalProfile: FunctionalProfile): "opOc" | "opOr" | "opTa" | "opCe" | "berryRatio" {
    const profileToPli: Record<FunctionalProfile, "opOc" | "opOr" | "opTa" | "opCe" | "berryRatio"> = {
      CONTRACT_MANUFACTURER: "opOc",
      FULL_FLEDGED_MANUFACTURER: "opOr",
      TOLL_MANUFACTURER: "opOc",
      DISTRIBUTOR: "opOr",
      COMMISSION_AGENT: "berryRatio",
      CONTRACT_RD: "opOc",
      FULL_FLEDGED_RD: "opOr",
      CAPTIVE_SERVICE_PROVIDER: "opOc",
      BPO_PROVIDER: "opOc",
      KPO_PROVIDER: "opOc",
      SOFTWARE_DEVELOPER: "opOc",
      IT_SERVICES: "opOc",
      MARKETING_SUPPORT: "berryRatio",
      HOLDING_COMPANY: "opTa"
    };

    return profileToPli[functionalProfile] ?? "opOc";
  }

  /**
   * Get PLI descriptions
   */
  getPLIDescriptions() {
    return PLI_DESCRIPTIONS;
  }

  /**
   * Get functional profiles
   */
  getFunctionalProfiles(): FunctionalProfile[] {
    return getFunctionalProfiles();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.searchCache.clear();
    this.prowessConnector.clearCache();
    this.capitalineConnector.clearCache();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createComparableSearchEngine = (
  config?: Partial<ComparableEngineConfig>
): ComparableSearchEngine => {
  return new ComparableSearchEngine(config);
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  ComparableCompany,
  CompanyFinancials,
  PLICalculated,
  ComparableSearchCriteria,
  BenchmarkingSet,
  FunctionalProfile,
  DatabaseSource
};

export {
  calculateBenchmarkingSet,
  getFunctionalProfiles
};

// =============================================================================
// VERSION INFO
// =============================================================================

export const COMPARABLE_ENGINE_VERSION = {
  version: "1.0.0",
  sources: ["PROWESS (CMIE)", "Capitaline"],
  lastUpdated: "2025-01-29",
  features: {
    unifiedSearch: true,
    comparabilityAnalysis: true,
    workingCapitalAdjustment: true,
    rejectionAnalysis: true,
    pliCalculation: true
  }
};
