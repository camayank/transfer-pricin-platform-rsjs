import { NextRequest, NextResponse } from "next/server";

// Safe Harbour Rules as per Rule 10TD/10TE/10TF
interface SafeHarbourThreshold {
  condition: string;
  margin: number | null;
  rate?: string;
}

interface SafeHarbourRule {
  name: string;
  marginType: string;
  thresholds: SafeHarbourThreshold[];
  applicableTransactions: string[];
  maxTurnover: number | null;
}

const SAFE_HARBOUR_RULES: Record<string, SafeHarbourRule> = {
  IT_ITES: {
    name: "IT & IT Enabled Services",
    marginType: "OP/OC",
    thresholds: [
      { condition: "Normal case", margin: 17 },
    ],
    applicableTransactions: ["03", "04", "13"],
    maxTurnover: null,
  },
  KPO: {
    name: "Knowledge Process Outsourcing",
    marginType: "OP/OC",
    thresholds: [
      { condition: "Employee cost < 60% of total cost", margin: 18 },
      { condition: "Employee cost >= 60% but < 80% of total cost", margin: 21 },
      { condition: "Employee cost >= 80% of total cost", margin: 24 },
    ],
    applicableTransactions: ["03", "04", "13"],
    maxTurnover: null,
  },
  CONTRACT_RD: {
    name: "Contract R&D - Wholly or Partly Software",
    marginType: "OP/OC",
    thresholds: [
      { condition: "Normal case", margin: 24 },
    ],
    applicableTransactions: ["05", "06"],
    maxTurnover: null,
  },
  CONTRACT_RD_GENERIC: {
    name: "Contract R&D - Generic Pharma",
    marginType: "OP/OC",
    thresholds: [
      { condition: "Normal case", margin: 24 },
    ],
    applicableTransactions: ["05", "06"],
    maxTurnover: null,
  },
  AUTO_ANCILLARY: {
    name: "Auto Ancillary",
    marginType: "OP/OC",
    thresholds: [
      { condition: "Normal case", margin: 12 },
    ],
    applicableTransactions: ["01", "02"],
    maxTurnover: null,
  },
  INTRA_GROUP_LOAN: {
    name: "Intra-Group Loan (INR denominated)",
    marginType: "Interest Rate",
    thresholds: [
      { condition: "Where AE has rating", margin: null, rate: "SBI base rate + 150bps" },
      { condition: "Where AE has no rating", margin: null, rate: "SBI base rate + 300bps" },
    ],
    applicableTransactions: ["20"],
    maxTurnover: null,
  },
  CORPORATE_GUARANTEE: {
    name: "Corporate Guarantee",
    marginType: "Commission Rate",
    thresholds: [
      { condition: "Up to Rs. 100 Crore", margin: null, rate: "2%" },
      { condition: "Above Rs. 100 Crore", margin: null, rate: "1.75%" },
    ],
    applicableTransactions: ["21"],
    maxTurnover: null,
  },
  LOW_VALUE_SERVICES: {
    name: "Low Value-Adding Intra-Group Services",
    marginType: "Markup on Cost",
    thresholds: [
      { condition: "Normal case", margin: 5 },
    ],
    applicableTransactions: ["03", "04"],
    maxTurnover: null,
  },
};

interface SafeHarbourRequest {
  transactionType: string;
  operatingCost: number;
  operatingProfit: number;
  employeeCost?: number;
  totalCost?: number;
  loanAmount?: number;
  guaranteeAmount?: number;
  aeHasRating?: boolean;
}

interface SafeHarbourResult {
  eligible: boolean;
  rule: string;
  requiredMargin: number | string;
  actualMargin: number;
  marginType: string;
  compliance: "compliant" | "non_compliant" | "review_required";
  explanation: string;
  recommendations: string[];
}

function calculateSafeHarbour(data: SafeHarbourRequest): SafeHarbourResult {
  const rule = SAFE_HARBOUR_RULES[data.transactionType];

  if (!rule) {
    return {
      eligible: false,
      rule: "Unknown",
      requiredMargin: 0,
      actualMargin: 0,
      marginType: "N/A",
      compliance: "review_required",
      explanation: "Transaction type not covered under Safe Harbour provisions",
      recommendations: ["Apply standard transfer pricing methods (TNMM/CUP/RPM/CPM)"],
    };
  }

  let actualMargin = 0;
  let requiredMargin: number | string = 0;
  let threshold: SafeHarbourThreshold = rule.thresholds[0];

  // Calculate actual margin based on margin type
  if (rule.marginType === "OP/OC") {
    actualMargin = (data.operatingProfit / data.operatingCost) * 100;

    // For KPO, determine threshold based on employee cost ratio
    if (data.transactionType === "KPO" && data.employeeCost && data.totalCost) {
      const employeeRatio = (data.employeeCost / data.totalCost) * 100;
      if (employeeRatio < 60) {
        threshold = rule.thresholds[0];
      } else if (employeeRatio < 80) {
        threshold = rule.thresholds[1];
      } else {
        threshold = rule.thresholds[2];
      }
    }

    requiredMargin = threshold.margin ?? 0;
  } else if (rule.marginType === "Markup on Cost") {
    actualMargin = (data.operatingProfit / data.operatingCost) * 100;
    requiredMargin = threshold.margin ?? 0;
  } else if (rule.marginType === "Interest Rate" || rule.marginType === "Commission Rate") {
    // For loan and guarantee, margin is the rate
    requiredMargin = threshold.rate ?? "As per rule";
    actualMargin = 0; // Would need actual rate input
  }

  const eligible = rule.marginType === "OP/OC" || rule.marginType === "Markup on Cost"
    ? actualMargin >= (typeof requiredMargin === "number" ? requiredMargin : 0)
    : true;

  const compliance = eligible ? "compliant" : "non_compliant";

  const explanation = eligible
    ? `Transaction qualifies for Safe Harbour under Rule 10TD. Actual margin of ${actualMargin.toFixed(2)}% meets the minimum threshold of ${requiredMargin}%.`
    : `Transaction does NOT qualify for Safe Harbour. Actual margin of ${actualMargin.toFixed(2)}% is below the required ${requiredMargin}%. Additional documentation required.`;

  const recommendations = eligible
    ? [
        "Maintain contemporaneous documentation",
        "Ensure all conditions under Rule 10TD are satisfied",
        "File Form 3CEFA within due date",
      ]
    : [
        "Prepare comprehensive benchmarking study",
        "Consider adjusting intercompany pricing",
        "Document functional analysis thoroughly",
        "Maintain supporting evidence for pricing",
      ];

  return {
    eligible,
    rule: rule.name,
    requiredMargin,
    actualMargin: Math.round(actualMargin * 100) / 100,
    marginType: rule.marginType,
    compliance,
    explanation,
    recommendations,
  };
}

// POST /api/safe-harbour - Calculate Safe Harbour eligibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      transactionType,
      operatingCost,
      operatingProfit,
      employeeCost,
      totalCost,
      loanAmount,
      guaranteeAmount,
      aeHasRating,
    } = body;

    // Validate required fields
    if (!transactionType) {
      return NextResponse.json(
        { error: "Transaction type is required" },
        { status: 400 }
      );
    }

    if (operatingCost === undefined || operatingProfit === undefined) {
      return NextResponse.json(
        { error: "Operating cost and profit are required" },
        { status: 400 }
      );
    }

    const result = calculateSafeHarbour({
      transactionType,
      operatingCost,
      operatingProfit,
      employeeCost,
      totalCost,
      loanAmount,
      guaranteeAmount,
      aeHasRating,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error calculating safe harbour:", error);
    return NextResponse.json(
      { error: "Failed to calculate safe harbour" },
      { status: 500 }
    );
  }
}

// GET /api/safe-harbour/rules - Get all Safe Harbour rules
export async function GET() {
  return NextResponse.json({ rules: SAFE_HARBOUR_RULES });
}
