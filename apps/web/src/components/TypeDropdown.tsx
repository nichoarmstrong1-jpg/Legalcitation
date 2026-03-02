import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { CitationTypeConfig } from '@legalcitation/shared';
import { CITATION_TYPES, POPULAR_TYPES, CATEGORIES } from '@legalcitation/shared';
import { TypeIcon } from './TypeIcon.tsx';

interface TypeDropdownProps {
  selectedType: CitationTypeConfig;
  onTypeSelect: (type: CitationTypeConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function TypeDropdown({ selectedType, onTypeSelect, isOpen, onToggle }: TypeDropdownProps) {
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
          setDropdownSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle]);

  const handleToggle = useCallback(() => {
    onToggle();
    if (!isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setDropdownSearch('');
    }
  }, [isOpen, onToggle]);

  const handleTypeSelect = useCallback((type: CitationTypeConfig) => {
    onTypeSelect(type);
    setDropdownSearch('');
  }, [onTypeSelect]);

  const filteredTypes = useMemo(() => {
    if (!dropdownSearch.trim()) return CITATION_TYPES;
    const query = dropdownSearch.toLowerCase();
    return CITATION_TYPES.filter(
      t =>
        t.label.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.bluebookRule.toLowerCase().includes(query) ||
        CATEGORIES.find(c => c.id === t.categoryId)?.label.toLowerCase().includes(query),
    );
  }, [dropdownSearch]);

  const isSearching = dropdownSearch.trim().length > 0;

  const groupedTypes = useMemo(() => {
    if (isSearching) {
      return [{ label: 'Results', types: filteredTypes }];
    }
    return CATEGORIES.map(cat => ({
      label: cat.label,
      types: filteredTypes.filter(t => t.categoryId === cat.id),
    }));
  }, [filteredTypes, isSearching]);

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2.5 px-4 py-3.5 border-r border-gray-200 hover:bg-gray-50 transition-colors rounded-l-2xl min-w-[180px]"
      >
        <TypeIcon iconName={selectedType.icon} size={18} className="text-gray-600 flex-shrink-0" />
        <div className="text-left flex-1">
          <div className="text-[10px] font-medium text-gray-400 leading-none mb-0.5 uppercase tracking-wide">
            Source type
          </div>
          <div className="text-sm font-semibold text-gray-900 leading-tight">
            {selectedType.label}
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl border border-gray-200 overflow-hidden z-50"
          style={{ boxShadow: '0 8px 30px rgb(0 0 0 / 0.12)' }}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={dropdownSearch}
                onChange={(event) => setDropdownSearch(event.target.value)}
                placeholder="Find by name or Bluebook rule..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
            </div>
          </div>

          {/* Type list */}
          <div className="max-h-72 overflow-y-auto">
            {/* Popular types (when not searching) */}
            {!isSearching && (
              <div className="px-3 pt-2 pb-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Most Used
                </div>
                {POPULAR_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                      selectedType.id === type.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <TypeIcon iconName={type.icon} size={16} className="text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <div className="text-[11px] text-gray-400 truncate">{type.description}</div>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
                      {type.bluebookRule}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* All types by category */}
            <div className="px-3 pb-2">
              {!isSearching && (
                <div className="border-t border-gray-100 mt-1 pt-2 mb-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    All Types
                  </div>
                </div>
              )}
              {groupedTypes.map(group => {
                if (group.types.length === 0) return null;
                return (
                  <div key={group.label} className="mb-2">
                    {!isSearching && (
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-300 mt-2 mb-1 px-1">
                        {group.label}
                      </div>
                    )}
                    {group.types.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                          selectedType.id === type.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <TypeIcon iconName={type.icon} size={14} className="text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-800">{type.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{type.bluebookRule}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
              {filteredTypes.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-4">
                  No matching types found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
