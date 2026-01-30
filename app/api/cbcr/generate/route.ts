import { NextRequest, NextResponse } from "next/server";
import {
  CbCREngine,
  type CbCRInput,
  type CbCREntityData,
  CBCR_THRESHOLDS,
  INDIA_CBCR_FORMS,
  KEY_JURISDICTIONS,
  CbCREntityRole,
} from "@/lib/engines";

interface CbCRGenerationRequest {
  groupName: string;
  ultimateParentEntity: {
    name: string;
    jurisdiction: string;
    tin: string;
  };
  reportingFiscalYear: string;
  groupRevenue: number;
  currency: string;
  entities: CbCREntityData[];
  additionalInfo?: string;
  useXMLFormat?: boolean;
}

interface ApplicabilityCheckRequest {
  groupRevenue: number;
  currency: string;
  ultimateParentJurisdiction: string;
  indianEntityRole:
    | "ultimate_parent"
    | "surrogate_parent"
    | "constituent_entity"
    | "none";
}

// POST /api/cbcr/generate - Generate CbCR report
export async function POST(request: NextRequest) {
  try {
    const body: CbCRGenerationRequest = await request.json();
    const {
      groupName,
      ultimateParentEntity,
      reportingFiscalYear,
      groupRevenue,
      currency,
      entities,
      additionalInfo,
      useXMLFormat,
    } = body;

    // Validate required fields
    if (
      !groupName ||
      !ultimateParentEntity ||
      !reportingFiscalYear ||
      !groupRevenue ||
      !entities
    ) {
      return NextResponse.json(
        {
          error:
            "groupName, ultimateParentEntity, reportingFiscalYear, groupRevenue, and entities are required",
        },
        { status: 400 }
      );
    }

    const engine = new CbCREngine();

    // Check applicability first
    const applicability = engine.checkCbCRApplicability({
      consolidatedGroupRevenue: groupRevenue,
      revenueCurrency: (currency || "INR") as "EUR" | "INR" | "USD",
      ultimateParentJurisdiction: ultimateParentEntity.jurisdiction,
      reportingFiscalYearEnd: new Date(reportingFiscalYear.split("-")[1] + "-03-31"),
      indianEntityExists: true,
    });

    if (!applicability.isApplicable) {
      return NextResponse.json({
        applicable: false,
        threshold: applicability.threshold,
        groupRevenue,
        message: `Group revenue of ${groupRevenue.toLocaleString()} ${currency} is below the CbCR threshold of ${applicability.threshold.toLocaleString()} ${currency}`,
      });
    }

    // Parse fiscal year to get start and end dates
    const [startYear, endYear] = reportingFiscalYear.split("-").map((y) => parseInt(y.length === 2 ? "20" + y : y));
    const fiscalYearStart = new Date(`${startYear}-04-01`);
    const fiscalYearEnd = new Date(`${endYear}-03-31`);

    const input: CbCRInput = {
      reportingEntity: {
        name: entities?.[0]?.entityName || groupName,
        pan: "AAAAA0000A", // Will need to be provided in request
        address: "India",
        role: CbCREntityRole.REPORTING_ENTITY,
        contactPerson: "Contact Person",
        email: "contact@company.com",
        phone: "+91-0000000000",
      },
      ultimateParent: {
        name: ultimateParentEntity.name,
        jurisdiction: ultimateParentEntity.jurisdiction,
        taxIdentificationNumber: ultimateParentEntity.tin,
        address: ultimateParentEntity.jurisdiction, // Default to jurisdiction as placeholder
      },
      constituentEntities: entities || [],
      reportingFiscalYear: {
        startDate: fiscalYearStart,
        endDate: fiscalYearEnd,
      },
      reportingCurrency: currency || "INR",
      exchangeRates: { [currency || "INR"]: 1 },
      additionalInfo: additionalInfo ? [additionalInfo] : undefined,
    };

    // Generate CbCR
    const cbcr = engine.generateCbCR(input);

    // Validation is included in the generation result
    const validation = cbcr.validationResult;

    // XML output is already generated in the result if the engine does it
    const xml = useXMLFormat ? cbcr.xmlOutput : undefined;

    // Prepare Form 3CEAD data for PDF generation
    const form3CEADData = engine.prepareForm3CEAD(cbcr);

    return NextResponse.json({
      report: cbcr,
      validation,
      xml,
      form3CEAD: form3CEADData,
      summary: {
        groupName,
        reportingYear: reportingFiscalYear,
        jurisdictionsCount: cbcr.form3CEAD?.partB?.table1?.length || 0,
        entitiesCount: cbcr.form3CEAD?.partB?.table2?.length || 0,
        statistics: cbcr.summaryStatistics,
        validationStatus: validation.isValid ? "Valid" : "Has Errors",
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        filingDeadline: calculateFilingDeadline(reportingFiscalYear),
        filingGuidance: cbcr.filingGuidance,
      },
    });
  } catch (error) {
    console.error("Error generating CbCR:", error);
    return NextResponse.json({ error: "Failed to generate CbCR report" }, { status: 500 });
  }
}

// PUT /api/cbcr/generate - Check CbCR applicability
export async function PUT(request: NextRequest) {
  try {
    const body: ApplicabilityCheckRequest = await request.json();
    const { groupRevenue, currency, ultimateParentJurisdiction, indianEntityRole } = body;

    if (!groupRevenue || !currency) {
      return NextResponse.json(
        { error: "groupRevenue and currency are required" },
        { status: 400 }
      );
    }

    const engine = new CbCREngine();
    const applicability = engine.checkCbCRApplicability({
      consolidatedGroupRevenue: groupRevenue,
      revenueCurrency: currency as "EUR" | "INR" | "USD",
      ultimateParentJurisdiction,
      reportingFiscalYearEnd: new Date(), // Current date for checking
      indianEntityExists: indianEntityRole !== "none",
    });

    // Determine filing obligation for Indian entity
    let indianFilingObligation = {
      required: false,
      form: "",
      reason: "",
    };

    if (applicability.isApplicable) {
      if (indianEntityRole === "ultimate_parent") {
        indianFilingObligation = {
          required: true,
          form: "Form 3CEAD (Part A, B, C)",
          reason: "Indian entity is the Ultimate Parent Entity of the MNE Group",
        };
      } else if (indianEntityRole === "surrogate_parent") {
        indianFilingObligation = {
          required: true,
          form: "Form 3CEAD (Part A, B, C)",
          reason: "Indian entity is designated as Surrogate Parent Entity",
        };
      } else if (indianEntityRole === "constituent_entity") {
        // Check if parent jurisdiction has CbCR exchange agreement
        const parentJurisdiction = KEY_JURISDICTIONS.find(
          (j) => j.code === ultimateParentJurisdiction
        );
        const hasAgreement = parentJurisdiction?.hasCbCRExchange ?? false;
        if (hasAgreement) {
          indianFilingObligation = {
            required: true,
            form: "Form 3CEAC (Intimation)",
            reason:
              "Parent jurisdiction has exchange agreement - only intimation required",
          };
        } else {
          indianFilingObligation = {
            required: true,
            form: "Form 3CEAD (Part A, B, C)",
            reason:
              "Parent jurisdiction does not have exchange agreement - full CbCR required",
          };
        }
      }
    }

    return NextResponse.json({
      applicability,
      indianFilingObligation,
      thresholds: {
        eur: CBCR_THRESHOLDS.groupRevenueThreshold.eur,
        inr: CBCR_THRESHOLDS.groupRevenueThreshold.inr,
        current: currency === "EUR" ? CBCR_THRESHOLDS.groupRevenueThreshold.eur : CBCR_THRESHOLDS.groupRevenueThreshold.inr,
      },
      forms: INDIA_CBCR_FORMS,
      deadlines: {
        masterFile: "Due date of income tax return",
        cbcr: "12 months from end of reporting fiscal year",
        intimation: "2 months before due date of income tax return",
      },
    });
  } catch (error) {
    console.error("Error checking applicability:", error);
    return NextResponse.json(
      { error: "Failed to check CbCR applicability" },
      { status: 500 }
    );
  }
}

// GET /api/cbcr/generate - Get CbCR rules and requirements
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  if (type === "tables") {
    return NextResponse.json({
      table1: {
        title: "Overview of allocation of income, taxes and business activities by tax jurisdiction",
        columns: [
          "Tax Jurisdiction",
          "Unrelated Party Revenue",
          "Related Party Revenue",
          "Total Revenue",
          "Profit (Loss) Before Tax",
          "Income Tax Paid (Cash Basis)",
          "Income Tax Accrued",
          "Stated Capital",
          "Accumulated Earnings",
          "Number of Employees",
          "Tangible Assets",
        ],
        instructions:
          "Aggregate data for all constituent entities resident in each tax jurisdiction",
      },
      table2: {
        title: "List of all the Constituent Entities of the MNE group included in each aggregation per tax jurisdiction",
        columns: [
          "Tax Jurisdiction",
          "Constituent Entities Resident",
          "Tax Jurisdiction of Organization if Different",
          "Main Business Activity(ies)",
        ],
        businessActivities: [
          "Research and Development",
          "Holding or Managing IP",
          "Purchasing or Procurement",
          "Manufacturing or Production",
          "Sales, Marketing or Distribution",
          "Administrative, Management or Support Services",
          "Provision of Services to Unrelated Parties",
          "Internal Group Finance",
          "Regulated Financial Services",
          "Insurance",
          "Holding Shares or Other Equity",
          "Dormant",
          "Other",
        ],
      },
      table3: {
        title: "Additional Information",
        purpose: "Brief description of sources of data, exchange rates used, and any other information to facilitate understanding",
      },
    });
  }

  if (type === "penalties") {
    return NextResponse.json({
      penalties: {
        nonFiling: {
          section: "271GB",
          form3CEAC: "Rs. 5,000 per day of default (max Rs. 5,00,000)",
          form3CEAD: "Rs. 5,000 per day (first 3 months), Rs. 15,000 per day (thereafter)",
          form3CEAA: "Rs. 5,000 per day (first 3 months), Rs. 15,000 per day (thereafter)",
        },
        inaccurateReporting: {
          section: "271GB(3)",
          penalty: "Rs. 5,00,000 for inaccurate particulars",
          applicability: "If inaccuracy due to failure to exercise due diligence",
        },
      },
      limitations: {
        reasonableCause: "No penalty if reasonable cause for failure",
        dueDate: "Penalty calculated from day after due date",
      },
    });
  }

  if (type === "roles") {
    return NextResponse.json({
      entityRoles: Object.values(CbCREntityRole).map((role) => ({
        role,
        description: getRoleDescription(role),
        filingObligation: getRoleFilingObligation(role),
      })),
    });
  }

  return NextResponse.json({
    overview: {
      title: "Country-by-Country Reporting (CbCR)",
      purpose: "BEPS Action 13 implementation for enhanced tax transparency",
      applicability: `MNE Groups with consolidated revenue ≥ EUR ${CBCR_THRESHOLDS.groupRevenueThreshold.eur.toLocaleString()} (approx INR ${CBCR_THRESHOLDS.groupRevenueThreshold.inr.toLocaleString()})`,
    },
    rules: CBCR_THRESHOLDS,
    forms: INDIA_CBCR_FORMS,
    entityRoles: Object.values(CbCREntityRole),
    filingRequirements: {
      form3CEAC: {
        name: "Intimation by constituent entity",
        when: "2 months before due date of return",
        who: "Indian constituent entity of foreign MNE",
      },
      form3CEAA: {
        name: "Master File",
        when: "Due date of income tax return",
        who: "Indian constituent entity of MNE (threshold: INR 50 Cr + INR 10 Cr intl txns)",
      },
      form3CEAD: {
        name: "Country-by-Country Report",
        when: "12 months from end of reporting FY",
        who: "Ultimate/Surrogate parent or constituent entity if no exchange",
      },
    },
    thresholds: {
      cbcrRevenue: {
        eur: CBCR_THRESHOLDS.groupRevenueThreshold.eur,
        inr: CBCR_THRESHOLDS.groupRevenueThreshold.inr,
      },
      masterFile: {
        consolidatedRevenue: 50_00_00_000, // INR 50 Cr
        internationalTransactions: 10_00_00_000, // INR 10 Cr
      },
    },
  });
}

function calculateFilingDeadline(fiscalYear: string): string {
  // CbCR due 12 months after end of fiscal year
  const yearEnd = fiscalYear.split("-")[1];
  const year = parseInt(yearEnd.length === 2 ? "20" + yearEnd : yearEnd);
  return `${year + 1}-03-31`; // Assuming March year-end
}

function getRoleDescription(role: CbCREntityRole): string {
  const descriptions: Record<CbCREntityRole, string> = {
    [CbCREntityRole.ULTIMATE_PARENT]:
      "The entity that owns/controls all other entities and is not owned/controlled by another",
    [CbCREntityRole.SURROGATE_PARENT]:
      "Designated entity to file CbCR on behalf of the group when UPE is not obligated",
    [CbCREntityRole.CONSTITUENT_ENTITY]:
      "Any business unit included in consolidated financial statements of the MNE group",
    [CbCREntityRole.REPORTING_ENTITY]:
      "The entity responsible for filing the CbCR for the MNE group",
    [CbCREntityRole.EXCLUDED_ENTITY]:
      "Entity excluded from CbCR (e.g., size exemption, separate business)",
  };
  return descriptions[role];
}

function getRoleFilingObligation(role: CbCREntityRole): string {
  const obligations: Record<CbCREntityRole, string> = {
    [CbCREntityRole.ULTIMATE_PARENT]: "Must file CbCR in jurisdiction of tax residence",
    [CbCREntityRole.SURROGATE_PARENT]: "Must file CbCR as designated surrogate",
    [CbCREntityRole.CONSTITUENT_ENTITY]:
      "File intimation (3CEAC) and may need to file full CbCR if no exchange agreement",
    [CbCREntityRole.REPORTING_ENTITY]:
      "Must file full CbCR for the MNE group",
    [CbCREntityRole.EXCLUDED_ENTITY]: "No filing obligation",
  };
  return obligations[role];
}
