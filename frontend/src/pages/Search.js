/**
 * Search Page
 * Real-time search and filtering functionality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MdSearch } from 'react-icons/md';

import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import BookCard from '../components/BookCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

import {
  createActivityLog,
  createSearchHistory,
  getAllBooks,
  getCurrentUser,
  getErrorMessage,
  getSearchHistory,
  deleteBook,
  updateBook,
} from '../services/api';

const Search = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('favorites') || '[]'
      );
    } catch {
      return [];
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    category: '',
    price: 0,
    totalCopies: 1,
    availableCount: 0,
  });

  const handleEdit = (book) => {
    setEditFormData({ ...book });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedBook = await updateBook(editFormData.bookId, editFormData);
      setBooks(books => books.map((b) => b.bookId === editFormData.bookId ? updatedBook : b));
      setFilteredBooks(filtered => filtered.map((b) => b.bookId === editFormData.bookId ? updatedBook : b));
      setIsEditModalOpen(false);
      setToast({
        type: 'success',
        message: 'Book updated successfully',
      });
    } catch (error) {
      console.error(error);
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to update book'),
      });
    }
  };

  const handleDelete = async (bookId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this book?'
    );
    if (!confirmDelete) return;

    try {
      await deleteBook(bookId);
      setBooks(books => books.filter((b) => b.bookId !== bookId));
      setFilteredBooks(filtered => filtered.filter((b) => b.bookId !== bookId));
      setToast({
        type: 'success',
        message: 'Book deleted successfully',
      });
    } catch (error) {
      console.error(error);
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to delete book'),
      });
    }
  };

  // ================= FETCH BOOKS =================

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const [bookData, searchData] = await Promise.allSettled([
        getAllBooks(),
        currentUser ? getSearchHistory(String(currentUser.id)) : Promise.resolve([]),
      ]);

      if (bookData.status === 'fulfilled') {
        setBooks(bookData.value);
        setFilteredBooks(bookData.value);
      } else {
        throw bookData.reason;
      }

      if (searchData.status === 'fulfilled') {
        setRecentSearches(searchData.value);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to load search data'),
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER FUNCTION =================

  const filterBooks = useCallback(() => {
    let results = [...books];

    // SEARCH FILTER
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((book) => {
        return (
          book.title?.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query) ||
          book.category?.toLowerCase().includes(query)
        );
      });
    }

    // CATEGORY FILTER
    if (selectedCategory) {
      results = results.filter(
        (book) => book.category === selectedCategory
      );
    }

    setFilteredBooks(results);
  }, [books, searchQuery, selectedCategory]);

  // ================= RUN FILTER =================

  useEffect(() => {
    filterBooks();
  }, [filterBooks]);

  useEffect(() => {
    if (!currentUser || !searchQuery.trim()) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const savedSearch = await createSearchHistory({
          userId: String(currentUser.id),
          keyword: searchQuery.trim(),
        });
        setRecentSearches((items) => [savedSearch, ...items].slice(0, 5));
        createActivityLog({
          userId: String(currentUser.id),
          action: 'SEARCH_BOOK',
          description: `Searched for "${searchQuery.trim()}"`,
        }).catch(() => {});
      } catch (error) {
        setToast({
          type: 'warning',
          message: 'Search results are available, but search history could not be saved',
        });
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [currentUser, searchQuery]);

  // ================= FAVORITES =================

  const handleFavorite = (bookId) => {
    let updatedFavorites = [];
    if (favorites.includes(bookId)) {
      updatedFavorites = favorites.filter(
        (id) => id !== bookId
      );
    } else {
      updatedFavorites = [...favorites, bookId];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem(
      'favorites',
      JSON.stringify(updatedFavorites)
    );
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent to-cyan-500/5 pb-12">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <MdSearch className="text-cyan-400" />
          Search Books
        </h1>
        <p className="text-light-text/60">
          Find books by title, author, or category
        </p>
      </motion.div>

      {/* SEARCH AREA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-12"
      >
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search by title, author, or keyword..."
        />
        <CategoryFilter
          onFilter={setSelectedCategory}
        />
      </motion.div>

      {/* RESULTS COUNT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 text-sm text-light-text/60"
      >
        Found {filteredBooks.length}{' '}
        {filteredBooks.length === 1 ? 'result' : 'results'}
      </motion.div>

      {recentSearches.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {recentSearches.slice(0, 5).map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setSearchQuery(item.keyword)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-cyan-500/20 text-sm text-light-text/70 hover:text-cyan-300"
            >
              {item.keyword}
            </button>
          ))}
        </div>
      )}

      {/* BOOK GRID */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.bookId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <BookCard
                book={book}
                isFavorite={favorites.includes(book.bookId)}
                onFavorite={handleFavorite}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <MdSearch className="w-16 h-16 text-cyan-500/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No Books Found
          </h3>
          <p className="text-light-text/60">
            Try adjusting your search query or filter criteria
          </p>
        </motion.div>
      )}

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Book"
        size="lg"
      >
        <div className="space-y-4">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={editFormData.title || ''}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  title: e.target.value,
                })
              }
            />
          </div>

          {/* AUTHOR */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Author
            </label>
            <input
              type="text"
              value={editFormData.author || ''}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  author: e.target.value,
                })
              }
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>
            <input
              type="text"
              value={editFormData.category || ''}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  category: e.target.value,
                })
              }
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editFormData.price ?? 0}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  price: Number(e.target.value),
                })
              }
            />
          </div>

          {/* TOTAL COPIES */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Copies
            </label>
            <input
              type="number"
              min="1"
              value={editFormData.totalCopies ?? 1}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  totalCopies: Number(e.target.value),
                })
              }
            />
          </div>

          {/* AVAILABLE COUNT */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Available Count
            </label>
            <input
              type="number"
              min="0"
              value={editFormData.availableCount ?? 0}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  availableCount: Number(e.target.value),
                })
              }
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveEdit}
              className="flex-1 btn-primary py-2 rounded-lg font-semibold"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 btn-secondary py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
};

export default Search;
