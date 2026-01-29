/**
 * DIGICOMPLY FORM 3CEB GENERATOR
 * Transfer Pricing Audit Report Generator
 *
 * Based on:
 * - Income Tax Rules 10E, Section 92E
 * - JSON Schema Version 1.4 (December 2025)
 * - Form 3CEB Parts A, B, C
 */

import { createHash } from "crypto";

// =============================================================================
// ENUMS - FORM 3CEB SPECIFIC CODES
// =============================================================================

export enum TransactionNature {
  // Purchase transactions
  PURCHASE_RAW_MATERIALS = "01",
  PURCHASE_FINISHED_GOODS = "02",
  PURCHASE_CAPITAL_GOODS = "03",
  PURCHASE_OTHER_GOODS = "04",

  // Sale transactions
  SALE_RAW_MATERIALS = "11",
  SALE_FINISHED_GOODS = "12",
  SALE_CAPITAL_GOODS = "13",
  SALE_OTHER_GOODS = "14",

  // Services - Payment
  PAYMENT_SOFTWARE_SERVICES = "21",
  PAYMENT_TECHNICAL_SERVICES = "22",
  PAYMENT_MANAGEMENT_SERVICES = "23",
  PAYMENT_SUPPORT_SERVICES = "24",
  PAYMENT_OTHER_SERVICES = "25",

  // Services - Receipt
  RECEIPT_SOFTWARE_SERVICES = "31",
  RECEIPT_TECHNICAL_SERVICES = "32",
  RECEIPT_MANAGEMENT_SERVICES = "33",
  RECEIPT_SUPPORT_SERVICES = "34",
  RECEIPT_OTHER_SERVICES = "35",

  // Royalty/License
  PAYMENT_ROYALTY = "41",
  RECEIPT_ROYALTY = "42",
  PAYMENT_LICENSE_FEE = "43",
  RECEIPT_LICENSE_FEE = "44",

  // Financial transactions
  LOAN_GIVEN = "51",
  LOAN_TAKEN = "52",
  INTEREST_PAID = "53",
  INTEREST_RECEIVED = "54",
  GUARANTEE_GIVEN = "55",
  GUARANTEE_RECEIVED = "56",

  // Capital transactions
  PURCHASE_SHARES = "61",
  SALE_SHARES = "62",
  PURCHASE_INTANGIBLES = "63",
  SALE_INTANGIBLES = "64",

  // Cost allocation
  COST_SHARING_PAYMENT = "71",
  COST_SHARING_RECEIPT = "72",

  // Others
  OTHER_TRANSACTION = "99",
}

export enum TPMethod {
  CUP = "CUP", // Comparable Uncontrolled Price
  RPM = "RPM", // Resale Price Method
  CPM = "CPM", // Cost Plus Method
  PSM = "PSM", // Profit Split Method
  TNMM = "TNMM", // Transactional Net Margin Method
  OTHER = "OTHER", // Other Method
}

export enum RelationshipType {
  HOLDING_COMPANY = "01",
  SUBSIDIARY = "02",
  FELLOW_SUBSIDIARY = "03",
  JOINT_VENTURE = "04",
  COMMON_CONTROL = "05",
  OTHER = "99",
}

export enum SDTNature {
  SECTION_80A = "80A",
  SECTION_80IA = "80IA",
  SECTION_10AA = "10AA",
  SECTION_115BAB = "115BAB",
  OTHER = "OTHER",
}

// Transaction Nature Descriptions
export const TRANSACTION_NATURE_DESCRIPTIONS: Record<string, string> = {
  "01": "Purchase of raw materials",
  "02": "Purchase of finished goods",
  "03": "Purchase of capital goods",
  "04": "Purchase of other goods",
  "11": "Sale of raw materials",
  "12": "Sale of finished goods",
  "13": "Sale of capital goods",
  "14": "Sale of other goods",
  "21": "Payment for software development services",
  "22": "Payment for technical services",
  "23": "Payment for management services",
  "24": "Payment for support services",
  "25": "Payment for other services",
  "31": "Receipt for software development services",
  "32": "Receipt for technical services",
  "33": "Receipt for management services",
  "34": "Receipt for support services",
  "35": "Receipt for other services",
  "41": "Payment of royalty",
  "42": "Receipt of royalty",
  "43": "Payment of license fee",
  "44": "Receipt of license fee",
  "51": "Loan/advance given",
  "52": "Loan/advance taken",
  "53": "Interest paid",
  "54": "Interest received",
  "55": "Guarantee given",
  "56": "Guarantee received",
  "61": "Purchase of shares/securities",
  "62": "Sale of shares/securities",
  "63": "Purchase of intangible assets",
  "64": "Sale of intangible assets",
  "71": "Payment towards cost sharing arrangement",
  "72": "Receipt towards cost sharing arrangement",
  "99": "Other transaction",
};

// =============================================================================
// INTERFACES - FORM 3CEB STRUCTURE
// =============================================================================

export interface AssesseeInfo {
  name: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  status: string; // Company, Firm, LLP, etc.
  principalBusinessActivity: string;
  nicCode: string;
  previousYearFrom: string;
  previousYearTo: string;
  assessmentYear: string;
  email: string;
  phone: string;
}

export interface AssociatedEnterprise {
  aeReference: string;
  name: string;
  country: string;
  countryCode: string;
  address: string;
  relationshipType: RelationshipType;
  relationshipDescription: string;
  taxId?: string;
}

export interface InternationalTransaction {
  slNo: number;
  aeReference: string;
  aeName: string;
  aeCountry: string;
  natureOfTransaction: TransactionNature;
  description: string;
  valueAsPerBooks: number;
  valueAsPerALP: number;
  methodUsed: TPMethod;
  methodJustification: string;
  alpDetermined: number;
  alpRangeLower?: number;
  alpRangeUpper?: number;
  numberOfComparables: number;
  comparableSearchProcess: string;
  adjustmentRequired: boolean;
  adjustmentAmount: number;
  safeHarbourOpted: boolean;
  safeHarbourMargin?: number;
  documentationMaintained: boolean;
}

export interface SpecifiedDomesticTransaction {
  slNo: number;
  partyName: string;
  partyPan: string;
  relationship: string;
  nature: SDTNature;
  sectionClaimed: string;
  description: string;
  valueAsPerBooks: number;
  valueAsPerALP: number;
  methodUsed: TPMethod;
  adjustmentRequired: boolean;
  adjustmentAmount: number;
}

export interface AggregateValue {
  natureCode: string;
  natureDescription: string;
  numberOfTransactions: number;
  totalValue: number;
  totalAdjustment: number;
}

export interface CADetails {
  caName: string;
  caMembershipNumber: string;
  caFirmName: string;
  caFirmRegistrationNumber: string;
  caAddress: string;
  caCity: string;
  caPin: string;
  udin: string;
  dateOfReport: string;
}

export interface Form3CEB {
  formDetails: {
    formName: string;
    formVersion: string;
    assessmentYear: string;
    generatedOn: string;
  };
  partA: {
    assesseeDetails: AssesseeInfo;
    aggregateInternationalTransactions: AggregateValue[];
    aggregateDomesticTransactions: AggregateValue[];
    totalInternationalValue: string;
    totalDomesticValue: string;
    totalAdjustments: string;
  };
  associatedEnterprises: AssociatedEnterprise[];
  partB: {
    internationalTransactions: InternationalTransaction[];
  };
  partC: {
    specifiedDomesticTransactions: SpecifiedDomesticTransaction[];
  };
  caDetails: CADetails;
}

// =============================================================================
// VALIDATION
// =============================================================================

export enum ValidationSeverity {
  CRITICAL = "critical",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface ValidationResult {
  field: string;
  message: string;
  severity: ValidationSeverity;
  section: string;
  suggestion?: string;
}

// Valid country codes (ISO 3166-1 alpha-2)
const VALID_COUNTRY_CODES = new Set([
  "US", "GB", "DE", "FR", "JP", "CN", "SG", "AE", "AU", "CA",
  "NL", "CH", "IE", "LU", "HK", "MY", "TH", "ID", "PH", "VN",
  "KR", "TW", "IT", "ES", "BE", "AT", "SE", "DK", "NO", "FI",
  "MX", "BR", "ZA", "NZ", "IL", "SA", "QA", "KW", "BH", "OM",
  "MU", "CY", "MT", "JE", "GG", "IM", "BM", "KY", "VG", "PA",
]);

// Valid NIC code prefixes
const VALID_NIC_PREFIXES = new Set([
  "62", "63", "70", "72", "74", "46", "28", "29", "21", "20",
]);

export class Form3CEBValidator {
  private results: ValidationResult[] = [];

  validateForm(formData: Form3CEB): ValidationResult[] {
    this.results = [];

    this.validatePartA(formData.partA);
    this.validateAssociatedEnterprises(formData.associatedEnterprises);
    this.validatePartB(formData.partB, formData.associatedEnterprises);
    this.validatePartC(formData.partC);
    this.validateCADetails(formData.caDetails);
    this.validateCrossReferences(formData);

    return this.results;
  }

  private validatePartA(partA: Form3CEB["partA"]) {
    const assessee = partA.assesseeDetails;

    // PAN Validation
    if (!this.validatePAN(assessee.pan)) {
      this.results.push({
        field: "pan",
        message: `Invalid PAN format: ${assessee.pan}`,
        severity: ValidationSeverity.CRITICAL,
        section: "Part A",
        suggestion: "PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
      });
    }

    // Name validation
    if (assessee.name.length < 3) {
      this.results.push({
        field: "name",
        message: "Assessee name is too short",
        severity: ValidationSeverity.ERROR,
        section: "Part A",
        suggestion: "Enter full legal name as per PAN records",
      });
    }

    if (assessee.name && assessee.name === assessee.name.toLowerCase()) {
      this.results.push({
        field: "name",
        message: "Assessee name should not be in all lowercase",
        severity: ValidationSeverity.WARNING,
        section: "Part A",
        suggestion: "Use proper case for company name",
      });
    }

    // PIN Code validation
    if (!this.validatePINCode(assessee.pinCode)) {
      this.results.push({
        field: "pinCode",
        message: `Invalid PIN code: ${assessee.pinCode}`,
        severity: ValidationSeverity.ERROR,
        section: "Part A",
        suggestion: "PIN code must be 6 digits",
      });
    }

    // NIC Code validation
    if (assessee.nicCode) {
      const nicPrefix = assessee.nicCode.substring(0, 2);
      if (!VALID_NIC_PREFIXES.has(nicPrefix)) {
        this.results.push({
          field: "nicCode",
          message: `NIC code ${assessee.nicCode} may not be valid`,
          severity: ValidationSeverity.WARNING,
          section: "Part A",
          suggestion: "Verify NIC code as per National Industrial Classification 2008",
        });
      }
    }

    // Email validation
    if (assessee.email && !this.validateEmail(assessee.email)) {
      this.results.push({
        field: "email",
        message: `Invalid email format: ${assessee.email}`,
        severity: ValidationSeverity.ERROR,
        section: "Part A",
        suggestion: "Enter valid email address",
      });
    }

    // Phone validation
    if (assessee.phone && !this.validatePhone(assessee.phone)) {
      this.results.push({
        field: "phone",
        message: `Invalid phone number: ${assessee.phone}`,
        severity: ValidationSeverity.WARNING,
        section: "Part A",
        suggestion: "Enter 10-digit mobile number",
      });
    }

    // Date validation
    if (assessee.previousYearFrom && assessee.previousYearTo) {
      const fromDate = new Date(assessee.previousYearFrom);
      const toDate = new Date(assessee.previousYearTo);

      if (fromDate >= toDate) {
        this.results.push({
          field: "previousYear",
          message: "Previous year 'from' date must be before 'to' date",
          severity: ValidationSeverity.CRITICAL,
          section: "Part A",
        });
      }

      // Check if it's a 12-month period
      const delta = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
      if (delta < 364 || delta > 366) {
        this.results.push({
          field: "previousYear",
          message: `Previous year period is ${delta} days (should be ~365)`,
          severity: ValidationSeverity.WARNING,
          section: "Part A",
          suggestion: "Verify if this is correct for the assessment year",
        });
      }
    }

    // Aggregate values validation
    const intValue = parseFloat(partA.totalInternationalValue || "0");
    const domValue = parseFloat(partA.totalDomesticValue || "0");

    if (intValue === 0 && domValue === 0) {
      this.results.push({
        field: "totalValues",
        message: "Both international and domestic transaction values are zero",
        severity: ValidationSeverity.WARNING,
        section: "Part A",
        suggestion: "Verify if Form 3CEB is required when there are no transactions",
      });
    }
  }

  private validateAssociatedEnterprises(aeList: AssociatedEnterprise[]) {
    if (!aeList || aeList.length === 0) {
      this.results.push({
        field: "associatedEnterprises",
        message: "No Associated Enterprises declared",
        severity: ValidationSeverity.WARNING,
        section: "Associated Enterprises",
        suggestion: "Add at least one AE if there are international transactions",
      });
      return;
    }

    const aeNames = new Set<string>();
    aeList.forEach((ae, idx) => {
      // Check for duplicate names
      if (aeNames.has(ae.name)) {
        this.results.push({
          field: `ae[${idx}].name`,
          message: `Duplicate AE name: ${ae.name}`,
          severity: ValidationSeverity.ERROR,
          section: "Associated Enterprises",
          suggestion: "Each AE should be listed only once",
        });
      }
      aeNames.add(ae.name);

      // Country code validation
      if (ae.countryCode && !VALID_COUNTRY_CODES.has(ae.countryCode)) {
        this.results.push({
          field: `ae[${idx}].countryCode`,
          message: `Invalid or unusual country code: ${ae.countryCode}`,
          severity: ValidationSeverity.WARNING,
          section: "Associated Enterprises",
          suggestion: "Use ISO 3166-1 alpha-2 country codes",
        });
      }

      // India check
      if (ae.countryCode === "IN") {
        this.results.push({
          field: `ae[${idx}].countryCode`,
          message: "AE country cannot be India for international transactions",
          severity: ValidationSeverity.CRITICAL,
          section: "Associated Enterprises",
          suggestion: "Indian related parties should be in Part C (SDT)",
        });
      }

      // Tax ID validation
      if (!ae.taxId) {
        this.results.push({
          field: `ae[${idx}].taxId`,
          message: `Tax ID not provided for ${ae.name}`,
          severity: ValidationSeverity.INFO,
          section: "Associated Enterprises",
          suggestion: "Tax ID helps in cross-verification with CbCR",
        });
      }
    });
  }

  private validatePartB(partB: Form3CEB["partB"], aeList: AssociatedEnterprise[]) {
    const transactions = partB.internationalTransactions;
    const aeRefs = new Set(aeList.map((ae) => ae.aeReference));

    if (!transactions || (transactions.length === 0 && aeList.length > 0)) {
      this.results.push({
        field: "internationalTransactions",
        message: "AEs declared but no international transactions",
        severity: ValidationSeverity.WARNING,
        section: "Part B",
      });
      return;
    }

    transactions.forEach((txn, idx) => {
      // AE reference validation
      if (!aeRefs.has(txn.aeReference)) {
        this.results.push({
          field: `txn[${idx}].aeReference`,
          message: `Invalid AE reference: ${txn.aeReference}`,
          severity: ValidationSeverity.CRITICAL,
          section: "Part B",
          suggestion: "AE reference must match a declared Associated Enterprise",
        });
      }

      // Transaction nature validation
      if (!txn.natureOfTransaction) {
        this.results.push({
          field: `txn[${idx}].natureOfTransaction`,
          message: "Transaction nature code is missing",
          severity: ValidationSeverity.CRITICAL,
          section: "Part B",
        });
      }

      // Value validation
      if (txn.valueAsPerBooks <= 0) {
        this.results.push({
          field: `txn[${idx}].valueAsPerBooks`,
          message: `Transaction value is zero or negative: ${txn.valueAsPerBooks}`,
          severity: ValidationSeverity.ERROR,
          section: "Part B",
        });
      }

      // Check for large adjustments
      if (txn.valueAsPerBooks !== txn.valueAsPerALP) {
        const adjustment = Math.abs(txn.valueAsPerBooks - txn.valueAsPerALP);
        const adjPercent = (adjustment / txn.valueAsPerBooks) * 100;

        if (adjPercent > 20) {
          this.results.push({
            field: `txn[${idx}].adjustment`,
            message: `Large adjustment (${adjPercent.toFixed(1)}%) may attract scrutiny`,
            severity: ValidationSeverity.WARNING,
            section: "Part B",
            suggestion: "Ensure robust documentation for large adjustments",
          });
        }
      }

      // Method validation
      if (!txn.methodUsed) {
        this.results.push({
          field: `txn[${idx}].methodUsed`,
          message: "Transfer pricing method not specified",
          severity: ValidationSeverity.CRITICAL,
          section: "Part B",
        });
      }

      if (txn.methodUsed && (!txn.methodJustification || txn.methodJustification.length < 50)) {
        this.results.push({
          field: `txn[${idx}].methodJustification`,
          message: "Method justification is too brief",
          severity: ValidationSeverity.WARNING,
          section: "Part B",
          suggestion: "Provide detailed justification for method selection",
        });
      }

      // Comparable count validation
      if (txn.methodUsed === TPMethod.TNMM && txn.numberOfComparables < 3) {
        this.results.push({
          field: `txn[${idx}].numberOfComparables`,
          message: `Only ${txn.numberOfComparables} comparables for TNMM analysis`,
          severity: ValidationSeverity.WARNING,
          section: "Part B",
          suggestion: "TNMM typically requires at least 3-5 comparables",
        });
      }

      // Safe Harbour validation
      if (txn.safeHarbourOpted && !txn.safeHarbourMargin) {
        this.results.push({
          field: `txn[${idx}].safeHarbourMargin`,
          message: "Safe Harbour opted but margin not specified",
          severity: ValidationSeverity.ERROR,
          section: "Part B",
        });
      }
    });

    // Check aggregate threshold
    const totalValue = transactions.reduce((sum, txn) => sum + txn.valueAsPerBooks, 0);
    if (totalValue > 100_00_00_000) {
      this.results.push({
        field: "totalInternationalValue",
        message: `High value transactions (₹${totalValue.toLocaleString()}) - ensure comprehensive documentation`,
        severity: ValidationSeverity.INFO,
        section: "Part B",
      });
    }
  }

  private validatePartC(partC: Form3CEB["partC"]) {
    const transactions = partC.specifiedDomesticTransactions || [];

    transactions.forEach((txn, idx) => {
      // PAN validation for domestic parties
      if (!this.validatePAN(txn.partyPan)) {
        this.results.push({
          field: `sdt[${idx}].partyPan`,
          message: `Invalid PAN for domestic party: ${txn.partyPan}`,
          severity: ValidationSeverity.CRITICAL,
          section: "Part C",
        });
      }

      // Section validation
      const validSections = ["80A", "80IA", "80IB", "80IC", "10A", "10AA", "10B", "115BAB"];
      if (txn.sectionClaimed && !validSections.some((s) => txn.sectionClaimed.includes(s))) {
        this.results.push({
          field: `sdt[${idx}].sectionClaimed`,
          message: `Unusual section claimed: ${txn.sectionClaimed}`,
          severity: ValidationSeverity.WARNING,
          section: "Part C",
          suggestion: "Verify the section under which deduction is claimed",
        });
      }
    });
  }

  private validateCADetails(caDetails: CADetails) {
    if (!caDetails || !caDetails.caName) {
      this.results.push({
        field: "caDetails",
        message: "CA details are missing - form cannot be filed",
        severity: ValidationSeverity.CRITICAL,
        section: "CA Details",
      });
      return;
    }

    // Membership number validation
    if (caDetails.caMembershipNumber &&
        (caDetails.caMembershipNumber.length < 5 || !/^\d+$/.test(caDetails.caMembershipNumber))) {
      this.results.push({
        field: "membershipNumber",
        message: `Invalid CA membership number format: ${caDetails.caMembershipNumber}`,
        severity: ValidationSeverity.ERROR,
        section: "CA Details",
        suggestion: "Enter valid ICAI membership number",
      });
    }

    // UDIN validation
    if (!this.validateUDIN(caDetails.udin)) {
      this.results.push({
        field: "udin",
        message: `Invalid UDIN format: ${caDetails.udin}`,
        severity: ValidationSeverity.CRITICAL,
        section: "CA Details",
        suggestion: "UDIN must be 18 characters from ICAI portal",
      });
    }

    // Firm registration number
    if (caDetails.caFirmRegistrationNumber &&
        !/^\d{6}[A-Z]$/.test(caDetails.caFirmRegistrationNumber)) {
      this.results.push({
        field: "firmRegistrationNumber",
        message: `Firm registration number format may be incorrect: ${caDetails.caFirmRegistrationNumber}`,
        severity: ValidationSeverity.WARNING,
        section: "CA Details",
      });
    }

    // Date of report
    if (caDetails.dateOfReport) {
      const reportDate = new Date(caDetails.dateOfReport);
      if (reportDate > new Date()) {
        this.results.push({
          field: "dateOfReport",
          message: "Report date is in the future",
          severity: ValidationSeverity.CRITICAL,
          section: "CA Details",
        });
      }
    }
  }

  private validateCrossReferences(formData: Form3CEB) {
    const declaredTotal = parseFloat(formData.partA.totalInternationalValue || "0");
    const calculatedTotal = formData.partB.internationalTransactions.reduce(
      (sum, txn) => sum + txn.valueAsPerBooks,
      0
    );

    if (Math.abs(declaredTotal - calculatedTotal) > 1) {
      this.results.push({
        field: "totalInternationalValue",
        message: `Part A total (₹${declaredTotal.toLocaleString()}) doesn't match Part B sum (₹${calculatedTotal.toLocaleString()})`,
        severity: ValidationSeverity.CRITICAL,
        section: "Cross-validation",
      });
    }
  }

  // Helper validation methods
  private validatePAN(pan: string): boolean {
    if (!pan || pan.length !== 10) return false;
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
  }

  private validatePINCode(pin: string): boolean {
    return !!(pin && pin.length === 6 && /^\d+$/.test(pin) && pin[0] !== "0");
  }

  private validateEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  private validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-+]/g, "");
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  }

  private validateUDIN(udin: string): boolean {
    if (!udin || udin.length !== 18) return false;
    return /^\d{8}[A-Z0-9]{10}$/.test(udin.toUpperCase());
  }

  getSummary(): {
    totalIssues: number;
    critical: number;
    errors: number;
    warnings: number;
    info: number;
    canFile: boolean;
    issuesBySection: Record<string, number>;
  } {
    const summary = {
      totalIssues: this.results.length,
      critical: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      canFile: true,
      issuesBySection: {} as Record<string, number>,
    };

    for (const result of this.results) {
      switch (result.severity) {
        case ValidationSeverity.CRITICAL:
          summary.critical++;
          summary.canFile = false;
          break;
        case ValidationSeverity.ERROR:
          summary.errors++;
          summary.canFile = false;
          break;
        case ValidationSeverity.WARNING:
          summary.warnings++;
          break;
        case ValidationSeverity.INFO:
          summary.info++;
          break;
      }

      summary.issuesBySection[result.section] = (summary.issuesBySection[result.section] || 0) + 1;
    }

    return summary;
  }
}

// =============================================================================
// FORM 3CEB BUILDER CLASS
// =============================================================================

export class Form3CEBBuilder {
  private assessee: AssesseeInfo | null = null;
  private associatedEnterprises: AssociatedEnterprise[] = [];
  private internationalTransactions: InternationalTransaction[] = [];
  private domesticTransactions: SpecifiedDomesticTransaction[] = [];
  private caDetails: CADetails | null = null;
  private assessmentYear: string = "";

  createNewForm(assesseeData: AssesseeInfo, assessmentYear: string): Form3CEBBuilder {
    this.assessee = { ...assesseeData, assessmentYear };
    this.assessmentYear = assessmentYear;
    this.associatedEnterprises = [];
    this.internationalTransactions = [];
    this.domesticTransactions = [];
    return this;
  }

  addAssociatedEnterprise(
    name: string,
    country: string,
    countryCode: string,
    address: string,
    relationshipType: RelationshipType,
    relationshipDescription: string,
    taxId?: string
  ): string {
    const aeReference = `AE${String(this.associatedEnterprises.length + 1).padStart(3, "0")}`;
    this.associatedEnterprises.push({
      aeReference,
      name,
      country,
      countryCode,
      address,
      relationshipType,
      relationshipDescription,
      taxId,
    });
    return aeReference;
  }

  addInternationalTransaction(
    aeReference: string,
    aeName: string,
    aeCountry: string,
    natureCode: TransactionNature,
    description: string,
    valueAsPerBooks: number,
    valueAsPerALP: number,
    method: TPMethod,
    methodJustification: string,
    numberOfComparables: number = 0,
    safeHarbourOpted: boolean = false,
    safeHarbourMargin?: number
  ): Form3CEBBuilder {
    const slNo = this.internationalTransactions.length + 1;
    const adjustmentRequired = valueAsPerBooks !== valueAsPerALP;
    const adjustmentAmount = Math.abs(valueAsPerBooks - valueAsPerALP);

    this.internationalTransactions.push({
      slNo,
      aeReference,
      aeName,
      aeCountry,
      natureOfTransaction: natureCode,
      description,
      valueAsPerBooks,
      valueAsPerALP,
      methodUsed: method,
      methodJustification,
      alpDetermined: valueAsPerALP,
      numberOfComparables,
      comparableSearchProcess: "",
      adjustmentRequired,
      adjustmentAmount,
      safeHarbourOpted,
      safeHarbourMargin,
      documentationMaintained: true,
    });
    return this;
  }

  addDomesticTransaction(
    partyName: string,
    partyPan: string,
    relationship: string,
    nature: SDTNature,
    sectionClaimed: string,
    description: string,
    valueAsPerBooks: number,
    valueAsPerALP: number,
    method: TPMethod
  ): Form3CEBBuilder {
    const slNo = this.domesticTransactions.length + 1;
    const adjustmentRequired = valueAsPerBooks !== valueAsPerALP;
    const adjustmentAmount = Math.abs(valueAsPerBooks - valueAsPerALP);

    this.domesticTransactions.push({
      slNo,
      partyName,
      partyPan,
      relationship,
      nature,
      sectionClaimed,
      description,
      valueAsPerBooks,
      valueAsPerALP,
      methodUsed: method,
      adjustmentRequired,
      adjustmentAmount,
    });
    return this;
  }

  addCACertification(
    caName: string,
    membershipNumber: string,
    firmName: string,
    firmRegistrationNumber: string,
    address: string,
    city: string,
    pin: string,
    udin: string,
    dateOfReport: string
  ): Form3CEBBuilder {
    this.caDetails = {
      caName,
      caMembershipNumber: membershipNumber,
      caFirmName: firmName,
      caFirmRegistrationNumber: firmRegistrationNumber,
      caAddress: address,
      caCity: city,
      caPin: pin,
      udin,
      dateOfReport,
    };
    return this;
  }

  private calculateAggregates(): {
    aggregateInternational: AggregateValue[];
    aggregateDomestic: AggregateValue[];
  } {
    // International transactions
    const intAggregates: Record<string, AggregateValue> = {};
    for (const txn of this.internationalTransactions) {
      const nature = txn.natureOfTransaction;
      if (!intAggregates[nature]) {
        intAggregates[nature] = {
          natureCode: nature,
          natureDescription: TRANSACTION_NATURE_DESCRIPTIONS[nature] || nature,
          numberOfTransactions: 0,
          totalValue: 0,
          totalAdjustment: 0,
        };
      }
      intAggregates[nature].numberOfTransactions++;
      intAggregates[nature].totalValue += txn.valueAsPerBooks;
      intAggregates[nature].totalAdjustment += txn.adjustmentAmount;
    }

    // Domestic transactions
    const domAggregates: Record<string, AggregateValue> = {};
    for (const txn of this.domesticTransactions) {
      const nature = txn.nature;
      if (!domAggregates[nature]) {
        domAggregates[nature] = {
          natureCode: nature,
          natureDescription: nature,
          numberOfTransactions: 0,
          totalValue: 0,
          totalAdjustment: 0,
        };
      }
      domAggregates[nature].numberOfTransactions++;
      domAggregates[nature].totalValue += txn.valueAsPerBooks;
      domAggregates[nature].totalAdjustment += txn.adjustmentAmount;
    }

    return {
      aggregateInternational: Object.values(intAggregates),
      aggregateDomestic: Object.values(domAggregates),
    };
  }

  build(): Form3CEB {
    if (!this.assessee) {
      throw new Error("Assessee details not provided");
    }

    const aggregates = this.calculateAggregates();
    const totalInternationalValue = this.internationalTransactions.reduce(
      (sum, txn) => sum + txn.valueAsPerBooks,
      0
    );
    const totalDomesticValue = this.domesticTransactions.reduce(
      (sum, txn) => sum + txn.valueAsPerBooks,
      0
    );
    const totalAdjustments =
      this.internationalTransactions.reduce((sum, txn) => sum + txn.adjustmentAmount, 0) +
      this.domesticTransactions.reduce((sum, txn) => sum + txn.adjustmentAmount, 0);

    return {
      formDetails: {
        formName: "3CEB",
        formVersion: "1.4",
        assessmentYear: this.assessmentYear,
        generatedOn: new Date().toISOString(),
      },
      partA: {
        assesseeDetails: this.assessee,
        aggregateInternationalTransactions: aggregates.aggregateInternational,
        aggregateDomesticTransactions: aggregates.aggregateDomestic,
        totalInternationalValue: totalInternationalValue.toString(),
        totalDomesticValue: totalDomesticValue.toString(),
        totalAdjustments: totalAdjustments.toString(),
      },
      associatedEnterprises: this.associatedEnterprises,
      partB: {
        internationalTransactions: this.internationalTransactions,
      },
      partC: {
        specifiedDomesticTransactions: this.domesticTransactions,
      },
      caDetails: this.caDetails || {
        caName: "",
        caMembershipNumber: "",
        caFirmName: "",
        caFirmRegistrationNumber: "",
        caAddress: "",
        caCity: "",
        caPin: "",
        udin: "",
        dateOfReport: "",
      },
    };
  }

  generateHash(form: Form3CEB): string {
    const data = JSON.stringify(form);
    return createHash("sha256").update(data).digest("hex");
  }
}

// Export for convenience
export const createForm3CEBBuilder = () => new Form3CEBBuilder();
export const createForm3CEBValidator = () => new Form3CEBValidator();
