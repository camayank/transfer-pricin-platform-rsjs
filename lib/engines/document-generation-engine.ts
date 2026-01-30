/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Document Generation & Collaboration Engine
 *
 * Implements template-based document generation, annotation management,
 * secure sharing, and full-text search with entity extraction.
 * ================================================================================
 */

import crypto from "crypto";

// Types
export interface TemplateVariable {
  name: string;
  type: "string" | "number" | "date" | "currency" | "boolean" | "list";
  label: string;
  required: boolean;
  defaultValue?: unknown;
  format?: string;
  options?: string[]; // For enum/select types
}

export interface TemplateInput {
  firmId: string;
  name: string;
  category: DocumentTemplateCategory;
  description?: string;
  templateType: "HTML" | "DOCX" | "PDF";
  content: string;
  variables: TemplateVariable[];
}

export enum DocumentTemplateCategory {
  ENGAGEMENT_LETTER = "ENGAGEMENT_LETTER",
  FORM_3CEB = "FORM_3CEB",
  FORM_3CEFA = "FORM_3CEFA",
  LOCAL_FILE = "LOCAL_FILE",
  MASTER_FILE = "MASTER_FILE",
  BENCHMARKING_REPORT = "BENCHMARKING_REPORT",
  INVOICE = "INVOICE",
  PROPOSAL = "PROPOSAL",
  CERTIFICATE = "CERTIFICATE",
  CUSTOM = "CUSTOM",
}

export interface GenerationJobInput {
  templateId: string;
  firmId: string;
  entityType: string;
  entityId: string;
  variablesData: Record<string, unknown>;
  outputFormat?: "PDF" | "DOCX" | "HTML";
}

export interface GenerationResult {
  success: boolean;
  outputPath?: string;
  errorMessage?: string;
  processingTime?: number;
}

export interface AnnotationInput {
  documentId: string;
  userId: string;
  annotationType: AnnotationType;
  content?: string;
  position: AnnotationPosition;
  color?: string;
  parentId?: string;
}

export enum AnnotationType {
  HIGHLIGHT = "HIGHLIGHT",
  COMMENT = "COMMENT",
  STAMP = "STAMP",
  DRAWING = "DRAWING",
  STICKY_NOTE = "STICKY_NOTE",
  TEXT_BOX = "TEXT_BOX",
}

export interface AnnotationPosition {
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ShareInput {
  documentId: string;
  shareType: "LINK" | "EMAIL" | "USER";
  sharedWith?: string;
  accessLevel: "VIEW" | "COMMENT" | "EDIT";
  password?: string;
  expiresAt?: Date;
  maxAccesses?: number;
  createdById: string;
}

export interface ShareResult {
  shareToken: string;
  shareUrl: string;
  expiresAt?: Date;
}

export interface SearchResult {
  documentId: string;
  title: string;
  snippet: string;
  score: number;
  matchedEntities?: ExtractedEntity[];
  highlights?: string[];
}

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  position?: { start: number; end: number };
}

export enum EntityType {
  PAN = "PAN",
  TAN = "TAN",
  CIN = "CIN",
  GSTIN = "GSTIN",
  DATE = "DATE",
  AMOUNT = "AMOUNT",
  PERCENTAGE = "PERCENTAGE",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  ADDRESS = "ADDRESS",
  PERSON_NAME = "PERSON_NAME",
  COMPANY_NAME = "COMPANY_NAME",
}

export interface RetentionPolicy {
  firmId: string;
  name: string;
  description?: string;
  documentTypes: string[];
  retentionDays: number;
  action: "DELETE" | "ARCHIVE";
  archivePath?: string;
}

// =============================================================================
// TEMPLATE SERVICE
// =============================================================================

export class TemplateService {
  /**
   * Validate template content and variables
   */
  validateTemplate(
    content: string,
    variables: TemplateVariable[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for undefined variables in content
    const usedVariables = this.extractUsedVariables(content);
    const definedVariableNames = variables.map((v) => v.name);

    const undefinedVars = usedVariables.filter(
      (v) => !definedVariableNames.includes(v)
    );
    if (undefinedVars.length > 0) {
      errors.push(`Undefined variables used: ${undefinedVars.join(", ")}`);
    }

    // Check for unused defined variables
    const unusedVars = definedVariableNames.filter(
      (v) => !usedVariables.includes(v)
    );
    if (unusedVars.length > 0) {
      // This is a warning, not an error
      console.warn(`Unused variables defined: ${unusedVars.join(", ")}`);
    }

    // Validate variable definitions
    for (const variable of variables) {
      if (!variable.name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
        errors.push(
          `Invalid variable name: ${variable.name}. Use alphanumeric characters and underscores only.`
        );
      }
      if (variable.required && variable.defaultValue === undefined) {
        // Required variables should ideally have no default, or warning
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private extractUsedVariables(content: string): string[] {
    const pattern = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const varName = match[1].trim().split("|")[0].split(".")[0].trim();
      if (!matches.includes(varName)) {
        matches.push(varName);
      }
    }
    return matches;
  }

  /**
   * Render template with provided data
   */
  renderTemplate(
    content: string,
    variables: TemplateVariable[],
    data: Record<string, unknown>
  ): string {
    let rendered = content;

    for (const variable of variables) {
      const value = data[variable.name] ?? variable.defaultValue ?? "";
      const formattedValue = this.formatValue(value, variable);
      const pattern = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, "g");
      rendered = rendered.replace(pattern, formattedValue);
    }

    // Handle conditional blocks
    rendered = this.processConditionals(rendered, data);

    // Handle loops
    rendered = this.processLoops(rendered, data);

    return rendered;
  }

  private formatValue(value: unknown, variable: TemplateVariable): string {
    if (value === null || value === undefined) return "";

    switch (variable.type) {
      case "currency":
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value as number);

      case "date":
        const date = new Date(value as string);
        if (variable.format === "long") {
          return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
        return date.toLocaleDateString("en-IN");

      case "number":
        return new Intl.NumberFormat("en-IN").format(value as number);

      case "boolean":
        return value ? "Yes" : "No";

      case "list":
        return Array.isArray(value) ? value.join(", ") : String(value);

      default:
        return String(value);
    }
  }

  private processConditionals(
    content: string,
    data: Record<string, unknown>
  ): string {
    // Simple {{#if condition}}...{{/if}} processing
    const ifPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    return content.replace(ifPattern, (_, varName, innerContent) => {
      return data[varName] ? innerContent : "";
    });
  }

  private processLoops(
    content: string,
    data: Record<string, unknown>
  ): string {
    // Simple {{#each items}}...{{/each}} processing
    const eachPattern = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    return content.replace(eachPattern, (_, varName, template) => {
      const items = data[varName];
      if (!Array.isArray(items)) return "";
      return items
        .map((item, index) => {
          let itemContent = template;
          // Replace {{this}} with item value
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
          // Replace {{@index}} with index
          itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
          // Replace {{item.property}} patterns
          if (typeof item === "object") {
            for (const [key, val] of Object.entries(item as object)) {
              itemContent = itemContent.replace(
                new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"),
                String(val)
              );
            }
          }
          return itemContent;
        })
        .join("");
    });
  }
}

// =============================================================================
// DOCUMENT GENERATION SERVICE
// =============================================================================

export class DocumentGenerationService {
  /**
   * Validate generation job input
   */
  validateJobInput(input: GenerationJobInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.templateId) errors.push("Template ID is required");
    if (!input.firmId) errors.push("Firm ID is required");
    if (!input.entityType) errors.push("Entity type is required");
    if (!input.entityId) errors.push("Entity ID is required");

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate output file path
   */
  generateOutputPath(
    firmId: string,
    entityType: string,
    entityId: string,
    format: string
  ): string {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const extension = format.toLowerCase();
    return `documents/${firmId}/${entityType}/${entityId}/${timestamp}-${randomSuffix}.${extension}`;
  }

  /**
   * Get MIME type for output format
   */
  getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      PDF: "application/pdf",
      DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      HTML: "text/html",
    };
    return mimeTypes[format] || "application/octet-stream";
  }
}

// =============================================================================
// ANNOTATION SERVICE
// =============================================================================

export class AnnotationService {
  /**
   * Validate annotation input
   */
  validateAnnotation(input: AnnotationInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.documentId) errors.push("Document ID is required");
    if (!input.userId) errors.push("User ID is required");
    if (input.position.page < 1) errors.push("Page number must be at least 1");
    if (input.position.x < 0 || input.position.y < 0) {
      errors.push("Position coordinates must be non-negative");
    }

    if (input.annotationType === AnnotationType.COMMENT && !input.content) {
      errors.push("Comment content is required");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate default color for annotation type
   */
  getDefaultColor(type: AnnotationType): string {
    const colors: Record<AnnotationType, string> = {
      [AnnotationType.HIGHLIGHT]: "#FFEB3B",
      [AnnotationType.COMMENT]: "#2196F3",
      [AnnotationType.STAMP]: "#4CAF50",
      [AnnotationType.DRAWING]: "#F44336",
      [AnnotationType.STICKY_NOTE]: "#FFC107",
      [AnnotationType.TEXT_BOX]: "#9C27B0",
    };
    return colors[type] || "#2196F3";
  }

  /**
   * Build annotation thread from parent-child relationships
   */
  buildAnnotationThread(
    annotations: Array<{ id: string; parentId?: string; content?: string; createdAt: Date }>
  ): Array<{ id: string; content?: string; createdAt: Date; replies: unknown[] }> {
    const rootAnnotations = annotations.filter((a) => !a.parentId);
    const childMap = new Map<string, typeof annotations>();

    annotations.forEach((a) => {
      if (a.parentId) {
        if (!childMap.has(a.parentId)) {
          childMap.set(a.parentId, []);
        }
        childMap.get(a.parentId)!.push(a);
      }
    });

    return rootAnnotations.map((root) => ({
      ...root,
      replies: this.getNestedReplies(root.id, childMap),
    }));
  }

  private getNestedReplies(
    parentId: string,
    childMap: Map<string, Array<{ id: string; parentId?: string; content?: string; createdAt: Date }>>
  ): unknown[] {
    const children = childMap.get(parentId) || [];
    return children.map((child) => ({
      ...child,
      replies: this.getNestedReplies(child.id, childMap),
    }));
  }
}

// =============================================================================
// SHARE SERVICE
// =============================================================================

export class ShareService {
  /**
   * Generate secure share token
   */
  generateShareToken(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  /**
   * Hash password for share protection
   */
  hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  /**
   * Verify share password
   */
  verifyPassword(password: string, hash: string): boolean {
    const inputHash = this.hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash));
  }

  /**
   * Generate share URL
   */
  generateShareUrl(baseUrl: string, token: string): string {
    return `${baseUrl}/shared/${token}`;
  }

  /**
   * Check if share is valid
   */
  isShareValid(share: {
    isRevoked: boolean;
    expiresAt?: Date | null;
    maxAccesses?: number | null;
    accessCount: number;
  }): { valid: boolean; reason?: string } {
    if (share.isRevoked) {
      return { valid: false, reason: "Share has been revoked" };
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return { valid: false, reason: "Share has expired" };
    }

    if (share.maxAccesses && share.accessCount >= share.maxAccesses) {
      return { valid: false, reason: "Maximum access limit reached" };
    }

    return { valid: true };
  }
}

// =============================================================================
// SEARCH SERVICE
// =============================================================================

export class DocumentSearchService {
  private entityPatterns: Record<EntityType, RegExp> = {
    [EntityType.PAN]: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
    [EntityType.TAN]: /[A-Z]{4}[0-9]{5}[A-Z]{1}/g,
    [EntityType.CIN]: /[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}/g,
    [EntityType.GSTIN]: /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}/g,
    [EntityType.DATE]: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
    [EntityType.AMOUNT]: /(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{2})?|\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?\s*(?:Cr|Lakh|L|crore|lakhs?)/gi,
    [EntityType.PERCENTAGE]: /\d+(?:\.\d+)?%/g,
    [EntityType.EMAIL]: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    [EntityType.PHONE]: /(?:\+91[\-\s]?)?[0-9]{10}|(?:\+91[\-\s]?)?[0-9]{5}[\-\s][0-9]{5}/g,
    [EntityType.ADDRESS]: /(?:Pin|Pincode)[\s:]*\d{6}/gi,
    [EntityType.PERSON_NAME]: /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g,
    [EntityType.COMPANY_NAME]: /(?:Ltd\.|Limited|Pvt\.|Private|LLP|Inc\.|Corp\.)/gi,
  };

  /**
   * Extract entities from text
   */
  extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    for (const [type, pattern] of Object.entries(this.entityPatterns)) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        entities.push({
          type: type as EntityType,
          value: match[0],
          confidence: this.calculateConfidence(type as EntityType, match[0]),
          position: {
            start: match.index!,
            end: match.index! + match[0].length,
          },
        });
      }
    }

    // Remove duplicates
    return this.deduplicateEntities(entities);
  }

  private calculateConfidence(type: EntityType, value: string): number {
    // Higher confidence for well-structured patterns
    const highConfidenceTypes: EntityType[] = [
      EntityType.PAN,
      EntityType.TAN,
      EntityType.CIN,
      EntityType.GSTIN,
      EntityType.EMAIL,
    ];

    if (highConfidenceTypes.includes(type)) {
      return 0.95;
    }

    // Medium confidence for dates and amounts
    if ([EntityType.DATE, EntityType.AMOUNT, EntityType.PERCENTAGE].includes(type)) {
      return 0.85;
    }

    // Lower confidence for names and addresses
    return 0.70;
  }

  private deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
    const seen = new Set<string>();
    return entities.filter((e) => {
      const key = `${e.type}:${e.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text: string, maxKeywords: number = 20): string[] {
    // Simple keyword extraction - remove common words
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
      "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
      "should", "may", "might", "must", "shall", "this", "that", "these", "those",
      "it", "its", "they", "them", "their", "we", "our", "you", "your",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    // Count word frequency
    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }

    // Sort by frequency and return top keywords
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Generate search snippet with highlights
   */
  generateSnippet(text: string, query: string, maxLength: number = 200): string {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const lowerText = text.toLowerCase();

    // Find first occurrence of any query term
    let bestIndex = -1;
    for (const term of queryTerms) {
      const index = lowerText.indexOf(term);
      if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
        bestIndex = index;
      }
    }

    if (bestIndex === -1) {
      // No match found, return beginning of text
      return text.substring(0, maxLength) + (text.length > maxLength ? "..." : "");
    }

    // Calculate snippet range centered on match
    const start = Math.max(0, bestIndex - 50);
    const end = Math.min(text.length, start + maxLength);

    let snippet = text.substring(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < text.length) snippet = snippet + "...";

    return snippet;
  }
}

// =============================================================================
// RETENTION POLICY SERVICE
// =============================================================================

export class RetentionPolicyService {
  /**
   * Check if document is eligible for retention action
   */
  isEligibleForAction(
    documentCreatedAt: Date,
    retentionDays: number
  ): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    return new Date(documentCreatedAt) < cutoffDate;
  }

  /**
   * Get documents eligible for retention action
   */
  getRetentionSummary(
    documents: Array<{ id: string; type: string; createdAt: Date }>,
    policy: RetentionPolicy
  ): {
    eligibleCount: number;
    eligibleDocuments: string[];
    action: string;
  } {
    const eligible = documents.filter(
      (doc) =>
        policy.documentTypes.includes(doc.type) &&
        this.isEligibleForAction(doc.createdAt, policy.retentionDays)
    );

    return {
      eligibleCount: eligible.length,
      eligibleDocuments: eligible.map((d) => d.id),
      action: policy.action,
    };
  }
}

// Export instances for convenience
export const templateService = new TemplateService();
export const documentGenerationService = new DocumentGenerationService();
export const annotationService = new AnnotationService();
export const shareService = new ShareService();
export const documentSearchService = new DocumentSearchService();
export const retentionPolicyService = new RetentionPolicyService();
