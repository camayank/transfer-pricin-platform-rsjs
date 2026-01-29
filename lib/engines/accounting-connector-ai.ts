/**
 * ================================================================================
 * DIGICOMPLY ACCOUNTING CONNECTOR AI SERVICE
 * AI-Enhanced Transaction Classification and Related Party Detection
 *
 * Integrates AI capabilities for:
 * - Intelligent transaction classification
 * - Related party detection beyond keywords
 * - Nature code recommendations
 * - Financial anomaly detection
 * ================================================================================
 */

import {
  DataExtractionEngine,
  TallyPrimeConnector,
  ZohoBooksConnector,
  AccountingConnector,
  AccountingSystem,
  AccountType,
  TransactionType,
  AccountBalance,
  RelatedPartyTransaction,
  FinancialStatement,
  calculatePLIs,
  NATURE_CODE_MAPPING,
  RELATED_PARTY_KEYWORDS,
} from "./accounting-connector-engine";
import {
  getTPDocumentGenerator,
  isAIConfigured,
  PromptType,
  QualityResult,
} from "../ai";

// =============================================================================
// TYPES
// =============================================================================

export interface TransactionClassificationResult {
  transactionId: string;
  originalDescription: string;
  classification: {
    natureCode: string;
    natureDescription: string;
    transactionType: TransactionType;
    confidence: "high" | "medium" | "low";
  };
  isRelatedParty: "yes" | "no" | "likely";
  suggestedTPMethod: string;
  flags: string[];
  aiGenerated: boolean;
}

export interface RelatedPartyDetectionResult {
  accountName: string;
  isRelatedParty: boolean;
  confidence: "high" | "medium" | "low";
  likelyPartyName: string;
  likelyCountry: string;
  indicators: string[];
  suggestedNatureCode: string;
  transactionValue: number;
  aiGenerated: boolean;
}

export interface NatureCodeRecommendation {
  transactionDescription: string;
  primaryCode: string;
  primaryDescription: string;
  alternativeCode?: string;
  alternativeDescription?: string;
  justification: string;
  suggestedTPMethod: string;
  specialConsiderations: string[];
  aiGenerated: boolean;
}

export interface FinancialAnomalyResult {
  anomalies: Array<{
    category: string;
    description: string;
    severity: "high" | "medium" | "low";
    potentialImpact: string;
    recommendation: string;
  }>;
  overallRiskAssessment: {
    riskLevel: "high" | "medium" | "low";
    auditLikelihood: "high" | "medium" | "low";
    priorityAreas: string[];
  };
  documentationGaps: string[];
  recommendations: string[];
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface EnhancedFinancialStatement extends FinancialStatement {
  aiClassifications: TransactionClassificationResult[];
  detectedRelatedParties: RelatedPartyDetectionResult[];
  anomalyAnalysis?: FinancialAnomalyResult;
  form3cebReadyData: {
    transactionsByNature: Array<{
      natureCode: string;
      description: string;
      value: number;
      partyDetails: string[];
    }>;
    aggregateValue: number;
  };
}

// =============================================================================
// ACCOUNTING CONNECTOR AI SERVICE
// =============================================================================

export class AccountingConnectorAIService {
  private extractionEngine: DataExtractionEngine;
  private knownRelatedParties: string[] = [];
  private parentCompany: string = "";
  private parentCountry: string = "";

  constructor() {
    this.extractionEngine = new DataExtractionEngine();
  }

  /**
   * Register an accounting connector
   */
  registerConnector(system: AccountingSystem, connector: AccountingConnector): void {
    this.extractionEngine.registerConnector(system, connector);
  }

  /**
   * Set known related parties for better detection
   */
  setRelatedPartyContext(params: {
    knownParties: string[];
    parentCompany: string;
    parentCountry: string;
  }): void {
    this.knownRelatedParties = params.knownParties;
    this.parentCompany = params.parentCompany;
    this.parentCountry = params.parentCountry;
    this.extractionEngine.setRelatedParties(params.knownParties);
  }

  // ===========================================================================
  // TRANSACTION CLASSIFICATION
  // ===========================================================================

  /**
   * Classify transactions with AI enhancement
   */
  async classifyTransactions(
    transactions: Array<{
      id: string;
      description: string;
      amount: number;
      partyName?: string;
      accountType?: AccountType;
    }>
  ): Promise<TransactionClassificationResult[]> {
    const results: TransactionClassificationResult[] = [];

    // Try AI classification for batch
    if (isAIConfigured() && transactions.length > 0) {
      try {
        const generator = getTPDocumentGenerator();
        const transactionsStr = transactions
          .map(
            (t) =>
              `ID: ${t.id}, Description: ${t.description}, Amount: ${t.amount}, Party: ${t.partyName || "Unknown"}`
          )
          .join("\n");

        const response = await generator.generateCustomPrompt(
          PromptType.TRANSACTION_CLASSIFICATION,
          {
            companyName: "Company",
            financialYear: "2024-25",
            transactions: transactionsStr,
            knownRelatedParties: this.knownRelatedParties.join(", ") || "None specified",
          }
        );

        if (response.success && response.parsedContent) {
          const parsed = response.parsedContent as { classifications?: TransactionClassificationResult[] };
          if (parsed.classifications) {
            return parsed.classifications.map((c) => ({
              ...c,
              aiGenerated: true,
            }));
          }
        }
      } catch (error) {
        console.error("AI transaction classification failed:", error);
      }
    }

    // Fallback to rule-based classification
    for (const txn of transactions) {
      results.push(this.classifyTransactionRuleBased(txn));
    }

    return results;
  }

  private classifyTransactionRuleBased(txn: {
    id: string;
    description: string;
    amount: number;
    partyName?: string;
    accountType?: AccountType;
  }): TransactionClassificationResult {
    const desc = txn.description.toLowerCase();
    const party = txn.partyName?.toLowerCase() || "";

    // Determine transaction type and nature code
    let transactionType = TransactionType.OTHER;
    let natureCode = "99";
    let natureDescription = "Other transactions";

    if (desc.includes("software") || desc.includes("it service") || desc.includes("development")) {
      if (txn.accountType === AccountType.REVENUE) {
        transactionType = TransactionType.SERVICE_INCOME;
        natureCode = "31";
        natureDescription = "Receipt for software development services";
      } else {
        transactionType = TransactionType.SERVICE_EXPENSE;
        natureCode = "21";
        natureDescription = "Payment for software development services";
      }
    } else if (desc.includes("royalty") || desc.includes("license")) {
      if (txn.accountType === AccountType.REVENUE || txn.accountType === AccountType.OTHER_INCOME) {
        transactionType = TransactionType.ROYALTY_INCOME;
        natureCode = "42";
        natureDescription = "Receipt of royalty";
      } else {
        transactionType = TransactionType.ROYALTY_EXPENSE;
        natureCode = "41";
        natureDescription = "Payment of royalty";
      }
    } else if (desc.includes("interest")) {
      if (txn.accountType === AccountType.OTHER_INCOME) {
        transactionType = TransactionType.INTEREST_INCOME;
        natureCode = "54";
        natureDescription = "Interest received";
      } else {
        transactionType = TransactionType.INTEREST_EXPENSE;
        natureCode = "53";
        natureDescription = "Interest paid";
      }
    } else if (desc.includes("management") || desc.includes("support service")) {
      if (txn.accountType === AccountType.REVENUE) {
        transactionType = TransactionType.MANAGEMENT_FEE_INCOME;
        natureCode = "33";
        natureDescription = "Receipt for management services";
      } else {
        transactionType = TransactionType.MANAGEMENT_FEE_EXPENSE;
        natureCode = "23";
        natureDescription = "Payment for management services";
      }
    } else if (desc.includes("guarantee")) {
      transactionType = TransactionType.GUARANTEE_FEE;
      natureCode = "72";
      natureDescription = "Corporate guarantee commission";
    }

    // Check for related party indicators
    const isRelatedParty = this.checkRelatedPartyIndicators(party, desc);

    // Determine suggested TP method
    const suggestedTPMethod = this.suggestTPMethod(transactionType);

    // Generate flags
    const flags: string[] = [];
    if (txn.amount > 100000000) {
      flags.push("High value transaction - detailed documentation recommended");
    }
    if (isRelatedParty === "likely") {
      flags.push("Verify related party status");
    }

    return {
      transactionId: txn.id,
      originalDescription: txn.description,
      classification: {
        natureCode,
        natureDescription,
        transactionType,
        confidence: isRelatedParty === "yes" ? "high" : "medium",
      },
      isRelatedParty,
      suggestedTPMethod,
      flags,
      aiGenerated: false,
    };
  }

  private checkRelatedPartyIndicators(party: string, description: string): "yes" | "no" | "likely" {
    // Check known related parties
    for (const known of this.knownRelatedParties) {
      if (party.includes(known.toLowerCase()) || description.includes(known.toLowerCase())) {
        return "yes";
      }
    }

    // Check parent company
    if (this.parentCompany && party.includes(this.parentCompany.toLowerCase())) {
      return "yes";
    }

    // Check keywords
    for (const keyword of RELATED_PARTY_KEYWORDS) {
      if (party.includes(keyword) || description.includes(keyword)) {
        return "likely";
      }
    }

    return "no";
  }

  private suggestTPMethod(transactionType: TransactionType): string {
    switch (transactionType) {
      case TransactionType.SERVICE_INCOME:
      case TransactionType.SERVICE_EXPENSE:
        return "TNMM with OP/OC or OP/OR as PLI";
      case TransactionType.ROYALTY_INCOME:
      case TransactionType.ROYALTY_EXPENSE:
        return "CUP if comparable royalty rates available, else TNMM";
      case TransactionType.INTEREST_INCOME:
      case TransactionType.INTEREST_EXPENSE:
        return "CUP using market interest rates or Safe Harbour rates";
      case TransactionType.MANAGEMENT_FEE_INCOME:
      case TransactionType.MANAGEMENT_FEE_EXPENSE:
        return "TNMM or Cost Plus Method";
      case TransactionType.GUARANTEE_FEE:
        return "Safe Harbour rates under Rule 10TD or CUP";
      default:
        return "TNMM as Most Appropriate Method";
    }
  }

  // ===========================================================================
  // RELATED PARTY DETECTION
  // ===========================================================================

  /**
   * Detect related parties from account data with AI enhancement
   */
  async detectRelatedParties(
    accounts: AccountBalance[]
  ): Promise<RelatedPartyDetectionResult[]> {
    const results: RelatedPartyDetectionResult[] = [];

    // Try AI-enhanced detection
    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const accountData = accounts
          .map(
            (a) =>
              `${a.accountName}: ${a.accountType}, Balance: ${Math.abs(a.closingDebit - a.closingCredit)}`
          )
          .join("\n");

        const response = await generator.generateCustomPrompt(
          PromptType.RELATED_PARTY_DETECTION,
          {
            companyName: "Company",
            industry: "IT Services",
            accountData,
            transactionSamples: "See account data above",
            knownGroupCompanies: this.knownRelatedParties.join(", ") || "None",
            parentCompany: this.parentCompany || "Not specified",
            parentCountry: this.parentCountry || "Not specified",
          }
        );

        if (response.success && response.parsedContent) {
          const parsed = response.parsedContent as { detectedRelatedParties?: RelatedPartyDetectionResult[] };
          if (parsed.detectedRelatedParties) {
            return parsed.detectedRelatedParties.map((r) => ({
              ...r,
              aiGenerated: true,
            }));
          }
        }
      } catch (error) {
        console.error("AI related party detection failed:", error);
      }
    }

    // Fallback to rule-based detection
    for (const account of accounts) {
      const detection = this.detectRelatedPartyRuleBased(account);
      if (detection.isRelatedParty || detection.confidence !== "low") {
        results.push(detection);
      }
    }

    return results;
  }

  private detectRelatedPartyRuleBased(account: AccountBalance): RelatedPartyDetectionResult {
    const accountNameLower = account.accountName.toLowerCase();
    const indicators: string[] = [];
    let confidence: "high" | "medium" | "low" = "low";
    let likelyPartyName = "";
    let likelyCountry = "";

    // Check known related parties
    for (const known of this.knownRelatedParties) {
      if (accountNameLower.includes(known.toLowerCase())) {
        indicators.push(`Matches known related party: ${known}`);
        likelyPartyName = known;
        confidence = "high";
        break;
      }
    }

    // Check parent company
    if (this.parentCompany && accountNameLower.includes(this.parentCompany.toLowerCase())) {
      indicators.push(`Contains parent company name: ${this.parentCompany}`);
      likelyPartyName = this.parentCompany;
      likelyCountry = this.parentCountry;
      confidence = "high";
    }

    // Check keywords
    for (const keyword of RELATED_PARTY_KEYWORDS) {
      if (accountNameLower.includes(keyword)) {
        indicators.push(`Contains keyword: ${keyword}`);
        if (confidence === "low") confidence = "medium";
      }
    }

    // Check for foreign entity indicators
    const foreignIndicators = ["inc", "llc", "ltd", "gmbh", "bv", "pte", "sa", "ag"];
    for (const indicator of foreignIndicators) {
      if (accountNameLower.includes(indicator)) {
        indicators.push(`Foreign entity indicator: ${indicator.toUpperCase()}`);
        if (confidence === "low") confidence = "medium";
      }
    }

    // Try to extract country from account name
    const countryPatterns = [
      { pattern: /usa|united states|america/i, country: "USA" },
      { pattern: /uk|united kingdom|britain/i, country: "UK" },
      { pattern: /singapore/i, country: "Singapore" },
      { pattern: /netherlands|dutch/i, country: "Netherlands" },
      { pattern: /germany|german/i, country: "Germany" },
      { pattern: /japan/i, country: "Japan" },
    ];

    for (const { pattern, country } of countryPatterns) {
      if (pattern.test(account.accountName)) {
        likelyCountry = country;
        indicators.push(`Country indicator: ${country}`);
        break;
      }
    }

    // Suggest nature code based on account type
    let suggestedNatureCode = "99";
    if (account.accountType === AccountType.REVENUE) {
      suggestedNatureCode = "31"; // Service income
    } else if (account.accountType === AccountType.OPERATING_EXPENSE) {
      suggestedNatureCode = "21"; // Service expense
    }

    return {
      accountName: account.accountName,
      isRelatedParty: confidence === "high" || account.isRelatedParty,
      confidence,
      likelyPartyName: likelyPartyName || account.relatedPartyName || "",
      likelyCountry: likelyCountry || account.relatedPartyCountry || "",
      indicators,
      suggestedNatureCode,
      transactionValue: Math.abs(account.closingDebit - account.closingCredit),
      aiGenerated: false,
    };
  }

  // ===========================================================================
  // NATURE CODE RECOMMENDATION
  // ===========================================================================

  /**
   * Get AI-enhanced nature code recommendations
   */
  async recommendNatureCodes(
    transactions: Array<{
      description: string;
      amount: number;
      partyName: string;
      partyCountry: string;
    }>
  ): Promise<NatureCodeRecommendation[]> {
    const results: NatureCodeRecommendation[] = [];

    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const transactionsStr = transactions
          .map(
            (t) =>
              `Description: ${t.description}, Amount: INR ${t.amount.toLocaleString()}, ` +
              `Party: ${t.partyName} (${t.partyCountry})`
          )
          .join("\n");

        const response = await generator.generateCustomPrompt(
          PromptType.NATURE_CODE_RECOMMENDATION,
          {
            transactionDetails: transactionsStr,
            relatedPartyName: transactions[0]?.partyName || "Related Party",
            relatedPartyCountry: transactions[0]?.partyCountry || "Foreign",
            relationshipType: "Associated Enterprise",
            industryContext: "IT/ITeS Services",
          }
        );

        if (response.success && response.parsedContent) {
          const parsed = response.parsedContent as { recommendations?: NatureCodeRecommendation[] };
          if (parsed.recommendations) {
            return parsed.recommendations.map((r) => ({
              ...r,
              aiGenerated: true,
            }));
          }
        }
      } catch (error) {
        console.error("AI nature code recommendation failed:", error);
      }
    }

    // Fallback to rule-based recommendations
    for (const txn of transactions) {
      results.push(this.recommendNatureCodeRuleBased(txn));
    }

    return results;
  }

  private recommendNatureCodeRuleBased(txn: {
    description: string;
    amount: number;
    partyName: string;
    partyCountry: string;
  }): NatureCodeRecommendation {
    const desc = txn.description.toLowerCase();

    // Match against known nature code patterns
    for (const [type, mapping] of Object.entries(NATURE_CODE_MAPPING)) {
      if (desc.includes(type.replace(/_/g, " "))) {
        return {
          transactionDescription: txn.description,
          primaryCode: mapping.code,
          primaryDescription: mapping.description,
          justification: `Transaction description matches ${type.replace(/_/g, " ")} pattern`,
          suggestedTPMethod: this.suggestTPMethod(type as TransactionType),
          specialConsiderations: [],
          aiGenerated: false,
        };
      }
    }

    // Default to software services for IT companies
    if (desc.includes("software") || desc.includes("service") || desc.includes("development")) {
      return {
        transactionDescription: txn.description,
        primaryCode: "31",
        primaryDescription: "Receipt for software development services",
        alternativeCode: "33",
        alternativeDescription: "Receipt for technical services",
        justification: "IT/ITeS service transaction - Code 31 for software development",
        suggestedTPMethod: "TNMM with OP/OC as PLI",
        specialConsiderations: ["Verify if Safe Harbour eligible", "Document functional profile"],
        aiGenerated: false,
      };
    }

    // Generic fallback
    return {
      transactionDescription: txn.description,
      primaryCode: "99",
      primaryDescription: "Other transactions",
      justification: "Transaction does not match standard categories - manual review recommended",
      suggestedTPMethod: "TNMM as Most Appropriate Method",
      specialConsiderations: ["Requires manual categorization", "Review transaction documentation"],
      aiGenerated: false,
    };
  }

  // ===========================================================================
  // FINANCIAL ANOMALY DETECTION
  // ===========================================================================

  /**
   * Detect financial anomalies that may indicate TP issues
   */
  async detectFinancialAnomalies(
    statement: FinancialStatement,
    industryBenchmarks?: {
      avgOpMargin: number;
      avgRptPercentage: number;
    }
  ): Promise<FinancialAnomalyResult> {
    const plis = calculatePLIs(statement);
    const benchmarks = industryBenchmarks || { avgOpMargin: 15, avgRptPercentage: 50 };

    // Try AI-enhanced anomaly detection
    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.FINANCIAL_ANOMALY,
          {
            companyName: statement.companyName,
            industry: "IT Services",
            financialYear: statement.financialYear,
            totalRevenue: statement.totalRevenue.toString(),
            exportRevenue: statement.exportRevenue.toString(),
            operatingCost: (statement.costOfGoodsSold + statement.operatingExpenses).toString(),
            operatingProfit: statement.operatingProfit.toString(),
            opOcMargin: plis.op_oc.toFixed(2),
            opOrMargin: plis.op_or.toFixed(2),
            totalRPT: statement.totalRPTValue.toString(),
            rptPercentage: statement.rptAsPercentage.toFixed(2),
            industryBenchmarks: `Average OP Margin: ${benchmarks.avgOpMargin}%, Average RPT: ${benchmarks.avgRptPercentage}%`,
            yoyChanges: "Not available",
            unusualTransactions: "None identified",
          }
        );

        if (response.success && response.parsedContent) {
          return {
            ...(response.parsedContent as unknown as FinancialAnomalyResult),
            aiGenerated: true,
            qualityScore: response.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI anomaly detection failed:", error);
      }
    }

    // Fallback to rule-based anomaly detection
    return this.detectAnomaliesRuleBased(statement, plis, benchmarks);
  }

  private detectAnomaliesRuleBased(
    statement: FinancialStatement,
    plis: Record<string, number>,
    benchmarks: { avgOpMargin: number; avgRptPercentage: number }
  ): FinancialAnomalyResult {
    const anomalies: FinancialAnomalyResult["anomalies"] = [];
    const priorityAreas: string[] = [];
    const documentationGaps: string[] = [];
    const recommendations: string[] = [];

    // Check margin deviation
    const marginDeviation = plis.op_or - benchmarks.avgOpMargin;
    if (Math.abs(marginDeviation) > 10) {
      anomalies.push({
        category: "Margin Deviation",
        description: `Operating margin (${plis.op_or.toFixed(2)}%) deviates significantly from industry average (${benchmarks.avgOpMargin}%)`,
        severity: Math.abs(marginDeviation) > 20 ? "high" : "medium",
        potentialImpact: "May attract transfer pricing scrutiny",
        recommendation: "Document business reasons for margin deviation",
      });
      priorityAreas.push("Operating margin analysis");
    }

    // Check RPT concentration
    if (statement.rptAsPercentage > 80) {
      anomalies.push({
        category: "High RPT Concentration",
        description: `${statement.rptAsPercentage.toFixed(1)}% of revenue from related party transactions`,
        severity: "high",
        potentialImpact: "High audit risk due to concentrated related party dealings",
        recommendation: "Ensure robust transfer pricing documentation",
      });
      priorityAreas.push("Related party transaction documentation");
    }

    // Check for losses with RPT
    if (statement.operatingProfit < 0 && statement.totalRPTValue > 0) {
      anomalies.push({
        category: "Losses with RPT",
        description: "Operating losses while having related party transactions",
        severity: "high",
        potentialImpact: "Potential scrutiny of intercompany pricing",
        recommendation: "Prepare detailed justification for loss-making operations",
      });
      priorityAreas.push("Loss justification");
      documentationGaps.push("Business reason for losses documentation");
    }

    // Check export concentration
    const exportPercentage = (statement.exportRevenue / statement.totalRevenue) * 100;
    if (exportPercentage > 90) {
      anomalies.push({
        category: "Export Concentration",
        description: `${exportPercentage.toFixed(1)}% of revenue from exports`,
        severity: "medium",
        potentialImpact: "Pure export model may require detailed functional analysis",
        recommendation: "Document captive center characterization",
      });
    }

    // Determine overall risk
    const highSeverityCount = anomalies.filter((a) => a.severity === "high").length;
    const riskLevel: "high" | "medium" | "low" =
      highSeverityCount >= 2 ? "high" : highSeverityCount >= 1 ? "medium" : "low";

    const auditLikelihood: "high" | "medium" | "low" =
      riskLevel === "high" || statement.rptAsPercentage > 70 ? "high" : "medium";

    // Generate recommendations
    if (anomalies.length > 0) {
      recommendations.push("Prepare comprehensive transfer pricing documentation");
      recommendations.push("Consider Safe Harbour application if eligible");
      recommendations.push("Conduct benchmarking study for arm's length validation");
    }
    recommendations.push("Maintain contemporaneous documentation");
    recommendations.push("Review intercompany agreements for compliance");

    return {
      anomalies,
      overallRiskAssessment: {
        riskLevel,
        auditLikelihood,
        priorityAreas,
      },
      documentationGaps,
      recommendations,
      aiGenerated: false,
    };
  }

  // ===========================================================================
  // ENHANCED DATA EXTRACTION
  // ===========================================================================

  /**
   * Extract financial data with AI-enhanced analysis
   */
  async extractEnhancedFinancialData(
    system: AccountingSystem,
    companyName: string,
    financialYear: string,
    fromDate: string,
    toDate: string
  ): Promise<EnhancedFinancialStatement> {
    // Extract base financial data
    const statement = await this.extractionEngine.extractFinancialData(
      system,
      companyName,
      financialYear,
      fromDate,
      toDate
    );

    // Detect related parties
    const detectedRelatedParties = await this.detectRelatedParties(statement.accounts);

    // Classify transactions
    const transactions = statement.relatedPartyTransactions.map((t) => ({
      id: t.transactionId,
      description: t.description,
      amount: t.amountINR,
      partyName: t.partyName,
      accountType: undefined,
    }));
    const aiClassifications = await this.classifyTransactions(transactions);

    // Detect anomalies
    const anomalyAnalysis = await this.detectFinancialAnomalies(statement);

    // Prepare Form 3CEB ready data
    const transactionsByNature = this.aggregateByNatureCode(
      statement.relatedPartyTransactions,
      aiClassifications
    );

    return {
      ...statement,
      aiClassifications,
      detectedRelatedParties,
      anomalyAnalysis,
      form3cebReadyData: {
        transactionsByNature,
        aggregateValue: statement.totalRPTValue,
      },
    };
  }

  private aggregateByNatureCode(
    transactions: RelatedPartyTransaction[],
    classifications: TransactionClassificationResult[]
  ): EnhancedFinancialStatement["form3cebReadyData"]["transactionsByNature"] {
    const byNature: Record<
      string,
      { description: string; value: number; partyDetails: string[] }
    > = {};

    for (const txn of transactions) {
      // Find classification for this transaction
      const classification = classifications.find(
        (c) => c.transactionId === txn.transactionId
      );
      const natureCode = classification?.classification.natureCode || txn.natureCode || "99";
      const natureDesc =
        classification?.classification.natureDescription ||
        NATURE_CODE_MAPPING[txn.transactionType]?.description ||
        "Other";

      if (!byNature[natureCode]) {
        byNature[natureCode] = {
          description: natureDesc,
          value: 0,
          partyDetails: [],
        };
      }

      byNature[natureCode].value += txn.amountINR;
      const partyDetail = `${txn.partyName} (${txn.partyCountry})`;
      if (!byNature[natureCode].partyDetails.includes(partyDetail)) {
        byNature[natureCode].partyDetails.push(partyDetail);
      }
    }

    return Object.entries(byNature).map(([code, data]) => ({
      natureCode: code,
      ...data,
    }));
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createAccountingConnectorAIService(): AccountingConnectorAIService {
  return new AccountingConnectorAIService();
}

// Convenience factory for connectors with AI
export function createTallyConnectorWithAI(
  config: Parameters<typeof import("./accounting-connector-engine").createTallyConnector>[0]
): { connector: TallyPrimeConnector; aiService: AccountingConnectorAIService } {
  const connector = new TallyPrimeConnector(config);
  const aiService = new AccountingConnectorAIService();
  aiService.registerConnector(AccountingSystem.TALLY_PRIME, connector);
  return { connector, aiService };
}

export function createZohoConnectorWithAI(
  config: Parameters<typeof import("./accounting-connector-engine").createZohoConnector>[0]
): { connector: ZohoBooksConnector; aiService: AccountingConnectorAIService } {
  const connector = new ZohoBooksConnector(config);
  const aiService = new AccountingConnectorAIService();
  aiService.registerConnector(AccountingSystem.ZOHO_BOOKS, connector);
  return { connector, aiService };
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export {
  AccountingSystem,
  AccountType,
  TransactionType,
  NATURE_CODE_MAPPING,
  RELATED_PARTY_KEYWORDS,
  calculatePLIs,
} from "./accounting-connector-engine";
