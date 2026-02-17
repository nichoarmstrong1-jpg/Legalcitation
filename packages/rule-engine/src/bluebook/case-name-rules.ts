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

  // R. 10.2.1(f): Local government party rules
  checkLocalGovernmentParties(fullName, issues);

  // R. 10.2.1(i): Union names
  checkUnionNames(fullName, issues);

  // R. 10.2.1(j): Commissioner of Internal Revenue
  checkIRSCommissioner(fullName, context, issues);

  // R. 10.2.2: "United States" as named party (never abbreviate)
  checkUnitedStatesParty(components, issues);

  // R. 2.1: Academic typeface — case name formatting depends on context
  checkCaseNameTypeface(components, rawText, context, issues);

  return issues;
}

function checkMultipleParties(name: string, issues: ValidationIssue[]): void {
  // R. 10.2.1(a): Omit "et al." and similar phrases
  if (/\bet\s+al\.?\b/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "et al." — include only the first-named party on each side.',
      suggestion: 'Remove "et al." from the case name.',
    });
  }

  // R. 10.2.1(a): Omit "et ux." (and wife)
  if (/\bet\s+ux\.?\b/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "et ux." — these phrases indicate additional parties not specifically named.',
      suggestion: 'Remove "et ux." from the case name.',
    });
  }

  // R. 10.2.1(a): Omit "etc."
  if (/\betc\.?\b/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "etc." from the case name.',
      suggestion: 'Remove "etc." from the case name.',
    });
  }

  // R. 10.2.1(a): Omit alternate names — a/k/a, f/k/a, d/b/a, alias, previously known as
  const alternateNamePatterns = [
    { pattern: /\ba\.?k\.?a\.?\b/i, label: 'a.k.a.' },
    { pattern: /\bf\.?k\.?a\.?\b/i, label: 'f.k.a.' },
    { pattern: /\bd\/b\/a\b/i, label: 'd/b/a' },
    { pattern: /\balias\b/i, label: 'alias' },
    { pattern: /\bpreviously known as\b/i, label: 'previously known as' },
    { pattern: /\bformerly known as\b/i, label: 'formerly known as' },
  ];

  for (const { pattern, label } of alternateNamePatterns) {
    if (pattern.test(name)) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.2.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Omit "${label}" and the alternate name from the case name.`,
        suggestion: `Remove "${label}" and the alternate name.`,
      });
    }
  }

  // R. 10.2.1(a): Multiple "v." — only include the first action
  const vCount = (name.match(/\bv\.\s/g) || []).length;
  if (vCount > 1) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'When multiple actions are consolidated, include only the first "v." — omit subsequent actions.',
      suggestion: 'Remove all parties and "v." after the first action.',
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
  for (const party of [components.partyOne, components.partyTwo]) {
    if (!party) continue;

    // Exception 1: Initials-only names like "C.J." or "J.K." — preserve as-is
    if (/^[A-Z]\.[A-Z]\.?$/.test(party.trim())) continue;
    // Exception 1: First name + last initial like "Jasmine D."
    if (/^[A-Z][a-z]+\s+[A-Z]\.$/.test(party.trim())) continue;

    // Exception 2: Business names with individual's given name (J.K. Abernathy, Inc.)
    const hasBusinessIndicator = /\b(Co\.|Corp\.|Inc\.|Ltd\.|LLC|L\.L\.C\.|Ass'n|Bros\.|Grp\.|Sys\.|Groceries|Design|Industries)\b/.test(party);
    if (hasBusinessIndicator) continue;

    // Detect "Jr.", "Sr.", "III", "IV", "M.D.", "Esq." — should be omitted
    const titlePatterns = [
      { pattern: /,?\s*Jr\.?\s*$/i, label: 'Jr.' },
      { pattern: /,?\s*Sr\.?\s*$/i, label: 'Sr.' },
      { pattern: /,?\s*III\s*$/i, label: 'III' },
      { pattern: /,?\s*IV\s*$/i, label: 'IV' },
      { pattern: /,?\s*M\.D\.?\s*$/i, label: 'M.D.' },
      { pattern: /,?\s*Esq\.?\s*$/i, label: 'Esq.' },
      { pattern: /,?\s*Ph\.D\.?\s*$/i, label: 'Ph.D.' },
      { pattern: /\bDr\.\s+/i, label: 'Dr.' },
      { pattern: /\bProf\.\s+/i, label: 'Prof.' },
      { pattern: /\bSgt\.\s+/i, label: 'Sgt.' },
      { pattern: /\bMr\.\s+/i, label: 'Mr.' },
      { pattern: /\bMrs\.\s+/i, label: 'Mrs.' },
      { pattern: /\bMs\.\s+/i, label: 'Ms.' },
    ];

    for (const { pattern, label } of titlePatterns) {
      if (pattern.test(party)) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.1(g)',
          source: 'Bluebook',
          severity: 'error',
          message: `Omit "${label}" from individual party names.`,
          suggestion: `Remove "${label}" from "${party}".`,
        });
      }
    }

    // Check for "FirstName LastName" pattern (given name should be omitted)
    const words = party.split(/\s+/);
    if (words.length >= 2 && /^[A-Z][a-z]+$/.test(words[0]) && /^[A-Z][a-z]+$/.test(words[1])) {
      // Exception 2: Non-Western surname-first names — if the name appears to be
      // Asian (3+ words, no typical Western pattern), preserve full name
      // This is a heuristic and may need human review
      if (words.length >= 3 && words.every(w => /^[A-Z][a-z]+$/.test(w))) {
        // Could be a surname-first name like "Fong Yue Ting" — suggest review
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.1(g)',
          source: 'Bluebook',
          severity: 'suggestion',
          message: `"${party}" may include a given name. If this is a Western name, use only the surname. If the surname comes first (as in many Asian names), include the full name.`,
          suggestion: 'Verify whether this is a surname-first name that should be preserved in full.',
        });
      } else if (words.length === 2) {
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
  // R. 10.2.1(h): The complete list of terms from the rule.
  // When BOTH designations in a name appear in this list, omit the second.
  const RULE_10_2_1_H_TERMS = [
    'Inc.', 'Ltd.', 'L.L.C.', 'N.A.', 'F.S.B.', 'R.R.',
    "Ass'n", 'Bros.', 'Co.', 'Corp.', 'Ins.',
  ];

  // Find all R. 10.2.1(h) terms present in the name
  const foundTerms = RULE_10_2_1_H_TERMS.filter(term => name.includes(term));

  // Only omit the second if BOTH terms appear in the R. 10.2.1(h) list
  if (foundTerms.length >= 2) {
    // The second term found should be dropped
    const secondTerm = foundTerms[foundTerms.length - 1];
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(h)',
      source: 'Bluebook',
      severity: 'error',
      message: `When two business designations from R. 10.2.1(h) appear, omit the second: "${secondTerm}".`,
      suggestion: `Remove "${secondTerm}" from the case name. Both "${foundTerms[0]}" and "${secondTerm}" are in the R. 10.2.1(h) list — keep only the first.`,
    });
  }

  // R. 6.1(b): Widely known acronyms should NOT have periods
  // e.g., "F.H.A." should be "FHA", "N.B.C." should be "NBC"
  const acronymWithPeriods = /\b([A-Z]\.){3,}\s/g;
  let match;
  while ((match = acronymWithPeriods.exec(name)) !== null) {
    const withPeriods = match[0].trim();
    const withoutPeriods = withPeriods.replace(/\./g, '');
    // Only flag if this looks like an acronym (3+ capitals), not a standard abbreviation
    if (withoutPeriods.length >= 3 && !['U.S.', 'S.E.', 'N.E.', 'N.W.', 'S.W.'].some(a => withPeriods.startsWith(a))) {
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(b)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: `If "${withPeriods}" is a widely known acronym, omit the periods: "${withoutPeriods}".`,
        suggestion: `Consider using "${withoutPeriods}" instead of "${withPeriods}" if the acronym is widely recognized.`,
      });
    }
  }
}

/**
 * R. 10.2.1(f): Enhanced geographic and government party rules.
 * Checks for county/city/town party name formatting.
 */
function checkLocalGovernmentParties(name: string, issues: ValidationIssue[]): void {
  // County/City/Town: Do NOT abbreviate when the geographic unit is the entire party name
  // "City of Chicago" stays as "City of Chicago" — NOT "City of Chi."
  const localGovPatterns = [
    /\b(City of \w+)/,
    /\b(County of \w+)/,
    /\b(Town of \w+)/,
    /\b(Village of \w+)/,
    /\b(Borough of \w+)/,
  ];

  for (const pattern of localGovPatterns) {
    const match = name.match(pattern);
    if (match) {
      // Check if any T6/T10 abbreviation was applied to a local government name
      const govName = match[1];
      const hasAbbreviation = /\b[A-Z][a-z]*\.\b/.test(govName.replace(/^(City|County|Town|Village|Borough)\s+of\s+/, ''));
      if (hasAbbreviation) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.2.1(f)',
          source: 'Bluebook',
          severity: 'warning',
          message: `Do not abbreviate words when the geographic unit is the entire name of the party: "${govName}".`,
          suggestion: 'Spell out the full name of the local government party.',
        });
      }
    }
  }

  // R. 10.2.1(f): Two prepositional phrases — include only the geographic unit
  // "Mayor of the City of Sparta" → "Mayor of Sparta"
  const twoPrepPattern = /\b(\w+)\s+of\s+the\s+(City|County|Town|Village)\s+of\s+(\w+)/i;
  const twoPrepMatch = name.match(twoPrepPattern);
  if (twoPrepMatch) {
    const [fullMatch, title, , location] = twoPrepMatch;
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(f)',
      source: 'Bluebook',
      severity: 'warning',
      message: `When two prepositional phrases appear, include only the geographic unit: "${title} of ${location}".`,
      suggestion: `Shorten "${fullMatch}" to "${title} of ${location}".`,
    });
  }

  // "People of the State of X" → "People"
  if (/\bPeople of the State of\b/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(f)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Shorten "People of the State of [X]" to "People" for state court cases.',
      suggestion: 'Replace with "People" (for state court) or the full state name (for federal court).',
    });
  }
}

/**
 * R. 10.2.1(i): Union party name rules.
 */
function checkUnionNames(name: string, issues: ValidationIssue[]): void {
  // Detect union-related terms
  const unionIndicators = /\b(Union|Local|AFL-CIO|AFL|CIO|Brotherhood|Workers|Teamsters|International)\b/i;
  if (!unionIndicators.test(name)) return;

  // Check for location words that should be omitted
  const locationInUnion = /\b(of\s+(?:Northern|Southern|Eastern|Western|Central)\s+\w+)\b/i;
  const locMatch = name.match(locationInUnion);
  if (locMatch) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.2.1(i)',
      source: 'Bluebook',
      severity: 'warning',
      message: `Omit location words from union names: "${locMatch[1]}".`,
      suggestion: 'Remove geographic references from the union name.',
    });
  }
}

/**
 * R. 10.2.1(j): Commissioner of Internal Revenue.
 */
function checkIRSCommissioner(name: string, context: CitationContext, issues: ValidationIssue[]): void {
  if (/\bCommissioner of Internal Revenue\b/i.test(name)) {
    if (context === 'citation_sentence' || context === 'citation_clause') {
      issues.push({
        id: uuid(),
        rule: 'R. 10.2.1(j)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Shorten "Commissioner of Internal Revenue" to "Comm\'r" in citation sentences and clauses.',
        suggestion: 'Replace with "Comm\'r".',
      });
    } else {
      issues.push({
        id: uuid(),
        rule: 'R. 10.2.1(j)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Shorten "Commissioner of Internal Revenue" to "Commissioner" in embedded citations.',
        suggestion: 'Replace with "Commissioner".',
      });
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

/**
 * R. 2.1: In academic (Whitepages) citations, case name typeface depends on context.
 * - Footnote/citation sentence: full case name uses roman type (not italic)
 * - Textual sentence: case name should be italicized
 */
function checkCaseNameTypeface(
  components: CaseComponents,
  rawText: string,
  context: CitationContext,
  issues: ValidationIssue[]
): void {
  const caseName = components.partyTwo
    ? `${components.partyOne} v. ${components.partyTwo}`
    : components.partyOne;

  const hasItalicMarkers = rawText.includes(`*${caseName}*`)
    || rawText.includes(`*${components.partyOne}*`)
    || /\*[^*]*\bv\.\s[^*]*\*/.test(rawText);

  if (context === 'citation_sentence') {
    if (hasItalicMarkers) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'error',
        message: 'In academic footnotes, full case citations use roman type, not italics (R. 2.1).',
        suggestion: 'Remove italic formatting from the full case name in this footnote citation.',
      });
    }
  } else if (context === 'textual_sentence') {
    if (!hasItalicMarkers) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'warning',
        message: 'In academic text, the case name should be italicized (R. 2.1).',
        suggestion: `Italicize the case name: *${caseName}*`,
      });
    }
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
