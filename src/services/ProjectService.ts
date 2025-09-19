import axios from 'axios';

export interface ProjectItem {
  id: string;
  name: string;
  memberRole: string;
}

export interface ProjectList {
  first: number;
  size: number;
  total: number;
  projects: ProjectItem[];
}

export interface Project {
  id: string;
  title: string;
}

export interface AddressItem {
  street?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

export default class ProjectService {
  private readonly baseUrl: string = '/api/v1/projects';

  async getProjects(offset: number = 0, limit: number = 10): Promise<ProjectList> {
    return axios
      .get(this.baseUrl, { params: { limit: limit, offset: offset } })
      .then((response) => {
        const projectList: ProjectList = response.data;
        console.log('GET projects:', projectList);
        return projectList;
      });
  }

  async searchProjects(projectId: string): Promise<ProjectList> {
    return axios.get(this.baseUrl, { params: { projectId: projectId } }).then((response) => {
      const projectList: ProjectList = response.data;
      console.log('GET projects:', projectList);
      return projectList;
    });
  }

  createProject(title: string): Promise<Project> {
    return axios.post(`${this.baseUrl}`, { title: title }).then((response) => {
      const project: Project = response.data;
      console.log('POST create project:', project);
      return project;
    });
  }

  getProject(projectId: string) {
    return axios
      .get(`${this.baseUrl}/${projectId}`)
      .then((response) => {
        console.log('project returned', response.data);
        return response.data;
      })
      .catch((error) => {
        console.log('project retrieval error', error.request.status);

        console.error(error.request.status);
        throw error.request.status; // This will allow error to be caught where getProject is called
      });
  }
}

export const projectService: ProjectService = new ProjectService();
