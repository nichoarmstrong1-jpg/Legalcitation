import type { FormatStyle } from '../types/citation.js';

/**
 * Convert markdown-style *italic* markers to HTML tags
 */
export function markdownToHtml(text: string, format: FormatStyle): string {
  const tag = format === 'italics' ? 'i' : 'u';
  return text.replace(/\*([^*]+)\*/g, `<${tag}>$1</${tag}>`);
}

/**
 * Strip markdown markers from text
 */
export function markdownToPlain(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1');
}

/**
 * Wrap a case name in markdown-style italics markers
 */
export function formatCaseName(name: string): string {
  return `*${name}*`;
}

/**
 * Build rich clipboard data for copy/paste into Word, Google Docs, etc.
 */
export function buildClipboardData(
  citation: string,
  format: FormatStyle
): { html: string; plain: string } {
  return {
    html: markdownToHtml(citation, format),
    plain: markdownToPlain(citation),
  };
}
