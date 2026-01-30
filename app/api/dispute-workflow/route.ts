import { NextRequest, NextResponse } from "next/server";
import {
  DisputeWorkflowEngine,
  type TPOOrder,
  type DraftAssessmentOrder,
  type DRPObjection,
  type TaxpayerDetails,
  type GroundsOfAppeal,
  DISPUTE_TIMELINES,
  FORM_REQUIREMENTS,
  STANDARD_TP_GROUNDS,
  DisputeStage,
  DisputeStatus,
} from "@/lib/engines";

interface DRPApplicationRequest {
  tpoOrderDate: string;
  tpoOrderNumber: string;
  assessmentYear: string;
  adjustmentAmount: number;
  adjustmentType: "primary" | "secondary" | "penalty";
  transactionType: string;
  objections: {
    ground: string;
    description: string;
    supportingEvidence: string[];
  }[];
  taxpayerDetails: {
    name: string;
    pan: string;
    address: string;
  };
}

interface ITATAppealRequest {
  drpDirectionDate: string;
  assessmentOrderDate: string;
  assessmentOrderNumber: string;
  assessmentYear: string;
  adjustmentAmount: number;
  groundsOfAppeal: string[];
  taxpayerDetails: {
    name: string;
    pan: string;
    address: string;
  };
}

interface CaseTrackingRequest {
  caseId: string;
  stage: string;
  status: string;
  filingDate: string;
  events: {
    date: string;
    event: string;
    notes?: string;
  }[];
}

// POST /api/dispute-workflow - Create DRP application
export async function POST(request: NextRequest) {
  try {
    const body: DRPApplicationRequest = await request.json();
    const {
      tpoOrderDate,
      tpoOrderNumber,
      assessmentYear,
      adjustmentAmount,
      adjustmentType,
      transactionType,
      objections,
      taxpayerDetails,
    } = body;

    // Validate required fields
    if (
      !tpoOrderDate ||
      !tpoOrderNumber ||
      !assessmentYear ||
      !adjustmentAmount ||
      !taxpayerDetails
    ) {
      return NextResponse.json(
        {
          error:
            "tpoOrderDate, tpoOrderNumber, assessmentYear, adjustmentAmount, and taxpayerDetails are required",
        },
        { status: 400 }
      );
    }

    const engine = new DisputeWorkflowEngine();

    // Construct TPOOrder
    const tpoOrder: TPOOrder = {
      orderNumber: tpoOrderNumber,
      orderDate: new Date(tpoOrderDate),
      assessmentYear,
      primaryAdjustment: adjustmentAmount,
      transactionWiseAdjustments: [{
        transactionType: transactionType || "International transaction",
        reportedValue: 0,
        alpDetermined: adjustmentAmount,
        adjustmentAmount,
        natureCode: "01",
        relatedParty: "Foreign AE",
      }],
      reasonsForAdjustment: ["Transfer Pricing adjustment"],
      comparablesSelected: [],
      comparablesRejected: [],
      methodApplied: "TNMM",
      taxpayerDetails: {
        name: taxpayerDetails.name,
        pan: taxpayerDetails.pan,
        address: taxpayerDetails.address,
      },
    };

    // Construct DraftAssessmentOrder
    const draftOrder: DraftAssessmentOrder = {
      orderNumber: `DO/${tpoOrderNumber}`,
      orderDate: new Date(tpoOrderDate),
      assessmentYear,
      tpoOrderReference: tpoOrderNumber,
      totalIncome: adjustmentAmount,
      tpAdjustment: adjustmentAmount,
      otherAdditions: 0,
      demandRaised: adjustmentAmount * 0.3, // Approximate tax demand
      interestComputed: adjustmentAmount * 0.1,
    };

    // Validate DRP eligibility
    const eligibility = engine.validateDRPEligibility(tpoOrder, draftOrder);

    if (!eligibility.isEligible) {
      return NextResponse.json({
        eligible: false,
        reasons: eligibility.ineligibilityReasons,
        alternativeOptions: [
          "File objections before AO",
          "Proceed with appeal to CIT(A) after assessment order",
        ],
      });
    }

    // Convert objections to DRPObjection format
    const drpObjections: DRPObjection[] = (objections || []).map((obj, idx) => ({
      objectionNumber: idx + 1,
      issueCategory: "Transfer Pricing",
      briefDescription: obj.ground,
      detailedObjection: obj.description,
      legalBasis: obj.supportingEvidence || [],
      caseLawCitations: [],
      reliefSought: adjustmentAmount / (objections?.length || 1),
    }));

    // Create DRP application
    const drpApplication = engine.createDRPApplication(tpoOrder, draftOrder, drpObjections);

    // Calculate timeline
    const timeline = engine.calculateDRPTimeline(new Date());

    // Generate Form 35A
    const form35A = engine.generateDRPObjections(tpoOrder, draftOrder, drpObjections);

    // Calculate filing deadline (30 days from TPO order)
    const filingDeadline = new Date(tpoOrder.orderDate);
    filingDeadline.setDate(filingDeadline.getDate() + DISPUTE_TIMELINES.drp.filingDeadline);
    const daysRemaining = Math.ceil(
      (filingDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      application: drpApplication,
      timeline,
      form35A,
      eligibility,
      summary: {
        caseType: "DRP Application",
        filingDeadline: filingDeadline.toISOString().split("T")[0],
        daysRemaining: Math.max(0, daysRemaining),
        expectedDirectionDate: timeline.directionDeadline?.toISOString().split("T")[0],
        totalDisputedAmount: adjustmentAmount,
        numberOfObjections: objections?.length || 0,
        nextSteps: [
          "File Form 35A with DRP within deadline",
          "Submit supporting documentation",
          "Prepare for hearing if scheduled",
        ],
      },
    });
  } catch (error) {
    console.error("Error creating DRP application:", error);
    return NextResponse.json(
      { error: "Failed to create DRP application" },
      { status: 500 }
    );
  }
}

// PUT /api/dispute-workflow - Create ITAT appeal
export async function PUT(request: NextRequest) {
  try {
    const body: ITATAppealRequest = await request.json();
    const {
      drpDirectionDate,
      assessmentOrderDate,
      assessmentOrderNumber,
      assessmentYear,
      adjustmentAmount,
      groundsOfAppeal,
      taxpayerDetails,
    } = body;

    if (
      !assessmentOrderDate ||
      !assessmentOrderNumber ||
      !assessmentYear ||
      !adjustmentAmount ||
      !taxpayerDetails
    ) {
      return NextResponse.json(
        {
          error:
            "assessmentOrderDate, assessmentOrderNumber, assessmentYear, adjustmentAmount, and taxpayerDetails are required",
        },
        { status: 400 }
      );
    }

    const engine = new DisputeWorkflowEngine();

    // Construct order being appealed
    const orderAppealed: DraftAssessmentOrder = {
      orderNumber: assessmentOrderNumber,
      orderDate: new Date(assessmentOrderDate),
      assessmentYear,
      tpoOrderReference: assessmentOrderNumber,
      totalIncome: adjustmentAmount,
      tpAdjustment: adjustmentAmount,
      otherAdditions: 0,
      demandRaised: adjustmentAmount * 0.3,
      interestComputed: adjustmentAmount * 0.1,
    };

    // Construct taxpayer details
    const taxpayer: TaxpayerDetails = {
      name: taxpayerDetails.name,
      pan: taxpayerDetails.pan,
      address: taxpayerDetails.address,
    };

    // Construct grounds of appeal
    const grounds: GroundsOfAppeal = {
      generalGrounds: groundsOfAppeal || [],
      specificGrounds: (groundsOfAppeal || []).map((ground, idx) => ({
        groundNumber: idx + 1,
        category: "Transfer Pricing",
        ground,
        relatedLegalSections: ["Section 92", "Section 92CA"],
        precedentsCited: [],
      })),
      reliefPrayer: `Deletion of transfer pricing adjustment of Rs. ${adjustmentAmount.toLocaleString("en-IN")}`,
    };

    // Create ITAT appeal
    const itatAppeal = engine.createITATAppeal(
      orderAppealed,
      taxpayer,
      assessmentYear,
      grounds,
      adjustmentAmount
    );

    // Generate Form 35
    const form35 = engine.generateForm35(
      taxpayer,
      { orderNumber: assessmentOrderNumber, orderDate: new Date(assessmentOrderDate), authority: "AO" },
      assessmentYear,
      grounds,
      adjustmentAmount
    );

    // Generate Form 36
    const form36 = engine.generateForm36(
      taxpayer,
      { orderNumber: assessmentOrderNumber, orderDate: new Date(assessmentOrderDate), authority: "CIT(A)" },
      assessmentYear,
      grounds,
      adjustmentAmount
    );

    // Calculate appeal deadline
    const orderDate = new Date(assessmentOrderDate);
    const deadlineDate = new Date(
      orderDate.getTime() + DISPUTE_TIMELINES.itat.filingDeadline * 24 * 60 * 60 * 1000
    );
    const daysRemaining = Math.ceil(
      (deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      appeal: itatAppeal,
      form35,
      form36,
      summary: {
        caseType: "ITAT Appeal",
        assessmentOrderDate,
        filingDeadline: deadlineDate.toISOString().split("T")[0],
        daysRemaining: Math.max(0, daysRemaining),
        isWithinTime: daysRemaining > 0,
        adjustmentAmount,
        numberOfGrounds: groundsOfAppeal?.length || 0,
        courtFee: calculateCourtFee(adjustmentAmount),
        nextSteps: [
          "File Form 35 and Form 36 with ITAT",
          "Pay court fee",
          "Submit paper book with documents",
          "Serve copy on department",
        ],
      },
    });
  } catch (error) {
    console.error("Error creating ITAT appeal:", error);
    return NextResponse.json(
      { error: "Failed to create ITAT appeal" },
      { status: 500 }
    );
  }
}

// PATCH /api/dispute-workflow - Track case progress
export async function PATCH(request: NextRequest) {
  try {
    const body: CaseTrackingRequest = await request.json();
    const { caseId, stage, status, filingDate, events } = body;

    if (!caseId || !stage || !filingDate) {
      return NextResponse.json(
        { error: "caseId, stage, and filingDate are required" },
        { status: 400 }
      );
    }

    const filingDateObj = new Date(filingDate);
    const daysSinceFiling = Math.ceil(
      (new Date().getTime() - filingDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Compute progress based on stage and events
    const progress = {
      currentStage: stage as DisputeStage,
      currentStatus: (status as DisputeStatus) || DisputeStatus.IN_PROGRESS,
      daysInCurrentStage: daysSinceFiling,
      expectedNextMilestone: getNextMilestone(stage as DisputeStage),
      timeline: [
        {
          stage: stage as DisputeStage,
          startDate: filingDateObj,
          endDate: undefined,
        },
      ],
      events: events?.map((e) => ({ ...e, date: new Date(e.date) })) || [],
    };

    return NextResponse.json({
      caseId,
      progress,
      summary: {
        currentStage: stage,
        currentStatus: status,
        daysSinceFiling,
        eventsCount: events?.length || 0,
        nextMilestone: getNextMilestone(stage as DisputeStage),
      },
    });
  } catch (error) {
    console.error("Error tracking case:", error);
    return NextResponse.json({ error: "Failed to track case progress" }, { status: 500 });
  }
}

// GET /api/dispute-workflow - Get timelines and form requirements
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  if (type === "timelines") {
    return NextResponse.json({
      timelines: DISPUTE_TIMELINES,
      description: "Statutory timelines for dispute resolution",
    });
  }

  if (type === "forms") {
    return NextResponse.json({
      forms: FORM_REQUIREMENTS,
      description: "Form requirements for various dispute stages",
    });
  }

  if (type === "grounds") {
    return NextResponse.json({
      grounds: STANDARD_TP_GROUNDS,
      description: "Standard grounds of appeal for transfer pricing cases",
    });
  }

  if (type === "flowchart") {
    return NextResponse.json({
      stages: [
        {
          stage: "TPO Proceeding",
          actions: ["Reference to TPO", "Show cause notice", "TPO order"],
          timeline: "Within 60 days before due date of assessment",
        },
        {
          stage: "DRP Option",
          actions: ["File objections to DRP", "DRP hearing", "DRP directions"],
          timeline: "30 days from TPO order, Directions within 9 months",
        },
        {
          stage: "Assessment",
          actions: ["AO passes order giving effect to DRP directions"],
          timeline: "Within 1 month from DRP directions",
        },
        {
          stage: "ITAT Appeal",
          actions: ["File appeal", "Hearing", "ITAT order"],
          timeline: "60 days from assessment order",
        },
        {
          stage: "High Court",
          actions: ["File substantial question of law", "Hearing", "HC judgment"],
          timeline: "120 days from ITAT order",
        },
        {
          stage: "Supreme Court",
          actions: ["SLP/Appeal", "Hearing", "SC judgment"],
          timeline: "90 days from HC judgment",
        },
      ],
    });
  }

  return NextResponse.json({
    overview: {
      title: "Transfer Pricing Dispute Resolution",
      description: "Complete workflow management for TP disputes in India",
      stages: Object.values(DisputeStage),
      statuses: Object.values(DisputeStatus),
    },
    timelines: DISPUTE_TIMELINES,
    forms: FORM_REQUIREMENTS,
    standardGrounds: STANDARD_TP_GROUNDS,
    keyDeadlines: {
      DRP: `${DISPUTE_TIMELINES.drp.filingDeadline} days from TPO order`,
      ITAT: `${DISPUTE_TIMELINES.itat.filingDeadline} days from assessment order`,
      HIGH_COURT: `${DISPUTE_TIMELINES.highCourt.filingDeadline} days from ITAT order`,
      SUPREME_COURT: `${DISPUTE_TIMELINES.supremeCourt.filingDeadline} days from HC order`,
    },
  });
}

function calculateCourtFee(adjustmentAmount: number): string {
  // ITAT court fee slab
  if (adjustmentAmount <= 100000) return "Rs. 500";
  if (adjustmentAmount <= 200000) return "Rs. 1,000";
  if (adjustmentAmount <= 1000000) return "Rs. 5,000";
  return "Rs. 10,000";
}

function getNextMilestone(stage: DisputeStage): string {
  const milestones: Record<DisputeStage, string> = {
    [DisputeStage.TPO_REFERENCE]: "TPO order",
    [DisputeStage.TPO_ORDER]: "Draft assessment order",
    [DisputeStage.DRAFT_ASSESSMENT]: "DRP filing or AO response",
    [DisputeStage.DRP_FILING]: "DRP hearing",
    [DisputeStage.DRP_HEARING]: "DRP directions",
    [DisputeStage.DRP_DIRECTION]: "Final assessment order",
    [DisputeStage.FINAL_ASSESSMENT]: "Appeal to CIT(A) or ITAT",
    [DisputeStage.CIT_APPEALS]: "CIT(A) order",
    [DisputeStage.ITAT_APPEAL]: "ITAT order",
    [DisputeStage.HIGH_COURT]: "High Court judgment",
    [DisputeStage.SUPREME_COURT]: "Supreme Court judgment",
  };

  return milestones[stage] || "Next hearing";
}
