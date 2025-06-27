import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Modal from "@/components/molecules/Modal";
import ProgressBar from "@/components/molecules/ProgressBar";
import MessageEditor from "@/components/organisms/MessageEditor";
import ListSelector from "@/components/organisms/ListSelector";
import EmptyState from "@/components/organisms/EmptyState";
import { listService } from "@/services/api/listService";
import { contactService } from "@/services/api/contactService";
import { broadcastService } from "@/services/api/broadcastService";
import { reportService } from "@/services/api/reportService";

const Broadcast = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      loadContacts();
    }
  }, [selectedList]);

  const loadLists = async () => {
    setLoading(true);
    try {
      const data = await listService.getAll();
      setLists(data);
    } catch (err) {
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!selectedList) return;
    
    try {
      const data = await contactService.getByListId(selectedList.Id);
      setContacts(data);
    } catch (err) {
      toast.error('Failed to load contacts');
    }
  };

  const handleListSelect = (list) => {
    setSelectedList(list);
  };

  const personalizeMessage = (template, contact) => {
    return template
      .replace(/{{Name}}/g, contact.name)
      .replace(/{{Email}}/g, contact.email);
  };

  const simulateSending = async () => {
    setSendProgress(0);
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setSendProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const handleSendBroadcast = async () => {
    if (!selectedList || !message.trim() || contacts.length === 0) {
      toast.error('Please select a list and enter a message');
      return;
    }

    setSending(true);
    setShowConfirmModal(false);

    try {
      // Simulate sending progress
      await simulateSending();

      // Create broadcast record
      const broadcast = await broadcastService.create({
        listId: selectedList.Id,
        message: message.trim(),
        totalRecipients: contacts.length
      });

      // Generate random delivery reports
      const reports = contacts.map(contact => {
        const statuses = ['sent', 'delivered', 'read', 'failed'];
        const weights = [0.05, 0.15, 0.75, 0.05]; // Most likely to be read
        
        let random = Math.random();
        let status = 'read';
        let cumulativeWeight = 0;
        
        for (let i = 0; i < statuses.length; i++) {
          cumulativeWeight += weights[i];
          if (random <= cumulativeWeight) {
            status = statuses[i];
            break;
          }
        }

        return {
          broadcastId: broadcast.Id,
          contactId: contact.Id,
          status: status,
          readAt: status === 'read' ? new Date(Date.now() + Math.random() * 3600000).toISOString() : null
        };
      });

      await reportService.createBatch(reports);

      // Clear form
      setMessage('');
      setSelectedList(null);
      setContacts([]);
      
      toast.success(`Broadcast sent successfully to ${contacts.length} recipients!`);
    } catch (err) {
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
      setSendProgress(0);
    }
  };

  const canSendBroadcast = selectedList && message.trim() && contacts.length > 0 && !sending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Broadcast Message</h1>
          <p className="mt-1 text-sm text-gray-500">
            Compose and send personalized messages to your contact lists
          </p>
        </div>
        
        {selectedList && contacts.length > 0 && (
          <div className="mt-4 sm:mt-0">
            <Button
              variant="primary"
              icon="Send"
              onClick={() => setShowConfirmModal(true)}
              disabled={!canSendBroadcast}
              loading={sending}
            >
              Send to {contacts.length} Recipients
            </Button>
          </div>
        )}
      </div>

      {/* Sending Progress */}
      {sending && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ApperIcon name="Send" className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Sending broadcast...</h3>
                <ProgressBar
                  value={sendProgress}
                  max={100}
                  variant="primary"
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-gray-500">
                {sendProgress}%
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {lists.length === 0 ? (
        <EmptyState
          title="No contact lists available"
          description="You need to create contact lists before you can send broadcasts"
          actionLabel="Go to Lists"
          onAction={() => window.location.href = '/lists'}
          icon="Users"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - List Selection */}
          <div className="space-y-6">
            <ListSelector
              selectedListId={selectedList?.Id}
              onListSelect={handleListSelect}
            />

            {/* Selected List Info */}
            {selectedList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="CheckCircle" className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Ready to Send</h3>
                      <p className="text-sm text-gray-500">
                        {contacts.length} recipients in "{selectedList.name}"
                      </p>
                    </div>
                  </div>

                  {contacts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Sample recipients:</p>
                      <div className="space-y-1">
                        {contacts.slice(0, 3).map((contact) => (
                          <div key={contact.Id} className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span>{contact.name}</span>
                            <span className="text-gray-400">•</span>
                            <span>{contact.whatsappNumber}</span>
                          </div>
                        ))}
                        {contacts.length > 3 && (
                          <p className="text-xs text-gray-400 pl-8">
                            +{contacts.length - 3} more contacts
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Message Editor */}
          <div>
            <Card>
              <div className="flex items-center space-x-2 mb-6">
                <ApperIcon name="Edit" className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-heading font-semibold">Compose Message</h3>
              </div>

              <MessageEditor
                value={message}
                onChange={setMessage}
                placeholder="Hi {{Name}}, you're invited to our event! Please confirm your attendance by replying to this message. Looking forward to seeing you there!"
              />

              {/* Message Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <ApperIcon name="Lightbulb" className="w-4 h-4 mr-2" />
Message Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use merge tags like {'{'}{'{'}}Name{'}'}{'}'}  and {'{'}{'{'}}Email{'}'}{'}'}  to personalize messages</li>
                  <li>• Keep messages clear and include a call-to-action</li>
                  <li>• WhatsApp formatting: *bold*, _italic_, ~strikethrough~</li>
                  <li>• Test your message before sending to large lists</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Send Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Broadcast"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ApperIcon name="AlertTriangle" className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 font-medium">
                You're about to send a broadcast message
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Target List:</p>
              <p className="text-gray-900">{selectedList?.name}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Recipients:</p>
              <p className="text-gray-900">{contacts.length} contacts</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Message Preview:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                {personalizeMessage(message, { name: 'John Doe', email: 'john@example.com' })}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendBroadcast}
              icon="Send"
            >
              Send Broadcast
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Broadcast;