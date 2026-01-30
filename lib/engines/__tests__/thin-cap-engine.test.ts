/**
 * Thin Capitalization Engine - Unit Tests
 * Tests Section 94B interest limitation calculations
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  ThinCapitalizationEngine,
  createThinCapEngine,
  ThinCapInput,
} from "../thin-cap-engine";
import {
  INTEREST_THRESHOLD,
  EBITDA_LIMITATION_PERCENTAGE,
  CARRYFORWARD_YEARS,
  Section94BEntityType,
  LenderType,
  calculateAllowableInterest,
  calculateDisallowedInterest,
  calculateEBITDA,
  isExemptEntity,
} from "../constants/thin-cap-rules";

describe("Thin Capitalization Engine", () => {
  let engine: ThinCapitalizationEngine;

  beforeEach(() => {
    engine = createThinCapEngine();
  });

  describe("Engine Instantiation", () => {
    test("should create engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(ThinCapitalizationEngine);
    });

    test("should create engine using factory function", () => {
      const factoryEngine = createThinCapEngine();
      expect(factoryEngine).toBeDefined();
    });
  });

  describe("Thin Cap Calculation", () => {
    test("should calculate thin cap limitation", () => {
      const input: ThinCapInput = {
        assessmentYear: "2024-25",
        entityType: Section94BEntityType.INDIAN_COMPANY,
        financials: {
          profitBeforeTax: 10000000,
          totalInterestExpense: 5000000,
          depreciation: 2000000,
          amortization: 500000,
        },
        interestExpenses: [
          {
            lenderName: "Foreign AE Parent",
            lenderType: LenderType.NON_RESIDENT_AE,
            lenderCountry: "USA",
            interestType: "term_loan",
            principalAmount: 100000000,
            interestRate: 8,
            interestAmount: 8000000,
            isAE: true,
            aeRelationship: "parent",
          },
        ],
      };

      const result = engine.calculateInterestLimitation(input);

      expect(result).toBeDefined();
      expect(result.isApplicable).toBeDefined();
      expect(result.ebitdaResult).toBeDefined();
      expect(result.allowableInterest).toBeDefined();
      expect(result.disallowedInterest).toBeDefined();
    });
  });

  describe("EBITDA Calculation Helper", () => {
    test("should calculate EBITDA correctly", () => {
      const ebitda = calculateEBITDA({
        profitBeforeTax: 10000000,
        interestExpense: 3000000,
        depreciation: 2000000,
        amortization: 500000,
      });

      expect(ebitda).toBe(15500000); // 10M + 3M + 2M + 0.5M
    });
  });

  describe("Allowable Interest Calculation", () => {
    test("should calculate allowable interest at 30% of EBITDA", () => {
      const ebitda = 15000000;
      const allowable = calculateAllowableInterest(ebitda);

      expect(allowable).toBe(4500000); // 30% of 15M
    });
  });

  describe("Disallowed Interest Calculation", () => {
    test("should calculate disallowed interest when exceeds limit", () => {
      const allowable = 4500000;
      const actual = 6000000;
      const disallowed = calculateDisallowedInterest(actual, allowable);

      expect(disallowed).toBe(1500000); // 6M - 4.5M
    });

    test("should return zero when within limit", () => {
      const allowable = 4500000;
      const actual = 3000000;
      const disallowed = calculateDisallowedInterest(actual, allowable);

      expect(disallowed).toBe(0);
    });
  });

  describe("Exemption Check", () => {
    test("should identify exempt banking entity", () => {
      const isExempt = isExemptEntity("BANK");

      expect(isExempt).toBe(true);
    });

    test("should identify exempt insurance entity", () => {
      const isExempt = isExemptEntity("INSURANCE");

      expect(isExempt).toBe(true);
    });

    test("should identify non-exempt general company", () => {
      const isExempt = isExemptEntity("GENERAL");

      expect(isExempt).toBe(false);
    });
  });

  describe("Constants", () => {
    test("should have correct interest threshold", () => {
      expect(INTEREST_THRESHOLD).toBe(10000000); // Rs. 1 Cr
    });

    test("should have correct EBITDA limitation percentage", () => {
      expect(EBITDA_LIMITATION_PERCENTAGE).toBe(30);
    });

    test("should have correct carryforward years", () => {
      expect(CARRYFORWARD_YEARS).toBe(8);
    });
  });

  describe("Carryforward", () => {
    test("should handle carryforward history", () => {
      const input: ThinCapInput = {
        assessmentYear: "2024-25",
        entityType: Section94BEntityType.INDIAN_COMPANY,
        financials: {
          profitBeforeTax: 10000000,
          totalInterestExpense: 5000000,
          depreciation: 2000000,
          amortization: 500000,
        },
        interestExpenses: [
          {
            lenderName: "Foreign AE",
            lenderType: LenderType.NON_RESIDENT_AE,
            lenderCountry: "USA",
            interestType: "term_loan",
            principalAmount: 50000000,
            interestRate: 10,
            interestAmount: 5000000,
            isAE: true,
          },
        ],
        carryforwardHistory: [
          {
            disallowanceYear: "2022-23",
            originalAmount: 1000000,
            amountUtilized: 500000,
            remainingBalance: 500000,
            expiryYear: "2030-31",
          },
        ],
      };

      const result = engine.calculateInterestLimitation(input);

      expect(result.carryforwardResult).toBeDefined();
    });
  });

  describe("Validation", () => {
    test("should validate input", () => {
      const input: ThinCapInput = {
        assessmentYear: "2024-25",
        entityType: Section94BEntityType.INDIAN_COMPANY,
        financials: {
          profitBeforeTax: 10000000,
          totalInterestExpense: 3000000,
          depreciation: 2000000,
          amortization: 500000,
        },
        interestExpenses: [],
      };

      const result = engine.calculateInterestLimitation(input);

      expect(result).toBeDefined();
      expect(result.validationIssues).toBeDefined();
    });
  });

  describe("Entity Types", () => {
    test("should have all entity types defined", () => {
      expect(Section94BEntityType.INDIAN_COMPANY).toBeDefined();
      expect(Section94BEntityType.PE_FOREIGN_COMPANY).toBeDefined();
      expect(Section94BEntityType.LLP).toBeDefined();
    });
  });

  describe("Lender Types", () => {
    test("should have all lender types defined", () => {
      expect(LenderType.NON_RESIDENT_AE).toBeDefined();
      expect(LenderType.NON_RESIDENT_GUARANTEED).toBeDefined();
      expect(LenderType.RESIDENT_WITH_AE_DEPOSIT).toBeDefined();
    });
  });
});
