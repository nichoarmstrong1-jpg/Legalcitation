import type { FormatStyle, FormattingDirective } from '../types/citation.js';

/**
 * Convert markdown-style *italic* markers to HTML tags
 */
export function markdownToHtml(text: string, format: FormatStyle): string {
  if (format === 'small_caps') {
    return text.replace(/\*([^*]+)\*/g, '<span style="font-variant: small-caps">$1</span>');
  }
  const tag = format === 'italics' ? 'i' : 'u';
  return text.replace(/\*([^*]+)\*/g, `<${tag}>$1</${tag}>`);
}

/**
 * Convert FormattingDirective[] into an HTML string with appropriate tags.
 *
 * - 'italic' → <i>text</i>
 * - 'small_caps' → <span style="font-variant: small-caps">text</span>
 * - 'roman' → text (no wrapping)
 */
export function directivesToHtml(text: string, directives: FormattingDirective[]): string {
  if (directives.length === 0) return text;

  // Sort directives by start position
  const sorted = [...directives].sort((a, b) => a.start - b.start);
  let result = '';
  let lastEnd = 0;

  for (const directive of sorted) {
    // Add any text before this directive
    if (directive.start > lastEnd) {
      result += text.slice(lastEnd, directive.start);
    }

    const segment = text.slice(directive.start, directive.end);

    switch (directive.style) {
      case 'italic':
        result += `<i>${segment}</i>`;
        break;
      case 'small_caps':
        result += `<span style="font-variant: small-caps">${segment}</span>`;
        break;
      case 'roman':
        result += segment;
        break;
    }

    lastEnd = directive.end;
  }

  // Add any remaining text
  if (lastEnd < text.length) {
    result += text.slice(lastEnd);
  }

  return result;
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

/**
 * Convert pasted HTML with italic/underline formatting into plain text
 * with *asterisk* markers that the citation parser can recognize.
 *
 * This preserves italic/underline information when users paste from
 * Word, Google Docs, or other rich text editors.
 */
export function htmlToMarkedText(html: string): string {
  let text = html;

  // Remove <style> and <script> blocks entirely (content + tags)
  // This prevents CSS like "p.p1 {margin: ...}" from leaking into the text
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove <head> block entirely (meta tags, title, linked stylesheets)
  text = text.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');

  // Handle <em> and <i> tags (italic)
  text = text.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  // Handle <u> tags (underline)
  text = text.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '*$1*');

  // Handle spans with font-style: italic or text-decoration: underline
  text = text.replace(/<span\b[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');
  text = text.replace(/<span\b[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');

  // Convert paragraph and line break tags to newlines before stripping
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.slice(2, -1));
      return String.fromCharCode(code);
    });

  // Clean up duplicate markers from nested tags (e.g., **text** → *text*)
  text = text.replace(/\*{2,}([^*]+)\*{2,}/g, '*$1*');

  // Clean up excessive whitespace but preserve intentional newlines
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
