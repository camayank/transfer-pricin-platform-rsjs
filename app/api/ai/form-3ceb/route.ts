import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createForm3CEBAIService } from "@/lib/engines/form-3ceb-ai";
import { TPMethod } from "@/lib/engines";
import { TransactionNature, RelationshipType } from "@/lib/engines/form-3ceb-engine";

// =============================================================================
// FORM 3CEB AI API
// Exposes AI-powered features for Form 3CEB preparation
// =============================================================================

interface TransactionDescriptionRequest {
  serialNumber: number;
  natureCode: string;
  indianEntity: string;
  aeName: string;
  aeCountry: string;
  relationship: string;
  transactionValue: number;
  transactionCurrency?: string;
  methodApplied: string;
  agreementDate?: string;
  pricingMechanism?: string;
  additionalContext?: string;
}

interface MethodJustificationRequest {
  transactionType: string;
  natureCode: string;
  transactionDescription: string;
  transactionValue: number;
  testedParty: string;
  characterization: string;
  functions: string;
  assets: string;
  risks: string;
  selectedMethod: string;
  selectedPLI?: string;
  internalCUPAvailable?: boolean;
  externalCUPAvailable?: boolean;
  comparablesAvailable?: boolean;
}

interface ComparableSearchRequest {
  transactionType: string;
  industry: string;
  functionalProfile: string;
  searchCriteria: {
    revenueRange?: { min: number; max: number };
    profitabilityRange?: { min: number; max: number };
    geographicScope?: string[];
  };
  rejectedCompanies?: {
    name: string;
    reason: string;
  }[];
}

// GET /api/ai/form-3ceb - Get available AI capabilities
export async function GET() {
  return NextResponse.json({
    service: "Form 3CEB AI Service",
    version: "1.0.0",
    capabilities: [
      {
        endpoint: "POST /api/ai/form-3ceb",
        action: "transaction-description",
        description: "Generate AI-powered transaction description for Form 3CEB",
        requiredFields: ["natureCode", "indianEntity", "aeName", "aeCountry", "transactionValue", "methodApplied"],
      },
      {
        endpoint: "POST /api/ai/form-3ceb",
        action: "method-justification",
        description: "Generate transfer pricing method justification narrative",
        requiredFields: ["transactionType", "natureCode", "transactionDescription", "transactionValue", "testedParty", "selectedMethod"],
      },
      {
        endpoint: "POST /api/ai/form-3ceb",
        action: "comparable-search-narrative",
        description: "Generate narrative for comparable search process and selection",
        requiredFields: ["transactionType", "industry", "functionalProfile", "searchCriteria"],
      },
    ],
    examples: {
      "transaction-description": {
        action: "transaction-description",
        serialNumber: 1,
        natureCode: "21",
        indianEntity: "ABC India Pvt Ltd",
        aeName: "Parent Corp USA",
        aeCountry: "USA",
        relationship: "subsidiary",
        transactionValue: 50000000,
        transactionCurrency: "INR",
        methodApplied: "TNMM",
        currency: "INR",
      },
    },
  });
}

// POST /api/ai/form-3ceb - Execute AI operations
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
        { error: "Action is required. Valid actions: transaction-description, method-justification, validate-with-suggestions, comparable-search-narrative" },
        { status: 400 }
      );
    }

    const aiService = createForm3CEBAIService();

    switch (action) {
      case "transaction-description": {
        const data = body as TransactionDescriptionRequest & { action: string };

        if (!data.natureCode || !data.indianEntity || !data.aeName || !data.transactionValue || !data.methodApplied) {
          return NextResponse.json(
            { error: "Missing required fields: natureCode, indianEntity, aeName, transactionValue, methodApplied" },
            { status: 400 }
          );
        }

        // Map relationship string to enum
        const relationshipMap: Record<string, RelationshipType> = {
          "01": RelationshipType.HOLDING_COMPANY,
          "02": RelationshipType.SUBSIDIARY,
          "03": RelationshipType.FELLOW_SUBSIDIARY,
          "04": RelationshipType.JOINT_VENTURE,
          "05": RelationshipType.COMMON_CONTROL,
          "99": RelationshipType.OTHER,
          "holding": RelationshipType.HOLDING_COMPANY,
          "subsidiary": RelationshipType.SUBSIDIARY,
          "fellow_subsidiary": RelationshipType.FELLOW_SUBSIDIARY,
          "joint_venture": RelationshipType.JOINT_VENTURE,
          "common_control": RelationshipType.COMMON_CONTROL,
        };

        const description = await aiService.generateTransactionDescription({
          serialNumber: data.serialNumber || 1,
          natureCode: data.natureCode as TransactionNature,
          indianEntity: data.indianEntity,
          aeName: data.aeName,
          aeCountry: data.aeCountry || "Unknown",
          relationship: relationshipMap[data.relationship?.toLowerCase()] || RelationshipType.OTHER,
          transactionValue: data.transactionValue,
          transactionCurrency: data.transactionCurrency,
          methodApplied: data.methodApplied as TPMethod,
          agreementDate: data.agreementDate,
          pricingMechanism: data.pricingMechanism,
          additionalContext: data.additionalContext,
        });

        return NextResponse.json({
          success: true,
          action: "transaction-description",
          result: {
            description,
            metadata: {
              natureCode: data.natureCode,
              aeCountry: data.aeCountry,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      case "method-justification": {
        const data = body as MethodJustificationRequest & { action: string };

        if (!data.transactionType || !data.selectedMethod || !data.testedParty) {
          return NextResponse.json(
            { error: "Missing required fields: transactionType, natureCode, transactionDescription, transactionValue, testedParty, characterization, functions, assets, risks, selectedMethod" },
            { status: 400 }
          );
        }

        const justification = await aiService.generateMethodJustification({
          transactionType: data.transactionType,
          natureCode: (data.natureCode || "21") as TransactionNature,
          transactionDescription: data.transactionDescription || `${data.transactionType} with associated enterprise`,
          transactionValue: data.transactionValue || 0,
          testedParty: data.testedParty,
          characterization: data.characterization || "Service provider",
          functions: data.functions || "Provision of services",
          assets: data.assets || "Human resources, technical know-how",
          risks: data.risks || "Credit risk, performance risk",
          selectedMethod: data.selectedMethod as TPMethod,
          selectedPLI: data.selectedPLI,
          internalCUPAvailable: data.internalCUPAvailable,
          externalCUPAvailable: data.externalCUPAvailable,
          comparablesAvailable: data.comparablesAvailable,
        });

        return NextResponse.json({
          success: true,
          action: "method-justification",
          result: {
            justification,
            method: data.selectedMethod,
            metadata: {
              transactionType: data.transactionType,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      case "comparable-search-narrative": {
        const data = body as ComparableSearchRequest & { action: string };

        if (!data.transactionType || !data.industry || !data.functionalProfile) {
          return NextResponse.json(
            { error: "Missing required fields: transactionType, testedParty, industry, nicCode, searchDatabase, searchDate" },
            { status: 400 }
          );
        }

        const narrative = await aiService.generateComparableSearchNarrative({
          transactionType: data.transactionType,
          testedParty: data.functionalProfile,
          industry: data.industry,
          nicCode: "62",
          searchDatabase: "Capitaline TP",
          searchDate: new Date().toISOString().split("T")[0],
          quantitativeScreens: [
            "Revenue filter: INR " + (data.searchCriteria?.revenueRange?.min || 0) / 10000000 + " Cr to " + (data.searchCriteria?.revenueRange?.max || 1000) / 10000000 + " Cr",
            "RPT filter: < 25%",
            "Persistent losses exclusion",
          ],
          qualitativeScreens: [
            "Functional comparability assessment",
            "Industry alignment verification",
            "Geographic market consideration",
          ],
          companiesFound: 50,
          companiesRejected: data.rejectedCompanies?.length || 35,
          finalComparables: 15 - (data.rejectedCompanies?.length || 0),
        });

        return NextResponse.json({
          success: true,
          action: "comparable-search-narrative",
          result: {
            narrative,
            metadata: {
              industry: data.industry,
              rejectedCount: data.rejectedCompanies?.length || 0,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: transaction-description, method-justification, comparable-search-narrative` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in Form 3CEB AI API:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
