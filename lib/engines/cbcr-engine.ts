/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Country-by-Country Reporting (CbCR) Engine
 *
 * Complete CbCR generation engine for Form 3CEAD compliance including
 * Table 1, Table 2, Table 3 generation, XML export, and validation.
 * ================================================================================
 */

import {
  CBCR_THRESHOLDS,
  CbCREntityRole,
  CbCRBusinessActivity,
  BUSINESS_ACTIVITY_CODES,
  KEY_JURISDICTIONS,
  JurisdictionInfo,
  Form3CEADStructure,
  Form3CEADPartA,
  Form3CEADPartB,
  Form3CEADPartC,
  CbCRTable1Row,
  CbCRTable2Row,
  CbCRTable3Entry,
  CBCR_VALIDATION_RULES,
  CBCR_XML_NAMESPACE,
  CBCR_XML_ELEMENTS,
  INDIA_CBCR_FORMS,
  isCbCRApplicable,
  calculateCbCRDeadline,
  calculateCbCRPenalty,
  getJurisdictionInfo,
  getBusinessActivityDescription,
  determineReportingRole,
  validateTable1Row,
  convertToReportingCurrency,
  generateXMLElement,
} from "./constants/cbcr-rules";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface CbCRApplicabilityInput {
  consolidatedGroupRevenue: number;
  revenueCurrency: "EUR" | "INR" | "USD";
  ultimateParentJurisdiction: string;
  reportingFiscalYearEnd: Date;
  indianEntityExists: boolean;
  indianEntityConsolidatedRevenue?: number;
}

export interface CbCRApplicabilityResult {
  isApplicable: boolean;
  threshold: number;
  actualRevenue: number;
  currency: string;
  filingRequirements: FilingRequirement[];
  deadlines: CbCRDeadlines;
  reportingEntityRole: CbCREntityRole;
  reasons: string[];
}

export interface FilingRequirement {
  form: string;
  description: string;
  required: boolean;
  deadline: Date;
  filingAuthority: string;
}

export interface CbCRDeadlines {
  notification: Date;
  cbcReport: Date;
  masterFile: Date;
  localFile: Date;
}

export interface EntityData {
  entityId: string;
  entityName: string;
  jurisdictionOfTaxResidence: string;
  jurisdictionOfIncorporation: string;
  taxIdentificationNumber?: string;
  businessActivities: CbCRBusinessActivity[];
  isUltimateParent: boolean;
  isSurrogateParent: boolean;
  isReportingEntity: boolean;
  financials: EntityFinancials;
  operationalData: EntityOperationalData;
}

export interface EntityFinancials {
  fiscalYearEnd: Date;
  revenueFromUnrelated: number;
  revenueFromRelated: number;
  profitLossBeforeTax: number;
  incomeTaxPaid: number;
  incomeTaxAccrued: number;
  statedCapital: number;
  accumulatedEarnings: number;
  tangibleAssetsOtherThanCash: number;
  currency: string;
}

export interface EntityOperationalData {
  numberOfEmployees: number;
  mainBusinessDescription: string;
}

export interface CbCRInput {
  reportingEntity: ReportingEntityInfo;
  ultimateParent: UltimateParentInfo;
  constituentEntities: EntityData[];
  reportingFiscalYear: {
    startDate: Date;
    endDate: Date;
  };
  reportingCurrency: string;
  exchangeRates: Record<string, number>; // currency code to reporting currency rate
  additionalInfo?: string[];
}

export interface ReportingEntityInfo {
  name: string;
  pan: string;
  address: string;
  role: CbCREntityRole;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface UltimateParentInfo {
  name: string;
  jurisdiction: string;
  taxIdentificationNumber?: string;
  address: string;
}

export interface CbCRGenerationResult {
  form3CEAD: Form3CEADStructure;
  validationResult: CbCRValidationResult;
  xmlOutput?: string;
  summaryStatistics: CbCRSummaryStatistics;
  filingGuidance: string[];
}

export interface CbCRValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  completenessScore: number;
}

export interface ValidationIssue {
  ruleId: string;
  severity: "error" | "warning";
  message: string;
  affectedJurisdiction?: string;
  affectedEntity?: string;
}

export interface CbCRSummaryStatistics {
  totalJurisdictions: number;
  totalEntities: number;
  totalRevenue: number;
  totalProfitLoss: number;
  totalEmployees: number;
  totalTaxPaid: number;
  totalTaxAccrued: number;
  revenueByJurisdiction: Record<string, number>;
  entitiesByJurisdiction: Record<string, number>;
  effectiveTaxRateByJurisdiction: Record<string, number>;
}

export interface JurisdictionAggregation {
  jurisdictionCode: string;
  jurisdictionName: string;
  entities: EntityData[];
  aggregatedFinancials: {
    totalRevenueUnrelated: number;
    totalRevenueRelated: number;
    totalRevenue: number;
    totalProfitLoss: number;
    totalTaxPaid: number;
    totalTaxAccrued: number;
    totalCapital: number;
    totalEarnings: number;
    totalEmployees: number;
    totalTangibleAssets: number;
  };
}

// =============================================================================
// CBCR ENGINE CLASS
// =============================================================================

export class CbCREngine {
  private reportingCurrency: string;
  private exchangeRates: Record<string, number>;

  constructor(reportingCurrency: string = "INR") {
    this.reportingCurrency = reportingCurrency;
    this.exchangeRates = { [reportingCurrency]: 1 };
  }

  // ===========================================================================
  // APPLICABILITY CHECK
  // ===========================================================================

  /**
   * Check if CbCR is applicable for the group
   */
  checkCbCRApplicability(input: CbCRApplicabilityInput): CbCRApplicabilityResult {
    const threshold = CBCR_THRESHOLDS.groupRevenueThreshold[
      input.revenueCurrency.toLowerCase() as keyof typeof CBCR_THRESHOLDS.groupRevenueThreshold
    ];

    const isApplicable = isCbCRApplicable(input.consolidatedGroupRevenue, input.revenueCurrency);
    const reasons: string[] = [];
    const filingRequirements: FilingRequirement[] = [];

    if (isApplicable) {
      reasons.push(
        `Consolidated group revenue (${input.consolidatedGroupRevenue.toLocaleString()} ${input.revenueCurrency}) ` +
          `exceeds threshold (${threshold.toLocaleString()} ${input.revenueCurrency})`
      );

      // Determine filing requirements
      const notificationDeadline = calculateCbCRDeadline(input.reportingFiscalYearEnd, "notification");
      const reportDeadline = calculateCbCRDeadline(input.reportingFiscalYearEnd, "report");

      filingRequirements.push({
        form: INDIA_CBCR_FORMS.notification.formNumber,
        description: INDIA_CBCR_FORMS.notification.description,
        required: input.indianEntityExists,
        deadline: notificationDeadline,
        filingAuthority: INDIA_CBCR_FORMS.notification.filingAuthority,
      });

      filingRequirements.push({
        form: INDIA_CBCR_FORMS.report.formNumber,
        description: INDIA_CBCR_FORMS.report.description,
        required: this.isReportingRequired(input),
        deadline: reportDeadline,
        filingAuthority: INDIA_CBCR_FORMS.report.filingAuthority,
      });

      filingRequirements.push({
        form: INDIA_CBCR_FORMS.masterFile.formNumber,
        description: INDIA_CBCR_FORMS.masterFile.description,
        required: input.indianEntityExists && (input.indianEntityConsolidatedRevenue || 0) >= 500000000, // Rs. 50 Cr
        deadline: reportDeadline,
        filingAuthority: INDIA_CBCR_FORMS.masterFile.filingAuthority,
      });
    } else {
      reasons.push(
        `Consolidated group revenue (${input.consolidatedGroupRevenue.toLocaleString()} ${input.revenueCurrency}) ` +
          `is below threshold (${threshold.toLocaleString()} ${input.revenueCurrency})`
      );
    }

    // Determine reporting entity role
    const parentJurisdictionInfo = getJurisdictionInfo(input.ultimateParentJurisdiction);
    const reportingEntityRole = determineReportingRole(
      input.ultimateParentJurisdiction === "IN",
      false,
      parentJurisdictionInfo?.hasCbCRExchange || false
    );

    return {
      isApplicable,
      threshold,
      actualRevenue: input.consolidatedGroupRevenue,
      currency: input.revenueCurrency,
      filingRequirements,
      deadlines: {
        notification: calculateCbCRDeadline(input.reportingFiscalYearEnd, "notification"),
        cbcReport: calculateCbCRDeadline(input.reportingFiscalYearEnd, "report"),
        masterFile: calculateCbCRDeadline(input.reportingFiscalYearEnd, "masterFile"),
        localFile: this.calculateLocalFileDeadline(input.reportingFiscalYearEnd),
      },
      reportingEntityRole,
      reasons,
    };
  }

  private isReportingRequired(input: CbCRApplicabilityInput): boolean {
    // Reporting required if India is UPE jurisdiction or surrogate/secondary filing needed
    if (input.ultimateParentJurisdiction === "IN") {
      return true;
    }

    // Check if parent jurisdiction has exchange agreement with India
    const parentInfo = getJurisdictionInfo(input.ultimateParentJurisdiction);
    if (!parentInfo?.hasCbCRExchange) {
      return true; // Secondary filing required
    }

    return false;
  }

  private calculateLocalFileDeadline(reportingYearEnd: Date): Date {
    // Local file due with return of income (typically 30th November)
    const deadline = new Date(reportingYearEnd);
    deadline.setMonth(10); // November
    deadline.setDate(30);
    if (deadline <= reportingYearEnd) {
      deadline.setFullYear(deadline.getFullYear() + 1);
    }
    return deadline;
  }

  // ===========================================================================
  // TABLE GENERATION
  // ===========================================================================

  /**
   * Generate complete CbCR (Form 3CEAD)
   */
  generateCbCR(input: CbCRInput): CbCRGenerationResult {
    this.exchangeRates = input.exchangeRates;
    this.reportingCurrency = input.reportingCurrency;

    // Generate Form 3CEAD structure
    const form3CEAD = this.generateForm3CEAD(input);

    // Validate the report
    const validationResult = this.validateCbCR(form3CEAD, input.constituentEntities);

    // Generate XML
    const xmlOutput = this.generateXML(form3CEAD);

    // Calculate summary statistics
    const summaryStatistics = this.calculateSummaryStatistics(form3CEAD.partB.table1);

    // Generate filing guidance
    const filingGuidance = this.generateFilingGuidance(input, validationResult);

    return {
      form3CEAD,
      validationResult,
      xmlOutput,
      summaryStatistics,
      filingGuidance,
    };
  }

  /**
   * Generate Form 3CEAD structure
   */
  private generateForm3CEAD(input: CbCRInput): Form3CEADStructure {
    return {
      partA: this.generatePartA(input),
      partB: this.generatePartB(input),
      partC: this.generatePartC(input),
    };
  }

  /**
   * Generate Part A - Reporting Entity Information
   */
  private generatePartA(input: CbCRInput): Form3CEADPartA {
    return {
      reportingEntityName: input.reportingEntity.name,
      reportingEntityPAN: input.reportingEntity.pan,
      reportingEntityAddress: input.reportingEntity.address,
      reportingEntityRole: input.reportingEntity.role,
      reportingFiscalYear: input.reportingFiscalYear,
      ultimateParentName: input.ultimateParent.name,
      ultimateParentJurisdiction: input.ultimateParent.jurisdiction,
      ultimateParentTIN: input.ultimateParent.taxIdentificationNumber,
    };
  }

  /**
   * Generate Part B - Tables 1 and 2
   */
  private generatePartB(input: CbCRInput): Form3CEADPartB {
    const jurisdictionAggregations = this.aggregateByJurisdiction(input.constituentEntities);

    const table1 = this.generateTable1(jurisdictionAggregations);
    const table2 = this.generateTable2(input.constituentEntities);

    return { table1, table2 };
  }

  /**
   * Generate Table 1 - Jurisdiction-wise aggregation
   */
  generateTable1(jurisdictionData: JurisdictionAggregation[]): CbCRTable1Row[] {
    return jurisdictionData.map((jd) => ({
      jurisdictionCode: jd.jurisdictionCode,
      jurisdictionName: jd.jurisdictionName,
      revenues: {
        unrelatedParty: jd.aggregatedFinancials.totalRevenueUnrelated,
        relatedParty: jd.aggregatedFinancials.totalRevenueRelated,
        total: jd.aggregatedFinancials.totalRevenue,
      },
      profitOrLossBeforeTax: jd.aggregatedFinancials.totalProfitLoss,
      incomeTaxPaid: jd.aggregatedFinancials.totalTaxPaid,
      incomeTaxAccrued: jd.aggregatedFinancials.totalTaxAccrued,
      statedCapital: jd.aggregatedFinancials.totalCapital,
      accumulatedEarnings: jd.aggregatedFinancials.totalEarnings,
      numberOfEmployees: jd.aggregatedFinancials.totalEmployees,
      tangibleAssetsOtherThanCash: jd.aggregatedFinancials.totalTangibleAssets,
    }));
  }

  /**
   * Generate Table 2 - Entity listing by jurisdiction
   */
  generateTable2(entityData: EntityData[]): CbCRTable2Row[] {
    return entityData.map((entity) => ({
      jurisdictionCode: entity.jurisdictionOfTaxResidence,
      jurisdictionName: getJurisdictionInfo(entity.jurisdictionOfTaxResidence)?.name ||
        entity.jurisdictionOfTaxResidence,
      constituentEntityName: entity.entityName,
      jurisdictionOfIncorporation: entity.jurisdictionOfIncorporation,
      taxIdentificationNumber: entity.taxIdentificationNumber,
      mainBusinessActivities: entity.businessActivities,
    }));
  }

  /**
   * Generate Table 3 - Additional Information
   */
  generateTable3(additionalInfo?: string[]): CbCRTable3Entry[] {
    const entries: CbCRTable3Entry[] = [];

    // Standard additional information items
    entries.push({
      item: "Source of Data",
      description: "The data has been sourced from the audited consolidated financial statements " +
        "prepared under applicable accounting standards.",
    });

    entries.push({
      item: "Currency",
      description: `All amounts are reported in ${this.reportingCurrency}. ` +
        "Foreign currency amounts have been converted using year-end exchange rates.",
    });

    entries.push({
      item: "Revenue Definition",
      description: "Revenue includes operating revenue, interest income, and other income " +
        "as per the entity's financial statements.",
    });

    // Add custom additional information
    if (additionalInfo) {
      additionalInfo.forEach((info, index) => {
        entries.push({
          item: `Additional Note ${index + 1}`,
          description: info,
        });
      });
    }

    return entries;
  }

  /**
   * Generate Part C - Additional Information
   */
  private generatePartC(input: CbCRInput): Form3CEADPartC {
    return {
      additionalInfo: this.generateTable3(input.additionalInfo),
    };
  }

  // ===========================================================================
  // DATA AGGREGATION
  // ===========================================================================

  /**
   * Aggregate entity data by jurisdiction
   */
  private aggregateByJurisdiction(entities: EntityData[]): JurisdictionAggregation[] {
    const jurisdictionMap = new Map<string, EntityData[]>();

    // Group entities by tax residence jurisdiction
    entities.forEach((entity) => {
      const jurisdiction = entity.jurisdictionOfTaxResidence;
      if (!jurisdictionMap.has(jurisdiction)) {
        jurisdictionMap.set(jurisdiction, []);
      }
      jurisdictionMap.get(jurisdiction)!.push(entity);
    });

    // Aggregate financials for each jurisdiction
    const aggregations: JurisdictionAggregation[] = [];

    jurisdictionMap.forEach((jurisdictionEntities, jurisdictionCode) => {
      const jurisdictionInfo = getJurisdictionInfo(jurisdictionCode);

      const aggregatedFinancials = this.aggregateFinancials(jurisdictionEntities);

      aggregations.push({
        jurisdictionCode,
        jurisdictionName: jurisdictionInfo?.name || jurisdictionCode,
        entities: jurisdictionEntities,
        aggregatedFinancials,
      });
    });

    return aggregations.sort((a, b) => a.jurisdictionCode.localeCompare(b.jurisdictionCode));
  }

  /**
   * Aggregate financials for a set of entities
   */
  private aggregateFinancials(entities: EntityData[]): JurisdictionAggregation["aggregatedFinancials"] {
    const result = {
      totalRevenueUnrelated: 0,
      totalRevenueRelated: 0,
      totalRevenue: 0,
      totalProfitLoss: 0,
      totalTaxPaid: 0,
      totalTaxAccrued: 0,
      totalCapital: 0,
      totalEarnings: 0,
      totalEmployees: 0,
      totalTangibleAssets: 0,
    };

    entities.forEach((entity) => {
      const rate = this.exchangeRates[entity.financials.currency] || 1;

      result.totalRevenueUnrelated += this.convert(entity.financials.revenueFromUnrelated, rate);
      result.totalRevenueRelated += this.convert(entity.financials.revenueFromRelated, rate);
      result.totalProfitLoss += this.convert(entity.financials.profitLossBeforeTax, rate);
      result.totalTaxPaid += this.convert(entity.financials.incomeTaxPaid, rate);
      result.totalTaxAccrued += this.convert(entity.financials.incomeTaxAccrued, rate);
      result.totalCapital += this.convert(entity.financials.statedCapital, rate);
      result.totalEarnings += this.convert(entity.financials.accumulatedEarnings, rate);
      result.totalTangibleAssets += this.convert(entity.financials.tangibleAssetsOtherThanCash, rate);
      result.totalEmployees += entity.operationalData.numberOfEmployees;
    });

    result.totalRevenue = result.totalRevenueUnrelated + result.totalRevenueRelated;

    return result;
  }

  private convert(amount: number, rate: number): number {
    return Math.round(amount * rate * 100) / 100;
  }

  // ===========================================================================
  // VALIDATION
  // ===========================================================================

  /**
   * Validate complete CbCR
   */
  validateCbCR(
    form3CEAD: Form3CEADStructure,
    entities: EntityData[]
  ): CbCRValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Validate Part A
    this.validatePartA(form3CEAD.partA, errors, warnings);

    // Validate Table 1
    form3CEAD.partB.table1.forEach((row) => {
      const rowValidation = validateTable1Row(row);
      rowValidation.errors.forEach((e) => {
        errors.push({
          ruleId: "TABLE1-ERR",
          severity: "error",
          message: e,
          affectedJurisdiction: row.jurisdictionCode,
        });
      });
      rowValidation.warnings.forEach((w) => {
        warnings.push({
          ruleId: "TABLE1-WARN",
          severity: "warning",
          message: w,
          affectedJurisdiction: row.jurisdictionCode,
        });
      });
    });

    // Validate Table 2
    this.validateTable2(form3CEAD.partB.table2, errors, warnings);

    // Cross-validation between Table 1 and Table 2
    this.crossValidateTables(form3CEAD.partB.table1, form3CEAD.partB.table2, errors, warnings);

    // Calculate completeness score
    const completenessScore = this.calculateCompletenessScore(form3CEAD, entities);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completenessScore,
    };
  }

  private validatePartA(
    partA: Form3CEADPartA,
    errors: ValidationIssue[],
    warnings: ValidationIssue[]
  ): void {
    if (!partA.reportingEntityPAN || partA.reportingEntityPAN.length !== 10) {
      errors.push({
        ruleId: "PARTA-001",
        severity: "error",
        message: "Invalid PAN format for reporting entity",
      });
    }

    if (!partA.ultimateParentJurisdiction) {
      errors.push({
        ruleId: "PARTA-002",
        severity: "error",
        message: "Ultimate parent jurisdiction is required",
      });
    }

    if (!partA.reportingFiscalYear.startDate || !partA.reportingFiscalYear.endDate) {
      errors.push({
        ruleId: "PARTA-003",
        severity: "error",
        message: "Reporting fiscal year dates are required",
      });
    }
  }

  private validateTable2(
    table2: CbCRTable2Row[],
    errors: ValidationIssue[],
    warnings: ValidationIssue[]
  ): void {
    table2.forEach((row) => {
      if (row.mainBusinessActivities.length === 0) {
        errors.push({
          ruleId: "TABLE2-001",
          severity: "error",
          message: `No business activities selected for ${row.constituentEntityName}`,
          affectedEntity: row.constituentEntityName,
        });
      }

      if (!row.jurisdictionCode) {
        errors.push({
          ruleId: "TABLE2-002",
          severity: "error",
          message: `Missing jurisdiction for ${row.constituentEntityName}`,
          affectedEntity: row.constituentEntityName,
        });
      }
    });
  }

  private crossValidateTables(
    table1: CbCRTable1Row[],
    table2: CbCRTable2Row[],
    errors: ValidationIssue[],
    warnings: ValidationIssue[]
  ): void {
    // Check all Table 2 jurisdictions appear in Table 1
    const table1Jurisdictions = new Set(table1.map((r) => r.jurisdictionCode));
    const table2Jurisdictions = new Set(table2.map((r) => r.jurisdictionCode));

    table2Jurisdictions.forEach((jur) => {
      if (!table1Jurisdictions.has(jur)) {
        errors.push({
          ruleId: "CROSS-001",
          severity: "error",
          message: `Jurisdiction ${jur} appears in Table 2 but not in Table 1`,
          affectedJurisdiction: jur,
        });
      }
    });

    // Check entity count consistency
    table1.forEach((row) => {
      const entityCount = table2.filter((e) => e.jurisdictionCode === row.jurisdictionCode).length;
      if (entityCount === 0 && row.revenues.total > 0) {
        warnings.push({
          ruleId: "CROSS-002",
          severity: "warning",
          message: `Jurisdiction ${row.jurisdictionCode} has revenue but no entities listed`,
          affectedJurisdiction: row.jurisdictionCode,
        });
      }
    });
  }

  private calculateCompletenessScore(
    form3CEAD: Form3CEADStructure,
    entities: EntityData[]
  ): number {
    let score = 0;
    const maxScore = 100;

    // Part A completeness (20 points)
    if (form3CEAD.partA.reportingEntityPAN) score += 5;
    if (form3CEAD.partA.ultimateParentJurisdiction) score += 5;
    if (form3CEAD.partA.reportingFiscalYear.startDate && form3CEAD.partA.reportingFiscalYear.endDate) score += 10;

    // Table 1 completeness (40 points)
    const table1Filled = form3CEAD.partB.table1.length > 0;
    if (table1Filled) {
      score += 20;
      // Check for complete data in each row
      const completeRows = form3CEAD.partB.table1.filter(
        (row) =>
          row.revenues.total >= 0 &&
          row.numberOfEmployees >= 0 &&
          row.tangibleAssetsOtherThanCash >= 0
      ).length;
      score += Math.min(20, (completeRows / form3CEAD.partB.table1.length) * 20);
    }

    // Table 2 completeness (30 points)
    const table2Filled = form3CEAD.partB.table2.length > 0;
    if (table2Filled) {
      score += 15;
      const entitiesWithActivities = form3CEAD.partB.table2.filter(
        (row) => row.mainBusinessActivities.length > 0
      ).length;
      score += Math.min(15, (entitiesWithActivities / form3CEAD.partB.table2.length) * 15);
    }

    // Table 3 completeness (10 points)
    if (form3CEAD.partC.additionalInfo.length > 0) score += 10;

    return Math.round(score);
  }

  // ===========================================================================
  // XML GENERATION
  // ===========================================================================

  /**
   * Generate XML output for CbCR
   */
  generateXML(form3CEAD: Form3CEADStructure): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<${CBCR_XML_ELEMENTS.root} xmlns="${CBCR_XML_NAMESPACE}">\n`;

    // Message Spec
    xml += this.generateMessageSpecXML(form3CEAD.partA);

    // CbC Body
    xml += `  <${CBCR_XML_ELEMENTS.cbcBody}>\n`;

    // Reporting Entity
    xml += this.generateReportingEntityXML(form3CEAD.partA);

    // CbC Reports (Table 1)
    xml += this.generateCbCReportsXML(form3CEAD.partB.table1);

    // Constituent Entities (Table 2)
    form3CEAD.partB.table2.forEach((entity) => {
      xml += this.generateConstituentEntityXML(entity);
    });

    // Additional Info (Table 3)
    form3CEAD.partC.additionalInfo.forEach((info) => {
      xml += this.generateAdditionalInfoXML(info);
    });

    xml += `  </${CBCR_XML_ELEMENTS.cbcBody}>\n`;
    xml += `</${CBCR_XML_ELEMENTS.root}>`;

    return xml;
  }

  private generateMessageSpecXML(partA: Form3CEADPartA): string {
    return `  <${CBCR_XML_ELEMENTS.messageSpec}>
    <SendingEntityIN>${partA.reportingEntityPAN}</SendingEntityIN>
    <TransmittingCountry>IN</TransmittingCountry>
    <MessageType>CBC</MessageType>
    <ReportingPeriod>${partA.reportingFiscalYear.endDate.toISOString().split("T")[0]}</ReportingPeriod>
  </${CBCR_XML_ELEMENTS.messageSpec}>\n`;
  }

  private generateReportingEntityXML(partA: Form3CEADPartA): string {
    return `    <${CBCR_XML_ELEMENTS.reportingEntity}>
      <Entity>
        <Name>${this.escapeXML(partA.reportingEntityName)}</Name>
        <TIN issuedBy="IN">${partA.reportingEntityPAN}</TIN>
      </Entity>
      <ReportingRole>${partA.reportingEntityRole}</ReportingRole>
    </${CBCR_XML_ELEMENTS.reportingEntity}>\n`;
  }

  private generateCbCReportsXML(table1: CbCRTable1Row[]): string {
    let xml = "";

    table1.forEach((row) => {
      xml += `    <${CBCR_XML_ELEMENTS.cbcReports}>
      <ResCountryCode>${row.jurisdictionCode}</ResCountryCode>
      <${CBCR_XML_ELEMENTS.summary}>
        <Revenues>
          <Unrelated>${row.revenues.unrelatedParty}</Unrelated>
          <Related>${row.revenues.relatedParty}</Related>
          <Total>${row.revenues.total}</Total>
        </Revenues>
        <ProfitOrLoss>${row.profitOrLossBeforeTax}</ProfitOrLoss>
        <TaxPaid>${row.incomeTaxPaid}</TaxPaid>
        <TaxAccrued>${row.incomeTaxAccrued}</TaxAccrued>
        <Capital>${row.statedCapital}</Capital>
        <Earnings>${row.accumulatedEarnings}</Earnings>
        <NbEmployees>${row.numberOfEmployees}</NbEmployees>
        <Assets>${row.tangibleAssetsOtherThanCash}</Assets>
      </${CBCR_XML_ELEMENTS.summary}>
    </${CBCR_XML_ELEMENTS.cbcReports}>\n`;
    });

    return xml;
  }

  private generateConstituentEntityXML(entity: CbCRTable2Row): string {
    const activities = entity.mainBusinessActivities
      .map((a) => `        <BizActivity>${a}</BizActivity>`)
      .join("\n");

    return `    <${CBCR_XML_ELEMENTS.constituentEntity}>
      <ResCountryCode>${entity.jurisdictionCode}</ResCountryCode>
      <Name>${this.escapeXML(entity.constituentEntityName)}</Name>
      <IncorpCountryCode>${entity.jurisdictionOfIncorporation}</IncorpCountryCode>
${entity.taxIdentificationNumber ? `      <TIN>${entity.taxIdentificationNumber}</TIN>\n` : ""}      <BizActivities>
${activities}
      </BizActivities>
    </${CBCR_XML_ELEMENTS.constituentEntity}>\n`;
  }

  private generateAdditionalInfoXML(info: CbCRTable3Entry): string {
    return `    <${CBCR_XML_ELEMENTS.additionalInfo}>
      <OtherInfo>${this.escapeXML(info.description)}</OtherInfo>
    </${CBCR_XML_ELEMENTS.additionalInfo}>\n`;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // ===========================================================================
  // STATISTICS AND REPORTING
  // ===========================================================================

  /**
   * Calculate summary statistics from Table 1
   */
  private calculateSummaryStatistics(table1: CbCRTable1Row[]): CbCRSummaryStatistics {
    const stats: CbCRSummaryStatistics = {
      totalJurisdictions: table1.length,
      totalEntities: 0,
      totalRevenue: 0,
      totalProfitLoss: 0,
      totalEmployees: 0,
      totalTaxPaid: 0,
      totalTaxAccrued: 0,
      revenueByJurisdiction: {},
      entitiesByJurisdiction: {},
      effectiveTaxRateByJurisdiction: {},
    };

    table1.forEach((row) => {
      stats.totalRevenue += row.revenues.total;
      stats.totalProfitLoss += row.profitOrLossBeforeTax;
      stats.totalEmployees += row.numberOfEmployees;
      stats.totalTaxPaid += row.incomeTaxPaid;
      stats.totalTaxAccrued += row.incomeTaxAccrued;

      stats.revenueByJurisdiction[row.jurisdictionCode] = row.revenues.total;

      // Calculate effective tax rate
      if (row.profitOrLossBeforeTax > 0) {
        stats.effectiveTaxRateByJurisdiction[row.jurisdictionCode] =
          (row.incomeTaxAccrued / row.profitOrLossBeforeTax) * 100;
      } else {
        stats.effectiveTaxRateByJurisdiction[row.jurisdictionCode] = 0;
      }
    });

    return stats;
  }

  /**
   * Generate filing guidance based on validation results
   */
  private generateFilingGuidance(
    input: CbCRInput,
    validationResult: CbCRValidationResult
  ): string[] {
    const guidance: string[] = [];

    if (validationResult.isValid) {
      guidance.push("CbCR is complete and ready for filing.");
    } else {
      guidance.push(`CbCR has ${validationResult.errors.length} error(s) that must be resolved before filing.`);
    }

    if (validationResult.warnings.length > 0) {
      guidance.push(`${validationResult.warnings.length} warning(s) should be reviewed.`);
    }

    guidance.push(
      `File Form 3CEAD electronically with DGIT (Risk Assessment) by ` +
        `${calculateCbCRDeadline(input.reportingFiscalYear.endDate, "report").toLocaleDateString()}.`
    );

    guidance.push(
      "Ensure Form 3CEAC (notification) was filed within 2 months of FY end."
    );

    if (input.constituentEntities.length > 50) {
      guidance.push(
        "Large number of entities - consider splitting XML upload if file size exceeds limits."
      );
    }

    return guidance;
  }

  /**
   * Prepare Form 3CEAD data for PDF generation
   */
  prepareForm3CEAD(result: CbCRGenerationResult): Record<string, unknown> {
    return {
      reportingEntity: result.form3CEAD.partA,
      table1: result.form3CEAD.partB.table1,
      table2: result.form3CEAD.partB.table2,
      table3: result.form3CEAD.partC.additionalInfo,
      statistics: result.summaryStatistics,
      validationStatus: result.validationResult.isValid ? "Valid" : "Errors Found",
      completenessScore: result.validationResult.completenessScore,
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createCbCREngine(reportingCurrency?: string): CbCREngine {
  return new CbCREngine(reportingCurrency);
}

let _cbcrEngineInstance: CbCREngine | null = null;

export function getCbCREngine(): CbCREngine {
  if (!_cbcrEngineInstance) {
    _cbcrEngineInstance = createCbCREngine();
  }
  return _cbcrEngineInstance;
}

// Re-export types and enums
export {
  CbCREntityRole,
  CbCRBusinessActivity,
  CBCR_THRESHOLDS,
  INDIA_CBCR_FORMS,
  KEY_JURISDICTIONS,
};
