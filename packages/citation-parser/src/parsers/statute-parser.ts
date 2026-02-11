import { v4 as uuid } from 'uuid';
import type { ParsedCitation, StatuteComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse a statute citation into structured components.
 * Handles federal (U.S.C.) and state code citations.
 *
 * Federal format: Title U.S.C. § Section (Year)
 * State format: State Code Ann. § Section (Year)
 */
export function parseStatuteCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  // Try federal statute first
  const federal = parseFederalStatute(text);
  if (federal) {
    return {
      id: uuid(),
      rawText: text,
      type: 'statute',
      context,
      position,
      components: federal,
    };
  }

  // Try state statute
  const state = parseStateStatute(text);
  if (state) {
    return {
      id: uuid(),
      rawText: text,
      type: 'statute',
      context,
      position,
      components: state,
    };
  }

  return null;
}

function parseFederalStatute(text: string): StatuteComponents | null {
  // Pattern: title U.S.C. § section (year)
  const pattern = /^(\d{1,2})\s+U\.S\.C\.?\s*§+\s*([\d\w]+(?:\([a-zA-Z0-9]+\))*)\s*(?:\((\d{4})\))?\s*\.?$/;
  const match = text.match(pattern);
  if (!match) return null;

  return {
    title: match[1],
    code: 'U.S.C.',
    section: match[2],
    year: match[3],
  };
}

function parseStateStatute(text: string): StatuteComponents | null {
  // Generic pattern: Code Name § section (year)
  const pattern = /^(.+?)\s*§+\s*([\d\w:.-]+)\s*(?:\((\d{4})\))?\s*\.?$/;
  const match = text.match(pattern);
  if (!match) return null;

  // Extract title number if present
  const codeStr = match[1].trim();
  const titleMatch = codeStr.match(/^(\d+)\s+(.+)$/);

  return {
    title: titleMatch ? titleMatch[1] : '',
    code: titleMatch ? titleMatch[2] : codeStr,
    section: match[2],
    year: match[3],
  };
}

/**
 * Known federal code abbreviations per Bluebook
 */
export const FEDERAL_CODES: Record<string, string> = {
  'United States Code': 'U.S.C.',
  'U.S. Code': 'U.S.C.',
  'Public Law': 'Pub. L.',
  'Statutes at Large': 'Stat.',
};

/**
 * Common state code abbreviations (selected states)
 */
export const STATE_CODES: Record<string, string> = {
  'Alabama Code': 'Ala. Code',
  'Alaska Statutes': 'Alaska Stat.',
  'Arizona Revised Statutes': 'Ariz. Rev. Stat. Ann.',
  'California Civil Code': 'Cal. Civ. Code',
  'California Penal Code': 'Cal. Penal Code',
  'Colorado Revised Statutes': 'Colo. Rev. Stat.',
  'Connecticut General Statutes': 'Conn. Gen. Stat.',
  'Delaware Code': 'Del. Code Ann.',
  'Florida Statutes': 'Fla. Stat.',
  'Georgia Code': 'Ga. Code Ann.',
  'Illinois Compiled Statutes': 'Ill. Comp. Stat.',
  'New York Civil Practice Law and Rules': 'N.Y. C.P.L.R.',
  'New York Penal Law': 'N.Y. Penal Law',
  'Ohio Revised Code': 'Ohio Rev. Code Ann.',
  'Pennsylvania Consolidated Statutes': 'Pa. Cons. Stat.',
  'Texas Civil Practice and Remedies Code': 'Tex. Civ. Prac. & Rem. Code Ann.',
  'Texas Penal Code': 'Tex. Penal Code Ann.',
};
