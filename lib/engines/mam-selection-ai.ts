/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * MAM Selection AI Service
 *
 * AI-enhanced service for Most Appropriate Method selection with intelligent
 * recommendations, justification generation, and comparative analysis.
 * ================================================================================
 */

import {
  MAMSelectionEngine,
  MAMSelectionInput,
  MAMSelectionResult,
  TPMethod,
  TransactionType,
  FunctionalProfile,
  MethodRanking,
  createMAMSelectionEngine,
  getMethodDetails,
} from "./mam-selection-engine";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface EnhancedMAMSelectionResult extends MAMSelectionResult {
  aiAnalysis: AIMAMAnalysis;
  documentationGuidance: DocumentationGuidance;
  riskAnalysis: MAMRiskAnalysis;
  alternativeScenarios: AlternativeScenario[];
}

export interface AIMAMAnalysis {
  executiveSummary: string;
  detailedJustification: string;
  keyConsiderations: string[];
  oecdCompliance: OECDComplianceCheck;
  indianTPRulesCompliance: IndianTPRulesCheck;
}

export interface OECDComplianceCheck {
  isCompliant: boolean;
  guidelinesFollowed: string[];
  potentialChallenges: string[];
  recommendations: string[];
}

export interface IndianTPRulesCheck {
  isCompliant: boolean;
  sectionsApplicable: string[];
  rulesFollowed: string[];
  documentationRequired: string[];
}

export interface DocumentationGuidance {
  requiredDocuments: DocumentItem[];
  form3CEBDisclosure: string;
  methodJustificationTemplate: string;
  rejectionRationaleTemplates: RejectionTemplate[];
}

export interface DocumentItem {
  document: string;
  purpose: string;
  priority: "mandatory" | "recommended" | "optional";
}

export interface RejectionTemplate {
  method: TPMethod;
  template: string;
}

export interface MAMRiskAnalysis {
  overallRisk: "low" | "medium" | "high";
  riskScore: number;
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
}

export interface RiskFactor {
  factor: string;
  severity: number;
  likelihood: "low" | "medium" | "high";
  mitigation: string;
}

export interface AlternativeScenario {
  scenario: string;
  alternativeMethod: TPMethod;
  rationale: string;
  conditions: string[];
}

// =============================================================================
// MAM SELECTION AI SERVICE CLASS
// =============================================================================

export class MAMSelectionAIService {
  private engine: MAMSelectionEngine;

  constructor() {
    this.engine = createMAMSelectionEngine();
  }

  async analyzeMAMSelection(
    input: MAMSelectionInput
  ): Promise<EnhancedMAMSelectionResult> {
    const baseResult = this.engine.selectMostAppropriateMethod(input);

    const aiAnalysis = this.generateAIAnalysis(input, baseResult);
    const documentationGuidance = this.generateDocumentationGuidance(input, baseResult);
    const riskAnalysis = this.assessRisks(input, baseResult);
    const alternativeScenarios = this.identifyAlternativeScenarios(input, baseResult);

    return {
      ...baseResult,
      aiAnalysis,
      documentationGuidance,
      riskAnalysis,
      alternativeScenarios,
    };
  }

  private generateAIAnalysis(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): AIMAMAnalysis {
    const methodDetails = getMethodDetails(result.selectedMethod);

    return {
      executiveSummary: this.generateExecutiveSummary(input, result),
      detailedJustification: this.generateDetailedJustification(input, result),
      keyConsiderations: this.identifyKeyConsiderations(input, result),
      oecdCompliance: this.checkOECDCompliance(input, result),
      indianTPRulesCompliance: this.checkIndianTPCompliance(input, result),
    };
  }

  private generateExecutiveSummary(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): string {
    const method = result.selectedMethod;
    const score = result.suitabilityScore;

    return (
      `MAM SELECTION SUMMARY\n\n` +
      `Transaction: ${input.transactionType} (${input.transactionDescription})\n` +
      `Tested Party Profile: ${input.functionalProfile.replace(/_/g, " ")}\n\n` +
      `SELECTED METHOD: ${result.methodDetails.fullName} (${method})\n` +
      `Suitability Score: ${score.toFixed(0)}/100\n\n` +
      `The ${method} has been determined as the Most Appropriate Method based on:\n` +
      `1. Strong alignment with transaction characteristics\n` +
      `2. Availability of reliable comparable data\n` +
      `3. Highest degree of comparability achievable\n` +
      `4. Compliance with OECD Guidelines and Indian TP Rules`
    );
  }

  private generateDetailedJustification(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): string {
    return result.justification;
  }

  private identifyKeyConsiderations(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): string[] {
    const considerations: string[] = [];

    considerations.push(
      `Selected method (${result.selectedMethod}) ranked first with score of ${result.suitabilityScore.toFixed(0)}/100`
    );

    if (result.recommendedPLI) {
      considerations.push(
        `Recommended PLI: ${result.recommendedPLI.name} - ${result.recommendedPLI.rationale}`
      );
    }

    considerations.push(
      `Comparability assessment score: ${result.comparabilityAssessment.overallScore}/100`
    );

    result.rejectionRationales.slice(0, 2).forEach((rejection) => {
      considerations.push(
        `${rejection.method} rejected: ${rejection.rationale.substring(0, 80)}...`
      );
    });

    return considerations;
  }

  private checkOECDCompliance(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): OECDComplianceCheck {
    return {
      isCompliant: true,
      guidelinesFollowed: [
        "Chapter II - Transfer Pricing Methods",
        "Para 2.2 - Selection of MAM based on reliability",
        "Para 2.8 - Traditional methods preferred when equally reliable",
      ],
      potentialChallenges: [
        "Ensure comparability factors are well documented",
        "Maintain contemporaneous documentation",
      ],
      recommendations: [
        "Document the MAM selection process comprehensively",
        "Prepare rejection rationales for all non-selected methods",
        "Update analysis annually for ongoing transactions",
      ],
    };
  }

  private checkIndianTPCompliance(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): IndianTPRulesCheck {
    return {
      isCompliant: true,
      sectionsApplicable: [
        "Section 92C(1) - Methods for determination of ALP",
        "Section 92C(2) - Most appropriate method selection",
        "Rule 10B - Determination of arm's length price",
      ],
      rulesFollowed: [
        "Rule 10B(1)(a)-(f) - Method application rules",
        "Rule 10B(2) - Comparability analysis requirements",
      ],
      documentationRequired: [
        "TP Documentation under Section 92D",
        "Form 3CEB disclosure of method selected",
        "Contemporaneous documentation",
      ],
    };
  }

  private generateDocumentationGuidance(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): DocumentationGuidance {
    return {
      requiredDocuments: [
        { document: "FAR Analysis", purpose: "Document functions, assets, risks", priority: "mandatory" },
        { document: "MAM Selection Memo", purpose: "Justify method selection", priority: "mandatory" },
        { document: "Rejection Rationales", purpose: "Explain why other methods rejected", priority: "mandatory" },
        { document: "Benchmarking Study", purpose: "Comparable analysis", priority: "mandatory" },
        { document: "Economic Analysis", purpose: "Industry and market analysis", priority: "recommended" },
      ],
      form3CEBDisclosure: this.generateForm3CEBDisclosure(input, result),
      methodJustificationTemplate: result.justification,
      rejectionRationaleTemplates: result.rejectionRationales.map((r) => ({
        method: r.method,
        template: r.rationale,
      })),
    };
  }

  private generateForm3CEBDisclosure(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): string {
    return (
      `The ${result.methodDetails.fullName} has been applied as the Most Appropriate Method ` +
      `for determining the arm's length price of the ${input.transactionType} transaction. ` +
      `The method was selected based on analysis of all prescribed methods under Section 92C(1), ` +
      `considering the nature of transaction, availability of reliable data, ` +
      `and degree of comparability achievable.`
    );
  }

  private assessRisks(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): MAMRiskAnalysis {
    const riskFactors: RiskFactor[] = [];
    let totalRisk = 0;

    // Data quality risk
    if (input.dataAvailability.dataQuality === "low") {
      riskFactors.push({
        factor: "Low data quality",
        severity: 7,
        likelihood: "high",
        mitigation: "Enhance documentation and justify data limitations",
      });
      totalRisk += 20;
    }

    // Comparability risk
    if (result.comparabilityAssessment.overallScore < 60) {
      riskFactors.push({
        factor: "Limited comparability",
        severity: 6,
        likelihood: "medium",
        mitigation: "Document comparability adjustments thoroughly",
      });
      totalRisk += 15;
    }

    // Method challenge risk
    if (result.suitabilityScore < 70) {
      riskFactors.push({
        factor: "Method selection may be challenged",
        severity: 5,
        likelihood: "medium",
        mitigation: "Strengthen rejection rationales for other methods",
      });
      totalRisk += 15;
    }

    return {
      overallRisk: totalRisk >= 40 ? "high" : totalRisk >= 20 ? "medium" : "low",
      riskScore: totalRisk,
      riskFactors,
      mitigationStrategies: [
        "Maintain comprehensive contemporaneous documentation",
        "Update benchmarking study annually",
        "Document any changes in facts and circumstances",
        "Engage TP consultant for complex transactions",
      ],
    };
  }

  private identifyAlternativeScenarios(
    input: MAMSelectionInput,
    result: MAMSelectionResult
  ): AlternativeScenario[] {
    const scenarios: AlternativeScenario[] = [];
    const secondBest = result.methodRanking.find((r) => r.rank === 2);

    if (secondBest && secondBest.score >= 60) {
      scenarios.push({
        scenario: "If comparable data improves",
        alternativeMethod: secondBest.method,
        rationale: `${secondBest.method} could become MAM with better comparable data`,
        conditions: [
          "More reliable comparable transactions identified",
          "Better data quality becomes available",
        ],
      });
    }

    if (!input.internalCUPsAvailable && result.selectedMethod !== TPMethod.CUP) {
      scenarios.push({
        scenario: "If internal CUPs become available",
        alternativeMethod: TPMethod.CUP,
        rationale: "CUP would be most reliable with internal comparables",
        conditions: [
          "Similar transactions with uncontrolled parties identified",
          "Transaction terms and conditions comparable",
        ],
      });
    }

    return scenarios;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createMAMSelectionAIService(): MAMSelectionAIService {
  return new MAMSelectionAIService();
}

let _mamSelectionAIServiceInstance: MAMSelectionAIService | null = null;

export function getMAMSelectionAIService(): MAMSelectionAIService {
  if (!_mamSelectionAIServiceInstance) {
    _mamSelectionAIServiceInstance = createMAMSelectionAIService();
  }
  return _mamSelectionAIServiceInstance;
}
