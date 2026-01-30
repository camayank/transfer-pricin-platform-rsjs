/**
 * CbCR Engine - Unit Tests
 * Tests Country-by-Country Report generation
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  CbCREngine,
  createCbCREngine,
  CbCRInput,
  CbCRApplicabilityInput,
  EntityData,
} from "../cbcr-engine";

describe("CbCR Engine", () => {
  let engine: CbCREngine;

  beforeEach(() => {
    engine = createCbCREngine("INR");
  });

  describe("Engine Instantiation", () => {
    test("should create engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(CbCREngine);
    });

    test("should create engine with custom currency", () => {
      const eurEngine = createCbCREngine("EUR");
      expect(eurEngine).toBeDefined();
    });
  });

  describe("Applicability Check", () => {
    test("should check applicability for large group", () => {
      const input: CbCRApplicabilityInput = {
        consolidatedGroupRevenue: 70000000000, // Rs. 7000 Cr
        revenueCurrency: "INR",
        ultimateParentJurisdiction: "IN",
        reportingFiscalYearEnd: new Date("2024-03-31"),
        indianEntityExists: true,
      };

      const result = engine.checkCbCRApplicability(input);

      expect(result).toBeDefined();
      expect(result.isApplicable).toBe(true);
    });

    test("should check applicability for small group", () => {
      const input: CbCRApplicabilityInput = {
        consolidatedGroupRevenue: 50000000000, // Rs. 5000 Cr - below threshold
        revenueCurrency: "INR",
        ultimateParentJurisdiction: "IN",
        reportingFiscalYearEnd: new Date("2024-03-31"),
        indianEntityExists: true,
      };

      const result = engine.checkCbCRApplicability(input);

      expect(result).toBeDefined();
      expect(result.isApplicable).toBe(false);
    });

    test("should check EUR threshold", () => {
      const eurEngine = createCbCREngine("EUR");
      const input: CbCRApplicabilityInput = {
        consolidatedGroupRevenue: 800000000, // EUR 800M
        revenueCurrency: "EUR",
        ultimateParentJurisdiction: "DE",
        reportingFiscalYearEnd: new Date("2024-03-31"),
        indianEntityExists: true,
      };

      const result = eurEngine.checkCbCRApplicability(input);

      expect(result.isApplicable).toBe(true);
    });
  });

  describe("CbCR Generation", () => {
    test("should generate CbCR report", () => {
      const input: CbCRInput = {
        reportingEntity: {
          name: "Test India Pvt Ltd",
          pan: "AABCT1234A",
          address: "Mumbai, India",
          role: "REPORTING_ENTITY" as any,
          contactPerson: "John Doe",
          email: "john@test.com",
          phone: "+91-9999999999",
        },
        ultimateParent: {
          name: "Test Global Corp",
          jurisdiction: "US",
          tin: "12-3456789",
        },
        reportingFiscalYear: {
          startDate: new Date("2023-04-01"),
          endDate: new Date("2024-03-31"),
        },
        reportingCurrency: "INR",
        exchangeRates: { INR: 1, USD: 83, EUR: 90 },
        constituentEntities: [
          {
            entityId: "E001",
            entityName: "Test Global Corp",
            jurisdictionOfTaxResidence: "US",
            jurisdictionOfIncorporation: "US",
            taxIdentificationNumber: "12-3456789",
            businessActivities: ["HOLDING" as any],
            isUltimateParent: true,
            isSurrogateParent: false,
            isReportingEntity: false,
            financials: {
              fiscalYearEnd: new Date("2024-03-31"),
              revenueFromUnrelated: 500000000,
              revenueFromRelated: 100000000,
              profitLossBeforeTax: 100000000,
              incomeTaxPaid: 21000000,
              incomeTaxAccrued: 22000000,
              statedCapital: 200000000,
              accumulatedEarnings: 300000000,
              tangibleAssetsOtherThanCash: 150000000,
              currency: "USD",
            },
            operationalData: {
              numberOfEmployees: 500,
              mainBusinessDescription: "Holding company",
            },
          },
          {
            entityId: "E002",
            entityName: "Test India Pvt Ltd",
            jurisdictionOfTaxResidence: "IN",
            jurisdictionOfIncorporation: "IN",
            taxIdentificationNumber: "AABCT1234A",
            businessActivities: ["R_AND_D" as any, "MANUFACTURING" as any],
            isUltimateParent: false,
            isSurrogateParent: false,
            isReportingEntity: true,
            financials: {
              fiscalYearEnd: new Date("2024-03-31"),
              revenueFromUnrelated: 200000000,
              revenueFromRelated: 50000000,
              profitLossBeforeTax: 30000000,
              incomeTaxPaid: 7500000,
              incomeTaxAccrued: 8000000,
              statedCapital: 50000000,
              accumulatedEarnings: 80000000,
              tangibleAssetsOtherThanCash: 100000000,
              currency: "INR",
            },
            operationalData: {
              numberOfEmployees: 1000,
              mainBusinessDescription: "R&D and manufacturing",
            },
          },
        ],
      };

      const result = engine.generateCbCR(input);

      expect(result).toBeDefined();
      expect(result.form3CEAD).toBeDefined();
      expect(result.validationResult).toBeDefined();
    });
  });

  describe("XML Generation", () => {
    test("should generate XML output", () => {
      const input: CbCRInput = {
        reportingEntity: {
          name: "Test India Pvt Ltd",
          pan: "AABCT1234A",
          address: "Mumbai, India",
          role: "REPORTING_ENTITY" as any,
          contactPerson: "John Doe",
          email: "john@test.com",
          phone: "+91-9999999999",
        },
        ultimateParent: {
          name: "Test Global Corp",
          jurisdiction: "US",
          tin: "12-3456789",
        },
        reportingFiscalYear: {
          startDate: new Date("2023-04-01"),
          endDate: new Date("2024-03-31"),
        },
        reportingCurrency: "INR",
        exchangeRates: { INR: 1, USD: 83 },
        constituentEntities: [
          {
            entityId: "E001",
            entityName: "Test Global Corp",
            jurisdictionOfTaxResidence: "US",
            jurisdictionOfIncorporation: "US",
            taxIdentificationNumber: "12-3456789",
            businessActivities: ["HOLDING" as any],
            isUltimateParent: true,
            isSurrogateParent: false,
            isReportingEntity: false,
            financials: {
              fiscalYearEnd: new Date("2024-03-31"),
              revenueFromUnrelated: 500000000,
              revenueFromRelated: 100000000,
              profitLossBeforeTax: 100000000,
              incomeTaxPaid: 21000000,
              incomeTaxAccrued: 22000000,
              statedCapital: 200000000,
              accumulatedEarnings: 300000000,
              tangibleAssetsOtherThanCash: 150000000,
              currency: "USD",
            },
            operationalData: {
              numberOfEmployees: 500,
              mainBusinessDescription: "Holding company",
            },
          },
        ],
      };

      const result = engine.generateCbCR(input);

      expect(result).toBeDefined();
      expect(result.xmlOutput).toBeDefined();
      expect(typeof result.xmlOutput).toBe("string");
      expect(result.xmlOutput).toContain("<?xml");
    });
  });

  describe("Filing Requirements", () => {
    test("should determine filing requirements through applicability check", () => {
      const input: CbCRApplicabilityInput = {
        consolidatedGroupRevenue: 70000000000,
        revenueCurrency: "INR",
        ultimateParentJurisdiction: "US",
        reportingFiscalYearEnd: new Date("2024-03-31"),
        indianEntityExists: true,
      };

      const result = engine.checkCbCRApplicability(input);

      expect(result).toBeDefined();
      expect(result.filingRequirements).toBeDefined();
      expect(result.deadlines).toBeDefined();
    });
  });
});
