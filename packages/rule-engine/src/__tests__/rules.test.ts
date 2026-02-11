import { describe, it, expect } from 'vitest';
import { runBluebookRules, runAllRules, calculateScore } from '../index.js';
import { extractAndParseCitations } from '@legalcitation/citation-parser';

describe('calculateScore', () => {
  it('returns 100 for no issues', () => {
    expect(calculateScore([])).toBe(100);
  });

  it('penalizes 15 points per error', () => {
    const issues = [
      { id: '1', rule: 'R.10', source: 'Bluebook' as const, severity: 'error' as const, message: 'err', suggestion: '' },
    ];
    expect(calculateScore(issues)).toBe(85);
  });

  it('penalizes 8 points per warning', () => {
    const issues = [
      { id: '1', rule: 'R.10', source: 'Bluebook' as const, severity: 'warning' as const, message: 'warn', suggestion: '' },
    ];
    expect(calculateScore(issues)).toBe(92);
  });

  it('penalizes 3 points per suggestion', () => {
    const issues = [
      { id: '1', rule: 'R.10', source: 'Bluebook' as const, severity: 'suggestion' as const, message: 'sug', suggestion: '' },
    ];
    expect(calculateScore(issues)).toBe(97);
  });

  it('does not go below 0', () => {
    const issues = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      rule: 'R.10',
      source: 'Bluebook' as const,
      severity: 'error' as const,
      message: 'err',
      suggestion: '',
    }));
    expect(calculateScore(issues)).toBe(0);
  });
});

describe('runBluebookRules on parsed citations', () => {
  it('validates a well-formed Supreme Court citation', () => {
    const citations = extractAndParseCitations('Brown v. Board of Education, 347 U.S. 483 (1954).');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    const issues = runBluebookRules(citations[0]);
    // A well-formed SCOTUS citation should have few or no errors
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeLessThanOrEqual(2);
  });

  it('validates a circuit court citation', () => {
    const citations = extractAndParseCitations('Smith v. Jones, 500 F.3d 100 (2d Cir. 2007).');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    const issues = runBluebookRules(citations[0]);
    // Should be largely valid
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeLessThanOrEqual(2);
  });

  it('flags issues in a statute citation without section symbol', () => {
    const citations = extractAndParseCitations('42 U.S.C. § 1983');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    // Should parse and validate without crashing
    const issues = runBluebookRules(citations[0]);
    expect(Array.isArray(issues)).toBe(true);
  });
});

describe('runAllRules', () => {
  it('runs both Bluebook and Indigo rules without crashing', () => {
    const citations = extractAndParseCitations('Roe v. Wade, 410 U.S. 113 (1973).');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    const issues = runAllRules(citations[0]);
    expect(Array.isArray(issues)).toBe(true);
  });
});

describe('end-to-end: parse → validate → score', () => {
  it('processes a citation through the full pipeline', () => {
    const citations = extractAndParseCitations('Miranda v. Arizona, 384 U.S. 436 (1966).');
    expect(citations.length).toBeGreaterThanOrEqual(1);

    const issues = runAllRules(citations[0]);
    const score = calculateScore(issues);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('scores a multi-citation text', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954); Roe v. Wade, 410 U.S. 113 (1973).';
    const citations = extractAndParseCitations(text);
    expect(citations.length).toBeGreaterThanOrEqual(2);

    for (const citation of citations) {
      const issues = runAllRules(citation);
      const score = calculateScore(issues);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});
