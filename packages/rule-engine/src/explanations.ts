/**
 * Human-readable explanations for Bluebook and Indigo rules.
 * Used in the UI's rule explanation modals.
 */
export interface RuleExplanation {
  title: string;
  explanation: string;
  examples?: string[];
  references?: string[];
  tips?: string[];
  commonMistakes?: string[];
  decisionSteps?: string[];
}

export const RULE_EXPLANATIONS: Record<string, RuleExplanation> = {
  'R. 1': {
    title: 'Structure and Use of Citations',
    explanation:
      'Provide citations to authorities so that readers may identify and find those authorities for future research. Citations are made in citation sentences and clauses (R. 1.1) and are introduced by signals. Signals organize authorities and show how those authorities support or relate to a proposition given in the text (R. 1.2). Citation sentences and clauses may contain more than one signal. Order signals according to R. 1.3. Within each signal, arrange authorities according to R. 1.4. Parentheticals may be necessary to explain the relevance of a particular authority to the proposition given in the text (R. 1.5). Certain additional information, specific to that authority, may also be appended according to R. 1.6.',
    references: ['R. 1.1', 'R. 1.2', 'R. 1.3', 'R. 1.4', 'R. 1.5', 'R. 1.6'],
  },
  'R. 1.1': {
    title: 'Citation Sentences and Clauses in Law Reviews',
    explanation:
      'Citations may be made in one of two ways: in citation sentences or in citation clauses. In law review pieces, all citations appear in footnotes appended to the portions of the text to which they refer.\n\n' +
      '(a) Text: Citations to authorities that support (or contradict) a proposition made in the main text are placed in footnotes. A footnote call number should appear at the end of a textual sentence if the cited authority supports the entire sentence. A call number should appear within the sentence next to the portion it supports if the cited authority supports only that part. The call number comes after any punctuation mark (comma, semicolon, period) except a dash or colon.\n\n' +
      '(b) Footnotes: If a footnote itself contains an assertion requiring support, a citation should appear directly after the assertion as either a citation sentence or a citation clause.\n' +
      '(i) Citation sentences: Authorities supporting an entire footnote sentence are cited in a separate citation sentence immediately after. The citation sentence starts with a capital letter and ends with a period.\n' +
      '(ii) Citation clauses: Authorities supporting only part of a footnote sentence are cited in clauses, set off by commas, that immediately follow the proposition they support.',
    examples: [
      'Some American jurisdictions place the burden of sustaining criminal defenses on the accused.¹',
      '¹ See John Calvin Jeffries, Jr. & Paul B. Stephan III, Defenses, Presumptions, and Burden of Proof in the Criminal Law, 88 Yale L.J. 1325, 1329–30 (1979).',
      '² E.g., State v. Caryl, 543 P.2d 389, 390 (Mont. 1975); State v. Hinson, 172 S.E.2d 548, 551 (S.C. 1970).',
    ],
    references: ['B1', 'R. 1.2', 'R. 1.5'],
  },
  'B1': {
    title: 'Structure of Citations (Bluepages)',
    explanation:
      'Bluepages B1 covers the basic structure of citations in practitioners\' documents (briefs, memoranda, motions). Citations appear as citation sentences or citation clauses within the body of the document (not in footnotes, unlike law review format). See B1.1 for citation sentences and clauses, B1.2 for introductory signals, and B1.3 for explanatory parentheticals.',
    references: ['B1.1', 'B1.2', 'B1.3', 'R. 1'],
  },
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
    tips: [
      'Prefer citation sentences for clarity — they are easier to read and process.',
      'Rewrite sentences to avoid embedded citations when possible.',
      'Do NOT split citations across line breaks in practitioner documents.',
      'Multiple citation clauses in one sentence can be hard to follow — consider breaking into separate citation sentences.',
    ],
    commonMistakes: [
      'Starting a citation clause with a capital letter (only capitalize if beginning a citation sentence).',
      'Ending a citation clause with a period when it\'s not the last clause in the sentence.',
      'Using Id. in an embedded citation (Id. cannot be used when the citation is part of the grammatical sentence).',
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
  'R. 1.6': {
    title: 'Related Authority',
    explanation:
      'When citing a work, citations to related authorities may be helpful to aid in locating the primary work or to provide relevant information not reflected in the primary citation. Citations to related authority may be appended to the primary citation with the use of an italicized explanatory phrase.\n\n' +
      '(a) Related authority intended to increase access:\n' +
      '(i) "In" — When citing a shorter work (article, essay, speech) originally published in a collecting volume, use "in" to introduce the collection (see R. 15.5).\n' +
      '(ii) "Reprinted in" — A work that reprints a source originally published elsewhere. Provide a complete citation for the original work, followed by "reprinted in." For excerpts or partial reprints, add "as" (e.g., "as reprinted in").\n' +
      '(iii) Other phrases may be used by analogy (e.g., "microformed on" per R. 18.6.1, "translated in" per R. 20.2.5).\n\n' +
      '(b) Relevant history: The prior or subsequent history of a case (R. 10.7) or statute (R. 12.7) may be appended.\n\n' +
      '(c) Commentary: Works that discuss or quote the primary authority may be appended using italicized phrases such as "noted in," "construed in," "quoted in," "reviewed by," "cited with approval in," and "questioned in." Works that the primary authority discusses, however, should be indicated parenthetically.',
    examples: [
      'Kay Deaux & Brenda Major, A Social-Psychological Model of Gender, in Theoretical Perspectives on Sexual Differences 89, 93 (Deborah L. Rhode ed., 1990).',
      'Louis Loss, The Conflict of Laws and the Blue Sky Laws, 71 Harv. L. Rev. 209 (1957), reprinted in Louis Loss & Edward M. Cowett, Blue Sky Law 180 (1958).',
      'S. Rep. No. 95-181, at 14 (1977), as reprinted in 1977 U.S.C.C.A.N. 3401, 3414.',
      'Matthews v. Konieczny, 488 A.2d 5 (Pa. Super. Ct. 1985), rev\'d, 527 A.2d 508 (Pa. 1987).',
      'Filled Milk Act § 1, 21 U.S.C. § 61 (2006), construed in Milnot Co. v. Richardson, 350 F. Supp. 221 (S.D. Ill. 1972).',
    ],
    references: ['R. 10.7', 'R. 12.7', 'R. 15.5', 'R. 18.6', 'R. 20.2'],
  },
  'R. 2': {
    title: 'Typography for Law Reviews',
    explanation:
      'Legal writing uses four typefaces, though choice of font may vary: Ordinary Roman (Plain Text), Underlined, Italicized, and Small Capitals.\n\n' +
      'Law reviews use two sets of typeface conventions — one for law review text (either main text or footnote text) (R. 2.2) and one for law review citations (R. 2.1). Unless otherwise noted, the examples in The Bluebook correspond to the convention for law review footnotes.\n\n' +
      'For typeface conventions in practitioners\' documents (briefs, memoranda), see Bluepages B2.',
    references: ['R. 2.1', 'R. 2.2', 'R. 2.3', 'B2'],
  },
  'R. 2.1': {
    title: 'Typeface Conventions for Citations',
    explanation:
      'Most law reviews use three typefaces in citations: Ordinary Roman (Plain Text), Italics, and Small Capitals.\n\n' +
      '(a) Case names: Use ordinary roman type for case names in full citations, except for procedural phrases (always italicized). Use italics for short form case citations.\n' +
      '(b) Books: Use small capitals for both authors and titles.\n' +
      '(c) Periodicals: Italicize article titles; use small capitals for periodical names. Authors\' names in ordinary roman.\n' +
      '(d) Introductory signals: Italicize all introductory signals in citation sentences/clauses. Do NOT italicize when the signal is a verb in an ordinary sentence.\n' +
      '(e) Explanatory phrases (R. 1.6, R. 10.7, R. 12.8): Italicize all explanatory phrases. Exception: parenthetical phrases like "(quoting ...)" and "(citing ...)" are NOT italicized.\n' +
      '(f) Punctuation: Italicize commas/semicolons only when they are part of the italicized material, not when they are elements of the sentence.\n' +
      '(g) Omissions and Alterations: Always romanize ellipses (. . .) and brackets ([]) even within italicized/underlined material.',
    examples: [
      'Lochner v. New York, 198 U.S. 45 (1905).',
      'State ex rel. Scott v. Zinn, 392 P.2d 417 (N.M. 1964).',
      'Lochner, 198 U.S. at 50.',
      'Richard Kluger, Simple Justice (1976).',
      'Katherine K. Baker, Once a Rapist? Motivational Evidence and Relevancy in Rape Law, 110 Harv. L. Rev. 563 (1997).',
      'See, e.g., 62 Cases v. United States, 340 U.S. 593 (1951).',
    ],
    references: ['R. 1.2', 'R. 1.6', 'R. 10.7', 'R. 12.8', 'R. 5.2', 'R. 5.3'],
  },
  'R. 2.2': {
    title: 'Typeface Conventions for Textual Material',
    explanation:
      '(a) Main text: Uses only ordinary roman type and italics. Italicize: (i) case names (including "v." and procedural phrases); (ii) titles of publications, speeches, or articles; (iii) words for emphasis or stylistic purposes (R. 7).\n\n' +
      '(b) Footnote text: May contain citations in citation clauses embedded in sentences.\n' +
      '(i) Case names that are grammatically part of the sentence: italicize.\n' +
      '(ii) Case names in citation clauses (not grammatically part of the sentence): use citation typeface conventions (R. 2.1(a)).\n' +
      '(iii) Other authorities: If full or short form citation is given, use citation typeface. If reference is without citation information, use main text typeface (R. 2.2(a)(ii)).\n' +
      '(iv) In explanatory parentheticals: follow citation typeface for case names when a full citation clause is included.\n\n' +
      '(c) Punctuation: Italicize only when part of italicized material.\n' +
      '(d) Omissions and Alterations: Always romanize ellipses and brackets in quoted materials.',
    examples: [
      'In Loving v. Virginia, the Court invalidated Virginia\'s antimiscegenation statute.',
      'In Loving v. Virginia, 388 U.S. 1 (1967), the Court invalidated Virginia\'s antimiscegenation statute.',
    ],
    references: ['R. 2.1', 'R. 7', 'R. 5.2', 'R. 5.3'],
  },
  'R. 2.3': {
    title: 'Other Punctuation Conventions',
    explanation:
      'Use only one space after punctuation for all standard proportional fonts. Only double space after monospaced fonts (e.g., Courier, Menlo, Consolas).\n\n' +
      'Double spacing after periods is a relic of the period in which all typewriter fonts were monospaced. Modern word processing automatically makes such adjustments, and thus double spacing proportional fonts will result in formatting errors.',
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
  'R. 3': {
    title: 'Subdivisions',
    explanation:
      'Most subdivisions (such as columns or sections) in citations are abbreviated. See Table T16 for a list of subdivision abbreviations.',
    references: ['R. 3.1', 'R. 3.2', 'R. 3.3', 'R. 3.4', 'R. 3.5', 'T16'],
  },
  'R. 3.1': {
    title: 'Volumes, Parts, and Supplements',
    explanation:
      'A single work often appears in separately paginated volumes, parts, or supplements. A citation must identify the separately paginated subdivision.\n\n' +
      '(a) Volumes: Cite volume number in Arabic numerals. If the author of the entire work is cited, the volume number precedes the author\'s name. Otherwise, the volume number precedes the volume\'s title. If no volume number exists but the volume is identifiable by year, use the year as the volume number and omit the year after the pincite. Use brackets for volume designations that include words.\n\n' +
      '(b) Separately paginated numbered parts: Include relevant subdivisions (e.g., "ser. 14, pt. 2, at 150").\n\n' +
      '(c) Supplements: Identify the supplement and its date in parentheses. To cite both main volume and supplement, use an ampersand.',
    examples: [
      '2 Frederick Pollock & Frederic William Maitland, The History of English Law 205–06 (2d ed. 1911).',
      'Thomas R. McCoy & Barry Friedman, Conditional Spending: Federalism\'s Trojan Horse, 1988 Sup. Ct. Rev. 85, 88.',
      'Haw. Rev. Stat. § 296-46.1 (Supp. 1984).',
      '42 U.S.C. § 1397b (1982 & Supp. I 1983).',
    ],
    references: ['R. 3.2', 'T16'],
  },
  'R. 3.2': {
    title: 'Pincites and Page Ranges',
    explanation: 'When citing specific pages within a source, provide a pincite after the first page number, separated by a comma. For page ranges with three or more digits, drop repetitious digits except the final two (e.g., 102–06, not 102–106). Use "at" for pincites in short form citations. Footnotes are cited as "n.4" (no space between "n." and the number).',
    examples: ['Baker v. Carr, 369 U.S. 186, 195 (1962).', '199 n.4', '102–06'],
    tips: [
      'The first page of a source MUST be repeated as a pinpoint when you are citing that specific page: "363, 363" not just "363".',
      'Non-consecutive pages retain ALL digits and use commas: "414, 418" not "414, 18".',
      'Use an en dash (–), not a hyphen (-), for page ranges.',
      'Consecutive footnotes use "nn." (double n): "nn.5–6"; a page AND footnote uses "&": "147 & n.5".',
    ],
    commonMistakes: [
      'Dropping too many digits in page ranges (writing "102–6" instead of "102–06").',
      'Forgetting to repeat the first page as a pinpoint.',
      'Using a hyphen instead of an en dash for ranges.',
      'Writing "n. 4" with a space instead of "n.4".',
    ],
  },
  'R. 3.2(a)': {
    title: 'Page Range Abbreviation',
    explanation: 'For three or more digit page numbers in a range, drop repetitious digits but always retain at least the last two digits of the ending page number.',
    examples: ['102–06 (not 102–106)', '1020–30 (not 1020–1030)'],
    tips: [
      'Always retain at least TWO digits at the end of a range.',
      'Non-consecutive pages (separated by commas) retain ALL digits: "414, 418".',
    ],
    commonMistakes: [
      'Writing "102–6" instead of "102–06" — must retain last two digits.',
      'Dropping digits in non-consecutive page citations.',
    ],
  },
  'R. 3.3': {
    title: 'Sections and Paragraphs',
    explanation:
      'If an authority is organized by section (§) or paragraph (¶), cite to these subdivisions. A page number may also be provided if useful.\n\n' +
      'If organized by indented paragraphs NOT introduced by ¶ symbols, use "para." instead.\n\n' +
      'Do NOT use "at" before a section or paragraph symbol (use "Id. § 7" not "Id. at § 7").\n\n' +
      '(a) Subsections: Use the original punctuation separating sections from subsections. If none exists, use parentheses.\n' +
      '(b) Multiple sections: Use §§. Give inclusive numbers; do not use "et seq." Drop identical leading digits before punctuation unless confusing.\n' +
      '(c) Multiple paragraphs: Treat like multiple sections (¶¶).\n' +
      '(d) Flush language and examples: Indicate in a parenthetical (e.g., "(flush language)").',
    examples: [
      '15 U.S.C. § 18 (1982).',
      'Id. § 7.',
      'Not: Id. at § 7.',
      'Wash. Rev. Code Ann. §§ 18.51.005–.52.900 (West 1989 & Supp. 1991).',
      '28 U.S.C. § 105(a)(3)–(b)(1).',
      'I.R.C. § 960(c) (flush language).',
    ],
    tips: [
      'Section ranges depend on the punctuation within section numbers: no punctuation → retain all digits (§§ 1874–1875); period/colon → omit repetitious digits before final punctuation (§§ 284.15–.16); hyphen → use "to" instead of en dash (§§ 320-45-16 to -17).',
      'Use §§ for multiple sections, ¶¶ for multiple paragraphs — always with a space before the number.',
      'Do NOT use "at" before § or ¶: "Id. § 7" not "Id. at § 7".',
      'Consecutive subsections use ONE § symbol: "§ 1874(b)–(c)" not "§§ 1874(b)–(c)".',
      'Non-consecutive subsections use commas: "§ 1874(b), (f)".',
      'Never use "et seq." — always give the inclusive range.',
    ],
    commonMistakes: [
      'Using "at" before § or ¶ symbols.',
      'Using §§ for consecutive subsections within the same section (should be single §).',
      'Using "et seq." instead of specifying the full range.',
      'Missing the space after § or ¶ symbol.',
      'Dropping digits in section ranges that have no internal punctuation.',
    ],
    references: ['R. 6.2(c)', 'R. 12.4', 'T16'],
  },
  'R. 3.4': {
    title: 'Appended Material',
    explanation:
      'Indicate an appendix or appended note/comment by placing the appropriate abbreviation (see T16) after the citation to the largest full subdivision to which the item is appended.\n\n' +
      'Cite a particular page, section, or other subdivision in an appendix after the appendix abbreviation.\n\n' +
      'Advisory committee notes, comments, and illustrations should be cited as appended material.\n\n' +
      'Appendices that reprint materials normally cited to another source should be cited according to R. 1.6(a).',
    examples: [
      'Restatement (Second) of Torts § 623A cmt. a (A.L.I. 1977).',
      '50 U.S.C. app. § 454.',
      'Fed. R. Civ. P. 60(b) advisory committee\'s note to 1946 amendment.',
      'Restatement (Second) of Prop. § 2.1 cmt. c, illus. 2 (A.L.I. 1977).',
    ],
    references: ['R. 1.6', 'T16'],
  },
  'R. 3.5': {
    title: 'Internal Cross-References',
    explanation:
      'Portions of text, footnotes, and groups of authorities within the piece may be cited using "supra" or "infra." Use supra to refer to material that has already appeared; use infra for material that appears later.\n\n' +
      'Use a consistent naming convention: "Part" for main subdivisions, "Section" for smaller subdivisions, "note" for footnotes, "p."/"pp." for pages, "Figure" and "Table" for graphics.\n\n' +
      'Always retain the last two digits in page ranges, but drop other repetitious digits.\n\n' +
      'Note that "supra" is also used in short form citations for certain types of sources (see R. 4.2).',
    examples: [
      'See supra text accompanying notes 305–07.',
      'See supra notes 12–15, 92–97 and accompanying text.',
      'See discussion infra Sections II.B.2, III.C.1.',
      'See supra Part IV.',
      'See infra pp. 106–07.',
      'See supra Figure 2.',
    ],
    references: ['R. 4.2'],
  },
  'R. 4': {
    title: 'Short Citation Forms',
    explanation:
      'This rule provides general guidance for all short forms. For guidance on specific short forms, see: Cases (R. 10.9), Constitutions (R. 11), Statutes (R. 12.10), Legislative Materials (R. 13.8), Regulations (R. 14.6), Books (R. 15.10), Periodicals (R. 16.9), Unpublished Sources (R. 17.6), Internet/Electronic (R. 18.12), Services (R. 19.2), Foreign Materials (R. 20.7), International Materials (R. 21.17), Tribal Materials (R. 22.3), Archival Materials (R. 23.12).\n\n' +
      'For practitioners\' short forms, see Bluepages B4, B10.2, B12.2, B15.2, B16.2, B17.2, and B18.2.',
    references: ['R. 4.1', 'R. 4.2', 'R. 10.9', 'R. 12.10', 'R. 13.8', 'R. 14.6', 'R. 15.10', 'R. 16.9', 'R. 17.6', 'R. 18.12', 'R. 19.2', 'R. 20.7', 'R. 21.17', 'R. 22.3', 'R. 23.12'],
  },
  'R. 4.1': {
    title: 'Id. (Short Form)',
    explanation:
      '"Id." may be used in citation sentences and clauses for any kind of authority except internal cross-references (R. 3.5). In court documents, use "id." when citing the immediately preceding authority, but only when the preceding citation contains only one authority. In law review footnotes, use "id." when citing the immediately preceding authority within the same footnote or the immediately preceding footnote when it contains only one authority.\n\n' +
      'Indicate where a subsequent citation varies (e.g., different page number). The period at the end of "id." is always italicized.\n\n' +
      '"Id." may NOT be used to refer to one authority in a preceding footnote if the preceding footnote cites more than one source. However, sources in explanatory parentheticals, explanatory phrases, or prior/subsequent history are ignored for this rule.\n\n' +
      '"Id." may not be used to refer to an internal cross-reference.',
    examples: [
      '¹ Chalfin v. Specter, 233 A.2d 562, 562 (Pa. 1967).\n² Id. at 563.',
      '³ 42 U.S.C. § 1983.\n⁴ See id. § 1981.',
      '⁸ Fleming James, Jr. & Geoffrey C. Hazard, Jr., Civil Procedure §§ 1.3–.5 (3d ed. 1985).\n⁹ See id. § 1.7.',
    ],
    tips: [
      '"Id." may ONLY be used when the immediately preceding citation contains a single authority.',
      'Do NOT use "at" before § or ¶ symbols: "Id. § 7" not "Id. at § 7".',
      'The period in "Id." is always italicized along with the word.',
      '"Id." at the start of a citation sentence is capitalized; after a semicolon it is lowercase.',
      'Do NOT add a second period after "Id." at the end of a sentence — "Id." already ends with one.',
      '"Id." cannot be used in embedded citations (citations used as grammatical parts of a sentence).',
    ],
    commonMistakes: [
      'Using Id. after a citation with multiple authorities separated by semicolons.',
      'Writing "Id. at § 7" instead of "Id. § 7" — no "at" before section/paragraph symbols.',
      'Writing "Id.." with a double period at the end of a sentence.',
      'Using "Ibid." instead of "Id." — "Ibid." is not used in Bluebook citations.',
      'Writing "ID." in all capitals instead of "Id."',
      'Using "id." (lowercase) at the start of a citation sentence.',
    ],
    references: ['R. 3.5', 'R. 4.2'],
  },
  'R. 4.2': {
    title: 'Supra and Hereinafter',
    explanation:
      '"Supra" and "hereinafter" may be used for: legislative hearings, court filings, books, pamphlets, reports, unpublished materials, nonprint resources, periodicals, services, treaties, regulations/directives of intergovernmental organizations, and internal cross-references.\n\n' +
      '"Supra" and "hereinafter" should NOT be used for: cases, statutes, constitutions, legislative materials/debates (other than hearings), restatements, model codes, or regulations (except in extraordinary circumstances like extremely long names).\n\n' +
      '(a) "Supra": Use the last name of the author, a comma, "supra," and the footnote number where the full citation appears. Add volume/paragraph/section/page/timestamp for specific material.\n\n' +
      '(b) "Hereinafter": For cumbersome authorities, establish a shortened form in brackets after the first citation (before any explanatory parenthetical). Use the shortened form in subsequent citations with "supra."',
    examples: [
      'Reich, supra note 16, at 6.',
      'James & Hazard, supra note 8, § 7.21.',
      'Keeton et al., supra note 31, § 2, at 4.',
      '[hereinafter Hearings] — then: Hearings, supra note 37, at 33.',
    ],
    references: ['R. 4.1', 'R. 3.5'],
  },
  'R. 5': {
    title: 'Quotations',
    explanation:
      'Rules for formatting quotations, making alterations, and indicating omissions in legal writing. See R. 5.1 for formatting (block vs. inline), R. 5.2 for alterations and quotations within quotations, and R. 5.3 for omissions (ellipses).',
    references: ['R. 5.1', 'R. 5.2', 'R. 5.3'],
  },
  'R. 5.1': {
    title: 'Formatting of Quotations',
    explanation:
      '(a) Quotations of fifty or more words: Indent on left and right, single space, fully justify, without quotation marks. Internal quotation marks appear as in the original. Citation should begin at the left margin on the line immediately following the quotation.\n\n' +
      '(b) Quotations of forty-nine or fewer words: Enclose in quotation marks but do not otherwise set off. Always place commas and periods inside the quotation marks; place other punctuation outside unless part of the original.\n\n' +
      'Paragraph structure: Indent first line of each paragraph in block quotes. If language at the beginning of the first paragraph is omitted, do not indent or use an ellipsis. Indicate omission of one or more entire paragraphs by inserting and indenting four periods (". . . .") on a new line.',
    examples: [
      'United States v. Nixon, 418 U.S. 683, 708–09 (1974) (second alteration in original) (citation omitted).',
    ],
    references: ['R. 5.2', 'R. 5.3'],
  },
  'R. 5.2': {
    title: 'Alterations and Quotations Within Quotations',
    explanation:
      '(a) Substitution of letters or words: Enclose changed letters in brackets (e.g., "[P]ublic"). Substituted words and other inserted material should also be bracketed.\n' +
      '(b) Omission of letters: Use empty brackets (e.g., "judgment[]").\n' +
      '(c) Mistakes in original: Follow significant mistakes with "[sic]" and leave as they appear.\n' +
      '(d) Changes to citations: Use a parenthetical to indicate additions of emphasis, alterations, or omissions of citations/emphasis/footnote call numbers. Do NOT indicate omission of a citation following the last word quoted. Do NOT indicate that emphasis appears in the original.\n' +
      '(e) Quotations within quotations: Attribute to the original source. Insert a parenthetical with "(quoting [source])" after any parenthetical required by R. 5.2(d).\n' +
      '(f) Internal quotation marks: Omit if the opening mark is at the very beginning and the closing mark at the very end of an in-line quotation. Do NOT omit in block quotations. Do NOT omit multiple levels of nested marks.',
    examples: [
      '"[P]ublic confidence in the [adversary] system depend[s upon] full disclosure."',
      '"This list of statutes are [sic] necessarily incomplete."',
      'Bowers v. Hardwick, 478 U.S. 186, 205 (1986) (Blackmun, J., dissenting) (second emphasis added).',
      'Ward v. Rock Against Racism, 491 U.S. 781, 797 (1989) (alteration in original) (citation omitted).',
    ],
    references: ['R. 1.5(b)', 'R. 5.3', 'R. 10.6'],
  },
  'R. 5.3': {
    title: 'Omissions',
    explanation:
      'Omission of words is indicated by an ellipsis: three periods separated by spaces and set off by a space before and after (". . ."). Never use an ellipsis to begin a quotation.\n\n' +
      '(a) Quoted language as a phrase or clause: Do NOT indicate omission before or after the quotation. DO indicate omission within with an ellipsis.\n\n' +
      '(b) Quoted language as a full sentence:\n' +
      '(i) Beginning omitted: Capitalize the first letter and bracket it if not already capitalized ("[B]orders...").\n' +
      '(ii) Middle omitted: Insert ellipsis where language is omitted.\n' +
      '(iii) End omitted: Insert ellipsis between last word and final punctuation ("time . . . .").\n' +
      '(iv) After last quoted sentence: Do NOT indicate deletion after the final period.\n' +
      '(v) After end of sentence followed by more quotation: Retain the period and insert ellipsis before the remainder.\n' +
      '(vi) Both end and after end omitted: Use only one ellipsis for both.\n\n' +
      '(c) Omitted footnote or citation: Use "(footnote omitted)" or "(citation omitted)" parenthetical. Do NOT insert an ellipsis.',
    examples: [
      '"[B]orders are less of a barrier to economic exchange now than at almost any other time in history."',
      '"National borders are less of a barrier . . . now than at almost any other time in history."',
      '"National borders are less of a barrier to economic exchange now than at almost any other time . . . ."',
    ],
    references: ['R. 5.1', 'R. 5.2'],
  },
  'B5': {
    title: 'Quotations (Bluepages)',
    explanation:
      'Bluepages B5 covers quotation formatting in practitioners\' documents. See B5.1 for general formatting rules, B5.2 for alterations and block quotations, and B5.3 for modifications to quoted text.',
    references: ['B5.1', 'B5.2', 'B5.3', 'R. 5'],
  },
  'R. 6': {
    title: 'Abbreviations, Numerals, and Symbols',
    explanation:
      'Rules governing the use of abbreviations, numerals, and symbols in legal citations and text. See R. 6.1 for abbreviation rules and R. 6.2 for numerals and symbols.',
    references: ['R. 6.1', 'R. 6.2'],
  },
  'R. 6.1': {
    title: 'Abbreviations',
    explanation:
      'Tables at the end of the Bluebook contain abbreviation lists for: arbitral reporters (T5), case names/institutional authors/periodical titles (T6), court names (T7), explanatory phrases (T8), legislative documents (T9), geographical terms (T10), judges and officials (T11), months (T12), institutional periodical names (T13), publishing terms (T14), services (T15), and subdivisions (T16).\n\n' +
      'Abbreviations not listed should be avoided unless substantial space is saved and the result is unambiguous.\n\n' +
      '(a) Spacing: Close up adjacent single capitals (N.W., S.D.N.Y.). Do not close up single capitals with longer abbreviations (D. Mass., S. Ct.). In periodical names, set off capitals referring to institutional entities with a space (B.C. L. Rev., N.Y.U. L. Rev.). Numbers/ordinals are treated as single capitals (F.3d, S.E.2d). Insert a space adjacent to abbreviations with 2+ letters (So. 2d, F. Supp. 2d).\n\n' +
      '(b) Periods: Every abbreviation followed by a period, except when the last letter is set off by an apostrophe (Ass\'n, Dep\'t). Entities with widely recognized initials (AARP, CBS, CIA, EPA, FCC, FDA, NAACP, NLRB) may omit periods in text and case names, but retain periods in reporter names, code names, and court names. "U.S." used only as an adjective (never omit periods).',
    examples: [
      'S.D.N.Y. (adjacent single capitals)',
      'D. Mass. (single capital + longer abbreviation)',
      'B.C. L. Rev. (institutional entity set off)',
      'F.3d (ordinal as single capital)',
      'So. 2d (space before 2+ letter abbreviation)',
      'City of Arlington v. FCC, 569 U.S. 290 (2013). But: 6 F.C.C. 378 (1938).',
    ],
    references: ['T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16'],
  },
  'R. 6.1(a)': {
    title: 'Abbreviation Spacing',
    explanation: 'Adjacent single capital letters have no space between them (e.g., S.D.N.Y.). A space separates a single capital from a longer abbreviation (e.g., D. Mass., S.D. Cal.). For reporter series, single capitals attach to ordinals without a space (F.2d, F.3d). In periodical names, close up all adjacent single capitals except when one refers to an institutional entity (B.C. L. Rev., N.Y.U. L. Rev.). Insert a space adjacent to abbreviations with two or more letters (So. 2d, F. Supp. 2d).',
    examples: ['S.D.N.Y. (not S. D. N. Y.)', 'D. Mass. (not D.Mass.)', 'F.2d (not F. 2d)', 'B.C. L. Rev.', 'So. 2d'],
  },
  'R. 6.2': {
    title: 'Numerals and Symbols',
    explanation:
      '(a) Numerals: Spell out zero to ninety-nine in text/footnotes; use numerals for larger numbers. Exceptions: (i) numbers beginning a sentence must be spelled out; (ii) round numbers may be spelled out; (iii) mixed series uses all numerals; (iv) decimals use numerals; (v) repeated percentages/dollar amounts use numerals; (vi) section/subdivision numbers use numerals; (vii) use commas for 4+ digit numbers (1,234,567) but not in page numbers, statutes, volume numbers, docket numbers, etc.\n\n' +
      '(b) Ordinals: In text, use "2nd" and "3rd" when numerals are required. In citations, always use "2d" and "3d" (not "2nd"/"3rd"). Never use superscripts.\n\n' +
      '(c) Section (§) and paragraph (¶) symbols: Spell out in text of law review pieces (except for U.S. Code and federal regulations). Use symbols in citations. Insert a space between the symbol and the numeral.\n\n' +
      '(d) Dollar ($) and percent (%) symbols: Use symbols with numerals; spell out with spelled-out numbers. No space between symbol and numeral. Never begin a sentence with a symbol.',
    examples: [
      '103d Cong. (not 103rd Cong.)',
      '2d ed. (not 2nd ed.)',
      '1,234,567',
      '§ 7 (space between symbol and number)',
    ],
    references: ['R. 3.3', 'R. 12.10', 'R. 14.6'],
  },
  'R. 6.2(b)': {
    title: 'Ordinals',
    explanation: 'In citations, use "2d" instead of "2nd" and "3d" instead of "3rd." Do not use superscripts. In textual sentences where numerals are required by R. 6.2(a), use "2nd" and "3rd." The distinction applies only in citations.',
    examples: ['2d Cir. (not 2nd Cir.)', 'F.3d (not F.3rd)', '103d Cong.', 'But in text: the 102nd Congress'],
  },
  'R. 7': {
    title: 'Italicization for Style and in Unique Circumstances',
    explanation:
      'See R. 2 for general typeface rules. This rule covers italicization for emphasis, foreign words, and other unique circumstances.\n\n' +
      '(a) Emphasis: Words and phrases may be italicized for emphasis.\n' +
      '(b) Foreign words and phrases: Italicize non-English words unless incorporated into common English usage. Do NOT italicize text from non-Roman alphabets (e.g., Mandarin, Arabic). Latin words often used in legal writing are common English and should NOT be italicized (e.g., e.g., i.e., res judicata, certiorari, habeas corpus, prima facie, mens rea, en banc). Very long or obsolete Latin phrases should remain italicized. Note: "id." is ALWAYS italicized. Procedural phrases like "In re" and "ex rel." are always italicized per R. 10.2.1(b).\n' +
      '(c) Hypothetical party letters: Italicize and capitalize (e.g., "A went to bank B in state C").\n' +
      '(d) Lowercase "l": Italicize to distinguish from numeral "1" (e.g., "§ 23(l)").\n' +
      '(e) Mathematical expressions: Italicize formulas and variables from standard word processors (e.g., "E = mc²"). Do NOT italicize those requiring specialized typesetting (LaTeX, MATLAB).',
    examples: [
      'expressio unius est exclusio alterius (italicized — uncommon Latin)',
      'res judicata (NOT italicized — common English)',
      'habeas corpus (NOT italicized — common English)',
      'A went to bank B in state C.',
    ],
    references: ['R. 2', 'R. 2.1', 'R. 10.2.1'],
  },
  'R. 8': {
    title: 'Capitalization',
    explanation:
      '(a) Headings and titles: Capitalize all words except articles, conjunctions, and prepositions of 4 or fewer letters (unless they begin the heading or follow a colon).\n' +
      '(b) Internet titles and URLs: Capitalize as the source does.\n' +
      '(c) Author last names: Follow the table of contents or title page.\n' +
      '(d) Text: Key capitalization rules:\n' +
      '(i) Capitalize nouns identifying specific persons, officials, groups, government offices, or bodies (e.g., "the Commissioner," "Congress," "the President," "the FDA," "the Agency"). Do NOT capitalize adjective forms ("congressional," "presidential," "federal" (unless modifying a capitalized word)).\n' +
      '(ii) Exceptions for specific words:\n' +
      '  • Act — capitalize when referring to a specific legislative act.\n' +
      '  • Circuit — capitalize with a circuit\'s name or number.\n' +
      '  • Code — capitalize when referring to a specific code.\n' +
      '  • Commonwealth — capitalize as part of a state title or when referring to a state as a party.\n' +
      '  • Constitution — capitalize when naming in full or referring to the U.S. Constitution; do NOT capitalize "constitutional."\n' +
      '  • Court — capitalize when naming a court in full or referring to the U.S. Supreme Court.\n' +
      '  • Federal — capitalize when the modified word is capitalized.\n' +
      '  • Judge, Justice — capitalize with a specific name or when referring to a Supreme Court Justice.\n' +
      '  • State — capitalize as part of a state title or when referring to a state as a party.\n' +
      '  • Term — capitalize when referring to a Supreme Court Term.',
    examples: [
      'The Act required operators to pay.',
      'The Fifth Circuit affirmed.',
      'The Court held that... (U.S. Supreme Court)',
      'The court of appeals reversed. (other courts)',
      'Justice Gorsuch dissented.',
      'The State brought this action. (state as party)',
    ],
    references: ['B8'],
  },
  'R. 10': {
    title: 'Cases (General)',
    explanation:
      'Rule 10 governs citations to judicial decisions. A full case citation includes five main elements: ' +
      '(1) case name (R. 10.2); (2) reporter or other source (R. 10.3); (3) court and jurisdiction parenthetical (R. 10.4); ' +
      '(4) date or year (R. 10.5); and (5) optional parenthetical information (R. 10.6) and prior/subsequent history (R. 10.7).\n\n' +
      'Short forms for cases previously cited in full are governed by R. 10.9. Special citation forms for pending, unreported, and electronic-database cases are in R. 10.8.',
    examples: [
      'Ward v. Reddy, 727 F. Supp. 1407, 1412 (D. Mass. 1990).',
      'Haber v. Yee, 925 F.2d 314, 335 (1st Cir. 1991).',
      'Haber v. Yee, 727 F. Supp. 1407, 1412 (D. Mass. 1990), aff\'d, 925 F.2d 314 (1st Cir. 1991).',
    ],
    references: ['R. 10.1', 'R. 10.2', 'R. 10.3', 'R. 10.4', 'R. 10.5', 'R. 10.6', 'R. 10.7', 'R. 10.8', 'R. 10.9'],
  },
  'R. 10.1': {
    title: 'Basic Citation Forms',
    explanation:
      'R. 10.1 illustrates the basic citation forms for cases at every stage of litigation, from filing through Supreme Court disposition. ' +
      'The form varies depending on whether the case is filed but undecided, published or unpublished, available electronically, or on appeal.\n\n' +
      'Key variations:\n' +
      '• Filed but not decided: include "filed" and full date.\n' +
      '• Unpublished interim order: docket number + parenthetical describing the order.\n' +
      '• Published interim order: cite to reporter with parenthetical.\n' +
      '• Unpublished decision: docket number + "slip op. at [page]" + full date.\n' +
      '• Electronic database: docket number + database identifier (WL/LEXIS) + full date.\n' +
      '• Published decision: standard reporter citation.\n' +
      '• On appeal: append subsequent history per R. 10.7.\n' +
      '• Brief/record: document name first, then case citation + docket number.',
    examples: [
      'Filed: Hoshijima v. Jensen, No. 90-345 (D. Mass. filed Sep. 18, 1990).',
      'Unpublished: Kitchens v. Grohman, No. 90-347, slip op. at 6 (D. Mass. Dec. 4, 1990).',
      'Electronic: Yee v. Kitchens, No. 90-349, 1990 U.S. Dist. LEXIS 20837, at *6–8 (D. Mass. Dec. 4, 1990).',
      'Published: Ward v. Reddy, 727 F. Supp. 1407, 1412 (D. Mass. 1990).',
      'With history: Haber v. Yee, 727 F. Supp. 1407, 1412 (D. Mass. 1990), aff\'d, 925 F.2d 314 (1st Cir. 1991).',
      'Brief: Brief for Appellant at 7, Kitchens v. Scotten, 925 F.2d 314 (1st Cir. 1991) (No. 90-568).',
    ],
    references: ['R. 10.3', 'R. 10.5', 'R. 10.7', 'R. 10.8', 'R. 10.8.1', 'R. 10.8.3'],
  },
  'R. 10.2': {
    title: 'Case Names',
    explanation:
      'R. 10.2 governs how to format case names in both textual sentences and citation sentences. The key difference is the extent of abbreviation.\n\n' +
      '• In textual sentences: apply R. 10.2.1 only — abbreviate only the 8 words listed in R. 10.2.1(c) and widely known acronyms.\n' +
      '• In citation sentences: apply both R. 10.2.1 and R. 10.2.2 — additionally abbreviate all T6 words and T10 geographic terms.\n\n' +
      'Case names are italicized in law review text and footnotes (R. 2). In court documents, follow B2 typeface conventions.',
    examples: [
      'Text: In Southern Pacific Co. v. Jensen, 244 U.S. 205 (1917), ...',
      'Citation: See, e.g., S. Pac. Co. v. Jensen, 244 U.S. 205, 225–26 (1917).',
    ],
    references: ['R. 10.2.1', 'R. 10.2.2', 'R. 2', 'B2', 'T6', 'T10'],
  },
  'R. 10.2.1': {
    title: 'General Rules for Case Names',
    explanation:
      'These rules apply to all case names — in both textual sentences and citation sentences. Use the case name from the beginning of the opinion in the cited reporter, modified as follows:\n\n' +
      '(a) Cite only the first party on each side; omit "et al." and alternative names.\n' +
      '(b) Abbreviate procedural phrases: "in the matter of" → "In re"; "on behalf of" → "ex rel."\n' +
      '(c) In text, abbreviate only: &, Ass\'n, Bros., Co., Corp., Inc., Ltd., No.\n' +
      '(d) Omit leading "The" (exceptions: in rem objects, "The King"/"The Queen").\n' +
      '(e) Omit descriptive terms (administrator, executor, trustee) after a named party.\n' +
      '(f) Omit "State of," "Commonwealth of," prepositional location phrases; omit "of America."\n' +
      '(g) Omit given names/initials of individuals (retain in business names).\n' +
      '(h) Omit "Inc.," "Ltd.," etc. if name already contains "Co.," "Corp.," etc.\n' +
      '(i) For unions, cite only the smallest unit; omit all but first craft designation.\n' +
      '(j) "Commissioner of Internal Revenue" → "Commissioner" (or "Comm\'r" in citations).\n' +
      '(k) Use common name if different from reporter name, with parenthetical.',
    decisionSteps: [
      'Step 1: Identify the parties — use only the FIRST-NAMED party on each side of "v." Omit et al., alternative names, and additional actions.',
      'Step 2: Determine each party\'s type — individual, business, government entity, union, or organization. Each type has specific rules.',
      'Step 3: Handle additional information — omit given names (for individuals), descriptive terms (Trustee, Executor, Esq., M.D.), "The" at start, and prepositional location phrases.',
      'Step 4: Write the name with proper abbreviations — in citation sentences, abbreviate ALL T6 words; in text, abbreviate ONLY the 8 mandatory words (&, Ass\'n, Bros., Co., Corp., Inc., Ltd., No.).',
    ],
    tips: [
      'NEVER rely on the caption itself for the citation form — always apply Bluebook rules.',
      'Only 8 words are abbreviated in ALL contexts (textual + citation): &, Ass\'n, Bros., Co., Corp., Inc., Ltd., No.',
      'Widely known acronyms use NO periods: "NAACP" not "N.A.A.C.P."',
      'For government parties in state court: use "State v.", "Commonwealth v.", or "People v." — not the state name.',
      'For government parties in federal court: use the full state name ("Georgia v. Charles").',
      'Business designation rule: drop the SECOND business term only if BOTH are in the R. 10.2.1(h) list.',
      'Individual initials-only names are preserved: "C.J. v. L.M." (close up adjacent capitals).',
    ],
    commonMistakes: [
      'Including more than the first party on each side (e.g., including "et al.").',
      'Abbreviating words in textual sentences that are only abbreviated in citation sentences.',
      'Keeping "The" at the beginning of a case name.',
      'Including descriptive terms like "Trustee" or "Administrator" after party names.',
      'Dropping individual given names that are part of a business name (e.g., "J.K. Abernathy, Inc." should keep "J.K.").',
      'Adding periods to widely known acronyms.',
    ],
    references: ['R. 10.2.1(a)', 'R. 10.2.1(b)', 'R. 10.2.1(c)', 'R. 10.2.1(d)', 'R. 10.2.1(e)', 'R. 10.2.1(f)', 'R. 10.2.1(g)', 'R. 10.2.1(h)', 'R. 10.2.1(i)', 'R. 10.2.1(j)', 'R. 10.2.1(k)', 'R. 10.2.2'],
  },
  'R. 10.2.1(a)': {
    title: 'Actions and Parties Cited',
    explanation:
      'For consolidated actions, cite only the first listed. Omit all parties other than the first listed on each side. Do not omit the first-listed relator or any portion of a partnership name. ' +
      'Omit "et al." and alternative names (d/b/a, a.k.a.). For in rem cases, omit all but the first-listed item. Use the common street address for real property parties. ' +
      'In bankruptcy with both adversary and nonadversary names, cite adversary name first with nonadversary in parentheses.',
    examples: [
      'Shelley v. Kraemer (not Shelley v. Kraemer, McGhee v. Sipes)',
      'Massachusetts ex rel. Alison v. Pauly (retain relator)',
      'Cheng v. Seinfeld (not Cheng et al. v. Seinfeld d/b/a The Man, Inc.)',
      'United States v. 6109 Grubb Road (street address for real property)',
      'Wallingford\'s, Inc. v. Waning (In re Waning), 120 B.R. 607, 611 (Bankr. D. Me. 1990).',
    ],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(b)': {
    title: 'Procedural Phrases',
    explanation:
      'Abbreviate "on the relation of," "for the use of," "on behalf of," "as next friend of" → "ex rel." ' +
      'Abbreviate "in the matter of," "petition of," "application of" → "In re." ' +
      'Omit all procedural phrases except the first. When adversary parties are named, omit all procedural phrases except "ex rel." ' +
      'Include introductory or descriptive phrases like "Estate of," "Will of." Procedural phrases should always be italicized.',
    examples: [
      'Gorman v. Bruh (not In re Gorman v. Bruh)',
      'Massachusetts ex rel. Kennedy v. Armbruster',
      'Ex parte Young',
      'In re Will of Holt',
      'Estate of Haas v. Commissioner',
    ],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(c)': {
    title: 'Abbreviations in Textual Sentences',
    explanation:
      'In textual sentences (main text or footnote text), abbreviate only widely known acronyms under R. 6.1(b) and these eight words: ' +
      '"&," "Ass\'n," "Bros.," "Co.," "Corp.," "Inc.," "Ltd.," and "No." ' +
      'If one of these eight begins a party\'s name, do not abbreviate it. For abbreviations in citation sentences, see R. 10.2.2.',
    examples: [
      'Philadelphia Electric Co. v. Hirsch (not PECO v. Hirsch)',
      'But: NAACP v. Kaminski (widely known acronym)',
    ],
    references: ['R. 6.1(b)', 'R. 10.2.2'],
  },
  'R. 10.2.1(d)': {
    title: 'Leading "The"',
    explanation:
      'Omit "The" as the first word of a party\'s name, except: (1) as part of the name of the object of an in rem action; ' +
      '(2) in cases where "The King" or "The Queen" is a party; (3) in an established popular name in a citation (but omit when referring textually).',
    examples: [
      'Mia. Herald v. Sercus (omit "The")',
      'But: In re The Clinton Bridge',
      'The King v. Broadrup',
      'See The Civil Rights Cases, 109 U.S. 3 (1883).',
      'But in text: Neither of the Civil Rights Cases opinions was correct.',
    ],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(e)': {
    title: 'Descriptive Terms',
    explanation:
      'Omit terms such as "administrator," "appellee," "executor," "licensee," and "trustee" that describe a party already named. ' +
      'Retain these terms when they are the only identification of the party.',
    examples: [
      'Burns v. McMillen (not Burns v. McMillen, Administrator)',
      'But: Trustees of Dartmouth College v. Woodward',
    ],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(f)': {
    title: 'Geographic Terms',
    explanation:
      'Omit "State of," "Commonwealth of," "People of" — except when citing decisions of that state\'s courts, in which case retain only "State," "Commonwealth," or "People." ' +
      'Omit "City of," "County of," etc. unless the expression begins a party name. Omit prepositional phrases of location unless omission would leave only one word or the location is part of the entity\'s full name. ' +
      'Include designations of national or larger areas (except in union names). Omit "of America" after "United States." Omit geographic designations that follow a comma.',
    examples: [
      'Blystone v. Pennsylvania, 494 U.S. 299 (1990). (not "Commonwealth of Pennsylvania")',
      'Commonwealth v. Ferrone, 448 A.2d 637 (Pa. Super. Ct. 1982). (state\'s own court)',
      'Butts v. City of New York (retain "City of" after party name)',
      'Planned Parenthood of Southeastern Pennsylvania v. Casey (location part of entity name)',
      'City of Arlington v. FCC (not City of Arlington, Texas v. FCC)',
    ],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(g)': {
    title: 'Given Names and Initials',
    explanation:
      'Generally omit given names or initials of individuals, but retain them in business firm names and where a party\'s surname is abbreviated. ' +
      'Do not omit any part of a multi-word surname. Retain the full name where the name is entirely in a language where the surname is given first (Chinese, Korean, Vietnamese). ' +
      'For Spanish/Portuguese names, cite the surname and all names following.',
    examples: [
      'Courtney v. Sandman (not Paul Vincent Courtney v. Joseph S. Sandman)',
      'But: Linda R.S. v. Richard D. (surname abbreviated)',
      'Van der Velt v. Standing Horse (multi-word surname)',
      'Yao Zhen Guang v. Yeh Zhi An (Chinese — retain full name)',
      'Ortega y Gasset v. Alcala de Larosa (Spanish — surname + following names)',
    ],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(h)': {
    title: 'Business Firm Designations',
    explanation:
      'Omit "Inc.," "Ltd.," "L.L.C.," "N.A.," "F.S.B.," and similar terms if the name also contains a word such as "Ass\'n," "Bros.," "Co.," "Corp.," "Ins.," or "R.R." ' +
      'This rule should be read narrowly — omit the designation only if the name could not be mistaken for a natural person.',
    examples: [
      'Wisconsin Packing Co. v. Indiana Refrigerator Lines, Inc.',
      'Not: Wisconsin Packing Co., Inc. v. Indiana Refrigerator Lines, Inc.',
    ],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(i)': {
    title: 'Union and Local Union Names',
    explanation:
      'Cite a union name exactly as given in the official reporter, subject to these exceptions:\n\n' +
      '(i) Only the smallest unit should be cited.\n' +
      '(ii) Omit all craft or industry designations except the first full designation.\n' +
      '(iii) A widely recognized abbreviation (e.g., UAW) may be used per R. 6.1(b) and R. 10.2.1(c).\n' +
      '(iv) Omit all prepositional phrases of location, including national or larger areas.',
    examples: [
      'NLRB v. Radio & Television Broadcast Engineers Local 1212 (omit parent union)',
      'Douds v. Local 294, International Brotherhood of Teamsters (omit additional craft designations)',
      'But: International Union of Doll & Toy Workers v. Local 379',
    ],
    references: ['R. 6.1(b)', 'R. 10.2.1(c)'],
  },
  'R. 10.2.1(j)': {
    title: 'Commissioner of Internal Revenue',
    explanation: 'Cite simply as "Commissioner" in text or "Comm\'r" in citations.',
    examples: ['Commissioner (text)', 'Comm\'r (citations)'],
    references: ['R. 10.2.1'],
  },
  'R. 10.2.1(k)': {
    title: 'Common Names Different from Reporter',
    explanation:
      'For cases not known by the reporter name but by a common name, the common name must either be substituted entirely or indicated parenthetically in the same typeface as the case name. ' +
      'For cases known by the reporter name but also by a different short name, the common name may be indicated parenthetically in italics but may not replace the reporter name in a full citation. ' +
      'For mandamus actions and cases with multiple dispositions, a parenthetical identifier may be given. Once given, the identifier alone may be used as the case name in subsequent citations.',
    examples: [
      'The Prize Cases, 67 U.S. (2 Black) 635 (1863).',
      'Youngstown Sheet & Tube Co. v. Sawyer (Steel Seizure), 343 U.S. 579 (1952).',
      'United States v. U.S. District Court (Keith), 407 U.S. 297 (1972).',
      'Hamdi v. Rumsfeld (Hamdi III), 316 F.3d 450 (4th Cir. 2003).',
      'Fox Television Stations, Inc. v. FCC (Fox I), 280 F.3d 1027 (D.C. Cir. 2002).',
    ],
    references: ['R. 2.1(f)', 'R. 10.2.1'],
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
  'R. 10.3': {
    title: 'Reporters and Other Sources',
    explanation:
      'R. 10.3 governs which sources to cite for judicial decisions and how to cite them. Table T1 indicates which reporters to cite for most courts. ' +
      'The order of preference for sources is: (1) official or preferred unofficial reporter; (2) public domain citation; (3) another unofficial reporter; ' +
      '(4) widely used electronic database (R. 18.4); (5) service (R. 19); (6) slip opinion (R. 10.8.1(b)); (7) internet source (R. 18.2.2); (8) newspaper (R. 16.6).',
    references: ['R. 10.3.1', 'R. 10.3.2', 'R. 10.3.3', 'T1'],
  },
  'R. 10.3.1': {
    title: 'Parallel Citations and Which Source(s) to Cite',
    explanation:
      '(a) State court documents: cite the source(s) required by local rules, which often require both the official state reporter and a parallel regional reporter citation. See B10.1.3 and BT2.2.\n\n' +
      '(b) All other documents (memoranda, law review): cite the relevant regional reporter if the decision is found therein. ' +
      'If a public domain citation is available, provide it along with a parallel citation to the regional reporter. ' +
      'If not in a regional reporter or public domain format, cite other sources per T1 in order of preference.',
    examples: [
      'Swedloff v. Phila. Transp. Co., 187 A.2d 152 (Pa. 1963).',
      'United States v. Carlisle, No. 90-2465SI, 1991 U.S. App. LEXIS 5863, at *3 (8th Cir. Apr. 10, 1991).',
    ],
    references: ['B10.1.3', 'T1', 'R. 10.8.1', 'R. 18.4', 'R. 19'],
  },
  'R. 10.3 / T1': {
    title: 'Reporters',
    explanation: 'Cite cases using the reporter abbreviation listed in Table T1. A citation consists of: volume number, reporter abbreviation, and first page of the case.',
  },
  'R. 10.3.2': {
    title: 'Reporter Format',
    explanation:
      'A reporter citation consists of a volume designation (R. 3.1), the abbreviated name of the reporter (as shown in T1), and the page on which the case report begins (R. 3.2). ' +
      'For spacing in reporter abbreviations, see R. 6.1(a). Early American reporters named after editors are now cited by the official series name only, except for U.S. Supreme Court reporters through 90 U.S. (23 Wall.) and certain early state reporters (T1.3), which include the editor\'s name.',
    examples: [
      'Burt v. Rumsfeld, 322 F. Supp. 2d 189 (D. Conn. 2004).',
      'Green v. Biddle, 21 U.S. (8 Wheat.) 1 (1823).',
      'Cobb v. Davenport, 32 N.J.L. 369 (Sup. Ct. 1867). (not 3 Vroom 369)',
    ],
    references: ['R. 3.1', 'R. 3.2', 'R. 6.1(a)', 'T1'],
  },
  'R. 10.3.3': {
    title: 'Public Domain Format',
    explanation:
      'When citing a decision available in public domain (medium-neutral) format, provide: case name, year of decision, state postal code, T7 court abbreviation (unless highest court), ' +
      'sequential decision number, and "U" if unpublished. Pinpoint citations use paragraph numbers. If available, include a parallel citation to the regional reporter.',
    examples: [
      'Beck v. Beck, 1999 ME 110, ¶ 6, 733 A.2d 981, 983.',
      'Gregory v. Class, 1998 SD 106, ¶ 3, 584 N.W.2d 873, 875.',
      'Jones v. Fisher, 1998 OK Civ. App. 120U.',
    ],
    references: ['T7', 'R. 10.3.1'],
  },
  'R. 10.4': {
    title: 'Court and Jurisdiction',
    explanation:
      'Every case citation must indicate which court decided the case. In American citations, give the court name and geographic jurisdiction ' +
      '(abbreviated per T1 or T2, and T7/T10) in the parenthetical that includes the date or year. For ordinals in court names, use R. 6.2(b) format.',
    examples: [
      'Commonwealth v. Virelli, 620 A.2d 543 (Pa. Super. Ct. 1992).',
      'United States v. Andolschek, 142 F.2d 503 (2d Cir. 1944).',
    ],
    references: ['R. 10.4(a)', 'R. 10.4(b)', 'R. 6.2(b)', 'T1', 'T7', 'T10'],
  },
  'R. 10.4(a)': {
    title: 'Federal Court Designation',
    explanation:
      'In U.S. Reports citations, omit the Supreme Court\'s name. In U.S.L.W. citations, indicate "U.S." ' +
      'Courts of appeals for numbered circuits: "2d Cir.", "9th Cir." (not C.C.A.2d or CA2). ' +
      'D.C. Circuit: "D.C. Cir." Federal Circuit: "Fed. Cir." ' +
      'District courts: give the district but not the division (e.g., "D.N.J.", "C.D. Cal.", not "C.D. Cal. E.D."). ' +
      'Old circuit courts (abolished 1912): "C.C.S.D.N.Y." Bankruptcy: "Bankr. E.D. Va." or "B.A.P. 9th Cir." ' +
      'FISA courts: "F.I.S.C." and "F.I.S.C.R." JPML: "J.P.M.L."',
    examples: [
      '2d Cir.', 'D.C. Cir.', 'Fed. Cir.', 'D.N.J.', 'C.D. Cal.', 'Bankr. E.D. Va.', 'B.A.P. 9th Cir.', 'J.P.M.L.',
    ],
    references: ['R. 10.4'],
  },
  'R. 10.4(b)': {
    title: 'State Court Designation',
    explanation:
      'Indicate the state and court of decision. Do not include the court name if it is the highest court of the state. ' +
      'Omit the jurisdiction and/or court abbreviation if unambiguously conveyed by the reporter title. ' +
      'When the highest court\'s reporter matches the jurisdiction name, neither court nor state is needed. ' +
      'Do not indicate department, district, or county unless particularly relevant.',
    examples: [
      'People v. Armour, 590 N.W.2d 61 (Mich. 1999). (highest court — no court name)',
      'DiLucia v. Mandelker, 493 N.Y.S.2d 769 (App. Div. 1985). (reporter conveys jurisdiction)',
      'Bates v. Tappan, 99 Mass. 376 (1868). (highest court, reporter = jurisdiction)',
      'Schiffman v. Corsi, 50 N.Y.S.2d 897 (Sup. Ct. N.Y. Cnty. 1944). (county relevant)',
    ],
    references: ['R. 10.4', 'T1'],
  },
  'R. 10.5': {
    title: 'Date or Year',
    explanation:
      'The date or year of decision appears in the parenthetical at the end of the citation. ' +
      'For reported decisions, provide the year (R. 10.5(a)). For unreported, electronic database, looseleaf, slip opinion, or newspaper cases, provide the full date (R. 10.5(b)). ' +
      'For pending cases, use the date of the most recent major disposition (R. 10.5(c)). ' +
      'When multiple decisions occur in the same year, include the year only with the last-cited decision in that year (R. 10.5(d)).',
    references: ['R. 10.5(a)', 'R. 10.5(b)', 'R. 10.5(c)', 'R. 10.5(d)'],
  },
  'R. 10.5(a)': {
    title: 'Year for Reported Decisions',
    explanation:
      'If possible, provide the year of decision; use the year of the term of court only if the year of decision is unavailable. ' +
      'In ambiguous cases, follow the year given in the running head of the reporter. ' +
      'The exact date is not necessary for cases labeled "unpublished" but nevertheless reported (e.g., in the Federal Appendix).',
    examples: [
      'United States v. Tando, 68 F. App\'x 85 (9th Cir. 2003).',
    ],
  },
  'R. 10.5(b)': {
    title: 'Full Date for Unreported/Electronic Sources',
    explanation:
      'Give the exact date for all unreported cases and for all cases cited to a looseleaf service, a slip opinion, an electronic database, or a newspaper.',
    examples: [
      'Bedell v. Nessim, No. 90-567, slip op. 3458 (1st Cir. Jan. 19, 1991).',
    ],
    references: ['R. 10.8.1'],
  },
  'R. 10.5(c)': {
    title: 'Pending Cases and Dismissals Without Opinion',
    explanation:
      'Use the date or year of the most recent major disposition. "Major dispositions" include: initial filing, appeal docketing, oral argument, and dismissal. ' +
      'Indicate the significance of the date within the parenthetical unless explained elsewhere.',
    examples: [
      'Bedell v. Nessim, No. 90-567 (1st Cir. argued Jan. 10, 1991).',
      'Bedell v. Nessim, 725 F. Supp. 1407 (D. Mass. 1990), appeal docketed, No. 90-567 (1st Cir. Dec. 20, 1990).',
    ],
  },
  'R. 10.5(d)': {
    title: 'Multiple Decisions Within a Single Year',
    explanation:
      'When citing a case with several decisions in the same year, include the year only with the last-cited decision in that year. ' +
      'However, if an exact date is required in either citation, include both dates.',
    examples: [
      'United States v. Eller, 114 F. Supp. 284 (M.D.N.C.), rev\'d, 208 F.2d 716 (4th Cir. 1953).',
    ],
  },
  'R. 10.6': {
    title: 'Parenthetical Information Regarding Cases',
    explanation:
      'Parenthetical information may be added after the date parenthetical to indicate the weight of authority (R. 10.6.1), ' +
      'in-chambers opinions (R. 10.6.2), quoting/citing parentheticals (R. 10.6.3), and explanatory parentheticals (R. 1.5). ' +
      'Parentheticals are placed in this order: (i) weight of authority; (ii) quoting/citing; (iii) explanatory (R. 10.6.4).',
    references: ['R. 10.6.1', 'R. 10.6.2', 'R. 10.6.3', 'R. 10.6.4', 'R. 1.5'],
  },
  'R. 10.6.1': {
    title: 'Weight of Authority',
    explanation:
      '(a) Generally: Add parenthetical information about the weight of authority (e.g., en banc, per curiam, mem., 5-4 decision, dissenting opinion, plurality opinion) ' +
      'following the date parenthetical. When a case is cited for a proposition that is not the single, clear holding of a majority, indicate that fact parenthetically.\n\n' +
      '(b) "Mem." and "per curiam": "mem." = disposition without opinion. "Per curiam" = opinion issued by the court as an institution, not a particular judge. ' +
      'District court opinions denominated "memorandum decision" are NOT designated "mem."\n\n' +
      '(c) Seriatim opinions: For early SCOTUS opinions where each Justice wrote separately, use "(opinion of Lastname, J.)".',
    examples: [
      'Webb v. Baxter Healthcare Corp., 57 F.3d 1067 (4th Cir. 1995) (unpublished table decision).',
      'Parker v. Randolph, 442 U.S. 62, 84 (1979) (Stevens, J., dissenting).',
      'Garcia v. San Antonio Metro. Transit Auth., 469 U.S. 528, 570 (1985) (5-4 decision) (Powell, J., dissenting).',
      'Wersba v. Seiler, 393 F.2d 937 (3d Cir. 1968) (per curiam).',
    ],
    references: ['R. 10.6', 'R. 1.5', 'T8'],
  },
  'R. 10.6.2': {
    title: 'In-Chambers Opinions',
    explanation:
      'When a Supreme Court Justice rules on a stay, bail, or injunction application "in-chambers," include the parenthetical "(Lastname, J., in chambers)." ' +
      'Pre-1969 in-chambers opinions not in U.S. Reports may be cited to Rapp\'s compilation. Since 1969, these opinions appear in the U.S. Reports.',
    examples: [
      'Maryland v. King, 567 U.S. 1301 (2012) (Roberts, C.J., in chambers).',
      'Sacco v. Massachusetts, 1 Rapp 16 (1927) (Holmes, J., in chambers).',
    ],
    references: ['R. 10.6.1'],
  },
  'R. 10.6.3': {
    title: 'Quoting/Citing Parentheticals in Case Citations',
    explanation:
      'When a cited case itself quotes or cites another case for the relevant point, a "quoting" or "citing" parenthetical is appropriate per R. 1.5(a). ' +
      'Within the parenthetical, the same rules for typeface, pincites, and short forms apply. ' +
      'Only one level of recursion is required — an additional level may be used if particularly relevant.',
    examples: [
      'Zadvydas v. Davis, 533 U.S. 678, 719 (2001) (Kennedy, J., dissenting) (citing Shaughnessy v. United States ex rel. Mezei, 345 U.S. 206 (1953)).',
    ],
    references: ['R. 1.5(a)', 'R. 10.6.4'],
  },
  'R. 10.6.4': {
    title: 'Order of Parentheticals',
    explanation:
      'Parenthetical phrases are placed in this order: (i) weight of authority parentheticals; (ii) "quoting" and "citing" parentheticals; (iii) explanatory parentheticals. ' +
      'If an explanatory parenthetical itself requires a quoting/citing parenthetical, the two should be nested.',
    examples: [
      'Wolf v. Colorado, 338 U.S. 25, 47 (1949) (Rutledge, J., dissenting) (rejecting the Court\'s conception), aff\'g, 187 P.2d 926 (Colo. 1947), overruled by, Mapp v. Ohio, 367 U.S. 643 (1961).',
      'Kansas v. Crane, 534 U.S. 407, 409 (2002) ("[T]he statutory criterion ... satisfied \'"substantive" due process requirements.\'" (quoting Kansas v. Hendricks, 521 U.S. 346, 356 (1997))).',
    ],
    references: ['R. 1.5(b)', 'R. 10.6.1', 'R. 10.6.3'],
  },
  'R. 10.7': {
    title: 'Prior and Subsequent History',
    explanation:
      'Whenever a decision is cited in full, give the entire subsequent history, but omit:\n' +
      '• Denials of certiorari (unless < 2 years old or particularly relevant)\n' +
      '• History on remand or denial of rehearing (unless relevant)\n' +
      '• Dispositions withdrawn by the deciding authority\n\n' +
      'Give prior history only if significant to the cited point or if the cited disposition does not intelligibly describe the issues. ' +
      'Note cases that have been overruled, abrogated, or superseded by statute (R. 10.7.1(c)). ' +
      'When the case name differs in history, use "sub nom." (R. 10.7.2).',
    examples: [
      'Cent. Ill. Pub. Serv. Co. v. Westervelt, 342 N.E.2d 463 (Ill. App. Ct. 1976), aff\'d, 367 N.E.2d 661 (Ill. 1977).',
      'Cheng v. GAF Corp., 631 F.2d 1052 (2d Cir. 1980), vacated, 450 U.S. 903 (1981).',
    ],
    references: ['R. 10.7.1', 'R. 10.7.2', 'T8'],
  },
  'R. 10.7.1': {
    title: 'Explanatory Phrases and Weight of Authority',
    explanation:
      '(a) Prior or subsequent history: Append with italicized explanatory phrases between each citation (see T8). If subsequent history itself has subsequent history, append further. Show prior history first when both are given.\n\n' +
      '(b) Significance of disposition: Give the reason if the disposition does not carry normal significance (e.g., "vacated as moot," "appeal dismissed per stipulation").\n\n' +
      '(c) Overruled/abrogated/superseded: Use "overruled by," for explicit repudiation by the same court; "abrogated by," for effective (non-explicit) overruling; ' +
      '"superseded by statute" when a statute was enacted to reverse the outcome, citing session laws per R. 12.4.\n\n' +
      '(d) Slave cases: Use "(enslaved party)" or "(enslaved person at issue)" parentheticals as appropriate.\n\n' +
      '(e) Multiple dispositions: Connect with italicized "and."',
    examples: [
      'Cooper v. Dupnik, 924 F.2d 1520, 1530 (9th Cir. 1991), rev\'d en banc, 963 F.2d 1220 (9th Cir. 1992).',
      'Herbert v. Lando, 73 F.R.D. 387 (S.D.N.Y.), rev\'d, 568 F.2d 974 (2d Cir. 1977), rev\'d, 441 U.S. 153 (1979).',
      'Nat\'l League of Cities v. Usery, 426 U.S. 833 (1976), overruled by, Garcia v. San Antonio Metro. Transit Auth., 469 U.S. 528 (1985).',
      'Dred Scott v. Sandford, 60 U.S. (19 How.) 393 (1857) (enslaved party), superseded by constitutional amendment, U.S. Const. amend. XIV.',
    ],
    references: ['T8', 'R. 10.7', 'R. 12.4'],
  },
  'R. 10.7.2': {
    title: 'Different Case Name on Appeal',
    explanation:
      '(a) Subsequent history name changes: When the case name differs, introduce the new name with "sub nom.":\n\n' +
      '(b) Prior history name changes: Use a similar form.\n\n' +
      '(c) Exceptions — do not provide a different name: (i) when parties\' names are merely reversed; (ii) denial of cert/rehearing; ' +
      '(iii) when in an administrative appeal the private party remains the same; (iv) when the change is merely stylistic.',
    examples: [
      'Great W. United Corp. v. Kidwell, 577 F.2d 1256 (5th Cir. 1978), rev\'d sub nom., Leroy v. Great W. United Corp., 443 U.S. 173 (1979).',
      'United Dairy Farmers Coop. Ass\'n, 194 NLRB 1094, enforced, 465 F.2d 1401 (3d Cir. 1972). (no sub nom. — private party same)',
    ],
    references: ['R. 10.7'],
  },
  'R. 10.8': {
    title: 'Special Citation Forms',
    explanation:
      'R. 10.8 covers special citation forms for pending and unreported cases (R. 10.8.1), Fifth Circuit split cases (R. 10.8.2), ' +
      'briefs, court filings, and transcripts (R. 10.8.3), and court administrative orders (R. 10.8.4).',
    references: ['R. 10.8.1', 'R. 10.8.2', 'R. 10.8.3', 'R. 10.8.4'],
  },
  'R. 10.8.1': {
    title: 'Pending and Unreported Cases',
    explanation:
      '(a) Electronic media: Provide case name, docket number, database identifier (WL/LEXIS/BL), court, and full date. ' +
      'Screen/page numbers are preceded by asterisk; paragraph numbers by ¶.\n\n' +
      '(b) Slip opinions: Give docket number, court, and full date. Use "slip op. at [page]" for pagination. Always give the full docket number.\n\n' +
      '(c) Other: Cite to services (R. 19), periodicals (R. 16), or internet (R. 18.2.2).\n\n' +
      '(d) Depublished cases: Indicate "(depublished)" parenthetically or as subsequent history if there is a reported order.',
    examples: [
      'Int\'l Snowmobile Mfrs. Ass\'n v. Norton, No. 00-CV-229-B, 2004 WL 2337372, at *3 (D. Wyo. Oct. 14, 2004).',
      'Gibbs v. Frank, No. 02-3924, 2004 U.S. App. LEXIS 21357, at *18–19 (3d Cir. Oct. 14, 2004).',
      'Groucho Marx Prods. v. Playboy Enters., No. 77 Civ. 1782 (S.D.N.Y. Dec. 30, 1977).',
      'Ross v. Weissman, No. 90-345, slip op. at 6 (D. Mass. Dec. 4, 1990).',
      'Mitchell v. Cal. Fair Plan Ass\'n, 260 Cal. Rptr. 3 (Ct. App. 1989) (depublished).',
    ],
    references: ['R. 18.4', 'R. 19', 'R. 16', 'R. 18.2.2'],
  },
  'R. 10.8.2': {
    title: 'Fifth Circuit Split',
    explanation:
      'On October 1, 1981, the Fifth Circuit was divided into the new Fifth and Eleventh Circuits. ' +
      'Cite 1981 decisions labeled "5th Cir." by month; give unit information when available; ' +
      'designate nonunit judgments as "Former 5th Cir." if rendered after September 30, 1981.',
    examples: [
      'Birl v. Estelle, 660 F.2d 592 (5th Cir. Nov. 1981).',
      'Haitian Refugee Ctr. v. Smith, 676 F.2d 1023 (5th Cir. Unit B 1982).',
      'McCormick v. United States, 680 F.2d 345 (Former 5th Cir. 1982).',
    ],
  },
  'R. 10.8.3': {
    title: 'Briefs, Court Filings, and Transcripts',
    explanation:
      'Cite with: full document name (abbreviated per R. 10.2.1(c)), pinpoint citation, full case citation, and docket number. ' +
      'If no decision rendered, date = filing date. The PACER document number may be included but is not required unless essential.\n\n' +
      'For amicus briefs with more than two signatories, "et al." may be used. ' +
      'Audio recordings use time markers for pincites. ' +
      'Court documents count as a citation to the case for R. 10.9 short form purposes. ' +
      'The document itself may use supra form (unlike the case), but this does not count for the five-footnote rule.',
    examples: [
      'Complaint at 17, Kelly v. Wyman, 294 F. Supp. 893 (S.D.N.Y. 1968) (No. 68 Civ. 394).',
      'Brief for Petitioner-Appellant at 48, United States v. Al-Marri, No. 03-3674 (7th Cir. Nov. 12, 2003).',
      'Transcript of Oral Argument at 11, Ayers v. Belmontes, 127 S. Ct. 469 (2006) (No. 05-493).',
      'Brief for Ringling Bros.-Barnum & Bailey Combined Shows, Inc. et al. as Amici Curiae, Moseley v. V Secret Catalogue, Inc., 537 U.S. 418 (2003) (No. 01-1015).',
    ],
    references: ['R. 10.2.1(c)', 'R. 10.9', 'R. 4.2(b)'],
  },
  'R. 10.8.4': {
    title: 'Court Administrative Orders',
    explanation: 'Cite the official reporter, if therein; give the title of the order, if any.',
    examples: ['Order Discharging the Advisory Comm., 352 U.S. 803 (1956).'],
  },
  'R. 10.9': {
    title: 'Short Form Case Citations',
    explanation:
      'After a full citation, subsequent references may use a short form if it clearly identifies a case already cited in the same footnote ' +
      'or in one of the preceding five footnotes (R. 10.9(a)). Acceptable short forms include: both parties, one party, volume/reporter only, or "id." ' +
      'Use only one party\'s name if unambiguous; avoid using government units, officials, or common litigants as the short name. ' +
      'For electronic database cases, include the unique database identifier in the short form. ' +
      'For slip opinions, use "[Party], slip op. at [page]." ' +
      'When citing the entire decision (not a pinpoint), include the case name, volume, reporter, and first page — but no date parenthetical.',
    examples: [
      'Youngstown Sheet & Tube Co. v. Sawyer, 343 U.S. at 585.',
      'Youngstown, 343 U.S. at 585.',
      '343 U.S. at 585.',
      'Id. at 585.',
      'Clark, 1991 WL 55402, at *3. (electronic database short form)',
      'Sam, slip op. at 12. (slip opinion short form)',
    ],
    references: ['R. 10.9(a)', 'R. 10.9(b)', 'R. 10.9(c)', 'R. 4.1'],
  },
  'R. 10.9(a)': {
    title: 'Short Forms in Footnotes',
    explanation:
      'A short form may be used if the case is (1) already cited in the same footnote or (2) cited in one of the preceding five footnotes. ' +
      'Otherwise, a full citation is required. When using only one party\'s name, avoid government units, officials, or common litigants. ' +
      'A case may be cited in short form by a different name if the full citation includes both versions per R. 10.2.1(k). ' +
      'For electronic database cases, use the unique database identifier. For slip opinions, use "slip op. at [page]."',
    examples: [
      'Martinez-Fuerte, 428 U.S. at 550.',
      'The Steel Seizure Case, 343 U.S. at 585.',
      'Bossier Parish Sch. Bd., 520 U.S. at 480. (not Reno, 520 U.S. at 480)',
      'Clark, 1991 WL 55402, at *3.',
    ],
    references: ['R. 10.2.1(k)', 'R. 10.8.1'],
  },
  'R. 10.9(b)': {
    title: 'Exceptions When Using "Id." for Cases',
    explanation:
      '(i) Different opinions: When "id." refers to the same case but a different opinion, indicate parenthetically (e.g., "(Jackson, J., concurring)"). ' +
      'After an intervening citation, the next case citation is presumed to be the majority opinion.\n\n' +
      '(ii) Parallel citations: For cases requiring parallel citations, the "id." form must include both reporters to avoid confusion.',
    examples: [
      'Id. at 635 (Jackson, J., concurring).',
      'Id. at 582 (majority opinion).',
      'Id. at 465, 233 A.2d at 563. (parallel citation id. form)',
    ],
    references: ['R. 4.1', 'R. 10.9'],
  },
  'R. 10.9(c)': {
    title: 'Short Form in Text',
    explanation:
      'A case that has been cited in full in the same general discussion may be referred to in main text or footnote text by one of the parties\' names without further citation.',
    examples: ['The issue presented in Bakke has not been fully resolved.'],
    references: ['R. 10.9'],
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
    references: ['R. 20.4', 'R. 22.2.1', 'T10', 'T16'],
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
      'Cases, administrative materials, and brief commentaries are often published unofficially in topical compilations called "services," ' +
      'which appear in looseleaf form initially and are sometimes published later as bound volumes. ' +
      'R. 19.1 provides rules for citing services. R. 19.2 covers short citation forms.',
    references: ['R. 19.1', 'R. 19.2', 'T15'],
  },
  'R. 19.1': {
    title: 'Citation Form for Services',
    explanation:
      'Cite services by: volume + abbreviated title (roman type) + publisher in parentheses + subdivision + date. Consult T15 for service and publisher abbreviations; if not listed, use T6.\n\n' +
      '(a) Volume: may be a number, year, descriptive subtitle, or combination. Use brackets for years/words to avoid confusion. Transfer binders: indicate years of material.\n' +
      '(b) Publisher: required for every citation, enclosed in parentheses after the title. Abbreviate per T15 or R. 15.1(e).\n' +
      '(c) Subdivision: cite by ¶ or § if possible, otherwise by page. A report number may be given if helpful.\n' +
      '(d) Date: exact date for looseleaf cases; year for bound. Statutes/regulations: date of enactment unless indicated elsewhere.',
    examples: [
      'In re Smithfield Ests., Inc., [1985–1986 Transfer Binder] Bankr. L. Rep. (CCH) ¶ 70,707 (Bankr. D.R.I. Aug. 9, 1985).',
      'SEC v. Tex. Int\'l Airlines, 29 Fed. R. Serv. 2d (West) 408 (D.D.C. 1979).',
      'Kovacs v. Comm\'r, 74 A.F.T.R.2d (RIA) 354 (6th Cir. 1994).',
      '4 Lab. L. Rep. (CCH) ¶ 9046.',
    ],
    references: ['T15', 'T6', 'R. 3.1', 'R. 3.2', 'R. 10.4', 'R. 10.5'],
  },
  'R. 19.2': {
    title: 'Short Citation Forms — Services',
    explanation:
      '(a) Cases: use short forms per R. 10.9. Include the complete volume designation for the service binder and substitute ¶ or § numbers for page numbers where appropriate. ' +
      'To cite the entire case in short form, give the ¶/§ number or first page number without "at."\n\n' +
      '(b) Other materials: follow the relevant short citation rules (statutes per R. 12.10, regulations per R. 14.6, etc.).',
    examples: [
      'In re Looney, [1987–1989 Transfer Binder] Bankr. L. Rep. (CCH) at 93,591.',
      'Defs. of Wildlife, [1982] 12 Envtl. L. Rep. (Envtl. Law Inst.) at 20,212.',
    ],
    references: ['R. 10.9'],
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
      'Table T2 is the primary source for citing foreign materials. For sources not in T2, follow the country\'s own citation rules as modified by R. 20.',
    examples: [
      'Chase v. Campbell, [1962] S.C.R. 425 (Can.).',
      'Berry v. Dorsey (1975) 101 ALR 35 (Austl.).',
    ],
    references: ['R. 20.1', 'R. 20.2', 'R. 20.3', 'R. 20.4', 'R. 20.5', 'R. 20.6', 'R. 20.7', 'T2'],
  },
  'R. 20.1': {
    title: 'Jurisdiction',
    explanation:
      'When citing any non-U.S. source, indicate parenthetically the jurisdiction issuing the source, abbreviated per T10. ' +
      'The parenthetical is located at the end of the citation but before any parallel citations, unless otherwise indicated in T2.',
    examples: [
      'Chase v. Campbell, [1962] S.C.R. 425 (Can.).',
      'Berry v. Dorsey (1975) 101 ALR 35 (Austl.).',
      'Canada Act, 1982, c 11 (U.K.), reprinted in R.S.C. 1985, app II, no 44 (Can.).',
    ],
    references: ['T10', 'T2'],
  },
  'R. 20.2': {
    title: 'Non-English-Language Documents',
    explanation:
      'R. 20.2.1 — Multiple languages: cite the most authoritative version; prefer English when equally authoritative.\n\n' +
      'R. 20.2.2 — Titles in other languages:\n' +
      '(a) Give the full title in the original language first, followed by brackets with the English translation in the same typeface.\n' +
      '(b) Capitalize names/titles as they appear on the page; capitalize translations per R. 8.\n\n' +
      'R. 20.2.3 — Abbreviations: give the full form the first time, with the abbreviation in brackets. Thereafter use the abbreviated form.\n\n' +
      'R. 20.2.4 — Non-Roman alphabets: cite in the original language, followed by bracketed English translation. For personal names: use transliteration. For locations: use transliteration. For institutional authors: use translation (but transliterate proper nouns within).\n\n' +
      'R. 20.2.5 — Translations: cite the original source per R. 20/21, then a parallel citation to the translation introduced by "translated in."',
    examples: [
      'Verdrag tot het Vermijden van Dubbele Belasting [Agreement for the Avoidance of Double Taxation]',
      'Bürgerliches Gesetzbuch [BGB] [Civil Code] art. 13 (Ger.).',
      'Ley Federal de Derechos de Autor [LFDA], DOF 21-12-1963 (Mex.), translated in Copyright Laws and Treaties of the World 521 (UNESCO et al. eds., 1992).',
    ],
    references: ['R. 8', 'R. 1.6(a)', 'R. 20.2.1', 'R. 20.2.2', 'R. 20.2.3', 'R. 20.2.4', 'R. 20.2.5'],
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
      'R. 22 provides guidelines for citing official materials produced by Tribal Nations within the United States. ' +
      'When filing with Tribal governments and Tribal courts that have their own citation conventions, follow Tribal citation conventions.\n\n' +
      'For a list of federally recognized Tribal Nations, consult the Department of the Interior or the Federal Register. For Tribal Nation listings, see Table T1.5.',
    references: ['R. 22.1', 'R. 22.2', 'R. 22.3', 'T1.5'],
  },
  'R. 22.1': {
    title: 'Tribal Nations with an Established Citation Format',
    explanation:
      'When citing legal materials from a Tribal Nation with an established citation format, use the Tribal Nation\'s format as the primary citation. ' +
      'Provide a parallel citation in square brackets according to R. 22.2. If the tribe does not specify its own method, use R. 22.2.',
    examples: [
      'Section 1, SNI Constitution of 1848 (amended 1993), [Const. of the Seneca Nation of Indians of 1848, § 1, (amended 1993)].',
    ],
    references: ['R. 22.2'],
  },
  'R. 22.2': {
    title: 'Tribal Nations Without an Established Citation Format',
    explanation:
      '22.2.1 — Constitutions: "Const. of the [Tribal Nation]" + art./§. Do not abbreviate Tribal Nation names. URL may be included. Amendments: indicate parenthetically. Superseded: cite by year of adoption.\n\n' +
      '22.2.2 — Codes: (1) title/chapter number; (2) full code name (Tribal language with [English] if applicable); (3) § number; (4) year; (5) URL. Do not abbreviate names. Subject-matter codes per R. 12.3.1(c).\n\n' +
      '22.2.3 — Orders/Ordinances/Resolutions: (1) name; (2) number; (3) year; (4) (Tribal Council/body + alternative names); (5) (Tribal Nation if not evident). Resolutions enacting code: add parenthetical.\n\n' +
      '22.2.4 — Cases: (1) case name per R. 10.2 (don\'t abbreviate Tribal parties); (2) tribal reporter if available; (3) docket number; (4) (court, full date); (5) parentheticals per R. 10.6; (6) URL or database; (7) subsequent history per R. 10.7. Cite internet source primarily.\n\n' +
      '22.2.5 — Treaties: cite per R. 21.4.',
    examples: [
      'Const. of the Comanche Nation art. II, § 1.',
      'Yurok Tribe Const. pmbl., https://yurok.tribal.codes/Constitution/Preamble.',
      'Pueblo de San Ildefonso Code § 4.1.1.010 (2023).',
      'Waganakising Odawak [Little Traverse Bay Bands of Odawa Indians] Tribal Code of Law § 13.101 (2023).',
      'Healing to Wellness Court, Res. No. 023-22 (2022) (Stockbridge-Munsee Tribal Council).',
      'The People of the Pokagon Band of Potawatomi Indians v. Edelberg, No. 18-4723-CR (Pokagon Band of Potawatomi Indians Tribal Ct. Jan. 18, 2019).',
    ],
    references: ['R. 10.2', 'R. 10.6', 'R. 10.7', 'R. 12.3.1', 'R. 21.4', 'T16'],
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
      'R. 23 covers citations to documents and objects housed in archival collections. The citation has a two-part structure:\n\n' +
      'First half (the document): Author → optional title → document title → institutional affiliation → pincite → date.\n' +
      'Second half (archival info): "(on file with [archive owner], [collection], [location])"\n\n' +
      'Scope: Use R. 23 (not R. 17) when the document is in an organized, official archive. Published materials generally fall under R. 15. Exception: originally unpublished texts reprinted in digital archives → R. 23.9. Physical objects → R. 23.11. Pre-1900 newspapers → R. 23.8.',
    references: ['R. 23.1', 'R. 23.2', 'R. 23.3', 'R. 23.4', 'R. 23.5', 'R. 23.6', 'R. 23.7', 'R. 23.8', 'R. 23.9', 'R. 23.10', 'R. 23.11', 'R. 23.12'],
  },
  'R. 23.1': {
    title: 'Basic Citation Forms',
    explanation:
      'The basic archival citation: [Author], [Title (optional)], [Document Title], [Institutional Association] [Pincite] ([Date]) (on file with [Archive Owner], [Archival Collection], [Archival Location]).',
    examples: [
      'Jordan A. Kei-Rahn, Law Clerk, Redacted Report on Jurisdiction Stripping in FTCA Claims, Dep\'t of Just. 143 (July 7, 2022) (on file with Yale L.J., Managing Editor Records, Box 7, Folder 34).',
      'Letter from Maria Nichols to Oliver Otis Howard (Oct. 11, 1866) (on file with Nat\'l Archives, Records of the Bureau of Refugees, Record Group 105.5).',
      'Justice Harry A. Blackmun, Case Notes, Fitzpatrick v. Bitzer, No. 75-251 (Apr. 16, 1976) (on file with Libr. of Cong., Harry A. Blackmun Papers, Box 229, Folder 7).',
      'Alexander Hamilton, Report on the Subject of Manufactures (Dec. 5, 1791), reprinted by Nat\'l Archives: Founders Online, https://founders.archives.gov/...',
    ],
    references: ['R. 23.2', 'R. 23.3', 'R. 23.4', 'R. 23.5', 'R. 23.6'],
  },
  'R. 23.2': {
    title: 'Author',
    explanation:
      '(a) Signed materials: follow R. 15.1 in ordinary roman type.\n' +
      '(b) Author unavailable: omit if not contemporaneously signed. Exception: if verifiably attributed per R. 15.1(d).\n' +
      '(c) Pen names: per R. 15.1(d).\n' +
      '(d) Letters/memoranda/press releases: format per R. 17.2.3.',
    examples: [
      'J. Harvie Wilkinson III, Law Clerk, U.S. Sup. Ct., Certiorari Memorandum 2, ... (on file with Wash. & Lee Univ. Sch. of L., Lewis F. Powell, Jr. Papers, Box 380, Folder 7).',
      'Letter from William Prosser, Dean, Univ. of Cal., Berkley, Sch. of L., to Robert Hudec, Ed.-in-Chief, Yale L.J. (Apr. 27, 1960) (on file with Yale L.J., General Archives, Box 1, Folder 6).',
    ],
    references: ['R. 15.1', 'R. 15.1(d)', 'R. 17.2.3'],
  },
  'R. 23.3': {
    title: 'Title',
    explanation:
      '(a) Full title as on the first page, capitalized per R. 8, in roman type. Do not abbreviate words or omit articles.\n' +
      '(b) Title unavailable: use objective descriptors.\n' +
      '(c) Letters/memos/press releases: format per R. 17.2.3.',
    examples: [
      'Ledger of Goods Sold in the General Store of Longmeadow, Massachusetts (1774) (on file with Longmeadow Town Archives, Record Group 5, Box 312).',
    ],
    references: ['R. 8', 'R. 17.2.3'],
  },
  'R. 23.4': {
    title: 'Institutional Affiliation',
    explanation:
      'Add when the document was prepared for a particular institution but is not archived with that institution. Abbreviate per T6, T7, T10, T13. Do not omit "in" or "of." Does not apply to Justices\' papers (R. 23.7.1) or other courts\' papers (R. 23.7.2(b)).',
    references: ['T6', 'T7', 'T10', 'T13', 'R. 23.7'],
  },
  'R. 23.5': {
    title: 'Date',
    explanation:
      'Use the date printed or signed. Undated: "(n.d.)". Approximate: "(c. [year])". If the date is obscured or unintelligible, see R. 23.10(c).',
    examples: ['(July 7, 2022)', '(n.d.)', '(c. Sep. 1862)'],
    references: ['R. 23.10'],
  },
  'R. 23.6': {
    title: 'Archival Information',
    explanation:
      'The "on file with" parenthetical has three components:\n' +
      '(a) Archive owner: the main overseeing institution. If stored at a university, the university is the owner (not a specific library), unless they share a name.\n' +
      '(b) Archival collection: principal archive name + subcollection(s), from largest to smallest, separated by commas.\n' +
      '(c) Archival location: box/folder/reel/record group — the most specific available. Do not use call numbers unless it is the only categorization.',
    examples: [
      '(on file with Yale L.J., Managing Editor Records, Box 7, Folder 34)',
      '(on file with Nat\'l Archives, Records of the Bureau of Refugees, Freedmen, and Abandoned Lands, Record Group 105.5)',
    ],
  },
  'R. 23.7': {
    title: 'Case Materials',
    explanation:
      '23.7.1 — Justices\' papers: retain "Justice" honorific. Law clerks: include position + court. Include case name + docket number. Omit reporter info unless docket number is unavailable.\n\n' +
      '23.7.2 — Other courts:\n' +
      '(a) Administrative proceedings: cite title + exhibit + agency tribunal + case number.\n' +
      '(b) Other courts: use standard case citation per R. 10.4.',
    examples: [
      'Justice William Rehnquist, Third Draft Opinion 13, Edelman v. Jordan, No. 72-1410 (Jan. 17, 1974) (on file with Wash. & Lee Univ. Sch. of L., Lewis F. Powell, Jr. Papers, Box 399, Folders 1-3).',
      'Judge Benjamin Cardozo, Case Notes, In re Adler, 173 N.E. 265 (N.Y. 1930) (on file with Harv. L. Sch. Libr., Benjamin N. Cardozo Papers, Box 1, Folder 5).',
    ],
    references: ['R. 10.4'],
  },
  'R. 23.8': {
    title: 'Pre-1900 Newspapers',
    explanation:
      'For original images of pre-1900 newspapers in archival databases, cite per R. 16.6 + archival parenthetical. If the database is online-only, use the URL for archival location.',
    examples: [
      'News and Gossip from Washington, Springfield Wkly. Republican, Jan. 12, 1861, at 5 (on file with Libr. of Cong., Chronicling America, https://chroniclingamerica.loc.gov/...).',
    ],
    references: ['R. 16.6'],
  },
  'R. 23.9': {
    title: 'Databases Reprinting Primary Sources',
    explanation:
      'When originally unpublished materials (covered by R. 17) that were published in hard-copy compilations are subsequently reprinted online, cite to the database. ' +
      'Include in small capitals: database owner (abbreviated per R. 18.2.2(b)) + database name + URL. ' +
      '"Reprinting" does not refer to databases displaying original images — those use standard archival format.',
    examples: [
      'Thomas Jefferson, Notes on British and American Alienage (c. 1783), reprinted by Nat\'l Archives: Founders Online, https://founders.archives.gov/...',
    ],
    references: ['R. 17', 'R. 18.2.2'],
  },
  'R. 23.10': {
    title: 'Handwritten and Typewritten Documents',
    explanation:
      '(a) Typeface: roman type default. Cursive emphasis in original: use italics. Lined form responses: do not underline.\n' +
      '(b) Deletions: omit crossed-out text without parenthetical when quoting. Use strikethrough in larger quotations. Isolated quotes of deleted text: "(strikethrough omitted)."\n' +
      '(c) Unintelligible script: omit with ellipses per R. 5.3 and include "(unintelligible text omitted)."',
    references: ['R. 5.3'],
  },
  'R. 23.11': {
    title: 'Tangible Objects',
    explanation:
      'Cite like archival documents, omitting author. Use the object\'s creation date (not discovery/purchase/archival date). Default to the archive\'s title; shorten if unnecessarily long. ' +
      'If the nature of the object is not clear, add it to the title (e.g., "Photograph of..."). Include the creator only if known and relevant.',
    examples: [
      'Death Mask of Napolean Bonaparte (1833) (on file with Brown Univ., John Hay Library, Hoffman Collection on Napolean).',
      'Lincoln\'s Emancipation Proclamation Pen (Jan. 1, 1863) (on file with Yale Univ., Beinecke Rare Book and Manuscript Library Repository, Abraham Lincoln Collection, Box 3, Folder 24).',
      'Charles Albertus, Photograph of Accelerator (1964) (on file with Yale Univ., Manuscripts and Archives Repository, Charles Alburtus Photograph Collection, Box 1, Folder 55).',
    ],
  },
  'R. 23.12': {
    title: 'Short Citation Forms — Archival Sources',
    explanation:
      'Follow R. 4 for short form citations. Use "id." for immediately preceding sources and "supra" with the document title or author as reference anchor.',
    examples: [
      'Ledger of Goods Sold in the General Store of Longmeadow, Massachusetts, supra note 2.',
    ],
    references: ['R. 4', 'R. 4.1', 'R. 4.2'],
  },
  'T1': {
    title: 'United States Jurisdictions',
    explanation:
      'Table T1 lists citation conventions for all U.S. jurisdictions. Abbreviations are intended for a national audience; practitioners should also follow local rules (see BT2).\n\n' +
      'T1.1 — Federal Judicial and Legislative Materials: reporters for SCOTUS (U.S., S. Ct., L. Ed., U.S.L.W.), circuits (F., F.2d, F.3d, F.4th), districts (F. Supp., F. Supp. 2d, F. Supp. 3d), plus statutory compilations (U.S.C.) and session laws (Stat.).\n' +
      'T1.2 — Federal Administrative and Executive Materials: agency-specific citation forms for NLRB, SEC, FCC, EPA, FTC, and dozens more.\n' +
      'T1.3 — States and the District of Columbia: official and unofficial reporters, statutes, and session laws for each state.\n' +
      'T1.4 — Other U.S. Jurisdictions (territories, D.C.).\n' +
      'T1.5 — Tribal Nations.',
    references: ['R. 10.3', 'R. 10.4', 'R. 12', 'R. 14', 'BT2'],
  },
  'T1.3': {
    title: 'States and the District of Columbia',
    explanation:
      'T1.3 lists citation conventions for all 50 states and D.C. For each jurisdiction it provides:\n\n' +
      '1. Court hierarchy and abbreviations (e.g., "Ala." for Alabama Supreme Court, "Ala. Civ. App." for civil appeals)\n' +
      '2. Preferred reporters — always cite to the regional reporter (So., S.E., N.E., N.W., P., S.W., A.) if the case appears therein\n' +
      '3. Statutory compilations — official and annotated codes with proper citation format\n' +
      '4. Session laws — proper citation for uncodified legislation\n' +
      '5. Administrative compilations and registers\n\n' +
      'Some states have adopted public domain (medium-neutral) citation formats for recent decisions (e.g., Arkansas, Colorado, Illinois, Louisiana, Maine, Mississippi, Montana, New Mexico, North Dakota, Ohio, Oklahoma). When a public domain format exists, include it along with the regional reporter citation.\n\n' +
      'Key pattern: [Volume] [Reporter] [Page] ([Court abbrev.] [Year]). Omit the court abbreviation when citing the highest court of the state and the reporter unambiguously identifies the jurisdiction.',
    references: ['T1', 'R. 10.3', 'R. 10.4', 'T10'],
  },
  'T1.3:Ala.': {
    title: 'Alabama',
    explanation:
      'Supreme Court (Ala.): Cite to So., So. 2d, or So. 3d, if therein. Official: Alabama Reports (Ala.), 1840–1976.\n' +
      'Court of Civil Appeals (Ala. Civ. App.) and Court of Criminal Appeals (Ala. Crim. App.), before 1969 Court of Appeals (Ala. Ct. App.): Cite to So., So. 2d, or So. 3d.\n\n' +
      'Statutory compilations: Cite to Ala. Code (West), if therein.\n' +
      '  Code of Alabama, 1975 (West): Ala. Code § x-x-x (year)\n' +
      'Session laws: Cite to Ala. Laws.\n' +
      'Admin compilation: Ala. Admin. Code r. x-x-x.x (year)',
    examples: [
      'Ex parte Jones, 350 So. 3d 416 (Ala. 2021).',
      'Smith v. State, 312 So. 3d 18 (Ala. Crim. App. 2020).',
      'Ala. Code § 6-5-410 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.4'],
  },
  'T1.3:Alaska': {
    title: 'Alaska',
    explanation:
      'Supreme Court (Alaska): Cite to P.2d or P.3d.\n' +
      'Court of Appeals (Alaska Ct. App.): Cite to P.2d or P.3d.\n\n' +
      'Note: District Courts of Alaska (D. Alaska) had local jurisdiction 1884–1959; cite to F. Supp., F., or F.2d.\n\n' +
      'Statutory compilations: Cite to Alaska Stat. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Alaska Sess. Laws.\n' +
      'Admin compilation: Alaska Admin. Code tit. x, § x.x (year)',
    examples: [
      'State v. Doe, 425 P.3d 115 (Alaska 2018).',
      'Smith v. State, 310 P.3d 928 (Alaska Ct. App. 2013).',
      'Alaska Stat. § 11.41.100 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Ariz.': {
    title: 'Arizona',
    explanation:
      'Supreme Court (Ariz.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Ariz. Ct. App.): Cite to P.2d or P.3d.\n' +
      'Tax Court (Ariz. Tax Ct.): Cite to P.2d or P.3d.\n\n' +
      'Statutory compilations: Cite to one of the annotated codes.\n' +
      '  Ariz. Rev. Stat. Ann. § x-x (West year) or Ariz. Rev. Stat. § x-x (LexisNexis year)\n' +
      'Session laws: Cite to Ariz. Sess. Laws.\n' +
      'Admin compilation: Ariz. Admin. Code § x-x-x (year)',
    examples: [
      'State v. Smith, 520 P.3d 190 (Ariz. 2022).',
      'Ariz. Rev. Stat. Ann. § 13-1105 (West 2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Ark.': {
    title: 'Arkansas',
    explanation:
      'Public domain citation format adopted for cases after February 13, 2009:\n' +
      '  Smith v. Hickman, 2009 Ark. 12, at 1, 273 S.W.3d 340, 343.\n' +
      '  Doe v. State, 2009 Ark. App. 318, at 7.\n\n' +
      'Supreme Court (Ark.): Cite to S.W., S.W.2d, or S.W.3d, if therein.\n' +
      'Court of Appeals (Ark. Ct. App.): Cite to S.W.2d or S.W.3d.\n\n' +
      'Statutory compilations: Cite to Ark. Code Ann. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Ark. Acts.',
    examples: [
      'Smith v. Hickman, 2009 Ark. 12, 273 S.W.3d 340.',
      'Ark. Code Ann. § 5-10-101 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Cal.': {
    title: 'California',
    explanation:
      'Supreme Court (Cal.): Cite to P., P.2d, or P.3d, if therein. Official: Cal., Cal. 2d–5th.\n' +
      'Court of Appeal (Cal. Ct. App.): Cite to Cal. Rptr., Cal. Rptr. 2d, or Cal. Rptr. 3d (after 1959), or P./P.2d (before 1960).\n' +
      'Appellate Divisions of Superior Court (Cal. App. Dep\'t Super. Ct.): Same reporter preference.\n\n' +
      'Statutory compilations: Cite to a subject-matter code:\n' +
      '  Cal. [Subject] Code § x (West year) — e.g., Cal. Civ. Code, Cal. Penal Code, Cal. Evid. Code\n' +
      'Session laws: Cite to Cal. Stat.\n' +
      'Admin compilation: Cal. Code Regs. tit. x, § x (year)',
    examples: [
      'People v. Banks, 12 Cal. 5th 652, 504 P.3d 247 (2022).',
      'Smith v. Jones, 75 Cal. App. 5th 1100, 291 Cal. Rptr. 3d 55 (2022).',
      'Cal. Civ. Code § 1714 (West 2024).',
      'Cal. Penal Code § 187 (West 2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Colo.': {
    title: 'Colorado',
    explanation:
      'Public domain citation format adopted for cases after January 1, 2012:\n' +
      '  Iannone v. Callahan, 2012 CO 22, ¶ 13.\n' +
      '  Callahan v. Iannone, 2015 COA 14, ¶¶ 8–12.\n\n' +
      'Supreme Court (Colo.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Colo. App.): Cite to P., P.2d, or P.3d, if therein.\n\n' +
      'Statutory compilations: Cite to Colo. Rev. Stat. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Colo. Sess. Laws.\n' +
      'Admin compilation: Colo. Code Regs. § x-x (year)',
    examples: [
      'Iannone v. Callahan, 2012 CO 22, ¶ 13.',
      'Colo. Rev. Stat. § 18-3-102 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Conn.': {
    title: 'Connecticut',
    explanation:
      'Supreme Court (Conn.): Cite to A., A.2d, or A.3d, if therein. Official: Connecticut Reports (Conn.).\n' +
      'Appellate Court (Conn. App. Ct.): Cite to A.2d or A.3d.\n' +
      'Superior Court (Conn. Super. Ct.): Cite to A.2d or A.3d, if therein; otherwise Conn. Supp.\n\n' +
      'Statutory compilations: Cite to Conn. Gen. Stat., if therein.\n' +
      'Session laws: Cite to Conn. Acts, Conn. Pub. Acts, or Conn. Spec. Acts.\n' +
      'Admin compilation: Conn. Agencies Regs. § x-x-x (year)',
    examples: [
      'State v. Smith, 310 A.3d 412 (Conn. 2024).',
      'Conn. Gen. Stat. § 53a-54a (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Del.': {
    title: 'Delaware',
    explanation:
      'Supreme Court (Del.): Cite to A., A.2d, or A.3d, if therein.\n' +
      'Court of Chancery (Del. Ch.): Cite to A., A.2d, or A.3d. Delaware Chancery is uniquely important in corporate law.\n' +
      'Superior Court (Del. Super. Ct.): Cite to A.2d or A.3d.\n' +
      'Family Court (Del. Fam. Ct.): Cite to A.2d or A.3d.\n\n' +
      'Statutory compilations: Cite to Del. Code Ann. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Del. Laws.\n' +
      'Admin compilation: x-x-x Del. Admin. Code § x (year)',
    examples: [
      'Smith v. Van Gorkom, 488 A.2d 858 (Del. 1985).',
      'In re MFW S\'holders Litig., 67 A.3d 496 (Del. Ch. 2013).',
      'Del. Code Ann. tit. 8, § 102 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:D.C.': {
    title: 'District of Columbia',
    explanation:
      'Court of Appeals (D.C.): Cite to A.2d or A.3d. (Municipal court of appeals before 1971.)\n' +
      'U.S. Court of Appeals for the D.C. Circuit (D.C. Cir.): Cite to F., F.2d, F.3d, or F.4th.\n' +
      'Superior Court (D.C. Super. Ct.): Cite to Daily Wash. L. Rptr.\n\n' +
      'Statutory compilations: Cite to D.C. Code (LexisNexis), if therein.\n' +
      'Session laws: Cite to Stat., D.C. Reg., or D.C. Code Adv. Leg. Serv.\n' +
      'Municipal regulations: D.C. Mun. Regs. tit. x, § x (year)',
    examples: [
      'Smith v. United States, 305 A.3d 750 (D.C. 2023).',
      'D.C. Code § 22-2104 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.4'],
  },
  'T1.3:Fla.': {
    title: 'Florida',
    explanation:
      'Supreme Court (Fla.): Cite to So., So. 2d, or So. 3d, if therein.\n' +
      'District Court of Appeal (Fla. Dist. Ct. App.): Cite to So. 2d or So. 3d.\n' +
      'Circuit/County Courts: Cite to Fla. Supp. or Fla. L. Weekly Supp.\n\n' +
      'Statutory compilations: Cite to Fla. Stat., if therein.\n' +
      'Session laws: Cite to Fla. Laws.\n' +
      'Admin compilation: Fla. Admin. Code Ann. r. x-x.x (year)',
    examples: [
      'State v. Doe, 375 So. 3d 210 (Fla. 2023).',
      'Fla. Stat. § 782.04 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Ga.': {
    title: 'Georgia',
    explanation:
      'Supreme Court (Ga.): Cite to S.E. or S.E.2d, if therein.\n' +
      'Court of Appeals (Ga. Ct. App.): Cite to S.E. or S.E.2d.\n\n' +
      'Statutory compilations: Cite to Ga. Code Ann. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Ga. Laws.\n' +
      'Admin compilation: Ga. Comp. R. & Regs. x-x-x.x (year)',
    examples: [
      'State v. Smith, 890 S.E.2d 100 (Ga. 2023).',
      'Ga. Code Ann. § 16-5-1 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Haw.': {
    title: 'Hawaii',
    explanation:
      'Supreme Court (Haw.): Cite to P.2d or P.3d, if therein.\n' +
      'Intermediate Court of Appeals (Haw. Ct. App.): Cite to P.2d or P.3d.\n\n' +
      'Statutory compilations: Cite to Haw. Rev. Stat., if therein.\n' +
      'Session laws: Cite to Haw. Sess. Laws.',
    examples: [
      'State v. Smith, 530 P.3d 120 (Haw. 2023).',
      'Haw. Rev. Stat. § 707-701 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Idaho': {
    title: 'Idaho',
    explanation:
      'Supreme Court (Idaho): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Idaho Ct. App.): Cite to P.2d or P.3d.\n\n' +
      'Statutory compilations: Cite to Idaho Code (LexisNexis), if therein.\n' +
      'Session laws: Cite to Idaho Sess. Laws.\n' +
      'Admin compilation: Idaho Admin. Code r. x.x.x.x (year)',
    examples: [
      'State v. Jones, 530 P.3d 400 (Idaho 2023).',
      'Idaho Code § 18-4001 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Ill.': {
    title: 'Illinois',
    explanation:
      'Public domain citation format adopted for cases filed after June 30, 2011:\n' +
      '  People v. Jolly, 2014 IL 117142, ¶ 32.\n' +
      '  People v. Jolly, 2016 IL App (4th) 150494-V, ¶¶ 7-11.\n\n' +
      'Supreme Court (Ill.): Cite to N.E., N.E.2d, or N.E.3d, if therein.\n' +
      'Appellate Court (Ill. App. Ct.): Cite to N.E.2d or N.E.3d.\n\n' +
      'Statutory compilations: Cite to Ill. Comp. Stat., if therein.\n' +
      '  [ch. no.] Ill. Comp. Stat. [act no.] / [sec. no.] (year)\n' +
      'Session laws: Cite to Ill. Laws.\n' +
      'Admin compilation: Ill. Admin. Code tit. x, § x (year)',
    examples: [
      'People v. Jolly, 2014 IL 117142, ¶ 32, 14 N.E.3d 437.',
      '720 Ill. Comp. Stat. 5/9-1 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Ind.': {
    title: 'Indiana',
    explanation:
      'Supreme Court (Ind.): Cite to N.E., N.E.2d, or N.E.3d, if therein.\n' +
      'Court of Appeals (Ind. Ct. App.): Cite to N.E., N.E.2d, or N.E.3d.\n' +
      'Tax Court (Ind. T.C.): Cite to N.E.2d or N.E.3d.\n\n' +
      'Statutory compilations: Cite to Ind. Code, if therein.\n' +
      'Session laws: Cite to Ind. Acts.\n' +
      'Admin compilation: [tit. no.] Ind. Admin. Code [rule no.] (year)',
    examples: [
      'State v. Smith, 220 N.E.3d 115 (Ind. 2023).',
      'Ind. Code § 35-42-1-1 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Iowa': {
    title: 'Iowa',
    explanation:
      'Supreme Court (Iowa): Cite to N.W., N.W.2d, or N.W.3d, if therein.\n' +
      'Court of Appeals (Iowa Ct. App.): Cite to N.W.2d or N.W.3d.\n\n' +
      'Statutory compilations: Cite to Iowa Code, if therein.\n' +
      'Session laws: Cite to Iowa Acts.\n' +
      'Admin compilation: Iowa Admin. Code r. x-x.x (year)',
    examples: [
      'State v. Doe, 998 N.W.2d 300 (Iowa 2023).',
      'Iowa Code § 707.2 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Kan.': {
    title: 'Kansas',
    explanation:
      'Supreme Court (Kan.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Kan. Ct. App.): Cite to P., P.2d, or P.3d.\n\n' +
      'Statutory compilations: Cite to Kan. Stat. Ann., if therein.\n' +
      'Session laws: Cite to Kan. Sess. Laws.\n' +
      'Admin compilation: Kan. Admin. Regs. § x-x-x (year)',
    examples: [
      'State v. Jones, 530 P.3d 25 (Kan. 2023).',
      'Kan. Stat. Ann. § 21-5402 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Ky.': {
    title: 'Kentucky',
    explanation:
      'Supreme Court (Ky.): Before 1976, the Court of Appeals (Ky.) was the highest court. Cite to S.W., S.W.2d, or S.W.3d, if therein.\n' +
      'Court of Appeals (Ky. Ct. App.) (for decisions before 1976, see Supreme Court): Cite to S.W.2d or S.W.3d.\n\n' +
      'Statutory compilations: Cite to one of the annotated codes.\n' +
      '  Ky. Rev. Stat. Ann. § x.x (West year) or (LexisNexis year)\n' +
      'Session laws: Cite to Ky. Acts.\n' +
      'Admin compilation: [tit. no.] Ky. Admin. Regs. [rule no.] (year)',
    examples: [
      'Commonwealth v. Smith, 680 S.W.3d 50 (Ky. 2023).',
      'Ky. Rev. Stat. Ann. § 507.020 (West 2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:La.': {
    title: 'Louisiana',
    explanation:
      'Public domain citation format adopted for cases after December 31, 1993:\n' +
      '  State v. Ray, 97-1093 (La. App. 3 Cir. 2/4/98), 705 So. 2d 1295.\n' +
      '  State v. Fleury, 2001-0871, p. 5 (La. 10/16/01), 799 So. 2d 468, 472.\n\n' +
      'Supreme Court (La.): Cite to So., So. 2d, or So. 3d, if therein.\n' +
      'Court of Appeal (La. Ct. App.): Cite to So., So. 2d, or So. 3d.\n\n' +
      'Statutory compilations: Louisiana uses subject-matter civil law codes:\n' +
      '  La. Civ. Code Ann. art. x (year), La. Code Crim. Proc. Ann. art. x (year), etc.\n' +
      'Session laws: Cite to La. Acts.',
    examples: [
      'State v. Ray, 97-1093 (La. App. 3 Cir. 2/4/98), 705 So. 2d 1295.',
      'La. Civ. Code Ann. art. 2315 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Me.': {
    title: 'Maine',
    explanation:
      'Public domain citation format adopted for cases after December 31, 1996:\n' +
      '  Bangor Publ\'g Co. v. Union St. Mkt., 1998 ME 37, 706 A.2d 595.\n\n' +
      'Supreme Judicial Court (Me.): Cite to A., A.2d, or A.3d, if therein.\n\n' +
      'Statutory compilations: Cite to Me. Stat. (West) or Me. Rev. Stat. Ann. (West).\n' +
      'Session laws: Cite to Me. Laws.',
    examples: [
      'Bangor Publ\'g Co. v. Union St. Mkt., 1998 ME 37, ¶ 3, 706 A.2d 595, 595.',
      'Me. Rev. Stat. Ann. tit. 17-A, § 201 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Md.': {
    title: 'Maryland',
    explanation:
      'Supreme Court (Md.), before December 14, 2022, Court of Appeals (Md.): Cite to A., A.2d, or A.3d, if therein.\n' +
      'Appellate Court (Md. App. Ct.), before December 14, 2022, Court of Special Appeals (Md. Ct. Spec. App.): Cite to A.2d or A.3d.\n\n' +
      'Statutory compilations: Cite by subject to Md. Code Ann. (LexisNexis or West).\n' +
      '  Md. Code Ann., [subject] § x-x (LexisNexis year)\n' +
      'Session laws: Cite to Md. Laws.\n' +
      'Admin compilation: Md. Code Regs. [reg. no.] (year)',
    examples: [
      'State v. Smith, 300 A.3d 110 (Md. 2023).',
      'Md. Code Ann., Crim. Law § 2-201 (LexisNexis 2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Mass.': {
    title: 'Massachusetts',
    explanation:
      'Supreme Judicial Court (Mass.): Cite to N.E., N.E.2d, or N.E.3d, if therein.\n' +
      'Appeals Court (Mass. App. Ct.): Cite to N.E.2d or N.E.3d.\n' +
      'Lower courts (Mass. Dist. Ct., Bos. Mun. Ct.): Cite to Mass. App. Div., if therein.\n\n' +
      'Statutory compilations: Cite to Mass. Gen. Laws (West), if therein.\n' +
      '  Mass. Gen. Laws ch. x, § x (year)\n' +
      'Session laws: Cite to Mass. Acts.\n' +
      'Admin compilation: [tit. no.] Mass. Code Regs. [sec. no.] (year)',
    examples: [
      'Commonwealth v. Smith, 220 N.E.3d 50 (Mass. 2023).',
      'Mass. Gen. Laws ch. 265, § 1 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Mich.': {
    title: 'Michigan',
    explanation:
      'Supreme Court (Mich.): Cite to N.W., N.W.2d, or N.W.3d, if therein.\n' +
      'Court of Appeals (Mich. Ct. App.): Cite to N.W.2d or N.W.3d.\n\n' +
      'Statutory compilations: Cite to Mich. Comp. Laws, if therein.\n' +
      'Session laws: Cite to Mich. Pub. Acts.\n' +
      'Admin compilation: Mich. Admin. Code r. x.x (year)',
    examples: [
      'People v. Smith, 1 N.W.3d 100 (Mich. 2024).',
      'Mich. Comp. Laws § 750.316 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Minn.': {
    title: 'Minnesota',
    explanation:
      'Supreme Court (Minn.): Cite to N.W., N.W.2d, or N.W.3d, if therein.\n' +
      'Court of Appeals (Minn. Ct. App.): Cite to N.W.2d or N.W.3d.\n\n' +
      'Statutory compilations: Cite to Minn. Stat., if therein.\n' +
      'Session laws: Cite to Minn. Laws.\n' +
      'Admin compilation: Minn. R. [rule no.] (year)',
    examples: [
      'State v. Doe, 5 N.W.3d 200 (Minn. 2024).',
      'Minn. Stat. § 609.185 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Miss.': {
    title: 'Mississippi',
    explanation:
      'Public domain citation format adopted for cases after July 1, 1997:\n' +
      '  Pro-Choice Miss. v. Fordice, 95-CA-00960-SCT (¶ 1) (Miss. 1998).\n\n' +
      'Supreme Court (Miss.): Cite to So., So. 2d, or So. 3d, if therein.\n' +
      'Court of Appeals (Miss. Ct. App.): Cite to So. 2d or So. 3d.\n\n' +
      'Statutory compilations: Cite to Miss. Code Ann. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Miss. Laws.',
    examples: [
      'State v. Smith, 370 So. 3d 200 (Miss. 2023).',
      'Miss. Code Ann. § 97-3-19 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Mo.': {
    title: 'Missouri',
    explanation:
      'Supreme Court (Mo.): Cite to S.W., S.W.2d, or S.W.3d, if therein.\n' +
      'Court of Appeals (Mo. Ct. App.): Cite to S.W., S.W.2d, or S.W.3d.\n\n' +
      'Statutory compilations: Cite to Mo. Rev. Stat., if therein.\n' +
      'Session laws: Cite to Mo. Laws.\n' +
      'Admin compilation: Mo. Code Regs. Ann. tit. x, § x-x.x (year)',
    examples: [
      'State v. Smith, 680 S.W.3d 100 (Mo. 2023).',
      'Mo. Rev. Stat. § 565.020 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Mont.': {
    title: 'Montana',
    explanation:
      'Public domain citation format adopted for cases after January 1, 1998:\n' +
      '  Mont. Env\'t Info. Ctr. v. Dep\'t of Env\'t Quality, 1999 MT 248, ¶ 21, 296 Mont. 207, 988 P.2d 1236.\n\n' +
      'Supreme Court (Mont.): Cite to P., P.2d, or P.3d, if therein.\n\n' +
      'Statutory compilations: Cite to Mont. Code Ann., if therein.\n' +
      'Session laws: Mont. Laws.\n' +
      'Admin compilation: Mont. Admin. R. [rule no.] (year)',
    examples: [
      'Mont. Env\'t Info. Ctr. v. Dep\'t of Env\'t Quality, 1999 MT 248, 988 P.2d 1236.',
      'Mont. Code Ann. § 45-5-102 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Neb.': {
    title: 'Nebraska',
    explanation:
      'Supreme Court (Neb.): Cite to N.W., N.W.2d, or N.W.3d, if therein.\n' +
      'Court of Appeals (Neb. Ct. App.): Cite to N.W.2d or N.W.3d.\n\n' +
      'Statutory compilations: Cite to Neb. Rev. Stat., if therein.\n' +
      'Session laws: Cite to Neb. Laws.\n' +
      'Admin compilation: [tit. no.] Neb. Admin. Code § x-x (year)',
    examples: [
      'State v. Jones, 5 N.W.3d 50 (Neb. 2024).',
      'Neb. Rev. Stat. § 28-303 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Nev.': {
    title: 'Nevada',
    explanation:
      'Supreme Court (Nev.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Nev. Ct. App.): Cite to P.3d.\n\n' +
      'Statutory compilations: Cite to Nev. Rev. Stat., if therein.\n' +
      'Session laws: Cite to Nev. Stat.\n' +
      'Admin compilation: Nev. Admin. Code § x.x (year)',
    examples: [
      'State v. Smith, 535 P.3d 300 (Nev. 2023).',
      'Nev. Rev. Stat. § 200.010 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:N.H.': {
    title: 'New Hampshire',
    explanation:
      'Supreme Court (N.H.): Cite to A., A.2d, or A.3d, if therein.\n\n' +
      'Statutory compilations: Cite to N.H. Rev. Stat. Ann. (West), if therein.\n' +
      'Session laws: Cite to N.H. Laws or N.H. Legis. Serv.\n' +
      'Admin compilation: N.H. Code Admin. R. Ann. [dep\'t abbrev.] [rule no.] (year)',
    examples: [
      'State v. Doe, 310 A.3d 50 (N.H. 2024).',
      'N.H. Rev. Stat. Ann. § 630:1-a (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:N.J.': {
    title: 'New Jersey',
    explanation:
      'Supreme Court (N.J.): Cite to A., A.2d, or A.3d, if therein.\n' +
      'Superior Court (N.J. Super. Ct. App. Div., Ch. Div., Law Div.): Cite to A., A.2d, or A.3d.\n' +
      'Tax Court (N.J. Tax Ct.): Cite to N.J. Tax.\n\n' +
      'Statutory compilations: Cite to N.J. Stat. Ann. (West), if therein.\n' +
      'Session laws: Cite to N.J. Laws.\n' +
      'Admin compilation: N.J. Admin. Code § x:x-x.x (year)',
    examples: [
      'State v. Smith, 310 A.3d 100 (N.J. 2024).',
      'N.J. Stat. Ann. § 2C:11-3 (West 2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:N.M.': {
    title: 'New Mexico',
    explanation:
      'Public domain citation format adopted effective July 1, 2013:\n' +
      '  Atlixco Coal. v. Maggiore, 1998-NMCA-134, ¶ 14, 125 N.M. 786, 965 P.2d 370.\n\n' +
      'Supreme Court (N.M.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (N.M. Ct. App.): Cite to P.2d or P.3d.\n\n' +
      'Statutory compilations: Cite to N.M. Stat. Ann. (Conway Greene), if therein.\n' +
      'Session laws: Cite to N.M. Laws.',
    examples: [
      'Atlixco Coal. v. Maggiore, 1998-NMCA-134, 965 P.2d 370.',
      'N.M. Stat. Ann. § 30-2-1 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:N.Y.': {
    title: 'New York',
    explanation:
      'Court of Appeals (N.Y.): Cite to N.E., N.E.2d, or N.E.3d, if therein. Official: N.Y., N.Y.2d, N.Y.3d.\n' +
      'Supreme Court, Appellate Division (N.Y. App. Div.): Cite to N.Y.S., N.Y.S.2d, or N.Y.S.3d.\n' +
      'Other lower courts (N.Y. Sup. Ct., N.Y. Ct. Cl., etc.): Cite to N.Y.S., N.Y.S.2d, or N.Y.S.3d; otherwise Misc., Misc. 2d.\n\n' +
      'Note: The first series of N.Y. is reprinted in N.Y.S. without separate pagination — do not include a parallel cite to N.Y.S. for first series N.Y.\n\n' +
      'Statutory compilations: Cite to McKinney\'s or Consolidated Laws Service by subject:\n' +
      '  N.Y. [Subject] Law § x (McKinney year)\n' +
      'Session laws: Cite to N.Y. Laws or N.Y. Sess. Laws (McKinney).\n' +
      'Admin compilation: N.Y. Comp. Codes R. & Regs. tit. x, § x (year)',
    examples: [
      'People v. Smith, 220 N.E.3d 50 (N.Y. 2023).',
      'Jones v. Doe, 210 N.Y.S.3d 100 (App. Div. 2023).',
      'N.Y. Penal Law § 125.25 (McKinney 2024).',
      'N.Y. C.P.L.R. 3212 (McKinney 2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:N.C.': {
    title: 'North Carolina',
    explanation:
      'Supreme Court (N.C.): Cite to S.E. or S.E.2d, if therein.\n' +
      'Court of Appeals (N.C. Ct. App.): Cite to S.E.2d.\n\n' +
      'Statutory compilations: Cite to N.C. Gen. Stat. (LexisNexis), if therein.\n' +
      'Session laws: Cite to N.C. Sess. Laws.\n' +
      'Admin compilation: [tit. no.] N.C. Admin. Code [rule no.] (year)',
    examples: [
      'State v. Smith, 890 S.E.2d 100 (N.C. 2023).',
      'N.C. Gen. Stat. § 14-17 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:N.D.': {
    title: 'North Dakota',
    explanation:
      'Public domain citation format adopted for cases after December 31, 1996:\n' +
      '  Kautzman v. Kautzman, 2003 ND 140, ¶ 9, 668 N.W.2d 59, 63.\n\n' +
      'Supreme Court (N.D.): Cite to N.W., N.W.2d, or N.W.3d, if therein.\n' +
      'Court of Appeals (N.D. Ct. App.): Cite to N.W.2d or N.W.3d.\n\n' +
      'Statutory compilations: Cite to N.D. Cent. Code (LexisNexis), if therein.\n' +
      'Session laws: Cite to N.D. Laws.\n' +
      'Admin compilation: N.D. Admin. Code [rule no.] (year)',
    examples: [
      'Kautzman v. Kautzman, 2003 ND 140, 668 N.W.2d 59.',
      'N.D. Cent. Code § 12.1-16-01 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Ohio': {
    title: 'Ohio',
    explanation:
      'Public domain citation format adopted for cases decided after April 30, 2002:\n' +
      '  State v. Lynch, 98 Ohio St. 3d 514, 2003-Ohio-2284, 787 N.E.2d 1185.\n' +
      '  State v. Lynch, 98 Ohio St. 3d 514, 2003-Ohio-2284, 787 N.E.2d 1185, at ¶ 3.\n\n' +
      'Supreme Court (Ohio): Cite to N.E., N.E.2d, or N.E.3d, if therein.\n' +
      'Court of Appeals (Ohio Ct. App.): Cite to N.E., N.E.2d, or N.E.3d.\n\n' +
      'Statutory compilations: Cite to one of the annotated codes.\n' +
      '  Ohio Rev. Code Ann. § x.x (LexisNexis year) or (West year)\n' +
      'Session laws: Cite to Ohio Laws.',
    examples: [
      'State v. Lynch, 98 Ohio St. 3d 514, 2003-Ohio-2284, 787 N.E.2d 1185.',
      'Ohio Rev. Code Ann. § 2903.01 (LexisNexis 2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Okla.': {
    title: 'Oklahoma',
    explanation:
      'Public domain citation format adopted for cases after May 1, 1997:\n' +
      '  Herbert v. Okla. Christian Coal., 1999 OK 90, ¶ 2, 992 P.2d 322, 325.\n\n' +
      'Supreme Court (Okla.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Criminal Appeals (Okla. Crim. App.): Cite to P., P.2d, or P.3d.\n' +
      'Court of Civil Appeals (Okla. Civ. App.): Cite to P.2d or P.3d.\n\n' +
      'Statutory compilations: Cite to Okla. Stat. (West), if therein.\n' +
      '  Okla. Stat. tit. x, § x (year)\n' +
      'Session laws: Cite to Okla. Sess. Laws.\n' +
      'Admin compilation: Okla. Admin. Code § x:x-x-x (year)',
    examples: [
      'Herbert v. Okla. Christian Coal., 1999 OK 90, 992 P.2d 322.',
      'Okla. Stat. tit. 21, § 701.7 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Or.': {
    title: 'Oregon',
    explanation:
      'Supreme Court (Or.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Or. Ct. App.): Cite to P.2d or P.3d.\n' +
      'Tax Court (Or. T.C.): Cite to Or. Tax.\n\n' +
      'Statutory compilations: Cite to Or. Rev. Stat., if therein.\n' +
      'Session laws: Cite to Or. Laws.\n' +
      'Admin compilation: Or. Admin. R. [rule no.] (year)',
    examples: [
      'State v. Smith, 530 P.3d 100 (Or. 2023).',
      'Or. Rev. Stat. § 163.005 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Pa.': {
    title: 'Pennsylvania',
    explanation:
      'Supreme Court (Pa.): Cite to A., A.2d, or A.3d, if therein.\n' +
      'Superior Court (Pa. Super. Ct.): Cite to A., A.2d, or A.3d. Public domain format adopted after Dec. 31, 1998.\n' +
      'Commonwealth Court (Pa. Commw. Ct.): Cite to A.2d or A.3d.\n' +
      'Lower courts: Cite to Pa. D. & C. through Pa. D. & C.5th.\n\n' +
      'Statutory compilations: Cite to Pa. Cons. Stat. (not Pa. Code, which is regulations).\n' +
      '  [tit. no.] Pa. Cons. Stat. § x (year)\n' +
      'Session laws: Cite to Pa. Laws.\n' +
      'Admin compilation: [tit. no.] Pa. Code § x.x (year)',
    examples: [
      'Commonwealth v. Smith, 310 A.3d 100 (Pa. 2024).',
      '18 Pa. Cons. Stat. § 2501 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:R.I.': {
    title: 'Rhode Island',
    explanation:
      'Supreme Court (R.I.): Cite to A., A.2d, or A.3d, if therein.\n\n' +
      'Statutory compilations: Cite to R.I. Gen. Laws (LexisNexis), if therein.\n' +
      '  [tit. no.] R.I. Gen. Laws § x-x-x (year)\n' +
      'Session laws: Cite to R.I. Pub. Laws.',
    examples: [
      'State v. Doe, 310 A.3d 200 (R.I. 2024).',
      'R.I. Gen. Laws § 11-23-1 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:S.C.': {
    title: 'South Carolina',
    explanation:
      'Supreme Court (S.C.) after 1868: Cite to S.E. or S.E.2d, if therein.\n' +
      'Court of Appeals (S.C. Ct. App.): Cite to S.E.2d.\n' +
      'Courts of law before 1868: Cite to S.C.L. Courts of equity before 1868: Cite to S.C. Eq.\n\n' +
      'Statutory compilations: S.C. Code Ann. § x-x-x (year)\n' +
      'Session laws: Cite to S.C. Acts.\n' +
      'Admin compilation: S.C. Code Ann. Regs. [reg no.] (year)',
    examples: [
      'State v. Smith, 890 S.E.2d 50 (S.C. 2023).',
      'S.C. Code Ann. § 16-3-10 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:S.D.': {
    title: 'South Dakota',
    explanation:
      'Public domain citation format adopted for cases after December 31, 1995:\n' +
      '  Wulf v. Senst, 2003 SD 105, ¶ 14, 669 N.W.2d 135, 141.\n\n' +
      'Supreme Court (S.D.): Cite to N.W., N.W.2d, or N.W.3d, if therein.\n\n' +
      'Statutory compilation: S.D. Codified Laws § x-x-x (year)\n' +
      'Session laws: Cite to S.D. Sess. Laws.\n' +
      'Admin compilation: S.D. Admin. R. [rule no.] (year)',
    examples: [
      'Wulf v. Senst, 2003 SD 105, 669 N.W.2d 135.',
      'S.D. Codified Laws § 22-16-4 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Tenn.': {
    title: 'Tennessee',
    explanation:
      'Supreme Court (Tenn.): Cite to S.W., S.W.2d, or S.W.3d, if therein.\n' +
      'Court of Appeals (Tenn. Ct. App.): Cite to S.W.2d or S.W.3d.\n' +
      'Court of Criminal Appeals (Tenn. Crim. App.): Cite to S.W.2d or S.W.3d.\n\n' +
      'Statutory compilations: Cite to Tenn. Code Ann. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Tenn. Pub. Acts or Tenn. Priv. Acts.\n' +
      'Admin compilation: Tenn. Comp. R. & Regs. [rule no.] (year)',
    examples: [
      'State v. Smith, 680 S.W.3d 200 (Tenn. 2023).',
      'Tenn. Code Ann. § 39-13-202 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Tex.': {
    title: 'Texas',
    explanation:
      'Supreme Court (Tex.): Cite to S.W., S.W.2d, or S.W.3d, if therein.\n' +
      'Court of Criminal Appeals (Tex. Crim. App.): Cite to S.W., S.W.2d, or S.W.3d.\n' +
      'Courts of Appeals (Tex. App.): Cite to S.W., S.W.2d, or S.W.3d.\n\n' +
      'Statutory compilations: Texas uses subject-matter codes (Vernon\'s Texas Codes Annotated).\n' +
      '  Tex. [Subject] Code Ann. § x (West year) — e.g., Tex. Penal Code Ann., Tex. Fam. Code Ann.\n' +
      '  For unrecodified statutes: Tex. Rev. Civ. Stat. Ann. art. x, § x (West year)\n' +
      'Session laws: Cite to Tex. Gen. Laws.\n' +
      'Admin compilation: [tit. no.] Tex. Admin. Code § x.x (year)\n\n' +
      'Note: For Texas-specific citation rules, also consult The Greenbook: Texas Rules of Form.',
    examples: [
      'State v. Smith, 680 S.W.3d 50 (Tex. 2023).',
      'Tex. Penal Code Ann. § 19.02 (West 2024).',
      'Tex. Civ. Prac. & Rem. Code Ann. § 16.003 (West 2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Utah': {
    title: 'Utah',
    explanation:
      'Public domain citation format adopted for cases after December 31, 1998:\n' +
      '  Wickham v. Galetka, 2002 UT 72, 61 P.3d 979.\n' +
      '  Gilley v. Blackstock, 2002 UT App 414, ¶ 10, 61 P.3d 305.\n\n' +
      'Supreme Court (Utah): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Utah Ct. App.): Cite to P.2d or P.3d.\n\n' +
      'Statutory compilations: Cite to Utah Code Ann. (LexisNexis or West).\n' +
      'Session laws: Cite to Utah Laws.\n' +
      'Admin compilation: Utah Admin. Code Rx-x-x (LexisNexis year)',
    examples: [
      'Wickham v. Galetka, 2002 UT 72, 61 P.3d 979.',
      'Utah Code Ann. § 76-5-202 (LexisNexis 2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Vt.': {
    title: 'Vermont',
    explanation:
      'Public domain citation format adopted for cases after December 31, 2002:\n' +
      '  Charbonneau v. Gorczyk, 2003 VT 105, ¶ 3, 176 Vt. 140, 838 A.2d 117.\n\n' +
      'Supreme Court (Vt.): Cite to A., A.2d, or A.3d, if therein.\n\n' +
      'Statutory compilations: Cite to Vt. Stat. Ann. (LexisNexis), if therein.\n' +
      '  Vt. Stat. Ann. tit. x, § x (year)\n' +
      'Session laws: Cite to Vt. Acts & Resolves.',
    examples: [
      'Charbonneau v. Gorczyk, 2003 VT 105, 838 A.2d 117.',
      'Vt. Stat. Ann. tit. 13, § 2301 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Va.': {
    title: 'Virginia',
    explanation:
      'Supreme Court (Va.): Cite to S.E. or S.E.2d, if therein.\n' +
      'Court of Appeals (Va. Ct. App.): Cite to S.E.2d.\n' +
      'Circuit Court (Va. Cir. Ct.): Cite to Va. Cir.\n\n' +
      'Statutory compilations: Cite to Va. Code Ann. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Va. Acts.\n' +
      'Admin compilation: [tit. no.] Va. Admin. Code § x-x-x (year)',
    examples: [
      'Commonwealth v. Smith, 890 S.E.2d 100 (Va. 2023).',
      'Va. Code Ann. § 18.2-32 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Wash.': {
    title: 'Washington',
    explanation:
      'Supreme Court (Wash.): Cite to P., P.2d, or P.3d, if therein.\n' +
      'Court of Appeals (Wash. Ct. App.): Cite to P.2d or P.3d.\n\n' +
      'Statutory compilations: Cite to Wash. Rev. Code, if therein.\n' +
      'Session laws: Cite to Wash. Sess. Laws.\n' +
      'Admin compilation: Wash. Admin. Code § x-x-x (year)',
    examples: [
      'State v. Smith, 535 P.3d 100 (Wash. 2023).',
      'Wash. Rev. Code § 9A.32.030 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:W. Va.': {
    title: 'West Virginia',
    explanation:
      'Supreme Court of Appeals (W. Va.): Cite to S.E. or S.E.2d, if therein.\n' +
      'Intermediate Court of Appeals (W. Va. Ct. App.): Cite to S.E.2d (established 2022).\n\n' +
      'Statutory compilations: Cite to W. Va. Code, if therein.\n' +
      'Session laws: Cite to W. Va. Acts.\n' +
      'Admin compilation: W. Va. Code R. § x-x-x (year)',
    examples: [
      'State v. Doe, 890 S.E.2d 50 (W. Va. 2023).',
      'W. Va. Code § 61-2-1 (2024).',
    ],
    references: ['T1.3', 'R. 10.3'],
  },
  'T1.3:Wis.': {
    title: 'Wisconsin',
    explanation:
      'Public domain citation format adopted for cases decided after December 31, 1999:\n' +
      '  Glaeske v. Shaw, 2003 WI App 71, ¶ 9, 261 Wis. 2d 549, 661 N.W.2d 72.\n\n' +
      'Supreme Court (Wis.): Cite to N.W., N.W.2d, or N.W.3d, if therein.\n' +
      'Court of Appeals (Wis. Ct. App.): Cite to N.W.2d or N.W.3d.\n\n' +
      'Statutory compilations: Cite to Wis. Stat., if therein.\n' +
      'Session laws: Cite to Wis. Sess. Laws.\n' +
      'Admin compilation: Wis. Admin. Code [agency abbrev.] § x-x (year)',
    examples: [
      'Glaeske v. Shaw, 2003 WI App 71, 661 N.W.2d 72.',
      'Wis. Stat. § 940.01 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.3:Wyo.': {
    title: 'Wyoming',
    explanation:
      'Public domain citation format adopted for cases decided after December 31, 2003:\n' +
      '  CLC v. Wyoming, 2004 WY 2, ¶ 4, 82 P.3d 1235, 1236 (Wyo. 2004).\n\n' +
      'Supreme Court (Wyo.): Cite to P., P.2d, or P.3d, if therein.\n\n' +
      'Statutory compilations: Cite to Wyo. Stat. Ann. (LexisNexis), if therein.\n' +
      'Session laws: Cite to Wyo. Sess. Laws.\n' +
      'Admin compilation: [tit. no.]-[ch. no.] Wyo. Code R. § x (LexisNexis year)',
    examples: [
      'CLC v. Wyoming, 2004 WY 2, 82 P.3d 1235.',
      'Wyo. Stat. Ann. § 6-2-101 (2024).',
    ],
    references: ['T1.3', 'R. 10.3', 'R. 10.3.3'],
  },
  'T1.4': {
    title: 'Other United States Jurisdictions',
    explanation:
      'T1.4 covers citation conventions for U.S. territories and other non-state jurisdictions: American Samoa, Canal Zone (historical), Guam, Northern Mariana Islands, Puerto Rico, and the Virgin Islands.\n\n' +
      'Each territory has its own court system and statutory compilation. Some have adopted public domain citation formats (Guam, Northern Mariana Islands, Puerto Rico, Virgin Islands).\n\n' +
      'For federal courts in territories, cite to F. Supp. or F. Supp. 2d/3d as appropriate.',
    references: ['T1', 'R. 10.3', 'R. 10.4'],
  },
  'T1.4:Am. Sam.': {
    title: 'American Samoa',
    explanation:
      'High Court of American Samoa (Am. Sam.): Cite to A.S.R., A.S.R.2d, or A.S.R.3d.\n\n' +
      'Statutory compilation: Am. Sam. Code Ann. § x (year)\n' +
      'Session laws: Am. Sam. Pub. L. No. xx-xx § x (year)\n' +
      'Admin compilation: Am. Sam. Admin. Code § x (year)',
    examples: [
      'Doe v. Am. Sam. Gov\'t, 12 A.S.R.3d 45 (Am. Sam. 2020).',
      'Am. Sam. Code Ann. § 46.3501 (2024).',
    ],
    references: ['T1.4'],
  },
  'T1.4:C.Z.': {
    title: 'Canal Zone',
    explanation:
      'Historical jurisdiction (now part of Panama). The U.S. District Court for the District of the Canal Zone (D.C.Z.) ceased to exist March 31, 1982. Litigation pending was transferred to the Eastern District of Louisiana (E.D. La.).\n\n' +
      'Cite to F. Supp.\n' +
      'Statutory compilation: C.Z. Code tit. x, § x (year) (enacted as Canal Zone Code and redesignated by the Panama Canal Act of 1979)',
    references: ['T1.4'],
  },
  'T1.4:Guam': {
    title: 'Guam',
    explanation:
      'Public domain citation format:\n' +
      '  Adams v. Duenas, 1998 Guam 15.\n' +
      '  Adams v. Duenas, 1998 Guam 15 ¶ 2.\n\n' +
      'Supreme Court of Guam (Guam): Cite using public domain format.\n' +
      'District Court (D. Guam): Cite to F. Supp., F. Supp. 2d, or F. Supp. 3d.\n\n' +
      'Statutory compilation: [tit. no.] Guam Code Ann. § x (year)\n' +
      'Session laws: Guam Pub. L. [law no.] (year)\n' +
      'Admin compilation: [tit. no.] Guam Admin. R. & Regs. § x (year)',
    examples: [
      'Adams v. Duenas, 1998 Guam 15.',
      '9 Guam Code Ann. § 80.40 (2024).',
    ],
    references: ['T1.4', 'R. 10.3.3'],
  },
  'T1.4:N. Mar. I.': {
    title: 'Northern Mariana Islands',
    explanation:
      'Public domain citation format for cases after June 15, 1996:\n' +
      '  Lifoifoi v. Lifoifoi-Aldan, 1996 MP 14.\n\n' +
      'Supreme Court (N. Mar. I.): Cite to N. Mar. I.\n' +
      'District Court (D. N. Mar. I.): Cite to F. Supp., F. Supp. 2d, or F. Supp. 3d.\n\n' +
      'Statutory compilation: [tit. no.] N. Mar. I. Code § x (year)\n' +
      'Session laws: [year] N. Mar. I. Pub. L. [law no.]',
    examples: [
      'Lifoifoi v. Lifoifoi-Aldan, 1996 MP 14.',
      '6 N. Mar. I. Code § 3101 (2024).',
    ],
    references: ['T1.4', 'R. 10.3.3'],
  },
  'T1.4:P.R.': {
    title: 'Puerto Rico',
    explanation:
      'Public domain citation format for cases decided after December 31, 1997:\n' +
      '  English: Guzman Rosario v. Departamento de Hacienda, 98 PRSC 148.\n' +
      '  Spanish: Guzman Rosario v. Departamento de Hacienda, 98 TSPR 148.\n\n' +
      'Supreme Court (P.R.): Cite to P.R. or P.R. Offic. Trans., if therein; otherwise P.R. Dec. or P.R. Sent.\n' +
      'Circuit Court of Appeals (P.R. Cir.): Cite to T.C.A.\n\n' +
      'Statutory compilation: P.R. Laws Ann. tit. x, § x (year)\n' +
      'Session laws: [year] P.R. Laws [page no.]',
    examples: [
      'Guzman Rosario v. Departamento de Hacienda, 98 PRSC 148.',
      'P.R. Laws Ann. tit. 33, § 4889 (2024).',
    ],
    references: ['T1.4', 'R. 10.3.3'],
  },
  'T1.4:V.I.': {
    title: 'Virgin Islands',
    explanation:
      'Public domain citation format for cases decided after January 1, 2019:\n' +
      '  Burt v. Lockheed Martin Corp., 2024 V.I. 33.\n\n' +
      'Supreme Court (V.I.) and Superior Court (V.I. Super. Ct.): Cite to V.I.\n' +
      'District Court (D.V.I.): Cite to F. Supp., F. Supp. 2d, or F. Supp. 3d.\n\n' +
      'Statutory compilation: V.I. Code Ann. tit. x, § x-x (year)\n' +
      'Session laws: [year] V.I. Sess. Laws [page no.]',
    examples: [
      'Burt v. Lockheed Martin Corp., 2024 V.I. 33.',
      'V.I. Code Ann. tit. 14, § 922 (2024).',
    ],
    references: ['T1.4', 'R. 10.3.3'],
  },
  'T1.5': {
    title: 'Tribal Nations',
    explanation:
      'T1.5 lists all 574 federally recognized Tribal Nations. Before citing tribal materials, check whether the Tribal Nation has its own citation format (see R. 22.1).\n\n' +
      'For Tribal Nations with established citation formats (R. 22.1), cite according to their rules. For Tribal Nations without established citation formats (R. 22.2), use the general framework:\n' +
      '  Constitutions: [Tribal Nation] Const. art. x, § x\n' +
      '  Codes: [Tribal Nation] Code tit. x, § x (year)\n' +
      '  Cases: [Case name], No. [docket no.] ([Tribal court] [date])\n\n' +
      'Notable Tribal Nations with established citation systems include: Cherokee Nation, Chickasaw Nation, Choctaw Nation of Oklahoma, Muscogee (Creek) Nation, Navajo Nation, Seminole Nation of Oklahoma, among others.',
    references: ['R. 22', 'R. 22.1', 'R. 22.2', 'T1'],
  },
  'T2': {
    title: 'Foreign Jurisdictions',
    explanation:
      'Table T2 provides citation conventions for foreign jurisdictions. It is the primary source for citing foreign cases (R. 20.3), constitutions (R. 20.4), statutes (R. 20.5), and other materials. ' +
      'T2 is now located online at legalbluebook.com.',
    references: ['R. 20'],
  },
  'T6': {
    title: 'Abbreviations',
    explanation:
      'Table T6 lists standard abbreviations for words commonly used in case names, institutional names, court documents, and other legal citations. ' +
      'In citation sentences, abbreviate all T6 words (R. 10.2.2). In textual sentences, only abbreviate the 8 words in R. 10.2.1(c). ' +
      'Common examples: "Association" → "Ass\'n", "Department" → "Dep\'t", "University" → "Univ.", "National" → "Nat\'l", "Corporation" → "Corp."',
    references: ['R. 10.2.2', 'R. 10.2.1(c)'],
  },
  'T7': {
    title: 'Court Names',
    explanation:
      'Table T7 provides abbreviations for court names used in citation parentheticals. Includes federal courts, state courts, and specialized courts. ' +
      'Used with R. 10.4 for court designation and R. 10.3.3 for public domain citations.',
    references: ['R. 10.4', 'R. 10.3.3'],
  },
  'T8': {
    title: 'Explanatory Phrases',
    explanation:
      'Table T8 lists abbreviated explanatory phrases used in case history: aff\'d, rev\'d, vacated, cert. denied, cert. granted, overruled by, superseded by statute, sub nom., etc. ' +
      'These phrases are italicized and appear between citations in prior/subsequent history (R. 10.7).',
    references: ['R. 10.7', 'R. 10.7.1'],
  },
  'T9': {
    title: 'Legislative Documents',
    explanation:
      'Table T9 provides abbreviations for legislative documents: S. (Senate), H.R. (House of Representatives), S. Rep. No., H.R. Rep. No., S. Con. Res., H.R.J. Res., etc. Used with R. 13.',
    references: ['R. 13'],
  },
  'T10': {
    title: 'Geographical Terms',
    explanation:
      'Table T10 provides standard abbreviations for U.S. states and territories (e.g., "California" → "Cal.", "New York" → "N.Y.", "Massachusetts" → "Mass.") ' +
      'and for countries/regions (e.g., "Australia" → "Austl.", "Canada" → "Can.", "Germany" → "Ger."). Used in case citations (R. 10.2.2), court designations (R. 10.4), and foreign materials (R. 20.1).',
    references: ['R. 10.2.2', 'R. 10.4', 'R. 20.1'],
  },
  'T11': {
    title: 'Judges and Officials',
    explanation:
      'Table T11 provides abbreviations for judges and officials: "Justice" → "J." (plural "JJ."), "Chief Justice" → "C.J.", "Judge" → "J.", "Commissioner" → "Comm\'r". ' +
      'Used in weight-of-authority parentheticals (R. 10.6.1).',
    references: ['R. 10.6.1', 'B9'],
  },
  'T12': {
    title: 'Months',
    explanation:
      'Table T12 abbreviates months with more than four letters: Jan., Feb., Mar., Apr., Aug., Sep., Oct., Nov., Dec. May, June, and July are not abbreviated.',
  },
  'T13': {
    title: 'Periodicals',
    explanation:
      'Table T13 provides abbreviations for legal and non-legal periodicals: law reviews, journals, and other publications. ' +
      'Used with R. 16 for periodical citations. For foreign periodicals, see R. 20.6.',
    references: ['R. 16', 'R. 20.6'],
  },
  'T14': {
    title: 'Services',
    explanation:
      'Table T14 provides abbreviations for commonly cited legal services. Largely replaced by T15 in the 21st edition.',
    references: ['T15', 'R. 19'],
  },
  'T15': {
    title: 'Services and Publishers',
    explanation:
      'Table T15 provides abbreviations for service titles and publisher names used in service citations (R. 19). ' +
      'Common publishers: CCH, BL (Bloomberg Law), West, RIA, Envtl. Law Inst.',
    references: ['R. 19', 'R. 19.1'],
  },
  'T16': {
    title: 'Subdivisions',
    explanation:
      'Table T16 provides standard abbreviations for document subdivisions: article → art., section → §, clause → cl., amendment → amend., ' +
      'chapter → ch., paragraph → para./¶, preamble → pmbl., part → pt., schedule → sched., title → tit. ' +
      'Use §§ for multiple sections. Use "amends." for multiple amendments.',
    references: ['R. 3.3', 'R. 11'],
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
  'R. 6.2(c)': {
    title: 'Section and Paragraph Symbol Spacing',
    explanation: 'Always insert a space between a section (§) or paragraph (¶) symbol and the following number. Use "§§" or "¶¶" for multiple sections/paragraphs (no space between the doubled symbols). Never use "§ §" or "¶ ¶" with a space between them.',
    examples: [
      '§ 1983 (correct)',
      '§1983 (incorrect — missing space)',
      '§§ 1981–1983 (correct)',
      '§§1981–1983 (incorrect — missing space)',
    ],
    tips: [
      'The space after § or ¶ is one of the most frequently checked formatting rules.',
      'Double symbols (§§, ¶¶) are closed up with no space between them.',
    ],
    commonMistakes: [
      'Forgetting the space after § or ¶.',
      'Writing "§ §" with a space between consecutive section symbols.',
    ],
  },
  'R. 12.3.1(d)': {
    title: 'Publisher Information for Unofficial Codes',
    explanation: 'Unofficial code citations (U.S.C.A., U.S.C.S., and annotated state codes) must include the publisher name in the parenthetical. Even when no year is given, the publisher must still appear.',
    examples: [
      '42 U.S.C.A. § 1983 (West 2020).',
      '42 U.S.C.S. § 1983 (LexisNexis 2020).',
    ],
    tips: [
      'U.S.C.A. is published by West; U.S.C.S. is published by LexisNexis.',
      'Even without a year, unofficial codes need the publisher: "(West)" or "(LexisNexis)".',
    ],
  },
  'R. 12.3.1(e)': {
    title: 'Supplement Citations',
    explanation: '"Supplement" must be abbreviated as "Supp." in citations. It appears before the year in the parenthetical, optionally after the publisher name.',
    examples: [
      '42 U.S.C. § 1397b (Supp. V 2017).',
      '42 U.S.C.A. § 1983 (West Supp. 2020).',
    ],
    tips: [
      '"Supp." goes BEFORE the year, not after.',
      'Include the supplement volume number when applicable: "Supp. V".',
    ],
    commonMistakes: [
      'Writing "Supplement" instead of "Supp."',
      'Placing "Supp." after the year: "(2020 Supp.)" instead of "(Supp. 2020)".',
    ],
  },
  'R. 14.5.1': {
    title: 'Treasury Regulations and IRS Materials',
    explanation: 'Treasury Regulations are cited as "Treas. Reg. § [section] ([year])". Revenue Rulings use "Rev. Rul." and Revenue Procedures use "Rev. Proc." The Internal Revenue Code may be cited as "I.R.C. § [section]" or "26 U.S.C. § [section]".',
    examples: [
      'Treas. Reg. § 1.61-1 (2024).',
      'Rev. Rul. 99-7, 1999-1 C.B. 361.',
      'I.R.C. § 501(c)(3).',
    ],
    tips: [
      'Subsections in I.R.C. citations are parenthesized with no spaces: "§ 501(c)(3)" not "§ 501 (c)(3)".',
      'Practitioners may omit the year for current Treasury Regulations.',
    ],
    commonMistakes: [
      'Writing "Treasury Regulation" instead of "Treas. Reg."',
      'Omitting the § symbol in I.R.C. or Treas. Reg. citations.',
      'Adding a space before subsection parentheses: "§ 501 (c)(3)" instead of "§ 501(c)(3)".',
    ],
  },
  'B12.1.3': {
    title: 'Procedural and Court Rules (Bluepages)',
    explanation: 'Federal procedural rules use specific abbreviations: Fed. R. Civ. P., Fed. R. Crim. P., Fed. R. Evid., Fed. R. App. P. Current rules are cited without a date. Court-specific rules use the court abbreviation followed by "R." and the rule number.',
    examples: [
      'Fed. R. Civ. P. 12(b)(6).',
      'Fed. R. Evid. 702.',
      '8th Cir. R. 27B.',
      'S.D.N.Y. R. 56.1.',
    ],
    tips: [
      'Current rules have NO date — only include a date for rules no longer in force.',
      'Do NOT use "supra" or "hereinafter" for procedural rules.',
      'Common wrong abbreviations: "F.R.C.P." (should be "Fed. R. Civ. P."), "F.R.E." (should be "Fed. R. Evid.").',
      'Rule subdivisions immediately follow the number with no space: "12(b)(6)" not "12 (b)(6)".',
    ],
    commonMistakes: [
      'Using incorrect abbreviations like "F.R.C.P." instead of "Fed. R. Civ. P."',
      'Including a year for current rules.',
      'Using "supra" for procedural rules.',
      'Adding a space before rule subdivisions.',
    ],
  },
};
