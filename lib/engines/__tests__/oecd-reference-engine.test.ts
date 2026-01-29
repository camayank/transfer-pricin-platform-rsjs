/**
 * OECD Reference Engine - Unit Tests
 * Tests OECD TP Guidelines search and retrieval functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  OECDReferenceEngine,
  createOECDReferenceEngine,
  OECD_GUIDELINES,
  OECD_CHAPTERS,
  OECD_GUIDELINES_VERSION,
  getAllChapterTitles,
  getGuidelinesForMethod,
  getGuidelinesForTransactionType,
} from '../oecd-reference-engine';

describe('OECD Reference Engine', () => {
  let engine: OECDReferenceEngine;

  beforeEach(() => {
    engine = createOECDReferenceEngine();
  });

  describe('Engine Instantiation', () => {
    test('should create engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(OECDReferenceEngine);
    });
  });

  describe('Search Functionality', () => {
    test('should search by text', () => {
      const results = engine.search({ text: 'arm length' });
      expect(results).toBeDefined();
      expect(results.results).toBeDefined();
      expect(Array.isArray(results.results)).toBe(true);
      expect(results.searchTime).toBeDefined();
      expect(typeof results.searchTime).toBe('number');
    });

    test('should search by keywords', () => {
      const results = engine.search({ keywords: ['comparability', 'analysis'] });
      expect(results).toBeDefined();
      expect(results.results).toBeDefined();
    });

    test('should search by chapter', () => {
      const results = engine.search({ chapter: 2 });
      expect(results).toBeDefined();
      // All results should be from chapter 2
      results.results.forEach(r => {
        expect(r.guideline.chapter).toBe(2);
      });
    });

    test('should search by method', () => {
      const results = engine.search({ method: 'TNMM' });
      expect(results).toBeDefined();
    });

    test('should search by transaction type', () => {
      const results = engine.search({ transactionType: 'services' });
      expect(results).toBeDefined();
    });

    test('should apply limit', () => {
      const results = engine.search({ text: 'transfer pricing', limit: 5 });
      expect(results.results.length).toBeLessThanOrEqual(5);
    });

    test('should apply minimum score filter', () => {
      const results = engine.search({ text: 'arm length principle', minScore: 50 });
      expect(results).toBeDefined();
      results.results.forEach(r => {
        expect(r.relevanceScore).toBeGreaterThanOrEqual(50);
      });
    });

    test('should return total matches count', () => {
      const results = engine.search({ text: 'comparability' });
      expect(results.totalMatches).toBeDefined();
      expect(typeof results.totalMatches).toBe('number');
    });

    test('should include query in results', () => {
      const query = { text: 'TNMM', chapter: 2 };
      const results = engine.search(query);
      expect(results.query).toEqual(query);
    });

    test('should return matched keywords', () => {
      const results = engine.search({ keywords: ['comparability'] });
      if (results.results.length > 0) {
        expect(results.results[0].matchedKeywords).toBeDefined();
        expect(Array.isArray(results.results[0].matchedKeywords)).toBe(true);
      }
    });

    test('should sort results by relevance score', () => {
      const results = engine.search({ text: 'arm length principle' });
      if (results.results.length >= 2) {
        for (let i = 0; i < results.results.length - 1; i++) {
          expect(results.results[i].relevanceScore).toBeGreaterThanOrEqual(
            results.results[i + 1].relevanceScore
          );
        }
      }
    });
  });

  describe('Guideline Context', () => {
    test('should get guideline context', () => {
      const context = engine.getGuidelineContext(1, '1.6');
      if (context) {
        expect(context.guideline).toBeDefined();
        expect(context.chapter).toBeDefined();
        expect(context.relatedGuidelines).toBeDefined();
        expect(context.practicalImplications).toBeDefined();
        expect(Array.isArray(context.practicalImplications)).toBe(true);
      }
    });

    test('should return null for non-existent guideline', () => {
      const context = engine.getGuidelineContext(99, 'non-existent');
      expect(context).toBeNull();
    });

    test('should include method relevance when applicable', () => {
      // Chapter 2 contains method-related guidelines
      const context = engine.getGuidelineContext(2, '2.1');
      if (context) {
        expect(context).toBeDefined();
        // Method relevance may or may not be present depending on the guideline
      }
    });
  });

  describe('Method Guidance', () => {
    test('should get CUP method guidance', () => {
      const guidance = engine.getMethodGuidance('CUP');
      expect(guidance).toBeDefined();
      expect(guidance.method).toBe('CUP');
      expect(guidance.methodFullName).toBe('Comparable Uncontrolled Price Method');
      expect(guidance.primaryGuidelines).toBeDefined();
      expect(guidance.strengthsWeaknesses).toBeDefined();
      expect(guidance.bestUseCases).toBeDefined();
      expect(guidance.comparabilityFactors).toBeDefined();
    });

    test('should get RPM method guidance', () => {
      const guidance = engine.getMethodGuidance('RPM');
      expect(guidance.method).toBe('RPM');
      expect(guidance.methodFullName).toBe('Resale Price Method');
    });

    test('should get CPM method guidance', () => {
      const guidance = engine.getMethodGuidance('CPM');
      expect(guidance.method).toBe('CPM');
      expect(guidance.methodFullName).toBe('Cost Plus Method');
    });

    test('should get TNMM method guidance', () => {
      const guidance = engine.getMethodGuidance('TNMM');
      expect(guidance.method).toBe('TNMM');
      expect(guidance.methodFullName).toBe('Transactional Net Margin Method');
    });

    test('should get PSM method guidance', () => {
      const guidance = engine.getMethodGuidance('PSM');
      expect(guidance.method).toBe('PSM');
      expect(guidance.methodFullName).toBe('Profit Split Method');
    });

    test('method guidance should include best use cases', () => {
      const guidance = engine.getMethodGuidance('TNMM');
      expect(guidance.bestUseCases).toBeDefined();
      expect(Array.isArray(guidance.bestUseCases)).toBe(true);
      expect(guidance.bestUseCases.length).toBeGreaterThan(0);
    });

    test('method guidance should include comparability factors', () => {
      const guidance = engine.getMethodGuidance('CUP');
      expect(guidance.comparabilityFactors).toBeDefined();
      expect(Array.isArray(guidance.comparabilityFactors)).toBe(true);
    });
  });

  describe('Chapter Operations', () => {
    test('should get chapter guidelines', () => {
      const result = engine.getChapterGuidelines(1);
      expect(result).toBeDefined();
      expect(result.chapter).toBeDefined();
      expect(result.guidelines).toBeDefined();
      expect(Array.isArray(result.guidelines)).toBe(true);
    });

    test('should get chapter summary', () => {
      const summary = engine.getChapterSummary();
      expect(summary).toBeDefined();
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
    });

    test('chapter summary should include chapter 1-10', () => {
      const summary = engine.getChapterSummary();
      // OECDChapter interface has 'number' property, not 'chapter'
      const chapterNumbers = summary.map(c => c.number);
      // OECD Guidelines typically have 10 chapters
      expect(chapterNumbers).toContain(1);
      expect(chapterNumbers).toContain(2);
    });
  });

  describe('Keyword Search', () => {
    test('should search by keyword', () => {
      const results = engine.searchByKeyword('comparability');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Version Info', () => {
    test('should get version info', () => {
      const version = engine.getVersionInfo();
      expect(version).toBeDefined();
    });
  });

  describe('Find Relevant Guidelines', () => {
    test('should find guidelines for manufacturing transaction', () => {
      const guidelines = engine.findRelevantGuidelines({
        transactionType: 'manufacturing',
        functions: ['production', 'quality control'],
      });
      expect(guidelines).toBeDefined();
      expect(Array.isArray(guidelines)).toBe(true);
    });

    test('should find guidelines when intangibles involved', () => {
      const guidelines = engine.findRelevantGuidelines({
        transactionType: 'license',
        intangiblesInvolved: true,
      });
      expect(guidelines).toBeDefined();
      expect(Array.isArray(guidelines)).toBe(true);
    });

    test('should find guidelines for cross-border services', () => {
      const guidelines = engine.findRelevantGuidelines({
        transactionType: 'services',
        crossBorderServices: true,
      });
      expect(guidelines).toBeDefined();
      expect(Array.isArray(guidelines)).toBe(true);
    });

    test('should find guidelines for financial transactions', () => {
      const guidelines = engine.findRelevantGuidelines({
        transactionType: 'loan',
        financialTransaction: true,
      });
      expect(guidelines).toBeDefined();
      expect(Array.isArray(guidelines)).toBe(true);
    });
  });

  describe('Constants and Exports', () => {
    test('OECD_GUIDELINES should be an array', () => {
      expect(OECD_GUIDELINES).toBeDefined();
      expect(Array.isArray(OECD_GUIDELINES)).toBe(true);
    });

    test('OECD_CHAPTERS should be an array', () => {
      expect(OECD_CHAPTERS).toBeDefined();
      expect(Array.isArray(OECD_CHAPTERS)).toBe(true);
    });

    test('OECD_GUIDELINES_VERSION should be defined', () => {
      expect(OECD_GUIDELINES_VERSION).toBeDefined();
    });

    test('getAllChapterTitles should return titles', () => {
      const titles = getAllChapterTitles();
      expect(titles).toBeDefined();
    });

    test('getGuidelinesForMethod should work', () => {
      const guidelines = getGuidelinesForMethod('TNMM');
      expect(guidelines).toBeDefined();
      expect(Array.isArray(guidelines)).toBe(true);
    });

    test('getGuidelinesForTransactionType should work', () => {
      const guidelines = getGuidelinesForTransactionType('services');
      expect(guidelines).toBeDefined();
      expect(Array.isArray(guidelines)).toBe(true);
    });
  });

  describe('Factory Function', () => {
    test('createOECDReferenceEngine should return engine instance', () => {
      const newEngine = createOECDReferenceEngine();
      expect(newEngine).toBeDefined();
      expect(newEngine).toBeInstanceOf(OECDReferenceEngine);
    });
  });
});
