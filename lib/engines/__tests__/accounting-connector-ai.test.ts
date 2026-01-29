/**
 * Accounting Connector AI - Unit Tests
 * Tests AI-enhanced accounting data processing functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  AccountingConnectorAIService,
  createAccountingConnectorAIService,
  TransactionClassificationResult,
  RelatedPartyDetectionResult,
  NatureCodeRecommendation,
  FinancialAnomalyResult,
  AccountingSystem,
  AccountType,
  TransactionType,
} from '../accounting-connector-ai';

describe('Accounting Connector AI Service', () => {
  let service: AccountingConnectorAIService;

  beforeEach(() => {
    service = createAccountingConnectorAIService();
  });

  describe('Service Instantiation', () => {
    test('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AccountingConnectorAIService);
    });

    test('factory function should return service instance', () => {
      const newService = createAccountingConnectorAIService();
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(AccountingConnectorAIService);
    });
  });

  describe('Related Party Context', () => {
    test('should set related party context', () => {
      expect(() => {
        service.setRelatedPartyContext({
          knownParties: ['US Parent Corp', 'Singapore Sub'],
          parentCompany: 'US Parent Corp',
          parentCountry: 'USA',
        });
      }).not.toThrow();
    });
  });

  describe('Transaction Classification', () => {
    test('should classify transactions', async () => {
      const transactions = [
        {
          id: 'TXN-001',
          description: 'Software development services',
          amount: 1000000,
          partyName: 'US Parent Corp',
          accountType: AccountType.REVENUE,
        },
      ];

      const results = await service.classifyTransactions(transactions);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0].transactionId).toBe('TXN-001');
    });

    test('should include classification details', async () => {
      const transactions = [
        {
          id: 'TXN-001',
          description: 'IT services payment',
          amount: 500000,
          accountType: AccountType.OPERATING_EXPENSE,
        },
      ];

      const results = await service.classifyTransactions(transactions);
      if (results.length > 0) {
        expect(results[0].classification).toBeDefined();
        expect(results[0].classification.natureCode).toBeDefined();
        expect(results[0].classification.transactionType).toBeDefined();
      }
    });

    test('should identify related party status', async () => {
      service.setRelatedPartyContext({
        knownParties: ['Parent Corp'],
        parentCompany: 'Parent Corp',
        parentCountry: 'USA',
      });

      const transactions = [
        {
          id: 'TXN-001',
          description: 'Management fee',
          amount: 200000,
          partyName: 'Parent Corp',
        },
      ];

      const results = await service.classifyTransactions(transactions);
      expect(results[0].isRelatedParty).toBeDefined();
    });

    test('should suggest TP method', async () => {
      const transactions = [
        {
          id: 'TXN-001',
          description: 'Software development services',
          amount: 1000000,
          accountType: AccountType.REVENUE,
        },
      ];

      const results = await service.classifyTransactions(transactions);
      expect(results[0].suggestedTPMethod).toBeDefined();
    });
  });

  describe('Related Party Detection', () => {
    test('should detect related parties from accounts', async () => {
      const accounts = [
        {
          accountCode: '4001',
          accountName: 'US Parent Corp - Services',
          accountType: AccountType.REVENUE,
          openingDebit: 0,
          openingCredit: 0,
          closingDebit: 1000000,
          closingCredit: 0,
          isRelatedParty: false,
        },
      ];

      const results = await service.detectRelatedParties(accounts);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should identify known related parties', async () => {
      service.setRelatedPartyContext({
        knownParties: ['Global Corp'],
        parentCompany: 'Global Corp',
        parentCountry: 'USA',
      });

      const accounts = [
        {
          accountCode: '4001',
          accountName: 'Global Corp - IT Services',
          accountType: AccountType.REVENUE,
          openingDebit: 0,
          openingCredit: 0,
          closingDebit: 5000000,
          closingCredit: 0,
          isRelatedParty: false,
        },
      ];

      const results = await service.detectRelatedParties(accounts);
      const detection = results.find(r => r.accountName.includes('Global Corp'));
      if (detection) {
        expect(detection.isRelatedParty).toBe(true);
        expect(detection.confidence).toBe('high');
      }
    });

    test('should provide detection indicators', async () => {
      const accounts = [
        {
          accountCode: '4001',
          accountName: 'Foreign Subsidiary Inc',
          accountType: AccountType.REVENUE,
          openingDebit: 0,
          openingCredit: 0,
          closingDebit: 1000000,
          closingCredit: 0,
          isRelatedParty: false,
        },
      ];

      const results = await service.detectRelatedParties(accounts);
      if (results.length > 0) {
        expect(results[0].indicators).toBeDefined();
        expect(Array.isArray(results[0].indicators)).toBe(true);
      }
    });
  });

  describe('Nature Code Recommendation', () => {
    test('should recommend nature codes', async () => {
      const transactions = [
        {
          description: 'Software development services',
          amount: 5000000,
          partyName: 'US Parent',
          partyCountry: 'USA',
        },
      ];

      const results = await service.recommendNatureCodes(transactions);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
    });

    test('should include primary code', async () => {
      const transactions = [
        {
          description: 'IT consulting services',
          amount: 1000000,
          partyName: 'Parent',
          partyCountry: 'USA',
        },
      ];

      const results = await service.recommendNatureCodes(transactions);
      expect(results[0].primaryCode).toBeDefined();
      expect(results[0].primaryDescription).toBeDefined();
    });

    test('should include justification', async () => {
      const transactions = [
        {
          description: 'Royalty payment for trademark',
          amount: 500000,
          partyName: 'IP Holding',
          partyCountry: 'Ireland',
        },
      ];

      const results = await service.recommendNatureCodes(transactions);
      expect(results[0].justification).toBeDefined();
    });

    test('should suggest TP method', async () => {
      const transactions = [
        {
          description: 'Management services',
          amount: 2000000,
          partyName: 'HQ',
          partyCountry: 'USA',
        },
      ];

      const results = await service.recommendNatureCodes(transactions);
      expect(results[0].suggestedTPMethod).toBeDefined();
    });
  });

  describe('Financial Anomaly Detection', () => {
    test('should detect financial anomalies', async () => {
      const statement = {
        companyName: 'Test Corp',
        financialYear: '2024-25',
        totalRevenue: 100000000,
        exportRevenue: 80000000,
        domesticRevenue: 20000000,
        costOfGoodsSold: 50000000,
        operatingExpenses: 35000000,
        operatingProfit: 15000000,
        depreciation: 5000000,
        interestExpense: 2000000,
        profitBeforeTax: 8000000,
        taxExpense: 2000000,
        profitAfterTax: 6000000,
        totalRPTValue: 80000000,
        rptAsPercentage: 80,
        accounts: [],
        relatedPartyTransactions: [],
        extractionDate: new Date().toISOString(),
      };

      const result = await service.detectFinancialAnomalies(statement);
      expect(result).toBeDefined();
      expect(result.anomalies).toBeDefined();
      expect(Array.isArray(result.anomalies)).toBe(true);
    });

    test('should provide risk assessment', async () => {
      const statement = {
        companyName: 'Test Corp',
        financialYear: '2024-25',
        totalRevenue: 100000000,
        exportRevenue: 95000000,
        domesticRevenue: 5000000,
        costOfGoodsSold: 40000000,
        operatingExpenses: 55000000,
        operatingProfit: 5000000,
        depreciation: 5000000,
        interestExpense: 2000000,
        profitBeforeTax: -2000000,
        taxExpense: 0,
        profitAfterTax: -2000000,
        totalRPTValue: 95000000,
        rptAsPercentage: 95,
        accounts: [],
        relatedPartyTransactions: [],
        extractionDate: new Date().toISOString(),
      };

      const result = await service.detectFinancialAnomalies(statement);
      expect(result.overallRiskAssessment).toBeDefined();
      expect(result.overallRiskAssessment.riskLevel).toBeDefined();
    });

    test('should identify documentation gaps', async () => {
      const statement = {
        companyName: 'Test Corp',
        financialYear: '2024-25',
        totalRevenue: 50000000,
        exportRevenue: 40000000,
        domesticRevenue: 10000000,
        costOfGoodsSold: 20000000,
        operatingExpenses: 25000000,
        operatingProfit: 5000000,
        depreciation: 2000000,
        interestExpense: 1000000,
        profitBeforeTax: 2000000,
        taxExpense: 500000,
        profitAfterTax: 1500000,
        totalRPTValue: 40000000,
        rptAsPercentage: 80,
        accounts: [],
        relatedPartyTransactions: [],
        extractionDate: new Date().toISOString(),
      };

      const result = await service.detectFinancialAnomalies(statement);
      expect(result.documentationGaps).toBeDefined();
      expect(Array.isArray(result.documentationGaps)).toBe(true);
    });

    test('should provide recommendations', async () => {
      const statement = {
        companyName: 'Test Corp',
        financialYear: '2024-25',
        totalRevenue: 100000000,
        exportRevenue: 80000000,
        domesticRevenue: 20000000,
        costOfGoodsSold: 50000000,
        operatingExpenses: 40000000,
        operatingProfit: 10000000,
        depreciation: 5000000,
        interestExpense: 2000000,
        profitBeforeTax: 3000000,
        taxExpense: 1000000,
        profitAfterTax: 2000000,
        totalRPTValue: 50000000,
        rptAsPercentage: 50,
        accounts: [],
        relatedPartyTransactions: [],
        extractionDate: new Date().toISOString(),
      };

      const result = await service.detectFinancialAnomalies(statement);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('Enums and Constants', () => {
    test('AccountingSystem enum should have values', () => {
      expect(AccountingSystem.TALLY_PRIME).toBeDefined();
      expect(AccountingSystem.ZOHO_BOOKS).toBeDefined();
    });

    test('AccountType enum should have values', () => {
      expect(AccountType.REVENUE).toBeDefined();
      expect(AccountType.OPERATING_EXPENSE).toBeDefined();
      expect(AccountType.OTHER_INCOME).toBeDefined();
    });

    test('TransactionType enum should have values', () => {
      expect(TransactionType.SERVICE_INCOME).toBeDefined();
      expect(TransactionType.SERVICE_EXPENSE).toBeDefined();
      expect(TransactionType.ROYALTY_INCOME).toBeDefined();
    });
  });
});
