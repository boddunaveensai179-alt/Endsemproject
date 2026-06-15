/**
 * BookListing Page
 * Display all books in a modern card grid
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdLibraryBooks } from 'react-icons/md';

import BookCard from '../components/BookCard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

import {
  createActivityLog,
  createBorrow,
  createRecommendation,
  getAllBooks,
  getAllBorrows,
  getUserBorrows,
  getCurrentUser,
  getErrorMessage,
  deleteBook,
  updateBorrow,
  updateBook,
} from '../services/api';

const BookListing = () => {

  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    category: '',
    price: 0,
    totalCopies: 1,
    availableCount: 0,
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  // ================= FETCH BOOKS =================

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {

      setLoading(true);

      const isUser = currentUser?.role === 'USER' || currentUser?.role === 'ROLE_USER';
      const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN';

      const [bookResult, borrowResult] = await Promise.allSettled([
        getAllBooks(),
        // Users fetch only their own borrows; admins fetch all
        isUser && currentUser?.id
          ? getUserBorrows(currentUser.id)
          : isAdmin
            ? getAllBorrows()
            : Promise.resolve([]),
      ]);

      if (bookResult.status === 'fulfilled') {
        setBooks(bookResult.value);
      } else {
        throw bookResult.reason;
      }

      if (borrowResult.status === 'fulfilled') {
        setBorrows(borrowResult.value);
      }

    } catch (error) {

      console.error('Error fetching books:', error);

      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to load books'),
      });

    } finally {

      setLoading(false);

    }
  };

  // ================= EDIT =================

  const handleEdit = (book) => {

    setEditFormData({
      ...book,
    });

    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {

    try {

      const updatedBook = await updateBook(editFormData.bookId, editFormData);

      const updatedBooks = books.map((book) =>
        book.bookId === editFormData.bookId
          ? updatedBook
          : book
      );

      setBooks(updatedBooks);

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

  // ================= DELETE =================

  const handleDelete = async (bookId) => {

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this book?'
    );

    if (!confirmDelete) return;

    try {

      await deleteBook(bookId);

      const filteredBooks = books.filter(
        (book) => book.bookId !== bookId
      );

      setBooks(filteredBooks);

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

  // ================= BORROW =================

  const handleBorrow = async (book) => {
    if (!currentUser) return;

    try {
      await createBorrow({
        bookId: book.bookId,
      });

      await Promise.allSettled([
        createActivityLog({
          userId: String(currentUser.id),
          action: 'BORROW_BOOK',
          description: `Borrowed "${book.title}"`,
        }),
        createRecommendation({
          userId: String(currentUser.id),
          bookId: String(book.bookId),
          reason: `Recommended because you borrowed a ${book.category || 'library'} book`,
        }),
      ]);

      await fetchBooks();

      setToast({
        type: 'success',
        message: `"${book.title}" borrowed successfully`,
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to borrow book'),
      });
    }
  };

  // ================= RETURN =================

  const handleReturn = async (book, activeBorrow) => {
    if (!currentUser || !activeBorrow) return;

    try {
      // Send returned:true to match the boolean field in the Borrow entity
      await updateBorrow(activeBorrow.id, { returned: true });

      await createActivityLog({
        userId: String(currentUser.id),
        action: 'RETURN_BOOK',
        description: `Returned "${book.title}"`,
      }).catch(() => {});

      await fetchBooks();

      setToast({
        type: 'success',
        message: `"${book.title}" returned successfully`,
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to return book'),
      });
    }
  };

  // Active borrow = borrow for this book that is not yet returned
  const getActiveBorrowForBook = (bookId) => borrows.find(
    (borrow) => borrow.bookId === bookId && !borrow.returned && borrow.status !== 'RETURNED'
  );

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

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >

        <h1 className="text-4xl font-bold mb-2">
          All Books
        </h1>

        <p className="text-light-text/60">
          Browse our library collection
        </p>

      </motion.div>

      {/* BOOK GRID */}

      {books.length > 0 ? (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {books.map((book, index) => (

            <motion.div
              key={book.bookId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >

              <BookCard
                book={book}
                isFavorite={favorites.includes(book.bookId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onFavorite={handleFavorite}
                onBorrow={handleBorrow}
                onReturn={handleReturn}
                activeBorrow={getActiveBorrowForBook(book.bookId)}
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

          <MdLibraryBooks className="w-16 h-16 text-cyan-500/30 mb-4" />

          <h3 className="text-xl font-semibold mb-2">
            No Books Found
          </h3>

          <p className="text-light-text/60">
            Add your first book to get started
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

          {/* AVAILABLE COUNT */}

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

      {/* TOAST */}

      {toast && (

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />

      )}

    </div>
  );
};

export default BookListing;
