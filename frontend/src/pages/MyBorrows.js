/**
 * MyBorrows Page
 * Shows borrows for the currently logged-in user, with overdue/fee alerts
 */
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAccessTime,
  MdAssignmentReturn,
  MdLibraryBooks,
  MdWarning,
  MdCheckCircle,
  MdError,
} from 'react-icons/md';

import Loader from '../components/Loader';
import Toast from '../components/Toast';
import {
  createActivityLog,
  getAllBooks,
  getCurrentUser,
  getErrorMessage,
  getUserBorrows,
  updateBorrow,
} from '../services/api';

const BORROW_LIMIT_DAYS = 14;  // Days before overdue
const WARNING_DAYS = 7;         // Days before "due soon" warning

const MyBorrows = () => {
  const currentUser = getCurrentUser();
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    fetchBorrowData();
  }, []);

  const fetchBorrowData = async () => {
    try {
      setLoading(true);
      if (!currentUser?.id) return;

      const [bookData, borrowData] = await Promise.all([
        getAllBooks(),
        getUserBorrows(currentUser.id),  // Only fetch THIS user's borrows
      ]);
      setBooks(bookData || []);
      setBorrows(borrowData || []);
    } catch (error) {
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to load borrowed books'),
      });
    } finally {
      setLoading(false);
    }
  };

  const bookMap = useMemo(() => {
    return books.reduce((map, book) => {
      map[book.bookId] = book;
      return map;
    }, {});
  }, [books]);

  const handleReturn = async (borrow) => {
    const book = bookMap[borrow.bookId];
    setReturningId(borrow.id);
    try {
      await updateBorrow(borrow.id, { returned: true });
      await createActivityLog({
        userId: String(currentUser?.id),
        action: 'RETURN_BOOK',
        description: `Returned "${book?.title || `Book #${borrow.bookId}`}"`,
      }).catch(() => {});

      await fetchBorrowData();
      setToast({ type: 'success', message: 'Book returned successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: getErrorMessage(error, 'Failed to return book') });
    } finally {
      setReturningId(null);
    }
  };

  // Compute days borrowed and overdue status
  const getBorrowStatus = (borrow) => {
    if (borrow.returned || borrow.status === 'RETURNED') return { type: 'returned', days: 0 };
    const borrowDate = new Date(borrow.borrowDate);
    const today = new Date();
    const days = Math.floor((today - borrowDate) / (1000 * 60 * 60 * 24));
    if (days >= BORROW_LIMIT_DAYS) return { type: 'overdue', days };
    if (days >= WARNING_DAYS) return { type: 'warning', days };
    return { type: 'active', days };
  };

  // Stats — handle both boolean returned and status string
  const activeBorrows = borrows.filter(b => !b.returned && b.status !== 'RETURNED');
  const returnedBorrows = borrows.filter(b => b.returned || b.status === 'RETURNED');
  const overdueBorrows = activeBorrows.filter(b => getBorrowStatus(b).type === 'overdue');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading your borrowed books..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">My Borrowed Books</h1>
        <p className="text-light-text/60">
          Track your borrowed books, due dates, and return history
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="glass p-4 rounded-xl flex items-center gap-3">
          <MdLibraryBooks className="w-8 h-8 text-cyan-400" />
          <div>
            <p className="text-light-text/60 text-xs">Currently Borrowed</p>
            <p className="text-2xl font-bold">{activeBorrows.length}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass p-4 rounded-xl flex items-center gap-3">
          <MdCheckCircle className="w-8 h-8 text-green-400" />
          <div>
            <p className="text-light-text/60 text-xs">Returned</p>
            <p className="text-2xl font-bold text-green-400">{returnedBorrows.length}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass p-4 rounded-xl flex items-center gap-3 col-span-2 md:col-span-1">
          <MdError className="w-8 h-8 text-red-400" />
          <div>
            <p className="text-light-text/60 text-xs">Overdue</p>
            <p className="text-2xl font-bold text-red-400">{overdueBorrows.length}</p>
          </div>
        </motion.div>
      </div>

      {/* Overdue Alert Banner */}
      <AnimatePresence>
        {overdueBorrows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl border border-red-500/40 bg-red-500/10 flex items-start gap-3"
          >
            <MdError className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">
                ⚠️ You have {overdueBorrows.length} overdue book{overdueBorrows.length > 1 ? 's' : ''}!
              </p>
              <p className="text-sm text-red-300/70 mt-1">
                Books kept beyond {BORROW_LIMIT_DAYS} days may incur late fees. Please return them as soon as possible.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Borrow List */}
      {borrows.length > 0 ? (
        <div className="grid gap-4">
          {borrows.map((borrow) => {
            const book = bookMap[borrow.bookId];
            const isReturned = borrow.status === 'RETURNED';
            const status = getBorrowStatus(borrow);
            const isReturning = returningId === borrow.id;

            return (
              <motion.div
                key={borrow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass p-5 rounded-xl border-l-4 ${
                  isReturned
                    ? 'border-green-500/50'
                    : status.type === 'overdue'
                    ? 'border-red-500/70'
                    : status.type === 'warning'
                    ? 'border-yellow-500/60'
                    : 'border-cyan-500/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isReturned ? 'bg-green-500/10' :
                        status.type === 'overdue' ? 'bg-red-500/10' :
                        status.type === 'warning' ? 'bg-yellow-500/10' :
                        'bg-cyan-500/10'
                      }`}>
                        <MdLibraryBooks className={`w-6 h-6 ${
                          isReturned ? 'text-green-400' :
                          status.type === 'overdue' ? 'text-red-400' :
                          status.type === 'warning' ? 'text-yellow-400' :
                          'text-cyan-400'
                        }`} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {book?.title || `Book #${borrow.bookId}`}
                        </h2>
                        <p className="text-light-text/60 text-sm">
                          {book?.author || 'Unknown author'}
                          {book?.category && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              {book.category}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-light-text/50 mt-1">
                          📅 Borrowed on: <strong>{borrow.borrowDate}</strong>
                          {isReturned && borrow.returnDate && (
                            <span className="ml-2">· Returned: <strong>{borrow.returnDate}</strong></span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Status Badge */}
                    {isReturned ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                        <MdCheckCircle className="w-3.5 h-3.5" />
                        Returned
                      </span>
                    ) : status.type === 'overdue' ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                        <MdError className="w-3.5 h-3.5" />
                        Overdue ({status.days} days)
                      </span>
                    ) : status.type === 'warning' ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        <MdWarning className="w-3.5 h-3.5" />
                        Due Soon ({status.days} days)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <MdAccessTime className="w-3.5 h-3.5" />
                        Active ({status.days} days)
                      </span>
                    )}

                    {/* Return Button */}
                    {!isReturned && (
                      <button
                        onClick={() => handleReturn(borrow)}
                        disabled={isReturning}
                        className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
                      >
                        {isReturning ? (
                          <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        ) : (
                          <MdAssignmentReturn className="w-4 h-4" />
                        )}
                        {isReturning ? 'Returning...' : 'Return Book'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Fee warning for overdue */}
                {!isReturned && status.type === 'overdue' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-red-500/20 flex items-center gap-2 text-xs text-red-300/80"
                  >
                    <MdWarning className="w-4 h-4 text-red-400" />
                    This book has been borrowed for <strong>{status.days} days</strong>.
                    Late return fees may apply. Return immediately to avoid charges.
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass p-10 rounded-xl text-center">
          <MdLibraryBooks className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Borrowed Books</h2>
          <p className="text-light-text/60">
            Visit the <strong>Books</strong> page to borrow your first book!
          </p>
        </div>
      )}

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

export default MyBorrows;
