import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type TenantItemJson = Readable<ApiComponents['schemas']['TenantItemJson']>;
export type TenantListJson = Readable<ApiComponents['schemas']['TenantListJson']>;
export type TenantJson = Readable<ApiComponents['schemas']['TenantJson']>;
export type TenantWritableJson = Writable<ApiComponents['schemas']['TenantJson']>;
export type RentalUnitJson = Readable<ApiComponents['schemas']['RentalUnitJson']>;

class TenantService {
  async fetchTenants(projectId: string): Promise<TenantItemJson[]> {
    const result = await apiClient.get('/api/v1/projects/{projectId}/tenants', {pathParams: { projectId },});
    return result.tenants || [];
  }

  async getTenant(projectId: string, tenantId: string): Promise<TenantJson> {
    return apiClient.get('/api/v1/projects/{projectId}/tenants/{tenantId}', {pathParams: { projectId, tenantId },});
  }

  async updateTenant(projectId: string, tenantId: string, tenant: TenantWritableJson): Promise<TenantJson> {
    return apiClient.patch('/api/v1/projects/{projectId}/tenants/{tenantId}', tenant, {pathParams: { projectId, tenantId },});
  }
}

export const tenantService = new TenantService();
