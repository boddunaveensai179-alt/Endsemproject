import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import '../styles/BookListing.css';

const BookListing = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAllBooks();
      setBooks(response.data);
    } catch (err) {
      setError('Failed to load books');
      // Mock data for demo
      setBooks([
        {
          id: 1,
          title: 'Python Basics',
          author: 'John Doe',
          category: 'Programming',
          available: true,
        },
        {
          id: 2,
          title: 'Web Development',
          author: 'Jane Smith',
          category: 'Web',
          available: true,
        },
        {
          id: 3,
          title: 'Data Science',
          author: 'Mike Johnson',
          category: 'AI/ML',
          available: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(id);
        setBooks(books.filter((book) => book.id !== id));
      } catch (err) {
        alert('Failed to delete book');
      }
    }
  };

  return (
    <div className="booklisting-container">
      <h1 className="page-title">Books Catalog</h1>
      
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <p>No books found. Add a new book to get started!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="title-cell">{book.title}</td>
                  <td>{book.author}</td>
                  <td>
                    <span className="category-badge">{book.category}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        book.available ? 'available' : 'unavailable'
                      }`}
                    >
                      {book.available ? '✓ Available' : '✗ Not Available'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(book.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookListing;
