import Dexie, { Table } from 'dexie';

export interface DbTask {
  id?: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbDefect {
  id?: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbMeeting {
  id?: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbProject {
  id?: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

class QANexusDatabase extends Dexie {
  tasks!: Table<DbTask, number>;
  defects!: Table<DbDefect, number>;
  meetings!: Table<DbMeeting, number>;
  projects!: Table<DbProject, number>;

  constructor() {
    super('QANexusDB');
    this.version(1).stores({
      tasks: '++id, title, description, createdAt, updatedAt',
      defects: '++id, title, description, createdAt, updatedAt',
      meetings: '++id, title, description, createdAt, updatedAt',
      projects: '++id, title, description, createdAt, updatedAt',
    });
  }
}

export const db = new QANexusDatabase();

// Export all data from the database as JSON
export async function exportDatabase(): Promise<string> {
  try {
    const data = {
      tasks: await db.tasks.toArray(),
      defects: await db.defects.toArray(),
      meetings: await db.meetings.toArray(),
      projects: await db.projects.toArray(),
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
}

// Import data from JSON into the database
// This will clear existing data and replace with imported data
export async function importDatabase(jsonData: string | Record<string, unknown>): Promise<boolean> {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    await db.transaction('rw', db.tasks, db.defects, db.meetings, db.projects, async () => {
      await db.tasks.clear();
      await db.defects.clear();
      await db.meetings.clear();
      await db.projects.clear();

      if (data.tasks) await db.tasks.bulkAdd(data.tasks);
      if (data.defects) await db.defects.bulkAdd(data.defects);
      if (data.meetings) await db.meetings.bulkAdd(data.meetings);
      if (data.projects) await db.projects.bulkAdd(data.projects);
    });

    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    throw error;
  }
}