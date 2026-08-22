import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Search, X, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await apiClient.get(`/messages/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Search Form Header */}
          <form onSubmit={handleSearch} className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages across channels..."
              autoFocus
              className="flex-1 bg-transparent text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {loading && <p className="text-center text-xs text-gray-400 py-4">Searching...</p>}
            {!loading && results.length === 0 && query && (
              <p className="text-center text-xs text-gray-400 py-4">No matching messages found for "{query}"</p>
            )}
            {results.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <Hash className="w-3.5 h-3.5 mr-0.5" />
                      {item.channel_name}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {item.author?.display_name}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
