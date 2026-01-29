/**
 * ================================================================================
 * DIGICOMPLY AI SERVICE
 * Dashboard & Practice Management Prompts
 *
 * AI-enhanced compliance monitoring and client management
 * ================================================================================
 */

import { PromptTemplate, PromptType, PromptCategory, QualityCheckType } from "../types";

// =============================================================================
// DASHBOARD PROMPTS
// =============================================================================

const COMPLIANCE_RISK_SCORE_PROMPT: PromptTemplate = {
  id: "dashboard_risk_score_v1",
  version: "1.0.0",
  category: PromptCategory.DASHBOARD,
  type: PromptType.COMPLIANCE_RISK_SCORE,
  name: "Compliance Risk Scoring",
  description: "Calculate comprehensive compliance risk score for a client",
  systemPrompt: `You are an expert in Indian Transfer Pricing compliance with deep knowledge of regulatory deadlines, penalties, and risk assessment.

Your task is to analyze client compliance data and provide:
1. A risk score from 0-100 (higher = more risk)
2. Key risk factors with explanations
3. Recommended actions to mitigate risks
4. Priority classification (Critical/High/Medium/Low)

Consider the following risk factors:
- Proximity to statutory deadlines
- Form completion status
- Historical compliance issues
- Transaction complexity (international vs domestic)
- Safe Harbour eligibility status
- Documentation completeness
- Master File/CbCR requirements`,
  userPromptTemplate: `Analyze the compliance risk for this client:

Client Name: {{clientName}}
PAN: {{clientPAN}}
Assessment Year: {{assessmentYear}}
Industry: {{industry}}

Compliance Status:
{{complianceStatus}}

Pending Forms:
{{pendingForms}}

Deadlines:
{{deadlines}}

Transaction Details:
- International Transactions Value: {{internationalTransactions}}
- Domestic Transactions Value: {{domesticTransactions}}
- Safe Harbour Eligibility: {{safeHarbourEligibility}}

Historical Issues:
{{historicalIssues}}

Current Date: {{currentDate}}

Provide:
1. Risk score (0-100) with breakdown by category
2. Top 3 risk factors with explanations
3. Recommended immediate actions
4. Priority classification
5. Brief risk summary paragraph`,
  variables: [
    "clientName",
    "clientPAN",
    "assessmentYear",
    "industry",
    "complianceStatus",
    "pendingForms",
    "deadlines",
    "internationalTransactions",
    "domesticTransactions",
    "safeHarbourEligibility",
    "historicalIssues",
    "currentDate",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      riskScore: { type: "number", minimum: 0, maximum: 100 },
      riskCategory: { type: "string", enum: ["critical", "high", "medium", "low"] },
      riskBreakdown: {
        type: "object",
        properties: {
          deadlineRisk: { type: "number" },
          completionRisk: { type: "number" },
          complexityRisk: { type: "number" },
          documentationRisk: { type: "number" },
        },
      },
      topRiskFactors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            factor: { type: "string" },
            severity: { type: "string" },
            explanation: { type: "string" },
          },
        },
      },
      recommendedActions: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Score Validation",
      description: "Verify risk scores are within valid range (0-100)",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Risk Factor Coverage",
      description: "Ensure all risk factors are explained",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const CLIENT_PRIORITY_ANALYSIS_PROMPT: PromptTemplate = {
  id: "dashboard_priority_v1",
  version: "1.0.0",
  category: PromptCategory.DASHBOARD,
  type: PromptType.CLIENT_PRIORITY_ANALYSIS,
  name: "Client Priority Analysis",
  description: "Analyze and recommend client priority for resource allocation",
  systemPrompt: `You are a practice management expert for CA firms specializing in Transfer Pricing.

Analyze client portfolios to recommend priority allocation based on:
1. Regulatory deadline proximity
2. Client revenue/importance
3. Transaction complexity
4. Resource requirements
5. Risk of non-compliance
6. Historical relationship

Provide actionable recommendations for resource allocation.`,
  userPromptTemplate: `Analyze priority for the following clients:

Firm Context:
- Total Team Members: {{teamSize}}
- Available Capacity (hours/week): {{availableCapacity}}
- Current Date: {{currentDate}}

Client Portfolio:
{{clientList}}

Upcoming Deadlines (next 30 days):
{{upcomingDeadlines}}

Overdue Items:
{{overdueItems}}

Provide:
1. Priority ranking of clients with justification
2. Resource allocation recommendations
3. Suggested task assignments
4. Risk mitigation strategy for high-priority items
5. Workflow optimization suggestions`,
  variables: [
    "teamSize",
    "availableCapacity",
    "currentDate",
    "clientList",
    "upcomingDeadlines",
    "overdueItems",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      priorityRanking: {
        type: "array",
        items: {
          type: "object",
          properties: {
            clientName: { type: "string" },
            priority: { type: "string" },
            justification: { type: "string" },
            recommendedHours: { type: "number" },
          },
        },
      },
      resourceAllocation: { type: "object" },
      workflowRecommendations: { type: "array", items: { type: "string" } },
    },
  },
  qualityChecks: [],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const SMART_NOTIFICATION_PROMPT: PromptTemplate = {
  id: "dashboard_notification_v1",
  version: "1.0.0",
  category: PromptCategory.DASHBOARD,
  type: PromptType.SMART_NOTIFICATION,
  name: "Smart Notification Generation",
  description: "Generate intelligent, contextual notifications for compliance events",
  systemPrompt: `You are an expert at crafting clear, actionable compliance notifications for CA professionals.

Generate notifications that are:
1. Clear and concise
2. Action-oriented
3. Appropriately urgent based on context
4. Include specific next steps
5. Reference relevant regulations when applicable

Notification types:
- Deadline reminders (with escalating urgency)
- Status updates
- Action required alerts
- Compliance completion confirmations
- Risk warnings`,
  userPromptTemplate: `Generate a notification for the following event:

Event Type: {{eventType}}
Client: {{clientName}}
Form/Task: {{formType}}
Due Date: {{dueDate}}
Current Date: {{currentDate}}
Days Until Due: {{daysUntilDue}}
Current Status: {{currentStatus}}

Context:
{{additionalContext}}

Assigned Team Member: {{assignedTo}}

Generate:
1. Notification title (max 60 characters)
2. Notification message (2-3 sentences, action-oriented)
3. Suggested priority (Critical/High/Medium/Low)
4. Specific next steps (bullet points)
5. Relevant regulatory reference if applicable`,
  variables: [
    "eventType",
    "clientName",
    "formType",
    "dueDate",
    "currentDate",
    "daysUntilDue",
    "currentStatus",
    "additionalContext",
    "assignedTo",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      title: { type: "string", maxLength: 60 },
      message: { type: "string" },
      priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
      nextSteps: { type: "array", items: { type: "string" } },
      regulatoryReference: { type: "string" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.PROFESSIONAL_LANGUAGE,
      name: "Notification Clarity",
      description: "Ensure notifications are clear and actionable",
      weight: 0.6,
      required: true,
    },
    {
      type: QualityCheckType.COMPLETENESS,
      name: "Action Items",
      description: "Verify next steps are provided",
      weight: 0.4,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

const DEADLINE_PREDICTION_PROMPT: PromptTemplate = {
  id: "dashboard_deadline_prediction_v1",
  version: "1.0.0",
  category: PromptCategory.DASHBOARD,
  type: PromptType.DEADLINE_PREDICTION,
  name: "Deadline Completion Prediction",
  description: "Predict likelihood of meeting compliance deadlines",
  systemPrompt: `You are an expert in project management and compliance workflow analysis.

Analyze current progress and historical data to predict:
1. Likelihood of meeting deadline (percentage)
2. Estimated completion date
3. Potential bottlenecks
4. Resource adjustments needed

Consider factors like:
- Current completion percentage
- Historical completion patterns
- Team capacity
- Remaining task complexity
- Dependencies and blockers`,
  userPromptTemplate: `Predict deadline completion for:

Client: {{clientName}}
Form: {{formType}}
Due Date: {{dueDate}}
Current Date: {{currentDate}}
Days Remaining: {{daysRemaining}}

Current Progress:
- Status: {{currentStatus}}
- Completion Percentage: {{completionPercentage}}%
- Last Updated: {{lastUpdated}}

Historical Data:
- Average completion time for this form: {{avgCompletionDays}} days
- Client's historical on-time rate: {{onTimeRate}}%

Team Allocation:
- Assigned To: {{assignedTo}}
- Available Hours/Week: {{availableHours}}

Remaining Tasks:
{{remainingTasks}}

Provide:
1. Completion probability (percentage)
2. Predicted completion date
3. Risk factors that could delay completion
4. Recommendations to improve on-time delivery
5. Resource adjustment suggestions if needed`,
  variables: [
    "clientName",
    "formType",
    "dueDate",
    "currentDate",
    "daysRemaining",
    "currentStatus",
    "completionPercentage",
    "lastUpdated",
    "avgCompletionDays",
    "onTimeRate",
    "assignedTo",
    "availableHours",
    "remainingTasks",
  ],
  outputFormat: "json",
  expectedOutputSchema: {
    type: "object",
    properties: {
      completionProbability: { type: "number", minimum: 0, maximum: 100 },
      predictedCompletionDate: { type: "string" },
      riskFactors: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } },
      resourceAdjustments: { type: "string" },
    },
  },
  qualityChecks: [
    {
      type: QualityCheckType.NUMERICAL_ACCURACY,
      name: "Probability Range",
      description: "Verify probability scores are within valid range (0-100)",
      weight: 0.5,
      required: true,
    },
    {
      type: QualityCheckType.CONSISTENCY,
      name: "Prediction Consistency",
      description: "Ensure predictions align with identified risk factors",
      weight: 0.5,
      required: true,
    },
  ],
  createdAt: "2025-01-29",
  updatedAt: "2025-01-29",
};

// =============================================================================
// EXPORT
// =============================================================================

export const DASHBOARD_PROMPTS = {
  complianceRiskScore: COMPLIANCE_RISK_SCORE_PROMPT,
  clientPriorityAnalysis: CLIENT_PRIORITY_ANALYSIS_PROMPT,
  smartNotification: SMART_NOTIFICATION_PROMPT,
  deadlinePrediction: DEADLINE_PREDICTION_PROMPT,
};
