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
  }
];

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
