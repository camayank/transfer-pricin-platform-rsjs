/**
 * ================================================================================
 * DIGICOMPLY ANALYTICS AI SERVICE
 * AI-Enhanced Transfer Pricing Analytics
 *
 * Integrates AI capabilities for:
 * - Regulatory precedent mining
 * - Cross-border transaction analysis
 * - Multi-year trend analysis
 * - Risk prediction
 * ================================================================================
 */

import {
  getTPDocumentGenerator,
  isAIConfigured,
  PromptType,
  QualityResult,
  RegulatoryPrecedentMining,
  CrossBorderAnalysis,
  MultiYearTrendAnalysis,
  RiskPrediction,
} from "../ai";

// =============================================================================
// TYPES
// =============================================================================

export interface PrecedentMiningResult {
  mining: RegulatoryPrecedentMining;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface CrossBorderResult {
  analysis: CrossBorderAnalysis;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface TrendAnalysisResult {
  analysis: MultiYearTrendAnalysis;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface RiskPredictionResult {
  prediction: RiskPrediction;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface FinancialYearData {
  year: string;
  revenue: number;
  operatingProfit: number;
  opOcMargin: number;
  opOrMargin: number;
  rptValue: number;
  employeeCost?: number;
}

export interface CrossBorderTransaction {
  fromJurisdiction: string;
  toJurisdiction: string;
  transactionType: string;
  value: number;
  tpMethod: string;
  currency: string;
}

export interface BenchmarkData {
  year: string;
  metric: string;
  value: number;
}

// =============================================================================
// ANALYTICS AI SERVICE CLASS
// =============================================================================

export class AnalyticsAIService {
  private generator = getTPDocumentGenerator();

  /**
   * Check if AI is configured and available
   */
  isAvailable(): boolean {
    return isAIConfigured();
  }

  /**
   * Mine regulatory precedents for a TP issue
   */
  async mineRegulatoryPrecedents(
    query: string,
    entityType: string,
    industry: string,
    transactionType: string,
    assessmentYear: string,
    specificFacts: string,
    currentPosition: string,
    revenuePosition?: string,
    jurisdictionPriority?: string,
    timePeriod?: string,
    specificBenches?: string,
    relatedIssues?: string
  ): Promise<PrecedentMiningResult> {
    if (!this.isAvailable()) {
      return this.createFallbackPrecedentMining(query, transactionType);
    }

    try {
      const response = await this.generator.generateCustomPrompt(
        PromptType.REGULATORY_PRECEDENT_MINING,
        {
          query,
          entityType,
          industry,
          transactionType,
          assessmentYear,
          specificFacts,
          currentPosition,
          revenuePosition: revenuePosition || "",
          jurisdictionPriority: jurisdictionPriority || "Delhi ITAT, Mumbai ITAT",
          timePeriod: timePeriod || "Last 5 years",
          specificBenches: specificBenches || "",
          relatedIssues: relatedIssues || "",
        },
        {
          assessmentYear,
          transactionType,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          mining: response.parsedContent as unknown as RegulatoryPrecedentMining,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackPrecedentMining(query, transactionType);
    } catch (error) {
      console.error("Regulatory precedent mining failed:", error);
      return this.createFallbackPrecedentMining(query, transactionType);
    }
  }

  /**
   * Analyze cross-border transactions
   */
  async analyzeCrossBorder(
    indianEntity: string,
    industry: string,
    financialYear: string,
    transactions: CrossBorderTransaction[],
    currentMethods: string,
    applicableDTAAs: string[],
    existingStructure?: string,
    peExposure?: string,
    withholdingTax?: string
  ): Promise<CrossBorderResult> {
    if (!this.isAvailable()) {
      return this.createFallbackCrossBorderAnalysis(
        indianEntity,
        transactions,
        applicableDTAAs
      );
    }

    try {
      const jurisdictions = [
        ...new Set(
          transactions.flatMap((t) => [t.fromJurisdiction, t.toJurisdiction])
        ),
      ].filter((j) => j !== "India");

      const jurisdictionSummary = jurisdictions.map((j) => {
        const txns = transactions.filter(
          (t) => t.toJurisdiction === j || t.fromJurisdiction === j
        );
        return {
          jurisdiction: j,
          transactionCount: txns.length,
          totalValue: txns.reduce((sum, t) => sum + t.value, 0),
        };
      });

      const response = await this.generator.generateCustomPrompt(
        PromptType.CROSS_BORDER_ANALYSIS,
        {
          indianEntity,
          industry,
          financialYear,
          transactions: JSON.stringify(transactions, null, 2),
          jurisdictions: jurisdictions.join(", "),
          jurisdictionSummary: JSON.stringify(jurisdictionSummary, null, 2),
          currentMethods,
          applicableDTAAs: applicableDTAAs.join(", "),
          existingStructure: existingStructure || "",
          peExposure: peExposure || "",
          withholdingTax: withholdingTax || "",
        },
        {
          entityName: indianEntity,
          financialYear,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          analysis: response.parsedContent as unknown as CrossBorderAnalysis,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackCrossBorderAnalysis(
        indianEntity,
        transactions,
        applicableDTAAs
      );
    } catch (error) {
      console.error("Cross-border analysis failed:", error);
      return this.createFallbackCrossBorderAnalysis(
        indianEntity,
        transactions,
        applicableDTAAs
      );
    }
  }

  /**
   * Analyze multi-year trends
   */
  async analyzeMultiYearTrends(
    entityName: string,
    industry: string,
    financialData: FinancialYearData[],
    industryBenchmarks: BenchmarkData[],
    comparableData?: string,
    significantEvents?: string,
    restructuring?: string
  ): Promise<TrendAnalysisResult> {
    if (!this.isAvailable()) {
      return this.createFallbackTrendAnalysis(entityName, financialData);
    }

    try {
      const analysisYears = financialData.map((d) => d.year);

      const tpMetrics = financialData.map((d) => ({
        year: d.year,
        opOcMargin: d.opOcMargin,
        opOrMargin: d.opOrMargin,
        rptRatio: (d.rptValue / d.revenue) * 100,
      }));

      const response = await this.generator.generateCustomPrompt(
        PromptType.MULTI_YEAR_TREND_ANALYSIS,
        {
          entityName,
          industry,
          analysisYears: analysisYears.join(", "),
          financialData: JSON.stringify(financialData, null, 2),
          tpMetrics: JSON.stringify(tpMetrics, null, 2),
          industryBenchmarks: JSON.stringify(industryBenchmarks, null, 2),
          rptData: JSON.stringify(
            financialData.map((d) => ({
              year: d.year,
              rptValue: d.rptValue,
              rptPercentage: (d.rptValue / d.revenue) * 100,
            })),
            null,
            2
          ),
          comparableData: comparableData || "",
          significantEvents: significantEvents || "",
          restructuring: restructuring || "",
        },
        {
          entityName,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          analysis: response.parsedContent as unknown as MultiYearTrendAnalysis,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackTrendAnalysis(entityName, financialData);
    } catch (error) {
      console.error("Multi-year trend analysis failed:", error);
      return this.createFallbackTrendAnalysis(entityName, financialData);
    }
  }

  /**
   * Predict future TP risks
   */
  async predictRisks(
    entityName: string,
    industry: string,
    predictionPeriod: string,
    currentRevenue: number,
    currentMargin: number,
    currentRPT: number,
    documentationStatus: string,
    historicalData: FinancialYearData[],
    currentRiskProfile: string,
    industryTrends?: string,
    regulatoryEnvironment?: string,
    upcomingChanges?: string,
    macroFactors?: string,
    plannedTransactions?: string
  ): Promise<RiskPredictionResult> {
    if (!this.isAvailable()) {
      return this.createFallbackRiskPrediction(
        entityName,
        predictionPeriod,
        currentMargin,
        historicalData
      );
    }

    try {
      const response = await this.generator.generateCustomPrompt(
        PromptType.RISK_PREDICTION,
        {
          entityName,
          industry,
          predictionPeriod,
          currentRevenue,
          currentMargin,
          currentRPT,
          documentationStatus,
          historicalData: JSON.stringify(historicalData, null, 2),
          currentRiskProfile,
          industryTrends: industryTrends || "Stable industry conditions",
          regulatoryEnvironment:
            regulatoryEnvironment || "Standard regulatory environment",
          upcomingChanges: upcomingChanges || "",
          macroFactors: macroFactors || "",
          plannedTransactions: plannedTransactions || "",
        },
        {
          entityName,
          regulatoryFramework: "indian",
        }
      );

      if (response.success && response.parsedContent) {
        return {
          prediction: response.parsedContent as unknown as RiskPrediction,
          aiGenerated: true,
          qualityScore: response.qualityScore,
        };
      }

      return this.createFallbackRiskPrediction(
        entityName,
        predictionPeriod,
        currentMargin,
        historicalData
      );
    } catch (error) {
      console.error("Risk prediction failed:", error);
      return this.createFallbackRiskPrediction(
        entityName,
        predictionPeriod,
        currentMargin,
        historicalData
      );
    }
  }

  // ===========================================================================
  // FALLBACK METHODS
  // ===========================================================================

  private createFallbackPrecedentMining(
    query: string,
    transactionType: string
  ): PrecedentMiningResult {
    return {
      mining: {
        query,
        relevantPrecedents: [
          {
            caseName: "Standard Precedent Analysis Required",
            citation: "Manual research required",
            court: "ITAT",
            year: new Date().getFullYear(),
            issue: transactionType,
            holding: "Please conduct manual precedent research",
            relevanceScore: 50,
            applicability: "To be determined",
          },
        ],
        regulatoryGuidance: [
          {
            source: "CBDT",
            reference: "Section 92C",
            excerpt: "Arm's length price determination provisions",
            applicability: "General TP compliance",
          },
        ],
        trends: [
          {
            trend: "Increased scrutiny on related party transactions",
            direction: "neutral",
            significance: "Standard regulatory focus",
          },
        ],
        recommendations: [
          "Conduct detailed precedent research for specific facts",
          "Consult with TP counsel for case-specific guidance",
        ],
      },
      aiGenerated: false,
    };
  }

  private createFallbackCrossBorderAnalysis(
    indianEntity: string,
    transactions: CrossBorderTransaction[],
    applicableDTAAs: string[]
  ): CrossBorderResult {
    const jurisdictions = [
      ...new Set(
        transactions.flatMap((t) => [t.fromJurisdiction, t.toJurisdiction])
      ),
    ].filter((j) => j !== "India");

    return {
      analysis: {
        primaryJurisdiction: "India",
        counterpartyJurisdictions: jurisdictions,
        transactionFlows: transactions.map((t) => ({
          fromJurisdiction: t.fromJurisdiction,
          toJurisdiction: t.toJurisdiction,
          transactionType: t.transactionType,
          value: t.value,
          tpMethod: t.tpMethod,
          withholdingTax: 0,
          treatyBenefit: applicableDTAAs.some((d) =>
            d.toLowerCase().includes(t.toJurisdiction.toLowerCase())
          ),
        })),
        riskAssessment: jurisdictions.map((j) => ({
          jurisdiction: j,
          riskLevel: "medium" as const,
          riskFactors: ["Standard cross-border risks"],
        })),
        dtaaAnalysis: applicableDTAAs.map((treaty) => ({
          treaty,
          relevantArticles: ["Article 7 - Business Profits", "Article 12 - Royalties"],
          benefits: ["Reduced WHT rates", "PE protection"],
          limitations: ["LOB clauses may apply"],
        })),
        recommendations: [
          "Review treaty positions annually",
          "Maintain PE documentation",
          "Monitor regulatory changes",
        ],
        complianceRequirements: jurisdictions.map((j) => ({
          jurisdiction: j,
          requirements: ["TP documentation", "Annual filing"],
          deadlines: ["As per local regulations"],
        })),
      },
      aiGenerated: false,
    };
  }

  private createFallbackTrendAnalysis(
    entityName: string,
    financialData: FinancialYearData[]
  ): TrendAnalysisResult {
    const years = financialData.map((d) => d.year);

    // Calculate simple trends
    const revenueValues = financialData.map((d) => ({
      year: d.year,
      value: d.revenue,
    }));
    const marginValues = financialData.map((d) => ({
      year: d.year,
      value: d.opOcMargin,
    }));

    const revenueTrend = this.calculateTrend(revenueValues);
    const marginTrend = this.calculateTrend(marginValues);

    return {
      analysis: {
        entityName,
        analysisYears: years,
        financialTrends: [
          {
            metric: "Revenue",
            values: revenueValues,
            trend: revenueTrend.direction,
            cagr: revenueTrend.cagr,
          },
          {
            metric: "OP/OC Margin",
            values: marginValues,
            trend: marginTrend.direction,
          },
        ],
        tpMetricTrends: [
          {
            metric: "OP/OC Margin",
            values: marginValues,
            industryBenchmark: marginValues.map((v) => ({
              year: v.year,
              value: 10,
            })),
            variance: marginValues.map((v) => ({
              year: v.year,
              variance: v.value - 10,
            })),
          },
        ],
        anomalies: [],
        rptTrends: [
          {
            transactionType: "All RPT",
            values: financialData.map((d) => ({
              year: d.year,
              value: d.rptValue,
            })),
            percentageOfRevenue: financialData.map((d) => ({
              year: d.year,
              percentage: (d.rptValue / d.revenue) * 100,
            })),
          },
        ],
        conclusions: [
          `Revenue trend: ${revenueTrend.direction}`,
          `Margin trend: ${marginTrend.direction}`,
        ],
        recommendations: ["Continue monitoring key metrics", "Maintain documentation"],
      },
      aiGenerated: false,
    };
  }

  private createFallbackRiskPrediction(
    entityName: string,
    predictionPeriod: string,
    currentMargin: number,
    historicalData: FinancialYearData[]
  ): RiskPredictionResult {
    const marginValues = historicalData.map((d) => ({
      year: d.year,
      value: d.opOcMargin,
    }));
    const marginTrend = this.calculateTrend(marginValues);

    let riskScore = 40; // Base risk
    if (currentMargin < 5) riskScore += 20;
    if (marginTrend.direction === "decreasing") riskScore += 15;

    return {
      prediction: {
        entityName,
        predictionPeriod,
        overallRiskScore: Math.min(riskScore, 100),
        riskTrajectory: marginTrend.direction === "increasing" ? "improving" : "stable",
        predictedRisks: [
          {
            riskType: "Audit selection",
            probability: riskScore,
            impact: riskScore > 60 ? "high" : "medium",
            timeframe: predictionPeriod,
            triggers: currentMargin < 5 ? ["Below benchmark margin"] : [],
          },
        ],
        earlyWarningIndicators: [
          {
            indicator: "OP/OC Margin",
            currentValue: currentMargin,
            threshold: 5,
            status: currentMargin >= 5 ? "normal" : "warning",
          },
        ],
        mitigationStrategies: [
          {
            risk: "Audit selection",
            strategy: "Strengthen documentation",
            effectiveness: 70,
            implementation: "Immediate",
          },
        ],
        scenarioAnalysis: [
          {
            scenario: "Base case",
            probability: 60,
            impact: "Current risk levels maintained",
            recommendedResponse: "Continue current practices",
          },
          {
            scenario: "Increased scrutiny",
            probability: 30,
            impact: "Higher audit probability",
            recommendedResponse: "Proactive documentation review",
          },
        ],
      },
      aiGenerated: false,
    };
  }

  private calculateTrend(
    values: { year: string; value: number }[]
  ): { direction: "increasing" | "decreasing" | "stable" | "volatile"; cagr?: number } {
    if (values.length < 2) return { direction: "stable" };

    const first = values[0].value;
    const last = values[values.length - 1].value;
    const years = values.length - 1;

    if (first === 0) return { direction: last > 0 ? "increasing" : "stable" };

    const cagr = (Math.pow(last / first, 1 / years) - 1) * 100;

    let direction: "increasing" | "decreasing" | "stable" | "volatile";
    if (cagr > 5) direction = "increasing";
    else if (cagr < -5) direction = "decreasing";
    else direction = "stable";

    return { direction, cagr };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

let analyticsAIServiceInstance: AnalyticsAIService | null = null;

export function getAnalyticsAIService(): AnalyticsAIService {
  if (!analyticsAIServiceInstance) {
    analyticsAIServiceInstance = new AnalyticsAIService();
  }
  return analyticsAIServiceInstance;
}

export function createAnalyticsAIService(): AnalyticsAIService {
  return new AnalyticsAIService();
}
