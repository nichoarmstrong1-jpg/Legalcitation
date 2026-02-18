import { v4 as uuid } from 'uuid';
import type {
  ParsedCitation,
  ValidationIssue,
  CaseComponents,
  ArticleComponents,
  BookComponents,
  CitationType,
} from '@legalcitation/shared';
import {
  REPORTER_MAP,
  FEDERAL_COURT_HIERARCHY,
  STATE_ALPHABETICAL,
} from '@legalcitation/shared';

/**
 * R. 1.4 authority type hierarchy.
 * Lower number = cited first.
 */
const AUTHORITY_TYPE_ORDER: Partial<Record<CitationType, number>> = {
  constitution: 0,
  statute: 1,
  // treaty would be 2 when supported
  case: 3,
  regulation: 4,
  // legislative: 5,
  restatement: 6,
  book: 7,
  article: 8,
  internet: 9,
  ai_source: 10,
  unpublished: 11,
};

/**
 * Friendly names for authority types (for error messages).
 */
const AUTHORITY_TYPE_NAMES: Partial<Record<CitationType, string>> = {
  constitution: 'Constitutional provision',
  statute: 'Statute',
  case: 'Case',
  regulation: 'Regulation',
  restatement: 'Restatement',
  book: 'Book/treatise',
  article: 'Journal article',
  internet: 'Internet source',
  ai_source: 'AI source',
  unpublished: 'Unpublished source',
};

/**
 * R. 1.4 — Validate citation ordering within a group of citations
 * that appear in the same citation string (semicolon-separated within a footnote).
 *
 * Only validates citations that are full authorities (skips Id., supra, infra, short_form).
 */
export function validateCitationOrder(
  citations: ParsedCitation[],
  sourceText?: string
): Map<string, ValidationIssue[]> {
  const issueMap = new Map<string, ValidationIssue[]>();

  // Filter to full citations only (ordering doesn't apply to short forms)
  const fullCitations = citations.filter(c =>
    c.type !== 'id' && c.type !== 'supra' && c.type !== 'infra' &&
    c.type !== 'short_form' && c.type !== 'unknown' &&
    !!c.position && Number.isFinite(c.position.start) && Number.isFinite(c.position.end)
  );

  if (fullCitations.length < 2) return issueMap;

  // R. 1.4 applies only within true semicolon-delimited citation strings.
  for (const group of buildStringCitationGroups(fullCitations, sourceText)) {
    if (group.length < 2) continue;
    for (let i = 0; i < group.length - 1; i++) {
      const current = group[i];
      const next = group[i + 1];

      const comparison = compareCitationOrder(current, next);
      if (comparison > 0) {
        // Current should come AFTER next — ordering violation
        const currentType = AUTHORITY_TYPE_NAMES[current.type] || current.type;
        const nextType = AUTHORITY_TYPE_NAMES[next.type] || next.type;

        const issues = issueMap.get(current.id) || [];
        issues.push({
          id: uuid(),
          rule: 'R. 1.4',
          source: 'Bluebook',
          severity: 'warning',
          message: getOrderingMessage(current, next, currentType, nextType),
          suggestion: `Per R. 1.4, ${nextType.toLowerCase()} authorities should be cited before ${currentType.toLowerCase()} authorities.`,
        });
        issueMap.set(current.id, issues);
      }
    }
  }

  return issueMap;
}

function buildStringCitationGroups(
  citations: ParsedCitation[],
  sourceText?: string
): ParsedCitation[][] {
  if (!sourceText) return [];

  const ordered = [...citations].sort((a, b) => a.position.start - b.position.start);
  const groups: ParsedCitation[][] = [];
  let currentGroup: ParsedCitation[] = [ordered[0]];

  for (let i = 1; i < ordered.length; i++) {
    const previous = ordered[i - 1];
    const current = ordered[i];
    const between = sourceText.slice(previous.position.end, current.position.start);

    if (isStringCitationSeparator(between)) {
      currentGroup.push(current);
    } else {
      if (currentGroup.length > 1) {
        groups.push(currentGroup);
      }
      currentGroup = [current];
    }
  }

  if (currentGroup.length > 1) {
    groups.push(currentGroup);
  }

  return groups;
}

function isStringCitationSeparator(gap: string): boolean {
  const normalizedGap = gap.replace(/[*_]/g, '').trim();
  if (!normalizedGap.startsWith(';')) return false;
  if (/[.?!]/.test(normalizedGap)) return false;
  if (normalizedGap.length > 60) return false;

  const tail = normalizedGap.slice(1).trim();
  if (!tail) return true;

  return /^(?:see(?:\s+also)?|see,?\s*e\.g\.,?|cf\.|but see|but cf\.|accord|contra|compare|and|but|e\.g\.,?)\s*$/i.test(tail);
}

/**
 * Compare two citations for R. 1.4 ordering.
 * Returns negative if a should come first, positive if b should come first, 0 if equal.
 */
function compareCitationOrder(a: ParsedCitation, b: ParsedCitation): number {
  const rankA = getAuthorityRank(a);
  const rankB = getAuthorityRank(b);

  // Different authority types — compare by type hierarchy
  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // Same authority type — apply sub-ordering rules
  if (a.type === 'case' && b.type === 'case') {
    return compareCaseOrder(a, b);
  }

  if (a.type === 'constitution' && b.type === 'constitution') {
    return compareConstitutionOrder(a, b);
  }

  if (a.type === 'statute' && b.type === 'statute') {
    return compareStatuteOrder(a, b);
  }

  return 0;
}

/**
 * Get the R. 1.4 authority type rank for a citation.
 */
function getAuthorityRank(citation: ParsedCitation): number {
  return AUTHORITY_TYPE_ORDER[citation.type] ?? 99;
}

/**
 * Compare two case citations by court hierarchy.
 * Federal cases ordered by court level, then state cases alphabetically.
 * Within same court level: reverse chronological.
 */
function compareCaseOrder(a: ParsedCitation, b: ParsedCitation): number {
  const compA = a.components as CaseComponents;
  const compB = b.components as CaseComponents;

  const courtRankA = getCourtRank(compA);
  const courtRankB = getCourtRank(compB);

  if (courtRankA !== courtRankB) {
    return courtRankA - courtRankB;
  }

  // Same court level — check jurisdiction ordering (state alphabetical)
  const stateOrderA = getStateOrder(compA);
  const stateOrderB = getStateOrder(compB);

  if (stateOrderA !== stateOrderB) {
    return stateOrderA - stateOrderB;
  }

  // Same court and jurisdiction — reverse chronological (newest first)
  const yearA = parseYear(compA.year);
  const yearB = parseYear(compB.year);

  if (yearA !== null && yearB !== null && yearA !== yearB) {
    return yearB - yearA; // Higher year first (reverse chronological)
  }

  return 0;
}

/**
 * Get court rank from case components using reporter lookup.
 */
function getCourtRank(comp: CaseComponents): number {
  // Look up reporter to determine court
  const reporterEntry = REPORTER_MAP.get(comp.reporter);
  if (reporterEntry) {
    const courtRank = FEDERAL_COURT_HIERARCHY[reporterEntry.court];
    if (courtRank !== undefined) {
      return courtRank;
    }
    // State reporters — all state courts rank after federal
    if (reporterEntry.jurisdiction !== 'federal' && reporterEntry.jurisdiction !== 'regional') {
      // State supreme courts = 10, intermediate = 11, trial = 12
      if (reporterEntry.court === 'Supreme Court' || reporterEntry.court === 'Court of Appeals') {
        return 10;
      }
      if (reporterEntry.court.includes('Appeal') || reporterEntry.court.includes('Appellate')) {
        return 11;
      }
      return 12;
    }
  }

  // Fallback: parse court from parenthetical
  if (comp.court) {
    if (/Cir\./.test(comp.court)) return 1; // Circuit
    if (/^[NSEW]\.?D\./.test(comp.court) || /^D\.\s/.test(comp.court)) return 2; // District
    if (/Bankr\./.test(comp.court)) return 3;
    if (/Fed\.\s*Cl\./.test(comp.court)) return 4;
  }

  return 99; // Unknown
}

/**
 * Get state alphabetical order for state cases.
 * Returns -1 for federal cases (sorted before state).
 */
function getStateOrder(comp: CaseComponents): number {
  const reporterEntry = REPORTER_MAP.get(comp.reporter);
  if (!reporterEntry) return -1;

  if (reporterEntry.jurisdiction === 'federal') return -1;
  if (reporterEntry.jurisdiction === 'regional') {
    // Regional reporters — need to look at court parenthetical for state
    return -1;
  }

  return STATE_ALPHABETICAL.get(reporterEntry.jurisdiction) ?? 99;
}

/**
 * Parse year string into a number.
 */
function parseYear(yearStr: string | undefined): number | null {
  if (!yearStr) return null;
  const match = yearStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Compare constitution ordering: federal first, then state alphabetically.
 */
function compareConstitutionOrder(a: ParsedCitation, b: ParsedCitation): number {
  const compA = a.components as { jurisdiction?: string };
  const compB = b.components as { jurisdiction?: string };

  const isUSA = compA.jurisdiction?.toLowerCase().includes('u.s') || compA.jurisdiction?.toLowerCase() === 'federal';
  const isUSB = compB.jurisdiction?.toLowerCase().includes('u.s') || compB.jurisdiction?.toLowerCase() === 'federal';

  if (isUSA && !isUSB) return -1;
  if (!isUSA && isUSB) return 1;

  // Both state — alphabetical
  if (compA.jurisdiction && compB.jurisdiction) {
    return compA.jurisdiction.localeCompare(compB.jurisdiction);
  }

  return 0;
}

/**
 * Compare statute ordering: federal first, then state alphabetically.
 */
function compareStatuteOrder(a: ParsedCitation, b: ParsedCitation): number {
  const compA = a.components as { code?: string };
  const compB = b.components as { code?: string };

  const isFederalA = /U\.S\.C\.?/.test(compA.code || '');
  const isFederalB = /U\.S\.C\.?/.test(compB.code || '');

  if (isFederalA && !isFederalB) return -1;
  if (!isFederalA && isFederalB) return 1;

  return 0;
}

/**
 * Generate a specific ordering error message.
 */
function getOrderingMessage(
  current: ParsedCitation,
  next: ParsedCitation,
  currentType: string,
  nextType: string
): string {
  // Same type — sub-ordering issue
  if (current.type === next.type && current.type === 'case') {
    const compCurrent = current.components as CaseComponents;
    const compNext = next.components as CaseComponents;

    const courtRankCurrent = getCourtRank(compCurrent);
    const courtRankNext = getCourtRank(compNext);

    if (courtRankCurrent > courtRankNext) {
      return `R. 1.4: Higher-court cases should be cited first. "${next.rawText.slice(0, 50)}..." should precede "${current.rawText.slice(0, 50)}...".`;
    }

    // Same court level — reverse chronological
    const yearCurrent = parseYear(compCurrent.year);
    const yearNext = parseYear(compNext.year);
    if (yearCurrent !== null && yearNext !== null && yearCurrent < yearNext) {
      return `R. 1.4: Within the same court level, cite cases in reverse chronological order (newest first). The ${yearNext} case should precede the ${yearCurrent} case.`;
    }
  }

  return `R. 1.4: ${nextType} authorities should be cited before ${currentType} authorities within a citation string.`;
}
