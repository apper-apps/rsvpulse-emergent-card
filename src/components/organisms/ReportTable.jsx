import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';

const ReportTable = ({ 
  reports = [], 
  contacts = [],
  loading = false,
  className = '' 
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Combine reports with contact info
  const combinedData = reports.map(report => {
    const contact = contacts.find(c => c.Id === report.contactId);
    return {
      ...report,
      contact: contact || { name: 'Unknown', whatsappNumber: '', email: '' }
    };
  });

  // Filter by status
  const filteredData = filterStatus === 'all' 
    ? combinedData 
    : combinedData.filter(item => item.status === filterStatus);

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue, bValue;
    
    if (sortField === 'name') {
      aValue = a.contact.name?.toLowerCase() || '';
      bValue = b.contact.name?.toLowerCase() || '';
    } else if (sortField === 'status') {
      aValue = a.status;
      bValue = b.status;
    } else if (sortField === 'readAt') {
      aValue = a.readAt ? new Date(a.readAt).getTime() : 0;
      bValue = b.readAt ? new Date(b.readAt).getTime() : 0;
    } else {
      aValue = a[sortField]?.toString().toLowerCase() || '';
      bValue = b[sortField]?.toString().toLowerCase() || '';
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { variant: 'info', icon: 'Send', label: 'Sent' },
      delivered: { variant: 'warning', icon: 'Truck', label: 'Delivered' },
      read: { variant: 'success', icon: 'Eye', label: 'Read' },
      failed: { variant: 'error', icon: 'X', label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.sent;
    return (
      <Badge variant={config.variant} icon={config.icon}>
        {config.label}
      </Badge>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ApperIcon name="ArrowUpDown" className="w-4 h-4 text-gray-400" />;
    }
    return (
      <ApperIcon 
        name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
        className="w-4 h-4 text-primary" 
      />
    );
  };

  const statusCounts = {
    all: combinedData.length,
    sent: combinedData.filter(item => item.status === 'sent').length,
    delivered: combinedData.filter(item => item.status === 'delivered').length,
    read: combinedData.filter(item => item.status === 'read').length,
    failed: combinedData.filter(item => item.status === 'failed').length
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none" className={className}>
      {/* Filter tabs */}
      <div className="border-b border-gray-200 px-6 pt-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'read', label: 'Read' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'sent', label: 'Sent' },
            { key: 'failed', label: 'Failed' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${filterStatus === filter.key
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                }
              `}
            >
              {filter.label}
              {statusCounts[filter.key] > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filterStatus === filter.key ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {statusCounts[filter.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Recipient</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('readAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Read At</span>
                  <SortIcon field="readAt" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <motion.tr
                key={`${item.contactId}-${item.broadcastId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary">
                        {item.contact.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.contact.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <ApperIcon name="Phone" className="w-4 h-4 text-gray-400 mr-2" />
                      {item.contact.whatsappNumber}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ApperIcon name="Mail" className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="truncate max-w-48">{item.contact.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.readAt ? (
                    <div className="flex items-center">
                      <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
                      {format(new Date(item.readAt), 'MMM d, h:mm a')}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="p-12 text-center">
          <ApperIcon name="BarChart3" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {filterStatus === 'all' ? 'No delivery reports found' : `No ${filterStatus} messages found`}
          </p>
        </div>
      )}
    </Card>
  );
};

export default ReportTable;