import { describe, it, expect } from 'vitest';
import { extractFootnoteCitations } from '../index.js';
import { parseInfraCitation, parseSupraCitation } from '../parsers/index.js';
import type { ShortFormComponents } from '@legalcitation/shared';

describe('extractFootnoteCitations', () => {
  it('parses basic numbered footnotes', () => {
    const input =
      '1. Brown v. Bd. of Educ., 347 U.S. 483 (1954).\n2. Id. at 490.';
    const footnotes = extractFootnoteCitations(input);

    expect(footnotes).toHaveLength(2);
    expect(footnotes[0].footnoteNumber).toBe(1);
    expect(footnotes[0].citations.length).toBeGreaterThanOrEqual(1);
    expect(footnotes[0].citations[0].footnoteContext).toBeDefined();
    expect(footnotes[0].citations[0].footnoteContext!.footnoteNumber).toBe(1);

    expect(footnotes[1].footnoteNumber).toBe(2);
    expect(footnotes[1].citations.length).toBeGreaterThanOrEqual(1);
    expect(footnotes[1].citations[0].footnoteContext).toBeDefined();
    expect(footnotes[1].citations[0].footnoteContext!.footnoteNumber).toBe(2);
  });

  it('parses multiple citations in one footnote', () => {
    const input =
      '1. Brown, 347 U.S. at 490; Plessy v. Ferguson, 163 U.S. 537 (1896).';
    const footnotes = extractFootnoteCitations(input);

    expect(footnotes).toHaveLength(1);
    expect(footnotes[0].citations.length).toBeGreaterThanOrEqual(2);

    const first = footnotes[0].citations[0];
    const second = footnotes[0].citations[1];

    expect(first.footnoteContext!.positionInFootnote).toBe(0);
    expect(first.footnoteContext!.totalInFootnote).toBe(
      footnotes[0].citations.length
    );

    expect(second.footnoteContext!.positionInFootnote).toBe(1);
    expect(second.footnoteContext!.totalInFootnote).toBe(
      footnotes[0].citations.length
    );
  });

  it('parses footnotes with period-style numbers', () => {
    const withPeriod = extractFootnoteCitations(
      '1. Brown v. Bd. of Educ., 347 U.S. 483 (1954).'
    );
    const withoutPeriod = extractFootnoteCitations(
      '1 Brown v. Bd. of Educ., 347 U.S. 483 (1954).'
    );

    expect(withPeriod.length).toBeGreaterThanOrEqual(1);
    expect(withoutPeriod.length).toBeGreaterThanOrEqual(1);
    expect(withPeriod[0].footnoteNumber).toBe(1);
    expect(withoutPeriod[0].footnoteNumber).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(extractFootnoteCitations('')).toEqual([]);
  });

  it('returns empty array for input with no footnote-style numbering', () => {
    const input =
      'This is just a regular paragraph with no numbered footnotes.';
    expect(extractFootnoteCitations(input)).toEqual([]);
  });
});

describe('parseInfraCitation', () => {
  const defaultPosition = { start: 0, end: 0 };

  it('parses "infra note 45"', () => {
    const result = parseInfraCitation('infra note 45', defaultPosition);

    expect(result).not.toBeNull();
    expect(result!.type).toBe('infra');
    const comp = result!.components as ShortFormComponents;
    expect(comp.infraNoteNumber).toBe(45);
  });

  it('parses "see infra note 12"', () => {
    const result = parseInfraCitation('see infra note 12', defaultPosition);

    expect(result).not.toBeNull();
    expect(result!.type).toBe('infra');
    const comp = result!.components as ShortFormComponents;
    expect(comp.infraNoteNumber).toBe(12);
  });

  it('parses "infra Part III" with no infraNoteNumber', () => {
    const result = parseInfraCitation('infra Part III', defaultPosition);

    expect(result).not.toBeNull();
    expect(result!.type).toBe('infra');
    const comp = result!.components as ShortFormComponents;
    expect(comp.infraNoteNumber).toBeUndefined();
  });

  it('returns null for non-infra text', () => {
    expect(
      parseInfraCitation('Brown v. Board of Education', defaultPosition)
    ).toBeNull();
    expect(
      parseInfraCitation('just some regular text', defaultPosition)
    ).toBeNull();
  });
});

describe('parseSupraCitation — note number extraction', () => {
  const defaultPosition = { start: 0, end: 0 };

  it('extracts supraNoteNumber from "Smith, supra note 5, at 200."', () => {
    const result = parseSupraCitation(
      'Smith, supra note 5, at 200.',
      defaultPosition
    );

    expect(result).not.toBeNull();
    expect(result!.type).toBe('supra');
    const comp = result!.components as ShortFormComponents;
    expect(comp.supraNoteNumber).toBe(5);
    expect(comp.pinCite).toBe('200');
  });
});
