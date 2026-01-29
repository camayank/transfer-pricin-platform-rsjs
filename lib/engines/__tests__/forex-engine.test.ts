/**
 * Forex Engine - Unit Tests
 * Tests currency conversion and exchange rate functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  ForexEngine,
  createForexEngine,
  STATIC_INR_RATES,
  CURRENCY_INFO,
  getSupportedCurrencies,
} from '../forex-engine';

describe('Forex Engine', () => {
  let engine: ForexEngine;

  beforeEach(() => {
    engine = createForexEngine();
  });

  describe('Engine Instantiation', () => {
    test('should create engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(ForexEngine);
    });

    test('should create engine with custom config', () => {
      const customEngine = createForexEngine({
        cacheTTL: 1800000,
        primarySource: 'ECB',
      });
      expect(customEngine).toBeDefined();
      expect(customEngine).toBeInstanceOf(ForexEngine);
    });
  });

  describe('Static INR Rates', () => {
    test('should have USD rate defined', () => {
      expect(STATIC_INR_RATES.USD).toBeDefined();
      expect(typeof STATIC_INR_RATES.USD).toBe('number');
      expect(STATIC_INR_RATES.USD).toBeGreaterThan(0);
    });

    test('should have EUR rate defined', () => {
      expect(STATIC_INR_RATES.EUR).toBeDefined();
      expect(typeof STATIC_INR_RATES.EUR).toBe('number');
      expect(STATIC_INR_RATES.EUR).toBeGreaterThan(0);
    });

    test('should have GBP rate defined', () => {
      expect(STATIC_INR_RATES.GBP).toBeDefined();
      expect(typeof STATIC_INR_RATES.GBP).toBe('number');
      expect(STATIC_INR_RATES.GBP).toBeGreaterThan(0);
    });

    test('should have JPY rate defined', () => {
      expect(STATIC_INR_RATES.JPY).toBeDefined();
      expect(typeof STATIC_INR_RATES.JPY).toBe('number');
      expect(STATIC_INR_RATES.JPY).toBeGreaterThan(0);
    });

    test('USD should be approximately 83 INR', () => {
      expect(STATIC_INR_RATES.USD).toBeGreaterThan(80);
      expect(STATIC_INR_RATES.USD).toBeLessThan(90);
    });

    test('EUR should be greater than USD', () => {
      expect(STATIC_INR_RATES.EUR).toBeGreaterThan(STATIC_INR_RATES.USD);
    });

    test('GBP should be greater than EUR', () => {
      expect(STATIC_INR_RATES.GBP).toBeGreaterThan(STATIC_INR_RATES.EUR);
    });
  });

  describe('Currency Info', () => {
    test('should have USD info', () => {
      expect(CURRENCY_INFO.USD).toBeDefined();
      expect(CURRENCY_INFO.USD.name).toBe('US Dollar');
      expect(CURRENCY_INFO.USD.symbol).toBe('$');
    });

    test('should have EUR info', () => {
      expect(CURRENCY_INFO.EUR).toBeDefined();
      expect(CURRENCY_INFO.EUR.name).toBe('Euro');
      expect(CURRENCY_INFO.EUR.symbol).toBe('€');
    });

    test('should have GBP info', () => {
      expect(CURRENCY_INFO.GBP).toBeDefined();
      expect(CURRENCY_INFO.GBP.name).toBe('British Pound');
      expect(CURRENCY_INFO.GBP.symbol).toBe('£');
    });

    test('should have INR info', () => {
      expect(CURRENCY_INFO.INR).toBeDefined();
      expect(CURRENCY_INFO.INR.name).toBe('Indian Rupee');
      expect(CURRENCY_INFO.INR.symbol).toBe('₹');
    });
  });

  describe('Currency Conversion', () => {
    test('should convert USD to INR', async () => {
      const result = await engine.convert({
        fromCurrency: 'USD',
        toCurrency: 'INR',
        amount: 100,
      });

      expect(result).toBeDefined();
      expect(result.toAmount).toBeGreaterThan(0);
      expect(result.rate).toBeGreaterThan(0);
    });

    test('should convert INR to USD', async () => {
      const result = await engine.convert({
        fromCurrency: 'INR',
        toCurrency: 'USD',
        amount: 8300,
      });

      expect(result).toBeDefined();
      expect(result.toAmount).toBeGreaterThan(0);
    });

    test('should convert EUR to INR', async () => {
      const result = await engine.convert({
        fromCurrency: 'EUR',
        toCurrency: 'INR',
        amount: 100,
      });

      expect(result).toBeDefined();
      expect(result.toAmount).toBeGreaterThan(8000); // EUR is stronger than USD
    });

    test('should handle same currency conversion', async () => {
      const result = await engine.convert({
        fromCurrency: 'USD',
        toCurrency: 'USD',
        amount: 100,
      });

      expect(result.toAmount).toBe(100);
      expect(result.rate).toBe(1);
    });
  });

  describe('Get Rate', () => {
    test('should get current USD/INR rate', async () => {
      const rate = await engine.getRate('USD', 'INR');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeGreaterThan(0);
      expect(rate.baseCurrency).toBe('USD');
      expect(rate.quoteCurrency).toBe('INR');
    });

    test('should get current EUR/INR rate', async () => {
      const rate = await engine.getRate('EUR', 'INR');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeGreaterThan(0);
    });

    test('should include rate source', async () => {
      const rate = await engine.getRate('USD', 'INR');

      expect(rate.source).toBeDefined();
    });
  });

  describe('Supported Currencies', () => {
    test('should return list of supported currencies', () => {
      const currencies = engine.getSupportedCurrencies();

      expect(currencies).toBeDefined();
      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(0);
      expect(currencies).toContain('USD');
      expect(currencies).toContain('EUR');
      expect(currencies).toContain('INR');
    });

    test('getSupportedCurrencies helper should work', () => {
      const currencies = getSupportedCurrencies();

      expect(currencies).toBeDefined();
      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies).toContain('USD');
    });
  });

  describe('Rate Comparison', () => {
    test('should compare rates across sources', async () => {
      const comparison = await engine.compareRates('USD', 'INR');

      expect(comparison).toBeDefined();
      expect(comparison.baseCurrency).toBe('USD');
      expect(comparison.quoteCurrency).toBe('INR');
      expect(comparison.recommendedSource).toBeDefined();
    });
  });

  describe('Multi-Currency Conversion', () => {
    test('should convert to multiple currencies at once', async () => {
      const result = await engine.convertMultiple({
        baseCurrency: 'USD',
        targetCurrencies: ['INR', 'EUR', 'GBP'],
        amount: 100,
      });

      expect(result).toBeDefined();
      expect(result.baseCurrency).toBe('USD');
      expect(result.baseAmount).toBe(100);
      expect(result.conversions).toBeDefined();
      expect(result.conversions.length).toBe(3);
    });
  });

  describe('TP Compliance Rates', () => {
    test('should get rates for TP compliance', async () => {
      const result = await engine.getTPComplianceRates();

      expect(result).toBeDefined();
      expect(result.rates).toBeDefined();
      expect(Array.isArray(result.rates)).toBe(true);
      expect(result.asOf).toBeDefined();
    });
  });

  describe('Currency Validation', () => {
    test('should validate valid currency code', () => {
      expect(engine.isValidCurrency('USD')).toBe(true);
      expect(engine.isValidCurrency('EUR')).toBe(true);
      expect(engine.isValidCurrency('INR')).toBe(true);
    });

    test('should reject invalid currency code', () => {
      expect(engine.isValidCurrency('INVALID')).toBe(false);
      expect(engine.isValidCurrency('XXX')).toBe(false);
    });
  });

  describe('Format Amount', () => {
    test('should format USD amount', () => {
      const formatted = engine.formatAmount(1000, 'USD');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    test('should format INR amount', () => {
      const formatted = engine.formatAmount(100000, 'INR');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', () => {
      expect(() => engine.clearCache()).not.toThrow();
    });

    test('should get cache stats', () => {
      const stats = engine.getCacheStats();
      expect(stats).toBeDefined();
      expect(stats.engine).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle zero amount', async () => {
      const result = await engine.convert({
        fromCurrency: 'USD',
        toCurrency: 'INR',
        amount: 0,
      });

      expect(result.toAmount).toBe(0);
    });

    test('should handle negative amount', async () => {
      const result = await engine.convert({
        fromCurrency: 'USD',
        toCurrency: 'INR',
        amount: -100,
      });

      expect(result.toAmount).toBeLessThan(0);
    });
  });
});
