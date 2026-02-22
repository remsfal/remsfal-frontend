import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type ProjectListJson = ApiComponents['schemas']['ProjectListJson'];
export type ProjectItem = NonNullable<ProjectListJson['projects']>[number];
export type ProjectJson = ApiComponents['schemas']['ProjectJson'];

export default class ProjectService {
  // Get projects with pagination
  async getProjects(offset = 0, limit = 10): Promise<ProjectListJson> {
    const projectList = await apiClient.get('/api/v1/projects', {params: { offset, limit },});
    console.log('GET projects:', projectList);
    return projectList;
  }

  // Search projects by ID (client-side filtering because OpenAPI doesn't define projectId query)
  async searchProjects(projectId: string, offset = 0, limit = 100): Promise<ProjectListJson> {
    const allProjects = await this.getProjects(offset, limit);

    // Safely handle optional 'projects' array
    const filteredProjects = {
      ...allProjects,
      projects: (allProjects.projects ?? []).filter((p) => p.id === projectId),
    };

    console.log('GET projects (search):', filteredProjects);
    return filteredProjects;
  }

  // Create a new project
  async createProject(title: string): Promise<ProjectJson> {
    const project = await apiClient.post('/api/v1/projects', { title }) as ProjectJson;
    console.log('POST create project:', project);
    return project;
  }

  // Get a single project
  async getProject(projectId: string): Promise<ProjectJson> {
    const project = await apiClient.get('/api/v1/projects/{projectId}', {pathParams: { projectId },}) as ProjectJson;
    console.log('project returned', project);
    return project;
  }

  // Update a project
  async updateProject(projectId: string, data: ProjectJson): Promise<ProjectJson> {
    const updated = await apiClient.patch('/api/v1/projects/{projectId}', data, {pathParams: { projectId },}) as ProjectJson;
    console.log('PATCH update project:', updated);
    return updated;
  }

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete('/api/v1/projects/{projectId}', {pathParams: { projectId },});
    console.log('DELETE project', projectId);
  }
}

export const projectService = new ProjectService();
