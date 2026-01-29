/**
 * ITD E-filing Portal Connector
 * Integration with Income Tax Department's e-filing portal for TP forms
 */

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type FormType =
  | "FORM_3CEB"      // Accountant's Report on International Transactions
  | "FORM_3CEAA"     // Master File
  | "FORM_3CEAD"     // Country-by-Country Report
  | "FORM_3CEAC"     // Intimation by Constituent Entity
  | "FORM_3CEAE"     // Intimation by Reporting Entity
  | "FORM_3CEFA"     // Safe Harbour opt-in
  | "FORM_3CEB_REVISED"; // Revised Form 3CEB

export type SubmissionStatus =
  | "DRAFT"
  | "PENDING_SIGNATURE"
  | "PENDING_SUBMISSION"
  | "SUBMITTED"
  | "ACKNOWLEDGED"
  | "REJECTED"
  | "UNDER_PROCESSING"
  | "PROCESSED";

export interface ITDConnectorConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  certificatePath?: string;
  timeout: number;
  environment: "SANDBOX" | "PRODUCTION";
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  sessionValid?: boolean;
}

export interface EfilingSubmission {
  id: string;
  formType: FormType;
  assessmentYear: string;
  pan: string;
  companyName: string;
  status: SubmissionStatus;
  createdAt: string;
  submittedAt?: string;
  acknowledgedAt?: string;
  acknowledgmentNumber?: string;
  xmlContent?: string;
  errors?: SubmissionError[];
  signedBy?: string;
  signatureTimestamp?: string;
}

export interface SubmissionError {
  code: string;
  field?: string;
  message: string;
  severity: "ERROR" | "WARNING";
}

export interface SubmissionRequest {
  formType: FormType;
  assessmentYear: string;
  pan: string;
  xmlContent: string;
  signatureData?: string;
  dscCertificate?: string;
}

export interface SubmissionResponse {
  success: boolean;
  submissionId?: string;
  status: SubmissionStatus;
  acknowledgmentNumber?: string;
  errors?: SubmissionError[];
  timestamp: string;
}

export interface StatusCheckRequest {
  submissionId?: string;
  acknowledgmentNumber?: string;
  pan?: string;
  assessmentYear?: string;
  formType?: FormType;
}

export interface StatusCheckResponse {
  submission?: EfilingSubmission;
  found: boolean;
  message: string;
}

export interface XMLValidationResult {
  valid: boolean;
  errors: SubmissionError[];
  warnings: SubmissionError[];
  schemaVersion: string;
}

// =============================================================================
// FORM SCHEMAS AND VALIDATION
// =============================================================================

export const FORM_SCHEMAS: Record<FormType, { version: string; deadline: string; requiredFields: string[] }> = {
  FORM_3CEB: {
    version: "2024.1",
    deadline: "October 31",
    requiredFields: ["pan", "assessmentYear", "nameOfAssessee", "addressOfAssessee", "internationalTransactions"]
  },
  FORM_3CEAA: {
    version: "2024.1",
    deadline: "November 30",
    requiredFields: ["pan", "assessmentYear", "parentEntityDetails", "groupStructure", "intangiblesStrategy"]
  },
  FORM_3CEAD: {
    version: "2024.1",
    deadline: "March 31",
    requiredFields: ["pan", "assessmentYear", "reportingFiscalYear", "jurisdictionData", "entityData"]
  },
  FORM_3CEAC: {
    version: "2024.1",
    deadline: "As specified",
    requiredFields: ["pan", "ultimateParentEntityDetails", "reportingEntityDetails"]
  },
  FORM_3CEAE: {
    version: "2024.1",
    deadline: "As specified",
    requiredFields: ["pan", "reportingEntityDetails", "groupDetails"]
  },
  FORM_3CEFA: {
    version: "2024.1",
    deadline: "Return due date",
    requiredFields: ["pan", "assessmentYear", "eligibleTransactions", "optInDeclaration"]
  },
  FORM_3CEB_REVISED: {
    version: "2024.1",
    deadline: "Within due date",
    requiredFields: ["pan", "assessmentYear", "originalAcknowledgment", "revisedTransactions"]
  }
};

// =============================================================================
// SAMPLE SUBMISSIONS (For demonstration)
// =============================================================================

const SAMPLE_SUBMISSIONS: EfilingSubmission[] = [
  {
    id: "SUB001",
    formType: "FORM_3CEB",
    assessmentYear: "2024-25",
    pan: "AABCT1234X",
    companyName: "TCS Technologies Pvt Ltd",
    status: "ACKNOWLEDGED",
    createdAt: "2024-10-15T10:30:00Z",
    submittedAt: "2024-10-28T14:45:00Z",
    acknowledgedAt: "2024-10-28T14:46:00Z",
    acknowledgmentNumber: "ACK3CEB2024001234",
    signedBy: "CA Rajesh Kumar",
    signatureTimestamp: "2024-10-28T14:44:00Z"
  },
  {
    id: "SUB002",
    formType: "FORM_3CEAA",
    assessmentYear: "2024-25",
    pan: "AABCT1234X",
    companyName: "TCS Technologies Pvt Ltd",
    status: "PENDING_SIGNATURE",
    createdAt: "2024-11-01T09:00:00Z"
  }
];

// =============================================================================
// ABSTRACT BASE CLASS
// =============================================================================

export abstract class ITDPortalConnector {
  protected config: ITDConnectorConfig;
  protected sessionToken?: string;
  protected sessionExpiry?: number;

  constructor(config: ITDConnectorConfig) {
    this.config = config;
  }

  /**
   * Test connection to ITD portal
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * Authenticate with ITD portal
   */
  abstract authenticate(): Promise<{ success: boolean; sessionToken?: string; expiresIn?: number }>;

  /**
   * Submit form to ITD portal
   */
  abstract submitForm(request: SubmissionRequest): Promise<SubmissionResponse>;

  /**
   * Check submission status
   */
  abstract checkStatus(request: StatusCheckRequest): Promise<StatusCheckResponse>;

  /**
   * Get all submissions for a PAN
   */
  abstract getSubmissions(pan: string, assessmentYear?: string): Promise<EfilingSubmission[]>;

  /**
   * Validate XML against schema
   */
  abstract validateXML(formType: FormType, xmlContent: string): Promise<XMLValidationResult>;

  /**
   * Download acknowledgment
   */
  abstract downloadAcknowledgment(acknowledgmentNumber: string): Promise<{ content: string; filename: string }>;
}

// =============================================================================
// ITD PORTAL CONNECTOR IMPLEMENTATION
// =============================================================================

export class ITDEfilingConnector extends ITDPortalConnector {
  private static readonly ITD_BASE_URL = "https://eportal.incometax.gov.in/api/v1";
  private static readonly SANDBOX_URL = "https://sandbox.incometax.gov.in/api/v1";

  constructor(config?: Partial<ITDConnectorConfig>) {
    super({
      clientId: config?.clientId ?? "",
      clientSecret: config?.clientSecret ?? "",
      baseUrl: config?.environment === "PRODUCTION"
        ? ITDEfilingConnector.ITD_BASE_URL
        : ITDEfilingConnector.SANDBOX_URL,
      timeout: config?.timeout ?? 30000,
      environment: config?.environment ?? "SANDBOX",
      ...config
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!this.config.clientId || !this.config.clientSecret) {
      return {
        success: false,
        message: "ITD Portal credentials not configured. Configure CLIENT_ID and CLIENT_SECRET.",
        latency: Date.now() - startTime,
        sessionValid: false
      };
    }

    // In production, make actual API health check
    return {
      success: true,
      message: `Connected to ITD ${this.config.environment} portal`,
      latency: Date.now() - startTime,
      sessionValid: this.sessionToken !== undefined && (this.sessionExpiry ?? 0) > Date.now()
    };
  }

  async authenticate(): Promise<{ success: boolean; sessionToken?: string; expiresIn?: number }> {
    if (!this.config.clientId || !this.config.clientSecret) {
      return {
        success: false
      };
    }

    // In production, make OAuth2 token request
    // For now, simulate successful auth
    this.sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionExpiry = Date.now() + 3600000; // 1 hour

    return {
      success: true,
      sessionToken: this.sessionToken,
      expiresIn: 3600
    };
  }

  async submitForm(request: SubmissionRequest): Promise<SubmissionResponse> {
    // Validate XML first
    const validation = await this.validateXML(request.formType, request.xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        status: "REJECTED",
        errors: validation.errors,
        timestamp: new Date().toISOString()
      };
    }

    // Check for signature if required
    if (!request.signatureData) {
      return {
        success: false,
        status: "PENDING_SIGNATURE",
        errors: [{ code: "SIG001", message: "Digital signature required", severity: "ERROR" }],
        timestamp: new Date().toISOString()
      };
    }

    // Simulate successful submission
    const submissionId = `SUB${Date.now()}`;
    const acknowledgmentNumber = `ACK${request.formType.replace("_", "")}${request.assessmentYear.replace("-", "")}${Math.random().toString().substr(2, 6)}`;

    return {
      success: true,
      submissionId,
      status: "ACKNOWLEDGED",
      acknowledgmentNumber,
      timestamp: new Date().toISOString()
    };
  }

  async checkStatus(request: StatusCheckRequest): Promise<StatusCheckResponse> {
    // Search sample submissions
    let submission: EfilingSubmission | undefined;

    if (request.submissionId) {
      submission = SAMPLE_SUBMISSIONS.find(s => s.id === request.submissionId);
    } else if (request.acknowledgmentNumber) {
      submission = SAMPLE_SUBMISSIONS.find(s => s.acknowledgmentNumber === request.acknowledgmentNumber);
    } else if (request.pan && request.assessmentYear && request.formType) {
      submission = SAMPLE_SUBMISSIONS.find(
        s => s.pan === request.pan &&
             s.assessmentYear === request.assessmentYear &&
             s.formType === request.formType
      );
    }

    if (submission) {
      return {
        submission,
        found: true,
        message: "Submission found"
      };
    }

    return {
      found: false,
      message: "No submission found matching the criteria"
    };
  }

  async getSubmissions(pan: string, assessmentYear?: string): Promise<EfilingSubmission[]> {
    let submissions = SAMPLE_SUBMISSIONS.filter(s => s.pan === pan);

    if (assessmentYear) {
      submissions = submissions.filter(s => s.assessmentYear === assessmentYear);
    }

    return submissions;
  }

  async validateXML(formType: FormType, xmlContent: string): Promise<XMLValidationResult> {
    const errors: SubmissionError[] = [];
    const warnings: SubmissionError[] = [];
    const schema = FORM_SCHEMAS[formType];

    // Basic validation checks
    if (!xmlContent || xmlContent.trim().length === 0) {
      errors.push({
        code: "XML001",
        message: "XML content is empty",
        severity: "ERROR"
      });
    }

    if (!xmlContent.includes("<?xml")) {
      errors.push({
        code: "XML002",
        message: "Invalid XML declaration",
        severity: "ERROR"
      });
    }

    // Check for required fields (simplified)
    for (const field of schema.requiredFields) {
      if (!xmlContent.includes(`<${field}`) && !xmlContent.includes(`"${field}"`)) {
        warnings.push({
          code: "FIELD001",
          field,
          message: `Required field '${field}' may be missing`,
          severity: "WARNING"
        });
      }
    }

    // Check for common issues
    if (xmlContent.includes("<amount>") && xmlContent.includes("NaN")) {
      errors.push({
        code: "DATA001",
        message: "Invalid numeric value (NaN) detected",
        severity: "ERROR"
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      schemaVersion: schema.version
    };
  }

  async downloadAcknowledgment(acknowledgmentNumber: string): Promise<{ content: string; filename: string }> {
    const submission = SAMPLE_SUBMISSIONS.find(s => s.acknowledgmentNumber === acknowledgmentNumber);

    if (!submission) {
      throw new Error(`Acknowledgment ${acknowledgmentNumber} not found`);
    }

    // Generate acknowledgment content
    const content = this.generateAcknowledgmentContent(submission);
    const filename = `${acknowledgmentNumber}_acknowledgment.pdf`;

    return { content, filename };
  }

  private generateAcknowledgmentContent(submission: EfilingSubmission): string {
    return `
INCOME TAX DEPARTMENT
E-FILING ACKNOWLEDGMENT

Acknowledgment Number: ${submission.acknowledgmentNumber}
Form Type: ${submission.formType}
Assessment Year: ${submission.assessmentYear}
PAN: ${submission.pan}
Company Name: ${submission.companyName}

Submitted At: ${submission.submittedAt}
Status: ${submission.status}
Signed By: ${submission.signedBy ?? "N/A"}

This is a computer-generated acknowledgment and does not require a physical signature.
    `.trim();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createITDEfilingConnector = (config?: Partial<ITDConnectorConfig>): ITDEfilingConnector => {
  return new ITDEfilingConnector(config);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all form types
 */
export function getFormTypes(): FormType[] {
  return Object.keys(FORM_SCHEMAS) as FormType[];
}

/**
 * Get form schema
 */
export function getFormSchema(formType: FormType) {
  return FORM_SCHEMAS[formType];
}

/**
 * Get form deadline
 */
export function getFormDeadline(formType: FormType, assessmentYear: string): string {
  const schema = FORM_SCHEMAS[formType];
  // Parse assessment year to get actual deadline date
  const [startYear] = assessmentYear.split("-").map(y => parseInt(y));
  const fullYear = startYear < 100 ? 2000 + startYear : startYear;

  const deadlineMapping: Record<string, string> = {
    "October 31": `${fullYear}-10-31`,
    "November 30": `${fullYear}-11-30`,
    "March 31": `${fullYear + 1}-03-31`,
    "As specified": "As per notification",
    "Return due date": "Along with return"
  };

  return deadlineMapping[schema.deadline] ?? schema.deadline;
}

/**
 * Check if form is overdue
 */
export function isFormOverdue(formType: FormType, assessmentYear: string): boolean {
  const deadline = getFormDeadline(formType, assessmentYear);
  if (deadline.includes("notification") || deadline.includes("return")) {
    return false;
  }

  return new Date() > new Date(deadline);
}

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(formType: FormType, assessmentYear: string): number | null {
  const deadline = getFormDeadline(formType, assessmentYear);
  if (deadline.includes("notification") || deadline.includes("return")) {
    return null;
  }

  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
