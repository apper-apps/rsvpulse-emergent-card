import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const ErrorState = ({ 
  message = 'Something went wrong',
  description,
  onRetry,
  icon = 'AlertCircle',
  className = ''
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name={icon} className="w-8 h-8 text-error" />
        </div>
        
        <div>
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
            {message}
          </h3>
          {description && (
            <p className="text-gray-500 max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>

        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            icon="RefreshCw"
            className="mt-6"
          >
            Try Again
          </Button>
        )}
      </motion.div>
    </Card>
  );
};

export default ErrorState;