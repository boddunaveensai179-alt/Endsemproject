import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_books: 0,
    available_books: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        // Set mock data for demo
        setStats({
          total_books: 150,
          available_books: 120,
          categories: 12,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Welcome to Digital Library Management System</p>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <div className="stats-grid">
          <StatCard
            title="Total Books"
            value={stats.total_books}
            icon="📚"
            color="blue"
          />
          <StatCard
            title="Available Books"
            value={stats.available_books}
            icon="✓"
            color="green"
          />
          <StatCard
            title="Categories"
            value={stats.categories}
            icon="📂"
            color="orange"
          />
        </div>
      )}

      <div className="dashboard-info">
        <div className="info-card">
          <h2>Quick Guide</h2>
          <ul>
            <li>📚 <strong>Books</strong> - View all books in the library</li>
            <li>➕ <strong>Add Book</strong> - Add a new book to the library</li>
            <li>🔍 <strong>Search</strong> - Search using semantic search</li>
            <li>📊 <strong>Dashboard</strong> - View statistics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
