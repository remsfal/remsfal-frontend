import { openDB } from 'idb';

interface ProjectDB {
  projects: {
    key: number // timestamp as key
    value: { title: string, createdAt: number }
  }
}

export async function initDB() {
  return await openDB<ProjectDB>('offline-projects-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'createdAt' });
      }
    },
  });
}

export async function saveProject(title: string) {
  const db = await initDB();
  const project = { title, createdAt: Date.now() };
  await db.add('projects', project);
  console.info('Project saved to IndexedDB:', project);
}

export async function getAllProjects() {
  const db = await initDB();
  return await db.getAll('projects');
}

export async function deleteProject(key: number) {
  const db = await initDB();
  await db.delete('projects', key);
  console.info('Project deleted from IndexedDB:', key);
}
