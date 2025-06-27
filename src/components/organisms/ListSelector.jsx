import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import { listService } from '@/services/api/listService';
import { contactService } from '@/services/api/contactService';

const ListSelector = ({ 
  selectedListId, 
  onListSelect, 
  className = '',
  ...props 
}) => {
  const [lists, setLists] = useState([]);
  const [contactCounts, setContactCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const listsData = await listService.getAll();
      setLists(listsData);
      
      // Load contact counts for each list
      const counts = {};
      for (const list of listsData) {
        const contacts = await contactService.getByListId(list.Id);
        counts[list.Id] = contacts.length;
      }
      setContactCounts(counts);
    } catch (err) {
      setError(err.message || 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const handleListSelect = (list) => {
    onListSelect?.(list);
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="space-y-4">
          <div className="flex items-center">
            <ApperIcon name="Users" className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-heading font-semibold">Select Contact List</h3>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-error mb-4">{error}</p>
          <Button variant="outline" onClick={loadLists}>Try Again</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} {...props}>
      <div className="space-y-4">
        <div className="flex items-center">
          <ApperIcon name="Users" className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-heading font-semibold">Select Contact List</h3>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-8">
            <ApperIcon name="Users" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No contact lists found</p>
            <p className="text-sm text-gray-400">Create a list first to send broadcasts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list, index) => (
              <motion.div
                key={list.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  onClick={() => handleListSelect(list)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${selectedListId === list.Id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${selectedListId === list.Id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}
                      `}>
                        <ApperIcon name="Users" className="w-5 h-5" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{list.name}</h4>
                        <p className="text-sm text-gray-500">
                          Created {new Date(list.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        {contactCounts[list.Id] || 0} contacts
                      </Badge>
                      
                      {selectedListId === list.Id && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <ApperIcon name="Check" className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ListSelector;