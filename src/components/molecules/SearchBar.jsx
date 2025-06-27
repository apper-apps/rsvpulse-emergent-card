import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search...', 
  debounceMs = 300,
  className = '',
  ...props 
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  // Debounce search
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);

    setDebounceTimer(timer);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };

  return (
    <div className={`relative ${className}`} {...props}>
      <div className="relative">
        <ApperIcon 
          name="Search" 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
        />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-10 py-2.5 border rounded-lg transition-all duration-200
            ${focused 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-gray-300 hover:border-gray-400'
            }
            focus:outline-none bg-white
          `}
        />

        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="X" className="w-3 h-3 text-gray-400" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;