/**
 * Bluebook Rule 3.3 — Section and Subsection Range Validation
 *
 * Validates formatting of section (§) and paragraph (¶) ranges per R. 3.3.
 * Three punctuation-dependent rules for consecutive section ranges:
 *   1. No punctuation: retain all digits (§§ 1874–1875)
 *   2. Period/colon: omit repetitious digits before final punctuation (§§ 284.15–.16)
 *   3. Hyphen: use "to" instead of en dash (§§ 320-45-16 to -17)
 */

export type SectionPunctuationType = 'none' | 'period' | 'colon' | 'hyphen';

/**
 * Detect the internal punctuation type of a section number.
 */
export function detectSectionPunctuation(sectionNumber: string): SectionPunctuationType {
  if (sectionNumber.includes('-')) return 'hyphen';
  if (sectionNumber.includes('.')) return 'period';
  if (sectionNumber.includes(':')) return 'colon';
  return 'none';
}

/**
 * R. 3.3(b): Validate a consecutive section range.
 * Returns { isValid, corrected, punctuationType }.
 */
export function validateSectionRange(rangeText: string): {
  isValid: boolean;
  corrected: string;
  punctuationType: SectionPunctuationType;
  issues: string[];
} {
  const issues: string[] = [];
  const trimmed = rangeText.trim();

  // Check for "to" separator (hyphenated sections)
  const toMatch = trimmed.match(/^([\d\w.:-]+)\s+to\s+([-.\d\w:]+)$/);
  if (toMatch) {
    const [, start, end] = toMatch;
    const punctType = detectSectionPunctuation(start);

    if (punctType !== 'hyphen') {
      issues.push(`Use an en dash instead of "to" for sections with ${punctType || 'no'} punctuation.`);
      return { isValid: false, corrected: `${start}–${end}`, punctuationType: punctType, issues };
    }
    return { isValid: true, corrected: trimmed, punctuationType: 'hyphen', issues };
  }

  // Check for en dash or hyphen separator
  const dashMatch = trimmed.match(/^([\d\w.:-]+)\s*[–—]\s*([\d\w.:-]+)$/);
  if (!dashMatch) {
    return { isValid: true, corrected: trimmed, punctuationType: 'none', issues };
  }

  const [, start, end] = dashMatch;
  const punctType = detectSectionPunctuation(start);

  if (punctType === 'hyphen') {
    // Hyphenated section numbers must use "to" not en dash
    issues.push('Sections with hyphens must use "to" instead of an en dash to avoid ambiguity.');
    const corrected = `${start} to ${end}`;
    return { isValid: false, corrected, punctuationType: 'hyphen', issues };
  }

  if (punctType === 'none') {
    // No punctuation: retain ALL digits — validate end is not abbreviated
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    if (!isNaN(startNum) && !isNaN(endNum) && end.length < start.length) {
      issues.push('Section numbers without punctuation must retain all digits in ranges.');
      return { isValid: false, corrected: `${start}–${endNum}`, punctuationType: 'none', issues };
    }
  }

  // Period or colon: can abbreviate — omit repetitious digits before final punctuation
  // This is valid either abbreviated or full, so we don't flag it as an error
  return { isValid: true, corrected: trimmed, punctuationType: punctType, issues };
}

/**
 * R. 3.3(a): Validate subsection format.
 * Subsections must be appended in parentheses without spaces: § 1874(b)(2)
 */
export function validateSubsectionFormat(text: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for space before parenthetical subsection: "§ 1874 (b)" should be "§ 1874(b)"
  if (/[§¶]\s*[\d\w.:/-]+\s+\([a-zA-Z0-9]+\)/.test(text)) {
    issues.push('No space between section number and subsection parenthetical.');
  }

  // Check for space between subsection parts: "(b) (2)" should be "(b)(2)"
  if (/\([a-zA-Z0-9]+\)\s+\([a-zA-Z0-9]+\)/.test(text)) {
    issues.push('No space between consecutive subsection parentheticals.');
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * R. 3.3: Validate section symbol usage.
 * - Single section: § (one symbol)
 * - Multiple sections: §§ (two symbols)
 * Same rules apply for paragraph symbols: ¶ / ¶¶
 */
export function validateSectionSymbolCount(text: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if text has multiple sections but only one § symbol
  // Pattern: § followed by a range (en dash, comma, or "to")
  const singleSectionWithRange = /(?<![§])§(?!§)\s*[\d\w.:-]+\s*[–,]|(?<![§])§(?!§)\s*[\d\w.:-]+\s+to\s/;
  if (singleSectionWithRange.test(text)) {
    issues.push('Use §§ (double section symbol) when citing multiple sections.');
  }

  // Check for ¶ with ranges
  const singleParaWithRange = /(?<![¶])¶(?!¶)\s*[\d\w.:-]+\s*[–,]|(?<![¶])¶(?!¶)\s*[\d\w.:-]+\s+to\s/;
  if (singleParaWithRange.test(text)) {
    issues.push('Use ¶¶ (double paragraph symbol) when citing multiple paragraphs.');
  }

  // Check for §§ with only a single section (no range)
  // Be careful not to flag consecutive subsections which use one §
  const doubleSectionNoRange = /§§\s*[\d\w.:-]+(?:\([a-zA-Z0-9]+\))*\s*(?!\s*[–,]|\s+to\s)/;
  if (doubleSectionNoRange.test(text) && !/§§\s*[\d\w.:-]+\s*[–,]/.test(text) && !/§§\s*[\d\w.:-]+\s+to\s/.test(text)) {
    // Only flag if there's truly no range indicator
    const hasRange = /§§\s*[\d\w.:-]+(?:\([a-zA-Z0-9]+\))*\s*(?:[–,]|\s+to\s)/.test(text);
    if (!hasRange) {
      issues.push('Use § (single section symbol) when citing only one section. Use §§ only for multiple sections.');
    }
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * R. 3.3: Check that consecutive subsections of a SINGLE section use ONE symbol.
 * § 1874(b)–(c) is correct (one §, two subsections)
 * §§ 1874(b)–(c) is WRONG (should be one §)
 */
export function validateConsecutiveSubsections(text: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Pattern: §§ followed by section number then subsection range
  const doubleSymbolSubsectionRange = /§§\s*[\d\w.:-]+\([a-zA-Z0-9]+\)\s*[–-]\s*\([a-zA-Z0-9]+\)/;
  if (doubleSymbolSubsectionRange.test(text)) {
    issues.push('Use one § symbol for consecutive subsections of a single section (e.g., § 1874(b)–(c)).');
  }

  // Same for paragraphs
  const doubleParaSubsectionRange = /¶¶\s*[\d\w.:-]+\([a-zA-Z0-9]+\)\s*[–-]\s*\([a-zA-Z0-9]+\)/;
  if (doubleParaSubsectionRange.test(text)) {
    issues.push('Use one ¶ symbol for consecutive subparagraphs of a single paragraph.');
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validate that there is a space between section/paragraph symbol and number.
 */
export function validateSymbolSpacing(text: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // § immediately followed by digit with no space
  if (/§\d/.test(text) && !/§§/.test(text.replace(/§\d/g, ''))) {
    // Be careful: §§ followed by digit is fine
    if (/(?<![§])§\d/.test(text)) {
      issues.push('Include a space between the section symbol (§) and the section number.');
    }
  }

  // §§ immediately followed by digit with no space
  if (/§§\d/.test(text)) {
    issues.push('Include a space between §§ and the section number.');
  }

  // ¶ immediately followed by digit with no space
  if (/(?<![¶])¶\d/.test(text)) {
    issues.push('Include a space between the paragraph symbol (¶) and the paragraph number.');
  }

  if (/¶¶\d/.test(text)) {
    issues.push('Include a space between ¶¶ and the paragraph number.');
  }

  return { isValid: issues.length === 0, issues };
}
