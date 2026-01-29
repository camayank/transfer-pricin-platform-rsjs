/**
 * ================================================================================
 * DIGICOMPLY TP DISPUTE AI SERVICE
 * AI-Enhanced Transfer Pricing Dispute & Audit Management
 *
 * Integrates AI capabilities for:
 * - TP dispute risk assessment
 * - Audit defense strategy generation
 * - APA assistance and eligibility analysis
 * - TPO response template generation
 * - Litigation analysis and strategy
 * ================================================================================
 */

import {
  getTPDocumentGenerator,
  isAIConfigured,
  PromptType,
  QualityResult,
  TPDisputeRiskAssessment,
  AuditDefenseStrategy,
  APAAssistance,
  TPOResponseTemplate,
  LitigationAnalysis,
} from "../ai";

// =============================================================================
// TYPES
// =============================================================================

export interface DisputeRiskResult {
  assessment: TPDisputeRiskAssessment;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface DefenseStrategyResult {
  strategy: AuditDefenseStrategy;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface APAAssistanceResult {
  assistance: APAAssistance;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface TPOResponseResult {
  response: TPOResponseTemplate;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface LitigationResult {
  analysis: LitigationAnalysis;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface TPProfile {
  entityName: string;
  entityPAN: string;
  assessmentYear: string;
  industry: string;
  totalRevenue: number;
  operatingProfit: number;
  opOcMargin: number;
  opOrMargin: number;
}

export interface RPTSummary {
  transactionType: string;
  relatedParty: string;
  value: number;
  method: string;
  margin?: number;
}

export interface DocumentationStatus {
  tpStudy: "complete" | "partial" | "missing";
  benchmarkStudy: "complete" | "partial" | "missing";
  agreements: "complete" | "partial" | "missing";
  farAnalysis: "complete" | "partial" | "missing";
}

export interface DisputeCase {
  entityName: string;
  assessmentYear: string;
  transactionType: string;
  relatedParty: string;
  transactionValue: number;
  methodApplied: string;
  testedPartyMargin: number;
  proposedAdjustment: number;
  currentForum: string;
}

// =============================================================================
// TP DISPUTE AI SERVICE CLASS
// =============================================================================

export class TPDisputeAIService {
  private generator = getTPDocumentGenerator();

  /**
   * Check if AI is configured and available
   */
  isAvailable(): boolean {
    return isAIConfigured();
  }

  /**
   * Assess TP dispute risk for an entity
   */
  async assessDisputeRisk(
    profile: TPProfile,
    rptSummary: RPTSummary[],
    documentationStatus: DocumentationStatus,
    benchmarkRange: { min: number; max: number },
    historicalIssues?: string,
    industryTrends?: string,
    recentPrecedents?: string
  ): Promise<DisputeRiskResult> {
    if (!this.isAvailable()) {
      return this.createFallbackRiskAssessment(profile, rptSummary, benchmarkRange);
    }

    try {
      const totalRPT = rptSummary.reduce((sum, r) => sum + r.value, 0);
      const rptPercentage = (totalRPT / profile.totalRevenue) * 100;

      const docStatus = Object.entries(documentationStatus)
        .map(([key, status]) => `${key}: ${status}`)
        .join("\n");

      const response = await this.generator.generateCustomPrompt(
        PromptType.TP_DISPUTE_RISK_ASSESSMENT,
        {
          entityName: profile.entityName,
          entityPAN: profile.entityPAN,
          assessmentYear: profile.assessmentYear,
          industry: profile.industry,
          totalRevenue: profile.totalRevenue,
          operatingProfit: profile.operatingProfit,
          opOcMargin: profile.opOcMargin,
          opOrMargin: profile.opOrMargin,
          rptSummary: JSON.stringify(rptSummary, null, 2),
          totalRPT,
          rptPercentage: rptPercentage.toFixed(2),
          selectedMethod: rptSummary[0]?.method || "TNMM",
          testedPartyMargin: profile.opOcMargin,
          benchmarkRange: `${benchmarkRange.min}% - ${benchmarkRange.max}%`,
          positionVsRange:
            profile.opOcMargin >= benchmarkRange.min
              ? "Within range"
              : "Below range",
          documentationStatus: docStatus,
          historicalIssues: historicalIssues || "No significant historical issues",
          industryTrends: industryTrends || "",
          recentPrecedents: recentPrecedents || "",
        },
        {
          entityName: profile.entityName,
          assessmentYear: profile.assessmentYear,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          assessment: response.parsedContent as unknown as TPDisputeRiskAssessment,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackRiskAssessment(profile, rptSummary, benchmarkRange);
    } catch (error) {
      console.error("TP dispute risk assessment failed:", error);
      return this.createFallbackRiskAssessment(profile, rptSummary, benchmarkRange);
    }
  }

  /**
   * Generate audit defense strategy
   */
  async generateDefenseStrategy(
    disputeCase: DisputeCase,
    tpoPosition: string,
    farProfile: { functions: string; assets: string; risks: string },
    economicArguments: string,
    availableEvidence: string,
    precedents?: string,
    adversePrecedents?: string
  ): Promise<DefenseStrategyResult> {
    if (!this.isAvailable()) {
      return this.createFallbackDefenseStrategy(disputeCase);
    }

    try {
      const response = await this.generator.generateCustomPrompt(
        PromptType.AUDIT_DEFENSE_STRATEGY,
        {
          entityName: disputeCase.entityName,
          assessmentYear: disputeCase.assessmentYear,
          tpoReferenceDate: new Date().toISOString().split("T")[0],
          transactionType: disputeCase.transactionType,
          relatedParty: disputeCase.relatedParty,
          transactionValue: disputeCase.transactionValue,
          methodApplied: disputeCase.methodApplied,
          tpoPosition,
          proposedAdjustment: disputeCase.proposedAdjustment,
          tpDocumentation: "Available",
          benchmarkStudy: "Available",
          testedPartyMargin: disputeCase.testedPartyMargin,
          comparableSet: "Industry comparable companies",
          functions: farProfile.functions,
          assets: farProfile.assets,
          risks: farProfile.risks,
          economicArguments,
          availableEvidence,
          precedents: precedents || "",
          adversePrecedents: adversePrecedents || "",
        },
        {
          entityName: disputeCase.entityName,
          assessmentYear: disputeCase.assessmentYear,
          transactionType: disputeCase.transactionType,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          strategy: response.parsedContent as unknown as AuditDefenseStrategy,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackDefenseStrategy(disputeCase);
    } catch (error) {
      console.error("Audit defense strategy generation failed:", error);
      return this.createFallbackDefenseStrategy(disputeCase);
    }
  }

  /**
   * Generate APA assistance and eligibility analysis
   */
  async generateAPAAssistance(
    applicantName: string,
    applicantPAN: string,
    industry: string,
    apaType: "unilateral" | "bilateral" | "multilateral",
    coveredTransactions: RPTSummary[],
    transactionHistory: string,
    currentMethod: string,
    currentPLI: string,
    marginRange: string,
    relatedPartyDetails: string,
    treatyPartner?: string,
    historicalPositions?: string,
    pendingDisputes?: string,
    financialProjections?: string
  ): Promise<APAAssistanceResult> {
    if (!this.isAvailable()) {
      return this.createFallbackAPAAssistance(
        applicantName,
        apaType,
        coveredTransactions
      );
    }

    try {
      const response = await this.generator.generateCustomPrompt(
        PromptType.APA_ASSISTANCE,
        {
          applicantName,
          applicantPAN,
          industry,
          apaType,
          coveredTransactions: JSON.stringify(coveredTransactions, null, 2),
          transactionHistory,
          currentMethod,
          currentPLI,
          marginRange,
          relatedPartyDetails,
          treatyPartner: treatyPartner || "N/A",
          historicalPositions: historicalPositions || "No historical positions",
          pendingDisputes: pendingDisputes || "",
          previousAPA: "",
          financialProjections: financialProjections || "Based on current trends",
        },
        {
          entityName: applicantName,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          assistance: response.parsedContent as unknown as APAAssistance,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackAPAAssistance(
        applicantName,
        apaType,
        coveredTransactions
      );
    } catch (error) {
      console.error("APA assistance generation failed:", error);
      return this.createFallbackAPAAssistance(
        applicantName,
        apaType,
        coveredTransactions
      );
    }
  }

  /**
   * Generate TPO response template
   */
  async generateTPOResponse(
    assesseeName: string,
    assesseePAN: string,
    assessmentYear: string,
    tpoReferenceNumber: string,
    responseType: "initial" | "supplementary" | "appeal",
    tpoQueries: string,
    transactionNature: string,
    relatedParty: string,
    transactionValue: number,
    methodApplied: string,
    taxpayerPosition: string,
    availableDocuments: string,
    keyArguments: string,
    relevantCaseLaws: string,
    showCauseNotice?: string,
    additionalSubmissions?: string
  ): Promise<TPOResponseResult> {
    if (!this.isAvailable()) {
      return this.createFallbackTPOResponse(
        assesseeName,
        assessmentYear,
        tpoReferenceNumber,
        responseType
      );
    }

    try {
      const response = await this.generator.generateCustomPrompt(
        PromptType.TPO_RESPONSE_TEMPLATE,
        {
          assesseeName,
          assesseePAN,
          assessmentYear,
          tpoReferenceNumber,
          responseType,
          tpoQueries,
          showCauseNotice: showCauseNotice || "",
          transactionNature,
          relatedParty,
          transactionValue,
          methodApplied,
          taxpayerPosition,
          availableDocuments,
          keyArguments,
          relevantCaseLaws,
          additionalSubmissions: additionalSubmissions || "",
        },
        {
          entityName: assesseeName,
          assessmentYear,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          response: response.parsedContent as unknown as TPOResponseTemplate,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackTPOResponse(
        assesseeName,
        assessmentYear,
        tpoReferenceNumber,
        responseType
      );
    } catch (error) {
      console.error("TPO response generation failed:", error);
      return this.createFallbackTPOResponse(
        assesseeName,
        assessmentYear,
        tpoReferenceNumber,
        responseType
      );
    }
  }

  /**
   * Analyze litigation prospects
   */
  async analyzeLitigation(
    disputeCase: DisputeCase,
    tpoPosition: string,
    taxpayerPosition: string,
    evidenceStrength: string,
    relevantPrecedents: string,
    budgetConstraints?: string,
    timelineExpectations?: string
  ): Promise<LitigationResult> {
    if (!this.isAvailable()) {
      return this.createFallbackLitigationAnalysis(disputeCase);
    }

    try {
      const taxEffect = disputeCase.proposedAdjustment * 0.3; // Approximate tax rate
      const interestAmount = taxEffect * 0.12 * 2; // 2 years interest

      const response = await this.generator.generateCustomPrompt(
        PromptType.LITIGATION_ANALYSIS,
        {
          assesseeName: disputeCase.entityName,
          assessmentYear: disputeCase.assessmentYear,
          currentForum: disputeCase.currentForum,
          transactionType: disputeCase.transactionType,
          adjustmentAmount: disputeCase.proposedAdjustment,
          taxEffect,
          interestAmount,
          tpoPosition,
          taxpayerPosition,
          evidenceStrength,
          relevantPrecedents,
          similarCases: "Based on industry and transaction type",
          previousOrders: "",
          budgetConstraints: budgetConstraints || "Standard budget",
          timelineExpectations: timelineExpectations || "Standard timeline",
        },
        {
          entityName: disputeCase.entityName,
          assessmentYear: disputeCase.assessmentYear,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          analysis: response.parsedContent as unknown as LitigationAnalysis,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackLitigationAnalysis(disputeCase);
    } catch (error) {
      console.error("Litigation analysis failed:", error);
      return this.createFallbackLitigationAnalysis(disputeCase);
    }
  }

  // ===========================================================================
  // FALLBACK METHODS
  // ===========================================================================

  private createFallbackRiskAssessment(
    profile: TPProfile,
    rptSummary: RPTSummary[],
    benchmarkRange: { min: number; max: number }
  ): DisputeRiskResult {
    const isWithinRange = profile.opOcMargin >= benchmarkRange.min;
    const totalRPT = rptSummary.reduce((sum, r) => sum + r.value, 0);
    const rptRatio = totalRPT / profile.totalRevenue;

    let riskScore = 30; // Base risk
    if (!isWithinRange) riskScore += 30;
    if (rptRatio > 0.3) riskScore += 20;
    if (profile.operatingProfit < 0) riskScore += 20;

    return {
      assessment: {
        overallRiskScore: Math.min(riskScore, 100),
        riskLevel: riskScore > 70 ? "high" : riskScore > 40 ? "medium" : "low",
        riskFactors: [
          {
            factor: "Margin position",
            score: isWithinRange ? 20 : 60,
            weight: 0.4,
            explanation: isWithinRange
              ? "Margin within benchmark range"
              : "Margin below benchmark range",
          },
          {
            factor: "RPT concentration",
            score: rptRatio > 0.3 ? 50 : 20,
            weight: 0.3,
            explanation: `RPT represents ${(rptRatio * 100).toFixed(1)}% of revenue`,
          },
        ],
        auditLikelihood: {
          probability: riskScore,
          triggerFactors: isWithinRange
            ? ["High RPT value"]
            : ["Below benchmark margin", "High RPT value"],
          mitigatingFactors: ["Complete documentation"],
        },
        potentialAdjustment: {
          estimatedAmount: isWithinRange
            ? 0
            : (benchmarkRange.min - profile.opOcMargin) *
              profile.totalRevenue *
              0.01,
          confidenceLevel: "Medium",
          basis: "Benchmark comparison",
        },
        recommendations: [
          {
            priority: "immediate" as const,
            action: isWithinRange
              ? "Maintain documentation"
              : "Review pricing policy",
            impact: "Risk mitigation",
          },
        ],
        complianceGaps: [],
      },
      aiGenerated: false,
    };
  }

  private createFallbackDefenseStrategy(
    disputeCase: DisputeCase
  ): DefenseStrategyResult {
    return {
      strategy: {
        transactionType: disputeCase.transactionType,
        defensePillars: [
          {
            pillar: "Economic substance",
            strength: "moderate",
            supportingEvidence: ["FAR analysis", "Business rationale"],
            potentialChallenges: ["Margin below benchmark"],
          },
          {
            pillar: "Method selection",
            strength: "moderate",
            supportingEvidence: ["TNMM appropriateness", "Comparable selection"],
            potentialChallenges: ["Alternative methods possible"],
          },
        ],
        documentationStrategy: {
          requiredDocuments: [
            "TP study",
            "Benchmark analysis",
            "Intercompany agreements",
          ],
          gapsIdentified: [],
          remedialActions: ["Strengthen contemporaneous documentation"],
        },
        argumentFramework: {
          primaryArgument:
            "Transaction is at arm's length based on selected method",
          supportingArguments: [
            "FAR profile supports characterization",
            "Method selection is appropriate",
          ],
          anticipatedCounterarguments: ["Alternative comparables"],
          rebuttals: ["Comparability adjustments applied"],
        },
        regulatoryReferences: [
          {
            reference: "Section 92C",
            relevance: "Arm's length price determination",
            supportLevel: "strong",
          },
        ],
        settlementConsiderations: {
          rangeFloor: disputeCase.proposedAdjustment * 0.3,
          rangeCeiling: disputeCase.proposedAdjustment * 0.7,
          optimalPosition: disputeCase.proposedAdjustment * 0.5,
          negotiationPoints: ["Economic substance", "Industry conditions"],
        },
      },
      aiGenerated: false,
    };
  }

  private createFallbackAPAAssistance(
    applicantName: string,
    apaType: "unilateral" | "bilateral" | "multilateral",
    coveredTransactions: RPTSummary[]
  ): APAAssistanceResult {
    const totalValue = coveredTransactions.reduce((sum, t) => sum + t.value, 0);

    return {
      assistance: {
        apaType,
        eligibility: {
          isEligible: totalValue > 150000000, // Rs. 15 Cr threshold
          eligibilityCriteria: [
            {
              criterion: "Transaction value threshold",
              met: totalValue > 150000000,
              notes: `Total value: Rs. ${(totalValue / 10000000).toFixed(2)} Cr`,
            },
            {
              criterion: "Proposed methodology available",
              met: true,
              notes: "TNMM proposed",
            },
          ],
        },
        coveredTransactions: coveredTransactions.map((t) => ({
          transactionType: t.transactionType,
          annualValue: t.value,
          proposedMethodology: t.method,
          proposedRange: { min: 5, max: 15 },
        })),
        proposedTerms: {
          rollbackYears: 4,
          prospectiveYears: 5,
          criticalAssumptions: [
            "Business model remains unchanged",
            "No significant market disruption",
          ],
          testingProcedure: "Annual margin testing against agreed range",
        },
        applicationStrategy: {
          timing: "File within current assessment year",
          keyConsiderations: [
            "Pre-filing consultation recommended",
            "Complete documentation required",
          ],
          potentialChallenges: ["Data availability for rollback years"],
          recommendedApproach: `${apaType} APA with comprehensive coverage`,
        },
        costBenefitAnalysis: {
          estimatedFees: apaType === "bilateral" ? 2000000 : 1000000,
          potentialTaxCertainty: totalValue * 0.05,
          riskReduction: "Significant reduction in audit risk",
          recommendation: "Proceed with APA application",
        },
      },
      aiGenerated: false,
    };
  }

  private createFallbackTPOResponse(
    assesseeName: string,
    assessmentYear: string,
    tpoReferenceNumber: string,
    responseType: "initial" | "supplementary" | "appeal"
  ): TPOResponseResult {
    return {
      response: {
        referenceNumber: tpoReferenceNumber,
        responseType,
        executiveSummary: `This submission is in response to the notice dated ${new Date().toISOString().split("T")[0]} for ${assesseeName} for AY ${assessmentYear}.`,
        issueWiseResponse: [
          {
            issueNumber: 1,
            tpoObservation: "Pending specific observation",
            taxpayerResponse:
              "Response will be provided upon receipt of specific queries",
            supportingEvidence: ["TP documentation", "Benchmark study"],
            legalReferences: ["Section 92C", "Rule 10B"],
            caselaw: [],
          },
        ],
        documentationProvided: [
          {
            documentName: "Transfer Pricing Study",
            relevance: "Primary documentation",
            pageReference: "Annexure A",
          },
        ],
        concludingArguments:
          "The assessee submits that the international transactions are at arm's length.",
        reliefSought: "Delete the proposed adjustment in its entirety",
        regulatoryCompliance:
          "This response is filed in compliance with Section 92CA requirements.",
      },
      aiGenerated: false,
    };
  }

  private createFallbackLitigationAnalysis(
    disputeCase: DisputeCase
  ): LitigationResult {
    const taxEffect = disputeCase.proposedAdjustment * 0.3;

    return {
      analysis: {
        caseStrength: "moderate",
        successProbability: 50,
        keyIssues: [
          {
            issue: disputeCase.transactionType,
            legalPosition: "Taxpayer position defensible",
            precedents: [],
            strength: "moderate",
          },
        ],
        costBenefitAnalysis: {
          estimatedLitigationCost: 500000,
          potentialTaxAtStake: taxEffect,
          timelineEstimate: "2-3 years for ITAT resolution",
          recommendation:
            taxEffect > 1000000 ? "Proceed with appeal" : "Consider settlement",
        },
        alternativeResolutions: [
          {
            option: "Settlement with TPO",
            pros: ["Quick resolution", "Reduced costs"],
            cons: ["Partial adjustment accepted"],
            likelihood: 60,
          },
          {
            option: "DRP route",
            pros: ["Expedited resolution", "Panel review"],
            cons: ["Limited appeal options"],
            likelihood: 40,
          },
        ],
        strategicRecommendation:
          "Evaluate settlement options while preparing for appeal",
      },
      aiGenerated: false,
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

let tpDisputeAIServiceInstance: TPDisputeAIService | null = null;

export function getTPDisputeAIService(): TPDisputeAIService {
  if (!tpDisputeAIServiceInstance) {
    tpDisputeAIServiceInstance = new TPDisputeAIService();
  }
  return tpDisputeAIServiceInstance;
}

export function createTPDisputeAIService(): TPDisputeAIService {
  return new TPDisputeAIService();
}
