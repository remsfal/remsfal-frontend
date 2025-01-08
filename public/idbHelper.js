self.openDatabase = async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-projects-db', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'createdAt' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error('Failed to open IndexedDB: ' + event.target.error));
    };
  });
};

self.getAllProjects = async function getAllProjects() {
  const db = await self.openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error('Failed to retrieve projects: ' + event.target.error));
    };
  });
};

self.deleteProject = async function deleteProject(createdAt) {
  const db = await self.openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readwrite');
    const store = transaction.objectStore('projects');
    const request = store.delete(createdAt);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(new Error('Failed to delete project: ' + event.target.error));
    };
  });
};
