import { typedRequest } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

export type ProjectList = components['schemas']['ProjectListJson'];
export type ProjectItem = NonNullable<ProjectList['projects']>[number];
export type Project = components['schemas']['ProjectJson'];

export default class ProjectService {
  static readonly BASE_PATH = '/api/v1/projects' as const;

  // Get projects with pagination
  async getProjects(offset = 0, limit = 10): Promise<ProjectList> {
    const projectList = await typedRequest<'/api/v1/projects', 'get', ProjectList>(
      'get',
      ProjectService.BASE_PATH,
      { params: { query: { offset, limit } } },
    );
    console.log('GET projects:', projectList);
    return projectList;
  }

  // Search projects by ID (client-side filtering because OpenAPI doesn't define projectId query)
  async searchProjects(projectId: string, offset = 0, limit = 100): Promise<ProjectList> {
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
  async createProject(title: string): Promise<Project> {
    const project = await typedRequest<'/api/v1/projects', 'post', Project>(
      'post',
      ProjectService.BASE_PATH,
      { body: { title } },
    );
    console.log('POST create project:', project);
    return project;
  }

  // Get a single project
  async getProject(projectId: string): Promise<Project> {
    try {
      const project = await typedRequest<'/api/v1/projects/{projectId}', 'get', Project>(
        'get',
        `${ProjectService.BASE_PATH}/{projectId}`,
        { pathParams: { projectId } },
      );
      console.log('project returned', project);
      return project;
    } catch (error: any) {
      console.error('project retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update a project
  async updateProject(projectId: string, data: Project): Promise<Project> {
    const updated = await typedRequest<'/api/v1/projects/{projectId}', 'patch', Project>(
      'patch',
      `${ProjectService.BASE_PATH}/{projectId}`,
      { pathParams: { projectId }, body: data },
    );
    console.log('PATCH update project:', updated);
    return updated;
  }

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    await typedRequest<'/api/v1/projects/{projectId}', 'delete'>(
      'delete',
      `${ProjectService.BASE_PATH}/{projectId}`,
      { pathParams: { projectId } },
    );
    console.log('DELETE project', projectId);
  }
}

export const projectService = new ProjectService();
