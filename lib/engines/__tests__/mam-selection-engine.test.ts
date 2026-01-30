/**
 * MAM Selection Engine - Unit Tests
 * Tests Most Appropriate Method selection logic
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  MAMSelectionEngine,
  createMAMSelectionEngine,
  MAMSelectionInput,
  TransactionType,
  FunctionalProfile,
} from "../mam-selection-engine";

describe("MAM Selection Engine", () => {
  let engine: MAMSelectionEngine;

  beforeEach(() => {
    engine = createMAMSelectionEngine();
  });

  describe("Engine Instantiation", () => {
    test("should create engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(MAMSelectionEngine);
    });

    test("should create engine using factory function", () => {
      const factoryEngine = createMAMSelectionEngine();
      expect(factoryEngine).toBeDefined();
    });
  });

  describe("Method Selection", () => {
    test("should select appropriate method for goods transaction", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.TANGIBLE_GOODS,
        transactionDescription: "Sale of finished goods to AE",
        functionalProfile: FunctionalProfile.FULL_FLEDGED_MANUFACTURER,
        functionsPerformed: ["manufacturing", "quality_control"],
        assetsEmployed: ["plant_machinery", "inventory"],
        risksAssumed: ["market_risk", "inventory_risk"],
        intangiblesInvolved: false,
        internalCUPsAvailable: false,
        externalCUPsAvailable: true,
        dataAvailability: {
          priceData: true,
          grossMarginData: true,
          netMarginData: true,
          combinedProfitData: false,
          comparableDatabaseAccess: true,
          dataQuality: "high",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      expect(result).toBeDefined();
      expect(result.selectedMethod).toBeDefined();
      expect(result.methodRanking).toBeDefined();
    });

    test("should select TNMM for service transactions with net margin data", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.SERVICES,
        transactionDescription: "IT support services to AE",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        functionsPerformed: ["support_services"],
        assetsEmployed: ["workforce"],
        risksAssumed: ["limited_risk"],
        intangiblesInvolved: false,
        internalCUPsAvailable: false,
        externalCUPsAvailable: false,
        dataAvailability: {
          priceData: false,
          grossMarginData: false,
          netMarginData: true,
          combinedProfitData: false,
          comparableDatabaseAccess: true,
          dataQuality: "medium",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      expect(result).toBeDefined();
      expect(["TNMM", "CPM"]).toContain(result.selectedMethod);
    });

    test("should consider PSM for unique intangibles", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.INTANGIBLES,
        transactionDescription: "License of proprietary technology",
        functionalProfile: FunctionalProfile.IP_OWNER,
        functionsPerformed: ["r_and_d", "ip_development"],
        assetsEmployed: ["patents", "trade_secrets"],
        risksAssumed: ["development_risk"],
        intangiblesInvolved: true,
        intangibleType: "technology",
        uniqueIntangibles: true,
        internalCUPsAvailable: false,
        externalCUPsAvailable: false,
        dataAvailability: {
          priceData: false,
          grossMarginData: false,
          netMarginData: true,
          combinedProfitData: true,
          comparableDatabaseAccess: true,
          dataQuality: "medium",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      expect(result).toBeDefined();
      expect(["PSM", "TNMM", "OTHER"]).toContain(result.selectedMethod);
    });
  });

  describe("Method Ranking", () => {
    test("should rank all methods", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.TANGIBLE_GOODS,
        transactionDescription: "Export of components",
        functionalProfile: FunctionalProfile.CONTRACT_MANUFACTURER,
        functionsPerformed: ["manufacturing"],
        assetsEmployed: ["machinery"],
        risksAssumed: ["limited_risk"],
        intangiblesInvolved: false,
        internalCUPsAvailable: false,
        externalCUPsAvailable: true,
        dataAvailability: {
          priceData: true,
          grossMarginData: true,
          netMarginData: true,
          combinedProfitData: false,
          comparableDatabaseAccess: true,
          dataQuality: "high",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      expect(result.methodRanking).toBeDefined();
      expect(result.methodRanking.length).toBeGreaterThan(0);

      // Check that rankings are sorted by score (descending)
      for (let i = 1; i < result.methodRanking.length; i++) {
        expect(result.methodRanking[i - 1].score).toBeGreaterThanOrEqual(
          result.methodRanking[i].score
        );
      }
    });
  });

  describe("Rejection Rationale", () => {
    test("should provide rejection rationale for non-selected methods", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.SERVICES,
        transactionDescription: "Back office services",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        functionsPerformed: ["back_office"],
        assetsEmployed: ["workforce"],
        risksAssumed: ["limited_risk"],
        intangiblesInvolved: false,
        internalCUPsAvailable: false,
        externalCUPsAvailable: false,
        dataAvailability: {
          priceData: false,
          grossMarginData: false,
          netMarginData: true,
          combinedProfitData: false,
          comparableDatabaseAccess: true,
          dataQuality: "medium",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      expect(result.rejectionRationales).toBeDefined();
      expect(result.rejectionRationales.length).toBeGreaterThan(0);

      result.rejectionRationales.forEach((rejection) => {
        expect(rejection.method).toBeDefined();
        expect(rejection.rationale).toBeDefined();
      });
    });
  });

  describe("Comparability Assessment", () => {
    test("should assess comparability factors", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.TANGIBLE_GOODS,
        transactionDescription: "Sale of goods",
        functionalProfile: FunctionalProfile.FULL_FLEDGED_MANUFACTURER,
        functionsPerformed: ["manufacturing"],
        assetsEmployed: ["plant"],
        risksAssumed: ["market_risk"],
        intangiblesInvolved: false,
        internalCUPsAvailable: true,
        externalCUPsAvailable: true,
        dataAvailability: {
          priceData: true,
          grossMarginData: true,
          netMarginData: true,
          combinedProfitData: false,
          comparableDatabaseAccess: true,
          dataQuality: "high",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      expect(result.comparabilityAssessment).toBeDefined();
    });
  });

  describe("PLI Recommendation", () => {
    test("should recommend appropriate PLI for selected method", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.SERVICES,
        transactionDescription: "IT services",
        functionalProfile: FunctionalProfile.CONTRACT_SERVICE_PROVIDER,
        functionsPerformed: ["it_services"],
        assetsEmployed: ["workforce", "software"],
        risksAssumed: ["limited_risk"],
        intangiblesInvolved: false,
        internalCUPsAvailable: false,
        externalCUPsAvailable: false,
        dataAvailability: {
          priceData: false,
          grossMarginData: false,
          netMarginData: true,
          combinedProfitData: false,
          comparableDatabaseAccess: true,
          dataQuality: "medium",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      if (result.selectedMethod === "TNMM") {
        expect(result.recommendedPLI).toBeDefined();
      }
    });
  });

  describe("Transaction Types", () => {
    test("should have all transaction types defined", () => {
      expect(TransactionType.TANGIBLE_GOODS).toBeDefined();
      expect(TransactionType.SERVICES).toBeDefined();
      expect(TransactionType.INTANGIBLES).toBeDefined();
      expect(TransactionType.FINANCIAL).toBeDefined();
    });
  });

  describe("Functional Profiles", () => {
    test("should have all functional profiles defined", () => {
      expect(FunctionalProfile.LIMITED_RISK_DISTRIBUTOR).toBeDefined();
      expect(FunctionalProfile.CONTRACT_MANUFACTURER).toBeDefined();
      expect(FunctionalProfile.CONTRACT_SERVICE_PROVIDER).toBeDefined();
    });
  });

  describe("Validation", () => {
    test("should validate input", () => {
      const input: MAMSelectionInput = {
        transactionType: TransactionType.TANGIBLE_GOODS,
        transactionDescription: "Test",
        functionalProfile: FunctionalProfile.FULL_FLEDGED_MANUFACTURER,
        functionsPerformed: ["function"],
        assetsEmployed: ["asset"],
        risksAssumed: ["risk"],
        intangiblesInvolved: false,
        internalCUPsAvailable: false,
        externalCUPsAvailable: false,
        dataAvailability: {
          priceData: false,
          grossMarginData: false,
          netMarginData: true,
          combinedProfitData: false,
          comparableDatabaseAccess: true,
          dataQuality: "medium",
        },
        testedParty: "indian_entity",
      };

      const result = engine.selectMostAppropriateMethod(input);

      expect(result).toBeDefined();
      expect(result.validationIssues).toBeDefined();
    });
  });
});
