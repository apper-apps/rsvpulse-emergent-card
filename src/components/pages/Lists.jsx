import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import FileUpload from '@/components/molecules/FileUpload';
import Modal from '@/components/molecules/Modal';
import ContactTable from '@/components/organisms/ContactTable';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import { listService } from '@/services/api/listService';
import { contactService } from '@/services/api/contactService';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Form states
  const [newListName, setNewListName] = useState('');
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      loadContacts(selectedList.Id);
    }
  }, [selectedList]);

  const loadLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listService.getAll();
      setLists(data);
      if (data.length > 0 && !selectedList) {
        setSelectedList(data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load lists');
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async (listId) => {
    setContactsLoading(true);
    try {
      const data = await contactService.getByListId(listId);
      setContacts(data);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setContactsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      const newList = await listService.create({ name: newListName.trim() });
      setLists(prev => [...prev, newList]);
      setSelectedList(newList);
      setNewListName('');
      setShowCreateModal(false);
      toast.success('List created successfully');
    } catch (err) {
      toast.error('Failed to create list');
    }
  };

  const handleDeleteList = async (list) => {
    if (!confirm(`Are you sure you want to delete "${list.name}"? This will also delete all contacts in this list.`)) {
      return;
    }

    try {
      await listService.delete(list.Id);
      setLists(prev => prev.filter(l => l.Id !== list.Id));
      
      if (selectedList?.Id === list.Id) {
        const remainingLists = lists.filter(l => l.Id !== list.Id);
        setSelectedList(remainingLists.length > 0 ? remainingLists[0] : null);
        setContacts([]);
      }
      
      toast.success('List deleted successfully');
    } catch (err) {
      toast.error('Failed to delete list');
    }
  };

  const parseCsvData = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const whatsappIndex = headers.findIndex(h => h.includes('whatsapp') || h.includes('phone'));
    const emailIndex = headers.findIndex(h => h.includes('email'));

    if (nameIndex === -1 || whatsappIndex === -1 || emailIndex === -1) {
      throw new Error('CSV must contain Name, WhatsApp/Phone, and Email columns');
    }

    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= Math.max(nameIndex, whatsappIndex, emailIndex) + 1) {
        contacts.push({
          name: values[nameIndex],
          whatsappNumber: values[whatsappIndex],
          email: values[emailIndex]
        });
      }
    }

    return contacts;
  };

  const handleFileSelect = (file) => {
    setUploadFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = parseCsvData(e.target.result);
          setCsvData(parsedData);
        } catch (err) {
          toast.error(err.message);
          setCsvData([]);
        }
      };
      reader.readAsText(file);
    } else {
      setCsvData([]);
    }
  };

  const handleUploadContacts = async () => {
    if (!selectedList) {
      toast.error('Please select a list first');
      return;
    }

    if (csvData.length === 0) {
      toast.error('No valid contacts to upload');
      return;
    }

    setUploadLoading(true);
    try {
      const contactsWithListId = csvData.map(contact => ({
        ...contact,
        listId: selectedList.Id
      }));

      await contactService.createBatch(contactsWithListId);
      
      // Update list contact count
      await listService.update(selectedList.Id, {
        contactCount: contacts.length + csvData.length
      });

      // Reload data
      loadLists();
      loadContacts(selectedList.Id);
      
      setShowUploadModal(false);
      setUploadFile(null);
      setCsvData([]);
      toast.success(`${csvData.length} contacts uploaded successfully`);
    } catch (err) {
      toast.error('Failed to upload contacts');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load lists"
        description={error}
        onRetry={loadLists}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Contact Lists</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your contact lists and import new contacts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            icon="Upload"
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedList}
          >
            Upload CSV
          </Button>
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setShowCreateModal(true)}
          >
            Create List
          </Button>
        </div>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          title="No contact lists yet"
          description="Create your first contact list to start managing your broadcast recipients"
          actionLabel="Create First List"
          onAction={() => setShowCreateModal(true)}
          icon="Users"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lists Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-semibold">Lists</h3>
                <span className="text-sm text-gray-500">{lists.length} total</span>
              </div>
              
              <div className="space-y-2">
                {lists.map((list, index) => (
                  <motion.div
                    key={list.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedList(list)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all duration-200
                      ${selectedList?.Id === list.Id
                        ? 'bg-primary text-white shadow-sm'
                        : 'hover:bg-gray-50 border border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">{list.name}</h4>
                        <p className={`text-xs mt-1 ${
                          selectedList?.Id === list.Id ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {list.contactCount || 0} contacts
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list);
                        }}
                        className={`ml-2 ${
                          selectedList?.Id === list.Id 
                            ? 'text-white/70 hover:text-white hover:bg-white/10' 
                            : 'text-gray-400 hover:text-error'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Contacts Table */}
          <div className="lg:col-span-3">
            {selectedList ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-heading font-semibold">{selectedList.name}</h3>
                    <p className="text-sm text-gray-500">{contacts.length} contacts</p>
                  </div>
                </div>
                
                {contacts.length === 0 && !contactsLoading ? (
                  <EmptyState
                    title="No contacts in this list"
                    description="Upload a CSV file to add contacts to this list"
                    actionLabel="Upload CSV"
                    onAction={() => setShowUploadModal(true)}
                    icon="UserPlus"
                  />
                ) : (
                  <ContactTable
                    contacts={contacts}
                    loading={contactsLoading}
                    onEdit={(contact) => {
                      // Edit functionality can be added later
                      toast.info('Edit functionality coming soon');
                    }}
                    onDelete={async (contact) => {
                      if (confirm(`Delete ${contact.name}?`)) {
                        try {
                          await contactService.delete(contact.Id);
                          setContacts(prev => prev.filter(c => c.Id !== contact.Id));
                          toast.success('Contact deleted');
                        } catch (err) {
                          toast.error('Failed to delete contact');
                        }
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <ApperIcon name="Users" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a list to view contacts</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create List Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewListName('');
        }}
        title="Create New List"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter list name"
            icon="Users"
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewListName('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateList}
              disabled={!newListName.trim()}
            >
              Create List
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload CSV Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadFile(null);
          setCsvData([]);
        }}
        title="Upload Contacts"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with columns: <strong>Name</strong>, <strong>WhatsApp</strong>, and <strong>Email</strong>
            </p>
            
            {selectedList && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  Contacts will be added to: <strong>{selectedList.name}</strong>
                </p>
              </div>
            )}
          </div>

          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".csv"
          />

          {csvData.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Preview ({csvData.length} contacts)</h4>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">WhatsApp</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {csvData.slice(0, 5).map((contact, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">{contact.name}</td>
                        <td className="px-3 py-2">{contact.whatsappNumber}</td>
                        <td className="px-3 py-2">{contact.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 5 && (
                  <div className="px-3 py-2 text-center text-gray-500 text-xs bg-gray-50">
                    ... and {csvData.length - 5} more contacts
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
                setCsvData([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadContacts}
              loading={uploadLoading}
              disabled={csvData.length === 0 || !selectedList}
            >
              Upload {csvData.length} Contacts
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Lists;