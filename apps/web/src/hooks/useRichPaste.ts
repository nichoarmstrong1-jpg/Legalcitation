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

  // Handle <em> and <i> tags (italic)
  text = text.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  // Handle <u> tags (underline)
  text = text.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '*$1*');

  // Handle spans with font-style: italic or text-decoration: underline
  text = text.replace(/<span\b[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');
  text = text.replace(/<span\b[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');

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

    if (html) {
      // Rich text paste — convert HTML formatting to markers
      e.preventDefault();
      const markedText = htmlToMarkedText(html);
      onText(markedText);
      afterPaste?.(markedText);
    }
    // If no HTML, let the default paste happen (plain text)
    // The afterPaste callback won't fire here — let the component
    // handle it in its existing onPaste handler
  }, [onText, afterPaste]);
}

export { htmlToMarkedText };
