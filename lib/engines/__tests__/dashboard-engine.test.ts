/**
 * Dashboard Engine - Unit Tests
 * Tests CA firm dashboard, client management, and compliance tracking
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  DashboardEngine,
  createDashboardEngine,
  COMPLIANCE_CALENDAR,
  ComplianceStatus,
  FormType,
  Priority,
  TeamRole,
  NotificationType,
  Client,
  TeamMember,
  CAFirm,
} from '../dashboard-engine';

describe('Dashboard Engine', () => {
  let engine: DashboardEngine;

  beforeEach(() => {
    engine = createDashboardEngine();
  });

  describe('Engine Instantiation', () => {
    test('should create engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(DashboardEngine);
    });
  });

  describe('Enums', () => {
    test('should have all compliance statuses', () => {
      expect(ComplianceStatus.NOT_STARTED).toBe('not_started');
      expect(ComplianceStatus.IN_PROGRESS).toBe('in_progress');
      expect(ComplianceStatus.UNDER_REVIEW).toBe('under_review');
      expect(ComplianceStatus.PENDING_SIGNATURE).toBe('pending_signature');
      expect(ComplianceStatus.FILED).toBe('filed');
      expect(ComplianceStatus.ACKNOWLEDGED).toBe('acknowledged');
      expect(ComplianceStatus.OVERDUE).toBe('overdue');
    });

    test('should have all form types', () => {
      expect(FormType.FORM_3CEB).toBe('3CEB');
      expect(FormType.FORM_3CEAA).toBe('3CEAA');
      expect(FormType.FORM_3CEAC).toBe('3CEAC');
      expect(FormType.FORM_3CEAD).toBe('3CEAD');
      expect(FormType.ITR).toBe('ITR');
      expect(FormType.LOCAL_FILE).toBe('LocalFile');
      expect(FormType.FORM_3CEFA).toBe('3CEFA');
    });

    test('should have all priority levels', () => {
      expect(Priority.CRITICAL).toBe('critical');
      expect(Priority.HIGH).toBe('high');
      expect(Priority.MEDIUM).toBe('medium');
      expect(Priority.LOW).toBe('low');
    });

    test('should have all team roles', () => {
      expect(TeamRole.PARTNER).toBe('partner');
      expect(TeamRole.MANAGER).toBe('manager');
      expect(TeamRole.SENIOR_ASSOCIATE).toBe('senior_associate');
      expect(TeamRole.ASSOCIATE).toBe('associate');
      expect(TeamRole.TRAINEE).toBe('trainee');
    });

    test('should have all notification types', () => {
      expect(NotificationType.DEADLINE_REMINDER).toBe('deadline_reminder');
      expect(NotificationType.TASK_ASSIGNED).toBe('task_assigned');
      expect(NotificationType.REVIEW_REQUESTED).toBe('review_requested');
      expect(NotificationType.SIGNATURE_REQUIRED).toBe('signature_required');
      expect(NotificationType.FILING_COMPLETED).toBe('filing_completed');
      expect(NotificationType.OVERDUE_ALERT).toBe('overdue_alert');
    });
  });

  describe('Compliance Calendar', () => {
    test('should have Form 3CEB deadline', () => {
      expect(COMPLIANCE_CALENDAR[FormType.FORM_3CEB]).toBeDefined();
      expect(COMPLIANCE_CALENDAR[FormType.FORM_3CEB].dueDate).toBe('October 31');
      expect(COMPLIANCE_CALENDAR[FormType.FORM_3CEB].penalty).toBeDefined();
    });

    test('should have Master File deadline', () => {
      expect(COMPLIANCE_CALENDAR[FormType.FORM_3CEAA]).toBeDefined();
      expect(COMPLIANCE_CALENDAR[FormType.FORM_3CEAA].dueDate).toBe('November 30');
    });

    test('should have CbCR deadline', () => {
      expect(COMPLIANCE_CALENDAR[FormType.FORM_3CEAD]).toBeDefined();
      expect(COMPLIANCE_CALENDAR[FormType.FORM_3CEAD].dueDate).toBe('March 31');
    });

    test('should have ITR deadline', () => {
      expect(COMPLIANCE_CALENDAR[FormType.ITR]).toBeDefined();
      expect(COMPLIANCE_CALENDAR[FormType.ITR].dueDate).toBe('October 31');
    });

    test('all form types should have deadlines', () => {
      const formTypes = Object.values(FormType);
      formTypes.forEach(formType => {
        expect(COMPLIANCE_CALENDAR[formType]).toBeDefined();
        expect(COMPLIANCE_CALENDAR[formType].dueDate).toBeDefined();
        expect(COMPLIANCE_CALENDAR[formType].description).toBeDefined();
      });
    });
  });

  describe('Client Management', () => {
    const testClient: Client = {
      id: 'client-001',
      pan: 'ABCDE1234F',
      name: 'Test Company Ltd',
      industry: 'IT Services',
      segment: 'Large',
      engagementPartner: 'Partner A',
      engagementManager: 'Manager B',
      internationalTransactions: 5,
      domesticTransactions: 2,
      status: 'active',
      tpApplicability: {
        form3ceb: true,
        masterFile: true,
        cbcr: false,
        safeHarbour: true,
      },
      complianceForms: [],
      priority: Priority.HIGH,
    };

    test('should add a client', () => {
      const result = engine.addClient(testClient);
      expect(result).toBeDefined();
      expect(result.pan).toBe('ABCDE1234F');
    });

    test('should get client by ID', () => {
      engine.addClient(testClient);
      const client = engine.getClient('client-001');
      expect(client).toBeDefined();
      expect(client?.name).toBe('Test Company Ltd');
    });

    test('should get client by PAN', () => {
      engine.addClient(testClient);
      const client = engine.getClientByPAN('ABCDE1234F');
      expect(client).toBeDefined();
      expect(client?.name).toBe('Test Company Ltd');
    });

    test('should return null for non-existent client', () => {
      const client = engine.getClient('non-existent');
      expect(client).toBeNull();
    });

    test('should get all clients', () => {
      engine.addClient(testClient);
      engine.addClient({ ...testClient, id: 'client-002', pan: 'FGHIJ5678K' });
      const clients = engine.getAllClients();
      expect(clients.length).toBe(2);
    });

    test('should update client', () => {
      engine.addClient(testClient);
      const updated = engine.updateClient('client-001', { priority: Priority.CRITICAL });
      expect(updated).toBeDefined();
      expect(updated?.priority).toBe(Priority.CRITICAL);
    });

    test('should return null when updating non-existent client', () => {
      const result = engine.updateClient('non-existent', { priority: Priority.LOW });
      expect(result).toBeNull();
    });

    test('should delete client', () => {
      engine.addClient(testClient);
      const result = engine.deleteClient('client-001');
      expect(result).toBe(true);
      expect(engine.getClient('client-001')).toBeNull();
    });

    test('should return false when deleting non-existent client', () => {
      const result = engine.deleteClient('non-existent');
      expect(result).toBe(false);
    });

    test('should filter clients by status', () => {
      engine.addClient(testClient);
      engine.addClient({ ...testClient, id: 'client-002', pan: 'FGHIJ5678K', status: 'inactive' });

      const activeClients = engine.getClientsByStatus('active');
      expect(activeClients.length).toBe(1);
      expect(activeClients[0].status).toBe('active');
    });

    test('should filter clients by priority', () => {
      engine.addClient(testClient);
      engine.addClient({ ...testClient, id: 'client-002', pan: 'FGHIJ5678K', priority: Priority.LOW });

      const highPriorityClients = engine.getClientsByPriority(Priority.HIGH);
      expect(highPriorityClients.length).toBe(1);
    });
  });

  describe('Compliance Tracking', () => {
    const testClient: Client = {
      id: 'client-001',
      pan: 'ABCDE1234F',
      name: 'Test Company Ltd',
      industry: 'IT Services',
      segment: 'Large',
      engagementPartner: 'Partner A',
      engagementManager: 'Manager B',
      internationalTransactions: 5,
      domesticTransactions: 2,
      status: 'active',
      tpApplicability: {
        form3ceb: true,
        masterFile: true,
        cbcr: false,
        safeHarbour: true,
      },
      complianceForms: [],
      priority: Priority.HIGH,
    };

    beforeEach(() => {
      engine.addClient(testClient);
    });

    test('should update form status', () => {
      const result = engine.updateFormStatus(
        'client-001',
        FormType.FORM_3CEB,
        '2024-25',
        ComplianceStatus.IN_PROGRESS
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe(ComplianceStatus.IN_PROGRESS);
    });

    test('should create new form entry if not exists', () => {
      const result = engine.updateFormStatus(
        'client-001',
        FormType.FORM_3CEB,
        '2024-25',
        ComplianceStatus.NOT_STARTED,
        { assignedTo: 'Manager B' }
      );

      expect(result).toBeDefined();
      expect(result?.assignedTo).toBe('Manager B');
    });

    test('should return null for non-existent client', () => {
      const result = engine.updateFormStatus(
        'non-existent',
        FormType.FORM_3CEB,
        '2024-25',
        ComplianceStatus.IN_PROGRESS
      );

      expect(result).toBeNull();
    });

    test('should get form due date', () => {
      const dueDate = engine.getFormDueDate(FormType.FORM_3CEB, '2024-25');
      expect(dueDate).toBeDefined();
      expect(dueDate).toContain('2024');
    });
  });

  describe('Firm Setup', () => {
    test('should set firm info', () => {
      const firmInfo: CAFirm = {
        id: 'firm-001',
        firmName: 'Test CA Firm',
        firmRegistrationNumber: 'FRN123456',
        address: '123 CA Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'firm@test.com',
        phone: '9876543210',
        partnerInCharge: 'Partner A',
        teamMembers: [],
        clients: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      engine.setFirmInfo(firmInfo);
      expect(engine.getAllClients()).toEqual([]);
    });
  });

  describe('Dashboard Stats', () => {
    test('should get dashboard stats', () => {
      const testClient: Client = {
        id: 'client-001',
        pan: 'ABCDE1234F',
        name: 'Test Company Ltd',
        industry: 'IT Services',
        segment: 'Large',
        engagementPartner: 'Partner A',
        engagementManager: 'Manager B',
        internationalTransactions: 5,
        domesticTransactions: 2,
        status: 'active',
        tpApplicability: {
          form3ceb: true,
          masterFile: true,
          cbcr: false,
          safeHarbour: true,
        },
        complianceForms: [],
        priority: Priority.HIGH,
      };

      engine.addClient(testClient);
      const stats = engine.getDashboardStats();

      expect(stats).toBeDefined();
      expect(stats.totalClients).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Factory Function', () => {
    test('createDashboardEngine should return engine instance', () => {
      const dashboardEngine = createDashboardEngine();
      expect(dashboardEngine).toBeDefined();
      expect(dashboardEngine).toBeInstanceOf(DashboardEngine);
    });
  });
});
