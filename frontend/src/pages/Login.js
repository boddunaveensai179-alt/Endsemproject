/**
 * Login Page
 * Role-based access with quick-login buttons for Admin and User
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import libraryBg from '../assets/library.jpeg';
import { motion } from 'framer-motion';
import {
  MdVisibility,
  MdVisibilityOff,
  MdLogoDev,
  MdAdminPanelSettings,
  MdPerson,
  MdFlashOn,
} from 'react-icons/md';
import { getErrorMessage, loginUser } from '../services/api';

const Login = () => {

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword]               = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [activeRole, setActiveRole]           = useState(null); // 'admin' | 'user' | null

  // ===================== QUICK LOGIN =====================

  const quickLogin = (role) => {
    if (role === 'admin') {
      setUsernameOrEmail('admin');
      setPassword('123456');
      setActiveRole('admin');
    } else {
      // Clear fields so user fills their own credentials
      setUsernameOrEmail('');
      setPassword('');
      setActiveRole('user');
    }
    setError('');
  };

  // ===================== SUBMIT =====================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usernameOrEmail || !password) {
      setError('Username/email and password are required');
      setLoading(false);
      return;
    }

    try {
      const user = await loginUser({ usernameOrEmail, password });

      if (user) {
        window.location.href = '/dashboard';
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    }

    setLoading(false);
  };

  // ===================== UI =====================

  return (
    <div
  className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `linear-gradient(
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0.7)
    ), url(${libraryBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>

      {/* Background blobs */}
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-10 left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md p-8 rounded-2xl relative z-10 backdrop-blur-xl bg-black/30 border border-white/10 shadow-2xl"
      >

        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full shadow-lg">
              <MdLogoDev className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold mb-1">Welcome Back</h1>
          <p className="text-light-text/60">Sign in to your Digital Library account</p>
        </div>

        {/* ===== ROLE QUICK-LOGIN BUTTONS ===== */}
        <div className="mb-6">
          <p className="text-xs text-light-text/50 text-center mb-3 flex items-center gap-2 justify-center">
            <MdFlashOn className="w-3 h-3 text-yellow-400" />
            Quick Login
            <MdFlashOn className="w-3 h-3 text-yellow-400" />
          </p>
          <div className="grid grid-cols-2 gap-3">

            {/* Admin Quick Login */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => quickLogin('admin')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-semibold ${
                activeRole === 'admin'
                  ? 'border-purple-400/60 bg-purple-500/20 text-purple-300'
                  : 'border-purple-500/30 bg-purple-500/5 text-light-text/70 hover:border-purple-400/50 hover:bg-purple-500/10'
              }`}
            >
              <MdAdminPanelSettings className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="text-left">
                <div className={activeRole === 'admin' ? 'text-purple-300' : ''}>Admin</div>
                <div className="text-xs text-light-text/40 font-normal">admin / 123456</div>
              </div>
            </motion.button>

            {/* User Quick Login */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => quickLogin('user')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-semibold ${
                activeRole === 'user'
                  ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
                  : 'border-cyan-500/30 bg-cyan-500/5 text-light-text/70 hover:border-cyan-400/50 hover:bg-cyan-500/10'
              }`}
            >
              <MdPerson className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div className="text-left">
                <div className={activeRole === 'user' ? 'text-cyan-300' : ''}>User</div>
                <div className="text-xs text-light-text/40 font-normal">Your credentials</div>
              </div>
            </motion.button>
          </div>

          {/* Role hint */}
          {activeRole === 'admin' && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-center text-purple-400/80"
            >
              ✓ Admin credentials filled — click Sign In
            </motion.p>
          )}
          {activeRole === 'user' && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-center text-cyan-400/80"
            >
              Enter your email and password below
            </motion.p>
          )}
        </div>

        <div className="border-t border-white/10 mb-5" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username / Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              autoComplete="username"
              placeholder="admin  or  you@example.com"
              value={usernameOrEmail}
              onChange={(e) => { setUsernameOrEmail(e.target.value); setActiveRole(null); }}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-light-text placeholder-light-text/40 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-light-text placeholder-light-text/40 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-light-text/50 hover:text-light-text"
              >
                {showPassword ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-light-text/60 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Create one
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;
