/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Quality Control Engine for AI Outputs
 *
 * Validates AI-generated content for:
 * - Regulatory reference accuracy
 * - Numerical consistency
 * - Hallucination detection
 * - Professional language standards
 * - Completeness checks
 * ================================================================================
 */

import {
  QualityCheck,
  QualityCheckType,
  QualityCheckResult,
  QualityResult,
  PromptType,
} from "./types";

// =============================================================================
// KNOWN VALID REFERENCES
// =============================================================================

const VALID_SECTIONS = [
  "92", "92A", "92B", "92C", "92CA", "92CB", "92CC", "92CD", "92CE", "92D", "92E", "92F",
  "80IA", "80IB", "80IC", "80ID", "80IE",
  "40A", "40A(2)", "40A(2)(a)", "40A(2)(b)",
  "269T", "269SS", "269ST",
  "194C", "194J", "195",
];

const VALID_RULES = [
  "10A", "10AB", "10B", "10C", "10CA", "10CB", "10D", "10DA", "10DB",
  "10TD", "10TE", "10TF", "10TG", "10TH",
  "10UA", "10UB",
];

const VALID_FORMS = [
  "3CEB", "3CEFA", "3CEFB", "3CEAA", "3CEAB", "3CEAC", "3CEAD",
  "3CD", "3CA", "3CB",
];

const VALID_TP_METHODS = [
  "CUP", "Comparable Uncontrolled Price",
  "RPM", "Resale Price Method",
  "CPM", "Cost Plus Method",
  "TNMM", "Transactional Net Margin Method",
  "PSM", "Profit Split Method",
];

const VALID_PLI_TYPES = [
  "OP/OC", "OP/TC", "OP/OR", "OP/Sales", "OP/TA", "OP/CE",
  "Berry Ratio", "Gross Profit/Sales",
  "Operating Profit to Operating Cost",
  "Operating Profit to Total Cost",
  "Operating Profit to Operating Revenue",
  "Operating Profit to Total Assets",
  "Operating Profit to Capital Employed",
];

// =============================================================================
// QUALITY CONTROL ENGINE
// =============================================================================

export class QualityControlEngine {
  private checks: Map<PromptType, QualityCheck[]>;

  constructor() {
    this.checks = this.initializeChecks();
  }

  /**
   * Evaluate AI output quality
   */
  async evaluate(content: string, promptType: PromptType): Promise<QualityResult> {
    const applicableChecks = this.checks.get(promptType) || this.getDefaultChecks();
    const checkResults: QualityCheckResult[] = [];

    for (const check of applicableChecks) {
      const result = await this.runCheck(check, content);
      checkResults.push(result);
    }

    return this.calculateOverallResult(checkResults);
  }

  /**
   * Run individual quality check
   */
  private async runCheck(check: QualityCheck, content: string): Promise<QualityCheckResult> {
    switch (check.type) {
      case QualityCheckType.REGULATORY_REFERENCE:
        return this.checkRegulatoryReferences(check, content);

      case QualityCheckType.NUMERICAL_ACCURACY:
        return this.checkNumericalAccuracy(check, content);

      case QualityCheckType.HALLUCINATION_DETECTION:
        return this.checkForHallucinations(check, content);

      case QualityCheckType.COMPLETENESS:
        return this.checkCompleteness(check, content);

      case QualityCheckType.PROFESSIONAL_LANGUAGE:
        return this.checkProfessionalLanguage(check, content);

      case QualityCheckType.CONSISTENCY:
        return this.checkConsistency(check, content);

      default:
        return {
          check,
          passed: true,
          score: 1.0,
          issues: [],
          suggestions: [],
        };
    }
  }

  /**
   * Check regulatory references for validity
   */
  private checkRegulatoryReferences(check: QualityCheck, content: string): QualityCheckResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check Section references
    const sectionPattern = /Section\s+(\d+[A-Z]*(?:\([^)]+\))?)/gi;
    const sectionMatches = content.matchAll(sectionPattern);
    for (const match of sectionMatches) {
      const section = match[1].replace(/\(.*\)/, "");
      if (!VALID_SECTIONS.some((s) => section.startsWith(s))) {
        issues.push(`Potentially invalid section reference: Section ${match[1]}`);
      }
    }

    // Check Rule references
    const rulePattern = /Rule\s+(\d+[A-Z]*)/gi;
    const ruleMatches = content.matchAll(rulePattern);
    for (const match of ruleMatches) {
      if (!VALID_RULES.includes(match[1])) {
        issues.push(`Potentially invalid rule reference: Rule ${match[1]}`);
      }
    }

    // Check Form references
    const formPattern = /Form\s+(3[A-Z]+)/gi;
    const formMatches = content.matchAll(formPattern);
    for (const match of formMatches) {
      if (!VALID_FORMS.includes(match[1])) {
        issues.push(`Potentially invalid form reference: Form ${match[1]}`);
      }
    }

    // Check TP method references
    const methodsFound = VALID_TP_METHODS.filter((m) =>
      content.toLowerCase().includes(m.toLowerCase())
    );
    if (content.toLowerCase().includes("method") && methodsFound.length === 0) {
      suggestions.push("Consider referencing specific TP methods (CUP, RPM, CPM, TNMM, PSM)");
    }

    const score = issues.length === 0 ? 1.0 : Math.max(0.5, 1 - issues.length * 0.15);

    return {
      check,
      passed: issues.length === 0,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Check numerical accuracy and consistency
   */
  private checkNumericalAccuracy(check: QualityCheck, content: string): QualityCheckResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check percentage values are reasonable
    const percentPattern = /(\d+(?:\.\d+)?)\s*%/g;
    const percentMatches = content.matchAll(percentPattern);
    for (const match of percentMatches) {
      const value = parseFloat(match[1]);
      if (value > 100 && !content.includes("growth") && !content.includes("increase")) {
        issues.push(`Unusual percentage value: ${value}% - verify if correct`);
      }
      if (value < 0) {
        suggestions.push(`Negative percentage ${value}% - ensure this is intentional`);
      }
    }

    // Check currency values have proper formatting
    const currencyPattern = /₹\s*([\d,]+(?:\.\d+)?)\s*(Cr|Lakh|crore|lakh)?/gi;
    const currencyMatches = content.matchAll(currencyPattern);
    for (const match of currencyMatches) {
      const value = match[1].replace(/,/g, "");
      if (value.length > 12) {
        issues.push(`Unusually large currency value: ₹${match[0]} - verify accuracy`);
      }
    }

    // Check for calculation consistency (simple check)
    const opocPattern = /OP\/OC[:\s]+(\d+(?:\.\d+)?)\s*%/gi;
    const opocMatches = [...content.matchAll(opocPattern)];
    if (opocMatches.length > 1) {
      const values = opocMatches.map((m) => parseFloat(m[1]));
      const hasInconsistency = values.some((v, i) =>
        i > 0 && Math.abs(v - values[i - 1]) > 0.01 && !content.includes("range")
      );
      if (hasInconsistency) {
        suggestions.push("Multiple OP/OC values found - verify consistency across document");
      }
    }

    const score = issues.length === 0 ? 1.0 : Math.max(0.6, 1 - issues.length * 0.2);

    return {
      check,
      passed: issues.length === 0,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Check for potential hallucinations
   */
  private checkForHallucinations(check: QualityCheck, content: string): QualityCheckResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for fake case citations (common hallucination pattern)
    const casePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+v[s]?\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const caseMatches = [...content.matchAll(casePattern)];
    if (caseMatches.length > 0) {
      suggestions.push(
        `Found ${caseMatches.length} case citation(s) - VERIFY each in legal database before use`
      );
    }

    // Check for suspiciously specific statistics without sources
    const statsPattern = /(\d+(?:\.\d+)?)\s*%\s+of\s+(?:companies|firms|entities|market)/gi;
    const statsMatches = [...content.matchAll(statsPattern)];
    if (statsMatches.length > 0 && !content.includes("Source:") && !content.includes("[Ref")) {
      issues.push("Statistics found without source citations - verify data accuracy");
    }

    // Check for potentially fabricated company names
    const companyPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:Pvt\.?\s*Ltd|Ltd|Limited|Inc|Corp)/g;
    const companyMatches = [...content.matchAll(companyPattern)];
    if (companyMatches.length > 3) {
      suggestions.push(
        `Found ${companyMatches.length} company references - verify each against Prowess/Capital IQ database`
      );
    }

    // Check for OECD paragraph references (common to hallucinate)
    const oecdPattern = /OECD\s+(?:Guidelines?\s+)?(?:Para(?:graph)?\.?\s*)?(\d+(?:\.\d+)?)/gi;
    const oecdMatches = [...content.matchAll(oecdPattern)];
    if (oecdMatches.length > 0) {
      suggestions.push("OECD paragraph references found - verify against current OECD TP Guidelines");
    }

    const score = issues.length === 0 ? 1.0 : Math.max(0.5, 1 - issues.length * 0.25);

    return {
      check,
      passed: issues.length === 0,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Check content completeness
   */
  private checkCompleteness(check: QualityCheck, content: string): QualityCheckResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check minimum length
    if (content.length < 200) {
      issues.push("Content appears too brief - consider expanding analysis");
    }

    // Check for placeholder text
    const placeholders = ["[___]", "[TBD]", "[INSERT]", "[PLACEHOLDER]", "XXX", "TODO"];
    for (const placeholder of placeholders) {
      if (content.includes(placeholder)) {
        issues.push(`Placeholder text found: ${placeholder} - requires completion`);
      }
    }

    // Check for incomplete sentences
    if (content.includes("...") && !content.includes("...\"") && !content.includes("...'")) {
      suggestions.push("Ellipsis found - ensure all sentences are complete");
    }

    // Check for required sections based on content type
    if (content.toLowerCase().includes("safe harbour")) {
      if (!content.toLowerCase().includes("rule 10t")) {
        suggestions.push("Safe Harbour content should reference Rule 10TD/10TE/10TF");
      }
    }

    if (content.toLowerCase().includes("benchmarking") || content.toLowerCase().includes("comparable")) {
      if (!content.toLowerCase().includes("arm's length") && !content.toLowerCase().includes("arm's length")) {
        suggestions.push("Benchmarking content should reference arm's length standard");
      }
    }

    const score = issues.length === 0 ? 1.0 : Math.max(0.4, 1 - issues.length * 0.2);

    return {
      check,
      passed: issues.length === 0,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Check professional language standards
   */
  private checkProfessionalLanguage(check: QualityCheck, content: string): QualityCheckResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for informal language
    const informalPatterns = [
      /\bkinda\b/i,
      /\bgonna\b/i,
      /\bwanna\b/i,
      /\bgotta\b/i,
      /\b(lol|omg|btw)\b/i,
      /!{2,}/,
      /\?{2,}/,
    ];
    for (const pattern of informalPatterns) {
      if (pattern.test(content)) {
        issues.push("Informal language detected - use professional terminology");
      }
    }

    // Check for first person (should be third person/passive in formal docs)
    const firstPersonCount = (content.match(/\b(I|we|my|our)\b/gi) || []).length;
    if (firstPersonCount > 5) {
      suggestions.push(
        "Consider using third person or passive voice for formal documentation"
      );
    }

    // Check for promotional language (not suitable for regulatory docs)
    const promotionalPatterns = [
      /\bbest in class\b/i,
      /\bworld-class\b/i,
      /\bcutting[- ]edge\b/i,
      /\bgroundbreaking\b/i,
      /\bexceptional\b/i,
    ];
    for (const pattern of promotionalPatterns) {
      if (pattern.test(content)) {
        suggestions.push(
          "Promotional language detected - use objective, factual descriptions"
        );
        break;
      }
    }

    // Check for proper capitalization of key terms
    if (content.includes("transfer pricing") && !content.includes("Transfer Pricing")) {
      suggestions.push("Consider capitalizing 'Transfer Pricing' as a proper noun in formal context");
    }

    const score = issues.length === 0 ? 1.0 : Math.max(0.7, 1 - issues.length * 0.15);

    return {
      check,
      passed: issues.length === 0,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Check internal consistency
   */
  private checkConsistency(check: QualityCheck, content: string): QualityCheckResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for contradictory statements
    if (
      content.includes("eligible") &&
      content.includes("not eligible") &&
      !content.includes("would be eligible") &&
      !content.includes("if")
    ) {
      suggestions.push("Both 'eligible' and 'not eligible' found - verify logical consistency");
    }

    // Check for consistent method naming
    const methodVariants = {
      "TNMM": ["TNMM", "Transactional Net Margin Method", "transactional net margin"],
      "CUP": ["CUP", "Comparable Uncontrolled Price", "comparable uncontrolled"],
    };
    for (const [standard, variants] of Object.entries(methodVariants)) {
      const foundVariants = variants.filter((v) =>
        content.toLowerCase().includes(v.toLowerCase())
      );
      if (foundVariants.length > 1) {
        suggestions.push(
          `Multiple naming conventions for ${standard} - consider standardizing`
        );
      }
    }

    // Check for date consistency
    const fyPattern = /FY\s*(\d{4})-(\d{2,4})/gi;
    const ayPattern = /AY\s*(\d{4})-(\d{2,4})/gi;
    const fyMatches = [...content.matchAll(fyPattern)];
    const ayMatches = [...content.matchAll(ayPattern)];

    if (fyMatches.length > 1) {
      const years = fyMatches.map((m) => m[1]);
      const uniqueYears = [...new Set(years)];
      if (uniqueYears.length > 1) {
        suggestions.push("Multiple financial years referenced - verify consistency");
      }
    }

    const score = issues.length === 0 ? 1.0 : Math.max(0.6, 1 - issues.length * 0.2);

    return {
      check,
      passed: issues.length === 0,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Calculate overall quality result
   */
  private calculateOverallResult(checkResults: QualityCheckResult[]): QualityResult {
    const totalWeight = checkResults.reduce((sum, r) => sum + r.check.weight, 0);
    const weightedScore = checkResults.reduce(
      (sum, r) => sum + r.score * r.check.weight,
      0
    );
    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    const criticalIssues = checkResults
      .filter((r) => r.check.required && !r.passed)
      .flatMap((r) => r.issues);

    const warnings = checkResults
      .filter((r) => !r.check.required && !r.passed)
      .flatMap((r) => r.issues);

    const recommendations = checkResults.flatMap((r) => r.suggestions);

    const verificationRequired =
      checkResults.some(
        (r) => r.check.type === QualityCheckType.HALLUCINATION_DETECTION && r.suggestions.length > 0
      ) ||
      checkResults.some(
        (r) => r.check.type === QualityCheckType.REGULATORY_REFERENCE && !r.passed
      );

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      passed: criticalIssues.length === 0 && overallScore >= 0.7,
      checkResults,
      criticalIssues,
      warnings,
      recommendations: [...new Set(recommendations)],
      verificationRequired,
    };
  }

  /**
   * Initialize quality checks for each prompt type
   */
  private initializeChecks(): Map<PromptType, QualityCheck[]> {
    const checks = new Map<PromptType, QualityCheck[]>();

    // Safe Harbour checks
    const safeHarbourChecks: QualityCheck[] = [
      {
        type: QualityCheckType.REGULATORY_REFERENCE,
        name: "Regulatory Reference Accuracy",
        description: "Verify Rule 10TD/10TE/10TF references",
        weight: 0.3,
        required: true,
      },
      {
        type: QualityCheckType.NUMERICAL_ACCURACY,
        name: "Margin Calculation Accuracy",
        description: "Verify margin percentages and thresholds",
        weight: 0.25,
        required: true,
      },
      {
        type: QualityCheckType.COMPLETENESS,
        name: "Recommendation Completeness",
        description: "Ensure all required elements present",
        weight: 0.2,
        required: true,
      },
      {
        type: QualityCheckType.PROFESSIONAL_LANGUAGE,
        name: "Professional Language",
        description: "Check formal language standards",
        weight: 0.15,
        required: false,
      },
      {
        type: QualityCheckType.HALLUCINATION_DETECTION,
        name: "Hallucination Detection",
        description: "Check for potentially fabricated information",
        weight: 0.1,
        required: false,
      },
    ];
    checks.set(PromptType.SAFE_HARBOUR_RECOMMENDATION, safeHarbourChecks);
    checks.set(PromptType.SAFE_HARBOUR_GAP_ANALYSIS, safeHarbourChecks);
    checks.set(PromptType.FORM_3CEFA_NARRATIVE, safeHarbourChecks);

    // Form 3CEB checks
    const form3cebChecks: QualityCheck[] = [
      {
        type: QualityCheckType.REGULATORY_REFERENCE,
        name: "Section 92 Compliance",
        description: "Verify Section 92C method references",
        weight: 0.25,
        required: true,
      },
      {
        type: QualityCheckType.COMPLETENESS,
        name: "Transaction Description Completeness",
        description: "Ensure all transaction elements documented",
        weight: 0.25,
        required: true,
      },
      {
        type: QualityCheckType.PROFESSIONAL_LANGUAGE,
        name: "Professional Language",
        description: "Check formal documentation standards",
        weight: 0.2,
        required: true,
      },
      {
        type: QualityCheckType.CONSISTENCY,
        name: "Internal Consistency",
        description: "Check for contradictions",
        weight: 0.15,
        required: false,
      },
      {
        type: QualityCheckType.HALLUCINATION_DETECTION,
        name: "Hallucination Detection",
        description: "Check for fabricated references",
        weight: 0.15,
        required: false,
      },
    ];
    checks.set(PromptType.TRANSACTION_DESCRIPTION, form3cebChecks);
    checks.set(PromptType.METHOD_JUSTIFICATION, form3cebChecks);
    checks.set(PromptType.METHOD_REJECTION_RATIONALE, form3cebChecks);

    // Benchmarking checks
    const benchmarkingChecks: QualityCheck[] = [
      {
        type: QualityCheckType.NUMERICAL_ACCURACY,
        name: "Calculation Accuracy",
        description: "Verify all numerical calculations",
        weight: 0.3,
        required: true,
      },
      {
        type: QualityCheckType.REGULATORY_REFERENCE,
        name: "Rule 10CA Compliance",
        description: "Verify range determination methodology",
        weight: 0.25,
        required: true,
      },
      {
        type: QualityCheckType.HALLUCINATION_DETECTION,
        name: "Comparable Verification",
        description: "Flag potentially fabricated comparables",
        weight: 0.2,
        required: true,
      },
      {
        type: QualityCheckType.COMPLETENESS,
        name: "Analysis Completeness",
        description: "Ensure all required analysis elements",
        weight: 0.15,
        required: false,
      },
      {
        type: QualityCheckType.PROFESSIONAL_LANGUAGE,
        name: "Professional Language",
        description: "Check documentation standards",
        weight: 0.1,
        required: false,
      },
    ];
    checks.set(PromptType.WORKING_CAPITAL_ADJUSTMENT, benchmarkingChecks);
    checks.set(PromptType.COMPARABLE_REJECTION, benchmarkingChecks);
    checks.set(PromptType.RANGE_DETERMINATION, benchmarkingChecks);
    checks.set(PromptType.ARM_LENGTH_CONCLUSION, benchmarkingChecks);

    return checks;
  }

  /**
   * Get default checks for unspecified prompt types
   */
  private getDefaultChecks(): QualityCheck[] {
    return [
      {
        type: QualityCheckType.COMPLETENESS,
        name: "Content Completeness",
        description: "Basic completeness check",
        weight: 0.3,
        required: true,
      },
      {
        type: QualityCheckType.PROFESSIONAL_LANGUAGE,
        name: "Professional Language",
        description: "Language standards check",
        weight: 0.3,
        required: false,
      },
      {
        type: QualityCheckType.HALLUCINATION_DETECTION,
        name: "Hallucination Detection",
        description: "Fabrication check",
        weight: 0.4,
        required: false,
      },
    ];
  }
}
