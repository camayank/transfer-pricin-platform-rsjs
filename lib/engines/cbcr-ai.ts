/**
 * ================================================================================
 * DIGICOMPLY CBCR AI SERVICE
 * AI-Enhanced Country-by-Country Reporting (Form 3CEAD)
 *
 * Integrates AI capabilities for:
 * - Jurisdiction allocation narratives
 * - Consolidation narrative generation
 * - CbCR validation and consistency checks
 * - Nexus and economic substance analysis
 * ================================================================================
 */

import {
  getTPDocumentGenerator,
  isAIConfigured,
  PromptType,
  QualityResult,
  CbCRJurisdictionAllocation,
  CbCRConsolidationNarrative,
  CbCRValidation,
  CbCRNexusAnalysis,
} from "../ai";

// =============================================================================
// TYPES
// =============================================================================

export interface JurisdictionAllocationResult {
  allocation: CbCRJurisdictionAllocation;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface ConsolidationNarrativeResult {
  narrative: CbCRConsolidationNarrative;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface CbCRValidationResult {
  validation: CbCRValidation;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface NexusAnalysisResult {
  analysis: CbCRNexusAnalysis;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface CbCREntity {
  entityName: string;
  entityType: string;
  jurisdiction: string;
  mainBusinessActivity: string;
  incorporationCountry: string;
}

export interface CbCRJurisdictionData {
  jurisdictionCode: string;
  jurisdictionName: string;
  entities: CbCREntity[];
  unrelatedRevenue: number;
  relatedRevenue: number;
  totalRevenue: number;
  profitBeforeTax: number;
  taxPaid: number;
  taxAccrued: number;
  statedCapital: number;
  accumulatedEarnings: number;
  employeeCount: number;
  tangibleAssets: number;
}

export interface CbCRReport {
  groupName: string;
  ultimateParent: string;
  parentJurisdiction: string;
  reportingPeriod: string;
  reportingCurrency: string;
  jurisdictions: CbCRJurisdictionData[];
  consolidatedRevenue: number;
  consolidatedPBT: number;
  consolidatedTax: number;
}

// =============================================================================
// CBCR AI SERVICE CLASS
// =============================================================================

export class CbCRAIService {
  private generator = getTPDocumentGenerator();

  /**
   * Check if AI is configured and available
   */
  isAvailable(): boolean {
    return isAIConfigured();
  }

  /**
   * Generate jurisdiction allocation with AI-enhanced narrative
   */
  async generateJurisdictionAllocation(
    report: CbCRReport,
    jurisdictionData: CbCRJurisdictionData,
    adjustments?: string,
    consolidationNotes?: string
  ): Promise<JurisdictionAllocationResult> {
    if (!this.isAvailable()) {
      return this.createFallbackJurisdictionAllocation(jurisdictionData);
    }

    try {
      const response = await this.generator.generateCustomPrompt(
        PromptType.CBCR_JURISDICTION_ALLOCATION,
        {
          groupName: report.groupName,
          reportingPeriod: report.reportingPeriod,
          reportingCurrency: report.reportingCurrency,
          jurisdictionCode: jurisdictionData.jurisdictionCode,
          jurisdictionName: jurisdictionData.jurisdictionName,
          entityList: JSON.stringify(jurisdictionData.entities, null, 2),
          unrelatedRevenue: jurisdictionData.unrelatedRevenue,
          relatedRevenue: jurisdictionData.relatedRevenue,
          totalRevenue: jurisdictionData.totalRevenue,
          profitBeforeTax: jurisdictionData.profitBeforeTax,
          taxPaid: jurisdictionData.taxPaid,
          taxAccrued: jurisdictionData.taxAccrued,
          statedCapital: jurisdictionData.statedCapital,
          accumulatedEarnings: jurisdictionData.accumulatedEarnings,
          employeeCount: jurisdictionData.employeeCount,
          tangibleAssets: jurisdictionData.tangibleAssets,
          adjustments: adjustments || "",
          consolidationNotes: consolidationNotes || "",
        },
        {
          regulatoryFramework: "oecd",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          allocation: response.parsedContent as unknown as CbCRJurisdictionAllocation,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackJurisdictionAllocation(jurisdictionData);
    } catch (error) {
      console.error("CbCR jurisdiction allocation generation failed:", error);
      return this.createFallbackJurisdictionAllocation(jurisdictionData);
    }
  }

  /**
   * Generate consolidation narrative for the entire CbCR
   */
  async generateConsolidationNarrative(
    report: CbCRReport,
    dataSources: string,
    currencyMethod: string,
    exchangeRates: string,
    eliminationEntries?: string,
    specialConsiderations?: string
  ): Promise<ConsolidationNarrativeResult> {
    if (!this.isAvailable()) {
      return this.createFallbackConsolidationNarrative(report);
    }

    try {
      const jurisdictionSummary = report.jurisdictions.map((j) => ({
        jurisdiction: j.jurisdictionName,
        entityCount: j.entities.length,
        totalRevenue: j.totalRevenue,
        profitBeforeTax: j.profitBeforeTax,
      }));

      const cbcrTotalRevenue = report.jurisdictions.reduce(
        (sum, j) => sum + j.totalRevenue,
        0
      );
      const revenueVariance = report.consolidatedRevenue - cbcrTotalRevenue;

      const response = await this.generator.generateCustomPrompt(
        PromptType.CBCR_CONSOLIDATION_NARRATIVE,
        {
          groupName: report.groupName,
          ultimateParent: report.ultimateParent,
          parentJurisdiction: report.parentJurisdiction,
          reportingPeriod: report.reportingPeriod,
          reportingCurrency: report.reportingCurrency,
          jurisdictionCount: report.jurisdictions.length,
          entityCount: report.jurisdictions.reduce(
            (sum, j) => sum + j.entities.length,
            0
          ),
          jurisdictionSummary: JSON.stringify(jurisdictionSummary, null, 2),
          dataSources,
          currencyMethod,
          exchangeRates,
          eliminationEntries: eliminationEntries || "",
          specialConsiderations: specialConsiderations || "",
          consolidatedRevenue: report.consolidatedRevenue,
          cbcrTotalRevenue,
          revenueVariance,
          varianceExplanation:
            Math.abs(revenueVariance) > 0
              ? "Intercompany eliminations and consolidation adjustments"
              : "No material variance",
        },
        {
          regulatoryFramework: "oecd",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          narrative: response.parsedContent as unknown as CbCRConsolidationNarrative,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackConsolidationNarrative(report);
    } catch (error) {
      console.error("CbCR consolidation narrative generation failed:", error);
      return this.createFallbackConsolidationNarrative(report);
    }
  }

  /**
   * Validate CbCR data for completeness and consistency
   */
  async validateCbCR(
    report: CbCRReport,
    previousYearData?: CbCRReport
  ): Promise<CbCRValidationResult> {
    if (!this.isAvailable()) {
      return this.createFallbackValidation(report);
    }

    try {
      const table1Data = report.jurisdictions.map((j) => ({
        jurisdiction: j.jurisdictionName,
        unrelatedRevenue: j.unrelatedRevenue,
        relatedRevenue: j.relatedRevenue,
        totalRevenue: j.totalRevenue,
        profitBeforeTax: j.profitBeforeTax,
        taxPaid: j.taxPaid,
        taxAccrued: j.taxAccrued,
        statedCapital: j.statedCapital,
        accumulatedEarnings: j.accumulatedEarnings,
        employeeCount: j.employeeCount,
        tangibleAssets: j.tangibleAssets,
      }));

      const table2Data = report.jurisdictions.flatMap((j) =>
        j.entities.map((e) => ({
          ...e,
          jurisdictionName: j.jurisdictionName,
        }))
      );

      const response = await this.generator.generateCustomPrompt(
        PromptType.CBCR_VALIDATION,
        {
          groupName: report.groupName,
          reportingPeriod: report.reportingPeriod,
          filingJurisdiction: report.parentJurisdiction,
          table1Data: JSON.stringify(table1Data, null, 2),
          table2Data: JSON.stringify(table2Data, null, 2),
          table3Data: "Standard CbCR additional information",
          consolidatedRevenue: report.consolidatedRevenue,
          consolidatedPBT: report.consolidatedPBT,
          consolidatedTax: report.consolidatedTax,
          previousYearData: previousYearData
            ? JSON.stringify(
                {
                  totalRevenue: previousYearData.jurisdictions.reduce(
                    (sum, j) => sum + j.totalRevenue,
                    0
                  ),
                  totalPBT: previousYearData.jurisdictions.reduce(
                    (sum, j) => sum + j.profitBeforeTax,
                    0
                  ),
                },
                null,
                2
              )
            : "",
        },
        {
          regulatoryFramework: "oecd",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          validation: response.parsedContent as unknown as CbCRValidation,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackValidation(report);
    } catch (error) {
      console.error("CbCR validation failed:", error);
      return this.createFallbackValidation(report);
    }
  }

  /**
   * Analyze nexus and economic substance for a jurisdiction
   */
  async analyzeNexus(
    report: CbCRReport,
    jurisdictionData: CbCRJurisdictionData,
    businessActivities: string,
    substanceIndicators: string,
    localSubstanceRules?: string
  ): Promise<NexusAnalysisResult> {
    if (!this.isAvailable()) {
      return this.createFallbackNexusAnalysis(jurisdictionData);
    }

    try {
      const response = await this.generator.generateCustomPrompt(
        PromptType.CBCR_NEXUS_ANALYSIS,
        {
          groupName: report.groupName,
          jurisdictionCode: jurisdictionData.jurisdictionCode,
          jurisdictionName: jurisdictionData.jurisdictionName,
          entityDetails: JSON.stringify(jurisdictionData.entities, null, 2),
          revenue: jurisdictionData.totalRevenue,
          profitBeforeTax: jurisdictionData.profitBeforeTax,
          employeeCount: jurisdictionData.employeeCount,
          tangibleAssets: jurisdictionData.tangibleAssets,
          businessActivities,
          ipActivities: "",
          financingActivities: "",
          holdingActivities: "",
          substanceIndicators,
          localSubstanceRules: localSubstanceRules || "Standard OECD BEPS guidelines",
        },
        {
          regulatoryFramework: "oecd",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          analysis: response.parsedContent as unknown as CbCRNexusAnalysis,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackNexusAnalysis(jurisdictionData);
    } catch (error) {
      console.error("CbCR nexus analysis failed:", error);
      return this.createFallbackNexusAnalysis(jurisdictionData);
    }
  }

  // ===========================================================================
  // FALLBACK METHODS
  // ===========================================================================

  private createFallbackJurisdictionAllocation(
    data: CbCRJurisdictionData
  ): JurisdictionAllocationResult {
    return {
      allocation: {
        jurisdictionCode: data.jurisdictionCode,
        jurisdictionName: data.jurisdictionName,
        entities: data.entities.map((e) => ({
          entityName: e.entityName,
          entityType: e.entityType,
          mainBusinessActivity: e.mainBusinessActivity,
        })),
        financials: {
          revenue: {
            unrelatedParty: data.unrelatedRevenue,
            relatedParty: data.relatedRevenue,
            total: data.totalRevenue,
          },
          profitBeforeTax: data.profitBeforeTax,
          incomeTaxPaid: data.taxPaid,
          incomeTaxAccrued: data.taxAccrued,
          statedCapital: data.statedCapital,
          accumulatedEarnings: data.accumulatedEarnings,
          numberOfEmployees: data.employeeCount,
          tangibleAssetsOtherThanCash: data.tangibleAssets,
        },
        allocationNarrative: `Standard allocation for ${data.jurisdictionName} with ${data.entities.length} constituent entities.`,
      },
      aiGenerated: false,
    };
  }

  private createFallbackConsolidationNarrative(
    report: CbCRReport
  ): ConsolidationNarrativeResult {
    return {
      narrative: {
        reportingPeriod: report.reportingPeriod,
        ultimateParentEntity: report.ultimateParent,
        consolidationBasis: "Consolidated Financial Statements",
        currencyUsed: report.reportingCurrency,
        exchangeRateMethod: "Average exchange rate for the reporting period",
        jurisdictionSummary: report.jurisdictions.map((j) => ({
          jurisdiction: j.jurisdictionName,
          entityCount: j.entities.length,
          totalRevenue: j.totalRevenue,
          profitBeforeTax: j.profitBeforeTax,
        })),
        materialTransactions: [],
        specialConsiderations: [],
        regulatoryCompliance:
          "This CbCR has been prepared in accordance with Section 286 and Rule 10DB of the Income Tax Rules.",
      },
      aiGenerated: false,
    };
  }

  private createFallbackValidation(report: CbCRReport): CbCRValidationResult {
    const totalRevenue = report.jurisdictions.reduce(
      (sum, j) => sum + j.totalRevenue,
      0
    );
    const variance = Math.abs(report.consolidatedRevenue - totalRevenue);
    const variancePercent = (variance / report.consolidatedRevenue) * 100;

    return {
      validation: {
        isValid: variancePercent < 5,
        completenessScore: 100,
        consistencyScore: variancePercent < 5 ? 100 : 80,
        issues:
          variancePercent >= 5
            ? [
                {
                  severity: "warning" as const,
                  field: "totalRevenue",
                  issue: `Revenue variance of ${variancePercent.toFixed(2)}% between CbCR and consolidated accounts`,
                  recommendation: "Review intercompany eliminations",
                },
              ]
            : [],
        crossJurisdictionChecks: [
          {
            check: "Revenue reconciliation",
            passed: variancePercent < 5,
            details: `CbCR total: ${totalRevenue}, Consolidated: ${report.consolidatedRevenue}`,
          },
        ],
        recommendations: variancePercent >= 5 ? ["Review consolidation adjustments"] : [],
      },
      aiGenerated: false,
    };
  }

  private createFallbackNexusAnalysis(
    data: CbCRJurisdictionData
  ): NexusAnalysisResult {
    const hasSubstance =
      data.employeeCount > 0 && data.tangibleAssets > 0;

    return {
      analysis: {
        jurisdiction: data.jurisdictionName,
        substantiveActivities: [
          {
            activity: "Physical presence",
            present: data.employeeCount > 0,
            evidence: `${data.employeeCount} employees in jurisdiction`,
          },
          {
            activity: "Tangible assets",
            present: data.tangibleAssets > 0,
            evidence: `Tangible assets value: ${data.tangibleAssets}`,
          },
        ],
        nexusRiskLevel: hasSubstance ? "low" : "high",
        bepsActionPoints: hasSubstance
          ? []
          : ["Consider BEPS Action 5 substance requirements"],
        recommendations: hasSubstance
          ? ["Maintain current substance levels"]
          : ["Strengthen economic substance in jurisdiction"],
        documentationRequired: [
          "Board meeting minutes",
          "Employment contracts",
          "Office lease agreements",
        ],
      },
      aiGenerated: false,
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

let cbcrAIServiceInstance: CbCRAIService | null = null;

export function getCbCRAIService(): CbCRAIService {
  if (!cbcrAIServiceInstance) {
    cbcrAIServiceInstance = new CbCRAIService();
  }
  return cbcrAIServiceInstance;
}

export function createCbCRAIService(): CbCRAIService {
  return new CbCRAIService();
}
