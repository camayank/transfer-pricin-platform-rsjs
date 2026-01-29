/**
 * Transfer Pricing Case Law Engine
 * Search, retrieval, and analysis for Indian TP case precedents
 */

import {
  TPCaseLaw,
  CourtType,
  RulingOutcome,
  TPMethod,
  CaseLawSearchResult,
  TP_CASE_LAW,
  TP_CASE_LAW_VERSION,
  getCaseById,
  getCasesByCourt,
  getCasesByOutcome,
  getCasesByMethod,
  getCasesByNatureCode,
  getCasesByKeyword,
  getLandmarkCases,
  getCasesByAssessmentYear,
  getCasesByBench,
  getCaseStatistics,
  getAllCases
} from "../constants/tp-case-law";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CaseLawSearchQuery {
  text?: string;
  keywords?: string[];
  court?: CourtType;
  outcome?: RulingOutcome;
  method?: TPMethod;
  natureCode?: string;
  assessmentYear?: string;
  bench?: string;
  onlyLandmark?: boolean;
  limit?: number;
  minScore?: number;
}

export interface CaseLawSearchResults {
  query: CaseLawSearchQuery;
  results: CaseLawSearchResult[];
  totalMatches: number;
  searchTime: number;
  statistics?: {
    taxpayerFavorable: number;
    revenueFavorable: number;
    mixed: number;
  };
}

export interface CaseContext {
  case: TPCaseLaw;
  relatedCases: TPCaseLaw[];
  precedentChain: TPCaseLaw[];
  practicalImplications: string[];
  defenseTips: string[];
}

export interface IssueAnalysis {
  issue: string;
  relevantCases: TPCaseLaw[];
  taxpayerPosition: string;
  revenuePosition: string;
  recommendation: string;
}

// =============================================================================
// SEARCH UTILITIES
// =============================================================================

/**
 * Calculate relevance score for a case
 */
function calculateRelevanceScore(
  caseLaw: TPCaseLaw,
  query: CaseLawSearchQuery
): { score: number; matchedCriteria: string[] } {
  let score = 0;
  const matchedCriteria: string[] = [];

  // Court type match (high priority for binding precedents)
  if (query.court && caseLaw.court === query.court) {
    score += 20;
    matchedCriteria.push(`Court: ${query.court}`);
  }

  // Binding precedent bonus
  if (caseLaw.court === "Supreme Court") {
    score += 15;
  } else if (caseLaw.court === "High Court") {
    score += 10;
  }

  // Landmark case bonus
  if (caseLaw.precedentValue === "binding" || caseLaw.precedentValue === "landmark") {
    score += 15;
    matchedCriteria.push("Landmark/Binding");
  }

  // Outcome match
  if (query.outcome && caseLaw.favorableFor === query.outcome) {
    score += 15;
    matchedCriteria.push(`Outcome: ${query.outcome}`);
  }

  // Method match
  if (query.method && caseLaw.methods.includes(query.method)) {
    score += 20;
    matchedCriteria.push(`Method: ${query.method}`);
  }

  // Nature code match
  if (query.natureCode && caseLaw.natureCodes.includes(query.natureCode)) {
    score += 25;
    matchedCriteria.push(`Nature Code: ${query.natureCode}`);
  }

  // Keyword matching
  if (query.keywords && query.keywords.length > 0) {
    const queryKeywordsLower = query.keywords.map(k => k.toLowerCase());
    for (const keyword of caseLaw.keywords) {
      const keywordLower = keyword.toLowerCase();
      for (const qk of queryKeywordsLower) {
        if (keywordLower.includes(qk) || qk.includes(keywordLower)) {
          score += 15;
          matchedCriteria.push(`Keyword: ${keyword}`);
          break;
        }
      }
    }
  }

  // Text search
  if (query.text) {
    const searchTerms = query.text.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const searchableText = [
      caseLaw.ruling,
      caseLaw.ratio,
      ...caseLaw.issues,
      ...caseLaw.keywords
    ].join(" ").toLowerCase();

    for (const term of searchTerms) {
      if (searchableText.includes(term)) {
        score += 10;
        matchedCriteria.push(`Term: ${term}`);
      }
    }
  }

  // Assessment year match
  if (query.assessmentYear && caseLaw.assessmentYear.includes(query.assessmentYear)) {
    score += 5;
    matchedCriteria.push(`AY: ${query.assessmentYear}`);
  }

  // Bench match
  if (query.bench) {
    const benchLower = query.bench.toLowerCase();
    if (caseLaw.bench.toLowerCase().includes(benchLower)) {
      score += 5;
      matchedCriteria.push(`Bench: ${caseLaw.bench}`);
    }
  }

  // Normalize score
  score = Math.min(100, score);

  return { score, matchedCriteria };
}

/**
 * Find related cases based on issues and keywords
 */
function findRelatedCases(caseLaw: TPCaseLaw, limit: number = 5): TPCaseLaw[] {
  const allCases = getAllCases().filter(c => c.id !== caseLaw.id);
  const scored: Array<{ case: TPCaseLaw; score: number }> = [];

  for (const c of allCases) {
    let score = 0;

    // Method overlap
    for (const method of caseLaw.methods) {
      if (c.methods.includes(method)) score += 20;
    }

    // Nature code overlap
    for (const code of caseLaw.natureCodes) {
      if (c.natureCodes.includes(code)) score += 25;
    }

    // Keyword overlap
    for (const keyword of caseLaw.keywords) {
      if (c.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())) {
        score += 15;
      }
    }

    // Same court (for consistency)
    if (c.court === caseLaw.court) score += 5;

    if (score > 0) {
      scored.push({ case: c, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.case);
}

/**
 * Build precedent chain (higher court decisions on similar issues)
 */
function buildPrecedentChain(caseLaw: TPCaseLaw): TPCaseLaw[] {
  const chain: TPCaseLaw[] = [];
  const allCases = getAllCases().filter(c => c.id !== caseLaw.id);

  // Find higher court decisions on similar issues
  const courtHierarchy: Record<CourtType, number> = {
    "ITAT": 1,
    "High Court": 2,
    "Supreme Court": 3
  };

  const currentLevel = courtHierarchy[caseLaw.court];

  for (const c of allCases) {
    if (courtHierarchy[c.court] > currentLevel) {
      // Check issue similarity
      const hasCommonIssue = caseLaw.keywords.some(k =>
        c.keywords.some(ck => ck.toLowerCase().includes(k.toLowerCase()))
      );

      if (hasCommonIssue) {
        chain.push(c);
      }
    }
  }

  return chain.sort((a, b) => courtHierarchy[b.court] - courtHierarchy[a.court]);
}

// =============================================================================
// MAIN ENGINE CLASS
// =============================================================================

export class CaseLawEngine {
  private cases: TPCaseLaw[];

  constructor() {
    this.cases = TP_CASE_LAW;
  }

  /**
   * Search cases based on query parameters
   */
  search(query: CaseLawSearchQuery): CaseLawSearchResults {
    const startTime = Date.now();
    const results: CaseLawSearchResult[] = [];

    let candidateCases = [...this.cases];

    // Apply filters
    if (query.court) {
      candidateCases = candidateCases.filter(c => c.court === query.court);
    }

    if (query.outcome) {
      candidateCases = candidateCases.filter(c => c.favorableFor === query.outcome);
    }

    if (query.method) {
      candidateCases = candidateCases.filter(c => c.methods.includes(query.method!));
    }

    if (query.natureCode) {
      candidateCases = candidateCases.filter(c => c.natureCodes.includes(query.natureCode!));
    }

    if (query.onlyLandmark) {
      candidateCases = candidateCases.filter(c =>
        c.precedentValue === "landmark" || c.precedentValue === "binding"
      );
    }

    // Calculate relevance scores
    for (const caseLaw of candidateCases) {
      const { score, matchedCriteria } = calculateRelevanceScore(caseLaw, query);

      const minScore = query.minScore ?? 5;
      if (score >= minScore || Object.keys(query).length <= 1) {
        results.push({
          case: caseLaw,
          relevanceScore: score,
          matchedCriteria
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply limit
    const limit = query.limit ?? 20;
    const limitedResults = results.slice(0, limit);

    // Calculate statistics
    const statistics = {
      taxpayerFavorable: limitedResults.filter(r => r.case.favorableFor === "taxpayer").length,
      revenueFavorable: limitedResults.filter(r => r.case.favorableFor === "revenue").length,
      mixed: limitedResults.filter(r => r.case.favorableFor === "mixed").length
    };

    return {
      query,
      results: limitedResults,
      totalMatches: results.length,
      searchTime: Date.now() - startTime,
      statistics
    };
  }

  /**
   * Get full context for a specific case
   */
  getCaseContext(caseId: string): CaseContext | null {
    const caseLaw = getCaseById(caseId);
    if (!caseLaw) return null;

    const relatedCases = findRelatedCases(caseLaw);
    const precedentChain = buildPrecedentChain(caseLaw);
    const practicalImplications = this.derivePracticalImplications(caseLaw);
    const defenseTips = this.generateDefenseTips(caseLaw);

    return {
      case: caseLaw,
      relatedCases,
      precedentChain,
      practicalImplications,
      defenseTips
    };
  }

  /**
   * Analyze a specific issue with relevant cases
   */
  analyzeIssue(issue: string): IssueAnalysis {
    const relevantCases = getCasesByKeyword(issue);

    const taxpayerCases = relevantCases.filter(c => c.favorableFor === "taxpayer");
    const revenueCases = relevantCases.filter(c => c.favorableFor === "revenue");

    // Derive positions
    const taxpayerPosition = taxpayerCases.length > 0
      ? taxpayerCases.slice(0, 3).map(c => c.ratio).join(" | ")
      : "Limited favorable precedents available";

    const revenuePosition = revenueCases.length > 0
      ? revenueCases.slice(0, 3).map(c => c.ratio).join(" | ")
      : "Limited adverse precedents";

    // Generate recommendation
    const recommendation = this.generateRecommendation(issue, taxpayerCases, revenueCases);

    return {
      issue,
      relevantCases,
      taxpayerPosition,
      revenuePosition,
      recommendation
    };
  }

  /**
   * Get cases by specific criteria
   */
  getCasesByCriteria(criteria: {
    court?: CourtType;
    method?: TPMethod;
    natureCode?: string;
    outcome?: RulingOutcome;
  }): TPCaseLaw[] {
    let results = [...this.cases];

    if (criteria.court) {
      results = results.filter(c => c.court === criteria.court);
    }
    if (criteria.method) {
      results = results.filter(c => c.methods.includes(criteria.method!));
    }
    if (criteria.natureCode) {
      results = results.filter(c => c.natureCodes.includes(criteria.natureCode!));
    }
    if (criteria.outcome) {
      results = results.filter(c => c.favorableFor === criteria.outcome);
    }

    return results;
  }

  /**
   * Get landmark cases
   */
  getLandmarkCases(): TPCaseLaw[] {
    return getLandmarkCases();
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return getCaseStatistics();
  }

  /**
   * Get version info
   */
  getVersionInfo() {
    return TP_CASE_LAW_VERSION;
  }

  /**
   * Search by citation
   */
  searchByCitation(citation: string): TPCaseLaw | undefined {
    const citationLower = citation.toLowerCase();
    return this.cases.find(c =>
      c.citation.toLowerCase().includes(citationLower) ||
      c.appellant.toLowerCase().includes(citationLower)
    );
  }

  /**
   * Get cases for a transaction type based on nature code
   */
  getCasesForTransaction(natureCode: string): {
    favorable: TPCaseLaw[];
    adverse: TPCaseLaw[];
    landmark: TPCaseLaw[];
  } {
    const cases = getCasesByNatureCode(natureCode);

    return {
      favorable: cases.filter(c => c.favorableFor === "taxpayer"),
      adverse: cases.filter(c => c.favorableFor === "revenue"),
      landmark: cases.filter(c => c.precedentValue === "landmark" || c.precedentValue === "binding")
    };
  }

  /**
   * Derive practical implications from a case
   */
  private derivePracticalImplications(caseLaw: TPCaseLaw): string[] {
    const implications: string[] = [];

    // Based on ruling outcome
    if (caseLaw.favorableFor === "taxpayer") {
      implications.push(`This case supports taxpayer position on: ${caseLaw.issues[0]}`);
    } else if (caseLaw.favorableFor === "revenue") {
      implications.push(`Be cautious: This case favors revenue position on: ${caseLaw.issues[0]}`);
    }

    // Based on court level
    if (caseLaw.court === "Supreme Court") {
      implications.push("Supreme Court ruling - binding precedent across India");
    } else if (caseLaw.court === "High Court") {
      implications.push(`Binding precedent within ${caseLaw.bench} High Court jurisdiction`);
    }

    // Based on keywords
    const keywordImplications: Record<string, string> = {
      "comparables": "Document comparable selection process thoroughly",
      "FAR analysis": "Maintain detailed functional analysis documentation",
      "benchmark": "Ensure benchmarking methodology is robust and defensible",
      "documentation": "Maintain contemporaneous transfer pricing documentation",
      "AMP": "AMP adjustments require proof of international transaction",
      "working capital": "Consider working capital adjustments for comparability",
      "safe harbour": "Evaluate safe harbour applicability for eligible transactions",
      "guarantee": "Document benefit of guarantee for fee determination"
    };

    for (const keyword of caseLaw.keywords) {
      const keywordLower = keyword.toLowerCase();
      for (const [key, implication] of Object.entries(keywordImplications)) {
        if (keywordLower.includes(key)) {
          if (!implications.includes(implication)) {
            implications.push(implication);
          }
        }
      }
    }

    return implications.slice(0, 5);
  }

  /**
   * Generate defense tips based on case
   */
  private generateDefenseTips(caseLaw: TPCaseLaw): string[] {
    const tips: string[] = [];

    // Court-specific tips
    if (caseLaw.court === "Supreme Court") {
      tips.push("Cite this Supreme Court ruling as binding authority");
    } else if (caseLaw.court === "High Court") {
      tips.push(`Cite as binding within ${caseLaw.bench} jurisdiction; persuasive elsewhere`);
    } else {
      tips.push("Cite as persuasive authority; verify higher court position");
    }

    // Outcome-specific tips
    if (caseLaw.favorableFor === "taxpayer") {
      tips.push("Use the ratio decidendi to support similar factual situations");
      tips.push("Distinguish adverse cases by highlighting factual differences");
    } else {
      tips.push("Distinguish this case by demonstrating different facts/circumstances");
      tips.push("Look for subsequent favorable rulings on similar issues");
    }

    // Method-specific tips
    if (caseLaw.methods.includes("TNMM")) {
      tips.push("Ensure comparable selection methodology aligns with this precedent");
    }
    if (caseLaw.methods.includes("CUP")) {
      tips.push("Document comparability adjustments if using CUP method");
    }

    return tips;
  }

  /**
   * Generate recommendation based on issue analysis
   */
  private generateRecommendation(
    issue: string,
    taxpayerCases: TPCaseLaw[],
    revenueCases: TPCaseLaw[]
  ): string {
    const taxpayerLandmark = taxpayerCases.filter(c =>
      c.precedentValue === "landmark" || c.precedentValue === "binding"
    );
    const revenueLandmark = revenueCases.filter(c =>
      c.precedentValue === "landmark" || c.precedentValue === "binding"
    );

    if (taxpayerLandmark.length > revenueLandmark.length) {
      return `Strong taxpayer position supported by ${taxpayerLandmark.length} landmark case(s). Recommend citing: ${taxpayerLandmark[0]?.citation || "N/A"}`;
    } else if (revenueLandmark.length > taxpayerLandmark.length) {
      return `Proceed with caution - ${revenueLandmark.length} landmark case(s) favor revenue. Consider distinguishing facts or seeking alternative positions.`;
    } else if (taxpayerCases.length > revenueCases.length) {
      return `Generally favorable position with ${taxpayerCases.length} supporting cases. Build strong documentation to align with successful precedents.`;
    } else {
      return `Mixed precedents - outcome may depend on specific facts. Ensure comprehensive documentation and consider advance ruling or APA.`;
    }
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createCaseLawEngine = (): CaseLawEngine => {
  return new CaseLawEngine();
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  TPCaseLaw,
  CourtType,
  RulingOutcome,
  TPMethod as CaseLawTPMethod,
  CaseLawSearchResult
};

export {
  TP_CASE_LAW,
  TP_CASE_LAW_VERSION,
  getCaseById,
  getCasesByCourt,
  getCasesByOutcome,
  getCasesByMethod,
  getCasesByNatureCode,
  getCasesByKeyword,
  getLandmarkCases as getCaseLawLandmarkCases,
  getCasesByAssessmentYear,
  getCasesByBench,
  getCaseStatistics
};
