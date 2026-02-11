import { v4 as uuid } from 'uuid';
import type { ValidationIssue, CaseComponents, CitationContext } from '@legalcitation/shared';
import {
  T6_ABBREVIATIONS,
  TEXTUAL_SENTENCE_ABBREVIATIONS,
  BUSINESS_FIRM_INDICATORS,
  OMIT_DESCRIPTIVE_TERMS,
  PROCEDURAL_PHRASES,
  STATE_TO_ABBR,
  T10_CITIES,
} from '@legalcitation/shared';

/**
 * Validate case name formatting per Rules 10.2.1 and 10.2.2.
 */
export function validateCaseName(
  components: CaseComponents,
  rawText: string,
  context: CitationContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fullName = components.partyTwo
    ? `${components.partyOne} v. ${components.partyTwo}`
    : components.partyOne;

  // R. 10.2.1(a): Check for "et al.", multiple parties
  checkMultipleParties(fullName, issues);

  // R. 10.2.1(b): Check procedural phrases
  checkProceduralPhrases(fullName, issues);

  // R. 10.2.1(c) / R. 10.2.2: Abbreviation rules (depends on context)
  checkAbbreviations(fullName, context, issues);

  // R. 10.2.1(d): "The" as first word
  checkLeadingThe(components, issues);

  // R. 10.2.1(e): Descriptive terms after named party
  checkDescriptiveTerms(fullName, issues);

  // R. 10.2.1(f): Geographic rules
  checkGeographicRules(fullName, issues);

  // R. 10.2.1(g): Given names / initials of individuals
  checkGivenNames(components, issues);

  // R. 10.2.1(h): Redundant business designations
  checkBusinessDesignations(fullName, issues);

  // R. 10.2.2: "United States" as named party (never abbreviate)
  checkUnitedStatesParty(components, issues);

  return issues;
}

function checkMultipleParties(name: string, issues: ValidationIssue[]): void {
  if (/\bet\s+al\.?\b/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "et al." and similar phrases indicating multiple parties.',
      suggestion: 'Remove "et al." from the case name.',
    });
  }

  if (/\ba\.?k\.?a\.?\b/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit alternative names such as "a.k.a."',
      suggestion: 'Remove the "a.k.a." and alternative name.',
    });
  }

  if (/\bd\/b\/a\b/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "d/b/a" and alternative business names.',
      suggestion: 'Remove "d/b/a" designation.',
    });
  }
}

function checkProceduralPhrases(name: string, issues: ValidationIssue[]): void {
  for (const [full, abbr] of Object.entries(PROCEDURAL_PHRASES)) {
    if (name.includes(full)) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.2.1(b)',
        source: 'Bluebook',
        severity: 'error',
        message: `Abbreviate "${full}" to "${abbr}".`,
        suggestion: `Replace "${full}" with "${abbr}".`,
      });
    }
  }
}

function checkAbbreviations(
  name: string,
  context: CitationContext,
  issues: ValidationIssue[]
): void {
  if (context === 'textual_sentence') {
    // In textual sentences, only abbreviate the 8 words in R. 10.2.1(c)
    for (const [word, abbr] of Object.entries(TEXTUAL_SENTENCE_ABBREVIATIONS)) {
      // Check if the full word is used where abbreviation is required
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'g');
      if (regex.test(name) && !name.includes(abbr)) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.1(c)',
          source: 'Bluebook',
          severity: 'warning',
          message: `In textual sentences, abbreviate "${word}" to "${abbr}".`,
          suggestion: `Replace "${word}" with "${abbr}".`,
        });
      }
    }

    // Check that T6 words are NOT abbreviated in textual sentences (except the 8)
    for (const [word, abbr] of Object.entries(T6_ABBREVIATIONS)) {
      if (word in TEXTUAL_SENTENCE_ABBREVIATIONS) continue;
      if (name.includes(abbr) && !name.includes(word)) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.1(c)',
          source: 'Bluebook',
          severity: 'error',
          message: `In textual sentences, do not abbreviate "${word}" to "${abbr}". Only the 8 designated words may be abbreviated.`,
          suggestion: `Replace "${abbr}" with "${word}".`,
        });
      }
    }
  } else {
    // In citation sentences/clauses, apply full T6 abbreviations (R. 10.2.2)
    for (const [word, abbr] of Object.entries(T6_ABBREVIATIONS)) {
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`);
      if (regex.test(name)) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.2 / T6',
          source: 'Bluebook',
          severity: 'error',
          message: `In citations, abbreviate "${word}" to "${abbr}" per Table T6.`,
          suggestion: `Replace "${word}" with "${abbr}".`,
        });
      }
    }

    // Check state/geographic abbreviations per T10
    for (const [state, abbr] of Object.entries(STATE_TO_ABBR)) {
      const regex = new RegExp(`\\b${escapeRegex(state)}\\b`);
      if (regex.test(name)) {
        // Don't abbreviate if the state name IS the entire party
        const isEntireParty = name.trim() === state;
        if (!isEntireParty) {
          issues.push({
            id: uuid(),
            rule: 'R. 10.2.2 / T10',
            source: 'Bluebook',
            severity: 'error',
            message: `In citations, abbreviate "${state}" to "${abbr}" per Table T10 (unless it is the entire party name).`,
            suggestion: `Replace "${state}" with "${abbr}".`,
          });
        }
      }
    }
  }
}

function checkLeadingThe(components: CaseComponents, issues: ValidationIssue[]): void {
  for (const party of [components.partyOne, components.partyTwo]) {
    if (!party) continue;
    if (/^The\s+/i.test(party) && !/^The\s+(King|Queen)\b/i.test(party)) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.2.1(d)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Omit "The" as the first word of a party\'s name.',
        suggestion: `Remove "The" from "${party}".`,
      });
    }
  }
}

function checkDescriptiveTerms(name: string, issues: ValidationIssue[]): void {
  for (const term of OMIT_DESCRIPTIVE_TERMS) {
    // Only flag if it appears after a comma (describing a named party)
    const pattern = new RegExp(`,\\s*${escapeRegex(term)}\\b`, 'i');
    if (pattern.test(name)) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.2.1(e)',
        source: 'Bluebook',
        severity: 'error',
        message: `Omit descriptive term "${term}" that describes an already-named party.`,
        suggestion: `Remove ", ${term}" from the case name.`,
      });
    }
  }
}

function checkGeographicRules(name: string, issues: ValidationIssue[]): void {
  // "State of X" should be just the state name (except in that state's own courts)
  if (/\bState of\s/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(f)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Omit "State of" unless citing decisions of that state\'s own courts, in which case retain only "State".',
      suggestion: 'Remove "State of" or shorten to "State".',
    });
  }

  if (/\bCommonwealth of\s/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(f)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Omit "Commonwealth of" unless citing decisions of that state\'s own courts.',
      suggestion: 'Remove "Commonwealth of" or shorten to "Commonwealth".',
    });
  }

  // "of America" after "United States"
  if (/United States of America/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(f)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "of America" after "United States".',
      suggestion: 'Use "United States" instead of "United States of America".',
    });
  }
}

function checkGivenNames(components: CaseComponents, issues: ValidationIssue[]): void {
  // Check each party for given names (first name + last name pattern)
  for (const party of [components.partyOne, components.partyTwo]) {
    if (!party) continue;
    // Simple heuristic: if a party name has 2+ capitalized words separated by space
    // and doesn't look like a business name, it might contain a given name
    const words = party.split(/\s+/);
    if (words.length >= 2 && /^[A-Z][a-z]+$/.test(words[0]) && /^[A-Z][a-z]+$/.test(words[1])) {
      // This looks like "FirstName LastName" — but only flag if it's clearly an individual
      // (not a business like "General Motors")
      const hasBusinessIndicator = /\b(Co\.|Corp\.|Inc\.|Ltd\.|LLC|L\.L\.C\.|Ass'n|Bros\.|Grp\.|Sys\.)\b/.test(party);
      if (!hasBusinessIndicator && words.length === 2) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.1(g)',
          source: 'Bluebook',
          severity: 'warning',
          message: `"${party}" appears to include a given name. Use only the last name for individual parties.`,
          suggestion: `Use "${words[words.length - 1]}" instead of "${party}".`,
        });
      }
    }
  }
}

function checkBusinessDesignations(name: string, issues: ValidationIssue[]): void {
  // If name contains a business indicator word AND "Inc." or "Ltd.", flag the redundancy
  const hasIndicator = BUSINESS_FIRM_INDICATORS.some(ind => name.includes(ind));
  if (hasIndicator) {
    for (const redundant of ['Inc.', 'Ltd.', 'L.L.C.', 'N.A.', 'F.S.B.']) {
      if (name.includes(redundant)) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.1(h)',
          source: 'Bluebook',
          severity: 'error',
          message: `Omit "${redundant}" because the name already contains a business firm indicator.`,
          suggestion: `Remove "${redundant}" from the case name.`,
        });
      }
    }
  }
}

function checkUnitedStatesParty(components: CaseComponents, issues: ValidationIssue[]): void {
  for (const party of [components.partyOne, components.partyTwo]) {
    if (!party) continue;
    if (/^U\.S\.$/.test(party.trim()) || /^U\.S\.\s/.test(party.trim())) {
      // Check if "U.S." is the entire party — this is wrong
      if (party.trim() === 'U.S.') {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.2',
          source: 'Bluebook',
          severity: 'error',
          message: 'Never abbreviate "United States" when it is a named party.',
          suggestion: 'Replace "U.S." with "United States".',
        });
      }
    }
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
