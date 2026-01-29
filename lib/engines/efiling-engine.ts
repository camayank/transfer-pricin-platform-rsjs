/**
 * E-filing Engine
 * Orchestrates ITD portal submission workflows
 */

import {
  ITDEfilingConnector,
  EfilingSubmission,
  SubmissionRequest,
  SubmissionResponse,
  SubmissionStatus,
  FormType,
  XMLValidationResult,
  SubmissionError,
  createITDEfilingConnector,
  getFormTypes,
  getFormSchema,
  getFormDeadline,
  isFormOverdue,
  getDaysUntilDeadline,
  FORM_SCHEMAS
} from "../connectors/itd-portal-connector";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface EfilingEngineConfig {
  clientId?: string;
  clientSecret?: string;
  environment: "SANDBOX" | "PRODUCTION";
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number; // milliseconds
  enableAuditLog: boolean;
}

export interface Form3CEBData {
  assessmentYear: string;
  pan: string;
  assessee: {
    name: string;
    address: string;
    email: string;
    status: string;
  };
  accountant: {
    name: string;
    membershipNumber: string;
    firmName?: string;
    address: string;
  };
  internationalTransactions: InternationalTransactionEntry[];
  specifiedDomesticTransactions: InternationalTransactionEntry[];
  declaration: {
    date: string;
    place: string;
  };
}

export interface InternationalTransactionEntry {
  serialNumber: number;
  natureCode: string;
  description: string;
  associatedEnterprise: {
    name: string;
    country: string;
    relationship: string;
  };
  amountReceived: number;
  amountPaid: number;
  method: string;
  pliBasis?: string;
  armLengthPrice: number;
  adjustmentMade: boolean;
  adjustmentAmount?: number;
}

export interface Form3CEAAData {
  assessmentYear: string;
  pan: string;
  organisationalStructure: {
    ultimateParentName: string;
    ultimateParentCountry: string;
    groupEntities: Array<{
      name: string;
      country: string;
      nature: string;
    }>;
  };
  businessDescription: string;
  intangibles: {
    strategy: string;
    keyIntangibles: string[];
    developmentLocations: string[];
  };
  intercompanyFinancing: {
    description: string;
    financingArrangements: Array<{
      type: string;
      terms: string;
    }>;
  };
  financialAndTaxPosition: {
    consolidatedStatements: boolean;
    taxRulings: string[];
  };
}

export interface Form3CEADData {
  assessmentYear: string;
  pan: string;
  reportingFiscalYear: string;
  reportingEntityDetails: {
    name: string;
    country: string;
    role: "ULTIMATE_PARENT" | "SURROGATE_PARENT" | "CONSTITUENT";
  };
  jurisdictionData: JurisdictionEntry[];
  entityData: CbCREntityEntry[];
}

export interface JurisdictionEntry {
  jurisdiction: string;
  unrelatedPartyRevenue: number;
  relatedPartyRevenue: number;
  totalRevenue: number;
  profitBeforeTax: number;
  incomeTaxPaid: number;
  incomeTaxAccrued: number;
  statedCapital: number;
  accumulatedEarnings: number;
  numberOfEmployees: number;
  tangibleAssets: number;
}

export interface CbCREntityEntry {
  entityName: string;
  jurisdiction: string;
  taxJurisdiction: string;
  businessActivities: string[];
}

export interface SubmissionWorkflow {
  submissionId: string;
  formType: FormType;
  status: SubmissionStatus;
  steps: WorkflowStep[];
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WorkflowStep {
  name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "SKIPPED";
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  formType: FormType;
  pan: string;
  assessmentYear: string;
  user?: string;
  status: string;
  details?: Record<string, unknown>;
}

export interface ComplianceStatus {
  pan: string;
  assessmentYear: string;
  forms: {
    formType: FormType;
    required: boolean;
    status: SubmissionStatus | "NOT_STARTED";
    deadline: string;
    daysUntilDeadline: number | null;
    overdue: boolean;
    acknowledgmentNumber?: string;
  }[];
  overallCompliance: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT" | "PENDING";
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: EfilingEngineConfig = {
  environment: "SANDBOX",
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 5000,
  enableAuditLog: true
};

// =============================================================================
// XML GENERATORS
// =============================================================================

function generateForm3CEBXML(data: Form3CEBData): string {
  const transactionsXML = data.internationalTransactions.map((t, i) => `
    <InternationalTransaction>
      <SerialNumber>${i + 1}</SerialNumber>
      <NatureCode>${t.natureCode}</NatureCode>
      <Description>${escapeXML(t.description)}</Description>
      <AssociatedEnterprise>
        <Name>${escapeXML(t.associatedEnterprise.name)}</Name>
        <Country>${t.associatedEnterprise.country}</Country>
        <Relationship>${t.associatedEnterprise.relationship}</Relationship>
      </AssociatedEnterprise>
      <AmountReceived>${t.amountReceived}</AmountReceived>
      <AmountPaid>${t.amountPaid}</AmountPaid>
      <Method>${t.method}</Method>
      <ArmLengthPrice>${t.armLengthPrice}</ArmLengthPrice>
      <AdjustmentMade>${t.adjustmentMade}</AdjustmentMade>
      ${t.adjustmentAmount ? `<AdjustmentAmount>${t.adjustmentAmount}</AdjustmentAmount>` : ""}
    </InternationalTransaction>
  `).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Form3CEB xmlns="http://www.incometaxindia.gov.in/form3ceb" version="${FORM_SCHEMAS.FORM_3CEB.version}">
  <AssessmentYear>${data.assessmentYear}</AssessmentYear>
  <PAN>${data.pan}</PAN>
  <Assessee>
    <Name>${escapeXML(data.assessee.name)}</Name>
    <Address>${escapeXML(data.assessee.address)}</Address>
    <Email>${data.assessee.email}</Email>
    <Status>${data.assessee.status}</Status>
  </Assessee>
  <Accountant>
    <Name>${escapeXML(data.accountant.name)}</Name>
    <MembershipNumber>${data.accountant.membershipNumber}</MembershipNumber>
    ${data.accountant.firmName ? `<FirmName>${escapeXML(data.accountant.firmName)}</FirmName>` : ""}
    <Address>${escapeXML(data.accountant.address)}</Address>
  </Accountant>
  <InternationalTransactions>
    ${transactionsXML}
  </InternationalTransactions>
  <Declaration>
    <Date>${data.declaration.date}</Date>
    <Place>${data.declaration.place}</Place>
  </Declaration>
</Form3CEB>`;
}

function generateForm3CEAAXML(data: Form3CEAAData): string {
  const entitiesXML = data.organisationalStructure.groupEntities.map(e => `
    <Entity>
      <Name>${escapeXML(e.name)}</Name>
      <Country>${e.country}</Country>
      <Nature>${e.nature}</Nature>
    </Entity>
  `).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Form3CEAA xmlns="http://www.incometaxindia.gov.in/form3ceaa" version="${FORM_SCHEMAS.FORM_3CEAA.version}">
  <AssessmentYear>${data.assessmentYear}</AssessmentYear>
  <PAN>${data.pan}</PAN>
  <OrganisationalStructure>
    <UltimateParent>
      <Name>${escapeXML(data.organisationalStructure.ultimateParentName)}</Name>
      <Country>${data.organisationalStructure.ultimateParentCountry}</Country>
    </UltimateParent>
    <GroupEntities>
      ${entitiesXML}
    </GroupEntities>
  </OrganisationalStructure>
  <BusinessDescription>${escapeXML(data.businessDescription)}</BusinessDescription>
  <Intangibles>
    <Strategy>${escapeXML(data.intangibles.strategy)}</Strategy>
    <KeyIntangibles>${data.intangibles.keyIntangibles.join(", ")}</KeyIntangibles>
  </Intangibles>
</Form3CEAA>`;
}

function generateForm3CEADXML(data: Form3CEADData): string {
  const jurisdictionsXML = data.jurisdictionData.map(j => `
    <JurisdictionEntry>
      <Jurisdiction>${j.jurisdiction}</Jurisdiction>
      <UnrelatedPartyRevenue>${j.unrelatedPartyRevenue}</UnrelatedPartyRevenue>
      <RelatedPartyRevenue>${j.relatedPartyRevenue}</RelatedPartyRevenue>
      <TotalRevenue>${j.totalRevenue}</TotalRevenue>
      <ProfitBeforeTax>${j.profitBeforeTax}</ProfitBeforeTax>
      <IncomeTaxPaid>${j.incomeTaxPaid}</IncomeTaxPaid>
      <IncomeTaxAccrued>${j.incomeTaxAccrued}</IncomeTaxAccrued>
      <StatedCapital>${j.statedCapital}</StatedCapital>
      <AccumulatedEarnings>${j.accumulatedEarnings}</AccumulatedEarnings>
      <NumberOfEmployees>${j.numberOfEmployees}</NumberOfEmployees>
      <TangibleAssets>${j.tangibleAssets}</TangibleAssets>
    </JurisdictionEntry>
  `).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Form3CEAD xmlns="http://www.incometaxindia.gov.in/form3cead" version="${FORM_SCHEMAS.FORM_3CEAD.version}">
  <AssessmentYear>${data.assessmentYear}</AssessmentYear>
  <PAN>${data.pan}</PAN>
  <ReportingFiscalYear>${data.reportingFiscalYear}</ReportingFiscalYear>
  <ReportingEntity>
    <Name>${escapeXML(data.reportingEntityDetails.name)}</Name>
    <Country>${data.reportingEntityDetails.country}</Country>
    <Role>${data.reportingEntityDetails.role}</Role>
  </ReportingEntity>
  <JurisdictionData>
    ${jurisdictionsXML}
  </JurisdictionData>
</Form3CEAD>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// =============================================================================
// MAIN ENGINE CLASS
// =============================================================================

export class EfilingEngine {
  private config: EfilingEngineConfig;
  private connector: ITDEfilingConnector;
  private auditLog: AuditLogEntry[] = [];
  private workflows: Map<string, SubmissionWorkflow> = new Map();

  constructor(config?: Partial<EfilingEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.connector = createITDEfilingConnector({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      environment: this.config.environment
    });
  }

  /**
   * Test connection to ITD portal
   */
  async testConnection() {
    return this.connector.testConnection();
  }

  /**
   * Authenticate with ITD portal
   */
  async authenticate() {
    return this.connector.authenticate();
  }

  /**
   * Generate and submit Form 3CEB
   */
  async submitForm3CEB(
    data: Form3CEBData,
    signatureData?: string
  ): Promise<SubmissionResponse> {
    const xmlContent = generateForm3CEBXML(data);

    // Validate first
    const validation = await this.validateSubmission("FORM_3CEB", xmlContent);
    if (!validation.valid) {
      this.logAudit("VALIDATION_FAILED", "FORM_3CEB", data.pan, data.assessmentYear, "REJECTED", {
        errors: validation.errors
      });

      return {
        success: false,
        status: "REJECTED",
        errors: validation.errors,
        timestamp: new Date().toISOString()
      };
    }

    // Submit
    const response = await this.submitWithRetry({
      formType: "FORM_3CEB",
      assessmentYear: data.assessmentYear,
      pan: data.pan,
      xmlContent,
      signatureData
    });

    this.logAudit(
      response.success ? "SUBMISSION_SUCCESS" : "SUBMISSION_FAILED",
      "FORM_3CEB",
      data.pan,
      data.assessmentYear,
      response.status,
      { acknowledgmentNumber: response.acknowledgmentNumber }
    );

    return response;
  }

  /**
   * Generate and submit Form 3CEAA (Master File)
   */
  async submitForm3CEAA(
    data: Form3CEAAData,
    signatureData?: string
  ): Promise<SubmissionResponse> {
    const xmlContent = generateForm3CEAAXML(data);

    const validation = await this.validateSubmission("FORM_3CEAA", xmlContent);
    if (!validation.valid) {
      this.logAudit("VALIDATION_FAILED", "FORM_3CEAA", data.pan, data.assessmentYear, "REJECTED");
      return {
        success: false,
        status: "REJECTED",
        errors: validation.errors,
        timestamp: new Date().toISOString()
      };
    }

    const response = await this.submitWithRetry({
      formType: "FORM_3CEAA",
      assessmentYear: data.assessmentYear,
      pan: data.pan,
      xmlContent,
      signatureData
    });

    this.logAudit(
      response.success ? "SUBMISSION_SUCCESS" : "SUBMISSION_FAILED",
      "FORM_3CEAA",
      data.pan,
      data.assessmentYear,
      response.status
    );

    return response;
  }

  /**
   * Generate and submit Form 3CEAD (CbCR)
   */
  async submitForm3CEAD(
    data: Form3CEADData,
    signatureData?: string
  ): Promise<SubmissionResponse> {
    const xmlContent = generateForm3CEADXML(data);

    const validation = await this.validateSubmission("FORM_3CEAD", xmlContent);
    if (!validation.valid) {
      this.logAudit("VALIDATION_FAILED", "FORM_3CEAD", data.pan, data.assessmentYear, "REJECTED");
      return {
        success: false,
        status: "REJECTED",
        errors: validation.errors,
        timestamp: new Date().toISOString()
      };
    }

    const response = await this.submitWithRetry({
      formType: "FORM_3CEAD",
      assessmentYear: data.assessmentYear,
      pan: data.pan,
      xmlContent,
      signatureData
    });

    this.logAudit(
      response.success ? "SUBMISSION_SUCCESS" : "SUBMISSION_FAILED",
      "FORM_3CEAD",
      data.pan,
      data.assessmentYear,
      response.status
    );

    return response;
  }

  /**
   * Submit with retry logic
   */
  private async submitWithRetry(request: SubmissionRequest): Promise<SubmissionResponse> {
    let lastError: SubmissionResponse | undefined;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await this.connector.submitForm(request);

        if (response.success || response.status === "PENDING_SIGNATURE") {
          return response;
        }

        // Check if error is retryable
        const retryable = response.errors?.some(e =>
          e.code.startsWith("NETWORK") || e.code.startsWith("TIMEOUT")
        );

        if (!retryable) {
          return response;
        }

        lastError = response;

        // Wait before retry
        if (this.config.autoRetry && attempt < this.config.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      } catch (error) {
        lastError = {
          success: false,
          status: "REJECTED",
          errors: [{
            code: "SYSTEM001",
            message: error instanceof Error ? error.message : "Unknown error",
            severity: "ERROR"
          }],
          timestamp: new Date().toISOString()
        };
      }
    }

    return lastError!;
  }

  /**
   * Validate submission before sending
   */
  async validateSubmission(formType: FormType, xmlContent: string): Promise<XMLValidationResult> {
    return this.connector.validateXML(formType, xmlContent);
  }

  /**
   * Check submission status
   */
  async checkStatus(
    submissionId?: string,
    acknowledgmentNumber?: string
  ) {
    return this.connector.checkStatus({ submissionId, acknowledgmentNumber });
  }

  /**
   * Get all submissions for a company
   */
  async getSubmissions(pan: string, assessmentYear?: string): Promise<EfilingSubmission[]> {
    return this.connector.getSubmissions(pan, assessmentYear);
  }

  /**
   * Get compliance status for a company
   */
  async getComplianceStatus(pan: string, assessmentYear: string): Promise<ComplianceStatus> {
    const submissions = await this.getSubmissions(pan, assessmentYear);

    const requiredForms: FormType[] = ["FORM_3CEB", "FORM_3CEAA", "FORM_3CEAD"];

    const forms = requiredForms.map(formType => {
      const submission = submissions.find(s => s.formType === formType);
      const deadline = getFormDeadline(formType, assessmentYear);
      const overdue = isFormOverdue(formType, assessmentYear);
      const daysUntil = getDaysUntilDeadline(formType, assessmentYear);

      return {
        formType,
        required: true,
        status: submission?.status ?? "NOT_STARTED" as const,
        deadline,
        daysUntilDeadline: daysUntil,
        overdue,
        acknowledgmentNumber: submission?.acknowledgmentNumber
      };
    });

    // Determine overall compliance
    const acknowledged = forms.filter(f => f.status === "ACKNOWLEDGED").length;
    const overdue = forms.filter(f => f.overdue && f.status === "NOT_STARTED").length;

    let overallCompliance: ComplianceStatus["overallCompliance"];
    if (acknowledged === forms.length) {
      overallCompliance = "COMPLIANT";
    } else if (overdue > 0) {
      overallCompliance = "NON_COMPLIANT";
    } else if (acknowledged > 0) {
      overallCompliance = "PARTIAL";
    } else {
      overallCompliance = "PENDING";
    }

    return {
      pan,
      assessmentYear,
      forms,
      overallCompliance
    };
  }

  /**
   * Download acknowledgment
   */
  async downloadAcknowledgment(acknowledgmentNumber: string) {
    return this.connector.downloadAcknowledgment(acknowledgmentNumber);
  }

  /**
   * Create submission workflow
   */
  createWorkflow(formType: FormType, pan: string, assessmentYear: string): SubmissionWorkflow {
    const workflowId = `WF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const steps: WorkflowStep[] = [
      { name: "Data Collection", status: "PENDING" },
      { name: "XML Generation", status: "PENDING" },
      { name: "Validation", status: "PENDING" },
      { name: "Digital Signature", status: "PENDING" },
      { name: "Submission", status: "PENDING" },
      { name: "Acknowledgment", status: "PENDING" }
    ];

    const workflow: SubmissionWorkflow = {
      submissionId: workflowId,
      formType,
      status: "DRAFT",
      steps,
      currentStep: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(workflowId, workflow);

    this.logAudit("WORKFLOW_CREATED", formType, pan, assessmentYear, "DRAFT", { workflowId });

    return workflow;
  }

  /**
   * Get workflow status
   */
  getWorkflow(workflowId: string): SubmissionWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get audit log
   */
  getAuditLog(pan?: string, assessmentYear?: string): AuditLogEntry[] {
    let log = [...this.auditLog];

    if (pan) {
      log = log.filter(e => e.pan === pan);
    }
    if (assessmentYear) {
      log = log.filter(e => e.assessmentYear === assessmentYear);
    }

    return log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Log audit entry
   */
  private logAudit(
    action: string,
    formType: FormType,
    pan: string,
    assessmentYear: string,
    status: string,
    details?: Record<string, unknown>
  ): void {
    if (!this.config.enableAuditLog) return;

    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      formType,
      pan,
      assessmentYear,
      status,
      details
    });
  }

  /**
   * Get form types
   */
  getFormTypes(): FormType[] {
    return getFormTypes();
  }

  /**
   * Get form schema
   */
  getFormSchema(formType: FormType) {
    return getFormSchema(formType);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createEfilingEngine = (config?: Partial<EfilingEngineConfig>): EfilingEngine => {
  return new EfilingEngine(config);
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  FormType,
  SubmissionStatus,
  EfilingSubmission,
  SubmissionResponse,
  XMLValidationResult,
  SubmissionError
};

export {
  getFormTypes,
  getFormSchema,
  getFormDeadline,
  isFormOverdue,
  getDaysUntilDeadline
};

// =============================================================================
// VERSION INFO
// =============================================================================

export const EFILING_ENGINE_VERSION = {
  version: "1.0.0",
  supportedForms: getFormTypes().length,
  lastUpdated: "2025-01-29",
  features: {
    form3CEB: true,
    form3CEAA: true,
    form3CEAD: true,
    xmlGeneration: true,
    validation: true,
    workflowTracking: true,
    auditLog: true
  }
};
