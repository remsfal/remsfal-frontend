import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type OrganizationJson = ApiComponents['schemas']['OrganizationJson'];
export type OrganizationListJson = ApiComponents['schemas']['OrganizationListJson'];
export type OrganizationEmployeeJson = ApiComponents['schemas']['OrganizationEmployeeJson'];
export type OrganizationEmployeeListJson = ApiComponents['schemas']['OrganizationEmployeeListJson'];
export type EmployeeRole = ApiComponents['schemas']['EmployeeRole'];

export class OrganizationService {
  async getOrganizations(): Promise<OrganizationListJson> {
    return apiClient.get('/api/v1/organizations');
  }

  async getEmployments(): Promise<OrganizationEmployeeListJson> {
    return apiClient.get('/api/v1/organizations/employments');
  }

  async createOrganization(data: OrganizationJson): Promise<void> {
    await apiClient.post('/api/v1/organizations', data);
  }

  async getOrganization(id: string): Promise<OrganizationJson> {
    return apiClient.get('/api/v1/organizations/{organizationId}', { pathParams: { organizationId: id } });
  }

  async updateOrganization(id: string, data: OrganizationJson): Promise<OrganizationJson> {
    return apiClient.patch('/api/v1/organizations/{organizationId}', data, { pathParams: { organizationId: id } });
  }

  async getEmployees(organizationId: string): Promise<OrganizationEmployeeListJson> {
    return apiClient.get('/api/v1/organizations/{organizationId}/employees', {
      pathParams: { organizationId },
    });
  }

  async addEmployee(organizationId: string, data: OrganizationEmployeeJson): Promise<OrganizationEmployeeJson> {
    return apiClient.post('/api/v1/organizations/{organizationId}/employees', data, {
      pathParams: { organizationId },
    });
  }

  async updateEmployeeRole(
    organizationId: string,
    employeeId: string,
    employeeRole: EmployeeRole,
  ): Promise<OrganizationEmployeeJson> {
    return apiClient.patch(
      '/api/v1/organizations/{organizationId}/employees/{employeeId}',
      { employeeRole } as OrganizationEmployeeJson,
      { pathParams: { organizationId, employeeId } },
    );
  }

  async removeEmployee(organizationId: string, employeeId: string): Promise<void> {
    await apiClient.delete('/api/v1/organizations/{organizationId}/employees/{employeeId}', {
      pathParams: { organizationId, employeeId },
    });
  }
}

export const organizationService = new OrganizationService();
