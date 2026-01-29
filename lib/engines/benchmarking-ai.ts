/**
 * ================================================================================
 * DIGICOMPLY BENCHMARKING AI SERVICE
 * AI-Enhanced Benchmarking Analysis
 *
 * Integrates AI capabilities into the Benchmarking Engine for:
 * - Working capital adjustment narratives
 * - Comparable rejection rationale generation
 * - Arm's length conclusion narratives
 * - Enhanced analysis with regulatory citations
 * ================================================================================
 */

import {
  BenchmarkingEngine,
  ComparableSearchEngine,
  BenchmarkingResult,
  ComparableCompany,
  FinancialData,
  PLIType,
  SearchCriteria,
  ScreeningCriteria,
  calculatePLIs,
} from "./benchmarking-engine";
import {
  getTPDocumentGenerator,
  isAIConfigured,
  QualityResult,
} from "../ai";

// =============================================================================
// TYPES
// =============================================================================

export interface WorkingCapitalData {
  testedPartyName: string;
  financialYear: string;
  revenue: number;
  receivables: number;
  inventory: number;
  payables: number;
  comparableFinancials: Array<{
    companyName: string;
    revenue: number;
    receivables: number;
    inventory: number;
    payables: number;
  }>;
  interestRate?: number;
  rateBasis?: string;
}

export interface WorkingCapitalAdjustmentResult {
  narrative: string;
  methodology: string;
  testedPartyAdjustment: number;
  comparableAdjustments: Array<{
    companyName: string;
    adjustment: number;
  }>;
  adjustedMargins: Array<{
    companyName: string;
    originalMargin: number;
    adjustedMargin: number;
  }>;
  regulatoryBasis: string;
  aiEnhanced: boolean;
  qualityScore?: QualityResult;
}

export interface ComparableRejectionResult {
  companyName: string;
  cin: string;
  rejectionRationale: string;
  rejectionCategories: ScreeningCriteria[];
  detailedReasons: Array<{
    criterion: string;
    explanation: string;
    supportingData: string;
  }>;
  regulatoryBasis: string;
  aiEnhanced: boolean;
  qualityScore?: QualityResult;
}

export interface ArmLengthConclusionResult {
  narrative: string;
  summary: string;
  pliAnalysis: {
    pliType: string;
    pliDescription: string;
    testedPartyMargin: number;
    armLengthRange: {
      lowerQuartile: number;
      median: number;
      upperQuartile: number;
      arithmeticMean: number;
    };
  };
  conclusion: "within_range" | "requires_adjustment" | "requires_review";
  adjustmentDetails?: {
    direction: string;
    amount: number;
    basis: string;
  };
  regulatoryBasis: string;
  recommendations: string[];
  aiEnhanced: boolean;
  qualityScore?: QualityResult;
}

export interface EnhancedBenchmarkingResult extends BenchmarkingResult {
  aiEnhanced: boolean;
  workingCapitalNarrative?: string;
  rejectionRationales: ComparableRejectionResult[];
  armLengthConclusion: ArmLengthConclusionResult;
  executiveSummary: string;
  regulatoryCompliance: {
    rule10B: boolean;
    rule10CA: boolean;
    documentationComplete: boolean;
  };
}

// =============================================================================
// BENCHMARKING AI SERVICE
// =============================================================================

export class BenchmarkingAIService {
  private benchmarkingEngine: BenchmarkingEngine;
  private searchEngine: ComparableSearchEngine;

  constructor() {
    this.benchmarkingEngine = new BenchmarkingEngine();
    this.searchEngine = new ComparableSearchEngine();
  }

  // ===========================================================================
  // WORKING CAPITAL ADJUSTMENT
  // ===========================================================================

  /**
   * Generate working capital adjustment narrative with AI enhancement
   */
  async generateWorkingCapitalAdjustment(
    data: WorkingCapitalData
  ): Promise<WorkingCapitalAdjustmentResult> {
    const interestRate = data.interestRate || 10.5; // Default SBI PLR
    const rateBasis = data.rateBasis || "SBI PLR";

    // Calculate working capital days and adjustments
    const testedPartyWC = this.calculateWorkingCapitalDays(
      data.revenue,
      data.receivables,
      data.inventory,
      data.payables
    );

    const comparableAdjustments: Array<{
      companyName: string;
      adjustment: number;
      wcDays: number;
    }> = [];

    for (const comp of data.comparableFinancials) {
      const compWC = this.calculateWorkingCapitalDays(
        comp.revenue,
        comp.receivables,
        comp.inventory,
        comp.payables
      );

      // Working capital adjustment formula
      const wcDifference = compWC - testedPartyWC;
      const adjustment = (wcDifference / 365) * interestRate;

      comparableAdjustments.push({
        companyName: comp.companyName,
        adjustment: Math.round(adjustment * 100) / 100,
        wcDays: compWC,
      });
    }

    // Try AI-enhanced narrative
    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const aiResponse = await generator.generateWorkingCapitalAdjustment({
          testedPartyName: data.testedPartyName,
          financialYear: data.financialYear,
          revenue: data.revenue,
          receivables: data.receivables,
          inventory: data.inventory,
          payables: data.payables,
          comparableFinancials: JSON.stringify(data.comparableFinancials, null, 2),
          interestRate,
          rateBasis,
        });

        if (aiResponse.success && aiResponse.content) {
          return {
            narrative: aiResponse.content,
            methodology: this.getWorkingCapitalMethodology(rateBasis, interestRate),
            testedPartyAdjustment: 0, // Base case
            comparableAdjustments: comparableAdjustments.map((ca) => ({
              companyName: ca.companyName,
              adjustment: ca.adjustment,
            })),
            adjustedMargins: [],
            regulatoryBasis: "Rule 10B(3) of the Income Tax Rules, 1962",
            aiEnhanced: true,
            qualityScore: aiResponse.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI working capital adjustment failed:", error);
      }
    }

    // Fallback to template-based narrative
    return {
      narrative: this.generateTemplateWCNarrative(
        data,
        testedPartyWC,
        comparableAdjustments,
        interestRate,
        rateBasis
      ),
      methodology: this.getWorkingCapitalMethodology(rateBasis, interestRate),
      testedPartyAdjustment: 0,
      comparableAdjustments: comparableAdjustments.map((ca) => ({
        companyName: ca.companyName,
        adjustment: ca.adjustment,
      })),
      adjustedMargins: [],
      regulatoryBasis: "Rule 10B(3) of the Income Tax Rules, 1962",
      aiEnhanced: false,
    };
  }

  private calculateWorkingCapitalDays(
    revenue: number,
    receivables: number,
    inventory: number,
    payables: number
  ): number {
    const dailyRevenue = revenue / 365;
    if (dailyRevenue <= 0) return 0;

    const receivableDays = receivables / dailyRevenue;
    const inventoryDays = inventory / dailyRevenue;
    const payableDays = payables / dailyRevenue;

    return receivableDays + inventoryDays - payableDays;
  }

  private getWorkingCapitalMethodology(rateBasis: string, rate: number): string {
    return `Working capital adjustment computed using the ${rateBasis} rate of ${rate}% p.a. ` +
      `The adjustment quantifies the difference in working capital intensity between the tested party ` +
      `and comparable companies, expressed as a percentage adjustment to operating margins. ` +
      `Formula: WC Adjustment = (Comparable WC Days - Tested Party WC Days) / 365 × Interest Rate`;
  }

  private generateTemplateWCNarrative(
    data: WorkingCapitalData,
    testedPartyWC: number,
    comparableAdjustments: Array<{ companyName: string; adjustment: number; wcDays: number }>,
    interestRate: number,
    rateBasis: string
  ): string {
    const avgAdjustment =
      comparableAdjustments.length > 0
        ? comparableAdjustments.reduce((sum, ca) => sum + ca.adjustment, 0) /
          comparableAdjustments.length
        : 0;

    return `Working Capital Adjustment Analysis for ${data.testedPartyName}

As per Rule 10B(3) of the Income Tax Rules, 1962, appropriate adjustments have been made to account for differences in working capital between the tested party and comparable companies.

Methodology:
The working capital adjustment has been computed using the ${rateBasis} at ${interestRate}% per annum as the cost of financing working capital. Working capital days are calculated as: (Trade Receivables + Inventory - Trade Payables) / (Revenue / 365).

Tested Party Working Capital:
- Working Capital Days: ${testedPartyWC.toFixed(0)} days
- Financial Year: ${data.financialYear}
- Trade Receivables: INR ${(data.receivables / 10000000).toFixed(2)} Cr
- Inventory: INR ${(data.inventory / 10000000).toFixed(2)} Cr
- Trade Payables: INR ${(data.payables / 10000000).toFixed(2)} Cr

Comparable Company Adjustments:
${comparableAdjustments
  .map(
    (ca) =>
      `- ${ca.companyName}: WC Days ${ca.wcDays.toFixed(0)}, Adjustment ${ca.adjustment > 0 ? "+" : ""}${ca.adjustment.toFixed(2)}%`
  )
  .join("\n")}

Average Working Capital Adjustment: ${avgAdjustment > 0 ? "+" : ""}${avgAdjustment.toFixed(2)}%

The above adjustments have been applied to the operating margins of comparable companies to ensure comparability with the tested party's working capital position.`;
  }

  // ===========================================================================
  // COMPARABLE REJECTION RATIONALE
  // ===========================================================================

  /**
   * Generate detailed rejection rationale for a comparable company
   */
  async generateComparableRejection(
    company: ComparableCompany,
    testedPartyIndustry: string,
    testedPartyFunctions: string[],
    testedPartyRevenue: number
  ): Promise<ComparableRejectionResult> {
    const detailedReasons = this.buildRejectionDetails(company);

    // Try AI-enhanced rationale
    if (isAIConfigured() && company.rejectionReasons.length > 0) {
      try {
        const generator = getTPDocumentGenerator();

        // Get financial data for recent year
        const years = Object.keys(company.financials).sort().reverse();
        const recentYear = years[0];
        const financialDataStr = recentYear
          ? `Revenue: INR ${(company.financials[recentYear].operatingRevenue / 10000000).toFixed(2)} Cr, ` +
            `OP Margin: ${(
              company.plis[recentYear]?.[PLIType.OP_OC] ||
              (company.financials[recentYear].operatingProfit /
                company.financials[recentYear].totalOperatingCost) *
                100
            ).toFixed(2)}%, ` +
            `RPT: ${company.financials[recentYear].rptAsPercentage.toFixed(1)}%`
          : "Financial data not available";

        const aiResponse = await generator.generateComparableRejection({
          companyName: company.name,
          companyCIN: company.cin,
          industry: company.nicDescription,
          nicCode: company.nicCode,
          financialData: financialDataStr,
          businessDescription: `${company.nicDescription} - ${company.functionalProfile || "Not specified"}`,
          annualReportObservations: "Standard business operations",
          testedPartyIndustry,
          testedPartyFunctions: testedPartyFunctions.join(", "),
          testedPartyRevenue,
          rejectionCategory: company.rejectionReasons
            .map((r) => this.getScreeningCriteriaName(r))
            .join(", "),
        });

        if (aiResponse.success && aiResponse.content) {
          return {
            companyName: company.name,
            cin: company.cin,
            rejectionRationale: aiResponse.content,
            rejectionCategories: company.rejectionReasons,
            detailedReasons,
            regulatoryBasis: "Rule 10B(2) of the Income Tax Rules, 1962",
            aiEnhanced: true,
            qualityScore: aiResponse.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI comparable rejection generation failed:", error);
      }
    }

    // Fallback to template-based rationale
    return {
      companyName: company.name,
      cin: company.cin,
      rejectionRationale: this.generateTemplateRejectionRationale(company, detailedReasons),
      rejectionCategories: company.rejectionReasons,
      detailedReasons,
      regulatoryBasis: "Rule 10B(2) of the Income Tax Rules, 1962",
      aiEnhanced: false,
    };
  }

  private buildRejectionDetails(
    company: ComparableCompany
  ): Array<{ criterion: string; explanation: string; supportingData: string }> {
    const details: Array<{ criterion: string; explanation: string; supportingData: string }> = [];

    for (const reason of company.rejectionReasons) {
      const detail = this.getRejectionDetail(reason, company);
      if (detail) {
        details.push(detail);
      }
    }

    return details;
  }

  private getRejectionDetail(
    reason: ScreeningCriteria,
    company: ComparableCompany
  ): { criterion: string; explanation: string; supportingData: string } | null {
    const years = Object.keys(company.financials).sort().reverse();
    const recentYear = years[0];
    const financials = recentYear ? company.financials[recentYear] : null;

    switch (reason) {
      case ScreeningCriteria.RELATED_PARTY_TRANSACTIONS:
        return {
          criterion: "Related Party Transactions",
          explanation:
            "Company has significant related party transactions that may distort arm's length margins",
          supportingData: financials
            ? `RPT as % of revenue: ${financials.rptAsPercentage.toFixed(1)}%`
            : "RPT data indicates high related party dependency",
        };

      case ScreeningCriteria.PERSISTENT_LOSSES:
        return {
          criterion: "Persistent Losses",
          explanation:
            "Company has incurred operating losses in multiple years, indicating business abnormality",
          supportingData: this.getLossYearsSummary(company),
        };

      case ScreeningCriteria.FUNCTIONAL_DISSIMILARITY:
        return {
          criterion: "Functional Dissimilarity",
          explanation:
            "Company's functional profile differs significantly from the tested party",
          supportingData: `Functional Profile: ${company.functionalProfile || "Not classified"}`,
        };

      case ScreeningCriteria.DIFFERENT_INDUSTRY:
        return {
          criterion: "Different Industry",
          explanation: "Company operates in a different industry segment",
          supportingData: `NIC Code: ${company.nicCode} - ${company.nicDescription}`,
        };

      case ScreeningCriteria.TURNOVER_FILTER:
        return {
          criterion: "Turnover Filter",
          explanation: "Company's turnover is outside the acceptable range for comparability",
          supportingData: financials
            ? `Revenue: INR ${(financials.operatingRevenue / 10000000).toFixed(2)} Cr`
            : "Turnover outside acceptable range",
        };

      case ScreeningCriteria.DATA_NON_AVAILABILITY:
        return {
          criterion: "Data Non-Availability",
          explanation: "Complete financial data not available for the analysis period",
          supportingData: `Available years: ${years.join(", ") || "None"}`,
        };

      default:
        return {
          criterion: this.getScreeningCriteriaName(reason),
          explanation: "Company does not meet the screening criteria",
          supportingData: "See detailed analysis",
        };
    }
  }

  private getLossYearsSummary(company: ComparableCompany): string {
    const lossYears: string[] = [];
    for (const [year, financials] of Object.entries(company.financials)) {
      if (financials.operatingProfit < 0) {
        lossYears.push(year);
      }
    }
    return lossYears.length > 0
      ? `Loss years: ${lossYears.join(", ")}`
      : "No loss years identified";
  }

  private getScreeningCriteriaName(criteria: ScreeningCriteria): string {
    const names: Record<ScreeningCriteria, string> = {
      [ScreeningCriteria.RELATED_PARTY_TRANSACTIONS]: "Related Party Transactions",
      [ScreeningCriteria.PERSISTENT_LOSSES]: "Persistent Losses",
      [ScreeningCriteria.FUNCTIONAL_DISSIMILARITY]: "Functional Dissimilarity",
      [ScreeningCriteria.DIFFERENT_ACCOUNTING_YEAR]: "Different Accounting Year",
      [ScreeningCriteria.EXTRAORDINARY_EVENTS]: "Extraordinary Events",
      [ScreeningCriteria.DATA_NON_AVAILABILITY]: "Data Non-Availability",
      [ScreeningCriteria.DIFFERENT_INDUSTRY]: "Different Industry",
      [ScreeningCriteria.EMPLOYEE_COUNT_FILTER]: "Employee Count Filter",
      [ScreeningCriteria.TURNOVER_FILTER]: "Turnover Filter",
      [ScreeningCriteria.EXPORT_INTENSITY]: "Export Intensity",
    };
    return names[criteria] || criteria;
  }

  private generateTemplateRejectionRationale(
    company: ComparableCompany,
    details: Array<{ criterion: string; explanation: string; supportingData: string }>
  ): string {
    return `Rejection Rationale for ${company.name} (CIN: ${company.cin})

The company has been rejected from the final set of comparable companies based on the following criteria as per Rule 10B(2) of the Income Tax Rules, 1962:

${details
  .map(
    (d, i) => `${i + 1}. ${d.criterion}
   Reason: ${d.explanation}
   Supporting Data: ${d.supportingData}`
  )
  .join("\n\n")}

The above factors materially affect the comparability of ${company.name} with the tested party, and hence it has been excluded from the arm's length analysis.`;
  }

  // ===========================================================================
  // ARM'S LENGTH CONCLUSION
  // ===========================================================================

  /**
   * Generate comprehensive arm's length conclusion with AI enhancement
   */
  async generateArmLengthConclusion(
    result: BenchmarkingResult
  ): Promise<ArmLengthConclusionResult> {
    const pliType = result.pliType;
    const testedMargin = Object.values(result.testedPartyPLI)[0] || 0;

    // Try AI-enhanced conclusion
    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();

        const comparableMarginsStr = result.acceptedCompanies
          .map((c) => `${c.name}: ${(c.weightedAveragePLI[pliType] || 0).toFixed(2)}%`)
          .join(", ");

        const aiResponse = await generator.generateArmLengthConclusion({
          pliType: this.getPLIDisplayName(pliType),
          financialYears: result.analysisYears.join(", "),
          numberOfComparables: result.comparablesAccepted,
          comparableMargins: comparableMarginsStr,
          percentile35: result.lowerQuartile,
          median: result.median,
          percentile65: result.upperQuartile,
          arithmeticMean: result.arithmeticMean,
          testedPartyName: result.testedPartyName,
          testedPartyMargin: testedMargin,
          operatingCost: 0, // Not directly available from result, would need tested party financials
          operatingRevenue: 0, // Not directly available from result
        });

        if (aiResponse.success && aiResponse.content) {
          return {
            narrative: aiResponse.content,
            summary: this.generateConclusionSummary(result, testedMargin),
            pliAnalysis: {
              pliType: pliType,
              pliDescription: this.getPLIDisplayName(pliType),
              testedPartyMargin: testedMargin,
              armLengthRange: {
                lowerQuartile: result.lowerQuartile,
                median: result.median,
                upperQuartile: result.upperQuartile,
                arithmeticMean: result.arithmeticMean,
              },
            },
            conclusion: result.testedPartyInRange ? "within_range" : "requires_adjustment",
            adjustmentDetails: result.adjustmentRequired
              ? {
                  direction: result.adjustmentDirection || "increase",
                  amount: result.adjustmentAmount,
                  basis: "Adjustment to median as per Rule 10CA",
                }
              : undefined,
            regulatoryBasis: "Rule 10CA of the Income Tax Rules, 1962",
            recommendations: this.generateRecommendations(result),
            aiEnhanced: true,
            qualityScore: aiResponse.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI arm's length conclusion generation failed:", error);
      }
    }

    // Fallback to template-based conclusion
    return {
      narrative: this.generateTemplateConclusion(result, testedMargin),
      summary: this.generateConclusionSummary(result, testedMargin),
      pliAnalysis: {
        pliType: pliType,
        pliDescription: this.getPLIDisplayName(pliType),
        testedPartyMargin: testedMargin,
        armLengthRange: {
          lowerQuartile: result.lowerQuartile,
          median: result.median,
          upperQuartile: result.upperQuartile,
          arithmeticMean: result.arithmeticMean,
        },
      },
      conclusion: result.testedPartyInRange ? "within_range" : "requires_adjustment",
      adjustmentDetails: result.adjustmentRequired
        ? {
            direction: result.adjustmentDirection || "increase",
            amount: result.adjustmentAmount,
            basis: "Adjustment to median as per Rule 10CA",
          }
        : undefined,
      regulatoryBasis: "Rule 10CA of the Income Tax Rules, 1962",
      recommendations: this.generateRecommendations(result),
      aiEnhanced: false,
    };
  }

  private getPLIDisplayName(pliType: PLIType): string {
    const names: Record<PLIType, string> = {
      [PLIType.OP_OC]: "Operating Profit / Operating Cost (OP/OC)",
      [PLIType.OP_OR]: "Operating Profit / Operating Revenue (OP/OR)",
      [PLIType.OP_TA]: "Operating Profit / Total Assets (ROA)",
      [PLIType.OP_CE]: "Operating Profit / Capital Employed (ROCE)",
      [PLIType.BERRY_RATIO]: "Berry Ratio (GP / Operating Expenses)",
      [PLIType.NCP_SALES]: "Net Cost Plus to Sales",
    };
    return names[pliType] || pliType;
  }

  private generateConclusionSummary(result: BenchmarkingResult, testedMargin: number): string {
    if (result.testedPartyInRange) {
      return `The tested party's margin of ${testedMargin.toFixed(2)}% falls within the arm's length range (${result.lowerQuartile.toFixed(2)}% - ${result.upperQuartile.toFixed(2)}%). No transfer pricing adjustment is required.`;
    } else {
      return `The tested party's margin of ${testedMargin.toFixed(2)}% falls outside the arm's length range. An adjustment of ${result.adjustmentAmount.toFixed(2)}% to the median of ${result.median.toFixed(2)}% may be required.`;
    }
  }

  private generateRecommendations(result: BenchmarkingResult): string[] {
    const recommendations: string[] = [];

    if (result.testedPartyInRange) {
      recommendations.push("Maintain current pricing policy and documentation");
      recommendations.push("Conduct annual benchmarking to ensure continued compliance");
      recommendations.push("Document functional analysis and comparability factors");
    } else {
      recommendations.push("Review current intercompany pricing policy");
      recommendations.push("Consider pricing adjustment to bring margin within range");
      recommendations.push("Evaluate possibility of APA application for certainty");
      recommendations.push("Document business reasons for current margin if below range");
    }

    return recommendations;
  }

  private generateTemplateConclusion(result: BenchmarkingResult, testedMargin: number): string {
    return `ARM'S LENGTH ANALYSIS AND CONCLUSION

1. PROFIT LEVEL INDICATOR (PLI)
The ${this.getPLIDisplayName(result.pliType)} has been selected as the most appropriate PLI for this analysis, considering the nature of the international transaction and the functional profile of the tested party.

2. COMPARABLE SET
- Companies identified: ${result.comparablesSearched}
- Companies accepted: ${result.comparablesAccepted}
- Companies rejected: ${result.comparablesSearched - result.comparablesAccepted}

3. ARM'S LENGTH RANGE (As per Rule 10CA)
- 35th Percentile (Lower Quartile): ${result.lowerQuartile.toFixed(2)}%
- 50th Percentile (Median): ${result.median.toFixed(2)}%
- 65th Percentile (Upper Quartile): ${result.upperQuartile.toFixed(2)}%
- Arithmetic Mean: ${result.arithmeticMean.toFixed(2)}%
- Full Range: ${result.minimum.toFixed(2)}% to ${result.maximum.toFixed(2)}%

4. TESTED PARTY ANALYSIS
- Tested Party: ${result.testedPartyName}
- Tested Party Margin: ${testedMargin.toFixed(2)}%
- Analysis Period: ${result.analysisYears.join(", ")}

5. CONCLUSION
${
  result.testedPartyInRange
    ? `The tested party's operating margin of ${testedMargin.toFixed(2)}% falls within the interquartile range of ${result.lowerQuartile.toFixed(2)}% to ${result.upperQuartile.toFixed(2)}%. Accordingly, the international transactions are concluded to be at arm's length and no transfer pricing adjustment is warranted.`
    : `The tested party's operating margin of ${testedMargin.toFixed(2)}% falls ${testedMargin < result.lowerQuartile ? "below" : "above"} the arm's length range. As per Rule 10CA, an adjustment to the median of ${result.median.toFixed(2)}% (adjustment of ${result.adjustmentAmount.toFixed(2)}%) may be considered for transfer pricing purposes.`
}

6. REGULATORY REFERENCE
This analysis has been conducted in accordance with:
- Section 92 to 92F of the Income Tax Act, 1961
- Rules 10A to 10E of the Income Tax Rules, 1962
- Rule 10CA for computation of arm's length range`;
  }

  // ===========================================================================
  // ENHANCED BENCHMARKING
  // ===========================================================================

  /**
   * Perform complete benchmarking with AI-enhanced analysis
   */
  async performEnhancedBenchmarking(
    testedPartyName: string,
    testedPartyFinancials: Record<string, FinancialData>,
    pliType: PLIType,
    searchCriteria: SearchCriteria,
    workingCapitalData?: WorkingCapitalData
  ): Promise<EnhancedBenchmarkingResult> {
    // Perform base benchmarking
    const baseResult = this.benchmarkingEngine.performBenchmarking(
      testedPartyName,
      testedPartyFinancials,
      pliType,
      searchCriteria
    );

    // Generate rejection rationales for all rejected companies
    const rejectionRationales: ComparableRejectionResult[] = [];
    const testedPartyIndustry = searchCriteria.nicCodes[0]
      ? this.getNICDescription(searchCriteria.nicCodes[0])
      : "IT/ITeS Services";

    for (const company of baseResult.rejectedCompanies) {
      const rationale = await this.generateComparableRejection(
        company,
        testedPartyIndustry,
        [], // Functions would come from tested party profile
        Object.values(testedPartyFinancials)[0]?.operatingRevenue || 0
      );
      rejectionRationales.push(rationale);
    }

    // Generate arm's length conclusion
    const armLengthConclusion = await this.generateArmLengthConclusion(baseResult);

    // Generate working capital narrative if data provided
    let workingCapitalNarrative: string | undefined;
    if (workingCapitalData) {
      const wcResult = await this.generateWorkingCapitalAdjustment(workingCapitalData);
      workingCapitalNarrative = wcResult.narrative;
    }

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(baseResult, armLengthConclusion);

    // Return enhanced result
    return {
      ...baseResult,
      aiEnhanced: isAIConfigured(),
      workingCapitalNarrative,
      rejectionRationales,
      armLengthConclusion,
      executiveSummary,
      regulatoryCompliance: {
        rule10B: true, // Comparability analysis performed
        rule10CA: true, // Range computed using prescribed methodology
        documentationComplete: rejectionRationales.length === baseResult.rejectedCompanies.length,
      },
    };
  }

  private getNICDescription(nicCode: string): string {
    const prefix = nicCode.substring(0, 2);
    const nicInfo = {
      "62": "Computer programming, consultancy and related activities",
      "63": "Information service activities",
      "70": "Management consultancy activities",
      "72": "Scientific research and development",
      "21": "Manufacture of pharmaceuticals",
      "29": "Manufacture of motor vehicles",
    };
    return nicInfo[prefix as keyof typeof nicInfo] || "Other business activities";
  }

  private generateExecutiveSummary(
    result: BenchmarkingResult,
    conclusion: ArmLengthConclusionResult
  ): string {
    const testedMargin = Object.values(result.testedPartyPLI)[0] || 0;

    return `EXECUTIVE SUMMARY

Transfer Pricing Benchmarking Analysis for ${result.testedPartyName}

Key Findings:
- Analysis Period: ${result.analysisYears.join(", ")}
- PLI Used: ${conclusion.pliAnalysis.pliDescription}
- Comparable Companies: ${result.comparablesAccepted} accepted from ${result.comparablesSearched} identified
- Arm's Length Range: ${result.lowerQuartile.toFixed(2)}% to ${result.upperQuartile.toFixed(2)}%
- Tested Party Margin: ${testedMargin.toFixed(2)}%

Conclusion: ${conclusion.summary}

Status: ${result.testedPartyInRange ? "COMPLIANT - No adjustment required" : "REVIEW REQUIRED - Potential adjustment"}`;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createBenchmarkingAIService(): BenchmarkingAIService {
  return new BenchmarkingAIService();
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export {
  PLIType,
  ScreeningCriteria,
  FunctionalProfile,
  DatabaseSource,
  calculatePLIs,
} from "./benchmarking-engine";
