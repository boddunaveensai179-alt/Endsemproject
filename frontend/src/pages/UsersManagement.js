import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdPerson, MdDelete, MdAdd, MdLibraryBooks, MdAccessTime } from 'react-icons/md';
import {
  getAllUsers,
  createUser,
  deleteUser,
  getUserBorrows,
  getErrorMessage,
  getCurrentUser
} from '../services/api';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

const UsersManagement = () => {
  const adminUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBorrowsModalOpen, setIsBorrowsModalOpen] = useState(false);
  
  // Selected user borrows
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserBorrows, setSelectedUserBorrows] = useState([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      // Filter out the currently logged-in admin so they don't delete themselves
      setUsers(data || []);
    } catch (error) {
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to fetch users'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      setFormSubmitting(true);
      await createUser(formData);
      setToast({
        type: 'success',
        message: `User "${formData.name}" created successfully`,
      });
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Failed to create user'));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === adminUser?.id) {
      setToast({
        type: 'error',
        message: 'You cannot delete yourself!',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will also delete all of their borrow records.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      setToast({
        type: 'success',
        message: `User "${userName}" deleted successfully`,
      });
      fetchUsers();
    } catch (error) {
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to delete user'),
      });
    }
  };

  const handleViewBorrows = async (user) => {
    setSelectedUser(user);
    setIsBorrowsModalOpen(true);
    try {
      setLoadingBorrows(true);
      const data = await getUserBorrows(user.id);
      setSelectedUserBorrows(data || []);
    } catch (error) {
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to fetch user borrow records'),
      });
      setIsBorrowsModalOpen(false);
    } finally {
      setLoadingBorrows(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading users database..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">User Management</h1>
          <p className="text-light-text/60">View, add, delete and audit library members</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <MdAdd className="w-5 h-5" />
          Add User
        </button>
      </motion.div>

      {/* Users Grid/List */}
      {users.length > 0 ? (
        <div className="glass overflow-hidden rounded-2xl border border-cyan-500/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-white/5 text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                        <MdPerson className="w-6 h-6" />
                      </div>
                      <span className="font-semibold">{user.name}</span>
                    </td>
                    <td className="p-4 text-light-text/80">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        user.role === 'ADMIN' || user.role === 'ROLE_ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {user.role ? user.role.replace('ROLE_', '') : 'USER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewBorrows(user)}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm transition-all"
                        >
                          View Borrows
                        </button>
                        {user.id !== adminUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass p-10 rounded-xl text-center">
          <MdPerson className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Users Found</h2>
          <p className="text-light-text/60">There are no other members in the database.</p>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUser} className="space-y-4 text-light-text">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Alice Smith"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-cyan-500/30 text-light-text placeholder-light-text/40 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. alice@example.com"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-cyan-500/30 text-light-text placeholder-light-text/40 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-cyan-500/30 text-light-text placeholder-light-text/40 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">System Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-primary-dark border border-cyan-500/30 text-light-text focus:outline-none focus:border-cyan-400 transition-all"
            >
              <option value="USER">User (Regular Member)</option>
              <option value="ADMIN">Admin (Librarian)</option>
            </select>
          </div>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="btn-primary"
            >
              {formSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Borrow History Modal */}
      <Modal
        isOpen={isBorrowsModalOpen}
        onClose={() => setIsBorrowsModalOpen(false)}
        title={`Borrow History - ${selectedUser?.name || ''}`}
        size="lg"
      >
        {loadingBorrows ? (
          <div className="py-8 flex justify-center">
            <Loader text="Retrieving history..." />
          </div>
        ) : selectedUserBorrows.length > 0 ? (
          <div className="space-y-4">
            {selectedUserBorrows.map((borrow) => {
              const isReturned = borrow.returned;
              return (
                <div
                  key={borrow.id}
                  className="p-4 rounded-xl bg-white/5 border border-cyan-500/10 flex items-center justify-between gap-4 text-light-text"
                >
                  <div className="flex items-start gap-3">
                    <MdLibraryBooks className="w-5 h-5 text-cyan-400 mt-1" />
                    <div>
                      <h4 className="font-semibold">{borrow.book?.title || `Book #${borrow.book?.bookId}`}</h4>
                      <p className="text-sm text-light-text/60">{borrow.book?.author || 'Unknown Author'}</p>
                      <p className="text-xs text-light-text/40 mt-1">Borrowed: {borrow.borrowDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isReturned
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      <MdAccessTime className="w-3.5 h-3.5" />
                      {isReturned ? `Returned (${borrow.returnDate})` : 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-light-text/60">
            <MdLibraryBooks className="w-12 h-12 mx-auto text-cyan-400/40 mb-3" />
            <p className="font-semibold">No borrow records found</p>
            <p className="text-sm">This member hasn't borrowed any books yet.</p>
          </div>
        )}
      </Modal>

      {/* Toast Notifications */}
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

export default UsersManagement;
