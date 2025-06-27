import contactsData from '../mockData/contacts.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let contacts = [...contactsData];

export const contactService = {
async getAll() {
    await delay(300);
    return contacts.filter(contact => !contact.isDeleted).map(contact => ({ ...contact }));
  },

  async getByListId(listId) {
    await delay(300);
    return contacts.filter(contact => 
      contact.listId === parseInt(listId, 10) && !contact.isDeleted
    ).map(contact => ({ ...contact }));
  },

  async getById(id) {
    await delay(200);
    const contact = contacts.find(item => item.Id === parseInt(id, 10));
    if (!contact) {
      throw new Error('Contact not found');
    }
    return { ...contact };
  },

  async create(contactData) {
    await delay(400);
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(item => item.Id)) : 0;
    const newContact = {
      Id: maxId + 1,
      name: contactData.name,
      whatsappNumber: contactData.whatsappNumber,
      email: contactData.email,
      listId: parseInt(contactData.listId, 10),
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async createBatch(contactsData) {
    await delay(800);
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(item => item.Id)) : 0;
    const newContacts = contactsData.map((contact, index) => ({
      Id: maxId + 1 + index,
      name: contact.name,
      whatsappNumber: contact.whatsappNumber,
      email: contact.email,
      listId: parseInt(contact.listId, 10),
      createdAt: new Date().toISOString()
    }));
    
    contacts.push(...newContacts);
    return [...newContacts];
  },

  async update(id, updateData) {
    await delay(300);
    const index = contacts.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Contact not found');
    }
    
    const updatedContact = {
      ...contacts[index],
      ...updateData,
      Id: contacts[index].Id // Never allow Id modification
    };
    
    contacts[index] = updatedContact;
    return { ...updatedContact };
  },

async delete(id) {
    await delay(250);
    const index = contacts.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Contact not found');
    }
    
    // Soft delete - mark as deleted instead of removing
    const contact = contacts[index];
    const updatedContact = {
      ...contact,
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };
    
    contacts[index] = updatedContact;
    return { ...updatedContact };
  },

  async getAllDeleted() {
    await delay(300);
    return contacts.filter(contact => contact.isDeleted).map(contact => ({ ...contact }));
  },

  async restore(id) {
    await delay(250);
    const index = contacts.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Contact not found');
    }
    
    const contact = contacts[index];
    if (!contact.isDeleted) {
      throw new Error('Contact is not deleted');
    }
    
    const restoredContact = {
      ...contact,
      isDeleted: false,
      deletedAt: null
    };
    
    contacts[index] = restoredContact;
    return { ...restoredContact };
  },

  async permanentDelete(id) {
    await delay(250);
    const index = contacts.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Contact not found');
    }
    
    const deleted = { ...contacts[index] };
    contacts.splice(index, 1);
    return deleted;
  }
};