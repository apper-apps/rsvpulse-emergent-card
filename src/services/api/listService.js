import listsData from '../mockData/lists.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let lists = [...listsData];

export const listService = {
  async getAll() {
    await delay(300);
    return [...lists];
  },

  async getById(id) {
    await delay(200);
    const list = lists.find(item => item.Id === parseInt(id, 10));
    if (!list) {
      throw new Error('List not found');
    }
    return { ...list };
  },

  async create(listData) {
    await delay(400);
    const maxId = lists.length > 0 ? Math.max(...lists.map(item => item.Id)) : 0;
    const newList = {
      Id: maxId + 1,
      name: listData.name,
      contactCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    lists.push(newList);
    return { ...newList };
  },

  async update(id, updateData) {
    await delay(300);
    const index = lists.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('List not found');
    }
    
    const updatedList = {
      ...lists[index],
      ...updateData,
      Id: lists[index].Id, // Never allow Id modification
      updatedAt: new Date().toISOString()
    };
    
    lists[index] = updatedList;
    return { ...updatedList };
  },

  async delete(id) {
    await delay(250);
    const index = lists.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('List not found');
    }
    
    const deleted = { ...lists[index] };
    lists.splice(index, 1);
    return deleted;
  }
};