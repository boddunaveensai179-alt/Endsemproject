import React, { useState } from 'react';
import { searchService } from '../services/api';
import '../styles/Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await searchService.semanticSearch(query);
      setResults(response.data.results || []);
    } catch (err) {
      setError('Search failed. Please try again.');
      // Mock results for demo
      setResults([
        {
          id: 1,
          title: 'Python Basics',
          author: 'John Doe',
          category: 'Programming',
          relevance: 0.95,
        },
        {
          id: 2,
          title: 'Advanced Python',
          author: 'Jane Smith',
          category: 'Programming',
          relevance: 0.87,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Semantic Search</h1>
      <p className="search-subtitle">
        Find books using intelligent semantic search
      </p>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books by title, author, or topic..."
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="search-btn"
            disabled={loading}
          >
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searched && (
        <div className="results-section">
          {loading ? (
            <div className="loading">Searching...</div>
          ) : results.length === 0 ? (
            <div className="no-results">
              <p>No books found matching your search.</p>
              <p>Try different keywords!</p>
            </div>
          ) : (
            <>
              <h2 className="results-title">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </h2>
              <div className="results-grid">
                {results.map((result) => (
                  <div key={result.id} className="result-card">
                    <h3 className="result-title">{result.title}</h3>
                    <p className="result-author">by {result.author}</p>
                    <div className="result-details">
                      <span className="result-category">
                        {result.category}
                      </span>
                      {result.relevance && (
                        <span className="result-relevance">
                          Match: {(result.relevance * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!searched && (
        <div className="search-info">
          <div className="info-card">
            <h3>💡 How it works</h3>
            <ul>
              <li>Enter keywords related to books you're looking for</li>
              <li>Our system uses semantic search to find relevant books</li>
              <li>Results show matching books with relevance scores</li>
              <li>Try searching for topics, authors, or book titles</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
