/**
 * Interest Rate Engine
 * Orchestrates interest rate connectors for TP loan benchmarking
 */

import {
  InterestRateConnector,
  SOFRConnector,
  MIBORConnector,
  EURIBORConnector,
  InterestRate,
  InterestRateType,
  Currency,
  LoanPricingInput,
  LoanPricingResult,
  HistoricalRateQuery,
  CURRENT_BENCHMARK_RATES,
  RATE_INFO,
  CREDIT_SPREADS,
  createSOFRConnector,
  createMIBORConnector,
  createEURIBORConnector,
  getSupportedRateTypes,
  getRateInfo,
  getRatesByCurrency,
  getCreditSpread,
  getRecommendedBenchmark,
  isRateAvailable
} from "../connectors/interest-rate-connector";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface InterestRateEngineConfig {
  enableCaching: boolean;
  cacheTTL: number;
  enableHistorical: boolean;
}

export interface TPLoanBenchmarkInput {
  loanAmount: number;
  currency: Currency;
  tenor: number; // months
  loanType: "intercompany" | "external";
  borrowerCreditRating?: string;
  lenderCreditRating?: string;
  secured: boolean;
  relatedParty: boolean;
}

export interface TPLoanBenchmarkResult {
  benchmarkRate: InterestRate;
  creditSpread: number;
  securityAdjustment: number;
  tenorAdjustment: number;
  totalSpread: number;
  armLengthRate: number;
  armLengthRangeMin: number;
  armLengthRangeMax: number;
  annualInterest: number;
  methodology: string;
  supportingRates: InterestRate[];
  recommendations: string[];
}

export interface RateTrendAnalysis {
  rateType: InterestRateType;
  currentRate: number;
  averageRate: number;
  minRate: number;
  maxRate: number;
  trend: "increasing" | "decreasing" | "stable";
  volatility: number;
  period: { start: string; end: string };
}

export interface SafeHarbourLoanResult {
  eligible: boolean;
  safeHarbourRate: number;
  benchmarkRate: InterestRate;
  spread: number;
  message: string;
  ruleReference: string;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: InterestRateEngineConfig = {
  enableCaching: true,
  cacheTTL: 3600000, // 1 hour
  enableHistorical: true
};

// =============================================================================
// SAFE HARBOUR RULES FOR LOANS (India)
// =============================================================================

const SAFE_HARBOUR_LOAN_SPREADS: Record<string, { minSpread: number; maxSpread: number }> = {
  // As per Indian Safe Harbour Rules for AY 2023-24 onwards
  "USD_AAA": { minSpread: 150, maxSpread: 350 },
  "USD_AA": { minSpread: 175, maxSpread: 400 },
  "USD_A": { minSpread: 200, maxSpread: 450 },
  "USD_BBB": { minSpread: 250, maxSpread: 500 },
  "USD_BB": { minSpread: 350, maxSpread: 600 },
  "USD_B": { minSpread: 450, maxSpread: 750 },
  "INR_AAA": { minSpread: 100, maxSpread: 300 },
  "INR_AA": { minSpread: 125, maxSpread: 350 },
  "INR_A": { minSpread: 150, maxSpread: 400 },
  "INR_BBB": { minSpread: 200, maxSpread: 450 },
  "EUR_AAA": { minSpread: 125, maxSpread: 325 },
  "EUR_AA": { minSpread: 150, maxSpread: 375 },
  "EUR_A": { minSpread: 175, maxSpread: 425 }
};

// =============================================================================
// MAIN ENGINE CLASS
// =============================================================================

export class InterestRateEngine {
  private config: InterestRateEngineConfig;
  private sofrConnector: SOFRConnector;
  private miborConnector: MIBORConnector;
  private euriborConnector: EURIBORConnector;
  private rateCache: Map<string, { rate: InterestRate; expires: number }> = new Map();

  constructor(config?: Partial<InterestRateEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sofrConnector = createSOFRConnector();
    this.miborConnector = createMIBORConnector();
    this.euriborConnector = createEURIBORConnector();
  }

  /**
   * Get connector for a rate type
   */
  private getConnectorForRate(rateType: InterestRateType): InterestRateConnector {
    if (rateType.startsWith("SOFR")) {
      return this.sofrConnector;
    } else if (rateType.startsWith("MIBOR") || rateType.startsWith("SBI") || rateType.startsWith("RBI")) {
      return this.miborConnector;
    } else if (rateType.startsWith("EURIBOR") || rateType === "ESTR") {
      return this.euriborConnector;
    }
    throw new Error(`No connector available for rate type: ${rateType}`);
  }

  /**
   * Test all connections
   */
  async testConnections(): Promise<{
    sofr: { success: boolean; message: string };
    mibor: { success: boolean; message: string };
    euribor: { success: boolean; message: string };
  }> {
    const [sofrResult, miborResult, euriborResult] = await Promise.all([
      this.sofrConnector.testConnection(),
      this.miborConnector.testConnection(),
      this.euriborConnector.testConnection()
    ]);

    return {
      sofr: { success: sofrResult.success, message: sofrResult.message },
      mibor: { success: miborResult.success, message: miborResult.message },
      euribor: { success: euriborResult.success, message: euriborResult.message }
    };
  }

  /**
   * Get current rate
   */
  async getRate(rateType: InterestRateType): Promise<InterestRate> {
    // Check cache
    if (this.config.enableCaching) {
      const cached = this.rateCache.get(rateType);
      if (cached && cached.expires > Date.now()) {
        return cached.rate;
      }
    }

    const connector = this.getConnectorForRate(rateType);
    const rate = await connector.fetchRate(rateType);

    if (this.config.enableCaching) {
      this.rateCache.set(rateType, { rate, expires: Date.now() + this.config.cacheTTL });
    }

    return rate;
  }

  /**
   * Get all rates for a currency
   */
  async getRatesForCurrency(currency: Currency): Promise<InterestRate[]> {
    const rateTypes = getRatesByCurrency(currency);
    const rates: InterestRate[] = [];

    for (const rateType of rateTypes) {
      if (isRateAvailable(rateType)) {
        try {
          const rate = await this.getRate(rateType);
          rates.push(rate);
        } catch {
          // Skip unavailable rates
        }
      }
    }

    return rates;
  }

  /**
   * Get historical rates
   */
  async getHistoricalRates(query: HistoricalRateQuery): Promise<InterestRate[]> {
    if (!this.config.enableHistorical) {
      throw new Error("Historical rates are disabled");
    }

    const connector = this.getConnectorForRate(query.rateType);
    return connector.fetchHistoricalRates(query);
  }

  /**
   * Calculate loan pricing
   */
  async calculateLoanPricing(input: LoanPricingInput): Promise<LoanPricingResult> {
    const benchmarkRate = await this.getRate(input.benchmarkRate);
    const spreadBps = input.spread;
    const spreadPercent = spreadBps / 100;

    const allInRate = benchmarkRate.rate + spreadPercent;
    const annualInterest = input.principal * (allInRate / 100);
    const monthlyInterest = annualInterest / 12;

    return {
      benchmarkRate: benchmarkRate.rate,
      spread: spreadPercent,
      allInRate,
      annualInterest,
      monthlyInterest,
      rateSource: benchmarkRate.source,
      effectiveDate: benchmarkRate.effectiveDate
    };
  }

  /**
   * Benchmark intercompany loan for transfer pricing
   */
  async benchmarkTPLoan(input: TPLoanBenchmarkInput): Promise<TPLoanBenchmarkResult> {
    // Get recommended benchmark rate
    const recommendedRateType = getRecommendedBenchmark(input.currency);
    const benchmarkRate = await this.getRate(recommendedRateType);

    // Calculate credit spread
    const borrowerRating = input.borrowerCreditRating ?? "BBB";
    const creditSpread = getCreditSpread(borrowerRating);

    // Security adjustment (secured loans get lower spread)
    const securityAdjustment = input.secured ? -25 : 0;

    // Tenor adjustment (longer tenor = higher spread)
    let tenorAdjustment = 0;
    if (input.tenor > 60) tenorAdjustment = 50;
    else if (input.tenor > 36) tenorAdjustment = 25;
    else if (input.tenor > 12) tenorAdjustment = 10;

    // Total spread
    const totalSpread = creditSpread + securityAdjustment + tenorAdjustment;
    const totalSpreadPercent = totalSpread / 100;

    // Arm's length rate
    const armLengthRate = benchmarkRate.rate + totalSpreadPercent;

    // Range (±50 bps)
    const armLengthRangeMin = armLengthRate - 0.5;
    const armLengthRangeMax = armLengthRate + 0.5;

    // Annual interest
    const annualInterest = input.loanAmount * (armLengthRate / 100);

    // Get supporting rates
    const supportingRates: InterestRate[] = [];
    const currencyRates = getRatesByCurrency(input.currency);
    for (const rateType of currencyRates.slice(0, 3)) {
      if (isRateAvailable(rateType)) {
        try {
          const rate = await this.getRate(rateType);
          supportingRates.push(rate);
        } catch {
          // Skip
        }
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (!input.secured) {
      recommendations.push("Consider obtaining collateral to justify lower interest rate");
    }
    if (input.tenor > 60) {
      recommendations.push("Long tenor increases risk premium; consider shorter loan terms");
    }
    if (borrowerRating === "BBB" || borrowerRating === "BB") {
      recommendations.push("Credit rating impacts spread significantly; consider credit enhancement");
    }
    recommendations.push(`Benchmark rate ${recommendedRateType} is the recommended reference for ${input.currency} loans`);

    return {
      benchmarkRate,
      creditSpread: creditSpread / 100,
      securityAdjustment: securityAdjustment / 100,
      tenorAdjustment: tenorAdjustment / 100,
      totalSpread: totalSpreadPercent,
      armLengthRate,
      armLengthRangeMin,
      armLengthRangeMax,
      annualInterest,
      methodology: `${recommendedRateType} + Credit Spread (${borrowerRating}) + Adjustments`,
      supportingRates,
      recommendations
    };
  }

  /**
   * Check safe harbour eligibility for loan
   */
  async checkSafeHarbourLoan(
    currency: Currency,
    creditRating: string,
    proposedSpread: number // in basis points
  ): Promise<SafeHarbourLoanResult> {
    const key = `${currency}_${creditRating.toUpperCase()}`;
    const safeHarbourRule = SAFE_HARBOUR_LOAN_SPREADS[key];

    const recommendedRateType = getRecommendedBenchmark(currency);
    const benchmarkRate = await this.getRate(recommendedRateType);

    if (!safeHarbourRule) {
      return {
        eligible: false,
        safeHarbourRate: 0,
        benchmarkRate,
        spread: proposedSpread / 100,
        message: `No safe harbour rule available for ${currency} loans with ${creditRating} rating`,
        ruleReference: "Rule 10TD"
      };
    }

    const { minSpread, maxSpread } = safeHarbourRule;
    const eligible = proposedSpread >= minSpread && proposedSpread <= maxSpread;

    // Calculate safe harbour rate (midpoint of range)
    const midSpread = (minSpread + maxSpread) / 2;
    const safeHarbourRate = benchmarkRate.rate + (midSpread / 100);

    return {
      eligible,
      safeHarbourRate,
      benchmarkRate,
      spread: proposedSpread / 100,
      message: eligible
        ? `Spread of ${proposedSpread} bps is within safe harbour range (${minSpread}-${maxSpread} bps)`
        : `Spread of ${proposedSpread} bps is outside safe harbour range (${minSpread}-${maxSpread} bps)`,
      ruleReference: "Rule 10TD - Intercompany Loans"
    };
  }

  /**
   * Analyze rate trends
   */
  async analyzeRateTrend(
    rateType: InterestRateType,
    periodDays: number = 90
  ): Promise<RateTrendAnalysis> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const historicalRates = await this.getHistoricalRates({
      rateType,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0]
    });

    if (historicalRates.length === 0) {
      throw new Error("No historical data available");
    }

    const rates = historicalRates.map(r => r.rate);
    const currentRate = rates[rates.length - 1];
    const averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    // Calculate volatility (standard deviation)
    const squaredDiffs = rates.map(r => Math.pow(r - averageRate, 2));
    const volatility = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / rates.length);

    // Determine trend
    const firstHalf = rates.slice(0, Math.floor(rates.length / 2));
    const secondHalf = rates.slice(Math.floor(rates.length / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: "increasing" | "decreasing" | "stable";
    const trendThreshold = 0.1; // 10 bps
    if (secondHalfAvg - firstHalfAvg > trendThreshold) {
      trend = "increasing";
    } else if (firstHalfAvg - secondHalfAvg > trendThreshold) {
      trend = "decreasing";
    } else {
      trend = "stable";
    }

    return {
      rateType,
      currentRate,
      averageRate,
      minRate,
      maxRate,
      trend,
      volatility,
      period: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0]
      }
    };
  }

  /**
   * Get all benchmark rates summary
   */
  async getAllBenchmarkRates(): Promise<{
    rates: InterestRate[];
    asOf: string;
    currencies: Currency[];
  }> {
    const allRates: InterestRate[] = [];
    const rateTypes = getSupportedRateTypes();

    for (const rateType of rateTypes) {
      if (isRateAvailable(rateType)) {
        try {
          const rate = await this.getRate(rateType);
          allRates.push(rate);
        } catch {
          // Skip unavailable
        }
      }
    }

    const currencies = [...new Set(allRates.map(r => r.currency))] as Currency[];

    return {
      rates: allRates,
      asOf: new Date().toISOString(),
      currencies
    };
  }

  /**
   * Compare rates across currencies
   */
  async compareRatesAcrossCurrencies(): Promise<{
    usd: InterestRate[];
    inr: InterestRate[];
    eur: InterestRate[];
    differential: {
      usdInr: number;
      usdEur: number;
      eurInr: number;
    };
  }> {
    const [usdRates, inrRates, eurRates] = await Promise.all([
      this.getRatesForCurrency("USD"),
      this.getRatesForCurrency("INR"),
      this.getRatesForCurrency("EUR")
    ]);

    // Use primary benchmarks for differential
    const usdBenchmark = usdRates.find(r => r.rateType === "SOFR_90")?.rate ?? 0;
    const inrBenchmark = inrRates.find(r => r.rateType === "MIBOR_3M")?.rate ?? 0;
    const eurBenchmark = eurRates.find(r => r.rateType === "EURIBOR_3M")?.rate ?? 0;

    return {
      usd: usdRates,
      inr: inrRates,
      eur: eurRates,
      differential: {
        usdInr: inrBenchmark - usdBenchmark,
        usdEur: eurBenchmark - usdBenchmark,
        eurInr: inrBenchmark - eurBenchmark
      }
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.rateCache.clear();
    this.sofrConnector.clearCache();
    this.miborConnector.clearCache();
    this.euriborConnector.clearCache();
  }

  /**
   * Get rate info
   */
  getRateInfo(rateType: InterestRateType) {
    return getRateInfo(rateType);
  }

  /**
   * Get supported rate types
   */
  getSupportedRateTypes(): InterestRateType[] {
    return getSupportedRateTypes().filter(isRateAvailable);
  }

  /**
   * Get recommended benchmark for currency
   */
  getRecommendedBenchmark(currency: Currency): InterestRateType {
    return getRecommendedBenchmark(currency);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createInterestRateEngine = (config?: Partial<InterestRateEngineConfig>): InterestRateEngine => {
  return new InterestRateEngine(config);
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  InterestRate,
  InterestRateType,
  Currency as InterestRateCurrency,
  LoanPricingInput,
  LoanPricingResult
};

export {
  CURRENT_BENCHMARK_RATES,
  RATE_INFO,
  CREDIT_SPREADS,
  getSupportedRateTypes as getAllSupportedRateTypes,
  getRateInfo as getInterestRateInfo,
  getRatesByCurrency as getInterestRatesByCurrency,
  getCreditSpread as getInterestCreditSpread,
  isRateAvailable as isInterestRateAvailable
};

// =============================================================================
// VERSION INFO
// =============================================================================

export const INTEREST_RATE_ENGINE_VERSION = {
  version: "1.0.0",
  sources: ["NY Fed (SOFR)", "FBIL (MIBOR)", "EMMI (EURIBOR)", "RBI", "SBI"],
  supportedRateTypes: getSupportedRateTypes().filter(isRateAvailable).length,
  lastUpdated: "2025-01-29",
  features: {
    liveRates: true,
    historicalRates: true,
    tpLoanBenchmarking: true,
    safeHarbourChecks: true,
    trendAnalysis: true
  }
};
