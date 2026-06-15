/**
 * CategoryFilter Component
 * Filter books by category
 */

import React, { useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';

const CATEGORIES = [
  'Programming',
  'Artificial Intelligence',
  'Database',
  'Cloud Computing',
  'Networking',
  'Cybersecurity',
  'DSA (Data Structures & Algorithms)',
];

const CategoryFilter = ({ onFilter, defaultCategory = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const handleChange = (category) => {
    setSelectedCategory(category);
    onFilter?.(category);
  };

  return (
    <div className="relative">
      <div className="glass rounded-xl p-1 flex items-center gap-2">
        <span className="text-sm text-light-text/70 px-3">Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-light-text cursor-pointer"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-primary-dark">
              {cat}
            </option>
          ))}
        </select>
        <MdArrowDropDown className="w-5 h-5 text-cyan-400 mr-2 pointer-events-none" />
      </div>
    </div>
  );
};

export default CategoryFilter;
