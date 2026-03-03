import { useState } from 'react';
import { ExternalLink, Copy, Check, MoreHorizontal } from 'lucide-react';
import type { CitationTypeConfig } from '@legalcitation/shared';
import { TypeIcon } from './TypeIcon.tsx';

export interface CitationResult {
  id: number;
  citation: string;
  confidence: number;
  type: CitationTypeConfig;
  sourceUrl: string | null;
  inputUsed: string;
  inputMode: 'search' | 'url' | 'manual';
  timestamp: Date;
  components: Record<string, string>;
  shortForm: string | null;
  footnote: string;
  missingFields: string[];
}

interface CitationResultCardProps {
  result: CitationResult;
  activeTab: 'cite' | 'shortform' | 'note';
  onTabChange: (tab: 'cite' | 'shortform' | 'note') => void;
  onCopy: (text: string) => void;
  onEditFields: () => void;
}

function extractTitle(citation: string): string {
  const italicMatch = citation.match(/\*([^*]+)\*/);
  if (italicMatch) return italicMatch[1];
  const commaIndex = citation.indexOf(',');
  if (commaIndex > 0 && commaIndex < 80) return citation.slice(0, commaIndex);
  return citation.slice(0, 60) + (citation.length > 60 ? '...' : '');
}

export function CitationResultCard({ result, activeTab, onTabChange, onCopy, onEditFields }: CitationResultCardProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (text: string, tab: string) => {
    onCopy(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 1500);
  };

  const title = extractTitle(result.citation);
  const confidencePercent = Math.round(result.confidence * 100);

  const tabs = [
    { key: 'cite' as const, label: 'Cite' },
    { key: 'shortform' as const, label: 'Short Form' },
    { key: 'note' as const, label: 'Footnote' },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'cite':
        return result.citation;
      case 'shortform':
        return result.shortForm || 'Short form not available for this citation type.';
      case 'note':
        return result.footnote || result.citation;
    }
  };

  const tabContent = getTabContent();

  return (
    <div className="mt-5 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* "Just cited" badge */}
      <div className="flex justify-center">
        <div className="px-4 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-b-lg">
          Just cited
        </div>
      </div>

      <div className="p-5">
        {/* Title + type */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 leading-snug">{title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <TypeIcon iconName={result.type.icon} size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">{result.type.label}</span>
          </div>
        </div>

        {/* Action pills row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {result.sourceUrl && (
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ExternalLink size={12} />
              Source
            </a>
          )}
          <button
            onClick={onEditFields}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
          <button
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            title="More options"
          >
            <MoreHorizontal size={14} />
          </button>
          <div className="ml-auto">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              confidencePercent >= 80 ? 'bg-green-100 text-green-700' :
              confidencePercent >= 50 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {confidencePercent}%
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-3 bg-gray-50 rounded-xl min-h-[60px]">
          <div className="font-serif text-sm leading-relaxed text-gray-800 italic whitespace-pre-wrap">
            {tabContent}
          </div>
        </div>

        {/* Copy button */}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => handleCopy(tabContent, activeTab)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {copiedTab === activeTab ? (
              <>
                <Check size={14} className="text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy to clipboard
              </>
            )}
          </button>
        </div>

        {/* More citation options link */}
        <div className="mt-3 text-center">
          <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
            More citation options
          </button>
        </div>
      </div>
    </div>
  );
}
