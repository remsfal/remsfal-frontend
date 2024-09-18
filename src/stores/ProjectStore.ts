import { defineStore } from 'pinia';
import ProjectService, { type ProjectList, type ProjectItem } from '@/services/ProjectService';

export const useProjectStore = defineStore('project-store', {
  state: () => {
    return {
      projects: <ProjectItem[]>[],
      selectedProject: null as ProjectItem | null,
      totalProjects: Number(0),
      firstOffset: Number(0),
    };
  },
  getters: {
    projectList: (state) => state.projects,
    projectSelection: (state) => state.selectedProject,
    projectId: (state) => state.selectedProject!.id,
  },
  actions: {
    refreshProjectList() {
      const projectService = new ProjectService();
      projectService
        .getProjects()
        .then((projectList: ProjectList) => {
          this.projects = projectList.projects;
          this.totalProjects = projectList.total;
          this.firstOffset = projectList.first;
          console.log('Refreshed project list: ', this.projects);
        })
        .catch((error) => {
          // Handle the error here
          console.error('An error occurred while refreshing projects:', error);
        });
    },
    fetchProjects(offset: number, limit: number): Promise<void> {
      const projectService = new ProjectService();
      return projectService
        .getProjects(offset, limit)
        .then((projectList: ProjectList) => {
          this.projects = projectList.projects;
          this.totalProjects = projectList.total;
          this.firstOffset = projectList.first;
          console.log('Fetched project list: ', this.projects);
        })
        .catch((error) => {
          // Handle the error here
          console.error('An error occurred while fetching projects:', error);
        });
    },
    setSelectedProject(selection: ProjectItem) {
      this.selectedProject = selection;
      console.log('Project selection changed: ', this.selectedProject);
    },
    searchSelectedProject(selection: ProjectItem) {
      if (this.projects.find((p) => p.id === selection.id)) {
        this.setSelectedProject(selection);
      }

      this.projects = [selection];
      this.totalProjects++;
      this.selectedProject = selection;
      console.log('Searched project selection changed: ', this.selectedProject);
    },
  },
});
