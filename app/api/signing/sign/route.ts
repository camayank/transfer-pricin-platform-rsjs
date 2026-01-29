/**
 * Digital Signature API
 * Sign and verify documents with DSC
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createDSCSigningEngine,
  DSCProvider,
  DSC_ENGINE_VERSION
} from "@/lib/engines/dsc-signing-engine";

const engine = createDSCSigningEngine();

/**
 * GET /api/signing/sign
 * Get capabilities and supported providers
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    version: DSC_ENGINE_VERSION,
    supportedProviders: engine.getSupportedProviders(),
    supportedSignatureTypes: engine.getSupportedSignatureTypes(),
    capabilities: {
      cloudDSC: true,
      usbToken: true,
      batchSigning: true,
      verification: true,
      certificateHealth: true,
      sessionManagement: true,
      auditLog: true
    },
    actions: [
      "sign_document",
      "sign_batch",
      "verify_signature",
      "list_certificates",
      "check_certificate_health",
      "create_session",
      "get_session",
      "end_session",
      "get_audit_log",
      "test_connections"
    ]
  });
}

/**
 * POST /api/signing/sign
 * Perform signing actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing 'action' field" },
        { status: 400 }
      );
    }

    switch (action) {
      case "sign_document": {
        if (!params?.documentId || !params?.documentName || !params?.content || !params?.signerName) {
          return NextResponse.json(
            { error: "Missing required parameters: documentId, documentName, content, signerName" },
            { status: 400 }
          );
        }

        const result = await engine.signDocument({
          documentId: params.documentId,
          documentName: params.documentName,
          documentType: params.documentType ?? "XML",
          content: params.content,
          signerName: params.signerName,
          signerDesignation: params.signerDesignation,
          reason: params.reason,
          location: params.location,
          certificateId: params.certificateId
        });

        return NextResponse.json({
          success: result.success,
          data: result
        });
      }

      case "sign_batch": {
        if (!params?.documents || !params?.signerName) {
          return NextResponse.json(
            { error: "Missing 'documents' or 'signerName' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.signBatch({
          documents: params.documents,
          signerName: params.signerName,
          signerDesignation: params.signerDesignation,
          certificateId: params.certificateId
        });

        return NextResponse.json({
          success: result.failureCount === 0,
          data: result
        });
      }

      case "verify_signature": {
        if (!params?.documentType || !params?.content) {
          return NextResponse.json(
            { error: "Missing 'documentType' or 'content' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.verifySignature(
          params.documentType,
          params.content,
          params.signatureValue
        );

        return NextResponse.json({
          success: result.valid,
          data: result
        });
      }

      case "list_certificates": {
        const certificates = await engine.getAvailableCertificates();
        return NextResponse.json({
          success: true,
          data: certificates
        });
      }

      case "check_certificate_health": {
        const health = await engine.checkCertificateHealth(params?.certificate);
        return NextResponse.json({
          success: true,
          data: {
            certificates: health,
            count: health.length
          }
        });
      }

      case "create_session": {
        const session = await engine.createSession(params?.certificateId);
        if (!session) {
          return NextResponse.json(
            { error: "Failed to create signing session. No valid certificate available." },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: session
        });
      }

      case "get_session": {
        if (!params?.sessionId) {
          return NextResponse.json(
            { error: "Missing 'sessionId' parameter" },
            { status: 400 }
          );
        }

        const session = engine.getSession(params.sessionId);
        if (!session) {
          return NextResponse.json(
            { error: "Session not found or expired" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: session
        });
      }

      case "end_session": {
        if (!params?.sessionId) {
          return NextResponse.json(
            { error: "Missing 'sessionId' parameter" },
            { status: 400 }
          );
        }

        const ended = engine.endSession(params.sessionId);
        return NextResponse.json({
          success: ended,
          data: {
            sessionId: params.sessionId,
            ended
          }
        });
      }

      case "get_audit_log": {
        const log = engine.getAuditLog({
          action: params?.action,
          documentId: params?.documentId,
          signerName: params?.signerName,
          startDate: params?.startDate,
          endDate: params?.endDate
        });

        return NextResponse.json({
          success: true,
          data: {
            entries: log,
            count: log.length
          }
        });
      }

      case "test_connections": {
        const result = await engine.testConnections();
        return NextResponse.json({
          success: true,
          data: result
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Signing API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
