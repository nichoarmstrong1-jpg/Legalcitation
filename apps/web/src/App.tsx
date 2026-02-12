import { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { NavigationTabs } from './components/NavigationTabs.tsx';
import { InTextChecker } from './components/InTextChecker.tsx';
import { IndividualChecker } from './components/IndividualChecker.tsx';
import { CitationBuilder } from './components/CitationBuilder.tsx';
import { BulkCheck } from './components/BulkCheck.tsx';
import { AnalysisSidebar } from './components/AnalysisSidebar.tsx';
import { HistoryPanel } from './components/HistoryPanel.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PricingModal } from './components/PricingModal.tsx';
import { OnboardingFlow } from './components/OnboardingFlow.tsx';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal.tsx';
import { useHistory } from './hooks/useHistory.ts';
import { useAuth } from './context/AuthContext.tsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
import type { AnalyzedCitation } from './services/api.ts';

type Mode = 'in_text' | 'individual' | 'builder' | 'bulk';
type FormatStyle = 'italics' | 'underline';
const MODES: Mode[] = ['in_text', 'individual', 'builder', 'bulk'];

export default function App() {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<Mode>('individual');
  const [formatStyle, setFormatStyle] = useState<FormatStyle>('italics');
  const [selectedCitation, setSelectedCitation] = useState<AnalyzedCitation | null>(null);
  const [allResults, setAllResults] = useState<AnalyzedCitation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('legalcitation-onboarded')
  );
  const [authMessage, setAuthMessage] = useState<string | undefined>();
  const { history, saveToHistory, deleteEntry, clearHistory } = useHistory();

  // Handle checkout success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      refreshUser();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshUser]);

  const handleResults = useCallback((results: AnalyzedCitation[], input: string) => {
    setAllResults(results);
    if (results.length > 0) {
      setSelectedCitation(results[0]);
    }
    saveToHistory({ mode, input, results });
  }, [mode, saveToHistory]);

  const handleSingleResult = useCallback((result: AnalyzedCitation, input: string) => {
    setAllResults([result]);
    setSelectedCitation(result);
    saveToHistory({ mode, input, results: [result] });
  }, [mode, saveToHistory]);

  const openAuth = useCallback((message?: string) => {
    setAuthMessage(message);
    setShowAuth(true);
  }, []);

  // Close any open modal
  const closeAllModals = useCallback(() => {
    if (showShortcuts) { setShowShortcuts(false); return; }
    if (showAuth) { setShowAuth(false); return; }
    if (showPricing) { setShowPricing(false); return; }
    if (showHistory) { setShowHistory(false); return; }
  }, [showShortcuts, showAuth, showPricing, showHistory]);

  // Keyboard shortcuts
  const shortcutHandlers = useMemo(() => ({
    onToggleHistory: () => setShowHistory(prev => !prev),
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
        onHistoryToggle={() => setShowHistory(!showHistory)}
        onPricingOpen={() => setShowPricing(true)}
        onAuthOpen={() => openAuth()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NavigationTabs mode={mode} onModeChange={(newMode) => {
          setMode(newMode);
          setSelectedCitation(null);
          setAllResults([]);
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
            {mode === 'individual' && (
              <IndividualChecker onResult={handleSingleResult} />
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {selectedCitation ? (
              <AnalysisSidebar
                citation={selectedCitation}
                formatStyle={formatStyle}
              />
            ) : (
              <div className="card text-center text-surface-400 py-16">
                <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">&#9878;</span>
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

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onClose={() => setShowHistory(false)}
          onDelete={deleteEntry}
          onClear={clearHistory}
        />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          message={authMessage}
        />
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <PricingModal
          onClose={() => setShowPricing(false)}
          onSignupRequired={() => {
            setShowPricing(false);
            openAuth('Create an account to subscribe to a plan');
          }}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
