/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Prompt Store - Unified Interface
 *
 * Centralized access to all versioned prompts
 * ================================================================================
 */

import { PromptTemplate, PromptType, PromptCategory, PromptInput } from "../types";
import { SAFE_HARBOUR_PROMPTS } from "./safe-harbour-prompts";
import { FORM_3CEB_PROMPTS } from "./form-3ceb-prompts";
import { BENCHMARKING_PROMPTS } from "./benchmarking-prompts";
import { MASTER_FILE_PROMPTS } from "./master-file-prompts";
import { DASHBOARD_PROMPTS } from "./dashboard-prompts";
import { ACCOUNTING_PROMPTS } from "./accounting-prompts";
// Tier 3 Imports
import { CBCR_PROMPTS } from "./cbcr-prompts";
import { TP_DISPUTE_PROMPTS } from "./tp-dispute-prompts";
import { ANALYTICS_PROMPTS } from "./analytics-prompts";

// =============================================================================
// PROMPT REGISTRY
// =============================================================================

const PROMPT_REGISTRY: Map<PromptType, PromptTemplate> = new Map([
  // Safe Harbour Prompts
  [PromptType.SAFE_HARBOUR_RECOMMENDATION, SAFE_HARBOUR_PROMPTS.recommendation],
  [PromptType.SAFE_HARBOUR_GAP_ANALYSIS, SAFE_HARBOUR_PROMPTS.gapAnalysis],
  [PromptType.FORM_3CEFA_NARRATIVE, SAFE_HARBOUR_PROMPTS.form3cefaNarrative],

  // Form 3CEB Prompts
  [PromptType.TRANSACTION_DESCRIPTION, FORM_3CEB_PROMPTS.transactionDescription],
  [PromptType.METHOD_JUSTIFICATION, FORM_3CEB_PROMPTS.methodJustification],
  [PromptType.VALIDATION_SUGGESTION, FORM_3CEB_PROMPTS.validationSuggestion],

  // Benchmarking Prompts
  [PromptType.WORKING_CAPITAL_ADJUSTMENT, BENCHMARKING_PROMPTS.workingCapitalAdjustment],
  [PromptType.COMPARABLE_REJECTION, BENCHMARKING_PROMPTS.comparableRejection],
  [PromptType.ARM_LENGTH_CONCLUSION, BENCHMARKING_PROMPTS.armLengthConclusion],

  // Master File Prompts
  [PromptType.ORGANIZATIONAL_STRUCTURE, MASTER_FILE_PROMPTS.organizationalStructure],
  [PromptType.BUSINESS_DESCRIPTION, MASTER_FILE_PROMPTS.businessDescription],
  [PromptType.SUPPLY_CHAIN_NARRATIVE, MASTER_FILE_PROMPTS.supplyChainNarrative],
  [PromptType.INTANGIBLES_STRATEGY, MASTER_FILE_PROMPTS.intangiblesStrategy],
  [PromptType.FINANCIAL_POLICY, MASTER_FILE_PROMPTS.financialPolicy],
  [PromptType.FAR_ANALYSIS, MASTER_FILE_PROMPTS.farAnalysis],

  // Dashboard Prompts
  [PromptType.COMPLIANCE_RISK_SCORE, DASHBOARD_PROMPTS.complianceRiskScore],
  [PromptType.CLIENT_PRIORITY_ANALYSIS, DASHBOARD_PROMPTS.clientPriorityAnalysis],
  [PromptType.SMART_NOTIFICATION, DASHBOARD_PROMPTS.smartNotification],
  [PromptType.DEADLINE_PREDICTION, DASHBOARD_PROMPTS.deadlinePrediction],

  // Accounting Prompts
  [PromptType.TRANSACTION_CLASSIFICATION, ACCOUNTING_PROMPTS.transactionClassification],
  [PromptType.RELATED_PARTY_DETECTION, ACCOUNTING_PROMPTS.relatedPartyDetection],
  [PromptType.NATURE_CODE_RECOMMENDATION, ACCOUNTING_PROMPTS.natureCodeRecommendation],
  [PromptType.FINANCIAL_ANOMALY, ACCOUNTING_PROMPTS.financialAnomaly],

  // Tier 3: CbCR Prompts
  [PromptType.CBCR_JURISDICTION_ALLOCATION, CBCR_PROMPTS.jurisdictionAllocation],
  [PromptType.CBCR_CONSOLIDATION_NARRATIVE, CBCR_PROMPTS.consolidationNarrative],
  [PromptType.CBCR_VALIDATION, CBCR_PROMPTS.validation],
  [PromptType.CBCR_NEXUS_ANALYSIS, CBCR_PROMPTS.nexusAnalysis],

  // Tier 3: TP Dispute Prompts
  [PromptType.TP_DISPUTE_RISK_ASSESSMENT, TP_DISPUTE_PROMPTS.riskAssessment],
  [PromptType.AUDIT_DEFENSE_STRATEGY, TP_DISPUTE_PROMPTS.auditDefenseStrategy],
  [PromptType.APA_ASSISTANCE, TP_DISPUTE_PROMPTS.apaAssistance],
  [PromptType.TPO_RESPONSE_TEMPLATE, TP_DISPUTE_PROMPTS.tpoResponseTemplate],
  [PromptType.LITIGATION_ANALYSIS, TP_DISPUTE_PROMPTS.litigationAnalysis],

  // Tier 3: Analytics Prompts
  [PromptType.REGULATORY_PRECEDENT_MINING, ANALYTICS_PROMPTS.regulatoryPrecedentMining],
  [PromptType.CROSS_BORDER_ANALYSIS, ANALYTICS_PROMPTS.crossBorderAnalysis],
  [PromptType.MULTI_YEAR_TREND_ANALYSIS, ANALYTICS_PROMPTS.multiYearTrendAnalysis],
  [PromptType.RISK_PREDICTION, ANALYTICS_PROMPTS.riskPrediction],
]);

// =============================================================================
// PROMPT STORE CLASS
// =============================================================================

export class PromptStore {
  private prompts: Map<PromptType, PromptTemplate>;
  private versionHistory: Map<string, PromptTemplate[]>;

  constructor() {
    this.prompts = PROMPT_REGISTRY;
    this.versionHistory = new Map();
    this.initializeVersionHistory();
  }

  /**
   * Get a prompt template by type
   */
  getPrompt(type: PromptType): PromptTemplate | undefined {
    return this.prompts.get(type);
  }

  /**
   * Get all prompts for a category
   */
  getPromptsByCategory(category: PromptCategory): PromptTemplate[] {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.category === category
    );
  }

  /**
   * Build a complete prompt from template and variables
   */
  buildPrompt(input: PromptInput): { systemPrompt: string; userPrompt: string } | null {
    const template = this.prompts.get(input.promptType);
    if (!template) {
      return null;
    }

    // Replace variables in user prompt template
    let userPrompt = template.userPromptTemplate;

    // Handle Handlebars-style conditionals {{#if variable}}...{{/if}}
    userPrompt = this.processConditionals(userPrompt, input.variables);

    // Replace simple variables {{variable}}
    for (const [key, value] of Object.entries(input.variables)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      userPrompt = userPrompt.replace(
        placeholder,
        typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)
      );
    }

    // Add context to system prompt if provided
    let systemPrompt = template.systemPrompt;
    if (input.context) {
      systemPrompt += this.buildContextAddendum(input.context);
    }

    return { systemPrompt, userPrompt };
  }

  /**
   * Process conditional blocks in template
   */
  private processConditionals(
    template: string,
    variables: Record<string, unknown>
  ): string {
    // Process {{#if variable}}...{{/if}} blocks
    const conditionalPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return template.replace(conditionalPattern, (match, varName, content) => {
      const value = variables[varName];
      if (value !== undefined && value !== null && value !== "" && value !== false) {
        return content;
      }
      return "";
    });
  }

  /**
   * Build context addendum for system prompt
   */
  private buildContextAddendum(context: PromptInput["context"]): string {
    if (!context) return "";

    const parts: string[] = ["\n\nCONTEXT FOR THIS REQUEST:"];

    if (context.assessmentYear) {
      parts.push(`- Assessment Year: ${context.assessmentYear}`);
    }
    if (context.entityName) {
      parts.push(`- Entity: ${context.entityName}`);
    }
    if (context.entityType) {
      parts.push(`- Entity Type: ${context.entityType}`);
    }
    if (context.transactionType) {
      parts.push(`- Transaction Type: ${context.transactionType}`);
    }
    if (context.financialYear) {
      parts.push(`- Financial Year: ${context.financialYear}`);
    }
    if (context.regulatoryFramework) {
      parts.push(
        `- Regulatory Framework: ${context.regulatoryFramework === "indian" ? "Indian Income Tax Act" : "OECD Guidelines"}`
      );
    }

    return parts.join("\n");
  }

  /**
   * List all available prompts
   */
  listPrompts(): Array<{
    type: PromptType;
    name: string;
    category: PromptCategory;
    version: string;
  }> {
    return Array.from(this.prompts.entries()).map(([type, template]) => ({
      type,
      name: template.name,
      category: template.category,
      version: template.version,
    }));
  }

  /**
   * Get prompt metadata
   */
  getPromptMetadata(type: PromptType): {
    id: string;
    name: string;
    version: string;
    variables: string[];
    qualityChecks: number;
  } | null {
    const template = this.prompts.get(type);
    if (!template) return null;

    return {
      id: template.id,
      name: template.name,
      version: template.version,
      variables: template.variables,
      qualityChecks: template.qualityChecks.length,
    };
  }

  /**
   * Validate that all required variables are provided
   */
  validateVariables(
    type: PromptType,
    variables: Record<string, unknown>
  ): { valid: boolean; missing: string[] } {
    const template = this.prompts.get(type);
    if (!template) {
      return { valid: false, missing: ["Template not found"] };
    }

    // Extract required variables (those used in template without conditionals)
    const requiredVars = template.variables.filter((v) => {
      const inConditional = template.userPromptTemplate.includes(`{{#if ${v}}}`);
      return !inConditional;
    });

    const missing = requiredVars.filter(
      (v) => variables[v] === undefined || variables[v] === null
    );

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Initialize version history for prompts
   */
  private initializeVersionHistory(): void {
    for (const [type, template] of this.prompts.entries()) {
      const key = template.id.replace(/_v\d+$/, "");
      if (!this.versionHistory.has(key)) {
        this.versionHistory.set(key, []);
      }
      this.versionHistory.get(key)?.push(template);
    }
  }

  /**
   * Get version history for a prompt
   */
  getVersionHistory(promptId: string): PromptTemplate[] {
    const key = promptId.replace(/_v\d+$/, "");
    return this.versionHistory.get(key) || [];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let promptStoreInstance: PromptStore | null = null;

export function getPromptStore(): PromptStore {
  if (!promptStoreInstance) {
    promptStoreInstance = new PromptStore();
  }
  return promptStoreInstance;
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export { SAFE_HARBOUR_PROMPTS } from "./safe-harbour-prompts";
export { FORM_3CEB_PROMPTS } from "./form-3ceb-prompts";
export { BENCHMARKING_PROMPTS } from "./benchmarking-prompts";
export { MASTER_FILE_PROMPTS } from "./master-file-prompts";
export { DASHBOARD_PROMPTS } from "./dashboard-prompts";
export { ACCOUNTING_PROMPTS } from "./accounting-prompts";
// Tier 3 Exports
export { CBCR_PROMPTS } from "./cbcr-prompts";
export { TP_DISPUTE_PROMPTS } from "./tp-dispute-prompts";
export { ANALYTICS_PROMPTS } from "./analytics-prompts";
