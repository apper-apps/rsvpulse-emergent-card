import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
          >
            <ApperIcon name="MessageSquareX" className="w-10 h-10 text-primary" />
          </motion.div>
          
          <div>
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
              404
            </h1>
            <h2 className="text-xl font-heading font-semibold text-gray-700 mb-3">
              Page Not Found
            </h2>
            <p className="text-gray-500">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              icon="Home"
              onClick={() => window.location.href = '/lists'}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="outline"
              icon="ArrowLeft"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </Card>
    </div>
  );
};

export default NotFound;