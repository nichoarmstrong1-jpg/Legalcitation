import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileUp, PenTool, Loader2, AlertTriangle, Check, Search,
} from 'lucide-react';
import {
  searchCases, buildCitation, buildCitationWithType, buildFromUrl, analyzeText,
  type AnalyzedCitation, type CaseSearchResult, type BuildResponse,
} from '../services/api.ts';
import {
  CITATION_TYPES, checkBlockedDomain, type CitationTypeConfig, type BlockedDomainInfo,
} from '@legalcitation/shared';
import { FileUploader } from './FileUploader.tsx';
import { CitationGeneratingView } from './CitationGeneratingView.tsx';
import { CaseLibrary } from './CaseLibrary.tsx';
import { SourceViewer } from './SourceViewer.tsx';
import { FormattedCitation } from './FormattedCitation.tsx';
import { TypeDropdown } from './TypeDropdown.tsx';
import { ManualPanel } from './ManualPanel.tsx';
import { CitationResultCard, type CitationResult } from './CitationResultCard.tsx';
import { CitationHistory } from './CitationHistory.tsx';
import { TypeIcon } from './TypeIcon.tsx';
import { trackEvent } from '../services/analytics.ts';

type InputMode = 'search' | 'url' | 'manual';

interface CitationBuilderProps {
  onResult: (result: AnalyzedCitation, input: string) => void;
  formatStyle: 'italics' | 'underline';
  restoredInput?: string;
  onAuthOpen?: (message?: string) => void;
}

function isUrlInput(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('www.');
}

export function CitationBuilder({ onResult, formatStyle, restoredInput, onAuthOpen }: CitationBuilderProps) {
  const [selectedType, setSelectedType] = useState<CitationTypeConfig>(CITATION_TYPES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('search');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'' | 'searching' | 'extracting' | 'generating'>('');
  const [error, setError] = useState<string | null>(null);
  const [manualFields, setManualFields] = useState<Record<string, string>>({});
  const [urlStatus, setUrlStatus] = useState<null | 'checking' | 'blocked' | 'accessible' | 'error'>(null);
  const [blockedInfo, setBlockedInfo] = useState<BlockedDomainInfo | null>(null);

  const [result, setResult] = useState<CitationResult | null>(null);
  const [resultTab, setResultTab] = useState<'cite' | 'shortform' | 'note'>('cite');
  const [citationHistory, setCitationHistory] = useState<CitationResult[]>([]);

  // Legacy search results state (for case search flow)
  const [searchResults, setSearchResults] = useState<CaseSearchResult[]>([]);
  const [searchTrace, setSearchTrace] = useState<string[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<CaseSearchResult | null>(null);
  const [building, setBuilding] = useState(false);

  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [extractedCitations, setExtractedCitations] = useState<AnalyzedCitation[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isExpanded = inputValue.length > 120 || inputValue.includes('\n');

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (isExpanded) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    } else {
      el.style.height = '44px';
    }
  }, [inputValue, isExpanded]);

  // URL auto-detection
  useEffect(() => {
    if (isUrlInput(inputValue)) {
      if (inputMode !== 'url') setInputMode('url');
      const blocked = checkBlockedDomain(inputValue.trim());
      if (blocked) {
        setUrlStatus('blocked');
        setBlockedInfo(blocked);
      } else {
        setUrlStatus('accessible');
        setBlockedInfo(null);
      }
    } else if (inputMode === 'url') {
      setInputMode('search');
      setUrlStatus(null);
      setBlockedInfo(null);
    }
  }, [inputValue, inputMode]);

  // Restore input from history
  useEffect(() => {
    if (restoredInput !== undefined) {
      setInputValue(restoredInput);
    }
  }, [restoredInput]);

  const handleTypeSelect = useCallback((type: CitationTypeConfig) => {
    setSelectedType(type);
    setDropdownOpen(false);
    setInputValue('');
    setError(null);
    setResult(null);
    setSearchResults([]);
    if (inputMode === 'manual') {
      setManualFields({});
    }
  }, [inputMode]);

  const buildResultFromResponse = useCallback((response: BuildResponse, usedInput: string, mode: InputMode): CitationResult => {
    return {
      id: Date.now(),
      citation: response.citation || 'Citation could not be generated',
      confidence: response.confidence,
      type: selectedType,
      sourceUrl: response.sourceUrl || null,
      inputUsed: usedInput,
      inputMode: mode,
      timestamp: new Date(),
      components: response.components,
      shortForm: response.shortForm || null,
      footnote: response.footnote || response.citation || '',
      missingFields: response.missingFields,
    };
  }, [selectedType]);

  const addToHistory = useCallback((newResult: CitationResult) => {
    setCitationHistory(prev => [newResult, ...prev]);
  }, []);

  const handleCite = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed && inputMode !== 'manual') return;

    setIsProcessing(true);
    setError(null);
    setSearchResults([]);

    try {
      if (inputMode === 'url') {
        setProcessingStage('extracting');
        const response = await buildFromUrl(trimmed, selectedType.id);
        const citResult = buildResultFromResponse(response, trimmed, 'url');
        setResult(citResult);
        addToHistory(citResult);
        setResultTab('cite');
        trackEvent('citation_build', { type: selectedType.id, mode: 'url' });

        if (response.suggestManual) {
          setInputMode('manual');
          setManualFields(response.components);
        }
      } else if (isExpanded) {
        setProcessingStage('extracting');
        const response = await buildCitationWithType(trimmed, selectedType.id);
        const citResult = buildResultFromResponse(response, trimmed, 'search');
        setResult(citResult);
        addToHistory(citResult);
        setResultTab('cite');
        trackEvent('citation_build', { type: selectedType.id, mode: 'paste' });

        if (response.suggestManual) {
          setInputMode('manual');
          setManualFields(response.components);
        }
      } else {
        setProcessingStage('searching');
        // Short query: search then build
        const data = await searchCases(trimmed);
        setSearchResults(data.results);
        setSearchTrace(data.logicTrace);

        if (data.results.length === 0) {
          // Fallback: try building directly with citationType
          setProcessingStage('generating');
          const response = await buildCitationWithType(trimmed, selectedType.id);
          if (response.citation) {
            const citResult = buildResultFromResponse(response, trimmed, 'search');
            setResult(citResult);
            addToHistory(citResult);
            setResultTab('cite');

            if (response.suggestManual) {
              setInputMode('manual');
              setManualFields(response.components);
            }
          } else {
            setError('No matching results found. Try a different search or use manual entry.');
          }
        }
        trackEvent('citation_search', { type: selectedType.id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Citation build failed');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleManualCite = async () => {
    setIsProcessing(true);
    setError(null);
    setProcessingStage('generating');

    try {
      const fieldValues = Object.entries(manualFields)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      const response = await buildCitationWithType(
        fieldValues || inputValue.trim() || selectedType.label,
        selectedType.id,
        manualFields,
      );
      const citResult = buildResultFromResponse(response, fieldValues, 'manual');
      setResult(citResult);
      addToHistory(citResult);
      setResultTab('cite');
      trackEvent('citation_build', { type: selectedType.id, mode: 'manual' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Citation build failed');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleSelectSearchResult = async (searchResult: CaseSearchResult) => {
    setSelectedSearchResult(searchResult);
    setBuilding(true);
    setError(null);

    try {
      const data = await buildCitation(searchResult.citation.replace(/\*/g, ''));
      onResult(data, searchResult.citation);
      trackEvent('citation_build', { caseName: searchResult.citation });
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Silently fail
    }
  };

  const handleEditFields = () => {
    if (result) {
      setManualFields(result.components);
      setInputMode('manual');
    }
  };

  const handleHistorySelect = (selectedResult: CitationResult) => {
    setResult(selectedResult);
    setResultTab('cite');
  };

  const handleHistoryRemove = (id: number) => {
    setCitationHistory(prev => prev.filter(c => c.id !== id));
    if (result?.id === id) {
      setResult(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isExpanded) {
        if (!e.shiftKey) return; // Allow normal newlines in expanded mode
      } else {
        e.preventDefault();
        handleCite();
      }
    }
  };

  const processingLabel = processingStage === 'searching' ? 'Searching...'
    : processingStage === 'extracting' ? 'Extracting...'
    : processingStage === 'generating' ? 'Generating...'
    : 'Processing...';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Bluebook Citation Generator</h2>
        <p className="text-sm text-gray-500 mt-1">Search, paste, or upload &mdash; we build the citation</p>
      </div>

      {/* Main unified bar card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible" data-tour="builder-input">
        {/* The unified bar */}
        <div className="flex items-stretch">
          {/* Type dropdown trigger */}
          <TypeDropdown
            selectedType={selectedType}
            onTypeSelect={handleTypeSelect}
            isOpen={dropdownOpen}
            onToggle={() => setDropdownOpen(prev => !prev)}
          />

          {/* Auto-expanding textarea */}
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedType.placeholder}
              rows={1}
              className={`w-full resize-none border-none focus:outline-none focus:ring-0 px-4 py-3 text-sm leading-relaxed placeholder:text-gray-400 ${
                isExpanded ? 'font-mono text-[13px]' : ''
              }`}
              style={{
                height: isExpanded ? undefined : '44px',
                maxHeight: '200px',
                overflowY: isExpanded ? 'auto' : 'hidden',
              }}
              disabled={isProcessing}
            />
            {isExpanded && (
              <span className="absolute bottom-1 right-2 text-[10px] text-gray-400 bg-white px-1 rounded">
                {inputValue.length} chars
              </span>
            )}
          </div>

          {/* Cite button */}
          <button
            onClick={handleCite}
            disabled={(!inputValue.trim() && inputMode !== 'manual') || isProcessing || urlStatus === 'blocked'}
            className="flex items-center gap-2 px-5 bg-gray-900 text-white text-sm font-medium rounded-r-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="hidden sm:inline">{isProcessing ? processingLabel : 'Cite'}</span>
          </button>
        </div>

        {/* Below-bar section: warnings, processing status, secondary actions */}
        <div className="px-4 pb-3">
          {/* Blocked URL warning */}
          {urlStatus === 'blocked' && blockedInfo && (
            <div className="flex items-start gap-2 p-3 mt-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700">
                <span className="font-semibold">{blockedInfo.label}</span> links cannot be accessed directly.
                {' '}{blockedInfo.suggestion}
              </div>
            </div>
          )}

          {/* URL accessible indicator */}
          {urlStatus === 'accessible' && inputMode === 'url' && (
            <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
              <Check size={14} />
              URL detected &mdash; click Cite to resolve
            </div>
          )}

          {/* Processing status */}
          {isProcessing && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 border border-blue-100 rounded-xl">
              <Loader2 size={14} className="animate-spin text-blue-500" />
              <span className="text-xs text-blue-700">{processingLabel}</span>
            </div>
          )}

          {/* Secondary actions row */}
          <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500">
            <span className="text-gray-300">or</span>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={`flex items-center gap-1.5 transition-colors ${
                showUpload ? 'text-blue-600 font-medium' : 'hover:text-gray-700'
              }`}
            >
              <FileUp size={14} />
              <span>Upload PDF</span>
            </button>
            <button
              onClick={() => {
                if (inputMode === 'manual') {
                  setInputMode('search');
                } else {
                  setInputMode('manual');
                  setManualFields({});
                }
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                inputMode === 'manual' ? 'text-blue-600 font-medium' : 'hover:text-gray-700'
              }`}
            >
              <PenTool size={14} />
              <span>Cite manually</span>
            </button>
            {isExpanded && (
              <span className="ml-auto text-gray-400 italic">
                Paste detected
              </span>
            )}
            <span className="ml-auto hidden sm:inline">
              <TypeIcon iconName={selectedType.icon} size={12} className="inline mr-1 text-gray-400" />
              <span className="text-gray-400">{selectedType.bluebookRule}</span>
            </span>
          </div>

          {/* Upload area (shown when Upload PDF is clicked) */}
          {showUpload && (
            <div className="mt-3">
              <FileUploader onTextExtracted={(text, fileName) => {
                handleFileText(text, fileName);
                setShowUpload(false);
              }} compact />
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Manual Panel */}
      {inputMode === 'manual' && (
        <ManualPanel
          type={selectedType}
          fields={manualFields}
          onChange={setManualFields}
          onCite={handleManualCite}
          onClose={() => setInputMode('search')}
          isProcessing={isProcessing}
        />
      )}

      {/* Extracting indicator */}
      {extracting && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Scanning document for citations...</span>
          </div>
        </div>
      )}

      {/* Extracted citations from uploaded file */}
      {extractedCitations.length > 0 && (
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {extractedCitations.length} Citation{extractedCitations.length !== 1 ? 's' : ''} Found
            </h3>
            {uploadedFileName && (
              <span className="text-xs text-gray-400 truncate max-w-[200px]">{uploadedFileName}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Select a citation below to search for and build the correct Bluebook format.
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {extractedCitations.map((cit, i) => {
              const rawText = cit.parsed?.rawText || 'Unknown citation';
              const citationType = cit.parsed?.type || 'unknown';
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (rawText) {
                      setInputValue(rawText);
                      handleCite();
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-white transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-serif text-gray-700 leading-relaxed">
                        <FormattedCitation text={rawText} formatStyle={formatStyle} />
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 uppercase">
                        {citationType}
                      </span>
                      <span className={`text-xs font-bold ${
                        cit.score >= 80 ? 'text-green-600' :
                        cit.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {cit.score}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Results (from case search) */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} Found
            </h3>
            <span className="text-xs text-gray-400">Select the correct source</span>
          </div>

          <div className="space-y-2">
            {searchResults.map((searchResult, i) => {
              const isSelected = selectedSearchResult === searchResult;
              return (
                <div
                  key={i}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  } ${building && !isSelected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-sm leading-relaxed">
                        <FormattedCitation text={searchResult.citation} formatStyle={formatStyle} />
                      </div>
                      <div className="mt-1.5 text-xs text-gray-500">
                        {searchResult.court} ({searchResult.year})
                      </div>
                      <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                        {searchResult.summary}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        searchResult.confidence >= 90 ? 'bg-green-100 text-green-700' :
                        searchResult.confidence >= 70 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {searchResult.confidence}% match
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleSelectSearchResult(searchResult)}
                      disabled={building}
                      className="px-4 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl disabled:opacity-50 transition-colors"
                    >
                      {building && isSelected ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin" />
                          Building...
                        </span>
                      ) : 'Create Citation'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {searchTrace.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                Search reasoning ({searchTrace.length} steps)
              </summary>
              <ol className="mt-2 space-y-1 text-xs text-gray-500 list-decimal list-inside">
                {searchTrace.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}

      {/* Building indicator */}
      {building && <CitationGeneratingView />}

      {/* Result Card */}
      {result && (
        <CitationResultCard
          result={result}
          activeTab={resultTab}
          onTabChange={setResultTab}
          onCopy={handleCopy}
          onEditFields={handleEditFields}
        />
      )}

      {/* Citation History */}
      <CitationHistory
        citations={citationHistory}
        onSelect={handleHistorySelect}
        onCopy={handleCopy}
        onRemove={handleHistoryRemove}
      />

      {/* Case Library */}
      <CaseLibrary
        onBuildCitation={(text) => {
          setInputValue(text);
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
