import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type MemberRole = ApiComponents['schemas']['MemberRole'];
export type ProjectOrganizationJson = ApiComponents['schemas']['ProjectOrganizationJson'];
export type ProjectOrganizationListJson = ApiComponents['schemas']['ProjectOrganizationListJson'];

class ProjectOrganizationService {
  async getOrganizations(projectId: string): Promise<ProjectOrganizationListJson> {
    return apiClient.get('/api/v1/projects/{projectId}/organizations', { pathParams: { projectId } });
  }

  async addOrganization(projectId: string, org: ProjectOrganizationJson): Promise<ProjectOrganizationJson> {
    return apiClient.post('/api/v1/projects/{projectId}/organizations', org, { pathParams: { projectId } });
  }

  async updateOrganizationRole(projectId: string, organizationId: string, org: ProjectOrganizationJson): Promise<ProjectOrganizationJson> {
    return apiClient.patch('/api/v1/projects/{projectId}/organizations/{organizationId}', org, { pathParams: { projectId, organizationId } });
  }

  async removeOrganization(projectId: string, organizationId: string): Promise<void> {
    return apiClient.delete('/api/v1/projects/{projectId}/organizations/{organizationId}', { pathParams: { projectId, organizationId } });
  }
}

export const projectOrganizationService = new ProjectOrganizationService();
