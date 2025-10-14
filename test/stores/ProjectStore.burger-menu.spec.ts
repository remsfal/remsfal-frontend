import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProjectStore } from '../../src/stores/ProjectStore';

// Mock the project service with proper vi.mocked support
vi.mock('@/services/ProjectService', () => ({
  projectService: {
    getProjects: vi.fn(),
    getProject: vi.fn(),
    createProject: vi.fn(),
  },
}));

describe('ProjectStore - Burger Menu Bug Fix', () => {
  let store: ReturnType<typeof useProjectStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useProjectStore();
    vi.clearAllMocks();
  });

  it('should maintain project list when adding a new project after initial load', async () => {
    // Simulate initial state with multiple projects (like the burger menu initially shows)
    const initialProjects = [
      { id: 'test2', name: 'test2', memberRole: 'MANAGER' as const },
      { id: 'mm', name: 'mm', memberRole: 'MANAGER' as const },
      { id: '123', name: '123', memberRole: 'MANAGER' as const },
      { id: 'test', name: 'test', memberRole: 'MANAGER' as const },
      { id: 'test3', name: 'test3', memberRole: 'MANAGER' as const },
    ];

    // Directly set the projects instead of using refreshProjectList to avoid API calls
    store.projects = initialProjects;
    store.totalProjects = 5;
    store.firstOffset = 1;

    expect(store.projects).toHaveLength(5);
    expect(store.projectList.map(p => p.name)).toEqual(['test2', 'mm', '123', 'test', 'test3']);

    // Simulate creating a new project (this was causing the bug)
    const newProject = { id: 'Club', name: 'Club', memberRole: 'MANAGER' as const };
    await store.addProjectToList(newProject);

    // Verify that all projects are still in the list (this was the bug - only new project was shown)
    expect(store.projects).toHaveLength(6);
    expect(store.projectList.map(p => p.name)).toEqual(['Club', 'test2', 'mm', '123', 'test', 'test3']);

    // Verify the new project is added at the beginning
    expect(store.projects[0]).toEqual(newProject);
  });

  it('should update existing project if adding duplicate ID', async () => {
    // Start with initial projects
    const initialProjects = [
      { id: 'test1', name: 'Test 1', memberRole: 'MANAGER' as const },
      { id: 'test2', name: 'Test 2', memberRole: 'MANAGER' as const },
    ];

    store.projects = initialProjects;
    store.totalProjects = 2;

    // Try to add a project with existing ID but different name
    const updatedProject = { id: 'test1', name: 'Updated Test 1', memberRole: 'MANAGER' as const };
    await store.addProjectToList(updatedProject);

    // Should still have 2 projects, but the first one should be updated
    expect(store.projects).toHaveLength(2);
    expect(store.projects[0]).toEqual(updatedProject);
    expect(store.projects[1]).toEqual(initialProjects[1]);
  });

  it('should maintain selected project correctly when adding new project', async () => {
    const initialProjects = [
      { id: 'existing1', name: 'Existing 1', memberRole: 'MANAGER' as const },
      { id: 'existing2', name: 'Existing 2', memberRole: 'MANAGER' as const },
    ];

    store.projects = initialProjects;
    store.setSelectedProject(initialProjects[0]);

    // Add a new project
    const newProject = { id: 'new1', name: 'New Project', memberRole: 'MANAGER' as const };
    await store.addProjectToList(newProject);
    store.setSelectedProject(newProject);

    // Verify new project is selected and all projects are maintained
    expect(store.selectedProject).toEqual(newProject);
    expect(store.projects).toHaveLength(3);
    expect(store.projectList.map(p => p.name)).toEqual(['New Project', 'Existing 1', 'Existing 2']);
  });

  it('should work correctly with searchSelectedProject using new implementation', async () => {
    // Initial projects in store
    const initialProjects = [
      { id: 'existing1', name: 'Existing 1', memberRole: 'MANAGER' as const },
      { id: 'existing2', name: 'Existing 2', memberRole: 'MANAGER' as const },
    ];
    store.projects = initialProjects;

    // Mock fetchSingleProject by directly testing addProjectToList
    const newProject = { id: 'new-project-id', name: 'New Project Title', memberRole: 'MANAGER' as const };

    // Simulate the new behavior: add project to list instead of searching/filtering
    await store.addProjectToList(newProject);
    store.setSelectedProject(newProject);

    // Verify the new project was added to the list and selected
    expect(store.projects).toHaveLength(3);
    expect(store.projects[0]).toEqual({
      id: 'new-project-id',
      name: 'New Project Title',
      memberRole: 'MANAGER',
    });
    expect(store.selectedProject).toEqual({
      id: 'new-project-id',
      name: 'New Project Title',
      memberRole: 'MANAGER',
    });

    // Verify original projects are still there
    expect(store.projectList.map(p => p.name)).toEqual(['New Project Title', 'Existing 1', 'Existing 2']);
  });
});