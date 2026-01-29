/**
 * Benchmarking AI - Unit Tests
 * Tests AI-enhanced comparable analysis and benchmarking functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  BenchmarkingAIService,
  createBenchmarkingAIService,
  WorkingCapitalAdjustmentResult,
  ComparableRejectionResult,
  ArmLengthConclusionResult,
  WorkingCapitalData,
  PLIType,
  ScreeningCriteria,
} from '../benchmarking-ai';

describe('Benchmarking AI Service', () => {
  let service: BenchmarkingAIService;

  beforeEach(() => {
    service = createBenchmarkingAIService();
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(BenchmarkingAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createBenchmarkingAIService();
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(BenchmarkingAIService);
    });
  });

  describe('Working Capital Adjustment', () => {
    const mockWorkingCapitalData: WorkingCapitalData = {
      testedPartyName: 'India Sub Pvt Ltd',
      financialYear: '2024-25',
      revenue: 1000000000,
      receivables: 150000000,
      inventory: 50000000,
      payables: 80000000,
      comparableFinancials: [
        {
          companyName: 'Comparable A Ltd',
          revenue: 500000000,
          receivables: 100000000,
          inventory: 30000000,
          payables: 50000000,
        },
        {
          companyName: 'Comparable B Ltd',
          revenue: 800000000,
          receivables: 120000000,
          inventory: 40000000,
          payables: 60000000,
        },
      ],
      interestRate: 10.5,
      rateBasis: 'SBI PLR',
    };

    test('should generate working capital adjustment', async () => {
      const result = await service.generateWorkingCapitalAdjustment(mockWorkingCapitalData);
      expect(result).toBeDefined();
      expect(result.narrative).toBeDefined();
      expect(result.aiEnhanced).toBeDefined();
    });

    test('should include methodology', async () => {
      const result = await service.generateWorkingCapitalAdjustment(mockWorkingCapitalData);
      expect(result.methodology).toBeDefined();
      expect(typeof result.methodology).toBe('string');
    });

    test('should include comparable adjustments', async () => {
      const result = await service.generateWorkingCapitalAdjustment(mockWorkingCapitalData);
      expect(result.comparableAdjustments).toBeDefined();
      expect(Array.isArray(result.comparableAdjustments)).toBe(true);
    });

    test('should include regulatory basis', async () => {
      const result = await service.generateWorkingCapitalAdjustment(mockWorkingCapitalData);
      expect(result.regulatoryBasis).toBeDefined();
      expect(result.regulatoryBasis).toContain('Rule 10B');
    });

    test('should calculate tested party adjustment', async () => {
      const result = await service.generateWorkingCapitalAdjustment(mockWorkingCapitalData);
      expect(result.testedPartyAdjustment).toBeDefined();
      expect(typeof result.testedPartyAdjustment).toBe('number');
    });
  });

  describe('Comparable Rejection', () => {
    const mockCompany = {
      cin: 'U72200MH2020PTC123456',
      name: 'Test Technologies Pvt Ltd',
      nicCode: '62',
      nicDescription: 'Computer programming activities',
      financials: {
        '2024-25': {
          operatingRevenue: 500000000,
          operatingProfit: 50000000,
          totalOperatingCost: 450000000,
          rptAsPercentage: 40,
        },
      },
      plis: {
        '2024-25': {
          [PLIType.OP_OC]: 11.1,
          [PLIType.OP_OR]: 10,
        },
      },
      rejectionReasons: [ScreeningCriteria.RELATED_PARTY_TRANSACTIONS],
      functionalProfile: 'Software Development',
      weightedAveragePLI: {},
    };

    test('should generate comparable rejection rationale', async () => {
      const result = await service.generateComparableRejection(
        mockCompany as any,
        'IT Services',
        ['Software Development'],
        1000000000
      );
      expect(result).toBeDefined();
      expect(result.rejectionRationale).toBeDefined();
      expect(result.aiEnhanced).toBeDefined();
    });

    test('should include company details', async () => {
      const result = await service.generateComparableRejection(
        mockCompany as any,
        'IT Services',
        ['Software Development'],
        1000000000
      );
      expect(result.companyName).toBe('Test Technologies Pvt Ltd');
      expect(result.cin).toBe('U72200MH2020PTC123456');
    });

    test('should include rejection categories', async () => {
      const result = await service.generateComparableRejection(
        mockCompany as any,
        'IT Services',
        ['Software Development'],
        1000000000
      );
      expect(result.rejectionCategories).toBeDefined();
      expect(Array.isArray(result.rejectionCategories)).toBe(true);
    });

    test('should include detailed reasons', async () => {
      const result = await service.generateComparableRejection(
        mockCompany as any,
        'IT Services',
        ['Software Development'],
        1000000000
      );
      expect(result.detailedReasons).toBeDefined();
      expect(Array.isArray(result.detailedReasons)).toBe(true);
    });

    test('should include regulatory basis', async () => {
      const result = await service.generateComparableRejection(
        mockCompany as any,
        'IT Services',
        ['Software Development'],
        1000000000
      );
      expect(result.regulatoryBasis).toBeDefined();
      expect(result.regulatoryBasis).toContain('Rule 10B');
    });
  });

  describe('Arm\'s Length Conclusion', () => {
    const mockBenchmarkingResult = {
      testedPartyName: 'India Sub Pvt Ltd',
      analysisYears: ['2022-23', '2023-24', '2024-25'],
      pliType: PLIType.OP_OC,
      comparablesSearched: 50,
      comparablesAccepted: 8,
      acceptedCompanies: [
        { name: 'Comp A', weightedAveragePLI: { [PLIType.OP_OC]: 10 } },
        { name: 'Comp B', weightedAveragePLI: { [PLIType.OP_OC]: 12 } },
      ],
      rejectedCompanies: [],
      minimum: 8,
      maximum: 15,
      lowerQuartile: 9,
      median: 11,
      upperQuartile: 13,
      arithmeticMean: 11.5,
      testedPartyPLI: { '2024-25': 11 },
      testedPartyInRange: true,
      adjustmentRequired: false,
      adjustmentAmount: 0,
    };

    test('should generate arm\'s length conclusion', async () => {
      const result = await service.generateArmLengthConclusion(mockBenchmarkingResult as any);
      expect(result).toBeDefined();
      expect(result.narrative).toBeDefined();
      expect(result.aiEnhanced).toBeDefined();
    });

    test('should include summary', async () => {
      const result = await service.generateArmLengthConclusion(mockBenchmarkingResult as any);
      expect(result.summary).toBeDefined();
      expect(typeof result.summary).toBe('string');
    });

    test('should include PLI analysis', async () => {
      const result = await service.generateArmLengthConclusion(mockBenchmarkingResult as any);
      expect(result.pliAnalysis).toBeDefined();
      expect(result.pliAnalysis.pliType).toBeDefined();
      expect(result.pliAnalysis.armLengthRange).toBeDefined();
    });

    test('should include arm\'s length range', async () => {
      const result = await service.generateArmLengthConclusion(mockBenchmarkingResult as any);
      expect(result.pliAnalysis.armLengthRange.lowerQuartile).toBeDefined();
      expect(result.pliAnalysis.armLengthRange.median).toBeDefined();
      expect(result.pliAnalysis.armLengthRange.upperQuartile).toBeDefined();
    });

    test('should include conclusion', async () => {
      const result = await service.generateArmLengthConclusion(mockBenchmarkingResult as any);
      expect(result.conclusion).toBeDefined();
      expect(['within_range', 'requires_adjustment', 'requires_review']).toContain(result.conclusion);
    });

    test('should include recommendations', async () => {
      const result = await service.generateArmLengthConclusion(mockBenchmarkingResult as any);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('should include regulatory basis', async () => {
      const result = await service.generateArmLengthConclusion(mockBenchmarkingResult as any);
      expect(result.regulatoryBasis).toBeDefined();
      expect(result.regulatoryBasis).toContain('Rule 10CA');
    });
  });

  describe('PLI Types', () => {
    test('PLIType enum should have expected values', () => {
      expect(PLIType.OP_OC).toBeDefined();
      expect(PLIType.OP_OR).toBeDefined();
      expect(PLIType.OP_TA).toBeDefined();
      expect(PLIType.OP_CE).toBeDefined();
      expect(PLIType.BERRY_RATIO).toBeDefined();
    });
  });

  describe('Screening Criteria', () => {
    test('ScreeningCriteria enum should have expected values', () => {
      expect(ScreeningCriteria.RELATED_PARTY_TRANSACTIONS).toBeDefined();
      expect(ScreeningCriteria.PERSISTENT_LOSSES).toBeDefined();
      expect(ScreeningCriteria.FUNCTIONAL_DISSIMILARITY).toBeDefined();
      expect(ScreeningCriteria.DIFFERENT_INDUSTRY).toBeDefined();
    });
  });
});
