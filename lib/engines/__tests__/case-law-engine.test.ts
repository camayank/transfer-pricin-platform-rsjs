/**
 * Case Law Engine - Unit Tests
 * Tests TP case law search and retrieval functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  CaseLawEngine,
  createCaseLawEngine,
} from '../case-law-engine';

describe('Case Law Engine', () => {
  let engine: CaseLawEngine;

  beforeEach(() => {
    engine = createCaseLawEngine();
  });

  describe('Engine Instantiation', () => {
    test('should create engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(CaseLawEngine);
    });
  });

  describe('Search Functionality', () => {
    test('should search cases by text', () => {
      const results = engine.search({ text: 'arm length' });
      expect(results).toBeDefined();
      expect(results.results).toBeDefined();
      expect(Array.isArray(results.results)).toBe(true);
    });

    test('should search cases by keywords', () => {
      const results = engine.search({ keywords: ['TNMM', 'comparability'] });
      expect(results).toBeDefined();
      expect(results.results).toBeDefined();
    });

    test('should search cases by court type', () => {
      const results = engine.search({ court: 'ITAT' });
      expect(results).toBeDefined();
    });

    test('should search cases by outcome', () => {
      const results = engine.search({ outcome: 'taxpayer' });
      expect(results).toBeDefined();
    });

    test('should search cases by method', () => {
      const results = engine.search({ method: 'TNMM' });
      expect(results).toBeDefined();
    });

    test('should search with limit', () => {
      const results = engine.search({ text: 'transfer pricing', limit: 5 });
      expect(results).toBeDefined();
      expect(results.results.length).toBeLessThanOrEqual(5);
    });

    test('should return search time', () => {
      const results = engine.search({ text: 'margin' });
      expect(results.searchTime).toBeDefined();
      expect(typeof results.searchTime).toBe('number');
    });

    test('should return total matches count', () => {
      const results = engine.search({ text: 'transfer' });
      expect(results.totalMatches).toBeDefined();
      expect(typeof results.totalMatches).toBe('number');
    });
  });

  describe('Get Landmark Cases', () => {
    test('should return landmark cases', () => {
      const landmarks = engine.getLandmarkCases();
      expect(landmarks).toBeDefined();
      expect(Array.isArray(landmarks)).toBe(true);
    });
  });

  describe('Search By Citation', () => {
    test('should search case by citation', () => {
      const landmarks = engine.getLandmarkCases();
      if (landmarks.length > 0) {
        const caseItem = engine.searchByCitation(landmarks[0].citation);
        expect(caseItem).toBeDefined();
      }
    });

    test('should return undefined for non-existent citation', () => {
      const caseItem = engine.searchByCitation('NON-EXISTENT-CITATION-12345');
      expect(caseItem).toBeUndefined();
    });
  });

  describe('Get Cases By Criteria', () => {
    test('should get ITAT cases', () => {
      const cases = engine.getCasesByCriteria({ court: 'ITAT' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should get High Court cases', () => {
      const cases = engine.getCasesByCriteria({ court: 'High Court' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should get Supreme Court cases', () => {
      const cases = engine.getCasesByCriteria({ court: 'Supreme Court' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should get taxpayer favorable cases', () => {
      const cases = engine.getCasesByCriteria({ outcome: 'taxpayer' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should get revenue favorable cases', () => {
      const cases = engine.getCasesByCriteria({ outcome: 'revenue' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should get mixed outcome cases', () => {
      const cases = engine.getCasesByCriteria({ outcome: 'mixed' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should get TNMM cases', () => {
      const cases = engine.getCasesByCriteria({ method: 'TNMM' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should get CUP cases', () => {
      const cases = engine.getCasesByCriteria({ method: 'CUP' });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });

    test('should filter by multiple criteria', () => {
      const cases = engine.getCasesByCriteria({
        court: 'ITAT',
        outcome: 'taxpayer'
      });
      expect(cases).toBeDefined();
      expect(Array.isArray(cases)).toBe(true);
    });
  });

  describe('Get Case Statistics', () => {
    test('should return statistics', () => {
      const stats = engine.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.totalCases).toBeDefined();
      expect(typeof stats.totalCases).toBe('number');
    });
  });

  describe('Get Case Context', () => {
    test('should return case context with related cases', () => {
      const landmarks = engine.getLandmarkCases();
      if (landmarks.length > 0) {
        // getCaseContext takes caseId (id property), not citation
        const context = engine.getCaseContext(landmarks[0].id);
        expect(context).toBeDefined();
        if (context) {
          expect(context.case).toBeDefined();
          expect(context.relatedCases).toBeDefined();
          expect(context.precedentChain).toBeDefined();
          expect(context.practicalImplications).toBeDefined();
          expect(context.defenseTips).toBeDefined();
        }
      }
    });

    test('should return null for non-existent case', () => {
      const context = engine.getCaseContext('non-existent-id');
      expect(context).toBeNull();
    });
  });

  describe('Get Cases For Transaction', () => {
    test('should return categorized cases for a transaction type', () => {
      const result = engine.getCasesForTransaction('1001');
      expect(result).toBeDefined();
      expect(result.favorable).toBeDefined();
      expect(result.adverse).toBeDefined();
      expect(result.landmark).toBeDefined();
      expect(Array.isArray(result.favorable)).toBe(true);
      expect(Array.isArray(result.adverse)).toBe(true);
      expect(Array.isArray(result.landmark)).toBe(true);
    });
  });

  describe('Analyze Issue', () => {
    test('should analyze transfer pricing issue', () => {
      const analysis = engine.analyzeIssue('comparability adjustment');
      expect(analysis).toBeDefined();
      expect(analysis.issue).toBeDefined();
      expect(analysis.relevantCases).toBeDefined();
    });
  });

  describe('Database Version', () => {
    test('should have version info', () => {
      const version = engine.getVersionInfo();
      expect(version).toBeDefined();
    });
  });

  describe('Factory Function', () => {
    test('createCaseLawEngine should return engine instance', () => {
      const caseLawEngine = createCaseLawEngine();
      expect(caseLawEngine).toBeDefined();
      expect(caseLawEngine).toBeInstanceOf(CaseLawEngine);
    });
  });
});
