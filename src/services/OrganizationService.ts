import { apiClient, type ApiComponents, type ApiPaths } from '@/services/ApiClient.ts';

export type OrganizationJson = ApiComponents['schemas']['OrganizationJson'];
export type OrganizationListJson = ApiComponents['schemas']['OrganizationListJson'];
export type OrganizationEmployeeJson = ApiComponents['schemas']['OrganizationEmployeeJson'];
export type OrganizationEmployeeListJson = ApiComponents['schemas']['OrganizationEmployeeListJson'];
export type EmployeeRole = ApiComponents['schemas']['EmployeeRole'];
export type OrganizationCreateRequest =
  ApiPaths['/api/v1/organizations']['post']['requestBody']['content']['application/json'];
export type OrganizationUpdateRequest =
  ApiPaths['/api/v1/organizations/{organizationId}']['patch']['requestBody']['content']['application/json'];

export class OrganizationService {
  async getOrganizations(): Promise<OrganizationListJson> {
    return apiClient.get('/api/v1/organizations');
  }

  async getEmployments(): Promise<OrganizationEmployeeListJson> {
    return apiClient.get('/api/v1/organizations/employments');
  }

  async createOrganization(data: OrganizationCreateRequest): Promise<void> {
    await apiClient.post('/api/v1/organizations', data);
  }

  async getOrganization(id: string): Promise<OrganizationJson> {
    return apiClient.get('/api/v1/organizations/{organizationId}', {pathParams: { organizationId: id },});
  }

  async updateOrganization(id: string, data: OrganizationUpdateRequest): Promise<OrganizationJson> {
    return apiClient.patch('/api/v1/organizations/{organizationId}', data, {pathParams: { organizationId: id },});
  }
}

export const organizationService = new OrganizationService();
