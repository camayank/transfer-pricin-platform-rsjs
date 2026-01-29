/**
 * Comparable Intelligence Engine
 * Advanced Transfer Pricing Comparability Analysis
 *
 * This engine provides sophisticated analytical capabilities for:
 * - FAR (Function-Asset-Risk) profiling and scoring
 * - Statistical benchmarking with quartile analysis
 * - Automated comparability adjustments
 * - Multi-dimensional comparable quality scoring
 * - Outlier detection and rejection matrix
 *
 * Designed to match or exceed capabilities of Prowess/Capitaline
 */

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type DatabaseSource = "INTERNAL" | "MCA" | "MANUAL";

export type FunctionalProfile =
  | "MANUFACTURER_FULL_FLEDGED"
  | "MANUFACTURER_CONTRACT"
  | "MANUFACTURER_TOLL"
  | "DISTRIBUTOR_FULL_FLEDGED"
  | "DISTRIBUTOR_LIMITED_RISK"
  | "DISTRIBUTOR_COMMISSIONAIRE"
  | "SERVICE_PROVIDER_FULL"
  | "SERVICE_PROVIDER_CONTRACT"
  | "IT_SERVICES"
  | "ITES_BPO"
  | "KPO"
  | "R_AND_D_FULL"
  | "R_AND_D_CONTRACT"
  | "HOLDING_COMPANY"
  | "FINANCING";

export type PLIType =
  | "OP_OC"      // Operating Profit / Operating Cost
  | "OP_OR"      // Operating Profit / Operating Revenue
  | "OP_TC"      // Operating Profit / Total Cost
  | "GP_SALES"   // Gross Profit / Sales
  | "NCP_SALES"  // Net Cost Plus
  | "BERRY_RATIO" // Gross Profit / Operating Expenses
  | "ROA"        // Return on Assets
  | "ROCE";      // Return on Capital Employed

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface CompanyFinancials {
  year: string;
  revenue: number;
  operatingRevenue: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  operatingCost: number;
  totalCost: number;
  totalAssets: number;
  fixedAssets: number;
  currentAssets: number;
  currentLiabilities: number;
  inventory: number;
  receivables: number;
  payables: number;
  capitalEmployed: number;
  employeeCost: number;
  depreciation: number;
  rndExpense?: number;
  relatedPartyTransactions?: number;
  relatedPartyPercent?: number;
}

export interface PLICalculated {
  pliType: PLIType;
  value: number;
  year: string;
  isOutlier?: boolean;
  adjustedValue?: number;
}

export interface FARProfile {
  functions: {
    manufacturing: RiskLevel;
    procurement: RiskLevel;
    marketing: RiskLevel;
    distribution: RiskLevel;
    rAndD: RiskLevel;
    qualityControl: RiskLevel;
    strategicDecisions: RiskLevel;
    financialManagement: RiskLevel;
  };
  assets: {
    tangibleAssets: RiskLevel;
    intangibleAssets: RiskLevel;
    inventory: RiskLevel;
    receivables: RiskLevel;
    brand: RiskLevel;
    technology: RiskLevel;
  };
  risks: {
    marketRisk: RiskLevel;
    creditRisk: RiskLevel;
    inventoryRisk: RiskLevel;
    foreignExchangeRisk: RiskLevel;
    productLiabilityRisk: RiskLevel;
    operationalRisk: RiskLevel;
    financialRisk: RiskLevel;
  };
  overallProfile: FunctionalProfile;
  score: number; // 0-100
}

export interface ComparabilityScore {
  overall: number;        // 0-100
  functional: number;     // FAR similarity
  financial: number;      // Size/scale similarity
  industry: number;       // Industry match
  geographic: number;     // Geographic factors
  temporal: number;       // Time period overlap
  qualitative: number;    // Data quality
  breakdown: {
    factor: string;
    score: number;
    weight: number;
    weightedScore: number;
    notes: string;
  }[];
}

export interface RejectionReason {
  code: string;
  reason: string;
  severity: "HARD" | "SOFT";
  details: string;
  regulatoryBasis?: string;
}

export interface ComparableCompany {
  id: string;
  cin: string;
  name: string;
  nicCode: string;
  nicDescription: string;
  industry: string;
  subIndustry: string;
  functionalProfile: FunctionalProfile;
  farProfile?: FARProfile;
  financials: CompanyFinancials[];
  plis: PLICalculated[];
  status: "ACTIVE" | "INACTIVE" | "UNDER_LIQUIDATION";
  source: DatabaseSource;

  // Quality indicators
  dataQualityScore: number;
  yearsOfData: number;
  hasRelatedPartyTransactions: boolean;
  relatedPartyPercent: number;
  hasPersistentLosses: boolean;
  lossYears: number;
  hasExtraordinaryItems: boolean;

  // Comparability assessment
  comparabilityScore?: ComparabilityScore;
  isAccepted: boolean;
  rejectionReasons?: RejectionReason[];

  // Adjustments
  workingCapitalAdjustment?: number;
  riskAdjustment?: number;
  adjustedPLI?: number;
}

export interface ComparableSearchCriteria {
  nicCodes?: string[];
  nicCodeRange?: { from: string; to: string };
  functionalProfile?: FunctionalProfile;
  revenueMin?: number;
  revenueMax?: number;
  excludeRelatedPartyAbove?: number;
  excludePersistentLosses?: boolean;
  minYearsData?: number;
  financialYears?: string[];
  employeeCostRatioMin?: number;
  employeeCostRatioMax?: number;
  exportRevenueMin?: number;
  exportRevenueMax?: number;
  status?: ("ACTIVE" | "INACTIVE")[];
  excludeCompanies?: string[];
  keywords?: string[];
}

export interface BenchmarkingSet {
  comparables: ComparableCompany[];
  testedPartyPLI?: number;
  pliType: PLIType;

  // Statistical measures
  statistics: {
    count: number;
    mean: number;
    median: number;
    standardDeviation: number;
    min: number;
    max: number;
    q1: number;      // 25th percentile
    q3: number;      // 75th percentile
    iqr: number;     // Interquartile range
    lowerFence: number;  // Q1 - 1.5*IQR
    upperFence: number;  // Q3 + 1.5*IQR
  };

  // Arm's length range
  armLengthRange: {
    lowerBound: number;   // 35th percentile
    upperBound: number;   // 65th percentile
    fullRangeLower: number;
    fullRangeUpper: number;
    interquartileLower: number;  // 25th
    interquartileUpper: number;  // 75th
    median: number;
  };

  // Tested party analysis
  testedPartyAnalysis?: {
    pli: number;
    withinArmLengthRange: boolean;
    withinInterquartileRange: boolean;
    percentile: number;
    adjustment?: number;
    adjustedToMedian: boolean;
  };

  // Metadata
  analysisDate: string;
  financialYears: string[];
  methodology: string;
}

export interface WorkingCapitalAdjustment {
  companyId: string;
  companyName: string;
  originalPLI: number;
  adjustedPLI: number;
  adjustment: number;

  // Working capital components
  receivablesDays: number;
  inventoryDays: number;
  payablesDays: number;
  workingCapitalDays: number;

  // Tested party comparison
  testedPartyWCDays: number;
  difference: number;
  adjustmentRate: number;
}

export interface ComparabilityAnalysis {
  testedParty: {
    name: string;
    functionalProfile: FunctionalProfile;
    farProfile: FARProfile;
    pli: number;
    pliType: PLIType;
    financials: CompanyFinancials;
  };
  searchCriteria: ComparableSearchCriteria;
  initialPool: number;
  afterScreening: number;
  finalSet: number;
  rejectionMatrix: {
    reason: string;
    count: number;
    companies: string[];
  }[];
  acceptedComparables: ComparableCompany[];
  benchmarkingSet: BenchmarkingSet;
  conclusion: {
    isArmLength: boolean;
    testedPartyPLI: number;
    armLengthRangeLower: number;
    armLengthRangeUpper: number;
    median: number;
    adjustment?: number;
    narrative: string;
  };
}

// Type aliases for backward compatibility with index.ts
export type UnifiedSearchCriteria = ComparableSearchCriteria;
export interface UnifiedSearchResult {
  companies: ComparableCompany[];
  totalCount: number;
  page: number;
  pageSize: number;
  appliedFilters: ComparableSearchCriteria;
  searchTime: number;
  sources: DatabaseSource[];
}
export interface RejectionAnalysis {
  totalInitialPool: number;
  totalRejected: number;
  totalAccepted: number;
  rejectionMatrix: Array<{
    reason: string;
    regulatoryBasis: string;
    count: number;
    percentage: number;
    rejectedCompanies: string[];
  }>;
  acceptanceRate: number;
}

// =============================================================================
// NIC CODE REFERENCE
// =============================================================================

export const NIC_CODES: Record<string, { description: string; group: string }> = {
  "62": { description: "Computer programming, consultancy and related activities", group: "IT Services" },
  "6201": { description: "Computer programming activities", group: "IT Services" },
  "6202": { description: "Computer consultancy and computer facilities management activities", group: "IT Services" },
  "6209": { description: "Other information technology and computer service activities", group: "IT Services" },
  "63": { description: "Information service activities", group: "IT Services" },
  "6311": { description: "Data processing, hosting and related activities", group: "ITES/BPO" },
  "6312": { description: "Web portals", group: "IT Services" },
  "82": { description: "Office administrative, office support and other business support activities", group: "ITES/BPO" },
  "8211": { description: "Combined office administrative service activities", group: "ITES/BPO" },
  "8220": { description: "Activities of call centres", group: "ITES/BPO" },
  "72": { description: "Scientific research and development", group: "R&D" },
  "7210": { description: "Research and experimental development on natural sciences and engineering", group: "R&D" },
  "7220": { description: "Research and experimental development on social sciences and humanities", group: "R&D" },
  "21": { description: "Manufacture of pharmaceuticals, medicinal chemical and botanical products", group: "Pharma" },
  "2100": { description: "Manufacture of pharmaceuticals, medicinal chemical and botanical products", group: "Pharma" },
  "26": { description: "Manufacture of computer, electronic and optical products", group: "Electronics" },
  "29": { description: "Manufacture of motor vehicles, trailers and semi-trailers", group: "Automotive" },
  "46": { description: "Wholesale trade, except of motor vehicles and motorcycles", group: "Trading" },
  "47": { description: "Retail trade, except of motor vehicles and motorcycles", group: "Trading" }
};

// =============================================================================
// PLI DESCRIPTIONS AND RECOMMENDATIONS
// =============================================================================

export const PLI_DESCRIPTIONS: Record<PLIType, {
  name: string;
  formula: string;
  description: string;
  applicability: string[];
}> = {
  "OP_OC": {
    name: "Operating Profit to Operating Cost",
    formula: "Operating Profit / Operating Cost × 100",
    description: "Most commonly used PLI for service providers. Measures return on operating costs.",
    applicability: ["IT_SERVICES", "ITES_BPO", "KPO", "SERVICE_PROVIDER_CONTRACT", "R_AND_D_CONTRACT"]
  },
  "OP_OR": {
    name: "Operating Profit to Operating Revenue",
    formula: "Operating Profit / Operating Revenue × 100",
    description: "Measures operating margin. Suitable for full-fledged entities.",
    applicability: ["MANUFACTURER_FULL_FLEDGED", "DISTRIBUTOR_FULL_FLEDGED", "SERVICE_PROVIDER_FULL"]
  },
  "OP_TC": {
    name: "Operating Profit to Total Cost",
    formula: "Operating Profit / Total Cost × 100",
    description: "Comprehensive cost-based PLI including non-operating costs.",
    applicability: ["MANUFACTURER_CONTRACT", "SERVICE_PROVIDER_CONTRACT"]
  },
  "GP_SALES": {
    name: "Gross Profit to Sales",
    formula: "Gross Profit / Net Sales × 100",
    description: "Measures gross margin. Suitable for trading/distribution entities.",
    applicability: ["DISTRIBUTOR_FULL_FLEDGED", "DISTRIBUTOR_LIMITED_RISK"]
  },
  "NCP_SALES": {
    name: "Net Cost Plus",
    formula: "(Sales - Total Cost) / Total Cost × 100",
    description: "Full cost plus markup. Comprehensive profitability measure.",
    applicability: ["MANUFACTURER_CONTRACT", "MANUFACTURER_TOLL"]
  },
  "BERRY_RATIO": {
    name: "Berry Ratio",
    formula: "Gross Profit / Operating Expenses",
    description: "Ratio of gross profit to operating expenses. Useful for distribution entities.",
    applicability: ["DISTRIBUTOR_LIMITED_RISK", "DISTRIBUTOR_COMMISSIONAIRE"]
  },
  "ROA": {
    name: "Return on Assets",
    formula: "Operating Profit / Total Assets × 100",
    description: "Measures return relative to assets employed. For asset-intensive operations.",
    applicability: ["MANUFACTURER_FULL_FLEDGED", "R_AND_D_FULL"]
  },
  "ROCE": {
    name: "Return on Capital Employed",
    formula: "Operating Profit / Capital Employed × 100",
    description: "Measures return on capital. For capital-intensive operations.",
    applicability: ["MANUFACTURER_FULL_FLEDGED", "FINANCING"]
  }
};

// =============================================================================
// SAMPLE COMPARABLE COMPANIES DATABASE
// =============================================================================

const SAMPLE_COMPANIES: ComparableCompany[] = [
  // IT Services Companies
  {
    id: "COMP001",
    cin: "U72200KA2001PTC028845",
    name: "TechServe Solutions Private Limited",
    nicCode: "6201",
    nicDescription: "Computer programming activities",
    industry: "Information Technology",
    subIndustry: "Software Development",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 485000000,
        operatingRevenue: 480000000,
        grossProfit: 145000000,
        operatingProfit: 62000000,
        netProfit: 48000000,
        operatingCost: 418000000,
        totalCost: 437000000,
        totalAssets: 290000000,
        fixedAssets: 45000000,
        currentAssets: 220000000,
        currentLiabilities: 95000000,
        inventory: 0,
        receivables: 85000000,
        payables: 42000000,
        capitalEmployed: 195000000,
        employeeCost: 285000000,
        depreciation: 12000000,
        relatedPartyTransactions: 15000000,
        relatedPartyPercent: 3.1
      },
      {
        year: "2022-23",
        revenue: 425000000,
        operatingRevenue: 420000000,
        grossProfit: 126000000,
        operatingProfit: 52000000,
        netProfit: 40000000,
        operatingCost: 368000000,
        totalCost: 385000000,
        totalAssets: 255000000,
        fixedAssets: 40000000,
        currentAssets: 195000000,
        currentLiabilities: 82000000,
        inventory: 0,
        receivables: 72000000,
        payables: 38000000,
        capitalEmployed: 173000000,
        employeeCost: 252000000,
        depreciation: 10000000,
        relatedPartyTransactions: 12000000,
        relatedPartyPercent: 2.8
      },
      {
        year: "2021-22",
        revenue: 380000000,
        operatingRevenue: 375000000,
        grossProfit: 112000000,
        operatingProfit: 45000000,
        netProfit: 35000000,
        operatingCost: 330000000,
        totalCost: 345000000,
        totalAssets: 225000000,
        fixedAssets: 35000000,
        currentAssets: 175000000,
        currentLiabilities: 72000000,
        inventory: 0,
        receivables: 65000000,
        payables: 35000000,
        capitalEmployed: 153000000,
        employeeCost: 228000000,
        depreciation: 9000000,
        relatedPartyTransactions: 10000000,
        relatedPartyPercent: 2.6
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 14.83, year: "2023-24" },
      { pliType: "OP_OC", value: 14.13, year: "2022-23" },
      { pliType: "OP_OC", value: 13.64, year: "2021-22" },
      { pliType: "OP_OR", value: 12.92, year: "2023-24" },
      { pliType: "OP_OR", value: 12.38, year: "2022-23" },
      { pliType: "OP_OR", value: 12.00, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 92,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 3.1,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP002",
    cin: "U72900MH2005PTC152847",
    name: "InfoTech Consulting India Private Limited",
    nicCode: "6202",
    nicDescription: "Computer consultancy activities",
    industry: "Information Technology",
    subIndustry: "IT Consulting",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 720000000,
        operatingRevenue: 715000000,
        grossProfit: 230000000,
        operatingProfit: 100000000,
        netProfit: 78000000,
        operatingCost: 615000000,
        totalCost: 642000000,
        totalAssets: 420000000,
        fixedAssets: 65000000,
        currentAssets: 325000000,
        currentLiabilities: 140000000,
        inventory: 0,
        receivables: 125000000,
        payables: 55000000,
        capitalEmployed: 280000000,
        employeeCost: 425000000,
        depreciation: 18000000,
        relatedPartyTransactions: 8000000,
        relatedPartyPercent: 1.1
      },
      {
        year: "2022-23",
        revenue: 650000000,
        operatingRevenue: 645000000,
        grossProfit: 205000000,
        operatingProfit: 88000000,
        netProfit: 68000000,
        operatingCost: 557000000,
        totalCost: 582000000,
        totalAssets: 385000000,
        fixedAssets: 58000000,
        currentAssets: 298000000,
        currentLiabilities: 125000000,
        inventory: 0,
        receivables: 112000000,
        payables: 48000000,
        capitalEmployed: 260000000,
        employeeCost: 390000000,
        depreciation: 16000000,
        relatedPartyTransactions: 7000000,
        relatedPartyPercent: 1.1
      },
      {
        year: "2021-22",
        revenue: 580000000,
        operatingRevenue: 575000000,
        grossProfit: 180000000,
        operatingProfit: 75000000,
        netProfit: 58000000,
        operatingCost: 500000000,
        totalCost: 522000000,
        totalAssets: 350000000,
        fixedAssets: 52000000,
        currentAssets: 270000000,
        currentLiabilities: 112000000,
        inventory: 0,
        receivables: 98000000,
        payables: 42000000,
        capitalEmployed: 238000000,
        employeeCost: 352000000,
        depreciation: 14000000,
        relatedPartyTransactions: 6000000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 16.26, year: "2023-24" },
      { pliType: "OP_OC", value: 15.80, year: "2022-23" },
      { pliType: "OP_OC", value: 15.00, year: "2021-22" },
      { pliType: "OP_OR", value: 13.99, year: "2023-24" },
      { pliType: "OP_OR", value: 13.64, year: "2022-23" },
      { pliType: "OP_OR", value: 13.04, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 95,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.1,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP003",
    cin: "U72100TN2008PTC065892",
    name: "SoftDev Technologies Private Limited",
    nicCode: "6201",
    nicDescription: "Computer programming activities",
    industry: "Information Technology",
    subIndustry: "Software Development",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 320000000,
        operatingRevenue: 318000000,
        grossProfit: 96000000,
        operatingProfit: 38000000,
        netProfit: 29000000,
        operatingCost: 280000000,
        totalCost: 291000000,
        totalAssets: 185000000,
        fixedAssets: 28000000,
        currentAssets: 142000000,
        currentLiabilities: 58000000,
        inventory: 0,
        receivables: 55000000,
        payables: 28000000,
        capitalEmployed: 127000000,
        employeeCost: 195000000,
        depreciation: 7000000,
        relatedPartyTransactions: 4000000,
        relatedPartyPercent: 1.2
      },
      {
        year: "2022-23",
        revenue: 285000000,
        operatingRevenue: 282000000,
        grossProfit: 84000000,
        operatingProfit: 32000000,
        netProfit: 24000000,
        operatingCost: 250000000,
        totalCost: 261000000,
        totalAssets: 165000000,
        fixedAssets: 25000000,
        currentAssets: 128000000,
        currentLiabilities: 52000000,
        inventory: 0,
        receivables: 48000000,
        payables: 25000000,
        capitalEmployed: 113000000,
        employeeCost: 175000000,
        depreciation: 6000000,
        relatedPartyTransactions: 3500000,
        relatedPartyPercent: 1.2
      },
      {
        year: "2021-22",
        revenue: 250000000,
        operatingRevenue: 248000000,
        grossProfit: 72000000,
        operatingProfit: 27000000,
        netProfit: 20000000,
        operatingCost: 221000000,
        totalCost: 230000000,
        totalAssets: 145000000,
        fixedAssets: 22000000,
        currentAssets: 112000000,
        currentLiabilities: 45000000,
        inventory: 0,
        receivables: 42000000,
        payables: 22000000,
        capitalEmployed: 100000000,
        employeeCost: 155000000,
        depreciation: 5000000,
        relatedPartyTransactions: 3000000,
        relatedPartyPercent: 1.2
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 13.57, year: "2023-24" },
      { pliType: "OP_OC", value: 12.80, year: "2022-23" },
      { pliType: "OP_OC", value: 12.22, year: "2021-22" },
      { pliType: "OP_OR", value: 11.95, year: "2023-24" },
      { pliType: "OP_OR", value: 11.35, year: "2022-23" },
      { pliType: "OP_OR", value: 10.89, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 88,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.2,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP004",
    cin: "U72200DL2006PTC148562",
    name: "DataPro Services India Private Limited",
    nicCode: "6311",
    nicDescription: "Data processing, hosting and related activities",
    industry: "Information Technology",
    subIndustry: "ITES/BPO",
    functionalProfile: "ITES_BPO",
    financials: [
      {
        year: "2023-24",
        revenue: 550000000,
        operatingRevenue: 545000000,
        grossProfit: 170000000,
        operatingProfit: 72000000,
        netProfit: 55000000,
        operatingCost: 473000000,
        totalCost: 495000000,
        totalAssets: 320000000,
        fixedAssets: 48000000,
        currentAssets: 248000000,
        currentLiabilities: 105000000,
        inventory: 0,
        receivables: 95000000,
        payables: 42000000,
        capitalEmployed: 215000000,
        employeeCost: 328000000,
        depreciation: 13000000,
        relatedPartyTransactions: 5000000,
        relatedPartyPercent: 0.9
      },
      {
        year: "2022-23",
        revenue: 495000000,
        operatingRevenue: 490000000,
        grossProfit: 152000000,
        operatingProfit: 63000000,
        netProfit: 48000000,
        operatingCost: 427000000,
        totalCost: 447000000,
        totalAssets: 290000000,
        fixedAssets: 43000000,
        currentAssets: 225000000,
        currentLiabilities: 95000000,
        inventory: 0,
        receivables: 85000000,
        payables: 38000000,
        capitalEmployed: 195000000,
        employeeCost: 298000000,
        depreciation: 11000000,
        relatedPartyTransactions: 4500000,
        relatedPartyPercent: 0.9
      },
      {
        year: "2021-22",
        revenue: 445000000,
        operatingRevenue: 440000000,
        grossProfit: 135000000,
        operatingProfit: 54000000,
        netProfit: 41000000,
        operatingCost: 386000000,
        totalCost: 404000000,
        totalAssets: 265000000,
        fixedAssets: 39000000,
        currentAssets: 205000000,
        currentLiabilities: 85000000,
        inventory: 0,
        receivables: 75000000,
        payables: 34000000,
        capitalEmployed: 180000000,
        employeeCost: 270000000,
        depreciation: 10000000,
        relatedPartyTransactions: 4000000,
        relatedPartyPercent: 0.9
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 15.22, year: "2023-24" },
      { pliType: "OP_OC", value: 14.75, year: "2022-23" },
      { pliType: "OP_OC", value: 13.99, year: "2021-22" },
      { pliType: "OP_OR", value: 13.21, year: "2023-24" },
      { pliType: "OP_OR", value: 12.86, year: "2022-23" },
      { pliType: "OP_OR", value: 12.27, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 91,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 0.9,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP005",
    cin: "U74999KA2004PTC035276",
    name: "GlobalServe BPO Private Limited",
    nicCode: "8220",
    nicDescription: "Activities of call centres",
    industry: "Business Support Services",
    subIndustry: "ITES/BPO",
    functionalProfile: "ITES_BPO",
    financials: [
      {
        year: "2023-24",
        revenue: 380000000,
        operatingRevenue: 375000000,
        grossProfit: 115000000,
        operatingProfit: 48000000,
        netProfit: 36000000,
        operatingCost: 327000000,
        totalCost: 344000000,
        totalAssets: 225000000,
        fixedAssets: 35000000,
        currentAssets: 172000000,
        currentLiabilities: 75000000,
        inventory: 0,
        receivables: 65000000,
        payables: 30000000,
        capitalEmployed: 150000000,
        employeeCost: 235000000,
        depreciation: 9000000,
        relatedPartyTransactions: 6000000,
        relatedPartyPercent: 1.6
      },
      {
        year: "2022-23",
        revenue: 345000000,
        operatingRevenue: 340000000,
        grossProfit: 102000000,
        operatingProfit: 42000000,
        netProfit: 31000000,
        operatingCost: 298000000,
        totalCost: 314000000,
        totalAssets: 205000000,
        fixedAssets: 32000000,
        currentAssets: 158000000,
        currentLiabilities: 68000000,
        inventory: 0,
        receivables: 58000000,
        payables: 27000000,
        capitalEmployed: 137000000,
        employeeCost: 215000000,
        depreciation: 8000000,
        relatedPartyTransactions: 5500000,
        relatedPartyPercent: 1.6
      },
      {
        year: "2021-22",
        revenue: 310000000,
        operatingRevenue: 305000000,
        grossProfit: 90000000,
        operatingProfit: 36000000,
        netProfit: 27000000,
        operatingCost: 269000000,
        totalCost: 283000000,
        totalAssets: 188000000,
        fixedAssets: 29000000,
        currentAssets: 145000000,
        currentLiabilities: 62000000,
        inventory: 0,
        receivables: 52000000,
        payables: 24000000,
        capitalEmployed: 126000000,
        employeeCost: 195000000,
        depreciation: 7000000,
        relatedPartyTransactions: 5000000,
        relatedPartyPercent: 1.6
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 14.68, year: "2023-24" },
      { pliType: "OP_OC", value: 14.09, year: "2022-23" },
      { pliType: "OP_OC", value: 13.38, year: "2021-22" },
      { pliType: "OP_OR", value: 12.80, year: "2023-24" },
      { pliType: "OP_OR", value: 12.35, year: "2022-23" },
      { pliType: "OP_OR", value: 11.80, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 87,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.6,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP006",
    cin: "U72300PB2007PTC030986",
    name: "NextGen Software Solutions Private Limited",
    nicCode: "6201",
    nicDescription: "Computer programming activities",
    industry: "Information Technology",
    subIndustry: "Software Development",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 195000000,
        operatingRevenue: 192000000,
        grossProfit: 58000000,
        operatingProfit: 22000000,
        netProfit: 16000000,
        operatingCost: 170000000,
        totalCost: 179000000,
        totalAssets: 115000000,
        fixedAssets: 18000000,
        currentAssets: 88000000,
        currentLiabilities: 38000000,
        inventory: 0,
        receivables: 35000000,
        payables: 18000000,
        capitalEmployed: 77000000,
        employeeCost: 125000000,
        depreciation: 5000000,
        relatedPartyTransactions: 2000000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 175000000,
        operatingRevenue: 172000000,
        grossProfit: 52000000,
        operatingProfit: 19000000,
        netProfit: 14000000,
        operatingCost: 153000000,
        totalCost: 161000000,
        totalAssets: 105000000,
        fixedAssets: 16000000,
        currentAssets: 80000000,
        currentLiabilities: 35000000,
        inventory: 0,
        receivables: 32000000,
        payables: 16000000,
        capitalEmployed: 70000000,
        employeeCost: 115000000,
        depreciation: 4000000,
        relatedPartyTransactions: 1800000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 155000000,
        operatingRevenue: 152000000,
        grossProfit: 45000000,
        operatingProfit: 16000000,
        netProfit: 12000000,
        operatingCost: 136000000,
        totalCost: 143000000,
        totalAssets: 95000000,
        fixedAssets: 14000000,
        currentAssets: 72000000,
        currentLiabilities: 31000000,
        inventory: 0,
        receivables: 28000000,
        payables: 14000000,
        capitalEmployed: 64000000,
        employeeCost: 102000000,
        depreciation: 4000000,
        relatedPartyTransactions: 1500000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 12.94, year: "2023-24" },
      { pliType: "OP_OC", value: 12.42, year: "2022-23" },
      { pliType: "OP_OC", value: 11.76, year: "2021-22" },
      { pliType: "OP_OR", value: 11.46, year: "2023-24" },
      { pliType: "OP_OR", value: 11.05, year: "2022-23" },
      { pliType: "OP_OR", value: 10.53, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 85,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP007",
    cin: "U72200GJ2003PTC041582",
    name: "TechBridge IT Services Private Limited",
    nicCode: "6209",
    nicDescription: "Other information technology service activities",
    industry: "Information Technology",
    subIndustry: "IT Services",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 425000000,
        operatingRevenue: 420000000,
        grossProfit: 135000000,
        operatingProfit: 58000000,
        netProfit: 44000000,
        operatingCost: 362000000,
        totalCost: 381000000,
        totalAssets: 255000000,
        fixedAssets: 40000000,
        currentAssets: 195000000,
        currentLiabilities: 85000000,
        inventory: 0,
        receivables: 75000000,
        payables: 38000000,
        capitalEmployed: 170000000,
        employeeCost: 255000000,
        depreciation: 11000000,
        relatedPartyTransactions: 9000000,
        relatedPartyPercent: 2.1
      },
      {
        year: "2022-23",
        revenue: 385000000,
        operatingRevenue: 380000000,
        grossProfit: 120000000,
        operatingProfit: 51000000,
        netProfit: 38000000,
        operatingCost: 329000000,
        totalCost: 347000000,
        totalAssets: 232000000,
        fixedAssets: 36000000,
        currentAssets: 178000000,
        currentLiabilities: 78000000,
        inventory: 0,
        receivables: 68000000,
        payables: 35000000,
        capitalEmployed: 154000000,
        employeeCost: 235000000,
        depreciation: 10000000,
        relatedPartyTransactions: 8000000,
        relatedPartyPercent: 2.1
      },
      {
        year: "2021-22",
        revenue: 345000000,
        operatingRevenue: 340000000,
        grossProfit: 105000000,
        operatingProfit: 43000000,
        netProfit: 32000000,
        operatingCost: 297000000,
        totalCost: 313000000,
        totalAssets: 210000000,
        fixedAssets: 32000000,
        currentAssets: 162000000,
        currentLiabilities: 70000000,
        inventory: 0,
        receivables: 60000000,
        payables: 31000000,
        capitalEmployed: 140000000,
        employeeCost: 212000000,
        depreciation: 9000000,
        relatedPartyTransactions: 7000000,
        relatedPartyPercent: 2.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 16.02, year: "2023-24" },
      { pliType: "OP_OC", value: 15.50, year: "2022-23" },
      { pliType: "OP_OC", value: 14.48, year: "2021-22" },
      { pliType: "OP_OR", value: 13.81, year: "2023-24" },
      { pliType: "OP_OR", value: 13.42, year: "2022-23" },
      { pliType: "OP_OR", value: 12.65, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 89,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 2.1,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP008",
    cin: "U72100HR2009PTC039215",
    name: "CloudTech Solutions Private Limited",
    nicCode: "6202",
    nicDescription: "Computer consultancy activities",
    industry: "Information Technology",
    subIndustry: "IT Consulting",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 280000000,
        operatingRevenue: 275000000,
        grossProfit: 85000000,
        operatingProfit: 35000000,
        netProfit: 26000000,
        operatingCost: 240000000,
        totalCost: 254000000,
        totalAssets: 165000000,
        fixedAssets: 25000000,
        currentAssets: 128000000,
        currentLiabilities: 55000000,
        inventory: 0,
        receivables: 48000000,
        payables: 25000000,
        capitalEmployed: 110000000,
        employeeCost: 168000000,
        depreciation: 7000000,
        relatedPartyTransactions: 3500000,
        relatedPartyPercent: 1.3
      },
      {
        year: "2022-23",
        revenue: 252000000,
        operatingRevenue: 248000000,
        grossProfit: 75000000,
        operatingProfit: 30000000,
        netProfit: 22000000,
        operatingCost: 218000000,
        totalCost: 230000000,
        totalAssets: 150000000,
        fixedAssets: 22000000,
        currentAssets: 118000000,
        currentLiabilities: 50000000,
        inventory: 0,
        receivables: 42000000,
        payables: 22000000,
        capitalEmployed: 100000000,
        employeeCost: 155000000,
        depreciation: 6000000,
        relatedPartyTransactions: 3000000,
        relatedPartyPercent: 1.2
      },
      {
        year: "2021-22",
        revenue: 225000000,
        operatingRevenue: 220000000,
        grossProfit: 65000000,
        operatingProfit: 25000000,
        netProfit: 18000000,
        operatingCost: 195000000,
        totalCost: 207000000,
        totalAssets: 135000000,
        fixedAssets: 20000000,
        currentAssets: 105000000,
        currentLiabilities: 45000000,
        inventory: 0,
        receivables: 38000000,
        payables: 20000000,
        capitalEmployed: 90000000,
        employeeCost: 140000000,
        depreciation: 5000000,
        relatedPartyTransactions: 2500000,
        relatedPartyPercent: 1.1
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 14.58, year: "2023-24" },
      { pliType: "OP_OC", value: 13.76, year: "2022-23" },
      { pliType: "OP_OC", value: 12.82, year: "2021-22" },
      { pliType: "OP_OR", value: 12.73, year: "2023-24" },
      { pliType: "OP_OR", value: 12.10, year: "2022-23" },
      { pliType: "OP_OR", value: 11.36, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 86,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.3,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // ITES/BPO COMPANIES
  // ==========================================================================
  {
    id: "COMP009",
    cin: "U72300TN2008PTC067890",
    name: "GlobalServe BPO Services Private Limited",
    nicCode: "8220",
    nicDescription: "Activities of call centres",
    industry: "ITES/BPO",
    subIndustry: "Business Process Outsourcing",
    functionalProfile: "ITES_BPO",
    financials: [
      {
        year: "2023-24",
        revenue: 1250000000,
        operatingRevenue: 1240000000,
        grossProfit: 375000000,
        operatingProfit: 137500000,
        netProfit: 106250000,
        operatingCost: 1102500000,
        totalCost: 1143750000,
        totalAssets: 725000000,
        fixedAssets: 145000000,
        currentAssets: 545000000,
        currentLiabilities: 262500000,
        inventory: 0,
        receivables: 208333333,
        payables: 104166667,
        capitalEmployed: 462500000,
        employeeCost: 750000000,
        depreciation: 43750000,
        relatedPartyTransactions: 25000000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2022-23",
        revenue: 1100000000,
        operatingRevenue: 1090000000,
        grossProfit: 330000000,
        operatingProfit: 121000000,
        netProfit: 93500000,
        operatingCost: 969000000,
        totalCost: 1006500000,
        totalAssets: 660000000,
        fixedAssets: 132000000,
        currentAssets: 495000000,
        currentLiabilities: 231000000,
        inventory: 0,
        receivables: 183333333,
        payables: 91666667,
        capitalEmployed: 429000000,
        employeeCost: 660000000,
        depreciation: 38500000,
        relatedPartyTransactions: 22000000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2021-22",
        revenue: 980000000,
        operatingRevenue: 970000000,
        grossProfit: 294000000,
        operatingProfit: 107800000,
        netProfit: 83300000,
        operatingCost: 862200000,
        totalCost: 896700000,
        totalAssets: 588000000,
        fixedAssets: 117600000,
        currentAssets: 441000000,
        currentLiabilities: 205800000,
        inventory: 0,
        receivables: 163333333,
        payables: 81666667,
        capitalEmployed: 382200000,
        employeeCost: 588000000,
        depreciation: 34300000,
        relatedPartyTransactions: 19600000,
        relatedPartyPercent: 2.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 12.47, year: "2023-24" },
      { pliType: "OP_OC", value: 12.49, year: "2022-23" },
      { pliType: "OP_OC", value: 12.50, year: "2021-22" },
      { pliType: "OP_OR", value: 11.09, year: "2023-24" },
      { pliType: "OP_OR", value: 11.10, year: "2022-23" },
      { pliType: "OP_OR", value: 11.11, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 94,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 2.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP010",
    cin: "U72400KA2010PTC054321",
    name: "DataProcess India Private Limited",
    nicCode: "6311",
    nicDescription: "Data processing, hosting and related activities",
    industry: "ITES/BPO",
    subIndustry: "Data Processing",
    functionalProfile: "ITES_BPO",
    financials: [
      {
        year: "2023-24",
        revenue: 420000000,
        operatingRevenue: 415000000,
        grossProfit: 130000000,
        operatingProfit: 54600000,
        netProfit: 42000000,
        operatingCost: 360400000,
        totalCost: 378000000,
        totalAssets: 245000000,
        fixedAssets: 49000000,
        currentAssets: 183750000,
        currentLiabilities: 84000000,
        inventory: 0,
        receivables: 70000000,
        payables: 35000000,
        capitalEmployed: 161000000,
        employeeCost: 235200000,
        depreciation: 14700000,
        relatedPartyTransactions: 8400000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2022-23",
        revenue: 380000000,
        operatingRevenue: 375000000,
        grossProfit: 117800000,
        operatingProfit: 47500000,
        netProfit: 36600000,
        operatingCost: 327500000,
        totalCost: 343400000,
        totalAssets: 222000000,
        fixedAssets: 44400000,
        currentAssets: 166500000,
        currentLiabilities: 76000000,
        inventory: 0,
        receivables: 63333333,
        payables: 31666667,
        capitalEmployed: 146000000,
        employeeCost: 213200000,
        depreciation: 13300000,
        relatedPartyTransactions: 7600000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2021-22",
        revenue: 340000000,
        operatingRevenue: 335000000,
        grossProfit: 105400000,
        operatingProfit: 40800000,
        netProfit: 31500000,
        operatingCost: 294200000,
        totalCost: 308500000,
        totalAssets: 198000000,
        fixedAssets: 39600000,
        currentAssets: 148500000,
        currentLiabilities: 68000000,
        inventory: 0,
        receivables: 56666667,
        payables: 28333333,
        capitalEmployed: 130000000,
        employeeCost: 190400000,
        depreciation: 11900000,
        relatedPartyTransactions: 6800000,
        relatedPartyPercent: 2.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 15.15, year: "2023-24" },
      { pliType: "OP_OC", value: 14.50, year: "2022-23" },
      { pliType: "OP_OC", value: 13.87, year: "2021-22" },
      { pliType: "OP_OR", value: 13.16, year: "2023-24" },
      { pliType: "OP_OR", value: 12.67, year: "2022-23" },
      { pliType: "OP_OR", value: 12.18, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 90,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 2.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP011",
    cin: "U72500MH2011PTC065432",
    name: "TranscribeNow Services Private Limited",
    nicCode: "8211",
    nicDescription: "Combined office administrative service activities",
    industry: "ITES/BPO",
    subIndustry: "Transcription Services",
    functionalProfile: "ITES_BPO",
    financials: [
      {
        year: "2023-24",
        revenue: 185000000,
        operatingRevenue: 182000000,
        grossProfit: 55500000,
        operatingProfit: 20350000,
        netProfit: 15700000,
        operatingCost: 161650000,
        totalCost: 169300000,
        totalAssets: 108000000,
        fixedAssets: 18000000,
        currentAssets: 83000000,
        currentLiabilities: 37000000,
        inventory: 0,
        receivables: 30833333,
        payables: 15416667,
        capitalEmployed: 71000000,
        employeeCost: 111000000,
        depreciation: 5400000,
        relatedPartyTransactions: 1850000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 168000000,
        operatingRevenue: 165000000,
        grossProfit: 50400000,
        operatingProfit: 17640000,
        netProfit: 13600000,
        operatingCost: 147360000,
        totalCost: 154400000,
        totalAssets: 98000000,
        fixedAssets: 16000000,
        currentAssets: 75000000,
        currentLiabilities: 33600000,
        inventory: 0,
        receivables: 28000000,
        payables: 14000000,
        capitalEmployed: 64400000,
        employeeCost: 100800000,
        depreciation: 4900000,
        relatedPartyTransactions: 1680000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 152000000,
        operatingRevenue: 149000000,
        grossProfit: 45600000,
        operatingProfit: 15200000,
        netProfit: 11700000,
        operatingCost: 133800000,
        totalCost: 140300000,
        totalAssets: 89000000,
        fixedAssets: 14500000,
        currentAssets: 68000000,
        currentLiabilities: 30400000,
        inventory: 0,
        receivables: 25333333,
        payables: 12666667,
        capitalEmployed: 58600000,
        employeeCost: 91200000,
        depreciation: 4400000,
        relatedPartyTransactions: 1520000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 12.59, year: "2023-24" },
      { pliType: "OP_OC", value: 11.97, year: "2022-23" },
      { pliType: "OP_OC", value: 11.36, year: "2021-22" },
      { pliType: "OP_OR", value: 11.18, year: "2023-24" },
      { pliType: "OP_OR", value: 10.69, year: "2022-23" },
      { pliType: "OP_OR", value: 10.20, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 88,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP012",
    cin: "U72600DL2007PTC076543",
    name: "KnowledgeFirst Analytics Private Limited",
    nicCode: "6202",
    nicDescription: "Computer consultancy activities",
    industry: "ITES/BPO",
    subIndustry: "KPO Analytics",
    functionalProfile: "KPO",
    financials: [
      {
        year: "2023-24",
        revenue: 560000000,
        operatingRevenue: 555000000,
        grossProfit: 196000000,
        operatingProfit: 84000000,
        netProfit: 64800000,
        operatingCost: 471000000,
        totalCost: 495200000,
        totalAssets: 330000000,
        fixedAssets: 55000000,
        currentAssets: 255000000,
        currentLiabilities: 112000000,
        inventory: 0,
        receivables: 93333333,
        payables: 46666667,
        capitalEmployed: 218000000,
        employeeCost: 336000000,
        depreciation: 16500000,
        relatedPartyTransactions: 5600000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 510000000,
        operatingRevenue: 505000000,
        grossProfit: 178500000,
        operatingProfit: 73950000,
        netProfit: 57000000,
        operatingCost: 431050000,
        totalCost: 453000000,
        totalAssets: 300000000,
        fixedAssets: 50000000,
        currentAssets: 232000000,
        currentLiabilities: 102000000,
        inventory: 0,
        receivables: 85000000,
        payables: 42500000,
        capitalEmployed: 198000000,
        employeeCost: 306000000,
        depreciation: 15000000,
        relatedPartyTransactions: 5100000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 465000000,
        operatingRevenue: 460000000,
        grossProfit: 162750000,
        operatingProfit: 65100000,
        netProfit: 50200000,
        operatingCost: 394900000,
        totalCost: 414800000,
        totalAssets: 274000000,
        fixedAssets: 45000000,
        currentAssets: 211000000,
        currentLiabilities: 93000000,
        inventory: 0,
        receivables: 77500000,
        payables: 38750000,
        capitalEmployed: 181000000,
        employeeCost: 279000000,
        depreciation: 13700000,
        relatedPartyTransactions: 4650000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 17.83, year: "2023-24" },
      { pliType: "OP_OC", value: 17.15, year: "2022-23" },
      { pliType: "OP_OC", value: 16.49, year: "2021-22" },
      { pliType: "OP_OR", value: 15.14, year: "2023-24" },
      { pliType: "OP_OR", value: 14.64, year: "2022-23" },
      { pliType: "OP_OR", value: 14.15, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 93,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // CONTRACT MANUFACTURING COMPANIES
  // ==========================================================================
  {
    id: "COMP013",
    cin: "U29100MH2006PTC087654",
    name: "PrecisionMfg India Private Limited",
    nicCode: "2930",
    nicDescription: "Manufacture of parts and accessories for motor vehicles",
    industry: "Manufacturing",
    subIndustry: "Auto Components",
    functionalProfile: "MANUFACTURER_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 850000000,
        operatingRevenue: 840000000,
        grossProfit: 127500000,
        operatingProfit: 42500000,
        netProfit: 29750000,
        operatingCost: 797500000,
        totalCost: 820250000,
        totalAssets: 510000000,
        fixedAssets: 255000000,
        currentAssets: 238000000,
        currentLiabilities: 170000000,
        inventory: 85000000,
        receivables: 106250000,
        payables: 70833333,
        capitalEmployed: 340000000,
        employeeCost: 127500000,
        depreciation: 38250000,
        relatedPartyTransactions: 17000000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2022-23",
        revenue: 780000000,
        operatingRevenue: 770000000,
        grossProfit: 117000000,
        operatingProfit: 35100000,
        netProfit: 24570000,
        operatingCost: 734900000,
        totalCost: 755430000,
        totalAssets: 468000000,
        fixedAssets: 234000000,
        currentAssets: 218000000,
        currentLiabilities: 156000000,
        inventory: 78000000,
        receivables: 97500000,
        payables: 65000000,
        capitalEmployed: 312000000,
        employeeCost: 117000000,
        depreciation: 35100000,
        relatedPartyTransactions: 15600000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2021-22",
        revenue: 720000000,
        operatingRevenue: 710000000,
        grossProfit: 108000000,
        operatingProfit: 28800000,
        netProfit: 20160000,
        operatingCost: 681200000,
        totalCost: 699840000,
        totalAssets: 432000000,
        fixedAssets: 216000000,
        currentAssets: 201000000,
        currentLiabilities: 144000000,
        inventory: 72000000,
        receivables: 90000000,
        payables: 60000000,
        capitalEmployed: 288000000,
        employeeCost: 108000000,
        depreciation: 32400000,
        relatedPartyTransactions: 14400000,
        relatedPartyPercent: 2.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 5.33, year: "2023-24" },
      { pliType: "OP_OC", value: 4.78, year: "2022-23" },
      { pliType: "OP_OC", value: 4.23, year: "2021-22" },
      { pliType: "OP_OR", value: 5.06, year: "2023-24" },
      { pliType: "OP_OR", value: 4.56, year: "2022-23" },
      { pliType: "OP_OR", value: 4.06, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 91,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 2.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP014",
    cin: "U29200GJ2009PTC098765",
    name: "AutoParts Excellence Private Limited",
    nicCode: "2930",
    nicDescription: "Manufacture of parts and accessories for motor vehicles",
    industry: "Manufacturing",
    subIndustry: "Auto Components",
    functionalProfile: "MANUFACTURER_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 1150000000,
        operatingRevenue: 1140000000,
        grossProfit: 184000000,
        operatingProfit: 63250000,
        netProfit: 44275000,
        operatingCost: 1076750000,
        totalCost: 1105725000,
        totalAssets: 690000000,
        fixedAssets: 345000000,
        currentAssets: 322000000,
        currentLiabilities: 230000000,
        inventory: 115000000,
        receivables: 143750000,
        payables: 95833333,
        capitalEmployed: 460000000,
        employeeCost: 172500000,
        depreciation: 51750000,
        relatedPartyTransactions: 11500000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 1050000000,
        operatingRevenue: 1040000000,
        grossProfit: 168000000,
        operatingProfit: 55650000,
        netProfit: 38955000,
        operatingCost: 984350000,
        totalCost: 1011045000,
        totalAssets: 630000000,
        fixedAssets: 315000000,
        currentAssets: 294000000,
        currentLiabilities: 210000000,
        inventory: 105000000,
        receivables: 131250000,
        payables: 87500000,
        capitalEmployed: 420000000,
        employeeCost: 157500000,
        depreciation: 47250000,
        relatedPartyTransactions: 10500000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 960000000,
        operatingRevenue: 950000000,
        grossProfit: 153600000,
        operatingProfit: 48000000,
        netProfit: 33600000,
        operatingCost: 902000000,
        totalCost: 926400000,
        totalAssets: 576000000,
        fixedAssets: 288000000,
        currentAssets: 268000000,
        currentLiabilities: 192000000,
        inventory: 96000000,
        receivables: 120000000,
        payables: 80000000,
        capitalEmployed: 384000000,
        employeeCost: 144000000,
        depreciation: 43200000,
        relatedPartyTransactions: 9600000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 5.87, year: "2023-24" },
      { pliType: "OP_OC", value: 5.66, year: "2022-23" },
      { pliType: "OP_OC", value: 5.32, year: "2021-22" },
      { pliType: "OP_OR", value: 5.55, year: "2023-24" },
      { pliType: "OP_OR", value: 5.35, year: "2022-23" },
      { pliType: "OP_OR", value: 5.05, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 94,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP015",
    cin: "U29300PN2008PTC109876",
    name: "ComponentTech Manufacturing Private Limited",
    nicCode: "2811",
    nicDescription: "Manufacture of engines and turbines",
    industry: "Manufacturing",
    subIndustry: "Industrial Machinery",
    functionalProfile: "MANUFACTURER_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 620000000,
        operatingRevenue: 612000000,
        grossProfit: 99200000,
        operatingProfit: 34100000,
        netProfit: 23870000,
        operatingCost: 577900000,
        totalCost: 596130000,
        totalAssets: 372000000,
        fixedAssets: 186000000,
        currentAssets: 173000000,
        currentLiabilities: 124000000,
        inventory: 62000000,
        receivables: 77500000,
        payables: 51666667,
        capitalEmployed: 248000000,
        employeeCost: 93000000,
        depreciation: 27900000,
        relatedPartyTransactions: 18600000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2022-23",
        revenue: 565000000,
        operatingRevenue: 558000000,
        grossProfit: 90400000,
        operatingProfit: 29380000,
        netProfit: 20566000,
        operatingCost: 528620000,
        totalCost: 544434000,
        totalAssets: 339000000,
        fixedAssets: 169500000,
        currentAssets: 158000000,
        currentLiabilities: 113000000,
        inventory: 56500000,
        receivables: 70625000,
        payables: 47083333,
        capitalEmployed: 226000000,
        employeeCost: 84750000,
        depreciation: 25425000,
        relatedPartyTransactions: 16950000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2021-22",
        revenue: 518000000,
        operatingRevenue: 512000000,
        grossProfit: 82880000,
        operatingProfit: 25900000,
        netProfit: 18130000,
        operatingCost: 486100000,
        totalCost: 499870000,
        totalAssets: 311000000,
        fixedAssets: 155500000,
        currentAssets: 145000000,
        currentLiabilities: 103600000,
        inventory: 51800000,
        receivables: 64750000,
        payables: 43166667,
        capitalEmployed: 207400000,
        employeeCost: 77700000,
        depreciation: 23310000,
        relatedPartyTransactions: 15540000,
        relatedPartyPercent: 3.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 5.90, year: "2023-24" },
      { pliType: "OP_OC", value: 5.56, year: "2022-23" },
      { pliType: "OP_OC", value: 5.33, year: "2021-22" },
      { pliType: "OP_OR", value: 5.57, year: "2023-24" },
      { pliType: "OP_OR", value: 5.27, year: "2022-23" },
      { pliType: "OP_OR", value: 5.06, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 88,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 3.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP016",
    cin: "U29400TN2010PTC110987",
    name: "ElectroAssembly India Private Limited",
    nicCode: "2710",
    nicDescription: "Manufacture of electric motors, generators, transformers",
    industry: "Manufacturing",
    subIndustry: "Electrical Equipment",
    functionalProfile: "MANUFACTURER_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 480000000,
        operatingRevenue: 475000000,
        grossProfit: 76800000,
        operatingProfit: 26400000,
        netProfit: 18480000,
        operatingCost: 448600000,
        totalCost: 461520000,
        totalAssets: 288000000,
        fixedAssets: 144000000,
        currentAssets: 134000000,
        currentLiabilities: 96000000,
        inventory: 48000000,
        receivables: 60000000,
        payables: 40000000,
        capitalEmployed: 192000000,
        employeeCost: 72000000,
        depreciation: 21600000,
        relatedPartyTransactions: 4800000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 438000000,
        operatingRevenue: 433000000,
        grossProfit: 70080000,
        operatingProfit: 23274000,
        netProfit: 16292000,
        operatingCost: 409726000,
        totalCost: 421708000,
        totalAssets: 263000000,
        fixedAssets: 131500000,
        currentAssets: 122000000,
        currentLiabilities: 87600000,
        inventory: 43800000,
        receivables: 54750000,
        payables: 36500000,
        capitalEmployed: 175400000,
        employeeCost: 65700000,
        depreciation: 19710000,
        relatedPartyTransactions: 4380000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 402000000,
        operatingRevenue: 397000000,
        grossProfit: 64320000,
        operatingProfit: 20100000,
        netProfit: 14070000,
        operatingCost: 376900000,
        totalCost: 387930000,
        totalAssets: 241000000,
        fixedAssets: 120500000,
        currentAssets: 112000000,
        currentLiabilities: 80400000,
        inventory: 40200000,
        receivables: 50250000,
        payables: 33500000,
        capitalEmployed: 160600000,
        employeeCost: 60300000,
        depreciation: 18090000,
        relatedPartyTransactions: 4020000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 5.89, year: "2023-24" },
      { pliType: "OP_OC", value: 5.68, year: "2022-23" },
      { pliType: "OP_OC", value: 5.33, year: "2021-22" },
      { pliType: "OP_OR", value: 5.56, year: "2023-24" },
      { pliType: "OP_OR", value: 5.37, year: "2022-23" },
      { pliType: "OP_OR", value: 5.06, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 89,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // PHARMACEUTICAL COMPANIES
  // ==========================================================================
  {
    id: "COMP017",
    cin: "U21001MH2005PTC121098",
    name: "PharmaSynth Labs Private Limited",
    nicCode: "2100",
    nicDescription: "Manufacture of pharmaceuticals, medicinal chemicals",
    industry: "Pharmaceuticals",
    subIndustry: "API Manufacturing",
    functionalProfile: "MANUFACTURER_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 920000000,
        operatingRevenue: 910000000,
        grossProfit: 276000000,
        operatingProfit: 73600000,
        netProfit: 51520000,
        operatingCost: 836400000,
        totalCost: 868480000,
        totalAssets: 552000000,
        fixedAssets: 276000000,
        currentAssets: 257000000,
        currentLiabilities: 184000000,
        inventory: 92000000,
        receivables: 115000000,
        payables: 76666667,
        capitalEmployed: 368000000,
        employeeCost: 138000000,
        depreciation: 41400000,
        rndExpense: 46000000,
        relatedPartyTransactions: 27600000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2022-23",
        revenue: 840000000,
        operatingRevenue: 830000000,
        grossProfit: 252000000,
        operatingProfit: 63000000,
        netProfit: 44100000,
        operatingCost: 767000000,
        totalCost: 795900000,
        totalAssets: 504000000,
        fixedAssets: 252000000,
        currentAssets: 235000000,
        currentLiabilities: 168000000,
        inventory: 84000000,
        receivables: 105000000,
        payables: 70000000,
        capitalEmployed: 336000000,
        employeeCost: 126000000,
        depreciation: 37800000,
        rndExpense: 42000000,
        relatedPartyTransactions: 25200000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2021-22",
        revenue: 770000000,
        operatingRevenue: 760000000,
        grossProfit: 231000000,
        operatingProfit: 53900000,
        netProfit: 37730000,
        operatingCost: 706100000,
        totalCost: 732270000,
        totalAssets: 462000000,
        fixedAssets: 231000000,
        currentAssets: 215000000,
        currentLiabilities: 154000000,
        inventory: 77000000,
        receivables: 96250000,
        payables: 64166667,
        capitalEmployed: 308000000,
        employeeCost: 115500000,
        depreciation: 34650000,
        rndExpense: 38500000,
        relatedPartyTransactions: 23100000,
        relatedPartyPercent: 3.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 8.80, year: "2023-24" },
      { pliType: "OP_OC", value: 8.22, year: "2022-23" },
      { pliType: "OP_OC", value: 7.63, year: "2021-22" },
      { pliType: "OP_OR", value: 8.09, year: "2023-24" },
      { pliType: "OP_OR", value: 7.59, year: "2022-23" },
      { pliType: "OP_OR", value: 7.09, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 92,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 3.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP018",
    cin: "U21002GJ2007PTC132109",
    name: "MedFormulation India Private Limited",
    nicCode: "2100",
    nicDescription: "Manufacture of pharmaceuticals, medicinal chemicals",
    industry: "Pharmaceuticals",
    subIndustry: "Formulations",
    functionalProfile: "MANUFACTURER_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 680000000,
        operatingRevenue: 672000000,
        grossProfit: 204000000,
        operatingProfit: 51000000,
        netProfit: 35700000,
        operatingCost: 621000000,
        totalCost: 644300000,
        totalAssets: 408000000,
        fixedAssets: 204000000,
        currentAssets: 190000000,
        currentLiabilities: 136000000,
        inventory: 68000000,
        receivables: 85000000,
        payables: 56666667,
        capitalEmployed: 272000000,
        employeeCost: 102000000,
        depreciation: 30600000,
        rndExpense: 27200000,
        relatedPartyTransactions: 6800000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 620000000,
        operatingRevenue: 612000000,
        grossProfit: 186000000,
        operatingProfit: 43400000,
        netProfit: 30380000,
        operatingCost: 568600000,
        totalCost: 589620000,
        totalAssets: 372000000,
        fixedAssets: 186000000,
        currentAssets: 173000000,
        currentLiabilities: 124000000,
        inventory: 62000000,
        receivables: 77500000,
        payables: 51666667,
        capitalEmployed: 248000000,
        employeeCost: 93000000,
        depreciation: 27900000,
        rndExpense: 24800000,
        relatedPartyTransactions: 6200000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 568000000,
        operatingRevenue: 560000000,
        grossProfit: 170400000,
        operatingProfit: 36920000,
        netProfit: 25844000,
        operatingCost: 523080000,
        totalCost: 542156000,
        totalAssets: 341000000,
        fixedAssets: 170500000,
        currentAssets: 159000000,
        currentLiabilities: 113600000,
        inventory: 56800000,
        receivables: 71000000,
        payables: 47333333,
        capitalEmployed: 227400000,
        employeeCost: 85200000,
        depreciation: 25560000,
        rndExpense: 22720000,
        relatedPartyTransactions: 5680000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 8.21, year: "2023-24" },
      { pliType: "OP_OC", value: 7.63, year: "2022-23" },
      { pliType: "OP_OC", value: 7.06, year: "2021-22" },
      { pliType: "OP_OR", value: 7.59, year: "2023-24" },
      { pliType: "OP_OR", value: 7.09, year: "2022-23" },
      { pliType: "OP_OR", value: 6.59, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 90,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP019",
    cin: "U21003AP2008PTC143210",
    name: "BioGenix Pharma Private Limited",
    nicCode: "2100",
    nicDescription: "Manufacture of pharmaceuticals, medicinal chemicals",
    industry: "Pharmaceuticals",
    subIndustry: "Contract Research",
    functionalProfile: "R_AND_D_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 380000000,
        operatingRevenue: 375000000,
        grossProfit: 133000000,
        operatingProfit: 49400000,
        netProfit: 34580000,
        operatingCost: 325600000,
        totalCost: 345420000,
        totalAssets: 228000000,
        fixedAssets: 91200000,
        currentAssets: 128000000,
        currentLiabilities: 76000000,
        inventory: 19000000,
        receivables: 63333333,
        payables: 31666667,
        capitalEmployed: 152000000,
        employeeCost: 152000000,
        depreciation: 13680000,
        rndExpense: 76000000,
        relatedPartyTransactions: 11400000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2022-23",
        revenue: 345000000,
        operatingRevenue: 340000000,
        grossProfit: 120750000,
        operatingProfit: 42435000,
        netProfit: 29705000,
        operatingCost: 297565000,
        totalCost: 315295000,
        totalAssets: 207000000,
        fixedAssets: 82800000,
        currentAssets: 116000000,
        currentLiabilities: 69000000,
        inventory: 17250000,
        receivables: 57500000,
        payables: 28750000,
        capitalEmployed: 138000000,
        employeeCost: 138000000,
        depreciation: 12420000,
        rndExpense: 69000000,
        relatedPartyTransactions: 10350000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2021-22",
        revenue: 315000000,
        operatingRevenue: 310000000,
        grossProfit: 110250000,
        operatingProfit: 36225000,
        netProfit: 25358000,
        operatingCost: 273775000,
        totalCost: 289642000,
        totalAssets: 189000000,
        fixedAssets: 75600000,
        currentAssets: 106000000,
        currentLiabilities: 63000000,
        inventory: 15750000,
        receivables: 52500000,
        payables: 26250000,
        capitalEmployed: 126000000,
        employeeCost: 126000000,
        depreciation: 11340000,
        rndExpense: 63000000,
        relatedPartyTransactions: 9450000,
        relatedPartyPercent: 3.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 15.17, year: "2023-24" },
      { pliType: "OP_OC", value: 14.26, year: "2022-23" },
      { pliType: "OP_OC", value: 13.23, year: "2021-22" },
      { pliType: "OP_OR", value: 13.17, year: "2023-24" },
      { pliType: "OP_OR", value: 12.48, year: "2022-23" },
      { pliType: "OP_OR", value: 11.69, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 93,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 3.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // DISTRIBUTION COMPANIES
  // ==========================================================================
  {
    id: "COMP020",
    cin: "U51100DL2006PTC154321",
    name: "TechDistrib India Private Limited",
    nicCode: "4651",
    nicDescription: "Wholesale of computers, computer peripheral equipment",
    industry: "Distribution",
    subIndustry: "IT Products Distribution",
    functionalProfile: "DISTRIBUTOR_LIMITED_RISK",
    financials: [
      {
        year: "2023-24",
        revenue: 2200000000,
        operatingRevenue: 2180000000,
        grossProfit: 132000000,
        operatingProfit: 33000000,
        netProfit: 23100000,
        operatingCost: 2147000000,
        totalCost: 2176900000,
        totalAssets: 660000000,
        fixedAssets: 44000000,
        currentAssets: 594000000,
        currentLiabilities: 440000000,
        inventory: 220000000,
        receivables: 275000000,
        payables: 183333333,
        capitalEmployed: 220000000,
        employeeCost: 44000000,
        depreciation: 6600000,
        relatedPartyTransactions: 22000000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 1980000000,
        operatingRevenue: 1960000000,
        grossProfit: 118800000,
        operatingProfit: 27720000,
        netProfit: 19404000,
        operatingCost: 1932280000,
        totalCost: 1960596000,
        totalAssets: 594000000,
        fixedAssets: 39600000,
        currentAssets: 534000000,
        currentLiabilities: 396000000,
        inventory: 198000000,
        receivables: 247500000,
        payables: 165000000,
        capitalEmployed: 198000000,
        employeeCost: 39600000,
        depreciation: 5940000,
        relatedPartyTransactions: 19800000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 1780000000,
        operatingRevenue: 1760000000,
        grossProfit: 106800000,
        operatingProfit: 23140000,
        netProfit: 16198000,
        operatingCost: 1736860000,
        totalCost: 1763802000,
        totalAssets: 534000000,
        fixedAssets: 35600000,
        currentAssets: 480000000,
        currentLiabilities: 356000000,
        inventory: 178000000,
        receivables: 222500000,
        payables: 148333333,
        capitalEmployed: 178000000,
        employeeCost: 35600000,
        depreciation: 5340000,
        relatedPartyTransactions: 17800000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 1.54, year: "2023-24" },
      { pliType: "OP_OC", value: 1.43, year: "2022-23" },
      { pliType: "OP_OC", value: 1.33, year: "2021-22" },
      { pliType: "GP_SALES", value: 6.06, year: "2023-24" },
      { pliType: "GP_SALES", value: 6.06, year: "2022-23" },
      { pliType: "GP_SALES", value: 6.07, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 91,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP021",
    cin: "U51200MH2009PTC165432",
    name: "MedSupply Distribution Private Limited",
    nicCode: "4645",
    nicDescription: "Wholesale of pharmaceutical and medical goods",
    industry: "Distribution",
    subIndustry: "Pharma Distribution",
    functionalProfile: "DISTRIBUTOR_LIMITED_RISK",
    financials: [
      {
        year: "2023-24",
        revenue: 1450000000,
        operatingRevenue: 1435000000,
        grossProfit: 101500000,
        operatingProfit: 26100000,
        netProfit: 18270000,
        operatingCost: 1408900000,
        totalCost: 1431730000,
        totalAssets: 435000000,
        fixedAssets: 29000000,
        currentAssets: 391000000,
        currentLiabilities: 290000000,
        inventory: 145000000,
        receivables: 181250000,
        payables: 120833333,
        capitalEmployed: 145000000,
        employeeCost: 29000000,
        depreciation: 4350000,
        relatedPartyTransactions: 14500000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 1320000000,
        operatingRevenue: 1305000000,
        grossProfit: 92400000,
        operatingProfit: 22440000,
        netProfit: 15708000,
        operatingCost: 1282560000,
        totalCost: 1304292000,
        totalAssets: 396000000,
        fixedAssets: 26400000,
        currentAssets: 356000000,
        currentLiabilities: 264000000,
        inventory: 132000000,
        receivables: 165000000,
        payables: 110000000,
        capitalEmployed: 132000000,
        employeeCost: 26400000,
        depreciation: 3960000,
        relatedPartyTransactions: 13200000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 1200000000,
        operatingRevenue: 1185000000,
        grossProfit: 84000000,
        operatingProfit: 19200000,
        netProfit: 13440000,
        operatingCost: 1165800000,
        totalCost: 1186560000,
        totalAssets: 360000000,
        fixedAssets: 24000000,
        currentAssets: 324000000,
        currentLiabilities: 240000000,
        inventory: 120000000,
        receivables: 150000000,
        payables: 100000000,
        capitalEmployed: 120000000,
        employeeCost: 24000000,
        depreciation: 3600000,
        relatedPartyTransactions: 12000000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 1.85, year: "2023-24" },
      { pliType: "OP_OC", value: 1.75, year: "2022-23" },
      { pliType: "OP_OC", value: 1.65, year: "2021-22" },
      { pliType: "GP_SALES", value: 7.07, year: "2023-24" },
      { pliType: "GP_SALES", value: 7.08, year: "2022-23" },
      { pliType: "GP_SALES", value: 7.08, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 89,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP022",
    cin: "U51300KA2010PTC176543",
    name: "AutoParts Wholesale Private Limited",
    nicCode: "4530",
    nicDescription: "Sale of motor vehicle parts and accessories",
    industry: "Distribution",
    subIndustry: "Auto Parts Distribution",
    functionalProfile: "DISTRIBUTOR_FULL_FLEDGED",
    financials: [
      {
        year: "2023-24",
        revenue: 780000000,
        operatingRevenue: 770000000,
        grossProfit: 93600000,
        operatingProfit: 27300000,
        netProfit: 19110000,
        operatingCost: 742700000,
        totalCost: 760890000,
        totalAssets: 312000000,
        fixedAssets: 31200000,
        currentAssets: 265000000,
        currentLiabilities: 156000000,
        inventory: 117000000,
        receivables: 97500000,
        payables: 65000000,
        capitalEmployed: 156000000,
        employeeCost: 31200000,
        depreciation: 4680000,
        relatedPartyTransactions: 23400000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2022-23",
        revenue: 710000000,
        operatingRevenue: 700000000,
        grossProfit: 85200000,
        operatingProfit: 23430000,
        netProfit: 16401000,
        operatingCost: 676570000,
        totalCost: 693599000,
        totalAssets: 284000000,
        fixedAssets: 28400000,
        currentAssets: 241000000,
        currentLiabilities: 142000000,
        inventory: 106500000,
        receivables: 88750000,
        payables: 59166667,
        capitalEmployed: 142000000,
        employeeCost: 28400000,
        depreciation: 4260000,
        relatedPartyTransactions: 21300000,
        relatedPartyPercent: 3.0
      },
      {
        year: "2021-22",
        revenue: 650000000,
        operatingRevenue: 640000000,
        grossProfit: 78000000,
        operatingProfit: 20150000,
        netProfit: 14105000,
        operatingCost: 619850000,
        totalCost: 635895000,
        totalAssets: 260000000,
        fixedAssets: 26000000,
        currentAssets: 221000000,
        currentLiabilities: 130000000,
        inventory: 97500000,
        receivables: 81250000,
        payables: 54166667,
        capitalEmployed: 130000000,
        employeeCost: 26000000,
        depreciation: 3900000,
        relatedPartyTransactions: 19500000,
        relatedPartyPercent: 3.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 3.68, year: "2023-24" },
      { pliType: "OP_OC", value: 3.46, year: "2022-23" },
      { pliType: "OP_OC", value: 3.25, year: "2021-22" },
      { pliType: "GP_SALES", value: 12.16, year: "2023-24" },
      { pliType: "GP_SALES", value: 12.17, year: "2022-23" },
      { pliType: "GP_SALES", value: 12.19, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 87,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 3.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // R&D / ENGINEERING SERVICES COMPANIES
  // ==========================================================================
  {
    id: "COMP023",
    cin: "U72100KA2007PTC187654",
    name: "EngiDesign Services Private Limited",
    nicCode: "7112",
    nicDescription: "Engineering activities and related technical consultancy",
    industry: "Engineering Services",
    subIndustry: "Product Design",
    functionalProfile: "R_AND_D_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 340000000,
        operatingRevenue: 335000000,
        grossProfit: 119000000,
        operatingProfit: 47600000,
        netProfit: 33320000,
        operatingCost: 287400000,
        totalCost: 306680000,
        totalAssets: 204000000,
        fixedAssets: 40800000,
        currentAssets: 153000000,
        currentLiabilities: 68000000,
        inventory: 0,
        receivables: 56666667,
        payables: 28333333,
        capitalEmployed: 136000000,
        employeeCost: 204000000,
        depreciation: 10200000,
        rndExpense: 17000000,
        relatedPartyTransactions: 3400000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 308000000,
        operatingRevenue: 303000000,
        grossProfit: 107800000,
        operatingProfit: 41580000,
        netProfit: 29106000,
        operatingCost: 261420000,
        totalCost: 278894000,
        totalAssets: 185000000,
        fixedAssets: 37000000,
        currentAssets: 138000000,
        currentLiabilities: 61600000,
        inventory: 0,
        receivables: 51333333,
        payables: 25666667,
        capitalEmployed: 123400000,
        employeeCost: 184800000,
        depreciation: 9240000,
        rndExpense: 15400000,
        relatedPartyTransactions: 3080000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 280000000,
        operatingRevenue: 275000000,
        grossProfit: 98000000,
        operatingProfit: 36400000,
        netProfit: 25480000,
        operatingCost: 238600000,
        totalCost: 254520000,
        totalAssets: 168000000,
        fixedAssets: 33600000,
        currentAssets: 126000000,
        currentLiabilities: 56000000,
        inventory: 0,
        receivables: 46666667,
        payables: 23333333,
        capitalEmployed: 112000000,
        employeeCost: 168000000,
        depreciation: 8400000,
        rndExpense: 14000000,
        relatedPartyTransactions: 2800000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 16.56, year: "2023-24" },
      { pliType: "OP_OC", value: 15.91, year: "2022-23" },
      { pliType: "OP_OC", value: 15.26, year: "2021-22" },
      { pliType: "OP_OR", value: 14.21, year: "2023-24" },
      { pliType: "OP_OR", value: 13.72, year: "2022-23" },
      { pliType: "OP_OR", value: 13.24, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 94,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP024",
    cin: "U72200PN2009PTC198765",
    name: "AutoCAD Solutions Private Limited",
    nicCode: "7112",
    nicDescription: "Engineering activities and related technical consultancy",
    industry: "Engineering Services",
    subIndustry: "CAD/CAM Services",
    functionalProfile: "R_AND_D_CONTRACT",
    financials: [
      {
        year: "2023-24",
        revenue: 245000000,
        operatingRevenue: 241000000,
        grossProfit: 85750000,
        operatingProfit: 33075000,
        netProfit: 23153000,
        operatingCost: 207925000,
        totalCost: 221847000,
        totalAssets: 147000000,
        fixedAssets: 24500000,
        currentAssets: 115000000,
        currentLiabilities: 49000000,
        inventory: 0,
        receivables: 40833333,
        payables: 20416667,
        capitalEmployed: 98000000,
        employeeCost: 147000000,
        depreciation: 7350000,
        rndExpense: 12250000,
        relatedPartyTransactions: 4900000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2022-23",
        revenue: 222000000,
        operatingRevenue: 218000000,
        grossProfit: 77700000,
        operatingProfit: 28860000,
        netProfit: 20202000,
        operatingCost: 189140000,
        totalCost: 201798000,
        totalAssets: 133000000,
        fixedAssets: 22200000,
        currentAssets: 104000000,
        currentLiabilities: 44400000,
        inventory: 0,
        receivables: 37000000,
        payables: 18500000,
        capitalEmployed: 88600000,
        employeeCost: 133200000,
        depreciation: 6660000,
        rndExpense: 11100000,
        relatedPartyTransactions: 4440000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2021-22",
        revenue: 202000000,
        operatingRevenue: 198000000,
        grossProfit: 70700000,
        operatingProfit: 25250000,
        netProfit: 17675000,
        operatingCost: 172750000,
        totalCost: 184325000,
        totalAssets: 121000000,
        fixedAssets: 20200000,
        currentAssets: 95000000,
        currentLiabilities: 40400000,
        inventory: 0,
        receivables: 33666667,
        payables: 16833333,
        capitalEmployed: 80600000,
        employeeCost: 121200000,
        depreciation: 6060000,
        rndExpense: 10100000,
        relatedPartyTransactions: 4040000,
        relatedPartyPercent: 2.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 15.91, year: "2023-24" },
      { pliType: "OP_OC", value: 15.26, year: "2022-23" },
      { pliType: "OP_OC", value: 14.62, year: "2021-22" },
      { pliType: "OP_OR", value: 13.72, year: "2023-24" },
      { pliType: "OP_OR", value: 13.24, year: "2022-23" },
      { pliType: "OP_OR", value: 12.75, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 91,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 2.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // ADDITIONAL IT SERVICES FOR DIVERSITY
  // ==========================================================================
  {
    id: "COMP025",
    cin: "U72300HR2012PTC209876",
    name: "CloudMigrate Solutions Private Limited",
    nicCode: "6209",
    nicDescription: "Other information technology and computer service activities",
    industry: "Information Technology",
    subIndustry: "Cloud Services",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 520000000,
        operatingRevenue: 515000000,
        grossProfit: 161200000,
        operatingProfit: 72800000,
        netProfit: 50960000,
        operatingCost: 442200000,
        totalCost: 469040000,
        totalAssets: 312000000,
        fixedAssets: 52000000,
        currentAssets: 243000000,
        currentLiabilities: 104000000,
        inventory: 0,
        receivables: 86666667,
        payables: 43333333,
        capitalEmployed: 208000000,
        employeeCost: 312000000,
        depreciation: 15600000,
        relatedPartyTransactions: 5200000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 468000000,
        operatingRevenue: 463000000,
        grossProfit: 145080000,
        operatingProfit: 63180000,
        netProfit: 44226000,
        operatingCost: 399820000,
        totalCost: 423774000,
        totalAssets: 281000000,
        fixedAssets: 46800000,
        currentAssets: 218000000,
        currentLiabilities: 93600000,
        inventory: 0,
        receivables: 78000000,
        payables: 39000000,
        capitalEmployed: 187400000,
        employeeCost: 280800000,
        depreciation: 14040000,
        relatedPartyTransactions: 4680000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 420000000,
        operatingRevenue: 415000000,
        grossProfit: 130200000,
        operatingProfit: 54600000,
        netProfit: 38220000,
        operatingCost: 360400000,
        totalCost: 381780000,
        totalAssets: 252000000,
        fixedAssets: 42000000,
        currentAssets: 196000000,
        currentLiabilities: 84000000,
        inventory: 0,
        receivables: 70000000,
        payables: 35000000,
        capitalEmployed: 168000000,
        employeeCost: 252000000,
        depreciation: 12600000,
        relatedPartyTransactions: 4200000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 16.47, year: "2023-24" },
      { pliType: "OP_OC", value: 15.80, year: "2022-23" },
      { pliType: "OP_OC", value: 15.15, year: "2021-22" },
      { pliType: "OP_OR", value: 14.14, year: "2023-24" },
      { pliType: "OP_OR", value: 13.65, year: "2022-23" },
      { pliType: "OP_OR", value: 13.16, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 93,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP026",
    cin: "U72400TG2011PTC210987",
    name: "CyberSecure Tech Private Limited",
    nicCode: "6209",
    nicDescription: "Other information technology and computer service activities",
    industry: "Information Technology",
    subIndustry: "Cybersecurity Services",
    functionalProfile: "IT_SERVICES",
    financials: [
      {
        year: "2023-24",
        revenue: 385000000,
        operatingRevenue: 380000000,
        grossProfit: 134750000,
        operatingProfit: 57750000,
        netProfit: 40425000,
        operatingCost: 322250000,
        totalCost: 344575000,
        totalAssets: 231000000,
        fixedAssets: 38500000,
        currentAssets: 180000000,
        currentLiabilities: 77000000,
        inventory: 0,
        receivables: 64166667,
        payables: 32083333,
        capitalEmployed: 154000000,
        employeeCost: 231000000,
        depreciation: 11550000,
        relatedPartyTransactions: 7700000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2022-23",
        revenue: 348000000,
        operatingRevenue: 343000000,
        grossProfit: 121800000,
        operatingProfit: 50460000,
        netProfit: 35322000,
        operatingCost: 292540000,
        totalCost: 312678000,
        totalAssets: 209000000,
        fixedAssets: 34800000,
        currentAssets: 163000000,
        currentLiabilities: 69600000,
        inventory: 0,
        receivables: 58000000,
        payables: 29000000,
        capitalEmployed: 139400000,
        employeeCost: 208800000,
        depreciation: 10440000,
        relatedPartyTransactions: 6960000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2021-22",
        revenue: 315000000,
        operatingRevenue: 310000000,
        grossProfit: 110250000,
        operatingProfit: 44100000,
        netProfit: 30870000,
        operatingCost: 265900000,
        totalCost: 284130000,
        totalAssets: 189000000,
        fixedAssets: 31500000,
        currentAssets: 147000000,
        currentLiabilities: 63000000,
        inventory: 0,
        receivables: 52500000,
        payables: 26250000,
        capitalEmployed: 126000000,
        employeeCost: 189000000,
        depreciation: 9450000,
        relatedPartyTransactions: 6300000,
        relatedPartyPercent: 2.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 17.92, year: "2023-24" },
      { pliType: "OP_OC", value: 17.25, year: "2022-23" },
      { pliType: "OP_OC", value: 16.59, year: "2021-22" },
      { pliType: "OP_OR", value: 15.20, year: "2023-24" },
      { pliType: "OP_OR", value: 14.71, year: "2022-23" },
      { pliType: "OP_OR", value: 14.23, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 92,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 2.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // TOLL MANUFACTURING (LOW MARGIN)
  // ==========================================================================
  {
    id: "COMP027",
    cin: "U24100MH2008PTC221098",
    name: "ChemProcess Industries Private Limited",
    nicCode: "2011",
    nicDescription: "Manufacture of basic chemicals",
    industry: "Manufacturing",
    subIndustry: "Chemical Processing",
    functionalProfile: "MANUFACTURER_TOLL",
    financials: [
      {
        year: "2023-24",
        revenue: 1580000000,
        operatingRevenue: 1565000000,
        grossProfit: 110600000,
        operatingProfit: 39500000,
        netProfit: 27650000,
        operatingCost: 1525500000,
        totalCost: 1552350000,
        totalAssets: 948000000,
        fixedAssets: 474000000,
        currentAssets: 443000000,
        currentLiabilities: 316000000,
        inventory: 158000000,
        receivables: 197500000,
        payables: 131666667,
        capitalEmployed: 632000000,
        employeeCost: 110600000,
        depreciation: 71100000,
        relatedPartyTransactions: 15800000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 1440000000,
        operatingRevenue: 1425000000,
        grossProfit: 100800000,
        operatingProfit: 34560000,
        netProfit: 24192000,
        operatingCost: 1390440000,
        totalCost: 1415808000,
        totalAssets: 864000000,
        fixedAssets: 432000000,
        currentAssets: 404000000,
        currentLiabilities: 288000000,
        inventory: 144000000,
        receivables: 180000000,
        payables: 120000000,
        capitalEmployed: 576000000,
        employeeCost: 100800000,
        depreciation: 64800000,
        relatedPartyTransactions: 14400000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 1320000000,
        operatingRevenue: 1305000000,
        grossProfit: 92400000,
        operatingProfit: 29700000,
        netProfit: 20790000,
        operatingCost: 1275300000,
        totalCost: 1299210000,
        totalAssets: 792000000,
        fixedAssets: 396000000,
        currentAssets: 370000000,
        currentLiabilities: 264000000,
        inventory: 132000000,
        receivables: 165000000,
        payables: 110000000,
        capitalEmployed: 528000000,
        employeeCost: 92400000,
        depreciation: 59400000,
        relatedPartyTransactions: 13200000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 2.59, year: "2023-24" },
      { pliType: "OP_OC", value: 2.49, year: "2022-23" },
      { pliType: "OP_OC", value: 2.33, year: "2021-22" },
      { pliType: "OP_OR", value: 2.52, year: "2023-24" },
      { pliType: "OP_OR", value: 2.43, year: "2022-23" },
      { pliType: "OP_OR", value: 2.27, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 90,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP028",
    cin: "U24200GJ2009PTC232109",
    name: "PetroChem Processors Private Limited",
    nicCode: "2012",
    nicDescription: "Manufacture of fertilizers and nitrogen compounds",
    industry: "Manufacturing",
    subIndustry: "Petrochemical Processing",
    functionalProfile: "MANUFACTURER_TOLL",
    financials: [
      {
        year: "2023-24",
        revenue: 2100000000,
        operatingRevenue: 2080000000,
        grossProfit: 126000000,
        operatingProfit: 46200000,
        netProfit: 32340000,
        operatingCost: 2033800000,
        totalCost: 2067660000,
        totalAssets: 1260000000,
        fixedAssets: 630000000,
        currentAssets: 588000000,
        currentLiabilities: 420000000,
        inventory: 210000000,
        receivables: 262500000,
        payables: 175000000,
        capitalEmployed: 840000000,
        employeeCost: 126000000,
        depreciation: 94500000,
        relatedPartyTransactions: 42000000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2022-23",
        revenue: 1920000000,
        operatingRevenue: 1900000000,
        grossProfit: 115200000,
        operatingProfit: 40320000,
        netProfit: 28224000,
        operatingCost: 1859680000,
        totalCost: 1891776000,
        totalAssets: 1152000000,
        fixedAssets: 576000000,
        currentAssets: 538000000,
        currentLiabilities: 384000000,
        inventory: 192000000,
        receivables: 240000000,
        payables: 160000000,
        capitalEmployed: 768000000,
        employeeCost: 115200000,
        depreciation: 86400000,
        relatedPartyTransactions: 38400000,
        relatedPartyPercent: 2.0
      },
      {
        year: "2021-22",
        revenue: 1760000000,
        operatingRevenue: 1740000000,
        grossProfit: 105600000,
        operatingProfit: 35200000,
        netProfit: 24640000,
        operatingCost: 1704800000,
        totalCost: 1735360000,
        totalAssets: 1056000000,
        fixedAssets: 528000000,
        currentAssets: 493000000,
        currentLiabilities: 352000000,
        inventory: 176000000,
        receivables: 220000000,
        payables: 146666667,
        capitalEmployed: 704000000,
        employeeCost: 105600000,
        depreciation: 79200000,
        relatedPartyTransactions: 35200000,
        relatedPartyPercent: 2.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 2.27, year: "2023-24" },
      { pliType: "OP_OC", value: 2.17, year: "2022-23" },
      { pliType: "OP_OC", value: 2.07, year: "2021-22" },
      { pliType: "OP_OR", value: 2.22, year: "2023-24" },
      { pliType: "OP_OR", value: 2.12, year: "2022-23" },
      { pliType: "OP_OR", value: 2.02, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 88,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 2.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },

  // ==========================================================================
  // SERVICE PROVIDERS (FULL-FLEDGED)
  // ==========================================================================
  {
    id: "COMP029",
    cin: "U74900DL2010PTC243210",
    name: "StrategyFirst Consulting Private Limited",
    nicCode: "7020",
    nicDescription: "Management consultancy activities",
    industry: "Professional Services",
    subIndustry: "Management Consulting",
    functionalProfile: "SERVICE_PROVIDER_FULL",
    financials: [
      {
        year: "2023-24",
        revenue: 290000000,
        operatingRevenue: 286000000,
        grossProfit: 130500000,
        operatingProfit: 58000000,
        netProfit: 40600000,
        operatingCost: 228000000,
        totalCost: 249400000,
        totalAssets: 174000000,
        fixedAssets: 17400000,
        currentAssets: 148000000,
        currentLiabilities: 58000000,
        inventory: 0,
        receivables: 48333333,
        payables: 24166667,
        capitalEmployed: 116000000,
        employeeCost: 174000000,
        depreciation: 5220000,
        relatedPartyTransactions: 2900000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 262000000,
        operatingRevenue: 258000000,
        grossProfit: 117900000,
        operatingProfit: 50150000,
        netProfit: 35105000,
        operatingCost: 207850000,
        totalCost: 226895000,
        totalAssets: 157000000,
        fixedAssets: 15700000,
        currentAssets: 134000000,
        currentLiabilities: 52400000,
        inventory: 0,
        receivables: 43666667,
        payables: 21833333,
        capitalEmployed: 104600000,
        employeeCost: 157200000,
        depreciation: 4710000,
        relatedPartyTransactions: 2620000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 238000000,
        operatingRevenue: 234000000,
        grossProfit: 107100000,
        operatingProfit: 43435000,
        netProfit: 30405000,
        operatingCost: 190565000,
        totalCost: 207595000,
        totalAssets: 143000000,
        fixedAssets: 14300000,
        currentAssets: 121000000,
        currentLiabilities: 47600000,
        inventory: 0,
        receivables: 39666667,
        payables: 19833333,
        capitalEmployed: 95400000,
        employeeCost: 142800000,
        depreciation: 4284000,
        relatedPartyTransactions: 2380000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 25.44, year: "2023-24" },
      { pliType: "OP_OC", value: 24.13, year: "2022-23" },
      { pliType: "OP_OC", value: 22.79, year: "2021-22" },
      { pliType: "OP_OR", value: 20.28, year: "2023-24" },
      { pliType: "OP_OR", value: 19.44, year: "2022-23" },
      { pliType: "OP_OR", value: 18.56, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 95,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  },
  {
    id: "COMP030",
    cin: "U74100MH2011PTC254321",
    name: "LegalServe Associates Private Limited",
    nicCode: "6910",
    nicDescription: "Legal activities",
    industry: "Professional Services",
    subIndustry: "Legal Services",
    functionalProfile: "SERVICE_PROVIDER_FULL",
    financials: [
      {
        year: "2023-24",
        revenue: 180000000,
        operatingRevenue: 177000000,
        grossProfit: 90000000,
        operatingProfit: 39600000,
        netProfit: 27720000,
        operatingCost: 137400000,
        totalCost: 152280000,
        totalAssets: 108000000,
        fixedAssets: 10800000,
        currentAssets: 91000000,
        currentLiabilities: 36000000,
        inventory: 0,
        receivables: 30000000,
        payables: 15000000,
        capitalEmployed: 72000000,
        employeeCost: 108000000,
        depreciation: 3240000,
        relatedPartyTransactions: 1800000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2022-23",
        revenue: 163000000,
        operatingRevenue: 160000000,
        grossProfit: 81500000,
        operatingProfit: 34235000,
        netProfit: 23965000,
        operatingCost: 125765000,
        totalCost: 139035000,
        totalAssets: 98000000,
        fixedAssets: 9800000,
        currentAssets: 82000000,
        currentLiabilities: 32600000,
        inventory: 0,
        receivables: 27166667,
        payables: 13583333,
        capitalEmployed: 65400000,
        employeeCost: 97800000,
        depreciation: 2934000,
        relatedPartyTransactions: 1630000,
        relatedPartyPercent: 1.0
      },
      {
        year: "2021-22",
        revenue: 148000000,
        operatingRevenue: 145000000,
        grossProfit: 74000000,
        operatingProfit: 29600000,
        netProfit: 20720000,
        operatingCost: 115400000,
        totalCost: 127280000,
        totalAssets: 89000000,
        fixedAssets: 8900000,
        currentAssets: 75000000,
        currentLiabilities: 29600000,
        inventory: 0,
        receivables: 24666667,
        payables: 12333333,
        capitalEmployed: 59400000,
        employeeCost: 88800000,
        depreciation: 2664000,
        relatedPartyTransactions: 1480000,
        relatedPartyPercent: 1.0
      }
    ],
    plis: [
      { pliType: "OP_OC", value: 28.82, year: "2023-24" },
      { pliType: "OP_OC", value: 27.22, year: "2022-23" },
      { pliType: "OP_OC", value: 25.65, year: "2021-22" },
      { pliType: "OP_OR", value: 22.37, year: "2023-24" },
      { pliType: "OP_OR", value: 21.40, year: "2022-23" },
      { pliType: "OP_OR", value: 20.41, year: "2021-22" }
    ],
    status: "ACTIVE",
    source: "INTERNAL",
    dataQualityScore: 91,
    yearsOfData: 3,
    hasRelatedPartyTransactions: true,
    relatedPartyPercent: 1.0,
    hasPersistentLosses: false,
    lossYears: 0,
    hasExtraordinaryItems: false,
    isAccepted: true
  }
];

// =============================================================================
// INDUSTRY BENCHMARKS DATABASE
// =============================================================================

export const INDUSTRY_BENCHMARKS: Record<string, {
  industry: string;
  functionalProfiles: FunctionalProfile[];
  opOcRange: { min: number; q1: number; median: number; q3: number; max: number };
  opOrRange: { min: number; q1: number; median: number; q3: number; max: number };
  typicalRptPercent: number;
  typicalEmployeeCostRatio: number;
}> = {
  "IT_SERVICES": {
    industry: "Information Technology",
    functionalProfiles: ["IT_SERVICES", "SERVICE_PROVIDER_FULL", "SERVICE_PROVIDER_CONTRACT"],
    opOcRange: { min: 10.0, q1: 12.5, median: 15.0, q3: 17.5, max: 22.0 },
    opOrRange: { min: 9.0, q1: 11.0, median: 13.0, q3: 15.0, max: 18.0 },
    typicalRptPercent: 2.0,
    typicalEmployeeCostRatio: 55.0
  },
  "ITES_BPO": {
    industry: "ITES/BPO",
    functionalProfiles: ["ITES_BPO", "KPO", "SERVICE_PROVIDER_CONTRACT"],
    opOcRange: { min: 8.0, q1: 11.0, median: 13.0, q3: 16.0, max: 20.0 },
    opOrRange: { min: 7.0, q1: 10.0, median: 12.0, q3: 14.0, max: 17.0 },
    typicalRptPercent: 2.5,
    typicalEmployeeCostRatio: 60.0
  },
  "CONTRACT_MANUFACTURING": {
    industry: "Manufacturing",
    functionalProfiles: ["MANUFACTURER_CONTRACT", "MANUFACTURER_TOLL"],
    opOcRange: { min: 2.0, q1: 4.0, median: 5.5, q3: 7.0, max: 10.0 },
    opOrRange: { min: 2.0, q1: 3.5, median: 5.0, q3: 6.5, max: 9.0 },
    typicalRptPercent: 3.0,
    typicalEmployeeCostRatio: 15.0
  },
  "TOLL_MANUFACTURING": {
    industry: "Manufacturing",
    functionalProfiles: ["MANUFACTURER_TOLL"],
    opOcRange: { min: 1.5, q1: 2.0, median: 2.5, q3: 3.5, max: 5.0 },
    opOrRange: { min: 1.5, q1: 2.0, median: 2.5, q3: 3.0, max: 4.5 },
    typicalRptPercent: 2.0,
    typicalEmployeeCostRatio: 8.0
  },
  "PHARMACEUTICALS": {
    industry: "Pharmaceuticals",
    functionalProfiles: ["MANUFACTURER_CONTRACT", "R_AND_D_CONTRACT", "R_AND_D_FULL"],
    opOcRange: { min: 5.0, q1: 7.0, median: 8.5, q3: 12.0, max: 18.0 },
    opOrRange: { min: 4.5, q1: 6.5, median: 8.0, q3: 11.0, max: 16.0 },
    typicalRptPercent: 3.0,
    typicalEmployeeCostRatio: 18.0
  },
  "DISTRIBUTION": {
    industry: "Distribution",
    functionalProfiles: ["DISTRIBUTOR_LIMITED_RISK", "DISTRIBUTOR_FULL_FLEDGED", "DISTRIBUTOR_COMMISSIONAIRE"],
    opOcRange: { min: 1.0, q1: 1.5, median: 2.5, q3: 3.5, max: 5.0 },
    opOrRange: { min: 1.0, q1: 1.5, median: 2.0, q3: 3.0, max: 4.5 },
    typicalRptPercent: 1.5,
    typicalEmployeeCostRatio: 3.0
  },
  "R_AND_D_SERVICES": {
    industry: "R&D Services",
    functionalProfiles: ["R_AND_D_CONTRACT", "R_AND_D_FULL"],
    opOcRange: { min: 10.0, q1: 13.0, median: 15.5, q3: 18.0, max: 25.0 },
    opOrRange: { min: 9.0, q1: 12.0, median: 14.0, q3: 16.0, max: 20.0 },
    typicalRptPercent: 2.0,
    typicalEmployeeCostRatio: 60.0
  },
  "PROFESSIONAL_SERVICES": {
    industry: "Professional Services",
    functionalProfiles: ["SERVICE_PROVIDER_FULL"],
    opOcRange: { min: 15.0, q1: 20.0, median: 25.0, q3: 30.0, max: 40.0 },
    opOrRange: { min: 12.0, q1: 17.0, median: 20.0, q3: 24.0, max: 30.0 },
    typicalRptPercent: 1.0,
    typicalEmployeeCostRatio: 65.0
  }
};

// =============================================================================
// STATISTICAL UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate percentile using linear interpolation
 */
function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sortedValues.length) return sortedValues[sortedValues.length - 1];
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Calculate mean of array
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1));
}

/**
 * Calculate weighted average PLI for a company
 */
function calculateWeightedPLI(
  plis: PLICalculated[],
  pliType: PLIType,
  weights: number[] = [0.5, 0.35, 0.15]
): number {
  const relevantPlis = plis
    .filter(p => p.pliType === pliType)
    .sort((a, b) => b.year.localeCompare(a.year))
    .slice(0, 3);

  if (relevantPlis.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  relevantPlis.forEach((pli, index) => {
    const weight = weights[index] || weights[weights.length - 1];
    weightedSum += pli.value * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Detect outliers using IQR method
 */
function detectOutliers(values: number[]): { value: number; isOutlier: boolean }[] {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  return values.map(value => ({
    value,
    isOutlier: value < lowerFence || value > upperFence
  }));
}

// =============================================================================
// PLI CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate all PLI types for given financials
 */
export function calculatePLIs(financials: CompanyFinancials): PLICalculated[] {
  const plis: PLICalculated[] = [];

  // OP/OC
  if (financials.operatingCost > 0) {
    plis.push({
      pliType: "OP_OC",
      value: (financials.operatingProfit / financials.operatingCost) * 100,
      year: financials.year
    });
  }

  // OP/OR
  if (financials.operatingRevenue > 0) {
    plis.push({
      pliType: "OP_OR",
      value: (financials.operatingProfit / financials.operatingRevenue) * 100,
      year: financials.year
    });
  }

  // OP/TC
  if (financials.totalCost > 0) {
    plis.push({
      pliType: "OP_TC",
      value: (financials.operatingProfit / financials.totalCost) * 100,
      year: financials.year
    });
  }

  // GP/Sales
  if (financials.revenue > 0) {
    plis.push({
      pliType: "GP_SALES",
      value: (financials.grossProfit / financials.revenue) * 100,
      year: financials.year
    });
  }

  // Berry Ratio
  const operatingExpenses = financials.operatingCost - financials.grossProfit + financials.operatingProfit;
  if (operatingExpenses > 0 && financials.grossProfit > 0) {
    plis.push({
      pliType: "BERRY_RATIO",
      value: financials.grossProfit / operatingExpenses,
      year: financials.year
    });
  }

  // ROA
  if (financials.totalAssets > 0) {
    plis.push({
      pliType: "ROA",
      value: (financials.operatingProfit / financials.totalAssets) * 100,
      year: financials.year
    });
  }

  // ROCE
  if (financials.capitalEmployed > 0) {
    plis.push({
      pliType: "ROCE",
      value: (financials.operatingProfit / financials.capitalEmployed) * 100,
      year: financials.year
    });
  }

  return plis;
}

/**
 * Get recommended PLI for a functional profile
 */
export function getRecommendedPLI(profile: FunctionalProfile): PLIType {
  const recommendations: Record<FunctionalProfile, PLIType> = {
    "MANUFACTURER_FULL_FLEDGED": "OP_OR",
    "MANUFACTURER_CONTRACT": "OP_TC",
    "MANUFACTURER_TOLL": "NCP_SALES",
    "DISTRIBUTOR_FULL_FLEDGED": "GP_SALES",
    "DISTRIBUTOR_LIMITED_RISK": "BERRY_RATIO",
    "DISTRIBUTOR_COMMISSIONAIRE": "BERRY_RATIO",
    "SERVICE_PROVIDER_FULL": "OP_OR",
    "SERVICE_PROVIDER_CONTRACT": "OP_OC",
    "IT_SERVICES": "OP_OC",
    "ITES_BPO": "OP_OC",
    "KPO": "OP_OC",
    "R_AND_D_FULL": "OP_OR",
    "R_AND_D_CONTRACT": "OP_OC",
    "HOLDING_COMPANY": "ROA",
    "FINANCING": "ROCE"
  };

  return recommendations[profile] || "OP_OC";
}

// =============================================================================
// FAR ANALYSIS ENGINE
// =============================================================================

/**
 * Create a FAR profile based on company characteristics
 */
export function createFARProfile(
  profile: FunctionalProfile,
  financials: CompanyFinancials
): FARProfile {
  // Base profiles by functional type
  const baseProfiles: Record<FunctionalProfile, Partial<FARProfile>> = {
    "IT_SERVICES": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "MEDIUM",
        qualityControl: "MEDIUM",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "LOW",
        intangibleAssets: "LOW",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "LOW",
        operationalRisk: "MEDIUM",
        financialRisk: "LOW"
      }
    },
    "ITES_BPO": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "LOW",
        qualityControl: "MEDIUM",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "MEDIUM",
        intangibleAssets: "LOW",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "LOW",
        operationalRisk: "MEDIUM",
        financialRisk: "LOW"
      }
    },
    "MANUFACTURER_FULL_FLEDGED": {
      functions: {
        manufacturing: "HIGH",
        procurement: "HIGH",
        marketing: "HIGH",
        distribution: "HIGH",
        rAndD: "HIGH",
        qualityControl: "HIGH",
        strategicDecisions: "HIGH",
        financialManagement: "HIGH"
      },
      assets: {
        tangibleAssets: "HIGH",
        intangibleAssets: "HIGH",
        inventory: "HIGH",
        receivables: "HIGH",
        brand: "HIGH",
        technology: "HIGH"
      },
      risks: {
        marketRisk: "HIGH",
        creditRisk: "HIGH",
        inventoryRisk: "HIGH",
        foreignExchangeRisk: "HIGH",
        productLiabilityRisk: "HIGH",
        operationalRisk: "HIGH",
        financialRisk: "HIGH"
      }
    },
    "MANUFACTURER_CONTRACT": {
      functions: {
        manufacturing: "HIGH",
        procurement: "MEDIUM",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "LOW",
        qualityControl: "HIGH",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "HIGH",
        intangibleAssets: "LOW",
        inventory: "MEDIUM",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "MEDIUM",
        inventoryRisk: "MEDIUM",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "MEDIUM",
        operationalRisk: "MEDIUM",
        financialRisk: "LOW"
      }
    },
    "MANUFACTURER_TOLL": {
      functions: {
        manufacturing: "HIGH",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "LOW",
        qualityControl: "MEDIUM",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "HIGH",
        intangibleAssets: "LOW",
        inventory: "LOW",
        receivables: "LOW",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "LOW",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "LOW",
        productLiabilityRisk: "LOW",
        operationalRisk: "MEDIUM",
        financialRisk: "LOW"
      }
    },
    "DISTRIBUTOR_FULL_FLEDGED": {
      functions: {
        manufacturing: "LOW",
        procurement: "HIGH",
        marketing: "HIGH",
        distribution: "HIGH",
        rAndD: "LOW",
        qualityControl: "MEDIUM",
        strategicDecisions: "HIGH",
        financialManagement: "HIGH"
      },
      assets: {
        tangibleAssets: "MEDIUM",
        intangibleAssets: "MEDIUM",
        inventory: "HIGH",
        receivables: "HIGH",
        brand: "MEDIUM",
        technology: "LOW"
      },
      risks: {
        marketRisk: "HIGH",
        creditRisk: "HIGH",
        inventoryRisk: "HIGH",
        foreignExchangeRisk: "HIGH",
        productLiabilityRisk: "MEDIUM",
        operationalRisk: "MEDIUM",
        financialRisk: "HIGH"
      }
    },
    "DISTRIBUTOR_LIMITED_RISK": {
      functions: {
        manufacturing: "LOW",
        procurement: "MEDIUM",
        marketing: "MEDIUM",
        distribution: "MEDIUM",
        rAndD: "LOW",
        qualityControl: "LOW",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "LOW",
        intangibleAssets: "LOW",
        inventory: "MEDIUM",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "LOW",
        operationalRisk: "LOW",
        financialRisk: "LOW"
      }
    },
    "DISTRIBUTOR_COMMISSIONAIRE": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "MEDIUM",
        distribution: "MEDIUM",
        rAndD: "LOW",
        qualityControl: "LOW",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "LOW",
        intangibleAssets: "LOW",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "LOW",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "LOW",
        operationalRisk: "LOW",
        financialRisk: "LOW"
      }
    },
    "SERVICE_PROVIDER_FULL": {
      functions: {
        manufacturing: "LOW",
        procurement: "MEDIUM",
        marketing: "HIGH",
        distribution: "MEDIUM",
        rAndD: "MEDIUM",
        qualityControl: "HIGH",
        strategicDecisions: "HIGH",
        financialManagement: "HIGH"
      },
      assets: {
        tangibleAssets: "MEDIUM",
        intangibleAssets: "HIGH",
        inventory: "LOW",
        receivables: "HIGH",
        brand: "HIGH",
        technology: "MEDIUM"
      },
      risks: {
        marketRisk: "HIGH",
        creditRisk: "HIGH",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "MEDIUM",
        operationalRisk: "HIGH",
        financialRisk: "HIGH"
      }
    },
    "SERVICE_PROVIDER_CONTRACT": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "LOW",
        qualityControl: "MEDIUM",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "MEDIUM",
        intangibleAssets: "LOW",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "LOW",
        operationalRisk: "MEDIUM",
        financialRisk: "LOW"
      }
    },
    "KPO": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "HIGH",
        qualityControl: "HIGH",
        strategicDecisions: "MEDIUM",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "LOW",
        intangibleAssets: "MEDIUM",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "MEDIUM"
      },
      risks: {
        marketRisk: "MEDIUM",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "LOW",
        operationalRisk: "MEDIUM",
        financialRisk: "LOW"
      }
    },
    "R_AND_D_FULL": {
      functions: {
        manufacturing: "LOW",
        procurement: "MEDIUM",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "HIGH",
        qualityControl: "HIGH",
        strategicDecisions: "HIGH",
        financialManagement: "HIGH"
      },
      assets: {
        tangibleAssets: "HIGH",
        intangibleAssets: "HIGH",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "MEDIUM",
        technology: "HIGH"
      },
      risks: {
        marketRisk: "HIGH",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "HIGH",
        operationalRisk: "HIGH",
        financialRisk: "HIGH"
      }
    },
    "R_AND_D_CONTRACT": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "HIGH",
        qualityControl: "HIGH",
        strategicDecisions: "LOW",
        financialManagement: "LOW"
      },
      assets: {
        tangibleAssets: "MEDIUM",
        intangibleAssets: "LOW",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "MEDIUM",
        productLiabilityRisk: "LOW",
        operationalRisk: "MEDIUM",
        financialRisk: "LOW"
      }
    },
    "HOLDING_COMPANY": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "LOW",
        qualityControl: "LOW",
        strategicDecisions: "HIGH",
        financialManagement: "HIGH"
      },
      assets: {
        tangibleAssets: "LOW",
        intangibleAssets: "HIGH",
        inventory: "LOW",
        receivables: "MEDIUM",
        brand: "HIGH",
        technology: "LOW"
      },
      risks: {
        marketRisk: "HIGH",
        creditRisk: "MEDIUM",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "HIGH",
        productLiabilityRisk: "LOW",
        operationalRisk: "LOW",
        financialRisk: "HIGH"
      }
    },
    "FINANCING": {
      functions: {
        manufacturing: "LOW",
        procurement: "LOW",
        marketing: "LOW",
        distribution: "LOW",
        rAndD: "LOW",
        qualityControl: "LOW",
        strategicDecisions: "MEDIUM",
        financialManagement: "HIGH"
      },
      assets: {
        tangibleAssets: "LOW",
        intangibleAssets: "LOW",
        inventory: "LOW",
        receivables: "HIGH",
        brand: "LOW",
        technology: "LOW"
      },
      risks: {
        marketRisk: "LOW",
        creditRisk: "HIGH",
        inventoryRisk: "LOW",
        foreignExchangeRisk: "HIGH",
        productLiabilityRisk: "LOW",
        operationalRisk: "LOW",
        financialRisk: "HIGH"
      }
    }
  };

  const baseProfile = baseProfiles[profile] || baseProfiles["IT_SERVICES"];

  // Calculate score based on risk levels
  const riskScores: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  let totalScore = 0;
  let maxScore = 0;

  Object.values(baseProfile.functions || {}).forEach(level => {
    totalScore += riskScores[level as RiskLevel];
    maxScore += 3;
  });
  Object.values(baseProfile.assets || {}).forEach(level => {
    totalScore += riskScores[level as RiskLevel];
    maxScore += 3;
  });
  Object.values(baseProfile.risks || {}).forEach(level => {
    totalScore += riskScores[level as RiskLevel];
    maxScore += 3;
  });

  return {
    functions: baseProfile.functions as FARProfile["functions"],
    assets: baseProfile.assets as FARProfile["assets"],
    risks: baseProfile.risks as FARProfile["risks"],
    overallProfile: profile,
    score: Math.round((totalScore / maxScore) * 100)
  };
}

/**
 * Calculate FAR similarity score between two profiles
 */
export function calculateFARSimilarity(profile1: FARProfile, profile2: FARProfile): number {
  const riskScores: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

  let totalDiff = 0;
  let totalComparisons = 0;

  // Compare functions
  for (const key of Object.keys(profile1.functions)) {
    const k = key as keyof FARProfile["functions"];
    totalDiff += Math.abs(riskScores[profile1.functions[k]] - riskScores[profile2.functions[k]]);
    totalComparisons++;
  }

  // Compare assets
  for (const key of Object.keys(profile1.assets)) {
    const k = key as keyof FARProfile["assets"];
    totalDiff += Math.abs(riskScores[profile1.assets[k]] - riskScores[profile2.assets[k]]);
    totalComparisons++;
  }

  // Compare risks
  for (const key of Object.keys(profile1.risks)) {
    const k = key as keyof FARProfile["risks"];
    totalDiff += Math.abs(riskScores[profile1.risks[k]] - riskScores[profile2.risks[k]]);
    totalComparisons++;
  }

  // Max difference per comparison is 2 (HIGH to LOW)
  const maxDiff = totalComparisons * 2;
  return Math.round((1 - totalDiff / maxDiff) * 100);
}

// =============================================================================
// WORKING CAPITAL ADJUSTMENT ENGINE
// =============================================================================

/**
 * Calculate working capital days
 */
function calculateWorkingCapitalDays(financials: CompanyFinancials): {
  receivablesDays: number;
  inventoryDays: number;
  payablesDays: number;
  workingCapitalDays: number;
} {
  const dailyRevenue = financials.revenue / 365;
  const dailyCost = financials.operatingCost / 365;

  const receivablesDays = dailyRevenue > 0 ? financials.receivables / dailyRevenue : 0;
  const inventoryDays = dailyCost > 0 ? financials.inventory / dailyCost : 0;
  const payablesDays = dailyCost > 0 ? financials.payables / dailyCost : 0;
  const workingCapitalDays = receivablesDays + inventoryDays - payablesDays;

  return { receivablesDays, inventoryDays, payablesDays, workingCapitalDays };
}

/**
 * Calculate working capital adjustment
 */
export function calculateWorkingCapitalAdjustment(
  comparable: ComparableCompany,
  testedPartyWCDays: number,
  adjustmentRate: number = 0.10 // 10% as default opportunity cost rate
): WorkingCapitalAdjustment {
  const latestFinancials = comparable.financials[0];
  const wcDays = calculateWorkingCapitalDays(latestFinancials);
  const difference = wcDays.workingCapitalDays - testedPartyWCDays;
  const adjustment = (difference / 365) * adjustmentRate * 100;

  const latestPLI = comparable.plis.find(p => p.year === latestFinancials.year && p.pliType === "OP_OC");
  const originalPLI = latestPLI?.value || 0;

  return {
    companyId: comparable.id,
    companyName: comparable.name,
    originalPLI,
    adjustedPLI: originalPLI - adjustment,
    adjustment,
    receivablesDays: wcDays.receivablesDays,
    inventoryDays: wcDays.inventoryDays,
    payablesDays: wcDays.payablesDays,
    workingCapitalDays: wcDays.workingCapitalDays,
    testedPartyWCDays,
    difference,
    adjustmentRate
  };
}

// =============================================================================
// BENCHMARKING SET CALCULATION
// =============================================================================

/**
 * Calculate comprehensive benchmarking statistics
 */
export function calculateBenchmarkingSet(
  comparables: ComparableCompany[],
  pliType: PLIType,
  testedPartyPLI?: number
): BenchmarkingSet {
  // Get weighted average PLI for each comparable
  const pliValues = comparables.map(comp => calculateWeightedPLI(comp.plis, pliType));
  const validPlis = pliValues.filter(v => v > 0);

  if (validPlis.length === 0) {
    return {
      comparables,
      testedPartyPLI,
      pliType,
      statistics: {
        count: 0, mean: 0, median: 0, standardDeviation: 0,
        min: 0, max: 0, q1: 0, q3: 0, iqr: 0,
        lowerFence: 0, upperFence: 0
      },
      armLengthRange: {
        lowerBound: 0, upperBound: 0,
        fullRangeLower: 0, fullRangeUpper: 0,
        interquartileLower: 0, interquartileUpper: 0,
        median: 0
      },
      analysisDate: new Date().toISOString(),
      financialYears: [],
      methodology: "TNMM with weighted average PLI"
    };
  }

  const sorted = [...validPlis].sort((a, b) => a - b);

  const mean = calculateMean(sorted);
  const stdDev = calculateStdDev(sorted);
  const median = calculatePercentile(sorted, 50);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;

  const statistics = {
    count: sorted.length,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    standardDeviation: Math.round(stdDev * 100) / 100,
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    iqr: Math.round(iqr * 100) / 100,
    lowerFence: Math.round((q1 - 1.5 * iqr) * 100) / 100,
    upperFence: Math.round((q3 + 1.5 * iqr) * 100) / 100
  };

  const armLengthRange = {
    lowerBound: Math.round(calculatePercentile(sorted, 35) * 100) / 100,
    upperBound: Math.round(calculatePercentile(sorted, 65) * 100) / 100,
    fullRangeLower: statistics.min,
    fullRangeUpper: statistics.max,
    interquartileLower: statistics.q1,
    interquartileUpper: statistics.q3,
    median: statistics.median
  };

  // Tested party analysis
  let testedPartyAnalysis;
  if (testedPartyPLI !== undefined) {
    const percentile = (sorted.filter(v => v <= testedPartyPLI).length / sorted.length) * 100;
    const withinArmLength = testedPartyPLI >= armLengthRange.lowerBound && testedPartyPLI <= armLengthRange.upperBound;
    const withinIQR = testedPartyPLI >= q1 && testedPartyPLI <= q3;

    testedPartyAnalysis = {
      pli: testedPartyPLI,
      withinArmLengthRange: withinArmLength,
      withinInterquartileRange: withinIQR,
      percentile: Math.round(percentile * 100) / 100,
      adjustment: withinArmLength ? undefined : median - testedPartyPLI,
      adjustedToMedian: !withinArmLength
    };
  }

  // Get financial years covered
  const years = new Set<string>();
  comparables.forEach(c => c.financials.forEach(f => years.add(f.year)));

  return {
    comparables,
    testedPartyPLI,
    pliType,
    statistics,
    armLengthRange,
    testedPartyAnalysis,
    analysisDate: new Date().toISOString(),
    financialYears: Array.from(years).sort().reverse(),
    methodology: "Transactional Net Margin Method (TNMM) with weighted average PLI (50:35:15)"
  };
}

// =============================================================================
// COMPARABLE SEARCH ENGINE CLASS
// =============================================================================

export class ComparableSearchEngine {
  private companies: ComparableCompany[] = SAMPLE_COMPANIES;

  constructor() {
    // Initialize with sample data
  }

  /**
   * Search for comparable companies
   */
  async search(criteria: ComparableSearchCriteria): Promise<{
    companies: ComparableCompany[];
    total: number;
    criteria: ComparableSearchCriteria;
    searchDate: string;
  }> {
    let results = [...this.companies];

    // Apply filters
    if (criteria.nicCodes && criteria.nicCodes.length > 0) {
      results = results.filter(c =>
        criteria.nicCodes!.some(code => c.nicCode.startsWith(code))
      );
    }

    if (criteria.functionalProfile) {
      results = results.filter(c => c.functionalProfile === criteria.functionalProfile);
    }

    if (criteria.revenueMin !== undefined) {
      results = results.filter(c => {
        const latestRevenue = c.financials[0]?.revenue || 0;
        return latestRevenue >= criteria.revenueMin!;
      });
    }

    if (criteria.revenueMax !== undefined) {
      results = results.filter(c => {
        const latestRevenue = c.financials[0]?.revenue || 0;
        return latestRevenue <= criteria.revenueMax!;
      });
    }

    if (criteria.excludeRelatedPartyAbove !== undefined) {
      results = results.filter(c => c.relatedPartyPercent <= criteria.excludeRelatedPartyAbove!);
    }

    if (criteria.excludePersistentLosses) {
      results = results.filter(c => !c.hasPersistentLosses);
    }

    if (criteria.minYearsData !== undefined) {
      results = results.filter(c => c.yearsOfData >= criteria.minYearsData!);
    }

    if (criteria.status && criteria.status.length > 0) {
      results = results.filter(c => criteria.status!.includes(c.status as "ACTIVE" | "INACTIVE"));
    }

    if (criteria.excludeCompanies && criteria.excludeCompanies.length > 0) {
      results = results.filter(c => !criteria.excludeCompanies!.includes(c.id));
    }

    return {
      companies: results,
      total: results.length,
      criteria,
      searchDate: new Date().toISOString()
    };
  }

  /**
   * Get company by CIN
   */
  async getCompany(cin: string): Promise<ComparableCompany | null> {
    return this.companies.find(c => c.cin === cin) || null;
  }

  /**
   * Perform full comparability analysis
   */
  async performComparabilityAnalysis(
    testedParty: {
      name: string;
      functionalProfile: FunctionalProfile;
      financials: CompanyFinancials;
      pli: number;
    },
    searchCriteria: ComparableSearchCriteria,
    pliType: PLIType = "OP_OC"
  ): Promise<ComparabilityAnalysis> {
    // Search for comparables
    const searchResult = await this.search(searchCriteria);
    const initialPool = searchResult.total;

    // Create FAR profile for tested party
    const testedPartyFAR = createFARProfile(testedParty.functionalProfile, testedParty.financials);

    // Score and filter comparables
    const rejectionMatrix: { reason: string; count: number; companies: string[] }[] = [];
    const scoredComparables: ComparableCompany[] = [];

    for (const comp of searchResult.companies) {
      const rejections: RejectionReason[] = [];

      // Check related party transactions
      if (comp.relatedPartyPercent > 25) {
        rejections.push({
          code: "RPT_HIGH",
          reason: "High related party transactions",
          severity: "HARD",
          details: `Related party transactions at ${comp.relatedPartyPercent}% exceed 25% threshold`,
          regulatoryBasis: "Rule 10B(4) - Related party filter"
        });
      }

      // Check persistent losses
      if (comp.hasPersistentLosses) {
        rejections.push({
          code: "PERSISTENT_LOSS",
          reason: "Persistent losses",
          severity: "HARD",
          details: `Company has losses in ${comp.lossYears} years`,
          regulatoryBasis: "OECD Guidelines Para 3.64"
        });
      }

      // Check data quality
      if (comp.dataQualityScore < 70) {
        rejections.push({
          code: "LOW_DATA_QUALITY",
          reason: "Insufficient data quality",
          severity: "SOFT",
          details: `Data quality score ${comp.dataQualityScore}% below 70% threshold`
        });
      }

      // Calculate FAR similarity
      const compFAR = createFARProfile(comp.functionalProfile, comp.financials[0]);
      const farSimilarity = calculateFARSimilarity(testedPartyFAR, compFAR);

      if (farSimilarity < 60) {
        rejections.push({
          code: "FAR_MISMATCH",
          reason: "Functional profile mismatch",
          severity: "SOFT",
          details: `FAR similarity score ${farSimilarity}% below 60% threshold`
        });
      }

      // Calculate comparability score
      const comparabilityScore: ComparabilityScore = {
        overall: 0,
        functional: farSimilarity,
        financial: this.calculateFinancialSimilarity(testedParty.financials, comp.financials[0]),
        industry: comp.functionalProfile === testedParty.functionalProfile ? 100 : 70,
        geographic: 85, // India-based
        temporal: 95, // Same financial years
        qualitative: comp.dataQualityScore,
        breakdown: []
      };

      comparabilityScore.overall = Math.round(
        (comparabilityScore.functional * 0.3 +
          comparabilityScore.financial * 0.2 +
          comparabilityScore.industry * 0.2 +
          comparabilityScore.geographic * 0.1 +
          comparabilityScore.temporal * 0.1 +
          comparabilityScore.qualitative * 0.1)
      );

      // Accept or reject
      const hardRejections = rejections.filter(r => r.severity === "HARD");
      const isAccepted = hardRejections.length === 0 && comparabilityScore.overall >= 65;

      comp.farProfile = compFAR;
      comp.comparabilityScore = comparabilityScore;
      comp.isAccepted = isAccepted;
      comp.rejectionReasons = rejections.length > 0 ? rejections : undefined;

      if (isAccepted) {
        scoredComparables.push(comp);
      }

      // Track rejections
      for (const rej of rejections) {
        const existing = rejectionMatrix.find(r => r.reason === rej.reason);
        if (existing) {
          existing.count++;
          existing.companies.push(comp.name);
        } else {
          rejectionMatrix.push({ reason: rej.reason, count: 1, companies: [comp.name] });
        }
      }
    }

    // Calculate benchmarking set
    const benchmarkingSet = calculateBenchmarkingSet(scoredComparables, pliType, testedParty.pli);

    // Generate conclusion
    const isArmLength = benchmarkingSet.testedPartyAnalysis?.withinArmLengthRange || false;
    const conclusion = {
      isArmLength,
      testedPartyPLI: testedParty.pli,
      armLengthRangeLower: benchmarkingSet.armLengthRange.lowerBound,
      armLengthRangeUpper: benchmarkingSet.armLengthRange.upperBound,
      median: benchmarkingSet.armLengthRange.median,
      adjustment: benchmarkingSet.testedPartyAnalysis?.adjustment,
      narrative: isArmLength
        ? `The tested party's PLI of ${testedParty.pli.toFixed(2)}% falls within the arm's length range of ${benchmarkingSet.armLengthRange.lowerBound.toFixed(2)}% to ${benchmarkingSet.armLengthRange.upperBound.toFixed(2)}%. No adjustment is required.`
        : `The tested party's PLI of ${testedParty.pli.toFixed(2)}% falls outside the arm's length range. An adjustment of ${Math.abs(benchmarkingSet.testedPartyAnalysis?.adjustment || 0).toFixed(2)}% to the median of ${benchmarkingSet.armLengthRange.median.toFixed(2)}% may be required.`
    };

    return {
      testedParty: {
        name: testedParty.name,
        functionalProfile: testedParty.functionalProfile,
        farProfile: testedPartyFAR,
        pli: testedParty.pli,
        pliType,
        financials: testedParty.financials
      },
      searchCriteria,
      initialPool,
      afterScreening: searchResult.companies.length,
      finalSet: scoredComparables.length,
      rejectionMatrix,
      acceptedComparables: scoredComparables,
      benchmarkingSet,
      conclusion
    };
  }

  /**
   * Apply working capital adjustments to comparables
   */
  applyWorkingCapitalAdjustment(
    comparables: ComparableCompany[],
    testedPartyWCDays: number,
    adjustmentRate: number = 0.10
  ): WorkingCapitalAdjustment[] {
    return comparables.map(comp =>
      calculateWorkingCapitalAdjustment(comp, testedPartyWCDays, adjustmentRate)
    );
  }

  /**
   * Get filtering/rejection analysis
   */
  async getFilteringAnalysis(criteria: ComparableSearchCriteria): Promise<{
    totalInDatabase: number;
    afterNICFilter: number;
    afterRevenueFilter: number;
    afterRPTFilter: number;
    afterLossFilter: number;
    finalCount: number;
    filterEffectiveness: {
      filter: string;
      companiesRemoved: number;
      percentage: number;
    }[];
  }> {
    const total = this.companies.length;
    let afterNIC = total;
    let afterRevenue = total;
    let afterRPT = total;
    let afterLoss = total;

    if (criteria.nicCodes && criteria.nicCodes.length > 0) {
      afterNIC = this.companies.filter(c =>
        criteria.nicCodes!.some(code => c.nicCode.startsWith(code))
      ).length;
    }

    if (criteria.revenueMin !== undefined || criteria.revenueMax !== undefined) {
      afterRevenue = this.companies.filter(c => {
        const rev = c.financials[0]?.revenue || 0;
        const minOk = criteria.revenueMin === undefined || rev >= criteria.revenueMin;
        const maxOk = criteria.revenueMax === undefined || rev <= criteria.revenueMax;
        return minOk && maxOk;
      }).length;
    }

    if (criteria.excludeRelatedPartyAbove !== undefined) {
      afterRPT = this.companies.filter(c =>
        c.relatedPartyPercent <= criteria.excludeRelatedPartyAbove!
      ).length;
    }

    if (criteria.excludePersistentLosses) {
      afterLoss = this.companies.filter(c => !c.hasPersistentLosses).length;
    }

    const searchResult = await this.search(criteria);

    return {
      totalInDatabase: total,
      afterNICFilter: afterNIC,
      afterRevenueFilter: afterRevenue,
      afterRPTFilter: afterRPT,
      afterLossFilter: afterLoss,
      finalCount: searchResult.total,
      filterEffectiveness: [
        { filter: "NIC Code", companiesRemoved: total - afterNIC, percentage: ((total - afterNIC) / total) * 100 },
        { filter: "Revenue Range", companiesRemoved: total - afterRevenue, percentage: ((total - afterRevenue) / total) * 100 },
        { filter: "Related Party", companiesRemoved: total - afterRPT, percentage: ((total - afterRPT) / total) * 100 },
        { filter: "Persistent Losses", companiesRemoved: total - afterLoss, percentage: ((total - afterLoss) / total) * 100 }
      ]
    };
  }

  /**
   * Get recommended PLI for functional profile
   */
  getRecommendedPLI(profile: FunctionalProfile): PLIType {
    return getRecommendedPLI(profile);
  }

  /**
   * Get PLI descriptions
   */
  getPLIDescriptions(): typeof PLI_DESCRIPTIONS {
    return PLI_DESCRIPTIONS;
  }

  /**
   * Get functional profiles
   */
  getFunctionalProfiles(): FunctionalProfile[] {
    return [
      "IT_SERVICES", "ITES_BPO", "KPO",
      "MANUFACTURER_FULL_FLEDGED", "MANUFACTURER_CONTRACT", "MANUFACTURER_TOLL",
      "DISTRIBUTOR_FULL_FLEDGED", "DISTRIBUTOR_LIMITED_RISK", "DISTRIBUTOR_COMMISSIONAIRE",
      "SERVICE_PROVIDER_FULL", "SERVICE_PROVIDER_CONTRACT",
      "R_AND_D_FULL", "R_AND_D_CONTRACT",
      "HOLDING_COMPANY", "FINANCING"
    ];
  }

  /**
   * Test connections - returns internal database status
   */
  async testConnections(): Promise<{
    internal: { available: boolean; companies: number };
    external: { prowess: string; capitaline: string };
  }> {
    return {
      internal: {
        available: true,
        companies: this.companies.length
      },
      external: {
        prowess: "API integration planned - Coming Soon",
        capitaline: "API integration planned - Coming Soon"
      }
    };
  }

  /**
   * Get companies by industry
   */
  getCompaniesByIndustry(industry: string): ComparableCompany[] {
    return this.companies.filter(c =>
      c.industry.toLowerCase().includes(industry.toLowerCase()) ||
      c.subIndustry.toLowerCase().includes(industry.toLowerCase())
    );
  }

  /**
   * Get industry benchmark data
   */
  getIndustryBenchmark(industryKey: string): typeof INDUSTRY_BENCHMARKS[keyof typeof INDUSTRY_BENCHMARKS] | null {
    return INDUSTRY_BENCHMARKS[industryKey] || null;
  }

  /**
   * Get all industry benchmarks
   */
  getAllIndustryBenchmarks(): typeof INDUSTRY_BENCHMARKS {
    return INDUSTRY_BENCHMARKS;
  }

  /**
   * Search by text (name, description, NIC code)
   */
  searchByText(query: string, limit: number = 20): ComparableCompany[] {
    const queryLower = query.toLowerCase();
    return this.companies
      .filter(c =>
        c.name.toLowerCase().includes(queryLower) ||
        c.nicDescription.toLowerCase().includes(queryLower) ||
        c.nicCode.includes(query) ||
        c.industry.toLowerCase().includes(queryLower) ||
        c.subIndustry.toLowerCase().includes(queryLower)
      )
      .slice(0, limit);
  }

  /**
   * Get PLI statistics for a set of companies
   */
  getPLIStatistics(companies: ComparableCompany[], pliType: PLIType, year?: string): {
    count: number;
    values: number[];
    min: number;
    max: number;
    mean: number;
    median: number;
    q1: number;
    q3: number;
    stdDev: number;
  } {
    const values = companies
      .flatMap(c => c.plis)
      .filter(p => p.pliType === pliType && (!year || p.year === year))
      .map(p => p.value)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return { count: 0, values: [], min: 0, max: 0, mean: 0, median: 0, q1: 0, q3: 0, stdDev: 0 };
    }

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const median = values[Math.floor(values.length / 2)];
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      count: values.length,
      values,
      min: values[0],
      max: values[values.length - 1],
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      q1: Math.round(q1 * 100) / 100,
      q3: Math.round(q3 * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100
    };
  }

  /**
   * Get comparable selection for Form 3CEB reporting
   */
  getForm3CEBComparables(
    transactionNature: string,
    testedPartyProfile: FunctionalProfile,
    revenueRange: { min?: number; max?: number }
  ): {
    comparables: ComparableCompany[];
    searchCriteria: ComparableSearchCriteria;
    pliType: PLIType;
    armLengthRange: { lower: number; upper: number; median: number };
    summary: string;
  } {
    const pliType = getRecommendedPLI(testedPartyProfile);

    const searchCriteria: ComparableSearchCriteria = {
      functionalProfile: testedPartyProfile,
      revenueMin: revenueRange.min,
      revenueMax: revenueRange.max,
      excludeRelatedPartyAbove: 25,
      excludePersistentLosses: true,
      minYearsData: 3,
      status: ["ACTIVE"]
    };

    let comparables = this.companies.filter(c => {
      const matchProfile = c.functionalProfile === testedPartyProfile;
      const matchRevenue = (!revenueRange.min || c.financials[0].revenue >= revenueRange.min) &&
                          (!revenueRange.max || c.financials[0].revenue <= revenueRange.max);
      const matchRPT = c.relatedPartyPercent <= 25;
      const matchLoss = !c.hasPersistentLosses;
      const matchYears = c.yearsOfData >= 3;
      return matchProfile && matchRevenue && matchRPT && matchLoss && matchYears;
    });

    // If too few with exact profile, expand to similar profiles
    if (comparables.length < 5) {
      const similarProfiles = this.getSimilarProfiles(testedPartyProfile);
      comparables = this.companies.filter(c => {
        const matchProfile = similarProfiles.includes(c.functionalProfile);
        const matchRevenue = (!revenueRange.min || c.financials[0].revenue >= revenueRange.min) &&
                            (!revenueRange.max || c.financials[0].revenue <= revenueRange.max);
        const matchRPT = c.relatedPartyPercent <= 25;
        const matchLoss = !c.hasPersistentLosses;
        return matchProfile && matchRevenue && matchRPT && matchLoss;
      });
    }

    const stats = this.getPLIStatistics(comparables, pliType, "2023-24");

    return {
      comparables,
      searchCriteria,
      pliType,
      armLengthRange: {
        lower: stats.q1,
        upper: stats.q3,
        median: stats.median
      },
      summary: `Found ${comparables.length} comparable companies for ${testedPartyProfile}. ` +
               `Arm's length range (${pliType}): ${stats.q1.toFixed(2)}% to ${stats.q3.toFixed(2)}% (median: ${stats.median.toFixed(2)}%).`
    };
  }

  /**
   * Get similar functional profiles for expanded search
   */
  private getSimilarProfiles(profile: FunctionalProfile): FunctionalProfile[] {
    const profileGroups: Record<string, FunctionalProfile[]> = {
      "IT_SERVICES_GROUP": ["IT_SERVICES", "SERVICE_PROVIDER_FULL", "SERVICE_PROVIDER_CONTRACT"],
      "ITES_GROUP": ["ITES_BPO", "KPO", "SERVICE_PROVIDER_CONTRACT"],
      "MANUFACTURING_GROUP": ["MANUFACTURER_FULL_FLEDGED", "MANUFACTURER_CONTRACT", "MANUFACTURER_TOLL"],
      "DISTRIBUTION_GROUP": ["DISTRIBUTOR_FULL_FLEDGED", "DISTRIBUTOR_LIMITED_RISK", "DISTRIBUTOR_COMMISSIONAIRE"],
      "RND_GROUP": ["R_AND_D_FULL", "R_AND_D_CONTRACT"]
    };

    for (const group of Object.values(profileGroups)) {
      if (group.includes(profile)) {
        return group;
      }
    }
    return [profile];
  }

  /**
   * Validate company data quality
   */
  validateCompanyData(company: ComparableCompany): {
    isValid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check financial data completeness
    if (company.financials.length < 3) {
      issues.push(`Only ${company.financials.length} years of data available`);
      score -= 15;
      recommendations.push("Obtain additional years of financial data");
    }

    // Check for zero or negative values
    for (const fin of company.financials) {
      if (fin.revenue <= 0) {
        issues.push(`Zero/negative revenue in ${fin.year}`);
        score -= 10;
      }
      if (fin.totalAssets <= 0) {
        issues.push(`Zero/negative assets in ${fin.year}`);
        score -= 5;
      }
    }

    // Check related party transactions
    if (company.relatedPartyPercent > 15) {
      issues.push(`Related party transactions at ${company.relatedPartyPercent}% may affect comparability`);
      score -= 5;
    }
    if (company.relatedPartyPercent > 25) {
      issues.push(`Related party transactions exceed 25% threshold`);
      score -= 20;
      recommendations.push("Consider excluding from comparable set or making adjustments");
    }

    // Check for persistent losses
    if (company.hasPersistentLosses) {
      issues.push(`Company has persistent losses (${company.lossYears} years)`);
      score -= 15;
      recommendations.push("Exclude from comparable set per OECD Guidelines Para 3.64");
    }

    // Check for extraordinary items
    if (company.hasExtraordinaryItems) {
      issues.push("Company has extraordinary items that may distort margins");
      score -= 10;
      recommendations.push("Consider making adjustments for extraordinary items");
    }

    score = Math.max(0, Math.min(100, score));

    return {
      isValid: score >= 60 && !company.hasPersistentLosses && company.relatedPartyPercent <= 25,
      score,
      issues,
      recommendations
    };
  }

  /**
   * Get database statistics
   */
  getDatabaseStats(): {
    totalCompanies: number;
    byIndustry: Record<string, number>;
    byFunctionalProfile: Record<string, number>;
    byStatus: Record<string, number>;
    averageDataQuality: number;
    companiesWithFullData: number;
  } {
    const byIndustry: Record<string, number> = {};
    const byFunctionalProfile: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalQuality = 0;
    let fullDataCount = 0;

    for (const company of this.companies) {
      byIndustry[company.industry] = (byIndustry[company.industry] || 0) + 1;
      byFunctionalProfile[company.functionalProfile] = (byFunctionalProfile[company.functionalProfile] || 0) + 1;
      byStatus[company.status] = (byStatus[company.status] || 0) + 1;
      totalQuality += company.dataQualityScore;
      if (company.yearsOfData >= 3) fullDataCount++;
    }

    return {
      totalCompanies: this.companies.length,
      byIndustry,
      byFunctionalProfile,
      byStatus,
      averageDataQuality: Math.round(totalQuality / this.companies.length),
      companiesWithFullData: fullDataCount
    };
  }

  private calculateFinancialSimilarity(f1: CompanyFinancials, f2: CompanyFinancials): number {
    const revRatio = Math.min(f1.revenue, f2.revenue) / Math.max(f1.revenue, f2.revenue);
    const assetRatio = Math.min(f1.totalAssets, f2.totalAssets) / Math.max(f1.totalAssets, f2.totalAssets);
    const empCostRatio1 = f1.employeeCost / f1.revenue;
    const empCostRatio2 = f2.employeeCost / f2.revenue;
    const empRatioSimilarity = 1 - Math.abs(empCostRatio1 - empCostRatio2);

    return Math.round((revRatio * 0.4 + assetRatio * 0.3 + empRatioSimilarity * 0.3) * 100);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createComparableSearchEngine(): ComparableSearchEngine {
  return new ComparableSearchEngine();
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

// Note: calculatePLIs and getRecommendedPLI are already exported inline
export { getRecommendedPLI as getPLIRecommendation };

export function getFunctionalProfiles(): FunctionalProfile[] {
  return [
    "IT_SERVICES", "ITES_BPO", "KPO",
    "MANUFACTURER_FULL_FLEDGED", "MANUFACTURER_CONTRACT", "MANUFACTURER_TOLL",
    "DISTRIBUTOR_FULL_FLEDGED", "DISTRIBUTOR_LIMITED_RISK", "DISTRIBUTOR_COMMISSIONAIRE",
    "SERVICE_PROVIDER_FULL", "SERVICE_PROVIDER_CONTRACT",
    "R_AND_D_FULL", "R_AND_D_CONTRACT",
    "HOLDING_COMPANY", "FINANCING"
  ];
}

// =============================================================================
// VERSION INFO
// =============================================================================

export const COMPARABLE_ENGINE_VERSION = {
  version: "2.0.0",
  lastUpdated: "2025-01-29",
  features: [
    "FAR Analysis Engine with similarity scoring",
    "Statistical benchmarking (quartiles, IQR, percentiles)",
    "Automated working capital adjustments",
    "Multi-dimensional comparability scoring",
    "Rejection matrix with regulatory basis",
    "Weighted average PLI calculation (3-year)",
    "Outlier detection using IQR method",
    "Comprehensive arm's length range analysis"
  ],
  dataSource: "Internal comparable database",
  externalIntegrations: {
    prowess: "Planned",
    capitaline: "Planned",
    mca: "Planned"
  }
};
