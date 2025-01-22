import { defineStore } from 'pinia';
import ProjectService, { type ProjectList, type ProjectItem } from '@/services/ProjectService';

export const useProjectStore = defineStore('project-store', {
  state: () => {
    return {
      projects: <ProjectItem[]>[],
      selectedProject: undefined as ProjectItem | undefined,
      totalProjects: Number(0),
      firstOffset: Number(0),
    };
  },
  getters: {
    projectList: (state) => state.projects,
    projectSelection: (state) => state.selectedProject,
    projectId: (state) => {
      if (state.selectedProject !== undefined) {
        return state.selectedProject!.id;
      }
    },
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
    searchProjects(projectId: string): Promise<void> {
      const projectService = new ProjectService();
      return projectService
        .searchProjects(projectId)
        .then((projectList: ProjectList) => {
          this.projects = projectList.projects;
          this.totalProjects = projectList.total;
          this.firstOffset = projectList.first;
          console.log('Searched project list: ', this.projects);
        })
        .catch((error) => {
          // Handle the error here
          console.error('An error occurred while fetching projects:', error);
        });
    },
    setSelectedProject(selection: ProjectItem | undefined) {
      this.selectedProject = selection;
      console.log('Project selection changed: ', this.selectedProject);
    },
    searchSelectedProject(projectId: string) {
      if (projectId === this.selectedProject?.id) {
        console.log('Project is already selected');
        return;
      }
      if (this.projects.find((p) => p.id === projectId)) {
        this.setSelectedProject(this.projects.findLast((p) => p.id === projectId));
        return;
      }
      this.searchProjects(projectId).finally(() => {
        this.setSelectedProject(this.projects.findLast((p) => p.id === projectId));
      });
    },
  },
});
