import { NextRequest, NextResponse } from "next/server";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";
import {
  PenaltyEngine,
  PenaltyAIService,
  type PenaltyInput,
  PenaltyEntityType,
  INTEREST_234A,
  INTEREST_234B,
  INTEREST_234C,
  INTEREST_234D,
  CONCEALMENT_PENALTY_RATES,
} from "@/lib/engines";

interface PenaltyExposureRequest {
  adjustmentAmount: number;
  taxRate: number;
  assessmentYear: string;
  entityType?: "domestic_company" | "foreign_company" | "llp_firm" | "individual";
  returnedIncome?: number;
  transactionValue?: number;
  hasDocumentation?: boolean;
  isWilfulDefault?: boolean;
  isRepeatOffence?: boolean;
  reportType?: "3CEB" | "3CEAD" | "3CEAA";
  reportNotFiled?: boolean;
  form3CEBFiled?: boolean;
}

interface InterestCalculationRequest {
  section: "234A" | "234B" | "234C" | "234D";
  taxAmount: number;
  dueDate: string;
  paymentDate: string;
  advanceTaxPaid?: number;
  assessedTax?: number;
  refundGranted?: number;
}

// POST /api/penalty - Calculate penalty exposure
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
    if (!authorized) return error;

    const body: PenaltyExposureRequest = await request.json();
    const {
      adjustmentAmount,
      taxRate,
      assessmentYear,
      entityType,
      returnedIncome,
      transactionValue,
      hasDocumentation,
      form3CEBFiled,
    } = body;

    // Validate required fields
    if (!adjustmentAmount || !taxRate || !assessmentYear) {
      return NextResponse.json(
        { error: "adjustmentAmount, taxRate, and assessmentYear are required" },
        { status: 400 }
      );
    }

    const engine = new PenaltyEngine();
    const aiService = new PenaltyAIService();

    // Construct proper PenaltyInput
    const penaltyInput: PenaltyInput = {
      assessmentYear,
      entityType: (entityType as PenaltyEntityType) || PenaltyEntityType.DOMESTIC_COMPANY,
      primaryAdjustment: adjustmentAmount,
      returnedIncome: returnedIncome || 0,
      assessedIncome: (returnedIncome || 0) + adjustmentAmount,
      transactionValues: transactionValue
        ? [
            {
              natureCode: "01",
              description: "International Transaction",
              value: transactionValue,
              documentationMaintained: hasDocumentation || false,
              reportedIn3CEB: form3CEBFiled || false,
            },
          ]
        : [],
      filingCompliance: {
        returnFiled: true,
        dueDate: new Date(`${assessmentYear.split("-")[0]}-07-31`),
        form3CEBFiled: form3CEBFiled || false,
      },
      documentationStatus: {
        tpDocumentationMaintained: hasDocumentation || false,
        isContemporaneous: hasDocumentation || false,
        documentsFurnishedOnRequest: true,
        informationFurnishedToTPO: true,
      },
    };

    // Calculate total penalty exposure
    const totalExposure = engine.calculateTotalPenaltyExposure(penaltyInput);

    // Get AI enhanced analysis
    const enhancedAnalysis = await aiService.analyzepenaltyExposure(penaltyInput);

    return NextResponse.json({
      totalExposure,
      enhancedAnalysis,
      summary: {
        adjustmentAmount,
        taxEvaded: adjustmentAmount * (taxRate / 100),
        concealmentPenaltyRange: {
          minimum: totalExposure.concealmentPenalty?.minimumPenalty || 0,
          maximum: totalExposure.concealmentPenalty?.maximumPenalty || 0,
        },
        documentationPenalty: totalExposure.documentationPenalty271AA?.penaltyAmount || 0,
        reportFailurePenalty: totalExposure.reportFailurePenalty?.totalPenalty || 0,
        totalMinimumExposure: totalExposure.totalMinimumExposure,
        totalMaximumExposure: totalExposure.totalMaximumExposure,
        mitigationRecommendations: enhancedAnalysis.mitigationRecommendations || [],
        riskLevel: enhancedAnalysis.riskAssessment?.riskLevel || "unknown",
      },
    });
  } catch (error) {
    console.error("Error calculating penalty exposure:", error);
    return NextResponse.json(
      { error: "Failed to calculate penalty exposure" },
      { status: 500 }
    );
  }
}

// PUT /api/penalty - Calculate interest under Section 234A/B/C/D
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and permission
    const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
    if (!authorized) return error;

    const body: InterestCalculationRequest = await request.json();
    const { section, taxAmount, dueDate, paymentDate, advanceTaxPaid, assessedTax, refundGranted } =
      body;

    if (!section || !taxAmount || !dueDate || !paymentDate) {
      return NextResponse.json(
        { error: "section, taxAmount, dueDate, and paymentDate are required" },
        { status: 400 }
      );
    }

    let interest = 0;
    let months = 0;
    let rate = 0;
    let basis = 0;

    const due = new Date(dueDate);
    const payment = new Date(paymentDate);
    const diffTime = payment.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    months = Math.max(0, Math.ceil(diffDays / 30));

    switch (section) {
      case "234A":
        // Interest on late filing of return
        rate = INTEREST_234A.ratePerMonth;
        basis = taxAmount;
        interest = basis * rate * months;
        break;

      case "234B":
        // Interest on failure to pay advance tax
        rate = INTEREST_234B.ratePerMonth;
        basis = Math.max(0, (assessedTax || taxAmount) - (advanceTaxPaid || 0));
        interest = basis * rate * months;
        break;

      case "234C":
        // Interest on deferment of advance tax
        rate = INTEREST_234C.ratePerMonth;
        basis = Math.max(0, taxAmount - (advanceTaxPaid || 0));
        interest = basis * rate * months;
        break;

      case "234D":
        // Interest on excess refund
        rate = INTEREST_234D.ratePerMonth;
        basis = refundGranted || taxAmount;
        interest = basis * rate * months;
        break;
    }

    return NextResponse.json({
      section,
      taxAmount,
      dueDate,
      paymentDate,
      delayMonths: months,
      interestRate: `${rate * 100}% per month`,
      interestAmount: Math.round(interest),
      calculation: {
        formula: `${taxAmount} × ${rate * 100}% × ${months} months`,
        result: interest,
      },
      notes: getInterestNotes(section),
    });
  } catch (error) {
    console.error("Error calculating interest:", error);
    return NextResponse.json({ error: "Failed to calculate interest" }, { status: 500 });
  }
}

// GET /api/penalty - Get penalty rates and rules
export async function GET(request: NextRequest) {
  // Check authentication and permission
  const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
  if (!authorized) return error;

  const searchParams = request.nextUrl.searchParams;
  const section = searchParams.get("section");

  if (section) {
    const sectionInfo = getSectionInfo(section);
    if (sectionInfo) {
      return NextResponse.json(sectionInfo);
    }
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  return NextResponse.json({
    penaltySections: {
      "271(1)(c)": {
        description: "Penalty for concealment of income",
        rate: "100% to 300% of tax evaded",
        basis: "Tax sought to be evaded",
      },
      "271AA": {
        description: "Penalty for failure to keep/maintain documents",
        rate: "2% of transaction value",
        basis: "International transactions without documentation",
      },
      "271BA": {
        description: "Penalty for failure to furnish report",
        rate: "Rs. 1,00,000 per report",
        basis: "CbCR, Master File, Form 3CEB",
      },
      "271G": {
        description: "Penalty for failure to furnish information/document",
        rate: "2% of transaction value",
        basis: "Documents requested by TPO",
      },
    },
    interestSections: {
      "234A": {
        description: "Interest for default in furnishing return",
        rate: "1% per month",
        basis: "Tax on total income minus advance tax and TDS",
      },
      "234B": {
        description: "Interest for default in payment of advance tax",
        rate: "1% per month",
        basis: "Shortfall in advance tax (< 90% of assessed tax)",
      },
      "234C": {
        description: "Interest for deferment of advance tax",
        rate: "1% per month",
        basis: "Shortfall in quarterly advance tax payments",
      },
      "234D": {
        description: "Interest on excess refund",
        rate: "0.5% per month",
        basis: "Excess refund granted on regular assessment",
      },
    },
    rates: {
      concealment: CONCEALMENT_PENALTY_RATES,
      interest234A: INTEREST_234A,
      interest234B: INTEREST_234B,
      interest234C: INTEREST_234C,
      interest234D: INTEREST_234D,
    },
  });
}

function getSectionInfo(section: string) {
  const sections: Record<string, object> = {
    "271(1)(c)": {
      section: "271(1)(c)",
      title: "Penalty for Concealment of Income",
      minimumPenalty: "100% of tax evaded",
      maximumPenalty: "300% of tax evaded",
      applicability: "When income is concealed or inaccurate particulars furnished",
      defenses: [
        "Bona fide explanation for difference",
        "All material facts disclosed",
        "Genuine difference in interpretation",
        "Technical mistake without intent to evade",
      ],
      caseReferences: [
        "CIT vs. Reliance Petroproducts",
        "MAK Data vs. CIT",
        "Price Waterhouse Coopers vs. CIT",
      ],
    },
    "271AA": {
      section: "271AA",
      title: "Penalty for Failure to Keep Documentation",
      penalty: "2% of transaction value",
      applicability: "International transactions without prescribed documentation",
      documentation: ["Contemporaneous documentation as per Rule 10D", "Functional analysis", "Economic analysis"],
    },
    "271BA": {
      section: "271BA",
      title: "Penalty for Failure to Furnish Report",
      penalty: "Rs. 1,00,000 per report",
      applicability: "Failure to furnish CbCR, Master File, or Form 3CEB",
      dueDate: "Due date of filing income tax return",
    },
    "271G": {
      section: "271G",
      title: "Penalty for Failure to Furnish Information",
      penalty: "2% of transaction value",
      applicability: "Failure to furnish documents requested by TPO",
      timeLimit: "30 days from date of TPO notice (extendable)",
    },
  };

  return sections[section];
}

function getInterestNotes(section: string): string[] {
  const notes: Record<string, string[]> = {
    "234A": [
      "Interest calculated from due date of return to actual filing date",
      "Applies even if tax is paid but return not filed",
      "Part of month counted as full month",
    ],
    "234B": [
      "Applicable if advance tax paid is less than 90% of assessed tax",
      "Interest calculated from April 1 of AY to date of determination",
      "Relief available for TDS/TCS credits",
    ],
    "234C": [
      "Quarterly installments: 15%, 45%, 75%, 100% by Jun 15, Sep 15, Dec 15, Mar 15",
      "Interest on shortfall for each quarter",
      "Different rates for presumptive taxation cases",
    ],
    "234D": [
      "Applies when refund granted on initial processing is more than due",
      "Interest from date of refund to date of regular assessment",
      "Lower rate of 0.5% per month compared to other sections",
    ],
  };

  return notes[section] || [];
}
