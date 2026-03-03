import { Clock, Copy, Check, X } from 'lucide-react';
import { useState } from 'react';
import type { CitationResult } from './CitationResultCard.tsx';
import { TypeIcon } from './TypeIcon.tsx';

interface CitationHistoryProps {
  citations: CitationResult[];
  onSelect: (result: CitationResult) => void;
  onCopy: (citation: string) => void;
  onRemove: (id: number) => void;
}

function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function CitationHistory({ citations, onSelect, onCopy, onRemove }: CitationHistoryProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (citations.length < 2) return null;

  const handleCopy = (citation: string, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sortedCitations = [...citations].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Citation History</h3>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {citations.length} citations
        </span>
      </div>

      <div className="space-y-2">
        {sortedCitations.map(citation => {
          const domain = extractDomain(citation.sourceUrl);
          return (
            <button
              key={citation.id}
              onClick={() => onSelect(citation)}
              className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start gap-2.5">
                <TypeIcon iconName={citation.type.icon} size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-sm text-gray-800 italic line-clamp-2 leading-relaxed">
                    {citation.citation}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                    <span>{citation.type.label}</span>
                    <span>&middot;</span>
                    <span>{formatTime(citation.timestamp)}</span>
                    {domain && (
                      <>
                        <span>&middot;</span>
                        <span className="text-blue-500 hover:text-blue-700">{domain}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopy(citation.citation, citation.id, e)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy citation"
                  >
                    {copiedId === citation.id ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(citation.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from history"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
