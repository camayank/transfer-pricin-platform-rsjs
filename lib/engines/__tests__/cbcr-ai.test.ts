/**
 * CbCR AI - Unit Tests
 * Tests AI-enhanced Country-by-Country Reporting functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  CbCRAIService,
  createCbCRAIService,
  getCbCRAIService,
  JurisdictionAllocationResult,
  ConsolidationNarrativeResult,
  CbCRValidationResult,
  NexusAnalysisResult,
  CbCRReport,
  CbCRJurisdictionData,
} from '../cbcr-ai';

describe('CbCR AI Service', () => {
  let service: CbCRAIService;

  beforeEach(() => {
    service = createCbCRAIService();
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CbCRAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createCbCRAIService();
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(CbCRAIService);
    });

    test('singleton getter should return service instance', () => {
      const singletonService = getCbCRAIService();
      expect(singletonService).toBeDefined();
      expect(singletonService).toBeInstanceOf(CbCRAIService);
    });
  });

  describe('AI Availability', () => {
    test('should check if AI is available', () => {
      const available = service.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('Jurisdiction Allocation', () => {
    const mockReport: CbCRReport = {
      groupName: 'Global Corp',
      ultimateParent: 'Global Corp Inc',
      parentJurisdiction: 'US',
      reportingPeriod: 'FY 2024-25',
      reportingCurrency: 'USD',
      jurisdictions: [],
      consolidatedRevenue: 1000000000,
      consolidatedPBT: 100000000,
      consolidatedTax: 21000000,
    };

    const mockJurisdictionData: CbCRJurisdictionData = {
      jurisdictionCode: 'IN',
      jurisdictionName: 'India',
      entities: [
        {
          entityName: 'India Sub Pvt Ltd',
          entityType: 'Subsidiary',
          jurisdiction: 'IN',
          mainBusinessActivity: 'Software Development',
          incorporationCountry: 'India',
        },
      ],
      unrelatedRevenue: 200000000,
      relatedRevenue: 50000000,
      totalRevenue: 250000000,
      profitBeforeTax: 30000000,
      taxPaid: 9000000,
      taxAccrued: 10000000,
      statedCapital: 50000000,
      accumulatedEarnings: 80000000,
      employeeCount: 1000,
      tangibleAssets: 20000000,
    };

    test('should generate jurisdiction allocation', async () => {
      const result = await service.generateJurisdictionAllocation(
        mockReport,
        mockJurisdictionData
      );
      expect(result).toBeDefined();
      expect(result.allocation).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include allocation narrative', async () => {
      const result = await service.generateJurisdictionAllocation(
        mockReport,
        mockJurisdictionData
      );
      expect(result.allocation.allocationNarrative).toBeDefined();
    });

    test('should include financial details', async () => {
      const result = await service.generateJurisdictionAllocation(
        mockReport,
        mockJurisdictionData
      );
      expect(result.allocation.financials).toBeDefined();
      expect(result.allocation.financials.revenue).toBeDefined();
      expect(result.allocation.financials.profitBeforeTax).toBeDefined();
    });

    test('should include entities list', async () => {
      const result = await service.generateJurisdictionAllocation(
        mockReport,
        mockJurisdictionData
      );
      expect(result.allocation.entities).toBeDefined();
      expect(Array.isArray(result.allocation.entities)).toBe(true);
    });
  });

  describe('Consolidation Narrative', () => {
    const mockReport: CbCRReport = {
      groupName: 'Global Corp',
      ultimateParent: 'Global Corp Inc',
      parentJurisdiction: 'US',
      reportingPeriod: 'FY 2024-25',
      reportingCurrency: 'USD',
      jurisdictions: [
        {
          jurisdictionCode: 'US',
          jurisdictionName: 'United States',
          entities: [],
          unrelatedRevenue: 500000000,
          relatedRevenue: 100000000,
          totalRevenue: 600000000,
          profitBeforeTax: 60000000,
          taxPaid: 12000000,
          taxAccrued: 13000000,
          statedCapital: 200000000,
          accumulatedEarnings: 400000000,
          employeeCount: 500,
          tangibleAssets: 100000000,
        },
        {
          jurisdictionCode: 'IN',
          jurisdictionName: 'India',
          entities: [],
          unrelatedRevenue: 200000000,
          relatedRevenue: 50000000,
          totalRevenue: 250000000,
          profitBeforeTax: 30000000,
          taxPaid: 9000000,
          taxAccrued: 10000000,
          statedCapital: 50000000,
          accumulatedEarnings: 80000000,
          employeeCount: 1000,
          tangibleAssets: 20000000,
        },
      ],
      consolidatedRevenue: 800000000,
      consolidatedPBT: 85000000,
      consolidatedTax: 20000000,
    };

    test('should generate consolidation narrative', async () => {
      const result = await service.generateConsolidationNarrative(
        mockReport,
        'Consolidated financial statements',
        'Average rate method',
        'USD/INR: 83.5'
      );
      expect(result).toBeDefined();
      expect(result.narrative).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include reporting period', async () => {
      const result = await service.generateConsolidationNarrative(
        mockReport,
        'Consolidated financial statements',
        'Average rate method',
        'USD/INR: 83.5'
      );
      expect(result.narrative.reportingPeriod).toBeDefined();
    });

    test('should include currency and exchange rate info', async () => {
      const result = await service.generateConsolidationNarrative(
        mockReport,
        'Consolidated financial statements',
        'Average rate method',
        'USD/INR: 83.5'
      );
      expect(result.narrative.currencyUsed).toBeDefined();
      expect(result.narrative.exchangeRateMethod).toBeDefined();
    });

    test('should include jurisdiction summary', async () => {
      const result = await service.generateConsolidationNarrative(
        mockReport,
        'Consolidated financial statements',
        'Average rate method',
        'USD/INR: 83.5'
      );
      expect(result.narrative.jurisdictionSummary).toBeDefined();
      expect(Array.isArray(result.narrative.jurisdictionSummary)).toBe(true);
    });
  });

  describe('CbCR Validation', () => {
    const mockReport: CbCRReport = {
      groupName: 'Global Corp',
      ultimateParent: 'Global Corp Inc',
      parentJurisdiction: 'US',
      reportingPeriod: 'FY 2024-25',
      reportingCurrency: 'USD',
      jurisdictions: [
        {
          jurisdictionCode: 'US',
          jurisdictionName: 'United States',
          entities: [],
          unrelatedRevenue: 500000000,
          relatedRevenue: 100000000,
          totalRevenue: 600000000,
          profitBeforeTax: 60000000,
          taxPaid: 12000000,
          taxAccrued: 13000000,
          statedCapital: 200000000,
          accumulatedEarnings: 400000000,
          employeeCount: 500,
          tangibleAssets: 100000000,
        },
      ],
      consolidatedRevenue: 600000000,
      consolidatedPBT: 60000000,
      consolidatedTax: 12000000,
    };

    test('should validate CbCR data', async () => {
      const result = await service.validateCbCR(mockReport);
      expect(result).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include validity status', async () => {
      const result = await service.validateCbCR(mockReport);
      expect(result.validation.isValid).toBeDefined();
      expect(typeof result.validation.isValid).toBe('boolean');
    });

    test('should include completeness score', async () => {
      const result = await service.validateCbCR(mockReport);
      expect(result.validation.completenessScore).toBeDefined();
      expect(typeof result.validation.completenessScore).toBe('number');
    });

    test('should include consistency score', async () => {
      const result = await service.validateCbCR(mockReport);
      expect(result.validation.consistencyScore).toBeDefined();
      expect(typeof result.validation.consistencyScore).toBe('number');
    });

    test('should include cross-jurisdiction checks', async () => {
      const result = await service.validateCbCR(mockReport);
      expect(result.validation.crossJurisdictionChecks).toBeDefined();
      expect(Array.isArray(result.validation.crossJurisdictionChecks)).toBe(true);
    });
  });

  describe('Nexus Analysis', () => {
    const mockReport: CbCRReport = {
      groupName: 'Global Corp',
      ultimateParent: 'Global Corp Inc',
      parentJurisdiction: 'US',
      reportingPeriod: 'FY 2024-25',
      reportingCurrency: 'USD',
      jurisdictions: [],
      consolidatedRevenue: 1000000000,
      consolidatedPBT: 100000000,
      consolidatedTax: 21000000,
    };

    const mockJurisdictionData: CbCRJurisdictionData = {
      jurisdictionCode: 'IN',
      jurisdictionName: 'India',
      entities: [
        {
          entityName: 'India Dev Center',
          entityType: 'Subsidiary',
          jurisdiction: 'IN',
          mainBusinessActivity: 'R&D Services',
          incorporationCountry: 'India',
        },
      ],
      unrelatedRevenue: 10000000,
      relatedRevenue: 190000000,
      totalRevenue: 200000000,
      profitBeforeTax: 25000000,
      taxPaid: 7500000,
      taxAccrued: 8000000,
      statedCapital: 30000000,
      accumulatedEarnings: 50000000,
      employeeCount: 800,
      tangibleAssets: 15000000,
    };

    test('should analyze nexus', async () => {
      const result = await service.analyzeNexus(
        mockReport,
        mockJurisdictionData,
        'Software development and R&D services',
        'Employees: 800, Office space: 50000 sqft'
      );
      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include substantive activities', async () => {
      const result = await service.analyzeNexus(
        mockReport,
        mockJurisdictionData,
        'Software development',
        'Full workforce present'
      );
      expect(result.analysis.substantiveActivities).toBeDefined();
      expect(Array.isArray(result.analysis.substantiveActivities)).toBe(true);
    });

    test('should include nexus risk level', async () => {
      const result = await service.analyzeNexus(
        mockReport,
        mockJurisdictionData,
        'Software development',
        'Full operations'
      );
      expect(result.analysis.nexusRiskLevel).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(result.analysis.nexusRiskLevel);
    });

    test('should include recommendations', async () => {
      const result = await service.analyzeNexus(
        mockReport,
        mockJurisdictionData,
        'Software development',
        'Employees present'
      );
      expect(result.analysis.recommendations).toBeDefined();
      expect(Array.isArray(result.analysis.recommendations)).toBe(true);
    });

    test('should include documentation requirements', async () => {
      const result = await service.analyzeNexus(
        mockReport,
        mockJurisdictionData,
        'Software development',
        'Office and employees'
      );
      expect(result.analysis.documentationRequired).toBeDefined();
      expect(Array.isArray(result.analysis.documentationRequired)).toBe(true);
    });
  });
});
