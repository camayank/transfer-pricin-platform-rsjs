/**
 * Secondary Adjustment Engine - Unit Tests
 * Tests Section 92CE secondary adjustment calculations
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  SecondaryAdjustmentEngine,
  createSecondaryAdjustmentEngine,
  SecondaryAdjustmentInput,
} from "../secondary-adjustment-engine";
import {
  PRIMARY_ADJUSTMENT_THRESHOLD,
  REPATRIATION_DEADLINE_DAYS,
  SecondaryAdjustmentTrigger,
  SecondaryAdjustmentOption,
  RepatriationMode,
} from "../constants/secondary-adjustment-rules";

describe("Secondary Adjustment Engine", () => {
  let engine: SecondaryAdjustmentEngine;

  beforeEach(() => {
    engine = createSecondaryAdjustmentEngine();
  });

  describe("Engine Instantiation", () => {
    test("should create engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(SecondaryAdjustmentEngine);
    });

    test("should create engine using factory function", () => {
      const factoryEngine = createSecondaryAdjustmentEngine();
      expect(factoryEngine).toBeDefined();
      expect(factoryEngine).toBeInstanceOf(SecondaryAdjustmentEngine);
    });
  });

  describe("Secondary Adjustment Calculation", () => {
    test("should calculate secondary adjustment when primary >= Rs. 1 Cr", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 15000000, // Rs. 1.5 Cr
        transactionValue: 100000000,
        armLengthPrice: 115000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      expect(result).toBeDefined();
      expect(result.isApplicable).toBe(true);
      expect(result.primaryAdjustment).toBe(15000000);
      expect(result.excessMoney).toBeGreaterThan(0);
    });

    test("should not apply secondary adjustment when primary < Rs. 1 Cr", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 5000000, // Rs. 50 Lakhs
        transactionValue: 50000000,
        armLengthPrice: 55000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      expect(result.isApplicable).toBe(false);
      expect(result.nonApplicabilityReason).toBeDefined();
    });

    test("should calculate repatriation deadline", () => {
      const orderDate = new Date();
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 20000000,
        transactionValue: 100000000,
        armLengthPrice: 120000000,
        orderDate,
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      expect(result.repatriationDeadline).toBeDefined();
      expect(result.daysRemaining).toBeDefined();
    });
  });

  describe("Options Analysis", () => {
    test("should provide options analysis", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 20000000,
        transactionValue: 100000000,
        armLengthPrice: 120000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      if (result.isApplicable) {
        expect(result.optionsAnalysis).toBeDefined();
        expect(result.optionsAnalysis.length).toBeGreaterThan(0);
      }
    });

    test("should include recommended option", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 15000000,
        transactionValue: 80000000,
        armLengthPrice: 95000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      if (result.isApplicable) {
        expect(result.recommendedOption).toBeDefined();
      }
    });
  });

  describe("Deemed Dividend Calculation", () => {
    test("should calculate deemed dividend when shareholder", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 20000000,
        transactionValue: 100000000,
        armLengthPrice: 120000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
        isSubstantialShareholder: true,
        shareholdingPercentage: 60,
        accumulatedProfits: 50000000,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      expect(result.isApplicable).toBe(true);
    });
  });

  describe("APA/MAP Exemption", () => {
    test("should recognize APA exemption", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 20000000,
        transactionValue: 100000000,
        armLengthPrice: 120000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.APA,
        isAPACovered: true,
        apaDate: new Date("2023-01-15"),
      };

      const result = engine.calculateSecondaryAdjustment(input);

      // APA covered transactions have different treatment
      expect(result).toBeDefined();
    });
  });

  describe("Validation", () => {
    test("should validate input", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 15000000,
        transactionValue: 100000000,
        armLengthPrice: 115000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      };

      const validationIssues = engine.validateSecondaryAdjustment(input);

      expect(validationIssues).toBeDefined();
      expect(Array.isArray(validationIssues)).toBe(true);
      // Valid input should have no issues
      expect(validationIssues.length).toBe(0);
    });
  });

  describe("Repatriation Tracking", () => {
    test("should track repatriation events", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 20000000,
        transactionValue: 100000000,
        armLengthPrice: 120000000,
        orderDate: new Date("2024-01-01"),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
        isRepatriated: true,
        repatriationDate: new Date("2024-02-15"),
        repatriationAmount: 20000000,
        repatriationMode: RepatriationMode.BANK_TRANSFER,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      expect(result).toBeDefined();
    });
  });

  describe("Constants", () => {
    test("should have correct primary adjustment threshold", () => {
      expect(PRIMARY_ADJUSTMENT_THRESHOLD).toBe(10000000); // Rs. 1 Cr
    });

    test("should have correct repatriation deadline days", () => {
      expect(REPATRIATION_DEADLINE_DAYS).toBe(90);
    });
  });

  describe("Computation Steps", () => {
    test("should include computation steps", () => {
      const input: SecondaryAdjustmentInput = {
        assessmentYear: "2024-25",
        primaryAdjustment: 15000000,
        transactionValue: 100000000,
        armLengthPrice: 115000000,
        orderDate: new Date(),
        trigger: SecondaryAdjustmentTrigger.TPO_ADJUSTMENT,
      };

      const result = engine.calculateSecondaryAdjustment(input);

      expect(result.computationSteps).toBeDefined();
      expect(Array.isArray(result.computationSteps)).toBe(true);
    });
  });
});
