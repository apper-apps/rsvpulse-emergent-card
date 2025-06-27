import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const FileUpload = ({ 
  onFileSelect, 
  accept = '.csv',
  multiple = false,
  className = '',
  ...props 
}) => {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect?.(null);
  };

  return (
    <div className={className} {...props}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFile ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
            ${dragging 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
            }
          `}
          onClick={handleBrowseClick}
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={dragging ? { scale: 1.1 } : { scale: 1 }}
              className="mb-4"
            >
              <ApperIcon 
                name="Upload" 
                className={`w-12 h-12 ${dragging ? 'text-primary' : 'text-gray-400'}`} 
              />
            </motion.div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dragging ? 'Drop your CSV file here' : 'Upload CSV File'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            
            <Button variant="outline" size="sm">
              Browse Files
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-success bg-success/5 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="FileText" className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-error"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;