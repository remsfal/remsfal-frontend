import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as idbHelper from '@/helper/indexeddb';
import { openDB } from 'idb';

vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

describe('IndexedDB Helper Functions', () => {
  let mockDb: any;

  beforeEach(() => {
    // Mock openDB to return a mock database object
    mockDb = {
      add: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    };

    // Mock the implementation of openDB to return the mock database
    openDB.mockResolvedValue(mockDb);
  });

  it('should save a project to IndexedDB', async () => {
    // Arrange
    const projectTitle = 'New Project';
    mockDb.add.mockResolvedValue(undefined); // Simulate successful addition

    // Act
    await idbHelper.saveProject(projectTitle);

    // Assert
    expect(openDB).toHaveBeenCalledWith('offline-projects-db', 1, expect.any(Object)); // Verifying openDB call
    expect(mockDb.add).toHaveBeenCalledWith(
      'projects',
      expect.objectContaining({
        title: projectTitle,
        createdAt: expect.any(Number),
      }),
    );
    expect(mockDb.add).toHaveBeenCalledTimes(1); // Ensure add method is called once
  });

  it('should retrieve all projects from IndexedDB', async () => {
    // Arrange
    const mockProjects = [{ title: 'Project 1', createdAt: 1234567890 }];
    mockDb.getAll.mockResolvedValue(mockProjects);

    // Act
    const result = await idbHelper.getAllProjects();

    // Assert
    expect(openDB).toHaveBeenCalled();
    expect(mockDb.getAll).toHaveBeenCalledWith('projects');
    expect(result).toEqual(mockProjects); // Verify that the retrieved projects match the mock
  });

  it('should delete a project from IndexedDB', async () => {
    // Arrange
    const projectKey = 1234567890;
    mockDb.delete.mockResolvedValue(undefined);

    // Act
    await idbHelper.deleteProject(projectKey);

    // Assert
    expect(openDB).toHaveBeenCalled();
    expect(mockDb.delete).toHaveBeenCalledWith('projects', projectKey);
    expect(mockDb.delete).toHaveBeenCalledTimes(1); // Ensure delete method is called once
  });
});
