import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/api';
import '../styles/AddBook.css';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    available: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const categories = [
    'Programming',
    'Web Development',
    'AI/ML',
    'Database',
    'Cloud',
    'DevOps',
    'Mobile',
    'Other',
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required';
    if (formData.isbn.trim().length < 10)
      newErrors.isbn = 'ISBN must be at least 10 characters';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await bookService.addBook(formData);
      setSuccess('Book added successfully!');
      setTimeout(() => {
        navigate('/books');
      }, 1500);
    } catch (err) {
      setErrors({
        submit: err.response?.data?.detail || 'Failed to add book',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addbook-container">
      <div className="form-card">
        <h1 className="form-title">Add New Book</h1>

        {success && <div className="success-message">{success}</div>}
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-group">
            <label htmlFor="title">Book Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              disabled={loading}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
              disabled={loading}
            />
            {errors.author && (
              <span className="error-text">{errors.author}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="error-text">{errors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN *</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="Enter ISBN (10 or 13 digits)"
              disabled={loading}
            />
            {errors.isbn && <span className="error-text">{errors.isbn}</span>}
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="available">Book is Available</label>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
