import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command, ArrowRight, CornerDownLeft, Loader2, Layers } from 'lucide-react';
import { searchService } from '../../services/search.service';
import { SearchResultItem } from '../../types/search';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const GlobalSearchCommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Listen for Ctrl+K, Cmd+K, or Slash (/) keyboard shortcuts to trigger global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchService.search(query);
        setResults(res.flattened || []);
        setTotalCount(res.totalCount || 0);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    navigate(item.route);
  };

  const handleViewAllResults = () => {
    setIsOpen(false);
    navigate(`${ERP_BASE_PATH}/search/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      {/* Topbar Search Button Entry Point */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition w-48 lg:w-64 text-xs group"
      >
        <div className="flex items-center space-x-2 truncate">
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span className="truncate">Search ERP modules...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Command Palette Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Input Header */}
            <div className="relative p-4 border-b border-slate-800 flex items-center">
              <Search className="w-5 h-5 text-blue-400 absolute left-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers, products, sales orders, POs, documents..."
                className="w-full pl-10 pr-10 py-2 bg-transparent text-slate-100 text-sm font-medium focus:outline-none placeholder-slate-500"
              />
              {loading ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin absolute right-5" />
              ) : query ? (
                <button onClick={() => setQuery('')} className="absolute right-5 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Results Section */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/60 custom-scrollbar">
              {!query.trim() ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <p className="font-semibold text-slate-400 mb-1">Quick Search Command Palette</p>
                  <p>Type an order number, customer name, SKU, document title, or employee code...</p>
                </div>
              ) : loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Searching ERP data...</div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No matching records found for <span className="font-bold text-white">"{query}"</span>.
                </div>
              ) : (
                results.slice(0, 7).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-semibold uppercase">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{item.module}</span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            {query.trim() && results.length > 0 && (
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Showing top {Math.min(7, results.length)} of {totalCount} matches</span>
                <button
                  onClick={handleViewAllResults}
                  className="text-blue-400 font-semibold hover:underline flex items-center space-x-1"
                >
                  <span>View All Search Results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
