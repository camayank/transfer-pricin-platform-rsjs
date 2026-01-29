import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// Transaction Nature Codes as per Income Tax Rules
const TRANSACTION_NATURE_CODES = {
  "01": "Purchase of raw materials",
  "02": "Sale of raw materials",
  "03": "Purchase of finished goods",
  "04": "Sale of finished goods",
  "05": "Purchase of capital goods",
  "06": "Sale of capital goods",
  "07": "Purchase of traded goods",
  "08": "Sale of traded goods",
  "09": "Purchase of fixed assets",
  "10": "Sale of fixed assets",
  "11": "Rent received",
  "12": "Rent paid",
  "13": "Provision of services",
  "14": "Receipt of services",
  "15": "Royalty paid",
  "16": "Royalty received",
  "17": "Interest paid",
  "18": "Interest received",
  "19": "Corporate guarantee given",
  "20": "Corporate guarantee received",
  "21": "Reimbursement of expenses paid",
  "22": "Reimbursement of expenses received",
  "99": "Any other transaction",
};

const TP_METHODS = {
  CUP: "Comparable Uncontrolled Price Method",
  RPM: "Resale Price Method",
  CPM: "Cost Plus Method",
  PSM: "Profit Split Method",
  TNMM: "Transactional Net Margin Method",
  OTHER: "Any Other Method",
};

interface AssociatedEnterprise {
  name: string;
  address: string;
  country: string;
  pan?: string;
  relationship: string;
  description?: string;
}

interface InternationalTransaction {
  id: string;
  aeId: string;
  natureCode: string;
  description: string;
  amount: number;
  currency: string;
  method: string;
  armLengthPrice?: number;
  adjustmentMade?: number;
}

interface Form3CEBData {
  assesseeDetails: {
    name: string;
    pan: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    financialYear: string;
    assessmentYear: string;
    nicCode: string;
    nicDescription: string;
  };
  associatedEnterprises: AssociatedEnterprise[];
  internationalTransactions: InternationalTransaction[];
  caDetails: {
    name: string;
    membershipNo: string;
    firmRegNo?: string;
    address: string;
    udin?: string;
    date: string;
  };
}

interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

function validateForm3CEB(data: Form3CEBData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate Assessee Details
  if (!data.assesseeDetails?.name) {
    errors.push({ field: "assesseeDetails.name", message: "Assessee name is required", severity: "error" });
  }

  if (!data.assesseeDetails?.pan) {
    errors.push({ field: "assesseeDetails.pan", message: "PAN is required", severity: "error" });
  } else {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(data.assesseeDetails.pan)) {
      errors.push({ field: "assesseeDetails.pan", message: "Invalid PAN format", severity: "error" });
    }
  }

  if (!data.assesseeDetails?.financialYear) {
    errors.push({ field: "assesseeDetails.financialYear", message: "Financial year is required", severity: "error" });
  }

  // Validate Associated Enterprises
  if (!data.associatedEnterprises || data.associatedEnterprises.length === 0) {
    errors.push({ field: "associatedEnterprises", message: "At least one associated enterprise is required", severity: "error" });
  } else {
    data.associatedEnterprises.forEach((ae, idx) => {
      if (!ae.name) {
        errors.push({ field: `associatedEnterprises[${idx}].name`, message: `AE ${idx + 1}: Name is required`, severity: "error" });
      }
      if (!ae.country) {
        errors.push({ field: `associatedEnterprises[${idx}].country`, message: `AE ${idx + 1}: Country is required`, severity: "error" });
      }
      if (!ae.relationship) {
        errors.push({ field: `associatedEnterprises[${idx}].relationship`, message: `AE ${idx + 1}: Relationship is required`, severity: "error" });
      }
    });
  }

  // Validate International Transactions
  if (!data.internationalTransactions || data.internationalTransactions.length === 0) {
    errors.push({ field: "internationalTransactions", message: "At least one international transaction is required", severity: "error" });
  } else {
    data.internationalTransactions.forEach((txn, idx) => {
      if (!txn.natureCode) {
        errors.push({ field: `internationalTransactions[${idx}].natureCode`, message: `Transaction ${idx + 1}: Nature code is required`, severity: "error" });
      }
      if (!txn.amount || txn.amount <= 0) {
        errors.push({ field: `internationalTransactions[${idx}].amount`, message: `Transaction ${idx + 1}: Valid amount is required`, severity: "error" });
      }
      if (!txn.method) {
        errors.push({ field: `internationalTransactions[${idx}].method`, message: `Transaction ${idx + 1}: TP method is required`, severity: "error" });
      }
      if (!txn.aeId) {
        errors.push({ field: `internationalTransactions[${idx}].aeId`, message: `Transaction ${idx + 1}: Associated enterprise is required`, severity: "error" });
      }
    });
  }

  // Validate CA Details
  if (!data.caDetails?.name) {
    errors.push({ field: "caDetails.name", message: "CA name is required", severity: "error" });
  }
  if (!data.caDetails?.membershipNo) {
    errors.push({ field: "caDetails.membershipNo", message: "CA membership number is required", severity: "error" });
  }
  if (!data.caDetails?.udin) {
    errors.push({ field: "caDetails.udin", message: "UDIN is required for certification", severity: "warning" });
  } else {
    // UDIN format: 18 digit alphanumeric starting with membership number
    const udinRegex = /^[0-9]{6}[A-Z]{12}$/;
    if (!udinRegex.test(data.caDetails.udin)) {
      errors.push({ field: "caDetails.udin", message: "Invalid UDIN format", severity: "warning" });
    }
  }

  return errors;
}

function generateForm3CEBJson(data: Form3CEBData) {
  const totalTransactionValue = data.internationalTransactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  return {
    formType: "3CEB",
    version: "2024",
    generatedAt: new Date().toISOString(),
    partA: {
      assesseeName: data.assesseeDetails.name,
      pan: data.assesseeDetails.pan,
      address: `${data.assesseeDetails.address}, ${data.assesseeDetails.city}, ${data.assesseeDetails.state} - ${data.assesseeDetails.pincode}`,
      financialYear: data.assesseeDetails.financialYear,
      assessmentYear: data.assesseeDetails.assessmentYear,
      businessActivity: data.assesseeDetails.nicDescription,
      nicCode: data.assesseeDetails.nicCode,
    },
    partB: {
      associatedEnterprises: data.associatedEnterprises.map((ae, idx) => ({
        serialNo: idx + 1,
        name: ae.name,
        address: ae.address,
        country: ae.country,
        pan: ae.pan || "N/A",
        relationship: ae.relationship,
        description: ae.description,
      })),
    },
    partC: {
      internationalTransactions: data.internationalTransactions.map((txn, idx) => ({
        serialNo: idx + 1,
        associatedEnterpriseRef: txn.aeId,
        natureOfTransaction: TRANSACTION_NATURE_CODES[txn.natureCode as keyof typeof TRANSACTION_NATURE_CODES] || txn.description,
        natureCode: txn.natureCode,
        transactionValue: txn.amount,
        currency: txn.currency,
        methodUsed: TP_METHODS[txn.method as keyof typeof TP_METHODS] || txn.method,
        methodCode: txn.method,
        armLengthPrice: txn.armLengthPrice || txn.amount,
        adjustment: txn.adjustmentMade || 0,
      })),
      summary: {
        totalTransactionValue,
        totalAdjustment: data.internationalTransactions.reduce(
          (sum, txn) => sum + (txn.adjustmentMade || 0),
          0
        ),
        numberOfTransactions: data.internationalTransactions.length,
        numberOfAEs: data.associatedEnterprises.length,
      },
    },
    certification: {
      caName: data.caDetails.name,
      membershipNumber: data.caDetails.membershipNo,
      firmRegistrationNumber: data.caDetails.firmRegNo || "N/A",
      address: data.caDetails.address,
      udin: data.caDetails.udin || "PENDING",
      certificationDate: data.caDetails.date,
    },
  };
}

// POST /api/form-3ceb - Validate and generate Form 3CEB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === "validate") {
      const errors = validateForm3CEB(data);
      return NextResponse.json({
        valid: errors.filter((e) => e.severity === "error").length === 0,
        errors,
      });
    }

    if (action === "generate") {
      const errors = validateForm3CEB(data);
      const criticalErrors = errors.filter((e) => e.severity === "error");

      if (criticalErrors.length > 0) {
        return NextResponse.json(
          {
            error: "Validation failed",
            errors: criticalErrors,
          },
          { status: 400 }
        );
      }

      const form3ceb = generateForm3CEBJson(data);
      return NextResponse.json({ form3ceb, warnings: errors.filter((e) => e.severity === "warning") });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing Form 3CEB:", error);
    return NextResponse.json(
      { error: "Failed to process Form 3CEB" },
      { status: 500 }
    );
  }
}

// GET /api/form-3ceb/codes - Get transaction codes and TP methods
export async function GET() {
  return NextResponse.json({
    transactionCodes: TRANSACTION_NATURE_CODES,
    tpMethods: TP_METHODS,
  });
}
