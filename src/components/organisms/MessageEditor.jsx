import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const MessageEditor = ({ 
  value = '', 
  onChange, 
  className = '',
  placeholder = 'Type your message here...',
  ...props 
}) => {
  const [message, setMessage] = useState(value);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessage(value);
  }, [value]);

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    onChange?.(newMessage);
  };

  const insertMergeTag = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + `{{${tag}}}` + message.substring(end);
    
    setMessage(newMessage);
    onChange?.(newMessage);

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 4, start + tag.length + 4);
    }, 0);
  };

  const formatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    if (selectedText) {
      let formattedText = selectedText;
      switch (format) {
        case 'bold':
          formattedText = `*${selectedText}*`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'strikethrough':
          formattedText = `~${selectedText}~`;
          break;
        default:
          break;
      }
      
      const newMessage = message.substring(0, start) + formattedText + message.substring(end);
      setMessage(newMessage);
      onChange?.(newMessage);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      }, 0);
    }
  };

  const generatePreview = () => {
    return message
      .replace(/{{Name}}/g, 'John Doe')
      .replace(/{{Email}}/g, 'john.doe@example.com')
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/~([^~]+)~/g, '<del>$1</del>');
  };

  const mergeTagButtons = [
    { tag: 'Name', icon: 'User', label: 'Name' },
    { tag: 'Email', icon: 'Mail', label: 'Email' }
  ];

  const formatButtons = [
    { format: 'bold', icon: 'Bold', label: 'Bold' },
    { format: 'italic', icon: 'Italic', label: 'Italic' },
    { format: 'strikethrough', icon: 'Strikethrough', label: 'Strikethrough' }
  ];

  return (
    <div className={className} {...props}>
      {/* Toolbar */}
      <Card padding="sm" className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Format buttons */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            {formatButtons.map((button) => (
              <Button
                key={button.format}
                variant="ghost"
                size="sm"
                icon={button.icon}
                onClick={() => formatText(button.format)}
                className="text-gray-600 hover:text-primary"
                title={button.label}
              />
            ))}
          </div>

          {/* Merge tag buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Insert:</span>
            {mergeTagButtons.map((button) => (
              <Button
                key={button.tag}
                variant="outline"
                size="sm"
                icon={button.icon}
                onClick={() => insertMergeTag(button.tag)}
                className="text-xs"
              >
                {button.label}
              </Button>
            ))}
          </div>

          {/* Preview toggle */}
          <div className="ml-auto">
            <Button
              variant={showPreview ? 'primary' : 'outline'}
              size="sm"
              icon="Eye"
              onClick={() => setShowPreview(!showPreview)}
            >
              Preview
            </Button>
          </div>
        </div>
      </Card>

      {/* Editor/Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className={showPreview ? '' : 'lg:col-span-2'}>
          <Card padding="none" className="h-64">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              placeholder={placeholder}
              className="w-full h-full p-4 border-none resize-none focus:outline-none focus:ring-0 rounded-lg"
              style={{ minHeight: '240px' }}
            />
          </Card>
          
          {/* Character count */}
          <div className="mt-2 text-right">
            <span className="text-sm text-gray-500">
              {message.length} characters
            </span>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:block"
          >
            <Card className="h-64">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <ApperIcon name="MessageCircle" className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">Preview</div>
                  <div className="text-xs text-gray-500">How it will appear</div>
                </div>
              </div>
              
              <div 
                className="text-sm leading-relaxed overflow-y-auto"
                style={{ maxHeight: '180px' }}
                dangerouslySetInnerHTML={{ __html: generatePreview() }}
              />
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MessageEditor;