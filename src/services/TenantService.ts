import { apiClient, type ApiComponents } from '@/services/ApiClient';

export type TenantItemJson = ApiComponents['schemas']['TenantItemJson'];
export type TenantListJson = ApiComponents['schemas']['TenantListJson'];
export type TenantJson = ApiComponents['schemas']['TenantJson'];
export type RentalUnitJson = ApiComponents['schemas']['RentalUnitJson'];

class TenantService {
  async fetchTenants(projectId: string): Promise<TenantItemJson[]> {
    const result = await apiClient.get('/api/v1/projects/{projectId}/tenants', {pathParams: { projectId },});
    return result.tenants || [];
  }

  async getTenant(projectId: string, tenantId: string): Promise<TenantJson> {
    return apiClient.get('/api/v1/projects/{projectId}/tenants/{tenantId}', {pathParams: { projectId, tenantId },});
  }

  async updateTenant(projectId: string, tenantId: string, tenant: TenantJson): Promise<TenantJson> {
    return apiClient.patch('/api/v1/projects/{projectId}/tenants/{tenantId}', tenant, {pathParams: { projectId, tenantId },});
  }
}

export const tenantService = new TenantService();
