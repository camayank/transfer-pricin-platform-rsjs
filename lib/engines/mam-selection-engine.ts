/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * MAM (Most Appropriate Method) Selection Engine
 *
 * Implements OECD-compliant Most Appropriate Method selection with
 * decision tree logic, suitability scoring, and justification generation.
 *
 * Based on: OECD Transfer Pricing Guidelines 2022, Chapter II
 * Reference: Section 92C of Income Tax Act, 1961
 * ================================================================================
 */

import {
  TPMethod,
  MethodCategory,
  MethodDetails,
  TP_METHOD_DETAILS,
  MAM_SELECTION_FACTORS,
  TRANSACTION_METHOD_MAPPING,
  FUNCTIONAL_PROFILE_MAPPING,
  METHOD_REJECTION_RATIONALES,
  getMethodDetails,
  getPreferredMethods,
  getRejectionRationale,
  getAllMethods,
  getMethodCategory,
  getMethodHierarchyScore,
} from "./constants/mam-criteria";

import { ValidationSeverity } from "./types";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Transaction type for MAM selection
 */
export enum TransactionType {
  TANGIBLE_GOODS = "tangible_goods",
  SERVICES = "services",
  INTANGIBLES = "intangibles",
  FINANCIAL = "financial",
  COST_SHARING = "cost_sharing",
}

/**
 * Functional profile of tested party
 */
export enum FunctionalProfile {
  LIMITED_RISK_DISTRIBUTOR = "limited_risk_distributor",
  FULL_FLEDGED_DISTRIBUTOR = "full_fledged_distributor",
  CONTRACT_MANUFACTURER = "contract_manufacturer",
  FULL_FLEDGED_MANUFACTURER = "full_fledged_manufacturer",
  CONTRACT_SERVICE_PROVIDER = "contract_service_provider",
  FULL_FLEDGED_SERVICE_PROVIDER = "full_fledged_service_provider",
  CONTRACT_RD_PROVIDER = "contract_rd_provider",
  FULL_FLEDGED_RD_PROVIDER = "full_fledged_rd_provider",
  IP_OWNER = "ip_owner",
  LICENSOR = "licensor",
  LICENSEE = "licensee",
}

/**
 * Input for MAM selection
 */
export interface MAMSelectionInput {
  /** Transaction type */
  transactionType: TransactionType;
  /** Transaction sub-type (more specific) */
  transactionSubType?: string;
  /** Transaction description */
  transactionDescription: string;
  /** Nature code (Form 3CEB) */
  natureCode?: string;
  /** Functional profile of tested party */
  functionalProfile: FunctionalProfile;
  /** Functions performed */
  functionsPerformed: string[];
  /** Assets employed */
  assetsEmployed: string[];
  /** Risks assumed */
  risksAssumed: string[];
  /** Whether intangibles involved */
  intangiblesInvolved: boolean;
  /** Type of intangibles if involved */
  intangibleType?: string;
  /** Whether unique intangibles */
  uniqueIntangibles?: boolean;
  /** Whether internal CUPs available */
  internalCUPsAvailable: boolean;
  /** Whether external CUPs available */
  externalCUPsAvailable: boolean;
  /** Data availability assessment */
  dataAvailability: DataAvailability;
  /** Tested party selection */
  testedParty: "indian_entity" | "foreign_ae";
  /** Industry */
  industry?: string;
}

/**
 * Data availability assessment
 */
export interface DataAvailability {
  /** Transaction price data available */
  priceData: boolean;
  /** Gross margin data available */
  grossMarginData: boolean;
  /** Net margin data available */
  netMarginData: boolean;
  /** Combined profit data available */
  combinedProfitData: boolean;
  /** Comparable companies database access */
  comparableDatabaseAccess: boolean;
  /** Quality of available data */
  dataQuality: "high" | "medium" | "low";
}

/**
 * Result of MAM selection
 */
export interface MAMSelectionResult {
  /** Selected most appropriate method */
  selectedMethod: TPMethod;
  /** Method details */
  methodDetails: MethodDetails;
  /** Method suitability score (0-100) */
  suitabilityScore: number;
  /** Method ranking */
  methodRanking: MethodRanking[];
  /** Selection justification */
  justification: string;
  /** Rejection rationales for other methods */
  rejectionRationales: MethodRejection[];
  /** Comparability factors assessment */
  comparabilityAssessment: ComparabilityAssessment;
  /** Recommended PLI if TNMM */
  recommendedPLI?: RecommendedPLI;
  /** Decision factors evaluated */
  decisionFactors: DecisionFactor[];
  /** Validation issues */
  validationIssues: MAMValidationIssue[];
}

/**
 * Method ranking entry
 */
export interface MethodRanking {
  /** Method */
  method: TPMethod;
  /** Rank (1 = most appropriate) */
  rank: number;
  /** Suitability score */
  score: number;
  /** Brief reason */
  reason: string;
  /** Is selected method */
  isSelected: boolean;
}

/**
 * Method rejection entry
 */
export interface MethodRejection {
  /** Rejected method */
  method: TPMethod;
  /** Rejection rationale */
  rationale: string;
  /** OECD reference */
  oecdReference?: string;
  /** Key factors for rejection */
  keyFactors: string[];
}

/**
 * Comparability assessment
 */
export interface ComparabilityAssessment {
  /** Product/service comparability */
  productComparability: ComparabilityFactor;
  /** Functional comparability */
  functionalComparability: ComparabilityFactor;
  /** Contractual comparability */
  contractualComparability: ComparabilityFactor;
  /** Economic circumstances comparability */
  economicComparability: ComparabilityFactor;
  /** Business strategies comparability */
  strategyComparability: ComparabilityFactor;
  /** Overall comparability score */
  overallScore: number;
}

/**
 * Comparability factor
 */
export interface ComparabilityFactor {
  /** Factor name */
  factor: string;
  /** Score (0-10) */
  score: number;
  /** Assessment */
  assessment: string;
  /** Adjustments needed */
  adjustmentsNeeded?: string[];
}

/**
 * Recommended PLI
 */
export interface RecommendedPLI {
  /** PLI code */
  code: string;
  /** PLI name */
  name: string;
  /** Formula */
  formula: string;
  /** Rationale for selection */
  rationale: string;
  /** Alternative PLIs */
  alternatives: string[];
}

/**
 * Decision factor
 */
export interface DecisionFactor {
  /** Factor name */
  factor: string;
  /** OECD reference */
  oecdRef: string;
  /** Assessment */
  assessment: string;
  /** Impact on method selection */
  impact: "supports" | "neutral" | "against";
  /** Methods supported */
  methodsSupported: TPMethod[];
}

/**
 * Validation issue
 */
export interface MAMValidationIssue {
  /** Field */
  field: string;
  /** Message */
  message: string;
  /** Severity */
  severity: ValidationSeverity;
  /** Code */
  code: string;
}

/**
 * Method suitability evaluation
 */
export interface SuitabilityScore {
  /** Method */
  method: TPMethod;
  /** Overall score */
  overallScore: number;
  /** Component scores */
  componentScores: {
    transactionFit: number;
    dataAvailability: number;
    reliabilityLevel: number;
    comparabilityDegree: number;
    oecdPreference: number;
  };
  /** Strengths identified */
  strengths: string[];
  /** Weaknesses identified */
  weaknesses: string[];
}

// =============================================================================
// MAM SELECTION ENGINE CLASS
// =============================================================================

/**
 * Main engine for Most Appropriate Method selection
 */
export class MAMSelectionEngine {
  /**
   * Select the most appropriate method for a transaction
   */
  selectMostAppropriateMethod(input: MAMSelectionInput): MAMSelectionResult {
    const validationIssues = this.validateInput(input);

    // Evaluate suitability of each method
    const suitabilityScores = this.evaluateAllMethods(input);

    // Rank methods by suitability
    const methodRanking = this.rankMethods(suitabilityScores);

    // Select the best method
    const selectedMethod = methodRanking[0].method;
    const suitabilityScore = methodRanking[0].score;

    // Generate justification
    const justification = this.generateMethodJustification(
      selectedMethod,
      input,
      methodRanking
    );

    // Generate rejection rationales
    const rejectionRationales = this.generateRejectionRationales(
      selectedMethod,
      methodRanking,
      input
    );

    // Assess comparability
    const comparabilityAssessment = this.assessComparabilityFactors(input);

    // Get recommended PLI if TNMM
    const recommendedPLI =
      selectedMethod === TPMethod.TNMM
        ? this.getRecommendedPLI(input)
        : undefined;

    // Evaluate decision factors
    const decisionFactors = this.evaluateDecisionFactors(input, selectedMethod);

    return {
      selectedMethod,
      methodDetails: getMethodDetails(selectedMethod),
      suitabilityScore,
      methodRanking,
      justification,
      rejectionRationales,
      comparabilityAssessment,
      recommendedPLI,
      decisionFactors,
      validationIssues,
    };
  }

  /**
   * Evaluate suitability of a specific method
   */
  evaluateMethodSuitability(
    method: TPMethod,
    input: MAMSelectionInput
  ): SuitabilityScore {
    const componentScores = {
      transactionFit: this.scoreTransactionFit(method, input),
      dataAvailability: this.scoreDataAvailability(method, input),
      reliabilityLevel: this.scoreReliability(method, input),
      comparabilityDegree: this.scoreComparability(method, input),
      oecdPreference: this.scoreOECDPreference(method, input),
    };

    // Weighted average
    const weights = {
      transactionFit: 0.25,
      dataAvailability: 0.25,
      reliabilityLevel: 0.20,
      comparabilityDegree: 0.20,
      oecdPreference: 0.10,
    };

    const overallScore =
      componentScores.transactionFit * weights.transactionFit +
      componentScores.dataAvailability * weights.dataAvailability +
      componentScores.reliabilityLevel * weights.reliabilityLevel +
      componentScores.comparabilityDegree * weights.comparabilityDegree +
      componentScores.oecdPreference * weights.oecdPreference;

    const methodDetails = getMethodDetails(method);
    const strengths = this.identifyStrengths(method, input, componentScores);
    const weaknesses = this.identifyWeaknesses(method, input, componentScores);

    return {
      method,
      overallScore,
      componentScores,
      strengths,
      weaknesses,
    };
  }

  /**
   * Rank methods by reliability
   */
  rankMethodsByReliability(input: MAMSelectionInput): MethodRanking[] {
    const scores = this.evaluateAllMethods(input);
    return this.rankMethods(scores);
  }

  /**
   * Assess comparability factors for the transaction
   */
  assessComparabilityFactors(
    input: MAMSelectionInput
  ): ComparabilityAssessment {
    return {
      productComparability: this.assessProductComparability(input),
      functionalComparability: this.assessFunctionalComparability(input),
      contractualComparability: this.assessContractualComparability(input),
      economicComparability: this.assessEconomicComparability(input),
      strategyComparability: this.assessStrategyComparability(input),
      overallScore: this.calculateOverallComparability(input),
    };
  }

  /**
   * Generate justification for method selection
   */
  generateMethodJustification(
    method: TPMethod,
    ranking: MethodRanking[]
  ): string;
  generateMethodJustification(
    method: TPMethod,
    input: MAMSelectionInput,
    ranking: MethodRanking[]
  ): string;
  generateMethodJustification(
    method: TPMethod,
    inputOrRanking: MAMSelectionInput | MethodRanking[],
    ranking?: MethodRanking[]
  ): string {
    const actualRanking = Array.isArray(inputOrRanking) ? inputOrRanking : ranking!;
    const input = Array.isArray(inputOrRanking) ? undefined : inputOrRanking;

    const methodDetails = getMethodDetails(method);
    const methodRank = actualRanking.find((r) => r.method === method);

    let justification = `The ${methodDetails.fullName} (${method}) has been selected as the Most Appropriate Method `;
    justification += `for the ${input?.transactionType || "transaction"} `;
    justification += `based on the following analysis:\n\n`;

    // Transaction nature fit
    justification += `1. TRANSACTION NATURE: The ${method} is well-suited for ${methodDetails.applicableTo.slice(0, 2).join(", ")}. `;
    justification += `This aligns with the current transaction profile.\n\n`;

    // Data availability
    justification += `2. DATA AVAILABILITY: Reliable data is available to apply the ${method}. `;
    justification += `${methodDetails.dataRequirements.slice(0, 2).join("; ")}.\n\n`;

    // Comparability
    justification += `3. COMPARABILITY: The degree of comparability between the controlled transaction `;
    justification += `and potential comparables supports the use of ${method}.\n\n`;

    // OECD hierarchy
    const hierarchyScore = getMethodHierarchyScore(method);
    if (hierarchyScore <= 2) {
      justification += `4. OECD PREFERENCE: ${method} is a traditional transaction method preferred under OECD Guidelines `;
      justification += `when reliable comparables are available.\n\n`;
    } else if (method === TPMethod.TNMM) {
      justification += `4. PRACTICAL APPLICABILITY: While TNMM is a transactional profit method, it provides `;
      justification += `the most reliable results given the practical limitations of traditional methods.\n\n`;
    }

    // Score
    justification += `The method achieved a suitability score of ${methodRank?.score.toFixed(0) || "N/A"}/100, `;
    justification += `ranking ${methodRank?.rank || "first"} among all evaluated methods.`;

    return justification;
  }

  /**
   * Generate rejection rationale for a method
   */
  generateRejectionRationale(
    method: TPMethod,
    input: MAMSelectionInput
  ): string {
    return getRejectionRationale(method, input.transactionDescription);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private validateInput(input: MAMSelectionInput): MAMValidationIssue[] {
    const issues: MAMValidationIssue[] = [];

    if (!input.transactionType) {
      issues.push({
        field: "transactionType",
        message: "Transaction type is required",
        severity: ValidationSeverity.ERROR,
        code: "MAM001",
      });
    }

    if (!input.functionalProfile) {
      issues.push({
        field: "functionalProfile",
        message: "Functional profile is required for method selection",
        severity: ValidationSeverity.ERROR,
        code: "MAM002",
      });
    }

    if (!input.functionsPerformed || input.functionsPerformed.length === 0) {
      issues.push({
        field: "functionsPerformed",
        message: "Functions performed should be specified for FAR analysis",
        severity: ValidationSeverity.WARNING,
        code: "MAM003",
      });
    }

    if (!input.dataAvailability) {
      issues.push({
        field: "dataAvailability",
        message: "Data availability assessment is required",
        severity: ValidationSeverity.WARNING,
        code: "MAM004",
      });
    }

    return issues;
  }

  private evaluateAllMethods(input: MAMSelectionInput): SuitabilityScore[] {
    return getAllMethods().map((method) =>
      this.evaluateMethodSuitability(method, input)
    );
  }

  private rankMethods(scores: SuitabilityScore[]): MethodRanking[] {
    const sorted = [...scores].sort((a, b) => b.overallScore - a.overallScore);

    return sorted.map((score, index) => ({
      method: score.method,
      rank: index + 1,
      score: score.overallScore,
      reason: this.getBriefReason(score),
      isSelected: index === 0,
    }));
  }

  private scoreTransactionFit(method: TPMethod, input: MAMSelectionInput): number {
    let score = 50; // Base score

    // Check if method is in preferred list for transaction type
    const transactionKey = this.getTransactionKey(input);
    const mapping = TRANSACTION_METHOD_MAPPING[transactionKey];
    if (mapping) {
      const index = mapping.preferredMethods.indexOf(method);
      if (index === 0) score = 100;
      else if (index === 1) score = 80;
      else if (index === 2) score = 60;
      else if (index < 0) score = 30;
    }

    // Adjust based on functional profile
    const profileMapping = FUNCTIONAL_PROFILE_MAPPING[input.functionalProfile];
    if (profileMapping && profileMapping.methods.includes(method)) {
      score = Math.min(100, score + 20);
    }

    return score;
  }

  private scoreDataAvailability(method: TPMethod, input: MAMSelectionInput): number {
    let score = 50;
    const data = input.dataAvailability;

    switch (method) {
      case TPMethod.CUP:
        if (input.internalCUPsAvailable) score = 100;
        else if (input.externalCUPsAvailable) score = 80;
        else if (data.priceData) score = 60;
        else score = 20;
        break;

      case TPMethod.RPM:
        if (data.grossMarginData && data.comparableDatabaseAccess) score = 85;
        else if (data.grossMarginData) score = 65;
        else score = 30;
        break;

      case TPMethod.CPM:
        if (data.grossMarginData && data.comparableDatabaseAccess) score = 85;
        else if (data.grossMarginData) score = 65;
        else score = 30;
        break;

      case TPMethod.TNMM:
        if (data.netMarginData && data.comparableDatabaseAccess) score = 90;
        else if (data.netMarginData) score = 70;
        else if (data.comparableDatabaseAccess) score = 60;
        else score = 40;
        break;

      case TPMethod.PSM:
        if (data.combinedProfitData) score = 80;
        else score = 30;
        break;

      default:
        score = 40;
    }

    // Adjust for data quality
    if (data.dataQuality === "high") score = Math.min(100, score + 10);
    else if (data.dataQuality === "low") score = Math.max(0, score - 20);

    return score;
  }

  private scoreReliability(method: TPMethod, input: MAMSelectionInput): number {
    let score = 50;

    switch (method) {
      case TPMethod.CUP:
        if (input.internalCUPsAvailable) score = 100;
        else if (input.externalCUPsAvailable) score = 75;
        else score = 30;
        break;

      case TPMethod.RPM:
        if (input.functionalProfile.includes("distributor")) score = 80;
        else score = 40;
        break;

      case TPMethod.CPM:
        if (input.functionalProfile.includes("manufacturer") ||
            input.functionalProfile.includes("service")) score = 75;
        else score = 45;
        break;

      case TPMethod.TNMM:
        // TNMM generally has good reliability with broad comparability
        score = 75;
        if (input.dataAvailability.comparableDatabaseAccess) score = 85;
        break;

      case TPMethod.PSM:
        if (input.uniqueIntangibles || input.intangiblesInvolved) score = 80;
        else score = 40;
        break;

      default:
        score = 30;
    }

    return score;
  }

  private scoreComparability(method: TPMethod, input: MAMSelectionInput): number {
    let score = 50;

    // CUP requires highest comparability
    if (method === TPMethod.CUP) {
      if (input.internalCUPsAvailable) score = 100;
      else if (input.transactionType === TransactionType.FINANCIAL) score = 75;
      else score = 40;
    }
    // RPM/CPM need functional comparability
    else if (method === TPMethod.RPM || method === TPMethod.CPM) {
      score = 65;
    }
    // TNMM more tolerant of differences
    else if (method === TPMethod.TNMM) {
      score = 80;
    }
    // PSM needs combined data
    else if (method === TPMethod.PSM) {
      if (input.dataAvailability.combinedProfitData) score = 75;
      else score = 35;
    }

    return score;
  }

  private scoreOECDPreference(method: TPMethod, input: MAMSelectionInput): number {
    const hierarchyScore = getMethodHierarchyScore(method);
    // Convert hierarchy (1-5) to preference score (100-0)
    return Math.max(0, 100 - (hierarchyScore - 1) * 20);
  }

  private identifyStrengths(
    method: TPMethod,
    input: MAMSelectionInput,
    scores: SuitabilityScore["componentScores"]
  ): string[] {
    const strengths: string[] = [];
    const details = getMethodDetails(method);

    if (scores.transactionFit > 70) {
      strengths.push(`Well-suited for ${input.transactionType} transactions`);
    }
    if (scores.dataAvailability > 70) {
      strengths.push("Reliable data is available to apply this method");
    }
    if (scores.comparabilityDegree > 70) {
      strengths.push("High degree of comparability achievable");
    }

    // Add method-specific strengths
    strengths.push(...details.advantages.slice(0, 2));

    return strengths;
  }

  private identifyWeaknesses(
    method: TPMethod,
    input: MAMSelectionInput,
    scores: SuitabilityScore["componentScores"]
  ): string[] {
    const weaknesses: string[] = [];
    const details = getMethodDetails(method);

    if (scores.dataAvailability < 50) {
      weaknesses.push("Limited data availability for this method");
    }
    if (scores.comparabilityDegree < 50) {
      weaknesses.push("Comparability challenges exist");
    }

    // Add method-specific weaknesses
    weaknesses.push(...details.disadvantages.slice(0, 2));

    return weaknesses;
  }

  private getBriefReason(score: SuitabilityScore): string {
    if (score.overallScore >= 80) {
      return "Highly suitable - strong transaction fit and data availability";
    } else if (score.overallScore >= 60) {
      return "Suitable - reasonable fit with acceptable data availability";
    } else if (score.overallScore >= 40) {
      return "Marginally suitable - some limitations exist";
    } else {
      return "Not suitable - significant limitations or data gaps";
    }
  }

  private generateRejectionRationales(
    selectedMethod: TPMethod,
    ranking: MethodRanking[],
    input: MAMSelectionInput
  ): MethodRejection[] {
    return ranking
      .filter((r) => r.method !== selectedMethod)
      .map((r) => ({
        method: r.method,
        rationale: this.generateRejectionRationale(r.method, input),
        oecdReference: `OECD Guidelines, ${getMethodDetails(r.method).oecdChapter}`,
        keyFactors: this.getKeyRejectionFactors(r.method, input),
      }));
  }

  private getKeyRejectionFactors(
    method: TPMethod,
    input: MAMSelectionInput
  ): string[] {
    const factors: string[] = [];

    if (method === TPMethod.CUP && !input.internalCUPsAvailable && !input.externalCUPsAvailable) {
      factors.push("No reliable comparable uncontrolled prices available");
    }
    if ((method === TPMethod.RPM || method === TPMethod.CPM) &&
        !input.dataAvailability.grossMarginData) {
      factors.push("Gross margin data not reliably available");
    }
    if (method === TPMethod.PSM && !input.uniqueIntangibles) {
      factors.push("Transaction does not involve unique intangibles on both sides");
    }

    return factors;
  }

  private getTransactionKey(input: MAMSelectionInput): string {
    if (input.transactionSubType) {
      return input.transactionSubType;
    }

    // Map transaction type to key
    switch (input.transactionType) {
      case TransactionType.TANGIBLE_GOODS:
        return input.functionalProfile.includes("distributor")
          ? "tangible_goods_distribution"
          : "tangible_goods_proprietary";
      case TransactionType.SERVICES:
        return input.functionalProfile.includes("contract")
          ? "services_routine"
          : "services_high_value";
      case TransactionType.INTANGIBLES:
        return "intangibles_royalty";
      case TransactionType.FINANCIAL:
        return "financial_loan";
      default:
        return "services_routine";
    }
  }

  private assessProductComparability(input: MAMSelectionInput): ComparabilityFactor {
    let score = 5;
    let assessment = "Moderate product comparability";

    if (input.internalCUPsAvailable) {
      score = 9;
      assessment = "High comparability with internal transactions";
    } else if (input.externalCUPsAvailable) {
      score = 7;
      assessment = "Good comparability with external transactions";
    } else if (input.transactionType === TransactionType.SERVICES) {
      score = 6;
      assessment = "Service comparability achievable through functional analysis";
    }

    return { factor: "Product/Service Comparability", score, assessment };
  }

  private assessFunctionalComparability(input: MAMSelectionInput): ComparabilityFactor {
    const hasFunctions = input.functionsPerformed.length > 0;
    const hasAssets = input.assetsEmployed.length > 0;
    const hasRisks = input.risksAssumed.length > 0;

    let score = 5;
    if (hasFunctions && hasAssets && hasRisks) score = 8;
    else if (hasFunctions && (hasAssets || hasRisks)) score = 6;

    return {
      factor: "Functional Comparability",
      score,
      assessment: `FAR analysis ${hasFunctions ? "completed" : "pending"} - ${input.functionsPerformed.length} functions identified`,
    };
  }

  private assessContractualComparability(input: MAMSelectionInput): ComparabilityFactor {
    return {
      factor: "Contractual Terms",
      score: 6,
      assessment: "Standard contractual terms applicable",
    };
  }

  private assessEconomicComparability(input: MAMSelectionInput): ComparabilityFactor {
    return {
      factor: "Economic Circumstances",
      score: 6,
      assessment: "Economic conditions comparable with adjustments",
      adjustmentsNeeded: ["Working capital adjustment", "Geographic adjustment"],
    };
  }

  private assessStrategyComparability(input: MAMSelectionInput): ComparabilityFactor {
    return {
      factor: "Business Strategies",
      score: 7,
      assessment: "Business strategies consistent with tested party profile",
    };
  }

  private calculateOverallComparability(input: MAMSelectionInput): number {
    const product = this.assessProductComparability(input).score;
    const functional = this.assessFunctionalComparability(input).score;
    return Math.round((product + functional) / 2 * 10);
  }

  private getRecommendedPLI(input: MAMSelectionInput): RecommendedPLI {
    const profileMapping = FUNCTIONAL_PROFILE_MAPPING[input.functionalProfile];

    if (profileMapping) {
      const pliParts = profileMapping.pli.split(" or ");
      return {
        code: pliParts[0].replace(/\//g, "_"),
        name: pliParts[0],
        formula: this.getPLIFormula(pliParts[0]),
        rationale: profileMapping.rationale,
        alternatives: pliParts.length > 1 ? [pliParts[1]] : [],
      };
    }

    // Default to OP/OR
    return {
      code: "OP_OR",
      name: "Operating Profit / Operating Revenue",
      formula: "(Operating Profit / Operating Revenue) × 100",
      rationale: "Standard PLI for most transaction types",
      alternatives: ["OP/TC", "Berry Ratio"],
    };
  }

  private getPLIFormula(pli: string): string {
    const formulas: Record<string, string> = {
      "OP/OR": "(Operating Profit / Operating Revenue) × 100",
      "OP/TC": "(Operating Profit / Total Cost) × 100",
      "OP/Sales": "(Operating Profit / Net Sales) × 100",
      "ROA": "(Operating Profit / Total Assets) × 100",
      "Berry Ratio": "Gross Profit / Operating Expenses",
    };
    return formulas[pli] || "(Profit / Base) × 100";
  }

  private evaluateDecisionFactors(
    input: MAMSelectionInput,
    selectedMethod: TPMethod
  ): DecisionFactor[] {
    const factors: DecisionFactor[] = [];

    // Factor 1: Method strengths/weaknesses
    factors.push({
      factor: "Method Characteristics",
      oecdRef: "Para 2.2(i)",
      assessment: `${selectedMethod} characteristics align with transaction profile`,
      impact: "supports",
      methodsSupported: [selectedMethod],
    });

    // Factor 2: Transaction nature
    factors.push({
      factor: "Nature of Transaction",
      oecdRef: "Para 2.2(ii)",
      assessment: `${input.transactionType} transaction suitable for ${selectedMethod}`,
      impact: "supports",
      methodsSupported: getPreferredMethods(this.getTransactionKey(input)),
    });

    // Factor 3: Information availability
    factors.push({
      factor: "Information Availability",
      oecdRef: "Para 2.2(iii)",
      assessment: `Data availability ${input.dataAvailability.dataQuality} for ${selectedMethod}`,
      impact: input.dataAvailability.dataQuality === "low" ? "against" : "supports",
      methodsSupported: [selectedMethod],
    });

    return factors;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new MAMSelectionEngine instance
 */
export function createMAMSelectionEngine(): MAMSelectionEngine {
  return new MAMSelectionEngine();
}

// =============================================================================
// RE-EXPORT TYPES AND CONSTANTS
// =============================================================================

export {
  TPMethod,
  MethodCategory,
  type MethodDetails,
  TP_METHOD_DETAILS,
  MAM_SELECTION_FACTORS,
  TRANSACTION_METHOD_MAPPING,
  FUNCTIONAL_PROFILE_MAPPING,
  METHOD_REJECTION_RATIONALES,
  getMethodDetails,
  getPreferredMethods,
  getRejectionRationale,
  getAllMethods,
  getMethodCategory,
  getMethodHierarchyScore,
} from "./constants/mam-criteria";
