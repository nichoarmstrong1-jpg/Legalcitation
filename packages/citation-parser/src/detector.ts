import { VALID_REPORTER_ABBREVIATIONS } from '@legalcitation/shared';

/**
 * Citation span detected in text — raw position and text.
 */
export interface DetectedSpan {
  text: string;
  start: number;
  end: number;
  type: 'full_case' | 'short_case' | 'id' | 'supra' | 'statute' | 'constitution' | 'regulation' | 'article' | 'unknown';
}

// Build regex alternation from reporter abbreviations (escape dots)
const reporterAltParts = Array.from(VALID_REPORTER_ABBREVIATIONS)
  .sort((a, b) => b.length - a.length)
  .map(r => r.replace(/\./g, '\\.').replace(/'/g, "\\'"));
const REPORTER_ALT = reporterAltParts.join('|');

/**
 * Detect all citation spans in a block of legal text.
 * Uses anchor-based detection: find reporter abbreviations or known
 * patterns, then expand boundaries to capture the full citation.
 */
export function detectCitations(text: string): DetectedSpan[] {
  const spans: DetectedSpan[] = [];

  // 1. Detect Id. citations
  detectIdCitations(text, spans);

  // 2. Detect supra citations
  detectSupraCitations(text, spans);

  // 3. Detect full case citations (anchored on reporter abbreviation)
  detectFullCaseCitations(text, spans);

  // 4. Detect short form case citations (Party, Vol Rep at Page)
  detectShortCaseCitations(text, spans);

  // 5. Detect statute citations
  detectStatuteCitations(text, spans);

  // 6. Detect constitution citations
  detectConstitutionCitations(text, spans);

  // 7. Detect regulation citations (C.F.R.)
  detectRegulationCitations(text, spans);

  // Remove overlapping spans (keep the longer/first one)
  return deduplicateSpans(spans);
}

function detectIdCitations(text: string, spans: DetectedSpan[]): void {
  // Match Id. or id. with optional pincite
  const idPattern = /\b(Id\.\s*(?:at\s+\d[\d,\s–\-n.]*)?)/gi;
  let match;
  while ((match = idPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].trim().length,
      type: 'id',
    });
  }
}

function detectSupraCitations(text: string, spans: DetectedSpan[]): void {
  // Match "Author, supra note X, at Y"
  const supraPattern = /\b([A-Z][a-zA-Z']+),?\s+supra\s+(?:note\s+\d+)?(?:,\s*at\s+\d[\d–\-]*)?/g;
  let match;
  while ((match = supraPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].trim().length,
      type: 'supra',
    });
  }
}

function detectFullCaseCitations(text: string, spans: DetectedSpan[]): void {
  // Strategy: find reporter abbreviation, then expand backward to find
  // the case name and forward to find the date parenthetical.
  const reporterRegex = new RegExp(`\\b(\\d{1,4})\\s+(${REPORTER_ALT})\\s+(\\d{1,5})`, 'g');
  let match;

  while ((match = reporterRegex.exec(text)) !== null) {
    const reporterStart = match.index;
    const reporterEnd = match.index + match[0].length;

    // Expand backward to find case name (look for the start of the sentence
    // or the last period/semicolon before a capital letter + " v. ")
    let caseStart = reporterStart;
    const textBefore = text.slice(Math.max(0, reporterStart - 300), reporterStart);

    // Find the case name by looking backward for party v. party pattern
    const vPattern = /([A-Z][^.;]*?\s+v\.\s+[^,]+),\s*$/;
    const vMatch = textBefore.match(vPattern);
    if (vMatch && vMatch.index !== undefined) {
      caseStart = Math.max(0, reporterStart - 300) + vMatch.index;
    } else {
      // Try to find "In re" or "Ex parte" patterns
      const inRePattern = /((?:In re|Ex parte|Ex rel\.)\s+[^,]+),\s*$/;
      const inReMatch = textBefore.match(inRePattern);
      if (inReMatch && inReMatch.index !== undefined) {
        caseStart = Math.max(0, reporterStart - 300) + inReMatch.index;
      }
    }

    // Strip leading citation signals from the detected span
    let detectedText = text.slice(caseStart, reporterStart);
    const signalPrefixes = /^(?:See also|See,?\s*e\.g\.,?|See|Cf\.|But see|But cf\.|Accord|Compare|E\.g\.,|Contra)\s+/i;
    const sigMatch = detectedText.match(signalPrefixes);
    if (sigMatch) {
      caseStart += sigMatch[0].length;
    }
    // Strip textual "In " at start (but NOT "In re" or "In the Matter of")
    detectedText = text.slice(caseStart, reporterStart);
    if (/^In\s+(?!re\b|the\s+Matter)/i.test(detectedText)) {
      const inMatch = detectedText.match(/^In\s+/i);
      if (inMatch) {
        caseStart += inMatch[0].length;
      }
    }

    // Expand forward to find date parenthetical and any subsequent history
    let caseEnd = reporterEnd;
    const textAfter = text.slice(reporterEnd, reporterEnd + 500);

    // Look for optional pincite, then date parenthetical
    const afterPattern = /^(?:,\s*\d[\d–\-,\s]*)?(?:\s*n\.\d+)?\s*\([^)]+\)(?:\s*\([^)]+\))*(?:\s*,\s*(?:aff'd|rev'd|cert\.\s*denied|vacated|modified|reh'g\s*denied|aff'g|rev'g)[^.;]*)*/;
    const afterMatch = textAfter.match(afterPattern);
    if (afterMatch) {
      caseEnd = reporterEnd + afterMatch[0].length;
    }

    // Check for period at end (handle possible whitespace from Word paste)
    if (text[caseEnd] === '.') {
      caseEnd++;
    } else {
      const nextChars = text.slice(caseEnd, caseEnd + 5);
      const periodMatch = nextChars.match(/^\s*\./);
      if (periodMatch) {
        caseEnd += periodMatch[0].length;
      }
    }

    spans.push({
      text: text.slice(caseStart, caseEnd).trim(),
      start: caseStart,
      end: caseEnd,
      type: 'full_case',
    });
  }
}

function detectShortCaseCitations(text: string, spans: DetectedSpan[]): void {
  // Pattern: Party, Vol Rep at Page
  const shortPattern = new RegExp(
    `([A-Z][a-zA-Z']+),\\s*(\\d{1,4})\\s+(${REPORTER_ALT})\\s+at\\s+(\\d[\\d–\\-,\\s]*)`,
    'g'
  );
  let match;
  while ((match = shortPattern.exec(text)) !== null) {
    // Check if this overlaps with an already detected full case citation
    const start = match.index;
    const end = match.index + match[0].length;
    spans.push({
      text: match[0].trim(),
      start,
      end,
      type: 'short_case',
    });
  }
}

function detectStatuteCitations(text: string, spans: DetectedSpan[]): void {
  // Federal statutes: title U.S.C. § section
  const uscPattern = /\b(\d{1,2})\s+U\.S\.C\.?\s*§+\s*([\d\w]+(?:\([a-zA-Z0-9]+\))*)\s*(?:\(([^)]+)\))?/g;
  let match;
  while ((match = uscPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      type: 'statute',
    });
  }

  // State codes (common pattern: State Code Ann. § section)
  const stateCodePattern = /\b([A-Z][a-z.]+(?:\s+[A-Z][a-z.]+)*)\s+(?:Code|Stat\.|Laws?)\s+(?:Ann\.\s+)?§+\s*[\d\w:.-]+(?:\s*\([^)]+\))?/g;
  while ((match = stateCodePattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      type: 'statute',
    });
  }
}

function detectConstitutionCitations(text: string, spans: DetectedSpan[]): void {
  // U.S. Constitution
  const usConstPattern = /\bU\.S\.\s+Const\.\s+(?:art\.\s+[IVX]+|amend\.\s+[IVX]+\w*)(?:,\s*§\s*\d+)?(?:,\s*cl\.\s*\d+)?/gi;
  let match;
  while ((match = usConstPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      type: 'constitution',
    });
  }

  // State constitutions
  const stateConstPattern = /\b[A-Z][a-z]+\.?\s+Const\.\s+(?:art\.\s+[IVX\d]+|§\s*\d+)/gi;
  while ((match = stateConstPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      type: 'constitution',
    });
  }
}

function detectRegulationCitations(text: string, spans: DetectedSpan[]): void {
  // C.F.R.
  const cfrPattern = /\b(\d{1,2})\s+C\.F\.R\.?\s*§?\s*([\d.]+)\s*(?:\(([^)]+)\))?/g;
  let match;
  while ((match = cfrPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      type: 'regulation',
    });
  }

  // Federal Register
  const fedRegPattern = /\b(\d{1,3})\s+Fed\.\s+Reg\.\s+([\d,]+)\s*(?:\(([^)]+)\))?/g;
  while ((match = fedRegPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      type: 'regulation',
    });
  }
}

/**
 * Remove overlapping spans, preferring longer spans.
 */
function deduplicateSpans(spans: DetectedSpan[]): DetectedSpan[] {
  // Sort by start position, then by length (descending)
  spans.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  const result: DetectedSpan[] = [];
  let lastEnd = -1;

  for (const span of spans) {
    if (span.start >= lastEnd) {
      result.push(span);
      lastEnd = span.end;
    } else if (span.end > lastEnd) {
      // Overlapping but extends further — replace last if this one is larger
      const lastSpan = result[result.length - 1];
      if (lastSpan && (span.end - span.start) > (lastSpan.end - lastSpan.start)) {
        result[result.length - 1] = span;
        lastEnd = span.end;
      }
    }
  }

  return result;
}
