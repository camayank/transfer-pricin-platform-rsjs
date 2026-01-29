/**
 * E-filing Submission API
 * Submit TP forms to ITD portal
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createEfilingEngine,
  FormType,
  EFILING_ENGINE_VERSION
} from "@/lib/engines/efiling-engine";

const engine = createEfilingEngine();

/**
 * GET /api/efiling/submit
 * Get capabilities and form types
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    version: EFILING_ENGINE_VERSION,
    supportedForms: engine.getFormTypes(),
    capabilities: {
      form3CEB: true,
      form3CEAA: true,
      form3CEAD: true,
      xmlGeneration: true,
      validation: true,
      submission: true,
      statusTracking: true,
      complianceStatus: true
    },
    actions: [
      "submit_3ceb",
      "submit_3ceaa",
      "submit_3cead",
      "validate",
      "check_status",
      "get_submissions",
      "get_compliance_status",
      "download_acknowledgment",
      "create_workflow",
      "get_audit_log",
      "test_connection"
    ]
  });
}

/**
 * POST /api/efiling/submit
 * Perform e-filing actions
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
      case "submit_3ceb": {
        if (!params?.data) {
          return NextResponse.json(
            { error: "Missing 'data' parameter with Form 3CEB content" },
            { status: 400 }
          );
        }

        const result = await engine.submitForm3CEB(params.data, params.signatureData);
        return NextResponse.json({
          success: result.success,
          data: result
        });
      }

      case "submit_3ceaa": {
        if (!params?.data) {
          return NextResponse.json(
            { error: "Missing 'data' parameter with Form 3CEAA content" },
            { status: 400 }
          );
        }

        const result = await engine.submitForm3CEAA(params.data, params.signatureData);
        return NextResponse.json({
          success: result.success,
          data: result
        });
      }

      case "submit_3cead": {
        if (!params?.data) {
          return NextResponse.json(
            { error: "Missing 'data' parameter with Form 3CEAD content" },
            { status: 400 }
          );
        }

        const result = await engine.submitForm3CEAD(params.data, params.signatureData);
        return NextResponse.json({
          success: result.success,
          data: result
        });
      }

      case "validate": {
        if (!params?.formType || !params?.xmlContent) {
          return NextResponse.json(
            { error: "Missing 'formType' or 'xmlContent' parameter" },
            { status: 400 }
          );
        }

        const result = await engine.validateSubmission(
          params.formType as FormType,
          params.xmlContent
        );

        return NextResponse.json({
          success: result.valid,
          data: result
        });
      }

      case "check_status": {
        const result = await engine.checkStatus(
          params?.submissionId,
          params?.acknowledgmentNumber
        );

        return NextResponse.json({
          success: result.found,
          data: result
        });
      }

      case "get_submissions": {
        if (!params?.pan) {
          return NextResponse.json(
            { error: "Missing 'pan' parameter" },
            { status: 400 }
          );
        }

        const submissions = await engine.getSubmissions(params.pan, params.assessmentYear);
        return NextResponse.json({
          success: true,
          data: {
            submissions,
            count: submissions.length
          }
        });
      }

      case "get_compliance_status": {
        if (!params?.pan || !params?.assessmentYear) {
          return NextResponse.json(
            { error: "Missing 'pan' or 'assessmentYear' parameter" },
            { status: 400 }
          );
        }

        const status = await engine.getComplianceStatus(params.pan, params.assessmentYear);
        return NextResponse.json({
          success: true,
          data: status
        });
      }

      case "download_acknowledgment": {
        if (!params?.acknowledgmentNumber) {
          return NextResponse.json(
            { error: "Missing 'acknowledgmentNumber' parameter" },
            { status: 400 }
          );
        }

        try {
          const result = await engine.downloadAcknowledgment(params.acknowledgmentNumber);
          return NextResponse.json({
            success: true,
            data: result
          });
        } catch (error) {
          return NextResponse.json(
            { error: "Acknowledgment not found" },
            { status: 404 }
          );
        }
      }

      case "create_workflow": {
        if (!params?.formType || !params?.pan || !params?.assessmentYear) {
          return NextResponse.json(
            { error: "Missing 'formType', 'pan', or 'assessmentYear' parameter" },
            { status: 400 }
          );
        }

        const workflow = engine.createWorkflow(
          params.formType as FormType,
          params.pan,
          params.assessmentYear
        );

        return NextResponse.json({
          success: true,
          data: workflow
        });
      }

      case "get_workflow": {
        if (!params?.workflowId) {
          return NextResponse.json(
            { error: "Missing 'workflowId' parameter" },
            { status: 400 }
          );
        }

        const workflow = engine.getWorkflow(params.workflowId);
        if (!workflow) {
          return NextResponse.json(
            { error: "Workflow not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: workflow
        });
      }

      case "get_audit_log": {
        const log = engine.getAuditLog(params?.pan, params?.assessmentYear);
        return NextResponse.json({
          success: true,
          data: {
            entries: log,
            count: log.length
          }
        });
      }

      case "get_form_schema": {
        if (!params?.formType) {
          return NextResponse.json(
            { error: "Missing 'formType' parameter" },
            { status: 400 }
          );
        }

        const schema = engine.getFormSchema(params.formType as FormType);
        return NextResponse.json({
          success: true,
          data: schema
        });
      }

      case "test_connection": {
        const result = await engine.testConnection();
        return NextResponse.json({
          success: result.success,
          data: result
        });
      }

      case "authenticate": {
        const result = await engine.authenticate();
        return NextResponse.json({
          success: result.success,
          data: {
            authenticated: result.success,
            expiresIn: result.expiresIn
          }
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("E-filing API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
