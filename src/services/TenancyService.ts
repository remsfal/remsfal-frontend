import { typedRequest } from '@/services/api/typedRequest';
import type { components, paths } from '@/services/api/platform-schema';

// Use backend-generated types
export type TenancyItemJson = components["schemas"]["TenancyItemJson"];
export type TenancyJson = components["schemas"]["TenancyJson"];
export type TenancyListJson = components["schemas"]["TenancyListJson"];
export type TenancyJson1 = components["schemas"]["TenancyJson1"];

// Response type for fetching all tenancies
export type GetTenanciesResponse = TenancyListJson;

// Fetch a single tenancy
export type GetTenancyResponse = TenancyJson | null;

export default class TenancyService {
  async fetchTenancies(): Promise<GetTenanciesResponse> {
    return typedRequest('get', '/api/v1/tenancies');
  }

  async fetchTenancy(tenancyId: string, rentalId: string): Promise<GetTenancyResponse> {
    try {
      return await typedRequest(
        'get',
        '/api/v1/tenancies/{tenancyId}/apartments/{rentalId}',
        { pathParams: { tenancyId, rentalId } }
      ) as TenancyJson;
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  // Placeholder methods
  async deleteTenancy(tenancyId: string): Promise<void> {}
  async updateTenancyTenantItem(tenant: unknown): Promise<void> {}
  async updateTenancyUnitItem(unit: unknown): Promise<void> {}
  async createTenancy(tenancy: TenancyJson): Promise<void> {}
  async updateTenancy(tenancy: TenancyJson | null): Promise<void> {}
}

export const tenancyService = new TenancyService();
