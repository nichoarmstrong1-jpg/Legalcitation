import { describe, it, expect } from 'vitest';
import { abbreviateJournalTitle, lookupJournal } from '../utils/journal-abbreviator.js';

describe('abbreviateJournalTitle', () => {
  it('abbreviates Harvard Law Review', () => {
    expect(abbreviateJournalTitle('Harvard Law Review')).toBe('Harv. L. Rev.');
  });

  it('abbreviates Yale Law Journal with closed-up single capitals', () => {
    const result = abbreviateJournalTitle('Yale Law Journal');
    expect(result).toBe('Yale L.J.');
  });

  it('abbreviates University of Chicago Law Review via word-level rules', () => {
    const result = abbreviateJournalTitle('University of Chicago Law Review');
    // Word-level T6: "University" → "Univ.", "Chicago" stays, "Law" → "L.", "Review" → "Rev."
    // "of" is an omit word
    expect(result).toBe('Univ. Chicago L. Rev.');
  });

  it('lookupJournal returns known abbreviation for University of Chicago Law Review', () => {
    const result = lookupJournal('University of Chicago Law Review');
    expect(result).not.toBeNull();
    expect(result!.abbreviation).toBe('U. Chi. L. Rev.');
    expect(result!.source).toBe('known');
  });

  it('omits articles and prepositions (a, an, of, the, in, etc.)', () => {
    const result = abbreviateJournalTitle('Journal of the American Bar Association');
    // "of" and "the" should be omitted
    expect(result).not.toContain(' of ');
    expect(result).not.toContain(' the ');
  });

  it('preserves "&" in abbreviations', () => {
    const result = abbreviateJournalTitle('Law & Society Review');
    expect(result).toContain('&');
  });

  it('handles a journal with no abbreviations gracefully', () => {
    const result = abbreviateJournalTitle('Yale');
    // Single word that has no abbreviation stays as-is
    expect(result).toBe('Yale');
  });

  it('abbreviates state names via T10', () => {
    const result = abbreviateJournalTitle('Pennsylvania Law Review');
    expect(result).toContain('Pa.');
  });

  it('abbreviates multi-word institutional names from T13', () => {
    const result = abbreviateJournalTitle('George Washington Law Review');
    expect(result).toContain('Geo.');
    expect(result).toContain('Wash.');
  });
});

describe('lookupJournal', () => {
  it('finds a known journal by full name (case-insensitive)', () => {
    const result = lookupJournal('Harvard Law Review');
    expect(result).not.toBeNull();
    expect(result!.abbreviation).toBe('Harv. L. Rev.');
    expect(result!.source).toBe('known');
  });

  it('finds a known journal by abbreviation (reverse lookup)', () => {
    const result = lookupJournal('Harv. L. Rev.');
    expect(result).not.toBeNull();
    expect(result!.fullName).toBe('Harvard Law Review');
    expect(result!.source).toBe('known');
  });

  it('generates a T6 abbreviation for an unknown journal', () => {
    const result = lookupJournal('Fictional University Law Review');
    expect(result).not.toBeNull();
    expect(result!.source).toBe('T6_generated');
    expect(result!.abbreviation).toContain('L. Rev.');
  });

  it('returns null for empty input', () => {
    expect(lookupJournal('')).toBeNull();
    expect(lookupJournal('   ')).toBeNull();
  });

  it('returns null for a single non-abbreviatable word', () => {
    expect(lookupJournal('Xyzzy')).toBeNull();
  });

  it('case-insensitive full name lookup', () => {
    const result = lookupJournal('harvard law review');
    expect(result).not.toBeNull();
    expect(result!.abbreviation).toBe('Harv. L. Rev.');
  });
});
