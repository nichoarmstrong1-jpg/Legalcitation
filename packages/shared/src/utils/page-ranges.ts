/**
 * Bluebook Rule 3.2(a) — Page Range Abbreviation
 *
 * For three or more digit page numbers, drop repetitious digits
 * except the final two digits.
 * Examples: 102-106 → 102–06, 1020-1030 → 1020–30
 */

/**
 * Abbreviate a page range per Bluebook R. 3.2(a).
 * Returns the abbreviated range string using an en dash.
 */
export function abbreviatePageRange(start: number, end: number): string {
  if (end <= start) return String(start);
  if (start < 100) return `${start}–${end}`;

  const startStr = String(start);
  const endStr = String(end);

  if (startStr.length !== endStr.length) return `${start}–${end}`;

  // Find the first position where digits differ
  let diffPos = 0;
  for (let i = 0; i < startStr.length; i++) {
    if (startStr[i] !== endStr[i]) {
      diffPos = i;
      break;
    }
  }

  // Always retain at least the last two digits
  const minRetain = endStr.length - 2;
  const retainFrom = Math.min(diffPos, minRetain);

  return `${start}–${endStr.slice(retainFrom)}`;
}

/**
 * Parse a page range string and check if it's properly abbreviated.
 * Returns { isValid, corrected } where corrected is the proper form.
 */
export function validatePageRange(rangeStr: string): {
  isValid: boolean;
  corrected: string;
  startPage: number;
  endPage: number;
} {
  // Normalize various dash types
  const normalized = rangeStr.replace(/\s*[-–—]\s*/, '–');
  const parts = normalized.split('–');

  if (parts.length !== 2) {
    return { isValid: true, corrected: rangeStr, startPage: 0, endPage: 0 };
  }

  const startStr = parts[0].trim();
  const endStr = parts[1].trim();
  const start = parseInt(startStr, 10);

  if (isNaN(start)) {
    return { isValid: true, corrected: rangeStr, startPage: 0, endPage: 0 };
  }

  // The end might be abbreviated already — expand it
  let end: number;
  if (endStr.length < startStr.length) {
    // Abbreviated end — reconstruct full number
    const prefix = startStr.slice(0, startStr.length - endStr.length);
    end = parseInt(prefix + endStr, 10);
  } else {
    end = parseInt(endStr, 10);
  }

  if (isNaN(end) || end <= start) {
    return { isValid: true, corrected: rangeStr, startPage: start, endPage: end };
  }

  const corrected = abbreviatePageRange(start, end);
  const isValid = normalized === corrected;

  return { isValid, corrected, startPage: start, endPage: end };
}

/**
 * Validate a footnote pincite format (e.g., "199 n.4")
 * Rule 3.2: no space between "n." and the footnote number
 */
export function validateFootnotePincite(text: string): {
  isValid: boolean;
  corrected: string;
} {
  // Check for "n. 4" (space after n.) — should be "n.4"
  const badPattern = /(\d+)\s+n\.\s+(\d+)/;
  const match = text.match(badPattern);
  if (match) {
    return {
      isValid: false,
      corrected: text.replace(badPattern, '$1 n.$2'),
    };
  }

  // Check for correct pattern
  const goodPattern = /\d+\s+n\.\d+/;
  if (goodPattern.test(text)) {
    return { isValid: true, corrected: text };
  }

  return { isValid: true, corrected: text };
}
