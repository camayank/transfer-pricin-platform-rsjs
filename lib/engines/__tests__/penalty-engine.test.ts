/**
 * Penalty Engine - Unit Tests
 * Tests penalty calculations under Sections 271, 234
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  PenaltyEngine,
  createPenaltyEngine,
  EntityType,
  PenaltyInput,
} from "../penalty-engine";
import {
  CONCEALMENT_PENALTY_RATES,
  DOCUMENTATION_PENALTY_271AA,
  REPORT_FAILURE_PENALTY_271BA,
  INTEREST_234A,
  INTEREST_234B,
  calculateConcealmentPenaltyRange,
  calculate271AAPenalty,
  calculate271BAPenalty,
} from "../constants/penalty-rules";

describe("Penalty Engine", () => {
  let engine: PenaltyEngine;

  beforeEach(() => {
    engine = createPenaltyEngine();
  });

  describe("Engine Instantiation", () => {
    test("should create engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(PenaltyEngine);
    });

    test("should create engine using factory function", () => {
      const factoryEngine = createPenaltyEngine();
      expect(factoryEngine).toBeDefined();
    });
  });

  describe("Full Penalty Calculation", () => {
    test("should calculate total penalty exposure", () => {
      const input: PenaltyInput = {
        assessmentYear: "2024-25",
        entityType: EntityType.DOMESTIC_COMPANY,
        primaryAdjustment: 10000000,
        returnedIncome: 50000000,
        assessedIncome: 60000000,
        transactionValues: [
          {
            natureCode: "01",
            description: "Sale of goods",
            value: 100000000,
            documentationMaintained: true,
            reportedIn3CEB: true,
          },
        ],
        filingCompliance: {
          returnFiled: true,
          returnFilingDate: new Date("2024-10-31"),
          dueDate: new Date("2024-11-30"),
          form3CEBFiled: true,
          form3CEBFilingDate: new Date("2024-11-30"),
        },
        documentationStatus: {
          tpDocumentationMaintained: true,
          isContemporaneous: true,
          documentsFurnishedOnRequest: true,
          informationFurnishedToTPO: true,
        },
      };

      const result = engine.calculateTotalPenaltyExposure(input);

      expect(result).toBeDefined();
      expect(result.concealmentPenalty).toBeDefined();
      expect(result.totalMinimumExposure).toBeDefined();
      expect(result.totalMaximumExposure).toBeDefined();
      expect(result.totalMostLikelyExposure).toBeDefined();
    });
  });

  describe("Concealment Penalty Helper Function", () => {
    test("should calculate concealment penalty range", () => {
      const result = calculateConcealmentPenaltyRange(3000000);

      expect(result).toBeDefined();
      expect(result.minimum).toBe(3000000); // 100%
      expect(result.maximum).toBe(9000000); // 300%
    });

    test("should handle zero tax evaded", () => {
      const result = calculateConcealmentPenaltyRange(0);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(0);
    });
  });

  describe("Documentation Penalty (271AA)", () => {
    test("should calculate 271AA penalty", () => {
      const penalty = calculate271AAPenalty(50000000);

      expect(penalty).toBe(1000000); // 2% of 50M
    });

    test("should handle zero transaction value", () => {
      const penalty = calculate271AAPenalty(0);

      expect(penalty).toBe(0);
    });
  });

  describe("Report Failure Penalty (271BA)", () => {
    test("should calculate 271BA penalty for single form", () => {
      const penalty = calculate271BAPenalty(1);

      expect(penalty).toBe(100000); // Rs. 1 Lakh per form
    });

    test("should calculate 271BA penalty for multiple forms", () => {
      const penalty = calculate271BAPenalty(3);

      expect(penalty).toBe(300000); // Rs. 3 Lakhs for 3 forms
    });
  });

  describe("Constants", () => {
    test("should have concealment penalty rates defined", () => {
      expect(CONCEALMENT_PENALTY_RATES).toBeDefined();
      expect(CONCEALMENT_PENALTY_RATES.minimumRate).toBe(100);
      expect(CONCEALMENT_PENALTY_RATES.maximumRate).toBe(300);
    });

    test("should have documentation penalty defined", () => {
      expect(DOCUMENTATION_PENALTY_271AA).toBeDefined();
      expect(DOCUMENTATION_PENALTY_271AA.rate).toBe(2); // 2%
    });

    test("should have report failure penalty defined", () => {
      expect(REPORT_FAILURE_PENALTY_271BA).toBeDefined();
      expect(REPORT_FAILURE_PENALTY_271BA.penaltyPerForm).toBe(100000);
    });

    test("should have interest 234A defined", () => {
      expect(INTEREST_234A).toBeDefined();
      expect(INTEREST_234A.ratePerMonth).toBe(1); // 1%
    });

    test("should have interest 234B defined", () => {
      expect(INTEREST_234B).toBeDefined();
      expect(INTEREST_234B.ratePerMonth).toBe(1); // 1%
    });
  });

  describe("Validation", () => {
    test("should validate penalty input through calculation", () => {
      const input: PenaltyInput = {
        assessmentYear: "2024-25",
        entityType: EntityType.DOMESTIC_COMPANY,
        primaryAdjustment: 10000000,
        returnedIncome: 50000000,
        assessedIncome: 60000000,
        transactionValues: [],
        filingCompliance: {
          returnFiled: true,
          dueDate: new Date("2024-11-30"),
          form3CEBFiled: true,
        },
        documentationStatus: {
          tpDocumentationMaintained: true,
          isContemporaneous: true,
          documentsFurnishedOnRequest: true,
          informationFurnishedToTPO: true,
        },
      };

      const result = engine.calculateTotalPenaltyExposure(input);

      expect(result).toBeDefined();
      expect(result.validationIssues).toBeDefined();
      expect(Array.isArray(result.validationIssues)).toBe(true);
    });
  });

  describe("Mitigation Analysis", () => {
    test("should assess mitigation factors", () => {
      const input: PenaltyInput = {
        assessmentYear: "2024-25",
        entityType: EntityType.DOMESTIC_COMPANY,
        primaryAdjustment: 10000000,
        returnedIncome: 50000000,
        assessedIncome: 60000000,
        transactionValues: [
          {
            natureCode: "01",
            description: "Sale of goods",
            value: 100000000,
            documentationMaintained: true,
            reportedIn3CEB: true,
          },
        ],
        filingCompliance: {
          returnFiled: true,
          dueDate: new Date("2024-11-30"),
          form3CEBFiled: true,
        },
        documentationStatus: {
          tpDocumentationMaintained: true,
          isContemporaneous: true,
          documentsFurnishedOnRequest: true,
          informationFurnishedToTPO: true,
        },
        mitigationFactors: ["full_disclosure", "bona_fide_belief"],
      };

      const exposure = engine.calculateTotalPenaltyExposure(input);
      const mitigationAnalysis = engine.assessPenaltyMitigation(exposure);

      expect(mitigationAnalysis).toBeDefined();
      expect(mitigationAnalysis.penaltyLikelihood).toBeDefined();
    });
  });

  describe("Entity Types", () => {
    test("should have all entity types defined", () => {
      expect(EntityType.DOMESTIC_COMPANY).toBeDefined();
      expect(EntityType.FOREIGN_COMPANY).toBeDefined();
      expect(EntityType.LLP_FIRM).toBeDefined();
    });
  });
});
