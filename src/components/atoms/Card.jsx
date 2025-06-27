import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent
      className={`
        ${baseClasses}
        ${paddings[padding]}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;