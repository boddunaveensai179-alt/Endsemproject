/**
 * Navbar Component
 * Role-Based Navigation with Notification Bell
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdMenu,
  MdClose,
  MdLogout,
  MdPerson,
  MdDashboard,
  MdLibraryBooks,
  MdAdd,
  MdSearch,
  MdAssignmentReturn,
  MdNotifications,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfo,
} from 'react-icons/md';
import { getNotifications } from '../services/api';

const severityIcon = (severity) => {
  switch (severity) {
    case 'error':   return <MdError className="w-5 h-5 text-red-400 flex-shrink-0" />;
    case 'warning': return <MdWarning className="w-5 h-5 text-yellow-400 flex-shrink-0" />;
    case 'success': return <MdCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />;
    default:        return <MdInfo className="w-5 h-5 text-cyan-400 flex-shrink-0" />;
  }
};

const severityBg = (severity) => {
  switch (severity) {
    case 'error':   return 'border-red-500/30 bg-red-500/5';
    case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
    case 'success': return 'border-green-500/30 bg-green-500/5';
    default:        return 'border-cyan-500/20 bg-cyan-500/5';
  }
};

const Navbar = ({ onLogout, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const notifRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const role = user?.role || currentUser?.role;
  const isAdminUser = role === 'ADMIN' || role === 'ROLE_ADMIN';
  const isRegularUser = role === 'USER' || role === 'ROLE_USER';

  // Unread count = error + warning notifications
  const urgentCount = notifications.filter(
    n => n.severity === 'error' || n.severity === 'warning'
  ).length;

  // Fetch notifications when bell opened
  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError('');
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch {
      setNotifError('Could not load notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleBellClick = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) fetchNotifications();
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Eagerly fetch notification count on mount
  useEffect(() => {
    getNotifications()
      .then(data => setNotifications(data || []))
      .catch(() => {});
  }, []);

  return (
    <nav className="glass sticky top-0 z-40 border-b border-cyan-500/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">

          {/* LOGO */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <MdLibraryBooks className="w-6 h-6 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Digital Library
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-light-text/70 hover:text-cyan-400 transition-colors"
            >
              <MdDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/books"
              className="flex items-center gap-1 text-light-text/70 hover:text-cyan-400 transition-colors"
            >
              <MdLibraryBooks className="w-4 h-4" />
              Books
            </Link>

            <Link
              to="/search"
              className="flex items-center gap-1 text-light-text/70 hover:text-cyan-400 transition-colors"
            >
              <MdSearch className="w-4 h-4" />
              Search
            </Link>

            {/* ADMIN ONLY */}
            {isAdminUser && (
              <>
                <Link
                  to="/add-book"
                  className="flex items-center gap-1 text-light-text/70 hover:text-cyan-400 transition-colors"
                >
                  <MdAdd className="w-4 h-4" />
                  Add Book
                </Link>
                <Link
                  to="/users"
                  className="flex items-center gap-1 text-light-text/70 hover:text-cyan-400 transition-colors"
                >
                  <MdPerson className="w-4 h-4" />
                  Users
                </Link>
              </>
            )}

            {/* USER ONLY */}
            {isRegularUser && (
              <Link
                to="/my-borrows"
                className="flex items-center gap-1 text-light-text/70 hover:text-cyan-400 transition-colors"
              >
                <MdAssignmentReturn className="w-4 h-4" />
                My Borrows
              </Link>
            )}

            {/* Notifications page link for all users */}
            <Link
              to="/notifications"
              className="flex items-center gap-1 text-light-text/70 hover:text-cyan-400 transition-colors relative"
            >
              <MdNotifications className="w-4 h-4" />
              Alerts
              {urgentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {urgentCount}
                </span>
              )}
            </Link>
          </div>

          {/* RIGHT SECTION: Notif bell + user info + logout */}
          <div className="hidden md:flex items-center gap-4">

            {/* ===== NOTIFICATION BELL ===== */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell"
                onClick={handleBellClick}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Notifications"
              >
                <MdNotifications className="w-6 h-6 text-light-text/70 hover:text-cyan-400" />
                {urgentCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                    {urgentCount > 9 ? '9+' : urgentCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-96 max-h-[32rem] overflow-y-auto rounded-2xl border border-cyan-500/20 shadow-2xl z-50"
                    style={{ background: 'rgba(10, 18, 40, 0.97)', backdropFilter: 'blur(20px)' }}
                  >
                    {/* Header */}
                    <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-cyan-500/20"
                      style={{ background: 'rgba(10, 18, 40, 0.98)' }}
                    >
                      <div className="flex items-center gap-2">
                        <MdNotifications className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold text-light-text">Notifications</span>
                      </div>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        <MdClose className="w-4 h-4 text-light-text/60" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-3 space-y-2">
                      {notifLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        </div>
                      ) : notifError ? (
                        <div className="py-6 text-center text-sm text-red-400">{notifError}</div>
                      ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-light-text/60 text-sm">
                          <MdCheckCircle className="w-10 h-10 mx-auto text-green-400 mb-2" />
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-start gap-3 p-3 rounded-xl border ${severityBg(n.severity)}`}
                          >
                            {severityIcon(n.severity)}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-light-text leading-tight">{n.title}</p>
                              <p className="text-xs text-light-text/60 mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
              <MdPerson className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-light-text">
                {user?.name || 'User'}
              </span>
              <span className={`text-xs font-semibold ${isAdminUser ? 'text-purple-400' : 'text-cyan-400'}`}>
                ({role?.replace('ROLE_', '')})
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 btn-secondary text-sm"
            >
              <MdLogout className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Bell */}
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MdNotifications className="w-5 h-5 text-light-text/70" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {urgentCount > 9 ? '9+' : urgentCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded hover:bg-white/10 transition-colors"
            >
              {isOpen ? <MdClose className="w-6 h-6" /> : <MdMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Notification Panel */}
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-cyan-500/20 overflow-hidden"
            >
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                ) : notifications.map((n, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${severityBg(n.severity)}`}>
                    {severityIcon(n.severity)}
                    <div>
                      <p className="font-semibold text-sm text-light-text">{n.title}</p>
                      <p className="text-xs text-light-text/60 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE MENU */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 border-t border-cyan-500/20 pt-4 flex flex-col gap-4"
          >
            <Link
              to="/dashboard"
              className="px-2 text-light-text/70 hover:text-cyan-400"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/books"
              className="px-2 text-light-text/70 hover:text-cyan-400"
              onClick={() => setIsOpen(false)}
            >
              Books
            </Link>
            <Link
              to="/search"
              className="px-2 text-light-text/70 hover:text-cyan-400"
              onClick={() => setIsOpen(false)}
            >
              Search
            </Link>

            {isAdminUser && (
              <>
                <Link
                  to="/add-book"
                  className="px-2 text-light-text/70 hover:text-cyan-400"
                  onClick={() => setIsOpen(false)}
                >
                  Add Book
                </Link>
                <Link
                  to="/users"
                  className="px-2 text-light-text/70 hover:text-cyan-400"
                  onClick={() => setIsOpen(false)}
                >
                  Users
                </Link>
              </>
            )}

            {isRegularUser && (
              <Link
                to="/my-borrows"
                className="px-2 text-light-text/70 hover:text-cyan-400"
                onClick={() => setIsOpen(false)}
              >
                My Borrows
              </Link>
            )}

            <Link
              to="/notifications"
              className="px-2 text-light-text/70 hover:text-cyan-400 flex items-center gap-1"
              onClick={() => setIsOpen(false)}
            >
              <MdNotifications className="w-4 h-4" />
              Alerts {urgentCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{urgentCount}</span>}
            </Link>

            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="flex items-center gap-2 btn-secondary text-sm w-full justify-center"
            >
              <MdLogout className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
