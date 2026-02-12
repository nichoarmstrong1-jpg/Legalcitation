/**
 * Bluebook B1.2, R. 1.2–1.4 — Citation Signals
 * Signals indicate the relationship between a cited authority and the proposition.
 */

export type SignalType = 'supportive' | 'comparative' | 'contradictory' | 'background';

export interface SignalInfo {
  signal: string;
  meaning: string;
  order: number;
  italicized: boolean;
  type: SignalType;
  requiresParenthetical: boolean;
}

export const SIGNALS: SignalInfo[] = [
  // ── Supportive signals (R. 1.2(a)) ──
  { signal: '[no signal]', meaning: 'Authority directly states the proposition, is the source of a quotation, or was mentioned in the proposition', order: 0, italicized: false, type: 'supportive', requiresParenthetical: false },
  { signal: 'e.g.,', meaning: 'Cited authority is one of many that state the proposition; other authorities also state the proposition but citation to them would not be helpful or is not necessary', order: 1, italicized: true, type: 'supportive', requiresParenthetical: false },
  { signal: 'accord', meaning: 'Other authorities agree with the cited authority; commonly used when two or more sources state or clearly support the proposition but the text quotes or refers to only one', order: 2, italicized: true, type: 'supportive', requiresParenthetical: false },
  { signal: 'see', meaning: 'Authority clearly supports the proposition but does not directly state it; there is an inferential step between the authority and the proposition', order: 3, italicized: true, type: 'supportive', requiresParenthetical: false },
  { signal: 'see also', meaning: 'Additional authority supports the proposition; used when supporting authorities have already been cited or discussed', order: 4, italicized: true, type: 'supportive', requiresParenthetical: true },
  { signal: 'cf.', meaning: 'Authority supports a proposition different from the main proposition but sufficiently analogous to lend support', order: 5, italicized: true, type: 'supportive', requiresParenthetical: true },

  // ── Comparative signals (R. 1.2(b)) ──
  { signal: 'compare', meaning: 'Comparison of the authorities cited will offer support for or illustrate the proposition; must be used with "with"', order: 6, italicized: true, type: 'comparative', requiresParenthetical: true },
  { signal: 'contrast', meaning: 'Contrast between the authorities cited will offer support for or illustrate the proposition; must be used with "with"', order: 7, italicized: true, type: 'comparative', requiresParenthetical: true },

  // ── Contradictory signals (R. 1.2(c)) ──
  { signal: 'contra', meaning: 'Authority directly states a proposition contrary to the main proposition', order: 8, italicized: true, type: 'contradictory', requiresParenthetical: false },
  { signal: 'but see', meaning: 'Authority clearly supports a proposition contrary to the main proposition', order: 9, italicized: true, type: 'contradictory', requiresParenthetical: false },
  { signal: 'but cf.', meaning: 'Authority supports a proposition analogous to the contrary of the main proposition', order: 10, italicized: true, type: 'contradictory', requiresParenthetical: true },

  // ── Background signals (R. 1.2(d)) ──
  { signal: 'see generally', meaning: 'Authority presents helpful background material related to the proposition', order: 11, italicized: true, type: 'background', requiresParenthetical: true },
];

/**
 * Compound signals: "e.g.," can be combined with other signals.
 * B1.2 / R. 1.2: "see, e.g.," and "but see, e.g.," are valid compound signals.
 */
export const COMPOUND_SIGNALS: SignalInfo[] = [
  { signal: 'see, e.g.,', meaning: 'Authority is one of many that clearly support the proposition', order: 3, italicized: true, type: 'supportive', requiresParenthetical: false },
  { signal: 'but see, e.g.,', meaning: 'Authority is one of many that clearly support a contrary proposition', order: 9, italicized: true, type: 'contradictory', requiresParenthetical: false },
];

/** All signals including compound forms */
export const ALL_SIGNALS = [...SIGNALS, ...COMPOUND_SIGNALS];

/** Quick lookup of valid signal strings (lowercase) */
export const VALID_SIGNALS = new Set(
  ALL_SIGNALS.filter(s => s.signal !== '[no signal]').map(s => s.signal.toLowerCase())
);

/** Map from signal string (lowercase) to SignalInfo */
export const SIGNAL_MAP = new Map<string, SignalInfo>(
  ALL_SIGNALS.filter(s => s.signal !== '[no signal]').map(s => [s.signal.toLowerCase(), s])
);

/**
 * R. 1.3: Ordering of signal types.
 * Signals of the same type are strung together in one citation sentence.
 * Signals of different types must be in separate citation sentences.
 * Order: supportive → comparative → contradictory → background.
 */
export const SIGNAL_TYPE_ORDER: Record<SignalType, number> = {
  supportive: 0,
  comparative: 1,
  contradictory: 2,
  background: 3,
};
