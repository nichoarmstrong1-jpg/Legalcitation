import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ShortFormComponents } from '@legalcitation/shared';

/**
 * Validate short form citations per B4 / Rule 4.
 *
 * B4 specifics:
 *   - "Id." may only be used when the immediately preceding citation
 *     contains only ONE authority.
 *   - Always indicate a different page with "at [page]".
 *   - "Supra" and "hereinafter" may NOT be used for: cases, statutes,
 *     constitutions, legislative materials/debates (except hearings),
 *     restatements, model codes, or regulations.
 *   - "Supra" and "hereinafter" MAY be used for: legislative hearings,
 *     court filings, books, pamphlets, reports, unpublished materials,
 *     non-print resources, periodicals, services, treaties, regulations of
 *     intergovernmental organizations, and internal cross-references.
 */
export function validateShortForm(
  components: ShortFormComponents,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  switch (components.type) {
    case 'id':
      validateId(rawText, components, issues);
      break;
    case 'supra':
      validateSupra(rawText, components, issues);
      break;
    case 'hereinafter':
      validateHereinafter(rawText, components, issues);
      break;
    case 'short_case':
      validateShortCase(rawText, components, issues);
      break;
  }

  return issues;
}

function validateId(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // Check for "id" without period
  if (/\bid\b(?!\.)/.test(rawText) && !/\bId\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Id" must include a period: "Id." The period is part of the abbreviation and must always be present.',
      suggestion: 'Change to "Id."',
    });
  }

  // R. 4.1 / R. 7(b): "Id." must be italicized (including the period).
  // Check for non-italicized Id. by looking for common markers of plain text.
  // If the text contains "Id." without italic markers (*, <i>, <em>), flag it.
  // We check for common formatting indicators that suggest italics are missing.
  if (components.italicized === false) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Id." must always be italicized, including the period. Per R. 4.1 and B7, "Id." is one of the few abbreviations that is ALWAYS italicized in every context — both in law review footnotes and in practitioners\' documents.',
      suggestion: 'Italicize "Id." (including the period): "*Id.*" or "<i>Id.</i>" depending on your format.',
    });
  }

  // R. 4.1: "Id." at the start of a citation sentence must be capitalized.
  // "id." (lowercase) is only correct after a semicolon within a citation sentence.
  // Check if "id." appears at the beginning of the raw text (start of citation sentence).
  if (/^id\./.test(rawText.trimStart())) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Id." must be capitalized at the start of a citation sentence. Use "Id." not "id." Only use lowercase "id." after a semicolon within a citation sentence (e.g., "See Smith, 500 U.S. at 10; id. at 12.").',
      suggestion: 'Capitalize the "I" in "Id." at the start of the citation sentence.',
    });
  }

  // R. 4.1: Id. may only be used when the immediately preceding citation
  // contains a single authority. If the preceding citation string contains
  // semicolons (indicating multiple authorities), Id. is improper.
  if (components.precedingCitationCount !== undefined && components.precedingCitationCount > 1) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Id." may only be used when the immediately preceding citation contains exactly ONE authority. The preceding citation appears to contain multiple authorities (separated by semicolons). When the preceding citation contains multiple sources, you must use a full or short-form citation instead of "Id." This rule exists because "Id." would be ambiguous — the reader would not know which of the preceding authorities you are referring to.',
      suggestion: 'Replace "Id." with a full citation or a short-form citation that identifies the specific source.',
    });
  }

  // Check for missing "at" before page number (but NOT before § or ¶)
  const missingAtPattern = /\bId\.\s+(\d)/;
  if (missingAtPattern.test(rawText) && !/\bId\.\s+at\s+/.test(rawText) && !/\bId\.\s+[§¶]/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'When citing a different page with "Id.", include "at" before the page number. The "at" signals that the new citation is to a different location within the same source.',
      suggestion: 'Change "Id. [page]" to "Id. at [page]".',
    });
  }

  // R. 4.1: "Id. at §" is WRONG — do not use "at" before section symbol
  if (/\bId\.\s+at\s+[§¶]/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "at" before a section (§) or paragraph (¶) symbol. The section/paragraph symbol itself serves as the locator. Use "Id. § [number]" not "Id. at § [number]". This rule applies to all citations, not just Id. citations (R. 3.3).',
      suggestion: 'Remove "at" before the § or ¶ symbol.',
    });
  }

  // R. 4.1: Id. with section symbol must include full section number
  // "Id. § (f)" is WRONG — must include section number: "Id. § 166(f)"
  if (/\bId\.\s+[§¶]\s*\([a-zA-Z0-9]+\)/.test(rawText) && !/\bId\.\s+[§¶]\s*\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Include the full section number with "Id." — not just the subsection. The reader needs the section number to locate the material. Use "Id. § 166(f)" not "Id. § (f)".',
      suggestion: 'Include the section number before the subsection letter.',
    });
  }

  // R. 4.1: Double period — "Id.." is WRONG
  if (/\bId\.\.\s/.test(rawText) || /\bId\.\.$/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Id." already ends with a period. Do not add a second period at the end of a citation sentence. The period in "Id." serves double duty as both the abbreviation period and the terminal period.',
      suggestion: 'Remove the extra period: "Id." not "Id.."',
    });
  }

  // Check for "Ibid." (not used in Bluebook)
  if (/\bibid\.?\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Ibid." is a Latin abbreviation used in some citation systems (e.g., Chicago Manual of Style) but is NOT used in Bluebook citations. The Bluebook equivalent is "Id." Always use "Id." instead of "Ibid."',
      suggestion: 'Replace "Ibid." with "Id."',
    });
  }

  // R. 4.1: "ID." (all caps) is wrong
  if (/\bID\./.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"ID." (all capitals) is incorrect. "Id." uses standard capitalization — only the first letter is capitalized. This applies whether "Id." begins a citation sentence or appears after a semicolon.',
      suggestion: 'Change "ID." to "Id."',
    });
  }
}

function validateSupra(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // B4 / R. 4.2: Supra NEVER used for cases, statutes, constitutions,
  // court rules, regulations, restatements, model codes, or legislative materials (except hearings).
  // Detect if the antecedent might be a prohibited source.
  const prohibitedPatterns = [
    {
      pattern: /\bv\.\s/,
      label: 'case',
      detail: 'For cases, use "Id." (R. 4.1) for the immediately preceding authority, or a short-form case citation with one party name, volume, reporter, and "at [page]" (R. 10.9).',
    },
    {
      pattern: /\b(?:U\.S\.C\.|Stat\.|Code|Rev\.)\b/,
      label: 'statute',
      detail: 'For statutes, use "Id." for the immediately preceding authority, or repeat a shortened code citation (e.g., "42 U.S.C. § 1983") (R. 12.10).',
    },
    {
      pattern: /\bConst\.\b/,
      label: 'constitution',
      detail: 'For constitutions, the ONLY permitted short form is "Id." (R. 11). No other short form — including supra — may be used.',
    },
    {
      pattern: /\bC\.F\.R\.\b/,
      label: 'regulation',
      detail: 'For regulations, use "Id." or repeat the C.F.R. citation in short form (R. 14.6).',
    },
    {
      pattern: /\bFed\.\s+R\.\b/,
      label: 'procedural rule',
      detail: 'For procedural rules, use "Id." or repeat the rule citation. Supra is never permitted for court rules.',
    },
    {
      pattern: /\bRestatement\b/,
      label: 'restatement',
      detail: 'Restatements are treated like primary authority for supra purposes. Use "Id." or repeat the Restatement citation in short form.',
    },
    {
      pattern: /\bModel\s+(?:Code|Penal|Rules)\b/i,
      label: 'model code',
      detail: 'Model codes (e.g., Model Penal Code, Model Rules of Professional Conduct) cannot be cited with supra. Use "Id." or the specific short form.',
    },
  ];

  let isProhibited = false;
  for (const { pattern, label, detail } of prohibitedPatterns) {
    if (pattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 4.2',
        source: 'Bluebook',
        severity: 'error',
        message: `"Supra" cannot be used for ${label} citations (R. 4.2). ${detail}`,
        suggestion: `Replace with the appropriate short form for ${label} citations.`,
      });
      isProhibited = true;
      break;
    }
  }

  if (!isProhibited) {
    // Generic reminder for supra — suggest verification
    issues.push({
      id: uuid(),
      rule: 'R. 4.2',
      source: 'Bluebook',
      severity: 'suggestion',
      message: '"Supra" may only be used for secondary sources (books, articles, pamphlets, reports, hearings, periodicals, treaties, unpublished materials). It is NEVER used for cases, statutes, constitutions, court rules, regulations, restatements, or model codes (R. 4.2). The rationale is that primary legal authorities have their own established short forms.',
      suggestion: 'Verify this supra reference is to an eligible secondary source.',
    });
  }

  // Check format: Author, supra, at Y or Author, supra note X, at Y
  if (components.partyName) {
    const hasNote = /\bsupra\s+note\s+\d+/.test(rawText);
    const hasCommaAfterSupra = /\bsupra\s*,/.test(rawText);
    const hasAt = /\bat\s+\d/.test(rawText);

    // In practitioners' documents (no footnotes), format is: Author, supra, at [page]
    // In academic documents (with footnotes), format is: Author, supra note [X], at [page]
    if (!hasNote && !hasCommaAfterSupra && !hasAt) {
      issues.push({
        id: uuid(),
        rule: 'R. 4.2',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Supra short form should include a pinpoint. In law review format: "[Author], supra note [X], at [page]." In practitioner format: "[Author], supra, at [page]." Without a pinpoint, the reader cannot locate the specific material you are referencing.',
        suggestion: 'Add "at [page]" to the supra citation.',
      });
    }
  }

  // R. 4.2(a): Check that supra is italicized
  if (components.italicized === false) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.2',
      source: 'Bluebook',
      severity: 'error',
      message: '"Supra" must be italicized. Like other cross-reference terms (id., infra), "supra" is always presented in italics per R. 2.1(d) and B2.',
      suggestion: 'Italicize "supra."',
    });
  }
}

/**
 * R. 4.2(b): Validate hereinafter short form citations.
 * "Hereinafter" must be established in the first citation to a source
 * in brackets after the full citation but before any explanatory parenthetical.
 */
function validateHereinafter(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // R. 4.2(b): Hereinafter must have been established in the first citation.
  // If the component indicates this is a hereinafter usage, verify the
  // designation was properly established.
  if (components.hereinafterEstablished === false) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'A "hereinafter" designation must be established in the FIRST citation to the source. The designation appears in brackets immediately after the full citation and before any explanatory parenthetical: e.g., "Source Title [hereinafter Short Name]." It cannot be introduced retroactively in a later citation — if you forgot it in the first citation, you must provide a new full citation with the hereinafter designation.',
      suggestion: 'Ensure the hereinafter designation was established in the first full citation to this source. If not, provide a new full citation with the [hereinafter ShortName] bracket.',
    });
  }

  // R. 4.2: Hereinafter shares the same source-type restrictions as supra.
  // It cannot be used for cases, statutes, constitutions, regulations,
  // restatements, or model codes.
  const prohibitedPatterns = [
    { pattern: /\bv\.\s/, label: 'case' },
    { pattern: /\b(?:U\.S\.C\.|Stat\.|Code)\b/, label: 'statute' },
    { pattern: /\bConst\.\b/, label: 'constitution' },
    { pattern: /\bC\.F\.R\.\b/, label: 'regulation' },
    { pattern: /\bRestatement\b/, label: 'restatement' },
  ];

  for (const { pattern, label } of prohibitedPatterns) {
    if (pattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 4.2(b)',
        source: 'Bluebook',
        severity: 'error',
        message: `"Hereinafter" cannot be used for ${label} citations (R. 4.2). Like "supra," "hereinafter" is restricted to secondary sources. For ${label} citations, use "Id." or the appropriate source-specific short form.`,
        suggestion: `Remove the hereinafter designation and use the standard short form for ${label} citations.`,
      });
      break;
    }
  }

  // Check that the hereinafter designation uses brackets, not parentheses
  if (/\(hereinafter\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'The "hereinafter" designation must be enclosed in BRACKETS, not parentheses: "[hereinafter Short Name]" not "(hereinafter Short Name)." Brackets distinguish the hereinafter designation from explanatory parentheticals.',
      suggestion: 'Change parentheses to brackets: "[hereinafter Short Name]".',
    });
  }
}

function validateShortCase(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // Short case form: Party, Vol Rep at Page
  // Must include "at" before the page
  if (!/\bat\s+\d/.test(rawText) && !/\bat\s+\*\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.9',
      source: 'Bluebook',
      severity: 'error',
      message: 'Short form case citations must include "at" before the pincite page number. The format is: "[Party], [Vol] [Reporter] at [page]." For electronic database citations, use "at *[page]." The "at" is required to distinguish the pincite from the first page of the case.',
      suggestion: 'Include "at" before the page number: e.g., "Smith, 500 F.3d at 105."',
    });
  }

  // R. 10.9: Short form must include enough information to identify the case.
  // At minimum: a party name (or volume/reporter) and a pincite.
  // A bare page reference like "at 105" without any identifying information is insufficient.
  if (!/\b[A-Z]/.test(rawText.split(/\bat\b/)[0] || '') && !/\d+\s+[A-Z]/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.9',
      source: 'Bluebook',
      severity: 'error',
      message: 'Short form case citation must include enough information to identify the case. Include at least one party name or the volume and reporter abbreviation before "at [page]." A bare "at [page]" reference is insufficient because the reader cannot determine which case is being cited.',
      suggestion: 'Include a party name and/or volume/reporter: e.g., "Smith, 500 F.3d at 105" or "500 F.3d at 105."',
    });
  }

  // R. 10.9: Avoid using government parties or common litigants as the short-form name.
  // These names are ambiguous when multiple cases involve the same party.
  const ambiguousPartyPatterns = [
    { pattern: /^United States,/i, label: 'United States' },
    { pattern: /^State,/i, label: 'State' },
    { pattern: /^Commonwealth,/i, label: 'Commonwealth' },
    { pattern: /^People,/i, label: 'People' },
    { pattern: /^Secretary,/i, label: 'Secretary' },
    { pattern: /^Commissioner,/i, label: 'Commissioner' },
  ];

  const beforeAt = rawText.split(/\bat\b/)[0]?.trim() || '';
  for (const { pattern, label } of ambiguousPartyPatterns) {
    if (pattern.test(beforeAt)) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.9',
        source: 'Bluebook',
        severity: 'warning',
        message: `Avoid using "${label}" as the identifying party name in a short form citation (R. 10.9(a)). Government units, officials, and common litigants are often parties in many cases, making the short form ambiguous. Use the more distinctive party name instead.`,
        suggestion: `Replace "${label}" with the more distinctive party name from the other side of "v."`,
      });
      break;
    }
  }

  // R. 10.9: Short form must not include a date parenthetical
  if (/\(\d{4}\)/.test(rawText) && !/slip op\./.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.9',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Short form case citations should not include a date parenthetical. The date parenthetical is only included in the full citation. Including it in the short form creates unnecessary clutter and signals that this may be an improperly formatted full citation.',
      suggestion: 'Remove the date parenthetical from the short form citation.',
    });
  }
}
