import { describe, it, expect } from 'vitest';
import {
  abbreviatePageRange,
  validatePageRange,
  validateFootnotePincite,
  markdownToHtml,
  markdownToPlain,
  formatCaseName,
  buildClipboardData,
} from '../index.js';

describe('abbreviatePageRange', () => {
  it('does not abbreviate two-digit numbers', () => {
    expect(abbreviatePageRange(10, 15)).toBe('10–15');
  });

  it('abbreviates three-digit numbers per R. 3.2(a)', () => {
    expect(abbreviatePageRange(102, 106)).toBe('102–06');
  });

  it('abbreviates four-digit numbers', () => {
    expect(abbreviatePageRange(1020, 1030)).toBe('1020–30');
  });

  it('retains at least last two digits', () => {
    expect(abbreviatePageRange(100, 102)).toBe('100–02');
  });

  it('returns start only if end <= start', () => {
    expect(abbreviatePageRange(200, 200)).toBe('200');
    expect(abbreviatePageRange(200, 100)).toBe('200');
  });

  it('handles different-length numbers', () => {
    expect(abbreviatePageRange(99, 102)).toBe('99–102');
  });
});

describe('validatePageRange', () => {
  it('validates a correctly abbreviated range', () => {
    const result = validatePageRange('102–06');
    expect(result.isValid).toBe(true);
    expect(result.startPage).toBe(102);
    expect(result.endPage).toBe(106);
  });

  it('detects an incorrectly abbreviated range', () => {
    const result = validatePageRange('102–106');
    expect(result.isValid).toBe(false);
    expect(result.corrected).toBe('102–06');
  });

  it('handles hyphen instead of en dash', () => {
    const result = validatePageRange('102-106');
    expect(result.isValid).toBe(false);
    expect(result.corrected).toBe('102–06');
  });

  it('passes through non-range strings', () => {
    const result = validatePageRange('42');
    expect(result.isValid).toBe(true);
  });
});

describe('validateFootnotePincite', () => {
  it('flags space after n.', () => {
    const result = validateFootnotePincite('199 n. 4');
    expect(result.isValid).toBe(false);
    expect(result.corrected).toBe('199 n.4');
  });

  it('accepts correct format', () => {
    const result = validateFootnotePincite('199 n.4');
    expect(result.isValid).toBe(true);
  });
});

describe('formatting utilities', () => {
  it('converts markdown italic to HTML <i> tags', () => {
    expect(markdownToHtml('*Brown v. Board*', 'italics')).toBe('<i>Brown v. Board</i>');
  });

  it('converts markdown italic to HTML <u> tags for underline', () => {
    expect(markdownToHtml('*Brown v. Board*', 'underline')).toBe('<u>Brown v. Board</u>');
  });

  it('strips markdown markers', () => {
    expect(markdownToPlain('*Brown v. Board*')).toBe('Brown v. Board');
  });

  it('wraps case name in italic markers', () => {
    expect(formatCaseName('Roe v. Wade')).toBe('*Roe v. Wade*');
  });

  it('builds clipboard data with both formats', () => {
    const data = buildClipboardData('*Roe v. Wade*, 410 U.S. 113 (1973)', 'italics');
    expect(data.html).toContain('<i>Roe v. Wade</i>');
    expect(data.plain).toContain('Roe v. Wade');
    expect(data.plain).not.toContain('*');
  });
});
