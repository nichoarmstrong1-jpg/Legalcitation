import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

interface ShortFormDisplayProps {
  shortForms: string[];
  formatStyle: 'italics' | 'underline';
}

export function ShortFormDisplay({ shortForms, formatStyle }: ShortFormDisplayProps) {
  const { showToast } = useToast();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const renderFormattedCitation = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const content = part.slice(1, -1);
        return formatStyle === 'italics'
          ? <em key={i} className="font-serif">{content}</em>
          : <u key={i}>{content}</u>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleCopy = useCallback(async (text: string, idx: number) => {
    const htmlContent = text.replace(/\*([^*]+)\*/g, (_match, content) => {
      return formatStyle === 'italics' ? `<em>${content}</em>` : `<u>${content}</u>`;
    });
    const plainText = text.replace(/\*([^*]+)\*/g, '$1');

    try {
      const blob = new Blob([`<html><body>${htmlContent}</body></html>`], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': textBlob,
        }),
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
      } catch {
        showToast('Could not copy — try selecting manually', 'error');
        return;
      }
    }

    setCopiedIdx(idx);
    showToast('Short form copied with formatting', 'success');
    setTimeout(() => setCopiedIdx(null), 2000);
  }, [formatStyle, showToast]);

  if (!shortForms || shortForms.length === 0) return null;

  return (
    <div className="card border border-surface-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Short Form Citations</span>
      </div>
      <div className="space-y-3">
        {shortForms.map((form, i) => (
          <div key={i} className="flex items-start justify-between gap-2 p-3 bg-surface-50 rounded-xl">
            <div className="font-serif text-sm leading-relaxed flex-1">
              {renderFormattedCitation(form)}
            </div>
            <button
              onClick={() => handleCopy(form, i)}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-200 transition-colors text-surface-400 hover:text-surface-600"
              title="Copy short form"
            >
              {copiedIdx === i ? (
                <Check className="w-3.5 h-3.5 text-verified-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-surface-400 mt-2">
        Use short forms after the first full citation to the same source. Replace bracketed pinpoint pages as needed.
      </p>
    </div>
  );
}
