/**
 * Dashboard AI - Unit Tests
 * Tests AI-enhanced dashboard insights and recommendations
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  DashboardAIService,
  createDashboardAIService,
  ComplianceRiskScore,
  ClientPriorityAnalysis,
  SmartNotification,
  DeadlinePrediction,
  ComplianceStatus,
  FormType,
  Priority,
  NotificationType,
} from '../dashboard-ai';

describe('Dashboard AI Service', () => {
  let service: DashboardAIService;

  beforeEach(() => {
    service = createDashboardAIService();
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(DashboardAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createDashboardAIService();
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(DashboardAIService);
    });

    test('should get engine', () => {
      const engine = service.getEngine();
      expect(engine).toBeDefined();
    });
  });

  describe('Compliance Risk Scoring', () => {
    const mockClient = {
      id: 'client-001',
      pan: 'ABCDE1234F',
      name: 'Test Corp Ltd',
      industry: 'IT Services',
      segment: 'Large',
      engagementPartner: 'Partner A',
      engagementManager: 'Manager B',
      internationalTransactions: 50000000,
      domesticTransactions: 10000000,
      status: 'active' as const,
      tpApplicability: {
        form3ceb: true,
        masterFile: true,
        cbcr: false,
        safeHarbour: true,
      },
      complianceForms: [
        {
          id: 'form-001',
          formType: FormType.FORM_3CEB,
          assessmentYear: '2024-25',
          status: ComplianceStatus.IN_PROGRESS,
          dueDate: '2024-10-31',
        },
      ],
      priority: Priority.HIGH,
    };

    test('should calculate compliance risk score', async () => {
      const result = await service.calculateComplianceRiskScore(mockClient as any);
      expect(result).toBeDefined();
      expect(result.overallScore).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include risk category', async () => {
      const result = await service.calculateComplianceRiskScore(mockClient as any);
      expect(result.riskCategory).toBeDefined();
      expect(['critical', 'high', 'medium', 'low']).toContain(result.riskCategory);
    });

    test('should include risk breakdown', async () => {
      const result = await service.calculateComplianceRiskScore(mockClient as any);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.deadlineRisk).toBeDefined();
      expect(result.breakdown.completionRisk).toBeDefined();
    });

    test('should include top risk factors', async () => {
      const result = await service.calculateComplianceRiskScore(mockClient as any);
      expect(result.topRiskFactors).toBeDefined();
      expect(Array.isArray(result.topRiskFactors)).toBe(true);
    });

    test('should include recommended actions', async () => {
      const result = await service.calculateComplianceRiskScore(mockClient as any);
      expect(result.recommendedActions).toBeDefined();
      expect(Array.isArray(result.recommendedActions)).toBe(true);
    });

    test('should include summary', async () => {
      const result = await service.calculateComplianceRiskScore(mockClient as any);
      expect(result.summary).toBeDefined();
      expect(typeof result.summary).toBe('string');
    });
  });

  describe('Client Priority Analysis', () => {
    const mockClients = [
      {
        id: 'client-001',
        pan: 'ABCDE1234F',
        name: 'Test Corp Ltd',
        industry: 'IT Services',
        segment: 'Large',
        engagementPartner: 'Partner A',
        engagementManager: 'Manager B',
        internationalTransactions: 50000000,
        domesticTransactions: 10000000,
        status: 'active' as const,
        tpApplicability: {
          form3ceb: true,
          masterFile: false,
          cbcr: false,
          safeHarbour: true,
        },
        complianceForms: [
          {
            id: 'form-001',
            formType: FormType.FORM_3CEB,
            assessmentYear: '2024-25',
            status: ComplianceStatus.NOT_STARTED,
            dueDate: '2024-10-31',
          },
        ],
        priority: Priority.HIGH,
      },
    ];

    const mockTeamMembers = [
      {
        id: 'member-001',
        name: 'John Doe',
        role: 'manager',
        email: 'john@firm.com',
        availableCapacity: 40,
      },
    ];

    test('should analyze client priorities', async () => {
      const result = await service.analyzeClientPriorities(mockClients as any, mockTeamMembers as any);
      expect(result).toBeDefined();
      expect(result.priorityRanking).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include priority ranking', async () => {
      const result = await service.analyzeClientPriorities(mockClients as any, mockTeamMembers as any);
      expect(result.priorityRanking).toBeDefined();
      expect(Array.isArray(result.priorityRanking)).toBe(true);
    });

    test('should include resource allocation', async () => {
      const result = await service.analyzeClientPriorities(mockClients as any, mockTeamMembers as any);
      expect(result.resourceAllocation).toBeDefined();
      expect(result.resourceAllocation.criticalClients).toBeDefined();
      expect(result.resourceAllocation.highPriorityClients).toBeDefined();
    });

    test('should include workflow recommendations', async () => {
      const result = await service.analyzeClientPriorities(mockClients as any, mockTeamMembers as any);
      expect(result.workflowRecommendations).toBeDefined();
      expect(Array.isArray(result.workflowRecommendations)).toBe(true);
    });
  });

  describe('Smart Notifications', () => {
    test('should generate smart notification', async () => {
      const result = await service.generateSmartNotification({
        eventType: NotificationType.DEADLINE_REMINDER,
        clientName: 'Test Corp Ltd',
        formType: FormType.FORM_3CEB,
        dueDate: '2024-10-31',
        currentStatus: ComplianceStatus.IN_PROGRESS,
      });
      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include priority', async () => {
      const result = await service.generateSmartNotification({
        eventType: NotificationType.OVERDUE_ALERT,
        clientName: 'Test Corp Ltd',
        formType: FormType.FORM_3CEB,
        dueDate: '2024-09-01', // Past date
        currentStatus: ComplianceStatus.OVERDUE,
      });
      expect(result.priority).toBeDefined();
    });

    test('should include next steps', async () => {
      const result = await service.generateSmartNotification({
        eventType: NotificationType.DEADLINE_REMINDER,
        clientName: 'Test Corp Ltd',
        formType: FormType.FORM_3CEB,
        dueDate: '2024-10-31',
        currentStatus: ComplianceStatus.NOT_STARTED,
      });
      expect(result.nextSteps).toBeDefined();
      expect(Array.isArray(result.nextSteps)).toBe(true);
    });
  });

  describe('Deadline Prediction', () => {
    const mockClient = {
      id: 'client-001',
      name: 'Test Corp Ltd',
      complianceForms: [],
    };

    const mockForm = {
      id: 'form-001',
      formType: FormType.FORM_3CEB,
      assessmentYear: '2024-25',
      status: ComplianceStatus.IN_PROGRESS,
      dueDate: '2024-10-31',
    };

    test('should predict deadline completion', async () => {
      const result = await service.predictDeadlineCompletion({
        client: mockClient as any,
        form: mockForm as any,
      });
      expect(result).toBeDefined();
      expect(result.completionProbability).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include predicted completion date', async () => {
      const result = await service.predictDeadlineCompletion({
        client: mockClient as any,
        form: mockForm as any,
      });
      expect(result.predictedCompletionDate).toBeDefined();
    });

    test('should include confidence level', async () => {
      const result = await service.predictDeadlineCompletion({
        client: mockClient as any,
        form: mockForm as any,
      });
      expect(result.confidenceLevel).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(result.confidenceLevel);
    });

    test('should include risk factors', async () => {
      const result = await service.predictDeadlineCompletion({
        client: mockClient as any,
        form: mockForm as any,
      });
      expect(result.riskFactors).toBeDefined();
      expect(Array.isArray(result.riskFactors)).toBe(true);
    });

    test('should include recommendations', async () => {
      const result = await service.predictDeadlineCompletion({
        client: mockClient as any,
        form: mockForm as any,
      });
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('Enhanced Stats', () => {
    test('should get enhanced stats', async () => {
      const result = await service.getEnhancedStats([]);
      expect(result).toBeDefined();
      expect(result.aiInsights).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    test('should include AI insights', async () => {
      const result = await service.getEnhancedStats([]);
      expect(result.aiInsights.overallRiskScore).toBeDefined();
      expect(result.aiInsights.criticalClientCount).toBeDefined();
      expect(result.aiInsights.predictedOverdueCount).toBeDefined();
    });
  });

  describe('Enums and Constants', () => {
    test('ComplianceStatus enum should have values', () => {
      expect(ComplianceStatus.NOT_STARTED).toBeDefined();
      expect(ComplianceStatus.IN_PROGRESS).toBeDefined();
      expect(ComplianceStatus.FILED).toBeDefined();
      expect(ComplianceStatus.OVERDUE).toBeDefined();
    });

    test('FormType enum should have values', () => {
      expect(FormType.FORM_3CEB).toBeDefined();
      expect(FormType.FORM_3CEAA).toBeDefined();
      expect(FormType.FORM_3CEAD).toBeDefined();
    });

    test('Priority enum should have values', () => {
      expect(Priority.CRITICAL).toBeDefined();
      expect(Priority.HIGH).toBeDefined();
      expect(Priority.MEDIUM).toBeDefined();
      expect(Priority.LOW).toBeDefined();
    });

    test('NotificationType enum should have values', () => {
      expect(NotificationType.DEADLINE_REMINDER).toBeDefined();
      expect(NotificationType.OVERDUE_ALERT).toBeDefined();
      expect(NotificationType.TASK_ASSIGNED).toBeDefined();
    });
  });
});
