/**
 * Human-readable explanations for Bluebook and Indigo rules.
 * Used in the UI's rule explanation modals.
 */
export const RULE_EXPLANATIONS: Record<string, { title: string; explanation: string; examples?: string[] }> = {
  'B1.1': {
    title: 'Citation Sentences and Clauses',
    explanation:
      'Citations appear in non-academic legal documents in one of two forms: citation sentences or citation clauses.\n\n' +
      'A citation sentence is a standalone sentence that begins with a capital letter and ends with a period. It may contain multiple citations separated by semicolons. Use citation sentences to cite authority for the entire preceding proposition.\n\n' +
      'A citation clause is embedded within a sentence, set off by commas. It immediately follows the proposition it supports. Do not begin a citation clause with a capital letter (unless the source itself is inherently capitalized, such as a case name). Do not end a citation clause with a period unless it is the last clause in the sentence.',
    examples: [
      'Citation sentence: Marbury v. Madison, 5 U.S. (1 Cranch) 137, 177–79 (1803).',
      'Multiple authorities: Marbury v. Madison, 5 U.S. (1 Cranch) 137, 177–79 (1803); Fletcher v. Peck, 10 U.S. (6 Cranch) 87, 139 (1810).',
      'Citation clause: The Court adopted a broad reading, see Wickard v. Filburn, 317 U.S. 111, 128–29 (1942), though it later narrowed this approach.',
    ],
  },
  'B1.2': {
    title: 'Introductory Signals',
    explanation:
      'A signal is a shorthand message about the relationship between a proposition and the cited authority.\n\n' +
      'Signals are capitalized when they begin a citation sentence but lowercase when they begin a citation clause.\n\n' +
      'Common signals: [no signal] (authority directly states the proposition), see (authority clearly supports but does not directly state), see also (additional support), cf. (analogous support), contra (directly contradicts), but see (clearly supports a contrary proposition), see generally (helpful background).\n\n' +
      'You may combine "e.g.," with "see" or "but see" to form "see, e.g.," or "but see, e.g.," respectively.',
    examples: [
      'See Wickard v. Filburn, 317 U.S. 111, 128–29 (1942).',
      'see Wickard v. Filburn, 317 U.S. 111, 128–29 (1942), (in a citation clause)',
      'See, e.g., Gault v. Garrison, 569 F.2d 993 (7th Cir. 1977).',
    ],
  },
  'R. 1.2': {
    title: 'Introductory Signals (Detailed)',
    explanation:
      'Signals indicate support, comparison, contradiction, or background.\n\n' +
      'Supportive: [no signal], e.g., accord, see, see also, cf.\n' +
      'Comparative: compare...with, contrast...with\n' +
      'Contradictory: contra, but see, but cf.\n' +
      'Background: see generally\n\n' +
      'Certain signals require explanatory parentheticals: see also, cf., but cf., see generally, compare, and contrast.\n\n' +
      '"Compare" and "contrast" must each be used with "with." Omit "but" from "but see" and "but cf." when following another negative signal.',
    examples: [
      'Cf. Palmer v. Ticcione, 433 F. Supp. 653 (E.D.N.Y. 1977) (upholding mandatory retirement).',
      'Compare McDonald v. City of Chicago, 561 U.S. 742, 791 (2010) (plurality opinion) (incorporating the Second Amendment through the Due Process Clause), with Timbs v. Indiana, 586 U.S. 146, 150 (2019) (incorporating the Excessive Fines Clause).',
    ],
  },
  'R. 1.2(b)': {
    title: 'Compare / Contrast Signals',
    explanation:
      '"Compare" and "contrast" must be used in conjunction with "with." The "with" is preceded by a comma, as is "and" when used. Parenthetical explanations following each authority are required.',
    examples: [
      'Compare McDonald v. City of Chicago, 561 U.S. 742, 791 (2010) (plurality opinion), with Timbs v. Indiana, 586 U.S. 146, 150 (2019).',
      'Contrast Timbs v. Indiana, 586 U.S. 146, 150 (2019), with id. at 157–58 (Thomas, J., concurring in the judgment).',
    ],
  },
  'R. 1.2(c)': {
    title: '"But" Omission After Negative Signals',
    explanation:
      '"But" should be omitted from "but see" and "but cf." whenever one of these signals follows another negative signal.',
    examples: [
      'Contra Blake v. Kline, 612 F.2d 718, 723–24 (3d Cir. 1979); see Charles Alan Wright, Law of Federal Courts § 48 (4th ed. 1983).',
    ],
  },
  'R. 1.3': {
    title: 'Order of Signals',
    explanation:
      'When more than one signal is used, the signals (with their authorities) must appear in the order listed in R. 1.2: supportive → comparative → contradictory → background.\n\n' +
      'Signals of the same basic type (supportive, comparative, contradictory, or background) must be strung together within a single citation sentence, separated by semicolons.\n\n' +
      'Signals of different types must be grouped in different citation sentences.\n\n' +
      'Exception: Within a citation clause, citation strings may contain signals of more than one type, separated by semicolons.',
    examples: [
      'See Mass. Bd. of Ret. v. Murgia, 427 U.S. 307 (1976); cf. Palmer v. Ticcione, 433 F. Supp. 653 (E.D.N.Y. 1977). But see, e.g., Gault v. Garrison, 569 F.2d 993 (7th Cir. 1977). See generally Comment, O\'Neil v. Baine, 127 U. Pa. L. Rev. 798 (1979).',
    ],
  },
  'B1.3': {
    title: 'Explanatory Parentheticals',
    explanation:
      'Explanatory parentheticals provide additional context about a cited authority. They should begin with a present participle (e.g., "holding," "explaining," "noting") unless the parenthetical contains a quoted sentence or a short descriptive statement.\n\n' +
      'Do not begin a non-quoted explanatory parenthetical with a capital letter. Do not end it with a period.\n\n' +
      'If the parenthetical quotes a full sentence, begin with a capital letter and include closing punctuation inside the quotation marks.',
    examples: [
      'See Flanagan v. United States, 465 U.S. 259, 264 (1984) (explaining that the final judgment rule reduces potential for parties to "clog the courts").',
      '("Not every person aggrieved by administrative action is necessarily entitled to the protections of due process.").',
    ],
  },
  'R. 1.5': {
    title: 'Parenthetical Information (Detailed)',
    explanation:
      'Use parentheticals to explain the relevance of a cited authority. Required when relevance might not otherwise be clear.\n\n' +
      'Non-quoted parentheticals: Begin with a present participle, never capitalize the first letter.\n\n' +
      'Quoted-sentence parentheticals: Begin with a capital letter, include closing punctuation.',
    examples: [
      '(arguing that the two-tier theory is still viable)',
      '("[T]here are more mayors of Rockville, Maryland, than there are mayors of Detroit.").',
    ],
  },
  'R. 1.5(a)(i)': {
    title: 'Non-Quoted Parentheticals',
    explanation:
      'Explanatory parenthetical phrases not directly quoting the authority usually begin with a present participle and should never begin with a capital letter.',
    examples: [
      '(holding that the statute violates the Equal Protection Clause)',
      '(health-related water quality)',
    ],
  },
  'R. 1.5(a)(ii)': {
    title: 'Quoted-Sentence Parentheticals',
    explanation:
      'If the parenthetical quotes full sentences, it should begin with a capital letter and include closing punctuation. Do not precede a full-sentence quotation with a participial phrase like "explaining that."',
  },
  'R. 1.5(b)': {
    title: 'Order of Parentheticals',
    explanation:
      'When a citation has multiple parentheticals, order them: (date) [hereinafter] (en banc) (Justice, concurring) (plurality) (per curiam) (alteration) (emphasis added) (footnote omitted) (citations omitted) (quoting...) (citing...) (explanatory), history.',
    examples: [
      'Baze v. Rees, 553 U.S. 35, 48 (2008) (plurality opinion) ("This Court has never invalidated..." (emphasis added)).',
    ],
  },
  'B2': {
    title: 'Typeface for Court Documents',
    explanation:
      'Non-academic legal documents use two typefaces: ordinary type and italics (or underscoring).\n\n' +
      'Italicize/underscore: case names (including procedural phrases), titles of books and articles, introductory signals, explanatory phrases for subsequent history, cross references (id., supra), and words introducing related authority ("quoted in").\n\n' +
      'Key difference from academic citations: In Bluepages, both full AND short case names are italicized. In Whitepages, only short form case names are italicized. Small capitals are not required in Bluepages (optional for style).',
  },
  'B3': {
    title: 'Subdivisions',
    explanation:
      'Give page numbers before date parentheticals without introductory abbreviations like "p." or "at." Cite nonconsecutive pages separated by commas (e.g., "101, 103").\n\n' +
      'For footnotes/endnotes: give the page, then "n." and the number with no space (e.g., "152 n.4").\n\n' +
      'Volume numbers should be in Arabic numerals. Subdivision terms should be abbreviated per Table T16.',
    examples: [
      'United States v. Carolene Prods. Co., 304 U.S. 144, 152 n.4 (1938).',
      '3 Ronald E. Mallen et al., Legal Malpractice 101–02 (2014).',
    ],
  },
  'B3 / T16': {
    title: 'Subdivision Abbreviations (Table T16)',
    explanation:
      'Abbreviate subdivision terms in citations per Table T16. A space appears between the abbreviation and the number (except for "n." which has no space). All abbreviations can be made plural by adding "s".\n\n' +
      'Common abbreviations: ch. (chapter), cl. (clause), art. (article), § (section), ¶ (paragraph), n./nn. (footnote/footnotes), pt. (part), app. (appendix).',
  },
  'B4': {
    title: 'Short Citation Forms',
    explanation:
      '"Id." may only be used when the immediately preceding citation contains only one authority. Always include "at [page]" when citing a different page.\n\n' +
      '"Supra" and "hereinafter" may be used for: legislative hearings, court filings, books, pamphlets, reports, unpublished materials, periodicals, services, treaties, and internal cross-references.\n\n' +
      '"Supra" and "hereinafter" should NOT be used for: cases, statutes, constitutions, legislative materials/debates (except hearings), restatements, model codes, or regulations.',
  },
  'B5.1': {
    title: 'Quotations — Generally',
    explanation:
      'Enclose all quotations (except block quotations) with quotation marks. Place commas and periods inside the quotation marks. Place all other punctuation outside unless it is part of the quoted text.\n\n' +
      'A quotation within another quotation can be parenthetically attributed to its original source or acknowledged with "(citation omitted)."',
  },
  'B5.2': {
    title: 'Block Quotations',
    explanation:
      'Quotations of 50 or more words should be formatted as block quotations: single-spaced, indented on both sides, justified, and without quotation marks. Quotation marks within a block quotation appear as in the original. The citation after a block quotation starts at the left margin on the line following the quotation.',
  },
  'B5.3': {
    title: 'Modifying Quotations — (citation modified)',
    explanation:
      'When a quotation is simplified for clarity (internal quotation marks, brackets, ellipses, internal citations, and footnote numbers stripped; capitalization changed), indicate with "(citation modified)." Do not use "(cleaned up)" — use "(citation modified)" instead.\n\n' +
      'The modification represents that alterations were made solely to enhance readability and the quotation otherwise faithfully reproduces the quoted text.',
  },
  'B6': {
    title: 'Abbreviations, Numerals, and Symbols',
    explanation:
      'Close up adjacent single capitals (U.S.) but do not close up single capitals with longer abbreviations (S. Ct.). Every abbreviation ends with a period, except those ending in an apostrophe (Soc\'y).\n\n' +
      'Spell out numbers zero through ninety-nine. Use numerals for 100+, unless the number begins a sentence.\n\n' +
      'For word-limit compliance, reporter abbreviations may optionally be closed (S.Ct. instead of S. Ct.).',
    examples: [
      'U.S. (not U. S.)',
      'S. Ct. (not S.Ct., unless for word limits)',
      "Soc'y (no period after apostrophe ending)",
    ],
  },
  'B7': {
    title: 'Italicization for Style and in Unique Circumstances',
    explanation:
      'Words and phrases may be italicized for emphasis. Non-English words should be italicized unless incorporated into common English usage.\n\n' +
      'Most Latin words commonly used in legal writing (e.g., res judicata, habeas corpus, amicus curiae, en banc) are NOT italicized. Obsolete or uncommon Latin phrases SHOULD be italicized.\n\n' +
      '"Id." is always italicized. Italicize individual letters representing hypothetical parties (A went to bank B). Italicize lowercase "l" as a subdivision to distinguish from "1".',
    examples: [
      'Common (not italicized): e.g., i.e., res judicata, habeas corpus, amicus curiae',
      'Uncommon (italicized): expressio unius est exclusio alterius, sero sed serio',
      'Id. — always italicized',
    ],
  },
  'R. 1.4': {
    title: 'Order of Authorities Within Each Signal',
    explanation:
      'Authorities within each signal are separated by semicolons. They should be ordered in a logical manner. If one authority is considerably more helpful or authoritative than the others, it should precede the others. Authorities cited in short form are ordered as though cited in full.',
  },
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
  'B8': {
    title: 'Capitalization in Court Documents',
    explanation:
      'In court documents and legal memoranda, capitalize the names of court documents when referring to documents within the same case. Examples: "Plaintiff\'s Motion," "the Complaint," "Defendant\'s Answer."\n\n' +
      'When the document is a shortened reference (e.g., "the motion"), capitalize it if it refers to a specific filing in the same case. If it refers generically, do not capitalize.\n\n' +
      'Capitalize "Court" when referring to the specific court to which the document is addressed; lowercase when referring to courts generally.',
  },
  'B9': {
    title: 'Titles of Judges, Officials, and Terms of Court',
    explanation:
      'Abbreviate the titles of judges and other officials per Table T11 when used in citations. Spell out titles in textual sentences.\n\n' +
      'Common abbreviations: "Justice" → "J." (plural "JJ."), "Chief Justice" → "C.J.", "Judge" → "J." (plural "JJ."), "Chief Judge" → "C.J."\n\n' +
      'Never abbreviate "Justice" or "Judge" when used in text. Only abbreviate in citation parentheticals and case-history explanations.',
    examples: [
      '(Scalia, J., dissenting)',
      '(Roberts, C.J., concurring)',
      'In text: Justice Scalia (not J. Scalia)',
    ],
  },
  'R. 9': {
    title: 'Titles of Judges and Officials (Detailed)',
    explanation:
      'Per Table T11, abbreviate judicial titles in citations. Use "J." for both "Justice" and "Judge." Use "JJ." for the plural. Do not abbreviate when the title appears in running text.\n\n' +
      'For per curiam opinions, use "(per curiam)" after the date parenthetical. For concurrences and dissents, indicate in a parenthetical: (Kennedy, J., concurring in part and dissenting in part).\n\n' +
      'Terms of court are abbreviated per the court\'s own conventions.',
  },
  'B10': {
    title: 'Cases — Bluepages Overview',
    explanation:
      'A full case citation in a court document contains five possible elements:\n\n' +
      '1. Case name (italicized/underscored)\n' +
      '2. Reporter source (volume, reporter abbreviation, first page)\n' +
      '3. Court and year parenthetical\n' +
      '4. Optional parenthetical information\n' +
      '5. Subsequent history\n\n' +
      'Example: Smith v. Jones, 500 F.3d 100, 105 (2d Cir. 2007).',
  },
  'B10.1': {
    title: 'Full Case Citation',
    explanation:
      'A full case citation includes the case name, reporter information, and a court/date parenthetical. Italicize or underscore the case name (including any procedural phrase like "In re") and the "v.".\n\n' +
      'Case names follow abbreviation rules per R. 10.2.1 (textual) and R. 10.2.2 (citation sentences). Include the relevant reporter per Table T1.',
  },
  'B10.1.1': {
    title: 'Case Names',
    explanation:
      'Case names are italicized in practitioner documents (both full and short forms). Abbreviation rules differ based on context:\n\n' +
      '• In textual sentences: only abbreviate the 8 words in R. 10.2.1(c) — "&", "Ass\'n", "Bros.", "Co.", "Corp.", "Inc.", "Ltd.", "No."\n' +
      '• In citation sentences: abbreviate all words in Table T6 and geographic terms in Table T10.\n\n' +
      'Always omit: "et al.", "a.k.a.", "d/b/a", given names of individuals, descriptive terms after named parties, "State of"/"Commonwealth of" (unless in that state\'s courts), redundant business designations.',
  },
  'B10.1.2': {
    title: 'Reporters',
    explanation:
      'Cite cases to the reporter listed in Table T1 for the relevant jurisdiction. The citation includes: volume number, reporter abbreviation, and first page.\n\n' +
      'For Supreme Court cases: cite to U.S. Reports (U.S.) when available. For recently decided cases not yet in U.S. Reports, cite to S. Ct.\n\n' +
      'State cases: cite to the regional reporter if the state has no official reporter. Some jurisdictions require parallel citations to both official and regional reporters.',
  },
  'B10.1.3': {
    title: 'Court Designation',
    explanation:
      'Include the court abbreviation in the date parenthetical. Omit the court when the reporter unambiguously identifies it (e.g., "U.S." for Supreme Court).\n\n' +
      'Federal circuits: "2d Cir.", "9th Cir.", etc. Federal districts: "S.D.N.Y.", "D. Mass.", etc.\n\n' +
      'State courts: include the court only if it is not the highest court of the state (e.g., "Cal. Ct. App." but just the year for Cal. Supreme Court cases in Cal. Reports).',
  },
  'B10.1.4': {
    title: 'Date',
    explanation:
      'Include the year of the decision in parentheses. For cases cited to electronic databases (Westlaw, LEXIS) or otherwise unreported, include the full date (e.g., "Jan. 15, 2023").\n\n' +
      'Abbreviate months per Table T12 (Jan., Feb., Mar., Apr., Aug., Sept., Oct., Nov., Dec.). May, June, and July are not abbreviated.',
  },
  'B10.1.5': {
    title: 'Parallel Citations',
    explanation:
      'When required by local rules, provide parallel citations to both the official and unofficial reporters. The official reporter is listed first.\n\n' +
      'Example: People v. Cage, 40 Cal. 4th 965, 155 P.3d 205 (2007).',
  },
  'B10.1.6': {
    title: 'Subsequent History',
    explanation:
      'Include the subsequent history of a case after the initial citation: affirmed, reversed, vacated, certiorari denied, etc. Abbreviate per Table T8.\n\n' +
      'Common abbreviations: "aff\'d" (affirmed), "rev\'d" (reversed), "vacated" (vacated), "cert. denied" (certiorari denied).\n\n' +
      'Omit denials of certiorari if the case is more than 2 years old, unless the denial is particularly relevant.',
  },
  'B10.2': {
    title: 'Short Form Case Citations',
    explanation:
      'After a full citation, subsequent references may use a short form: one party name, volume, reporter, "at" pincite. The short form must be clear enough for the reader to locate the full citation.\n\n' +
      'Alternatively, use "Id." to refer to the immediately preceding citation. "Id." can only be used when the preceding citation contains exactly one authority.\n\n' +
      'Example short form: Smith, 500 F.3d at 105.\n' +
      'Example id.: Id. at 110.',
  },
  'B11': {
    title: 'Constitutions — Bluepages',
    explanation:
      'Cite constitutions by: abbreviated jurisdiction + "Const." + abbreviated subdivisions (articles, amendments, sections, clauses per Table T16).\n\n' +
      'Currently in force: cite WITHOUT a date.\n' +
      'Repealed: add "(repealed [year])" or cite the repealing provision.\n' +
      'Amended: add "(amended [year])" or cite the amending provision.\n\n' +
      'Do NOT use any short citation form other than "id." for constitutions.\n\n' +
      'Use Roman numerals for article and amendment numbers. Use § for section.',
    examples: [
      'U.S. Const. art. I, § 8, cl. 10.',
      'U.S. Const. amend. XIV, § 2.',
      'U.S. Const. pmbl.',
      'U.S. Const. amend. XVIII (repealed 1933).',
      'Wash. Const. art. I, § 32.',
    ],
  },
  'R. 11': {
    title: 'Constitutions (Detailed)',
    explanation:
      'Cite constitutions by abbreviated jurisdiction name (per Table T10), "Const.," and abbreviated subdivisions (per Table T16).\n\n' +
      'Currently in force: no date. Repealed: "(repealed [year])" or cite the repealing provision with "repealed by." Amended: "(amended [year])" or cite the amending provision with "amended by." Superseded: cite by year of adoption.\n\n' +
      'For electronic databases: add a parenthetical with publisher name, database name, and currentness.\n\n' +
      'Multiple references: use "id." for second citation instead of repeating the constitution name. No short form other than "id." is permitted.\n\n' +
      'For foreign constitutions, see R. 20.4. For tribal constitutions, see R. 22.2.1.',
    examples: [
      'U.S. Const. art. I, § 9, cl. 2.',
      'U.S. Const. amend. XIV, § 2.',
      'U.S. Const. pmbl.',
      'U.S. Const. amend. XVIII (repealed 1933).',
      'U.S. Const. amend. XVIII, repealed by, U.S. Const. amend. XXI.',
      'Wash. Const. art. I, § 2 (West, Westlaw through Nov. 2024 amendments).',
    ],
  },
  'B13': {
    title: 'Legislative Materials — Bluepages',
    explanation:
      'A full citation to legislative material includes: (1) title of material; (2) abbreviated name of legislative body; (3) number assigned; (4) Congress/session number; (5) year of publication.\n\n' +
      'Federal bills: name (if relevant) + chamber abbreviation + bill number + Congress number + section + (year). Enacted and unenacted bills use the same format.\n\n' +
      'Federal hearings: title + "Hearings on [bill]" + "Before the [subcommittee]" + Congress number + page + (year).\n\n' +
      'Federal reports: chamber abbreviation + "Rep. No." + Congress-report number + pincite + (year).\n\n' +
      'State bills/resolutions: (1) legislative body; (2) bill/resolution number; (3) legislative body number; (4) session number + (state, year).',
    examples: [
      'S. 1983, 93rd Cong. § 10 (1973).',
      'Freedom of Information Act, S. 1160, 88th Cong. § 1 (1965).',
      'H.R. Rep. No. 99-253, pt. 1, at 54 (1985).',
      'Toxic Substances Control Act: Hearings on S. 776 Before the Subcomm. on the Env\'t of the S. Comm. on Com., 94th Cong. 343 (1975).',
      'H.B. 636, 1999 Gen. Assemb., 413th Sess. (Md. 1999).',
    ],
  },
  'B14': {
    title: 'Administrative and Executive Materials — Bluepages',
    explanation:
      'Federal rules/regulations: cite to C.F.R. by title + § or part + (year).\n\n' +
      'State regulations: cite per T1.3, omit small capitals.\n\n' +
      'Federal Register: commonly used name + volume + Fed. Reg. + page + (date) + "(to be codified at [C.F.R. cite])" if applicable.\n\n' +
      'Administrative adjudications: cite by first-listed private party name or subject-matter title + volume + reporter + page + (year).\n\n' +
      'Arbitration awards: cite as court cases if adversary parties are named; as administrative adjudications if not. Include arbitrator in parenthetical.',
    examples: [
      '46 C.F.R. § 166.01 (2009).',
      'Cal. Code. Regs. tit. 2, § 22999 (2024).',
      'Federal Acquisition Regulations for NASA, 55 Fed. Reg. 52,782 (Dec. 21, 1990) (to be codified at 48 C.F.R. pt. 1).',
      'Trojan Transp., Inc., 249 NLRB 642 (1980).',
      'Kroger Co. v. Amalgamated Meat Cutters, Loc. 539, 74 Lab. Arb. Rep. (BL) 785, 787 (1980) (Doering, Arb.).',
    ],
  },
  'B15': {
    title: 'Books and Other Nonperiodic Materials — Bluepages',
    explanation:
      'Citations to books, treatises, pamphlets, and other nonperiodic materials follow the same basic format as R. 15, with typeface adjustments for court documents. See B15.1 (full citation) and B15.2 (short form).',
  },
  'B15.1': {
    title: 'Full Citation — Books (Bluepages)',
    explanation:
      'Include: (1) volume number (multi-volume sets); (2) full author name(s) as on title page; (3) title (underscored/italicized); (4) pincite; (5) parenthetical with year, editor (if any), edition (if more than one).\n\n' +
      'Authors: two → ampersand; three → commas + ampersand (no Oxford comma); more than three → list all or first + "et al."\n\n' +
      'Special citation forms exist for: Black\'s Law Dictionary, Am. Jur. 2d, C.J.S., Wright & Miller\'s Federal Practice & Procedure, Moore\'s Federal Practice.',
    examples: [
      'Matthew Butterick, Typography for Lawyers 54 (2010).',
      'J.R. McNeill & William H. McNeill, The Human Web: A Bird\'s-Eye View of World History 319 (2003).',
      'David Hunter et al., International Environmental Law and Policy 555 (3d ed. 2006).',
      'A Bentham Reader 101 (Mary Peter Mack ed., 1969).',
      'Good-Faith Bargaining, Black\'s Law Dictionary (10th ed. 2014).',
      '21 Wright & Miller\'s Federal Practice & Procedure § 1006 (3d ed. 1998).',
    ],
  },
  'B15.2': {
    title: 'Short Form Citation — Books (Bluepages)',
    explanation:
      'Use "id." for a book cited in the immediately preceding citation. Otherwise, use "supra."\n\n' +
      'Supra form: (1) author\'s last name; (2) "supra," underlined/italicized up to but not including the comma; (3) new pincite.\n\n' +
      'Multiple authors: use both last names (two authors) or first + "et al." (three+).',
    examples: [
      'Id. at 204–05.',
      'Posner, supra, at 204–05.',
      'Dunnewold et al., supra, at 80.',
      'James & Hazard, supra, § 1.7.',
    ],
  },
  'B16': {
    title: 'Periodical Materials — Bluepages',
    explanation:
      'A full citation of periodical material includes: (1) author name(s); (2) article title (underscored/italicized); (3) abbreviated publication name; (4) pincite; (5) date. Format varies by periodical type. See B16.1 (full) and B16.2 (short).',
  },
  'B16.1': {
    title: 'Full Citation — Periodicals (Bluepages)',
    explanation:
      'B16.1.1 — Consecutively paginated journals: author + title + volume number + abbreviated journal name + first page + pincite + (year). Abbreviate per T6 and T13.\n\n' +
      'B16.1.2 — Nonconsecutively paginated journals/magazines: author + title + journal name + date + "at" + page.\n\n' +
      'B16.1.3 — Student-written work: include designation (Comment, Note, etc.) before the title. See R. 16.7.1.\n\n' +
      'B16.1.4 — Newspaper articles: author + title + newspaper name + date + "at" + page.',
    examples: [
      'Fred R. Shapiro & Michelle Pearse, The Most-Cited Law Review Articles of All Time, 110 Mich. L. Rev. 1483, 1489 (2012).',
      'Christopher Hitchens, The New Commandments, Vanity Fair, Apr. 2011, at 1.',
      'Natalie Cotton, Comment, The Competence of Students as Editors of Law Reviews, 154 U. Pa. L. Rev. 951, 982 n.104 (2006).',
      'Abigail Sullivan Moore, This Is Your Brain on Drugs, N.Y. Times, Oct. 29, 2014, at A1.',
    ],
  },
  'B16.2': {
    title: 'Short Form Citation — Periodicals (Bluepages)',
    explanation:
      'Use "id." for periodical material cited in the immediately preceding citation. Otherwise, use "supra" per B15.2.\n\n' +
      'When your document cites more than one source by the same author, include an abbreviated title reference in the supra citation.',
    examples: [
      'Llewellyn, Remarks, supra, at 401–06.',
    ],
  },
  'B17': {
    title: 'Court and Litigation Documents — Bluepages',
    explanation:
      'B17 covers citations to court documents filed in the same case. For documents from a different case, see R. 10.8.3.\n\n' +
      'Abbreviate document titles per Table BT1. Do not abbreviate when it would confuse the reader. Citations may be enclosed in parentheses.',
  },
  'B17.1': {
    title: 'Full Citation — Court Documents (Bluepages)',
    explanation:
      'Include: (1) document name (abbreviated per BT1); (2) pincite; (3) date (if needed); (4) electronic docket number (if applicable).\n\n' +
      'B17.1.1 — Abbreviation: abbreviate per BT1. Always abbreviate "Record" to "R." Do not abbreviate when it would confuse the reader.\n\n' +
      'B17.1.2 — Pincites: precise references (page, line, paragraph). Use colon for page:line (e.g., "15:21–16:4"). No "p." before page numbers, but identify other subdivisions. Use "at" for appellate records (e.g., "R. at 5").\n\n' +
      'B17.1.3 — Date: include when (1) multiple documents have same title; (2) date is relevant; (3) needed to avoid confusion.\n\n' +
      'B17.1.4 — Electronic dockets: add "Dkt. No." for PACER/state e-filed documents. Use original document page numbers, not ECF header page numbers.',
    examples: [
      'Def.\'s Mot. Summ. J. 2, Dkt. No. 15.',
      'Clark Dep. 15:21–16:4.',
      'R. at 9.',
      'Beatrice Aff. ¶ 9, May 10, 2003.',
      'Feder Dep. 5:30–12:10, Dkt. No. 6.',
    ],
  },
  'B17.2': {
    title: 'Short Form Citation — Court Documents (Bluepages)',
    explanation:
      'Use a short form if: (1) it will be clear what you are citing; (2) the full citation is in the same discussion; (3) the reader can easily locate the full citation.\n\n' +
      'For court documents, use "id." only if significant space will be saved. For short documents like record citations ("R."), repeat the full cite rather than using "id."',
    examples: [
      'App. to Pet. Cert. 137–39, Dkt. No. 15. → App. 137–39.',
      'Leach Aff. 33–39. → Id. at 52.',
      'R. at 5. → R. at 12. (not "Id.")',
    ],
  },
  'B18': {
    title: 'The Internet — Bluepages',
    explanation:
      'B18 covers citations to internet sources in court documents and legal memoranda. See B18.1 (full citation) and B18.2 (short form).',
  },
  'B18.1': {
    title: 'Full Citation — Internet (Bluepages)',
    explanation:
      'B18.1.1 — Direct citations include: (1) author name(s) (if applicable); (2) title of specific page (underlined/italicized); (3) title of main website (abbreviated per T6, T10); (4) date and time (if applicable); (5) URL.\n\n' +
      'If available in both HTML and PDF, cite PDF (preserves pagination). Provide pincites when possible.\n' +
      'No date on webpage: use "(last visited [date])." parenthetical.\n\n' +
      'B18.1.2 — Parallel citations: for printed material, you may add a parallel internet citation after the traditional cite.',
    examples: [
      'David Lat, Movie Night with Justice Breyer, Above the L. (Oct. 27, 2014, at 15:31 ET), https://abovethelaw.com/...',
      'Yahoo! Home Page, http://www.yahoo.com (last visited Mar. 18, 2020).',
    ],
  },
  'B18.2': {
    title: 'Short Form Citation — Internet (Bluepages)',
    explanation:
      'Use "id." or "supra" in subsequent citations per R. 4 and R. 18.12.',
    examples: [
      'Lat, supra.',
    ],
  },
  'B19': {
    title: 'Services — Bluepages',
    explanation:
      'Cite services by volume + abbreviated title + publisher + subdivision + date. For cases: include abbreviated court name in the date parenthetical.\n\n' +
      'Looseleaf material that will be bound: add bound form name in parentheses if different; include bound volume if available.',
    examples: [
      'In re Smithfield Est., Inc., [1985–1986 Transfer Binder] Bankr. L. Rep. (CCH) ¶ 70,707 (Bankr. D.R.I. Aug. 9, 1985).',
      'SEC v. Tex. Int\'l Airlines, 29 Fed. R. Serv. 2d (West) 408 (D.D.C. 1979).',
      'Marietta Concrete Co., 3 Lab. Rel. Rep. (BL) (84 Lab. Arb. Rep.) 1,158 (May 7, 1985).',
    ],
  },
  'B20': {
    title: 'Foreign Materials — Bluepages',
    explanation:
      'For any non-U.S. source (English or other language), indicate the jurisdiction parenthetically at the end.\n\n' +
      'Common law cases: indicate the court parenthetically.\n' +
      'Statutes: cite like UK statutes per T2.46, noting jurisdiction parenthetically.\n' +
      'See R. 20 for detailed guidance.',
    examples: [
      'R v. Lockwood, (1782) 99 Eng. Rep. 379 (KB).',
      'Emergency Powers Act (Act No. 3/1976) (Ir.).',
    ],
  },
  'B21': {
    title: 'International Materials — Bluepages',
    explanation:
      'Founding documents: cite by name + article/paragraph + date + source.\n' +
      'Multilateral treaties: title + date + source(s).\n' +
      'Bilateral treaties: title + parties (abbreviated per T10, alphabetical) + article + date + source.\n\n' +
      'International cases: (1) case name; (2) case number; (3) reporter; (4) characterization (judgment, etc.); (5) pincite (prefer ¶); (6) date parenthetical (include court if not evident).\n' +
      'See R. 21 for detailed guidance.',
    examples: [
      'U.N. Charter art. 94, ¶ 1.',
      'U.N. Convention on the Law of the Sea, Dec. 10, 1982, 1833 U.N.T.S. 397.',
      'Treaty of Friendship, Commerce and Navigation, Japan-U.S., art. X, Apr. 2, 1953, 4 U.S.T. 2,063.',
      'Delimitation of Maritime Boundary in Gulf of Maine Area (Can./U.S.), Judgment, 1982 I.C.J. Rep. 560, ¶ 22 (Nov. 5).',
    ],
  },
  'B22': {
    title: 'Tribal Nations — Bluepages',
    explanation:
      'B22.1 — Established citation format: when submitting to a Tribal Nation, follow its prescribed format. For other purposes: (1) if the Tribal Nation has a prescribed format, use it + provide a parallel citation per R. 22; (2) if not, cite per R. 22 with Bluepages typeface.\n\n' +
      'B22.2 — No established format:\n' +
      'Constitutions: (1) constitution name; (2) subdivision (abbreviated per T16); (3) Tribal Nation parenthetical if not evident. Do not abbreviate Tribal Nation names.\n' +
      'Codes: (1) title/chapter number; (2) full code name (Tribal language + [English] if applicable); (3) § number(s); (4) year; (5) URL. Do not abbreviate.\n' +
      'Cases: (1) case name (don\'t abbreviate Tribal parties); (2) case/docket number; (3) (court, date); (4) parentheticals per R. 10.6; (5) URL; (6) subsequent history.\n' +
      'Orders/ordinances/resolutions: (1) name; (2) number; (3) year; (4) (Tribal body); (5) (Tribal Nation if not evident).',
    examples: [
      'HCN Const. art. X, § 1(a)(8), [Const. of the Ho-Chunk Nation art. X, § 1(a)(8)].',
      'Const. of the Mescalero Apache Tribe art. V, § 1.',
      'The People of the Grand Traverse Band of Ottawa and Chippewa Indians v. Gipson, No. 2023-37-AP (Grand Traverse Band Tribal App. Ct. Jan. 17, 2024).',
      'Courtroom Decorum, Administrative Order No. 09-004 (2009) (San Manuel Tribal Court).',
    ],
  },
  'B23': {
    title: 'Archival Sources — Bluepages',
    explanation:
      'Cite archival sources by: (1) author; (2) title; (3) institutional affiliation (if available); (4) date; (5) parenthetical with archival owner, collection, and location.\n\n' +
      'See R. 23 for detailed guidance on author, title, date, archival information, case materials, and tangible objects.',
    examples: [
      'Clarence King & James D. Hague, Report on the Property of the Sierra Iron Company Situated in Sierra and Plumas Counties, California (Feb. 1873) (on file with Brown Univ., John Hay Library, Manuscripts, Box 85, Folder 17).',
    ],
  },
  'BT1': {
    title: 'Court Document Abbreviations (Table BT1)',
    explanation:
      'Table BT1 lists standard abbreviations for court documents. Use these abbreviations in citation sentences and clauses, but spell out document names in textual sentences.\n\n' +
      'Certain words are never abbreviated even in citations: "Bench," "Chambers," "Clerk," "Docket," "Exhibit," "Jury," "Record," "Sidebar," "Trial," "Voir Dire."',
  },
  'BT2': {
    title: 'Jurisdiction-Specific Citation Rules and Style Guides (Table BT2)',
    explanation:
      'Table BT2 lists local court rules and other authorities governing legal citations in specific jurisdictions. Practitioners should always check the most recent version of local rules on official court websites. Courts whose local rules do not offer citation guidance are omitted.\n\n' +
      'BT2.1 — Federal Courts:\n' +
      'Many federal courts have local rules governing citation format. Key provisions include:\n' +
      '• U.S. Courts of Appeals: Several circuits have specific rules on citation of unpublished opinions (e.g., 2d Cir. R. 32.1.1, 5th Cir. R. 47.5.4, 9th Cir. R. 36-3). Some require Bluebook format (e.g., 1st Cir. R. 32.0(b), 6th Cir. R. 28(b)). Others have local citation manuals (e.g., D.C. Cir. Handbook, 7th Cir. Requirements and Suggestions).\n' +
      '• U.S. District Courts: Many districts have local rules on citation of unpublished opinions and general citation format. Several districts mandate Bluebook compliance (e.g., D. Del. LR 7.1.3(a)(3), E.D. Pa. LR 5.1.1).\n' +
      '• U.S. Bankruptcy Courts: Often adopt the local rules of their parent district court.\n' +
      '• Specialty Courts: U.S. Court of International Trade (CIT R. 10.1), U.S. Tax Court (T.C. R. 23(b)), U.S. Court of Appeals for Veterans Claims (Vet. App. R. 28(e)), U.S. Court of Appeals for the Armed Forces (C.A.A.F. R. 37(a)(4)).\n\n' +
      'BT2.2 — State Courts:\n' +
      'State court citation rules vary widely. Key patterns:\n' +
      '• Bluebook-mandated states: Several states require Bluebook-style citations — e.g., Alabama (Ala. R. App. P. 28(a)(10)), California (Cal. R. Ct. 1.200, along with the California Style Manual), Delaware (Del. Sup. Ct. R. 14(g)), New Mexico (N.M. Sup. Ct. R. 23-112(F)), North Carolina (N.C. R. App. P. App. B), Washington (Wash. R. Gen. Application 14 App. 1), Wisconsin (Wis. Stat. 809.19(1)(e)).\n' +
      '• States with own style manuals: California Style Manual, Florida Style Manual, Illinois Style Manual, Massachusetts Reports Style Manual, Michigan Appellate Opinion Manual, New Jersey Manual on Style, New York Law Reports Style Manual, Ohio Writing Manual, Oregon Appellate Courts Style Manual, PAstyle (Pennsylvania), Texas Greenbook, Wisconsin Guide to Citation, among others.\n' +
      '• Public domain citation: Some states use public domain citation systems (e.g., Louisiana, North Dakota, Oklahoma, South Dakota).\n' +
      '• Local rule abbreviations: Most states prescribe specific abbreviations for their own rules of procedure (e.g., "Fla. R. App. P. __", "Ohio App.R. __", "Tex. R. Civ. P. __").\n' +
      '• Unpublished opinions: Many states have specific rules governing citation of unpublished or non-precedential opinions.\n\n' +
      'BT2.3 — Territories:\n' +
      'U.S. territories have their own citation conventions:\n' +
      '• Guam: Guam Code Ann. cited as "__ GCA __"; Superior Court mandates Bluebook format (Guam Super. Ct. Gen. R. 4.1).\n' +
      '• Northern Mariana Islands: Has its own Supreme Court Style Manual (2017); rules specify citation formats for civil, criminal, probate, traffic, and tax matters.\n' +
      '• Puerto Rico: P.R. Sup. Ct. R. 44(d) governs citation of unpublished opinions.\n' +
      '• Virgin Islands: V.I. Code Ann. cited as "__ V.I.C. __"; appellate rules mandate Bluebook citations (V.I. R. App. P. 15(b)).',
  },
  'B12': {
    title: 'Statutes — Bluepages',
    explanation:
      'Cite statutes to the current official code when available. A federal statute citation includes: title number, code abbreviation (U.S.C.), section symbol (§), and section number.\n\n' +
      'Source hierarchy: official code > unofficial code > session laws > electronic database.\n\n' +
      'Federal official code (U.S.C.): year is optional. State codes: include the year. Unofficial codes: include the publisher (West, LexisNexis).',
    examples: [
      '42 U.S.C. § 1983.',
      '28 U.S.C. § 1291 (2012).',
      '42 U.S.C.A. § 300a-7 (West 2001).',
    ],
  },
  'B12.1': {
    title: 'Full Citation — Statutes (Bluepages)',
    explanation:
      'B12.1.1 — Federal statutes: include (1) official/popular name of act; (2) published source. May include year parenthetical.\n' +
      'Codes: (1) title number; (2) abbreviated code name; (3) § + section numbers; (4) year of code edition (optional for U.S.C., required for others). Unofficial codes: add publisher in parenthetical.\n' +
      'To cite a specific provision: include the original section number of the act before the code cite.\n' +
      'Session laws (Stat.): (1) name; (2) Pub. L. No.; (3) section; (4) volume Stat. + first page; (5) year. Omit year parenthetical if name includes year of enactment.\n\n' +
      'B12.1.2 — State statutes: cite official code per T1.3. Include: (1) abbreviated code name; (2) section number(s); (3) year of code edition. Unofficial: add publisher.\n\n' +
      'B12.1.3 — Procedural rules, restatements, uniform acts: cite by abbreviated name + rule/section number. No underlining. See R. 12.9.\n\n' +
      'B12.1.4 — Federal tax materials: may use "I.R.C." instead of "26 U.S.C." In court documents discussing only current tax law, may omit year/publisher parenthetical. Treasury regs: "Treas. Reg. §..." Treasury determinations: use Cumulative Bulletin abbreviations (Rev. Rul., P.L.R., G.C.M.).',
    examples: [
      'Comprehensive Environmental Response, Compensation, and Liability Act, 42 U.S.C. §§ 9601–9675.',
      'Department of Transportation Act, Pub. L. No. 89-670, § 9, 80 Stat. 931, 944–47 (1966).',
      'Administrative Procedure Act § 6, 5 U.S.C. § 555.',
      '15 U.S.C.A. § 205 (West).',
      'Wash. Rev. Code § 28B.20.020 (2014).',
      'Cal. Penal Code § 181 (West 2011).',
      'Fed. R. Civ. P. 12(b)(6).',
      'Restatement (Second) of Contracts § 90 (A.L.I. 1981).',
      'I.R.C. § 61.',
      'Treas. Reg. § 1.72-16(a) (1963).',
      'Rev. Rul. 83-137, 1983-2 C.B. 41.',
    ],
  },
  'B12.2': {
    title: 'Short Form Citation — Statutes (Bluepages)',
    explanation:
      'First mention requires a full citation. Subsequent citations in the same discussion may use any short form that clearly identifies the source (see R. 12.10, R. 13.8, R. 14.6).\n\n' +
      'Use "id." to refer to a statute/regulation codified within the same title as the immediately preceding citation. For a different provision within the same title, use "Id. § [new section]."',
    examples: [
      '28 U.S.C. § 1331. → Id. (same provision) or Id. § 1332 (different provision, same title).',
      '50 C.F.R. § 10.12 (2019). → Id. § 10.13(c)(1).',
      'Restatement (Second) of Contracts § 90 (A.L.I. 1981). → Id. § 92.',
    ],
  },
  'R. 12': {
    title: 'Statutes (Detailed)',
    explanation:
      'Cite statutes to the current official code (U.S.C.) when possible. Include:\n' +
      '1. Title number (before the code name for federal codes)\n' +
      '2. Code abbreviation (from Table T1)\n' +
      '3. Section symbol (§) and section number\n' +
      '4. Year of the code edition (optional for official U.S.C.)\n\n' +
      'For statutes with popular names: include the name and original section before the code citation.\n' +
      'For session laws: include Pub. L. No., section, volume Stat., and page.\n' +
      'For amended/repealed statutes: note per R. 12.7.',
    examples: [
      '42 U.S.C. § 1983.',
      'National Environmental Policy Act of 1969 § 102, 42 U.S.C. § 4332.',
      'National Environmental Policy Act of 1969, Pub. L. No. 91-190, § 102, 83 Stat. 852, 853.',
    ],
  },
  'R. 12.1': {
    title: 'Basic Citation Forms for Statutes',
    explanation:
      'Cite to the current official code when available. Hierarchy of preference:\n' +
      '1. Current official code (U.S.C.)\n' +
      '2. Current unofficial code (U.S.C.A., U.S.C.S.)\n' +
      '3. Official session laws (Statutes at Large)\n' +
      '4. Privately published session laws\n' +
      '5. Commercial electronic database\n' +
      '6. Looseleaf service, internet, newspaper',
  },
  'R. 12.2': {
    title: 'Choosing the Proper Statute Citation Form',
    explanation:
      'Statutes currently in force: cite to current official or unofficial code.\n' +
      'Statutes no longer in force: cite to the code if still appears; otherwise cite session laws. Must note repeal/amendment per R. 12.7.\n' +
      'Private laws: cite session laws.\n\n' +
      'Exceptions: cite session laws for scattered statutes (indicate codified location parenthetically), for historical facts of enactment, or when code language differs materially from session law language.',
  },
  'R. 12.3': {
    title: 'Current Official and Unofficial Codes',
    explanation:
      'Required elements: abbreviated code name (from Table T1), section/paragraph number(s), and year of the code.\n\n' +
      'Title/volume: required if code is divided into separately sectioned titles. Federal: title number BEFORE code name (e.g., "42 U.S.C.").\n' +
      'Publisher: include in parenthetical UNLESS published by/under supervision of federal or state officials.\n' +
      'Supplements: cite per Rule 3.1(c).',
    examples: [
      '42 U.S.C. § 1983.',
      'Del. Code Ann. tit. 13, § 1301 (1999).',
      '42 U.S.C.A. § 300a-7 (West 2001).',
      '18 U.S.C. § 510(b) (Supp. I 1983).',
    ],
  },
  'R. 12.3.1(a)': {
    title: 'Statute Name and Original Section Number',
    explanation:
      'Include the statute name only if it is commonly cited that way or aids identification. Omit "The" as the first word. Include the year if it is part of the official title.',
    examples: [
      'Labor Management Relations (Taft-Hartley) Act § 301(a), 29 U.S.C. § 185(a).',
    ],
  },
  'R. 12.3.2': {
    title: 'Year of Code',
    explanation:
      'Federal code (official or unofficial): date is not required but may be included.\n' +
      'State codes: provide year from spine > title page > copyright, in that order.\n' +
      'Supplements: year from title page of supplement/pocket part.\n' +
      'Both main volume and supplement: give both years per Rule 3.1(c).',
  },
  'R. 12.2.1': {
    title: 'Choosing the Proper Citation Form — General Rule',
    explanation:
      'Statutes currently in force: cite to the current official code or its supplement. For statutes no longer in force, cite the code if still therein; otherwise, cite session laws. Note invalidation, repeal, or amendment per R. 12.7.\n\n' +
      'Private laws: cite session laws if available; otherwise cite a secondary source.',
    examples: [
      'National Environmental Policy Act of 1969 § 102, 42 U.S.C. § 4332.',
      'Law of June 1, 1895, ch. 4322, § 23, 1895 Fla. Laws 3, 20–21 (repealed 1969).',
      'Priv. L. No. 94-75, 90 Stat. 2985 (1976).',
    ],
  },
  'R. 12.2.2': {
    title: 'Choosing the Proper Citation Form — Exceptions',
    explanation:
      'Scattered statutes: cite session laws when no useful code citation is possible. Indicate codified location parenthetically.\n\n' +
      'Historical fact: cite session laws for the historical fact of enactment, amendment, or repeal.\n\n' +
      'Materially different language: cite session laws when code language differs materially and the title has not been enacted into positive law.',
    examples: [
      'Tax Reduction Act of 1975, Pub. L. No. 94-12, 89 Stat. 26 (codified as amended in scattered sections of 26 U.S.C.).',
      'Robinson-Patman Act, 15 U.S.C. §§ 13–13b, 21a.',
    ],
  },
  'R. 12.3.1': {
    title: 'Additional Information for Code Citations',
    explanation:
      'Additional information may be required:\n' +
      '(a) Name/original section: include if commonly cited that way\n' +
      '(b) Title/chapter/volume: required if code has separately numbered divisions\n' +
      '(c) Subject-matter codes: give subject name as part of code abbreviation\n' +
      '(d) Publisher: required for unofficial codes not published by government\n' +
      '(e) Supplements: cite per R. 3.1(c)\n' +
      '(f) Uncodified laws: cite compilation\n' +
      '(g) Appendices: cite as R. 3.4\n' +
      '(h) Notes: add parenthetical identifying the note',
    examples: [
      'Labor Management Relations (Taft-Hartley) Act § 301(a), 29 U.S.C. § 185(a).',
      'Del. Code Ann. tit. 13, § 1301 (1999).',
      'Cal. Veh. Code § 11506 (West 2000).',
      '18 U.S.C. § 510(b) (Supp. I 1983).',
      '50 U.S.C. app. § 5.',
    ],
  },
  'R. 12.4': {
    title: 'Session Laws',
    explanation:
      'Always give the statute name + public law or chapter number. Omit "The" as the first word. Use official or popular name, or both.\n\n' +
      'Format: [Name], Pub. L. No. [number], § [section], [vol] Stat. [page], [pincite] ([year]).\n\n' +
      'Volume: give volume number (or year) + abbreviated session law name. State: begin with state name per T10.\n\n' +
      'In session law amendments, "sec." refers to the bill\'s sections, while "§" refers to the amended act\'s sections.\n\n' +
      'Omit the year of passage if the same year appears in the statute name or session laws.',
    examples: [
      'National Environmental Policy Act of 1969, Pub. L. No. 91-190, § 102, 83 Stat. 852, 853 (1970).',
      'White-Slave Traffic (Mann) Act, ch. 395, 36 Stat. 825 (1910) (codified as amended at 18 U.S.C. §§ 2421–2424).',
      'Act of Aug. 21, 1974, ch. 85, 1974 N.J. Laws 385.',
      'Labor-Management Relations Act, ch. 120, sec. 101, § 8(a)(3), 61 Stat. 136, 140–41 (1947).',
    ],
  },
  'R. 12.5': {
    title: 'Electronic Databases and Online Sources for Statutes',
    explanation:
      'When citing a code from an electronic database, give parenthetically: publisher name (unless government-published), database name, and currency information as provided by the database.\n\n' +
      'When states/municipalities publish official statutes online, the online source may be directly cited.\n' +
      'Authentic/official online copies may be cited as if they were print.\n' +
      'Unofficial online sources: cite per R. 18.2.2.',
    examples: [
      '18 U.S.C.S. § 1956 (LexisNexis, LEXIS through Pub. L. No. 113-108).',
      '18 U.S.C.A. § 1956 (West, Westlaw through Pub. L. No. 113-93).',
      'Bellingham, Wash., Mun. Code § 16.60.060 (2015), http://www.codepublishing.com/WA/Bellingham/.',
    ],
  },
  'R. 12.6': {
    title: 'Other Secondary Sources for Statutes',
    explanation:
      'When citing to sources other than codes, session laws, or electronic databases: give statute name + public law/chapter number as if citing session laws.\n\n' +
      'Prefer citing federal statutes to U.S.C.C.A.N. if available, indicating the Statutes at Large volume and page.\n\n' +
      'If a recent statute is unpublished in any source: give name, public law/chapter number, section, full date of enactment, and future location if known.',
    examples: [
      'Act of July 19, 1985, Pub. L. No. 99-68, 1985 U.S.C.C.A.N. (99 Stat.) 166.',
      'Alabama Corporate Income Tax Reform Act, No. 85-515 (May 8, 1985).',
    ],
  },
  'R. 12.9': {
    title: 'Special Citation Forms for Statutes',
    explanation:
      'Special citation forms exist for:\n' +
      '• Internal Revenue Code: "26 U.S.C." may be replaced with "I.R.C."\n' +
      '• Ordinances: cite analogously to statutes with political subdivision + state\n' +
      '• Rules of evidence/procedure: cite in small caps without a date (for current rules)\n' +
      '• Model codes, restatements, sentencing guidelines: cite by section with author and year\n' +
      '• ABA ethics: cite by canon, rule, EC, or DR number',
  },
  'R. 12.9.1': {
    title: 'Internal Revenue Code',
    explanation:
      'In citations to the Internal Revenue Code, "26 U.S.C." may be replaced with "I.R.C." Unofficial code citations should identify the publisher parenthetically.',
    examples: [
      'I.R.C. § 61.',
      'I.R.C. § 1371 (West Supp. 1991).',
    ],
  },
  'R. 12.9.2': {
    title: 'Ordinances',
    explanation:
      'Cite ordinances analogously to statutes. Always include the political subdivision name and abbreviated state name at the beginning. If codified, give code name, section, and year. If uncodified, give ordinance number and exact date of adoption.\n\n' +
      'Do not abbreviate the subdivision name unless it appears in Table T10.',
    examples: [
      'Montgomery, Ala., Code § 3A-11 (1971).',
      'S.F., Cal., Police Code art. 16, div. 1, § 1076(a) (2000).',
      'S.J., Cal., Ordinance 16,043 (Jan. 17, 1972).',
    ],
  },
  'R. 12.9.3': {
    title: 'Rules of Evidence and Procedure',
    explanation:
      'Cite current rules of evidence or procedure without a date. Use standard abbreviations:\n' +
      '• Fed. R. Civ. P. (Federal Rules of Civil Procedure)\n' +
      '• Fed. R. Crim. P. (Federal Rules of Criminal Procedure)\n' +
      '• Fed. R. App. P. (Federal Rules of Appellate Procedure)\n' +
      '• Fed. R. Evid. (Federal Rules of Evidence)\n' +
      '• Sup. Ct. R. (Supreme Court Rules)\n\n' +
      'For rules no longer in force: give official source and indicate repeal parenthetically.',
    examples: [
      'Fed. R. Civ. P. 12(b)(6).',
      'Fed. R. Crim. P. 42(a).',
      'Fed. R. Evid. 410.',
      'Sup. Ct. R. 17.',
    ],
  },
  'R. 12.9.4': {
    title: 'Model Codes, Restatements, Standards, and Uniform Acts',
    explanation:
      'Cite by section, rule, or relevant subdivision. Include the author parenthetically (abbreviated per R. 15.1(c)) and the year.\n\n' +
      'Restatements: give year of publication. Model codes/standards/guidelines: give year of adoption (or last amendment).\n' +
      'Uniform acts cited as general law: cite as separate code with author.\n' +
      'Uniform acts cited as state law: cite as state code.\n\n' +
      'For tentative/proposed drafts: indicate parenthetically with draft number and year.\n' +
      'Comments, notes, illustrations: cite per R. 3.4.',
    examples: [
      'Restatement (Third) of Unfair Competition § 3 (A.L.I. 1995).',
      "U.S. Sent'g Guidelines Manual § 2D1.1(c) (U.S. Sent'g Comm'n 2021).",
      "U.C.C. § 2-314 (A.L.I. & Unif. L. Comm'n 1977).",
      "Unif. Tr. Code § 105 (Unif. L. Comm'n 2000).",
      'Restatement (Second) of Torts § 847A (A.L.I., Tentative Draft No. 17, 1974).',
    ],
  },
  'R. 12.9.5': {
    title: 'ABA Code of Professional Responsibility and Ethics Opinions',
    explanation:
      'Cite the Model Code of Professional Responsibility and Model Rules of Professional Conduct per R. 12.9.4.\n\n' +
      'Ethical considerations: "EC" + number. Disciplinary rules: "DR" + number.\n' +
      'ABA ethics opinions: cite by issuing body, opinion number, and year.',
    examples: [
      'Model Code of Pro. Resp. Canon 2 (A.B.A. 1980).',
      'Model Rules of Pro. Conduct r. 3.12 (A.B.A., Discussion Draft 1983).',
      "A.B.A. Comm. on Ethics & Pro. Resp., Formal Op. 338 (1974).",
    ],
  },
  'R. 12.10': {
    title: 'Short Forms for Statutes',
    explanation:
      'After a full citation, subsequent references may use a short form if the statute has been cited in the same footnote or is readily found in one of the preceding five footnotes.\n\n' +
      'Named statutes: use statute name + §, or just §.\n' +
      'U.S. Code: may use just § + section number if unambiguous.\n' +
      'State codes (numbered): drop to tit. + § or just §.\n' +
      'State codes (named): use subject abbreviation + § (e.g., "Educ. § 48222").\n' +
      'Session laws: use § + section number, optionally with "Stat. at [pincite]".\n\n' +
      '"Id." is always available. Spell out "section" in running text (except U.S.C. references). Use "§" in citation sentences/clauses.',
    examples: [
      '42 U.S.C. § 1983 (short form for U.S. Code).',
      '§ 1983 (minimal short form).',
      'Administrative Procedure Act § 1.',
      'tit. 28, § 1701 (state numbered code short form).',
      'Educ. § 48222 (state named code short form).',
    ],
  },
  'R. 12.8': {
    title: 'Explanatory Parenthetical Phrases for Statutes',
    explanation:
      'Use explanatory parentheticals to: show code location of statutes cited to session laws, identify useful dates (effective dates), indicate invalidation/repeal/amendment, or give any other relevant information.\n\n' +
      'See generally R. 1.5 for parenthetical formatting rules.',
    examples: [
      '5 U.S.C. § 553(b) (requiring agencies to publish notice of proposed rulemaking in the Federal Register).',
      'Act of July 12, 1985, ch. 223, § 3, 1985 Cal. Legis. Serv. 239, 241 (West) (to be codified at Cal. Ins. Code § 11589.5).',
    ],
  },
  'R. 13': {
    title: 'Legislative Materials',
    explanation:
      'The legislative process generates: bills and resolutions (R. 13.2), committee hearings (R. 13.3), reports/documents/committee prints (R. 13.4), floor debates (R. 13.5), and separately bound legislative histories (R. 13.6).\n\n' +
      'For U.S. legislative materials (except debates), include: title (if relevant), abbreviated house name, Congress number, material number, and year of publication.\n\n' +
      'Abbreviations for commonly used words are in Table T9. Include session number parenthetically for older materials.',
  },
  'R. 13.1': {
    title: 'Basic Citation Forms for Legislative Materials',
    explanation:
      'Standard formats for legislative materials:\n' +
      '• Bills: [Name,] H.R./S. [number], [Cong.] [§ section] ([year]).\n' +
      '• Resolutions: H.R.J. Res./S.J. Res. [number], [Cong.] ([year]).\n' +
      '• Hearings: [Title]: Hearing Before [Comm.], [Cong.] [page] ([year]) (statement of [witness]).\n' +
      '• Reports: H.R./S. Rep. No. [Cong.]-[number], at [page] ([year]).\n' +
      '• Debates: [vol] Cong. Rec. [page] (daily ed. [date]) (statement of [speaker]).\n' +
      '• Committee prints: [Author], [Cong.], [Title] [page] (Comm. Print [year]).',
  },
  'R. 13.2': {
    title: 'Bills and Resolutions',
    explanation:
      'Unenacted federal bills: include name (if relevant), abbreviated house, bill number, Congress number, section (if any), and year.\n\n' +
      'Resolution abbreviations: H.R. Res., S. Res., H.R. Con. Res., S. Con. Res., H.R.J. Res., S.J. Res.\n\n' +
      'Enacted simple/concurrent resolutions: cite as unenacted bills with "(enacted)" parenthetical.\n' +
      'State bills: include legislative body, bill number, legislature number, session, state abbreviation, and year.',
    examples: [
      'S. 516, 105th Cong. § 2 (1997).',
      'Clear Skies Act, S. 485, 108th Cong. (2003).',
      'H.R.J. Res. 124, 105th Cong. (1998).',
      'S. Res. 141, 106th Cong. (1999) (enacted).',
      'H.B. 636, 1999 Gen. Assemb., 413th Sess. (Md. 1999).',
    ],
  },
  'R. 13.3': {
    title: 'Hearings',
    explanation:
      'Include: entire subject matter title from cover, bill number (if any), subcommittee name (if any), committee name, Congress number, page number, year, and witness statement parenthetical.\n\n' +
      'Abbreviate committee/subcommittee names per Tables T6, T9, T10.\n' +
      'State hearings: same format but include legislative session number.',
    examples: [
      'Protection from Personal Intrusion Act: Hearing on H.R. 2448 Before the H. Comm. on the Judiciary, 105th Cong. 56–57 (1998) (statement of Richard Masur, President, Screen Actors Guild).',
    ],
  },
  'R. 13.4': {
    title: 'Reports, Documents, and Committee Prints',
    explanation:
      'Numbered reports: [H.R./S.] Rep. No. [Cong.]-[number], at [page] ([year]).\n' +
      'Conference reports: add "(Conf. Rep.)" parenthetically.\n' +
      'Documents: H.R. Doc. No. / S. Doc. No.\n' +
      'Committee prints: cite as institutional author works — [Author], [Cong.], [Title] [page] (Comm. Print [year]).\n' +
      'Legislative agency reports (CRS, GAO): cite as institutional authors with report number in title.\n\n' +
      'Give parallel citation to U.S.C.C.A.N. when possible.',
    examples: [
      'H.R. Rep. No. 99-253, pt. 1, at 54 (1985).',
      'S. Rep. No. 84-2, at 7 (1955).',
      'H.R. Rep. No. 98-1037, at 3 (1984) (Conf. Rep.).',
      'H.R. Doc. No. 82-563, at 29–30 (1953).',
      'Staff of S. Comm. on the Judiciary, 81st Cong., Report on Antitrust Law 17 (Comm. Print 1950).',
      "U.S. Gov't Accountability Off., GAO-08-751, Food and Drug Administration 27 (2008).",
    ],
  },
  'R. 13.5': {
    title: 'Debates',
    explanation:
      'After 1873: cite to the Congressional Record ("Cong. Rec."). Use the daily edition only if not yet in the permanent edition.\n\n' +
      'Daily edition: includes H, S, E prefixes before page numbers + "(daily ed. [date])" parenthetical.\n' +
      'Permanent edition: continuous pagination, no prefixes.\n\n' +
      'Before 1873: Cong. Globe (1837–1873), Reg. Deb. (1824–1837), Annals of Cong. (1789–1824).',
    examples: [
      '123 Cong. Rec. 17147 (1977).',
      '131 Cong. Rec. S11465–66 (daily ed. Sep. 13, 1985) (statement of Sen. Malcolm Wallop).',
      "Cong. Globe, 36th Cong., 1st Sess. 1672 (1860).",
    ],
  },
  'R. 13.6': {
    title: 'Separately Bound Legislative Histories',
    explanation:
      'Some important acts have separately published legislative histories. Give a parallel citation to the separate publication using "reprinted in" per R. 15 (books/nonperiodic materials).',
    examples: [
      'H.R. Rep. No. 80-245, at 6 (1947), reprinted in 1 NLRB, Legislative History of the Labor-Management Relations Act, 1947, at 292, 297 (1948).',
    ],
  },
  'R. 13.7': {
    title: 'Electronic Media and Online Sources for Legislative Materials',
    explanation:
      'Commercial databases: give database name and identifying codes/numbers. Include database name parenthetically if not clear from the identifier.\n\n' +
      'Internet/online: cite print source if accessible. Cite electronic source when print is difficult to obtain or the authority has designated the electronic version as official. Follow R. 18 for authentication.',
    examples: [
      "H.R. 3781, 104th Cong. § 2(b) (1996), 1996 CONG US HR 3781 (Westlaw).",
      'H.R. Rep. No. 92-98 (1971), reprinted in 1971 U.S.C.C.A.N. 1017, 1971 WL 11312.',
    ],
  },
  'R. 13.8': {
    title: 'Short Forms for Legislative Materials',
    explanation:
      'After a full citation, use short forms that clearly identify the material. "Id." is always available.\n\n' +
      'Short form examples:\n' +
      '• Federal bill: H.R. 3055 (drop Congress and year)\n' +
      '• State resolution: Okla. S. Res. 20 (add state abbreviation)\n' +
      '• Federal report: H.R. Rep. No. 92-98 (drop year)\n' +
      '• Federal document: H.R. Doc. No. 94-208 (drop year)\n\n' +
      'In text: use full names (e.g., "House Bill 3055", "House Report 98").\n' +
      'For electronic sources: use database identifier in short form.',
  },
  'R. 15': {
    title: 'Books, Reports, and Other Nonperiodic Materials',
    explanation:
      'This rule governs books, treatises, reports, white papers, dictionaries, encyclopedias, and all other nonperiodic materials.\n\n' +
      'Citation elements: Author (R. 15.1), Editor/translator (R. 15.2), Title (R. 15.3), Page/section/paragraph (R. 3.2–3.3), Edition (R. 15.4), Publisher (R. 15.4), Date (R. 15.4).',
  },
  'R. 12.7': {
    title: 'Invalidation, Repeal, Amendment, and Prior History',
    explanation:
      'When citing a statute no longer in force or subsequently changed:\n\n' +
      'Invalidation: indicate by citing the invalidating case in full, introduced by "invalidated by."\n\n' +
      'Repeal: indicate the date of repeal parenthetically "(repealed [year])" or cite the repealing statute in full with "repealed by."\n\n' +
      'Amendment: indicate parenthetically "(amended [year])" or cite the amending statute in full with "amended by," or cite the current version parenthetically "(current version at [code cite])."\n\n' +
      'Prior history: may be given parenthetically when relevant — "(amending [prior cite])," "(originally enacted as [cite])," "(corresponds to [cite])."',
    examples: [
      'Law of June 1, 1895, ch. 4322, § 23, 1895 Fla. Laws ch. 3, 20–21 (repealed 1969).',
      'RFRA of 1993, Pub. L. No. 103-141, 1993 U.S.C.C.A.N. (107 Stat.) 1488, invalidated by, City of Boerne v. Flores, 521 U.S. 507 (1997).',
      '33 U.S.C. § 1232 (1982), amended by, 33 U.S.C. § 1232(f) (Supp. I 1983).',
      'Clayton Act, ch. 323, § 7, 38 Stat. 730, 731–32 (1914) (current version at 15 U.S.C. § 18).',
    ],
  },
  'R. 14': {
    title: 'Administrative and Executive Materials',
    explanation:
      'Rule 14 covers regulations (C.F.R., Fed. Reg.), administrative adjudications, arbitrations, attorney general opinions, executive orders, and related materials.\n\n' +
      'Sub-rules: R. 14.1 (Basic Citation Forms), R. 14.2 (Rules, Regulations, and Other Publications), R. 14.3 (Administrative Adjudications and Arbitrations), R. 14.4 (State Materials), R. 14.5 (Commercial Electronic Databases), R. 14.6 (Short Forms for Regulations).',
  },
  'R. 14.1': {
    title: 'Basic Citation Forms — Administrative Materials',
    explanation:
      'Basic forms for the most common types of administrative and executive materials:\n\n' +
      '• Federal regulation (C.F.R.): Name (if commonly cited), title C.F.R. § section (year).\n' +
      '• Federal regulation (Fed. Reg.): Name, volume Fed. Reg. page (date) (codification info).\n' +
      '• Administrative adjudication: Name, volume Reporter page (year).\n' +
      '• Arbitration: Name, volume Reporter page (year) (Arbitrator).',
    examples: [
      'FTC Credit Practices Rule, 16 C.F.R. § 444.1 (2019).',
      'Importation of Fruits and Vegetables, 60 Fed. Reg. 50379 (Sep. 29, 1995) (to be codified at 7 C.F.R. pt. 300).',
      'Reichhold Chems., Inc., 91 F.T.C. 246 (1978).',
      'Charles P. Ortmeyer, 23 Indus. Arb. 272 (1980) (Stern, Arb.).',
    ],
  },
  'R. 14.2': {
    title: 'Rules, Regulations, and Other Publications',
    explanation:
      'Cite federal rules and regulations to C.F.R. by title, section or part, and year. Cite the most recent edition. Include the name only if commonly cited or helpful for identification.\n\n' +
      '(a) Final rules: cite to C.F.R. when possible; cite to Fed. Reg. before codification, giving volume, page, date, and where the rule will be codified. Title 26 Treasury Regulations see T1.2; Title 48 FAR may be cited as "FAR."\n\n' +
      '(b) Proposed rules: follow final-rule form but add status to date parenthetical — e.g., "(proposed Mar. 7, 1991)."\n\n' +
      '(c) Regular reports: cite like periodical materials (R. 16), giving abbreviated agency name first.\n\n' +
      '(d) Other publications: cite as institutional author works (R. 15.1(c)), including serial numbers if any.',
    examples: [
      '47 C.F.R. § 73.609 (2024).',
      'FCC Broadcast Radio Services, 47 C.F.R. § 73.609 (2024).',
      'Importation of Fruits and Vegetables, 60 Fed. Reg. 50379, 50381 (Sep. 29, 1995) (to be codified at 7 C.F.R. pts. 300, 319).',
      'Control of Air Pollution from New Motor Vehicles, 56 Fed. Reg. 9754 (proposed Mar. 7, 1991) (to be codified at 40 C.F.R. pt. 86).',
      'FAR 52.249-2(e) (2019).',
      '4 NLRB Ann. Rep. 93 (1939).',
    ],
  },
  'R. 14.3': {
    title: 'Administrative Adjudications and Arbitrations',
    explanation:
      'Cite administrative cases like court cases (R. 10) with these exceptions:\n\n' +
      'R. 14.3.1 — Names: Cite by first-listed private party or official subject-matter title. Omit all procedural phrases ("In the Matter of," "In re"). For agencies with internal adjudication layers, include a parenthetical indicating the adjudicatory body.\n\n' +
      'R. 14.3.2 — Sources: (a) cite official reporter if available; (b) if not, cite official release or slip opinion with full date; (c) if only in a service or online, cite per R. 19 or R. 18.2.\n\n' +
      'R. 14.3.3 — Issuing Agency: include the agency name in the date parenthetical if not apparent from the source name.',
    examples: [
      'Trojan Transp., Inc., 249 NLRB 642 (1980).',
      'Tyson Farms, Inc., 72 Agric. Dec. 399 (U.S.D.A. A.L.J. 2013).',
      'Kroger Co. v. Amalgamated Meat Cutters, Local 539, 74 Lab. Arb. Rep. (BL) 785, 787 (1980) (Doering, Arb.).',
      'Gen. Dynamics Corp., 50 Fed. Reg. 45949 (U.S. Dep\'t of Lab. Nov. 5, 1985).',
    ],
  },
  'R. 14.3.1': {
    title: 'Names of Administrative Adjudications',
    explanation:
      '(a) Administrative adjudications: cite by the reported name of the first-listed private party (abbreviated per R. 10.2) or by the official subject-matter title. Omit all procedural phrases ("In the Matter of," "In re"). For agencies with multiple layers of internal adjudication, include a parenthetical indicating the adjudicatory body.\n\n' +
      '(b) Arbitrations: cite as court cases if adversary parties are named; cite as administrative adjudications if not. Indicate the arbitrator\'s name parenthetically.',
    examples: [
      'Trojan Transp., Inc., 249 NLRB 642 (1980). — NOT: In the Matter of Trojan Transp., Inc.',
      'Tyson Farms, Inc., 72 Agric. Dec. 399 (U.S.D.A. A.L.J. 2013).',
      'Charles P. Ortmeyer, 23 Indus. Arb. 272 (1980) (Stern, Arb.).',
    ],
  },
  'R. 14.3.2': {
    title: 'Which Source(s) to Cite — Admin Adjudications',
    explanation:
      '(a) Official reporters: cite the official reporter of the agency if the opinion appears therein.\n\n' +
      '(b) Official releases and slip opinions: if not in an official reporter, cite the official release or slip opinion with the full date, publication number, and case/investigation number. Append a parallel citation to an unofficial reporter or service when possible. Once the official reporter is issued, cite only to that reporter.\n\n' +
      '(c) Services and electronic databases: if only available from a service or on the agency\'s website, cite per R. 19 (services) or R. 18.2 (internet sources).',
    examples: [
      'Tenn. Intrastate Rates & Charges, 286 I.C.C. 41 (1952).',
      'Rosenberg Libr. Ass\'n, 269 NLRB No. 197, 1983–1984 NLRB Dec. (CCH) ¶ 16,238 (Apr. 24, 1984).',
      'Rosenberg Libr. Ass\'n, 269 NLRB 1173 (1984). — once official reporter is issued',
    ],
  },
  'R. 14.3.3': {
    title: 'Issuing Agency',
    explanation:
      'If the name of the issuing agency is not apparent from the name of the source, include the agency name (abbreviated per R. 15.1(e)) in the parenthetical containing the date.',
    examples: [
      'Gen. Dynamics Corp., 50 Fed. Reg. 45949 (U.S. Dep\'t of Lab. Nov. 5, 1985).',
    ],
  },
  'R. 14.4': {
    title: 'State Administrative Materials',
    explanation:
      '(a) Rules and regulations: cite according to T1.3 for both proposed and final rules.\n\n' +
      '(b) Reports and other publications: cite per R. 14.2(c) and R. 14.2(d).\n\n' +
      '(c) Administrative adjudications: cite per R. 14.3 if there is an official reporter. If not, cite the name per R. 14.3.1, the case number, an electronic database citation, and include a parenthetical with the state name (T10), agency name (T6), and year. For pincites without official reporters, use "at" after the database citation or case number.',
    examples: [
      'Cal. Code Regs. tit. 2, § 22999 (2024).',
      'Emily Burke, No. 12-0008 RI, 2012 WL 1061151 (Mo. Admin. Hearing Comm\'n 2012).',
      'Dep\'t of Nat. Res. Grant of the Confidentiality Request of Badger Mining Corp., No. DNR-16-0006, 2017 WL 8222649, at *3 (Wis. Div. of Hearings & Appeals 2017).',
    ],
  },
  'R. 14.5': {
    title: 'Commercial Electronic Databases — Admin Materials',
    explanation:
      'When citing administrative materials from a commercial electronic database, give the name of the database and any identifying codes or numbers that uniquely identify the material. If the database name is not clear from the identifier, include it parenthetically.',
    examples: [
      'FTC Credit Practices Rule, 16 C.F.R. § 444.1 (2000), WL 16 CFR § 444.1.',
      'Reichhold Chems., Inc., 91 F.T.C. 246 (1978), 1978 WL 206094.',
      'Rev. Rul. 86-71, 1986-1 C.B. 102, 1986 IRB LEXIS 189.',
    ],
  },
  'R. 14.6': {
    title: 'Short Forms for Regulations',
    explanation:
      '(a) Main text: use the forms in the "Text" column to refer to regulations in law review text.\n\n' +
      '(b) Footnote text: similarly use the "Text" column forms in footnote text.\n\n' +
      '(c) Citations: use short citation forms if the regulation is already cited in either the same footnote or can be readily found (including "id.") in one of the preceding five footnotes.\n\n' +
      'C.F.R. short form: drop the name and year — e.g., "16 C.F.R. § 444.1" or just "§ 444.1."\n' +
      'Fed. Reg. short form: use the name and "at" pincite — e.g., "Importation of Fruits and Vegetables, 60 Fed. Reg. at 50381."\n\n' +
      '(d) Electronic sources: see R. 18.12.',
  },
  'R. 15.1': {
    title: 'Author',
    explanation:
      'Give the author\'s full name as it appears on the publication, including designations like "Jr." or "III." Do NOT include titles like "Dr.," "Prof.," "Judge," or "Justice." Use small capitals.\n\n' +
      '(a) Two or three authors: list in title-page order. Two: separate with "&." Three: commas except final name with "&" (no Oxford comma).\n\n' +
      '(b) More than three authors: use first author + "et al." when saving space; list all when particularly relevant.\n\n' +
      '(c) Institutional authors: begin with the author\'s complete name, abbreviated per R. 15.1(e). When an individual is credited on behalf of an institution, list both.\n\n' +
      '(d) Pen names: use quotation marks around obvious aliases. If the real author is known, add their name in parentheses.\n\n' +
      '(e) Abbreviations: abbreviate institutional author names per T6 and T10; omit "Inc.," "Ltd.," etc. when another business indicator is present.\n\n' +
      '(f) Tribal affiliation: may be included in parentheses after the first mention of the author\'s name.',
    examples: [
      'Michael Vorenberg, Final Freedom: The Civil War, the Abolition of Slavery, and the Thirteenth Amendment 143–44 (2001).',
      'Chris Hedges & Joe Sacco, Days of Destruction, Days of Revolt 109 (2012).',
      'A. Leo Levin et al., Dispute Resolution Devices in a Democratic Society 77 (1985).',
      'Ned Blackhawk (Western Shoshone), The Rediscovery of America 15 (2023).',
    ],
  },
  'R. 15.2': {
    title: 'Editor or Translator',
    explanation:
      '(a) Basic format: give the editor\'s/translator\'s full name followed by "ed." or "trans." (in that order if both) in the publication-information parenthetical. A comma separates the designation from other info.\n\n' +
      '(b) Institutional editors: substitute the institution\'s name for the individual editor, abbreviated per R. 15.1(e).\n\n' +
      '(c) Multiple volumes with different editors: list only the editors of the volume cited.\n\n' +
      '(d) No named parties: designate by the publisher of the edition (R. 15.4).',
    examples: [
      'Michel Foucault, Discipline and Punish 30–31 (Alan Sheridan trans., Vintage Books 2d ed. 1995) (1975).',
      'Ethics of Consumption 118–19 (David A. Crocker & Toby Linden eds., 1998).',
      'The Bluebook: A Uniform System of Citation (Columbia L. Rev. Ass\'n et al. eds., 21st ed. 2020).',
    ],
  },
  'R. 15.3': {
    title: 'Title',
    explanation:
      'Cite the full main title as it appears on the title page. Capitalize per R. 8 (unless the title is not in English — see R. 20.2.2(b)). Give a subtitle only if particularly relevant. Do not abbreviate words or omit articles. Use small capitals.\n\n' +
      'If the title ends with a numeral or page-number confusion is possible, set off the page number with a comma and "at" (R. 3.2(a)).',
    examples: [
      'J.A.S. Grenville, The Major International Treaties, 1914–1973, at 114–15 (1974).',
    ],
  },
  'R. 15.4': {
    title: 'Edition, Publisher, and Date',
    explanation:
      '(a) Editions: always cite the latest edition supporting the point.\n' +
      '  (i) Single edition: indicate year of publication in parentheses.\n' +
      '  (ii) Multiple editions by same publisher: indicate edition and year — follow publisher\'s terminology (see T14).\n' +
      '  (iii) Editions not by original publisher: indicate editor/translator, publisher, edition, and date; add second parenthetical for original publication date.\n\n' +
      '(b) Multiple volumes with different dates: use the date the cited volume was published.\n\n' +
      '(c) Photoduplicated reprints: cite to original, indicate reprint parenthetically.\n\n' +
      '(d) Pre-1900 works: cite to scholarly modern edition if available. Otherwise cite first edition with place of publication and publisher.\n\n' +
      '(e) Supplements: cite pocket parts and bound supplements per R. 3.1(c).',
    examples: [
      'Deborah L. Rhode, Justice and Gender 56 (1989).',
      'Fleming James, Jr. et al., Civil Procedure § 2.3 (4th ed. 1992).',
      'Charles Dickens, Bleak House 49–55 (Norman Page ed., Penguin Books 1971) (1853).',
      'John Locke, Two Treatises of Government 137–39 (Peter Laslett ed. Cambridge Univ. Press 1988) (1690).',
      'Paul W. Gates, History of Public Land Law Development 1 (photo. reprt. 1979) (1968).',
    ],
  },
  'R. 15.5': {
    title: 'Shorter Works in Collection',
    explanation:
      'R. 15.5.1 — Works in collection generally:\n' +
      '(a) Works by various authors: author in roman type, shorter work title in italics, "in" in italics, volume number, collection title in small capitals. Note the page on which the shorter work begins and specific pages.\n' +
      '(b) Works by same author: author name in small capitals; volume number before author name.\n\n' +
      'R. 15.5.2 — Collected documents:\n' +
      '(a) Documents originally published: use "reprinted in" form (R. 1.6(a)(ii)).\n' +
      '(b) Documents originally unpublished: cite per R. 23.',
    examples: [
      'Kay Deaux & Brenda Major, A Social-Psychological Model of Gender, in Theoretical Perspectives on Sexual Difference 89, 89 (Deborah L. Rhode ed., 1990).',
      'Oliver Wendell Holmes, Law in Science and Science in Law, in Collected Legal Papers 210, 210 (1920).',
    ],
  },
  'R. 15.6': {
    title: 'Prefaces, Forewords, Introductions, and Epilogues',
    explanation:
      'Cite a preface, foreword, introduction, or epilogue by someone other than the author with the contributor\'s name, the designation (e.g., "Introduction to"), and the main work\'s citation.\n\n' +
      'If the material is by the author of the work, cite without special designation.',
    examples: [
      'L. Maria Child, Introduction to Harriet A. Jacobs, Incidents in the Life of a Slave Girl 3, 3–4 (L. Maria Child & Jean F. Yellin eds., Harvard Univ. Press 1987) (1861).',
      'John Hart Ely, Democracy and Distrust, at vii (1980).',
    ],
  },
  'R. 15.7': {
    title: 'Serial Number',
    explanation:
      '(a) Series issued by the author: include the serial number as part of the title. Abbreviate the serial number indicator per T16.\n\n' +
      '(b) Series issued by one other than the author: indicate the series and number parenthetically, abbreviating institutional entities per R. 15.1(e).',
    examples: [
      'Bureau of Intel. & Rsch., U.S. Dep\'t of State, Pub. No. 8732, World Strength of the Communist Party Organizations 65 (1973).',
      'Anne C. Vladeck, Counseling a Plaintiff During Litigation, in Employment Litigation 1990, at 77, 80–82 (PLI Litig. & Admin. Prac., Course Handbook Ser. No. 386, 1990).',
    ],
  },
  'R. 15.8': {
    title: 'Special Citation Forms',
    explanation:
      '(a) Frequently cited works: Some works have special forms — Black\'s Law Dictionary, Ballentine\'s, C.J.S., Am. Jur. 2d.\n\n' +
      '(b) Special pagination: For well-known works with standardized pagination across editions (Blackstone, Aristotle, Shakespeare), cite to the standard page; edition/date may be omitted.\n\n' +
      '(c) Other named works:\n' +
      '  (i) The Federalist: cite with author parenthetically; group papers by same author. For pincites, include edition info.\n' +
      '  (ii) Manual for Complex Litigation: include edition and date.\n' +
      '  (iii) Wright & Miller\'s Federal Practice & Procedure: include volume, edition, and date.\n' +
      '  (iv) Moore\'s Federal Practice: include volume, edition, and date.\n' +
      '  (v) Major religious texts: cite by book, chapter, and verse. Version may be indicated parenthetically.\n' +
      '  (vi) The Bluebook: cite with editors, edition, and date.',
    examples: [
      'Good-Faith Bargaining, Black\'s Law Dictionary (9th ed. 2009).',
      '2 William Blackstone, Commentaries *152, *155–56.',
      'The Federalist No. 23 (Alexander Hamilton).',
      '2 Kings 12:19.',
      'The Bluebook: A Uniform System of Citation R. 15.8(c)(vi), at 162 (Columbia L. Rev. Ass\'n et al. eds., 22d ed. 2025).',
    ],
  },
  'R. 15.9': {
    title: 'Electronic Databases and Online Sources — Books',
    explanation:
      '(a) Commercial electronic databases: provide a complete citation per R. 15 plus a database citation with any unique identifier.\n\n' +
      '(b) Internet and online sources: online books may differ from print versions — do not treat them interchangeably unless the online source is an exact copy per R. 18.2.1(a). If only available online, cite directly per R. 18.2.2.\n\n' +
      '(c) Ebooks: cite only if the sole available medium. Place an "ebook" parenthetical after the date. Use "loc." for location numbers instead of page numbers.',
    examples: [
      'Abbey G. Hairston, Leave and Disability Coordination Handbook ¶ 110 (2009), Westlaw LDCHBK.',
      'Anne Umland & Blair Hartzell, Picasso: The Making of Cubism 1912–1914, at 25 (2014) (ebook).',
      'Ronald Collins & David Skover, When Money Speaks loc. 2992 (2014) (ebook).',
    ],
  },
  'R. 15.10': {
    title: 'Short Citation Forms — Books',
    explanation:
      'Once a book is cited in full, use "id." or "supra" for subsequent citations. Never use "infra" for these materials.\n\n' +
      'R. 15.10.1 — Works in collection:\n' +
      '• Use "id." for the shorter work if it was the immediately preceding authority.\n' +
      '• Do NOT use "id." to refer to the collection as a whole when citing another shorter work within it.\n' +
      '• Use "supra" to refer to the collection as a whole (by title, not author).\n' +
      '• Use "supra" for the shorter work if it was not the immediately preceding authority (by author\'s last name or, if none, by title).\n\n' +
      'For materials only available online, use the normal short form; a URL need not be repeated after a full citation.',
  },
  'R. 16': {
    title: 'Periodical Materials',
    explanation:
      'Rule 16 governs citations to law review articles, magazine articles, newspaper articles, newsletters, and all other periodical materials.\n\n' +
      'Sub-rules: R. 16.1 (Basic Citation Forms), R. 16.2 (Author), R. 16.3 (Title), R. 16.4 (Consecutively Paginated Journals), R. 16.5 (Nonconsecutively Paginated Journals and Magazines), R. 16.6 (Newspapers), R. 16.7 (Special Citation Forms), R. 16.8 (Electronic Media and Online Sources), R. 16.9 (Short Citation Forms).\n\n' +
      'Key rules:\n' +
      '• Periodical names appear in small capitals, abbreviated per T6, T13, T10.\n' +
      '• Consecutively paginated: volume + journal + first page + pincite + (year).\n' +
      '• Nonconsecutively paginated: journal + date + "at" + first page.\n' +
      '• Newspapers: cited per R. 16.6.\n' +
      '• Capitalize titles per R. 8(a).\n' +
      '• The date is the cover date of the periodical.',
  },
  'R. 16.1': {
    title: 'Basic Citation Forms — Periodicals',
    explanation:
      'Consecutively paginated journal: Author, Title, Vol. Journal Page, Pincite (Year).\n' +
      'Nonconsecutively paginated journal/magazine: Author, Title, Journal, Date, at Page.\n' +
      'Newspaper: Author, Title, Newspaper, Date, at Page.\n' +
      'Online newspaper: Author, Title, Newspaper (Date), URL [perma.cc].\n\n' +
      'Student-written materials: include designation (Note, Comment, Case Comment, Book Note) before the title.\n' +
      'Book reviews: include "(reviewing [author], [title] ([year]))" parenthetical.\n' +
      'Symposia: begin with "Symposium," followed by the title.',
    examples: [
      'Elizabeth F. Emens, Integrating Accommodation, 156 U. Pa. L. Rev. 839, 894 (2008).',
      'Benjamin Wittes, Without Precedent, Atl. Monthly, Sep. 2005, at 39, 40.',
      'Scott Martelle, ID Law Keeps Nuns, Students from Polls, L.A. Times, May 7, 2008, at A14.',
      'Bradford R. Clark, Note, Judicial Review of Congressional Section Five Action, 84 Colum. L. Rev. 1969, 1986 (1984).',
    ],
  },
  'R. 16.3': {
    title: 'Title — Periodicals',
    explanation:
      'Cite the full periodical title as it appears on the title page. Capitalize per R. 8. Do not abbreviate words or omit articles. Use italics.\n\n' +
      'When the title contains a reference to material that would normally be italicized (e.g., a case name or book title), print that material in ordinary roman type instead (reverse italicization).',
    examples: [
      'Edward B. Rock, The Logic and (Uncertain) Significance of Institutional Shareholder Activism, 79 Geo. L.J. 445 (1991).',
      'Seth F. Kreimer, Does Pro-Choice Mean Pro-Kevorkian?, 44 Am. U. L. Rev. 803, 812 (1995).',
    ],
  },
  'R. 16.4': {
    title: 'Consecutively Paginated Journals',
    explanation:
      'Cite by: author, title, volume number, periodical name (abbreviated per T6/T10/T13), first page, pincite, and (year).\n\n' +
      'Special pagination: if the journal uses special numbering (e.g., "S" prefix), include it.\n' +
      'Special annual issues: indicate the issue designation parenthetically.\n' +
      'No volume number: use the year of publication as the volume number and omit the year parenthetical.',
    examples: [
      'David Rudovsky, Police Abuse: Can the Violence Be Contained?, 27 Harv. C.R.-C.L. L. Rev. 465, 500 (1992).',
      'Thomas R. McCoy & Barry Friedman, Conditional Spending: Federalism\'s Trojan Horse, 1988 Sup. Ct. Rev. 85, 100.',
      'Stephen D. Sugarman, Using Private Schools to Promote Public Values, 1991 U. Chi. Legal F. 171.',
    ],
  },
  'R. 16.5': {
    title: 'Nonconsecutively Paginated Journals and Magazines',
    explanation:
      'Cite by: author, title, periodical name, date of issue (as on cover), "at," first page, and pincite (if applicable). If no author, begin with the title.\n\n' +
      'Abbreviate periodical names per T6, T10, T13.\n\n' +
      'If no date of issue is available, provide the issue number and include the volume number before the periodical title per R. 16.4.',
    examples: [
      'Barbara Ward, Progress for a Small Planet, Harv. Bus. Rev., Sep.–Oct. 1979, at 89, 90.',
      'Damages for a Deadly Cloud: The Bhopal Tragedy, Time, Feb. 27, 1989, at 53.',
    ],
  },
  'R. 16.6': {
    title: 'Newspapers',
    explanation:
      '(a) In general: cite like nonconsecutively paginated periodicals (R. 16.5) with three exceptions:\n' +
      '  (i) Designate "Editorial," "Opinion," or "Letter to the Editor" in roman type after the author\'s name.\n' +
      '  (ii) Give the section designation parenthetically after the date if needed to identify the page.\n' +
      '  (iii) Give only the first page — do not indicate specific material pages.\n\n' +
      '(b) Place of publication: include in parentheses after the newspaper name if not clear from the name.\n\n' +
      '(c) Consecutively paginated newspapers: cite per R. 16.4.\n\n' +
      '(d) Wire services: cite to the print newspaper, electronic database, or webpage. Include the wire service name only if citing the service itself.\n\n' +
      '(e) Commercial electronic databases: cite per R. 16.8.\n\n' +
      '(f) Internet/online newspapers: cite to online source directly per R. 18.2.2.',
    examples: [
      'Ari L. Goldman, O\'Connor Warns Politicians Risk Excommunication, N.Y. Times, June 15, 1990, at A1.',
      'Nancy Reagan, Editorial, Just Say "Whoa," Wall St. J., Jan. 23, 1996, at A14.',
      'Trial Judge Will Not Give Enquiry Evidence, Times (London), June 13, 1990, at 3.',
      'John M. Broder, Geography Is Dividing Democrats over Energy, N.Y. Times (Jan. 27, 2009), http://www.nytimes.com/2009/01/27/science/earth/27coal.html.',
    ],
  },
  'R. 16.2': {
    title: 'Author — Periodicals',
    explanation:
      'For signed materials in periodicals (including student-written materials), follow R. 15.1 for author formatting but print in ordinary roman type (not small capitals).\n\n' +
      'Two or three authors: list in order, separated with "&" (two) or commas and "&" (three).\n' +
      'More than three: first author + "et al." or list all if relevant.\n\n' +
      'Student-written materials include a designation (Note, Comment, etc.) after the author\'s name and before the title.',
    examples: [
      'Kim Lane Scheppele, Foreword: Telling Stories, 87 Mich. L. Rev. 2073, 2082 (1989).',
      'Paul Butler et al., Race, Law and Justice, 45 Am. U. L. Rev. 567, 569 (1996).',
      'R. Gregory Cochran, Comment, Is the Shrink\'s Role Shrinking?, 147 U. Pa. L. Rev. 1403 (1999).',
    ],
  },
  'R. 16.7': {
    title: 'Special Citation Forms — Periodicals',
    explanation:
      'R. 16.7.1 — Student-written materials:\n' +
      '(a) Signed: cite like any signed article but include the designation (Note, Comment, Recent Development, etc.) before the title. Short commentary with digest-like headings: cite by author + designation + case/statute citation.\n' +
      '(b) Unsigned: begin with designation (Note, Comment, Case Comment, etc.) in roman type, then title in italics. When no separable designation, italicize entire title.\n' +
      '(c) Student book reviews: use "Book Note" designation; add parenthetical for the reviewed work.\n\n' +
      'R. 16.7.2 — Non-student book reviews: reviewer name + title in italics + parenthetical for reviewed work.\n\n' +
      'R. 16.7.3 — Symposia/colloquia: "Symposium," etc. in roman type before the title; cite first page of first piece.\n\n' +
      'R. 16.7.4 — Commentaries/special designations: designation in roman type after author, before title.\n\n' +
      'R. 16.7.5 — Multipart articles: identify part numbers; give volume/page/year for each part.\n\n' +
      'R. 16.7.6 — Annotations: author + "Annotation" in roman type + title in italics.\n\n' +
      'R. 16.7.7 — Proceedings/institute publications: cite as periodicals per T6/T10/T13.\n\n' +
      'R. 16.7.8 — Newsletters: cite like R. 16.5 but add parenthetical for issuing group and location.',
    examples: [
      'Ellen London, Comment, A Critique of the Strict Liability Standard, 152 U. Pa. L. Rev. 1957, 1959–63 (2004).',
      'Note, A Bad Man Is Hard to Find, 127 Harv. L. Rev. 2521 (2014).',
      'Symposium, Changing Images of the State, 107 Harv. L. Rev. 1179 (1994).',
      'Claudia Catalano, Annotation, Unlawful Access Under Stored Communications Act, 1 A.L.R. Fed. 3d Art. 1 (2015).',
    ],
  },
  'R. 16.8': {
    title: 'Electronic Media and Online Sources — Periodicals',
    explanation:
      '(a) Commercial electronic databases: provide a complete R. 16 citation plus a database citation with any unique identifier or code.\n\n' +
      '(b) Internet and online sources: cite to print when accessible. Cite to electronic source when print is difficult to obtain or the authority has designated the electronic version as official. If only available online, cite directly per R. 18.2.2. If a DOI exists, it may be appended in brackets.',
    examples: [
      'T.R. Fehrenbach, TV\'s Alamo Tale Fairly Accurate, S.A. Express-News, Mar. 17, 1996, at A1, 1996 WL 2824823.',
    ],
  },
  'R. 16.9': {
    title: 'Short Citation Forms — Periodicals',
    explanation:
      '(a) Id.: use when the work is the same as the immediately preceding authority in the same footnote or the sole authority in the immediately preceding footnote. Indicate any page difference.\n\n' +
      '(b) Supra: include the author\'s last name (or title/designation if no author) + "supra note [N]" + pincite. If the full citation is in the same footnote, "supra" may be used without a note reference. If a "hereinafter" form was given in the first citation, use that form instead.\n\n' +
      'For materials only available online, a URL need not be repeated after a full citation.',
    examples: [
      'Ackerman, supra note 5, at 1425.',
      'Recent Case, supra note 2, at 150.',
      'Otterbourg to Represent, supra note 6.',
    ],
  },
  'R. 17': {
    title: 'Unpublished and Forthcoming Sources',
    explanation:
      'Rule 17 covers unpublished manuscripts, dissertations, theses, letters, memoranda, press releases, e-mail, interviews, speeches, forthcoming publications, and working papers.\n\n' +
      'Sub-rules: R. 17.1 (Basic Citation Forms), R. 17.2 (Unpublished Materials), R. 17.3 (Forthcoming Publications), R. 17.4 (Working Papers), R. 17.5 (Electronic Databases and Online Sources), R. 17.6 (Short Citation Forms).',
  },
  'R. 18': {
    title: 'The Internet, Electronic Media, and Other Nonprint Resources',
    explanation:
      'Rule 18 covers citation of information found on the internet, AI-generated content, electronic databases, electronic storage media, microform, video, audio, images, social media, and hardware/software.\n\n' +
      'Sub-rules: R. 18.1 (Basic Citation Forms), R. 18.2 (The Internet), R. 18.3 (AI-Generated Content), R. 18.4 (Electronic Databases), R. 18.5 (Electronic Storage Media), R. 18.6 (Microform), R. 18.7 (Videographic Media), R. 18.8 (Audio Recordings and Streaming), R. 18.9 (Images), R. 18.10 (Social Media), R. 18.11 (Hardware and Software), R. 18.12 (Short Citation Forms).',
  },
  'R. 18.1': {
    title: 'Basic Citation Forms — Electronic/Nonprint Sources',
    explanation:
      'R. 18.1 provides basic citation forms for all nonprint source categories. Key categories include:\n\n' +
      '• Internet: authenticated/official documents, scanned copies, online-only sources, blogs, archived sources.\n' +
      '• AI: LLM generations, search results, AI-generated content.\n' +
      '• Commercial electronic databases: Westlaw, LEXIS identifiers.\n' +
      '• Electronic storage media: physical media (microSD, CD), cloud storage.\n' +
      '• Microform: microformed on [collection] (Microform, Inc.).\n' +
      '• Video: films, TV, live streaming, web-based video.\n' +
      '• Audio: physical recordings, streaming services, podcasts, unpublished recordings.\n' +
      '• Social media: text/audio/visual posts, profiles, reposts.\n' +
      '• Hardware/software: product name, model, version.',
  },
  'R. 18.2': {
    title: 'The Internet',
    explanation:
      'Cite traditional printed sources when available, unless an authenticated, official, or exact copy is available digitally per R. 18.2.1.\n\n' +
      'R. 18.2.1 — General principles:\n' +
      '(a) Sources citeable as print: authenticated (digital signature/PKI), official (government designation), or exact copies (PDF preserving pagination).\n' +
      '(b) Append URL: for obscure sources or web-based sources with print characteristics.\n' +
      '(c) Order of parentheticals: per R. 1.5(b) — format/related authority parentheticals before URL, explanatory parentheticals after.\n' +
      '(d) Archival: all online content must be archived (perma.cc or on file).\n\n' +
      'R. 18.2.2 — Direct web-based citations:\n' +
      '(a) Author: in roman type; omit if none; abbreviate institutional per R. 15.1(e).\n' +
      '(b) Titles: main page title in small capitals + subdivision titles preceded by colon. Descriptive titles not italicized.\n' +
      '(c) Date/time: as on the site; use "last visited" when undated; 24-hour clock with time zone.\n' +
      '(d) URL: point directly to source; use shortlinks when available; root URL if long/unwieldy.\n' +
      '(e) Multiple URLs: use primary URL.\n' +
      '(f) Document format: prefer PDF over HTML when both available.\n' +
      '(g) Pinpoint citations: use page numbers from the document itself, not software page numbers.',
    examples: [
      'Randy E. Barnett, What the Declaration of Independence Said and Meant, Reason: Volokh Conspiracy (July 4, 2024, at 10:13 ET), https://reason.com/... [https://perma.cc/C32D-SH5C].',
      'Ben & Jerry\'s, http://www.benjerry.com [https://perma.cc/A3QG-UT8G] (last visited July 21, 2024).',
    ],
  },
  'R. 18.3': {
    title: 'AI-Generated Content',
    explanation:
      '(a) Large language models: cite by prompt author, model name (with version), exact prompt text in quotation marks, date, and (on file with...) parenthetical. Save a screenshot/PDF on file. Do NOT use a URL for LLM outputs.\n\n' +
      '(b) Search results: cite by search engine name (small capitals), exact query in quotation marks, number of results, date, and (on file with...) parenthetical. Indicate content filters in a separate parenthetical.\n\n' +
      '(c) AI-generated content: cite per the relevant Bluebook sub-rule + parenthetical "(generated by [AI model])." Substitute prompt author for creator name.',
    examples: [
      'Luke Cronin, Google Gemini Advanced, "Who would make a better Supreme Court Justice: Beyoncé or Taylor Swift?" (Mar. 29, 2024) (on file with the Columbia Law Review).',
      'Bing, "The Bluebook", 6,050,000 results (May 22, 2024) (on file with the Harvard Law Review).',
      'Illustration of a Tornado on the Moon (on file with the Columbia Law Review) (generated by DALL-E 3).',
    ],
  },
  'R. 18.4': {
    title: 'Electronic Databases',
    explanation:
      'LEXIS, Westlaw, Bloomberg Law, and other commercial electronic databases are preferred over other R. 18 sources. See specific rules for each source type:\n' +
      '• Cases: R. 10.8.1\n' +
      '• Constitutions: R. 11\n' +
      '• Statutes: R. 12.5\n' +
      '• Legislative Materials: R. 13.7\n' +
      '• Regulations: R. 14.5\n' +
      '• Books: R. 15.9\n' +
      '• Periodicals: R. 16.8',
  },
  'R. 18.5': {
    title: 'Electronic Storage Media',
    explanation:
      '(a) Physical media: cite the title + file name in brackets + file owner + (storage media, last modified date) + (on file with...). Examples: USB drives, CDs, microSD cards.\n\n' +
      '(b) Cloud storage: cite author + file title + URL + (folder owner, folder name, cloud service) + (last modified date) + (on file with...).',
  },
  'R. 18.6': {
    title: 'Microform',
    explanation:
      '(a) Microform collections reproducing preexisting materials: cite the original document in full, then "microformed on" + microform citation with publisher in parentheses.\n\n' +
      '(b) Microform collections containing original materials: identify the microform set and publisher, using their system for individual forms.',
  },
  'R. 18.7': {
    title: 'Videographic Media',
    explanation:
      'R. 18.7.1 — Films: name in small capitals + access medium + (producer, year). Commercial vs. noncommercial. Timestamps: ", at XX:XX."\n\n' +
      'R. 18.7.2 — Television series: series name in small capitals + episode in italics + (platform, date).\n\n' +
      'R. 18.7.3 — Live streaming: cite to recorded video when possible (R. 18.7.4). If no recording exists, cite broadcast + (platform, date) + (on file with...).\n\n' +
      'R. 18.7.4 — Web-based videos: account name in small capitals + title in italics + timestamp + (platform, date), URL.',
    examples: [
      'Field of Dreams, Blu-ray (Gordon Company 1989).',
      'The Queen\'s Gambit (Netflix, accessed Nov. 7, 2024).',
      'hbomberguy, Plagiarism and You(Tube), at 34:19 (YouTube, Dec. 2, 2023), https://www.youtube.com/...',
    ],
  },
  'R. 18.8': {
    title: 'Audio Recordings and Streaming',
    explanation:
      'R. 18.8.1 — Physical media:\n' +
      '(a) Commercial: creator in small capitals + title + (medium, label, date).\n' +
      '(b) Noncommercial: producer in small capitals + name + (medium, date) + (on file with...).\n' +
      '(c) Episodic: title in small capitals + episode in italics + (medium, date).\n\n' +
      'R. 18.8.2 — Streaming: replace medium name with streaming service. Podcasts follow episodic format.\n\n' +
      'R. 18.8.3 — Unpublished recordings: nature of recording + recorder/producer + (recorded date) + (on file with...).\n\n' +
      'R. 18.8.4 — Websites with audio: cite per R. 18.2.2 principles.\n\n' +
      'Songs within albums: cite per R. 15.5.1 (shorter works in collection). Timestamps: ", at XX:XX."',
    examples: [
      'Mitski, Be the Cowboy (CD, Dead Oceans Aug. 17, 2018).',
      'Strict Scrutiny: The Legality of Presidents Doing Whatever They Want (Spotify, Jan. 15, 2024).',
    ],
  },
  'R. 18.9': {
    title: 'Images',
    explanation:
      'Cite by: author + title in italics + (type of work, year). For reprints: "reprinted by" + reprint author + (year).\n\n' +
      'Untitled photos/illustrations: "Photograph/Illustration of [description] in [source]."\n' +
      'Unnumbered pages: "following p. [N]."\n\n' +
      'Emojis: replicate the emoji + (official CLDR name) + Unicode number (U+XXXX). If no Unicode number, cite as image.',
    examples: [
      'Ray Collins, Oil (photograph 2014).',
      '😀 (grinning face), U+1F600.',
    ],
  },
  'R. 18.10': {
    title: 'Social Media',
    explanation:
      'R. 18.10.1 — Social media platforms:\n' +
      '(a) Visual/audio: "Video/Image posted by Name (@handle), Platform, Title (date), URL (on file with...)."\n' +
      '(b) Textual: "Name (@handle), Platform, [text if relevant] (date), URL [perma.cc]."\n' +
      '(c) Profiles: name + handle + platform + URL (no date).\n' +
      '(d) Reposts: add "(reposted from Original Poster, @handle)." parenthetical after URL.\n' +
      '(e) Federated: include full handle with instance; indicate instance if handle doesn\'t.\n\n' +
      'R. 18.10.2 — Communication services:\n' +
      '(a) Audio/video: "Statement by [speaker], [call type] between [participants], Platform (date) (on file with...)."\n' +
      '(b) Text: "Message from [sender] to [recipient], Platform (date, time) (on file with...)."\n' +
      'Group texts: replace recipient with group name + (group consisting of [members]).',
    examples: [
      'Anu Bradford (@anubradford), X (Mar. 14, 2024, at 06:59 ET), https://x.com/... [https://perma.cc/...].',
      'Message from Peter Parker to Otto Octavius, Whatsapp (May 24, 2024, at 18:44 ET) (on file with...).',
    ],
  },
  'R. 18.11': {
    title: 'Hardware and Software',
    explanation:
      'R. 18.11.1 — Hardware: OEM name in small capitals + official model name + manufacturer part/model number. SKU in parenthetical.\n\n' +
      'R. 18.11.2 — Software:\n' +
      '(a) General: developer in small capitals + software name in italics + version/release number + (date). Indicate platform when differences are relevant.\n' +
      '(b) Open source: prefer citations to public repository. Owner in small capitals + name in italics + URL + (last accessed date). Pincite by file name and line number.\n' +
      '(c) Payment software: amount + sender + recipient + (payment text, date) + software citation.\n\n' +
      'R. 18.11.3 — Blockchain:\n' +
      '(a) Transactions: quantity + token + network + sender ID + receiver ID + hash ID + (date, time).\n' +
      '(b) Smart contracts: "Smart Contract," + address + (network, date, time).\n' +
      '(c) NFTs: "NFT," + Token ID + collection name + creator + contract address + (date, time).',
    examples: [
      'Nvidia, GeForce RTX 4090 Founders Edition, 900-1G136-2530-000.',
      'Microsoft, Microsoft Outlook for Mac, Ver. 16.86.1 (24061443) (June 18, 2024).',
      '$300 from Varsha Midha to Burke Craighead (payment emoji, Nov. 1, 2018), Venmo, Ver. 7.3.0.',
    ],
  },
  'R. 18.12': {
    title: 'Short Citation Forms — Electronic/Nonprint',
    explanation:
      '(a) Internet: use "supra" with author last name or title; "id." per R. 4. URL not repeated.\n' +
      '(b) Commercial databases: use unique database identifier in short form.\n' +
      '(c) Electronic storage/microform: use short form for the original document.\n' +
      '(d) Films/broadcasts/audio/visual art: "id." and "supra" per R. 4.\n' +
      '(e) Social media/communication: "supra" with name and handle; omit other call parties but keep cited speaker.\n' +
      '(f) Hardware: "supra" with model name. Software: "supra" with name and version.',
  },
  'R. 19': {
    title: 'Services',
    explanation:
      'Services are topical compilations (looseleaf or bound) of cases, administrative materials, and commentary.\n\n' +
      'R. 19.1 — Citation form: volume + abbreviated title (roman type) + publisher in parentheses + subdivision + date. Consult T15 for abbreviations. For cases, include abbreviated court name in the date parenthetical.\n' +
      '(a) Volume: number, year, or descriptive subtitle (use brackets for years/words).\n' +
      '(b) Publisher: required for every citation; abbreviate per T15 or R. 15.1(e).\n' +
      '(c) Subdivision: paragraph/section number preferred; page number otherwise.\n' +
      '(d) Date: exact date for looseleaf cases; year for bound. Statutes/regulations: date of enactment unless indicated elsewhere.\n\n' +
      'R. 19.2 — Short citation forms: standard "id." and "supra" forms.',
    examples: [
      'In re Smithfield Ests., Inc., [1985–1986 Transfer Binder] Bankr. L. Rep. (CCH) ¶ 70,707 (Bankr. D.R.I. Aug. 9, 1985).',
      'SEC v. Tex. Int\'l Airlines, 29 Fed. R. Serv. 2d (West) 408 (D.D.C. 1979).',
    ],
  },
  'R. 17.1': {
    title: 'Basic Citation Forms — Unpublished Sources',
    explanation:
      'Unpublished manuscript: Author, Title page (date) (unpublished manuscript) (on file with [repository]).\n' +
      'Dissertation/thesis: Author, Title (date) (degree, institution) (on file with [repository]).\n' +
      'Letter/memorandum: Letter/Memorandum from [sender] to [recipient] (date) (on file with [repository]).\n' +
      'E-mail: E-mail from [sender] to [recipient] (date, time) (on file with [repository]).\n' +
      'Forthcoming: Author, Title, Vol. Journal (forthcoming [month] [year]).\n' +
      'Working paper: Author, Title page (institution, Working Paper No. [N], year).',
    examples: [
      'Jennifer Arlen, Public Versus Private Enforcement of Securities Fraud 12–19 (June 22, 2007) (unpublished manuscript) (on file with the Columbia Law Review).',
      'Eduardo Peñalver, Land Virtues, 94 Corn. L. Rev. (forthcoming May 2009).',
      'Dan Black et al., Demographics of the Gay and Lesbian Population 9 (Ctr. for Pol\'y Rsch., Working Paper No. 12, 1999).',
    ],
  },
  'R. 17.2': {
    title: 'Unpublished Materials',
    explanation:
      'Cite by: author, title/description, page, most precise date, and location information. Use ordinary roman type.\n\n' +
      'R. 17.2.1 — Manuscripts: author + title + date + (unpublished manuscript) + (on file with...).\n' +
      'R. 17.2.2 — Dissertations/theses: same as manuscripts + (degree, institution).\n' +
      'R. 17.2.3 — Letters/memoranda/press releases: identify nature, writer, addressee, title/affiliation. "To author" when addressed to the citing author.\n' +
      'R. 17.2.4 — E-mail/listserv: analogize to letters; include timestamp.\n' +
      'R. 17.2.5 — Interviews: name + title + affiliation + date. In-person: include location. Non-personal: include interviewer.\n' +
      'R. 17.2.6 — Speeches/addresses: speaker + title/affiliation (if included) + title of speech + date. Published speeches: use "in" form per R. 1.6(a)(i).',
  },
  'R. 17.3': {
    title: 'Forthcoming Publications',
    explanation:
      'Cite like the published piece with same typefaces, but: (i) no pincite after journal/book title, (ii) add "(forthcoming [month] [year])" in date parenthetical, (iii) omit volume number if not yet available.\n\n' +
      'For pincites: add "(manuscript at [page])" parenthetical and "(on file with [repository])" parenthetical.',
    examples: [
      'Aadir A.I. Khan, Comment, From Historical to Cutting-Edge, 172 U. Pa. L. Rev. (forthcoming July 2024).',
    ],
  },
  'R. 17.4': {
    title: 'Working Papers',
    explanation:
      'Cite with a parenthetical indicating the sponsoring organization, working paper designation and number, and year. Abbreviate institutional entities per R. 15.1(e).\n\n' +
      'Unnumbered working papers: cite per R. 17.2.1.',
    examples: [
      'Alan J. Auerbach & Laurence J. Kotlikoff, National Savings 24–33 (Nat\'l Bureau of Econ. Rsch., Working Paper No. 729, 1981).',
    ],
  },
  'R. 17.5': {
    title: 'Electronic Databases and Online Sources — Unpublished',
    explanation:
      '(a) Commercial electronic databases: provide complete R. 17 citation + database citation with unique identifier.\n\n' +
      '(b) Internet/online: cite per R. 18.2.2.',
  },
  'R. 17.6': {
    title: 'Short Citation Forms — Unpublished Sources',
    explanation:
      'Use "id." and "supra" as for periodicals (R. 16.9) and books (R. 15.10). Substitute the source name for the author when no author is listed. Enclose manuscript page citations for forthcoming publications in parentheses.\n\n' +
      'For materials only available online, a URL need not be repeated after a full citation.',
  },
  'R. 20': {
    title: 'Foreign Materials',
    explanation:
      'Table T2 is the primary source for citing foreign materials. For sources not in T2, follow the country\'s own citation rules as modified by R. 20.\n\n' +
      'R. 20.1 — Jurisdiction: always indicate the jurisdiction parenthetically (abbreviated per T10) at the end of the citation, before any parallel citations.\n' +
      'R. 20.2 — Non-English documents: see R. 20.2.1 (translation) and R. 20.2.2 (transliteration/romanization).\n' +
      'R. 20.3 — Cases: follow the jurisdiction\'s citation conventions per T2.\n' +
      'R. 20.4 — Constitutions: cite per T2; for constitutions not in T2, cite analogously to R. 11.\n' +
      'R. 20.5 — Statutes: cite per T2.\n' +
      'R. 20.6 — Foreign periodicals: cite per R. 16 with appropriate modifications.\n' +
      'R. 20.7 — Short citation forms: use standard short forms.',
    examples: [
      'Chase v. Campbell, [1962] S.C.R. 425 (Can.).',
      'Berry v. Dorsey (1975) 101 ALR 35 (Austl.).',
    ],
  },
  'R. 20.3': {
    title: 'Foreign Cases',
    explanation:
      'Cite foreign cases according to R. 10 as modified by the jurisdiction\'s conventions in T2.\n\n' +
      'R. 20.3.1 — Common law jurisdictions: generally follow R. 10 format but adapt party names, reporters, and court designations per T2. Many common law jurisdictions use neutral citations (court-assigned numbers independent of any reporter).\n\n' +
      'R. 20.3.2 — Civil law jurisdictions: citations typically omit party names and use different structural elements:\n' +
      '(a) Court abbreviation + date of decision + case/docket number + reporter abbreviation + page/section.\n' +
      '(b) Court names should be abbreviated per T2.\n' +
      '(c) Dates may be formatted differently than U.S. style (e.g., day-month-year).\n' +
      '(d) Always include the jurisdiction parenthetical abbreviated per T10.',
    examples: [
      'Chase v. Campbell, [1962] S.C.R. 425 (Can.).',
      'Berry v. Dorsey (1975) 101 ALR 35 (Austl.).',
      'Cour de cassation [Cass.] [supreme court for judicial matters] 2e civ., Mar. 4, 2020, Bull. civ. II, No. 19-13.316 (Fr.).',
      'Bundesverfassungsgericht [BVerfG] [Federal Constitutional Court] Oct. 19, 1993, 89 Entscheidungen des Bundesverfassungsgerichts [BVerfGE] 155 (Ger.).',
    ],
  },
  'R. 20.4': {
    title: 'Foreign Constitutions',
    explanation:
      'Cite all foreign constitutions by name. If the nature of the document is not otherwise clear from context, include "Constitution" in brackets following the document name or abbreviation in the first citation. Successive citations may exclude this note.\n\n' +
      'Key rules:\n' +
      '(a) Include the country abbreviation parenthetical (per T10) at the end of the citation.\n' +
      '(b) Cite the current constitution without a date unless the cited provision has been amended or superseded.\n' +
      '(c) Transliterate or romanize the title per R. 20.2.4 if not in the Roman alphabet.\n' +
      '(d) Include a translation of the constitution\'s name in brackets if not widely known.',
    examples: [
      'Bundesverfassung [BV] [Constitution] Apr. 18, 1999, SR 101, art. 29 (Switz.).',
      'Grundgesetz [GG] [Basic Law] art. 2, ¶ 1 (Ger.).',
      '1958 Const. art. 55 (Fr.).',
      'Nihonkoku Kenpō [Kenpō] [Constitution] art. 9 (Japan).',
    ],
  },
  'R. 20.5': {
    title: 'Foreign Statutes',
    explanation:
      'R. 20.5.1 — Common law systems: cite like U.S. statutes (R. 12) if the jurisdiction\'s statutes appear in a codification or compilation. Otherwise, cite like UK statutes per T2.46, noting the jurisdiction parenthetically.\n\n' +
      'R. 20.5.2 — Civil law and other non-common law jurisdictions: cite according to T2. When citing a code:\n' +
      '(a) Do not indicate the year of the code unless citing a version no longer in force.\n' +
      '(b) Per R. 20.2.3, use the full publication name the first time, indicating in brackets the abbreviation for subsequent use.\n' +
      '(c) Give publisher/editor and date of privately published sources only when citing an annotation rather than the code itself.',
    examples: [
      'Extradition Law, 5714–1954, LSI * 144 (1953–1954) (Isr.).',
      'Emergency Powers Act, 1976 (Act No. 3/1976) (Ir.).',
      'Code civil [C. civ.] [Civil Code] art. 1112 (Fr.).',
      'Code civil [C. civ.] [Civil Code] art. 1098 (64th ed. Petits Codes Dalloz 1965) (Fr.).',
    ],
  },
  'R. 20.6': {
    title: 'Non-English-Language and Foreign Periodicals',
    explanation:
      '(a) In general: for all foreign periodicals (English and non-English), abbreviate the periodical name per T6, T10, and T13. Include the country of origin in a parenthetical. For foreign newspapers, cite per R. 16.6.\n\n' +
      '(b) Foreign-language sources: cite per R. 16, modified by R. 20.2. Include:\n' +
      '  1. Author\n' +
      '  2. Title in original language, followed by English translation or shortened name (R. 20.2.2)\n' +
      '  3. Volume number if appropriate (R. 16.4)\n' +
      '  4. Full periodical name (first citation) with official abbreviation in brackets (R. 20.2.3)\n' +
      '  5. Page number(s)\n' +
      '  6. Year (R. 16.4/16.5)\n' +
      '  7. Country of publication abbreviation\n' +
      'A [hereinafter] form may be given in brackets at the end of the citation.',
    examples: [
      'Nihal Sahu & Sheerene Mohamed, Inessential Practices: Charting a Non-Normative Future for Indian Religion Jurisprudence, 6 Indian L. Rev. 37 (2022) (India).',
      'Catherine Labrusse-Riou, La filiation et la médecine moderne, 38 Revue Internationale de Droit Comparé [R.I.D.C.] 419 (1986) (Fr.).',
      'Marianne Kearney, Indonesia Risks Becoming Like Balkans: Mega, Straits Times (Sing.), Oct. 29, 2001, at 3.',
    ],
  },
  'R. 21': {
    title: 'International Materials',
    explanation:
      'R. 21 covers treaties, international law cases, international arbitrations, UN sources, EU materials, and WTO materials. The basic citation forms vary significantly by source type — see R. 21.1 through R. 21.11.',
  },
  'R. 21.1': {
    title: 'Basic Citation Forms — International Materials',
    explanation:
      '(a) Treaties and international agreements (R. 21.4):\n' +
      '  Bilateral: title + parties separated by hyphen + date + source.\n' +
      '  Multilateral: title + article + date + source(s). Multiple parallel sources may be cited.\n\n' +
      '(b) International law cases (R. 21.5):\n' +
      '  ICJ: case name (parties) + stage + year + reporter + page + (date).\n' +
      '  CJEU: "Case" + number + short name + year + E.C.R. + page.\n' +
      '  ECHR: case name + volume + reporter + page + (year).\n' +
      '  Inter-Am. Comm\'n/Ct.: case name + case number + report/opinion designation + document number + paragraph + (date).\n' +
      '  ITLOS: case name (parties) + case number + order/judgment + volume + reporter + page.\n' +
      '  ICC: prosecutor v. defendant + ICC case number + document title + paragraph + (date) + URL.\n' +
      '  Ad hoc tribunals (ICTY/ICTR): prosecutor v. defendant + case number + decision title + paragraph + (tribunal date).\n\n' +
      '(c) International arbitrations (R. 21.6): case name + volume + reporter + page + (year).\n\n' +
      '(d) UN sources (R. 21.7):\n' +
      '  Meeting records: body + session + meeting designation + page + document number + (date).\n' +
      '  Charter: U.N. Charter art. [N], ¶ [N].\n' +
      '  Resolutions: body abbreviation + Res. + number + paragraph + (date).\n' +
      '  Reports: author/body + title + paragraph + document number + (date).\n\n' +
      '(e) EU materials (R. 21.9): type + number + year + O.J. (series page) + (entity).\n\n' +
      '(f) WTO materials (R. 21.11):\n' +
      '  Panel/Appellate Body: report type + case title + paragraph + WTO Doc. number + (adopted date).\n' +
      '  Founding agreements: title + date + source.\n' +
      '  Ministerial: body + title + WTO Doc. number + parallel source.',
    examples: [
      'Treaty of Friendship, Commerce and Navigation, Japan-U.S., art. X, Apr. 2, 1953, 4 U.S.T. 2063.',
      'Geneva Convention Relative to the Treatment of Prisoners of War art. 3, Aug. 12, 1949, 6 U.S.T. 3316, 75 U.N.T.S. 135.',
      'Military and Paramilitary Activities in and Against Nicaragua (Nicar. v. U.S.), Judgment, 1986 I.C.J. 14 (June 27).',
      'Case C-213/89, The Queen v. Sec\'y of State for Transp. (Factortame Ltd.), 1990 E.C.R. I-2433.',
      'U.N. Charter art. 2, ¶ 1.',
      'G.A. Res. 47/1, ¶ 2 (Sep. 22, 1992).',
      'Panel Report, United States—Sections 301–310 of the Trade Act of 1974, WTO Doc. WT/DS152/R (adopted Jan. 27, 2000).',
    ],
  },
  'R. 21.2': {
    title: 'Non-English-Language Documents — International',
    explanation:
      'For non-English-language international documents, follow the rules set out in R. 20.2 (translation, transliteration, abbreviation, and romanization of non-English titles).',
  },
  'R. 21.3': {
    title: 'Jurisdiction Not Evident from Context',
    explanation:
      'When citing a non-U.S. source (English or other language), indicate the jurisdiction parenthetically (abbreviated per T3 and T10) unless it is otherwise clear from the context or other elements of the citation.',
    examples: [
      'Council Directive 66/45 art. 15, 1965–1966 O.J. Spec. Ed. 265, 268 (Euratom).',
    ],
  },
  'R. 21.4': {
    title: 'Treaties and Other International Agreements',
    explanation:
      'A treaty citation includes: (1) agreement name (R. 21.4.1); (2) state parties, if applicable (R. 21.4.2); (3) subdivision, if applicable (R. 21.4.3); (4) date of signing (R. 21.4.4); (5) source(s) (R. 21.4.5).\n\n' +
      'R. 21.4.1 — Name: use English-language version. First citation: full name including form (Convention, Treaty, Protocol, etc.) and subject matter. Long names: add [hereinafter Short Name] at end.\n\n' +
      'R. 21.4.2 — Parties: bilateral treaties list both parties abbreviated per T10 in alphabetical order (e.g., "Japan-U.S."). Do not abbreviate Tribal Nation names. Multilateral: omit parties.\n\n' +
      'R. 21.4.3 — Subdivisions: cite article/paragraph/section. When citing a subdivision, a pincite to the treaty series is unnecessary.\n\n' +
      'R. 21.4.4 — Date: exact date of signing. Multiple dates: give first and last. If not signed on a single date, use date opened for signature/approved/ratified/adopted in italics. Entry-into-force date may be added parenthetically.\n\n' +
      'R. 21.4.5 — Sources:\n' +
      '(a)(i) U.S. bilateral: cite in order of preference: U.S.T.I.F. → T.I.A.S. → U.N.T.S. → Senate Treaty Docs → U.S.T./Stat. → Dep\'t of State Dispatch.\n' +
      '(a)(ii) U.S. multilateral: cite domestic source + parallel international source (U.N.T.S., L.N.T.S., O.A.S.T.S., etc.).\n' +
      '(b) Non-U.S.: cite international org. source; if unavailable, cite one signatory\'s source.\n' +
      '(c) Unofficial: cite I.L.M.; if unavailable, cite other unofficial sources, websites, or databases.',
    examples: [
      'Treaty of Friendship, Commerce and Navigation, Japan-U.S., art. X, Apr. 2, 1953, 4 U.S.T. 2063.',
      'Geneva Convention Relative to the Treatment of Prisoners of War art. 3, Aug. 12, 1949, 6 U.S.T. 3316, 75 U.N.T.S. 135.',
      'U.N. Convention on the Law of the Sea, opened for signature Dec. 10, 1982, 1833 U.N.T.S. 397 (entered into force Nov. 16, 1994).',
      'U.N. Charter art. 94, ¶ 1.',
      'Treaty with the Chickasaw Nation, Chickasaw Nation-U.S., Jan. 10, 1786, 7 Stat. 24.',
    ],
  },
  'R. 21.5': {
    title: 'International Law Cases',
    explanation:
      'Cite per R. 10 as modified. Standard elements: (1) case name; (2) case number; (3) reporter; (4) characterization (judgment, provisional measures, etc.); (5) pincite (prefer ¶ over page); (6) parenthetical with date (and court if not evident).\n\n' +
      'R. 21.5.1 — ICJ/PCIJ: case name (omit "Case" and articles) + parties in parenthetical (v. for unilateral application, / for special agreement) + characterization + volume + reporter (I.C.J. or P.C.I.J. (ser. X)) + page/number + pincite + (month day). Separate opinions: include first page of judgment + pincite + author parenthetical.\n\n' +
      'R. 21.5.2 — EU Courts: "Case" + number (prefix C/T/F) + parties + E.C.R. (pre-2012) or ECLI (post-2011) + pincite + date. Post-2011 ECLI format: ECLI:EU:[court]:[year]:[number].\n\n' +
      'R. 21.5.3 — ECHR: cite to Eur. Ct. H.R. (through 2015) or HUDOC website (post-2015). Include application number + ¶ + date + URL for HUDOC.\n\n' +
      'R. 21.5.4 — Inter-Am. Comm\'n H.R.: case name + case number + report number + OEA series/doc numbers + ¶ + (year).\n\n' +
      'R. 21.5.5 — Inter-Am. Ct. H.R.: (a) advisory opinions: cite Series A. (b) contentious cases: cite Series C. (c) provisional measures: cite Series E or website. (d) compliance: cite report or website.\n\n' +
      'R. 21.5.6 — ITLOS: case name + parties + case number + order/judgment type + date + ITLOS Rep. + pincite.\n\n' +
      'R. 21.5.7 — ICC and ad hoc tribunals: (1) case name (last names only); (2) case number; (3) ruling type; (4) ¶ number; (5) date (include tribunal name if not in case number).\n\n' +
      'R. 21.5.8 — Other international courts: analogize to R. 21.5.7. If not in official reports, cite I.L.R. or Ann. Dig.\n\n' +
      'R. 21.5.9 — International cases in national courts: cite to national reporter or I.L.R./Ann. Dig. Indicate country/court parenthetically.',
    examples: [
      'Military and Paramilitary Activities in and Against Nicaragua (Nicar. v. U.S.), Judgment, 1986 I.C.J. 14, ¶ 190 (June 27).',
      'Case C-434/16, Nowak v. Data Prot. Comm\'r, ECLI:EU:C:2014:994, ¶¶ 54–55 (Dec. 20, 2017).',
      'S.M. v. Croatia, App. No. 60561/14, ¶ 81 (July 19, 2018), http://hudoc.echr.coe.int/eng?i=001-184665.',
      'Prosecutor v. Tadić, IT-94-1-I, Decision on Defence Motion for Interlocutory Appeal on Jurisdiction, ¶ 70 (Int\'l Crim. Trib. for the Former Yugoslavia Oct. 2, 1995).',
      'Abdul Ghani v. Subedar Shoedar Khan, 38 I.L.R. 3 (W. Pak. High Ct. 1964).',
    ],
  },
  'R. 21.6': {
    title: 'International Arbitrations and Claims Commissions',
    explanation:
      'Cite by analogy to R. 21.5. If adversarial parties are named, cite as a court case. Otherwise cite by first-party plaintiff or subject matter. Indicate countries parenthetically if not evident.\n\n' +
      'Cite to official source (unless a single-judgment pamphlet). Consult T5 for frequently cited arbitral reporters. Indicate the court/tribunal unless identified in the reporter name.\n\n' +
      'ICSID awards: use full diplomatic country names + case number + decision type + ¶ + date + reporter if available.',
    examples: [
      'Amoco Int\'l Fin. Corp. v. Iran, 15 Iran-U.S. Cl. Trib. Rep. 189 (1987).',
      'Savarkar (Fr. v. Gr. Brit.), Hague Ct. Rep. (Scott) 275 (Perm. Ct. Arb. 1911).',
      'Société Générale de Surveillance S.A. v. Republic of the Phil., ICSID Case No. ARB/02/6, Objections to Jurisdiction, ¶ 154 (Jan. 29, 2004), 8 ICSID Rep. 518 (2005).',
    ],
  },
  'R. 21.7': {
    title: 'United Nations Sources',
    explanation:
      'Official Records are preferred. Use ¶/article numbers for pincites when possible. Preambular paragraphs: cite by page; operative paragraphs: by ¶ number.\n\n' +
      'R. 21.7.1 — Verbatim/summary records: Official Records title + subdivision + session/meeting + pincite + U.N. Doc. symbol + date.\n\n' +
      'R. 21.7.2 — Resolutions/decisions:\n' +
      '(a) G.A.: "G.A. Res." + number + ¶ + (date). Pre-1976: Roman numeral session. Post-1976: session/number. Named resolutions: add title after number.\n' +
      '(b) S.C.: "S.C. Res." + number + ¶ + (date). President statements: "S.C. President Statement" + number + (date).\n' +
      '(c) Other organs: cite analogously, listing organ name first.\n' +
      '(d) Subsidiary bodies: body name + Res. + number + doc symbol + pincite + date.\n' +
      '(e) Short form: "supra note [N], ¶ [N]."\n\n' +
      'R. 21.7.3 — Reports: author/body + title + pincite + U.N. Doc. symbol + date. Subsidiary body reports include session number and supplement number. Secretary-General reports: name author with official role in parentheses.\n\n' +
      'R. 21.7.4 — Masthead documents: author + title + pincite + doc symbol + date.\n\n' +
      'R. 21.7.5 — Press releases: cite per R. 17.2.3 + U.N. press release symbol.\n\n' +
      'R. 21.7.6 — Adjudicatory bodies: ICC/ICTY/ICTR per R. 21.5.7. U.N. Admin. Tribunal: cite by judgment number.\n\n' +
      'R. 21.7.7 — Sales publications: author + title + page/¶ + doc symbol + sales number + year.\n\n' +
      'R. 21.7.8 — Yearbooks/periodicals: author/title + yearbook name (abbreviated per R. 16.4) + doc symbol or sales number.\n\n' +
      'R. 21.7.9 — Regional organization documents: cite analogously to U.N. materials.\n\n' +
      'R. 21.7.10 — U.N. Charter: "U.N. Charter art. [N], ¶ [N]."\n\n' +
      'R. 21.7.11 — U.N. internet materials: cite per R. 21.7.4 + format per R. 18.2.',
    examples: [
      'U.N. GAOR, 56th Sess., 1st plen. mtg. at 3, U.N. Doc. A/56/PV.1 (Sep. 12, 2001).',
      'G.A. Res. 217 (III) A, Universal Declaration of Human Rights (Dec. 10, 1948).',
      'S.C. Res. 1325, ¶ 8 (Oct. 31, 2000).',
      'U.N. Secretary-General, An Agenda for Peace, ¶ 14, U.N. Doc. A/47/277-S/24111 (June 17, 1992).',
      'U.N. Charter art. 43, ¶ 1.',
    ],
  },
  'R. 21.8': {
    title: 'League of Nations',
    explanation:
      'Cite the League of Nations Covenant as: "League of Nations Covenant art. [N]."\n\n' +
      'Cite conventions and treaties per R. 21.4. Other materials: issuing body (if not in title) + title + document number + year.',
    examples: [
      'League of Nations Covenant art. 16.',
      'Reports Presented by the Committee of Technical Experts on Double Taxation and Tax Evasion, League of Nations Doc. C.216M.85 1927 II (1927).',
    ],
  },
  'R. 21.9': {
    title: 'European Union',
    explanation:
      '(a) Acts of Council/Commission:\n' +
      '(i) Sources: O.J. (post-2003), O.J. of the European Communities (1973–2003), O.J. Spec. Ed. (pre-1973), or J.O. Post-1968: include series (L or C) + issue number. Use ¶ for pincites when available.\n' +
      '(ii) Legislative acts: institution + type + number + subdivision + year + O.J. (series issue) + page + (EC/Euratom if needed).\n' +
      '(iii) Other publications: proposed acts, common positions, notices.\n' +
      '(iv) COM/SEC documents: body + title + pincite + COM/SEC number + "final" + date.\n\n' +
      '(b) European Parliament:\n' +
      '(i) Debates: Eur. Parl. Deb. (volume) page (date) (speaker).\n' +
      '(ii) Documents: Eur. Parl. Doc. (number) page (year).\n\n' +
      '(c) Founding treaties: cite per R. 21.4.5. Use [hereinafter] for subsequent short form. Renamed/renumbered articles: cite current name + "(as in effect [year]) (now TFEU art. [N])." parenthetical.\n\n' +
      '(d) Reports/Green Papers/White Papers: cite per R. 21.7.3.\n\n' +
      '(e) Press releases: source + number + title + (date). Presidency Conclusions: include meeting place.\n\n' +
      '(f) ECJ materials: cite per R. 21.5.2.',
    examples: [
      'Council Directive 90/476, art. 5, 1990 O.J. (L 266) 1, 2 (EC).',
      'Case C-434/16, Nowak v. Data Prot. Comm\'r, ECLI:EU:C:2014:994, ¶¶ 54–55 (Dec. 20, 2017).',
      'Commission Proposal for a Directive, at 11, COM (2003) 659 final (Nov. 5, 2003).',
      'TFEU art. 177.',
    ],
  },
  'R. 21.10': {
    title: 'Council of Europe',
    explanation:
      'Cite debates of the Parliamentary Assembly to official reports: "Eur. Parl. Ass. Deb." + session + page + (date).\n' +
      'Cite documents: "Eur. Consult. Ass." + body/title + session + doc number + (year).\n' +
      'Recent materials: cite to Council of Europe website per R. 18.2.',
    examples: [
      'Eur. Consult. Ass. Deb. 10th Sess. 639 (Oct. 16, 1958).',
      'Eur. Consult. Ass., Reply of the Comm. of Ministers, 12th Sess., Doc. No. 1126 (1960).',
    ],
  },
  'R. 21.11': {
    title: 'World Trade Organization',
    explanation:
      '(a) Panel/Appellate Body: "Panel Report" or "Appellate Body Report" + case title + ¶ + WTO Doc. number + (adopted date). Members\' submissions: indicate location if not publicly available.\n\n' +
      '(b) GATT panel decisions: cite to B.I.S.D. Title + case number + (date) + supplement number + page + (year).\n\n' +
      '(c) Reports: cite per R. 21.7.3 with WTO Doc. number.\n\n' +
      '(d) Founding agreements: cite per R. 21.4.5. Annex agreements: indicate parent agreement. GATT-era side agreements: cite to B.I.S.D. Short forms: cite articles/paragraphs only.\n\n' +
      '(e) Ministerial documents: issuing body + declaration title + WTO Doc. number + parallel source.\n\n' +
      '(f) Other: (i) ICSID per R. 21.6, (ii) press releases per R. 17.2.3, (iii) website per R. 18.2.',
    examples: [
      'Panel Report, United States—Sections 301–310 of the Trade Act of 1974, WTO Doc. WT/DS152/R (adopted Jan. 27, 2000).',
      'Appellate Body Report, Brazil—Export Financing Programme for Aircraft, ¶ 19, WTO Doc. WT/DS46/AB/R (adopted Aug. 20, 1999).',
      'Marrakesh Agreement Establishing the World Trade Organization, Apr. 15, 1994, 1867 U.N.T.S. 154.',
    ],
  },
  'R. 21.12': {
    title: 'International Monetary Fund',
    explanation:
      '(a) Reports: cite per R. 21.7.3. Include "IMF" + report title + report series name + (date).\n\n' +
      '(b) Executive Board documents: body name (abbreviated per R. 15.1(e)) + title + pincite + document symbol + date.\n\n' +
      '(c) Institutional archives: cite per R. 23.\n\n' +
      '(d) Founding agreements: cite per R. 21.4.5.',
    examples: [
      'IMF, Promoting a More Secure and Stable Global Economy, Annual Report 2013 (Apr. 2013).',
      'Articles of Agreement of the IMF, art. 8, § 3, 60 Stat. 1401, 2 U.N.T.S. 39.',
    ],
  },
  'R. 21.13': {
    title: 'Other Intergovernmental Organizations',
    explanation:
      'Cite per R. 21.7 or R. 21.8–.12. Include: (1) full org name [abbreviation from T3]; (2) title; (3) pincite; (4) document number; (5) full date; (6) web link if needed.\n\n' +
      'Resolutions: cite like G.A./S.C. resolutions per R. 21.7.2, listing org + document number + date.',
    examples: [
      'International Atomic Energy Agency [IAEA], Supply Agreement for a Research Reactor in Romania, at 3, IAEA Doc. INFCIRC/206 (June 12, 1974).',
      'Organization of African Unity [OAU] Charter art. 3, ¶ 2.',
      'Association of Southeast Asian Nations [ASEAN] Charter art. 6, ¶ 2(a).',
    ],
  },
  'R. 21.14': {
    title: 'International Non-Governmental Organizations (NGOs)',
    explanation:
      'Cite analogously to U.N. materials per R. 21.7. Include: organization name [abbreviation per R. 21.13] + document title + document number + date.',
    examples: [
      'Amnesty International, Sierra Leone: Ending Impunity an Opportunity Not to Be Missed, AI Index AFR 51/60/2000 (July 26, 2000).',
    ],
  },
  'R. 21.15': {
    title: 'Yearbooks',
    explanation:
      'U.N. yearbooks: cite per R. 21.7.8. Other international yearbooks/annual reports: cite as periodicals per R. 16. Italicize article titles but not materials not ordinarily italicized (e.g., case names in footnotes). Give yearbook title in original language (abbreviated per T3, T6, T13, R. 20.2.3) and issuing organization if not obvious.',
    examples: [
      'Ronald Graveson, The Inequality of the Applicable Law, 1980 Brit. Y.B. Int\'l L. 231, 233.',
      'X. v. Belgium, 1961 Y.B. Eur. Conv. on H.R. (Eur. Comm\'n of H.R.) 224.',
    ],
  },
  'R. 21.16': {
    title: 'Digests',
    explanation:
      '(a) Annual digests: title for subsection + year + digest title + chapter/section + pincite.\n' +
      '(b) Named digests (multi-volume, known by editor): section title + volume + editor\'s name + "Digest" + chapter/section.\n' +
      '(c) Foreign digests: cite analogously; provide full title first time with abbreviation in brackets.\n' +
      '(d) Digests as periodical sections: cite as article per R. 16.',
    examples: [
      'U.N. Plan for Namibian Independence, 1989–90 Digest of United States Practice in International Law, ch. 7, §A(1) at 198.',
      'Access to Courts, 8 Whiteman Digest, ch. 23, § 7, at 408.',
    ],
  },
  'R. 21.17': {
    title: 'Short Citation Forms — International Materials',
    explanation:
      '(a) Treaties: "supra" with treaty name + page. Use [hereinafter] short title if given.\n' +
      '(b) International cases/arbitrations: short forms per R. 10.9.\n' +
      '(c) U.N./intergovernmental materials: "id." and "supra" with resolution/report name. Use [hereinafter] short title if given.\n' +
      '(d) Yearbooks/digests: short forms per R. 16.9; "id." and "supra" permitted.',
    examples: [
      'Convention for the Avoidance of Double Taxation, supra note 6, at 25.',
      'G.A. Res. 1962, supra note 4, at 22.',
    ],
  },
  'R. 22': {
    title: 'Tribal Nations',
    explanation:
      'R. 22 provides guidelines for citing materials produced by Tribal Nations. When filing with Tribal courts that have their own citation conventions, follow Tribal citation conventions.\n\n' +
      'R. 22.1 — Tribal Nations with established citation format: use the Tribal Nation\'s format as the primary citation, with a parallel citation in square brackets per R. 22.2.\n\n' +
      'R. 22.2 — Tribal Nations without established format:\n' +
      '22.2.1 — Constitutions: "Const. of the [Tribal Nation]" + art./§. Do not abbreviate Tribal Nation names. Amendments: indicate parenthetically. Superseded: cite by year of adoption.\n' +
      '22.2.2 — Codes: (1) title/chapter number; (2) full code name (Tribal language if applicable + [English]); (3) § number; (4) year; (5) URL. Do not abbreviate code or Tribal Nation names. Subject-matter codes: include subject name.\n' +
      '22.2.3 — Orders/Ordinances/Resolutions: (1) name; (2) number; (3) year; (4) (Tribal Council/body); (5) (Tribal Nation if not evident). Resolutions enacting code: add parenthetical. Special types: identify classification.\n' +
      '22.2.4 — Cases: (1) case name (don\'t abbreviate Tribal parties); (2) tribal reporter if available; (3) docket number; (4) (court, date); (5) URL or database; (6) subsequent history. Cite internet source primarily, with optional parallel reporter.\n' +
      '22.2.5 — Treaties: cite per R. 21.4.\n\n' +
      'R. 22.3 — Short citation form: use standard short forms.',
    examples: [
      'Const. of the Comanche Nation art. II, § 1.',
      'Pueblo de San Ildefonso Code § 4.1.1.010 (2023).',
      'Healing to Wellness Court, Res. No. 023-22 (2022) (Stockbridge-Munsee Tribal Council).',
      'The People of the Pokagon Band of Potawatomi Indians v. Edelberg, No. 18-4723-CR (Pokagon Band of Potawatomi Indians Tribal Ct. Jan. 18, 2019).',
    ],
  },
  'R. 20.7': {
    title: 'Short Citation Forms — Foreign Materials',
    explanation:
      '(a) Cases — common law: use short forms analogous to R. 10.9. Civil law: include enough information to uniquely identify the original source plus any helpful additional information.\n\n' +
      '(b) Constitutions: do not use a short form other than "id." for constitutions.\n\n' +
      '(c) Statutes: use short forms analogous to R. 12.10 when possible. Otherwise include enough to uniquely identify the source. The jurisdiction parenthetical may be included if not evident from the short form elements.\n\n' +
      '(d) Periodicals: use short forms analogous to R. 16.9.',
    examples: [
      'CSJN, 18/7/2001, "Frenquel, Adolfo," L.L. (2001-D-23).',
      'C.S.J., 15 noviembre 1954, "Suárez, Alfredo," R.G.J. No. 190 p. 146.',
      'Law 85-699 of July 11, 1985, art. 4 (Fr.).',
    ],
  },
  'R. 22.3': {
    title: 'Short Citation Forms — Tribal Nations',
    explanation:
      'Short citation forms for Tribal Nations follow the corresponding short forms for sources of the same type: R. 10.9 for cases, R. 11 for constitutions, R. 12.10 for codes and orders/ordinances/resolutions, R. 21.17(a) for treaties.',
  },
  'R. 23': {
    title: 'Archival Sources',
    explanation:
      'R. 23 covers citations to documents and objects housed in archival collections.\n\n' +
      'R. 23.1 — Basic form: author + title + institutional affiliation + pincite + (date) + (on file with [archive owner], [collection], [location]).\n\n' +
      'R. 23.2 — Author: (a) signed materials: per R. 15.1 in roman type. (b) Unsigned: omit author. (c) Pen names: per R. 15.1(d). (d) Letters/memos: per R. 17.2.3.\n\n' +
      'R. 23.3 — Title: (a) full title as on first page, capitalized per R. 8, roman type. (b) No title: use objective descriptors. (c) Letters/memos: per R. 17.2.3.\n\n' +
      'R. 23.4 — Institutional affiliation: add when document was prepared for an institution but archived elsewhere. Abbreviate per T6, T7, T10, T13.\n\n' +
      'R. 23.5 — Date: use date printed/signed. Undated: "(n.d.)". Approximate: "(c. [year])".\n\n' +
      'R. 23.6 — Archival information (on file with parenthetical):\n' +
      '(a) Archive owner: main overseeing institution.\n' +
      '(b) Collection: principal archive name + subcollection, largest to smallest.\n' +
      '(c) Location: box/folder/reel/record group; most specific available.\n\n' +
      'R. 23.7 — Case materials:\n' +
      '23.7.1 — Justices\' papers: retain "Justice" honorific. Law clerks: include position + court. Case info: include case name + docket number.\n' +
      '23.7.2 — Other courts: (a) admin proceedings: title + exhibit + agency + case number. (b) Other courts: use usual case citation.\n\n' +
      'R. 23.8 — Pre-1900 newspapers: cite per R. 16.6 + archival parenthetical. Online-only databases: use URL for archival location.\n\n' +
      'R. 23.9 — Databases reprinting primary sources: cite with "reprinted by" + database owner + database name + URL.\n\n' +
      'R. 23.10 — Handwritten/typewritten documents:\n' +
      '(a) Typeface: roman type default. Cursive emphasis: italics.\n' +
      '(b) Deletions: omit without parenthetical or use strikethrough. Isolated quotes: "(strikethrough omitted).".\n' +
      '(c) Unintelligible: use ellipses + "(unintelligible text omitted).".\n\n' +
      'R. 23.11 — Tangible objects: cite like archival documents, omitting author. Use object creation date. Use archive\'s title; shorten if needed. Add object nature (photograph, painting) if not clear.',
    examples: [
      'Jordan A. Kei-Rahn, Law Clerk, Redacted Report on Jurisdiction Stripping in FTCA Claims, Dep\'t of Just. 143 (July 7, 2022) (on file with Yale L.J., Managing Editor Records, Box 7, Folder 34).',
      'Letter from Maria Nichols to Oliver Otis Howard (Oct. 11, 1866) (on file with Nat\'l Archives, Records of the Bureau of Refugees, Record Group 105.5).',
      'Thomas Jefferson, Ice Cream Recipe (n.d.) (on file with Libr. of Cong., Thomas Jefferson Papers, Series I, Microfilm Reel 056).',
      'Alexander Hamilton, Report on the Subject of Manufactures (Dec. 5, 1791), reprinted by Nat\'l Archives: Founders Online, https://founders.archives.gov/...',
      'Death Mask of Napolean Bonaparte (1833) (on file with Brown Univ., John Hay Library, Hoffman Collection on Napolean).',
    ],
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
