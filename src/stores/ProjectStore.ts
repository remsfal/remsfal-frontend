import { defineStore } from 'pinia'
import ProjectService, { type ProjectList } from "@/services/ProjectService";

export const useProjectStore = defineStore('project-store', {
    state: () => {
        return {
            projects: <any[]>[],
            selectedProject: <any>null
        }
    },
    getters: {
        projectList: (state) => state.projects,
        projectSelection: (state) => state.selectedProject,
        projectId: (state) => state.selectedProject.projectId,
    },
    actions: {
        refreshProjectList() {
            const projectService = new ProjectService();
            projectService.getProjects()
                .then((projectList: ProjectList) => {
                    const projectItems: any[] = [];
                    for (const project of projectList.projects) {
                        projectItems.push({
                            name: project.title,
                            projectId: project.id
                        });
                    }
                    this.projects = projectItems;
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