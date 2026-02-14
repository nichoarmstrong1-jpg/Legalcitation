import { useRef, useCallback, type ComponentType } from 'react';
import { FileText, Hammer, Clock } from 'lucide-react';

type Mode = 'checker' | 'builder' | 'history';

interface NavigationTabsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const TABS: { id: Mode; label: string; icon: ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'checker', label: 'Citation Checker', icon: FileText, description: 'Check citations in text or documents' },
  { id: 'builder', label: 'Citation Builder', icon: Hammer, description: 'Search & build citations' },
  { id: 'history', label: 'History', icon: Clock, description: 'Review your past checks' },
];

export function NavigationTabs({ mode, onModeChange }: NavigationTabsProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      onModeChange(TABS[nextIndex].id);
      tabsRef.current[nextIndex]?.focus();
    }
  }, [onModeChange]);

  return (
    <div className="flex gap-1 sm:gap-1.5 bg-surface-100 rounded-2xl p-1 sm:p-1.5" role="tablist">
      {TABS.map((tab, i) => {
        const isActive = mode === tab.id;
        return (
          <button
            key={tab.id}
            ref={el => { tabsRef.current[i] = el; }}
            onClick={() => onModeChange(tab.id)}
            onKeyDown={e => handleKeyDown(e, i)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`flex-1 px-1.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white shadow-card text-primary-900 border-b-2 border-primary-500'
                : 'text-surface-500 hover:text-surface-700 hover:bg-white/50 bg-surface-50/80'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {(() => { const Icon = tab.icon; return <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-surface-400'}`} />; })()}
              <span className="hidden sm:inline">{tab.label}</span>
            </div>
            <div className={`text-[11px] font-normal mt-0.5 hidden sm:block ${isActive ? 'text-surface-500' : 'text-surface-400'}`}>
              {tab.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
