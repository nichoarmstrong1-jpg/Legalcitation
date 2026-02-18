import { VALID_REPORTER_ABBREVIATIONS } from '@legalcitation/shared';

/**
 * Citation span detected in text — raw position and text.
 */
export interface DetectedSpan {
  text: string;
  start: number;
  end: number;
  type: 'full_case' | 'short_case' | 'id' | 'supra' | 'infra' | 'statute' | 'constitution' | 'regulation' | 'article' | 'book' | 'restatement' | 'internet' | 'ai_source' | 'unpublished' | 'unknown';
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
  const normalizedText = normalizeTextForDetection(text);
  const spans: DetectedSpan[] = [];

  // 1. Detect Id. citations
  detectIdCitations(normalizedText, spans);

  // 2. Detect supra citations
  detectSupraCitations(normalizedText, spans);

  // 2b. Detect infra citations
  detectInfraCitations(normalizedText, spans);

  // 3. Detect full case citations (anchored on reporter abbreviation)
  detectFullCaseCitations(normalizedText, spans);

  // 4. Detect short form case citations (Party, Vol Rep at Page)
  detectShortCaseCitations(normalizedText, spans);

  // 5. Detect statute citations
  detectStatuteCitations(normalizedText, spans);

  // 6. Detect constitution citations
  detectConstitutionCitations(normalizedText, spans);

  // 7. Detect regulation citations (C.F.R.)
  detectRegulationCitations(normalizedText, spans);

  // 8. Detect restatement citations
  detectRestatementCitations(normalizedText, spans);

  // 9. Detect article/journal citations
  detectArticleCitations(normalizedText, spans);

  // 10. Detect book/treatise citations
  detectBookCitations(normalizedText, spans);

  // 11. Detect internet/electronic source citations
  detectInternetCitations(normalizedText, spans);

  // 12. Detect AI-generated content citations
  detectAiCitations(normalizedText, spans);

  // 13. Detect unpublished/forthcoming citations
  detectUnpublishedCitations(normalizedText, spans);

  // Remove overlapping spans (keep the longer/first one)
  return deduplicateSpans(spans);
}

function normalizeTextForDetection(text: string): string {
  // Keep string length stable so span offsets remain valid.
  let normalized = text.replace(/\r\n?/g, '\n');

  // Join hard-wrapped citation lines common in appellate briefs/OCR dumps.
  normalized = normalized.replace(
    /([A-Za-z0-9.,;:)\]])\n(?=[A-Za-z0-9([{"'])/g,
    '$1 '
  );

  // Remove TOA dot-leader page locators from citation matching, preserving offsets.
  normalized = normalized.replace(
    /\.{3,}\s*(?:\d+(?:\s*,\s*\d+)*|passim)\b/gi,
    (match) => ' '.repeat(match.length)
  );

  return normalized;
}

function pushTrimmedSpan(
  spans: DetectedSpan[],
  text: string,
  start: number,
  end: number,
  type: DetectedSpan['type']
): void {
  let safeStart = Math.max(0, Math.min(start, text.length));
  let safeEnd = Math.max(safeStart, Math.min(end, text.length));

  while (safeStart < safeEnd && /\s/.test(text[safeStart])) safeStart++;
  while (safeEnd > safeStart && /\s/.test(text[safeEnd - 1])) safeEnd--;

  if (safeEnd <= safeStart) return;

  spans.push({
    text: text.slice(safeStart, safeEnd),
    start: safeStart,
    end: safeEnd,
    type,
  });
}

function detectIdCitations(text: string, spans: DetectedSpan[]): void {
  // Match Id. or id. with optional pincite
  // Also handle *Id.* with formatting markers (stripped at API level, but also handle standalone)
  const idPattern = /\*?Id\.\*?\s*(?:at\s+\d[\d,\s–n.-]*|[§¶]\s*[\d.]+(?:\([a-zA-Z0-9]+\))*)?/gi;
  let match;
  while ((match = idPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'id');
  }
}

function detectSupraCitations(text: string, spans: DetectedSpan[]): void {
  // Match "Author, supra note X, at Y"
  const supraPattern = /\b([A-Z][a-zA-Z']+),?\s+supra\s+(?:note\s+\d+)?(?:,\s*at\s+\d[\d–-]*)?/g;
  let match;
  while ((match = supraPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'supra');
  }
}

function detectInfraCitations(text: string, spans: DetectedSpan[]): void {
  // Match "infra note X", "see infra note X", "infra Part III", "infra Section IV"
  const infraPattern = /\b(?:see\s+)?infra\s+(?:note\s+\d+(?:\s+and\s+accompanying\s+text)?|Part\s+[IVX\d]+|Section\s+[IVX\d]+|§\s*[\d.]+|text\s+accompanying\s+note(?:s)?\s+\d+(?:\s*[–-]\s*\d+)?)/gi;
  let match;
  while ((match = infraPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'infra');
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
    const lookbackDistance = 500;
    const textBefore = text.slice(Math.max(0, reporterStart - lookbackDistance), reporterStart);
    const lookbackBase = Math.max(0, reporterStart - lookbackDistance);

    // Compute the most recent sentence-like boundary before this reporter anchor
    // (excluding "v."), then prefer case-name matching after that boundary.
    const boundaryPattern = /(?<!\bv)[.;]\s+([A-Z])/g;
    let lastBoundary = -1;
    let boundaryMatch;
    while ((boundaryMatch = boundaryPattern.exec(textBefore)) !== null) {
      lastBoundary = boundaryMatch.index + boundaryMatch[0].length - 1;
    }
    // Find the case name by looking backward for party v. party pattern
    // Use [^;]+ after v. to handle commas in party names (e.g., "Burke Cnty., Ga.")
    // while stopping at semicolons which are citation boundaries
    const vPattern = /([A-Z][^.;]*?\s+v\.\s+[^;]+),\s*$/;
    const vMatch = textBefore.match(vPattern);
    const crossesPriorSentence =
      vMatch && vMatch.index !== undefined
        ? /\)\.\s+[A-Z][^,;]{1,120}\s+v\.?\s+/.test(textBefore.slice(vMatch.index))
        : false;

    if (vMatch && vMatch.index !== undefined && !crossesPriorSentence) {
      caseStart = lookbackBase + vMatch.index;
    } else {
      const searchableBefore = lastBoundary >= 0 ? textBefore.slice(lastBoundary) : textBefore;
      const searchableBase = lookbackBase + (lastBoundary >= 0 ? lastBoundary : 0);

      const vMatchAfterBoundary = searchableBefore.match(vPattern);
      if (vMatchAfterBoundary && vMatchAfterBoundary.index !== undefined) {
        caseStart = searchableBase + vMatchAfterBoundary.index;
      } else {
      // Also try "v " without period (lazy input)
      const vNoPeriodPattern = /([A-Z][^.;]*?\s+v\s+[^;]+),\s*$/;
      const vNoPeriodMatch = searchableBefore.match(vNoPeriodPattern);
      if (vNoPeriodMatch && vNoPeriodMatch.index !== undefined) {
        caseStart = searchableBase + vNoPeriodMatch.index;
      } else {
        // Try to find "In re", "Ex parte", "In the Matter of", "Estate of", "Guardianship of"
        const inRePattern = /((?:In re|Ex parte|Ex rel\.|In the Matter of|Estate of|Guardianship of)\s+[^,]+),\s*$/;
        const inReMatch = searchableBefore.match(inRePattern);
        if (inReMatch && inReMatch.index !== undefined) {
          caseStart = searchableBase + inReMatch.index;
        } else {
          if (lastBoundary >= 0) {
            caseStart = lookbackBase + lastBoundary;
          }
        }
      }
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
    const afterPattern = new RegExp(
      `^(?:,\\s*\\d[\\d–,\\s-]*)?` +
      `(?:,\\s*\\d{1,4}\\s+(?:${REPORTER_ALT})\\s+\\d{1,5}(?:,\\s*\\d[\\d–,\\s-]*)?)*` +
      `(?:\\s*n\\.\\d+)?\\s*\\([^)]+\\)(?:\\s*\\([^)]+\\))*` +
      `(?:\\s*,\\s*(?:aff'd|rev'd|cert\\.\\s*denied|vacated|modified|reh'g\\s*denied|reh'g\\s*en\\s*banc\\s*denied|aff'g|rev'g|remanded|aff'd\\s*in\\s*part|rev'd\\s*in\\s*part|overruled\\s*by|aff'd\\s*sub\\s*nom\\.|rev'd\\s*sub\\s*nom\\.|cert\\.\\s*dismissed)[^.;]*)*`
    );
    const afterMatch = textAfter.match(afterPattern);
    if (afterMatch) {
      caseEnd = reporterEnd + afterMatch[0].length;
    }

    // Include only an immediately adjacent trailing period.
    if (text[caseEnd] === '.') {
      caseEnd++;
    }

    pushTrimmedSpan(spans, text, caseStart, caseEnd, 'full_case');
  }
}

function detectShortCaseCitations(text: string, spans: DetectedSpan[]): void {
  // Pattern 1: Party, Vol Rep at Page (standard)
  const shortPattern = new RegExp(
    `([A-Z][a-zA-Z']+),?\\s*(\\d{1,4})\\s+(${REPORTER_ALT})\\s+at\\s+(\\d[\\d–,\\s-]*)`,
    'g'
  );
  let match;
  while ((match = shortPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'short_case');
  }
}

function detectStatuteCitations(text: string, spans: DetectedSpan[]): void {
  // Federal statutes: title U.S.C. § section or §§ section range
  const uscPattern = /\b(\d{1,2})\s+U\.S\.C\.?\s*§{1,2}\s*([\d\w]+(?:\([a-zA-Z0-9]+\))*)(?:\s*[–-]\s*\d+)?(?:\s*\([^)]+\))?/g;
  let match;
  while ((match = uscPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'statute');
  }

  // State codes (common pattern: State Code Ann. § section)
  const stateCodePattern = /\b([A-Z][a-z.]+(?:\s+[A-Z][a-z.]+)*)\s+(?:Code|Stat\.|Laws?)\s+(?:Ann\.\s+)?§{1,2}\s*[\d\w:.-]+(?:\s*[–-]\s*[\d\w]+)?(?:\s*\([^)]+\))?/g;
  while ((match = stateCodePattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'statute');
  }
}

function detectConstitutionCitations(text: string, spans: DetectedSpan[]): void {
  // U.S. Constitution
  const usConstPattern = /\bU\.S\.\s+Const\.\s+(?:art\.\s+[IVX]+|amend\.\s+[IVX]+\w*)(?:,\s*§\s*\d+)?(?:,\s*cl\.\s*\d+)?/gi;
  let match;
  while ((match = usConstPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'constitution');
  }

  // State constitutions
  const stateConstPattern = /\b[A-Z][a-z]+\.?\s+Const\.\s+(?:art\.\s+[IVX\d]+|§\s*\d+)/gi;
  while ((match = stateConstPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'constitution');
  }
}

function detectRegulationCitations(text: string, spans: DetectedSpan[]): void {
  // C.F.R.
  const cfrPattern = /\b(\d{1,2})\s+C\.F\.R\.?\s*§?\s*([\d.]+)\s*(?:\(([^)]+)\))?/g;
  let match;
  while ((match = cfrPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'regulation');
  }

  // Federal Register
  const fedRegPattern = /\b(\d{1,3})\s+Fed\.\s+Reg\.\s+([\d,]+)\s*(?:\(([^)]+)\))?/g;
  while ((match = fedRegPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'regulation');
  }
}

function detectRestatementCitations(text: string, spans: DetectedSpan[]): void {
  // Restatement (Series) of Subject § section (year)
  // Section numbers can be alphanumeric (e.g., 402A)
  const pattern = /\bRestatement\s+\((?:First|Second|Third|Fourth)\)\s+of\s+[A-Z][a-zA-Z\s:]+?\s*§+\s*[\dA-Za-z.]+(?:\([a-zA-Z0-9]+\))*(?:\s+cmt\.\s*[a-z])?(?:\s+illus\.\s*\d+)?\s*(?:\([^)]+\))+/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    let end = match.index + match[0].length;
    if (text[end] === '.') end++;
    pushTrimmedSpan(spans, text, match.index, end, 'restatement');
  }
}

function detectArticleCitations(text: string, spans: DetectedSpan[]): void {
  // Anchor on journal abbreviation patterns: "L. Rev.", "L.J.", "J.L.", etc.
  const journalAbbrevPattern = /\d{1,4}\s+[A-Z][a-zA-Z.]+(?:\s+[A-Z][a-zA-Z.]+)*\s+(?:L\.\s*(?:Rev|J|F|Q)|J\.\s*L|L\.\s*&\s*[A-Z]|Yale\s+L\.J\.|Harv\.\s+L\.\s*Rev\.|Stan\.\s+L\.\s*Rev\.|Colum\.\s+L\.\s*Rev\.)\.?\s+\d+/g;
  let match;
  while ((match = journalAbbrevPattern.exec(text)) !== null) {
    const anchorStart = match.index;
    const anchorEnd = match.index + match[0].length;

    // Expand backward to find author name
    const lookback = text.slice(Math.max(0, anchorStart - 300), anchorStart);
    const sentenceStarts = [...lookback.matchAll(/(?:^|(?<=[a-z]{4})[.]\s+|;\s+)(?=[A-Z])/g)];
    let citStart: number;
    if (sentenceStarts.length > 0) {
      const lastStart = sentenceStarts[sentenceStarts.length - 1];
      citStart = Math.max(0, anchorStart - 300) + (lastStart.index ?? 0) + lastStart[0].length;
    } else {
      citStart = Math.max(0, anchorStart - 200);
    }

    // Skip if it looks like a case citation (has "v.")
    const candidate = text.slice(citStart, anchorEnd);
    if (/\bv\.\s/.test(candidate)) continue;

    // Expand forward to find optional parenthetical (year)
    let citEnd = anchorEnd;
    const afterText = text.slice(anchorEnd, anchorEnd + 100);
    const yearParenMatch = afterText.match(/^\s*\(\d{4}\)/);
    if (yearParenMatch) {
      citEnd += yearParenMatch[0].length;
    }

    if (text[citEnd] === '.') citEnd++;

    pushTrimmedSpan(spans, text, citStart, citEnd, 'article');
  }
}

function detectBookCitations(text: string, spans: DetectedSpan[]): void {
  // Anchor on edition parenthetical: (Nth ed. YYYY) or (editor ed., YYYY) or (YYYY)
  const editionAnchor = /\((?:(?:[^)]*?ed\.\s*,?\s*)?[^)]*?\d{4})\)/g;
  let match;
  while ((match = editionAnchor.exec(text)) !== null) {
    const parenEnd = match.index + match[0].length;
    const lookback = text.slice(Math.max(0, match.index - 500), match.index);

    // Skip parentheticals that belong to other citation types
    if (/Working Paper|forthcoming|unpublished manuscript|dissertation|thesis/i.test(match[0])) continue;

    // Strategy: find sentence start, then check if it looks like a book citation
    // A book citation typically has: [Vol] Author, Title [page|§ section] (ed. year)
    // Require 4+ lowercase chars before period to avoid treating abbreviations as boundaries
    const sentenceStarts = [...lookback.matchAll(/(?:^|(?<=[a-z]{4})[.]\s+|;\s+)(?=\d?\s*[A-Z])/g)];
    let candidateStart = 0;
    if (sentenceStarts.length > 0) {
      const lastStart = sentenceStarts[sentenceStarts.length - 1];
      candidateStart = (lastStart.index ?? 0) + lastStart[0].length;
    }

    const candidate = lookback.slice(candidateStart);

    // Must have "Author, Title" pattern (comma separating author from title)
    // and a page number or section before the parenthetical
    const hasAuthorTitle = /[A-Z][a-zA-Z.'\s&]+,\s+[A-Z]/.test(candidate);
    const hasPageOrSection = /(?:§\s*[\dA-Za-z.]+|\d+(?:\s*[–-]\s*\d+)?)\s*$/.test(candidate);

    if (!hasAuthorTitle || !hasPageOrSection) continue;

    // Skip case citations and article citations
    const fullCandidate = candidate;
    if (/\bv\.\s/.test(fullCandidate)) continue;
    if (/\d+\s+(?:U\.S\.|F\.\d|S\.\s*Ct)/.test(fullCandidate)) continue;
    // Skip if it looks like an article (journal abbreviation pattern before page)
    if (/\d+\s+[A-Z][a-z]+\.\s+L\.\s+Rev\.\s+\d+/.test(fullCandidate)) continue;

    const bookStart = Math.max(0, match.index - 500) + candidateStart;
    let end = parenEnd;
    if (text[end] === '.') end++;
    pushTrimmedSpan(spans, text, bookStart, end, 'book');
  }
}

function detectInternetCitations(text: string, spans: DetectedSpan[]): void {
  // Anchor on URLs
  const urlPattern = /https?:\/\/[^\s)\]]+/g;
  let match;
  while ((match = urlPattern.exec(text)) !== null) {
    const urlStart = match.index;
    let urlEnd = urlStart + match[0].length;

    // Check for archive URL in brackets after
    const afterUrl = text.slice(urlEnd, urlEnd + 200);
    const archiveMatch = afterUrl.match(/^\s*\[https?:\/\/[^\]]+\]/);
    if (archiveMatch) {
      urlEnd += archiveMatch[0].length;
    }

    // Check for trailing parenthetical: (last visited ...)
    const afterArchive = text.slice(urlEnd, urlEnd + 200);
    const lastVisitedMatch = afterArchive.match(/^\s*\(last visited\s+[^)]+\)/);
    if (lastVisitedMatch) {
      urlEnd += lastVisitedMatch[0].length;
    }

    // Check for archive URL AFTER last visited (alternative ordering)
    if (!archiveMatch) {
      const afterLv = text.slice(urlEnd, urlEnd + 200);
      const lateArchiveMatch = afterLv.match(/^\s*\[https?:\/\/[^\]]+\]/);
      if (lateArchiveMatch) {
        urlEnd += lateArchiveMatch[0].length;
      }
    }

    // Expand backward to find author, title, website before URL
    const lookback = text.slice(Math.max(0, urlStart - 500), urlStart);
    // Find start of citation: look for sentence boundary or semicolon
    const boundaryPattern = /[.;]\s+([A-Z])/g;
    let lastBoundary = -1;
    let bMatch;
    while ((bMatch = boundaryPattern.exec(lookback)) !== null) {
      lastBoundary = bMatch.index + bMatch[0].length - 1;
    }

    let citStart: number;
    if (lastBoundary >= 0) {
      citStart = Math.max(0, urlStart - 500) + lastBoundary;
    } else {
      citStart = Math.max(0, urlStart - 200);
    }

    // Skip if this looks like it's part of a case or statute citation
    const candidateText = text.slice(citStart, urlStart);
    if (/\bv\.\s/.test(candidateText) || /\bU\.S\.C\./.test(candidateText)) continue;

    let end = urlEnd;
    if (text[end] === '.') end++;

    pushTrimmedSpan(spans, text, citStart, end, 'internet');
  }
}

function detectAiCitations(text: string, spans: DetectedSpan[]): void {
  // Detect LLM/search citations by model name + "(on file with"
  // Use sentence-boundary approach: find model name, expand to sentence boundaries
  const modelNames = ['ChatGPT', 'GPT-4o', 'GPT-4', 'GPT-3.5', 'Claude', 'Google Gemini Advanced', 'Google Gemini', 'Copilot', 'DALL-E 3', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Perplexity', 'Llama', 'Mistral', 'Bing'];
  const modelPattern = new RegExp(`\\b(?:${modelNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');

  let match;
  while ((match = modelPattern.exec(text)) !== null) {
    const modelPos = match.index;
    // Check if "(on file with" appears within ~300 chars after the model name
    const afterModel = text.slice(modelPos, modelPos + 500);
    const onFileMatch = afterModel.match(/\(on file with[^)]+\)/);
    if (!onFileMatch) continue;

    const onFileEnd = modelPos + (onFileMatch.index ?? 0) + onFileMatch[0].length;

    // Expand backward to sentence start
    const lookback = text.slice(Math.max(0, modelPos - 300), modelPos);
    // Find last sentence boundary — require 4+ lowercase before period to skip abbreviations
    const sentenceStarts = [...lookback.matchAll(/(?:^|(?<=[a-z]{4})[.]\s+|;\s+)(?=[A-Z])/g)];
    let citStart: number;
    if (sentenceStarts.length > 0) {
      const lastStart = sentenceStarts[sentenceStarts.length - 1];
      const offset = (lastStart.index ?? 0) + lastStart[0].length;
      citStart = Math.max(0, modelPos - 300) + offset;
    } else {
      citStart = Math.max(0, modelPos - 300);
    }

    let end = onFileEnd;
    if (text[end] === '.') end++;

    pushTrimmedSpan(spans, text, citStart, end, 'ai_source');
  }

  // Detect "(generated by MODEL)" parentheticals
  const generatedByPattern = /[^.]*?\(generated by\s+(?:ChatGPT|GPT-4o?|Claude|DALL-E(?:\s+3)?|Midjourney|Stable Diffusion|[A-Z][a-zA-Z\s]+?)\)\.?/g;
  while ((match = generatedByPattern.exec(text)) !== null) {
    pushTrimmedSpan(spans, text, match.index, match.index + match[0].length, 'ai_source');
  }
}

function detectUnpublishedCitations(text: string, spans: DetectedSpan[]): void {
  // Detect "(forthcoming" in citations — these are articles, not unpublished
  const forthcomingPattern = /\(forthcoming\s+[^)]+\)/g;
  let match;
  while ((match = forthcomingPattern.exec(text)) !== null) {
    const parenEnd = match.index + match[0].length;
    // Expand backward to sentence start
    const lookback = text.slice(Math.max(0, match.index - 500), match.index);
    const sentenceStarts = [...lookback.matchAll(/(?:^|(?<=[a-z]{4})[.]\s+|;\s+)(?=[A-Z])/g)];
    let citStart: number;
    if (sentenceStarts.length > 0) {
      const lastStart = sentenceStarts[sentenceStarts.length - 1];
      citStart = Math.max(0, match.index - 500) + (lastStart.index ?? 0) + lastStart[0].length;
    } else {
      citStart = Math.max(0, match.index - 300);
    }
    let end = parenEnd;
    if (text[end] === '.') end++;
    pushTrimmedSpan(spans, text, citStart, end, 'article'); // forthcoming articles are still articles
  }

  // Detect "(unpublished manuscript)" — expand to sentence boundaries
  const manuscriptPattern = /\(unpublished manuscript\)/g;
  while ((match = manuscriptPattern.exec(text)) !== null) {
    const anchorPos = match.index;
    // Find the end including "(on file with ...)"
    const afterManuscript = text.slice(anchorPos + match[0].length, anchorPos + match[0].length + 200);
    let citEnd = anchorPos + match[0].length;
    const onFileMatch = afterManuscript.match(/^\s*\(on file with[^)]+\)/);
    if (onFileMatch) {
      citEnd += onFileMatch[0].length;
    }
    // Expand backward to sentence start
    const lookback = text.slice(Math.max(0, anchorPos - 500), anchorPos);
    const sentenceStarts = [...lookback.matchAll(/(?:^|(?<=[a-z]{4})[.]\s+|;\s+)(?=[A-Z])/g)];
    let citStart: number;
    if (sentenceStarts.length > 0) {
      const lastStart = sentenceStarts[sentenceStarts.length - 1];
      citStart = Math.max(0, anchorPos - 500) + (lastStart.index ?? 0) + lastStart[0].length;
    } else {
      citStart = Math.max(0, anchorPos - 300);
    }
    let end = citEnd;
    if (text[end] === '.') end++;
    pushTrimmedSpan(spans, text, citStart, end, 'unpublished');
  }

  // Detect "Working Paper No." — expand to sentence boundaries
  const workingPaperPattern = /Working Paper\s+No\.\s*\d+/g;
  while ((match = workingPaperPattern.exec(text)) !== null) {
    const anchorPos = match.index;
    // Find the closing parenthesis after "Working Paper No. N"
    const afterAnchor = text.slice(anchorPos, anchorPos + 200);
    const closeParen = afterAnchor.indexOf(')');
    const citEnd = closeParen >= 0 ? anchorPos + closeParen + 1 : anchorPos + match[0].length;
    // Expand backward to sentence start
    const lookback = text.slice(Math.max(0, anchorPos - 500), anchorPos);
    const sentenceStarts = [...lookback.matchAll(/(?:^|(?<=[a-z]{4})[.]\s+|;\s+)(?=[A-Z])/g)];
    let citStart: number;
    if (sentenceStarts.length > 0) {
      const lastStart = sentenceStarts[sentenceStarts.length - 1];
      citStart = Math.max(0, anchorPos - 500) + (lastStart.index ?? 0) + lastStart[0].length;
    } else {
      citStart = Math.max(0, anchorPos - 300);
    }
    let end = citEnd;
    if (text[end] === '.') end++;
    pushTrimmedSpan(spans, text, citStart, end, 'unpublished');
  }

  // Detect dissertations: "(Ph.D. dissertation" or "(LL.M. thesis" etc.
  const dissertationPattern = /\((?:Ph\.D\.\s+dissertation|LL\.M\.\s+thesis|S\.J\.D\.\s+dissertation|M\.A\.\s+thesis)[^)]*\)/g;
  while ((match = dissertationPattern.exec(text)) !== null) {
    const anchorPos = match.index;
    const afterDiss = text.slice(anchorPos + match[0].length, anchorPos + match[0].length + 200);
    let citEnd = anchorPos + match[0].length;
    const onFileMatch = afterDiss.match(/^\s*\(on file with[^)]+\)/);
    if (onFileMatch) {
      citEnd += onFileMatch[0].length;
    }
    const lookback = text.slice(Math.max(0, anchorPos - 500), anchorPos);
    const sentenceStarts = [...lookback.matchAll(/(?:^|(?<=[a-z]{4})[.]\s+|;\s+)(?=[A-Z])/g)];
    let citStart: number;
    if (sentenceStarts.length > 0) {
      const lastStart = sentenceStarts[sentenceStarts.length - 1];
      citStart = Math.max(0, anchorPos - 500) + (lastStart.index ?? 0) + lastStart[0].length;
    } else {
      citStart = Math.max(0, anchorPos - 300);
    }
    let end = citEnd;
    if (text[end] === '.') end++;
    pushTrimmedSpan(spans, text, citStart, end, 'unpublished');
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
