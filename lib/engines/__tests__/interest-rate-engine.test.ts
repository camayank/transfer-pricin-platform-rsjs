/**
 * Interest Rate Engine - Unit Tests
 * Tests interest rate benchmarking and loan pricing functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  InterestRateEngine,
  createInterestRateEngine,
  CURRENT_BENCHMARK_RATES,
  RATE_INFO,
  CREDIT_SPREADS,
} from '../interest-rate-engine';

describe('Interest Rate Engine', () => {
  let engine: InterestRateEngine;

  beforeEach(() => {
    engine = createInterestRateEngine();
  });

  describe('Engine Instantiation', () => {
    test('should create engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(InterestRateEngine);
    });

    test('should create engine with custom config', () => {
      const customEngine = createInterestRateEngine({
        cacheTTL: 1800000,
        enableCaching: true,
      });
      expect(customEngine).toBeDefined();
      expect(customEngine).toBeInstanceOf(InterestRateEngine);
    });
  });

  describe('Benchmark Rates Constants', () => {
    test('should have SOFR rate defined', () => {
      expect(CURRENT_BENCHMARK_RATES.SOFR).toBeDefined();
      expect(typeof CURRENT_BENCHMARK_RATES.SOFR.rate).toBe('number');
    });

    test('should have MIBOR rate defined', () => {
      expect(CURRENT_BENCHMARK_RATES.MIBOR).toBeDefined();
      expect(typeof CURRENT_BENCHMARK_RATES.MIBOR.rate).toBe('number');
    });

    test('should have EURIBOR rate defined', () => {
      expect(CURRENT_BENCHMARK_RATES.EURIBOR_3M).toBeDefined();
      expect(typeof CURRENT_BENCHMARK_RATES.EURIBOR_3M.rate).toBe('number');
    });

    test('should have SONIA rate defined', () => {
      expect(CURRENT_BENCHMARK_RATES.SONIA).toBeDefined();
      expect(typeof CURRENT_BENCHMARK_RATES.SONIA.rate).toBe('number');
    });

    test('MIBOR should be higher than SOFR (typically)', () => {
      // MIBOR (India) is typically higher than SOFR (US)
      expect(CURRENT_BENCHMARK_RATES.MIBOR.rate).toBeGreaterThan(CURRENT_BENCHMARK_RATES.SOFR.rate);
    });
  });

  describe('Rate Info', () => {
    test('should have SOFR info', () => {
      expect(RATE_INFO.SOFR).toBeDefined();
      expect(RATE_INFO.SOFR.name).toBeDefined();
      expect(RATE_INFO.SOFR.currency).toBe('USD');
    });

    test('should have MIBOR info', () => {
      expect(RATE_INFO.MIBOR).toBeDefined();
      expect(RATE_INFO.MIBOR.name).toBeDefined();
      expect(RATE_INFO.MIBOR.currency).toBe('INR');
    });

    test('should have EURIBOR info', () => {
      expect(RATE_INFO.EURIBOR_3M).toBeDefined();
      expect(RATE_INFO.EURIBOR_3M.currency).toBe('EUR');
    });

    test('should have SONIA info', () => {
      expect(RATE_INFO.SONIA).toBeDefined();
      expect(RATE_INFO.SONIA.currency).toBe('GBP');
    });
  });

  describe('Credit Spreads', () => {
    test('should have spreads for different credit ratings', () => {
      expect(CREDIT_SPREADS).toBeDefined();
      expect(CREDIT_SPREADS.AAA).toBeDefined();
      expect(CREDIT_SPREADS.AA).toBeDefined();
      expect(CREDIT_SPREADS.A).toBeDefined();
      expect(CREDIT_SPREADS.BBB).toBeDefined();
    });

    test('spreads should increase with lower ratings', () => {
      expect(CREDIT_SPREADS.AA).toBeGreaterThan(CREDIT_SPREADS.AAA);
      expect(CREDIT_SPREADS.A).toBeGreaterThan(CREDIT_SPREADS.AA);
      expect(CREDIT_SPREADS.BBB).toBeGreaterThan(CREDIT_SPREADS.A);
    });

    test('AAA spread should be the lowest', () => {
      const spreads = Object.values(CREDIT_SPREADS);
      expect(CREDIT_SPREADS.AAA).toBe(Math.min(...spreads));
    });
  });

  describe('Get Current Rate', () => {
    test('should get current SOFR rate', async () => {
      const rate = await engine.getRate('SOFR');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeGreaterThan(0);
      expect(rate.rateType).toBe('SOFR');
    });

    test('should get current MIBOR rate', async () => {
      const rate = await engine.getRate('MIBOR');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeGreaterThan(0);
    });

    test('should get current EURIBOR rate', async () => {
      const rate = await engine.getRate('EURIBOR_3M');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeDefined();
    });

    test('should include effective date', async () => {
      const rate = await engine.getRate('SOFR');

      expect(rate.effectiveDate).toBeDefined();
    });
  });

  describe('Loan Benchmarking', () => {
    test('should benchmark USD loan', async () => {
      const result = await engine.benchmarkTPLoan({
        loanAmount: 1000000,
        currency: 'USD',
        tenor: 12,
        loanType: 'intercompany',
        borrowerCreditRating: 'A',
        secured: false,
        relatedParty: true,
      });

      expect(result).toBeDefined();
      expect(result.benchmarkRate).toBeDefined();
      expect(result.armLengthRate).toBeDefined();
    });

    test('should benchmark INR loan', async () => {
      const result = await engine.benchmarkTPLoan({
        loanAmount: 100000000,
        currency: 'INR',
        tenor: 24,
        loanType: 'intercompany',
        borrowerCreditRating: 'AA',
        secured: true,
        relatedParty: true,
      });

      expect(result).toBeDefined();
      expect(result.benchmarkRate).toBeDefined();
    });

    test('should benchmark EUR loan', async () => {
      const result = await engine.benchmarkTPLoan({
        loanAmount: 500000,
        currency: 'EUR',
        tenor: 12,
        loanType: 'intercompany',
        borrowerCreditRating: 'BBB',
        secured: false,
        relatedParty: true,
      });

      expect(result).toBeDefined();
    });

    test('should calculate arm length rate with credit spread', async () => {
      const resultAAA = await engine.benchmarkTPLoan({
        loanAmount: 1000000,
        currency: 'USD',
        tenor: 12,
        loanType: 'intercompany',
        borrowerCreditRating: 'AAA',
        secured: false,
        relatedParty: true,
      });

      const resultBBB = await engine.benchmarkTPLoan({
        loanAmount: 1000000,
        currency: 'USD',
        tenor: 12,
        loanType: 'intercompany',
        borrowerCreditRating: 'BBB',
        secured: false,
        relatedParty: true,
      });

      // BBB should have higher arm length rate due to higher spread
      expect(resultBBB.armLengthRate).toBeGreaterThan(resultAAA.armLengthRate);
    });

    test('should adjust for secured loans', async () => {
      const resultUnsecured = await engine.benchmarkTPLoan({
        loanAmount: 1000000,
        currency: 'USD',
        tenor: 12,
        loanType: 'intercompany',
        borrowerCreditRating: 'A',
        secured: false,
        relatedParty: true,
      });

      const resultSecured = await engine.benchmarkTPLoan({
        loanAmount: 1000000,
        currency: 'USD',
        tenor: 12,
        loanType: 'intercompany',
        borrowerCreditRating: 'A',
        secured: true,
        relatedParty: true,
      });

      // Secured loans should have lower rate
      expect(resultSecured.armLengthRate).toBeLessThan(resultUnsecured.armLengthRate);
    });

    test('should include recommendations', async () => {
      const result = await engine.benchmarkTPLoan({
        loanAmount: 1000000,
        currency: 'USD',
        tenor: 72, // Long tenor
        loanType: 'intercompany',
        borrowerCreditRating: 'A',
        secured: false,
        relatedParty: true,
      });

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Safe Harbour for Loans', () => {
    test('should check safe harbour eligibility for USD loan', async () => {
      const result = await engine.checkSafeHarbourLoan(
        'USD',
        'A',
        200 // 200 basis points spread
      );

      expect(result).toBeDefined();
      expect(result.eligible).toBeDefined();
      expect(result.safeHarbourRate).toBeDefined();
    });

    test('should check safe harbour eligibility for INR loan', async () => {
      const result = await engine.checkSafeHarbourLoan(
        'INR',
        'AAA',
        150 // 150 basis points spread
      );

      expect(result).toBeDefined();
      expect(result.eligible).toBeDefined();
    });
  });

  describe('Supported Rate Types', () => {
    test('should return list of supported rate types', () => {
      const types = engine.getSupportedRateTypes();

      expect(types).toBeDefined();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });
  });

  describe('Recommended Benchmark', () => {
    test('should recommend SOFR for USD', () => {
      const recommended = engine.getRecommendedBenchmark('USD');
      expect(recommended).toBeDefined();
      expect(recommended).toContain('SOFR');
    });

    test('should recommend MIBOR for INR', () => {
      const recommended = engine.getRecommendedBenchmark('INR');
      expect(recommended).toBeDefined();
      expect(recommended).toContain('MIBOR');
    });

    test('should recommend EURIBOR for EUR', () => {
      const recommended = engine.getRecommendedBenchmark('EUR');
      expect(recommended).toBeDefined();
      expect(recommended).toContain('EURIBOR');
    });
  });

  describe('Rate Info Methods', () => {
    test('should get rate info', () => {
      const info = engine.getRateInfo('SOFR');
      expect(info).toBeDefined();
      expect(info.name).toBeDefined();
      expect(info.currency).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', () => {
      expect(() => engine.clearCache()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid rate type gracefully', async () => {
      try {
        await engine.getRate('INVALID_RATE' as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
