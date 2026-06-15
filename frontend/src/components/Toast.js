/**
 * Toast Notification Component
 * Displays temporary notifications for user actions
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'border-green-500 bg-green-500/10',
    error: 'border-red-500 bg-red-500/10',
    warning: 'border-yellow-500 bg-yellow-500/10',
    info: 'border-cyan-500 bg-cyan-500/10',
  };

  const typeIcons = {
    success: <MdCheckCircle className="w-5 h-5 text-green-500" />,
    error: <MdError className="w-5 h-5 text-red-500" />,
    warning: <MdInfo className="w-5 h-5 text-yellow-500" />,
    info: <MdInfo className="w-5 h-5 text-cyan-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 max-w-sm rounded-lg border glass p-4 flex gap-3 items-center ${typeStyles[type]}`}
    >
      {typeIcons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <MdClose className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default Toast;
