import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import ReportTable from '@/components/organisms/ReportTable';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import { broadcastService } from '@/services/api/broadcastService';
import { reportService } from '@/services/api/reportService';
import { contactService } from '@/services/api/contactService';
import { listService } from '@/services/api/listService';

const Reports = () => {
  const [latestBroadcast, setLatestBroadcast] = useState(null);
  const [reports, setReports] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLatestReport();
  }, []);

  const loadLatestReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get latest broadcast
      const broadcast = await broadcastService.getLatest();
      
      if (!broadcast) {
        setLatestBroadcast(null);
        setReports([]);
        setContacts([]);
        setList(null);
        return;
      }

      setLatestBroadcast(broadcast);

      // Get reports for this broadcast
      const broadcastReports = await reportService.getByBroadcastId(broadcast.Id);
      setReports(broadcastReports);

      // Get contacts for this broadcast's list
      const listContacts = await contactService.getByListId(broadcast.listId);
      setContacts(listContacts);

      // Get list info
      const listInfo = await listService.getById(broadcast.listId);
      setList(listInfo);

    } catch (err) {
      setError(err.message || 'Failed to load reports');
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: reports.length,
      sent: reports.filter(r => r.status === 'sent').length,
      delivered: reports.filter(r => r.status === 'delivered').length,
      read: reports.filter(r => r.status === 'read').length,
      failed: reports.filter(r => r.status === 'failed').length
    };

    return counts;
  };

  const getEngagementRate = () => {
    const counts = getStatusCounts();
    if (counts.total === 0) return 0;
    return Math.round((counts.read / counts.total) * 100);
  };

  const getDeliveryRate = () => {
    const counts = getStatusCounts();
    if (counts.total === 0) return 0;
    const delivered = counts.delivered + counts.read;
    return Math.round((delivered / counts.total) * 100);
  };

  if (loading) {
    return <SkeletonLoader type="card" count={4} />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load reports"
        description={error}
        onRetry={loadLatestReport}
      />
    );
  }

  if (!latestBroadcast) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Broadcast Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            View delivery status and engagement for your broadcasts
          </p>
        </div>

        <EmptyState
          title="No broadcast reports yet"
          description="Send your first broadcast message to see delivery reports and engagement metrics here"
          actionLabel="Send Broadcast"
          onAction={() => window.location.href = '/broadcast'}
          icon="BarChart3"
        />
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const engagementRate = getEngagementRate();
  const deliveryRate = getDeliveryRate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Broadcast Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Latest broadcast delivery status and engagement metrics
          </p>
        </div>
        <Button
          variant="outline"
          icon="RefreshCw"
          onClick={loadLatestReport}
        >
          Refresh
        </Button>
      </div>

      {/* Broadcast Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="MessageSquare" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold">
                    Latest Broadcast Report
                  </h3>
                  <p className="text-sm text-gray-500">
                    Sent to "{list?.name}" • {format(new Date(latestBroadcast.sentAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mt-4 max-w-2xl">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {latestBroadcast.message}
                </p>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-wrap gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
                <div className="text-xs text-gray-500">Total Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{deliveryRate}%</div>
                <div className="text-xs text-gray-500">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{engagementRate}%</div>
                <div className="text-xs text-gray-500">Read Rate</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Read', 
            count: statusCounts.read, 
            color: 'bg-success/10 text-success', 
            icon: 'Eye' 
          },
          { 
            label: 'Delivered', 
            count: statusCounts.delivered, 
            color: 'bg-warning/10 text-warning', 
            icon: 'Truck' 
          },
          { 
            label: 'Sent', 
            count: statusCounts.sent, 
            color: 'bg-info/10 text-info', 
            icon: 'Send' 
          },
          { 
            label: 'Failed', 
            count: statusCounts.failed, 
            color: 'bg-error/10 text-error', 
            icon: 'X' 
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="text-center">
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <ApperIcon name={stat.icon} className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.count}
              </div>
              <div className="text-sm text-gray-500">
                {stat.label}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Report Table */}
      <ReportTable
        reports={reports}
        contacts={contacts}
        loading={false}
      />
    </div>
  );
};

export default Reports;