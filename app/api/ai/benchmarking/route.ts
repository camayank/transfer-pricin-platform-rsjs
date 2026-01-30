import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createBenchmarkingAIService, WorkingCapitalData } from "@/lib/engines/benchmarking-ai";
import {
  ComparableCompany,
  ScreeningCriteria,
  DatabaseSource,
  FinancialData,
  PLIType,
  BenchmarkingResult,
} from "@/lib/engines/benchmarking-engine";

// =============================================================================
// BENCHMARKING AI API
// Exposes AI-powered features for transfer pricing benchmarking analysis
// =============================================================================

interface WorkingCapitalAdjustmentRequest {
  testedPartyName: string;
  financialYear: string;
  revenue: number;
  receivables: number;
  inventory: number;
  payables: number;
  comparableFinancials: {
    companyName: string;
    revenue: number;
    receivables: number;
    inventory: number;
    payables: number;
  }[];
  interestRate?: number;
  rateBasis?: string;
}

interface ComparableRejectionRequest {
  companyName: string;
  companyCIN: string;
  industry: string;
  nicCode: string;
  rejectionReasons: string[];
  financialData?: {
    revenue: number;
    operatingMargin: number;
    relatedPartyTransactions?: number;
    employees?: number;
  };
  testedPartyIndustry: string;
  testedPartyFunctions: string[];
  testedPartyRevenue: number;
}

interface ArmLengthConclusionRequest {
  transactionType: string;
  testedPartyName: string;
  testedPartyMargin: number;
  pliType: string;
  financialYears: string[];
  benchmarkRange: {
    lowerQuartile: number;
    median: number;
    upperQuartile: number;
    arithmeticMean: number;
  };
  comparableMargins: { name: string; margin: number }[];
  assessmentYear: string;
}

interface EnhancedBenchmarkingRequest {
  transactionType: string;
  testedPartyName: string;
  testedPartyFinancials: {
    year: string;
    totalRevenue: number;
    operatingRevenue: number;
    totalOperatingCost: number;
    operatingProfit: number;
    receivables?: number;
    inventory?: number;
    payables?: number;
  }[];
  pliType: string;
  searchCriteria: {
    nicCodes: string[];
    industryKeywords?: string[];
    minTurnover?: number;
    maxTurnover?: number;
    maxRptPercentage?: number;
    analysisYears: string[];
  };
  workingCapitalData?: {
    testedPartyName: string;
    financialYear: string;
    revenue: number;
    receivables: number;
    inventory: number;
    payables: number;
    comparableFinancials: {
      companyName: string;
      revenue: number;
      receivables: number;
      inventory: number;
      payables: number;
    }[];
    interestRate?: number;
  };
}

// GET /api/ai/benchmarking - Get available AI capabilities
export async function GET() {
  return NextResponse.json({
    service: "Benchmarking AI Service",
    version: "1.0.0",
    capabilities: [
      {
        endpoint: "POST /api/ai/benchmarking",
        action: "working-capital-adjustment",
        description: "Calculate and explain working capital adjustments for comparables",
        requiredFields: ["testedPartyName", "financialYear", "revenue", "receivables", "inventory", "payables", "comparableFinancials"],
        valueAdd: "Automates complex WC adjustment calculations with detailed explanations",
      },
      {
        endpoint: "POST /api/ai/benchmarking",
        action: "comparable-rejection",
        description: "Generate detailed rejection narrative for excluded comparables",
        requiredFields: ["companyName", "industry", "rejectionReasons"],
        valueAdd: "Defensible rejection rationales for TP documentation",
      },
      {
        endpoint: "POST /api/ai/benchmarking",
        action: "arm-length-conclusion",
        description: "Generate arm's length conclusion narrative for TP report",
        requiredFields: ["transactionType", "testedParty", "benchmarkRange", "comparablesCount"],
        valueAdd: "Professional conclusion narrative ready for TP documentation",
      },
      {
        endpoint: "POST /api/ai/benchmarking",
        action: "enhanced-analysis",
        description: "Perform comprehensive AI-enhanced benchmarking analysis",
        requiredFields: ["transactionType", "testedParty", "comparables", "method", "pli"],
        valueAdd: "Complete benchmarking analysis with adjustments and conclusions",
      },
    ],
    examples: {
      "working-capital-adjustment": {
        action: "working-capital-adjustment",
        testedPartyName: "ABC India Pvt Ltd",
        financialYear: "2024-25",
        revenue: 100000000,
        receivables: 12328767,
        inventory: 16438356,
        payables: 8219178,
        comparableFinancials: [
          {
            companyName: "Comparable 1",
            revenue: 80000000,
            receivables: 13150685,
            inventory: 6575342,
            payables: 9863014,
          },
        ],
        interestRate: 10.5,
        rateBasis: "SBI PLR",
      },
    },
  });
}

// POST /api/ai/benchmarking - Execute AI operations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required. Valid actions: working-capital-adjustment, comparable-rejection, arm-length-conclusion, enhanced-analysis" },
        { status: 400 }
      );
    }

    const aiService = createBenchmarkingAIService();

    switch (action) {
      case "working-capital-adjustment": {
        const data = body as WorkingCapitalAdjustmentRequest & { action: string };

        if (!data.testedPartyName || !data.revenue || !data.comparableFinancials) {
          return NextResponse.json(
            { error: "Missing required fields: testedPartyName, revenue, receivables, inventory, payables, comparableFinancials" },
            { status: 400 }
          );
        }

        const wcData: WorkingCapitalData = {
          testedPartyName: data.testedPartyName,
          financialYear: data.financialYear || "2024-25",
          revenue: data.revenue,
          receivables: data.receivables || 0,
          inventory: data.inventory || 0,
          payables: data.payables || 0,
          comparableFinancials: data.comparableFinancials,
          interestRate: data.interestRate,
          rateBasis: data.rateBasis,
        };

        const result = await aiService.generateWorkingCapitalAdjustment(wcData);

        return NextResponse.json({
          success: true,
          action: "working-capital-adjustment",
          result: {
            ...result,
            metadata: {
              comparablesCount: data.comparableFinancials.length,
              interestRateUsed: data.interestRate || 10.5,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      case "comparable-rejection": {
        const data = body as ComparableRejectionRequest & { action: string };

        if (!data.companyName || !data.industry || !data.rejectionReasons || !data.testedPartyIndustry) {
          return NextResponse.json(
            { error: "Missing required fields: companyName, companyCIN, industry, rejectionReasons, testedPartyIndustry, testedPartyFunctions, testedPartyRevenue" },
            { status: 400 }
          );
        }

        // Map string reasons to ScreeningCriteria enum
        const screeningCriteriaMap: Record<string, ScreeningCriteria> = {
          "rpt": ScreeningCriteria.RELATED_PARTY_TRANSACTIONS,
          "related_party": ScreeningCriteria.RELATED_PARTY_TRANSACTIONS,
          "losses": ScreeningCriteria.PERSISTENT_LOSSES,
          "persistent_losses": ScreeningCriteria.PERSISTENT_LOSSES,
          "functional": ScreeningCriteria.FUNCTIONAL_DISSIMILARITY,
          "functional_dissimilarity": ScreeningCriteria.FUNCTIONAL_DISSIMILARITY,
          "accounting_year": ScreeningCriteria.DIFFERENT_ACCOUNTING_YEAR,
          "extraordinary": ScreeningCriteria.EXTRAORDINARY_EVENTS,
          "data_na": ScreeningCriteria.DATA_NON_AVAILABILITY,
          "data_non_availability": ScreeningCriteria.DATA_NON_AVAILABILITY,
          "industry": ScreeningCriteria.DIFFERENT_INDUSTRY,
          "different_industry": ScreeningCriteria.DIFFERENT_INDUSTRY,
          "employee": ScreeningCriteria.EMPLOYEE_COUNT_FILTER,
          "turnover": ScreeningCriteria.TURNOVER_FILTER,
          "export": ScreeningCriteria.EXPORT_INTENSITY,
        };

        const mappedReasons = data.rejectionReasons.map(
          (r) => screeningCriteriaMap[r.toLowerCase()] || ScreeningCriteria.FUNCTIONAL_DISSIMILARITY
        );

        // Build minimal FinancialData for the company
        const currentYear = new Date().getFullYear().toString();
        const financialData: FinancialData = {
          year: currentYear,
          totalRevenue: data.financialData?.revenue || 0,
          operatingRevenue: data.financialData?.revenue || 0,
          exportRevenue: 0,
          totalOperatingCost: data.financialData?.revenue ? data.financialData.revenue * (1 - (data.financialData.operatingMargin || 0) / 100) : 0,
          employeeCost: 0,
          rawMaterialCost: 0,
          otherExpenses: 0,
          depreciation: 0,
          grossProfit: 0,
          operatingProfit: data.financialData?.revenue && data.financialData?.operatingMargin
            ? data.financialData.revenue * (data.financialData.operatingMargin / 100)
            : 0,
          pbt: 0,
          pat: 0,
          totalAssets: 0,
          fixedAssets: 0,
          currentAssets: 0,
          capitalEmployed: 0,
          netWorth: 0,
          employeeCount: data.financialData?.employees || 0,
          relatedPartyTransactions: data.financialData?.relatedPartyTransactions || 0,
          rptAsPercentage: data.financialData?.revenue
            ? ((data.financialData.relatedPartyTransactions || 0) / data.financialData.revenue) * 100
            : 0,
        };

        // Build minimal ComparableCompany
        const company: ComparableCompany = {
          cin: data.companyCIN || "UNKNOWN",
          name: data.companyName,
          nicCode: data.nicCode || "62",
          nicDescription: data.industry,
          databaseSource: DatabaseSource.MANUAL,
          registeredAddress: "",
          city: "",
          state: "",
          financials: { [currentYear]: financialData },
          isAccepted: false,
          rejectionReasons: mappedReasons,
          rejectionNotes: "",
          plis: { [currentYear]: { [PLIType.OP_OC]: data.financialData?.operatingMargin || 0 } },
          weightedAveragePLI: { [PLIType.OP_OC]: data.financialData?.operatingMargin || 0 },
        };

        const result = await aiService.generateComparableRejection(
          company,
          data.testedPartyIndustry,
          data.testedPartyFunctions || [],
          data.testedPartyRevenue || 0
        );

        return NextResponse.json({
          success: true,
          action: "comparable-rejection",
          result: {
            ...result,
            metadata: {
              companyName: data.companyName,
              reasonsCount: data.rejectionReasons.length,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      case "arm-length-conclusion": {
        const data = body as ArmLengthConclusionRequest & { action: string };

        if (!data.testedPartyName || !data.benchmarkRange || data.testedPartyMargin === undefined) {
          return NextResponse.json(
            { error: "Missing required fields: testedPartyName, testedPartyMargin, pliType, benchmarkRange" },
            { status: 400 }
          );
        }

        // Map PLI type string to enum
        const pliTypeMap: Record<string, PLIType> = {
          "OP/OC": PLIType.OP_OC,
          "OP/OR": PLIType.OP_OR,
          "OP/TA": PLIType.OP_TA,
          "OP/CE": PLIType.OP_CE,
          "BERRY_RATIO": PLIType.BERRY_RATIO,
          "BERRY": PLIType.BERRY_RATIO,
          "NCP_SALES": PLIType.NCP_SALES,
          "ROCE": PLIType.OP_CE,
          "ROA": PLIType.OP_TA,
        };
        const pliType = pliTypeMap[data.pliType?.toUpperCase()] || PLIType.OP_OC;

        const testedMargin = data.testedPartyMargin;
        const isWithinRange =
          testedMargin >= data.benchmarkRange.lowerQuartile &&
          testedMargin <= data.benchmarkRange.upperQuartile;

        // Build minimal ComparableCompany objects from margins
        const acceptedCompanies: ComparableCompany[] = (data.comparableMargins || []).map((c, idx) => ({
          cin: `COMP${idx}`,
          name: c.name,
          nicCode: "62",
          nicDescription: "Software services",
          databaseSource: DatabaseSource.MANUAL,
          registeredAddress: "",
          city: "",
          state: "",
          financials: {},
          isAccepted: true,
          rejectionReasons: [],
          rejectionNotes: "",
          plis: {},
          weightedAveragePLI: { [pliType]: c.margin },
        }));

        // Build minimal BenchmarkingResult
        const benchmarkResult: BenchmarkingResult = {
          testedPartyName: data.testedPartyName,
          testedPartyPLI: { [data.financialYears?.[0] || "2024-25"]: testedMargin },
          pliType,
          analysisYears: data.financialYears || ["2024-25"],
          comparablesSearched: acceptedCompanies.length,
          comparablesAccepted: acceptedCompanies.length,
          acceptedCompanies,
          rejectedCompanies: [],
          arithmeticMean: data.benchmarkRange.arithmeticMean,
          median: data.benchmarkRange.median,
          lowerQuartile: data.benchmarkRange.lowerQuartile,
          upperQuartile: data.benchmarkRange.upperQuartile,
          minimum: data.benchmarkRange.lowerQuartile,
          maximum: data.benchmarkRange.upperQuartile,
          testedPartyInRange: isWithinRange,
          adjustmentRequired: !isWithinRange,
          adjustmentAmount: isWithinRange ? 0 : Math.abs(testedMargin - data.benchmarkRange.median),
          adjustmentDirection: isWithinRange
            ? ""
            : testedMargin < data.benchmarkRange.median
              ? "increase"
              : "decrease",
        };

        const result = await aiService.generateArmLengthConclusion(benchmarkResult);

        return NextResponse.json({
          success: true,
          action: "arm-length-conclusion",
          result: {
            ...result,
            metadata: {
              transactionType: data.transactionType,
              isWithinRange,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      case "enhanced-analysis": {
        const data = body as EnhancedBenchmarkingRequest & { action: string };

        if (!data.testedPartyName || !data.testedPartyFinancials || !data.searchCriteria) {
          return NextResponse.json(
            { error: "Missing required fields: testedPartyName, testedPartyFinancials, pliType, searchCriteria" },
            { status: 400 }
          );
        }

        // Map PLI type string to enum
        const pliTypeMap: Record<string, PLIType> = {
          "OP/OC": PLIType.OP_OC,
          "OP/OR": PLIType.OP_OR,
          "OP/TA": PLIType.OP_TA,
          "OP/CE": PLIType.OP_CE,
          "BERRY_RATIO": PLIType.BERRY_RATIO,
          "BERRY": PLIType.BERRY_RATIO,
          "NCP_SALES": PLIType.NCP_SALES,
          "ROCE": PLIType.OP_CE,
          "ROA": PLIType.OP_TA,
        };
        const pliType = pliTypeMap[data.pliType?.toUpperCase()] || PLIType.OP_OC;

        // Convert financials array to Record<string, FinancialData>
        const testedPartyFinancials: Record<string, FinancialData> = {};
        for (const fin of data.testedPartyFinancials) {
          testedPartyFinancials[fin.year] = {
            year: fin.year,
            totalRevenue: fin.totalRevenue,
            operatingRevenue: fin.operatingRevenue,
            exportRevenue: 0,
            totalOperatingCost: fin.totalOperatingCost,
            employeeCost: 0,
            rawMaterialCost: 0,
            otherExpenses: 0,
            depreciation: 0,
            grossProfit: fin.totalRevenue - fin.totalOperatingCost,
            operatingProfit: fin.operatingProfit,
            pbt: fin.operatingProfit,
            pat: fin.operatingProfit * 0.75,
            totalAssets: fin.totalRevenue,
            fixedAssets: fin.totalRevenue * 0.3,
            currentAssets: fin.totalRevenue * 0.7,
            capitalEmployed: fin.totalRevenue * 0.5,
            netWorth: fin.totalRevenue * 0.4,
            employeeCount: 0,
            relatedPartyTransactions: 0,
            rptAsPercentage: 0,
          };
        }

        // Build SearchCriteria
        const searchCriteria = {
          nicCodes: data.searchCriteria.nicCodes || [],
          industryKeywords: data.searchCriteria.industryKeywords || [],
          functionalProfiles: [],
          minTurnover: data.searchCriteria.minTurnover,
          maxTurnover: data.searchCriteria.maxTurnover,
          excludePersistentLosses: true,
          lossYearsThreshold: 2,
          maxRptPercentage: data.searchCriteria.maxRptPercentage || 25,
          analysisYears: data.searchCriteria.analysisYears || ["2024-25"],
          preferredDatabases: [DatabaseSource.CAPITALINE_TP],
        };

        // Build working capital data if provided
        let wcData: WorkingCapitalData | undefined;
        if (data.workingCapitalData) {
          wcData = {
            testedPartyName: data.workingCapitalData.testedPartyName,
            financialYear: data.workingCapitalData.financialYear,
            revenue: data.workingCapitalData.revenue,
            receivables: data.workingCapitalData.receivables,
            inventory: data.workingCapitalData.inventory,
            payables: data.workingCapitalData.payables,
            comparableFinancials: data.workingCapitalData.comparableFinancials,
            interestRate: data.workingCapitalData.interestRate,
          };
        }

        const result = await aiService.performEnhancedBenchmarking(
          data.testedPartyName,
          testedPartyFinancials,
          pliType,
          searchCriteria,
          wcData
        );

        return NextResponse.json({
          success: true,
          action: "enhanced-analysis",
          result: {
            ...result,
            metadata: {
              pliType: data.pliType,
              analysisYears: data.searchCriteria.analysisYears,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: working-capital-adjustment, comparable-rejection, arm-length-conclusion, enhanced-analysis` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in Benchmarking AI API:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
