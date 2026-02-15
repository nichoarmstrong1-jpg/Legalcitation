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
 * Popular statute names → code references.
 * When detected, suggest the proper code citation.
 */
export const POPULAR_STATUTE_NAMES: Record<string, { title: string; code: string; sections: string }> = {
  'Affordable Care Act': { title: '42', code: 'U.S.C.', sections: '§ 18001 et seq.' },
  'Civil Rights Act of 1964': { title: '42', code: 'U.S.C.', sections: '§ 2000e et seq.' },
  'Americans with Disabilities Act': { title: '42', code: 'U.S.C.', sections: '§ 12101 et seq.' },
  'Clean Air Act': { title: '42', code: 'U.S.C.', sections: '§ 7401 et seq.' },
  'Clean Water Act': { title: '33', code: 'U.S.C.', sections: '§ 1251 et seq.' },
  'Sherman Act': { title: '15', code: 'U.S.C.', sections: '§§ 1-7' },
  'Clayton Act': { title: '15', code: 'U.S.C.', sections: '§§ 12-27' },
  'National Environmental Policy Act': { title: '42', code: 'U.S.C.', sections: '§ 4321 et seq.' },
  'Fair Labor Standards Act': { title: '29', code: 'U.S.C.', sections: '§ 201 et seq.' },
  'Family and Medical Leave Act': { title: '29', code: 'U.S.C.', sections: '§ 2601 et seq.' },
  'Voting Rights Act': { title: '52', code: 'U.S.C.', sections: '§ 10301 et seq.' },
  'Endangered Species Act': { title: '16', code: 'U.S.C.', sections: '§ 1531 et seq.' },
  'Freedom of Information Act': { title: '5', code: 'U.S.C.', sections: '§ 552' },
  'Religious Freedom Restoration Act': { title: '42', code: 'U.S.C.', sections: '§ 2000bb et seq.' },
  'Telecommunications Act of 1996': { title: '47', code: 'U.S.C.', sections: '§ 151 et seq.' },
  'Employee Retirement Income Security Act': { title: '29', code: 'U.S.C.', sections: '§ 1001 et seq.' },
  'Securities Act of 1933': { title: '15', code: 'U.S.C.', sections: '§ 77a et seq.' },
  'Securities Exchange Act of 1934': { title: '15', code: 'U.S.C.', sections: '§ 78a et seq.' },
  'Bankruptcy Code': { title: '11', code: 'U.S.C.', sections: '§ 101 et seq.' },
  'Immigration and Nationality Act': { title: '8', code: 'U.S.C.', sections: '§ 1101 et seq.' },
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
