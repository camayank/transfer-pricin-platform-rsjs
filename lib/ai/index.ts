/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Main Entry Point
 *
 * This module provides AI-powered content generation for Transfer Pricing
 * documentation. It supports multiple AI providers (Anthropic, OpenAI, Google)
 * and includes built-in quality control for regulatory compliance.
 *
 * Usage:
 *   import { getTPDocumentGenerator, AIProvider, AIModel } from '@/lib/ai';
 *
 *   const generator = getTPDocumentGenerator({
 *     provider: AIProvider.ANTHROPIC,
 *     model: AIModel.CLAUDE_3_5_SONNET
 *   });
 *
 *   const result = await generator.generateSafeHarbourRecommendation({...});
 *
 * ================================================================================
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export {
  // Enums
  AIProvider,
  AIModel,
  PromptCategory,
  PromptType,
  QualityCheckType,

  // Config & Request/Response Types
  type AIConfig,
  type AIRequest,
  type AIResponse,
  type AIContext,
  type PromptTemplate,
  type PromptInput,

  // Quality Control Types
  type QualityCheck,
  type QualityCheckResult,
  type QualityResult,

  // Audit Types
  type AIAuditLog,

  // Output Types - Tier 1
  type SafeHarbourRecommendation,
  type MethodJustification,
  type TransactionNarrative,
  type WorkingCapitalAdjustment,
  type ComparableRejection,
  type ArmLengthConclusion,

  // Output Types - Tier 3: CbCR
  type CbCRJurisdictionAllocation,
  type CbCRConsolidationNarrative,
  type CbCRValidation,
  type CbCRNexusAnalysis,

  // Output Types - Tier 3: TP Dispute
  type TPDisputeRiskAssessment,
  type AuditDefenseStrategy,
  type APAAssistance,
  type TPOResponseTemplate,
  type LitigationAnalysis,

  // Output Types - Tier 3: Analytics
  type RegulatoryPrecedentMining,
  type CrossBorderAnalysis,
  type MultiYearTrendAnalysis,
  type RiskPrediction,
} from "./types";

// =============================================================================
// SERVICE EXPORTS
// =============================================================================

export {
  AIService,
  getAIService,
  createAIService,
} from "./ai-service";

export {
  QualityControlEngine,
} from "./quality-control";

// =============================================================================
// PROMPT STORE EXPORTS
// =============================================================================

export {
  PromptStore,
  getPromptStore,
  SAFE_HARBOUR_PROMPTS,
  FORM_3CEB_PROMPTS,
  BENCHMARKING_PROMPTS,
  MASTER_FILE_PROMPTS,
  DASHBOARD_PROMPTS,
  ACCOUNTING_PROMPTS,
  CBCR_PROMPTS,
  TP_DISPUTE_PROMPTS,
  ANALYTICS_PROMPTS,
} from "./prompts";

// =============================================================================
// DOCUMENT GENERATOR EXPORTS
// =============================================================================

export {
  TPDocumentGenerator,
  getTPDocumentGenerator,
  createTPDocumentGenerator,
} from "./tp-document-generator";

// =============================================================================
// VERSION INFO
// =============================================================================

export const AI_SERVICE_VERSION = {
  version: "1.0.0",
  releaseDate: "2025-01-29",
  supportedProviders: ["anthropic", "openai", "google"],
  promptLibraryVersion: "1.0.0",
  qualityControlVersion: "1.0.0",
};

// =============================================================================
// QUICK START HELPERS
// =============================================================================

/**
 * Quick helper to check if AI service is properly configured
 */
export function isAIConfigured(): boolean {
  return !!(
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY
  );
}

/**
 * Get the default AI provider based on available API keys
 */
export function getDefaultProvider(): string | null {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GOOGLE_AI_API_KEY) return "google";
  return null;
}

/**
 * Get list of configured providers
 */
export function getConfiguredProviders(): string[] {
  const providers: string[] = [];
  if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (process.env.GOOGLE_AI_API_KEY) providers.push("google");
  return providers;
}
