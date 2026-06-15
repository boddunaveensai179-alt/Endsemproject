/**
 * BookCard Component
 * Displays a single book with role-based actions
 */

import React from 'react';

import { motion } from 'framer-motion';

import {
  MdEdit,
  MdDelete,
  MdFavoriteBorder,
  MdFavorite,
  MdDownload,
  MdSystemUpdate,
} from 'react-icons/md';

const BookCard = ({
  book,
  isFavorite = false,
  onEdit,
  onDelete,
  onFavorite,
  onBorrow,
  onReturn,
  activeBorrow,
}) => {

  // ======================================================
  // ================= CURRENT USER =======================
  // ======================================================

  const currentUser = JSON.parse(
    localStorage.getItem('currentUser')
  );

  const role = currentUser?.role;
  const isAdminUser = role === 'ADMIN' || role === 'ROLE_ADMIN';
  const isRegularUser = role === 'USER' || role === 'ROLE_USER';

  // ======================================================
  // ================= AVAILABILITY STATUS ================
  // ======================================================

  const getAvailabilityStatus = () => {

    if (book.availableCount > 0) {

      if (book.availableCount <= 2) {

        return {
          text: 'Limited Copies',
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
        };
      }

      return {
        text: 'Available',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
      };
    }

    return {
      text: 'Not Available',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    };
  };

  const status = getAvailabilityStatus();

  // ======================================================
  // ================= UI =================================
  // ======================================================

  return (

    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="glass p-5 rounded-xl hover:shadow-glow-lg transition-all duration-300"
    >

      {/* HEADER */}

      <div className="flex justify-between items-start mb-4">

        <div className="flex-1">

          <h3 className="text-lg font-bold text-light-text truncate">

            {book.title}

          </h3>

          <p className="text-sm text-light-text/60">

            {book.author}

          </p>

        </div>

        {/* FAVORITE BUTTON */}

        {isRegularUser && (

          <button
            onClick={() =>
              onFavorite?.(book.bookId)
            }
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >

            {isFavorite ? (

              <MdFavorite className="w-5 h-5 text-red-500" />

            ) : (

              <MdFavoriteBorder className="w-5 h-5 text-light-text/50" />

            )}

          </button>

        )}

      </div>

      {/* CATEGORY + STATUS */}

      <div className="flex gap-2 mb-4 flex-wrap">

        <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-medium">

          {book.category || 'Uncategorized'}

        </span>

        <span
          className={`text-xs px-2 py-1 rounded ${status.bg} ${status.color} font-medium`}
        >

          {status.text} ({book.availableCount})

        </span>

      </div>

      {/* ACTION BUTTONS */}

      <div className="flex gap-2 flex-wrap">

        {/* USER BORROW BUTTON */}

        {isRegularUser && activeBorrow && onReturn && (

          <button
            onClick={() =>
              onReturn?.(book, activeBorrow)
            }
            className="flex-1 min-w-max btn-secondary text-sm"
          >

            <MdSystemUpdate className="w-4 h-4 inline mr-1" />

            Return

          </button>

        )}

        {/* USER BORROW BUTTON */}

        {isRegularUser && !activeBorrow && book.availableCount > 0 && onBorrow && (

          <button
            onClick={() =>
              onBorrow?.(book)
            }
            className="flex-1 min-w-max btn-primary text-sm"
          >

            <MdDownload className="w-4 h-4 inline mr-1" />

            Borrow

          </button>

        )}

        {/* ADMIN EDIT BUTTON */}

        {isAdminUser && (

          <button
            onClick={() =>
              onEdit?.(book)
            }
            className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
            title="Edit"
          >

            <MdEdit className="w-4 h-4" />

          </button>

        )}

        {/* ADMIN DELETE BUTTON */}

        {isAdminUser && (

          <button
            onClick={() =>
              onDelete?.(book.bookId)
            }
            className="px-3 py-2 rounded-lg btn-danger"
            title="Delete"
          >

            <MdDelete className="w-4 h-4" />

          </button>

        )}

      </div>

      {/* AVAILABILITY BAR */}

      <div className="mt-4 pt-4 border-t border-cyan-500/20">

        <div className="flex justify-between items-center mb-2">

          <span className="text-xs text-light-text/60">

            Availability

          </span>

          <span className="text-xs font-bold text-cyan-400">

            {book.availableCount}

          </span>

        </div>

        <div className="w-full bg-white/10 rounded-full h-2">

          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${book.totalCopies > 0
                ? Math.min((book.availableCount / book.totalCopies) * 100, 100)
                : 0}%`,
            }}
          />

        </div>

      </div>

    </motion.div>
  );
};

export default BookCard;
