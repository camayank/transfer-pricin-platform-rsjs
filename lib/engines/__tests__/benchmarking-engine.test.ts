/**
 * Benchmarking Engine - Unit Tests
 * Tests PLI calculations, screening criteria, and comparable search
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  calculatePLIs,
  PLIType,
  FunctionalProfile,
  ScreeningCriteria,
  BenchmarkingEngine,
  ComparableSearchEngine,
  createBenchmarkingEngine,
  createComparableSearchEngine,
  FinancialData,
} from '../benchmarking-engine';

describe('Benchmarking Engine', () => {
  describe('PLI Calculations', () => {
    const sampleFinancials: FinancialData = {
      year: '2023-24',
      totalRevenue: 10000000,
      operatingRevenue: 10000000,
      exportRevenue: 0,
      totalOperatingCost: 8500000,
      employeeCost: 2000000,
      rawMaterialCost: 3000000,
      otherExpenses: 2000000,
      depreciation: 500000,
      grossProfit: 3000000,
      operatingProfit: 1500000,
      pbt: 1500000,
      pat: 1125000,
      totalAssets: 5000000,
      fixedAssets: 2000000,
      currentAssets: 3000000,
      capitalEmployed: 3000000,
      netWorth: 2000000,
      employeeCount: 50,
      relatedPartyTransactions: 500000,
      rptAsPercentage: 5,
    };

    test('should calculate OP/OC correctly', () => {
      const plis = calculatePLIs(sampleFinancials);

      // OP/OC = (Operating Profit / Total Operating Cost) * 100
      const expected = (1500000 / 8500000) * 100;
      expect(plis[PLIType.OP_OC]).toBeCloseTo(expected, 2);
    });

    test('should calculate OP/OR correctly', () => {
      const plis = calculatePLIs(sampleFinancials);

      // OP/OR = (Operating Profit / Operating Revenue) * 100
      const expected = (1500000 / 10000000) * 100;
      expect(plis[PLIType.OP_OR]).toBeCloseTo(expected, 2);
    });

    test('should calculate ROA (OP/TA) correctly', () => {
      const plis = calculatePLIs(sampleFinancials);

      // OP/TA = (Operating Profit / Total Assets) * 100
      const expected = (1500000 / 5000000) * 100;
      expect(plis[PLIType.OP_TA]).toBeCloseTo(expected, 2);
    });

    test('should calculate ROCE (OP/CE) correctly', () => {
      const plis = calculatePLIs(sampleFinancials);

      // OP/CE = (Operating Profit / Capital Employed) * 100
      const expected = (1500000 / 3000000) * 100;
      expect(plis[PLIType.OP_CE]).toBeCloseTo(expected, 2);
    });

    test('should calculate Berry Ratio correctly', () => {
      const plis = calculatePLIs(sampleFinancials);

      // Berry Ratio = Gross Profit / Operating Expenses
      // Operating Expenses = Gross Profit - Operating Profit
      const operatingExpenses = 3000000 - 1500000;
      const expected = 3000000 / operatingExpenses;
      expect(plis[PLIType.BERRY_RATIO]).toBeCloseTo(expected, 2);
    });

    test('should calculate NCP_SALES correctly', () => {
      const plis = calculatePLIs(sampleFinancials);

      // NCP_SALES = (Revenue - Total Cost) / Total Cost * 100
      const totalCost = 8500000 + 3000000; // totalOperatingCost + rawMaterialCost
      const expected = ((10000000 - totalCost) / totalCost) * 100;
      expect(plis[PLIType.NCP_SALES]).toBeCloseTo(expected, 2);
    });

    test('should handle zero operating cost', () => {
      const zeroFinancials: FinancialData = {
        ...sampleFinancials,
        totalOperatingCost: 0,
      };

      const plis = calculatePLIs(zeroFinancials);
      expect(plis[PLIType.OP_OC]).toBe(0);
    });

    test('should handle zero revenue', () => {
      const zeroFinancials: FinancialData = {
        ...sampleFinancials,
        operatingRevenue: 0,
      };

      const plis = calculatePLIs(zeroFinancials);
      expect(plis[PLIType.OP_OR]).toBe(0);
    });

    test('should handle zero assets', () => {
      const zeroFinancials: FinancialData = {
        ...sampleFinancials,
        totalAssets: 0,
        capitalEmployed: 0,
      };

      const plis = calculatePLIs(zeroFinancials);
      expect(plis[PLIType.OP_TA]).toBe(0);
      expect(plis[PLIType.OP_CE]).toBe(0);
    });

    test('should handle zero gross profit for Berry Ratio', () => {
      const zeroFinancials: FinancialData = {
        ...sampleFinancials,
        grossProfit: 0,
      };

      const plis = calculatePLIs(zeroFinancials);
      expect(plis[PLIType.BERRY_RATIO]).toBe(0);
    });
  });

  describe('PLI Type Enum', () => {
    test('should have all expected PLI types', () => {
      expect(PLIType.OP_OC).toBe('op_oc');
      expect(PLIType.OP_OR).toBe('op_or');
      expect(PLIType.OP_TA).toBe('op_ta');
      expect(PLIType.OP_CE).toBe('op_ce');
      expect(PLIType.BERRY_RATIO).toBe('berry');
      expect(PLIType.NCP_SALES).toBe('ncp_sales');
    });
  });

  describe('Functional Profile Enum', () => {
    test('should have all expected functional profiles', () => {
      expect(FunctionalProfile.CONTRACT_MANUFACTURER).toBe('contract_manufacturer');
      expect(FunctionalProfile.FULL_FLEDGED_MANUFACTURER).toBe('full_fledged_manufacturer');
      expect(FunctionalProfile.CONTRACT_RD).toBe('contract_rd');
      expect(FunctionalProfile.FULL_FLEDGED_SERVICE_PROVIDER).toBe('full_fledged_service_provider');
      expect(FunctionalProfile.DISTRIBUTOR_LIMITED_RISK).toBe('distributor_limited_risk');
      expect(FunctionalProfile.DISTRIBUTOR_FULL_RISK).toBe('distributor_full_risk');
    });
  });

  describe('Screening Criteria Enum', () => {
    test('should have all expected screening criteria', () => {
      expect(ScreeningCriteria.RELATED_PARTY_TRANSACTIONS).toBe('rpt');
      expect(ScreeningCriteria.PERSISTENT_LOSSES).toBe('losses');
      expect(ScreeningCriteria.FUNCTIONAL_DISSIMILARITY).toBe('functional');
      expect(ScreeningCriteria.EXTRAORDINARY_EVENTS).toBe('extraordinary');
      expect(ScreeningCriteria.DIFFERENT_ACCOUNTING_YEAR).toBe('accounting_year');
      expect(ScreeningCriteria.DATA_NON_AVAILABILITY).toBe('data_na');
    });
  });

  describe('BenchmarkingEngine Class', () => {
    let engine: BenchmarkingEngine;

    beforeEach(() => {
      engine = createBenchmarkingEngine();
    });

    test('should instantiate without errors', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(BenchmarkingEngine);
    });

    test('should perform benchmarking analysis', () => {
      const testedPartyFinancials: Record<string, FinancialData> = {
        '2023-24': {
          year: '2023-24',
          totalRevenue: 5000000,
          operatingRevenue: 5000000,
          exportRevenue: 0,
          totalOperatingCost: 4250000,
          employeeCost: 1000000,
          rawMaterialCost: 1500000,
          otherExpenses: 1000000,
          depreciation: 250000,
          grossProfit: 1500000,
          operatingProfit: 750000,
          pbt: 750000,
          pat: 562500,
          totalAssets: 2500000,
          fixedAssets: 1000000,
          currentAssets: 1500000,
          capitalEmployed: 1500000,
          netWorth: 1000000,
          employeeCount: 25,
          relatedPartyTransactions: 100000,
          rptAsPercentage: 2,
        },
      };

      const result = engine.performBenchmarking(
        'Test Company',
        testedPartyFinancials,
        PLIType.OP_OC,
        {
          nicCodes: ['62'],
          industryKeywords: ['software'],
          functionalProfiles: [FunctionalProfile.CONTRACT_SERVICE_PROVIDER],
          excludePersistentLosses: true,
          lossYearsThreshold: 2,
          maxRptPercentage: 25,
          analysisYears: ['2023-24', '2022-23', '2021-22'],
          preferredDatabases: [],
        }
      );

      expect(result).toBeDefined();
      expect(result.testedPartyName).toBe('Test Company');
      expect(result.pliType).toBe(PLIType.OP_OC);
    });

    test('should generate benchmarking report', () => {
      const testedPartyFinancials: Record<string, FinancialData> = {
        '2023-24': {
          year: '2023-24',
          totalRevenue: 5000000,
          operatingRevenue: 5000000,
          exportRevenue: 0,
          totalOperatingCost: 4250000,
          employeeCost: 1000000,
          rawMaterialCost: 1500000,
          otherExpenses: 1000000,
          depreciation: 250000,
          grossProfit: 1500000,
          operatingProfit: 750000,
          pbt: 750000,
          pat: 562500,
          totalAssets: 2500000,
          fixedAssets: 1000000,
          currentAssets: 1500000,
          capitalEmployed: 1500000,
          netWorth: 1000000,
          employeeCount: 25,
          relatedPartyTransactions: 100000,
          rptAsPercentage: 2,
        },
      };

      const benchmarkResult = engine.performBenchmarking(
        'Test Company',
        testedPartyFinancials,
        PLIType.OP_OC,
        {
          nicCodes: ['62'],
          industryKeywords: [],
          functionalProfiles: [FunctionalProfile.CONTRACT_SERVICE_PROVIDER],
          excludePersistentLosses: true,
          lossYearsThreshold: 2,
          maxRptPercentage: 25,
          analysisYears: ['2023-24'],
          preferredDatabases: [],
        }
      );

      const report = engine.generateBenchmarkingReport(benchmarkResult);

      expect(report).toBeDefined();
      expect(report.reportTitle).toBe('Transfer Pricing Benchmarking Analysis');
      expect(report.testedParty).toBe('Test Company');
      expect(report.analysisSummary).toBeDefined();
      expect(report.armLengthRange).toBeDefined();
    });
  });

  describe('ComparableSearchEngine Class', () => {
    let searchEngine: ComparableSearchEngine;

    beforeEach(() => {
      searchEngine = createComparableSearchEngine();
    });

    test('should instantiate without errors', () => {
      expect(searchEngine).toBeDefined();
      expect(searchEngine).toBeInstanceOf(ComparableSearchEngine);
    });

    test('should search for comparables', () => {
      const results = searchEngine.searchComparables({
        nicCodes: ['62'],
        industryKeywords: ['software'],
        functionalProfiles: [FunctionalProfile.CONTRACT_SERVICE_PROVIDER],
        excludePersistentLosses: true,
        lossYearsThreshold: 2,
        maxRptPercentage: 25,
        analysisYears: ['2023-24', '2022-23', '2021-22'],
        preferredDatabases: [],
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should apply screening criteria', () => {
      const companies = searchEngine.searchComparables({
        nicCodes: ['62'],
        industryKeywords: [],
        functionalProfiles: [FunctionalProfile.CONTRACT_SERVICE_PROVIDER],
        excludePersistentLosses: true,
        lossYearsThreshold: 2,
        maxRptPercentage: 25,
        analysisYears: ['2023-24', '2022-23', '2021-22'],
        preferredDatabases: [],
      });

      const { accepted, rejected } = searchEngine.applyScreening(companies, {
        nicCodes: ['62'],
        industryKeywords: [],
        functionalProfiles: [FunctionalProfile.CONTRACT_SERVICE_PROVIDER],
        excludePersistentLosses: true,
        lossYearsThreshold: 2,
        maxRptPercentage: 10, // Lower threshold to trigger rejections
        analysisYears: ['2023-24', '2022-23', '2021-22'],
        preferredDatabases: [],
      });

      expect(accepted).toBeDefined();
      expect(rejected).toBeDefined();
      expect(Array.isArray(accepted)).toBe(true);
      expect(Array.isArray(rejected)).toBe(true);
    });
  });

  describe('Factory Functions', () => {
    test('createBenchmarkingEngine should return engine', () => {
      const engine = createBenchmarkingEngine();
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(BenchmarkingEngine);
      expect(typeof engine.performBenchmarking).toBe('function');
      expect(typeof engine.generateBenchmarkingReport).toBe('function');
    });

    test('createComparableSearchEngine should return search engine', () => {
      const engine = createComparableSearchEngine();
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(ComparableSearchEngine);
      expect(typeof engine.searchComparables).toBe('function');
      expect(typeof engine.applyScreening).toBe('function');
    });
  });
});
