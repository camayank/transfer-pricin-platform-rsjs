import { NextRequest, NextResponse } from "next/server";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";
import {
  BenchmarkingEngine,
  PLIType,
  FunctionalProfile,
  NIC_CODES,
  type SearchCriteria,
  type BenchmarkingFinancialData as FinancialData,
} from "@/lib/engines";

interface Comparable {
  id: string;
  name: string;
  cin?: string;
  country: string;
  industry: string;
  nicCode: string;
  turnover: number;
  operatingProfit: number;
  operatingCost: number;
  totalAssets: number;
  employees: number;
  opMargin: number;
  opCostMargin: number;
  roce: number;
  selected: boolean;
}

interface BenchmarkingRequest {
  comparables?: Comparable[];
  testedPartyMargin?: number;
  pliType: "OP/OC" | "OP/OR" | "ROCE" | "Berry Ratio" | "OP/TA" | "OP/CE";
  testedPartyName?: string;
  testedPartyFinancials?: {
    year: string;
    operatingRevenue: number;
    totalOperatingCost: number;
    operatingProfit: number;
    totalAssets?: number;
    capitalEmployed?: number;
  }[];
  searchCriteria?: {
    nicCodes?: string[];
    functionalProfiles?: string[];
    maxRptPercentage?: number;
    analysisYears?: string[];
  };
}

interface StatisticalRange {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  interquartileRange: number;
}

function calculateStatisticalRange(values: number[]): StatisticalRange {
  if (values.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      mean: 0,
      interquartileRange: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const getPercentile = (arr: number[], p: number): number => {
    const index = (p / 100) * (arr.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (upper >= arr.length) return arr[arr.length - 1];
    if (lower < 0) return arr[0];

    return arr[lower] * (1 - weight) + arr[upper] * weight;
  };

  const min = sorted[0];
  const max = sorted[n - 1];
  const q1 = getPercentile(sorted, 25);
  const median = getPercentile(sorted, 50);
  const q3 = getPercentile(sorted, 75);
  const mean = sorted.reduce((sum, v) => sum + v, 0) / n;

  return {
    min: Math.round(min * 100) / 100,
    q1: Math.round(q1 * 100) / 100,
    median: Math.round(median * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    max: Math.round(max * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    interquartileRange: Math.round((q3 - q1) * 100) / 100,
  };
}

function determineArmLengthCompliance(
  testedPartyMargin: number,
  range: StatisticalRange
): {
  compliant: boolean;
  position: "below" | "within" | "above";
  adjustmentRequired: number;
  explanation: string;
} {
  if (testedPartyMargin < range.q1) {
    const adjustmentRequired = range.median - testedPartyMargin;
    return {
      compliant: false,
      position: "below",
      adjustmentRequired: Math.round(adjustmentRequired * 100) / 100,
      explanation: `Tested party margin of ${testedPartyMargin.toFixed(2)}% is below the interquartile range (${range.q1.toFixed(2)}% - ${range.q3.toFixed(2)}%). An adjustment to the median of ${range.median.toFixed(2)}% may be required.`,
    };
  }

  if (testedPartyMargin > range.q3) {
    return {
      compliant: true,
      position: "above",
      adjustmentRequired: 0,
      explanation: `Tested party margin of ${testedPartyMargin.toFixed(2)}% is above the interquartile range but still arm's length. No adjustment required.`,
    };
  }

  return {
    compliant: true,
    position: "within",
    adjustmentRequired: 0,
    explanation: `Tested party margin of ${testedPartyMargin.toFixed(2)}% falls within the interquartile range (${range.q1.toFixed(2)}% - ${range.q3.toFixed(2)}%). The transaction is at arm's length.`,
  };
}

// POST /api/benchmarking - Calculate benchmarking analysis
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
    if (!authorized) return error;

    const body: BenchmarkingRequest = await request.json();
    const { comparables, testedPartyMargin, pliType, testedPartyName, testedPartyFinancials, searchCriteria } = body;

    // Map PLI type
    const pliTypeMap: Record<string, PLIType> = {
      "OP/OC": PLIType.OP_OC,
      "OP/OR": PLIType.OP_OR,
      "ROCE": PLIType.OP_CE,
      "OP/TA": PLIType.OP_TA,
      "OP/CE": PLIType.OP_CE,
      "Berry Ratio": PLIType.BERRY_RATIO,
    };

    // If using the engine for automated search
    if (testedPartyName && testedPartyFinancials && searchCriteria) {
      const engine = new BenchmarkingEngine();

      // Convert tested party financials
      const financials: Record<string, FinancialData> = {};
      for (const fin of testedPartyFinancials) {
        financials[fin.year] = {
          year: fin.year,
          totalRevenue: fin.operatingRevenue,
          operatingRevenue: fin.operatingRevenue,
          exportRevenue: 0,
          totalOperatingCost: fin.totalOperatingCost,
          employeeCost: 0,
          rawMaterialCost: 0,
          otherExpenses: 0,
          depreciation: 0,
          grossProfit: fin.operatingRevenue - fin.totalOperatingCost * 0.3,
          operatingProfit: fin.operatingProfit,
          pbt: fin.operatingProfit,
          pat: fin.operatingProfit * 0.75,
          totalAssets: fin.totalAssets || fin.operatingRevenue * 0.8,
          fixedAssets: fin.totalAssets ? fin.totalAssets * 0.4 : fin.operatingRevenue * 0.3,
          currentAssets: fin.totalAssets ? fin.totalAssets * 0.6 : fin.operatingRevenue * 0.5,
          capitalEmployed: fin.capitalEmployed || (fin.totalAssets || fin.operatingRevenue * 0.8) * 0.7,
          netWorth: fin.operatingRevenue * 0.4,
          employeeCount: 0,
          relatedPartyTransactions: 0,
          rptAsPercentage: 0,
        };
      }

      // Build search criteria
      const criteria: SearchCriteria = {
        nicCodes: searchCriteria.nicCodes || ["6201", "6202"],
        industryKeywords: [],
        functionalProfiles: (searchCriteria.functionalProfiles || []).map(
          (fp) => fp as FunctionalProfile
        ),
        excludePersistentLosses: true,
        lossYearsThreshold: 2,
        maxRptPercentage: searchCriteria.maxRptPercentage || 25,
        analysisYears: searchCriteria.analysisYears || ["2021-22", "2022-23", "2023-24"],
        preferredDatabases: [],
      };

      const result = engine.performBenchmarking(
        testedPartyName,
        financials,
        pliTypeMap[pliType] || PLIType.OP_OC,
        criteria
      );

      const report = engine.generateBenchmarkingReport(result);

      return NextResponse.json({
        analysis: {
          pliType,
          numberOfComparables: result.comparablesAccepted,
          testedPartyMargin: Object.values(result.testedPartyPLI)[0] || 0,
          statisticalRange: {
            min: result.minimum,
            q1: result.lowerQuartile,
            median: result.median,
            q3: result.upperQuartile,
            max: result.maximum,
            mean: result.arithmeticMean,
            interquartileRange: result.upperQuartile - result.lowerQuartile,
          },
          compliance: {
            compliant: result.testedPartyInRange,
            position: result.adjustmentDirection === "increase" ? "below" :
                     result.adjustmentDirection === "decrease" ? "above" : "within",
            adjustmentRequired: result.adjustmentAmount,
            explanation: result.testedPartyInRange
              ? `Tested party is within arm's length range`
              : `Adjustment of ${result.adjustmentAmount.toFixed(2)}% required to ${result.adjustmentDirection} to median`,
          },
          comparables: result.acceptedCompanies.map((c) => ({
            name: c.name,
            cin: c.cin,
            nicCode: c.nicCode,
            pliValue: c.weightedAveragePLI[pliTypeMap[pliType] || PLIType.OP_OC] || 0,
          })),
          rejectedComparables: result.rejectedCompanies.map((c) => ({
            name: c.name,
            cin: c.cin,
            rejectionReasons: c.rejectionReasons,
          })),
        },
        report,
        summary: {
          method: "Transactional Net Margin Method (TNMM)",
          pli: pliType,
          armLengthRange: `${result.lowerQuartile.toFixed(2)}% - ${result.upperQuartile.toFixed(2)}%`,
          median: `${result.median.toFixed(2)}%`,
          testedPartyResult: result.testedPartyInRange ? "At Arm's Length" : "Adjustment Required",
          adjustmentIfAny: result.adjustmentRequired ? `${result.adjustmentAmount.toFixed(2)}%` : "None",
        },
      });
    }

    // Legacy mode: Use provided comparables
    if (!comparables || comparables.length === 0) {
      return NextResponse.json(
        { error: "At least one comparable is required" },
        { status: 400 }
      );
    }

    const selectedComparables = comparables.filter((c) => c.selected);

    if (selectedComparables.length < 3) {
      return NextResponse.json(
        { error: "At least 3 comparables must be selected for reliable analysis" },
        { status: 400 }
      );
    }

    let pliValues: number[];
    switch (pliType) {
      case "OP/OC":
        pliValues = selectedComparables.map((c) => c.opCostMargin);
        break;
      case "OP/OR":
        pliValues = selectedComparables.map((c) => c.opMargin);
        break;
      case "ROCE":
      case "OP/CE":
        pliValues = selectedComparables.map((c) => c.roce);
        break;
      default:
        pliValues = selectedComparables.map((c) => c.opCostMargin);
    }

    const statisticalRange = calculateStatisticalRange(pliValues);
    const compliance = determineArmLengthCompliance(testedPartyMargin || 0, statisticalRange);

    const comparableAnalysis = selectedComparables.map((c) => {
      const pliValue = pliType === "OP/OC" ? c.opCostMargin : pliType === "OP/OR" ? c.opMargin : c.roce;
      return {
        name: c.name,
        country: c.country,
        industry: c.industry,
        pliValue: Math.round(pliValue * 100) / 100,
        turnover: c.turnover,
      };
    });

    return NextResponse.json({
      analysis: {
        pliType,
        numberOfComparables: selectedComparables.length,
        testedPartyMargin,
        statisticalRange,
        compliance,
        comparables: comparableAnalysis.sort((a, b) => a.pliValue - b.pliValue),
      },
      summary: {
        method: "Transactional Net Margin Method (TNMM)",
        pli: pliType,
        armLengthRange: `${statisticalRange.q1.toFixed(2)}% - ${statisticalRange.q3.toFixed(2)}%`,
        median: `${statisticalRange.median.toFixed(2)}%`,
        testedPartyResult: compliance.compliant ? "At Arm's Length" : "Adjustment Required",
        adjustmentIfAny: compliance.adjustmentRequired > 0 ? `${compliance.adjustmentRequired.toFixed(2)}%` : "None",
      },
    });
  } catch (error) {
    console.error("Error performing benchmarking analysis:", error);
    return NextResponse.json(
      { error: "Failed to perform benchmarking analysis" },
      { status: 500 }
    );
  }
}

// GET /api/benchmarking/comparables - Get sample comparables
export async function GET(request: NextRequest) {
  // Check authentication and permission
  const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
  if (!authorized) return error;

  const searchParams = request.nextUrl.searchParams;
  const industry = searchParams.get("industry");
  const nicCode = searchParams.get("nicCode");

  // Sample comparable companies (would come from database like Prowess/Capitaline)
  const sampleComparables: Comparable[] = [
    {
      id: "1",
      name: "Infosys BPM Ltd",
      cin: "U72200KA2005PTC036747",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 850_00_00_000,
      operatingProfit: 145_00_00_000,
      operatingCost: 705_00_00_000,
      totalAssets: 450_00_00_000,
      employees: 45000,
      opMargin: 17.06,
      opCostMargin: 20.57,
      roce: 32.22,
      selected: false,
    },
    {
      id: "2",
      name: "Wipro Technologies",
      cin: "U72200MH2000PTC125612",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 1200_00_00_000,
      operatingProfit: 180_00_00_000,
      operatingCost: 1020_00_00_000,
      totalAssets: 680_00_00_000,
      employees: 65000,
      opMargin: 15.00,
      opCostMargin: 17.65,
      roce: 26.47,
      selected: false,
    },
    {
      id: "3",
      name: "Tech Mahindra",
      cin: "U72200MH1986PLC041370",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 950_00_00_000,
      operatingProfit: 133_00_00_000,
      operatingCost: 817_00_00_000,
      totalAssets: 520_00_00_000,
      employees: 52000,
      opMargin: 14.00,
      opCostMargin: 16.28,
      roce: 25.58,
      selected: false,
    },
    {
      id: "4",
      name: "HCL Technologies",
      cin: "L74140DL1991PLC046369",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 1100_00_00_000,
      operatingProfit: 198_00_00_000,
      operatingCost: 902_00_00_000,
      totalAssets: 600_00_00_000,
      employees: 58000,
      opMargin: 18.00,
      opCostMargin: 21.95,
      roce: 33.00,
      selected: false,
    },
    {
      id: "5",
      name: "L&T Infotech",
      cin: "U72900MH1996PLC104693",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 450_00_00_000,
      operatingProfit: 81_00_00_000,
      operatingCost: 369_00_00_000,
      totalAssets: 250_00_00_000,
      employees: 22000,
      opMargin: 18.00,
      opCostMargin: 21.95,
      roce: 32.40,
      selected: false,
    },
    {
      id: "6",
      name: "Mphasis Ltd",
      cin: "L30007KA1992PLC025294",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 380_00_00_000,
      operatingProfit: 60_80_00_000,
      operatingCost: 319_20_00_000,
      totalAssets: 220_00_00_000,
      employees: 18000,
      opMargin: 16.00,
      opCostMargin: 19.05,
      roce: 27.64,
      selected: false,
    },
    {
      id: "7",
      name: "Coforge Ltd",
      cin: "L72200DL1992PLC048753",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 280_00_00_000,
      operatingProfit: 42_00_00_000,
      operatingCost: 238_00_00_000,
      totalAssets: 160_00_00_000,
      employees: 12000,
      opMargin: 15.00,
      opCostMargin: 17.65,
      roce: 26.25,
      selected: false,
    },
    {
      id: "8",
      name: "Persistent Systems",
      cin: "L72300PN1990PLC056696",
      country: "India",
      industry: "IT Services",
      nicCode: "6201",
      turnover: 220_00_00_000,
      operatingProfit: 37_40_00_000,
      operatingCost: 182_60_00_000,
      totalAssets: 130_00_00_000,
      employees: 9500,
      opMargin: 17.00,
      opCostMargin: 20.48,
      roce: 28.77,
      selected: false,
    },
  ];

  let filtered = sampleComparables;
  if (industry) {
    filtered = filtered.filter((c) =>
      c.industry.toLowerCase().includes(industry.toLowerCase())
    );
  }
  if (nicCode) {
    filtered = filtered.filter((c) => c.nicCode === nicCode);
  }

  return NextResponse.json({
    comparables: filtered,
    nicCodes: NIC_CODES,
  });
}
