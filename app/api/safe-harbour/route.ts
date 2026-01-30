import { NextRequest, NextResponse } from "next/server";
import { checkPermission, PermissionAction } from "@/lib/api/permissions";
import {
  SafeHarbourCalculator,
  TransactionType,
  CreditRating,
  Currency,
  SAFE_HARBOUR_RULES,
} from "@/lib/engines";

// POST /api/safe-harbour - Calculate Safe Harbour eligibility
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
    if (!authorized) return error;

    const body = await request.json();

    const {
      transactionType,
      assessmentYear = "2025-26",
      operatingCost,
      operatingRevenue,
      operatingProfit,
      employeeCost,
      totalCost,
      transactionValue,
      loanAmount,
      creditRating,
      loanCurrency = "INR",
      guaranteeAmount,
    } = body;

    // Validate required fields
    if (!transactionType) {
      return NextResponse.json(
        { error: "Transaction type is required" },
        { status: 400 }
      );
    }

    // Map transaction type string to enum (new simplified names)
    const txnTypeMap: Record<string, TransactionType> = {
      // IT/ITeS
      IT_ITES: TransactionType.IT_ITES,
      IT_ITES_SERVICES: TransactionType.IT_ITES,
      it_ites: TransactionType.IT_ITES,
      // KPO
      KPO: TransactionType.KPO,
      KPO_SERVICES: TransactionType.KPO,
      kpo: TransactionType.KPO,
      // Contract R&D Software
      CONTRACT_RD: TransactionType.CONTRACT_RD_SOFTWARE,
      CONTRACT_RD_SOFTWARE: TransactionType.CONTRACT_RD_SOFTWARE,
      contract_rd_software: TransactionType.CONTRACT_RD_SOFTWARE,
      // Contract R&D Pharma
      CONTRACT_RD_PHARMA: TransactionType.CONTRACT_RD_PHARMA,
      CONTRACT_RD_GENERIC: TransactionType.CONTRACT_RD_PHARMA,
      contract_rd_pharma: TransactionType.CONTRACT_RD_PHARMA,
      // Auto Ancillary
      AUTO_ANCILLARY: TransactionType.AUTO_ANCILLARY,
      AUTO_ANCILLARY_MANUFACTURING: TransactionType.AUTO_ANCILLARY,
      auto_ancillary: TransactionType.AUTO_ANCILLARY,
      // Loan FC
      INTRA_GROUP_LOAN_FC: TransactionType.LOAN_FOREIGN_CURRENCY,
      LOAN_FOREIGN_CURRENCY: TransactionType.LOAN_FOREIGN_CURRENCY,
      INTRA_GROUP_LOAN_GIVEN_FC: TransactionType.LOAN_FOREIGN_CURRENCY,
      loan_foreign_currency: TransactionType.LOAN_FOREIGN_CURRENCY,
      // Loan INR
      INTRA_GROUP_LOAN: TransactionType.LOAN_INR,
      INTRA_GROUP_LOAN_INR: TransactionType.LOAN_INR,
      INTRA_GROUP_LOAN_GIVEN_INR: TransactionType.LOAN_INR,
      LOAN_INR: TransactionType.LOAN_INR,
      loan_inr: TransactionType.LOAN_INR,
      // Corporate Guarantee
      CORPORATE_GUARANTEE: TransactionType.CORPORATE_GUARANTEE,
      corporate_guarantee: TransactionType.CORPORATE_GUARANTEE,
    };

    const mappedTransactionType = txnTypeMap[transactionType] || transactionType;

    // Map credit rating
    const creditRatingMap: Record<string, CreditRating> = {
      AAA: CreditRating.AAA,
      AA: CreditRating.AA,
      A: CreditRating.A,
      BBB: CreditRating.BBB,
      BB: CreditRating.BB,
      B: CreditRating.B,
      C: CreditRating.C,
      D: CreditRating.D,
      C_AND_BELOW: CreditRating.C,
    };

    // Map currency
    const currencyMap: Record<string, Currency> = {
      INR: Currency.INR,
      USD: Currency.USD,
      EUR: Currency.EUR,
      GBP: Currency.GBP,
      JPY: Currency.JPY,
    };

    // Create calculator
    const calculator = new SafeHarbourCalculator(assessmentYear);

    // Prepare financial data
    const financialData = {
      assessmentYear,
      totalRevenue: operatingRevenue || 0,
      operatingRevenue: operatingRevenue || 0,
      totalOperatingCost: operatingCost || totalCost || 0,
      employeeCost: employeeCost || 0,
      transactionValue: transactionValue || operatingRevenue || 0,
      loanAmount: loanAmount || 0,
      creditRating: creditRating ? creditRatingMap[creditRating] : undefined,
      loanCurrency: currencyMap[loanCurrency] || Currency.INR,
      guaranteeAmount: guaranteeAmount || 0,
    };

    // Calculate eligibility
    const result = calculator.calculateEligibility(
      mappedTransactionType as TransactionType,
      financialData
    );

    // Get rule description safely
    const rule = SAFE_HARBOUR_RULES[mappedTransactionType as keyof typeof SAFE_HARBOUR_RULES];
    const ruleDescription = rule?.description || rule?.name || "Unknown";

    // Format response with backward compatibility
    const response = {
      result: {
        eligible: result.isEligible,
        meetsSafeHarbour: result.meetsSafeHarbour,
        rule: ruleDescription,
        requiredMargin: result.requiredMargin || result.requiredInterestRate || result.requiredGuaranteeCommission,
        actualMargin: result.actualMargin,
        marginType: result.requiredInterestRate ? "Interest Rate" :
                    result.requiredGuaranteeCommission ? "Commission Rate" : "OP/OC",
        compliance: result.meetsSafeHarbour ? "compliant" : "non_compliant",
        explanation: result.complianceDetails,
        recommendation: result.recommendation,
        recommendations: result.meetsSafeHarbour
          ? [
              "Maintain contemporaneous documentation",
              "Ensure all conditions under Rule 10TD are satisfied",
              "File Form 3CEFA within due date",
            ]
          : [
              "Prepare comprehensive benchmarking study",
              "Consider adjusting intercompany pricing",
              "Document functional analysis thoroughly",
              "Maintain supporting evidence for pricing",
            ],
        conditions: result.conditions,
        form3cefaData: result.form3cefaData,
        marginGap: result.marginGap,
        thresholdDetails: result.thresholdDetails,
        eligibilityReason: result.eligibilityReason,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error calculating safe harbour:", error);
    return NextResponse.json(
      { error: "Failed to calculate safe harbour" },
      { status: 500 }
    );
  }
}

// GET /api/safe-harbour/rules - Get all Safe Harbour rules
export async function GET() {
  // Check authentication and permission
  const { authorized, error } = await checkPermission("tools", PermissionAction.READ);
  if (!authorized) return error;

  // Format rules for display
  const formattedRules: Record<string, unknown> = {};

  for (const [key, rule] of Object.entries(SAFE_HARBOUR_RULES)) {
    formattedRules[key] = {
      name: rule.name,
      description: rule.description,
      section: rule.section,
      marginType: rule.marginType,
      thresholds: rule.thresholds?.map((t) => ({
        condition: t.condition,
        margin: t.margin || null,
        spread: t.spread || null,
        rate: t.rate || null,
      })) || [],
      maxTransactionValue: rule.maxTransactionValue,
      eligibilityConditions: rule.eligibilityConditions,
      validFrom: rule.validFrom,
      validTo: rule.validTo,
      notes: rule.notes,
    };
  }

  return NextResponse.json({ rules: formattedRules });
}
