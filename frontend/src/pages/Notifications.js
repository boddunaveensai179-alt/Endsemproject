/**
 * Notifications Page
 * Displays system-level library alerts and notifications
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdNotifications,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfo,
  MdRefresh,
} from 'react-icons/md';
import { getNotifications, getErrorMessage } from '../services/api';

const severityConfig = {
  error:   { icon: MdError,        color: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/5',    label: 'Error' },
  warning: { icon: MdWarning,      color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', label: 'Warning' },
  success: { icon: MdCheckCircle,  color: 'text-green-400',  border: 'border-green-500/30',  bg: 'bg-green-500/5',  label: 'Success' },
  info:    { icon: MdInfo,         color: 'text-cyan-400',   border: 'border-cyan-500/20',   bg: 'bg-cyan-500/5',   label: 'Info' },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <MdNotifications className="text-cyan-400" />
            Notifications
          </h1>
          <p className="text-light-text/60 text-lg">
            System alerts and library announcements
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 transition-all"
        >
          <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-16 rounded-2xl text-center"
        >
          <MdCheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Clear!</h2>
          <p className="text-light-text/60">No notifications at this time.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, i) => {
            const cfg = severityConfig[n.severity] || severityConfig.info;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className={`glass p-5 rounded-2xl border ${cfg.border} ${cfg.bg} flex items-start gap-4`}
              >
                <div className={`p-3 rounded-xl bg-white/5 ${cfg.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{n.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.color} font-medium`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-light-text/70">{n.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
