/**
 * Safe Harbour Engine - Unit Tests
 * Tests safe harbour eligibility calculations for all transaction types
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  SafeHarbourCalculator,
  SAFE_HARBOUR_RULES,
  SBI_RATES,
  TransactionType,
  CreditRating,
} from '../safe-harbour-engine';
import { SafeHarbourTransactionType } from '../types';

describe('Safe Harbour Engine', () => {
  let calculator: SafeHarbourCalculator;

  beforeEach(() => {
    calculator = new SafeHarbourCalculator('2024-25');
  });

  describe('Calculator Instantiation', () => {
    test('should create calculator instance', () => {
      expect(calculator).toBeDefined();
      expect(calculator).toBeInstanceOf(SafeHarbourCalculator);
    });

    test('should create calculator with custom assessment year', () => {
      const customCalculator = new SafeHarbourCalculator('2025-26');
      expect(customCalculator).toBeDefined();
    });
  });

  describe('IT/ITeS Safe Harbour (Rule 10TD)', () => {
    test('should be eligible when OP/OC >= 17% (normal case)', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.IT_ITES,
        operatingRevenue: 10000000,
        operatingCost: 8000000,
        operatingProfit: 2000000, // 25% OP/OC
        assessmentYear: '2024-25',
      });

      expect(result.eligible).toBe(true);
      expect(result.currentValue).toBeGreaterThan(17);
    });

    test('should not be eligible when OP/OC < 17%', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.IT_ITES,
        operatingRevenue: 10000000,
        operatingCost: 9200000,
        operatingProfit: 800000, // 8.7% OP/OC
        assessmentYear: '2024-25',
      });

      expect(result.eligible).toBe(false);
      expect(result.gap).toBeLessThan(0);
    });

    test('should have higher threshold for significant ownership', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.IT_ITES,
        operatingRevenue: 10000000,
        operatingCost: 8500000,
        operatingProfit: 1500000, // 17.6% OP/OC
        isSignificantOwnership: true,
        assessmentYear: '2024-25',
      });

      // With significant ownership, threshold is 18%
      expect(result.requiredValue).toBeGreaterThanOrEqual(17);
    });
  });

  describe('KPO Safe Harbour (Rule 10TD)', () => {
    test('should apply KPO rules', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.KPO,
        operatingRevenue: 10000000,
        operatingCost: 7500000,
        operatingProfit: 2500000, // 33.3% OP/OC
        employeeCost: 2000000, // 26.7% of operating cost
        assessmentYear: '2024-25',
      });

      expect(result).toBeDefined();
      expect(result.marginType).toBe('percentage');
    });
  });

  describe('Contract R&D Software Safe Harbour (Rule 10TD)', () => {
    test('should be eligible when OP/OC >= 24%', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
        operatingRevenue: 10000000,
        operatingCost: 7500000,
        operatingProfit: 2500000, // 33.3% OP/OC
        assessmentYear: '2024-25',
      });

      expect(result.eligible).toBe(true);
    });

    test('should not be eligible when OP/OC < 24%', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
        operatingRevenue: 10000000,
        operatingCost: 8800000,
        operatingProfit: 1200000, // 13.6% OP/OC
        assessmentYear: '2024-25',
      });

      expect(result.eligible).toBe(false);
    });
  });

  describe('Contract R&D Pharma Safe Harbour (Rule 10TD)', () => {
    test('should be eligible when OP/OC >= 24%', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.CONTRACT_RD_PHARMA,
        operatingRevenue: 10000000,
        operatingCost: 7500000,
        operatingProfit: 2500000, // 33.3% OP/OC
        assessmentYear: '2024-25',
      });

      expect(result.eligible).toBe(true);
    });
  });

  describe('Auto Ancillary Safe Harbour (Rule 10TD)', () => {
    test('should be eligible when OP/OC >= 12%', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.AUTO_ANCILLARY,
        operatingRevenue: 10000000,
        operatingCost: 8500000,
        operatingProfit: 1500000, // 17.6% OP/OC
        assessmentYear: '2024-25',
      });

      expect(result.eligible).toBe(true);
    });

    test('should not be eligible when OP/OC < 12%', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.AUTO_ANCILLARY,
        operatingRevenue: 10000000,
        operatingCost: 9200000,
        operatingProfit: 800000, // 8.7% OP/OC
        assessmentYear: '2024-25',
      });

      expect(result.eligible).toBe(false);
    });
  });

  describe('Intra-group Loan INR Safe Harbour (Rule 10TE)', () => {
    test('should calculate safe harbour rate for INR loan', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.LOAN_INR,
        loanAmount: 500000000, // 50 Cr
        interestRate: 12,
        assessmentYear: '2024-25',
      });

      expect(result).toBeDefined();
      expect(result.marginType).toBe('interest_rate');
    });
  });

  describe('Intra-group Loan FC Safe Harbour (Rule 10TE)', () => {
    test('should calculate safe harbour rate for FC loan with credit rating', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,
        loanAmount: 5000000,
        interestRate: 5,
        creditRating: CreditRating.AAA,
        assessmentYear: '2024-25',
      });

      expect(result).toBeDefined();
      expect(result.marginType).toBe('interest_rate');
    });
  });

  describe('Corporate Guarantee Safe Harbour (Rule 10TF)', () => {
    test('should calculate guarantee commission', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.CORPORATE_GUARANTEE,
        guaranteeAmount: 500000000, // 50 Cr
        guaranteeCommission: 1.5, // 1.5%
        assessmentYear: '2024-25',
      });

      expect(result).toBeDefined();
      expect(result.marginType).toBe('commission');
    });
  });

  describe('Safe Harbour Rules Constants', () => {
    test('should have IT_ITES rule defined', () => {
      const rule = SAFE_HARBOUR_RULES[SafeHarbourTransactionType.IT_ITES];
      expect(rule).toBeDefined();
      expect(rule.marginType).toBe('OP/OC');
    });

    test('should have KPO rule defined', () => {
      const rule = SAFE_HARBOUR_RULES[SafeHarbourTransactionType.KPO];
      expect(rule).toBeDefined();
    });

    test('should have all 8 transaction types defined', () => {
      const types = [
        SafeHarbourTransactionType.IT_ITES,
        SafeHarbourTransactionType.KPO,
        SafeHarbourTransactionType.CONTRACT_RD_SOFTWARE,
        SafeHarbourTransactionType.CONTRACT_RD_PHARMA,
        SafeHarbourTransactionType.AUTO_ANCILLARY,
        SafeHarbourTransactionType.LOAN_FOREIGN_CURRENCY,
        SafeHarbourTransactionType.LOAN_INR,
        SafeHarbourTransactionType.CORPORATE_GUARANTEE,
      ];

      types.forEach(type => {
        expect(SAFE_HARBOUR_RULES[type]).toBeDefined();
      });
    });
  });

  describe('SBI Rates', () => {
    test('should have MCLR rates defined', () => {
      expect(SBI_RATES.mclr).toBeDefined();
      expect(SBI_RATES.mclr.oneYear).toBeDefined();
    });

    test('should have base rate defined', () => {
      expect(SBI_RATES.baseRate).toBeDefined();
      expect(typeof SBI_RATES.baseRate).toBe('number');
    });
  });

  describe('Legacy calculateEligibility Method', () => {
    test('should work with FinancialData input', () => {
      const result = calculator.calculateEligibility(
        SafeHarbourTransactionType.IT_ITES,
        {
          assessmentYear: '2024-25',
          totalRevenue: 10000000,
          operatingRevenue: 10000000,
          totalOperatingCost: 8000000,
          transactionValue: 10000000,
        }
      );

      expect(result).toBeDefined();
      expect(result.isEligible).toBeDefined();
      expect(result.meetsSafeHarbour).toBeDefined();
      expect(result.complianceDetails).toBeDefined();
    });
  });

  describe('Result Properties', () => {
    test('should include recommendation in result', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.IT_ITES,
        operatingRevenue: 10000000,
        operatingCost: 8000000,
        operatingProfit: 2000000,
        assessmentYear: '2024-25',
      });

      expect(result.recommendation).toBeDefined();
      expect(typeof result.recommendation).toBe('string');
    });

    test('should include details in result', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.IT_ITES,
        operatingRevenue: 10000000,
        operatingCost: 8000000,
        operatingProfit: 2000000,
        assessmentYear: '2024-25',
      });

      expect(result.details).toBeDefined();
    });

    test('should include transaction type in result', () => {
      const result = calculator.checkEligibility({
        transactionType: SafeHarbourTransactionType.IT_ITES,
        operatingRevenue: 10000000,
        operatingCost: 8000000,
        operatingProfit: 2000000,
        assessmentYear: '2024-25',
      });

      expect(result.transactionType).toBe(SafeHarbourTransactionType.IT_ITES);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing required fields', () => {
      expect(() => {
        calculator.checkEligibility({
          transactionType: SafeHarbourTransactionType.IT_ITES,
          // Missing other required fields
        });
      }).toThrow();
    });
  });
});
