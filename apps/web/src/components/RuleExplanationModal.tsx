const RULE_EXPLANATIONS: Record<string, { title: string; explanation: string; examples?: string[] }> = {
  'R. 3.2': { title: 'Pincites and Page Ranges', explanation: 'When citing specific pages, provide a pincite after the first page. For 3+ digit page ranges, drop repetitious digits except the final two.' , examples: ['102–06', '199 n.4'] },
  'R. 3.2(a)': { title: 'Page Range Abbreviation', explanation: 'Drop repetitious digits but retain at least the last two digits.', examples: ['102–06 (not 102–106)', '1020–30'] },
  'R. 4.1': { title: 'Id. (Short Form)', explanation: '"Id." refers to the immediately preceding cited authority. Capitalize when starting a citation sentence.', examples: ['Id.', 'Id. at 405.'] },
  'R. 4.2': { title: 'Supra', explanation: '"Supra" is for secondary sources only — not cases or statutes.', examples: ['Smith, supra note 5, at 100.'] },
  'R. 6.1(a)': { title: 'Abbreviation Spacing', explanation: 'Adjacent single capitals: no space (S.D.N.Y.). Single capital + longer abbreviation: space (D. Mass.).', examples: ['S.D.N.Y.', 'D. Mass.', 'F.2d'] },
  'R. 6.2(b)': { title: 'Ordinals', explanation: 'Use "2d" not "2nd" and "3d" not "3rd" in legal citations.', examples: ['2d Cir.', 'F.3d'] },
  'R. 10': { title: 'Cases (General)', explanation: 'A full case citation: case name, reporter, court and year parenthetical, optional parentheticals, subsequent history.' },
  'R. 10.2.1(a)': { title: 'Multiple Parties', explanation: 'Cite only the first party on each side. Omit "et al."', examples: ['Kant v. Bentham'] },
  'R. 10.2.1(b)': { title: 'Procedural Phrases', explanation: '"In the matter of" → "In re"; "on behalf of" → "ex rel."' },
  'R. 10.2.1(c)': { title: 'Textual Abbreviations', explanation: 'In text, abbreviate only: &, Ass\'n, Bros., Co., Corp., Inc., Ltd., No.' },
  'R. 10.2.1(d)': { title: 'Leading "The"', explanation: 'Omit "The" at the start of a party name.' },
  'R. 10.2.1(e)': { title: 'Descriptive Terms', explanation: 'Omit "Administrator," "Executor," etc. after a named party.' },
  'R. 10.2.1(f)': { title: 'Geographic Terms', explanation: 'Omit "State of," "Commonwealth of," "of America."' },
  'R. 10.2.1(g)': { title: 'Given Names', explanation: 'Omit first names of individuals.' },
  'R. 10.2.1(h)': { title: 'Business Designations', explanation: 'Omit "Inc." if the name already has "Co." or "Corp."' },
  'R. 10.2.2': { title: 'Citation Abbreviations', explanation: 'In citations, abbreviate all T6 words. Never abbreviate "United States" as a party.' },
  'R. 10.2.2 / T6': { title: 'Table T6', explanation: 'Abbreviate all words listed in Table T6 in citation sentences.' },
  'R. 10.2.2 / T10': { title: 'Table T10', explanation: 'Abbreviate state names per T10 unless the state is the entire party.' },
  'R. 10.3 / T1': { title: 'Reporters', explanation: 'Use the correct reporter abbreviation from Table T1.' },
  'R. 10.3.2': { title: 'Reporter Format', explanation: 'Must include valid volume, reporter abbreviation, and starting page.' },
  'R. 10.4': { title: 'Court Designation', explanation: 'Include court in the parenthetical. SCOTUS in U.S. Reports needs no court.' },
  'R. 10.4(a)': { title: 'Federal Courts', explanation: 'Circuits: "9th Cir.", "2d Cir." Districts: "S.D.N.Y.", "D. Mass."' },
  'R. 10.5': { title: 'Date/Year', explanation: 'Year in parenthetical. Full date for electronic/unreported cases.' },
  'R. 10.5(b)': { title: 'Electronic Source Dates', explanation: 'Full date required for Westlaw/LEXIS cases.' },
  'R. 10.9': { title: 'Short Form Cases', explanation: 'Use "[Party], [Vol] [Rep] at [Page]" within 5 citations of the full cite.' },
  'Indigo R11': { title: 'Indigo: Case Names', explanation: 'Italicize/underline case names. Use "v." not "versus." Comma before volume.' },
  'Indigo R12': { title: 'Indigo: Reporters', explanation: 'Include pincite when quoting. Repeat first page if it is the pincite.' },
  'Indigo R15': { title: 'Indigo: Court/Year', explanation: 'Every citation must include the year.' },
};

interface RuleExplanationModalProps {
  ruleKey: string;
  onClose: () => void;
}

export function RuleExplanationModal({ ruleKey, onClose }: RuleExplanationModalProps) {
  const rule = RULE_EXPLANATIONS[ruleKey];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal max-w-md w-full p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg font-semibold">{ruleKey}</span>
            <h3 className="text-lg font-semibold mt-2 text-primary-900">{rule?.title || ruleKey}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-xl transition-all text-xl">
            &times;
          </button>
        </div>

        {rule ? (
          <>
            <p className="text-sm text-surface-600 leading-relaxed">{rule.explanation}</p>
            {rule.examples && rule.examples.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wider">Examples:</div>
                <div className="space-y-1.5">
                  {rule.examples.map((ex, i) => (
                    <div key={i} className="text-sm font-mono bg-surface-50 px-4 py-2 rounded-xl text-surface-700">{ex}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-surface-500">No detailed explanation available for this rule. Consult the Bluebook (21st ed.) for full guidance.</p>
        )}

        <button onClick={onClose} className="btn-primary w-full mt-6">Close</button>
      </div>
    </div>
  );
}
