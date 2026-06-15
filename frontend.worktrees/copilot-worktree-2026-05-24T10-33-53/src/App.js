import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookListing from './pages/BookListing';
import AddBook from './pages/AddBook';
import Search from './pages/Search';
import './styles/Global.css';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Public route */}
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/books"
              element={isLoggedIn ? <BookListing /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/add-book"
              element={isLoggedIn ? <AddBook /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/search"
              element={isLoggedIn ? <Search /> : <Navigate to="/login" replace />}
            />

            {/* Default route */}
            <Route
              path="/"
              element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
