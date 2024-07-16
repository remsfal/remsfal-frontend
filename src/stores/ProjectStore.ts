import { defineStore } from 'pinia'
import ProjectService, { type ProjectList, type ProjectItem } from "@/services/ProjectService";

export const useProjectStore = defineStore('project-store', {
    state: () => {
        return {
            projects: <ProjectItem[]>[],
            selectedProject: null as ProjectItem | null
        }
    },
    getters: {
        projectList: (state) => state.projects,
        projectSelection: (state) => state.selectedProject,
        projectId: (state) => state.selectedProject!.id,
    },
    actions: {
        refreshProjectList() {
            const projectService = new ProjectService();
            projectService.getProjects(100)
                .then((projectList: ProjectList) => {
                    this.projects = projectList.projects;
                    console.log("Refreshed project list: ", this.projects);
                })
                .catch((error) => {
                    // Handle the error here
                    console.error("An error occurred while fetching projects:", error);
                });
        },
        setSelectedProject(selection:any) {
            this.selectedProject = selection;
            console.log("Project selection changed: ", this.selectedProject);
        }
    },
})