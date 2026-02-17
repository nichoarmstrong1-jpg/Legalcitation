import { useState, useCallback } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, AlertTriangle, Lightbulb } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';
import type { ShortFormEntry, ShortFormSuggestion } from '@legalcitation/shared';

interface ShortFormDisplayProps {
  shortForms: (string | ShortFormEntry)[];
  formatStyle: 'italics' | 'underline';
  suggestions?: ShortFormSuggestion[];
}

export function ShortFormDisplay({ shortForms, formatStyle, suggestions }: ShortFormDisplayProps) {
  const { showToast } = useToast();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set([0]));

  const renderFormattedCitation = (text: string) => {
    const parts = text.split(/(\*[^*]+\*|_[^_]+_)/);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const content = part.slice(1, -1);
        return formatStyle === 'italics'
          ? <em key={i} className="font-serif">{content}</em>
          : <u key={i}>{content}</u>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        const content = part.slice(1, -1);
        return <u key={i}>{content}</u>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleCopy = useCallback(async (text: string, idx: number) => {
    let htmlContent = text.replace(/_([^_]+)_/g, '<u>$1</u>');
    htmlContent = htmlContent.replace(/\*([^*]+)\*/g, (_match, content) => {
      return formatStyle === 'italics' ? `<em>${content}</em>` : `<u>${content}</u>`;
    });
    const plainText = text.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');

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

  const toggleExpanded = (idx: number) => {
    setExpandedIdx(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (!shortForms || shortForms.length === 0) return null;

  // Normalize: support both plain strings and ShortFormEntry objects
  const entries: ShortFormEntry[] = shortForms.map((form, i) => {
    if (typeof form === 'string') {
      return {
        form,
        type: 'short_case' as const,
        label: `Short Form ${i + 1}`,
        whenToUse: '',
        whereToPlace: '',
      };
    }
    return form;
  });

  return (
    <div className="space-y-4">
      <div className="card border border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Short Form Citations</span>
        </div>

        <div className="space-y-3">
          {entries.map((entry, i) => {
            const isExpanded = expandedIdx.has(i);

            return (
              <div key={i} className="border border-surface-200 rounded-xl overflow-hidden">
                {/* Header row */}
                <div className="flex items-center justify-between p-3 bg-surface-50">
                  <button
                    onClick={() => toggleExpanded(i)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-primary-700">{entry.label}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(entry.form, i)}
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

                {/* Citation text */}
                <div className="px-4 py-3 bg-white">
                  <div className="font-serif text-sm leading-relaxed">
                    {renderFormattedCitation(entry.form)}
                  </div>
                </div>

                {/* Expanded guidance */}
                {isExpanded && (entry.whenToUse || entry.whereToPlace || entry.warnings) && (
                  <div className="px-4 pb-3 bg-white space-y-2.5">
                    {entry.whenToUse && (
                      <div>
                        <div className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">When to Use</div>
                        <p className="text-xs text-surface-600 leading-relaxed">{entry.whenToUse}</p>
                      </div>
                    )}

                    {entry.whereToPlace && (
                      <div>
                        <div className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Where to Place</div>
                        <p className="text-xs text-surface-600 leading-relaxed">{entry.whereToPlace}</p>
                      </div>
                    )}

                    {entry.warnings && entry.warnings.length > 0 && (
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="w-3 h-3 text-warning-600" />
                          <span className="text-[10px] font-bold text-warning-700 uppercase tracking-wider">Common Mistakes</span>
                        </div>
                        <ul className="space-y-1">
                          {entry.warnings.map((warning, wi) => (
                            <li key={wi} className="text-[11px] text-warning-700 leading-relaxed flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-warning-400 mt-1.5 shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Reference */}
        <div className="mt-4 p-3 bg-primary-50 border border-primary-100 rounded-xl">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-primary-600" />
            <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Quick Reference</span>
          </div>
          <div className="space-y-1.5 text-xs text-primary-700">
            <div className="flex items-start gap-2">
              <span className="font-semibold shrink-0">1st mention</span>
              <span className="text-primary-500">→</span>
              <span>Full citation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold shrink-0">Immediately after, same source</span>
              <span className="text-primary-500">→</span>
              <span>{renderFormattedCitation('*Id.*')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold shrink-0">Same source, different page</span>
              <span className="text-primary-500">→</span>
              <span>{renderFormattedCitation('*Id.* at [page]')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold shrink-0">After intervening citations</span>
              <span className="text-primary-500">→</span>
              <span>Short case form</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Changes in Paper */}
      {suggestions && suggestions.length > 0 && (
        <div className="card border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Suggested Changes in Your Paper</span>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-primary-100">
                <div className="text-xs text-surface-700 leading-relaxed mb-2">
                  {suggestion.contextSnippet}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md shrink-0">
                    Use:
                  </span>
                  <span className="font-serif text-sm text-surface-800">
                    {renderFormattedCitation(suggestion.suggestedForm)}
                  </span>
                </div>
                <p className="text-[11px] text-surface-500 mt-1.5 leading-relaxed">
                  {suggestion.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
