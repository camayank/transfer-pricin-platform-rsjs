import { NextRequest, NextResponse } from "next/server";
import {
  MAMSelectionEngine,
  MAMSelectionAIService,
  type MAMSelectionInput,
  MAM_SELECTION_FACTORS,
  TRANSACTION_METHOD_MAPPING,
  TPMethod,
  MAMTransactionType,
  MAMFunctionalProfile,
} from "@/lib/engines";

interface MAMSelectionRequest {
  transactionType:
    | "tangible_goods"
    | "services"
    | "intangibles"
    | "financial"
    | "cost_sharing";
  transactionDescription: string;
  transactionValue: number;
  testedParty: "indian_entity" | "foreign_ae";
  functionalProfile:
    | "limited_risk_distributor"
    | "full_fledged_distributor"
    | "contract_manufacturer"
    | "full_fledged_manufacturer"
    | "contract_service_provider"
    | "full_fledged_service_provider";
  functionsPerformed: string[];
  assetsEmployed: string[];
  risksAssumed: string[];
  intangiblesInvolved?: boolean;
  intangibleType?: string;
  dataAvailability: {
    priceData: boolean;
    grossMarginData: boolean;
    netMarginData: boolean;
    combinedProfitData: boolean;
    comparableDatabaseAccess: boolean;
  };
  internalCUPsAvailable?: boolean;
  externalCUPsAvailable?: boolean;
  industry?: string;
  useAIAnalysis?: boolean;
}

// POST /api/mam-selection - Select most appropriate method
export async function POST(request: NextRequest) {
  try {
    const body: MAMSelectionRequest = await request.json();
    const {
      transactionType,
      transactionDescription,
      testedParty,
      functionalProfile,
      functionsPerformed,
      assetsEmployed,
      risksAssumed,
      intangiblesInvolved,
      intangibleType,
      dataAvailability,
      internalCUPsAvailable,
      externalCUPsAvailable,
      industry,
      useAIAnalysis,
    } = body;

    // Validate required fields
    if (
      !transactionType ||
      !transactionDescription ||
      !functionalProfile ||
      !dataAvailability
    ) {
      return NextResponse.json(
        {
          error:
            "transactionType, transactionDescription, functionalProfile, and dataAvailability are required",
        },
        { status: 400 }
      );
    }

    const engine = new MAMSelectionEngine();

    const input: MAMSelectionInput = {
      transactionType: transactionType as MAMTransactionType,
      transactionDescription,
      functionalProfile: functionalProfile as MAMFunctionalProfile,
      functionsPerformed: functionsPerformed || [],
      assetsEmployed: assetsEmployed || [],
      risksAssumed: risksAssumed || [],
      intangiblesInvolved: intangiblesInvolved || false,
      intangibleType,
      internalCUPsAvailable: internalCUPsAvailable || false,
      externalCUPsAvailable: externalCUPsAvailable || false,
      dataAvailability: {
        priceData: dataAvailability.priceData || false,
        grossMarginData: dataAvailability.grossMarginData || false,
        netMarginData: dataAvailability.netMarginData || false,
        combinedProfitData: dataAvailability.combinedProfitData || false,
        comparableDatabaseAccess: dataAvailability.comparableDatabaseAccess || false,
        dataQuality: "medium",
      },
      testedParty: testedParty || "indian_entity",
      industry,
    };

    // Select most appropriate method
    const result = engine.selectMostAppropriateMethod(input);

    // Generate justification for selected method
    const justification = engine.generateMethodJustification(
      result.selectedMethod,
      result.methodRanking
    );

    // Generate rejection rationale for non-selected methods
    const rejectionRationales = result.methodRanking
      .filter((m) => m.method !== result.selectedMethod)
      .map((m) => ({
        method: m.method,
        rationale: engine.generateRejectionRationale(m.method, input),
        suitabilityScore: m.score,
      }));

    // Add AI analysis if requested
    let aiAnalysis = null;
    if (useAIAnalysis) {
      const aiService = new MAMSelectionAIService();
      const enhancedResult = await aiService.analyzeMAMSelection(input);
      aiAnalysis = enhancedResult.aiAnalysis;
    }

    return NextResponse.json({
      result,
      justification,
      rejectionRationales,
      aiAnalysis,
      summary: {
        selectedMethod: result.selectedMethod,
        methodName: getMethodFullName(result.selectedMethod),
        confidence: result.suitabilityScore,
        primaryReasons: [result.methodRanking[0]?.reason || "Most reliable method for this transaction type"],
        oecdCompliant: true,
        documentationRequired: getDocumentationRequirements(result.selectedMethod),
      },
    });
  } catch (error) {
    console.error("Error selecting MAM:", error);
    return NextResponse.json(
      { error: "Failed to select most appropriate method" },
      { status: 500 }
    );
  }
}

// GET /api/mam-selection - Get method criteria and guidance
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const method = searchParams.get("method");

  if (method) {
    const methodInfo = getMethodDetails(method);
    if (methodInfo) {
      return NextResponse.json(methodInfo);
    }
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }

  return NextResponse.json({
    methods: Object.values(TPMethod),
    criteria: MAM_SELECTION_FACTORS,
    overview: {
      principle:
        "The most appropriate method is the method that produces the most reliable measure of an arm's length result",
      oecdGuidance: "OECD Transfer Pricing Guidelines 2022, Chapter II",
      indianLaw: "Section 92C(1), Income Tax Act, 1961",
      selectionFactors: [
        "Strengths and weaknesses of each method",
        "Appropriateness to the nature of the transaction",
        "Availability of reliable information",
        "Degree of comparability between controlled and uncontrolled transactions",
        "Reliability of assumptions required",
      ],
    },
    methodSummary: {
      CUP: {
        name: "Comparable Uncontrolled Price Method",
        applicability: "Tangible goods with identical comparables",
        reliability: "Highest when true comparables exist",
      },
      RPM: {
        name: "Resale Price Method",
        applicability: "Distribution/resale activities",
        reliability: "High for distributors without value addition",
      },
      CPM: {
        name: "Cost Plus Method",
        applicability: "Manufacturing, contract services",
        reliability: "High for routine manufacturing",
      },
      TNMM: {
        name: "Transactional Net Margin Method",
        applicability: "Most transactions where net margins available",
        reliability: "Good with proper adjustments",
      },
      PSM: {
        name: "Profit Split Method",
        applicability: "Unique intangibles, integrated operations",
        reliability: "High for highly integrated transactions",
      },
      OTHER: {
        name: "Other Method",
        applicability: "When prescribed methods not appropriate",
        reliability: "Requires strong justification",
      },
    },
  });
}

function getMethodFullName(method: string): string {
  const names: Record<string, string> = {
    CUP: "Comparable Uncontrolled Price Method",
    RPM: "Resale Price Method",
    CPM: "Cost Plus Method",
    TNMM: "Transactional Net Margin Method",
    PSM: "Profit Split Method",
    OTHER: "Other Method (Rule 10AB)",
  };
  return names[method] || method;
}

function getMethodDetails(method: string) {
  const details: Record<string, object> = {
    CUP: {
      method: "CUP",
      fullName: "Comparable Uncontrolled Price Method",
      section: "92C(1)(a)",
      rule: "10B(1)(a)",
      description:
        "Compares the price charged in a controlled transaction with the price charged in a comparable uncontrolled transaction",
      whenToUse: [
        "Identical or similar products traded",
        "Commodity transactions",
        "Intercompany services with market rates",
        "Loan transactions with quoted rates",
      ],
      dataRequired: [
        "Internal comparables (AE to third party prices)",
        "External comparables (third party to third party prices)",
        "Adjustments for differences in product, terms, conditions",
      ],
      strengths: [
        "Most direct method",
        "Highest reliability when comparables exist",
        "Widely accepted by tax authorities",
      ],
      weaknesses: [
        "Strict comparability requirements",
        "Difficult to find identical products",
        "Minor differences can significantly affect price",
      ],
      adjustments: [
        "Product differences",
        "Contractual terms",
        "Geographic market",
        "Volume discounts",
        "Time of transaction",
      ],
    },
    RPM: {
      method: "RPM",
      fullName: "Resale Price Method",
      section: "92C(1)(b)",
      rule: "10B(1)(b)",
      description:
        "Starts with resale price to third party and deducts appropriate gross margin",
      whenToUse: [
        "Distribution activities",
        "Marketing and sales functions",
        "Limited value addition by reseller",
        "Short time between purchase and resale",
      ],
      dataRequired: [
        "Resale price to independent parties",
        "Gross margins of comparable distributors",
        "Functional analysis of distribution activities",
      ],
      strengths: [
        "Appropriate for distributors",
        "Less affected by product differences",
        "Good for marketing intangibles",
      ],
      weaknesses: [
        "Affected by accounting differences in gross margin",
        "Less reliable with significant value addition",
        "Gross margin data not always available",
      ],
    },
    CPM: {
      method: "CPM",
      fullName: "Cost Plus Method",
      section: "92C(1)(c)",
      rule: "10B(1)(c)",
      description: "Adds appropriate markup to costs incurred by supplier",
      whenToUse: [
        "Contract manufacturing",
        "Provision of services",
        "Semi-finished goods",
        "Joint facility agreements",
      ],
      dataRequired: [
        "Direct and indirect costs",
        "Cost base composition",
        "Comparable cost plus margins",
      ],
      strengths: [
        "Appropriate for manufacturers",
        "Good for service providers",
        "Accounts for value of functions performed",
      ],
      weaknesses: [
        "Cost allocation challenges",
        "Accounting differences affect comparability",
        "May not reflect market conditions",
      ],
    },
    TNMM: {
      method: "TNMM",
      fullName: "Transactional Net Margin Method",
      section: "92C(1)(d)",
      rule: "10B(1)(d)",
      description:
        "Examines net profit margin relative to an appropriate base (costs, sales, assets)",
      whenToUse: [
        "Most common transactions",
        "When gross margins not available",
        "Complex transactions with multiple elements",
        "Service arrangements",
      ],
      dataRequired: [
        "Net profit margins of tested party",
        "Comparable company data",
        "PLI calculation (OP/OC, OP/OR, etc.)",
      ],
      strengths: [
        "Tolerant of functional differences",
        "Widely available comparable data",
        "Net margins less volatile than gross margins",
      ],
      weaknesses: [
        "Affected by factors beyond transfer pricing",
        "Requires proper PLI selection",
        "Working capital adjustments needed",
      ],
      pliSelection: {
        "OP/OC": "Manufacturing, services (cost-based remuneration)",
        "OP/OR": "Distribution, sales activities",
        "OP/TA": "Asset-intensive businesses",
        "Berry Ratio": "Low-risk distribution",
      },
    },
    PSM: {
      method: "PSM",
      fullName: "Profit Split Method",
      section: "92C(1)(e)",
      rule: "10B(1)(e)",
      description:
        "Allocates combined profits based on relative contributions",
      whenToUse: [
        "Unique intangibles on both sides",
        "Highly integrated operations",
        "Shared risks and contributions",
        "No reliable one-sided comparables",
      ],
      dataRequired: [
        "Combined profits of all parties",
        "Contribution analysis",
        "Asset and function allocation",
      ],
      variants: {
        contribution: "Based on relative value of contributions",
        residual: "Routine returns + residual split",
      },
      strengths: [
        "Appropriate for unique transactions",
        "Considers both parties' contributions",
        "Flexible allocation mechanisms",
      ],
      weaknesses: [
        "Complex implementation",
        "Requires detailed information from all parties",
        "Subjective allocation of residual profits",
      ],
    },
  };

  return details[method.toUpperCase()];
}

function getDocumentationRequirements(method: string): string[] {
  const requirements: Record<string, string[]> = {
    CUP: [
      "Comparable transaction analysis",
      "Comparability adjustments worksheet",
      "Price variation analysis",
      "Market condition analysis",
    ],
    RPM: [
      "Gross margin computation",
      "Comparable distributor analysis",
      "Functional analysis of distribution",
      "Value addition analysis",
    ],
    CPM: [
      "Cost base determination",
      "Cost allocation methodology",
      "Comparable cost-plus margins",
      "Consistency of cost accounting",
    ],
    TNMM: [
      "PLI selection rationale",
      "Comparable company search process",
      "Rejection matrix",
      "Working capital adjustments",
      "Multi-year analysis",
    ],
    PSM: [
      "Combined profit calculation",
      "Contribution analysis",
      "Allocation key determination",
      "Routine vs residual profit split",
    ],
    OTHER: [
      "Justification for using other method",
      "Rejection of prescribed methods",
      "Methodology description",
      "Basis for arm's length determination",
    ],
  };

  return requirements[method] || requirements["TNMM"];
}
