import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import settingsService from '@/services/api/settingsService';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
  
  const whatsappSettings = settings.find(s => s.category === 'whatsapp') || {};
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  useEffect(() => {
    if (whatsappSettings.Id) {
      setValue('apiUrl', whatsappSettings.apiUrl || '');
      setValue('apiKey', whatsappSettings.apiKey || '');
      setValue('phoneNumberId', whatsappSettings.phoneNumberId || '');
      setValue('businessAccountId', whatsappSettings.businessAccountId || '');
    }
  }, [whatsappSettings, setValue]);
  
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      if (whatsappSettings.Id) {
        // Update existing
        await settingsService.update(whatsappSettings.Id, {
          ...data,
          isActive: true
        });
        toast.success('WhatsApp integration settings saved successfully');
      } else {
        // Create new
        await settingsService.create({
          category: 'whatsapp',
          name: 'WhatsApp Business API',
          ...data,
          isActive: true
        });
        toast.success('WhatsApp integration settings created successfully');
      }
      
      await loadSettings();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!whatsappSettings.Id) {
      toast.error('Please save your settings first');
      return;
    }
    
    try {
      setTesting(true);
      const result = await settingsService.testConnection(whatsappSettings.Id);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      
      await loadSettings();
    } catch (err) {
      toast.error('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };
  
  const handleReset = () => {
    reset();
    setValue('apiUrl', '');
    setValue('apiKey', '');
    setValue('phoneNumberId', '');
    setValue('businessAccountId', '');
    toast.info('Form reset');
  };
  
  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };
  
  const getConnectionStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'failed': return 'Connection Failed';
      default: return 'Not Tested';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your application settings and integrations</p>
        </div>
      </div>
      
      {/* Integration Section */}
      <Card className="max-w-4xl">
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="MessageSquare" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">WhatsApp Integration</h2>
                <p className="text-sm text-gray-600">Configure your WhatsApp Business API settings</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                whatsappSettings.connectionStatus === 'connected' ? 'bg-green-500' :
                whatsappSettings.connectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className={`text-sm font-medium ${getConnectionStatusColor(whatsappSettings.connectionStatus)}`}>
                {getConnectionStatusText(whatsappSettings.connectionStatus)}
              </span>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API URL */}
              <div className="md:col-span-2">
                <Input
                  label="API URL"
                  placeholder="https://graph.facebook.com/v18.0"
                  {...register('apiUrl', {
                    required: 'API URL is required',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL'
                    }
                  })}
                  error={errors.apiUrl?.message}
                />
              </div>
              
              {/* API Key */}
              <div className="md:col-span-2">
                <Input
                  label="API Key"
                  type="password"
                  placeholder="Enter your WhatsApp Business API key"
                  {...register('apiKey', {
                    required: 'API Key is required',
                    minLength: {
                      value: 10,
                      message: 'API Key must be at least 10 characters'
                    }
                  })}
                  error={errors.apiKey?.message}
                />
              </div>
              
              {/* Phone Number ID */}
              <div>
                <Input
                  label="Phone Number ID"
                  placeholder="Enter your phone number ID"
                  {...register('phoneNumberId', {
                    required: 'Phone Number ID is required'
                  })}
                  error={errors.phoneNumberId?.message}
                />
              </div>
              
              {/* Business Account ID */}
              <div>
                <Input
                  label="Business Account ID"
                  placeholder="Enter your business account ID"
                  {...register('businessAccountId', {
                    required: 'Business Account ID is required'
                  })}
                  error={errors.businessAccountId?.message}
                />
              </div>
            </div>
            
            {/* Last Tested */}
            {whatsappSettings.lastTested && (
              <div className="text-sm text-gray-500">
                Last tested: {new Date(whatsappSettings.lastTested).toLocaleString()}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={saving || testing}
              >
                <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={saving || testing || !whatsappSettings.Id}
                  loading={testing}
                >
                  <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                
                <Button
                  type="submit"
                  disabled={saving || testing}
                  loading={saving}
                >
                  <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>
      
      {/* Integration Guide */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Info" className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Integration Guide</h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">1.</span>
              <span>Create a WhatsApp Business Account and get your API credentials from Meta Business</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">2.</span>
              <span>Enter your API URL (typically https://graph.facebook.com/v18.0)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">3.</span>
              <span>Add your API Key, Phone Number ID, and Business Account ID</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">4.</span>
              <span>Test the connection to verify your credentials</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">5.</span>
              <span>Save your settings to start using WhatsApp integrations</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;