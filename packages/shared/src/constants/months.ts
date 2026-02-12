/**
 * T12 — Month Abbreviations
 * In citations, abbreviate month names as follows.
 * May, June, and July are NOT abbreviated.
 */
export const T12_MONTHS: Record<string, string> = {
  'January': 'Jan.',
  'February': 'Feb.',
  'March': 'Mar.',
  'April': 'Apr.',
  'May': 'May',
  'June': 'June',
  'July': 'July',
  'August': 'Aug.',
  'September': 'Sep.',
  'October': 'Oct.',
  'November': 'Nov.',
  'December': 'Dec.',
};

/** Months that should NOT be abbreviated */
export const UNABBREVIATED_MONTHS = new Set(['May', 'June', 'July']);
