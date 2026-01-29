/**
 * Master File AI - Unit Tests
 * Tests AI-enhanced Master File (Form 3CEAA) generation functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  MasterFileAIService,
  createMasterFileAIService,
  OrganizationalStructureResult,
  BusinessDescriptionResult,
  IntangiblesStrategyResult,
  FinancialPolicyResult,
  FARAnalysisResult,
} from '../master-file-ai';
import {
  IntangibleType,
  FinancingArrangementType,
  EntityType,
  BusinessActivity,
} from '../master-file-engine';

describe('Master File AI Service', () => {
  let service: MasterFileAIService;

  beforeEach(() => {
    service = createMasterFileAIService('2024-25');
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(MasterFileAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createMasterFileAIService();
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(MasterFileAIService);
    });

    test('should create service with different assessment year', () => {
      const service2025 = createMasterFileAIService('2025-26');
      expect(service2025).toBeDefined();
      expect(service2025).toBeInstanceOf(MasterFileAIService);
    });
  });

  describe('Organizational Structure Generation', () => {
    test('should generate organizational structure', async () => {
      const result = await service.generateOrganizationalStructure({
        groupName: 'Global Corp',
        ultimateParent: 'Global Corp Inc',
        parentCountry: 'USA',
        reportingEntity: 'India Sub Pvt Ltd',
        entityType: EntityType.CONSTITUENT_ENTITY,
        groupEntities: [
          {
            name: 'Global Corp Inc',
            country: 'USA',
            countryCode: 'US',
            ownershipPercentage: 100,
            legalForm: 'Corporation',
            activities: [BusinessActivity.HOLDING_SHARES, BusinessActivity.ADMINISTRATIVE],
          },
          {
            name: 'India Sub Pvt Ltd',
            country: 'India',
            countryCode: 'IN',
            ownershipPercentage: 100,
            legalForm: 'Private Limited',
            activities: [BusinessActivity.SERVICES, BusinessActivity.RD],
          },
        ],
      });

      expect(result).toBeDefined();
      expect(result.narrative).toBeDefined();
    });

    test('should include key observations', async () => {
      const result = await service.generateOrganizationalStructure({
        groupName: 'Tech Group',
        ultimateParent: 'Tech Corp',
        parentCountry: 'USA',
        reportingEntity: 'Tech India',
        entityType: EntityType.CONSTITUENT_ENTITY,
        groupEntities: [
          {
            name: 'Tech Corp',
            country: 'USA',
            countryCode: 'US',
            ownershipPercentage: 100,
            legalForm: 'Corporation',
            activities: [BusinessActivity.HOLDING_SHARES],
          },
          {
            name: 'Tech India',
            country: 'India',
            countryCode: 'IN',
            ownershipPercentage: 100,
            legalForm: 'Private Limited',
            activities: [BusinessActivity.SERVICES],
          },
        ],
      });

      expect(result.keyObservations).toBeDefined();
      expect(Array.isArray(result.keyObservations)).toBe(true);
    });

    test('should include material changes', async () => {
      const result = await service.generateOrganizationalStructure({
        groupName: 'Multi Corp',
        ultimateParent: 'Multi Corp Inc',
        parentCountry: 'USA',
        reportingEntity: 'Entity B',
        entityType: EntityType.CONSTITUENT_ENTITY,
        groupEntities: [
          {
            name: 'Multi Corp Inc',
            country: 'USA',
            countryCode: 'US',
            ownershipPercentage: 100,
            legalForm: 'Corporation',
            activities: [BusinessActivity.HOLDING_SHARES],
          },
          {
            name: 'Entity B',
            country: 'India',
            countryCode: 'IN',
            ownershipPercentage: 100,
            legalForm: 'Private Limited',
            activities: [BusinessActivity.SERVICES],
          },
          {
            name: 'Entity C',
            country: 'United Kingdom',
            countryCode: 'GB',
            ownershipPercentage: 100,
            legalForm: 'Limited',
            activities: [BusinessActivity.SALES_MARKETING],
          },
        ],
      });

      expect(result.materialChanges).toBeDefined();
      expect(Array.isArray(result.materialChanges)).toBe(true);
    });
  });

  describe('Business Description Generation', () => {
    test('should generate business description', async () => {
      const result = await service.generateBusinessDescription({
        groupName: 'Global Corp',
        industrySector: 'Software Services',
        businessActivities: [BusinessActivity.SERVICES, BusinessActivity.RD],
        entityCharacterization: 'Contract service provider',
        revenue: 1000000000,
        exportRevenue: 800000000,
        employeeCount: 500,
        productsServices: [
          {
            name: 'Enterprise Software',
            description: 'Custom software development',
            revenuePercentage: 60,
            keyMarkets: ['North America', 'Europe'],
          },
          {
            name: 'Cloud Solutions',
            description: 'Cloud infrastructure services',
            revenuePercentage: 40,
            keyMarkets: ['Asia Pacific'],
          },
        ],
        geographicMarkets: ['North America', 'Europe', 'Asia Pacific'],
      });

      expect(result).toBeDefined();
      expect(result.description).toBeDefined();
    });

    test('should include supply chain narrative', async () => {
      const result = await service.generateBusinessDescription({
        groupName: 'Tech Corp',
        industrySector: 'Information Technology',
        businessActivities: [BusinessActivity.SERVICES],
        entityCharacterization: 'IT services provider',
        revenue: 500000000,
        exportRevenue: 400000000,
        employeeCount: 200,
        productsServices: [
          {
            name: 'Cloud Services',
            description: 'Cloud computing solutions',
            revenuePercentage: 100,
            keyMarkets: ['Global'],
          },
        ],
        geographicMarkets: ['Global'],
      });

      expect(result.supplyChainNarrative).toBeDefined();
    });

    test('should include FAR analysis', async () => {
      const result = await service.generateBusinessDescription({
        groupName: 'Mfg Corp',
        industrySector: 'Manufacturing',
        businessActivities: [BusinessActivity.MANUFACTURING, BusinessActivity.SALES_MARKETING],
        entityCharacterization: 'Contract manufacturer',
        revenue: 800000000,
        exportRevenue: 600000000,
        employeeCount: 1000,
        productsServices: [
          {
            name: 'Manufacturing Services',
            description: 'Contract manufacturing',
            revenuePercentage: 80,
            keyMarkets: ['Americas', 'Europe'],
          },
        ],
        geographicMarkets: ['Americas', 'Europe'],
      });

      expect(result.farAnalysis).toBeDefined();
      expect(result.farAnalysis.functions).toBeDefined();
      expect(result.farAnalysis.assets).toBeDefined();
      expect(result.farAnalysis.risks).toBeDefined();
    });

    test('should include profit drivers', async () => {
      const result = await service.generateBusinessDescription({
        groupName: 'Services Corp',
        industrySector: 'Professional Services',
        businessActivities: [BusinessActivity.SERVICES],
        entityCharacterization: 'Consulting firm',
        revenue: 200000000,
        exportRevenue: 150000000,
        employeeCount: 100,
        productsServices: [
          {
            name: 'Consulting',
            description: 'Business consulting services',
            revenuePercentage: 100,
            keyMarkets: ['Domestic'],
          },
        ],
        geographicMarkets: ['Domestic'],
      });

      expect(result.profitDrivers).toBeDefined();
      expect(Array.isArray(result.profitDrivers)).toBe(true);
    });
  });

  describe('Intangibles Strategy Generation', () => {
    test('should generate intangibles strategy', async () => {
      const result = await service.generateIntangiblesStrategy({
        groupName: 'IP Holdings Group',
        industry: 'Technology',
        intangiblesList: [
          {
            type: IntangibleType.SOFTWARE,
            description: 'Enterprise software platform',
            legalOwner: 'US Parent',
            economicOwner: 'US Parent',
            developmentLocation: 'India',
            relatedAgreements: ['Development Agreement'],
          },
        ],
        rdFacilities: [
          {
            location: 'Bangalore R&D Center',
            country: 'India',
            activities: ['Software development', 'Testing'],
            employeeCount: 500,
          },
        ],
        rdManagementLocation: 'USA',
        legalOwner: 'US Parent Corp',
        economicOwner: 'US Parent Corp',
      });

      expect(result).toBeDefined();
      expect(result.strategy).toBeDefined();
      expect(typeof result.strategy).toBe('string');
    });

    test('should describe DEMPE functions', async () => {
      const result = await service.generateIntangiblesStrategy({
        groupName: 'Tech Group',
        industry: 'Software',
        intangiblesList: [
          {
            type: IntangibleType.PATENT,
            description: 'Proprietary algorithm patent',
            legalOwner: 'US Parent',
            economicOwner: 'US Parent',
            developmentLocation: 'India R&D',
            relatedAgreements: ['R&D Agreement'],
          },
        ],
        rdFacilities: [
          {
            location: 'India Development Center',
            country: 'India',
            activities: ['R&D'],
            employeeCount: 200,
          },
        ],
        rdManagementLocation: 'USA',
        legalOwner: 'US Parent',
        economicOwner: 'US Parent',
      });

      expect(result.dempeAnalysis).toBeDefined();
    });
  });

  describe('Financial Policy Generation', () => {
    test('should generate financial policy', async () => {
      const result = await service.generateFinancialPolicy({
        groupName: 'Global Finance Corp',
        financingEntities: [
          { entityName: 'US Treasury', country: 'USA', function: 'Group treasury' },
          { entityName: 'India Sub', country: 'India', function: 'Operating company' },
        ],
        financingArrangements: [
          {
            type: FinancingArrangementType.LOAN,
            lender: 'US Treasury',
            borrowers: ['India Sub'],
            amount: 10000000,
            currency: 'USD',
            interestRate: 5.5,
            terms: '5 year term loan',
          },
        ],
        interestRatePolicy: 'SOFR + spread based on credit rating',
        currencyManagement: 'Natural hedging with central treasury oversight',
      });

      expect(result).toBeDefined();
      expect(result.description).toBeDefined();
      expect(typeof result.description).toBe('string');
    });

    test('should include financing entities narrative', async () => {
      const result = await service.generateFinancialPolicy({
        groupName: 'Treasury Corp',
        financingEntities: [
          { entityName: 'Central Treasury', country: 'USA', function: 'Treasury' },
        ],
        financingArrangements: [
          {
            type: FinancingArrangementType.CASH_POOLING,
            lender: 'Central Treasury',
            borrowers: ['Sub A', 'Sub B'],
            amount: 50000000,
            currency: 'USD',
            interestRate: 4.5,
            terms: 'Notional pooling',
          },
        ],
        interestRatePolicy: 'Market rates',
        currencyManagement: 'Active hedging',
      });

      expect(result.financingEntitiesNarrative).toBeDefined();
    });
  });

  describe('FAR Analysis Generation', () => {
    test('should generate FAR analysis', async () => {
      const result = await service.generateFARAnalysis({
        entityName: 'India Sub Pvt Ltd',
        entityType: 'Contract Service Provider',
        industry: 'IT Services',
        principalActivity: 'Software development services',
        functions: ['Software development', 'Testing', 'Support'],
        assets: ['IT infrastructure', 'Trained workforce'],
        risks: ['Operational risk', 'Technology risk'],
        relatedPartyTransactions: 'Services to US Parent',
      });

      expect(result).toBeDefined();
      expect(result.functionsAnalysis).toBeDefined();
    });

    test('should include functions analysis', async () => {
      const result = await service.generateFARAnalysis({
        entityName: 'Test Corp',
        entityType: 'Subsidiary',
        industry: 'Manufacturing',
        principalActivity: 'Contract manufacturing',
        functions: ['Production', 'Quality control', 'Logistics'],
        assets: ['Factory', 'Equipment'],
        risks: ['Production risk'],
        relatedPartyTransactions: 'Contract manufacturing',
      });

      expect(result.functionsAnalysis).toBeDefined();
      expect(Array.isArray(result.functionsAnalysis)).toBe(true);
    });

    test('should include assets analysis', async () => {
      const result = await service.generateFARAnalysis({
        entityName: 'Asset Corp',
        entityType: 'R&D Center',
        industry: 'Pharmaceuticals',
        principalActivity: 'Contract R&D',
        functions: ['Research', 'Development'],
        assets: ['R&D facilities', 'Lab equipment', 'Scientific workforce'],
        risks: ['R&D risk'],
        relatedPartyTransactions: 'R&D services',
      });

      expect(result.assetsAnalysis).toBeDefined();
      expect(Array.isArray(result.assetsAnalysis)).toBe(true);
    });

    test('should include risks analysis', async () => {
      const result = await service.generateFARAnalysis({
        entityName: 'Risk Entity',
        entityType: 'Distributor',
        industry: 'Trading',
        principalActivity: 'Distribution',
        functions: ['Marketing', 'Distribution', 'Sales'],
        assets: ['Inventory', 'Receivables'],
        risks: ['Market risk', 'Credit risk', 'Inventory risk'],
        relatedPartyTransactions: 'Purchase of goods',
      });

      expect(result.risksAnalysis).toBeDefined();
      expect(Array.isArray(result.risksAnalysis)).toBe(true);
    });
  });

  describe('Type Exports', () => {
    test('OrganizationalStructureResult type should be usable', () => {
      const result: Partial<OrganizationalStructureResult> = {
        narrative: 'Test narrative',
      };
      expect(result.narrative).toBeDefined();
    });

    test('BusinessDescriptionResult type should be usable', () => {
      const result: Partial<BusinessDescriptionResult> = {
        description: 'Business description',
      };
      expect(result.description).toBeDefined();
    });

    test('IntangiblesStrategyResult type should be usable', () => {
      const result: Partial<IntangiblesStrategyResult> = {
        strategy: 'IP strategy',
      };
      expect(result.strategy).toBeDefined();
    });

    test('FinancialPolicyResult type should be usable', () => {
      const result: Partial<FinancialPolicyResult> = {
        description: 'Financial policy',
      };
      expect(result.description).toBeDefined();
    });

    test('FARAnalysisResult type should be usable', () => {
      const result: Partial<FARAnalysisResult> = {
        functionsAnalysis: [],
      };
      expect(result.functionsAnalysis).toBeDefined();
    });
  });
});
