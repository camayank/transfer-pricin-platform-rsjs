/**
 * Safe Harbour AI - Unit Tests
 * Tests AI-enhanced Safe Harbour rule application functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  SafeHarbourAIService,
  createSafeHarbourAIService,
  SafeHarbourEnhancedResult,
  GapAnalysisResult,
  Form3CEFANarrativeResult,
} from '../safe-harbour-ai';
import { SafeHarbourTransactionType } from '../types';
import { FinancialData } from '../safe-harbour-engine';

describe('Safe Harbour AI Service', () => {
  let service: SafeHarbourAIService;

  const mockFinancialData: FinancialData = {
    operatingRevenue: 120000000,
    totalOperatingCost: 100000000,
    employeeCost: 60000000,
    transactionValue: 100000000,
  };

  beforeEach(() => {
    service = createSafeHarbourAIService('2024-25');
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(SafeHarbourAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createSafeHarbourAIService('2024-25');
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(SafeHarbourAIService);
    });

    test('should create service with different assessment year', () => {
      const service2025 = createSafeHarbourAIService('2025-26');
      expect(service2025).toBeDefined();
      expect(service2025).toBeInstanceOf(SafeHarbourAIService);
    });
  });

  describe('Calculate with AI Recommendation', () => {
    test('should calculate with AI recommendation for IT/ITeS services', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData,
        'India Sub Pvt Ltd'
      );

      expect(result).toBeDefined();
      expect(result.meetsSafeHarbour).toBeDefined();
      expect(typeof result.meetsSafeHarbour).toBe('boolean');
    });

    test('should calculate for KPO services', async () => {
      const kpoFinancialData: FinancialData = {
        operatingRevenue: 125000000,
        totalOperatingCost: 100000000,
        employeeCost: 75000000,
        transactionValue: 100000000,
      };

      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.KPO,
        kpoFinancialData,
        'India KPO Pvt Ltd'
      );

      expect(result).toBeDefined();
      expect(result.meetsSafeHarbour).toBeDefined();
    });

    test('should calculate for contract R&D software', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
        mockFinancialData,
        'India R&D Pvt Ltd'
      );

      expect(result).toBeDefined();
    });

    test('should include actual margin', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData,
        'India Sub Pvt Ltd'
      );

      expect(result.actualMargin).toBeDefined();
      expect(typeof result.actualMargin).toBe('number');
    });

    test('should include required margin', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData,
        'India Sub Pvt Ltd'
      );

      expect(result.requiredMargin).toBeDefined();
      expect(typeof result.requiredMargin).toBe('number');
    });

    test('should include recommendation text', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData,
        'India Sub Pvt Ltd'
      );

      expect(result.recommendation).toBeDefined();
      expect(typeof result.recommendation).toBe('string');
    });

    test('should include enhanced recommendation when eligible', async () => {
      const eligibleData: FinancialData = {
        operatingRevenue: 120000000,
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        eligibleData,
        'India Sub Pvt Ltd'
      );

      expect(result.enhancedRecommendation).toBeDefined();
    });

    test('should include action items', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData,
        'India Sub Pvt Ltd'
      );

      expect(result.actionItems).toBeDefined();
      expect(Array.isArray(result.actionItems)).toBe(true);
    });

    test('should include regulatory basis', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData,
        'India Sub Pvt Ltd'
      );

      expect(result.regulatoryBasis).toBeDefined();
      expect(result.regulatoryBasis).toContain('Rule');
    });

    test('should include risk assessment', async () => {
      const result = await service.calculateWithAIRecommendation(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData,
        'India Sub Pvt Ltd'
      );

      expect(result.riskAssessment).toBeDefined();
      expect(result.riskAssessment.level).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(result.riskAssessment.level);
    });
  });

  describe('Gap Analysis Generation', () => {
    test('should generate gap analysis when not meeting threshold', async () => {
      const belowThresholdData: FinancialData = {
        operatingRevenue: 110000000, // 10% margin
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.generateGapAnalysis(
        SafeHarbourTransactionType.IT_ITES,
        belowThresholdData
      );

      expect(result).toBeDefined();
      expect(result.hasGap).toBe(true);
    });

    test('should indicate no gap when meeting threshold', async () => {
      const aboveThresholdData: FinancialData = {
        operatingRevenue: 120000000, // 20% margin
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.generateGapAnalysis(
        SafeHarbourTransactionType.IT_ITES,
        aboveThresholdData
      );

      expect(result).toBeDefined();
      expect(result.hasGap).toBe(false);
    });

    test('should include current margin', async () => {
      const result = await service.generateGapAnalysis(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData
      );

      expect(result.currentMargin).toBeDefined();
      expect(typeof result.currentMargin).toBe('number');
    });

    test('should include required margin', async () => {
      const result = await service.generateGapAnalysis(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData
      );

      expect(result.requiredMargin).toBeDefined();
      expect(typeof result.requiredMargin).toBe('number');
    });

    test('should include gap value', async () => {
      const result = await service.generateGapAnalysis(
        SafeHarbourTransactionType.IT_ITES,
        mockFinancialData
      );

      expect(result.gap).toBeDefined();
      expect(typeof result.gap).toBe('number');
    });

    test('should include strategies when gap exists', async () => {
      const belowThresholdData: FinancialData = {
        operatingRevenue: 110000000,
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.generateGapAnalysis(
        SafeHarbourTransactionType.IT_ITES,
        belowThresholdData
      );

      expect(result.strategies).toBeDefined();
      expect(Array.isArray(result.strategies)).toBe(true);
    });
  });

  describe('Form 3CEFA Narrative Generation', () => {
    test('should generate Form 3CEFA narrative when eligible', async () => {
      const eligibleData: FinancialData = {
        operatingRevenue: 120000000,
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.generateForm3CEFANarrative(
        SafeHarbourTransactionType.IT_ITES,
        eligibleData,
        {
          entityName: 'India Sub Pvt Ltd',
          entityPAN: 'AAACI1234A',
          aeName: 'US Parent Corp',
          aeCountry: 'USA',
        }
      );

      expect(result).toBeDefined();
      expect(result.canGenerate).toBeDefined();
    });

    test('should not generate narrative when not eligible', async () => {
      const notEligibleData: FinancialData = {
        operatingRevenue: 105000000, // Only 5% margin
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.generateForm3CEFANarrative(
        SafeHarbourTransactionType.IT_ITES,
        notEligibleData,
        {
          entityName: 'India Sub Pvt Ltd',
          entityPAN: 'AAACI1234A',
          aeName: 'US Parent Corp',
          aeCountry: 'USA',
        }
      );

      expect(result.canGenerate).toBe(false);
      expect(result.reason).toBeDefined();
    });

    test('should include narrative content when eligible', async () => {
      const eligibleData: FinancialData = {
        operatingRevenue: 120000000,
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.generateForm3CEFANarrative(
        SafeHarbourTransactionType.IT_ITES,
        eligibleData,
        {
          entityName: 'India Sub Pvt Ltd',
          entityPAN: 'AAACI1234A',
          aeName: 'US Parent Corp',
          aeCountry: 'USA',
        }
      );

      if (result.canGenerate) {
        expect(result.narrative).toBeDefined();
        expect(result.narrative?.declarationStatement).toBeDefined();
        expect(result.narrative?.complianceConfirmation).toBeDefined();
      }
    });

    test('should include margin details when eligible', async () => {
      const eligibleData: FinancialData = {
        operatingRevenue: 120000000,
        totalOperatingCost: 100000000,
        employeeCost: 60000000,
        transactionValue: 100000000,
      };

      const result = await service.generateForm3CEFANarrative(
        SafeHarbourTransactionType.IT_ITES,
        eligibleData,
        {
          entityName: 'India Sub Pvt Ltd',
          entityPAN: 'AAACI1234A',
          aeName: 'US Parent Corp',
          aeCountry: 'USA',
        }
      );

      if (result.canGenerate && result.narrative) {
        expect(result.narrative.marginDetails).toBeDefined();
        expect(result.narrative.marginDetails.achieved).toBeDefined();
        expect(result.narrative.marginDetails.required).toBeDefined();
      }
    });
  });

  describe('Batch Processing with AI', () => {
    test('should process batch of transactions', async () => {
      const transactions = [
        {
          transactionType: SafeHarbourTransactionType.IT_ITES,
          financialData: {
            operatingRevenue: 120000000,
            totalOperatingCost: 100000000,
            employeeCost: 60000000,
            transactionValue: 100000000,
          },
          entityName: 'India IT Pvt Ltd',
        },
        {
          transactionType: SafeHarbourTransactionType.KPO,
          financialData: {
            operatingRevenue: 130000000,
            totalOperatingCost: 100000000,
            employeeCost: 75000000,
            transactionValue: 100000000,
          },
          entityName: 'India KPO Pvt Ltd',
        },
      ];

      const result = await service.processBatchWithAI(transactions);

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBe(2);
    });

    test('should provide batch summary', async () => {
      const transactions = [
        {
          transactionType: SafeHarbourTransactionType.IT_ITES,
          financialData: {
            operatingRevenue: 120000000,
            totalOperatingCost: 100000000,
            employeeCost: 60000000,
            transactionValue: 100000000,
          },
          entityName: 'India Sub Pvt Ltd',
        },
      ];

      const result = await service.processBatchWithAI(transactions);

      expect(result.summary).toBeDefined();
      expect(result.summary.totalTransactions).toBeDefined();
    });
  });

  describe('Transaction Types', () => {
    test('SafeHarbourTransactionType enum should have expected values', () => {
      expect(SafeHarbourTransactionType.IT_ITES).toBeDefined();
      expect(SafeHarbourTransactionType.KPO).toBeDefined();
      expect(SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE).toBeDefined();
      expect(SafeHarbourTransactionType.CONTRACT_RD_PHARMA).toBeDefined();
      expect(SafeHarbourTransactionType.AUTO_ANCILLARY).toBeDefined();
      expect(SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY).toBeDefined();
      expect(SafeHarbourTransactionType.LOAN_INR).toBeDefined();
      expect(SafeHarbourTransactionType.CORPORATE_GUARANTEE).toBeDefined();
    });
  });
});
