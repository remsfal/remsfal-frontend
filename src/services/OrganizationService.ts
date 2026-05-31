import { apiClient, type ApiComponents, type ApiPaths } from '@/services/ApiClient.ts';

export type OrganizationJson = ApiComponents['schemas']['OrganizationJson'];
export type OrganizationListJson = ApiComponents['schemas']['OrganizationListJson'];
export type OrganizationCreateRequest =
  ApiPaths['/api/v1/organization']['post']['requestBody']['content']['application/json'];
export type OrganizationUpdateRequest =
  ApiPaths['/api/v1/organization/{organizationId}']['patch']['requestBody']['content']['application/json'];

export class OrganizationService {
  async getOrganizations(): Promise<OrganizationListJson> {
    return apiClient.get('/api/v1/organization');
  }

  async getEmployments(): Promise<OrganizationListJson> {
    return apiClient.get('/api/v1/organization/employments');
  }

  async createOrganization(data: OrganizationCreateRequest): Promise<void> {
    await apiClient.post('/api/v1/organization', data);
  }

  async getOrganization(id: string): Promise<OrganizationJson> {
    return apiClient.get('/api/v1/organization/{organizationId}', {pathParams: { organizationId: id },});
  }

  async updateOrganization(id: string, data: OrganizationUpdateRequest): Promise<OrganizationJson> {
    return apiClient.patch('/api/v1/organization/{organizationId}', data, {pathParams: { organizationId: id },});
  }
}

export const organizationService = new OrganizationService();
