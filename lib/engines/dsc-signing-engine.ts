/**
 * DSC Signing Engine
 * Orchestrates digital signature operations for TP compliance documents
 */

import {
  DSCConnector,
  EMudhraConnector,
  SifyConnector,
  DSCProvider,
  DSCClass,
  SignatureType,
  CertificateInfo,
  SigningRequest,
  SigningResponse,
  VerificationRequest,
  VerificationResponse,
  SigningError,
  createEMudhraConnector,
  createSifyConnector,
  createDSCConnector,
  getSupportedProviders,
  getSupportedSignatureTypes,
  getDaysUntilExpiry,
  isCertificateExpiringSoon
} from "../connectors/dsc-connector";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface DSCEngineConfig {
  primaryProvider: DSCProvider;
  fallbackProvider?: DSCProvider;
  eMudhraApiKey?: string;
  sifyApiKey?: string;
  enableTimestamp: boolean;
  enableAuditLog: boolean;
  autoSelectCertificate: boolean;
}

export interface SigningSession {
  sessionId: string;
  provider: DSCProvider;
  certificate: CertificateInfo;
  createdAt: string;
  expiresAt: string;
  documentsSignedCount: number;
}

export interface DocumentSigningRequest {
  documentId: string;
  documentName: string;
  documentType: "FORM_3CEB" | "FORM_3CEAA" | "FORM_3CEAD" | "PDF" | "XML" | "OTHER";
  content: string;
  signerName: string;
  signerDesignation?: string;
  reason?: string;
  location?: string;
  certificateId?: string;
}

export interface DocumentSigningResult {
  success: boolean;
  documentId: string;
  documentName: string;
  signedContent?: string;
  signatureInfo?: {
    signatureValue: string;
    signingTime: string;
    certificate: CertificateInfo;
    timestampToken?: string;
  };
  errors?: SigningError[];
}

export interface BatchSigningRequest {
  documents: DocumentSigningRequest[];
  certificateId?: string;
  signerName: string;
  signerDesignation?: string;
}

export interface BatchSigningResult {
  totalDocuments: number;
  successCount: number;
  failureCount: number;
  results: DocumentSigningResult[];
  completedAt: string;
}

export interface SignatureAuditEntry {
  timestamp: string;
  action: "SIGN" | "VERIFY" | "CERTIFICATE_CHECK";
  documentId?: string;
  documentName?: string;
  signerName?: string;
  certificateSerial?: string;
  provider: DSCProvider;
  success: boolean;
  errorMessage?: string;
}

export interface CertificateHealth {
  certificate: CertificateInfo;
  provider: DSCProvider;
  status: "VALID" | "EXPIRING_SOON" | "EXPIRED" | "REVOKED" | "UNKNOWN";
  message: string;
  recommendations: string[];
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: DSCEngineConfig = {
  primaryProvider: "EMUDHRA",
  enableTimestamp: true,
  enableAuditLog: true,
  autoSelectCertificate: true
};

// =============================================================================
// MAIN ENGINE CLASS
// =============================================================================

export class DSCSigningEngine {
  private config: DSCEngineConfig;
  private primaryConnector: DSCConnector;
  private fallbackConnector?: DSCConnector;
  private auditLog: SignatureAuditEntry[] = [];
  private activeSessions: Map<string, SigningSession> = new Map();

  constructor(config?: Partial<DSCEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize primary connector
    this.primaryConnector = createDSCConnector(this.config.primaryProvider, {
      apiKey: this.config.primaryProvider === "EMUDHRA"
        ? this.config.eMudhraApiKey
        : this.config.sifyApiKey
    });

    // Initialize fallback connector if configured
    if (this.config.fallbackProvider) {
      this.fallbackConnector = createDSCConnector(this.config.fallbackProvider, {
        apiKey: this.config.fallbackProvider === "EMUDHRA"
          ? this.config.eMudhraApiKey
          : this.config.sifyApiKey
      });
    }
  }

  /**
   * Test connections to DSC providers
   */
  async testConnections(): Promise<{
    primary: { success: boolean; message: string; provider: DSCProvider };
    fallback?: { success: boolean; message: string; provider: DSCProvider };
  }> {
    const primaryResult = await this.primaryConnector.testConnection();

    const result: {
      primary: { success: boolean; message: string; provider: DSCProvider };
      fallback?: { success: boolean; message: string; provider: DSCProvider };
    } = {
      primary: {
        success: primaryResult.success,
        message: primaryResult.message,
        provider: this.config.primaryProvider
      }
    };

    if (this.fallbackConnector && this.config.fallbackProvider) {
      const fallbackResult = await this.fallbackConnector.testConnection();
      result.fallback = {
        success: fallbackResult.success,
        message: fallbackResult.message,
        provider: this.config.fallbackProvider
      };
    }

    return result;
  }

  /**
   * Get available certificates
   */
  async getAvailableCertificates(): Promise<{
    primary: CertificateInfo[];
    fallback?: CertificateInfo[];
    all: CertificateInfo[];
  }> {
    const primaryCerts = await this.primaryConnector.listCertificates();
    let fallbackCerts: CertificateInfo[] = [];

    if (this.fallbackConnector) {
      fallbackCerts = await this.fallbackConnector.listCertificates();
    }

    return {
      primary: primaryCerts,
      fallback: fallbackCerts.length > 0 ? fallbackCerts : undefined,
      all: [...primaryCerts, ...fallbackCerts]
    };
  }

  /**
   * Sign a single document
   */
  async signDocument(request: DocumentSigningRequest): Promise<DocumentSigningResult> {
    // Determine signature type based on document type
    const signatureType = this.getSignatureType(request.documentType);

    // Build signing request
    const signingRequest: SigningRequest = {
      documentType: request.documentType === "PDF" ? "PDF" : "XML",
      content: request.content,
      signatureType,
      certificateId: request.certificateId,
      reason: request.reason ?? `Signed by ${request.signerName}`,
      location: request.location,
      timestampRequired: this.config.enableTimestamp
    };

    // Try primary connector
    let response = await this.primaryConnector.signDocument(signingRequest);

    // Try fallback if primary fails
    if (!response.success && this.fallbackConnector) {
      response = await this.fallbackConnector.signDocument(signingRequest);
    }

    // Log audit entry
    this.logAudit({
      action: "SIGN",
      documentId: request.documentId,
      documentName: request.documentName,
      signerName: request.signerName,
      certificateSerial: response.certificateInfo?.serialNumber,
      provider: this.config.primaryProvider,
      success: response.success,
      errorMessage: response.errors?.[0]?.message
    });

    if (response.success) {
      return {
        success: true,
        documentId: request.documentId,
        documentName: request.documentName,
        signedContent: response.signedContent,
        signatureInfo: {
          signatureValue: response.signatureValue!,
          signingTime: response.signingTime!,
          certificate: response.certificateInfo!,
          timestampToken: response.timestampToken
        }
      };
    }

    return {
      success: false,
      documentId: request.documentId,
      documentName: request.documentName,
      errors: response.errors
    };
  }

  /**
   * Sign multiple documents in batch
   */
  async signBatch(request: BatchSigningRequest): Promise<BatchSigningResult> {
    const results: DocumentSigningResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const doc of request.documents) {
      const result = await this.signDocument({
        ...doc,
        signerName: doc.signerName ?? request.signerName,
        signerDesignation: doc.signerDesignation ?? request.signerDesignation,
        certificateId: doc.certificateId ?? request.certificateId
      });

      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    return {
      totalDocuments: request.documents.length,
      successCount,
      failureCount,
      results,
      completedAt: new Date().toISOString()
    };
  }

  /**
   * Verify a signed document
   */
  async verifySignature(
    documentType: "XML" | "PDF" | "JSON",
    content: string,
    signatureValue?: string
  ): Promise<VerificationResponse> {
    const request: VerificationRequest = {
      documentType,
      content,
      signatureValue
    };

    const result = await this.primaryConnector.verifySignature(request);

    this.logAudit({
      action: "VERIFY",
      provider: this.config.primaryProvider,
      success: result.valid,
      errorMessage: result.errors?.[0]?.message
    });

    return result;
  }

  /**
   * Check certificate health
   */
  async checkCertificateHealth(certificate?: CertificateInfo): Promise<CertificateHealth[]> {
    const results: CertificateHealth[] = [];
    const certificates = certificate ? [certificate] : (await this.getAvailableCertificates()).all;

    for (const cert of certificates) {
      const validity = this.primaryConnector.checkCertificateValidity(cert);
      const recommendations: string[] = [];

      let status: CertificateHealth["status"];

      if (!cert.isValid) {
        status = "REVOKED";
        recommendations.push("Obtain a new certificate immediately");
      } else if (cert.daysUntilExpiry <= 0) {
        status = "EXPIRED";
        recommendations.push("Certificate has expired. Renew immediately to avoid compliance issues.");
      } else if (cert.daysUntilExpiry <= 30) {
        status = "EXPIRING_SOON";
        recommendations.push(`Certificate expires in ${cert.daysUntilExpiry} days. Initiate renewal process.`);
        recommendations.push("Contact your DSC provider for renewal.");
      } else if (cert.daysUntilExpiry <= 60) {
        status = "EXPIRING_SOON";
        recommendations.push(`Certificate expires in ${cert.daysUntilExpiry} days. Plan for renewal.`);
      } else {
        status = "VALID";
        recommendations.push("No action required at this time.");
      }

      // DSC class recommendations
      if (cert.dscClass === "CLASS_2" && status !== "EXPIRED" && status !== "REVOKED") {
        recommendations.push("Consider upgrading to Class 3 DSC for enhanced security and compliance.");
      }

      this.logAudit({
        action: "CERTIFICATE_CHECK",
        certificateSerial: cert.serialNumber,
        provider: this.config.primaryProvider,
        success: status === "VALID"
      });

      results.push({
        certificate: cert,
        provider: this.config.primaryProvider,
        status,
        message: validity.message,
        recommendations
      });
    }

    return results;
  }

  /**
   * Create signing session
   */
  async createSession(certificateId?: string): Promise<SigningSession | null> {
    const certificates = (await this.getAvailableCertificates()).all;

    const certificate = certificateId
      ? certificates.find(c => c.serialNumber === certificateId)
      : certificates.find(c => c.isValid && c.daysUntilExpiry > 0);

    if (!certificate) {
      return null;
    }

    const sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3600000); // 1 hour

    const session: SigningSession = {
      sessionId,
      provider: this.config.primaryProvider,
      certificate,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      documentsSignedCount: 0
    };

    this.activeSessions.set(sessionId, session);

    return session;
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): SigningSession | null {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * End signing session
   */
  endSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  /**
   * Get signature type for document type
   */
  private getSignatureType(documentType: DocumentSigningRequest["documentType"]): SignatureType {
    switch (documentType) {
      case "FORM_3CEB":
      case "FORM_3CEAA":
      case "FORM_3CEAD":
      case "XML":
        return "XMLDSIG";
      case "PDF":
        return "PDF_SIGNATURE";
      default:
        return "CADES";
    }
  }

  /**
   * Log audit entry
   */
  private logAudit(entry: Omit<SignatureAuditEntry, "timestamp">): void {
    if (!this.config.enableAuditLog) return;

    this.auditLog.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: {
    action?: SignatureAuditEntry["action"];
    documentId?: string;
    signerName?: string;
    startDate?: string;
    endDate?: string;
  }): SignatureAuditEntry[] {
    let log = [...this.auditLog];

    if (filters) {
      if (filters.action) {
        log = log.filter(e => e.action === filters.action);
      }
      if (filters.documentId) {
        log = log.filter(e => e.documentId === filters.documentId);
      }
      if (filters.signerName) {
        log = log.filter(e => e.signerName === filters.signerName);
      }
      if (filters.startDate) {
        log = log.filter(e => new Date(e.timestamp) >= new Date(filters.startDate!));
      }
      if (filters.endDate) {
        log = log.filter(e => new Date(e.timestamp) <= new Date(filters.endDate!));
      }
    }

    return log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get supported providers
   */
  getSupportedProviders(): DSCProvider[] {
    return getSupportedProviders();
  }

  /**
   * Get supported signature types
   */
  getSupportedSignatureTypes(): SignatureType[] {
    return getSupportedSignatureTypes();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createDSCSigningEngine = (config?: Partial<DSCEngineConfig>): DSCSigningEngine => {
  return new DSCSigningEngine(config);
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  DSCProvider,
  DSCClass,
  SignatureType,
  CertificateInfo,
  SigningResponse,
  VerificationResponse,
  SigningError
};

export {
  getSupportedProviders,
  getSupportedSignatureTypes,
  getDaysUntilExpiry,
  isCertificateExpiringSoon
};

// =============================================================================
// VERSION INFO
// =============================================================================

export const DSC_ENGINE_VERSION = {
  version: "1.0.0",
  supportedProviders: getSupportedProviders().length,
  supportedSignatureTypes: getSupportedSignatureTypes().length,
  lastUpdated: "2025-01-29",
  features: {
    cloudDSC: true,
    usbToken: true,
    batchSigning: true,
    signatureVerification: true,
    certificateHealth: true,
    auditLog: true,
    timestamping: true
  }
};
