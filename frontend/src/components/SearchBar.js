/**
 * SearchBar Component
 * Real-time search input with debouncing
 */

import React, { useState, useCallback } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';

const SearchBar = ({ onSearch, placeholder = 'Search books...' }) => {
  const [query, setQuery] = useState('');

  // Debounce search to avoid too many updates
  const handleSearch = useCallback((value) => {
    setQuery(value);
    // Trigger search with slight delay to avoid rapid updates
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center glass rounded-xl px-4 py-3">
        <MdSearch className="w-5 h-5 text-cyan-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none ml-3 text-light-text placeholder-light-text/50"
        />
        {query && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <MdClose className="w-5 h-5 text-light-text/60" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
