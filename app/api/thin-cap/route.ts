import { NextRequest, NextResponse } from "next/server";
import {
  ThinCapitalizationEngine,
  ThinCapAIService,
  type ThinCapInput,
  type ThinCapFinancialData,
  type ThinCapInterestExpense,
  Section94BEntityType,
  LenderType,
  AY_THIN_CAP_RULES,
  INTEREST_THRESHOLD,
  EBITDA_LIMITATION_PERCENTAGE,
  CARRYFORWARD_YEARS,
} from "@/lib/engines";

interface ThinCapCalculationRequest {
  assessmentYear: string;
  entityType: "indian_company" | "pe_foreign_company" | "llp";
  entityCode?: string;
  financials: {
    profitBeforeTax: number;
    totalInterestExpense: number;
    depreciation: number;
    amortization: number;
    interestIncome?: number;
  };
  interestExpenses: {
    lenderName: string;
    lenderCountry: string;
    principalAmount: number;
    interestRate: number;
    interestAmount: number;
    isAE: boolean;
  }[];
  useAIAnalysis?: boolean;
}

interface CarryforwardSimulationRequest {
  disallowedInterest: number;
  projectedEBITDA: number[];
  projectedInterestExpense: number[];
  startingYear: string;
}

// POST /api/thin-cap - Calculate thin capitalization limitation
export async function POST(request: NextRequest) {
  try {
    const body: ThinCapCalculationRequest = await request.json();
    const {
      assessmentYear,
      entityType,
      entityCode,
      financials,
      interestExpenses,
      useAIAnalysis,
    } = body;

    // Validate required fields
    if (!assessmentYear || !entityType || !financials || !interestExpenses) {
      return NextResponse.json(
        {
          error:
            "assessmentYear, entityType, financials, and interestExpenses are required",
        },
        { status: 400 }
      );
    }

    const engine = new ThinCapitalizationEngine();

    // Construct proper FinancialData
    const financialData: ThinCapFinancialData = {
      profitBeforeTax: financials.profitBeforeTax,
      totalInterestExpense: financials.totalInterestExpense,
      depreciation: financials.depreciation,
      amortization: financials.amortization,
      interestIncome: financials.interestIncome,
    };

    // Construct InterestExpense array
    const interestExpenseData: ThinCapInterestExpense[] = interestExpenses.map((exp) => ({
      lenderName: exp.lenderName,
      lenderType: exp.isAE ? LenderType.NON_RESIDENT_AE : LenderType.RESIDENT_NON_AE,
      lenderCountry: exp.lenderCountry,
      interestType: "loan_interest",
      principalAmount: exp.principalAmount,
      interestRate: exp.interestRate,
      interestAmount: exp.interestAmount,
      isAE: exp.isAE,
    }));

    // Construct ThinCapInput
    const input: ThinCapInput = {
      assessmentYear,
      entityType: entityType as Section94BEntityType,
      entityCode,
      financials: financialData,
      interestExpenses: interestExpenseData,
    };

    // Check exemptions first
    const exemption = engine.checkExemptions(input);

    if (exemption.isExempt) {
      return NextResponse.json({
        exempt: true,
        exemptionCategory: exemption.exemptionCategory,
        exemptionReference: exemption.reference,
        calculation: null,
        summary: {
          section: "94B",
          status: "Exempt",
          reason: exemption.exemptionCategory,
          disallowedInterest: 0,
        },
      });
    }

    // Calculate interest limitation
    const result = engine.calculateInterestLimitation(input);

    // Add AI analysis if requested
    let aiAnalysis = null;
    if (useAIAnalysis) {
      const aiService = new ThinCapAIService();
      const enhancedResult = await aiService.analyzeThinCap(input);
      aiAnalysis = enhancedResult.aiAnalysis;
    }

    // Calculate total interest paid to non-resident AE
    const totalInterestToAE = interestExpenses
      .filter((e) => e.isAE)
      .reduce((sum, e) => sum + e.interestAmount, 0);

    return NextResponse.json({
      exempt: false,
      ebitda: result.ebitdaResult,
      calculation: result,
      carryforward: result.carryforwardResult,
      aiAnalysis,
      summary: {
        section: "94B",
        status: result.disallowedInterest > 0 ? "Limitation Applies" : "Within Limit",
        totalInterestPaid: totalInterestToAE,
        allowableInterest: result.allowableInterest,
        disallowedInterest: result.disallowedInterest,
        ebitda: result.ebitdaResult?.totalEBITDA || 0,
        limitPercentage: `${EBITDA_LIMITATION_PERCENTAGE}%`,
        carryforwardAvailable: result.disallowedInterest > 0,
        carryforwardPeriod: `${CARRYFORWARD_YEARS} years`,
      },
    });
  } catch (error) {
    console.error("Error calculating thin capitalization:", error);
    return NextResponse.json(
      { error: "Failed to calculate thin capitalization limitation" },
      { status: 500 }
    );
  }
}

// PUT /api/thin-cap - Simulate carryforward utilization
export async function PUT(request: NextRequest) {
  try {
    const body: CarryforwardSimulationRequest = await request.json();
    const { disallowedInterest, projectedEBITDA, projectedInterestExpense, startingYear } = body;

    if (
      !disallowedInterest ||
      !projectedEBITDA ||
      !projectedInterestExpense ||
      !startingYear
    ) {
      return NextResponse.json(
        {
          error:
            "disallowedInterest, projectedEBITDA, projectedInterestExpense, and startingYear are required",
        },
        { status: 400 }
      );
    }

    const engine = new ThinCapitalizationEngine();
    const years = Math.min(projectedEBITDA.length, CARRYFORWARD_YEARS);
    const simulation: {
      year: string;
      ebitda: number;
      interestLimit: number;
      interestExpense: number;
      excessCapacity: number;
      carryforwardUtilized: number;
      carryforwardRemaining: number;
    }[] = [];

    let remainingCarryforward = disallowedInterest;
    const startYear = parseInt(startingYear.split("-")[0]);

    for (let i = 0; i < years; i++) {
      const year = `${startYear + i + 1}-${(startYear + i + 2).toString().slice(-2)}`;
      const ebitda = projectedEBITDA[i];
      const interestLimit = ebitda * EBITDA_LIMITATION_PERCENTAGE / 100;
      const interestExpense = projectedInterestExpense[i];
      const excessCapacity = Math.max(0, interestLimit - interestExpense);
      const utilized = Math.min(excessCapacity, remainingCarryforward);
      remainingCarryforward -= utilized;

      simulation.push({
        year,
        ebitda,
        interestLimit: Math.round(interestLimit),
        interestExpense,
        excessCapacity: Math.round(excessCapacity),
        carryforwardUtilized: Math.round(utilized),
        carryforwardRemaining: Math.round(remainingCarryforward),
      });
    }

    const expiredAmount = remainingCarryforward;
    const totalUtilized = disallowedInterest - remainingCarryforward;

    return NextResponse.json({
      simulation,
      summary: {
        originalDisallowance: disallowedInterest,
        totalUtilized,
        expiredAmount,
        utilizationRate: `${((totalUtilized / disallowedInterest) * 100).toFixed(1)}%`,
        recommendation:
          expiredAmount > 0
            ? "Consider restructuring debt or increasing operational efficiency to utilize carryforward before expiry"
            : "Full carryforward utilization projected",
      },
    });
  } catch (error) {
    console.error("Error simulating carryforward:", error);
    return NextResponse.json(
      { error: "Failed to simulate carryforward utilization" },
      { status: 500 }
    );
  }
}

// GET /api/thin-cap - Get rules and thresholds
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  if (type === "exemptions") {
    return NextResponse.json({
      exemptions: [
        {
          category: "Banking Companies",
          description: "Companies regulated under Banking Regulation Act, 1949",
          reference: "Section 94B(3)(i)",
        },
        {
          category: "Insurance Companies",
          description: "Companies regulated under Insurance Act, 1938",
          reference: "Section 94B(3)(ii)",
        },
        {
          category: "Threshold",
          description: `Interest paid to non-resident AE less than Rs. ${INTEREST_THRESHOLD.toLocaleString("en-IN")}`,
          reference: "Section 94B proviso",
        },
        {
          category: "Existing Debt",
          description: "Debt issued before April 1, 2017 (grandfathering)",
          reference: "CBDT Circular",
        },
      ],
    });
  }

  if (type === "calculation") {
    return NextResponse.json({
      formula: {
        step1: "Calculate EBITDA = Operating Profit + Depreciation + Interest expense",
        step2: `Allowable Interest = EBITDA × ${EBITDA_LIMITATION_PERCENTAGE / 100 * 100}%`,
        step3: "Disallowed Interest = Interest paid to NR AE - Allowable Interest",
        step4: "If Disallowed > 0, can be carried forward for 8 years",
      },
      notes: [
        "Only interest paid to non-resident AE is considered",
        "Interest received from AE can be netted against interest paid",
        "EBITDA is calculated based on book profits",
        "Carryforward subject to subsequent year limitations",
      ],
    });
  }

  return NextResponse.json({
    section: "94B",
    title: "Limitation on Interest Deduction",
    effectiveFrom: "AY 2018-19",
    rules: AY_THIN_CAP_RULES,
    overview: {
      purpose:
        "Prevent excessive interest deduction through thin capitalization by associated enterprises",
      mechanism: "Limits interest deduction to 30% of EBITDA",
      scope: "Interest paid to non-resident associated enterprises",
      carryforward: "Disallowed interest can be carried forward for 8 years",
    },
    compliance: {
      documentation: [
        "Loan agreements with AE",
        "Interest computation working",
        "EBITDA calculation worksheet",
        "Carryforward register",
      ],
      disclosure: "Form 3CEB - Clause 22 (Thin Capitalization disclosure)",
      deadline: "Along with transfer pricing report",
    },
  });
}
