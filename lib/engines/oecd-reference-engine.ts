/**
 * OECD Guidelines Reference Engine
 * Provides search, retrieval, and contextual analysis for OECD TP Guidelines
 */

import {
  OECDGuideline,
  OECDChapter,
  GuidelineSearchResult,
  OECD_GUIDELINES,
  OECD_CHAPTERS,
  OECD_GUIDELINES_VERSION,
  getGuidelinesByChapter,
  getGuideline,
  getChapterInfo,
  getGuidelinesByKeyword,
  getGuidelinesByKeywords,
  getRelatedGuidelines,
  getGuidelinesForMethod,
  getGuidelinesForTransactionType,
  getAllChapterTitles
} from "../constants/oecd-guidelines";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface OECDSearchQuery {
  text?: string;
  keywords?: string[];
  chapter?: number;
  method?: "CUP" | "RPM" | "CPM" | "TNMM" | "PSM";
  transactionType?: "goods" | "services" | "intangibles" | "financial" | "restructuring";
  limit?: number;
  minScore?: number;
}

export interface OECDSearchResults {
  query: OECDSearchQuery;
  results: GuidelineSearchResult[];
  totalMatches: number;
  searchTime: number;
  suggestions?: string[];
}

export interface GuidelineContext {
  guideline: OECDGuideline;
  chapter: OECDChapter | undefined;
  relatedGuidelines: OECDGuideline[];
  methodRelevance?: string[];
  practicalImplications: string[];
}

export interface TPMethodGuidance {
  method: string;
  methodFullName: string;
  primaryGuidelines: OECDGuideline[];
  strengthsWeaknesses: string;
  bestUseCases: string[];
  comparabilityFactors: string[];
}

// =============================================================================
// SEARCH UTILITIES
// =============================================================================

/**
 * Calculate relevance score based on keyword matches and content similarity
 */
function calculateRelevanceScore(
  guideline: OECDGuideline,
  query: OECDSearchQuery
): { score: number; matchedKeywords: string[] } {
  let score = 0;
  const matchedKeywords: string[] = [];

  // Keyword matching (highest weight)
  if (query.keywords && query.keywords.length > 0) {
    const queryKeywordsLower = query.keywords.map(k => k.toLowerCase());
    for (const keyword of guideline.keywords) {
      const keywordLower = keyword.toLowerCase();
      for (const qk of queryKeywordsLower) {
        if (keywordLower.includes(qk) || qk.includes(keywordLower)) {
          score += 30;
          matchedKeywords.push(keyword);
          break;
        }
      }
    }
  }

  // Text search in title and content
  if (query.text) {
    const searchTerms = query.text.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const titleLower = guideline.title.toLowerCase();
    const contentLower = guideline.content.toLowerCase();

    for (const term of searchTerms) {
      // Title match (high weight)
      if (titleLower.includes(term)) {
        score += 25;
        if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
      }
      // Content match (medium weight)
      if (contentLower.includes(term)) {
        score += 15;
        if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
      }
      // Keyword exact match
      if (guideline.keywords.some(k => k.toLowerCase() === term)) {
        score += 35;
        if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
      }
    }
  }

  // Chapter match bonus
  if (query.chapter !== undefined && guideline.chapter === query.chapter) {
    score += 20;
  }

  // Normalize score to 0-100 range
  score = Math.min(100, score);

  return { score, matchedKeywords };
}

/**
 * Tokenize and normalize text for search
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Generate search suggestions based on partial matches
 */
function generateSuggestions(query: string): string[] {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();

  // Collect all unique keywords from guidelines
  const allKeywords = new Set<string>();
  for (const guideline of OECD_GUIDELINES) {
    for (const keyword of guideline.keywords) {
      if (keyword.toLowerCase().includes(queryLower) && keyword.toLowerCase() !== queryLower) {
        allKeywords.add(keyword);
      }
    }
  }

  return Array.from(allKeywords).slice(0, 5);
}

// =============================================================================
// MAIN ENGINE CLASS
// =============================================================================

export class OECDReferenceEngine {
  private guidelines: OECDGuideline[];
  private chapters: OECDChapter[];

  constructor() {
    this.guidelines = OECD_GUIDELINES;
    this.chapters = OECD_CHAPTERS;
  }

  /**
   * Search guidelines based on query parameters
   */
  search(query: OECDSearchQuery): OECDSearchResults {
    const startTime = Date.now();
    const results: GuidelineSearchResult[] = [];

    let candidateGuidelines = [...this.guidelines];

    // Filter by chapter if specified
    if (query.chapter !== undefined) {
      candidateGuidelines = candidateGuidelines.filter(g => g.chapter === query.chapter);
    }

    // Filter by method if specified
    if (query.method) {
      const methodGuidelines = getGuidelinesForMethod(query.method);
      const methodParagraphs = new Set(methodGuidelines.map(g => g.paragraph));
      candidateGuidelines = candidateGuidelines.filter(g => methodParagraphs.has(g.paragraph));
    }

    // Filter by transaction type if specified
    if (query.transactionType) {
      const typeGuidelines = getGuidelinesForTransactionType(query.transactionType);
      const typeParagraphs = new Set(typeGuidelines.map(g => g.paragraph));
      candidateGuidelines = candidateGuidelines.filter(g => typeParagraphs.has(g.paragraph));
    }

    // Calculate relevance scores
    for (const guideline of candidateGuidelines) {
      const { score, matchedKeywords } = calculateRelevanceScore(guideline, query);

      const minScore = query.minScore ?? 10;
      if (score >= minScore) {
        results.push({
          guideline,
          relevanceScore: score,
          matchedKeywords
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply limit
    const limit = query.limit ?? 20;
    const limitedResults = results.slice(0, limit);

    // Generate suggestions if few results
    let suggestions: string[] | undefined;
    if (results.length < 3 && query.text) {
      suggestions = generateSuggestions(query.text);
    }

    return {
      query,
      results: limitedResults,
      totalMatches: results.length,
      searchTime: Date.now() - startTime,
      suggestions
    };
  }

  /**
   * Get full context for a specific guideline
   */
  getGuidelineContext(chapter: number, paragraph: string): GuidelineContext | null {
    const guideline = getGuideline(chapter, paragraph);
    if (!guideline) return null;

    const chapterInfo = getChapterInfo(chapter);
    const relatedGuidelines = getRelatedGuidelines(chapter, paragraph);

    // Determine method relevance
    const methodRelevance: string[] = [];
    const methods: Array<"CUP" | "RPM" | "CPM" | "TNMM" | "PSM"> = ["CUP", "RPM", "CPM", "TNMM", "PSM"];
    for (const method of methods) {
      const methodGuidelines = getGuidelinesForMethod(method);
      if (methodGuidelines.some(g => g.paragraph === paragraph)) {
        methodRelevance.push(method);
      }
    }

    // Generate practical implications
    const practicalImplications = this.derivePracticalImplications(guideline);

    return {
      guideline,
      chapter: chapterInfo,
      relatedGuidelines,
      methodRelevance: methodRelevance.length > 0 ? methodRelevance : undefined,
      practicalImplications
    };
  }

  /**
   * Get guidance for a specific TP method
   */
  getMethodGuidance(method: "CUP" | "RPM" | "CPM" | "TNMM" | "PSM"): TPMethodGuidance {
    const methodInfo: Record<string, { fullName: string; strengths: string; useCases: string[]; factors: string[] }> = {
      CUP: {
        fullName: "Comparable Uncontrolled Price Method",
        strengths: "Most direct and reliable when comparable transactions exist. Provides price-based comparison. Less affected by functional differences if product is identical.",
        useCases: [
          "Commodity transactions with market prices",
          "Licensed intangibles with comparable licenses",
          "Financial transactions with market rates",
          "When internal CUPs are available"
        ],
        factors: [
          "Product characteristics",
          "Contractual terms",
          "Economic circumstances",
          "Market conditions",
          "Volume and timing"
        ]
      },
      RPM: {
        fullName: "Resale Price Method",
        strengths: "Appropriate for distribution activities. Less sensitive to product differences than CUP. Focuses on gross margin which reflects distribution functions.",
        useCases: [
          "Distribution of finished goods",
          "Marketing and sales activities",
          "Limited value-added distribution",
          "When reseller performs limited functions"
        ],
        factors: [
          "Functions performed",
          "Assets employed",
          "Risks assumed",
          "Contractual terms",
          "Level of market"
        ]
      },
      CPM: {
        fullName: "Cost Plus Method",
        strengths: "Appropriate for manufacturing and service provision. Focuses on costs and mark-up. Useful when cost base is reliable.",
        useCases: [
          "Contract manufacturing",
          "Contract R&D services",
          "Processing activities",
          "Low-risk manufacturing"
        ],
        factors: [
          "Functions performed",
          "Cost base composition",
          "Risks assumed",
          "Assets employed",
          "Industry practices"
        ]
      },
      TNMM: {
        fullName: "Transactional Net Margin Method",
        strengths: "Most commonly used method globally. Less sensitive to transactional differences. Focuses on net profit indicators. Wide availability of comparables.",
        useCases: [
          "Distribution activities",
          "Manufacturing activities",
          "Service provision",
          "When gross margin data unavailable",
          "Complex functional profiles"
        ],
        factors: [
          "Selection of tested party",
          "PLI selection (OP/OC, OP/OR, Berry)",
          "Comparability adjustments",
          "Working capital adjustment",
          "Capacity utilization"
        ]
      },
      PSM: {
        fullName: "Profit Split Method",
        strengths: "Appropriate for highly integrated operations. Addresses unique contributions from both parties. Reflects actual value creation.",
        useCases: [
          "Unique and valuable intangibles",
          "Highly integrated operations",
          "Both parties make significant contributions",
          "Global trading operations",
          "Joint development arrangements"
        ],
        factors: [
          "Relative contributions",
          "Unique intangibles",
          "Integration of operations",
          "Risk allocation",
          "Capital employed"
        ]
      }
    };

    const info = methodInfo[method];
    const primaryGuidelines = getGuidelinesForMethod(method);

    return {
      method,
      methodFullName: info.fullName,
      primaryGuidelines,
      strengthsWeaknesses: info.strengths,
      bestUseCases: info.useCases,
      comparabilityFactors: info.factors
    };
  }

  /**
   * Get all guidelines for a chapter
   */
  getChapterGuidelines(chapter: number): { chapter: OECDChapter | undefined; guidelines: OECDGuideline[] } {
    return {
      chapter: getChapterInfo(chapter),
      guidelines: getGuidelinesByChapter(chapter)
    };
  }

  /**
   * Get summary of all chapters
   */
  getChapterSummary(): OECDChapter[] {
    return this.chapters;
  }

  /**
   * Get guidelines by keyword search
   */
  searchByKeyword(keyword: string): OECDGuideline[] {
    return getGuidelinesByKeyword(keyword);
  }

  /**
   * Get version information
   */
  getVersionInfo() {
    return OECD_GUIDELINES_VERSION;
  }

  /**
   * Derive practical implications from a guideline
   */
  private derivePracticalImplications(guideline: OECDGuideline): string[] {
    const implications: string[] = [];

    // Based on keywords, derive practical implications
    const keywordImplications: Record<string, string> = {
      "arm's length": "Ensure all related party transactions are priced as if between independent parties",
      "FAR analysis": "Document functions performed, assets used, and risks assumed by each party",
      "comparability": "Identify and document comparable transactions or companies",
      "documentation": "Maintain contemporaneous transfer pricing documentation",
      "risk": "Document risk allocation and ensure party assuming risk has control and capacity",
      "intangible": "Identify and value all intangibles involved in the transaction",
      "DEMPE": "Analyze development, enhancement, maintenance, protection and exploitation functions",
      "benefit test": "Document the benefit received by each service recipient",
      "CCA": "Ensure contributions align with expected benefits for all participants",
      "restructuring": "Analyze arm's length compensation for any transfer of functions, assets, or risks",
      "guarantee": "Distinguish explicit guarantees from implicit support",
      "cash pooling": "Ensure arm's length compensation for cash pool participants",
      "safe harbour": "Consider if transaction qualifies for simplified safe harbour treatment",
      "APA": "Consider advance pricing arrangement for recurring material transactions"
    };

    for (const keyword of guideline.keywords) {
      const keywordLower = keyword.toLowerCase();
      for (const [key, implication] of Object.entries(keywordImplications)) {
        if (keywordLower.includes(key)) {
          if (!implications.includes(implication)) {
            implications.push(implication);
          }
        }
      }
    }

    // Add chapter-specific implications
    const chapterImplications: Record<number, string[]> = {
      1: ["Apply the arm's length principle consistently across all transactions"],
      2: ["Select the most appropriate method based on transaction characteristics"],
      3: ["Perform thorough comparability analysis with documented search strategy"],
      4: ["Consider administrative approaches to minimize dispute risk"],
      5: ["Maintain three-tiered documentation: Master File, Local File, CbCR"],
      6: ["Properly identify and compensate DEMPE functions for intangibles"],
      7: ["Apply benefit test and document service charges appropriately"],
      8: ["Ensure CCA contributions align with anticipated benefits"],
      9: ["Document arm's length compensation for business restructurings"],
      10: ["Price financial transactions considering all economically relevant characteristics"]
    };

    const chapterSpecific = chapterImplications[guideline.chapter];
    if (chapterSpecific) {
      for (const imp of chapterSpecific) {
        if (!implications.includes(imp)) {
          implications.push(imp);
        }
      }
    }

    return implications.slice(0, 5); // Return top 5 implications
  }

  /**
   * Find guidelines relevant to a specific scenario
   */
  findRelevantGuidelines(scenario: {
    transactionType: string;
    functions?: string[];
    intangiblesInvolved?: boolean;
    crossBorderServices?: boolean;
    financialTransaction?: boolean;
  }): OECDGuideline[] {
    const keywords: string[] = [];

    // Build keyword list based on scenario
    if (scenario.transactionType) {
      keywords.push(scenario.transactionType);
    }

    if (scenario.functions) {
      keywords.push(...scenario.functions);
    }

    if (scenario.intangiblesInvolved) {
      keywords.push("intangible", "DEMPE", "license");
    }

    if (scenario.crossBorderServices) {
      keywords.push("services", "benefit test", "LVAS");
    }

    if (scenario.financialTransaction) {
      keywords.push("loan", "interest rate", "guarantee", "financial");
    }

    // Add FAR analysis as it's always relevant
    keywords.push("functions", "assets", "risks");

    return getGuidelinesByKeywords(keywords);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createOECDReferenceEngine = (): OECDReferenceEngine => {
  return new OECDReferenceEngine();
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  OECDGuideline,
  OECDChapter,
  GuidelineSearchResult
};

export {
  OECD_GUIDELINES,
  OECD_CHAPTERS,
  OECD_GUIDELINES_VERSION,
  getAllChapterTitles,
  getGuidelinesForMethod,
  getGuidelinesForTransactionType
};
