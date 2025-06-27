import settingsData from '../mockData/settings.json';

let settings = [...settingsData];
let nextId = Math.max(...settings.map(s => s.Id)) + 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll = async () => {
  await delay(300);
  return [...settings];
};

export const getById = async (id) => {
  await delay(300);
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error('Invalid ID format');
  }
  
  const setting = settings.find(s => s.Id === parsedId);
  if (!setting) {
    throw new Error('Setting not found');
  }
  
  return { ...setting };
};

export const create = async (item) => {
  await delay(300);
  const newSetting = {
    ...item,
    Id: nextId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    connectionStatus: 'not_tested',
    lastTested: null
  };
  
  settings.push(newSetting);
  return { ...newSetting };
};

export const update = async (id, data) => {
  await delay(300);
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error('Invalid ID format');
  }
  
  const index = settings.findIndex(s => s.Id === parsedId);
  if (index === -1) {
    throw new Error('Setting not found');
  }
  
  const updatedSetting = {
    ...settings[index],
    ...data,
    Id: parsedId, // Prevent ID changes
    updatedAt: new Date().toISOString()
  };
  
  settings[index] = updatedSetting;
  return { ...updatedSetting };
};

export const delete_ = async (id) => {
  await delay(300);
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error('Invalid ID format');
  }
  
  const index = settings.findIndex(s => s.Id === parsedId);
  if (index === -1) {
    throw new Error('Setting not found');
  }
  
  settings.splice(index, 1);
  return true;
};

export const testConnection = async (id) => {
  await delay(1500); // Simulate API call
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error('Invalid ID format');
  }
  
  const setting = settings.find(s => s.Id === parsedId);
  if (!setting) {
    throw new Error('Setting not found');
  }
  
  // Simulate connection test
  const isValid = setting.apiUrl && setting.apiKey && setting.phoneNumberId;
  const status = isValid ? 'connected' : 'failed';
  
  // Update connection status
  const index = settings.findIndex(s => s.Id === parsedId);
  settings[index] = {
    ...setting,
    connectionStatus: status,
    lastTested: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return {
    success: isValid,
    status,
    message: isValid ? 'Connection successful' : 'Connection failed - check your credentials'
  };
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: delete_,
  testConnection
};