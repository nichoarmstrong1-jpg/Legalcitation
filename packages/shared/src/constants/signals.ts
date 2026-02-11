/**
 * Bluebook Rules 1.2–1.6 — Citation Signals
 * Signals indicate the relationship between a cited authority and the proposition.
 */

export interface SignalInfo {
  signal: string;
  meaning: string;
  order: number;
  italicized: boolean;
}

export const SIGNALS: SignalInfo[] = [
  { signal: '[no signal]', meaning: 'Authority directly states the proposition', order: 0, italicized: false },
  { signal: 'e.g.,', meaning: 'Cited authority is one of many that state the proposition', order: 1, italicized: true },
  { signal: 'accord', meaning: 'Other authorities agree with the cited authority', order: 2, italicized: true },
  { signal: 'see', meaning: 'Authority clearly supports the proposition but not directly', order: 3, italicized: true },
  { signal: 'see also', meaning: 'Additional authority supports the proposition', order: 4, italicized: true },
  { signal: 'cf.', meaning: 'Analogous authority supports by analogy', order: 5, italicized: true },
  { signal: 'compare', meaning: 'Comparison of authorities leads to the stated proposition', order: 6, italicized: true },
  { signal: 'contra', meaning: 'Authority directly contradicts the proposition', order: 7, italicized: true },
  { signal: 'but see', meaning: 'Authority clearly contradicts though not directly', order: 8, italicized: true },
  { signal: 'but cf.', meaning: 'Analogous authority contradicts by analogy', order: 9, italicized: true },
  { signal: 'see generally', meaning: 'Authority provides helpful background', order: 10, italicized: true },
];

/** Quick lookup of valid signal strings */
export const VALID_SIGNALS = new Set(SIGNALS.map(s => s.signal));
