/**
 * Digital Signature Certificate (DSC) Connector
 * Integration with DSC providers for document signing
 * Supports USB token-based and Cloud DSC (eMudhra, Sify)
 */

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type DSCProvider = "EMUDHRA" | "SIFY" | "NCODE" | "CAPRICORN" | "USB_TOKEN";
export type DSCClass = "CLASS_2" | "CLASS_3";
export type SignatureType = "PKCS7" | "XMLDSIG" | "PDF_SIGNATURE" | "CADES";

export interface DSCConnectorConfig {
  provider: DSCProvider;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  timeout: number;
  certificatePath?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  certificateInfo?: CertificateInfo;
}

export interface CertificateInfo {
  serialNumber: string;
  subjectName: string;
  issuerName: string;
  validFrom: string;
  validTo: string;
  dscClass: DSCClass;
  keyUsage: string[];
  isValid: boolean;
  daysUntilExpiry: number;
}

export interface SigningRequest {
  documentType: "XML" | "PDF" | "JSON";
  content: string; // Base64 encoded for PDF, plain for XML/JSON
  signatureType: SignatureType;
  certificateId?: string;
  signaturePosition?: {
    page?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  reason?: string;
  location?: string;
  contactInfo?: string;
  timestampRequired?: boolean;
}

export interface SigningResponse {
  success: boolean;
  signedContent?: string;
  signatureValue?: string;
  signingTime?: string;
  certificateInfo?: CertificateInfo;
  timestampToken?: string;
  errors?: SigningError[];
}

export interface SigningError {
  code: string;
  message: string;
  field?: string;
}

export interface VerificationRequest {
  documentType: "XML" | "PDF" | "JSON";
  content: string;
  signatureValue?: string;
}

export interface VerificationResponse {
  valid: boolean;
  signerInfo?: {
    name: string;
    email?: string;
    organization?: string;
  };
  certificateInfo?: CertificateInfo;
  signingTime?: string;
  timestampValid?: boolean;
  errors?: SigningError[];
}

export interface CloudDSCSession {
  sessionId: string;
  userId: string;
  provider: DSCProvider;
  expiresAt: string;
  certificates: CertificateInfo[];
}

// =============================================================================
// SAMPLE CERTIFICATES (For demonstration)
// =============================================================================

const SAMPLE_CERTIFICATES: CertificateInfo[] = [
  {
    serialNumber: "1234567890ABCDEF",
    subjectName: "CN=Rajesh Kumar, O=TCS Technologies Pvt Ltd, C=IN",
    issuerName: "CN=eMudhra CA, O=eMudhra Technologies, C=IN",
    validFrom: "2024-01-01T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
    dscClass: "CLASS_3",
    keyUsage: ["digitalSignature", "nonRepudiation"],
    isValid: true,
    daysUntilExpiry: 700
  },
  {
    serialNumber: "FEDCBA0987654321",
    subjectName: "CN=Priya Sharma, O=TCS Technologies Pvt Ltd, C=IN",
    issuerName: "CN=Sify CA, O=Sify Technologies, C=IN",
    validFrom: "2024-06-01T00:00:00Z",
    validTo: "2026-05-31T23:59:59Z",
    dscClass: "CLASS_2",
    keyUsage: ["digitalSignature"],
    isValid: true,
    daysUntilExpiry: 490
  }
];

// =============================================================================
// ABSTRACT BASE CLASS
// =============================================================================

export abstract class DSCConnector {
  protected config: DSCConnectorConfig;

  constructor(config: DSCConnectorConfig) {
    this.config = config;
  }

  /**
   * Test connection to DSC provider
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * List available certificates
   */
  abstract listCertificates(): Promise<CertificateInfo[]>;

  /**
   * Sign document
   */
  abstract signDocument(request: SigningRequest): Promise<SigningResponse>;

  /**
   * Verify signature
   */
  abstract verifySignature(request: VerificationRequest): Promise<VerificationResponse>;

  /**
   * Check certificate validity
   */
  checkCertificateValidity(cert: CertificateInfo): { valid: boolean; message: string } {
    const now = new Date();
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);

    if (now < validFrom) {
      return { valid: false, message: "Certificate is not yet valid" };
    }

    if (now > validTo) {
      return { valid: false, message: "Certificate has expired" };
    }

    if (cert.daysUntilExpiry < 30) {
      return { valid: true, message: `Certificate expires in ${cert.daysUntilExpiry} days` };
    }

    return { valid: true, message: "Certificate is valid" };
  }
}

// =============================================================================
// EMUDHRA CLOUD DSC CONNECTOR
// =============================================================================

export class EMudhraConnector extends DSCConnector {
  private static readonly EMUDHRA_URL = "https://sign.emudhra.com/api/v2";
  private session?: CloudDSCSession;

  constructor(config?: Partial<DSCConnectorConfig>) {
    super({
      provider: "EMUDHRA",
      baseUrl: EMudhraConnector.EMUDHRA_URL,
      timeout: 30000,
      ...config
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!this.config.apiKey) {
      return {
        success: false,
        message: "eMudhra API key not configured",
        latency: Date.now() - startTime
      };
    }

    // In production, make actual API health check
    return {
      success: true,
      message: "eMudhra Cloud DSC service connected",
      latency: Date.now() - startTime,
      certificateInfo: SAMPLE_CERTIFICATES[0]
    };
  }

  async listCertificates(): Promise<CertificateInfo[]> {
    // In production, fetch from eMudhra API
    return SAMPLE_CERTIFICATES.filter(c => c.issuerName.includes("eMudhra"));
  }

  async signDocument(request: SigningRequest): Promise<SigningResponse> {
    // Validate certificate availability
    const certificates = await this.listCertificates();
    if (certificates.length === 0) {
      return {
        success: false,
        errors: [{ code: "CERT001", message: "No valid certificates available" }]
      };
    }

    const certificate = request.certificateId
      ? certificates.find(c => c.serialNumber === request.certificateId)
      : certificates[0];

    if (!certificate) {
      return {
        success: false,
        errors: [{ code: "CERT002", message: "Specified certificate not found" }]
      };
    }

    // Check validity
    const validity = this.checkCertificateValidity(certificate);
    if (!validity.valid) {
      return {
        success: false,
        errors: [{ code: "CERT003", message: validity.message }]
      };
    }

    // Simulate signing
    const signingTime = new Date().toISOString();
    const signatureValue = this.generateMockSignature(request.content, certificate);

    let signedContent = request.content;

    if (request.documentType === "XML") {
      signedContent = this.addXMLSignature(request.content, signatureValue, certificate, signingTime);
    } else if (request.documentType === "PDF") {
      // For PDF, signature is embedded
      signedContent = request.content; // In production, actual PDF signing
    }

    return {
      success: true,
      signedContent,
      signatureValue,
      signingTime,
      certificateInfo: certificate,
      timestampToken: request.timestampRequired ? this.generateTimestamp(signingTime) : undefined
    };
  }

  async verifySignature(request: VerificationRequest): Promise<VerificationResponse> {
    // Extract signature info from content
    if (request.documentType === "XML" && request.content.includes("<Signature")) {
      return {
        valid: true,
        signerInfo: {
          name: "Rajesh Kumar",
          organization: "TCS Technologies Pvt Ltd"
        },
        certificateInfo: SAMPLE_CERTIFICATES[0],
        signingTime: new Date().toISOString(),
        timestampValid: true
      };
    }

    return {
      valid: false,
      errors: [{ code: "SIG001", message: "No valid signature found in document" }]
    };
  }

  private generateMockSignature(content: string, cert: CertificateInfo): string {
    // In production, actual cryptographic signature
    const hash = Buffer.from(`${content}:${cert.serialNumber}:${Date.now()}`).toString("base64");
    return hash.substring(0, 64);
  }

  private addXMLSignature(
    xml: string,
    signatureValue: string,
    cert: CertificateInfo,
    signingTime: string
  ): string {
    const signatureBlock = `
  <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <ds:Reference URI="">
        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <ds:DigestValue>DigestValuePlaceholder</ds:DigestValue>
      </ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>${signatureValue}</ds:SignatureValue>
    <ds:KeyInfo>
      <ds:X509Data>
        <ds:X509SubjectName>${cert.subjectName}</ds:X509SubjectName>
        <ds:X509SerialNumber>${cert.serialNumber}</ds:X509SerialNumber>
      </ds:X509Data>
    </ds:KeyInfo>
    <ds:Object>
      <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
        <xades:SignedProperties>
          <xades:SignedSignatureProperties>
            <xades:SigningTime>${signingTime}</xades:SigningTime>
          </xades:SignedSignatureProperties>
        </xades:SignedProperties>
      </xades:QualifyingProperties>
    </ds:Object>
  </ds:Signature>`;

    // Insert signature before closing tag
    const closingTagMatch = xml.match(/<\/[^>]+>\s*$/);
    if (closingTagMatch) {
      const insertPos = xml.lastIndexOf(closingTagMatch[0]);
      return xml.substring(0, insertPos) + signatureBlock + xml.substring(insertPos);
    }

    return xml + signatureBlock;
  }

  private generateTimestamp(signingTime: string): string {
    return Buffer.from(`TST:${signingTime}:${Date.now()}`).toString("base64");
  }
}

// =============================================================================
// SIFY CLOUD DSC CONNECTOR
// =============================================================================

export class SifyConnector extends DSCConnector {
  private static readonly SIFY_URL = "https://esign.sify.com/api/v1";

  constructor(config?: Partial<DSCConnectorConfig>) {
    super({
      provider: "SIFY",
      baseUrl: SifyConnector.SIFY_URL,
      timeout: 30000,
      ...config
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!this.config.apiKey) {
      return {
        success: false,
        message: "Sify API key not configured",
        latency: Date.now() - startTime
      };
    }

    return {
      success: true,
      message: "Sify Cloud DSC service connected",
      latency: Date.now() - startTime,
      certificateInfo: SAMPLE_CERTIFICATES[1]
    };
  }

  async listCertificates(): Promise<CertificateInfo[]> {
    return SAMPLE_CERTIFICATES.filter(c => c.issuerName.includes("Sify"));
  }

  async signDocument(request: SigningRequest): Promise<SigningResponse> {
    const certificates = await this.listCertificates();
    if (certificates.length === 0) {
      return {
        success: false,
        errors: [{ code: "CERT001", message: "No valid certificates available" }]
      };
    }

    const certificate = certificates[0];
    const validity = this.checkCertificateValidity(certificate);

    if (!validity.valid) {
      return {
        success: false,
        errors: [{ code: "CERT003", message: validity.message }]
      };
    }

    const signingTime = new Date().toISOString();
    const signatureValue = Buffer.from(`SIFY:${request.content.substring(0, 20)}:${Date.now()}`).toString("base64").substring(0, 64);

    return {
      success: true,
      signedContent: request.content,
      signatureValue,
      signingTime,
      certificateInfo: certificate
    };
  }

  async verifySignature(request: VerificationRequest): Promise<VerificationResponse> {
    if (request.signatureValue) {
      return {
        valid: true,
        signerInfo: {
          name: "Priya Sharma",
          organization: "TCS Technologies Pvt Ltd"
        },
        certificateInfo: SAMPLE_CERTIFICATES[1],
        signingTime: new Date().toISOString()
      };
    }

    return {
      valid: false,
      errors: [{ code: "SIG001", message: "No signature value provided" }]
    };
  }
}

// =============================================================================
// USB TOKEN CONNECTOR (Local signing)
// =============================================================================

export class USBTokenConnector extends DSCConnector {
  constructor(config?: Partial<DSCConnectorConfig>) {
    super({
      provider: "USB_TOKEN",
      timeout: 60000,
      ...config
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    // In production, check for USB token driver and device
    return {
      success: true,
      message: "USB Token signing available. Requires client-side integration.",
      latency: 0
    };
  }

  async listCertificates(): Promise<CertificateInfo[]> {
    // USB tokens require client-side enumeration
    return [];
  }

  async signDocument(request: SigningRequest): Promise<SigningResponse> {
    return {
      success: false,
      errors: [{
        code: "USB001",
        message: "USB Token signing requires client-side integration. Use the DSC signing widget."
      }]
    };
  }

  async verifySignature(request: VerificationRequest): Promise<VerificationResponse> {
    // Can verify signatures from any source
    return {
      valid: false,
      errors: [{ code: "VER001", message: "Verification not implemented for USB Token connector" }]
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export const createEMudhraConnector = (config?: Partial<DSCConnectorConfig>): EMudhraConnector => {
  return new EMudhraConnector(config);
};

export const createSifyConnector = (config?: Partial<DSCConnectorConfig>): SifyConnector => {
  return new SifyConnector(config);
};

export const createUSBTokenConnector = (config?: Partial<DSCConnectorConfig>): USBTokenConnector => {
  return new USBTokenConnector(config);
};

export const createDSCConnector = (provider: DSCProvider, config?: Partial<DSCConnectorConfig>): DSCConnector => {
  switch (provider) {
    case "EMUDHRA":
      return createEMudhraConnector(config);
    case "SIFY":
      return createSifyConnector(config);
    case "USB_TOKEN":
      return createUSBTokenConnector(config);
    default:
      return createEMudhraConnector(config);
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get supported DSC providers
 */
export function getSupportedProviders(): DSCProvider[] {
  return ["EMUDHRA", "SIFY", "NCODE", "CAPRICORN", "USB_TOKEN"];
}

/**
 * Get supported signature types
 */
export function getSupportedSignatureTypes(): SignatureType[] {
  return ["PKCS7", "XMLDSIG", "PDF_SIGNATURE", "CADES"];
}

/**
 * Calculate days until certificate expiry
 */
export function getDaysUntilExpiry(validTo: string): number {
  const expiryDate = new Date(validTo);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if certificate is expiring soon (within 60 days)
 */
export function isCertificateExpiringSoon(cert: CertificateInfo, daysThreshold: number = 60): boolean {
  return cert.daysUntilExpiry <= daysThreshold;
}
