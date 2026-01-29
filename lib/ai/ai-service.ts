/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Core AI Service with Multi-Provider Support
 *
 * Supports: Anthropic (Claude), OpenAI (GPT), Google (Gemini)
 * ================================================================================
 */

import {
  AIProvider,
  AIModel,
  AIConfig,
  AIRequest,
  AIResponse,
  PromptType,
  QualityResult,
} from "./types";
import { QualityControlEngine } from "./quality-control";

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: AIConfig = {
  provider: AIProvider.ANTHROPIC,
  model: AIModel.CLAUDE_3_5_SONNET,
  maxTokens: 4096,
  temperature: 0.3, // Lower for more consistent, factual outputs
  timeout: 60000,
};

// =============================================================================
// AI SERVICE CLASS
// =============================================================================

export class AIService {
  private config: AIConfig;
  private qcEngine: QualityControlEngine;

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.qcEngine = new QualityControlEngine();
  }

  /**
   * Generate content using the configured AI provider
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const requestId = request.metadata?.requestId || this.generateRequestId();

    try {
      let content: string;
      let tokensUsed = 0;

      switch (this.config.provider) {
        case AIProvider.ANTHROPIC:
          const anthropicResult = await this.callAnthropic(request);
          content = anthropicResult.content;
          tokensUsed = anthropicResult.tokensUsed;
          break;

        case AIProvider.OPENAI:
          const openaiResult = await this.callOpenAI(request);
          content = openaiResult.content;
          tokensUsed = openaiResult.tokensUsed;
          break;

        case AIProvider.GOOGLE:
          const googleResult = await this.callGoogle(request);
          content = googleResult.content;
          tokensUsed = googleResult.tokensUsed;
          break;

        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }

      const latencyMs = Date.now() - startTime;

      // Run quality control checks
      const qualityScore = await this.qcEngine.evaluate(
        content,
        request.metadata?.promptType || PromptType.TRANSACTION_DESCRIPTION
      );

      // Parse JSON if applicable
      let parsedContent: Record<string, unknown> | undefined;
      if (content.includes("{") && content.includes("}")) {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedContent = JSON.parse(jsonMatch[0]);
          }
        } catch {
          // Not valid JSON, that's fine
        }
      }

      return {
        success: true,
        content,
        parsedContent,
        metadata: {
          provider: this.config.provider,
          model: this.config.model,
          promptType:
            request.metadata?.promptType || PromptType.TRANSACTION_DESCRIPTION,
          promptVersion: request.metadata?.promptVersion || "1.0.0",
          requestId,
          tokensUsed,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        qualityScore,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        content: "",
        metadata: {
          provider: this.config.provider,
          model: this.config.model,
          promptType:
            request.metadata?.promptType || PromptType.TRANSACTION_DESCRIPTION,
          promptVersion: request.metadata?.promptVersion || "1.0.0",
          requestId,
          tokensUsed: 0,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(
    request: AIRequest
  ): Promise<{ content: string; tokensUsed: number }> {
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: request.systemPrompt || this.getDefaultSystemPrompt(),
        messages: [
          {
            role: "user",
            content: request.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || "",
      tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    request: AIRequest
  ): Promise<{ content: string; tokensUsed: number }> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: "system",
            content: request.systemPrompt || this.getDefaultSystemPrompt(),
          },
          {
            role: "user",
            content: request.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || "",
      tokensUsed: data.usage?.total_tokens || 0,
    };
  }

  /**
   * Call Google Gemini API
   */
  private async callGoogle(
    request: AIRequest
  ): Promise<{ content: string; tokensUsed: number }> {
    const apiKey = this.config.apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${request.systemPrompt || this.getDefaultSystemPrompt()}\n\n${request.prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Google AI API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      tokensUsed: data.usageMetadata?.totalTokenCount || 0,
    };
  }

  /**
   * Get default system prompt for Transfer Pricing documentation
   */
  private getDefaultSystemPrompt(): string {
    return `You are an expert Transfer Pricing consultant with deep knowledge of:
- Indian Transfer Pricing regulations (Sections 92-92F of Income Tax Act, 1961)
- Income Tax Rules 10A-10E, 10D (documentation), 10TD-10TG (Safe Harbour)
- OECD Transfer Pricing Guidelines
- BEPS Action Plans relevant to Transfer Pricing

Your outputs must be:
1. FACTUALLY ACCURATE - Only cite real regulations, case laws, and guidelines
2. PROFESSIONALLY WRITTEN - Suitable for regulatory submission
3. WELL-STRUCTURED - Clear sections with proper formatting
4. REGULATORY COMPLIANT - Meet Rule 10D documentation requirements
5. DEFENSIBLE - Withstand scrutiny from Transfer Pricing Officers (TPO)

IMPORTANT GUIDELINES:
- Never invent case law citations or section references
- Always use formal, objective language
- Provide specific regulatory references where applicable
- If uncertain, acknowledge limitations rather than fabricate
- Use Indian regulatory context by default unless specified otherwise`;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let aiServiceInstance: AIService | null = null;

export function getAIService(config?: Partial<AIConfig>): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(config);
  } else if (config) {
    aiServiceInstance.setConfig(config);
  }
  return aiServiceInstance;
}

export function createAIService(config?: Partial<AIConfig>): AIService {
  return new AIService(config);
}
