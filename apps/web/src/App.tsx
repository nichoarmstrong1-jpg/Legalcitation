import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Scale } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { NavigationTabs } from './components/NavigationTabs.tsx';
import { CitationChecker } from './components/CitationChecker.tsx';
import { CitationBuilder } from './components/CitationBuilder.tsx';
import { AnalysisSidebar } from './components/AnalysisSidebar.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { SpadingDashboard } from './components/spading/SpadingDashboard.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { OnboardingFlow } from './components/OnboardingFlow.tsx';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal.tsx';
import { TipsPage } from './components/TipsPage.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ToastContainer } from './components/ui/Toast.tsx';
import { AnalysisProgressBar } from './components/ui/AnalysisProgressBar.tsx';
import { useHistory, type HistoryEntry } from './hooks/useHistory.ts';
import { useAuth } from './context/AuthContext.tsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
import { GuidedTour } from './components/GuidedTour.tsx';
import { useTour } from './hooks/useTour.ts';
import type { AnalyzedCitation } from './services/api.ts';

type Mode = 'checker' | 'builder' | 'history' | 'spading';
type FormatStyle = 'italics' | 'underline';
const MODES: Mode[] = ['checker', 'builder', 'history', 'spading'];

function AppContent() {
  useAuth();
  const [mode, setMode] = useState<Mode>('builder');
  const [formatStyle, setFormatStyle] = useState<FormatStyle>(
    () => (localStorage.getItem('legalcitation-format') as FormatStyle) || 'italics'
  );
  const [selectedCitation, setSelectedCitation] = useState<AnalyzedCitation | null>(null);
  const [allResults, setAllResults] = useState<AnalyzedCitation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>();
  const [restoredInput, setRestoredInput] = useState<string | undefined>();
  const [showAuth, setShowAuth] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('legalcitation-onboarded')
  );
  const [authMessage, setAuthMessage] = useState<string | undefined>();
  const tour = useTour();
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
    saveToHistory({ mode: mode as 'checker' | 'builder', input, results });
  }, [mode, saveToHistory]);

  const handleSingleResult = useCallback((result: AnalyzedCitation, input: string) => {
    setIsAnalyzing(false);
    setAllResults([result]);
    setSelectedCitation(result);
    saveToHistory({ mode: mode as 'checker' | 'builder', input, results: [result] });
  }, [mode, saveToHistory]);

  const handleRestoreHistory = useCallback((entry: HistoryEntry) => {
    // Switch to the original mode (checker or builder)
    const targetMode: Mode = entry.mode === 'checker' || entry.mode === 'in_text' as string ? 'checker' : 'builder';
    setMode(targetMode);
    setSelectedHistoryId(entry.id);
    setAllResults(entry.results);
    setRestoredInput(entry.input);
    if (entry.results.length > 0) {
      setSelectedCitation(entry.results[0]);
    }
  }, []);

  const openAuth = useCallback((message?: string) => {
    setAuthMessage(message);
    setShowAuth(true);
  }, []);

  const closeAllModals = useCallback(() => {
    if (showTips) { setShowTips(false); return; }
    if (showShortcuts) { setShowShortcuts(false); return; }
    if (showAuth) { setShowAuth(false); return; }
  }, [showTips, showShortcuts, showAuth]);

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
        onFormatChange={(style: FormatStyle) => {
          setFormatStyle(style);
          localStorage.setItem('legalcitation-format', style);
        }}
        onHistoryToggle={() => setMode(prev => prev === 'history' ? 'builder' : 'history')}
        onAuthOpen={() => openAuth()}
        onTipsOpen={() => setShowTips(true)}
        onTourStart={tour.startTour}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NavigationTabs mode={mode} onModeChange={(newMode) => {
          setMode(newMode);
          setRestoredInput(undefined);
          if (newMode !== 'history') {
            setSelectedCitation(null);
            setAllResults([]);
            setSelectedHistoryId(undefined);
          }
        }} />

        {mode === 'spading' ? (
          <div className="mt-6 sm:mt-8">
            <SpadingDashboard onAuthOpen={openAuth} />
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {mode === 'checker' && (
                <CitationChecker
                  onResults={handleResults}
                  onSelectCitation={setSelectedCitation}
                  results={allResults}
                  formatStyle={formatStyle}
                  restoredInput={restoredInput}
                />
              )}
              {mode === 'builder' && (
                <CitationBuilder
                  onResult={handleSingleResult}
                  formatStyle={formatStyle}
                  restoredInput={restoredInput}
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
            <div ref={sidebarRef} className="lg:col-span-1" data-tour="sidebar">
              {selectedCitation ? (
                <AnalysisSidebar
                  citation={selectedCitation}
                  formatStyle={formatStyle}
                />
              ) : isAnalyzing ? (
                <div className="card">
                  <AnalysisProgressBar />
                </div>
              ) : (
                <div className="card text-center text-surface-400 py-10">
                  <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-6 h-6 text-surface-400" />
                  </div>
                  <p className="font-medium text-surface-600">No citation selected</p>
                  <p className="text-sm mt-1 text-surface-400 mb-6">Try an example to get started</p>
                  <div className="space-y-2 text-left px-2">
                    {[
                      { label: 'Brown v. Bd. of Educ., 347 U.S. 483 (1954)', query: 'Brown v. Board of Education' },
                      { label: 'Miranda v. Arizona, 384 U.S. 436 (1966)', query: 'Miranda v. Arizona' },
                      { label: 'Marbury v. Madison, 5 U.S. 137 (1803)', query: 'Marbury v. Madison' },
                      { label: 'Roe v. Wade, 410 U.S. 113 (1973)', query: 'Roe v. Wade' },
                    ].map((ex) => (
                      <button
                        key={ex.query}
                        onClick={() => {
                          setMode('builder');
                          setRestoredInput(ex.query);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors duration-150"
                      >
                        <span className="italic">{ex.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingFlow onComplete={() => {
          setShowOnboarding(false);
          // After onboarding, offer guided tour
          if (!tour.hasCompletedTour) {
            setTimeout(() => tour.startTour(), 500);
          }
        }} />
      )}

      {/* Guided Tour */}
      {tour.isActive && tour.step && (
        <GuidedTour
          step={tour.step}
          currentStep={tour.currentStep}
          totalSteps={tour.totalSteps}
          onNext={tour.nextStep}
          onPrev={tour.prevStep}
          onExit={tour.exitTour}
        />
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

      {/* Tips / Quick Reference Modal */}
      {showTips && (
        <TipsPage onClose={() => setShowTips(false)} />
      )}

      <ToastContainer />

      {/* Legal Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <p className="text-xs text-surface-400 text-center leading-relaxed">
          This tool is not a substitute for legal research. It verifies citation formatting and searches case law databases to help ensure accuracy, but always confirm citations against an authoritative source like Westlaw or LexisNexis.
        </p>
      </div>
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
