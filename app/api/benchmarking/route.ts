import { NextRequest, NextResponse } from "next/server";

interface Comparable {
  id: string;
  name: string;
  country: string;
  industry: string;
  nicCode: string;
  turnover: number;
  operatingProfit: number;
  operatingCost: number;
  totalAssets: number;
  employees: number;
  opMargin: number; // OP/OR
  opCostMargin: number; // OP/OC
  roce: number; // Return on Capital Employed
  selected: boolean;
}

interface BenchmarkingRequest {
  comparables: Comparable[];
  testedPartyMargin: number;
  pliType: "OP/OC" | "OP/OR" | "ROCE" | "Berry Ratio";
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

  // Sort values
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate quartiles using inclusive method
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
    const body: BenchmarkingRequest = await request.json();
    const { comparables, testedPartyMargin, pliType } = body;

    if (!comparables || comparables.length === 0) {
      return NextResponse.json(
        { error: "At least one comparable is required" },
        { status: 400 }
      );
    }

    // Get selected comparables
    const selectedComparables = comparables.filter((c) => c.selected);

    if (selectedComparables.length < 3) {
      return NextResponse.json(
        { error: "At least 3 comparables must be selected for reliable analysis" },
        { status: 400 }
      );
    }

    // Extract PLI values based on type
    let pliValues: number[];
    switch (pliType) {
      case "OP/OC":
        pliValues = selectedComparables.map((c) => c.opCostMargin);
        break;
      case "OP/OR":
        pliValues = selectedComparables.map((c) => c.opMargin);
        break;
      case "ROCE":
        pliValues = selectedComparables.map((c) => c.roce);
        break;
      default:
        pliValues = selectedComparables.map((c) => c.opCostMargin);
    }

    // Calculate statistical range
    const statisticalRange = calculateStatisticalRange(pliValues);

    // Determine arm's length compliance
    const compliance = determineArmLengthCompliance(testedPartyMargin, statisticalRange);

    // Prepare comparable analysis
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

// GET /api/benchmarking/comparables - Get sample comparables (in real app, this would query a database)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const industry = searchParams.get("industry");
  const nicCode = searchParams.get("nicCode");

  // Sample comparable companies (would come from database like Prowess/Capitaline)
  const sampleComparables: Comparable[] = [
    {
      id: "1",
      name: "Infosys BPM Ltd",
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

  // Filter by industry/NIC code if provided
  let filtered = sampleComparables;
  if (industry) {
    filtered = filtered.filter((c) =>
      c.industry.toLowerCase().includes(industry.toLowerCase())
    );
  }
  if (nicCode) {
    filtered = filtered.filter((c) => c.nicCode === nicCode);
  }

  return NextResponse.json({ comparables: filtered });
}
