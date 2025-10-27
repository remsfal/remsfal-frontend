import { defineStore } from 'pinia';
import { projectService } from '@/services/ProjectService';
import type { ProjectList, ProjectItem } from '@/services/ProjectService';

export const useProjectStore = defineStore('project-store', {
  state: () => ({
    projects: [] as ProjectItem[],
    selectedProject: undefined as ProjectItem | undefined,
    totalProjects: 0,
    firstOffset: 0,
  }),
  getters: {
    projectList: (state) => state.projects,
    projectSelection: (state) => state.selectedProject,
    projectId: (state) => state.selectedProject?.id,
  },
  actions: {
    async refreshProjectList() {
      try {
        const projectList: ProjectList = await projectService.getProjects();
        this.projects = projectList.projects ?? [];
        this.totalProjects = projectList.total;
        this.firstOffset = projectList.first;
        console.log('Refreshed project list:', this.projects);
      } catch (error) {
        console.error('An error occurred while refreshing projects:', error);
      }
    },

    async fetchProjects(offset: number, limit: number): Promise<void> {
      try {
        const projectList: ProjectList = await projectService.getProjects(offset, limit);
        this.projects = projectList.projects ?? [];
        this.totalProjects = projectList.total;
        this.firstOffset = projectList.first;
        console.log('Fetched project list:', this.projects);
      } catch (error) {
        console.error('An error occurred while fetching projects:', error);
      }
    },

    async searchProjects(projectId: string): Promise<void> {
      try {
        const projectList: ProjectList = await projectService.searchProjects(projectId);
        this.projects = projectList.projects ?? [];
        this.totalProjects = projectList.total;
        this.firstOffset = projectList.first;
        console.log('Searched project list:', this.projects);
      } catch (error) {
        console.error('An error occurred while searching projects:', error);
      }
    },

    setSelectedProject(selection: ProjectItem | undefined) {
      this.selectedProject = selection;
      console.log('Project selection changed:', this.selectedProject);
    },

    async addProjectToList(project: ProjectItem) {
      // Check if project already exists in the list
      const existingIndex = this.projects.findIndex((p) => p.id === project.id);
      if (existingIndex >= 0) {
        // Update existing project
        this.projects[existingIndex] = project;
      } else {
        // Add new project to the beginning of the list
        this.projects.unshift(project);
        this.totalProjects += 1;
      }
      console.log('Added/updated project in list:', project);
    },

    async fetchSingleProject(projectId: string): Promise<ProjectItem | undefined> {
      try {
        const project = await projectService.getProject(projectId);
        // Convert Project to ProjectItem format
        const projectItem: ProjectItem = {
          id: project.id || '',
          name: project.title,
          memberRole: 'MANAGER', // Default role - this should ideally come from the API
        };
        return projectItem;
      } catch (error) {
        console.error('Failed to fetch single project:', error);
        return undefined;
      }
    },

    async searchSelectedProject(projectId: string) {
      if (projectId === this.selectedProject?.id) {
        console.log('Project is already selected');
        return;
      }

      // Try to find in current projects list first
      const localMatch = this.projects.findLast((p) => p.id === projectId);
      if (localMatch) {
        this.setSelectedProject(localMatch);
        return;
      }

      // Fetch the single project and add it to the list without overwriting existing projects
      const projectItem = await this.fetchSingleProject(projectId);
      if (projectItem) {
        await this.addProjectToList(projectItem);
        this.setSelectedProject(projectItem);
      }
    },
    updateProjectName(projectId: string, newName: string) {
      const project = this.projects.find((p) => p.id === projectId);
      if (project) {
        project.name = newName;
      }

      if (this.selectedProject?.id === projectId) {
        this.selectedProject = { ...this.selectedProject, name: newName };
      }
    },
  },
});
