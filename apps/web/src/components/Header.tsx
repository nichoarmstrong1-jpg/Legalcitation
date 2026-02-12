import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  formatStyle: 'italics' | 'underline';
  onFormatChange: (style: 'italics' | 'underline') => void;
  onHistoryToggle: () => void;
  onPricingOpen: () => void;
  onAuthOpen: () => void;
}

export function Header({ formatStyle, onFormatChange, onHistoryToggle, onPricingOpen, onAuthOpen }: HeaderProps) {
  const { user, logout, isLoading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    }
    if (showMenu || showMobileMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu, showMobileMenu]);

  const planBadge = user && user.plan !== 'free' ? (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      user.plan === 'professional' ? 'bg-primary-100 text-primary-700' : 'bg-verified-50 text-verified-700'
    }`}>
      {user.plan === 'professional' ? 'PRO' : 'STU'}
    </span>
  ) : null;

  return (
    <header className="frosted border-b border-surface-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary-800 flex items-center justify-center text-white text-base md:text-lg shadow-soft">
            &#9878;
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold text-primary-900 tracking-tight">LegalCitation</h1>
            <p className="text-[10px] md:text-[11px] text-surface-400 font-medium tracking-wide hidden sm:block">Citation Checker & Builder</p>
          </div>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Format Toggle */}
          <div className="flex items-center bg-surface-100 rounded-xl p-1">
            <button
              onClick={() => onFormatChange('italics')}
              className={`px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                formatStyle === 'italics'
                  ? 'bg-white shadow-soft text-primary-900 font-medium'
                  : 'text-surface-400 hover:text-surface-600'
              }`}
            >
              <em>Italics</em>
            </button>
            <button
              onClick={() => onFormatChange('underline')}
              className={`px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                formatStyle === 'underline'
                  ? 'bg-white shadow-soft text-primary-900 font-medium'
                  : 'text-surface-400 hover:text-surface-600'
              }`}
            >
              <u>Underline</u>
            </button>
          </div>

          {/* History Button */}
          <button
            onClick={onHistoryToggle}
            className="w-9 h-9 flex items-center justify-center text-surface-400 hover:text-primary-700 hover:bg-surface-100 rounded-xl transition-all duration-200"
            title="Citation History"
            aria-label="Citation history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Pricing */}
          <button
            onClick={onPricingOpen}
            className="text-sm text-surface-500 hover:text-primary-700 font-medium transition-colors"
          >
            Pricing
          </button>

          {/* User / Auth */}
          {isLoading ? (
            <div className="w-9 h-9 rounded-xl bg-surface-100 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-100 transition-all duration-200"
                aria-expanded={showMenu}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex items-center justify-center">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                {planBadge}
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-surface-200 py-2 animate-scale-in origin-top-right">
                  <div className="px-4 py-2 border-b border-surface-100">
                    <p className="text-sm font-medium text-primary-900 truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-surface-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowMenu(false); onPricingOpen(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors flex items-center justify-between"
                  >
                    <span>Plan</span>
                    <span className="text-xs font-medium text-primary-600 capitalize">{user.plan}</span>
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); logout(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthOpen}
              className="btn-primary text-sm px-4 py-2"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1.5" ref={mobileMenuRef}>
          <button
            onClick={onHistoryToggle}
            className="w-9 h-9 flex items-center justify-center text-surface-400 hover:text-primary-700 hover:bg-surface-100 rounded-xl transition-all duration-200"
            title="Citation History"
            aria-label="Citation history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-9 h-9 flex items-center justify-center text-surface-500 hover:text-primary-700 hover:bg-surface-100 rounded-xl transition-all duration-200"
            aria-label="Menu"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {showMobileMenu && (
            <div className="absolute right-4 top-full mt-1 w-64 bg-white rounded-2xl shadow-elevated border border-surface-200 py-3 animate-scale-in origin-top-right z-50">
              {/* Format Toggle */}
              <div className="px-4 pb-3 border-b border-surface-100">
                <div className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Format Style</div>
                <div className="flex bg-surface-100 rounded-xl p-1">
                  <button
                    onClick={() => onFormatChange('italics')}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                      formatStyle === 'italics'
                        ? 'bg-white shadow-soft text-primary-900 font-medium'
                        : 'text-surface-400'
                    }`}
                  >
                    <em>Italics</em>
                  </button>
                  <button
                    onClick={() => onFormatChange('underline')}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                      formatStyle === 'underline'
                        ? 'bg-white shadow-soft text-primary-900 font-medium'
                        : 'text-surface-400'
                    }`}
                  >
                    <u>Underline</u>
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setShowMobileMenu(false); onPricingOpen(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
              >
                Pricing
              </button>

              {isLoading ? null : user ? (
                <>
                  <div className="px-4 py-2.5 border-t border-surface-100 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs flex items-center justify-center">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-900 truncate">{user.name || 'User'}</p>
                        <p className="text-[10px] text-surface-400 truncate">{user.email}</p>
                      </div>
                      {planBadge}
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowMobileMenu(false); onPricingOpen(); }}
                    className="w-full text-left px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 transition-colors flex items-center justify-between"
                  >
                    <span>Plan</span>
                    <span className="text-xs font-medium text-primary-600 capitalize">{user.plan}</span>
                  </button>
                  <button
                    onClick={() => { setShowMobileMenu(false); logout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="px-4 pt-2 border-t border-surface-100 mt-1">
                  <button
                    onClick={() => { setShowMobileMenu(false); onAuthOpen(); }}
                    className="btn-primary w-full text-sm py-2"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
