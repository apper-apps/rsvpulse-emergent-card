import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Modal from '@/components/molecules/Modal';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/organisms/EmptyState';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import { templateService } from '@/services/api/templateService';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'general'
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'event', label: 'Event' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'follow-up', label: 'Follow-up' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getAll();
      setTemplates(data);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const openModal = (mode, template = null) => {
    setModalMode(mode);
    setSelectedTemplate(template);
    
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category
      });
    } else {
      setFormData({
        name: '',
        description: '',
        content: '',
        category: 'general'
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      description: '',
      content: '',
      category: 'general'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (modalMode === 'create') {
        await templateService.create(formData);
        toast.success('Template created successfully');
      } else if (modalMode === 'edit') {
        await templateService.update(selectedTemplate.Id, formData);
        toast.success('Template updated successfully');
      }
      
      await loadTemplates();
      closeModal();
    } catch (err) {
      toast.error(`Failed to ${modalMode} template`);
    }
  };

  const handleDelete = async (template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      await templateService.delete(template.Id);
      toast.success('Template deleted successfully');
      await loadTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      marketing: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      reminder: 'bg-yellow-100 text-yellow-800',
      welcome: 'bg-purple-100 text-purple-800',
      'follow-up': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || colors.general;
  };

  const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 100);
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Message Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage reusable message templates for your broadcasts
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => openModal('create')}
          >
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search templates..."
          />
        </div>
        
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          title="No templates found"
          description={searchTerm || selectedCategory !== 'all' 
            ? "No templates match your current filters"
            : "Create your first message template to get started"
          }
          actionLabel="Create Template"
          onAction={() => openModal('create')}
          icon="FileText"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {categories.find(c => c.value === template.category)?.label}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    {stripHtml(template.content)}...
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Eye"
                      onClick={() => openModal('view', template)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => openModal('edit', template)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => handleDelete(template)}
                      className="text-red-600 hover:text-red-700"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Create Template' :
          modalMode === 'edit' ? 'Edit Template' : 'View Template'
        }
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter template name"
                required
                disabled={modalMode === 'view'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={modalMode === 'view'}
              >
                {categories.slice(1).map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the template"
              disabled={modalMode === 'view'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <div className="border border-gray-300 rounded-lg">
              <ReactQuill
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Enter your message template content..."
                theme="snow"
                readOnly={modalMode === 'view'}
                style={{ minHeight: '200px' }}
                modules={{
                  toolbar: modalMode === 'view' ? false : [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['blockquote', 'code-block'],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <ApperIcon name="Info" className="w-4 h-4 mr-2" />
              Template Tips
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use merge tags like {'{'}{'{'}}Name{'}'}{'}'}  and {'{'}{'{'}}Email{'}'}{'}'}  for personalization</li>
              <li>• Rich text formatting supports bold, italic, lists, and links</li>
              <li>• Line breaks and paragraphs are preserved in the output</li>
              <li>• Templates can be reused across multiple broadcasts</li>
            </ul>
          </div>
          
          {modalMode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={modalMode === 'create' ? 'Plus' : 'Save'}
              >
                {modalMode === 'create' ? 'Create Template' : 'Update Template'}
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Templates;