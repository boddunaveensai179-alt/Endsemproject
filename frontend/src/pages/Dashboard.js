/**
 * Dashboard Page
 * Displays library statistics and quick actions
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import {
  MdLibraryBooks,
  MdCheckCircle,
  MdAccessTime,
  MdCategory,
} from 'react-icons/md';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  getActivityLogs,
  getAllBooks,
  getCurrentUser,
  getErrorMessage,
  getRecommendations,
} from '../services/api';

const Dashboard = () => {

  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const isAdminUser = currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN';

  // ================= FETCH BOOKS =================

  useEffect(() => {

    fetchBooks();

  }, []);

  const fetchBooks = async () => {

    try {

      const [booksResult, recommendationsResult, activityResult] = await Promise.allSettled([
        getAllBooks(),
        currentUser ? getRecommendations(String(currentUser.id)) : Promise.resolve([]),
        currentUser ? getActivityLogs(String(currentUser.id)) : Promise.resolve([]),
      ]);

      if (booksResult.status === 'fulfilled') {
        setBooks(booksResult.value);
      } else {
        setError(getErrorMessage(booksResult.reason, 'Failed to load dashboard data'));
      }

      if (recommendationsResult.status === 'fulfilled') {
        setRecommendations(recommendationsResult.value);
      }

      if (activityResult.status === 'fulfilled') {
        setActivities(activityResult.value);
      }

    } catch (error) {

      console.error('Dashboard fetch error', error);

    } finally {

      setLoading(false);

    }
  };

  // ================= CALCULATIONS =================

  const totalBooks = books.length;

  // Available Books
  const availableBooks = books.reduce(
    (total, book) =>
      total + (book.availableCount || 0),
    0
  );

  // Borrowed Books
  const borrowedBooks = books.reduce(
    (total, book) =>
      total +
      (
        (book.totalCopies || 0) -
        (book.availableCount || 0)
      ),
    0
  );

  // Categories Count
  const uniqueCategories = [
    ...new Set(
      books.map((book) => book.category)
    ),
  ];

  const totalCategories = uniqueCategories.length;

  // Chart Data: Categories
  const categoryDataMap = {};
  books.forEach(b => {
    const cat = b.category || 'Uncategorized';
    categoryDataMap[cat] = (categoryDataMap[cat] || 0) + 1;
  });
  const categoryChartData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    count: categoryDataMap[key]
  }));

  // Chart Data: Book Availability (Top 5)
  const availabilityChartData = books.slice(0, 8).map(b => ({
    name: b.title.substring(0, 15) + (b.title.length > 15 ? '...' : ''),
    Available: b.availableCount || 0,
    Borrowed: (b.totalCopies || 0) - (b.availableCount || 0)
  }));

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <h1 className="text-2xl text-cyan-400">
          Loading Dashboard...
        </h1>

      </div>
    );
  }

  // ================= UI =================

  return (

    <div className="min-h-screen">

      {/* HEADER */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >

        <h1 className="text-5xl font-bold mb-3">
          Dashboard
        </h1>

        <p className="text-light-text/60 text-lg">
          Welcome to your Digital Library Management System
        </p>

      </motion.div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300">
          {error}
        </div>
      )}

      {/* STATS GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">

        {/* TOTAL BOOKS */}

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="glass p-6 rounded-2xl"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-light-text/60 mb-2">
                Total Books
              </p>

              <h2 className="text-4xl font-bold">
                {totalBooks}
              </h2>

            </div>

            <MdLibraryBooks className="text-cyan-400 text-5xl" />

          </div>

        </motion.div>

        {/* AVAILABLE */}

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="glass p-6 rounded-2xl"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-light-text/60 mb-2">
                Available Books
              </p>

              <h2 className="text-4xl font-bold text-green-400">
                {availableBooks}
              </h2>

            </div>

            <MdCheckCircle className="text-green-400 text-5xl" />

          </div>

        </motion.div>

        {/* BORROWED */}

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="glass p-6 rounded-2xl"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-light-text/60 mb-2">
                Borrowed Books
              </p>

              <h2 className="text-4xl font-bold text-yellow-400">
                {borrowedBooks}
              </h2>

            </div>

            <MdAccessTime className="text-yellow-400 text-5xl" />

          </div>

        </motion.div>

        {/* CATEGORIES */}

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="glass p-6 rounded-2xl"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-light-text/60 mb-2">
                Categories
              </p>

              <h2 className="text-4xl font-bold text-purple-400">
                {totalCategories}
              </h2>

            </div>

            <MdCategory className="text-purple-400 text-5xl" />

          </div>

        </motion.div>

      </div>

      {/* ADMIN CHARTS */}
      {isAdminUser && books.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Categories Chart */}
          <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Books per Category</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#ccc" tick={{ fill: '#ccc' }} />
                  <YAxis stroke="#ccc" tick={{ fill: '#ccc' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          
          {/* Availability Chart */}
          <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Top Books Availability</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={availabilityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#ccc" tick={{ fill: '#ccc', fontSize: 12 }} />
                  <YAxis stroke="#ccc" tick={{ fill: '#ccc' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Borrowed" stackId="a" fill="#facc15" />
                  <Bar dataKey="Available" stackId="a" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* RECENT BOOKS */}

      <div className="glass p-8 rounded-2xl mb-8">
        <h2 className="text-2xl font-bold mb-6">Recent Books</h2>

        <div className="space-y-4">
          {books.slice(0, 5).map((book) => (
            <div
              key={book.bookId}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-cyan-500/10"
            >
              <div>
                <h3 className="font-semibold text-lg">
                  {book.title}
                </h3>
                <p className="text-light-text/60">
                  {book.author}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 font-semibold">
                  {book.category}
                </p>
                <p className="text-sm text-light-text/60">
                  Available: {book.availableCount || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((item) => (
                <div key={item._id} className="p-4 bg-white/5 rounded-xl border border-cyan-500/10">
                  <p className="font-semibold">Book #{item.bookId}</p>
                  <p className="text-sm text-light-text/60">{item.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-light-text/60">Borrow a book to generate MongoDB-backed recommendations.</p>
          )}
        </div>

        <div className="glass p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 5).map((item) => (
                <div key={item._id} className="p-4 bg-white/5 rounded-xl border border-cyan-500/10">
                  <p className="font-semibold">{item.action}</p>
                  <p className="text-sm text-light-text/60">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-light-text/60">Activity logs will appear here after login, search, borrow, or return.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
