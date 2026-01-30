/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * DRP/ITAT Dispute Resolution Workflow Engine
 *
 * Complete dispute resolution lifecycle management for Transfer Pricing disputes
 * including DRP proceedings, ITAT appeals, form generation, and timeline tracking.
 * ================================================================================
 */

import {
  DisputeStage,
  DisputeStatus,
  FormType,
  DISPUTE_TIMELINES,
  FORM_REQUIREMENTS,
  DRP_ELIGIBILITY,
  STANDARD_TP_GROUNDS,
  STAY_OF_DEMAND,
  MONETARY_LIMITS,
  calculateDeadline,
  isWithinTimeLimit,
  calculateAppealFee,
  getDRPTimeline,
  getITATTimeline,
  checkCondonationEligibility,
  getNextAppealForum,
  getFilingDeadline,
  FormRequirement,
} from "./constants/dispute-timelines";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TPOOrder {
  orderNumber: string;
  orderDate: Date;
  assessmentYear: string;
  primaryAdjustment: number;
  transactionWiseAdjustments: TransactionAdjustment[];
  reasonsForAdjustment: string[];
  comparablesSelected: string[];
  comparablesRejected: string[];
  methodApplied: string;
  taxpayerDetails: TaxpayerDetails;
}

export interface TransactionAdjustment {
  transactionType: string;
  reportedValue: number;
  alpDetermined: number;
  adjustmentAmount: number;
  natureCode: string;
  relatedParty: string;
}

export interface TaxpayerDetails {
  name: string;
  pan: string;
  address: string;
  authorizedRepresentative?: string;
  email?: string;
  phone?: string;
}

export interface DraftAssessmentOrder {
  orderNumber: string;
  orderDate: Date;
  assessmentYear: string;
  tpoOrderReference: string;
  totalIncome: number;
  tpAdjustment: number;
  otherAdditions: number;
  demandRaised: number;
  interestComputed: number;
}

export interface DRPApplication {
  applicationId: string;
  filingDate: Date;
  draftOrderReference: string;
  tpoOrderReference: string;
  assessmentYear: string;
  taxpayer: TaxpayerDetails;
  objections: DRPObjection[];
  groundsOfObjection: string[];
  reliefClaimed: number;
  supportingDocuments: string[];
  status: DisputeStatus;
  timeline: DRPTimeline;
}

export interface DRPObjection {
  objectionNumber: number;
  issueCategory: string;
  briefDescription: string;
  detailedObjection: string;
  legalBasis: string[];
  caseLawCitations: string[];
  reliefSought: number;
}

export interface DRPTimeline {
  filingDate: Date;
  acknowledgementDate?: Date;
  firstHearingDate?: Date;
  subsequentHearings: Date[];
  directionDeadline: Date;
  directionDate?: Date;
  finalAssessmentDeadline: Date;
  currentStatus: DisputeStatus;
}

export interface DRPDirection {
  directionNumber: string;
  directionDate: Date;
  applicationReference: string;
  outcome: "allowed" | "partially_allowed" | "dismissed";
  reliefGranted: number;
  directions: string[];
  issueWiseOutcome: IssueOutcome[];
}

export interface IssueOutcome {
  issueDescription: string;
  taxpayerContention: string;
  departmentContention: string;
  drpFinding: string;
  outcome: "allowed" | "partially_allowed" | "dismissed";
  reliefAmount: number;
}

export interface ITATAppeal {
  appealNumber: string;
  filingDate: Date;
  assessmentYear: string;
  orderAppealed: string;
  orderDate: Date;
  appellant: "taxpayer" | "department";
  taxpayer: TaxpayerDetails;
  groundsOfAppeal: string[];
  reliefClaimed: number;
  fee: number;
  status: DisputeStatus;
  timeline: ITATTimeline;
  stayApplication?: StayApplication;
}

export interface ITATTimeline {
  filingDate: Date;
  acknowledgementDate?: Date;
  crossObjectionDeadline: Date;
  paperBookDeadline: Date;
  hearingDates: Date[];
  orderDate?: Date;
  currentStatus: DisputeStatus;
}

export interface StayApplication {
  applicationDate: Date;
  demandAmount: number;
  paymentOffered: number;
  stayGranted: boolean;
  stayPeriod?: number;
  stayExpiryDate?: Date;
  conditions: string[];
}

export interface GroundsOfAppeal {
  generalGrounds: string[];
  specificGrounds: SpecificGround[];
  reliefPrayer: string;
}

export interface SpecificGround {
  groundNumber: number;
  category: string;
  ground: string;
  subGrounds?: string[];
  relatedLegalSections: string[];
  precedentsCited: string[];
}

export interface Form35Data {
  appellant: TaxpayerDetails;
  respondent: string;
  assessmentYear: string;
  orderAppealed: {
    orderNumber: string;
    orderDate: Date;
    issuingAuthority: string;
  };
  grounds: GroundsOfAppeal;
  statementOfFacts: string;
  reliefClaimed: number;
  fee: number;
  verification: string;
}

export interface Form36Data {
  appellant: TaxpayerDetails;
  respondent: string;
  assessmentYear: string;
  lowerAuthorityOrder: {
    orderNumber: string;
    orderDate: Date;
    issuingAuthority: string;
  };
  grounds: GroundsOfAppeal;
  statementOfFacts: string;
  reliefClaimed: number;
  fee: number;
  verification: string;
  crossObjectionPeriod: number;
}

export interface DRPDocument {
  documentType: FormType;
  generatedDate: Date;
  content: string;
  attachments: string[];
  signatures: string[];
}

export interface EligibilityResult {
  isEligible: boolean;
  eligibilityReasons: string[];
  ineligibilityReasons: string[];
  recommendedPath: string;
}

export interface ProgressTracker {
  applicationId: string;
  currentStage: DisputeStage;
  currentStatus: DisputeStatus;
  completedStages: StageCompletion[];
  pendingActions: PendingAction[];
  upcomingDeadlines: DeadlineAlert[];
  lastUpdated: Date;
}

export interface StageCompletion {
  stage: DisputeStage;
  completedDate: Date;
  outcome: string;
  documents: string[];
}

export interface PendingAction {
  action: string;
  deadline: Date;
  priority: "high" | "medium" | "low";
  responsibleParty: string;
}

export interface DeadlineAlert {
  deadline: Date;
  description: string;
  daysRemaining: number;
  severity: "critical" | "warning" | "info";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  recommendation: string;
}

// =============================================================================
// DISPUTE WORKFLOW ENGINE CLASS
// =============================================================================

export class DisputeWorkflowEngine {
  private currentDate: Date;

  constructor(currentDate?: Date) {
    this.currentDate = currentDate || new Date();
  }

  // ===========================================================================
  // DRP WORKFLOW METHODS
  // ===========================================================================

  /**
   * Create a DRP application from TPO order
   */
  createDRPApplication(
    tpoOrder: TPOOrder,
    draftOrder: DraftAssessmentOrder,
    objections: DRPObjection[]
  ): DRPApplication {
    const filingDate = this.currentDate;
    const timeline = this.calculateDRPTimeline(filingDate);

    const groundsOfObjection = this.generateDRPGrounds(tpoOrder, objections);
    const reliefClaimed = objections.reduce((sum, obj) => sum + obj.reliefSought, 0);

    return {
      applicationId: this.generateApplicationId("DRP", tpoOrder.assessmentYear),
      filingDate,
      draftOrderReference: draftOrder.orderNumber,
      tpoOrderReference: tpoOrder.orderNumber,
      assessmentYear: tpoOrder.assessmentYear,
      taxpayer: tpoOrder.taxpayerDetails,
      objections,
      groundsOfObjection,
      reliefClaimed,
      supportingDocuments: this.identifyRequiredDocuments(tpoOrder, objections),
      status: DisputeStatus.IN_PROGRESS,
      timeline,
    };
  }

  /**
   * Validate DRP eligibility
   */
  validateDRPEligibility(
    tpoOrder: TPOOrder,
    draftOrder: DraftAssessmentOrder
  ): EligibilityResult {
    const eligibilityReasons: string[] = [];
    const ineligibilityReasons: string[] = [];

    // Check filing deadline
    const deadlineCheck = isWithinTimeLimit(
      draftOrder.orderDate,
      this.currentDate,
      DISPUTE_TIMELINES.drp.filingDeadline
    );

    if (deadlineCheck.isValid) {
      eligibilityReasons.push(
        `Filing within ${DISPUTE_TIMELINES.drp.filingDeadline} days deadline (${deadlineCheck.daysRemaining} days remaining)`
      );
    } else {
      ineligibilityReasons.push(
        `Filing deadline exceeded by ${deadlineCheck.daysUsed - DISPUTE_TIMELINES.drp.filingDeadline} days`
      );
    }

    // Check if TP matter
    if (tpoOrder.primaryAdjustment > 0) {
      eligibilityReasons.push("Transfer pricing adjustment exists - DRP route available");
    }

    // Check entity type
    eligibilityReasons.push("Domestic/Foreign company - eligible for DRP");

    // Check exclusions
    DRP_ELIGIBILITY.exclusions.forEach((exclusion) => {
      // In real implementation, would check against actual assessment type
    });

    const isEligible = ineligibilityReasons.length === 0;

    return {
      isEligible,
      eligibilityReasons,
      ineligibilityReasons,
      recommendedPath: isEligible
        ? "DRP route recommended for TP disputes"
        : "Consider condonation application or alternative remedy",
    };
  }

  /**
   * Calculate DRP timeline from filing date
   */
  calculateDRPTimeline(filingDate: Date): DRPTimeline {
    const timeline = getDRPTimeline(filingDate);

    return {
      filingDate,
      directionDeadline: timeline.directionDeadline,
      finalAssessmentDeadline: timeline.finalAssessment,
      subsequentHearings: [],
      currentStatus: DisputeStatus.IN_PROGRESS,
    };
  }

  /**
   * Track DRP progress
   */
  trackDRPProgress(application: DRPApplication): ProgressTracker {
    const completedStages: StageCompletion[] = [
      {
        stage: DisputeStage.DRP_FILING,
        completedDate: application.filingDate,
        outcome: "Application filed successfully",
        documents: application.supportingDocuments,
      },
    ];

    const pendingActions: PendingAction[] = [];
    const upcomingDeadlines: DeadlineAlert[] = [];

    // Calculate days to direction deadline
    const daysToDirection = Math.ceil(
      (application.timeline.directionDeadline.getTime() - this.currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    upcomingDeadlines.push({
      deadline: application.timeline.directionDeadline,
      description: "DRP direction deadline",
      daysRemaining: daysToDirection,
      severity: daysToDirection <= 30 ? "critical" : daysToDirection <= 90 ? "warning" : "info",
    });

    // Check for hearing preparation
    if (application.timeline.firstHearingDate) {
      const daysToHearing = Math.ceil(
        (application.timeline.firstHearingDate.getTime() - this.currentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysToHearing > 0 && daysToHearing <= 14) {
        pendingActions.push({
          action: "Prepare written submissions for DRP hearing",
          deadline: calculateDeadline(this.currentDate, 7),
          priority: "high",
          responsibleParty: "Tax Consultant",
        });
      }
    }

    return {
      applicationId: application.applicationId,
      currentStage: DisputeStage.DRP_HEARING,
      currentStatus: application.status,
      completedStages,
      pendingActions,
      upcomingDeadlines,
      lastUpdated: this.currentDate,
    };
  }

  // ===========================================================================
  // ITAT WORKFLOW METHODS
  // ===========================================================================

  /**
   * Create ITAT appeal from DRP direction or assessment order
   */
  createITATAppeal(
    orderAppealed: DRPDirection | DraftAssessmentOrder,
    taxpayer: TaxpayerDetails,
    assessmentYear: string,
    groundsOfAppeal: GroundsOfAppeal,
    reliefClaimed: number
  ): ITATAppeal {
    const filingDate = this.currentDate;
    const timeline = this.calculateITATTimeline(filingDate);
    const fee = calculateAppealFee(reliefClaimed, "itat");

    const orderNumber =
      "directionNumber" in orderAppealed
        ? orderAppealed.directionNumber
        : orderAppealed.orderNumber;
    const orderDate =
      "directionDate" in orderAppealed
        ? orderAppealed.directionDate
        : orderAppealed.orderDate;

    return {
      appealNumber: this.generateApplicationId("ITAT", assessmentYear),
      filingDate,
      assessmentYear,
      orderAppealed: orderNumber,
      orderDate,
      appellant: "taxpayer",
      taxpayer,
      groundsOfAppeal: this.flattenGrounds(groundsOfAppeal),
      reliefClaimed,
      fee,
      status: DisputeStatus.IN_PROGRESS,
      timeline,
    };
  }

  /**
   * Calculate ITAT timeline from filing date
   */
  calculateITATTimeline(filingDate: Date): ITATTimeline {
    const timeline = getITATTimeline(filingDate);

    return {
      filingDate,
      crossObjectionDeadline: timeline.crossObjectionDeadline,
      paperBookDeadline: timeline.paperBookDeadline,
      hearingDates: [],
      currentStatus: DisputeStatus.IN_PROGRESS,
    };
  }

  /**
   * Prepare grounds of appeal for ITAT
   */
  prepareGroundsOfAppeal(
    tpoOrder: TPOOrder,
    drpDirection?: DRPDirection
  ): GroundsOfAppeal {
    const generalGrounds = [...STANDARD_TP_GROUNDS.general];
    const specificGrounds: SpecificGround[] = [];

    let groundNumber = 1;

    // TPO Order grounds
    STANDARD_TP_GROUNDS.tpoOrder.forEach((ground) => {
      specificGrounds.push({
        groundNumber: groundNumber++,
        category: "TPO Order Challenge",
        ground,
        relatedLegalSections: ["Section 92C", "Section 92CA"],
        precedentsCited: [],
      });
    });

    // MAM Selection grounds
    STANDARD_TP_GROUNDS.mamSelection.forEach((ground) => {
      specificGrounds.push({
        groundNumber: groundNumber++,
        category: "Method Selection",
        ground,
        relatedLegalSections: ["Section 92C(1)", "Rule 10B"],
        precedentsCited: [],
      });
    });

    // Comparables grounds
    STANDARD_TP_GROUNDS.comparables.forEach((ground) => {
      specificGrounds.push({
        groundNumber: groundNumber++,
        category: "Comparables Selection",
        ground,
        relatedLegalSections: ["Rule 10B(2)", "Rule 10B(3)"],
        precedentsCited: [],
      });
    });

    // Add transaction-specific grounds
    tpoOrder.transactionWiseAdjustments.forEach((adj, index) => {
      specificGrounds.push({
        groundNumber: groundNumber++,
        category: "Transaction-Specific",
        ground: `The TPO/AO erred in making an adjustment of Rs. ${adj.adjustmentAmount.toLocaleString()} ` +
          `in respect of ${adj.transactionType} with ${adj.relatedParty}`,
        subGrounds: [
          `The reported price of Rs. ${adj.reportedValue.toLocaleString()} was at arm's length`,
          `The ALP determined at Rs. ${adj.alpDetermined.toLocaleString()} is incorrect`,
        ],
        relatedLegalSections: ["Section 92", "Section 92C"],
        precedentsCited: [],
      });
    });

    return {
      generalGrounds,
      specificGrounds,
      reliefPrayer: `The appellant prays that the TP adjustment of Rs. ${tpoOrder.primaryAdjustment.toLocaleString()} be deleted in full`,
    };
  }

  /**
   * Create stay of demand application
   */
  createStayApplication(
    appeal: ITATAppeal,
    demandAmount: number,
    paymentOffer: number
  ): StayApplication {
    const mandatoryPayment = demandAmount * STAY_OF_DEMAND.itat.mandatoryPayment;

    return {
      applicationDate: this.currentDate,
      demandAmount,
      paymentOffered: Math.max(paymentOffer, mandatoryPayment),
      stayGranted: false,
      conditions: [...STAY_OF_DEMAND.itat.conditions],
    };
  }

  // ===========================================================================
  // FORM GENERATION METHODS
  // ===========================================================================

  /**
   * Generate Form 35 (Appeal to CIT(A))
   */
  generateForm35(
    taxpayer: TaxpayerDetails,
    orderAppealed: { orderNumber: string; orderDate: Date; authority: string },
    assessmentYear: string,
    grounds: GroundsOfAppeal,
    reliefClaimed: number
  ): Form35Data {
    const fee = calculateAppealFee(reliefClaimed, "citA");

    return {
      appellant: taxpayer,
      respondent: "Income Tax Officer / Assessing Officer",
      assessmentYear,
      orderAppealed: {
        orderNumber: orderAppealed.orderNumber,
        orderDate: orderAppealed.orderDate,
        issuingAuthority: orderAppealed.authority,
      },
      grounds,
      statementOfFacts: this.generateStatementOfFacts(assessmentYear, reliefClaimed),
      reliefClaimed,
      fee,
      verification: this.generateVerification(taxpayer),
    };
  }

  /**
   * Generate Form 36 (Appeal to ITAT)
   */
  generateForm36(
    taxpayer: TaxpayerDetails,
    lowerOrder: { orderNumber: string; orderDate: Date; authority: string },
    assessmentYear: string,
    grounds: GroundsOfAppeal,
    reliefClaimed: number
  ): Form36Data {
    const fee = calculateAppealFee(reliefClaimed, "itat");

    return {
      appellant: taxpayer,
      respondent: "Income Tax Officer / Assessing Officer",
      assessmentYear,
      lowerAuthorityOrder: {
        orderNumber: lowerOrder.orderNumber,
        orderDate: lowerOrder.orderDate,
        issuingAuthority: lowerOrder.authority,
      },
      grounds,
      statementOfFacts: this.generateStatementOfFacts(assessmentYear, reliefClaimed),
      reliefClaimed,
      fee,
      verification: this.generateVerification(taxpayer),
      crossObjectionPeriod: DISPUTE_TIMELINES.itat.crossObjection,
    };
  }

  /**
   * Generate DRP objections document
   */
  generateDRPObjections(
    tpoOrder: TPOOrder,
    draftOrder: DraftAssessmentOrder,
    objections: DRPObjection[]
  ): DRPDocument {
    const content = this.formatDRPObjectionsContent(tpoOrder, draftOrder, objections);

    return {
      documentType: FormType.DRP_OBJECTION,
      generatedDate: this.currentDate,
      content,
      attachments: this.identifyRequiredDocuments(tpoOrder, objections),
      signatures: [tpoOrder.taxpayerDetails.name],
    };
  }

  // ===========================================================================
  // VALIDATION METHODS
  // ===========================================================================

  /**
   * Validate DRP application completeness
   */
  validateDRPApplication(application: DRPApplication): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check filing deadline
    const deadlineCheck = isWithinTimeLimit(
      application.timeline.filingDate,
      this.currentDate,
      DISPUTE_TIMELINES.drp.filingDeadline
    );

    if (!deadlineCheck.isValid) {
      errors.push({
        field: "filingDate",
        message: "Filing deadline has passed",
        code: "DEADLINE_EXCEEDED",
      });
    }

    // Check objections
    if (application.objections.length === 0) {
      errors.push({
        field: "objections",
        message: "At least one objection must be raised",
        code: "NO_OBJECTIONS",
      });
    }

    // Check grounds
    if (application.groundsOfObjection.length === 0) {
      errors.push({
        field: "groundsOfObjection",
        message: "Grounds of objection are required",
        code: "NO_GROUNDS",
      });
    }

    // Check supporting documents
    if (application.supportingDocuments.length < 3) {
      warnings.push({
        field: "supportingDocuments",
        message: "Limited supporting documents provided",
        recommendation: "Include TP documentation, FAR analysis, and benchmarking study",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate ITAT appeal completeness
   */
  validateITATAppeal(appeal: ITATAppeal): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check filing deadline
    const deadlineCheck = isWithinTimeLimit(
      appeal.orderDate,
      appeal.filingDate,
      DISPUTE_TIMELINES.itat.filingDeadline
    );

    if (!deadlineCheck.isValid) {
      const condonation = checkCondonationEligibility(
        deadlineCheck.daysUsed - DISPUTE_TIMELINES.itat.filingDeadline
      );

      if (condonation.eligible) {
        warnings.push({
          field: "filingDate",
          message: `Filing delayed by ${deadlineCheck.daysUsed - DISPUTE_TIMELINES.itat.filingDeadline} days`,
          recommendation: `File condonation application with ${condonation.groundsRequired} grounds`,
        });
      } else {
        errors.push({
          field: "filingDate",
          message: "Filing deadline exceeded beyond condonable limit",
          code: "DEADLINE_NOT_CONDONABLE",
        });
      }
    }

    // Check grounds
    if (appeal.groundsOfAppeal.length === 0) {
      errors.push({
        field: "groundsOfAppeal",
        message: "Grounds of appeal are required",
        code: "NO_GROUNDS",
      });
    }

    // Check fee payment
    if (appeal.fee <= 0) {
      errors.push({
        field: "fee",
        message: "Appeal fee must be paid",
        code: "FEE_NOT_PAID",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private generateApplicationId(prefix: string, assessmentYear: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}/${assessmentYear}/${timestamp}`;
  }

  private generateDRPGrounds(
    tpoOrder: TPOOrder,
    objections: DRPObjection[]
  ): string[] {
    const grounds: string[] = [];

    grounds.push(
      `1. The draft assessment order dated ${tpoOrder.orderDate.toLocaleDateString()} ` +
        `is bad in law and liable to be quashed.`
    );

    grounds.push(
      `2. The TPO/AO erred in making a transfer pricing adjustment of ` +
        `Rs. ${tpoOrder.primaryAdjustment.toLocaleString()} without proper appreciation of facts.`
    );

    objections.forEach((obj, index) => {
      grounds.push(`${index + 3}. ${obj.briefDescription}`);
    });

    return grounds;
  }

  private identifyRequiredDocuments(
    tpoOrder: TPOOrder,
    objections: DRPObjection[]
  ): string[] {
    return [
      "Copy of TPO Order",
      "Copy of Draft Assessment Order",
      "Transfer Pricing Documentation",
      "FAR Analysis",
      "Benchmarking Study",
      "Economic Analysis",
      "Financial Statements",
      "Intercompany Agreements",
      "Correspondence with TPO",
      ...objections.flatMap((obj) => obj.legalBasis),
    ];
  }

  private flattenGrounds(grounds: GroundsOfAppeal): string[] {
    const flatGrounds: string[] = [];

    grounds.generalGrounds.forEach((g, i) => {
      flatGrounds.push(`${i + 1}. ${g}`);
    });

    grounds.specificGrounds.forEach((sg) => {
      flatGrounds.push(`${sg.groundNumber}. ${sg.ground}`);
      if (sg.subGrounds) {
        sg.subGrounds.forEach((sub, i) => {
          flatGrounds.push(`   ${sg.groundNumber}.${i + 1} ${sub}`);
        });
      }
    });

    return flatGrounds;
  }

  private generateStatementOfFacts(assessmentYear: string, reliefClaimed: number): string {
    return (
      `STATEMENT OF FACTS\n\n` +
      `1. The appellant is a company engaged in [business activity].\n\n` +
      `2. For the Assessment Year ${assessmentYear}, the appellant filed its return of income ` +
      `declaring total income of Rs. [amount].\n\n` +
      `3. The case was selected for scrutiny and reference was made to the Transfer Pricing Officer.\n\n` +
      `4. The TPO proposed an adjustment of Rs. ${reliefClaimed.toLocaleString()} which was incorporated ` +
      `in the draft/final assessment order.\n\n` +
      `5. Being aggrieved, the appellant is filing this appeal/objection seeking deletion of the ` +
      `said adjustment.`
    );
  }

  private generateVerification(taxpayer: TaxpayerDetails): string {
    return (
      `VERIFICATION\n\n` +
      `I, ${taxpayer.name}, the appellant above named, do hereby verify that the contents of ` +
      `this appeal/objection are true to the best of my knowledge and belief and that nothing ` +
      `material has been concealed therefrom.\n\n` +
      `Verified today, the [date], at [place].\n\n` +
      `Signature: _______________\n` +
      `Name: ${taxpayer.name}\n` +
      `Designation: [Authorized Signatory]`
    );
  }

  private formatDRPObjectionsContent(
    tpoOrder: TPOOrder,
    draftOrder: DraftAssessmentOrder,
    objections: DRPObjection[]
  ): string {
    let content = `OBJECTIONS BEFORE THE DISPUTE RESOLUTION PANEL\n`;
    content += `${"=".repeat(60)}\n\n`;

    content += `To,\nThe Honorable Dispute Resolution Panel\n`;
    content += `[Jurisdiction]\n\n`;

    content += `Subject: Objections under Section 144C(2) of the Income-tax Act, 1961\n`;
    content += `Assessment Year: ${tpoOrder.assessmentYear}\n`;
    content += `PAN: ${tpoOrder.taxpayerDetails.pan}\n`;
    content += `Draft Order Reference: ${draftOrder.orderNumber}\n`;
    content += `TPO Order Reference: ${tpoOrder.orderNumber}\n\n`;

    content += `Respected Members of the Panel,\n\n`;

    content += `The above named assessee hereby submits the following objections against `;
    content += `the proposed variation in the draft assessment order:\n\n`;

    content += `BRIEF FACTS:\n`;
    content += `${"-".repeat(40)}\n`;
    content += `Total TP Adjustment proposed: Rs. ${tpoOrder.primaryAdjustment.toLocaleString()}\n`;
    content += `Method applied by TPO: ${tpoOrder.methodApplied}\n\n`;

    content += `OBJECTIONS:\n`;
    content += `${"-".repeat(40)}\n\n`;

    objections.forEach((obj) => {
      content += `OBJECTION ${obj.objectionNumber}: ${obj.issueCategory}\n`;
      content += `${"~".repeat(40)}\n`;
      content += `${obj.detailedObjection}\n\n`;
      content += `Legal Basis:\n`;
      obj.legalBasis.forEach((basis) => {
        content += `- ${basis}\n`;
      });
      content += `\nCase Law Citations:\n`;
      obj.caseLawCitations.forEach((citation) => {
        content += `- ${citation}\n`;
      });
      content += `\nRelief Sought: Rs. ${obj.reliefSought.toLocaleString()}\n\n`;
    });

    content += `PRAYER:\n`;
    content += `${"-".repeat(40)}\n`;
    content += `In view of the above, the assessee prays that the Honorable Panel may be pleased to:\n`;
    content += `1. Delete the entire TP adjustment of Rs. ${tpoOrder.primaryAdjustment.toLocaleString()}\n`;
    content += `2. Grant such other relief as may be deemed fit and proper\n\n`;

    return content;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createDisputeWorkflowEngine(currentDate?: Date): DisputeWorkflowEngine {
  return new DisputeWorkflowEngine(currentDate);
}

let _disputeWorkflowEngineInstance: DisputeWorkflowEngine | null = null;

export function getDisputeWorkflowEngine(): DisputeWorkflowEngine {
  if (!_disputeWorkflowEngineInstance) {
    _disputeWorkflowEngineInstance = createDisputeWorkflowEngine();
  }
  return _disputeWorkflowEngineInstance;
}
