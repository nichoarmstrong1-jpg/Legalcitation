import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BookOpen, ChevronRight, FileText, Search, Copy, Check } from 'lucide-react';
import { searchCases, buildCitation, analyzeText, type AnalyzedCitation, type CaseSearchResult } from '../services/api.ts';
import { JOURNAL_ABBREVIATIONS } from '@legalcitation/shared';
import { FileUploader } from './FileUploader.tsx';
import { CitationGeneratingView } from './CitationGeneratingView.tsx';
import { CaseLibrary } from './CaseLibrary.tsx';
import { SourceViewer } from './SourceViewer.tsx';
import { FormattedCitation } from './FormattedCitation.tsx';
import { RichTextInput } from './RichTextInput.tsx';
import { trackEvent } from '../services/analytics.ts';

interface CitationBuilderProps {
  onResult: (result: AnalyzedCitation, input: string) => void;
  formatStyle: 'italics' | 'underline';
  restoredInput?: string;
  onAuthOpen?: (message?: string) => void;
}

export function CitationBuilder({ onResult, formatStyle, restoredInput, onAuthOpen }: CitationBuilderProps) {
  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<CaseSearchResult[]>([]);
  const [searchTrace, setSearchTrace] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<CaseSearchResult | null>(null);
  const [builtCitation, setBuiltCitation] = useState<AnalyzedCitation | null>(null);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [extractedCitations, setExtractedCitations] = useState<AnalyzedCitation[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [journalQuery, setJournalQuery] = useState('');
  const [showJournalDropdown, setShowJournalDropdown] = useState(false);
  const [journalHighlightIdx, setJournalHighlightIdx] = useState(0);
  const [copiedAbbrIdx, setCopiedAbbrIdx] = useState<number | null>(null);
  const journalDropdownRef = useRef<HTMLDivElement>(null);
  const journalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedJournalQuery, setDebouncedJournalQuery] = useState('');

  const journalEntries = useMemo(
    () => Object.entries(JOURNAL_ABBREVIATIONS).map(([full, abbr]) => ({ full, abbr })),
    []
  );

  const journalMatches = useMemo(() => {
    if (debouncedJournalQuery.length < 1) return [];
    const lower = debouncedJournalQuery.toLowerCase();
    return journalEntries
      .filter(({ full, abbr }) => full.toLowerCase().includes(lower) || abbr.toLowerCase().includes(lower))
      .slice(0, 12);
  }, [debouncedJournalQuery, journalEntries]);

  // Debounce journal query for smoother typing
  const handleJournalQueryChange = useCallback((value: string) => {
    setJournalQuery(value);
    setShowJournalDropdown(true);
    setJournalHighlightIdx(0);
    if (journalDebounceRef.current) clearTimeout(journalDebounceRef.current);
    journalDebounceRef.current = setTimeout(() => setDebouncedJournalQuery(value), 150);
  }, []);

  const handleCopyAbbr = useCallback(async (abbr: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(abbr);
      setCopiedAbbrIdx(idx);
      setTimeout(() => setCopiedAbbrIdx(null), 1500);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (journalDropdownRef.current && !journalDropdownRef.current.contains(e.target as Node)) {
        setShowJournalDropdown(false);
      }
    }
    if (showJournalDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showJournalDropdown]);

  // Restore input from history
  useEffect(() => {
    if (restoredInput !== undefined) {
      setInput(restoredInput);
    }
  }, [restoredInput]);

  const handleSearch = async (overrideQuery?: string) => {
    const query = overrideQuery || input.trim();
    if (!query) return;
    setSearching(true);
    setError(null);
    setSearchResults([]);
    setSelectedResult(null);
    setBuiltCitation(null);

    try {
      const data = await searchCases(query);
      setSearchResults(data.results);
      setSearchTrace(data.logicTrace);

      if (data.results.length === 0) {
        setError('No matching cases found. Try a different search — e.g., a case name, topic, or partial citation.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = async (result: CaseSearchResult) => {
    setSelectedResult(result);
    setBuilding(true);
    setError(null);

    try {
      const data = await buildCitation(result.citation.replace(/\*/g, ''));
      setBuiltCitation(data);
      trackEvent('citation_build', { caseName: result.citation });
      onResult(data, result.citation);
      // Scroll to top so user sees the generated citation in the sidebar
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Build failed');
    } finally {
      setBuilding(false);
    }
  };

  const handleFileText = async (text: string, fileName: string) => {
    setUploadedFileName(fileName);
    setExtracting(true);
    setError(null);
    setExtractedCitations([]);

    try {
      const data = await analyzeText(text);
      if (data.results.length === 0) {
        setError('No citations found in this document. Try searching manually instead.');
      } else {
        setExtractedCitations(data.results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not extract citations from this file.');
    } finally {
      setExtracting(false);
    }
  };

  const handleExtractedCitationClick = (citation: AnalyzedCitation) => {
    const rawText = citation.parsed?.rawText;
    if (!rawText) return;
    setInput(rawText);
    handleSearch(rawText);
  };

  const handleClear = () => {
    setInput('');
    setSearchResults([]);
    setSearchTrace([]);
    setSelectedResult(null);
    setBuiltCitation(null);
    setExtractedCitations([]);
    setUploadedFileName(null);
    setError(null);
  };

  const renderFormattedCitation = (text: string) => {
    return <FormattedCitation text={text} formatStyle={formatStyle} />;
  };

  return (
    <div className="space-y-5">
      {/* Search Input */}
      <div className="card">
        <h2 className="text-lg font-semibold text-primary-900 mb-1">Citation Builder</h2>
        <p className="text-sm text-surface-400 mb-5">
          Enter a case name, topic, or partial citation below and we'll find the matching case and generate a properly formatted Bluebook citation for you.
        </p>

        {/* Research Database Upload — Primary CTA */}
        <div className="mb-5 p-5 bg-gradient-to-br from-primary-50 to-surface-50 border border-primary-100 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0 hidden sm:flex">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-primary-900 mb-1">Upload a Case from Your Research Database</div>
              <p className="text-xs text-primary-600 leading-relaxed mb-2">
                Download the case as a PDF from <span className="font-semibold">Westlaw</span>, <span className="font-semibold">LexisNexis</span>, <span className="font-semibold">Google Scholar</span>, <span className="font-semibold">Fastcase</span>, <span className="font-semibold">Casetext</span>, or any legal database — then upload it here.
              </p>
              <div className="text-[11px] text-primary-500 mb-3 leading-relaxed">
                <span className="font-semibold">How it works:</span> Open the case in your database &rarr; Download/Print as PDF &rarr; Upload below &rarr; We extract the citation details &rarr; Select the correct match &rarr; Get your citation.
              </div>
              <FileUploader onTextExtracted={handleFileText} />
            </div>
          </div>
        </div>

        {/* Extracting indicator */}
        {extracting && (
          <div className="mb-5 p-4 bg-surface-50 border border-surface-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-surface-600">Scanning document for citations...</span>
            </div>
          </div>
        )}

        {/* Extracted citations from uploaded file */}
        {extractedCitations.length > 0 && (
          <div className="mb-5 p-5 bg-surface-50 border border-surface-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-primary-900">
                  {extractedCitations.length} Citation{extractedCitations.length !== 1 ? 's' : ''} Found
                </h3>
              </div>
              {uploadedFileName && (
                <span className="text-xs text-surface-400 truncate max-w-[200px]">{uploadedFileName}</span>
              )}
            </div>
            <p className="text-xs text-surface-500 mb-3">
              Select a citation below to search for and build the correct Bluebook format.
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {extractedCitations.map((citation, i) => {
                const rawText = citation.parsed?.rawText || 'Unknown citation';
                const citationType = citation.parsed?.type || 'unknown';
                return (
                  <button
                    key={i}
                    onClick={() => handleExtractedCitationClick(citation)}
                    disabled={searching || building}
                    className="w-full text-left p-3 rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-white transition-all duration-200 disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-serif text-surface-700 leading-relaxed">
                          <FormattedCitation text={rawText} formatStyle={formatStyle} />
                        </span>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 uppercase">
                          {citationType}
                        </span>
                        <span className={`text-xs font-bold ${
                          citation.score >= 80 ? 'text-verified-600' :
                          citation.score >= 50 ? 'text-warning-600' : 'text-error-600'
                        }`}>
                          {citation.score}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center mb-5">
          <div className="flex-grow border-t border-surface-200"></div>
          <span className="mx-3 text-xs font-medium text-surface-400 uppercase tracking-wider">or search manually</span>
          <div className="flex-grow border-t border-surface-200"></div>
        </div>

        {/* Manual Search Tips */}
        <div className="mb-5 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
          <div className="text-xs font-semibold text-primary-700 mb-2">Search tips:</div>
          <ul className="text-xs text-primary-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 text-primary-400 mt-0.5 shrink-0" />
              Case name: <span className="font-medium">"Roe v. Wade"</span> or <span className="font-medium">"Miranda v. Arizona 1966"</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 text-primary-400 mt-0.5 shrink-0" />
              Statute: <span className="font-medium">"42 USC 1983"</span> or <span className="font-medium">"Cal. Penal Code 187"</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 text-primary-400 mt-0.5 shrink-0" />
              Constitution: <span className="font-medium">"14th amendment equal protection"</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 text-primary-400 mt-0.5 shrink-0" />
              Regulation: <span className="font-medium">"40 CFR 60"</span> or <span className="font-medium">"IRC 501(c)(3)"</span>
            </li>
          </ul>
        </div>

        {/* Journal Abbreviation Lookup */}
        <div className="mb-5 relative" ref={journalDropdownRef}>
          <div className="text-xs font-semibold text-surface-500 mb-2">Journal Abbreviation Lookup</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={journalQuery}
              onChange={(e) => handleJournalQueryChange(e.target.value)}
              onFocus={() => { if (journalQuery.length >= 1) setShowJournalDropdown(true); }}
              onKeyDown={(e) => {
                if (!showJournalDropdown || journalMatches.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setJournalHighlightIdx(prev => Math.min(prev + 1, journalMatches.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setJournalHighlightIdx(prev => Math.max(prev - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  const selected = journalMatches[journalHighlightIdx];
                  if (selected) {
                    setInput(selected.abbr);
                    setJournalQuery('');
                    setDebouncedJournalQuery('');
                    setShowJournalDropdown(false);
                  }
                } else if (e.key === 'Escape') {
                  setShowJournalDropdown(false);
                }
              }}
              placeholder="Type a journal name or abbreviation..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
            />
          </div>
          {showJournalDropdown && debouncedJournalQuery.length >= 1 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-surface-200 rounded-xl shadow-elevated max-h-[300px] overflow-y-auto">
              {journalMatches.length > 0 ? (
                journalMatches.map(({ full, abbr }, i) => {
                  const lower = debouncedJournalQuery.toLowerCase();
                  const highlightMatch = (text: string) => {
                    const idx = text.toLowerCase().indexOf(lower);
                    if (idx < 0) return text;
                    return (
                      <>
                        {text.slice(0, idx)}
                        <span className="font-bold text-primary-700">{text.slice(idx, idx + lower.length)}</span>
                        {text.slice(idx + lower.length)}
                      </>
                    );
                  };

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-2.5 border-b border-surface-100 last:border-b-0 transition-colors ${
                        journalHighlightIdx === i ? 'bg-primary-50' : 'hover:bg-surface-50'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setInput(abbr);
                          setJournalQuery('');
                          setDebouncedJournalQuery('');
                          setShowJournalDropdown(false);
                        }}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="text-xs font-medium text-primary-900">{highlightMatch(full)}</div>
                        <div className="text-[11px] text-surface-500 font-mono">{highlightMatch(abbr)}</div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyAbbr(abbr, i); }}
                        className="shrink-0 ml-2 p-1 text-surface-400 hover:text-primary-600 transition-colors"
                        title="Copy abbreviation"
                      >
                        {copiedAbbrIdx === i ? (
                          <Check className="w-3.5 h-3.5 text-verified-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-xs text-surface-400 text-center">
                  No matching journals found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="input-field h-24 overflow-y-auto" data-tour="builder-input">
          <RichTextInput
            value={input}
            onChange={setInput}
            placeholder="Enter a case name, topic, or partial citation..."
            minHeight="4rem"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-4">
          <span className="text-xs text-surface-400 text-center sm:text-left">Press Enter to search</span>
          <div className="flex gap-2">
            {(searchResults.length > 0 || builtCitation || extractedCitations.length > 0) && (
              <button onClick={handleClear} className="btn-secondary text-sm">
                Clear
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              disabled={!input.trim() || searching}
              className="btn-primary disabled:opacity-50"
            >
              {searching ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </span>
              ) : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-error-50 border border-error-100 rounded-2xl text-sm text-error-700">
            {error}
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-primary-900">
              {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} Found
            </h3>
            <span className="text-xs text-surface-400">Select the correct source</span>
          </div>

          <div className="space-y-2">
            {searchResults.map((result, i) => {
              const isSelected = selectedResult === result;
              return (
                <div
                  key={i}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                      : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                  } ${building && !isSelected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-sm leading-relaxed">
                        {renderFormattedCitation(result.citation)}
                      </div>
                      <div className="mt-1.5 text-xs text-surface-500">
                        {result.court} ({result.year})
                      </div>
                      <p className="mt-1.5 text-xs text-surface-600 leading-relaxed">
                        {result.summary}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        result.confidence >= 90 ? 'bg-verified-100 text-verified-700' :
                        result.confidence >= 70 ? 'bg-warning-100 text-warning-700' :
                        'bg-surface-100 text-surface-600'
                      }`}>
                        {result.confidence}% match
                      </div>
                      {isSelected && (
                        <span className="text-primary-600 text-xs font-medium">Selected</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleSelectResult(result)}
                      disabled={building}
                      className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                    >
                      {building && isSelected ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Building...
                        </span>
                      ) : 'Create Citation'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search Reasoning */}
          {searchTrace.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-surface-400 cursor-pointer hover:text-surface-600 transition-colors">
                Search reasoning ({searchTrace.length} steps)
              </summary>
              <ol className="mt-2 space-y-1 text-xs text-surface-500 list-decimal list-inside">
                {searchTrace.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}

      {/* Building indicator — animated Bluebook rules view */}
      {building && <CitationGeneratingView />}

      {/* Case Library */}
      <CaseLibrary
        onBuildCitation={(text) => {
          setInput(text);
          handleSearch(text);
        }}
        onViewSource={(docId) => setViewingDocId(docId)}
        onAuthOpen={onAuthOpen}
      />

      {/* Source Viewer Modal */}
      {viewingDocId && (
        <SourceViewer
          documentId={viewingDocId}
          onClose={() => setViewingDocId(null)}
        />
      )}
    </div>
  );
}
