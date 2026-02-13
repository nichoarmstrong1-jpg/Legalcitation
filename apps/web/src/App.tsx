import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Scale } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { NavigationTabs } from './components/NavigationTabs.tsx';
import { InTextChecker } from './components/InTextChecker.tsx';
import { CitationBuilder } from './components/CitationBuilder.tsx';
import { BulkCheck } from './components/BulkCheck.tsx';
import { AnalysisSidebar } from './components/AnalysisSidebar.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { OnboardingFlow } from './components/OnboardingFlow.tsx';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ToastContainer } from './components/ui/Toast.tsx';
import { SkeletonCard } from './components/ui/SkeletonCard.tsx';
import { useHistory, type HistoryEntry } from './hooks/useHistory.ts';
import { useAuth } from './context/AuthContext.tsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
import type { AnalyzedCitation } from './services/api.ts';

type Mode = 'in_text' | 'builder' | 'bulk' | 'history';
type FormatStyle = 'italics' | 'underline';
const MODES: Mode[] = ['in_text', 'builder', 'bulk', 'history'];

function AppContent() {
  useAuth();
  const [mode, setMode] = useState<Mode>('builder');
  const [formatStyle, setFormatStyle] = useState<FormatStyle>('italics');
  const [selectedCitation, setSelectedCitation] = useState<AnalyzedCitation | null>(null);
  const [allResults, setAllResults] = useState<AnalyzedCitation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>();
  const [showAuth, setShowAuth] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('legalcitation-onboarded')
  );
  const [authMessage, setAuthMessage] = useState<string | undefined>();
  const { history, saveToHistory, deleteEntry, clearHistory } = useHistory();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to sidebar on mobile when a result is selected
  useEffect(() => {
    if (!selectedCitation) return;
    if (window.innerWidth >= 1024) return;
    const timer = setTimeout(() => {
      sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCitation]);

  const handleResults = useCallback((results: AnalyzedCitation[], input: string) => {
    setIsAnalyzing(false);
    setAllResults(results);
    if (results.length > 0) {
      setSelectedCitation(results[0]);
    }
    saveToHistory({ mode: mode as Exclude<Mode, 'history'>, input, results });
  }, [mode, saveToHistory]);

  const handleSingleResult = useCallback((result: AnalyzedCitation, input: string) => {
    setIsAnalyzing(false);
    setAllResults([result]);
    setSelectedCitation(result);
    saveToHistory({ mode: mode as Exclude<Mode, 'history'>, input, results: [result] });
  }, [mode, saveToHistory]);

  const handleRestoreHistory = useCallback((entry: HistoryEntry) => {
    setSelectedHistoryId(entry.id);
    setAllResults(entry.results);
    if (entry.results.length > 0) {
      setSelectedCitation(entry.results[0]);
    }
  }, []);

  const openAuth = useCallback((message?: string) => {
    setAuthMessage(message);
    setShowAuth(true);
  }, []);

  const closeAllModals = useCallback(() => {
    if (showShortcuts) { setShowShortcuts(false); return; }
    if (showAuth) { setShowAuth(false); return; }
  }, [showShortcuts, showAuth]);

  const shortcutHandlers = useMemo(() => ({
    onToggleHistory: () => setMode(prev => prev === 'history' ? 'builder' : 'history'),
    onSwitchMode: (index: number) => {
      if (index >= 0 && index < MODES.length) setMode(MODES[index]);
    },
    onCloseModal: closeAllModals,
    onShowShortcuts: () => setShowShortcuts(true),
  }), [closeAllModals]);

  useKeyboardShortcuts(shortcutHandlers);

  return (
    <div className="min-h-screen bg-surface-50">
      <Header
        formatStyle={formatStyle}
        onFormatChange={setFormatStyle}
        onHistoryToggle={() => setMode(prev => prev === 'history' ? 'builder' : 'history')}
        onAuthOpen={() => openAuth()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NavigationTabs mode={mode} onModeChange={(newMode) => {
          setMode(newMode);
          if (newMode !== 'history') {
            setSelectedCitation(null);
            setAllResults([]);
            setSelectedHistoryId(undefined);
          }
        }} />

        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {mode === 'in_text' && (
              <InTextChecker
                onResults={handleResults}
                onSelectCitation={setSelectedCitation}
                results={allResults}
              />
            )}
            {mode === 'builder' && (
              <CitationBuilder onResult={handleSingleResult} formatStyle={formatStyle} />
            )}
            {mode === 'bulk' && (
              <BulkCheck
                onResults={handleResults}
                onSelectCitation={setSelectedCitation}
                results={allResults}
              />
            )}
            {mode === 'history' && (
              <HistoryView
                history={history}
                onRestore={handleRestoreHistory}
                onDelete={deleteEntry}
                onClear={clearHistory}
                selectedEntryId={selectedHistoryId}
              />
            )}
          </div>

          {/* Sidebar */}
          <div ref={sidebarRef} className="lg:col-span-1">
            {selectedCitation ? (
              <AnalysisSidebar
                citation={selectedCitation}
                formatStyle={formatStyle}
              />
            ) : isAnalyzing ? (
              <SkeletonCard />
            ) : (
              <div className="card text-center text-surface-400 py-16">
                <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-6 h-6 text-surface-400" />
                </div>
                <p className="font-medium text-surface-600">No citation selected</p>
                <p className="text-sm mt-1 text-surface-400">Enter a citation to see analysis results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          message={authMessage}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
