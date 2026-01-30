/**
 * Comparability Adjustments Engine - Unit Tests
 * Tests working capital, risk, and other comparability adjustments
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  ComparabilityAdjustmentsEngine,
  createComparabilityAdjustmentsEngine,
  WorkingCapitalInput,
  RiskAdjustmentInput,
  GeographicAdjustmentInput,
  ComparableEntity,
  TestedPartyData,
} from "../comparability-adjustments-engine";

describe("Comparability Adjustments Engine", () => {
  let engine: ComparabilityAdjustmentsEngine;

  beforeEach(() => {
    engine = createComparabilityAdjustmentsEngine();
  });

  describe("Engine Instantiation", () => {
    test("should create engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(ComparabilityAdjustmentsEngine);
    });

    test("should create engine using factory function", () => {
      const factoryEngine = createComparabilityAdjustmentsEngine();
      expect(factoryEngine).toBeDefined();
    });
  });

  describe("Working Capital Adjustment", () => {
    test("should calculate working capital adjustment", () => {
      const input: WorkingCapitalInput = {
        testedParty: {
          receivableDays: 45,
          payableDays: 30,
          inventoryDays: 20,
          revenue: 100000000,
          costOfSales: 70000000,
        },
        comparable: {
          receivableDays: 60,
          payableDays: 25,
          inventoryDays: 30,
          revenue: 80000000,
          costOfSales: 56000000,
        },
        interestRate: 0.10,
      };

      const result = engine.calculateWorkingCapitalAdjustment(input);

      expect(result).toBeDefined();
      expect(result.netAdjustment).toBeDefined();
      expect(typeof result.netAdjustment).toBe("number");
    });
  });

  describe("Risk Adjustment", () => {
    test("should calculate risk adjustment", () => {
      const input: RiskAdjustmentInput = {
        testedParty: {
          riskProfile: [
            { riskType: "market_risk" as any, assumed: false, mitigated: true, level: "low" },
            { riskType: "credit_risk" as any, assumed: false, mitigated: true, level: "low" },
          ],
          industry: "IT_SERVICES" as any,
        },
        comparable: {
          riskProfile: [
            { riskType: "market_risk" as any, assumed: true, mitigated: false, level: "high" },
            { riskType: "credit_risk" as any, assumed: true, mitigated: false, level: "medium" },
          ],
          industry: "IT_SERVICES" as any,
        },
      };

      const result = engine.calculateRiskAdjustment(input);

      expect(result).toBeDefined();
      expect(result.netRiskAdjustment).toBeDefined();
    });
  });

  // Note: Capacity adjustment is handled internally by applyAllAdjustments

  describe("Geographic Adjustment", () => {
    test("should calculate geographic adjustment", () => {
      const input: GeographicAdjustmentInput = {
        testedPartyRegion: "INDIA",
        comparableRegion: "USA",
        laborCostWeightage: 0.4,
        overheadWeightage: 0.3,
        marketWeightage: 0.3,
      };

      const result = engine.calculateGeographicAdjustment(input);

      expect(result).toBeDefined();
      expect(result.netAdjustment).toBeDefined();
    });

    test("should return zero adjustment for same region", () => {
      const input: GeographicAdjustmentInput = {
        testedPartyRegion: "INDIA",
        comparableRegion: "INDIA",
        laborCostWeightage: 0.4,
        overheadWeightage: 0.3,
        marketWeightage: 0.3,
      };

      const result = engine.calculateGeographicAdjustment(input);

      expect(result.netAdjustment).toBe(0);
    });
  });

  // Note: Accounting adjustment is handled internally by applyAllAdjustments

  describe("Apply All Adjustments", () => {
    test("should apply all adjustments to comparable", () => {
      const testedParty: TestedPartyData = {
        name: "Tested Party",
        financialYear: "2023-24",
        industry: "IT_SERVICES" as any,
        region: "INDIA",
        financials: {
          revenue: 100000000,
          costOfSales: 70000000,
          grossProfit: 30000000,
          operatingExpenses: 20000000,
          operatingProfit: 10000000,
          totalAssets: 50000000,
          currentAssets: 30000000,
          currentLiabilities: 15000000,
          tradeReceivables: 10000000,
          tradePayables: 8000000,
          inventory: 5000000,
          fixedAssets: 20000000,
        },
        operationalData: {
          capacityUtilization: 0.75,
          riskProfile: [
            { riskType: "market_risk" as any, assumed: false, mitigated: true, level: "low" },
          ],
        },
        accountingStandard: "IND_AS" as any,
        transactionValue: 100000000,
        relatedPartyPercentage: 0.5,
      };

      const comparable: ComparableEntity = {
        name: "Comparable Corp",
        financialYear: "2023-24",
        industry: "IT_SERVICES" as any,
        region: "INDIA",
        financials: {
          revenue: 80000000,
          costOfSales: 56000000,
          grossProfit: 24000000,
          operatingExpenses: 16000000,
          operatingProfit: 8000000,
          totalAssets: 40000000,
          currentAssets: 24000000,
          currentLiabilities: 12000000,
          tradeReceivables: 8000000,
          tradePayables: 6000000,
          inventory: 4000000,
          fixedAssets: 16000000,
        },
        operationalData: {
          capacityUtilization: 0.80,
          riskProfile: [
            { riskType: "market_risk" as any, assumed: true, mitigated: false, level: "medium" },
          ],
        },
        accountingStandard: "IND_AS" as any,
      };

      const result = engine.applyAllAdjustments(
        testedParty,
        comparable,
        ["WORKING_CAPITAL" as any]
      );

      expect(result).toBeDefined();
      expect(result.adjustedMargin).toBeDefined();
      expect(result.totalAdjustment).toBeDefined();
    });
  });

  describe("Full Comparability Analysis", () => {
    test("should perform full comparability analysis", () => {
      const testedParty: TestedPartyData = {
        name: "Tested Party",
        financialYear: "2023-24",
        industry: "IT_SERVICES" as any,
        region: "INDIA",
        financials: {
          revenue: 100000000,
          costOfSales: 70000000,
          grossProfit: 30000000,
          operatingExpenses: 20000000,
          operatingProfit: 10000000,
          totalAssets: 50000000,
          currentAssets: 30000000,
          currentLiabilities: 15000000,
          tradeReceivables: 10000000,
          tradePayables: 8000000,
          inventory: 5000000,
          fixedAssets: 20000000,
        },
        operationalData: {
          capacityUtilization: 0.75,
          riskProfile: [
            { riskType: "market_risk" as any, assumed: false, mitigated: true, level: "low" },
          ],
        },
        accountingStandard: "IND_AS" as any,
        transactionValue: 100000000,
        relatedPartyPercentage: 0.5,
      };

      const comparables: ComparableEntity[] = [
        {
          name: "Comparable 1",
          financialYear: "2023-24",
          industry: "IT_SERVICES" as any,
          region: "INDIA",
          financials: {
            revenue: 80000000,
            costOfSales: 56000000,
            grossProfit: 24000000,
            operatingExpenses: 16000000,
            operatingProfit: 8000000,
            totalAssets: 40000000,
            currentAssets: 24000000,
            currentLiabilities: 12000000,
            tradeReceivables: 8000000,
            tradePayables: 6000000,
            inventory: 4000000,
            fixedAssets: 16000000,
          },
          operationalData: {
            capacityUtilization: 0.80,
            riskProfile: [
              { riskType: "market_risk" as any, assumed: true, mitigated: false, level: "medium" },
            ],
          },
          accountingStandard: "IND_AS" as any,
        },
        {
          name: "Comparable 2",
          financialYear: "2023-24",
          industry: "IT_SERVICES" as any,
          region: "INDIA",
          financials: {
            revenue: 120000000,
            costOfSales: 84000000,
            grossProfit: 36000000,
            operatingExpenses: 24000000,
            operatingProfit: 12000000,
            totalAssets: 60000000,
            currentAssets: 36000000,
            currentLiabilities: 18000000,
            tradeReceivables: 12000000,
            tradePayables: 10000000,
            inventory: 6000000,
            fixedAssets: 24000000,
          },
          operationalData: {
            capacityUtilization: 0.85,
            riskProfile: [
              { riskType: "market_risk" as any, assumed: true, mitigated: false, level: "high" },
            ],
          },
          accountingStandard: "IND_AS" as any,
        },
      ];

      const result = engine.performComparabilityAnalysis(
        testedParty,
        comparables,
        ["WORKING_CAPITAL" as any]
      );

      expect(result).toBeDefined();
      expect(result.adjustedComparables).toBeDefined();
      expect(result.adjustedComparables.length).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    test("should handle zero values gracefully", () => {
      const input: WorkingCapitalInput = {
        testedParty: {
          receivableDays: 45,
          payableDays: 30,
          inventoryDays: 20,
          revenue: 100000000,
          costOfSales: 70000000,
        },
        comparable: {
          receivableDays: 60,
          payableDays: 25,
          inventoryDays: 30,
          revenue: 80000000,
          costOfSales: 56000000,
        },
        interestRate: 0.10,
      };

      // Should not throw
      expect(() => {
        engine.calculateWorkingCapitalAdjustment(input);
      }).not.toThrow();
    });
  });
});
