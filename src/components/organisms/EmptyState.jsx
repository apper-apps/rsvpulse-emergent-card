import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const EmptyState = ({ 
  title = 'No items found',
  description,
  actionLabel,
  onAction,
  icon = 'Package',
  className = ''
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto"
        >
          <ApperIcon name={icon} className="w-8 h-8 text-gray-400" />
        </motion.div>
        
        <div>
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-500 max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>

        {actionLabel && onAction && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="primary"
              onClick={onAction}
              icon="Plus"
            >
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};

export default EmptyState;