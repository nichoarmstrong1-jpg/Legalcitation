import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { CitationTypeConfig } from '@legalcitation/shared';
import { TypeIcon } from './TypeIcon.tsx';

interface ManualPanelProps {
  type: CitationTypeConfig;
  fields: Record<string, string>;
  onChange: (fields: Record<string, string>) => void;
  onCite: () => void;
  onClose: () => void;
  isProcessing: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  partyOne: 'First Party',
  partyTwo: 'Second Party',
  volume: 'Volume',
  reporter: 'Reporter',
  firstPage: 'First Page',
  year: 'Year',
  pinCite: 'Pinpoint Citation',
  court: 'Court',
  parallelCitations: 'Parallel Citations',
  subsequentHistory: 'Subsequent History',
  title: 'Title',
  code: 'Code',
  section: 'Section',
  supplement: 'Supplement',
  subsection: 'Subsection',
  jurisdiction: 'Jurisdiction',
  article_or_amendment: 'Article or Amendment',
  articleOrAmendment: 'Article or Amendment',
  clause: 'Clause',
  source: 'Source',
  author: 'Author',
  journal: 'Journal',
  lastPage: 'Last Page',
  doi: 'DOI',
  url: 'URL',
  pageOrSection: 'Page or Section',
  edition: 'Edition',
  publisher: 'Publisher',
  editor: 'Editor',
  translator: 'Translator',
  reportNumber: 'Report Number',
  series: 'Series',
  subject: 'Subject',
  comment: 'Comment',
  illustration: 'Illustration',
  documentType: 'Document Type',
  congress: 'Congress',
  session: 'Session',
  page: 'Page',
  committee: 'Committee',
  websiteName: 'Website Name',
  date: 'Date',
  lastVisited: 'Last Visited',
  archiveUrl: 'Archive URL',
  newspaper: 'Newspaper',
  institution: 'Institution',
  paperNumber: 'Paper Number',
  model: 'AI Model',
  promptDescription: 'Prompt Description',
  version: 'Version',
  onFileWith: 'On File With',
  platform: 'Platform',
  time: 'Time',
  content: 'Content',
  medium: 'Medium',
  caseName: 'Case Name',
  docketNumber: 'Docket Number',
  name: 'Treaty Name',
  parties: 'Parties',
  number: 'Number',
  handle: 'Handle',
};

function getFieldLabel(key: string): string {
  return FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

export function ManualPanel({ type, fields, onChange, onCite, onClose, isProcessing }: ManualPanelProps) {
  const [showOptional, setShowOptional] = useState(
    type.optionalFields.some(f => fields[f] && fields[f].length > 0)
  );

  const handleFieldChange = (key: string, value: string) => {
    onChange({ ...fields, [key]: value });
  };

  const hasRequiredFields = type.requiredFields.some(f => fields[f] && fields[f].trim().length > 0);

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <TypeIcon iconName={type.icon} size={18} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Manual {type.label} Citation
          </h3>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
            {type.bluebookRule}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5">
        {/* Required fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {type.requiredFields.map(field => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {getFieldLabel(field)} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fields[field] || ''}
                onChange={e => handleFieldChange(field, e.target.value)}
                placeholder={getFieldLabel(field)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
            </div>
          ))}
        </div>

        {/* Optional fields divider + fields */}
        {type.optionalFields.length > 0 && (
          <>
            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-gray-200" />
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="mx-3 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showOptional ? 'Hide' : 'Show'} Optional Fields
              </button>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            {showOptional && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {type.optionalFields.map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      {getFieldLabel(field)}
                    </label>
                    <input
                      type="text"
                      value={fields[field] || ''}
                      onChange={e => handleFieldChange(field, e.target.value)}
                      placeholder={getFieldLabel(field)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Generate button */}
        <div className="flex justify-end mt-5">
          <button
            onClick={onCite}
            disabled={!hasRequiredFields || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Citation'
            )}
          </button>
        </div>

        {/* Example format */}
        {type.examples.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Example Format
            </div>
            <div className="text-sm font-serif italic text-gray-600 leading-relaxed">
              {type.examples[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
