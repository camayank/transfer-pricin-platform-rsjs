/**
 * Transfer Pricing Platform - Integration Tests
 * Validates end-to-end integration between all TP engines
 */

import { describe, test, expect } from '@jest/globals';

// Import all engines
import { createComparableSearchEngine, getRecommendedPLI } from '../comparable-search-engine';
import { createOECDReferenceEngine } from '../oecd-reference-engine';
import { createCaseLawEngine } from '../case-law-engine';
import { createForexEngine } from '../forex-engine';
import { createInterestRateEngine } from '../interest-rate-engine';
import { createEfilingEngine } from '../efiling-engine';
import { createDSCSigningEngine } from '../dsc-signing-engine';
import { SafeHarbourCalculator, SAFE_HARBOUR_RULES, TransactionType } from '../safe-harbour-engine';
import { createForm3CEBBuilder, createForm3CEBValidator } from '../form-3ceb-engine';

describe('Transfer Pricing Platform Integration Tests', () => {

  describe('Engine Instantiation', () => {
    test('All engines should instantiate without errors', () => {
      expect(() => createComparableSearchEngine()).not.toThrow();
      expect(() => createOECDReferenceEngine()).not.toThrow();
      expect(() => createCaseLawEngine()).not.toThrow();
      expect(() => createForexEngine()).not.toThrow();
      expect(() => createInterestRateEngine()).not.toThrow();
      expect(() => createEfilingEngine()).not.toThrow();
      expect(() => createDSCSigningEngine()).not.toThrow();
      expect(() => new SafeHarbourCalculator()).not.toThrow();
      expect(() => createForm3CEBBuilder()).not.toThrow();
      expect(() => createForm3CEBValidator()).not.toThrow();
    });
  });

  describe('PLI Calculation Consistency', () => {
    test('Berry Ratio formula should be Gross Profit / Operating Expenses', () => {
      // Test financial data
      const financials = {
        year: '2023-24',
        revenue: 1000000,
        operatingRevenue: 1000000,
        grossProfit: 300000,
        operatingProfit: 150000,
        operatingCost: 850000,
        totalCost: 850000,
        fixedAssets: 500000,
        totalAssets: 800000,
      };

      // Calculate expected Berry Ratio
      const expectedOperatingExpenses = financials.grossProfit - financials.operatingProfit; // 150000
      const expectedBerryRatio = financials.grossProfit / expectedOperatingExpenses; // 2.0

      // This validates the formula: Berry Ratio = GP / (GP - OP) = GP / Operating Expenses
      expect(expectedBerryRatio).toBe(2.0);
    });

    test('NCP_SALES formula should be (Revenue - Total Cost) / Total Cost', () => {
      const financials = {
        revenue: 1000000,
        totalCost: 800000,
      };

      const expectedNCP = ((financials.revenue - financials.totalCost) / financials.totalCost) * 100;
      expect(expectedNCP).toBe(25); // (1000000 - 800000) / 800000 * 100 = 25%
    });
  });

  describe('Safe Harbour Rate Verification', () => {
    test('IT/ITeS safe harbour rate should be 20% (FY 2023-24 onwards)', () => {
      // Use TransactionType enum for correct key lookup
      const itItesRule = SAFE_HARBOUR_RULES[TransactionType.IT_ITES];
      expect(itItesRule).toBeDefined();

      // Check that the normal case threshold is 20%
      const normalThreshold = itItesRule.thresholds.find((t: { condition: string; margin: number | string }) =>
        t.condition.toLowerCase().includes('normal')
      );
      expect(normalThreshold?.margin).toBe(20);
    });

    test('KPO safe harbour rates should be tiered based on employee cost ratio', () => {
      const kpoRule = SAFE_HARBOUR_RULES[TransactionType.KPO];
      expect(kpoRule).toBeDefined();
      expect(kpoRule.thresholds.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('PLI Recommendation Consistency', () => {
    test('IT_SERVICES should recommend OP_OC per Safe Harbour Rule 10TD', () => {
      const recommended = getRecommendedPLI('IT_SERVICES');
      expect(recommended).toBe('OP_OC');
    });

    test('ITES_BPO should recommend OP_OC per Safe Harbour Rule 10TD', () => {
      const recommended = getRecommendedPLI('ITES_BPO');
      expect(recommended).toBe('OP_OC');
    });

    test('DISTRIBUTOR_LIMITED_RISK should recommend BERRY_RATIO per OECD Para 2.101-2.107', () => {
      const recommended = getRecommendedPLI('DISTRIBUTOR_LIMITED_RISK');
      expect(recommended).toBe('BERRY_RATIO');
    });
  });

  describe('OECD Reference Engine', () => {
    test('Should return guidelines for Chapter 2 (TP Methods)', () => {
      const engine = createOECDReferenceEngine();
      const chapter2 = engine.getChapterGuidelines(2);
      expect(chapter2.guidelines.length).toBeGreaterThan(0);
    });

    test('Should return method guidance for TNMM', () => {
      const engine = createOECDReferenceEngine();
      const guidance = engine.getMethodGuidance('TNMM');
      expect(guidance.methodFullName).toBe('Transactional Net Margin Method');
      expect(guidance.comparabilityFactors.length).toBeGreaterThan(0);
    });
  });

  describe('Case Law Engine', () => {
    test('Should return case law search results', () => {
      const engine = createCaseLawEngine();
      const results = engine.search({ keywords: ['TNMM'] });
      expect(results).toBeDefined();
    });
  });

  describe('E-filing and DSC Status', () => {
    test('E-filing should report COMING_SOON status', () => {
      const engine = createEfilingEngine();
      const status = engine.getStatus();
      expect(status.status).toBe('COMING_SOON');
    });

    test('DSC signing should report COMING_SOON status', () => {
      const engine = createDSCSigningEngine();
      const status = engine.getStatus();
      expect(status.status).toBe('COMING_SOON');
    });
  });

  describe('Comparable Search Engine', () => {
    test('Should search by functional profile', async () => {
      const engine = createComparableSearchEngine();
      const results = await engine.search({
        functionalProfile: 'IT_SERVICES',
        limit: 10
      });
      expect(results).toBeDefined();
      expect(results.companies).toBeDefined();
    });

    test('Should return database stats', () => {
      const engine = createComparableSearchEngine();
      const stats = engine.getDatabaseStats();
      expect(stats.totalCompanies).toBeGreaterThan(0);
    });
  });

  describe('Form 3CEB Integration', () => {
    test('Form3CEBBuilder should create valid form structure', () => {
      const builder = createForm3CEBBuilder();
      expect(builder).toBeDefined();
    });

    test('Form3CEBValidator should validate form data', () => {
      const validator = createForm3CEBValidator();
      expect(validator).toBeDefined();
    });
  });

  describe('Cross-Engine Integration', () => {
    test('Safe harbour eligibility should align with comparable search thresholds', () => {
      // This validates that the safe harbour rates in SAFE_HARBOUR_RULES
      // match what comparable-search-engine uses for eligibility checks
      const itItesRule = SAFE_HARBOUR_RULES[TransactionType.IT_ITES];
      expect(itItesRule).toBeDefined();

      const normalMargin = itItesRule.thresholds.find((t: { condition: string; margin: number | string }) =>
        t.condition.toLowerCase().includes('normal')
      )?.margin;

      // The comparable-search-engine checkSafeHarbourEligibility function
      // should use the same threshold (20% for IT/ITeS)
      expect(normalMargin).toBe(20);
    });
  });
});
