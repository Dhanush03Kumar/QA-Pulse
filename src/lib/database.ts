
import Dexie from 'dexie';

export const db = new Dexie('QANexusDB');

db.version(1).stores({
  tasks: '++id, title, description, createdAt, updatedAt',
  defects: '++id, title, description, createdAt, updatedAt',
  meetings: '++id, title, description, createdAt, updatedAt',
  projects: '++id, title, description, createdAt, updatedAt'
});

// Optionally, you can add more specific indexes here.

