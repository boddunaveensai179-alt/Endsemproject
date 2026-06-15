import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  addBook,
  createActivityLog,
  getCurrentUser,
  getErrorMessage,
  isAdmin,
} from '../services/api';
import Toast from '../components/Toast';

const AddBook = () => {

  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Programming',
    price: '',
    totalCopies: '',
    availableCount: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const categories = [
    'Programming',
    'AI',
    'Science',
    'Technology',
    'Database',
    'Web Development',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!isAdmin()) {
      setToast({
        type: 'error',
        message: 'Only ADMIN users can add books',
      });
      return;
    }

    if (Number(formData.availableCount) > Number(formData.totalCopies)) {
      setToast({
        type: 'error',
        message: 'Available copies cannot exceed total copies',
      });
      return;
    }

    setLoading(true);

    try {

      const createdBook = await addBook({
        ...formData,
        price: parseFloat(formData.price),
        totalCopies: parseInt(formData.totalCopies),
        availableCount: parseInt(formData.availableCount),
      });

      await createActivityLog({
        userId: String(currentUser?.id || 'admin'),
        action: 'ADD_BOOK',
        description: `Added "${createdBook.title}"`,
      }).catch(() => {});

      navigate('/books');

    } catch (error) {

      console.log(error);
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to add book'),
      });

    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-20">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        <h1 className="text-5xl font-bold mb-3">
          Add New Book
        </h1>

        <p className="text-light-text/60 mb-12">
          Add a new book to the library collection
        </p>

        <div className="glass p-8 max-w-3xl rounded-2xl">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="block mb-2 font-semibold">
                Book Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label className="block mb-2 font-semibold">
                Author
              </label>

              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 font-semibold">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 font-semibold">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter book price"
                required
              />
            </div>

            {/* Total Copies */}
            <div>
              <label className="block mb-2 font-semibold">
                Total Copies
              </label>

              <input
                type="number"
                min="1"
                name="totalCopies"
                value={formData.totalCopies}
                onChange={handleChange}
                placeholder="Enter total copies"
                required
              />
            </div>

            {/* Available Copies */}
            <div>
              <label className="block mb-2 font-semibold">
                Available Copies
              </label>

              <input
                type="number"
                min="0"
                name="availableCount"
                value={formData.availableCount}
                onChange={handleChange}
                placeholder="Enter available copies"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 py-3 rounded-xl"
              >
                {loading ? 'Adding...' : 'Add Book'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1 py-3 rounded-xl"
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      </motion.div>

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

export default AddBook;
