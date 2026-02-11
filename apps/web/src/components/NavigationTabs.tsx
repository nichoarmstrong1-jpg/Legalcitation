type Mode = 'in_text' | 'individual' | 'builder' | 'bulk';

interface NavigationTabsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const TABS: { id: Mode; label: string; icon: string; description: string }[] = [
  { id: 'in_text', label: 'In-Text', icon: '\u00B6', description: 'Check in context' },
  { id: 'individual', label: 'Individual', icon: '\u2713', description: 'Single citation' },
  { id: 'builder', label: 'Builder', icon: '\u2692', description: 'Generate citation' },
  { id: 'bulk', label: 'Bulk Check', icon: '\u2630', description: 'Check multiple' },
];

export function NavigationTabs({ mode, onModeChange }: NavigationTabsProps) {
  return (
    <div className="flex gap-1.5 bg-surface-100 rounded-2xl p-1.5">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onModeChange(tab.id)}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            mode === tab.id
              ? 'bg-white shadow-card text-primary-900'
              : 'text-surface-400 hover:text-surface-600 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className={`text-base ${mode === tab.id ? 'text-primary-600' : 'text-surface-300'}`}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
          <div className={`text-[11px] font-normal mt-0.5 ${mode === tab.id ? 'text-surface-500' : 'text-surface-300'}`}>
            {tab.description}
          </div>
        </button>
      ))}
    </div>
  );
}
