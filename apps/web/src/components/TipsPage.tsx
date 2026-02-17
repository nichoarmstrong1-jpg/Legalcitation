import { useState, useMemo } from 'react';
import { X, BookOpen, Scale, FileText, Hash, Bookmark, AlertCircle, Search } from 'lucide-react';
import { lookupJournal, JOURNAL_ABBREVIATIONS } from '@legalcitation/shared';

interface TipsPageProps {
  onClose: () => void;
}

interface TipSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  tips: { rule: string; title: string; content: string; example?: string }[];
}

const SECTIONS: TipSection[] = [
  {
    id: 'cases',
    title: 'Case Citations (R. 10)',
    icon: <Scale className="w-4 h-4" />,
    tips: [
      {
        rule: 'R. 10.2.1',
        title: 'Case Names',
        content:
          'Italicize the full case name, including "v." Abbreviate words like "Corporation" (Corp.), "Association" (Ass\'n), and "International" (Int\'l) per T6. Omit given names of individuals. For "United States," abbreviate to "U.S." only as a reporter or when it appears as a respondent/defendant — spell it out when it is the first-listed party.',
        example: '*Roe v. Wade*, 410 U.S. 113 (1973).',
      },
      {
        rule: 'R. 10.3 / T1',
        title: 'Reporters & Volume',
        content:
          'Cite to the official reporter if available. For U.S. Supreme Court cases, cite to U.S. Reports (U.S.), not S. Ct. or L. Ed. For federal circuit courts, cite to F.2d, F.3d, or F.4th. For federal district courts, cite to F. Supp., F. Supp. 2d, or F. Supp. 3d. See Table T1 for the correct reporter for each jurisdiction.',
        example: '*Brown v. Bd. of Educ.*, 347 U.S. 483 (1954).',
      },
      {
        rule: 'R. 10.4 / T7',
        title: 'Court Designation',
        content:
          'Include the court in parentheses before the year unless the reporter unambiguously identifies the court. U.S. Reports (U.S.) implies the Supreme Court, so omit the court. For circuit courts, abbreviate per T7: (2d Cir.), (9th Cir.), etc. For state courts, include the state abbreviation if the reporter covers multiple states.',
        example: '*Smith v. Jones*, 500 F.3d 200 (2d Cir. 2007).',
      },
      {
        rule: 'R. 10.5',
        title: 'Date / Year',
        content:
          'Include only the year of decision in parentheses for cases. For slip opinions and cases not yet in a reporter, include the full date (month, day, year). Use the date of the most recent majority opinion if there are multiple opinions.',
      },
      {
        rule: 'R. 3.2(a)',
        title: 'Pinpoint Citations',
        content:
          'A pinpoint (or "jump") cite identifies the specific page(s) where the cited material appears. Place the pinpoint page after the first page of the case, separated by a comma and space. For multiple pages, use an en dash (not a hyphen): 483, 490–93. Retain the last two digits: 1250–53 (not 1250–3).',
        example: '*Brown*, 347 U.S. at 490–93.',
      },
    ],
  },
  {
    id: 'statutes',
    title: 'Statutes (R. 12)',
    icon: <FileText className="w-4 h-4" />,
    tips: [
      {
        rule: 'R. 12.3',
        title: 'Federal Statutes',
        content:
          'Cite the current official code (U.S.C.) by title number, code abbreviation, section symbol, and section number. Include the year of the code edition in parentheses only if citing a specific edition. Use "§" (section symbol), not "sec." or "section." For multiple sections, use "§§" with an en dash.',
        example: '42 U.S.C. § 1983 (2018).',
      },
      {
        rule: 'R. 12.3 / T1',
        title: 'State Statutes',
        content:
          'Use the abbreviation for each state code found in T1. State code citations vary widely in format — always check T1 for the specific state. Include the publisher name in parentheses if citing an unofficial code (e.g., West or LexisNexis).',
        example: 'Cal. Civ. Code § 1542 (West 2024).',
      },
      {
        rule: 'R. 12.2',
        title: 'Session Laws',
        content:
          'When a statute has not yet been codified, cite the session law. Include the act name (if commonly known), public law number, section, Statutes at Large volume and page, and year.',
        example: 'Bipartisan Campaign Reform Act of 2002, Pub. L. No. 107-155, 116 Stat. 81.',
      },
    ],
  },
  {
    id: 'constitutions',
    title: 'Constitutions (R. 11)',
    icon: <BookOpen className="w-4 h-4" />,
    tips: [
      {
        rule: 'R. 11',
        title: 'U.S. Constitution',
        content:
          'Cite as: U.S. Const. [subdivision]. Abbreviate "amendment" as "amend.," "section" as "§," "clause" as "cl.," and "article" as "art." Do not include a date unless the provision has been repealed or superseded.',
        example: 'U.S. Const. amend. XIV, § 1.',
      },
      {
        rule: 'R. 11',
        title: 'State Constitutions',
        content:
          'Use the state abbreviation from T6, followed by "Const." and the relevant subdivision. For currently effective provisions, do not include a date.',
        example: 'Cal. Const. art. I, § 7.',
      },
    ],
  },
  {
    id: 'short-forms',
    title: 'Short Form Citations (R. 4)',
    icon: <Hash className="w-4 h-4" />,
    tips: [
      {
        rule: 'R. 4.1',
        title: 'Id.',
        content:
          '"Id." refers to the immediately preceding cited authority. It can ONLY be used when the preceding citation cites just one source (no string citations). Italicize "Id." Always capitalize "Id." at the start of a citation sentence. For a different page in the same source, use "Id. at [page]."',
        example: '*Id.* at 495.',
      },
      {
        rule: 'R. 4.1',
        title: 'Short Case Form',
        content:
          'After a full citation, use one party name (typically the first non-governmental party), the volume, reporter, and "at" with the pinpoint page. Do not include the year or court. The party name should be italicized.',
        example: '*Brown*, 347 U.S. at 490.',
      },
      {
        rule: 'R. 4.2',
        title: 'Supra',
        content:
          '"Supra" refers back to a previously cited secondary source (books, articles, reports). It CANNOT be used for cases, statutes, constitutions, or regulations. Format: [Author], supra note [N], at [page].',
        example: 'Chemerinsky, *supra* note 12, at 450.',
      },
      {
        rule: 'R. 4.2',
        title: 'Hereinafter',
        content:
          'Use "[hereinafter Author]" in the first citation to a source with a long or cumbersome title. Then use the shortened name in subsequent "supra" references.',
        example:
          'First cite: ... [hereinafter Task Force Report]. Later: Task Force Report, *supra* note 5, at 30.',
      },
    ],
  },
  {
    id: 'signals',
    title: 'Signals (R. 1.2)',
    icon: <Bookmark className="w-4 h-4" />,
    tips: [
      {
        rule: 'R. 1.2',
        title: 'No Signal',
        content:
          'Use no signal when the authority directly states the proposition. This is the strongest form of support.',
      },
      {
        rule: 'R. 1.2',
        title: 'See',
        content:
          '"See" means the authority clearly supports the proposition but does not directly state it. This is the most common signal. Italicize it.',
      },
      {
        rule: 'R. 1.2',
        title: 'See also / Cf.',
        content:
          '"See also" provides additional support beyond sources already cited. "Cf." supports by analogy. Both REQUIRE explanatory parentheticals — omitting them is an error.',
      },
      {
        rule: 'R. 1.2',
        title: 'Contra / But see',
        content:
          '"Contra" means the authority directly contradicts the proposition. "But see" means the authority clearly supports a contrary proposition. Use these to present opposing authority.',
      },
    ],
  },
  {
    id: 'journal-lookup',
    title: 'Journal Abbreviations',
    icon: <Search className="w-4 h-4" />,
    tips: [
      {
        rule: 'T13 / T6',
        title: 'Journal Abbreviation Lookup',
        content:
          'Use the search tool below to look up the correct Bluebook abbreviation for any law journal, review, or periodical. Enter the full journal name or its abbreviation to find the match. Abbreviations follow Tables T13 (institutional names) and T6 (word-level abbreviations).',
      },
    ],
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes',
    icon: <AlertCircle className="w-4 h-4" />,
    tips: [
      {
        rule: 'R. 6.1',
        title: 'Abbreviations',
        content:
          'Always abbreviate words in case names per T6 when the case name appears in a citation (not in text). Common abbreviations: Corp., Inc., Ass\'n, Dep\'t, Gov\'t, Nat\'l, Int\'l, Univ., Bd., Comm\'n, Auth.',
      },
      {
        rule: 'R. 10.2.1(g)',
        title: 'First Party Listed',
        content:
          'Omit "The" when it begins a party name. Omit "et al." Omit "of America" after "United States." Only use the first-listed plaintiff and first-listed defendant.',
      },
      {
        rule: 'R. 3.2',
        title: 'Page Ranges',
        content:
          'Always retain the last two digits of page ranges: 1250–53 (not 1250–3). Use an en dash (–), not a hyphen (-), between page numbers. For non-consecutive pages, separate with a comma: 150, 155.',
      },
      {
        rule: 'R. 6.2(a)',
        title: 'Spacing in Abbreviations',
        content:
          'Close up adjacent single capitals: U.S., F.2d, S.W.2d. But add a space when one element is not a single capital: S. Ct., F. Supp. 3d, D. Mass. This is one of the most commonly violated spacing rules.',
      },
      {
        rule: 'R. 1.1',
        title: 'Citation Sentences',
        content:
          'A citation sentence begins with a capital letter and ends with a period. Each citation within a citation sentence is separated by a semicolon. Do not mix citations into the grammatical text of a sentence — use footnotes (law review) or separate citation sentences (practitioner).',
      },
    ],
  },
];

export function TipsPage({ onClose }: TipsPageProps) {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [journalInput, setJournalInput] = useState('');

  const section = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

  const journalResult = useMemo(() => {
    if (journalInput.trim().length < 2) return null;
    return lookupJournal(journalInput.trim());
  }, [journalInput]);

  const journalBrowseMatches = useMemo(() => {
    if (journalInput.trim().length < 2) return [];
    const lower = journalInput.trim().toLowerCase();
    return Object.entries(JOURNAL_ABBREVIATIONS)
      .filter(([full, abbr]) => full.toLowerCase().includes(lower) || abbr.toLowerCase().includes(lower))
      .slice(0, 12);
  }, [journalInput]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-elevated max-w-3xl w-full max-h-[85vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary-900">Bluebook Quick Reference</h2>
              <p className="text-xs text-surface-400">Based on the Bluebook 22nd Edition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 py-3 border-b border-surface-100 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                activeSection === s.id
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-surface-400 hover:text-surface-600 hover:bg-surface-50'
              }`}
            >
              {s.icon}
              {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {section.tips.map((tip, i) => (
              <div
                key={i}
                className="rounded-xl border border-surface-200 p-4 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-primary-900">{tip.title}</h3>
                  <span className="shrink-0 text-[10px] font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                    {tip.rule}
                  </span>
                </div>
                <p className="text-xs text-surface-600 leading-relaxed">{tip.content}</p>
                {tip.example && (
                  <div className="mt-3 px-3 py-2 bg-surface-50 rounded-lg border border-surface-100">
                    <div className="text-[10px] text-surface-400 font-medium uppercase tracking-wider mb-1">
                      Example
                    </div>
                    <p className="text-xs font-serif text-primary-900">{tip.example}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Interactive journal lookup tool */}
            {activeSection === 'journal-lookup' && (
              <div className="rounded-xl border border-primary-200 p-5 bg-primary-50/30">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    value={journalInput}
                    onChange={(e) => setJournalInput(e.target.value)}
                    placeholder="Enter a journal name or abbreviation..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 bg-white transition-all"
                  />
                </div>

                {journalResult && (
                  <div className="mb-4 p-4 bg-white rounded-xl border border-primary-100">
                    <div className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Result</div>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-surface-500 w-24 shrink-0">Full Name:</span>
                        <span className="text-xs font-medium text-primary-900">{journalResult.fullName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-surface-500 w-24 shrink-0">Abbreviation:</span>
                        <span className="text-xs font-mono font-semibold text-primary-700">{journalResult.abbreviation}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-surface-500 w-24 shrink-0">Source:</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          journalResult.source === 'known'
                            ? 'bg-verified-100 text-verified-700'
                            : journalResult.source === 'T13'
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-warning-100 text-warning-700'
                        }`}>
                          {journalResult.source === 'known' ? 'Known (T13)' : journalResult.source === 'T13' ? 'T13 Match' : 'T6 Generated'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {journalBrowseMatches.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
                      Matching Journals ({journalBrowseMatches.length})
                    </div>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {journalBrowseMatches.map(([full, abbr], i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-surface-100 hover:border-primary-200 transition-colors">
                          <span className="text-xs text-primary-900">{full}</span>
                          <span className="text-[11px] text-surface-500 font-mono shrink-0 ml-3">{abbr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {journalInput.trim().length >= 2 && journalBrowseMatches.length === 0 && !journalResult && (
                  <div className="text-xs text-surface-500 text-center py-3">
                    No matching journals found. The abbreviation will be generated from T6 word-level rules.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-100 text-center">
          <p className="text-[10px] text-surface-400">
            This is a quick reference guide. For complete rules, consult the Bluebook 21st Edition.
          </p>
        </div>
      </div>
    </div>
  );
}
