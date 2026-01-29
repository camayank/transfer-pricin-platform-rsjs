/**
 * TP Dispute AI - Unit Tests
 * Tests AI-enhanced Transfer Pricing dispute and audit management functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  TPDisputeAIService,
  createTPDisputeAIService,
  getTPDisputeAIService,
  DisputeRiskResult,
  DefenseStrategyResult,
  APAAssistanceResult,
  TPOResponseResult,
  LitigationResult,
  TPProfile,
  RPTSummary,
  DocumentationStatus,
  DisputeCase,
} from '../tp-dispute-ai';

describe('TP Dispute AI Service', () => {
  let service: TPDisputeAIService;

  const mockTPProfile: TPProfile = {
    entityName: 'India Sub Pvt Ltd',
    entityPAN: 'AAACI1234A',
    assessmentYear: '2024-25',
    industry: 'IT Services',
    totalRevenue: 1000000000,
    operatingProfit: 100000000,
    opOcMargin: 11.1,
    opOrMargin: 10,
  };

  const mockRPTSummary: RPTSummary[] = [
    {
      transactionType: 'IT Services',
      relatedParty: 'US Parent Corp',
      value: 500000000,
      method: 'TNMM',
      margin: 11,
    },
    {
      transactionType: 'Royalty Payment',
      relatedParty: 'US Parent Corp',
      value: 50000000,
      method: 'CUP',
      margin: 3,
    },
  ];

  const mockDocumentationStatus: DocumentationStatus = {
    tpStudy: 'complete',
    benchmarkStudy: 'complete',
    agreements: 'complete',
    farAnalysis: 'complete',
  };

  const mockBenchmarkRange = {
    min: 8,
    max: 15,
  };

  const mockDisputeCase: DisputeCase = {
    entityName: 'India Sub Pvt Ltd',
    assessmentYear: '2024-25',
    transactionType: 'IT Services',
    relatedParty: 'US Parent Corp',
    transactionValue: 500000000,
    methodApplied: 'TNMM',
    testedPartyMargin: 11,
    proposedAdjustment: 50000000,
    currentForum: 'TPO',
  };

  beforeEach(() => {
    service = createTPDisputeAIService();
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TPDisputeAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createTPDisputeAIService();
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(TPDisputeAIService);
    });

    test('singleton getter should return service instance', () => {
      const singletonService = getTPDisputeAIService();
      expect(singletonService).toBeDefined();
      expect(singletonService).toBeInstanceOf(TPDisputeAIService);
    });
  });

  describe('AI Availability', () => {
    test('should check if AI is available', () => {
      const available = service.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('Dispute Risk Assessment', () => {
    test('should assess dispute risk', async () => {
      const result = await service.assessDisputeRisk(
        mockTPProfile,
        mockRPTSummary,
        mockDocumentationStatus,
        mockBenchmarkRange
      );
      expect(result).toBeDefined();
      expect(result.assessment).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include overall risk score', async () => {
      const result = await service.assessDisputeRisk(
        mockTPProfile,
        mockRPTSummary,
        mockDocumentationStatus,
        mockBenchmarkRange
      );
      expect(result.assessment.overallRiskScore).toBeDefined();
      expect(typeof result.assessment.overallRiskScore).toBe('number');
    });

    test('should include risk level', async () => {
      const result = await service.assessDisputeRisk(
        mockTPProfile,
        mockRPTSummary,
        mockDocumentationStatus,
        mockBenchmarkRange
      );
      expect(result.assessment.riskLevel).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(result.assessment.riskLevel);
    });

    test('should include risk factors', async () => {
      const result = await service.assessDisputeRisk(
        mockTPProfile,
        mockRPTSummary,
        mockDocumentationStatus,
        mockBenchmarkRange
      );
      expect(result.assessment.riskFactors).toBeDefined();
      expect(Array.isArray(result.assessment.riskFactors)).toBe(true);
    });

    test('should include audit likelihood', async () => {
      const result = await service.assessDisputeRisk(
        mockTPProfile,
        mockRPTSummary,
        mockDocumentationStatus,
        mockBenchmarkRange
      );
      expect(result.assessment.auditLikelihood).toBeDefined();
      expect(result.assessment.auditLikelihood.probability).toBeDefined();
    });

    test('should include recommendations', async () => {
      const result = await service.assessDisputeRisk(
        mockTPProfile,
        mockRPTSummary,
        mockDocumentationStatus,
        mockBenchmarkRange
      );
      expect(result.assessment.recommendations).toBeDefined();
      expect(Array.isArray(result.assessment.recommendations)).toBe(true);
    });

    test('should include potential adjustment estimate', async () => {
      const result = await service.assessDisputeRisk(
        mockTPProfile,
        mockRPTSummary,
        mockDocumentationStatus,
        mockBenchmarkRange
      );
      expect(result.assessment.potentialAdjustment).toBeDefined();
      expect(result.assessment.potentialAdjustment.estimatedAmount).toBeDefined();
    });
  });

  describe('Defense Strategy Generation', () => {
    test('should generate defense strategy', async () => {
      const result = await service.generateDefenseStrategy(
        mockDisputeCase,
        'TPO proposes 15% margin based on comparable analysis',
        { functions: 'Software development', assets: 'IT infrastructure', risks: 'Limited' },
        'Margin of 11% is arm\'s length based on comparable analysis',
        'TP documentation, benchmarking study, agreements'
      );
      expect(result).toBeDefined();
      expect(result.strategy).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include transaction type', async () => {
      const result = await service.generateDefenseStrategy(
        mockDisputeCase,
        'Margin adjustment proposed',
        { functions: 'Development', assets: 'IT', risks: 'Limited' },
        'Economic arguments',
        'Available evidence'
      );
      expect(result.strategy.transactionType).toBeDefined();
    });

    test('should include defense pillars', async () => {
      const result = await service.generateDefenseStrategy(
        mockDisputeCase,
        'TPO position',
        { functions: 'Development', assets: 'IT', risks: 'Limited' },
        'Economic arguments',
        'Available evidence'
      );
      expect(result.strategy.defensePillars).toBeDefined();
      expect(Array.isArray(result.strategy.defensePillars)).toBe(true);
    });
  });

  describe('APA Assistance', () => {
    test('should provide APA assistance', async () => {
      const result = await service.generateAPAAssistance(
        'India Sub Pvt Ltd',
        'AAACI1234A',
        'IT Services',
        'bilateral',
        mockRPTSummary,
        '3 years of consistent transactions',
        'TNMM',
        'OP/OC',
        '8% - 15%',
        'US Parent Corp - 100% shareholder',
        'USA'
      );
      expect(result).toBeDefined();
      expect(result.assistance).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include APA recommendation', async () => {
      const result = await service.generateAPAAssistance(
        'India Sub Pvt Ltd',
        'AAACI1234A',
        'IT Services',
        'unilateral',
        mockRPTSummary,
        'Transaction history',
        'TNMM',
        'OP/OC',
        '8% - 15%',
        'Related party details'
      );
      expect(result.assistance).toBeDefined();
    });
  });

  describe('TPO Response Generation', () => {
    test('should generate TPO response', async () => {
      const result = await service.generateTPOResponse(
        'India Sub Pvt Ltd',
        'AAACI1234A',
        '2024-25',
        'TPO/REF/2024/001',
        'initial',
        'Justify the selection of TNMM over CUP method',
        'IT Services',
        'US Parent Corp',
        500000000,
        'TNMM',
        'TNMM is the most appropriate method',
        'TP Study, Benchmarking Analysis, Agreements',
        'Functional comparability, reliable comparables',
        'Relevant case laws supporting TNMM'
      );
      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });
  });

  describe('Litigation Analysis', () => {
    test('should analyze litigation prospects', async () => {
      const result = await service.analyzeLitigation(
        mockDisputeCase,
        'TPO proposes adjustment',
        'Taxpayer position is arm\'s length',
        'Strong evidence available',
        'Favorable precedents available'
      );
      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });
  });

  describe('Type Exports', () => {
    test('TPProfile type should be usable', () => {
      const profile: TPProfile = {
        entityName: 'Test Corp',
        entityPAN: 'AAACT1234A',
        assessmentYear: '2024-25',
        industry: 'Manufacturing',
        totalRevenue: 500000000,
        operatingProfit: 50000000,
        opOcMargin: 11.1,
        opOrMargin: 10,
      };
      expect(profile.entityName).toBe('Test Corp');
    });

    test('RPTSummary type should be usable', () => {
      const rpt: RPTSummary = {
        transactionType: 'Services',
        relatedParty: 'Parent Corp',
        value: 100000000,
        method: 'TNMM',
        margin: 10,
      };
      expect(rpt.transactionType).toBe('Services');
    });

    test('DocumentationStatus type should be usable', () => {
      const status: DocumentationStatus = {
        tpStudy: 'complete',
        benchmarkStudy: 'partial',
        agreements: 'complete',
        farAnalysis: 'missing',
      };
      expect(status.tpStudy).toBe('complete');
    });

    test('DisputeCase type should be usable', () => {
      const dispute: DisputeCase = {
        entityName: 'Test Corp',
        assessmentYear: '2024-25',
        transactionType: 'Services',
        relatedParty: 'Parent',
        transactionValue: 100000000,
        methodApplied: 'TNMM',
        testedPartyMargin: 10,
        proposedAdjustment: 5000000,
        currentForum: 'DRP',
      };
      expect(dispute.currentForum).toBe('DRP');
    });
  });
});
