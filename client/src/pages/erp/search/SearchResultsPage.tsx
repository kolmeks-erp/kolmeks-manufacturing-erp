import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Layers, ArrowRight, CornerDownLeft } from 'lucide-react';
import { searchService } from '../../../services/search.service';
import { SearchResultItem } from '../../../types/search';
import { EmptyState } from '../../../components/erp/EmptyState';
import { LoadingState } from '../../../components/erp/LoadingState';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [moduleFilter, setModuleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  const executeSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await searchService.search(term);
      setResults(res.flattened || []);
      setTotalCount(res.totalCount || 0);
      setActiveQuery(term);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query });
    executeSearch(query);
  };

  const filteredResults = moduleFilter
    ? results.filter((r) => r.module.toLowerCase().includes(moduleFilter.toLowerCase()))
    : results;

  const modulesAvailable = Array.from(new Set(results.map((r) => r.module)));

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Search className="w-7 h-7 text-blue-400" />
            <span>Cross-Module Global ERP Search</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search authorized records across Sales, Procurement, Inventory, Production, Quality, Maintenance, HR, Documents, and Workflows.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by SKU, customer, PO number, document name, employee code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Module Filter Tabs */}
      {results.length > 0 && (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-3 shadow-lg flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 px-3 flex items-center space-x-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Filter Module:</span>
          </span>
          <button
            onClick={() => setModuleFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              moduleFilter === ''
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            All Modules ({results.length})
          </button>
          {modulesAvailable.map((mod) => (
            <button
              key={mod}
              onClick={() => setModuleFilter(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                moduleFilter === mod
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {mod} ({results.filter((r) => r.module === mod).length})
            </button>
          ))}
        </div>
      )}

      {/* Results Container */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg p-6 min-h-[300px]">
        {loading ? (
          <LoadingState message="Executing server-side search across authorized ERP modules..." />
        ) : !activeQuery.trim() ? (
          <EmptyState
            title="Global ERP Search"
            description="Enter any keyword, identifier, or code above to search across the ERP platform."
          />
        ) : filteredResults.length === 0 ? (
          <EmptyState
            title="No Matching Records Found"
            description={`We couldn't find any authorized records matching "${activeQuery}". Try adjusting your search query or module filters.`}
          />
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Found {filteredResults.length} result(s) for "{activeQuery}"
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className="bg-slate-900/80 hover:bg-slate-700/40 border border-slate-700/60 rounded-xl p-4 cursor-pointer transition shadow-md flex items-start justify-between group"
                >
                  <div className="space-y-1.5 min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-semibold uppercase">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate">{item.subtitle}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                      <span>Module: {item.module}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold uppercase">{item.badge}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white rounded-lg transition-colors shrink-0">
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
