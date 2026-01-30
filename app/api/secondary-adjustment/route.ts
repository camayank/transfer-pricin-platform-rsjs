import { NextRequest, NextResponse } from "next/server";
import {
  SecondaryAdjustmentEngine,
  SecondaryAdjustmentAIService,
  type SecondaryAdjustmentInput,
  type RepatriationEvent,
  SecondaryAdjustmentTrigger,
  PRIMARY_ADJUSTMENT_THRESHOLD,
  REPATRIATION_DEADLINE_DAYS,
} from "@/lib/engines";

interface SecondaryAdjustmentRequest {
  primaryAdjustment: number;
  transactionValue: number;
  armLengthPrice: number;
  assessmentYear: string;
  orderDate?: string;
  trigger?: "ao_adjustment" | "tpo_adjustment" | "voluntary_adjustment" | "apa_adjustment" | "map_adjustment";
  isSubstantialShareholder?: boolean;
  shareholdingPercentage?: number;
  accumulatedProfits?: number;
  repatriationEvents?: RepatriationEvent[];
  useAIAnalysis?: boolean;
}

interface RepatriationTrackingRequest {
  adjustmentId: string;
  primaryAdjustment: number;
  adjustmentDate: string;
  repatriationEvents: RepatriationEvent[];
}

// POST /api/secondary-adjustment - Calculate secondary adjustment
export async function POST(request: NextRequest) {
  try {
    const body: SecondaryAdjustmentRequest = await request.json();
    const {
      primaryAdjustment,
      transactionValue,
      armLengthPrice,
      assessmentYear,
      orderDate,
      trigger,
      isSubstantialShareholder,
      shareholdingPercentage,
      accumulatedProfits,
      repatriationEvents,
      useAIAnalysis,
    } = body;

    // Validate required fields
    if (!primaryAdjustment || !assessmentYear || !transactionValue || !armLengthPrice) {
      return NextResponse.json(
        { error: "primaryAdjustment, transactionValue, armLengthPrice, and assessmentYear are required" },
        { status: 400 }
      );
    }

    const engine = new SecondaryAdjustmentEngine();

    const input: SecondaryAdjustmentInput = {
      assessmentYear,
      primaryAdjustment,
      transactionValue,
      armLengthPrice,
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      trigger: (trigger as SecondaryAdjustmentTrigger) || SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      isSubstantialShareholder,
      shareholdingPercentage,
      accumulatedProfits,
    };

    // Validate input
    const validationIssues = engine.validateSecondaryAdjustment(input);
    if (validationIssues.length > 0) {
      const errors = validationIssues.filter((v) => v.severity === "error");
      const warnings = validationIssues.filter((v) => v.severity === "warning");
      if (errors.length > 0) {
        return NextResponse.json({
          valid: false,
          errors: errors.map((e) => e.message),
          warnings: warnings.map((w) => w.message),
        });
      }
    }

    // Calculate secondary adjustment
    const result = engine.calculateSecondaryAdjustment(input);

    // Add AI analysis if requested
    let aiAnalysis = null;
    if (useAIAnalysis) {
      const aiService = new SecondaryAdjustmentAIService();
      const enhancedResult = await aiService.analyzeSecondaryAdjustment(input);
      aiAnalysis = enhancedResult.aiAnalysis;
    }

    // Track repatriation if events provided
    let repatriationStatus = null;
    if (repatriationEvents && repatriationEvents.length > 0) {
      repatriationStatus = engine.trackRepatriation(result, repatriationEvents);
    }

    return NextResponse.json({
      result,
      repatriationStatus,
      aiAnalysis,
      summary: {
        primaryAdjustment,
        isApplicable: result.isApplicable,
        recommendedOption: result.recommendedOption,
        excessMoney: result.excessMoney,
        repatriationDeadline: result.repatriationDeadline?.toISOString().split("T")[0],
        daysRemaining: result.daysRemaining,
        deadlinePassed: result.deadlinePassed,
        actionRequired: result.isApplicable
          ? `Repatriate Rs. ${result.excessMoney.toLocaleString("en-IN")} by ${result.repatriationDeadline?.toISOString().split("T")[0] || "N/A"}`
          : result.nonApplicabilityReason || "No secondary adjustment required",
      },
    });
  } catch (error) {
    console.error("Error calculating secondary adjustment:", error);
    return NextResponse.json(
      { error: "Failed to calculate secondary adjustment" },
      { status: 500 }
    );
  }
}

// GET /api/secondary-adjustment - Get rules and thresholds
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  if (type === "thresholds") {
    return NextResponse.json({
      thresholds: {
        minimumPrimaryAdjustment: PRIMARY_ADJUSTMENT_THRESHOLD,
        repatriationPeriodDays: REPATRIATION_DEADLINE_DAYS,
      },
      description: "Secondary adjustment thresholds as per Section 92CE",
    });
  }

  // Return general information
  return NextResponse.json({
    section: "92CE",
    applicableFrom: "2017-04-01",
    minimumThreshold: PRIMARY_ADJUSTMENT_THRESHOLD,
    repatriationPeriod: `${REPATRIATION_DEADLINE_DAYS} days`,
    interestRate: "SBI base rate + 1%",
    optionsAfterDeadline: [
      "Deemed dividend under Section 2(22)(e) - if AE is a shareholder",
      "Deemed loan with notional interest - if AE is not a shareholder",
    ],
    documentation: [
      "Primary adjustment order from TPO/AO",
      "Evidence of repatriation (bank statements, FIRC)",
      "Computation of secondary adjustment",
      "Interest calculation worksheet (if applicable)",
    ],
  });
}

// PUT /api/secondary-adjustment - Track repatriation
export async function PUT(request: NextRequest) {
  try {
    const body: RepatriationTrackingRequest = await request.json();
    const { adjustmentId, primaryAdjustment, adjustmentDate, repatriationEvents } = body;

    if (!adjustmentId || !primaryAdjustment || !adjustmentDate) {
      return NextResponse.json(
        { error: "adjustmentId, primaryAdjustment, and adjustmentDate are required" },
        { status: 400 }
      );
    }

    const engine = new SecondaryAdjustmentEngine();

    // Create a result object for tracking
    const mockInput: SecondaryAdjustmentInput = {
      assessmentYear: "2023-24",
      primaryAdjustment,
      transactionValue: primaryAdjustment,
      armLengthPrice: 0,
      orderDate: new Date(adjustmentDate),
      trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
    };
    const mockResult = engine.calculateSecondaryAdjustment(mockInput);

    const repatriationStatus = engine.trackRepatriation(mockResult, repatriationEvents || []);

    return NextResponse.json({
      adjustmentId,
      repatriationStatus,
      summary: {
        totalAmount: repatriationStatus.totalAmount,
        amountRepatriated: repatriationStatus.amountRepatriated,
        balancePending: repatriationStatus.balancePending,
        daysRemaining: repatriationStatus.daysRemaining,
        status: repatriationStatus.status,
      },
    });
  } catch (error) {
    console.error("Error tracking repatriation:", error);
    return NextResponse.json(
      { error: "Failed to track repatriation" },
      { status: 500 }
    );
  }
}
