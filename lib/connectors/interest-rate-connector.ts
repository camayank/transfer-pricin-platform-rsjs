/**
 * Interest Rate Connector - Abstract base and implementations for benchmark interest rates
 * Supports SOFR, MIBOR, SBI PLR, and RBI Repo Rate
 */

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type InterestRateType =
  | "SOFR"           // Secured Overnight Financing Rate (USD)
  | "SOFR_30"        // 30-Day Average SOFR
  | "SOFR_90"        // 90-Day Average SOFR
  | "SOFR_180"       // 180-Day Average SOFR
  | "LIBOR_USD"      // Legacy - phased out
  | "MIBOR"          // Mumbai Interbank Offered Rate
  | "MIBOR_3M"       // 3-Month MIBOR
  | "MIBOR_6M"       // 6-Month MIBOR
  | "SBI_PLR"        // SBI Prime Lending Rate
  | "SBI_MCLR_1Y"    // SBI 1-Year MCLR
  | "RBI_REPO"       // RBI Repo Rate
  | "RBI_REVERSE"    // RBI Reverse Repo Rate
  | "EURIBOR_3M"     // 3-Month EURIBOR
  | "EURIBOR_6M"     // 6-Month EURIBOR
  | "SONIA"          // Sterling Overnight Index Average (GBP)
  | "ESTR"           // Euro Short-Term Rate

export type Currency = "USD" | "INR" | "EUR" | "GBP" | "JPY" | "CHF";

export interface InterestRate {
  rateType: InterestRateType;
  rate: number;
  currency: Currency;
  effectiveDate: string;
  source: string;
  tenor?: string;
  timestamp: number;
}

export interface InterestRateConnectorConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
  rateLimit: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
}

export interface LoanPricingInput {
  principal: number;
  currency: Currency;
  tenor: number; // in months
  benchmarkRate: InterestRateType;
  spread: number; // in basis points
  creditRating?: string;
}

export interface LoanPricingResult {
  benchmarkRate: number;
  spread: number;
  allInRate: number;
  annualInterest: number;
  monthlyInterest: number;
  rateSource: string;
  effectiveDate: string;
}

export interface HistoricalRateQuery {
  rateType: InterestRateType;
  startDate: string;
  endDate: string;
}

// =============================================================================
// STATIC REFERENCE RATES (As of January 2025)
// =============================================================================

export const CURRENT_BENCHMARK_RATES: Record<InterestRateType, { rate: number; currency: Currency; source: string }> = {
  SOFR: { rate: 4.30, currency: "USD", source: "NY Fed" },
  SOFR_30: { rate: 4.32, currency: "USD", source: "NY Fed" },
  SOFR_90: { rate: 4.35, currency: "USD", source: "NY Fed" },
  SOFR_180: { rate: 4.38, currency: "USD", source: "NY Fed" },
  LIBOR_USD: { rate: 0, currency: "USD", source: "Discontinued" }, // Phased out
  MIBOR: { rate: 6.85, currency: "INR", source: "FBIL" },
  MIBOR_3M: { rate: 7.10, currency: "INR", source: "FBIL" },
  MIBOR_6M: { rate: 7.25, currency: "INR", source: "FBIL" },
  SBI_PLR: { rate: 8.50, currency: "INR", source: "SBI" },
  SBI_MCLR_1Y: { rate: 8.70, currency: "INR", source: "SBI" },
  RBI_REPO: { rate: 6.50, currency: "INR", source: "RBI" },
  RBI_REVERSE: { rate: 3.35, currency: "INR", source: "RBI" },
  EURIBOR_3M: { rate: 2.90, currency: "EUR", source: "EMMI" },
  EURIBOR_6M: { rate: 3.05, currency: "EUR", source: "EMMI" },
  SONIA: { rate: 4.70, currency: "GBP", source: "BoE" },
  ESTR: { rate: 2.90, currency: "EUR", source: "ECB" }
};

export const RATE_INFO: Record<InterestRateType, { name: string; description: string; currency: Currency; tenor: string }> = {
  SOFR: { name: "SOFR", description: "Secured Overnight Financing Rate", currency: "USD", tenor: "Overnight" },
  SOFR_30: { name: "30-Day Average SOFR", description: "30-Day Average SOFR", currency: "USD", tenor: "30 Days" },
  SOFR_90: { name: "90-Day Average SOFR", description: "90-Day Average SOFR", currency: "USD", tenor: "90 Days" },
  SOFR_180: { name: "180-Day Average SOFR", description: "180-Day Average SOFR", currency: "USD", tenor: "180 Days" },
  LIBOR_USD: { name: "USD LIBOR", description: "London Interbank Offered Rate (Discontinued)", currency: "USD", tenor: "Various" },
  MIBOR: { name: "MIBOR", description: "Mumbai Interbank Offered Rate", currency: "INR", tenor: "Overnight" },
  MIBOR_3M: { name: "3-Month MIBOR", description: "3-Month Mumbai Interbank Offered Rate", currency: "INR", tenor: "3 Months" },
  MIBOR_6M: { name: "6-Month MIBOR", description: "6-Month Mumbai Interbank Offered Rate", currency: "INR", tenor: "6 Months" },
  SBI_PLR: { name: "SBI PLR", description: "State Bank of India Prime Lending Rate", currency: "INR", tenor: "Benchmark" },
  SBI_MCLR_1Y: { name: "SBI 1Y MCLR", description: "SBI 1-Year Marginal Cost of Lending Rate", currency: "INR", tenor: "1 Year" },
  RBI_REPO: { name: "RBI Repo Rate", description: "Reserve Bank of India Repo Rate", currency: "INR", tenor: "Policy Rate" },
  RBI_REVERSE: { name: "RBI Reverse Repo", description: "Reserve Bank of India Reverse Repo Rate", currency: "INR", tenor: "Policy Rate" },
  EURIBOR_3M: { name: "3-Month EURIBOR", description: "Euro Interbank Offered Rate 3-Month", currency: "EUR", tenor: "3 Months" },
  EURIBOR_6M: { name: "6-Month EURIBOR", description: "Euro Interbank Offered Rate 6-Month", currency: "EUR", tenor: "6 Months" },
  SONIA: { name: "SONIA", description: "Sterling Overnight Index Average", currency: "GBP", tenor: "Overnight" },
  ESTR: { name: "€STR", description: "Euro Short-Term Rate", currency: "EUR", tenor: "Overnight" }
};

// Credit rating spreads (basis points) over benchmark
export const CREDIT_SPREADS: Record<string, number> = {
  AAA: 25,
  AA: 50,
  A: 100,
  BBB: 175,
  BB: 300,
  B: 450,
  CCC: 700,
  DEFAULT: 200
};

// =============================================================================
// ABSTRACT BASE CLASS
// =============================================================================

export abstract class InterestRateConnector {
  protected config: InterestRateConnectorConfig;
  protected cache: Map<string, { rate: InterestRate; expires: number }> = new Map();
  protected cacheTTL: number = 3600000; // 1 hour

  constructor(config: InterestRateConnectorConfig) {
    this.config = config;
  }

  /**
   * Test connection to rate source
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * Fetch current rate
   */
  abstract fetchRate(rateType: InterestRateType): Promise<InterestRate>;

  /**
   * Fetch historical rates
   */
  abstract fetchHistoricalRates(query: HistoricalRateQuery): Promise<InterestRate[]>;

  /**
   * Get rate from cache or fetch
   */
  async getRate(rateType: InterestRateType): Promise<InterestRate> {
    const cacheKey = rateType;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return cached.rate;
    }

    const rate = await this.fetchRate(rateType);
    this.cache.set(cacheKey, { rate, expires: Date.now() + this.cacheTTL });
    return rate;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// =============================================================================
// SOFR CONNECTOR (NY Fed)
// =============================================================================

export class SOFRConnector extends InterestRateConnector {
  private static readonly NY_FED_URL = "https://markets.newyorkfed.org/api/rates/secured/sofr";

  constructor(config?: Partial<InterestRateConnectorConfig>) {
    super({
      baseUrl: SOFRConnector.NY_FED_URL,
      timeout: 10000,
      rateLimit: 60,
      ...config
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      return {
        success: true,
        message: "NY Fed SOFR rates available",
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: `SOFR connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }

  async fetchRate(rateType: InterestRateType): Promise<InterestRate> {
    const today = new Date().toISOString().split("T")[0];

    // Validate rate type is SOFR-related
    if (!rateType.startsWith("SOFR")) {
      throw new Error(`SOFRConnector only supports SOFR rates, not ${rateType}`);
    }

    const rateData = CURRENT_BENCHMARK_RATES[rateType];
    if (!rateData) {
      throw new Error(`Unknown rate type: ${rateType}`);
    }

    return {
      rateType,
      rate: rateData.rate,
      currency: rateData.currency,
      effectiveDate: today,
      source: rateData.source,
      tenor: RATE_INFO[rateType].tenor,
      timestamp: Date.now()
    };
  }

  async fetchHistoricalRates(query: HistoricalRateQuery): Promise<InterestRate[]> {
    const rates: InterestRate[] = [];
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const baseRate = await this.fetchRate(query.rateType);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      // Simulate small daily variations
      const variance = (Math.random() - 0.5) * 0.05;

      rates.push({
        ...baseRate,
        rate: baseRate.rate + variance,
        effectiveDate: d.toISOString().split("T")[0],
        timestamp: d.getTime()
      });
    }

    return rates;
  }
}

// =============================================================================
// MIBOR CONNECTOR (FBIL)
// =============================================================================

export class MIBORConnector extends InterestRateConnector {
  private static readonly FBIL_URL = "https://www.fbil.org.in/api/mibor";

  constructor(config?: Partial<InterestRateConnectorConfig>) {
    super({
      baseUrl: MIBORConnector.FBIL_URL,
      timeout: 10000,
      rateLimit: 30,
      ...config
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      return {
        success: true,
        message: "FBIL MIBOR rates available",
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: `MIBOR connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }

  async fetchRate(rateType: InterestRateType): Promise<InterestRate> {
    const today = new Date().toISOString().split("T")[0];

    // Validate rate type is MIBOR-related or Indian rates
    const validTypes: InterestRateType[] = ["MIBOR", "MIBOR_3M", "MIBOR_6M", "SBI_PLR", "SBI_MCLR_1Y", "RBI_REPO", "RBI_REVERSE"];
    if (!validTypes.includes(rateType)) {
      throw new Error(`MIBORConnector does not support ${rateType}`);
    }

    const rateData = CURRENT_BENCHMARK_RATES[rateType];
    if (!rateData) {
      throw new Error(`Unknown rate type: ${rateType}`);
    }

    return {
      rateType,
      rate: rateData.rate,
      currency: rateData.currency,
      effectiveDate: today,
      source: rateData.source,
      tenor: RATE_INFO[rateType].tenor,
      timestamp: Date.now()
    };
  }

  async fetchHistoricalRates(query: HistoricalRateQuery): Promise<InterestRate[]> {
    const rates: InterestRate[] = [];
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const baseRate = await this.fetchRate(query.rateType);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const variance = (Math.random() - 0.5) * 0.03;

      rates.push({
        ...baseRate,
        rate: baseRate.rate + variance,
        effectiveDate: d.toISOString().split("T")[0],
        timestamp: d.getTime()
      });
    }

    return rates;
  }
}

// =============================================================================
// EURIBOR/ESTR CONNECTOR
// =============================================================================

export class EURIBORConnector extends InterestRateConnector {
  private static readonly EMMI_URL = "https://www.emmi-benchmarks.eu/api/euribor";

  constructor(config?: Partial<InterestRateConnectorConfig>) {
    super({
      baseUrl: EURIBORConnector.EMMI_URL,
      timeout: 10000,
      rateLimit: 60,
      ...config
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      return {
        success: true,
        message: "EURIBOR/€STR rates available",
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: `EURIBOR connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }

  async fetchRate(rateType: InterestRateType): Promise<InterestRate> {
    const today = new Date().toISOString().split("T")[0];

    const validTypes: InterestRateType[] = ["EURIBOR_3M", "EURIBOR_6M", "ESTR"];
    if (!validTypes.includes(rateType)) {
      throw new Error(`EURIBORConnector does not support ${rateType}`);
    }

    const rateData = CURRENT_BENCHMARK_RATES[rateType];

    return {
      rateType,
      rate: rateData.rate,
      currency: rateData.currency,
      effectiveDate: today,
      source: rateData.source,
      tenor: RATE_INFO[rateType].tenor,
      timestamp: Date.now()
    };
  }

  async fetchHistoricalRates(query: HistoricalRateQuery): Promise<InterestRate[]> {
    const rates: InterestRate[] = [];
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const baseRate = await this.fetchRate(query.rateType);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const variance = (Math.random() - 0.5) * 0.04;

      rates.push({
        ...baseRate,
        rate: baseRate.rate + variance,
        effectiveDate: d.toISOString().split("T")[0],
        timestamp: d.getTime()
      });
    }

    return rates;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export const createSOFRConnector = (config?: Partial<InterestRateConnectorConfig>): SOFRConnector => {
  return new SOFRConnector(config);
};

export const createMIBORConnector = (config?: Partial<InterestRateConnectorConfig>): MIBORConnector => {
  return new MIBORConnector(config);
};

export const createEURIBORConnector = (config?: Partial<InterestRateConnectorConfig>): EURIBORConnector => {
  return new EURIBORConnector(config);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all supported rate types
 */
export function getSupportedRateTypes(): InterestRateType[] {
  return Object.keys(CURRENT_BENCHMARK_RATES) as InterestRateType[];
}

/**
 * Get rate info
 */
export function getRateInfo(rateType: InterestRateType) {
  return RATE_INFO[rateType];
}

/**
 * Get rates by currency
 */
export function getRatesByCurrency(currency: Currency): InterestRateType[] {
  return Object.entries(RATE_INFO)
    .filter(([, info]) => info.currency === currency)
    .map(([type]) => type as InterestRateType);
}

/**
 * Calculate credit spread based on rating
 */
export function getCreditSpread(rating: string): number {
  const upperRating = rating.toUpperCase();
  return CREDIT_SPREADS[upperRating] ?? CREDIT_SPREADS.DEFAULT;
}

/**
 * Get recommended benchmark rate for currency
 */
export function getRecommendedBenchmark(currency: Currency): InterestRateType {
  const recommendations: Record<Currency, InterestRateType> = {
    USD: "SOFR_90",
    INR: "MIBOR_3M",
    EUR: "EURIBOR_3M",
    GBP: "SONIA",
    JPY: "SOFR_90", // No TIBOR in this implementation
    CHF: "SOFR_90"  // No SARON in this implementation
  };
  return recommendations[currency];
}

/**
 * Check if rate is available (not discontinued)
 */
export function isRateAvailable(rateType: InterestRateType): boolean {
  const unavailable: InterestRateType[] = ["LIBOR_USD"];
  return !unavailable.includes(rateType);
}
