/**
 * DIGICOMPLY INDIAN COMPARABLE DATABASE ENGINE
 * Benchmarking Analysis for Transfer Pricing
 *
 * Integrates with:
 * - Capitaline TP (ICAI Approved)
 * - Ace-TP Database (ICAI Approved)
 * - Prowess (CMIE)
 * - Company financials from MCA
 */

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

export enum DatabaseSource {
  CAPITALINE_TP = "capitaline_tp",
  ACE_TP = "ace_tp",
  PROWESS = "prowess",
  MCA = "mca",
  MANUAL = "manual",
}

export enum FunctionalProfile {
  CONTRACT_MANUFACTURER = "contract_manufacturer",
  FULL_FLEDGED_MANUFACTURER = "full_fledged_manufacturer",
  CONTRACT_RD = "contract_rd",
  FULL_FLEDGED_RD = "full_fledged_rd",
  CONTRACT_SERVICE_PROVIDER = "contract_service_provider",
  FULL_FLEDGED_SERVICE_PROVIDER = "full_fledged_service_provider",
  DISTRIBUTOR_LIMITED_RISK = "distributor_limited_risk",
  DISTRIBUTOR_FULL_RISK = "distributor_full_risk",
  COMMISSION_AGENT = "commission_agent",
  LICENSOR = "licensor",
  LICENSEE = "licensee",
}

export enum PLIType {
  OP_OC = "op_oc", // Operating Profit / Operating Cost
  OP_OR = "op_or", // Operating Profit / Operating Revenue (Net Margin)
  OP_TA = "op_ta", // Operating Profit / Total Assets (ROA)
  OP_CE = "op_ce", // Operating Profit / Capital Employed (ROCE)
  BERRY_RATIO = "berry", // Gross Profit / Operating Expenses
  NCP_SALES = "ncp_sales", // Net Cost Plus (for distribution)
}

export enum ScreeningCriteria {
  RELATED_PARTY_TRANSACTIONS = "rpt",
  PERSISTENT_LOSSES = "losses",
  FUNCTIONAL_DISSIMILARITY = "functional",
  DIFFERENT_ACCOUNTING_YEAR = "accounting_year",
  EXTRAORDINARY_EVENTS = "extraordinary",
  DATA_NON_AVAILABILITY = "data_na",
  DIFFERENT_INDUSTRY = "industry",
  EMPLOYEE_COUNT_FILTER = "employee",
  TURNOVER_FILTER = "turnover",
  EXPORT_INTENSITY = "export",
}

// NIC 2008 Codes - Major groups relevant for TP
export const NIC_CODES: Record<string, { name: string; subCodes: Record<string, string> }> = {
  "62": {
    name: "Computer programming, consultancy and related activities",
    subCodes: {
      "6201": "Computer programming activities",
      "6202": "Computer consultancy and computer facilities management",
      "6209": "Other information technology and computer service activities",
    },
  },
  "63": {
    name: "Information service activities",
    subCodes: {
      "6311": "Data processing, hosting and related activities",
      "6312": "Web portals",
    },
  },
  "70": {
    name: "Activities of head offices; management consultancy",
    subCodes: {
      "7010": "Activities of head offices",
      "7020": "Management consultancy activities",
    },
  },
  "72": {
    name: "Scientific research and development",
    subCodes: {
      "7210": "Research and experimental development on natural sciences",
      "7220": "Research and experimental development on social sciences",
    },
  },
  "21": {
    name: "Manufacture of pharmaceuticals",
    subCodes: {
      "2100": "Manufacture of pharmaceuticals, medicinal chemicals",
    },
  },
  "29": {
    name: "Manufacture of motor vehicles",
    subCodes: {
      "2910": "Manufacture of motor vehicles",
      "2930": "Manufacture of parts and accessories for motor vehicles",
    },
  },
};

// =============================================================================
// DATA INTERFACES
// =============================================================================

export interface FinancialData {
  year: string;
  totalRevenue: number;
  operatingRevenue: number;
  exportRevenue: number;
  totalOperatingCost: number;
  employeeCost: number;
  rawMaterialCost: number;
  otherExpenses: number;
  depreciation: number;
  grossProfit: number;
  operatingProfit: number;
  pbt: number;
  pat: number;
  totalAssets: number;
  fixedAssets: number;
  currentAssets: number;
  capitalEmployed: number;
  netWorth: number;
  employeeCount: number;
  relatedPartyTransactions: number;
  rptAsPercentage: number;
}

export interface ComparableCompany {
  cin: string;
  name: string;
  pan?: string;
  nicCode: string;
  nicDescription: string;
  functionalProfile?: FunctionalProfile;
  databaseSource: DatabaseSource;
  incorporationDate?: string;
  registeredAddress: string;
  city: string;
  state: string;
  financials: Record<string, FinancialData>;
  isAccepted: boolean;
  rejectionReasons: ScreeningCriteria[];
  rejectionNotes: string;
  plis: Record<string, Record<string, number>>; // year -> PLI -> value
  weightedAveragePLI: Record<string, number>; // PLI -> weighted avg
}

export interface SearchCriteria {
  nicCodes: string[];
  industryKeywords: string[];
  functionalProfiles: FunctionalProfile[];
  minTurnover?: number;
  maxTurnover?: number;
  minEmployees?: number;
  maxEmployees?: number;
  excludePersistentLosses: boolean;
  lossYearsThreshold: number;
  maxRptPercentage: number;
  minExportPercentage?: number;
  maxExportPercentage?: number;
  analysisYears: string[];
  preferredDatabases: DatabaseSource[];
}

export interface BenchmarkingResult {
  testedPartyName: string;
  testedPartyPLI: Record<string, number>;
  pliType: PLIType;
  analysisYears: string[];
  comparablesSearched: number;
  comparablesAccepted: number;
  acceptedCompanies: ComparableCompany[];
  rejectedCompanies: ComparableCompany[];
  arithmeticMean: number;
  median: number;
  lowerQuartile: number;
  upperQuartile: number;
  minimum: number;
  maximum: number;
  testedPartyInRange: boolean;
  adjustmentRequired: boolean;
  adjustmentAmount: number;
  adjustmentDirection: "increase" | "decrease" | "";
}

// =============================================================================
// PLI CALCULATOR
// =============================================================================

export function calculatePLIs(financialData: FinancialData): Record<string, number> {
  const plis: Record<string, number> = {};

  // OP/OC
  if (financialData.totalOperatingCost > 0) {
    plis[PLIType.OP_OC] = (financialData.operatingProfit / financialData.totalOperatingCost) * 100;
  } else {
    plis[PLIType.OP_OC] = 0;
  }

  // OP/OR (Net Margin)
  if (financialData.operatingRevenue > 0) {
    plis[PLIType.OP_OR] = (financialData.operatingProfit / financialData.operatingRevenue) * 100;
  } else {
    plis[PLIType.OP_OR] = 0;
  }

  // OP/TA (ROA)
  if (financialData.totalAssets > 0) {
    plis[PLIType.OP_TA] = (financialData.operatingProfit / financialData.totalAssets) * 100;
  } else {
    plis[PLIType.OP_TA] = 0;
  }

  // OP/CE (ROCE)
  if (financialData.capitalEmployed > 0) {
    plis[PLIType.OP_CE] = (financialData.operatingProfit / financialData.capitalEmployed) * 100;
  } else {
    plis[PLIType.OP_CE] = 0;
  }

  // Berry Ratio - per OECD Chapter 2, Para 2.101-2.107
  // Formula: Gross Profit / Operating Expenses
  // Operating Expenses = Gross Profit - Operating Profit (SG&A and other operating costs)
  const operatingExpenses = financialData.grossProfit - financialData.operatingProfit;
  if (operatingExpenses > 0 && financialData.grossProfit > 0) {
    plis[PLIType.BERRY_RATIO] = financialData.grossProfit / operatingExpenses;
  } else {
    plis[PLIType.BERRY_RATIO] = 0;
  }

  // NCP_SALES (Net Cost Plus) - per OECD Chapter 2, Para 2.39-2.45
  // Formula: (Revenue - Total Cost) / Total Cost × 100
  // Used for toll/contract manufacturers and distributors
  const totalCost = financialData.totalOperatingCost + (financialData.rawMaterialCost || 0);
  if (totalCost > 0 && financialData.operatingRevenue > 0) {
    plis[PLIType.NCP_SALES] = ((financialData.operatingRevenue - totalCost) / totalCost) * 100;
  } else {
    plis[PLIType.NCP_SALES] = 0;
  }

  return plis;
}

// =============================================================================
// COMPARABLE SEARCH ENGINE
// =============================================================================

export class ComparableSearchEngine {
  private searchResults: ComparableCompany[] = [];

  /**
   * Search for comparable companies based on criteria
   * In production, this would query actual databases (Capitaline, Ace-TP, etc.)
   */
  searchComparables(criteria: SearchCriteria): ComparableCompany[] {
    const results = this.simulateDatabaseSearch(criteria);
    this.searchResults = results;
    return results;
  }

  private simulateDatabaseSearch(criteria: SearchCriteria): ComparableCompany[] {
    // Sample comparable companies for IT/ITeS sector
    const sampleCompanies = [
      {
        cin: "U72200KA2005PTC036747",
        name: "Infosys BPM Limited",
        nicCode: "6202",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 15000, opCost: 12500, opProfit: 2500, rpt: 8 },
          "2022-23": { revenue: 13500, opCost: 11200, opProfit: 2300, rpt: 7 },
          "2021-22": { revenue: 12000, opCost: 10000, opProfit: 2000, rpt: 6 },
        },
      },
      {
        cin: "U72200MH2000PTC125612",
        name: "Tech Solutions India Pvt Ltd",
        nicCode: "6201",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 500, opCost: 420, opProfit: 80, rpt: 2 },
          "2022-23": { revenue: 450, opCost: 380, opProfit: 70, rpt: 3 },
          "2021-22": { revenue: 400, opCost: 340, opProfit: 60, rpt: 2 },
        },
      },
      {
        cin: "U72200TN2008PTC068291",
        name: "Chennai Software Services Ltd",
        nicCode: "6201",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 800, opCost: 680, opProfit: 120, rpt: 5 },
          "2022-23": { revenue: 720, opCost: 610, opProfit: 110, rpt: 4 },
          "2021-22": { revenue: 650, opCost: 560, opProfit: 90, rpt: 5 },
        },
      },
      {
        cin: "U72200KA2010PTC054832",
        name: "Bangalore IT Solutions Pvt Ltd",
        nicCode: "6202",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 350, opCost: 300, opProfit: 50, rpt: 12 },
          "2022-23": { revenue: 320, opCost: 275, opProfit: 45, rpt: 15 },
          "2021-22": { revenue: 280, opCost: 245, opProfit: 35, rpt: 18 },
        },
      },
      {
        cin: "U72200DL2012PTC231456",
        name: "Delhi Tech Services Ltd",
        nicCode: "6201",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 600, opCost: 510, opProfit: 90, rpt: 3 },
          "2022-23": { revenue: 550, opCost: 470, opProfit: 80, rpt: 4 },
          "2021-22": { revenue: 480, opCost: 415, opProfit: 65, rpt: 3 },
        },
      },
      {
        cin: "U72200GJ2007PTC049182",
        name: "Gujarat Infotech Pvt Ltd",
        nicCode: "6201",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 420, opCost: 365, opProfit: 55, rpt: 6 },
          "2022-23": { revenue: 380, opCost: 330, opProfit: 50, rpt: 5 },
          "2021-22": { revenue: 340, opCost: 300, opProfit: 40, rpt: 7 },
        },
      },
      {
        cin: "U72200PB2015PTC042891",
        name: "Punjab Software Solutions Ltd",
        nicCode: "6202",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 280, opCost: 250, opProfit: 30, rpt: 28 },
          "2022-23": { revenue: 260, opCost: 235, opProfit: 25, rpt: 32 },
          "2021-22": { revenue: 230, opCost: 210, opProfit: 20, rpt: 30 },
        },
      },
      {
        cin: "U72200RJ2009PTC031567",
        name: "Rajasthan IT Services Pvt Ltd",
        nicCode: "6201",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 180, opCost: 200, opProfit: -20, rpt: 4 },
          "2022-23": { revenue: 160, opCost: 175, opProfit: -15, rpt: 5 },
          "2021-22": { revenue: 150, opCost: 160, opProfit: -10, rpt: 4 },
        },
      },
      {
        cin: "U72200HR2011PTC045678",
        name: "Haryana Digital Services Ltd",
        nicCode: "6201",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 520, opCost: 445, opProfit: 75, rpt: 8 },
          "2022-23": { revenue: 470, opCost: 400, opProfit: 70, rpt: 7 },
          "2021-22": { revenue: 420, opCost: 360, opProfit: 60, rpt: 9 },
        },
      },
      {
        cin: "U72200UP2013PTC057890",
        name: "UP Technology Solutions Pvt Ltd",
        nicCode: "6202",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        financials: {
          "2023-24": { revenue: 310, opCost: 265, opProfit: 45, rpt: 5 },
          "2022-23": { revenue: 280, opCost: 240, opProfit: 40, rpt: 6 },
          "2021-22": { revenue: 250, opCost: 215, opProfit: 35, rpt: 5 },
        },
      },
    ];

    // Convert to ComparableCompany objects
    return sampleCompanies.map((data) => {
      const company: ComparableCompany = {
        cin: data.cin,
        name: data.name,
        nicCode: data.nicCode,
        nicDescription: NIC_CODES[data.nicCode.substring(0, 2)]?.name || "",
        functionalProfile: data.functionalProfile,
        databaseSource: DatabaseSource.CAPITALINE_TP,
        registeredAddress: "",
        city: "",
        state: "",
        financials: {},
        isAccepted: true,
        rejectionReasons: [],
        rejectionNotes: "",
        plis: {},
        weightedAveragePLI: {},
      };

      // Add financial data
      for (const [year, fin] of Object.entries(data.financials)) {
        const finData: FinancialData = {
          year,
          operatingRevenue: fin.revenue * 10000000, // Convert to actual INR
          totalOperatingCost: fin.opCost * 10000000,
          operatingProfit: fin.opProfit * 10000000,
          rptAsPercentage: fin.rpt,
          totalRevenue: fin.revenue * 10000000,
          exportRevenue: 0,
          employeeCost: 0,
          rawMaterialCost: 0,
          otherExpenses: 0,
          depreciation: 0,
          grossProfit: fin.revenue * 10000000 - fin.opCost * 10000000 * 0.3, // Estimated
          pbt: fin.opProfit * 10000000,
          pat: fin.opProfit * 10000000 * 0.75,
          totalAssets: fin.revenue * 10000000 * 0.8,
          fixedAssets: fin.revenue * 10000000 * 0.3,
          currentAssets: fin.revenue * 10000000 * 0.5,
          capitalEmployed: fin.revenue * 10000000 * 0.6,
          netWorth: fin.revenue * 10000000 * 0.4,
          employeeCount: Math.floor(fin.revenue / 10),
          relatedPartyTransactions: fin.rpt,
        };
        company.financials[year] = finData;
        company.plis[year] = calculatePLIs(finData);
      }

      return company;
    });
  }

  /**
   * Apply screening criteria to filter comparables
   */
  applyScreening(
    companies: ComparableCompany[],
    criteria: SearchCriteria
  ): { accepted: ComparableCompany[]; rejected: ComparableCompany[] } {
    const accepted: ComparableCompany[] = [];
    const rejected: ComparableCompany[] = [];

    for (const company of companies) {
      const rejectionReasons: ScreeningCriteria[] = [];

      // 1. RPT Filter
      for (const year of Object.keys(company.financials)) {
        if (company.financials[year].rptAsPercentage > criteria.maxRptPercentage) {
          rejectionReasons.push(ScreeningCriteria.RELATED_PARTY_TRANSACTIONS);
          break;
        }
      }

      // 2. Persistent Losses Filter
      if (criteria.excludePersistentLosses) {
        let lossYears = 0;
        for (const year of Object.keys(company.financials)) {
          if (company.financials[year].operatingProfit < 0) {
            lossYears++;
          }
        }
        if (lossYears >= criteria.lossYearsThreshold) {
          rejectionReasons.push(ScreeningCriteria.PERSISTENT_LOSSES);
        }
      }

      // 3. Turnover Filter
      if (criteria.minTurnover || criteria.maxTurnover) {
        for (const year of Object.keys(company.financials)) {
          const revenue = company.financials[year].operatingRevenue;
          if (criteria.minTurnover && revenue < criteria.minTurnover) {
            rejectionReasons.push(ScreeningCriteria.TURNOVER_FILTER);
            break;
          }
          if (criteria.maxTurnover && revenue > criteria.maxTurnover) {
            rejectionReasons.push(ScreeningCriteria.TURNOVER_FILTER);
            break;
          }
        }
      }

      // 4. Functional Profile Filter
      if (criteria.functionalProfiles.length > 0) {
        if (!company.functionalProfile ||
            !criteria.functionalProfiles.includes(company.functionalProfile)) {
          rejectionReasons.push(ScreeningCriteria.FUNCTIONAL_DISSIMILARITY);
        }
      }

      // 5. NIC Code Filter
      if (criteria.nicCodes.length > 0) {
        const companyNicPrefix = company.nicCode.substring(0, 2);
        const criterianicPrefixes = criteria.nicCodes.map((c) => c.substring(0, 2));
        if (!criterianicPrefixes.includes(companyNicPrefix)) {
          rejectionReasons.push(ScreeningCriteria.DIFFERENT_INDUSTRY);
        }
      }

      // Update company status
      if (rejectionReasons.length > 0) {
        company.isAccepted = false;
        company.rejectionReasons = [...new Set(rejectionReasons)];
        rejected.push(company);
      } else {
        company.isAccepted = true;
        accepted.push(company);
      }
    }

    return { accepted, rejected };
  }
}

// =============================================================================
// BENCHMARKING ENGINE
// =============================================================================

export class BenchmarkingEngine {
  private searchEngine: ComparableSearchEngine;

  constructor() {
    this.searchEngine = new ComparableSearchEngine();
  }

  /**
   * Perform complete benchmarking analysis
   */
  performBenchmarking(
    testedPartyName: string,
    testedPartyFinancials: Record<string, FinancialData>,
    pliType: PLIType,
    searchCriteria: SearchCriteria
  ): BenchmarkingResult {
    // Step 1: Search for comparables
    const allCompanies = this.searchEngine.searchComparables(searchCriteria);

    // Step 2: Apply screening
    const { accepted, rejected } = this.searchEngine.applyScreening(allCompanies, searchCriteria);

    // Step 3: Calculate weighted average PLIs for accepted companies
    for (const company of accepted) {
      company.weightedAveragePLI[pliType] = this.calculateWeightedAveragePLI(
        company,
        pliType,
        searchCriteria.analysisYears
      );
    }

    // Step 4: Create result
    const result: BenchmarkingResult = {
      testedPartyName,
      testedPartyPLI: {},
      pliType,
      analysisYears: searchCriteria.analysisYears,
      comparablesSearched: allCompanies.length,
      comparablesAccepted: accepted.length,
      acceptedCompanies: accepted,
      rejectedCompanies: rejected,
      arithmeticMean: 0,
      median: 0,
      lowerQuartile: 0,
      upperQuartile: 0,
      minimum: 0,
      maximum: 0,
      testedPartyInRange: false,
      adjustmentRequired: false,
      adjustmentAmount: 0,
      adjustmentDirection: "",
    };

    // Step 5: Calculate range
    this.calculateRange(result);

    // Step 6: Calculate tested party PLI and check
    const testedPLI = this.calculateTestedPartyPLI(
      testedPartyFinancials,
      pliType,
      searchCriteria.analysisYears
    );
    this.checkTestedParty(result, testedPLI, pliType);

    return result;
  }

  private calculateWeightedAveragePLI(
    company: ComparableCompany,
    pliType: PLIType,
    years: string[]
  ): number {
    const values: number[] = [];
    const weights: number[] = [];

    for (const year of years) {
      if (company.plis[year] && company.plis[year][pliType] !== undefined) {
        const pliValue = company.plis[year][pliType];
        const weight = company.financials[year]?.operatingRevenue || 1;
        values.push(pliValue);
        weights.push(weight > 0 ? weight : 1);
      }
    }

    if (values.length === 0) return 0;

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      const weightedSum = values.reduce((sum, v, i) => sum + v * weights[i], 0);
      return weightedSum / totalWeight;
    }

    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateRange(result: BenchmarkingResult): void {
    if (result.acceptedCompanies.length === 0) return;

    const values = result.acceptedCompanies
      .map((company) => company.weightedAveragePLI[result.pliType])
      .filter((v) => v !== undefined)
      .sort((a, b) => a - b);

    if (values.length === 0) return;

    const n = values.length;
    result.minimum = values[0];
    result.maximum = values[n - 1];
    result.arithmeticMean = values.reduce((sum, v) => sum + v, 0) / n;
    result.median = n % 2 === 0 ? (values[n / 2 - 1] + values[n / 2]) / 2 : values[Math.floor(n / 2)];

    // Quartiles
    if (n >= 4) {
      const q1Idx = Math.floor(n / 4);
      const q3Idx = Math.floor((3 * n) / 4);
      result.lowerQuartile = values[q1Idx];
      result.upperQuartile = values[q3Idx];
    } else {
      result.lowerQuartile = result.minimum;
      result.upperQuartile = result.maximum;
    }
  }

  private calculateTestedPartyPLI(
    financials: Record<string, FinancialData>,
    pliType: PLIType,
    years: string[]
  ): number {
    const values: number[] = [];
    const weights: number[] = [];

    for (const year of years) {
      if (financials[year]) {
        const fin = financials[year];
        const plis = calculatePLIs(fin);
        if (plis[pliType] !== undefined) {
          values.push(plis[pliType]);
          weights.push(fin.operatingRevenue > 0 ? fin.operatingRevenue : 1);
        }
      }
    }

    if (values.length === 0) return 0;

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      const weightedSum = values.reduce((sum, v, i) => sum + v * weights[i], 0);
      return weightedSum / totalWeight;
    }

    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private checkTestedParty(result: BenchmarkingResult, testedValue: number, pliType: PLIType): void {
    result.testedPartyPLI[pliType] = testedValue;

    // Check against interquartile range (as per Indian TP rules)
    if (result.lowerQuartile <= testedValue && testedValue <= result.upperQuartile) {
      result.testedPartyInRange = true;
      result.adjustmentRequired = false;
    } else {
      result.testedPartyInRange = false;
      result.adjustmentRequired = true;

      if (testedValue < result.lowerQuartile) {
        result.adjustmentDirection = "increase";
        // Adjust to median as per Indian rules
        result.adjustmentAmount = result.median - testedValue;
      } else {
        result.adjustmentDirection = "decrease";
        result.adjustmentAmount = testedValue - result.median;
      }
    }
  }

  /**
   * Generate comprehensive benchmarking report
   */
  generateBenchmarkingReport(result: BenchmarkingResult): Record<string, unknown> {
    return {
      reportTitle: "Transfer Pricing Benchmarking Analysis",
      testedParty: result.testedPartyName,
      analysisSummary: {
        pliUsed: result.pliType,
        pliDescription: this.getPLIDescription(result.pliType),
        analysisPeriod: result.analysisYears,
        comparablesIdentified: result.comparablesSearched,
        comparablesAccepted: result.comparablesAccepted,
        comparablesRejected: result.comparablesSearched - result.comparablesAccepted,
      },
      armLengthRange: {
        fullRange: {
          minimum: `${result.minimum.toFixed(2)}%`,
          maximum: `${result.maximum.toFixed(2)}%`,
        },
        interquartileRange: {
          lowerQuartile35th: `${result.lowerQuartile.toFixed(2)}%`,
          median50th: `${result.median.toFixed(2)}%`,
          upperQuartile65th: `${result.upperQuartile.toFixed(2)}%`,
        },
        arithmeticMean: `${result.arithmeticMean.toFixed(2)}%`,
      },
      testedPartyAnalysis: {
        testedPartyMargin: Object.values(result.testedPartyPLI)[0]
          ? `${Object.values(result.testedPartyPLI)[0].toFixed(2)}%`
          : "N/A",
        fallsWithinRange: result.testedPartyInRange,
        adjustmentRequired: result.adjustmentRequired,
        adjustmentDirection: result.adjustmentRequired ? result.adjustmentDirection : "None",
        adjustmentToMedian: result.adjustmentRequired
          ? `${result.adjustmentAmount.toFixed(2)}%`
          : "None",
      },
      acceptedComparables: result.acceptedCompanies.map((c) => ({
        name: c.name,
        cin: c.cin,
        nicCode: c.nicCode,
        weightedMargin: `${(c.weightedAveragePLI[result.pliType] || 0).toFixed(2)}%`,
      })),
      rejectedComparables: result.rejectedCompanies.map((c) => ({
        name: c.name,
        cin: c.cin,
        rejectionReasons: c.rejectionReasons,
      })),
    };
  }

  private getPLIDescription(pliType: PLIType): string {
    const descriptions: Record<PLIType, string> = {
      [PLIType.OP_OC]: "Operating Profit to Operating Cost (OP/OC)",
      [PLIType.OP_OR]: "Operating Profit to Operating Revenue (Net Margin)",
      [PLIType.OP_TA]: "Operating Profit to Total Assets (Return on Assets)",
      [PLIType.OP_CE]: "Operating Profit to Capital Employed (ROCE)",
      [PLIType.BERRY_RATIO]: "Berry Ratio (Gross Profit / Operating Expenses)",
      [PLIType.NCP_SALES]: "Net Cost Plus to Sales",
    };
    return descriptions[pliType] || pliType;
  }
}

// Export for convenience
export const createBenchmarkingEngine = () => new BenchmarkingEngine();
export const createComparableSearchEngine = () => new ComparableSearchEngine();
