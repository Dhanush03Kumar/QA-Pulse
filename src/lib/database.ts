import Dexie, { Table } from 'dexie';

export interface DbTask {
  id?: number;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  dueDate: string;
  project: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DbActivity {
  id?: number;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

// Keep the other interfaces for compatibility but we won't use them for tasks/activities
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
  activities!: Table<DbActivity, number>;

  constructor() {
    super('QANexusDB');
    this.version(1).stores({
      tasks: '++id, title, description, priority, status, dueDate, project, tags, createdAt, updatedAt',
      defects: '++id, title, description, createdAt, updatedAt',
      meetings: '++id, title, description, createdAt, updatedAt',
      projects: '++id, title, description, createdAt, updatedAt',
      activities: '++id, action, module, timestamp, details',
    });
  }
}

export const db = new QANexusDatabase();

// Task CRUD operations
export async function getTasks(): Promise<DbTask[]> {
  return await db.tasks.toArray();
}

export async function addTask(task: Omit<DbTask, 'id'>): Promise<number> {
  const now = new Date().toISOString();
  const taskWithTimestamps = { ...task, createdAt: now, updatedAt: now };
  return await db.tasks.add(taskWithTimestamps);
}

export async function updateTask(id: number, updates: Partial<DbTask>): Promise<void> {
  const updatesWithTimestamp = { ...updates, updatedAt: new Date().toISOString() };
  await db.tasks.update(id, updatesWithTimestamp);
}

export async function deleteTask(id: number): Promise<void> {
  await db.tasks.delete(id);
}

// Activity operations
export async function getActivities(): Promise<DbActivity[]> {
  return await db.activities.orderBy('timestamp').reverse().toArray(); // Most recent first
}

export async function addActivity(activity: Omit<DbActivity, 'id'>): Promise<number> {
  const id = await db.activities.add(activity);
  const count = await db.activities.count();
  const MAX_ACTIVITIES = 250;
  if (count > MAX_ACTIVITIES) {
    const excess = count - MAX_ACTIVITIES;
    const oldest = await db.activities.orderBy('timestamp').limit(excess).toArray();
    const ids = oldest.map(item => item.id);
    await db.activities.bulkDelete(ids);
  }
  return id;
}

// Export all data from the database as JSON
export async function exportDatabase(): Promise<string> {
  try {
    const data = {
      tasks: await db.tasks.toArray(),
      defects: await db.defects.toArray(),
      meetings: await db.meetings.toArray(),
      projects: await db.projects.toArray(),
      activities: await db.activities.toArray(),
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

    await db.transaction('rw', db.tasks, db.defects, db.meetings, db.projects, db.activities, async () => {
      await db.tasks.clear();
      await db.defects.clear();
      await db.meetings.clear();
      await db.projects.clear();
      await db.activities.clear();

      if (data.tasks) await db.tasks.bulkAdd(data.tasks);
      if (data.defects) await db.defects.bulkAdd(data.defects);
      if (data.meetings) await db.meetings.bulkAdd(data.meetings);
      if (data.projects) await db.projects.bulkAdd(data.projects);
      if (data.activities) await db.activities.bulkAdd(data.activities);
    });

    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    throw error;
  }
}
