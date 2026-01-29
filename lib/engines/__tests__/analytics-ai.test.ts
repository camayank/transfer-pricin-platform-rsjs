/**
 * Analytics AI - Unit Tests
 * Tests AI-enhanced analytics and insights functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  AnalyticsAIService,
  createAnalyticsAIService,
  getAnalyticsAIService,
  PrecedentMiningResult,
  CrossBorderResult,
  TrendAnalysisResult,
  RiskPredictionResult,
  FinancialYearData,
  CrossBorderTransaction,
  BenchmarkData,
} from '../analytics-ai';

describe('Analytics AI Service', () => {
  let service: AnalyticsAIService;

  beforeEach(() => {
    service = createAnalyticsAIService();
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AnalyticsAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createAnalyticsAIService();
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(AnalyticsAIService);
    });

    test('singleton getter should return service instance', () => {
      const singletonService = getAnalyticsAIService();
      expect(singletonService).toBeDefined();
      expect(singletonService).toBeInstanceOf(AnalyticsAIService);
    });
  });

  describe('AI Availability', () => {
    test('should check if AI is available', () => {
      const available = service.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('Regulatory Precedent Mining', () => {
    test('should mine regulatory precedents', async () => {
      const result = await service.mineRegulatoryPrecedents(
        'TNMM method selection for IT services',
        'Company',
        'IT Services',
        'Software Development',
        '2024-25',
        'Captive development center providing services to parent',
        'TNMM with OP/OC as PLI'
      );
      expect(result).toBeDefined();
      expect(result.mining).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include relevant precedents', async () => {
      const result = await service.mineRegulatoryPrecedents(
        'Comparability analysis',
        'Company',
        'Manufacturing',
        'Contract Manufacturing',
        '2024-25',
        'Manufacturing operations for parent',
        'Cost Plus Method'
      );
      expect(result.mining.relevantPrecedents).toBeDefined();
      expect(Array.isArray(result.mining.relevantPrecedents)).toBe(true);
    });

    test('should include regulatory guidance', async () => {
      const result = await service.mineRegulatoryPrecedents(
        'Method selection',
        'Company',
        'Pharma',
        'R&D Services',
        '2024-25',
        'Contract R&D',
        'TNMM'
      );
      expect(result.mining.regulatoryGuidance).toBeDefined();
      expect(Array.isArray(result.mining.regulatoryGuidance)).toBe(true);
    });

    test('should include trends', async () => {
      const result = await service.mineRegulatoryPrecedents(
        'Safe harbour eligibility',
        'Company',
        'IT Services',
        'Services',
        '2024-25',
        'IT/ITeS services',
        'Safe Harbour'
      );
      expect(result.mining.trends).toBeDefined();
      expect(Array.isArray(result.mining.trends)).toBe(true);
    });

    test('should include recommendations', async () => {
      const result = await service.mineRegulatoryPrecedents(
        'Documentation requirements',
        'Company',
        'IT Services',
        'Services',
        '2024-25',
        'Services to AE',
        'TNMM'
      );
      expect(result.mining.recommendations).toBeDefined();
      expect(Array.isArray(result.mining.recommendations)).toBe(true);
    });
  });

  describe('Cross Border Analysis', () => {
    const mockTransactions: CrossBorderTransaction[] = [
      {
        fromJurisdiction: 'India',
        toJurisdiction: 'USA',
        transactionType: 'IT Services',
        value: 100000000,
        tpMethod: 'TNMM',
        currency: 'USD',
      },
      {
        fromJurisdiction: 'USA',
        toJurisdiction: 'India',
        transactionType: 'Royalty',
        value: 20000000,
        tpMethod: 'CUP',
        currency: 'USD',
      },
    ];

    test('should analyze cross border transactions', async () => {
      const result = await service.analyzeCrossBorder(
        'India Sub Pvt Ltd',
        'IT Services',
        '2024-25',
        mockTransactions,
        'TNMM, CUP',
        ['India-USA DTAA']
      );
      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include jurisdiction analysis', async () => {
      const result = await service.analyzeCrossBorder(
        'India Sub Pvt Ltd',
        'IT Services',
        '2024-25',
        mockTransactions,
        'TNMM',
        ['India-USA DTAA']
      );
      expect(result.analysis.primaryJurisdiction).toBeDefined();
      expect(result.analysis.counterpartyJurisdictions).toBeDefined();
    });

    test('should include transaction flows', async () => {
      const result = await service.analyzeCrossBorder(
        'India Sub Pvt Ltd',
        'IT Services',
        '2024-25',
        mockTransactions,
        'TNMM',
        ['India-USA DTAA']
      );
      expect(result.analysis.transactionFlows).toBeDefined();
      expect(Array.isArray(result.analysis.transactionFlows)).toBe(true);
    });

    test('should include risk assessment', async () => {
      const result = await service.analyzeCrossBorder(
        'India Sub Pvt Ltd',
        'IT Services',
        '2024-25',
        mockTransactions,
        'TNMM',
        ['India-USA DTAA']
      );
      expect(result.analysis.riskAssessment).toBeDefined();
    });

    test('should include DTAA analysis', async () => {
      const result = await service.analyzeCrossBorder(
        'India Sub Pvt Ltd',
        'IT Services',
        '2024-25',
        mockTransactions,
        'TNMM',
        ['India-USA DTAA', 'India-UK DTAA']
      );
      expect(result.analysis.dtaaAnalysis).toBeDefined();
      expect(Array.isArray(result.analysis.dtaaAnalysis)).toBe(true);
    });
  });

  describe('Multi-Year Trend Analysis', () => {
    const mockFinancialData: FinancialYearData[] = [
      { year: '2022-23', revenue: 800000000, operatingProfit: 80000000, opOcMargin: 11.1, opOrMargin: 10, rptValue: 600000000 },
      { year: '2023-24', revenue: 900000000, operatingProfit: 95000000, opOcMargin: 11.8, opOrMargin: 10.5, rptValue: 700000000 },
      { year: '2024-25', revenue: 1000000000, operatingProfit: 110000000, opOcMargin: 12.4, opOrMargin: 11, rptValue: 800000000 },
    ];

    const mockBenchmarks: BenchmarkData[] = [
      { year: '2022-23', metric: 'OP/OC', value: 10 },
      { year: '2023-24', metric: 'OP/OC', value: 10.5 },
      { year: '2024-25', metric: 'OP/OC', value: 11 },
    ];

    test('should analyze multi-year trends', async () => {
      const result = await service.analyzeMultiYearTrends(
        'India Sub Pvt Ltd',
        'IT Services',
        mockFinancialData,
        mockBenchmarks
      );
      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include analysis years', async () => {
      const result = await service.analyzeMultiYearTrends(
        'India Sub Pvt Ltd',
        'IT Services',
        mockFinancialData,
        mockBenchmarks
      );
      expect(result.analysis.analysisYears).toBeDefined();
      expect(Array.isArray(result.analysis.analysisYears)).toBe(true);
    });

    test('should include financial trends', async () => {
      const result = await service.analyzeMultiYearTrends(
        'India Sub Pvt Ltd',
        'IT Services',
        mockFinancialData,
        mockBenchmarks
      );
      expect(result.analysis.financialTrends).toBeDefined();
      expect(Array.isArray(result.analysis.financialTrends)).toBe(true);
    });

    test('should include TP metric trends', async () => {
      const result = await service.analyzeMultiYearTrends(
        'India Sub Pvt Ltd',
        'IT Services',
        mockFinancialData,
        mockBenchmarks
      );
      expect(result.analysis.tpMetricTrends).toBeDefined();
    });

    test('should include conclusions', async () => {
      const result = await service.analyzeMultiYearTrends(
        'India Sub Pvt Ltd',
        'IT Services',
        mockFinancialData,
        mockBenchmarks
      );
      expect(result.analysis.conclusions).toBeDefined();
      expect(Array.isArray(result.analysis.conclusions)).toBe(true);
    });
  });

  describe('Risk Prediction', () => {
    const mockHistoricalData: FinancialYearData[] = [
      { year: '2022-23', revenue: 800000000, operatingProfit: 80000000, opOcMargin: 11.1, opOrMargin: 10, rptValue: 600000000 },
      { year: '2023-24', revenue: 900000000, operatingProfit: 90000000, opOcMargin: 11.1, opOrMargin: 10, rptValue: 700000000 },
    ];

    test('should predict risks', async () => {
      const result = await service.predictRisks(
        'India Sub Pvt Ltd',
        'IT Services',
        'FY 2025-26',
        1000000000,
        11,
        800000000,
        'Complete',
        mockHistoricalData,
        'Medium risk'
      );
      expect(result).toBeDefined();
      expect(result.prediction).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include overall risk score', async () => {
      const result = await service.predictRisks(
        'India Sub Pvt Ltd',
        'IT Services',
        'FY 2025-26',
        1000000000,
        11,
        800000000,
        'Complete',
        mockHistoricalData,
        'Medium risk'
      );
      expect(result.prediction.overallRiskScore).toBeDefined();
      expect(typeof result.prediction.overallRiskScore).toBe('number');
    });

    test('should include risk trajectory', async () => {
      const result = await service.predictRisks(
        'India Sub Pvt Ltd',
        'IT Services',
        'FY 2025-26',
        1000000000,
        11,
        800000000,
        'Complete',
        mockHistoricalData,
        'Medium risk'
      );
      expect(result.prediction.riskTrajectory).toBeDefined();
    });

    test('should include predicted risks', async () => {
      const result = await service.predictRisks(
        'India Sub Pvt Ltd',
        'IT Services',
        'FY 2025-26',
        1000000000,
        11,
        800000000,
        'Complete',
        mockHistoricalData,
        'Medium risk'
      );
      expect(result.prediction.predictedRisks).toBeDefined();
      expect(Array.isArray(result.prediction.predictedRisks)).toBe(true);
    });

    test('should include mitigation strategies', async () => {
      const result = await service.predictRisks(
        'India Sub Pvt Ltd',
        'IT Services',
        'FY 2025-26',
        1000000000,
        11,
        800000000,
        'Complete',
        mockHistoricalData,
        'Medium risk'
      );
      expect(result.prediction.mitigationStrategies).toBeDefined();
      expect(Array.isArray(result.prediction.mitigationStrategies)).toBe(true);
    });
  });
});
