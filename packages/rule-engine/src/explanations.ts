/**
 * Human-readable explanations for Bluebook and Indigo rules.
 * Used in the UI's rule explanation modals.
 */
export const RULE_EXPLANATIONS: Record<string, { title: string; explanation: string; examples?: string[] }> = {
  'R. 3.2': {
    title: 'Pincites and Page Ranges',
    explanation: 'When citing specific pages within a source, provide a pincite after the first page number, separated by a comma. For page ranges with three or more digits, drop repetitious digits except the final two (e.g., 102–06, not 102–106). Use "at" for pincites in short form citations. Footnotes are cited as "n.4" (no space between "n." and the number).',
    examples: ['Baker v. Carr, 369 U.S. 186, 195 (1962).', '199 n.4', '102–06'],
  },
  'R. 3.2(a)': {
    title: 'Page Range Abbreviation',
    explanation: 'For three or more digit page numbers in a range, drop repetitious digits but always retain at least the last two digits of the ending page number.',
    examples: ['102–06 (not 102–106)', '1020–30 (not 1020–1030)'],
  },
  'R. 4.1': {
    title: 'Id. (Short Form)',
    explanation: '"Id." refers to the immediately preceding cited authority. Use "Id." when citing the same source as the immediately preceding citation. Add "at [page]" to cite a different page of the same source. "Id." should be italicized and capitalized when it begins a citation sentence.',
    examples: ['Id.', 'Id. at 405.', 'Id. at 405–10.'],
  },
  'R. 4.2': {
    title: 'Supra (Short Form)',
    explanation: '"Supra" may be used for secondary sources (books, articles) but NOT for cases or statutes. Format: "[Author], supra note [X], at [page]."',
    examples: ['Smith, supra note 5, at 100.'],
  },
  'R. 6.1(a)': {
    title: 'Abbreviation Spacing',
    explanation: 'Adjacent single capital letters have no space between them (e.g., S.D.N.Y.). A space separates a single capital from a longer abbreviation (e.g., D. Mass., S.D. Cal.). For reporter series, single capitals attach to ordinals without a space (F.2d, F.3d).',
    examples: ['S.D.N.Y. (not S. D. N. Y.)', 'D. Mass. (not D.Mass.)', 'F.2d (not F. 2d)'],
  },
  'R. 6.2(b)': {
    title: 'Ordinals',
    explanation: 'Use "2d" instead of "2nd" and "3d" instead of "3rd" in all legal citations.',
    examples: ['2d Cir. (not 2nd Cir.)', 'F.3d (not F.3rd)'],
  },
  'R. 10': {
    title: 'Cases (General)',
    explanation: 'A full case citation includes: (1) case name, (2) reporter source, (3) court and year parenthetical, (4) optional parenthetical information, and (5) subsequent history.',
  },
  'R. 10.2.1(a)': {
    title: 'Party Names — Multiple Parties',
    explanation: 'Cite only the first party on each side. Omit "et al.", "a.k.a.", "d/b/a", and alternative names.',
    examples: ['Kant v. Bentham (not Kant, et al. v. Bentham, a.k.a. The Father of Utilitarianism)'],
  },
  'R. 10.2.1(b)': {
    title: 'Procedural Phrases',
    explanation: 'Abbreviate "in the matter of" to "In re" and "on the relation of" / "on behalf of" to "ex rel." When adversary parties are named, omit all procedural phrases except "ex rel."',
  },
  'R. 10.2.1(c)': {
    title: 'Abbreviations in Textual Sentences',
    explanation: 'In textual sentences (as opposed to citation sentences), abbreviate only: "&" (and), "Ass\'n" (Association), "Bros." (Brothers), "Co." (Company), "Corp." (Corporation), "Inc." (Incorporated), "Ltd." (Limited), and "No." (Number).',
  },
  'R. 10.2.1(d)': {
    title: 'Leading "The"',
    explanation: 'Omit "The" as the first word of a party\'s name, except as part of the name of the object of an in rem action or when "The King" or "The Queen" is a party.',
  },
  'R. 10.2.1(e)': {
    title: 'Descriptive Terms',
    explanation: 'Omit descriptive terms like "administrator," "appellee," "executor," "licensee," and "trustee" that describe a party already named.',
  },
  'R. 10.2.1(f)': {
    title: 'Geographic Terms',
    explanation: 'Omit "State of," "Commonwealth of," "City of" (unless it begins the party name), and prepositional phrases of location (unless omission would leave only one word). Omit "of America" after "United States."',
  },
  'R. 10.2.1(g)': {
    title: 'Given Names',
    explanation: 'Omit given names and initials of individual parties. Retain given names in business firm names and where surnames are abbreviated.',
  },
  'R. 10.2.1(h)': {
    title: 'Business Firm Designations',
    explanation: 'Omit "Inc.," "Ltd.," "L.L.C.," and similar terms if the name already contains "Co.," "Corp.," "Ass\'n," or another clear business indicator.',
  },
  'R. 10.2.2': {
    title: 'Abbreviations in Citations',
    explanation: 'In citation sentences (not textual sentences), abbreviate all words in Table T6 and geographic units per Table T10. Never abbreviate "United States" when it is the named party.',
  },
  'R. 10.2.2 / T6': {
    title: 'Table T6 Abbreviations',
    explanation: 'In citation sentences, abbreviate all words listed in Table T6. This includes institutional words like "University" → "Univ.", "Department" → "Dep\'t", "Association" → "Ass\'n", etc.',
  },
  'R. 10.2.2 / T10': {
    title: 'Table T10 State Abbreviations',
    explanation: 'In citation sentences, abbreviate state names per Table T10 (e.g., "California" → "Cal.", "New York" → "N.Y."), unless the state name is the entire party name.',
  },
  'R. 10.3 / T1': {
    title: 'Reporters',
    explanation: 'Cite cases using the reporter abbreviation listed in Table T1. A citation consists of: volume number, reporter abbreviation, and first page of the case.',
  },
  'R. 10.3.2': {
    title: 'Reporter Format',
    explanation: 'A reporter citation must include a valid volume number, correct reporter abbreviation, and valid starting page number.',
  },
  'R. 10.4': {
    title: 'Court Designation',
    explanation: 'Include the court in the date parenthetical. For U.S. Supreme Court cases in U.S. Reports, no court designation is needed. Federal appellate cases need the circuit; district court cases need the district.',
  },
  'R. 10.4(a)': {
    title: 'Federal Court Designation',
    explanation: 'Federal circuit courts use ordinals (e.g., "9th Cir.", "2d Cir."). District courts use abbreviations like "S.D.N.Y.", "D. Mass."',
  },
  'R. 10.5': {
    title: 'Date/Year',
    explanation: 'Provide the year of decision in a parenthetical after the reporter citation. For unreported and electronic database cases, include the full date.',
  },
  'R. 10.5(b)': {
    title: 'Full Date for Electronic Sources',
    explanation: 'Cases cited to electronic databases (Westlaw, LEXIS) or unreported cases must include the full date of decision (e.g., "Jan. 15, 2023").',
  },
  'R. 10.9': {
    title: 'Short Form Case Citations',
    explanation: 'After a full citation, subsequent references may use a short form: "[Party], [Vol] [Rep] at [Page]." The short form must be used within 5 citations of the full citation.',
  },
  'Indigo R11': {
    title: 'Indigo Book — Case Names',
    explanation: 'The Indigo Book (a free Bluebook alternative) requires case names to be italicized or underlined, separated by "v." (not "versus"), with a comma before the volume number.',
  },
  'Indigo R12': {
    title: 'Indigo Book — Reporters & Pincites',
    explanation: 'Provide a pincite when quoting or citing a specific proposition from a case. When the pincite is the first page, repeat the page number.',
  },
  'Indigo R15': {
    title: 'Indigo Book — Court and Year',
    explanation: 'Every case citation must include the year of decision.',
  },
};
