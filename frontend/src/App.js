/**
 * App Component
 * Main application entry point with routing and authentication
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BookListing from './pages/BookListing';
import AddBook from './pages/AddBook';
import MyBorrows from './pages/MyBorrows';
import Search from './pages/Search';
import UsersManagement from './pages/UsersManagement';
import NotificationsPage from './pages/Notifications';

// Components
import Navbar from './components/Navbar';

// Services
import { logout, getCurrentUser, isAuthenticated } from './services/api';


/**
 * Protected Route Wrapper
 * Checks authentication before rendering protected routes
 */
const ProtectedRoute = ({ element, isAuthenticated, allowedRoles }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (allowedRoles) {
    const userRole = user?.role || '';
    const cleanUserRole = userRole.replace('ROLE_', '');
    const cleanAllowedRoles = allowedRoles.map(role => role.replace('ROLE_', ''));
    if (!cleanAllowedRoles.includes(cleanUserRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
};

/**
 * Main App Component
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state from localStorage — runs on mount and when storage changes
  const syncAuth = () => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      setCurrentUser(getCurrentUser());
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncAuth();       // initial check
    setLoading(false);

    // Re-sync when another tab / full-page reload writes to localStorage
    // (fires when window.location.href changes after login/signup)
    window.addEventListener('storage', syncAuth);

    // Periodically verify the token hasn't expired (every 60 s)
    const intervalId = setInterval(() => {
      if (!isAuthenticated()) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    }, 60_000);

    return () => {
      window.removeEventListener('storage', syncAuth);
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-dark to-primary-blue/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-light-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-blue/10 to-primary-dark text-light-text">
        {/* Show navbar only for authenticated users */}
        {isLoggedIn && <Navbar onLogout={handleLogout} user={currentUser} />}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <main className={isLoggedIn ? 'container mx-auto px-4 py-8' : ''}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  isLoggedIn ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login />
                  )
                }
              />
              <Route
                path="/signup"
                element={
                  isLoggedIn ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Signup />
                  )
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    element={<Dashboard />}
                    isAuthenticated={isLoggedIn}
                  />
                }
              />
              <Route
                path="/books"
                element={
                  <ProtectedRoute
                    element={<BookListing />}
                    isAuthenticated={isLoggedIn}
                  />
                }
              />
              <Route
                path="/my-borrows"
                element={
                  <ProtectedRoute
                    element={<MyBorrows />}
                    isAuthenticated={isLoggedIn}
                    allowedRoles={['USER']}
                  />
                }
              />
              <Route
                path="/add-book"
                element={
                  <ProtectedRoute
                    element={<AddBook />}
                    isAuthenticated={isLoggedIn}
                    allowedRoles={['ADMIN']}
                  />
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute
                    element={<UsersManagement />}
                    isAuthenticated={isLoggedIn}
                    allowedRoles={['ADMIN']}
                  />
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute
                    element={<Search />}
                    isAuthenticated={isLoggedIn}
                  />
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute
                    element={<NotificationsPage />}
                    isAuthenticated={isLoggedIn}
                  />
                }
              />
              {/* Default Route */}
              <Route
                path="/"
                element={
                  <Navigate
                    to={isLoggedIn ? '/dashboard' : '/login'}
                    replace
                  />
                }
              />
              {/* 404 Catch-all */}
              <Route
                path="*"
                element={
                  isLoggedIn ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </main>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
