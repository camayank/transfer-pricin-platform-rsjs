/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Digital Economy Rules Constants
 *
 * Rules, thresholds, and parameters for digital economy transfer pricing
 * including BEPS Pillar One/Two, user participation, and digital services.
 * ================================================================================
 */

// =============================================================================
// PILLAR ONE PARAMETERS (Amount A & Amount B)
// =============================================================================

export const PILLAR_ONE_THRESHOLDS = {
  // Amount A - applies to largest MNEs
  amountA: {
    globalRevenueThreshold: 20000000000, // EUR 20 billion
    profitabilityThreshold: 0.10, // 10% PBT margin
    reallocationPercentage: 0.25, // 25% of residual profit
    nexusRevenueThreshold: 1000000, // EUR 1 million in jurisdiction
    nexusRevenueThresholdSmall: 250000, // EUR 250k for smaller economies
    smallJurisdictionGDP: 40000000000, // EUR 40 billion GDP threshold
  },

  // Amount B - simplified transfer pricing for baseline marketing & distribution
  amountB: {
    applicableFunctions: ["marketing", "distribution", "sales"],
    returnOnSales: {
      distribution: { min: 0.015, max: 0.055 }, // 1.5% to 5.5%
      wholesale: { min: 0.02, max: 0.04 }, // 2% to 4%
      commissionAgent: { min: 0.02, max: 0.05 }, // 2% to 5%
    },
    qualifyingCriteria: [
      "Routine marketing and distribution",
      "No significant intangible ownership",
      "Low-risk, limited functional profile",
      "No brand development activities",
    ],
  },
} as const;

// =============================================================================
// PILLAR TWO PARAMETERS (GloBE Rules)
// =============================================================================

export const PILLAR_TWO_THRESHOLDS = {
  // Global Anti-Base Erosion (GloBE) Rules
  globe: {
    revenueThreshold: 750000000, // EUR 750 million
    minimumTaxRate: 0.15, // 15% minimum ETR
    substanceBasedIncomeExclusion: {
      payrollCarveOut: 0.05, // 5% of payroll
      tangibleAssetCarveOut: 0.05, // 5% of tangible assets
      transitionPeriod: {
        startYear: 2023,
        endYear: 2032,
        payrollStartRate: 0.10, // Starts at 10%
        assetStartRate: 0.08, // Starts at 8%
      },
    },
    deMinimisThreshold: {
      revenue: 10000000, // EUR 10 million
      profitThreshold: 1000000, // EUR 1 million
    },
  },

  // Qualified Domestic Minimum Top-up Tax (QDMTT)
  qdmtt: {
    minimumTaxRate: 0.15,
    applicableFrom: "2024-01-01",
  },

  // Income Inclusion Rule (IIR)
  iir: {
    minimumTaxRate: 0.15,
    applicableFrom: "2024-01-01",
  },

  // Undertaxed Profits Rule (UTPR)
  utpr: {
    minimumTaxRate: 0.15,
    applicableFrom: "2025-01-01",
  },
} as const;

// =============================================================================
// DIGITAL SERVICE TYPES
// =============================================================================

export enum DigitalServiceType {
  ONLINE_ADVERTISING = "online_advertising",
  SOCIAL_MEDIA = "social_media",
  SEARCH_ENGINE = "search_engine",
  CLOUD_COMPUTING = "cloud_computing",
  SAAS = "saas",
  ECOMMERCE_PLATFORM = "ecommerce_platform",
  DIGITAL_CONTENT = "digital_content",
  ONLINE_MARKETPLACE = "online_marketplace",
  DATA_ANALYTICS = "data_analytics",
  DIGITAL_PAYMENT = "digital_payment",
  ONLINE_GAMING = "online_gaming",
  STREAMING_SERVICES = "streaming_services",
}

export interface DigitalServiceCharacteristics {
  serviceType: DigitalServiceType;
  userParticipationLevel: "high" | "medium" | "low";
  dataIntensity: "high" | "medium" | "low";
  networkEffects: boolean;
  intangibleIntensity: "high" | "medium" | "low";
  scalability: "high" | "medium" | "low";
  typicalProfitSplitFactors: string[];
}

export const DIGITAL_SERVICE_CHARACTERISTICS: Record<DigitalServiceType, DigitalServiceCharacteristics> = {
  [DigitalServiceType.ONLINE_ADVERTISING]: {
    serviceType: DigitalServiceType.ONLINE_ADVERTISING,
    userParticipationLevel: "high",
    dataIntensity: "high",
    networkEffects: true,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["user data contribution", "ad targeting algorithms", "platform reach"],
  },
  [DigitalServiceType.SOCIAL_MEDIA]: {
    serviceType: DigitalServiceType.SOCIAL_MEDIA,
    userParticipationLevel: "high",
    dataIntensity: "high",
    networkEffects: true,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["user content generation", "engagement metrics", "network value"],
  },
  [DigitalServiceType.SEARCH_ENGINE]: {
    serviceType: DigitalServiceType.SEARCH_ENGINE,
    userParticipationLevel: "high",
    dataIntensity: "high",
    networkEffects: true,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["search data", "algorithm IP", "user base"],
  },
  [DigitalServiceType.CLOUD_COMPUTING]: {
    serviceType: DigitalServiceType.CLOUD_COMPUTING,
    userParticipationLevel: "low",
    dataIntensity: "medium",
    networkEffects: false,
    intangibleIntensity: "medium",
    scalability: "high",
    typicalProfitSplitFactors: ["infrastructure investment", "technology IP", "service delivery"],
  },
  [DigitalServiceType.SAAS]: {
    serviceType: DigitalServiceType.SAAS,
    userParticipationLevel: "medium",
    dataIntensity: "medium",
    networkEffects: false,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["software IP", "customer data", "development costs"],
  },
  [DigitalServiceType.ECOMMERCE_PLATFORM]: {
    serviceType: DigitalServiceType.ECOMMERCE_PLATFORM,
    userParticipationLevel: "high",
    dataIntensity: "high",
    networkEffects: true,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["buyer-seller matching", "transaction data", "marketplace reach"],
  },
  [DigitalServiceType.DIGITAL_CONTENT]: {
    serviceType: DigitalServiceType.DIGITAL_CONTENT,
    userParticipationLevel: "medium",
    dataIntensity: "low",
    networkEffects: false,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["content IP", "distribution platform", "user preferences"],
  },
  [DigitalServiceType.ONLINE_MARKETPLACE]: {
    serviceType: DigitalServiceType.ONLINE_MARKETPLACE,
    userParticipationLevel: "high",
    dataIntensity: "high",
    networkEffects: true,
    intangibleIntensity: "medium",
    scalability: "high",
    typicalProfitSplitFactors: ["platform technology", "user network", "transaction facilitation"],
  },
  [DigitalServiceType.DATA_ANALYTICS]: {
    serviceType: DigitalServiceType.DATA_ANALYTICS,
    userParticipationLevel: "low",
    dataIntensity: "high",
    networkEffects: false,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["analytical algorithms", "data processing", "insights generation"],
  },
  [DigitalServiceType.DIGITAL_PAYMENT]: {
    serviceType: DigitalServiceType.DIGITAL_PAYMENT,
    userParticipationLevel: "high",
    dataIntensity: "medium",
    networkEffects: true,
    intangibleIntensity: "medium",
    scalability: "high",
    typicalProfitSplitFactors: ["payment network", "security technology", "user trust"],
  },
  [DigitalServiceType.ONLINE_GAMING]: {
    serviceType: DigitalServiceType.ONLINE_GAMING,
    userParticipationLevel: "high",
    dataIntensity: "medium",
    networkEffects: true,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["game IP", "user engagement", "in-app purchases"],
  },
  [DigitalServiceType.STREAMING_SERVICES]: {
    serviceType: DigitalServiceType.STREAMING_SERVICES,
    userParticipationLevel: "medium",
    dataIntensity: "high",
    networkEffects: false,
    intangibleIntensity: "high",
    scalability: "high",
    typicalProfitSplitFactors: ["content library", "recommendation algorithms", "subscriber data"],
  },
};

// =============================================================================
// USER PARTICIPATION VALUE ALLOCATION
// =============================================================================

export interface UserParticipationFactor {
  factor: string;
  weight: number;
  applicableServices: DigitalServiceType[];
  measurementMethod: string;
}

export const USER_PARTICIPATION_FACTORS: UserParticipationFactor[] = [
  {
    factor: "Active User Base",
    weight: 0.25,
    applicableServices: [
      DigitalServiceType.SOCIAL_MEDIA,
      DigitalServiceType.ONLINE_MARKETPLACE,
      DigitalServiceType.DIGITAL_PAYMENT,
    ],
    measurementMethod: "Monthly/Daily Active Users (MAU/DAU)",
  },
  {
    factor: "User-Generated Content",
    weight: 0.20,
    applicableServices: [
      DigitalServiceType.SOCIAL_MEDIA,
      DigitalServiceType.ECOMMERCE_PLATFORM,
    ],
    measurementMethod: "Volume and value of content contributed",
  },
  {
    factor: "Data Contribution",
    weight: 0.20,
    applicableServices: [
      DigitalServiceType.ONLINE_ADVERTISING,
      DigitalServiceType.SEARCH_ENGINE,
      DigitalServiceType.DATA_ANALYTICS,
    ],
    measurementMethod: "Data points collected and monetization value",
  },
  {
    factor: "Network Effects",
    weight: 0.15,
    applicableServices: [
      DigitalServiceType.SOCIAL_MEDIA,
      DigitalServiceType.ONLINE_MARKETPLACE,
      DigitalServiceType.DIGITAL_PAYMENT,
    ],
    measurementMethod: "Value derived from user network growth",
  },
  {
    factor: "Engagement Metrics",
    weight: 0.10,
    applicableServices: [
      DigitalServiceType.STREAMING_SERVICES,
      DigitalServiceType.ONLINE_GAMING,
      DigitalServiceType.DIGITAL_CONTENT,
    ],
    measurementMethod: "Time spent, interactions, sessions",
  },
  {
    factor: "Transaction Value",
    weight: 0.10,
    applicableServices: [
      DigitalServiceType.ECOMMERCE_PLATFORM,
      DigitalServiceType.DIGITAL_PAYMENT,
      DigitalServiceType.ONLINE_MARKETPLACE,
    ],
    measurementMethod: "GMV or transaction volumes by jurisdiction",
  },
];

// =============================================================================
// MARKETING INTANGIBLES VALUATION
// =============================================================================

export interface MarketingIntangibleType {
  type: string;
  valuationMethods: string[];
  typicalRoyaltyRange: { min: number; max: number };
  factors: string[];
}

export const MARKETING_INTANGIBLE_TYPES: MarketingIntangibleType[] = [
  {
    type: "Brand/Trademark",
    valuationMethods: ["Relief from Royalty", "Excess Earnings", "Market Approach"],
    typicalRoyaltyRange: { min: 0.5, max: 5.0 },
    factors: ["Brand recognition", "Market position", "Customer loyalty", "Premium pricing ability"],
  },
  {
    type: "Customer Lists/Relationships",
    valuationMethods: ["Multi-period Excess Earnings", "With and Without"],
    typicalRoyaltyRange: { min: 0.25, max: 2.0 },
    factors: ["Customer retention rate", "Customer lifetime value", "Market penetration"],
  },
  {
    type: "Domain Names",
    valuationMethods: ["Market Approach", "Cost Approach"],
    typicalRoyaltyRange: { min: 0.1, max: 1.0 },
    factors: ["Traffic value", "Memorability", "SEO value", "Industry relevance"],
  },
  {
    type: "User Data",
    valuationMethods: ["Cost Approach", "Income Approach"],
    typicalRoyaltyRange: { min: 0.5, max: 3.0 },
    factors: ["Data quality", "Data volume", "Monetization potential", "Privacy compliance"],
  },
];

// =============================================================================
// PROFIT SPLIT ALLOCATION KEYS
// =============================================================================

export interface AllocationKey {
  key: string;
  weight: number;
  dataSource: string;
  adjustmentFactors: string[];
}

export const DIGITAL_PROFIT_SPLIT_KEYS: AllocationKey[] = [
  {
    key: "Revenue by Jurisdiction",
    weight: 0.30,
    dataSource: "Financial statements",
    adjustmentFactors: ["Currency conversion", "Intercompany eliminations"],
  },
  {
    key: "User/Customer Base",
    weight: 0.25,
    dataSource: "Platform analytics",
    adjustmentFactors: ["Active vs total users", "Monetizable users"],
  },
  {
    key: "Data Generated",
    weight: 0.15,
    dataSource: "Data management systems",
    adjustmentFactors: ["Data quality", "Monetization value"],
  },
  {
    key: "R&D Expenditure",
    weight: 0.15,
    dataSource: "Cost center allocation",
    adjustmentFactors: ["DEMPE functions", "Intangible development"],
  },
  {
    key: "Infrastructure/Assets",
    weight: 0.10,
    dataSource: "Asset register",
    adjustmentFactors: ["Server locations", "Data centers"],
  },
  {
    key: "Personnel",
    weight: 0.05,
    dataSource: "HR systems",
    adjustmentFactors: ["Headcount", "Compensation levels"],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if entity is in scope for Pillar One Amount A
 */
export function isInScopeForAmountA(
  globalRevenue: number,
  profitMargin: number
): { inScope: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const revenueThreshold = PILLAR_ONE_THRESHOLDS.amountA.globalRevenueThreshold;
  const profitThreshold = PILLAR_ONE_THRESHOLDS.amountA.profitabilityThreshold;

  const meetsRevenue = globalRevenue >= revenueThreshold;
  const meetsProfit = profitMargin >= profitThreshold;

  if (!meetsRevenue) {
    reasons.push(`Global revenue (${globalRevenue.toLocaleString()}) below threshold (${revenueThreshold.toLocaleString()})`);
  }
  if (!meetsProfit) {
    reasons.push(`Profit margin (${(profitMargin * 100).toFixed(1)}%) below threshold (${(profitThreshold * 100).toFixed(1)}%)`);
  }

  return {
    inScope: meetsRevenue && meetsProfit,
    reasons,
  };
}

/**
 * Check if entity is in scope for Pillar Two GloBE rules
 */
export function isInScopeForGloBE(globalRevenue: number): boolean {
  return globalRevenue >= PILLAR_TWO_THRESHOLDS.globe.revenueThreshold;
}

/**
 * Calculate Amount A reallocation
 */
export function calculateAmountAReallocation(
  globalRevenue: number,
  profitBeforeTax: number,
  jurisdictionRevenue: number
): { residualProfit: number; reallocationAmount: number; jurisdictionShare: number } {
  const profitMargin = profitBeforeTax / globalRevenue;
  const threshold = PILLAR_ONE_THRESHOLDS.amountA.profitabilityThreshold;
  const reallocationRate = PILLAR_ONE_THRESHOLDS.amountA.reallocationPercentage;

  // Residual profit = profit above 10% threshold
  const residualProfitMargin = Math.max(0, profitMargin - threshold);
  const residualProfit = residualProfitMargin * globalRevenue;

  // Amount A = 25% of residual profit
  const reallocationAmount = residualProfit * reallocationRate;

  // Jurisdiction share based on revenue allocation
  const jurisdictionShare = (jurisdictionRevenue / globalRevenue) * reallocationAmount;

  return {
    residualProfit,
    reallocationAmount,
    jurisdictionShare,
  };
}

/**
 * Calculate GloBE top-up tax
 */
export function calculateGloBETopUp(
  jurisdictionProfit: number,
  jurisdictionTax: number,
  payroll: number,
  tangibleAssets: number,
  year: number
): { etr: number; topUpTax: number; substanceExclusion: number } {
  // Calculate ETR
  const etr = jurisdictionTax / jurisdictionProfit;

  // Calculate substance-based exclusion
  const transition = PILLAR_TWO_THRESHOLDS.globe.substanceBasedIncomeExclusion.transitionPeriod;
  const yearsFromStart = Math.min(year - transition.startYear, transition.endYear - transition.startYear);
  const reductionPerYear = (transition.payrollStartRate - 0.05) / (transition.endYear - transition.startYear);

  const payrollRate = Math.max(0.05, transition.payrollStartRate - (reductionPerYear * yearsFromStart));
  const assetRate = Math.max(0.05, transition.assetStartRate - (reductionPerYear * yearsFromStart));

  const substanceExclusion = (payroll * payrollRate) + (tangibleAssets * assetRate);

  // Calculate top-up tax
  const minimumRate = PILLAR_TWO_THRESHOLDS.globe.minimumTaxRate;
  const taxableProfit = Math.max(0, jurisdictionProfit - substanceExclusion);
  const topUpTax = etr < minimumRate ? taxableProfit * (minimumRate - etr) : 0;

  return {
    etr,
    topUpTax,
    substanceExclusion,
  };
}

/**
 * Get digital service characteristics
 */
export function getDigitalServiceCharacteristics(
  serviceType: DigitalServiceType
): DigitalServiceCharacteristics {
  return DIGITAL_SERVICE_CHARACTERISTICS[serviceType];
}

/**
 * Get applicable profit split keys for service type
 */
export function getApplicableProfitSplitKeys(
  serviceType: DigitalServiceType
): AllocationKey[] {
  const characteristics = DIGITAL_SERVICE_CHARACTERISTICS[serviceType];
  const keys = [...DIGITAL_PROFIT_SPLIT_KEYS];

  // Adjust weights based on characteristics
  if (characteristics.userParticipationLevel === "high") {
    const userKey = keys.find((k) => k.key === "User/Customer Base");
    if (userKey) userKey.weight = 0.35;
  }

  if (characteristics.dataIntensity === "high") {
    const dataKey = keys.find((k) => k.key === "Data Generated");
    if (dataKey) dataKey.weight = 0.25;
  }

  return keys;
}
