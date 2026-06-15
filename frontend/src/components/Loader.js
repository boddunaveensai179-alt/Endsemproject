/**
 * Loader/Spinner Component
 * Shows loading indicator for async operations
 */

import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-4 border-cyan-500/20 border-t-cyan-500 rounded-full`}
      />
      {text && <p className="text-light-text/70 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
