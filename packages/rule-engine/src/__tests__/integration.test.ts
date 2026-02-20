/**
 * Rule engine integration tests — verify that resolution data flows
 * through runFullAnalysis and runFootnoteAnalysis correctly, matching
 * the exact code path used by API endpoints.
 */
import { describe, it, expect } from 'vitest';
import { runFullAnalysis, runFootnoteAnalysis, calculateScore } from '../index.js';
import { extractParseAndResolve, extractFootnoteCitations, resolveCitations } from '@legalcitation/citation-parser';
import type { DocumentCitationMap, ParsedCitation } from '@legalcitation/shared';

describe('Rule Engine Integration: runFullAnalysis with resolution', () => {
  it('accepts resolution data without errors', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). Id. at 490.';
    const { citations, resolution } = extractParseAndResolve(text);

    const issueMap = runFullAnalysis(citations, text, resolution);

    expect(issueMap).toBeInstanceOf(Map);
    // Every citation should have an entry (even if no issues)
    for (const citation of citations) {
      expect(issueMap.has(citation.id)).toBe(true);
    }
  });

  it('produces scores for all citations', () => {
    const text =
      'Roe v. Wade, 410 U.S. 113 (1973). ' +
      'Id. at 120. ' +
      '42 U.S.C. § 1983. ' +
      'U.S. Const. amend. XIV, § 1.';

    const { citations, resolution } = extractParseAndResolve(text);
    const issueMap = runFullAnalysis(citations, text, resolution);

    for (const citation of citations) {
      const issues = issueMap.get(citation.id) || [];
      const score = calculateScore(issues);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('works correctly without resolution data (backward compatible)', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). Id. at 490.';
    const { citations } = extractParseAndResolve(text);

    // Call without resolution — should not throw
    const issueMap = runFullAnalysis(citations, text);
    expect(issueMap).toBeInstanceOf(Map);
  });
});

describe('Rule Engine Integration: runFootnoteAnalysis with resolution', () => {
  it('processes footnotes with resolution data', () => {
    const text = [
      '1. Brown v. Board of Education, 347 U.S. 483 (1954).',
      '2. Id. at 495.',
      '3. Roe v. Wade, 410 U.S. 113 (1973).',
    ].join('\n');

    const parsedFootnotes = extractFootnoteCitations(text);
    const allCitations: ParsedCitation[] = parsedFootnotes.flatMap(fn => fn.citations);
    const resolution = resolveCitations(allCitations);

    const footnoteMap = new Map<number, ParsedCitation[]>();
    for (const fn of parsedFootnotes) {
      footnoteMap.set(fn.footnoteNumber, fn.citations);
    }

    const docMap: DocumentCitationMap = {
      footnotes: footnoteMap,
      allCitations,
      footnoteCount: parsedFootnotes.length,
    };

    const { issueMap, integrityReport } = runFootnoteAnalysis(docMap, text, resolution);

    expect(issueMap).toBeInstanceOf(Map);
    expect(integrityReport).toBeDefined();
    expect(integrityReport.totalFootnotes).toBe(3);
    expect(integrityReport.totalCitations).toBeGreaterThanOrEqual(3);
  });

  it('detects cross-reference issues in footnotes', () => {
    const text = [
      '1. Brown v. Board of Education, 347 U.S. 483 (1954). Roe v. Wade, 410 U.S. 113 (1973).',
      '2. Id. at 495.',
    ].join('\n');

    const parsedFootnotes = extractFootnoteCitations(text);
    const allCitations: ParsedCitation[] = parsedFootnotes.flatMap(fn => fn.citations);
    const resolution = resolveCitations(allCitations);

    const footnoteMap = new Map<number, ParsedCitation[]>();
    for (const fn of parsedFootnotes) {
      footnoteMap.set(fn.footnoteNumber, fn.citations);
    }

    const docMap: DocumentCitationMap = {
      footnotes: footnoteMap,
      allCitations,
      footnoteCount: parsedFootnotes.length,
    };

    const { integrityReport } = runFootnoteAnalysis(docMap, text, resolution);

    // Fn 1 has two authorities, so Id. in fn 2 is ambiguous
    expect(integrityReport.crossReferenceIssues.length).toBeGreaterThan(0);
  });
});

describe('Rule Engine Integration: Score calculation', () => {
  it('gives high scores to properly formatted citations', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483, 495 (1954).';
    const { citations, resolution } = extractParseAndResolve(text);
    const issueMap = runFullAnalysis(citations, text, resolution);

    const issues = issueMap.get(citations[0].id) || [];
    const score = calculateScore(issues);

    // A properly formatted SCOTUS citation should score reasonably well
    expect(score).toBeGreaterThanOrEqual(50);
  });
});
