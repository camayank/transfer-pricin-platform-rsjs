/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Dispute Resolution Timelines & Rules Constants
 *
 * Statutory timelines for DRP, ITAT, and other dispute resolution mechanisms
 * under Indian Income Tax Act and Transfer Pricing regulations.
 * ================================================================================
 */

// =============================================================================
// DISPUTE RESOLUTION STAGES
// =============================================================================

export enum DisputeStage {
  TPO_REFERENCE = "tpo_reference",
  TPO_ORDER = "tpo_order",
  DRAFT_ASSESSMENT = "draft_assessment",
  DRP_FILING = "drp_filing",
  DRP_HEARING = "drp_hearing",
  DRP_DIRECTION = "drp_direction",
  FINAL_ASSESSMENT = "final_assessment",
  CIT_APPEALS = "cit_appeals",
  ITAT_APPEAL = "itat_appeal",
  HIGH_COURT = "high_court",
  SUPREME_COURT = "supreme_court",
}

export enum DisputeStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  PENDING_RESPONSE = "pending_response",
  HEARING_SCHEDULED = "hearing_scheduled",
  AWAITING_ORDER = "awaiting_order",
  COMPLETED = "completed",
  PARTIALLY_ALLOWED = "partially_allowed",
  DISMISSED = "dismissed",
  WITHDRAWN = "withdrawn",
}

export enum FormType {
  FORM_35 = "form_35",
  FORM_35A = "form_35a",
  FORM_36 = "form_36",
  FORM_36A = "form_36a",
  DRP_OBJECTION = "drp_objection",
  WRITTEN_SUBMISSION = "written_submission",
  ADDITIONAL_EVIDENCE = "additional_evidence",
  PAPER_BOOK = "paper_book",
  GROUNDS_OF_APPEAL = "grounds_of_appeal",
}

// =============================================================================
// STATUTORY TIMELINES (in days)
// =============================================================================

export const DISPUTE_TIMELINES = {
  // TPO Proceedings
  tpo: {
    referenceToOrder: 21 * 30, // 21 months (extended deadline)
    standardTimeframe: 60, // 60 days for TPO order after reference
    extensionPeriod: 30, // Additional 30 days if extended
  },

  // Draft Assessment
  draftAssessment: {
    issuanceAfterTPO: 30, // Days after TPO order
    taxpayerResponse: 30, // Days to file DRP/accept
  },

  // DRP (Dispute Resolution Panel)
  drp: {
    filingDeadline: 30, // Days from draft assessment order
    directionDeadline: 9 * 30, // 9 months from filing
    hearingNotice: 21, // Minimum notice for hearing
    additionalEvidence: 7, // Days to file additional evidence
    writtenSubmission: 14, // Days before hearing
  },

  // Final Assessment
  finalAssessment: {
    afterDRPDirection: 30, // Days after DRP direction
    afterTaxpayerAcceptance: 30, // Days after taxpayer accepts draft
    demandNotice: 30, // Days for demand notice
  },

  // CIT(A) Appeals
  citAppeals: {
    filingDeadline: 30, // Days from assessment order (for non-DRP cases)
    disposalTarget: 365, // Target disposal time
    condonationLimit: 365, // Maximum delay condonable
  },

  // ITAT (Income Tax Appellate Tribunal)
  itat: {
    filingDeadline: 60, // Days from assessment order/DRP direction
    crossObjection: 30, // Days from receipt of appeal
    hearingNotice: 21, // Minimum notice period
    stayApplication: 180, // Days for stay (6 months)
    stayExtension: 180, // Additional stay period
    paperBook: 45, // Days before hearing
  },

  // High Court
  highCourt: {
    filingDeadline: 120, // Days from ITAT order
    admissionHearing: 90, // Target for admission
    monetaryLimit: 10000000, // Rs. 1 Cr minimum for High Court
  },

  // Supreme Court
  supremeCourt: {
    filingDeadline: 90, // Days from High Court order (SLP)
    monetaryLimit: 20000000, // Rs. 2 Cr minimum
  },

  // General
  condonation: {
    maxDelay: 365, // Maximum delay that can be condoned
    strongGrounds: 180, // Delay requiring strong grounds
    normalGrounds: 30, // Delay with normal grounds
  },
} as const;

// =============================================================================
// FORM REQUIREMENTS
// =============================================================================

export interface FormRequirement {
  formNumber: string;
  description: string;
  filingAuthority: string;
  fee: number;
  electronicFiling: boolean;
  physicalCopies: number;
  attachments: string[];
  section: string;
}

export const FORM_REQUIREMENTS: Record<FormType, FormRequirement> = {
  [FormType.FORM_35]: {
    formNumber: "35",
    description: "Appeal to CIT(A)",
    filingAuthority: "Commissioner of Income Tax (Appeals)",
    fee: 1000, // For TP matters, varies by disputed amount
    electronicFiling: true,
    physicalCopies: 2,
    attachments: [
      "Copy of assessment order",
      "Grounds of appeal",
      "Statement of facts",
      "Verification",
    ],
    section: "Section 246A",
  },
  [FormType.FORM_35A]: {
    formNumber: "35A",
    description: "Cross Objection before CIT(A)",
    filingAuthority: "Commissioner of Income Tax (Appeals)",
    fee: 500,
    electronicFiling: true,
    physicalCopies: 2,
    attachments: [
      "Copy of appeal memo filed by AO",
      "Grounds of cross objection",
    ],
    section: "Section 246A",
  },
  [FormType.FORM_36]: {
    formNumber: "36",
    description: "Appeal to ITAT",
    filingAuthority: "Income Tax Appellate Tribunal",
    fee: 1500, // Varies by disputed amount
    electronicFiling: true,
    physicalCopies: 4,
    attachments: [
      "Certified copy of CIT(A) order/Assessment order",
      "Grounds of appeal",
      "Statement of facts",
      "Index and paper book",
    ],
    section: "Section 253",
  },
  [FormType.FORM_36A]: {
    formNumber: "36A",
    description: "Cross Objection before ITAT",
    filingAuthority: "Income Tax Appellate Tribunal",
    fee: 500,
    electronicFiling: true,
    physicalCopies: 4,
    attachments: [
      "Copy of appeal memo",
      "Grounds of cross objection",
    ],
    section: "Section 253(4)",
  },
  [FormType.DRP_OBJECTION]: {
    formNumber: "DRP Objection",
    description: "Objections before DRP",
    filingAuthority: "Dispute Resolution Panel",
    fee: 0,
    electronicFiling: true,
    physicalCopies: 3,
    attachments: [
      "Copy of draft assessment order",
      "Copy of TPO order",
      "Objections with grounds",
      "Supporting documents",
    ],
    section: "Section 144C(2)",
  },
  [FormType.WRITTEN_SUBMISSION]: {
    formNumber: "Written Submission",
    description: "Written submissions for hearing",
    filingAuthority: "Relevant authority",
    fee: 0,
    electronicFiling: true,
    physicalCopies: 2,
    attachments: [
      "Detailed legal arguments",
      "Case law citations",
      "Documentary evidence",
    ],
    section: "General",
  },
  [FormType.ADDITIONAL_EVIDENCE]: {
    formNumber: "Additional Evidence",
    description: "Application for additional evidence",
    filingAuthority: "Relevant appellate authority",
    fee: 0,
    electronicFiling: false,
    physicalCopies: 2,
    attachments: [
      "Application under Rule 46A",
      "Affidavit explaining delay",
      "Evidence documents",
    ],
    section: "Rule 46A",
  },
  [FormType.PAPER_BOOK]: {
    formNumber: "Paper Book",
    description: "Compilation of documents for ITAT",
    filingAuthority: "Income Tax Appellate Tribunal",
    fee: 0,
    electronicFiling: false,
    physicalCopies: 4,
    attachments: [
      "Index",
      "Relevant orders",
      "Submissions made",
      "Evidence relied upon",
    ],
    section: "ITAT Rules",
  },
  [FormType.GROUNDS_OF_APPEAL]: {
    formNumber: "Grounds of Appeal",
    description: "Specific grounds challenging the order",
    filingAuthority: "As per appeal forum",
    fee: 0,
    electronicFiling: true,
    physicalCopies: 2,
    attachments: [
      "Detailed grounds",
      "Legal basis for each ground",
    ],
    section: "General",
  },
};

// =============================================================================
// APPEAL FEES
// =============================================================================

export const APPEAL_FEES = {
  citA: {
    upTo100000: 250,
    upTo200000: 500,
    above200000: 1000,
    tpMatters: 1000, // Flat fee for TP matters
  },
  itat: {
    upTo100000: 500,
    upTo200000: 1000,
    above200000: 1500,
    tpMatters: 1500, // Usually higher disputed amounts
  },
  highCourt: {
    courtFee: "As per state court fee rules",
    advocateFee: "As per engagement",
  },
} as const;

// =============================================================================
// DRP ELIGIBILITY CRITERIA
// =============================================================================

export const DRP_ELIGIBILITY = {
  applicableTo: [
    "Foreign company",
    "Domestic company with TP adjustment",
    "Any person with TP order",
  ],
  notApplicableTo: [
    "Individuals (non-TP cases)",
    "HUF (non-TP cases)",
    "Partnership firms (non-TP cases)",
  ],
  minimumAdjustment: 0, // No minimum for TP cases
  exclusions: [
    "Best judgment assessment under Section 144",
    "Assessment where search conducted under Section 132",
  ],
} as const;

// =============================================================================
// STANDARD GROUNDS OF APPEAL (TP MATTERS)
// =============================================================================

export const STANDARD_TP_GROUNDS = {
  general: [
    "The order passed is bad in law and against the principles of natural justice",
    "The assessment order is barred by limitation",
    "The additions made are without proper opportunity of being heard",
  ],
  tpoOrder: [
    "The TPO erred in law and on facts in determining the arm's length price",
    "The TPO erred in rejecting the benchmarking analysis undertaken by the appellant",
    "The TPO erred in not accepting the Most Appropriate Method selected by the appellant",
    "The TPO erred in making comparability adjustments without proper basis",
    "The TPO erred in selecting inappropriate comparables",
    "The TPO erred in rejecting valid comparables provided by the appellant",
  ],
  mamSelection: [
    "The TPO erred in not applying the Most Appropriate Method as per OECD Guidelines",
    "The TPO erred in applying TNMM when CUP method was more appropriate",
    "The TPO erred in not considering internal CUPs available with the appellant",
  ],
  comparables: [
    "The TPO erred in including functionally dissimilar companies in the comparables set",
    "The TPO erred in excluding valid comparables without proper reasoning",
    "The TPO erred in not applying appropriate comparability adjustments",
    "The TPO erred in using single year data instead of multiple year data",
  ],
  adjustments: [
    "The TPO erred in making working capital adjustment without proper basis",
    "The TPO erred in not allowing risk adjustment",
    "The TPO erred in not allowing capacity utilization adjustment",
  ],
  documentation: [
    "The TPO erred in ignoring contemporaneous documentation maintained by the appellant",
    "The TPO erred in drawing adverse inference for minor documentation gaps",
  ],
  penalty: [
    "The penalty levied under Section 271(1)(c) is not justified",
    "The penalty under Section 271AA/271G is excessive and unwarranted",
    "The appellant had reasonable cause and acted in good faith",
  ],
} as const;

// =============================================================================
// STAY OF DEMAND RULES
// =============================================================================

export const STAY_OF_DEMAND = {
  itat: {
    mandatoryPayment: 0.2, // 20% of demand
    conditions: [
      "Prima facie case in favor of appellant",
      "Balance of convenience",
      "Irreparable hardship if stay not granted",
    ],
    duration: 180, // 6 months
    extension: 180, // Additional 6 months
    maxExtensions: 2,
  },
  highCourt: {
    mandatoryPayment: 0.2, // 20% of demand
    conditions: [
      "Substantial question of law",
      "Balance of convenience",
      "Financial hardship",
    ],
  },
  assessingOfficer: {
    partPayment: 0.2, // 20% for installment
    conditions: [
      "Genuine hardship",
      "Pending appeal",
      "Security/bank guarantee",
    ],
  },
} as const;

// =============================================================================
// MONETARY LIMITS FOR APPEALS
// =============================================================================

export const MONETARY_LIMITS = {
  // Minimum tax effect for department to file appeal
  departmentAppeal: {
    itat: 5000000, // Rs. 50 lakhs
    highCourt: 10000000, // Rs. 1 Cr
    supremeCourt: 20000000, // Rs. 2 Cr
  },
  // No monetary limit for taxpayer appeals
  taxpayerAppeal: {
    itat: 0,
    highCourt: 0,
    supremeCourt: 0,
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate deadline from a given date
 */
export function calculateDeadline(
  startDate: Date,
  days: number
): Date {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

/**
 * Check if filing is within time limit
 */
export function isWithinTimeLimit(
  orderDate: Date,
  filingDate: Date,
  limitDays: number
): { isValid: boolean; daysUsed: number; daysRemaining: number } {
  const diffTime = filingDate.getTime() - orderDate.getTime();
  const daysUsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isValid: daysUsed <= limitDays,
    daysUsed,
    daysRemaining: Math.max(0, limitDays - daysUsed),
  };
}

/**
 * Calculate appeal fee based on disputed amount
 */
export function calculateAppealFee(
  disputedAmount: number,
  forum: "citA" | "itat"
): number {
  const fees = APPEAL_FEES[forum];

  if (disputedAmount <= 100000) {
    return fees.upTo100000;
  } else if (disputedAmount <= 200000) {
    return fees.upTo200000;
  } else {
    return fees.above200000;
  }
}

/**
 * Get DRP timeline from filing date
 */
export function getDRPTimeline(filingDate: Date): {
  filingDate: Date;
  expectedHearing: Date;
  directionDeadline: Date;
  finalAssessment: Date;
} {
  const expectedHearing = calculateDeadline(filingDate, 90);
  const directionDeadline = calculateDeadline(filingDate, DISPUTE_TIMELINES.drp.directionDeadline);
  const finalAssessment = calculateDeadline(directionDeadline, DISPUTE_TIMELINES.finalAssessment.afterDRPDirection);

  return {
    filingDate,
    expectedHearing,
    directionDeadline,
    finalAssessment,
  };
}

/**
 * Get ITAT timeline from filing date
 */
export function getITATTimeline(filingDate: Date): {
  filingDate: Date;
  crossObjectionDeadline: Date;
  paperBookDeadline: Date;
  stayExpiry: Date;
} {
  return {
    filingDate,
    crossObjectionDeadline: calculateDeadline(filingDate, DISPUTE_TIMELINES.itat.crossObjection),
    paperBookDeadline: calculateDeadline(filingDate, DISPUTE_TIMELINES.itat.paperBook),
    stayExpiry: calculateDeadline(filingDate, DISPUTE_TIMELINES.itat.stayApplication),
  };
}

/**
 * Check condonation eligibility
 */
export function checkCondonationEligibility(
  delayDays: number
): { eligible: boolean; groundsRequired: "normal" | "strong" | "exceptional" } {
  if (delayDays <= DISPUTE_TIMELINES.condonation.normalGrounds) {
    return { eligible: true, groundsRequired: "normal" };
  } else if (delayDays <= DISPUTE_TIMELINES.condonation.strongGrounds) {
    return { eligible: true, groundsRequired: "strong" };
  } else if (delayDays <= DISPUTE_TIMELINES.condonation.maxDelay) {
    return { eligible: true, groundsRequired: "exceptional" };
  }
  return { eligible: false, groundsRequired: "exceptional" };
}

/**
 * Determine next forum for appeal
 */
export function getNextAppealForum(
  currentStage: DisputeStage
): DisputeStage | null {
  const hierarchy: Record<DisputeStage, DisputeStage | null> = {
    [DisputeStage.TPO_REFERENCE]: DisputeStage.TPO_ORDER,
    [DisputeStage.TPO_ORDER]: DisputeStage.DRAFT_ASSESSMENT,
    [DisputeStage.DRAFT_ASSESSMENT]: DisputeStage.DRP_FILING,
    [DisputeStage.DRP_FILING]: DisputeStage.DRP_HEARING,
    [DisputeStage.DRP_HEARING]: DisputeStage.DRP_DIRECTION,
    [DisputeStage.DRP_DIRECTION]: DisputeStage.FINAL_ASSESSMENT,
    [DisputeStage.FINAL_ASSESSMENT]: DisputeStage.ITAT_APPEAL,
    [DisputeStage.CIT_APPEALS]: DisputeStage.ITAT_APPEAL,
    [DisputeStage.ITAT_APPEAL]: DisputeStage.HIGH_COURT,
    [DisputeStage.HIGH_COURT]: DisputeStage.SUPREME_COURT,
    [DisputeStage.SUPREME_COURT]: null,
  };

  return hierarchy[currentStage];
}

/**
 * Get filing deadline for a stage
 */
export function getFilingDeadline(
  stage: DisputeStage,
  previousOrderDate: Date
): Date | null {
  const deadlines: Partial<Record<DisputeStage, number>> = {
    [DisputeStage.DRP_FILING]: DISPUTE_TIMELINES.drp.filingDeadline,
    [DisputeStage.CIT_APPEALS]: DISPUTE_TIMELINES.citAppeals.filingDeadline,
    [DisputeStage.ITAT_APPEAL]: DISPUTE_TIMELINES.itat.filingDeadline,
    [DisputeStage.HIGH_COURT]: DISPUTE_TIMELINES.highCourt.filingDeadline,
    [DisputeStage.SUPREME_COURT]: DISPUTE_TIMELINES.supremeCourt.filingDeadline,
  };

  const days = deadlines[stage];
  return days ? calculateDeadline(previousOrderDate, days) : null;
}
