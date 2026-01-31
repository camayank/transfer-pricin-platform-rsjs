import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import {
  createForm3CEBBuilder,
  createForm3CEBValidator,
  TransactionNature,
  TPMethod,
  RelationshipType,
  TRANSACTION_NATURE_DESCRIPTIONS,
} from "@/lib/engines/form-3ceb-engine";

// Re-export from engine for backward compatibility
// Transaction Nature Codes as per Income Tax Rules (from form-3ceb-engine)
const TRANSACTION_NATURE_CODES: Record<string, string> = {
  ...TRANSACTION_NATURE_DESCRIPTIONS,
  // Legacy mappings for backward compatibility
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

// TP Methods with full descriptions
const TP_METHODS: Record<string, string> = {
  [TPMethod.CUP]: "Comparable Uncontrolled Price Method",
  [TPMethod.RPM]: "Resale Price Method",
  [TPMethod.CPM]: "Cost Plus Method",
  [TPMethod.PSM]: "Profit Split Method",
  [TPMethod.TNMM]: "Transactional Net Margin Method",
  [TPMethod.OTHER]: "Any Other Method",
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

// POST /api/form-3ceb - Validate, generate, and save Form 3CEB
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { action, data, engagementId, documentId } = body;

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

    if (action === "save") {
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!engagementId) {
        return NextResponse.json(
          { error: "Engagement ID is required to save Form 3CEB" },
          { status: 400 }
        );
      }

      // Validate the engagement exists
      const engagement = await prisma.engagement.findUnique({
        where: { id: engagementId },
        include: { client: true },
      });

      if (!engagement) {
        return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
      }

      // Validate the form data
      const errors = validateForm3CEB(data);
      const criticalErrors = errors.filter((e) => e.severity === "error");
      const status = criticalErrors.length === 0 ? "PENDING_REVIEW" : "DRAFT";

      // If documentId provided, update existing; otherwise create new
      if (documentId) {
        const document = await prisma.document.update({
          where: { id: documentId },
          data: {
            data: data,
            validationErrors: errors.length > 0 ? (errors as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
            status: status,
            name: `Form 3CEB - ${engagement.client.name} - ${engagement.financialYear}`,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          documentId: document.id,
          status: document.status,
          message: `Form 3CEB ${status === "DRAFT" ? "saved as draft" : "saved and ready for review"}`,
          errors: errors.filter((e) => e.severity === "error"),
          warnings: errors.filter((e) => e.severity === "warning"),
        });
      } else {
        // Create new document
        const document = await prisma.document.create({
          data: {
            engagementId: engagementId,
            clientId: engagement.clientId,
            type: "FORM_3CEB",
            status: status,
            name: `Form 3CEB - ${engagement.client.name} - ${engagement.financialYear}`,
            data: data,
            validationErrors: errors.length > 0 ? (errors as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          },
        });

        return NextResponse.json({
          success: true,
          documentId: document.id,
          status: document.status,
          message: `Form 3CEB created ${status === "DRAFT" ? "as draft" : "and ready for review"}`,
          errors: errors.filter((e) => e.severity === "error"),
          warnings: errors.filter((e) => e.severity === "warning"),
        });
      }
    }

    if (action === "load") {
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!engagementId) {
        return NextResponse.json(
          { error: "Engagement ID is required" },
          { status: 400 }
        );
      }

      // Load existing Form 3CEB document for this engagement
      const document = await prisma.document.findFirst({
        where: {
          engagementId: engagementId,
          type: "FORM_3CEB",
        },
        orderBy: { updatedAt: "desc" },
      });

      if (!document) {
        // Load data from engagement to pre-fill
        const engagement = await prisma.engagement.findUnique({
          where: { id: engagementId },
          include: {
            client: {
              include: {
                associatedEnterprises: true,
              },
            },
            transactions: {
              include: {
                ae: true,
              },
            },
          },
        });

        if (!engagement) {
          return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
        }

        // Return pre-filled data from engagement
        return NextResponse.json({
          exists: false,
          prefillData: {
            assesseeDetails: {
              name: engagement.client.name,
              pan: engagement.client.pan,
              address: engagement.client.address || "",
              city: engagement.client.city || "",
              state: engagement.client.state || "",
              pinCode: engagement.client.pincode || "",
              nicCode: engagement.client.nicCode || "",
              nicDescription: engagement.client.nicDescription || "",
              financialYear: engagement.financialYear,
              assessmentYear: engagement.assessmentYear,
            },
            associatedEnterprises: engagement.client.associatedEnterprises.map((ae) => ({
              id: ae.id,
              name: ae.name,
              country: ae.country,
              countryCode: ae.country,
              address: ae.address || "",
              relationshipType: ae.relationship,
              taxId: ae.tin || "",
            })),
            transactions: engagement.transactions.map((txn) => ({
              id: txn.id,
              aeId: txn.aeId,
              aeName: txn.ae.name,
              aeCountry: txn.ae.country,
              natureCode: txn.natureCode,
              description: txn.description || "",
              valueAsPerBooks: Number(txn.amount),
              valueAsPerALP: Number(txn.armLengthMedian || txn.amount),
              method: txn.method || "TNMM",
              safeHarbourOpted: txn.safeHarbourApplied,
            })),
          },
        });
      }

      return NextResponse.json({
        exists: true,
        documentId: document.id,
        status: document.status,
        data: document.data,
        validationErrors: document.validationErrors,
        lastUpdated: document.updatedAt,
      });
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

// GET /api/form-3ceb/codes - Get transaction codes, TP methods, and relationship types
export async function GET() {
  return NextResponse.json({
    transactionCodes: TRANSACTION_NATURE_CODES,
    tpMethods: TP_METHODS,
    relationshipTypes: {
      [RelationshipType.HOLDING_COMPANY]: "Holding Company",
      [RelationshipType.SUBSIDIARY]: "Subsidiary",
      [RelationshipType.FELLOW_SUBSIDIARY]: "Fellow Subsidiary",
      [RelationshipType.JOINT_VENTURE]: "Joint Venture",
      [RelationshipType.COMMON_CONTROL]: "Common Control",
      [RelationshipType.OTHER]: "Other Related Party",
    },
    engineVersion: "1.4",
    schemaVersion: "2025",
  });
}
