/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * MAM (Most Appropriate Method) Selection Criteria
 *
 * Based on: OECD Transfer Pricing Guidelines 2022, Chapter II
 * Reference: Section 92C of Income Tax Act, 1961
 * ================================================================================
 */

// =============================================================================
// TRANSFER PRICING METHODS
// =============================================================================

/**
 * Transfer pricing methods as per OECD Guidelines and Indian TP Rules
 */
export enum TPMethod {
  /** Comparable Uncontrolled Price Method */
  CUP = "CUP",
  /** Resale Price Method */
  RPM = "RPM",
  /** Cost Plus Method */
  CPM = "CPM",
  /** Transactional Net Margin Method */
  TNMM = "TNMM",
  /** Profit Split Method */
  PSM = "PSM",
  /** Other Method (specified in sub-clause (f) of Section 92C(1)) */
  OTHER = "OTHER",
}

/**
 * Method category classification
 */
export enum MethodCategory {
  /** Traditional transaction methods */
  TRADITIONAL = "traditional",
  /** Transactional profit methods */
  TRANSACTIONAL_PROFIT = "transactional_profit",
  /** Other methods */
  OTHER = "other",
}

/**
 * Method details
 */
export interface MethodDetails {
  code: TPMethod;
  name: string;
  fullName: string;
  category: MethodCategory;
  oecdChapter: string;
  indianSection: string;
  description: string;
  applicableTo: string[];
  advantages: string[];
  disadvantages: string[];
  dataRequirements: string[];
  reliabilityFactors: string[];
}

/**
 * Complete method descriptions
 */
export const TP_METHOD_DETAILS: Record<TPMethod, MethodDetails> = {
  [TPMethod.CUP]: {
    code: TPMethod.CUP,
    name: "CUP",
    fullName: "Comparable Uncontrolled Price Method",
    category: MethodCategory.TRADITIONAL,
    oecdChapter: "Chapter II, Part II, Section A",
    indianSection: "Section 92C(1)(a)",
    description:
      "Compares the price charged in a controlled transaction to the price charged in a comparable uncontrolled transaction in comparable circumstances.",
    applicableTo: [
      "Commodity transactions",
      "Quoted financial instruments",
      "Royalty/License fee",
      "Interest on loans",
      "Standard products with active market",
    ],
    advantages: [
      "Most direct and reliable when internal CUPs available",
      "Directly compares transaction prices",
      "Preferred by OECD when comparables available",
      "Less adjustments needed with close comparables",
    ],
    disadvantages: [
      "Difficult to find truly comparable transactions",
      "Product differences require adjustments",
      "Volume and market level differences affect price",
      "Proprietary products often lack comparables",
    ],
    dataRequirements: [
      "Identical or similar product/service details",
      "Transaction terms and conditions",
      "Geographic market information",
      "Volume and timing data",
      "Functions, assets, and risks analysis",
    ],
    reliabilityFactors: [
      "Product comparability",
      "Market comparability",
      "Contractual terms similarity",
      "Economic circumstances",
      "Business strategies",
    ],
  },
  [TPMethod.RPM]: {
    code: TPMethod.RPM,
    name: "RPM",
    fullName: "Resale Price Method",
    category: MethodCategory.TRADITIONAL,
    oecdChapter: "Chapter II, Part II, Section B",
    indianSection: "Section 92C(1)(b)",
    description:
      "Determines arm's length price based on the resale price at which property purchased from an AE is resold to an independent party, less an appropriate gross margin.",
    applicableTo: [
      "Distribution activities",
      "Marketing and sales functions",
      "Trading companies",
      "Resellers with limited value addition",
    ],
    advantages: [
      "Suitable for distribution arrangements",
      "Less affected by product differences",
      "Focus on value added by distributor",
      "Works well with limited risk distributors",
    ],
    disadvantages: [
      "Sensitive to accounting differences",
      "Difficult with value-adding activities",
      "Time sensitivity of comparables",
      "Margin differences due to various factors",
    ],
    dataRequirements: [
      "Resale price to third parties",
      "Gross margin of comparable distributors",
      "Functions performed by distributor",
      "Assets employed and risks assumed",
      "Market conditions analysis",
    ],
    reliabilityFactors: [
      "Functional comparability",
      "Product line similarity",
      "Market level comparability",
      "Accounting consistency",
      "Time period alignment",
    ],
  },
  [TPMethod.CPM]: {
    code: TPMethod.CPM,
    name: "CPM",
    fullName: "Cost Plus Method",
    category: MethodCategory.TRADITIONAL,
    oecdChapter: "Chapter II, Part II, Section C",
    indianSection: "Section 92C(1)(c)",
    description:
      "Determines arm's length price by adding an appropriate markup to the costs incurred by the supplier in providing goods or services to an AE.",
    applicableTo: [
      "Manufacturing activities",
      "Contract manufacturing",
      "Service provision",
      "Semi-finished goods",
      "Joint facility agreements",
    ],
    advantages: [
      "Suitable for manufacturing/services",
      "Applicable when supplier adds limited value",
      "Good for routine functions",
      "Cost base is generally available",
    ],
    disadvantages: [
      "Cost allocation complexities",
      "Different accounting for costs",
      "Capital intensity differences",
      "Efficiency variations affect margins",
    ],
    dataRequirements: [
      "Direct and indirect cost details",
      "Cost allocation methodology",
      "Comparable manufacturer/service provider data",
      "Functional analysis",
      "Asset and capital employed data",
    ],
    reliabilityFactors: [
      "Cost classification consistency",
      "Functional similarity",
      "Asset intensity comparability",
      "Risk profile similarity",
      "Efficiency levels",
    ],
  },
  [TPMethod.TNMM]: {
    code: TPMethod.TNMM,
    name: "TNMM",
    fullName: "Transactional Net Margin Method",
    category: MethodCategory.TRANSACTIONAL_PROFIT,
    oecdChapter: "Chapter II, Part III, Section B",
    indianSection: "Section 92C(1)(e)",
    description:
      "Examines the net profit margin relative to an appropriate base (e.g., costs, sales, assets) that a taxpayer realizes from a controlled transaction.",
    applicableTo: [
      "Most transaction types",
      "Services",
      "Manufacturing",
      "Distribution",
      "Complex transactions with limited comparables",
    ],
    advantages: [
      "Most commonly used method",
      "Less sensitive to transaction differences",
      "Net margins more comparable across companies",
      "Broader range of comparables available",
      "Tolerates some functional differences",
    ],
    disadvantages: [
      "May be affected by factors not related to TP",
      "Requires broad-based comparable search",
      "PLI selection is critical",
      "One-sided analysis limitation",
    ],
    dataRequirements: [
      "Net profit margin of tested party",
      "Appropriate PLI selection rationale",
      "Comparable company financial data",
      "Functional and risk analysis",
      "Working capital adjustments data",
    ],
    reliabilityFactors: [
      "PLI appropriateness",
      "Functional comparability",
      "Risk comparability",
      "Accounting consistency",
      "Market and economic conditions",
    ],
  },
  [TPMethod.PSM]: {
    code: TPMethod.PSM,
    name: "PSM",
    fullName: "Profit Split Method",
    category: MethodCategory.TRANSACTIONAL_PROFIT,
    oecdChapter: "Chapter II, Part III, Section C",
    indianSection: "Section 92C(1)(d)",
    description:
      "Identifies the combined profit from a controlled transaction and splits it between the AEs based on the relative value of each party's contribution.",
    applicableTo: [
      "Highly integrated operations",
      "Unique intangibles on both sides",
      "Shared risks",
      "Global trading operations",
      "Financial transactions involving multiple parties",
    ],
    advantages: [
      "Suitable for highly integrated transactions",
      "Both parties analyzed",
      "Addresses unique intangibles",
      "Reflects economic substance",
    ],
    disadvantages: [
      "Data intensive",
      "Difficult to apply consistently",
      "Combined profit determination complex",
      "Allocation keys may be subjective",
    ],
    dataRequirements: [
      "Combined profit/loss data",
      "Contribution analysis for each party",
      "Allocation key determination",
      "Residual profit analysis if applicable",
      "Intangibles valuation",
    ],
    reliabilityFactors: [
      "Combined profit reliability",
      "Contribution measurement accuracy",
      "Allocation key appropriateness",
      "Economic substance alignment",
      "Both parties' data availability",
    ],
  },
  [TPMethod.OTHER]: {
    code: TPMethod.OTHER,
    name: "OTHER",
    fullName: "Other Method",
    category: MethodCategory.OTHER,
    oecdChapter: "Chapter II, Part III, Section D",
    indianSection: "Section 92C(1)(f)",
    description:
      "Any other method which takes into account the price charged or paid for similar goods/services in comparable circumstances, where none of the specified methods can be reasonably applied.",
    applicableTo: [
      "Unique transactions",
      "Transactions with no reliable comparables",
      "Complex financial instruments",
      "Business restructurings",
    ],
    advantages: [
      "Flexibility for unusual transactions",
      "Can combine multiple approaches",
      "Addresses specific facts",
    ],
    disadvantages: [
      "Less certainty",
      "May be challenged by tax authorities",
      "Requires robust documentation",
      "No standardized approach",
    ],
    dataRequirements: [
      "Detailed transaction analysis",
      "Justification for non-use of standard methods",
      "Custom valuation approach documentation",
      "Expert opinions if applicable",
    ],
    reliabilityFactors: [
      "Method rationale strength",
      "Data quality",
      "Expert support",
      "Consistency with arm's length principle",
    ],
  },
};

// =============================================================================
// METHOD SELECTION CRITERIA (OECD Para 2.2)
// =============================================================================

/**
 * Factors for selecting the most appropriate method
 */
export const MAM_SELECTION_FACTORS = {
  /** Strengths and weaknesses of each method */
  methodStrengthsWeaknesses: {
    factor: "Method Characteristics",
    oecdRef: "Para 2.2(i)",
    description: "Consider strengths and weaknesses of each method for the specific transaction",
  },
  /** Appropriateness based on transaction nature */
  transactionNature: {
    factor: "Nature of Transaction",
    oecdRef: "Para 2.2(ii)",
    description: "Whether method is appropriate given the nature of the controlled transaction",
  },
  /** Availability of reliable information */
  informationAvailability: {
    factor: "Information Availability",
    oecdRef: "Para 2.2(iii)",
    description: "Availability of reliable information to apply the method",
  },
  /** Degree of comparability */
  comparabilityDegree: {
    factor: "Degree of Comparability",
    oecdRef: "Para 2.2(iv)",
    description: "Degree of comparability between controlled and uncontrolled transactions",
  },
  /** Reliability of adjustments */
  adjustmentReliability: {
    factor: "Adjustment Reliability",
    oecdRef: "Para 2.2(v)",
    description: "Reliability of adjustments needed to achieve comparability",
  },
};

// =============================================================================
// TRANSACTION TYPE TO METHOD MAPPING
// =============================================================================

/**
 * Recommended methods by transaction type
 */
export const TRANSACTION_METHOD_MAPPING: Record<string, {
  preferredMethods: TPMethod[];
  rationale: string;
}> = {
  // Purchase/Sale of Goods
  "tangible_goods_commodity": {
    preferredMethods: [TPMethod.CUP, TPMethod.TNMM, TPMethod.RPM],
    rationale: "Commodities often have quoted prices making CUP reliable",
  },
  "tangible_goods_proprietary": {
    preferredMethods: [TPMethod.TNMM, TPMethod.CPM, TPMethod.CUP],
    rationale: "Proprietary products lack direct comparables, TNMM more practical",
  },
  "tangible_goods_distribution": {
    preferredMethods: [TPMethod.RPM, TPMethod.TNMM, TPMethod.CUP],
    rationale: "Distribution margins focus on value added by distributor",
  },
  // Services
  "services_routine": {
    preferredMethods: [TPMethod.TNMM, TPMethod.CPM, TPMethod.CUP],
    rationale: "Routine services benchmarked by service provider margins",
  },
  "services_high_value": {
    preferredMethods: [TPMethod.PSM, TPMethod.TNMM, TPMethod.CUP],
    rationale: "High-value services may require profit split if unique",
  },
  "services_contract_rd": {
    preferredMethods: [TPMethod.TNMM, TPMethod.CPM],
    rationale: "Contract R&D typically benchmarked on cost-plus basis",
  },
  // Intangibles
  "intangibles_royalty": {
    preferredMethods: [TPMethod.CUP, TPMethod.TNMM, TPMethod.PSM],
    rationale: "Royalties benchmarked against comparable agreements",
  },
  "intangibles_sale": {
    preferredMethods: [TPMethod.CUP, TPMethod.PSM, TPMethod.OTHER],
    rationale: "Intangible transfers often require valuation approaches",
  },
  // Financial
  "financial_loan": {
    preferredMethods: [TPMethod.CUP, TPMethod.OTHER],
    rationale: "Interest rates benchmarked against market rates",
  },
  "financial_guarantee": {
    preferredMethods: [TPMethod.CUP, TPMethod.OTHER],
    rationale: "Guarantee fees benchmarked against comparable guarantees",
  },
};

// =============================================================================
// FUNCTIONAL PROFILE TO METHOD MAPPING
// =============================================================================

/**
 * Recommended methods by functional profile
 */
export const FUNCTIONAL_PROFILE_MAPPING: Record<string, {
  methods: TPMethod[];
  pli: string;
  rationale: string;
}> = {
  "limited_risk_distributor": {
    methods: [TPMethod.TNMM, TPMethod.RPM],
    pli: "OP/OR or OP/Sales",
    rationale: "Limited risk distributor tested on operating margin",
  },
  "full_fledged_distributor": {
    methods: [TPMethod.TNMM, TPMethod.PSM],
    pli: "OP/OR",
    rationale: "Full-fledged distributor may share residual profits",
  },
  "contract_manufacturer": {
    methods: [TPMethod.TNMM, TPMethod.CPM],
    pli: "OP/TC or OP/OR",
    rationale: "Contract manufacturer tested on cost-plus or margin on costs",
  },
  "full_fledged_manufacturer": {
    methods: [TPMethod.TNMM, TPMethod.PSM],
    pli: "OP/OR or ROA",
    rationale: "Full-fledged manufacturer may own intangibles",
  },
  "contract_service_provider": {
    methods: [TPMethod.TNMM, TPMethod.CPM],
    pli: "OP/TC or OP/OR",
    rationale: "Contract services typically cost-plus benchmarked",
  },
  "contract_rd_provider": {
    methods: [TPMethod.TNMM, TPMethod.CPM],
    pli: "OP/TC",
    rationale: "Contract R&D tested on cost-plus margin",
  },
  "ip_owner": {
    methods: [TPMethod.PSM, TPMethod.TNMM, TPMethod.CUP],
    pli: "Residual profit",
    rationale: "IP owner entitled to residual returns",
  },
};

// =============================================================================
// REJECTION RATIONALE TEMPLATES
// =============================================================================

/**
 * Standard rejection rationales for each method
 */
export const METHOD_REJECTION_RATIONALES: Record<TPMethod, string[]> = {
  [TPMethod.CUP]: [
    "No reliable internal or external CUPs available for the transaction",
    "Product/service differences are significant and cannot be reliably adjusted",
    "Contractual terms and economic circumstances differ materially",
    "Volume and geographic market differences preclude reliable comparison",
  ],
  [TPMethod.RPM]: [
    "Tested party performs significant value-adding activities beyond distribution",
    "Product passes through significant processing before resale",
    "Comparable distributors with similar functions not available",
    "Gross margin comparability affected by accounting differences",
  ],
  [TPMethod.CPM]: [
    "Cost base is not comparable due to differing cost structures",
    "Tested party does not perform simple/routine functions",
    "Capital intensity and efficiency differences cannot be adjusted",
    "Cost allocation methodologies differ significantly",
  ],
  [TPMethod.TNMM]: [
    "Transaction involves unique intangibles on both sides",
    "Parties are highly integrated with shared risks",
    "One-sided analysis would not capture transaction accurately",
    "Net margins affected by factors unrelated to transfer pricing",
  ],
  [TPMethod.PSM]: [
    "Transaction does not involve highly integrated operations",
    "No unique intangibles requiring two-sided analysis",
    "Combined profit data not reliably available",
    "TNMM provides more reliable results for routine entity",
  ],
  [TPMethod.OTHER]: [
    "Standard methods can be reasonably applied to the transaction",
    "Other method lacks comparable reliability",
    "Method not consistent with arm's length principle",
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get method details
 */
export function getMethodDetails(method: TPMethod): MethodDetails {
  return TP_METHOD_DETAILS[method];
}

/**
 * Get preferred methods for transaction type
 */
export function getPreferredMethods(transactionType: string): TPMethod[] {
  const mapping = TRANSACTION_METHOD_MAPPING[transactionType];
  return mapping?.preferredMethods || [TPMethod.TNMM, TPMethod.CUP];
}

/**
 * Get rejection rationale for method
 */
export function getRejectionRationale(
  method: TPMethod,
  context?: string
): string {
  const rationales = METHOD_REJECTION_RATIONALES[method];
  if (context) {
    const matchingRationale = rationales.find((r) =>
      r.toLowerCase().includes(context.toLowerCase())
    );
    return matchingRationale || rationales[0];
  }
  return rationales[0];
}

/**
 * Get all available methods
 */
export function getAllMethods(): TPMethod[] {
  return Object.values(TPMethod);
}

/**
 * Check if method is traditional or transactional profit
 */
export function getMethodCategory(method: TPMethod): MethodCategory {
  return TP_METHOD_DETAILS[method].category;
}

/**
 * Get OECD hierarchy preference score
 * Lower score = higher preference in OECD hierarchy
 */
export function getMethodHierarchyScore(method: TPMethod): number {
  const scores: Record<TPMethod, number> = {
    [TPMethod.CUP]: 1,
    [TPMethod.RPM]: 2,
    [TPMethod.CPM]: 2,
    [TPMethod.TNMM]: 3,
    [TPMethod.PSM]: 4,
    [TPMethod.OTHER]: 5,
  };
  return scores[method];
}
