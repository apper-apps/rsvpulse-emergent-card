import templatesData from '../mockData/templates.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let templates = [...templatesData];

export const templateService = {
  async getAll() {
    await delay(300);
    return [...templates];
  },

  async getById(id) {
    await delay(200);
    const template = templates.find(item => item.Id === parseInt(id, 10));
    if (!template) {
      throw new Error('Template not found');
    }
    return { ...template };
  },

  async create(templateData) {
    await delay(400);
    const maxId = templates.length > 0 ? Math.max(...templates.map(item => item.Id)) : 0;
    const newTemplate = {
      Id: maxId + 1,
      name: templateData.name,
      description: templateData.description,
      content: templateData.content,
      category: templateData.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    templates.push(newTemplate);
    return { ...newTemplate };
  },

  async update(id, templateData) {
    await delay(400);
    const index = templates.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Template not found');
    }
    
    templates[index] = {
      ...templates[index],
      name: templateData.name,
      description: templateData.description,
      content: templateData.content,
      category: templateData.category,
      updatedAt: new Date().toISOString()
    };
    
    return { ...templates[index] };
  },

  async delete(id) {
    await delay(300);
    const index = templates.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Template not found');
    }
    
    templates.splice(index, 1);
    return { success: true };
  }
};