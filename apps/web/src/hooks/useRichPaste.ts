import { useCallback } from 'react';

/**
 * Convert pasted HTML with italic/underline formatting into plain text
 * with *asterisk* markers that the citation parser can recognize.
 *
 * This preserves italic/underline information when users paste from
 * Word, Google Docs, or other rich text editors.
 */
function htmlToMarkedText(html: string): string {
  let text = html;

  // Remove <style> and <script> blocks entirely (content + tags)
  // This prevents CSS like "p.p1 {margin: ...}" from leaking into the text
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove HTML comments (some rich text sources include these)
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove <head> block entirely (meta tags, title, linked stylesheets)
  text = text.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');

  // Handle <em> and <i> tags (italic)
  text = text.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  // Handle <u> tags (underline)
  text = text.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '*$1*');

  // Handle spans with font-style: italic or text-decoration: underline
  // Covers inline styles where font-style may not be the first property
  text = text.replace(/<span\b[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');
  text = text.replace(/<span\b[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');

  // Word-specific: handle mso-bidi-font-style:italic and MsoItalic class
  text = text.replace(/<span\b[^>]*style="[^"]*mso-bidi-font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');
  text = text.replace(/<span\b[^>]*class="[^"]*MsoItalic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');

  // Word-specific: handle <i> nested inside <span> or other containers (already handled above)
  // Handle Word's text-decoration in style attribute more broadly
  text = text.replace(/<span\b[^>]*style="[^"]*text-decoration:\s*[^"]*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');

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

/**
 * Hook that provides a paste event handler which preserves
 * italic/underline formatting from rich text sources (Word, Google Docs, etc.)
 * by converting them to *asterisk* markers the citation parser understands.
 *
 * Usage:
 *   const handlePaste = useRichPaste(setText);
 *   <textarea onPaste={handlePaste} />
 */
export function useRichPaste(
  onText: (text: string) => void,
  afterPaste?: (text: string) => void
) {
  return useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text');

    if (html) {
      // Rich text paste — convert HTML formatting to markers
      e.preventDefault();
      const markedText = htmlToMarkedText(html);
      // If HTML conversion produced empty or garbage, fall back to plain text
      const textToUse = markedText.trim() ? markedText : (plainText || '');
      onText(textToUse);
      afterPaste?.(textToUse);
    }
    // If no HTML, let the default paste happen (plain text)
    // The afterPaste callback won't fire here — let the component
    // handle it in its existing onPaste handler
  }, [onText, afterPaste]);
}

export { htmlToMarkedText };
