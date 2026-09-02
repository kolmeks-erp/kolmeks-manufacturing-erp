import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, CornerDownLeft } from 'lucide-react';
import { searchService } from '../../../services/search.service';
import { SearchResultItem } from '../../../types/search';
import { EmptyState } from '../../../components/erp/EmptyState';
import { LoadingState } from '../../../components/erp/LoadingState';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [activeQuery, setActiveQuery] = useState(queryParam);
  const [moduleFilter, setModuleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  const executeSearch = async (term: string) => {
    const trimmed = term.trim();
    setActiveQuery(trimmed);
    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await searchService.search(trimmed);
      setResults(res?.flattened || []);
      setTotalCount(res?.totalCount || 0);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam.trim()) {
      executeSearch(queryParam);
    } else {
      setActiveQuery('');
      setResults([]);
      setTotalCount(0);
    }
  }, [queryParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
  };

  const filteredResults = moduleFilter
    ? results.filter((r) => r.module.toLowerCase().includes(moduleFilter.toLowerCase()))
    : results;

  const modulesAvailable = Array.from(new Set(results.map((r) => r.module)));

  return (
    <div className="space-y-6">
      {/* Search Header Card */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Cross-Module Global ERP Search
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                Instant search across Products, Customers, Suppliers, Orders, Quality, HR, and Documents.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, customer, PO number, document name, employee code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#0B1E36] hover:bg-[#0F2C59] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-xs flex items-center justify-center space-x-2 shrink-0"
          >
            <span>Search Records</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Module Filter Tabs */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 flex items-center space-x-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Filter Module:</span>
          </span>
          <button
            onClick={() => setModuleFilter('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              moduleFilter === ''
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Modules ({results.length})
          </button>
          {modulesAvailable.map((mod) => (
            <button
              key={mod}
              onClick={() => setModuleFilter(mod)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                moduleFilter === mod
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {mod} ({results.filter((r) => r.module === mod).length})
            </button>
          ))}
        </div>
      )}

      {/* Results Container */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 min-h-[350px]">
        {loading ? (
          <LoadingState message="Executing server-side search across authorized ERP modules..." />
        ) : !activeQuery.trim() ? (
          <EmptyState
            title="Global ERP Search"
            description="Enter any keyword, product code, customer name, order number, or drawing ID above to query all system modules."
          />
        ) : filteredResults.length === 0 ? (
          <EmptyState
            title="No Matching Records Found"
            description={`We couldn't find any authorized records matching "${activeQuery}". Try adjusting your search query or clear module filters.`}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span>Found {filteredResults.length} matching result(s) for "{activeQuery}"</span>
              <span>Total: {totalCount}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className="bg-slate-50/80 dark:bg-[#071220] hover:bg-blue-50/60 dark:hover:bg-[#132d54]/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 rounded-xl p-4 cursor-pointer transition-all shadow-xs flex items-start justify-between group"
                >
                  <div className="space-y-1.5 min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{item.subtitle}</p>
                    <div className="flex items-center space-x-2 text-[10px] font-mono mt-2">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{item.module}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded font-bold uppercase">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:bg-blue-600 group-hover:border-blue-600 text-slate-400 dark:text-slate-400 group-hover:text-white rounded-lg transition-all shrink-0 shadow-xs">
                    <CornerDownLeft className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
