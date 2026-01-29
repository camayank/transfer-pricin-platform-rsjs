/**
 * Forex Engine
 * Orchestrates forex connectors with caching, fallback, and rate conversion logic
 */

import {
  ForexConnector,
  RBIForexConnector,
  ECBForexConnector,
  ForexRate,
  ForexConversionResult,
  HistoricalRate,
  HistoricalRateQuery,
  CurrencyCode,
  STATIC_INR_RATES,
  CURRENCY_INFO,
  createRBIForexConnector,
  createECBForexConnector,
  getSupportedCurrencies,
  getCurrencyInfo,
  isValidCurrencyCode,
  formatCurrency
} from "../connectors/forex-connector";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ForexEngineConfig {
  primarySource: "RBI" | "ECB";
  enableFallback: boolean;
  cacheTTL: number; // milliseconds
  enableHistorical: boolean;
}

export interface ConversionRequest {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  amount: number;
  date?: string; // For historical conversion
}

export interface MultiConversionRequest {
  baseCurrency: CurrencyCode;
  targetCurrencies: CurrencyCode[];
  amount: number;
}

export interface MultiConversionResult {
  baseCurrency: CurrencyCode;
  baseAmount: number;
  conversions: ForexConversionResult[];
  timestamp: number;
  source: "RBI" | "ECB" | "STATIC";
}

export interface RateComparisonResult {
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  rbiRate?: ForexRate;
  ecbRate?: ForexRate;
  difference?: number;
  percentageDiff?: number;
  recommendedSource: "RBI" | "ECB";
}

export interface AveragePeriodResult {
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  startDate: string;
  endDate: string;
  averageRate: number;
  minRate: number;
  maxRate: number;
  volatility: number;
  dataPoints: number;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: ForexEngineConfig = {
  primarySource: "RBI",
  enableFallback: true,
  cacheTTL: 3600000, // 1 hour
  enableHistorical: true
};

// =============================================================================
// MAIN ENGINE CLASS
// =============================================================================

export class ForexEngine {
  private config: ForexEngineConfig;
  private rbiConnector: RBIForexConnector;
  private ecbConnector: ECBForexConnector;
  private rateCache: Map<string, { rate: ForexRate; expires: number }> = new Map();

  constructor(config?: Partial<ForexEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rbiConnector = createRBIForexConnector();
    this.ecbConnector = createECBForexConnector();
  }

  /**
   * Get primary connector based on config
   */
  private getPrimaryConnector(): ForexConnector {
    return this.config.primarySource === "RBI" ? this.rbiConnector : this.ecbConnector;
  }

  /**
   * Get fallback connector
   */
  private getFallbackConnector(): ForexConnector {
    return this.config.primarySource === "RBI" ? this.ecbConnector : this.rbiConnector;
  }

  /**
   * Test connectivity to rate sources
   */
  async testConnections(): Promise<{
    rbi: { success: boolean; message: string };
    ecb: { success: boolean; message: string };
  }> {
    const [rbiResult, ecbResult] = await Promise.all([
      this.rbiConnector.testConnection(),
      this.ecbConnector.testConnection()
    ]);

    return {
      rbi: { success: rbiResult.success, message: rbiResult.message },
      ecb: { success: ecbResult.success, message: ecbResult.message }
    };
  }

  /**
   * Get current exchange rate with fallback
   */
  async getRate(baseCurrency: CurrencyCode, quoteCurrency: CurrencyCode): Promise<ForexRate> {
    // Check cache first
    const cacheKey = `${baseCurrency}_${quoteCurrency}`;
    const cached = this.rateCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.rate;
    }

    try {
      const rate = await this.getPrimaryConnector().fetchRate(baseCurrency, quoteCurrency);
      this.rateCache.set(cacheKey, { rate, expires: Date.now() + this.config.cacheTTL });
      return rate;
    } catch (primaryError) {
      if (this.config.enableFallback) {
        try {
          const rate = await this.getFallbackConnector().fetchRate(baseCurrency, quoteCurrency);
          this.rateCache.set(cacheKey, { rate, expires: Date.now() + this.config.cacheTTL });
          return rate;
        } catch (fallbackError) {
          // Use static rate as last resort
          return this.getStaticRate(baseCurrency, quoteCurrency);
        }
      }
      // Use static rate if fallback disabled
      return this.getStaticRate(baseCurrency, quoteCurrency);
    }
  }

  /**
   * Get static fallback rate
   */
  private getStaticRate(baseCurrency: CurrencyCode, quoteCurrency: CurrencyCode): ForexRate {
    const today = new Date().toISOString().split("T")[0];

    if (quoteCurrency === "INR") {
      return {
        baseCurrency,
        quoteCurrency,
        rate: STATIC_INR_RATES[baseCurrency] ?? 1,
        date: today,
        source: "STATIC",
        timestamp: Date.now()
      };
    } else if (baseCurrency === "INR") {
      return {
        baseCurrency,
        quoteCurrency,
        rate: 1 / (STATIC_INR_RATES[quoteCurrency] ?? 1),
        date: today,
        source: "STATIC",
        timestamp: Date.now()
      };
    } else {
      const baseToINR = STATIC_INR_RATES[baseCurrency] ?? 1;
      const quoteToINR = STATIC_INR_RATES[quoteCurrency] ?? 1;
      return {
        baseCurrency,
        quoteCurrency,
        rate: baseToINR / quoteToINR,
        date: today,
        source: "STATIC",
        timestamp: Date.now()
      };
    }
  }

  /**
   * Convert currency
   */
  async convert(request: ConversionRequest): Promise<ForexConversionResult> {
    const rate = await this.getRate(request.fromCurrency, request.toCurrency);
    const convertedAmount = request.amount * rate.rate;

    return {
      fromCurrency: request.fromCurrency,
      toCurrency: request.toCurrency,
      fromAmount: request.amount,
      toAmount: convertedAmount,
      rate: rate.rate,
      inverseRate: 1 / rate.rate,
      date: rate.date,
      source: rate.source
    };
  }

  /**
   * Convert to multiple currencies at once
   */
  async convertMultiple(request: MultiConversionRequest): Promise<MultiConversionResult> {
    const conversions = await Promise.all(
      request.targetCurrencies.map(async (targetCurrency) => {
        return this.convert({
          fromCurrency: request.baseCurrency,
          toCurrency: targetCurrency,
          amount: request.amount
        });
      })
    );

    // Determine primary source used
    const sources = new Set(conversions.map(c => c.source));
    const primarySource = sources.has("RBI") ? "RBI" : sources.has("ECB") ? "ECB" : "STATIC";

    return {
      baseCurrency: request.baseCurrency,
      baseAmount: request.amount,
      conversions,
      timestamp: Date.now(),
      source: primarySource
    };
  }

  /**
   * Get historical rates for a period
   */
  async getHistoricalRates(query: HistoricalRateQuery): Promise<HistoricalRate[]> {
    if (!this.config.enableHistorical) {
      throw new Error("Historical rates are disabled in configuration");
    }

    try {
      return await this.getPrimaryConnector().fetchHistoricalRates(query);
    } catch (error) {
      if (this.config.enableFallback) {
        return await this.getFallbackConnector().fetchHistoricalRates(query);
      }
      throw error;
    }
  }

  /**
   * Calculate average rate for a period
   */
  async getAverageRate(query: HistoricalRateQuery): Promise<AveragePeriodResult> {
    const rates = await this.getHistoricalRates(query);

    if (rates.length === 0) {
      throw new Error("No rates available for the specified period");
    }

    const rateValues = rates.map(r => r.rate);
    const sum = rateValues.reduce((a, b) => a + b, 0);
    const average = sum / rateValues.length;
    const min = Math.min(...rateValues);
    const max = Math.max(...rateValues);

    // Calculate volatility (standard deviation)
    const squaredDiffs = rateValues.map(r => Math.pow(r - average, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    const volatility = Math.sqrt(avgSquaredDiff);

    return {
      baseCurrency: query.baseCurrency,
      quoteCurrency: query.quoteCurrency,
      startDate: query.startDate,
      endDate: query.endDate,
      averageRate: average,
      minRate: min,
      maxRate: max,
      volatility,
      dataPoints: rates.length
    };
  }

  /**
   * Compare rates from different sources
   */
  async compareRates(
    baseCurrency: CurrencyCode,
    quoteCurrency: CurrencyCode
  ): Promise<RateComparisonResult> {
    let rbiRate: ForexRate | undefined;
    let ecbRate: ForexRate | undefined;

    try {
      rbiRate = await this.rbiConnector.fetchRate(baseCurrency, quoteCurrency);
    } catch {
      // RBI rate not available
    }

    try {
      ecbRate = await this.ecbConnector.fetchRate(baseCurrency, quoteCurrency);
    } catch {
      // ECB rate not available
    }

    let difference: number | undefined;
    let percentageDiff: number | undefined;

    if (rbiRate && ecbRate) {
      difference = Math.abs(rbiRate.rate - ecbRate.rate);
      percentageDiff = (difference / Math.min(rbiRate.rate, ecbRate.rate)) * 100;
    }

    // Recommend RBI for INR pairs, ECB for EUR pairs
    const recommendedSource: "RBI" | "ECB" =
      baseCurrency === "INR" || quoteCurrency === "INR" ? "RBI" : "ECB";

    return {
      baseCurrency,
      quoteCurrency,
      rbiRate,
      ecbRate,
      difference,
      percentageDiff,
      recommendedSource
    };
  }

  /**
   * Get all rates against INR
   */
  async getAllINRRates(): Promise<ForexRate[]> {
    const currencies = getSupportedCurrencies().filter(c => c !== "INR");
    const rates: ForexRate[] = [];

    for (const currency of currencies) {
      try {
        const rate = await this.getRate(currency, "INR");
        rates.push(rate);
      } catch {
        // Skip currencies without available rates
      }
    }

    return rates;
  }

  /**
   * Get rates for TP compliance (common TP currencies)
   */
  async getTPComplianceRates(): Promise<{
    rates: ForexRate[];
    asOf: string;
    source: string;
  }> {
    // Common currencies used in transfer pricing
    const tpCurrencies: CurrencyCode[] = ["USD", "EUR", "GBP", "JPY", "CHF", "SGD", "AED"];

    const rates = await Promise.all(
      tpCurrencies.map(async (currency) => {
        return this.getRate(currency, "INR");
      })
    );

    return {
      rates,
      asOf: new Date().toISOString(),
      source: this.config.primarySource
    };
  }

  /**
   * Convert financial year average rate
   * Useful for annual TP benchmarking
   */
  async getFinancialYearAverageRate(
    baseCurrency: CurrencyCode,
    quoteCurrency: CurrencyCode,
    financialYear: string // Format: "2024-25"
  ): Promise<AveragePeriodResult> {
    const [startYear] = financialYear.split("-").map(y => parseInt(y));
    const fullStartYear = startYear < 100 ? 2000 + startYear : startYear;

    const startDate = `${fullStartYear}-04-01`;
    const endDate = `${fullStartYear + 1}-03-31`;

    return this.getAverageRate({
      baseCurrency,
      quoteCurrency,
      startDate,
      endDate
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.rateCache.clear();
    this.rbiConnector.clearCache();
    this.ecbConnector.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      engine: {
        size: this.rateCache.size,
        keys: Array.from(this.rateCache.keys())
      },
      rbi: this.rbiConnector.getCacheStats(),
      ecb: this.ecbConnector.getCacheStats()
    };
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): CurrencyCode[] {
    return getSupportedCurrencies();
  }

  /**
   * Get currency info
   */
  getCurrencyInfo(code: CurrencyCode) {
    return getCurrencyInfo(code);
  }

  /**
   * Validate currency code
   */
  isValidCurrency(code: string): boolean {
    return isValidCurrencyCode(code);
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: number, currency: CurrencyCode): string {
    return formatCurrency(amount, currency);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createForexEngine = (config?: Partial<ForexEngineConfig>): ForexEngine => {
  return new ForexEngine(config);
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  ForexRate,
  ForexConversionResult,
  HistoricalRate,
  HistoricalRateQuery,
  CurrencyCode
};

export {
  STATIC_INR_RATES,
  CURRENCY_INFO,
  getSupportedCurrencies,
  getCurrencyInfo,
  isValidCurrencyCode,
  formatCurrency
};

// =============================================================================
// VERSION INFO
// =============================================================================

export const FOREX_ENGINE_VERSION = {
  version: "1.0.0",
  sources: ["RBI", "ECB"],
  supportedCurrencies: getSupportedCurrencies().length,
  lastUpdated: "2025-01-29",
  features: {
    liveRates: true,
    historicalRates: true,
    multiCurrencyConversion: true,
    fallbackSupport: true,
    caching: true
  }
};
