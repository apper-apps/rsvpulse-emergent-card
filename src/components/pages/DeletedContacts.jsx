import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import SearchBar from '@/components/molecules/SearchBar';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import { contactService } from '@/services/api/contactService';

const DeletedContacts = () => {
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDeletedContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [deletedContacts, searchQuery]);

  const loadDeletedContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactService.getAllDeleted();
      setDeletedContacts(data);
    } catch (err) {
      setError(err.message || 'Failed to load deleted contacts');
      toast.error('Failed to load deleted contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(deletedContacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = deletedContacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.whatsappNumber.includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleRestore = async (contact) => {
    if (!confirm(`Restore ${contact.name}? This will move the contact back to the active list.`)) {
      return;
    }

    try {
      await contactService.restore(contact.Id);
      setDeletedContacts(prev => prev.filter(c => c.Id !== contact.Id));
      toast.success(`${contact.name} has been restored`);
    } catch (err) {
      toast.error('Failed to restore contact');
    }
  };

  const handlePermanentDelete = async (contact) => {
    if (!confirm(`Permanently delete ${contact.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await contactService.permanentDelete(contact.Id);
      setDeletedContacts(prev => prev.filter(c => c.Id !== contact.Id));
      toast.success(`${contact.name} has been permanently deleted`);
    } catch (err) {
      toast.error('Failed to permanently delete contact');
    }
  };

  if (loading) {
    return <SkeletonLoader type="table" count={5} />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load deleted contacts"
        description={error}
        onRetry={loadDeletedContacts}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Deleted Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and restore deleted contacts. Permanently delete when no longer needed.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ApperIcon name="Info" size={16} />
            <span>{deletedContacts.length} deleted contacts</span>
          </div>
        </div>
      </div>

      {deletedContacts.length === 0 ? (
        <EmptyState
          title="No deleted contacts"
          description="Deleted contacts will appear here for potential recovery"
          icon="Trash2"
        />
      ) : (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex justify-between items-center">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search deleted contacts..."
              className="max-w-md"
            />
            <div className="text-sm text-gray-500">
              Showing {filteredContacts.length} of {deletedContacts.length} contacts
            </div>
          </div>

          {/* Contacts Table */}
          <Card>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Search" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No contacts match your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        WhatsApp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deleted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContacts.map((contact, index) => (
                      <motion.tr
                        key={contact.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {contact.whatsappNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {contact.deletedAt ? format(new Date(contact.deletedAt), 'MMM d, yyyy HH:mm') : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon="RotateCcw"
                              onClick={() => handleRestore(contact)}
                              className="text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                            >
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon="Trash2"
                              onClick={() => handlePermanentDelete(contact)}
                              className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                            >
                              Delete Forever
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeletedContacts;