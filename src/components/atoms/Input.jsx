import { useState, forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.toString().length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Input field */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ApperIcon name={icon} className="w-4 h-4" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={!label ? placeholder : ''}
          className={`
            block w-full px-3 py-2.5 border rounded-md transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${label ? 'pt-6 pb-2' : ''}
            ${error 
              ? 'border-error focus:border-error focus:ring-error/20' 
              : 'border-gray-300 focus:border-primary focus:ring-primary/20'
            }
            focus:outline-none focus:ring-2
            ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Floating label */}
        {label && (
          <label
            className={`
              absolute left-3 transition-all duration-200 pointer-events-none
              ${icon ? 'left-10' : ''}
              ${focused || hasValue
                ? 'top-1.5 text-xs text-gray-500'
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
              }
            `}
          >
            {label}
          </label>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-error flex items-center">
          <ApperIcon name="AlertCircle" className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;