import { apiClient, type ApiComponents } from '@/services/ApiClient';

export type TenantItem = ApiComponents['schemas']['TenantItemJson'];
export type TenantList = ApiComponents['schemas']['TenantListJson'];
export type Tenant = ApiComponents['schemas']['TenantJson'];
export type RentalUnit = ApiComponents['schemas']['RentalUnitJson'];

class TenantService {
  async fetchTenants(projectId: string): Promise<TenantItem[]> {
    const result = await apiClient.get('/api/v1/projects/{projectId}/tenants', {pathParams: { projectId },});
    return result.tenants || [];
  }

  async getTenant(projectId: string, tenantId: string): Promise<Tenant> {
    return apiClient.get('/api/v1/projects/{projectId}/tenants/{tenantId}', {pathParams: { projectId, tenantId },});
  }

  async updateTenant(projectId: string, tenantId: string, tenant: Tenant): Promise<Tenant> {
    return apiClient.patch('/api/v1/projects/{projectId}/tenants/{tenantId}', tenant, {pathParams: { projectId, tenantId },});
  }
}

export const tenantService = new TenantService();
