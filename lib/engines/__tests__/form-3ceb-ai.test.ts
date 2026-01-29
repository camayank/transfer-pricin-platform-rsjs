/**
 * Form 3CEB AI - Unit Tests
 * Tests AI-enhanced Form 3CEB generation and validation functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  Form3CEBAIService,
  createForm3CEBAIService,
  TransactionDescriptionResult,
  MethodJustificationResult,
  EnhancedValidationResult,
  ComparableSearchNarrativeResult,
  EnhancedTransactionData,
} from '../form-3ceb-ai';
import {
  TransactionNature,
  TPMethod,
  RelationshipType,
} from '../form-3ceb-engine';

describe('Form 3CEB AI Service', () => {
  let service: Form3CEBAIService;

  beforeEach(() => {
    service = createForm3CEBAIService('2024-25');
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(Form3CEBAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createForm3CEBAIService('2024-25');
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(Form3CEBAIService);
    });

    test('should create service with different assessment year', () => {
      const service2025 = createForm3CEBAIService('2025-26');
      expect(service2025).toBeDefined();
      expect(service2025).toBeInstanceOf(Form3CEBAIService);
    });

    test('should provide access to builder', () => {
      const builder = service.getBuilder();
      expect(builder).toBeDefined();
    });

    test('should provide access to validator', () => {
      const validator = service.getValidator();
      expect(validator).toBeDefined();
    });
  });

  describe('Transaction Description Generation', () => {
    test('should generate transaction description', async () => {
      const result = await service.generateTransactionDescription({
        serialNumber: 1,
        natureCode: TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        indianEntity: 'India Sub Pvt Ltd',
        aeName: 'US Parent Corp',
        aeCountry: 'USA',
        relationship: RelationshipType.HOLDING_COMPANY,
        transactionValue: 500000000,
        methodApplied: TPMethod.TNMM,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.narrative).toBeDefined();
      expect(result.aiGenerated).toBeDefined();
    });

    test('should include narrative details', async () => {
      const result = await service.generateTransactionDescription({
        serialNumber: 1,
        natureCode: TransactionNature.PAYMENT_ROYALTY,
        indianEntity: 'India Sub Pvt Ltd',
        aeName: 'IP Holding Ltd',
        aeCountry: 'Ireland',
        relationship: RelationshipType.FELLOW_SUBSIDIARY,
        transactionValue: 100000000,
        methodApplied: TPMethod.CUP,
      });

      expect(result.narrative.shortDescription).toBeDefined();
      expect(result.narrative.detailedDescription).toBeDefined();
    });

    test('should include commercial rationale', async () => {
      const result = await service.generateTransactionDescription({
        serialNumber: 2,
        natureCode: TransactionNature.PAYMENT_MANAGEMENT_SERVICES,
        indianEntity: 'India Operations Pvt Ltd',
        aeName: 'Global HQ Inc',
        aeCountry: 'USA',
        relationship: RelationshipType.HOLDING_COMPANY,
        transactionValue: 50000000,
        methodApplied: TPMethod.TNMM,
      });

      expect(result.narrative.commercialRationale).toBeDefined();
    });

    test('should include arm\'s length justification', async () => {
      const result = await service.generateTransactionDescription({
        serialNumber: 1,
        natureCode: TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        indianEntity: 'India Tech Pvt Ltd',
        aeName: 'Tech Parent Corp',
        aeCountry: 'USA',
        relationship: RelationshipType.SUBSIDIARY,
        transactionValue: 1000000000,
        methodApplied: TPMethod.TNMM,
      });

      expect(result.narrative.armLengthJustification).toBeDefined();
    });

    test('should handle additional context', async () => {
      const result = await service.generateTransactionDescription({
        serialNumber: 1,
        natureCode: TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        indianEntity: 'India Sub Pvt Ltd',
        aeName: 'US Parent Corp',
        aeCountry: 'USA',
        relationship: RelationshipType.HOLDING_COMPANY,
        transactionValue: 500000000,
        methodApplied: TPMethod.TNMM,
        additionalContext: 'Captive development center providing services',
        pricingMechanism: 'Cost plus markup',
        agreementDate: '2020-04-01',
      });

      expect(result.success).toBe(true);
      expect(result.narrative).toBeDefined();
    });
  });

  describe('Method Justification Generation', () => {
    test('should generate method justification for TNMM', async () => {
      const result = await service.generateMethodJustification({
        transactionType: 'IT Services',
        natureCode: TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        transactionDescription: 'Software development services',
        transactionValue: 500000000,
        testedParty: 'India Sub Pvt Ltd',
        characterization: 'Contract service provider',
        functions: 'Software development, testing, support',
        assets: 'IT infrastructure, development tools',
        risks: 'Limited risks - routine operations',
        selectedMethod: TPMethod.TNMM,
        selectedPLI: 'OP/OC',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.justification).toBeDefined();
      expect(result.narrativeText).toBeDefined();
    });

    test('should generate method justification for CUP', async () => {
      const result = await service.generateMethodJustification({
        transactionType: 'Royalty Payment',
        natureCode: TransactionNature.PAYMENT_ROYALTY,
        transactionDescription: 'Trademark royalty payment',
        transactionValue: 50000000,
        testedParty: 'India Sub Pvt Ltd',
        characterization: 'Royalty payer',
        functions: 'Manufacturing with licensed trademark',
        assets: 'Manufacturing facilities',
        risks: 'Market and inventory risks',
        selectedMethod: TPMethod.CUP,
        internalCUPAvailable: true,
      });

      expect(result.success).toBe(true);
      expect(result.justification).toBeDefined();
    });

    test('should include method selection rationale', async () => {
      const result = await service.generateMethodJustification({
        transactionType: 'Contract R&D',
        natureCode: TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        transactionDescription: 'R&D services',
        transactionValue: 200000000,
        testedParty: 'India R&D Pvt Ltd',
        characterization: 'Contract R&D provider',
        functions: 'Research and development',
        assets: 'R&D equipment, personnel',
        risks: 'Limited - contract research',
        selectedMethod: TPMethod.TNMM,
      });

      expect(result.justification.selectionRationale).toBeDefined();
      expect(Array.isArray(result.justification.selectionRationale)).toBe(true);
    });

    test('should include selected method details', async () => {
      const result = await service.generateMethodJustification({
        transactionType: 'Services',
        natureCode: TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        transactionDescription: 'IT services',
        transactionValue: 100000000,
        testedParty: 'India Services Pvt Ltd',
        characterization: 'Service provider',
        functions: 'IT support services',
        assets: 'IT infrastructure',
        risks: 'Limited operational risks',
        selectedMethod: TPMethod.TNMM,
      });

      expect(result.justification.selectedMethod).toBeDefined();
    });
  });

  describe('Comparable Search Narrative', () => {
    test('should generate comparable search narrative', async () => {
      const result = await service.generateComparableSearchNarrative({
        transactionType: 'IT Services',
        testedParty: 'India Sub Pvt Ltd',
        industry: 'Information Technology',
        nicCode: '62011',
        searchDatabase: 'Capitaline Plus',
        searchDate: '2024-06-15',
        quantitativeScreens: [
          'Revenue > Rs. 10 Cr',
          'RPT < 25%',
          '3 years data available',
        ],
        qualitativeScreens: [
          'Similar functional profile',
          'No extraordinary events',
          'Independent operations',
        ],
        companiesFound: 50,
        companiesRejected: 42,
        finalComparables: 8,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.narrative).toBeDefined();
      expect(typeof result.narrative).toBe('string');
    });

    test('should include search summary', async () => {
      const result = await service.generateComparableSearchNarrative({
        transactionType: 'Manufacturing',
        testedParty: 'India Mfg Pvt Ltd',
        industry: 'Manufacturing',
        nicCode: '26',
        searchDatabase: 'CMIE Prowess',
        searchDate: '2024-07-01',
        quantitativeScreens: ['Revenue range'],
        qualitativeScreens: ['Similar functions'],
        companiesFound: 30,
        companiesRejected: 25,
        finalComparables: 5,
      });

      expect(result.searchSummary).toBeDefined();
      expect(result.searchSummary.database).toBe('CMIE Prowess');
      expect(result.searchSummary.initialCount).toBe(30);
      expect(result.searchSummary.rejectedCount).toBe(25);
      expect(result.searchSummary.finalCount).toBe(5);
    });
  });

  describe('Build Transaction With AI', () => {
    test('should build transaction with AI enhancement', async () => {
      const result = await service.buildTransactionWithAI(
        'AE-001',
        'US Parent Corp',
        'USA',
        TransactionNature.SERVICES,
        500000000,
        500000000,
        TPMethod.TNMM,
        8,
        'India Sub Pvt Ltd',
        {
          characterization: 'Contract service provider',
          functions: 'Software development services',
          assets: 'IT infrastructure',
          risks: 'Limited operational risks',
        }
      );

      expect(result).toBeDefined();
      expect(result.aeReference).toBe('AE-001');
      expect(result.aeName).toBe('US Parent Corp');
      expect(result.description).toBeDefined();
      expect(result.methodJustification).toBeDefined();
    });

    test('should include AI generation flags', async () => {
      const result = await service.buildTransactionWithAI(
        'AE-002',
        'UK Subsidiary',
        'United Kingdom',
        TransactionNature.PAYMENT_ROYALTY,
        100000000,
        100000000,
        TPMethod.CUP,
        3,
        'India Pharma Pvt Ltd',
        {
          characterization: 'Royalty payer',
          functions: 'Manufacturing',
          assets: 'Manufacturing plant',
          risks: 'Market risks',
        }
      );

      expect(result.aiGenerated).toBeDefined();
      expect(result.aiGenerated.description).toBeDefined();
      expect(result.aiGenerated.justification).toBeDefined();
    });
  });

  describe('Enums and Constants', () => {
    test('TransactionNature enum should have expected values', () => {
      expect(TransactionNature.RECEIPT_SOFTWARE_SERVICES).toBeDefined();
      expect(TransactionNature.PAYMENT_ROYALTY).toBeDefined();
      expect(TransactionNature.PAYMENT_MANAGEMENT_SERVICES).toBeDefined();
    });

    test('TPMethod enum should have expected values', () => {
      expect(TPMethod.TNMM).toBeDefined();
      expect(TPMethod.CUP).toBeDefined();
      expect(TPMethod.CPM).toBeDefined();
      expect(TPMethod.RPM).toBeDefined();
      expect(TPMethod.PSM).toBeDefined();
    });

    test('RelationshipType enum should have expected values', () => {
      expect(RelationshipType.HOLDING_COMPANY).toBeDefined();
      expect(RelationshipType.SUBSIDIARY).toBeDefined();
      expect(RelationshipType.FELLOW_SUBSIDIARY).toBeDefined();
      expect(RelationshipType.JOINT_VENTURE).toBeDefined();
    });
  });
});
