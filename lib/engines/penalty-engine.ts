/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Penalty Computation Engine
 *
 * Implements penalty calculations for Transfer Pricing non-compliance.
 * Applicable Sections: 271(1)(c), 271AA, 271BA, 271G, 234A/B/C/D
 * ================================================================================
 */

import {
  PenaltySection,
  CONCEALMENT_PENALTY_RATES,
  CONCEALMENT_PENALTY_CONDITIONS,
  CONCEALMENT_PENALTY_DEFENSES,
  DOCUMENTATION_PENALTY_271AA,
  REPORT_FAILURE_PENALTY_271BA,
  DOCUMENT_FAILURE_PENALTY_271G,
  INTEREST_234A,
  INTEREST_234B,
  INTEREST_234C,
  INTEREST_234D,
  PENALTY_MITIGATION_FACTORS,
  TAX_RATES,
  SECTION_92D_DOCUMENTS,
  calculateConcealmentPenaltyRange,
  calculate271AAPenalty,
  calculate271GPenalty,
  calculate271BAPenalty,
  calculate234AInterest,
  calculate234BInterest,
  calculate234CInterest,
  calculate234DInterest,
  getTaxRate,
  assessPenaltyLikelihood,
  getPenaltySectionDescription,
} from "./constants/penalty-rules";

import { ValidationSeverity } from "./types";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Entity type for tax rate determination
 */
export enum EntityType {
  DOMESTIC_COMPANY = "domestic_company",
  DOMESTIC_COMPANY_OLD = "domestic_company_old",
  FOREIGN_COMPANY = "foreign_company",
  LLP_FIRM = "llp_firm",
  INDIVIDUAL = "individual_highest",
}

/**
 * Input for penalty calculation
 */
export interface PenaltyInput {
  /** Assessment year */
  assessmentYear: string;
  /** Entity type */
  entityType: EntityType;
  /** Primary TP adjustment amount */
  primaryAdjustment: number;
  /** Total income as per return */
  returnedIncome: number;
  /** Assessed income after adjustment */
  assessedIncome: number;
  /** International transaction values */
  transactionValues: TransactionValue[];
  /** Filing compliance */
  filingCompliance: FilingCompliance;
  /** Documentation status */
  documentationStatus: DocumentationStatus;
  /** Advance tax details */
  advanceTaxDetails?: AdvanceTaxDetails;
  /** Mitigation factors present */
  mitigationFactors?: string[];
  /** Aggravating factors present */
  aggravatingFactors?: string[];
}

/**
 * Transaction value details
 */
export interface TransactionValue {
  /** Transaction nature code */
  natureCode: string;
  /** Description */
  description: string;
  /** Transaction value */
  value: number;
  /** Whether documentation maintained */
  documentationMaintained: boolean;
  /** Whether reported in Form 3CEB */
  reportedIn3CEB: boolean;
}

/**
 * Filing compliance status
 */
export interface FilingCompliance {
  /** Whether return filed */
  returnFiled: boolean;
  /** Return filing date */
  returnFilingDate?: Date;
  /** Due date for filing */
  dueDate: Date;
  /** Form 3CEB filed */
  form3CEBFiled: boolean;
  /** Form 3CEB filing date */
  form3CEBFilingDate?: Date;
  /** Master File filed */
  masterFileFiled?: boolean;
  /** CbCR filed */
  cbcrFiled?: boolean;
}

/**
 * Documentation status
 */
export interface DocumentationStatus {
  /** TP documentation maintained */
  tpDocumentationMaintained: boolean;
  /** Contemporaneous documentation */
  isContemporaneous: boolean;
  /** Documents furnished when requested */
  documentsFurnishedOnRequest: boolean;
  /** Information furnished to TPO */
  informationFurnishedToTPO: boolean;
}

/**
 * Advance tax details
 */
export interface AdvanceTaxDetails {
  /** Tax payable on assessed income */
  taxPayable: number;
  /** TDS/TCS collected */
  tdsTcs: number;
  /** Advance tax paid */
  advanceTaxPaid: number;
  /** Advance tax installments */
  installments: AdvanceTaxInstallment[];
  /** Any refund granted */
  refundGranted?: number;
  /** Refund grant date */
  refundDate?: Date;
}

/**
 * Advance tax installment
 */
export interface AdvanceTaxInstallment {
  /** Due date */
  dueDate: Date;
  /** Amount due */
  amountDue: number;
  /** Amount paid */
  amountPaid: number;
  /** Payment date */
  paymentDate?: Date;
}

/**
 * Concealment penalty result
 */
export interface ConcealmentPenaltyResult {
  /** Section */
  section: string;
  /** Whether applicable */
  isApplicable: boolean;
  /** Reason if not applicable */
  nonApplicabilityReason?: string;
  /** Tax evaded amount */
  taxEvaded: number;
  /** Minimum penalty */
  minimumPenalty: number;
  /** Maximum penalty */
  maximumPenalty: number;
  /** Most likely penalty */
  mostLikelyPenalty: number;
  /** Conditions met */
  conditionsMet: string[];
  /** Defenses available */
  defensesAvailable: string[];
  /** Computation details */
  computationDetails: ComputationDetail[];
}

/**
 * Documentation penalty result
 */
export interface DocumentationPenaltyResult {
  /** Section (271AA or 271G) */
  section: string;
  /** Whether applicable */
  isApplicable: boolean;
  /** Reason if not applicable */
  nonApplicabilityReason?: string;
  /** Affected transaction value */
  affectedTransactionValue: number;
  /** Penalty rate */
  penaltyRate: number;
  /** Penalty amount */
  penaltyAmount: number;
  /** Transactions affected */
  transactionsAffected: string[];
  /** Documentation gaps identified */
  documentationGaps: string[];
}

/**
 * Report failure penalty result
 */
export interface ReportFailurePenaltyResult {
  /** Section */
  section: string;
  /** Whether applicable */
  isApplicable: boolean;
  /** Forms not filed */
  formsNotFiled: string[];
  /** Penalty per form */
  penaltyPerForm: number;
  /** Total penalty */
  totalPenalty: number;
}

/**
 * Interest calculation result
 */
export interface InterestResult {
  /** Section */
  section: string;
  /** Whether applicable */
  isApplicable: boolean;
  /** Principal amount */
  principal: number;
  /** Interest rate per month */
  ratePerMonth: number;
  /** Number of months */
  months: number;
  /** Interest amount */
  interestAmount: number;
  /** Calculation period */
  period: { from: Date; to: Date };
  /** Computation details */
  computationDetails: ComputationDetail[];
}

/**
 * Computation detail
 */
export interface ComputationDetail {
  /** Step description */
  description: string;
  /** Formula */
  formula: string;
  /** Value */
  value: number | string;
}

/**
 * Total penalty exposure result
 */
export interface TotalPenaltyExposure {
  /** Assessment year */
  assessmentYear: string;
  /** Entity type */
  entityType: EntityType;
  /** Primary adjustment */
  primaryAdjustment: number;
  /** Concealment penalty */
  concealmentPenalty: ConcealmentPenaltyResult;
  /** Documentation penalty 271AA */
  documentationPenalty271AA: DocumentationPenaltyResult;
  /** Documentation penalty 271G */
  documentationPenalty271G: DocumentationPenaltyResult;
  /** Report failure penalty */
  reportFailurePenalty: ReportFailurePenaltyResult;
  /** Interest 234A */
  interest234A: InterestResult;
  /** Interest 234B */
  interest234B: InterestResult;
  /** Interest 234C */
  interest234C: InterestResult;
  /** Interest 234D */
  interest234D: InterestResult;
  /** Total minimum exposure */
  totalMinimumExposure: number;
  /** Total maximum exposure */
  totalMaximumExposure: number;
  /** Total most likely exposure */
  totalMostLikelyExposure: number;
  /** Summary breakdown */
  summaryBreakdown: ExposureBreakdown[];
  /** Validation issues */
  validationIssues: PenaltyValidationIssue[];
}

/**
 * Exposure breakdown
 */
export interface ExposureBreakdown {
  /** Category */
  category: string;
  /** Section */
  section: string;
  /** Amount */
  amount: number;
  /** Percentage of total */
  percentageOfTotal: number;
}

/**
 * Mitigation analysis result
 */
export interface MitigationAnalysis {
  /** Overall penalty likelihood */
  penaltyLikelihood: "low" | "medium" | "high" | "very_high";
  /** Likelihood score (0-100) */
  likelihoodScore: number;
  /** Reducing factors identified */
  reducingFactors: MitigationFactor[];
  /** Aggravating factors identified */
  aggravatingFactors: MitigationFactor[];
  /** Recommended actions */
  recommendedActions: string[];
  /** Defense strategy */
  defenseStrategy: DefenseStrategy;
}

/**
 * Mitigation factor
 */
export interface MitigationFactor {
  /** Factor name */
  factor: string;
  /** Impact level */
  impact: "low" | "medium" | "high" | "critical";
  /** Description */
  description: string;
  /** Present in this case */
  isPresent: boolean;
}

/**
 * Defense strategy
 */
export interface DefenseStrategy {
  /** Primary defense */
  primaryDefense: string;
  /** Supporting arguments */
  supportingArguments: string[];
  /** Relevant case law */
  relevantCaseLaw: string[];
  /** Documentation needed */
  documentationNeeded: string[];
  /** Success probability */
  successProbability: "low" | "medium" | "high";
}

/**
 * Validation issue
 */
export interface PenaltyValidationIssue {
  /** Field */
  field: string;
  /** Message */
  message: string;
  /** Severity */
  severity: ValidationSeverity;
  /** Code */
  code: string;
}

// =============================================================================
// PENALTY ENGINE CLASS
// =============================================================================

/**
 * Main engine for penalty calculations
 */
export class PenaltyEngine {
  private assessmentYear: string;

  constructor(assessmentYear: string = "2025-26") {
    this.assessmentYear = assessmentYear;
  }

  /**
   * Calculate concealment penalty under Section 271(1)(c)
   */
  calculateConcealmentPenalty(input: PenaltyInput): ConcealmentPenaltyResult {
    const computationDetails: ComputationDetail[] = [];

    // Calculate income concealed
    const incomeConcealed = input.assessedIncome - input.returnedIncome;
    computationDetails.push({
      description: "Income concealed/underreported",
      formula: "Assessed Income - Returned Income",
      value: incomeConcealed,
    });

    // Check if penalty applicable
    if (incomeConcealed <= 0) {
      return {
        section: "271(1)(c)",
        isApplicable: false,
        nonApplicabilityReason: "No income concealment - assessed income not greater than returned income",
        taxEvaded: 0,
        minimumPenalty: 0,
        maximumPenalty: 0,
        mostLikelyPenalty: 0,
        conditionsMet: [],
        defensesAvailable: [],
        computationDetails,
      };
    }

    // Calculate tax evaded
    const taxRate = getTaxRate(input.entityType as keyof typeof TAX_RATES);
    const taxEvaded = incomeConcealed * (taxRate / 100);
    computationDetails.push({
      description: "Tax evaded",
      formula: `Income Concealed × Tax Rate (${taxRate}%)`,
      value: taxEvaded,
    });

    // Calculate penalty range
    const penaltyRange = calculateConcealmentPenaltyRange(taxEvaded);
    computationDetails.push({
      description: "Minimum penalty (100%)",
      formula: "Tax Evaded × 100%",
      value: penaltyRange.minimum,
    });
    computationDetails.push({
      description: "Maximum penalty (300%)",
      formula: "Tax Evaded × 300%",
      value: penaltyRange.maximum,
    });

    // Identify conditions met
    const conditionsMet = this.identifyConditionsMet(input);

    // Identify available defenses
    const defensesAvailable = this.identifyDefenses(input);

    // Determine most likely penalty
    const mostLikelyPenalty = this.estimateMostLikelyPenalty(
      penaltyRange,
      conditionsMet.length,
      defensesAvailable.length
    );

    return {
      section: "271(1)(c)",
      isApplicable: true,
      taxEvaded,
      minimumPenalty: penaltyRange.minimum,
      maximumPenalty: penaltyRange.maximum,
      mostLikelyPenalty,
      conditionsMet,
      defensesAvailable,
      computationDetails,
    };
  }

  /**
   * Calculate documentation penalty under Section 271AA
   */
  calculateDocumentationPenalty(input: PenaltyInput): DocumentationPenaltyResult {
    // Check if documentation was maintained
    if (
      input.documentationStatus.tpDocumentationMaintained &&
      input.documentationStatus.isContemporaneous
    ) {
      return {
        section: "271AA",
        isApplicable: false,
        nonApplicabilityReason: "Contemporaneous TP documentation maintained",
        affectedTransactionValue: 0,
        penaltyRate: 0,
        penaltyAmount: 0,
        transactionsAffected: [],
        documentationGaps: [],
      };
    }

    // Find transactions without proper documentation
    const affectedTransactions = input.transactionValues.filter(
      (t) => !t.documentationMaintained || !t.reportedIn3CEB
    );

    if (affectedTransactions.length === 0) {
      return {
        section: "271AA",
        isApplicable: false,
        nonApplicabilityReason: "All transactions properly documented and reported",
        affectedTransactionValue: 0,
        penaltyRate: 0,
        penaltyAmount: 0,
        transactionsAffected: [],
        documentationGaps: [],
      };
    }

    const affectedValue = affectedTransactions.reduce(
      (sum, t) => sum + t.value,
      0
    );
    const penaltyAmount = calculate271AAPenalty(affectedValue);

    // Identify documentation gaps
    const documentationGaps = this.identifyDocumentationGaps(input);

    return {
      section: "271AA",
      isApplicable: true,
      affectedTransactionValue: affectedValue,
      penaltyRate: DOCUMENTATION_PENALTY_271AA.rate,
      penaltyAmount,
      transactionsAffected: affectedTransactions.map(
        (t) => `${t.natureCode}: ${t.description}`
      ),
      documentationGaps,
    };
  }

  /**
   * Calculate report failure penalty under Section 271BA
   */
  calculateReportFailurePenalty(input: PenaltyInput): ReportFailurePenaltyResult {
    const formsNotFiled: string[] = [];

    if (!input.filingCompliance.form3CEBFiled) {
      formsNotFiled.push("Form 3CEB - Transfer Pricing Audit Report");
    }

    if (input.filingCompliance.masterFileFiled === false) {
      formsNotFiled.push("Form 3CEAA - Master File");
    }

    if (input.filingCompliance.cbcrFiled === false) {
      formsNotFiled.push("Form 3CEAD - Country-by-Country Report");
    }

    if (formsNotFiled.length === 0) {
      return {
        section: "271BA",
        isApplicable: false,
        formsNotFiled: [],
        penaltyPerForm: REPORT_FAILURE_PENALTY_271BA.penaltyPerForm,
        totalPenalty: 0,
      };
    }

    return {
      section: "271BA",
      isApplicable: true,
      formsNotFiled,
      penaltyPerForm: REPORT_FAILURE_PENALTY_271BA.penaltyPerForm,
      totalPenalty: calculate271BAPenalty(formsNotFiled.length),
    };
  }

  /**
   * Calculate interest under Section 234A (delayed return filing)
   */
  calculateInterest234A(input: PenaltyInput): InterestResult {
    if (!input.filingCompliance.returnFiled || !input.advanceTaxDetails) {
      return this.createNonApplicableInterestResult("234A");
    }

    const filingDate = input.filingCompliance.returnFilingDate!;
    const dueDate = input.filingCompliance.dueDate;

    if (filingDate <= dueDate) {
      return {
        section: "234A",
        isApplicable: false,
        principal: 0,
        ratePerMonth: INTEREST_234A.ratePerMonth,
        months: 0,
        interestAmount: 0,
        period: { from: dueDate, to: filingDate },
        computationDetails: [],
      };
    }

    // Calculate delay months (part month as full month)
    const delayDays = Math.ceil(
      (filingDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const delayMonths = Math.ceil(delayDays / 30);

    // Calculate tax payable
    const taxPayable =
      input.advanceTaxDetails.taxPayable -
      input.advanceTaxDetails.tdsTcs -
      input.advanceTaxDetails.advanceTaxPaid;

    if (taxPayable <= 0) {
      return {
        section: "234A",
        isApplicable: false,
        principal: 0,
        ratePerMonth: INTEREST_234A.ratePerMonth,
        months: delayMonths,
        interestAmount: 0,
        period: { from: dueDate, to: filingDate },
        computationDetails: [
          {
            description: "No tax payable after TDS and advance tax",
            formula: "Tax - TDS - Advance Tax ≤ 0",
            value: taxPayable,
          },
        ],
      };
    }

    const interestAmount = calculate234AInterest(taxPayable, delayMonths);

    return {
      section: "234A",
      isApplicable: true,
      principal: taxPayable,
      ratePerMonth: INTEREST_234A.ratePerMonth,
      months: delayMonths,
      interestAmount,
      period: { from: dueDate, to: filingDate },
      computationDetails: [
        {
          description: "Tax payable",
          formula: "Tax - TDS - Advance Tax",
          value: taxPayable,
        },
        {
          description: "Delay in months",
          formula: "Ceiling of days/30",
          value: delayMonths,
        },
        {
          description: "Interest amount",
          formula: `${taxPayable} × ${INTEREST_234A.ratePerMonth}% × ${delayMonths}`,
          value: interestAmount,
        },
      ],
    };
  }

  /**
   * Calculate interest under Section 234B (advance tax shortfall)
   */
  calculateInterest234B(input: PenaltyInput): InterestResult {
    if (!input.advanceTaxDetails) {
      return this.createNonApplicableInterestResult("234B");
    }

    const assessedTax = input.advanceTaxDetails.taxPayable;
    const advanceTaxPaid =
      input.advanceTaxDetails.advanceTaxPaid + input.advanceTaxDetails.tdsTcs;

    // Check if advance tax is less than 90% of assessed tax
    const threshold = assessedTax * 0.9;
    if (advanceTaxPaid >= threshold) {
      return {
        section: "234B",
        isApplicable: false,
        principal: 0,
        ratePerMonth: INTEREST_234B.ratePerMonth,
        months: 0,
        interestAmount: 0,
        period: { from: new Date(), to: new Date() },
        computationDetails: [
          {
            description: "Advance tax meets 90% threshold",
            formula: `Paid (${advanceTaxPaid}) >= 90% of Assessed (${threshold})`,
            value: "N/A",
          },
        ],
      };
    }

    const shortfall = assessedTax - advanceTaxPaid;

    // Calculate months from April 1 to date of determination
    const ayStart = this.getAssessmentYearStartDate();
    const determinationDate =
      input.filingCompliance.returnFilingDate || new Date();
    const monthsDiff = this.calculateMonthsDifference(
      ayStart,
      determinationDate
    );

    const interestAmount = calculate234BInterest(shortfall, monthsDiff);

    return {
      section: "234B",
      isApplicable: true,
      principal: shortfall,
      ratePerMonth: INTEREST_234B.ratePerMonth,
      months: monthsDiff,
      interestAmount,
      period: { from: ayStart, to: determinationDate },
      computationDetails: [
        {
          description: "Assessed tax",
          formula: "Tax liability on assessed income",
          value: assessedTax,
        },
        {
          description: "Advance tax + TDS paid",
          formula: "Total tax already paid",
          value: advanceTaxPaid,
        },
        {
          description: "Shortfall",
          formula: "Assessed - Paid",
          value: shortfall,
        },
        {
          description: "Interest period months",
          formula: "April 1 to determination date",
          value: monthsDiff,
        },
        {
          description: "Interest amount",
          formula: `${shortfall} × ${INTEREST_234B.ratePerMonth}% × ${monthsDiff}`,
          value: interestAmount,
        },
      ],
    };
  }

  /**
   * Calculate interest under Section 234C (advance tax deferment)
   */
  calculateInterest234C(input: PenaltyInput): InterestResult {
    if (
      !input.advanceTaxDetails ||
      !input.advanceTaxDetails.installments ||
      input.advanceTaxDetails.installments.length === 0
    ) {
      return this.createNonApplicableInterestResult("234C");
    }

    const installments = input.advanceTaxDetails.installments;
    const totalTax = input.advanceTaxDetails.taxPayable;

    const shortfallAmounts: { amount: number; months: number }[] = [];
    const computationDetails: ComputationDetail[] = [];

    // Calculate shortfall for each installment
    INTEREST_234C.dueDates.forEach((dueDate, index) => {
      const requiredAmount = (totalTax * dueDate.percentage) / 100;
      const installment = installments[index];

      if (installment) {
        const paidAmount = installment.amountPaid;
        const shortfall = Math.max(0, requiredAmount - paidAmount);

        if (shortfall > 0) {
          const months = parseInt(dueDate.shortfall.split(" ")[0]);
          shortfallAmounts.push({ amount: shortfall, months });

          computationDetails.push({
            description: `${dueDate.date} - Required: ${requiredAmount}, Paid: ${paidAmount}`,
            formula: `Shortfall × ${INTEREST_234C.ratePerMonth}% × ${months} months`,
            value: shortfall * (INTEREST_234C.ratePerMonth / 100) * months,
          });
        }
      }
    });

    if (shortfallAmounts.length === 0) {
      return {
        section: "234C",
        isApplicable: false,
        principal: 0,
        ratePerMonth: INTEREST_234C.ratePerMonth,
        months: 0,
        interestAmount: 0,
        period: { from: new Date(), to: new Date() },
        computationDetails: [
          {
            description: "All advance tax installments paid on time",
            formula: "N/A",
            value: "N/A",
          },
        ],
      };
    }

    const totalInterest = calculate234CInterest(shortfallAmounts);
    const totalShortfall = shortfallAmounts.reduce(
      (sum, s) => sum + s.amount,
      0
    );

    return {
      section: "234C",
      isApplicable: true,
      principal: totalShortfall,
      ratePerMonth: INTEREST_234C.ratePerMonth,
      months: shortfallAmounts.reduce((sum, s) => sum + s.months, 0),
      interestAmount: totalInterest,
      period: {
        from: this.getAssessmentYearStartDate(),
        to: new Date(this.getAssessmentYearStartDate().getFullYear(), 2, 15),
      },
      computationDetails,
    };
  }

  /**
   * Calculate interest under Section 234D (excess refund)
   */
  calculateInterest234D(input: PenaltyInput): InterestResult {
    if (
      !input.advanceTaxDetails ||
      !input.advanceTaxDetails.refundGranted ||
      input.advanceTaxDetails.refundGranted <= 0
    ) {
      return this.createNonApplicableInterestResult("234D");
    }

    const refundGranted = input.advanceTaxDetails.refundGranted;
    const refundDate = input.advanceTaxDetails.refundDate || new Date();

    // Assume regular assessment determines refund was excessive
    const assessmentDate = new Date(); // This would be the actual assessment date
    const months = this.calculateMonthsDifference(refundDate, assessmentDate);

    const interestAmount = calculate234DInterest(refundGranted, months);

    return {
      section: "234D",
      isApplicable: true,
      principal: refundGranted,
      ratePerMonth: INTEREST_234D.ratePerMonth,
      months,
      interestAmount,
      period: { from: refundDate, to: assessmentDate },
      computationDetails: [
        {
          description: "Excess refund amount",
          formula: "Refund granted on provisional basis",
          value: refundGranted,
        },
        {
          description: "Period in months",
          formula: "From refund date to assessment date",
          value: months,
        },
        {
          description: "Interest amount",
          formula: `${refundGranted} × ${INTEREST_234D.ratePerMonth}% × ${months}`,
          value: interestAmount,
        },
      ],
    };
  }

  /**
   * Calculate total penalty exposure
   */
  calculateTotalPenaltyExposure(input: PenaltyInput): TotalPenaltyExposure {
    const concealmentPenalty = this.calculateConcealmentPenalty(input);
    const documentationPenalty271AA = this.calculateDocumentationPenalty(input);
    const documentationPenalty271G = this.calculateDocumentationPenalty271G(input);
    const reportFailurePenalty = this.calculateReportFailurePenalty(input);
    const interest234A = this.calculateInterest234A(input);
    const interest234B = this.calculateInterest234B(input);
    const interest234C = this.calculateInterest234C(input);
    const interest234D = this.calculateInterest234D(input);

    // Calculate totals
    const totalMinimum =
      concealmentPenalty.minimumPenalty +
      documentationPenalty271AA.penaltyAmount +
      documentationPenalty271G.penaltyAmount +
      reportFailurePenalty.totalPenalty +
      interest234A.interestAmount +
      interest234B.interestAmount +
      interest234C.interestAmount +
      interest234D.interestAmount;

    const totalMaximum =
      concealmentPenalty.maximumPenalty +
      documentationPenalty271AA.penaltyAmount +
      documentationPenalty271G.penaltyAmount +
      reportFailurePenalty.totalPenalty +
      interest234A.interestAmount +
      interest234B.interestAmount +
      interest234C.interestAmount +
      interest234D.interestAmount;

    const totalMostLikely =
      concealmentPenalty.mostLikelyPenalty +
      documentationPenalty271AA.penaltyAmount +
      documentationPenalty271G.penaltyAmount +
      reportFailurePenalty.totalPenalty +
      interest234A.interestAmount +
      interest234B.interestAmount +
      interest234C.interestAmount +
      interest234D.interestAmount;

    // Create summary breakdown
    const summaryBreakdown = this.createSummaryBreakdown({
      concealmentPenalty,
      documentationPenalty271AA,
      documentationPenalty271G,
      reportFailurePenalty,
      interest234A,
      interest234B,
      interest234C,
      interest234D,
    }, totalMostLikely);

    // Validate input
    const validationIssues = this.validateInput(input);

    return {
      assessmentYear: input.assessmentYear,
      entityType: input.entityType,
      primaryAdjustment: input.primaryAdjustment,
      concealmentPenalty,
      documentationPenalty271AA,
      documentationPenalty271G,
      reportFailurePenalty,
      interest234A,
      interest234B,
      interest234C,
      interest234D,
      totalMinimumExposure: totalMinimum,
      totalMaximumExposure: totalMaximum,
      totalMostLikelyExposure: totalMostLikely,
      summaryBreakdown,
      validationIssues,
    };
  }

  /**
   * Assess penalty mitigation
   */
  assessPenaltyMitigation(exposure: TotalPenaltyExposure): MitigationAnalysis {
    // Identify reducing factors
    const reducingFactors: MitigationFactor[] = PENALTY_MITIGATION_FACTORS.reducingFactors.map(
      (f) => ({
        factor: f.factor,
        impact: f.impact,
        description: f.description,
        isPresent: this.isFactorPresent(f.factor, exposure),
      })
    );

    // Identify aggravating factors
    const aggravatingFactors: MitigationFactor[] = PENALTY_MITIGATION_FACTORS.aggravatingFactors.map(
      (f) => ({
        factor: f.factor,
        impact: f.impact,
        description: f.description,
        isPresent: this.isFactorPresent(f.factor, exposure),
      })
    );

    const reducingCount = reducingFactors.filter((f) => f.isPresent).length;
    const aggravatingCount = aggravatingFactors.filter((f) => f.isPresent).length;

    const likelihood = assessPenaltyLikelihood(reducingCount, aggravatingCount);

    // Generate defense strategy
    const defenseStrategy = this.generateDefenseStrategy(
      exposure,
      reducingFactors.filter((f) => f.isPresent) as MitigationFactor[]
    );

    // Recommended actions
    const recommendedActions = this.generateRecommendedActions(
      exposure,
      likelihood.likelihood
    );

    return {
      penaltyLikelihood: likelihood.likelihood,
      likelihoodScore: likelihood.score,
      reducingFactors,
      aggravatingFactors,
      recommendedActions,
      defenseStrategy,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private calculateDocumentationPenalty271G(
    input: PenaltyInput
  ): DocumentationPenaltyResult {
    if (
      input.documentationStatus.documentsFurnishedOnRequest &&
      input.documentationStatus.informationFurnishedToTPO
    ) {
      return {
        section: "271G",
        isApplicable: false,
        nonApplicabilityReason: "All requested documents and information furnished",
        affectedTransactionValue: 0,
        penaltyRate: 0,
        penaltyAmount: 0,
        transactionsAffected: [],
        documentationGaps: [],
      };
    }

    const affectedValue = input.transactionValues.reduce(
      (sum, t) => sum + t.value,
      0
    );
    const penaltyAmount = calculate271GPenalty(affectedValue);

    return {
      section: "271G",
      isApplicable: true,
      affectedTransactionValue: affectedValue,
      penaltyRate: DOCUMENT_FAILURE_PENALTY_271G.rate,
      penaltyAmount,
      transactionsAffected: input.transactionValues.map(
        (t) => `${t.natureCode}: ${t.description}`
      ),
      documentationGaps: [
        "Failure to furnish documents/information to AO/TPO when requested",
      ],
    };
  }

  private identifyConditionsMet(input: PenaltyInput): string[] {
    const conditions: string[] = [];

    if (input.primaryAdjustment > 0) {
      conditions.push("Transfer pricing adjustment sustained");
    }

    if (!input.documentationStatus.tpDocumentationMaintained) {
      conditions.push("TP documentation not maintained");
    }

    if (!input.documentationStatus.isContemporaneous) {
      conditions.push("Documentation not contemporaneous");
    }

    return conditions;
  }

  private identifyDefenses(input: PenaltyInput): string[] {
    const defenses: string[] = [];

    if (input.documentationStatus.tpDocumentationMaintained) {
      defenses.push("Contemporaneous documentation maintained");
    }

    if (input.documentationStatus.documentsFurnishedOnRequest) {
      defenses.push("Full cooperation during proceedings");
    }

    if (input.mitigationFactors?.includes("professional_advice")) {
      defenses.push("Reliance on professional advice in good faith");
    }

    return defenses;
  }

  private identifyDocumentationGaps(input: PenaltyInput): string[] {
    const gaps: string[] = [];

    if (!input.documentationStatus.tpDocumentationMaintained) {
      gaps.push(...SECTION_92D_DOCUMENTS);
    } else if (!input.documentationStatus.isContemporaneous) {
      gaps.push("Documentation not maintained contemporaneously");
    }

    input.transactionValues.forEach((t) => {
      if (!t.documentationMaintained) {
        gaps.push(`Documentation for ${t.natureCode}: ${t.description}`);
      }
      if (!t.reportedIn3CEB) {
        gaps.push(`Form 3CEB reporting for ${t.natureCode}: ${t.description}`);
      }
    });

    return [...new Set(gaps)];
  }

  private estimateMostLikelyPenalty(
    range: { minimum: number; maximum: number },
    conditionsCount: number,
    defensesCount: number
  ): number {
    // Base is minimum penalty
    let factor = 1;

    // Increase factor based on conditions
    factor += conditionsCount * 0.2;

    // Decrease factor based on defenses
    factor -= defensesCount * 0.15;

    // Clamp factor between 1 and 3
    factor = Math.max(1, Math.min(3, factor));

    return range.minimum * factor;
  }

  private createNonApplicableInterestResult(section: string): InterestResult {
    return {
      section,
      isApplicable: false,
      principal: 0,
      ratePerMonth: 0,
      months: 0,
      interestAmount: 0,
      period: { from: new Date(), to: new Date() },
      computationDetails: [],
    };
  }

  private getAssessmentYearStartDate(): Date {
    const year = parseInt(this.assessmentYear.split("-")[0]);
    return new Date(year, 3, 1); // April 1
  }

  private calculateMonthsDifference(from: Date, to: Date): number {
    const months =
      (to.getFullYear() - from.getFullYear()) * 12 +
      (to.getMonth() - from.getMonth());
    const dayDiff = to.getDate() - from.getDate();

    // Part of month as full month
    return dayDiff > 0 ? months + 1 : Math.max(0, months);
  }

  private createSummaryBreakdown(
    penalties: {
      concealmentPenalty: ConcealmentPenaltyResult;
      documentationPenalty271AA: DocumentationPenaltyResult;
      documentationPenalty271G: DocumentationPenaltyResult;
      reportFailurePenalty: ReportFailurePenaltyResult;
      interest234A: InterestResult;
      interest234B: InterestResult;
      interest234C: InterestResult;
      interest234D: InterestResult;
    },
    total: number
  ): ExposureBreakdown[] {
    const breakdown: ExposureBreakdown[] = [];

    if (penalties.concealmentPenalty.mostLikelyPenalty > 0) {
      breakdown.push({
        category: "Concealment Penalty",
        section: "271(1)(c)",
        amount: penalties.concealmentPenalty.mostLikelyPenalty,
        percentageOfTotal:
          total > 0
            ? (penalties.concealmentPenalty.mostLikelyPenalty / total) * 100
            : 0,
      });
    }

    if (penalties.documentationPenalty271AA.penaltyAmount > 0) {
      breakdown.push({
        category: "Documentation Penalty",
        section: "271AA",
        amount: penalties.documentationPenalty271AA.penaltyAmount,
        percentageOfTotal:
          total > 0
            ? (penalties.documentationPenalty271AA.penaltyAmount / total) * 100
            : 0,
      });
    }

    if (penalties.documentationPenalty271G.penaltyAmount > 0) {
      breakdown.push({
        category: "Information Failure Penalty",
        section: "271G",
        amount: penalties.documentationPenalty271G.penaltyAmount,
        percentageOfTotal:
          total > 0
            ? (penalties.documentationPenalty271G.penaltyAmount / total) * 100
            : 0,
      });
    }

    if (penalties.reportFailurePenalty.totalPenalty > 0) {
      breakdown.push({
        category: "Report Failure Penalty",
        section: "271BA",
        amount: penalties.reportFailurePenalty.totalPenalty,
        percentageOfTotal:
          total > 0
            ? (penalties.reportFailurePenalty.totalPenalty / total) * 100
            : 0,
      });
    }

    const totalInterest =
      penalties.interest234A.interestAmount +
      penalties.interest234B.interestAmount +
      penalties.interest234C.interestAmount +
      penalties.interest234D.interestAmount;

    if (totalInterest > 0) {
      breakdown.push({
        category: "Interest (234A/B/C/D)",
        section: "234A/B/C/D",
        amount: totalInterest,
        percentageOfTotal: total > 0 ? (totalInterest / total) * 100 : 0,
      });
    }

    return breakdown;
  }

  private validateInput(input: PenaltyInput): PenaltyValidationIssue[] {
    const issues: PenaltyValidationIssue[] = [];

    if (!input.assessmentYear) {
      issues.push({
        field: "assessmentYear",
        message: "Assessment year is required",
        severity: ValidationSeverity.ERROR,
        code: "PEN001",
      });
    }

    if (input.primaryAdjustment === undefined) {
      issues.push({
        field: "primaryAdjustment",
        message: "Primary adjustment amount is required",
        severity: ValidationSeverity.ERROR,
        code: "PEN002",
      });
    }

    if (!input.transactionValues || input.transactionValues.length === 0) {
      issues.push({
        field: "transactionValues",
        message: "At least one transaction value is required",
        severity: ValidationSeverity.WARNING,
        code: "PEN003",
      });
    }

    return issues;
  }

  private isFactorPresent(factor: string, exposure: TotalPenaltyExposure): boolean {
    // Logic to determine if a factor is present based on exposure data
    switch (factor) {
      case "Contemporaneous documentation":
        return !exposure.documentationPenalty271AA.isApplicable;
      case "Timely compliance":
        return !exposure.interest234A.isApplicable;
      case "No documentation":
        return exposure.documentationPenalty271AA.isApplicable;
      default:
        return false;
    }
  }

  private generateDefenseStrategy(
    exposure: TotalPenaltyExposure,
    presentFactors: MitigationFactor[]
  ): DefenseStrategy {
    const primaryDefense =
      presentFactors.length > 0
        ? `Rely on ${presentFactors[0].factor}`
        : "Challenge the underlying adjustment on merits";

    return {
      primaryDefense,
      supportingArguments: presentFactors.map((f) => f.description),
      relevantCaseLaw: [
        "CIT vs. Reliance Petroproducts - Explanation of bonafide claim",
        "Price Waterhouse vs. CIT - Incorrect claim vs. concealment",
      ],
      documentationNeeded: [
        "TP documentation",
        "Board minutes",
        "Expert opinions",
        "Correspondence with AE",
      ],
      successProbability:
        presentFactors.length >= 3
          ? "high"
          : presentFactors.length >= 1
            ? "medium"
            : "low",
    };
  }

  private generateRecommendedActions(
    exposure: TotalPenaltyExposure,
    likelihood: string
  ): string[] {
    const actions: string[] = [];

    if (likelihood === "high" || likelihood === "very_high") {
      actions.push("Engage penalty specialist immediately");
      actions.push("Prepare detailed defense documentation");
      actions.push("Consider voluntary disclosure if applicable");
    }

    if (exposure.concealmentPenalty.isApplicable) {
      actions.push("Prepare bonafide explanation for TP position");
      actions.push("Gather evidence of reasonable cause");
    }

    if (exposure.documentationPenalty271AA.isApplicable) {
      actions.push("Complete TP documentation retrospectively");
      actions.push("Document reasons for any gaps");
    }

    actions.push("Review appeal options if adjustment is disputed");
    actions.push("Calculate cost-benefit of settlement vs. litigation");

    return actions;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new PenaltyEngine instance
 */
export function createPenaltyEngine(
  assessmentYear: string = "2025-26"
): PenaltyEngine {
  return new PenaltyEngine(assessmentYear);
}

// =============================================================================
// RE-EXPORT TYPES AND CONSTANTS
// =============================================================================

export {
  PenaltySection,
  CONCEALMENT_PENALTY_RATES,
  CONCEALMENT_PENALTY_CONDITIONS,
  CONCEALMENT_PENALTY_DEFENSES,
  DOCUMENTATION_PENALTY_271AA,
  REPORT_FAILURE_PENALTY_271BA,
  DOCUMENT_FAILURE_PENALTY_271G,
  INTEREST_234A,
  INTEREST_234B,
  INTEREST_234C,
  INTEREST_234D,
  PENALTY_MITIGATION_FACTORS,
  TAX_RATES,
  SECTION_92D_DOCUMENTS,
  getPenaltySectionDescription,
} from "./constants/penalty-rules";
