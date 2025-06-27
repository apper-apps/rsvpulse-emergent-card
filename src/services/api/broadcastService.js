import broadcastsData from '../mockData/broadcasts.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let broadcasts = [...broadcastsData];

export const broadcastService = {
  async getAll() {
    await delay(300);
    return [...broadcasts];
  },

  async getById(id) {
    await delay(200);
    const broadcast = broadcasts.find(item => item.Id === parseInt(id, 10));
    if (!broadcast) {
      throw new Error('Broadcast not found');
    }
    return { ...broadcast };
  },

  async create(broadcastData) {
    await delay(1000); // Longer delay to simulate sending
    const maxId = broadcasts.length > 0 ? Math.max(...broadcasts.map(item => item.Id)) : 0;
    const newBroadcast = {
      Id: maxId + 1,
      listId: parseInt(broadcastData.listId, 10),
      message: broadcastData.message,
      sentAt: new Date().toISOString(),
      totalRecipients: broadcastData.totalRecipients
    };
    broadcasts.push(newBroadcast);
    return { ...newBroadcast };
  },

  async getLatest() {
    await delay(200);
    if (broadcasts.length === 0) return null;
    const sorted = [...broadcasts].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    return { ...sorted[0] };
  }
};