import { VALID_REPORTER_ABBREVIATIONS } from '@legalcitation/shared';

/**
 * Citation span detected in text — raw position and text.
 */
export interface DetectedSpan {
  text: string;
  start: number;
  end: number;
  type: 'full_case' | 'short_case' | 'id' | 'supra' | 'statute' | 'constitution' | 'regulation' | 'article' | 'book' | 'restatement' | 'internet' | 'ai_source' | 'unpublished' | 'unknown';
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

  // 8. Detect restatement citations
  detectRestatementCitations(text, spans);

  // 9. Detect book/treatise citations
  detectBookCitations(text, spans);

  // 10. Detect internet/electronic source citations
  detectInternetCitations(text, spans);

  // 11. Detect AI-generated content citations
  detectAiCitations(text, spans);

  // 12. Detect unpublished/forthcoming citations
  detectUnpublishedCitations(text, spans);

  // Remove overlapping spans (keep the longer/first one)
  return deduplicateSpans(spans);
}

function detectIdCitations(text: string, spans: DetectedSpan[]): void {
  // Match Id. or id. with optional pincite
  const idPattern = /\b(Id\.\s*(?:at\s+\d[\d,\s–\-n.]*|[§¶]\s*[\d.]+(?:\([a-zA-Z0-9]+\))*)?)/gi;
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
    const lookbackDistance = 500;
    const textBefore = text.slice(Math.max(0, reporterStart - lookbackDistance), reporterStart);

    // Find the case name by looking backward for party v. party pattern
    // Use [^;]+ after v. to handle commas in party names (e.g., "Burke Cnty., Ga.")
    // while stopping at semicolons which are citation boundaries
    const vPattern = /([A-Z][^.;]*?\s+v\.\s+[^;]+),\s*$/;
    const vMatch = textBefore.match(vPattern);
    if (vMatch && vMatch.index !== undefined) {
      caseStart = Math.max(0, reporterStart - lookbackDistance) + vMatch.index;
    } else {
      // Also try "v " without period (lazy input)
      const vNoPeriodPattern = /([A-Z][^.;]*?\s+v\s+[^;]+),\s*$/;
      const vNoPeriodMatch = textBefore.match(vNoPeriodPattern);
      if (vNoPeriodMatch && vNoPeriodMatch.index !== undefined) {
        caseStart = Math.max(0, reporterStart - lookbackDistance) + vNoPeriodMatch.index;
      } else {
        // Try to find "In re", "Ex parte", "In the Matter of", "Estate of", "Guardianship of"
        const inRePattern = /((?:In re|Ex parte|Ex rel\.|In the Matter of|Estate of|Guardianship of)\s+[^,]+),\s*$/;
        const inReMatch = textBefore.match(inRePattern);
        if (inReMatch && inReMatch.index !== undefined) {
          caseStart = Math.max(0, reporterStart - lookbackDistance) + inReMatch.index;
        } else {
          // Smarter boundary: find the last sentence terminator (. or ;) followed by a capital letter
          // Use negative lookbehind to skip "v." (not a sentence boundary)
          const boundaryPattern = /(?<!\bv)[.;]\s+([A-Z])/g;
          let lastBoundary = -1;
          let boundaryMatch;
          while ((boundaryMatch = boundaryPattern.exec(textBefore)) !== null) {
            lastBoundary = boundaryMatch.index + boundaryMatch[0].length - 1;
          }
          if (lastBoundary >= 0) {
            caseStart = Math.max(0, reporterStart - lookbackDistance) + lastBoundary;
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
    const afterPattern = /^(?:,\s*\d[\d–\-,\s]*)?(?:\s*n\.\d+)?\s*\([^)]+\)(?:\s*\([^)]+\))*(?:\s*,\s*(?:aff'd|rev'd|cert\.\s*denied|vacated|modified|reh'g\s*denied|reh'g\s*en\s*banc\s*denied|aff'g|rev'g|remanded|aff'd\s*in\s*part|rev'd\s*in\s*part|overruled\s*by|aff'd\s*sub\s*nom\.|rev'd\s*sub\s*nom\.|cert\.\s*dismissed)[^.;]*)*/;
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

function detectRestatementCitations(text: string, spans: DetectedSpan[]): void {
  // Restatement (Series) of Subject § section (year)
  // Section numbers can be alphanumeric (e.g., 402A)
  const pattern = /\bRestatement\s+\((?:First|Second|Third|Fourth)\)\s+of\s+[A-Z][a-zA-Z\s:]+?\s*§+\s*[\dA-Za-z.]+(?:\([a-zA-Z0-9]+\))*(?:\s+cmt\.\s*[a-z])?(?:\s+illus\.\s*\d+)?\s*(?:\([^)]+\))+/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    let end = match.index + match[0].length;
    if (text[end] === '.') end++;
    spans.push({
      text: text.slice(match.index, end).trim(),
      start: match.index,
      end,
      type: 'restatement',
    });
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
    const hasPageOrSection = /(?:§\s*[\dA-Za-z.]+|\d+(?:\s*[–\-]\s*\d+)?)\s*$/.test(candidate);

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
    spans.push({
      text: text.slice(bookStart, end).trim(),
      start: bookStart,
      end,
      type: 'book',
    });
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

    spans.push({
      text: text.slice(citStart, end).trim(),
      start: citStart,
      end,
      type: 'internet',
    });
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

    spans.push({
      text: text.slice(citStart, end).trim(),
      start: citStart,
      end,
      type: 'ai_source',
    });
  }

  // Detect "(generated by MODEL)" parentheticals
  const generatedByPattern = /[^.]*?\(generated by\s+(?:ChatGPT|GPT-4o?|Claude|DALL-E(?:\s+3)?|Midjourney|Stable Diffusion|[A-Z][a-zA-Z\s]+?)\)\.?/g;
  while ((match = generatedByPattern.exec(text)) !== null) {
    spans.push({
      text: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      type: 'ai_source',
    });
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
    spans.push({
      text: text.slice(citStart, end).trim(),
      start: citStart,
      end,
      type: 'article', // forthcoming articles are still articles
    });
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
    spans.push({
      text: text.slice(citStart, end).trim(),
      start: citStart,
      end,
      type: 'unpublished',
    });
  }

  // Detect "Working Paper No." — expand to sentence boundaries
  const workingPaperPattern = /Working Paper\s+No\.\s*\d+/g;
  while ((match = workingPaperPattern.exec(text)) !== null) {
    const anchorPos = match.index;
    // Find the closing parenthesis after "Working Paper No. N"
    const afterAnchor = text.slice(anchorPos, anchorPos + 200);
    const closeParen = afterAnchor.indexOf(')');
    let citEnd = closeParen >= 0 ? anchorPos + closeParen + 1 : anchorPos + match[0].length;
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
    spans.push({
      text: text.slice(citStart, end).trim(),
      start: citStart,
      end,
      type: 'unpublished',
    });
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
    spans.push({
      text: text.slice(citStart, end).trim(),
      start: citStart,
      end,
      type: 'unpublished',
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
