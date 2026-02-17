import { describe, it, expect } from 'vitest';
import { extractAndParseCitations } from '../index.js';
import type { RestatementComponents } from '@legalcitation/shared';

describe('Restatement citation detection and parsing', () => {
  it('parses a basic Restatement (Second) of Torts', () => {
    const results = extractAndParseCitations(
      'Restatement (Second) of Torts § 402A (Am. L. Inst. 1965).'
    );
    const restResults = results.filter(r => r.type === 'restatement');
    expect(restResults.length).toBeGreaterThanOrEqual(1);
    const comp = restResults[0].components as RestatementComponents;
    expect(comp.series).toBe('Second');
    expect(comp.subject).toBe('Torts');
    expect(comp.section).toBe('402A');
    expect(comp.year).toBe('1965');
  });

  it('parses a Restatement with comment pinpoint', () => {
    const results = extractAndParseCitations(
      'Restatement (Third) of Torts: Liability for Physical and Emotional Harm § 7 cmt. a (Am. L. Inst. 2010).'
    );
    const restResults = results.filter(r => r.type === 'restatement');
    expect(restResults.length).toBeGreaterThanOrEqual(1);
    const comp = restResults[0].components as RestatementComponents;
    expect(comp.series).toBe('Third');
    expect(comp.pinCite).toContain('cmt.');
  });

  it('parses a Restatement with illustration pinpoint', () => {
    const results = extractAndParseCitations(
      'Restatement (Second) of Contracts § 90 illus. 3 (Am. L. Inst. 1981).'
    );
    const restResults = results.filter(r => r.type === 'restatement');
    expect(restResults.length).toBeGreaterThanOrEqual(1);
    const comp = restResults[0].components as RestatementComponents;
    expect(comp.subject).toBe('Contracts');
    expect(comp.pinCite).toContain('illus.');
  });

  it('parses a Restatement without organization', () => {
    const results = extractAndParseCitations(
      'Restatement (Second) of Torts § 282 (1965).'
    );
    const restResults = results.filter(r => r.type === 'restatement');
    expect(restResults.length).toBeGreaterThanOrEqual(1);
    const comp = restResults[0].components as RestatementComponents;
    expect(comp.year).toBe('1965');
  });

  it('detects restatement citations in text', () => {
    const results = extractAndParseCitations(
      'The standard is set forth in Restatement (Third) of Agency § 2.01 (Am. L. Inst. 2006).'
    );
    const restResults = results.filter(r => r.type === 'restatement');
    expect(restResults.length).toBeGreaterThanOrEqual(1);
  });
});
