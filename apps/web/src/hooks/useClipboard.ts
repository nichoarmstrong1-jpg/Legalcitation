import { useState, useCallback } from 'react';

type FormatStyle = 'italics' | 'underline';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copyRichText = useCallback(async (text: string, format: FormatStyle = 'italics') => {
    try {
      const tag = format === 'italics' ? 'i' : 'u';
      const html = text.replace(/\*([^*]+)\*/g, `<${tag}>$1</${tag}>`);
      const plain = text.replace(/\*([^*]+)\*/g, '$1');

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const plainBlob = new Blob([plain], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': plainBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const plain = text.replace(/\*([^*]+)\*/g, '$1');
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return { copied, copyRichText };
}
