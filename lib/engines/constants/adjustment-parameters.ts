/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Comparability Adjustment Parameters Constants
 *
 * Industry-specific parameters and formulas for comparability adjustments
 * including working capital, risk, capacity, geographic, and accounting adjustments.
 * ================================================================================
 */

// =============================================================================
// ADJUSTMENT TYPES
// =============================================================================

export enum AdjustmentType {
  WORKING_CAPITAL = "working_capital",
  RISK = "risk",
  CAPACITY_UTILIZATION = "capacity_utilization",
  GEOGRAPHIC = "geographic",
  ACCOUNTING = "accounting",
  SIZE = "size",
  PRODUCT_FUNCTIONALITY = "product_functionality",
  CONTRACTUAL_TERMS = "contractual_terms",
  ECONOMIC_CIRCUMSTANCES = "economic_circumstances",
}

export enum IndustryType {
  MANUFACTURING = "manufacturing",
  SERVICES = "services",
  TRADING = "trading",
  IT_ITES = "it_ites",
  PHARMACEUTICALS = "pharmaceuticals",
  AUTOMOTIVE = "automotive",
  FINANCIAL_SERVICES = "financial_services",
  RETAIL = "retail",
  FMCG = "fmcg",
  TELECOM = "telecom",
}

// =============================================================================
// WORKING CAPITAL ADJUSTMENT PARAMETERS
// =============================================================================

export interface WorkingCapitalParameters {
  interestRate: number;
  daysInYear: number;
  receivablesDaysFactor: number;
  payablesDaysFactor: number;
  inventoryDaysFactor: number;
}

export const WORKING_CAPITAL_PARAMETERS: WorkingCapitalParameters = {
  interestRate: 0.10, // 10% default, should be PLR + margin
  daysInYear: 365,
  receivablesDaysFactor: 1,
  payablesDaysFactor: -1, // Reduces working capital requirement
  inventoryDaysFactor: 1,
};

export const INDUSTRY_WORKING_CAPITAL_BENCHMARKS: Record<IndustryType, {
  avgReceivableDays: number;
  avgPayableDays: number;
  avgInventoryDays: number;
  interestRateRange: { min: number; max: number };
}> = {
  [IndustryType.MANUFACTURING]: {
    avgReceivableDays: 60,
    avgPayableDays: 45,
    avgInventoryDays: 90,
    interestRateRange: { min: 0.08, max: 0.12 },
  },
  [IndustryType.SERVICES]: {
    avgReceivableDays: 45,
    avgPayableDays: 30,
    avgInventoryDays: 0,
    interestRateRange: { min: 0.08, max: 0.11 },
  },
  [IndustryType.TRADING]: {
    avgReceivableDays: 30,
    avgPayableDays: 45,
    avgInventoryDays: 60,
    interestRateRange: { min: 0.09, max: 0.13 },
  },
  [IndustryType.IT_ITES]: {
    avgReceivableDays: 75,
    avgPayableDays: 30,
    avgInventoryDays: 0,
    interestRateRange: { min: 0.07, max: 0.10 },
  },
  [IndustryType.PHARMACEUTICALS]: {
    avgReceivableDays: 90,
    avgPayableDays: 60,
    avgInventoryDays: 120,
    interestRateRange: { min: 0.08, max: 0.12 },
  },
  [IndustryType.AUTOMOTIVE]: {
    avgReceivableDays: 45,
    avgPayableDays: 60,
    avgInventoryDays: 45,
    interestRateRange: { min: 0.08, max: 0.11 },
  },
  [IndustryType.FINANCIAL_SERVICES]: {
    avgReceivableDays: 30,
    avgPayableDays: 15,
    avgInventoryDays: 0,
    interestRateRange: { min: 0.06, max: 0.09 },
  },
  [IndustryType.RETAIL]: {
    avgReceivableDays: 15,
    avgPayableDays: 45,
    avgInventoryDays: 45,
    interestRateRange: { min: 0.09, max: 0.13 },
  },
  [IndustryType.FMCG]: {
    avgReceivableDays: 30,
    avgPayableDays: 45,
    avgInventoryDays: 30,
    interestRateRange: { min: 0.08, max: 0.11 },
  },
  [IndustryType.TELECOM]: {
    avgReceivableDays: 45,
    avgPayableDays: 60,
    avgInventoryDays: 15,
    interestRateRange: { min: 0.07, max: 0.10 },
  },
};

// =============================================================================
// RISK ADJUSTMENT PARAMETERS
// =============================================================================

export enum RiskType {
  MARKET_RISK = "market_risk",
  INVENTORY_RISK = "inventory_risk",
  CREDIT_RISK = "credit_risk",
  FOREIGN_EXCHANGE_RISK = "foreign_exchange_risk",
  PRODUCT_LIABILITY_RISK = "product_liability_risk",
  WARRANTY_RISK = "warranty_risk",
  R_AND_D_RISK = "r_and_d_risk",
  BUSINESS_CONTINUITY_RISK = "business_continuity_risk",
}

export interface RiskAdjustmentFactor {
  riskType: RiskType;
  description: string;
  weightage: number; // 0 to 1
  adjustmentRange: { min: number; max: number }; // % adjustment
}

export const RISK_ADJUSTMENT_FACTORS: RiskAdjustmentFactor[] = [
  {
    riskType: RiskType.MARKET_RISK,
    description: "Risk of demand fluctuation and market price changes",
    weightage: 0.20,
    adjustmentRange: { min: -3, max: 3 },
  },
  {
    riskType: RiskType.INVENTORY_RISK,
    description: "Risk of inventory obsolescence and carrying costs",
    weightage: 0.15,
    adjustmentRange: { min: -2, max: 2 },
  },
  {
    riskType: RiskType.CREDIT_RISK,
    description: "Risk of customer default on receivables",
    weightage: 0.15,
    adjustmentRange: { min: -1.5, max: 1.5 },
  },
  {
    riskType: RiskType.FOREIGN_EXCHANGE_RISK,
    description: "Risk from currency fluctuations",
    weightage: 0.15,
    adjustmentRange: { min: -2, max: 2 },
  },
  {
    riskType: RiskType.PRODUCT_LIABILITY_RISK,
    description: "Risk of product defects and liability claims",
    weightage: 0.10,
    adjustmentRange: { min: -1.5, max: 1.5 },
  },
  {
    riskType: RiskType.WARRANTY_RISK,
    description: "Risk of warranty claims and after-sales support",
    weightage: 0.10,
    adjustmentRange: { min: -1, max: 1 },
  },
  {
    riskType: RiskType.R_AND_D_RISK,
    description: "Risk of R&D failure or delayed commercialization",
    weightage: 0.10,
    adjustmentRange: { min: -2, max: 2 },
  },
  {
    riskType: RiskType.BUSINESS_CONTINUITY_RISK,
    description: "Risk of business disruption and operational failures",
    weightage: 0.05,
    adjustmentRange: { min: -1, max: 1 },
  },
];

export const INDUSTRY_RISK_PROFILES: Record<IndustryType, {
  overallRiskLevel: "low" | "medium" | "high";
  primaryRisks: RiskType[];
  riskPremiumRange: { min: number; max: number };
}> = {
  [IndustryType.MANUFACTURING]: {
    overallRiskLevel: "medium",
    primaryRisks: [RiskType.INVENTORY_RISK, RiskType.MARKET_RISK, RiskType.PRODUCT_LIABILITY_RISK],
    riskPremiumRange: { min: 1, max: 4 },
  },
  [IndustryType.SERVICES]: {
    overallRiskLevel: "low",
    primaryRisks: [RiskType.CREDIT_RISK, RiskType.BUSINESS_CONTINUITY_RISK],
    riskPremiumRange: { min: 0.5, max: 2 },
  },
  [IndustryType.TRADING]: {
    overallRiskLevel: "medium",
    primaryRisks: [RiskType.INVENTORY_RISK, RiskType.MARKET_RISK, RiskType.FOREIGN_EXCHANGE_RISK],
    riskPremiumRange: { min: 1, max: 3 },
  },
  [IndustryType.IT_ITES]: {
    overallRiskLevel: "low",
    primaryRisks: [RiskType.CREDIT_RISK, RiskType.FOREIGN_EXCHANGE_RISK],
    riskPremiumRange: { min: 0.5, max: 2.5 },
  },
  [IndustryType.PHARMACEUTICALS]: {
    overallRiskLevel: "high",
    primaryRisks: [RiskType.R_AND_D_RISK, RiskType.PRODUCT_LIABILITY_RISK, RiskType.INVENTORY_RISK],
    riskPremiumRange: { min: 2, max: 6 },
  },
  [IndustryType.AUTOMOTIVE]: {
    overallRiskLevel: "medium",
    primaryRisks: [RiskType.MARKET_RISK, RiskType.WARRANTY_RISK, RiskType.INVENTORY_RISK],
    riskPremiumRange: { min: 1.5, max: 4 },
  },
  [IndustryType.FINANCIAL_SERVICES]: {
    overallRiskLevel: "high",
    primaryRisks: [RiskType.CREDIT_RISK, RiskType.MARKET_RISK, RiskType.FOREIGN_EXCHANGE_RISK],
    riskPremiumRange: { min: 2, max: 5 },
  },
  [IndustryType.RETAIL]: {
    overallRiskLevel: "medium",
    primaryRisks: [RiskType.INVENTORY_RISK, RiskType.MARKET_RISK],
    riskPremiumRange: { min: 1, max: 3 },
  },
  [IndustryType.FMCG]: {
    overallRiskLevel: "low",
    primaryRisks: [RiskType.MARKET_RISK, RiskType.INVENTORY_RISK],
    riskPremiumRange: { min: 0.5, max: 2 },
  },
  [IndustryType.TELECOM]: {
    overallRiskLevel: "medium",
    primaryRisks: [RiskType.MARKET_RISK, RiskType.BUSINESS_CONTINUITY_RISK],
    riskPremiumRange: { min: 1, max: 3 },
  },
};

// =============================================================================
// CAPACITY UTILIZATION PARAMETERS
// =============================================================================

export interface CapacityParameters {
  normalUtilization: number; // Typically 75-85%
  fixedCostPercentage: number; // % of total costs that are fixed
  adjustmentThreshold: number; // Minimum difference to warrant adjustment
}

export const INDUSTRY_CAPACITY_PARAMETERS: Record<IndustryType, CapacityParameters> = {
  [IndustryType.MANUFACTURING]: {
    normalUtilization: 0.80,
    fixedCostPercentage: 0.35,
    adjustmentThreshold: 0.10,
  },
  [IndustryType.SERVICES]: {
    normalUtilization: 0.85,
    fixedCostPercentage: 0.60,
    adjustmentThreshold: 0.15,
  },
  [IndustryType.TRADING]: {
    normalUtilization: 0.90,
    fixedCostPercentage: 0.20,
    adjustmentThreshold: 0.15,
  },
  [IndustryType.IT_ITES]: {
    normalUtilization: 0.85,
    fixedCostPercentage: 0.70,
    adjustmentThreshold: 0.10,
  },
  [IndustryType.PHARMACEUTICALS]: {
    normalUtilization: 0.75,
    fixedCostPercentage: 0.40,
    adjustmentThreshold: 0.10,
  },
  [IndustryType.AUTOMOTIVE]: {
    normalUtilization: 0.80,
    fixedCostPercentage: 0.45,
    adjustmentThreshold: 0.10,
  },
  [IndustryType.FINANCIAL_SERVICES]: {
    normalUtilization: 0.90,
    fixedCostPercentage: 0.65,
    adjustmentThreshold: 0.10,
  },
  [IndustryType.RETAIL]: {
    normalUtilization: 0.85,
    fixedCostPercentage: 0.50,
    adjustmentThreshold: 0.15,
  },
  [IndustryType.FMCG]: {
    normalUtilization: 0.85,
    fixedCostPercentage: 0.30,
    adjustmentThreshold: 0.15,
  },
  [IndustryType.TELECOM]: {
    normalUtilization: 0.80,
    fixedCostPercentage: 0.70,
    adjustmentThreshold: 0.10,
  },
};

// =============================================================================
// GEOGRAPHIC ADJUSTMENT PARAMETERS
// =============================================================================

export interface GeographicFactor {
  region: string;
  laborCostIndex: number; // Base 100 = India
  overheadCostIndex: number;
  marketSizeIndex: number;
  purchasingPowerIndex: number;
}

export const GEOGRAPHIC_FACTORS: GeographicFactor[] = [
  {
    region: "India",
    laborCostIndex: 100,
    overheadCostIndex: 100,
    marketSizeIndex: 100,
    purchasingPowerIndex: 100,
  },
  {
    region: "USA",
    laborCostIndex: 450,
    overheadCostIndex: 300,
    marketSizeIndex: 350,
    purchasingPowerIndex: 250,
  },
  {
    region: "UK",
    laborCostIndex: 380,
    overheadCostIndex: 280,
    marketSizeIndex: 200,
    purchasingPowerIndex: 230,
  },
  {
    region: "Germany",
    laborCostIndex: 420,
    overheadCostIndex: 290,
    marketSizeIndex: 220,
    purchasingPowerIndex: 240,
  },
  {
    region: "Japan",
    laborCostIndex: 350,
    overheadCostIndex: 320,
    marketSizeIndex: 250,
    purchasingPowerIndex: 200,
  },
  {
    region: "China",
    laborCostIndex: 150,
    overheadCostIndex: 120,
    marketSizeIndex: 300,
    purchasingPowerIndex: 130,
  },
  {
    region: "Singapore",
    laborCostIndex: 300,
    overheadCostIndex: 250,
    marketSizeIndex: 80,
    purchasingPowerIndex: 280,
  },
  {
    region: "UAE",
    laborCostIndex: 200,
    overheadCostIndex: 180,
    marketSizeIndex: 90,
    purchasingPowerIndex: 220,
  },
  {
    region: "Australia",
    laborCostIndex: 400,
    overheadCostIndex: 280,
    marketSizeIndex: 120,
    purchasingPowerIndex: 260,
  },
  {
    region: "Brazil",
    laborCostIndex: 120,
    overheadCostIndex: 130,
    marketSizeIndex: 180,
    purchasingPowerIndex: 90,
  },
];

// =============================================================================
// ACCOUNTING ADJUSTMENT PARAMETERS
// =============================================================================

export enum AccountingStandard {
  IND_AS = "ind_as",
  IGAAP = "igaap",
  US_GAAP = "us_gaap",
  IFRS = "ifrs",
}

export interface AccountingAdjustmentItem {
  item: string;
  description: string;
  typicalDifference: string;
  adjustmentApproach: string;
}

export const ACCOUNTING_ADJUSTMENTS: AccountingAdjustmentItem[] = [
  {
    item: "Depreciation",
    description: "Differences in depreciation methods and useful lives",
    typicalDifference: "SLM vs WDV, useful life variations",
    adjustmentApproach: "Recompute using consistent method",
  },
  {
    item: "Inventory Valuation",
    description: "FIFO vs weighted average vs LIFO differences",
    typicalDifference: "Up to 5-10% in periods of price volatility",
    adjustmentApproach: "Restate inventory using consistent method",
  },
  {
    item: "Revenue Recognition",
    description: "Timing differences in revenue recognition",
    typicalDifference: "Contract modifications, percentage completion",
    adjustmentApproach: "Normalize to consistent recognition policy",
  },
  {
    item: "Provisions",
    description: "Differences in provisioning policies",
    typicalDifference: "Bad debt, warranty, legal provisions",
    adjustmentApproach: "Apply consistent provisioning rates",
  },
  {
    item: "R&D Costs",
    description: "Capitalization vs expensing differences",
    typicalDifference: "Development costs treatment",
    adjustmentApproach: "Normalize capitalization policy",
  },
  {
    item: "Foreign Currency",
    description: "Translation and transaction differences",
    typicalDifference: "Functional currency, hedge accounting",
    adjustmentApproach: "Apply consistent translation rates",
  },
  {
    item: "Leases",
    description: "Operating vs finance lease classification",
    typicalDifference: "Significant under Ind AS 116/IFRS 16",
    adjustmentApproach: "Normalize lease treatment",
  },
  {
    item: "Employee Benefits",
    description: "Pension and gratuity valuations",
    typicalDifference: "Actuarial assumptions",
    adjustmentApproach: "Use consistent actuarial basis",
  },
];

// =============================================================================
// PLI-SPECIFIC ADJUSTMENT THRESHOLDS
// =============================================================================

export interface PLIAdjustmentThreshold {
  pli: string;
  materialityThreshold: number; // Minimum adjustment to be material
  maxReasonableAdjustment: number; // Maximum credible adjustment
  documentationRequired: string[];
}

export const PLI_ADJUSTMENT_THRESHOLDS: PLIAdjustmentThreshold[] = [
  {
    pli: "Operating Profit/Operating Cost (OP/OC)",
    materialityThreshold: 0.005, // 0.5%
    maxReasonableAdjustment: 0.05, // 5%
    documentationRequired: [
      "Working capital calculation",
      "Risk analysis",
      "Capacity utilization data",
    ],
  },
  {
    pli: "Operating Profit/Sales (OP/Sales)",
    materialityThreshold: 0.005, // 0.5%
    maxReasonableAdjustment: 0.05, // 5%
    documentationRequired: [
      "Working capital calculation",
      "Risk analysis",
      "Geographic factors",
    ],
  },
  {
    pli: "Net Cost Plus (NCP)",
    materialityThreshold: 0.01, // 1%
    maxReasonableAdjustment: 0.08, // 8%
    documentationRequired: [
      "Cost structure analysis",
      "Capacity utilization",
      "Risk allocation",
    ],
  },
  {
    pli: "Return on Capital Employed (ROCE)",
    materialityThreshold: 0.01, // 1%
    maxReasonableAdjustment: 0.10, // 10%
    documentationRequired: [
      "Capital structure analysis",
      "Asset valuation",
      "Risk assessment",
    ],
  },
  {
    pli: "Berry Ratio (GP/Operating Expenses)",
    materialityThreshold: 0.05, // 5%
    maxReasonableAdjustment: 0.20, // 20%
    documentationRequired: [
      "Operating expense analysis",
      "Gross profit reconciliation",
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate working capital adjustment factor
 */
export function calculateWorkingCapitalFactor(
  receivableDays: number,
  payableDays: number,
  inventoryDays: number,
  revenue: number,
  costOfSales: number,
  interestRate: number = WORKING_CAPITAL_PARAMETERS.interestRate
): number {
  const netWorkingCapitalDays = receivableDays - payableDays + inventoryDays;
  const avgDailyRevenue = revenue / WORKING_CAPITAL_PARAMETERS.daysInYear;
  const workingCapitalRequired = netWorkingCapitalDays * avgDailyRevenue;
  const wcAdjustment = (workingCapitalRequired * interestRate) / revenue;

  return wcAdjustment;
}

/**
 * Calculate capacity utilization adjustment
 */
export function calculateCapacityAdjustment(
  actualUtilization: number,
  normalUtilization: number,
  fixedCostPercentage: number,
  operatingCost: number
): number {
  if (actualUtilization >= normalUtilization) {
    return 0;
  }

  const utilizationGap = normalUtilization - actualUtilization;
  const fixedCostImpact = operatingCost * fixedCostPercentage;
  const adjustment = (fixedCostImpact * utilizationGap) / actualUtilization;

  return adjustment;
}

/**
 * Get industry-specific parameters
 */
export function getIndustryParameters(industry: IndustryType): {
  workingCapital: typeof INDUSTRY_WORKING_CAPITAL_BENCHMARKS[IndustryType];
  risk: typeof INDUSTRY_RISK_PROFILES[IndustryType];
  capacity: typeof INDUSTRY_CAPACITY_PARAMETERS[IndustryType];
} {
  return {
    workingCapital: INDUSTRY_WORKING_CAPITAL_BENCHMARKS[industry],
    risk: INDUSTRY_RISK_PROFILES[industry],
    capacity: INDUSTRY_CAPACITY_PARAMETERS[industry],
  };
}

/**
 * Get geographic adjustment factor between two regions
 */
export function getGeographicAdjustmentFactor(
  testedPartyRegion: string,
  comparableRegion: string,
  factorType: keyof Omit<GeographicFactor, "region">
): number | null {
  const testedParty = GEOGRAPHIC_FACTORS.find((g) => g.region === testedPartyRegion);
  const comparable = GEOGRAPHIC_FACTORS.find((g) => g.region === comparableRegion);

  if (!testedParty || !comparable) {
    return null;
  }

  return (testedParty[factorType] - comparable[factorType]) / comparable[factorType];
}

/**
 * Check if adjustment is material
 */
export function isAdjustmentMaterial(
  adjustmentPercent: number,
  pli: string
): boolean {
  const threshold = PLI_ADJUSTMENT_THRESHOLDS.find((t) => t.pli === pli);
  if (!threshold) {
    return Math.abs(adjustmentPercent) > 0.005; // Default 0.5%
  }
  return Math.abs(adjustmentPercent) > threshold.materialityThreshold;
}

/**
 * Check if adjustment is within reasonable bounds
 */
export function isAdjustmentReasonable(
  adjustmentPercent: number,
  pli: string
): { reasonable: boolean; maxAllowed: number } {
  const threshold = PLI_ADJUSTMENT_THRESHOLDS.find((t) => t.pli === pli);
  const maxAllowed = threshold?.maxReasonableAdjustment || 0.10;

  return {
    reasonable: Math.abs(adjustmentPercent) <= maxAllowed,
    maxAllowed,
  };
}

/**
 * Get required documentation for adjustments
 */
export function getRequiredDocumentation(
  adjustmentTypes: AdjustmentType[]
): string[] {
  const docs = new Set<string>();

  adjustmentTypes.forEach((type) => {
    switch (type) {
      case AdjustmentType.WORKING_CAPITAL:
        docs.add("Working capital calculation sheet");
        docs.add("Interest rate justification");
        docs.add("Receivables/Payables/Inventory aging");
        break;
      case AdjustmentType.RISK:
        docs.add("Risk analysis report");
        docs.add("FAR analysis highlighting risk assumption");
        docs.add("Risk allocation matrix");
        break;
      case AdjustmentType.CAPACITY_UTILIZATION:
        docs.add("Capacity utilization report");
        docs.add("Fixed vs variable cost segregation");
        docs.add("Industry capacity benchmarks");
        break;
      case AdjustmentType.GEOGRAPHIC:
        docs.add("Geographic market study");
        docs.add("Labor cost analysis");
        docs.add("Market size comparison");
        break;
      case AdjustmentType.ACCOUNTING:
        docs.add("Accounting policy reconciliation");
        docs.add("GAAP difference analysis");
        docs.add("Restated financial statements");
        break;
    }
  });

  return Array.from(docs);
}
