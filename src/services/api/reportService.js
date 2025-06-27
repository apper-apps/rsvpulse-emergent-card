import reportsData from '../mockData/reports.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let reports = [...reportsData];

export const reportService = {
  async getAll() {
    await delay(300);
    return [...reports];
  },

  async getByBroadcastId(broadcastId) {
    await delay(400);
    return reports.filter(report => report.broadcastId === parseInt(broadcastId, 10));
  },

  async create(reportData) {
    await delay(300);
    const newReport = {
      broadcastId: parseInt(reportData.broadcastId, 10),
      contactId: parseInt(reportData.contactId, 10),
      status: reportData.status,
      readAt: reportData.readAt || null
    };
    reports.push(newReport);
    return { ...newReport };
  },

  async createBatch(reportsData) {
    await delay(500);
    const newReports = reportsData.map(report => ({
      broadcastId: parseInt(report.broadcastId, 10),
      contactId: parseInt(report.contactId, 10),
      status: report.status,
      readAt: report.readAt || null
    }));
    
    reports.push(...newReports);
    return [...newReports];
  }
};