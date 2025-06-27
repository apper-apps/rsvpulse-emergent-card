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
  const [saving, setSaving] = useState({});
  const [testing, setTesting] = useState({});
  const [error, setError] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState('whatsapp');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
  
  const integrations = [
    { id: 'whatsapp', name: 'WhatsApp Business API', icon: 'MessageSquare', color: 'green' },
    { id: 'postmark', name: 'Postmark API', icon: 'Mail', color: 'blue' },
    { id: 'smtp2go', name: 'SMTP2Go API', icon: 'Send', color: 'purple' },
    { id: 'twilio', name: 'Twilio API', icon: 'Phone', color: 'red' }
  ];
  
  const currentIntegration = integrations.find(i => i.id === selectedIntegration);
  const currentSettings = settings.find(s => s.category === selectedIntegration) || {};
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  useEffect(() => {
    // Reset form when integration changes
    reset();
    populateForm();
  }, [selectedIntegration, settings, reset]);
  
  const populateForm = () => {
    if (currentSettings.Id) {
      setValue('apiUrl', currentSettings.apiUrl || '');
      setValue('apiKey', currentSettings.apiKey || '');
      
      // Integration-specific fields
      if (selectedIntegration === 'whatsapp') {
        setValue('phoneNumberId', currentSettings.phoneNumberId || '');
        setValue('businessAccountId', currentSettings.businessAccountId || '');
      } else if (selectedIntegration === 'postmark') {
        setValue('fromEmail', currentSettings.fromEmail || '');
        setValue('fromName', currentSettings.fromName || '');
      } else if (selectedIntegration === 'smtp2go') {
        setValue('username', currentSettings.username || '');
        setValue('smtpHost', currentSettings.smtpHost || '');
        setValue('smtpPort', currentSettings.smtpPort || '');
      } else if (selectedIntegration === 'twilio') {
        setValue('accountSid', currentSettings.accountSid || '');
        setValue('authToken', currentSettings.authToken || '');
        setValue('phoneNumber', currentSettings.phoneNumber || '');
      }
    }
  };
  
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
      setSaving(prev => ({ ...prev, [selectedIntegration]: true }));
      
      if (currentSettings.Id) {
        // Update existing
        await settingsService.update(currentSettings.Id, {
          ...data,
          isActive: true
        });
        toast.success(`${currentIntegration.name} settings saved successfully`);
      } else {
        // Create new
        await settingsService.create({
          category: selectedIntegration,
          name: currentIntegration.name,
          ...data,
          isActive: true
        });
        toast.success(`${currentIntegration.name} settings created successfully`);
      }
      
      await loadSettings();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(prev => ({ ...prev, [selectedIntegration]: false }));
    }
  };
  
  const handleTestConnection = async () => {
    if (!currentSettings.Id) {
      toast.error('Please save your settings first');
      return;
    }
    
    try {
      setTesting(prev => ({ ...prev, [selectedIntegration]: true }));
      const result = await settingsService.testConnection(currentSettings.Id);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      
      await loadSettings();
    } catch (err) {
      toast.error('Failed to test connection');
    } finally {
      setTesting(prev => ({ ...prev, [selectedIntegration]: false }));
    }
  };
  
  const handleReset = () => {
    reset();
    populateForm();
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
  
  const getIntegrationColorClasses = (color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  };
  
  const renderIntegrationForm = () => {
    switch (selectedIntegration) {
      case 'whatsapp':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        );
      
      case 'postmark':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="API URL"
                placeholder="https://api.postmarkapp.com"
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
            <div className="md:col-span-2">
              <Input
                label="Server API Token"
                type="password"
                placeholder="Enter your Postmark server API token"
                {...register('apiKey', {
                  required: 'Server API Token is required',
                  minLength: {
                    value: 20,
                    message: 'API Token must be at least 20 characters'
                  }
                })}
                error={errors.apiKey?.message}
              />
            </div>
            <div>
              <Input
                label="From Email"
                type="email"
                placeholder="noreply@yourdomain.com"
                {...register('fromEmail', {
                  required: 'From Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={errors.fromEmail?.message}
              />
            </div>
            <div>
              <Input
                label="From Name"
                placeholder="Your Company Name"
                {...register('fromName', {
                  required: 'From Name is required'
                })}
                error={errors.fromName?.message}
              />
            </div>
          </div>
        );
      
      case 'smtp2go':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="API URL"
                placeholder="https://api.smtp2go.com/v3"
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
            <div className="md:col-span-2">
              <Input
                label="API Key"
                type="password"
                placeholder="Enter your SMTP2Go API key"
                {...register('apiKey', {
                  required: 'API Key is required',
                  minLength: {
                    value: 15,
                    message: 'API Key must be at least 15 characters'
                  }
                })}
                error={errors.apiKey?.message}
              />
            </div>
            <div>
              <Input
                label="Username"
                placeholder="Enter your SMTP2Go username"
                {...register('username', {
                  required: 'Username is required'
                })}
                error={errors.username?.message}
              />
            </div>
            <div>
              <Input
                label="SMTP Host"
                placeholder="mail.smtp2go.com"
                {...register('smtpHost', {
                  required: 'SMTP Host is required'
                })}
                error={errors.smtpHost?.message}
              />
            </div>
            <div>
              <Input
                label="SMTP Port"
                type="number"
                placeholder="587"
                {...register('smtpPort', {
                  required: 'SMTP Port is required',
                  min: {
                    value: 1,
                    message: 'Port must be greater than 0'
                  },
                  max: {
                    value: 65535,
                    message: 'Port must be less than 65536'
                  }
                })}
                error={errors.smtpPort?.message}
              />
            </div>
          </div>
        );
      
      case 'twilio':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="API URL"
                placeholder="https://api.twilio.com/2010-04-01"
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
            <div>
              <Input
                label="Account SID"
                placeholder="Enter your Twilio Account SID"
                {...register('accountSid', {
                  required: 'Account SID is required',
                  minLength: {
                    value: 34,
                    message: 'Account SID must be 34 characters'
                  },
                  maxLength: {
                    value: 34,
                    message: 'Account SID must be 34 characters'
                  }
                })}
                error={errors.accountSid?.message}
              />
            </div>
            <div>
              <Input
                label="Auth Token"
                type="password"
                placeholder="Enter your Twilio Auth Token"
                {...register('authToken', {
                  required: 'Auth Token is required',
                  minLength: {
                    value: 32,
                    message: 'Auth Token must be 32 characters'
                  },
                  maxLength: {
                    value: 32,
                    message: 'Auth Token must be 32 characters'
                  }
                })}
                error={errors.authToken?.message}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Phone Number"
                placeholder="+1234567890"
                {...register('phoneNumber', {
                  required: 'Phone Number is required',
                  pattern: {
                    value: /^\+[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number with country code'
                  }
                })}
                error={errors.phoneNumber?.message}
              />
            </div>
          </div>
        );
      
      default:
        return null;
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
      
      {/* Integrations Section */}
      <Card className="max-w-6xl">
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Settings" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
                <p className="text-sm text-gray-600">Configure your API integrations and external services</p>
              </div>
            </div>
          </div>
          
          {/* Integration Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {integrations.map((integration) => {
              const integrationSettings = settings.find(s => s.category === integration.id) || {};
              const isActive = selectedIntegration === integration.id;
              
              return (
                <button
                  key={integration.id}
                  onClick={() => setSelectedIntegration(integration.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${getIntegrationColorClasses(integration.color)}`}>
                    <ApperIcon name={integration.icon} className="w-3 h-3" />
                  </div>
                  <span>{integration.name}</span>
                  {integrationSettings.connectionStatus === 'connected' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Selected Integration Form */}
          <div className="space-y-6">
            {/* Integration Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIntegrationColorClasses(currentIntegration.color)}`}>
                  <ApperIcon name={currentIntegration.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentIntegration.name}</h3>
                  <p className="text-sm text-gray-600">Configure your {currentIntegration.name} settings</p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentSettings.connectionStatus === 'connected' ? 'bg-green-500' :
                  currentSettings.connectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${getConnectionStatusColor(currentSettings.connectionStatus)}`}>
                  {getConnectionStatusText(currentSettings.connectionStatus)}
                </span>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {renderIntegrationForm()}
              
              {/* Last Tested */}
              {currentSettings.lastTested && (
                <div className="text-sm text-gray-500">
                  Last tested: {new Date(currentSettings.lastTested).toLocaleString()}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  disabled={saving[selectedIntegration] || testing[selectedIntegration]}
                >
                  <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={saving[selectedIntegration] || testing[selectedIntegration] || !currentSettings.Id}
                    loading={testing[selectedIntegration]}
                  >
                    <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={saving[selectedIntegration] || testing[selectedIntegration]}
                    loading={saving[selectedIntegration]}
                  >
                    <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </form>
          </div>
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
              <span>Select the integration you want to configure from the tabs above</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">2.</span>
              <span>Enter your API credentials and configuration details</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">3.</span>
              <span>Save your settings to store the configuration</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">4.</span>
              <span>Test the connection to verify your credentials</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-900">5.</span>
              <span>Configure additional integrations as needed for your workflows</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;